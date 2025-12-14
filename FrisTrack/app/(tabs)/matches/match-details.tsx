import * as Location from "expo-location";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  type GestureResponderEvent,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BackButton } from "@/components/perso_components/BackButton";
import { ScreenLayout } from "@/components/perso_components/screenLayout";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/contexts/ThemeContext";
import { createField, deleteField, getFields } from "@/services/fieldService";
import { getMatchById, type Match, updateMatch } from "@/services/getMatches";
import ScoreControl from "@/components/perso_components/ScoreControl";
import { updateMatchScore } from "@/services/getMatches";

export default function MatchDetailsScreen() {
  const params = useLocalSearchParams();
  const matchId = params.matchId
    ? parseInt(params.matchId as string, 10)
    : null;
  const navigation = useNavigation();
  const { theme } = useTheme();

  const [, setLocation] = useState<any | null>(null);
  const [, setLocLoading] = useState(false);
  const [, setLocError] = useState<string | null>(null);

  // Field corners state (store as normalized coords 0..1 relative to field)
  // We only read corners for now; keep as read-only state to avoid unused setter lint.
  const [corners] = useState({
    tl: { x: 0, y: 0 },
    tr: { x: 1, y: 0 },
    bl: { x: 0, y: 1 },
    br: { x: 1, y: 1 },
  });
  const [activeCorner, setActiveCorner] = useState<null | keyof typeof corners>(
    null
  );
  // Saved precise positions per corner
  const [savedCorners, setSavedCorners] = useState<
    Partial<Record<keyof typeof corners, any>>
  >({});
  const [saving, setSaving] = useState(false);
  const [terrainValidated, setTerrainValidated] = useState(false);

  const [serverTerrains, setServerTerrains] = useState<any[]>([]);
  const [loadingServerTerrains, setLoadingServerTerrains] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [newTerrainName, setNewTerrainName] = useState("");
  const [selectedTerrainId, setSelectedTerrainId] = useState<string | null>(
    null
  );
  const [showSavedTerrains, setShowSavedTerrains] = useState(false);
  const [showInitialChoice, setShowInitialChoice] = useState(true);
  // Server-stored terrains only (no local persistence)

  const saveCurrentTerrain = async (name?: string) => {
    if (!allCornersSaved) return;
    const tname =
      name || newTerrainName || `Terrain ${new Date().toLocaleString()}`;
    setShowNameModal(false);
    setNewTerrainName("");

    // Persist to backend only
    try {
      setSaving(true);
      const res = await createField({ name: tname, corners: savedCorners });
      if (res && res.id) {
        // Add the newly created server terrain to the in-memory list so it appears immediately
        setServerTerrains((prev) => [
          { id: res.id, name: tname, corners: savedCorners },
          ...(prev || []),
        ]);
        setSelectedTerrainId(res.id.toString());
      }
    } catch (err) {
      console.error("Failed to persist field to server:", err);
      Alert.alert(
        "Erreur",
        "Impossible d'enregistrer le terrain sur le serveur."
      );
    } finally {
      setSaving(false);
    }
  };

  const loadTerrain = (terrain: any) => {
    if (!(terrain && terrain.corners)) return;
    // Normalize server terrain shape (lat/lon) to the savedCorners format (Location-like with .coords)
    const normalizeCorner = (c: any) => {
      if (!c) return null;
      if (c.coords && typeof c.coords.latitude === "number") return c;
      // assume { coords: { latitude, longitude } } or { latitude, longitude }
      const lat = c.coords?.latitude ?? c.latitude ?? c.lat;
      const lon = c.coords?.longitude ?? c.longitude ?? c.lon;
      return { coords: { latitude: Number(lat), longitude: Number(lon) } };
    };

    setSavedCorners({
      tl: normalizeCorner(terrain.corners.tl),
      tr: normalizeCorner(terrain.corners.tr),
      bl: normalizeCorner(terrain.corners.bl),
      br: normalizeCorner(terrain.corners.br),
    });
    setTerrainValidated(true);
    setActiveCorner(null);
    if (terrain.id) setSelectedTerrainId(terrain.id.toString());
    setShowSavedTerrains(false);
  };

  const fetchServerTerrains = async () => {
    setLoadingServerTerrains(true);
    try {
      const list = await getFields();
      setServerTerrains(list || []);
    } catch (err) {
      console.error("Failed to fetch server terrains:", err);
    } finally {
      setLoadingServerTerrains(false);
    }
  };

  // Load server terrains on mount so they are available immediately
  useEffect(() => {
    fetchServerTerrains();
  }, []);

  const deleteTerrain = async (id: string, name?: string) => {
    // Delete from server only
    try {
      const terrainName = name || undefined;
      if (terrainName) {
        await deleteField(terrainName);
      } else {
        // fallback: try id-based delete
        await deleteField(id);
      }
      // Optimistically update UI
      setServerTerrains((prev) =>
        (prev || []).filter(
          (t) =>
            String(t.id) !== String(id) && String(t.id_field) !== String(id)
        )
      );
      if (selectedTerrainId === id) setSelectedTerrainId(null);

      // Refresh authoritative list from server to ensure consistency
      try {
        await fetchServerTerrains();
      } catch (e) {
        // If refresh fails, we already removed the item optimistically; log for debugging
        console.error("Failed to refresh server terrains after delete:", e);
      }
    } catch (err) {
      console.error("Failed to delete server terrain:", err);
      Alert.alert(
        "Erreur",
        "Impossible de supprimer le terrain sur le serveur."
      );
    }
  };

  // undefined = loading, null = not found, object = loaded
  const [match, setMatch] = useState<Match | null | undefined>(undefined);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [score1, setScore1] = useState<number>(0);
  const [score2, setScore2] = useState<number>(0);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    if (matchId != null) {
      // start loading
      setMatch(undefined);
      getMatchById(matchId).then((m) => {
        // m can be an object or null
        setMatch(m ?? null);
      });
    } else {
      setMatch(null);
    }
  }, [matchId]);

  const team1Id = match?.team_id_1;
  const team2Id = match?.team_id_2;

  useEffect(() => {
    if (match) {
      setScore1(match.team_score_1 ?? 0);
      setScore2(match.team_score_2 ?? 0);
    }
  }, [match]);

  async function handleDeltaTeam1(delta: number) {
    const next = Math.min(13, Math.max(0, score1 + delta));
    setScore1(next);
    try {
      if (matchId != null) {
        await updateMatchScore(matchId, next, team1Id);
      }
      if (match) setMatch({ ...match, team_score_1: next });
    } catch (e) {
      console.warn("Erreur update team1 score", e);
    }
  }

  async function handleDeltaTeam2(delta: number) {
    const next = Math.min(13, Math.max(0, score2 + delta));
    setScore2(next);
    try {
      if (matchId != null) {
        await updateMatchScore(matchId, next, team2Id);
      }
      if (match) setMatch({ ...match, team_score_2: next });
    } catch (e) {
      console.warn("Erreur update team2 score", e);
    }
  }

  // Start a location watcher when the screen is focused, stop when unfocused
  useFocusEffect(
    React.useCallback(() => {
      let subscription: Location.LocationSubscription | null = null;
      let mounted = true;

      const startWatching = async () => {
        try {
          setLocLoading(true);
          setLocError(null);

          const { status } = await Location.requestForegroundPermissionsAsync();
          if (!mounted) return;

          if (status !== "granted") {
            setLocError("Permission refusée");
            setLocLoading(false);
            return;
          }

          // Start watching position. Adjust accuracy and distanceInterval as needed.
          subscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,
              timeInterval: 3000, // minimum time between updates in ms
              distanceInterval: 5, // minimum change in meters to receive update
            },
            (pos) => {
              if (!mounted) return;
              setLocation(pos);
            }
          );
        } catch (e: any) {
          setLocError(
            e?.message ?? "Erreur lors de la récupération de la position"
          );
        } finally {
          if (mounted) setLocLoading(false);
        }
      };

      startWatching();

      return () => {
        mounted = false;
        if (subscription) {
          subscription.remove();
          subscription = null;
        }
      };
    }, [])
  );

  const handleBack = () => {
    router.back();
  };

  const handleReview = () => {
    console.log(`Ouverture de la revue du match ${matchId}`);
    // TODO: Ajouter la logique pour ouvrir la revue/replay du match enregistré
  };

  // Démarre/arrête le chrono en fonction de match.isRecording
  useEffect(() => {
    if (!match) return;

    // Si le match a une durée enregistrée (après Stop), l'afficher
    if (match.recordingDuration && !match.isRecording) {
      setElapsedSeconds(match.recordingDuration);
      return;
    }

    if (match.isRecording && match.recordingStartTime) {
      // Calculer le temps écoulé depuis le début
      const updateElapsed = () => {
        const elapsed = Math.floor(
          (Date.now() - match.recordingStartTime!) / 1000
        );
        setElapsedSeconds(elapsed);
      };

      // Mise à jour initiale
      updateElapsed();

      // Mise à jour toutes les secondes
      timerRef.current = setInterval(updateElapsed, 1000);
    } else {
      // arrêt chrono
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [match]);

  const formatTime = (total: number) => {
    const mm = Math.floor(total / 60)
      .toString()
      .padStart(2, "0");
    const ss = (total % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const getTeamTextColor = (isTeam1: boolean) => {
    if (!match || match.status !== "finished") {
      return theme.text;
    }

    const team1Score = match.team_score_1;
    const team2Score = match.team_score_2;

    if (team1Score === team2Score) {
      return theme.text;
    }

    const isWinner = isTeam1
      ? team1Score > team2Score
      : team2Score > team1Score;
    return isWinner ? "#00e6cc" : "#ff8080";
  };

  // Corner click handler — receives which corner and optional event
  const onCornerPress =
    (key: keyof typeof corners) => (e?: GestureResponderEvent) => {
      // Toggle selection: if same corner is already active, deselect it
      setActiveCorner((prev) => (prev === key ? null : key));

      // For now just log the click; could open a modal or allow dragging to reposition
    };

  const allCornersSaved = ["tl", "tr", "bl", "br"].every((k) =>
    Boolean(savedCorners[k as keyof typeof corners])
  );

  // Handle confirm button: save a corner if selected, otherwise validate terrain when all corners saved
  const handleConfirmPress = async () => {
    if (terrainValidated) return;

    if (activeCorner) {
      // Save current corner position (same logic as before)
      try {
        setSaving(true);

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocError("Permission refusée");
          setSaving(false);
          return;
        }

        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });

        setSavedCorners((prev) => ({ ...prev, [activeCorner]: pos }));
      } catch (e: any) {
        setLocError(
          e?.message ?? "Erreur lors de la sauvegarde de la position"
        );
      } finally {
        setSaving(false);
      }
    } else if (allCornersSaved && !activeCorner) {
      // Finalize/validate the terrain: hide the corner handles
      setTerrainValidated(true);
    }
  };

  if (match === undefined) {
    return (
      <ScreenLayout
        title="Détails du match"
        headerLeft={<BackButton theme={theme} />}
        theme={theme}
      >
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <ThemedText style={[styles.loadingText, { color: theme.text }]}>
            Chargement...
          </ThemedText>
        </View>
      </ScreenLayout>
    );
  }

  if (match === null) {
    return (
      <ScreenLayout
        title="Détails du match"
        headerLeft={<BackButton theme={theme} />}
        theme={theme}
      >
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <ThemedText style={[styles.loadingText, { color: theme.text }]}>
            Match introuvable
          </ThemedText>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.primary }]}
            onPress={handleBack}
          >
            <ThemedText style={styles.backButtonText}>Retour</ThemedText>
          </TouchableOpacity>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      title="Détails du match"
      headerLeft={<BackButton theme={theme} />}
      theme={theme}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Initial choice removed from top; will be shown above the field area instead */}
        <View style={styles.headerRow}>
          <ThemedText style={[styles.dateText, { color: theme.text }]}>
            Date: {new Date(match.date).toLocaleDateString("fr-FR")}
          </ThemedText>
        </View>

        <View style={styles.scoreRow}>
          <ScoreControl
            teamLabel={match.team_name_1}
            score={score1}
            onDelta={handleDeltaTeam1}
          />
          <ThemedText style={[styles.versus, { color: theme.primary }]}>
            VS
          </ThemedText>
          <ScoreControl
            teamLabel={match.team_name_2}
            score={score2}
            onDelta={handleDeltaTeam2}
          />
        </View>

        <View style={styles.metaRow}>
          {match.status && (
            <ThemedText style={[styles.metaText, { color: theme.text }]}>
              Statut: {match.status}
            </ThemedText>
          )}
        </View>

        {/* Affichage du temps total (toujours affiché, même à 00:00) */}
        <View style={styles.timerContainer}>
          <ThemedText style={[styles.timerText, { color: theme.text }]}>
            ⏱ Temps de match: {formatTime(elapsedSeconds)}
          </ThemedText>
        </View>

        {/* Timer + Bouton Start/Stop (visible uniquement si pas encore de recording) */}
        {match.status === "scheduled" && !match.hasRecording && (
          <View style={styles.recordingBlock}>
            {match.isRecording && (
              <View style={styles.timerContainer}>
                <ThemedText style={[styles.timerText, { color: theme.text }]}>
                  ⏱ {formatTime(elapsedSeconds)}
                </ThemedText>
              </View>
            )}
            <TouchableOpacity
              style={[
                styles.reviewButton,
                { backgroundColor: match.isRecording ? "#e74c3c" : "#27ae60" },
              ]}
              onPress={() => {
                if (match.isRecording) {
                  // Stop: calculer la durée et marquer l'enregistrement
                  const duration = match.recordingStartTime
                    ? Math.floor((Date.now() - match.recordingStartTime) / 1000)
                    : elapsedSeconds;
                  // Persister dans le service
                  updateMatch(matchId!, {
                    isRecording: false,
                    hasRecording: true,
                    recordingDuration: duration,
                    recordingStartTime: undefined,
                  });
                  setMatch({
                    ...match,
                    isRecording: false,
                    hasRecording: true,
                    recordingDuration: duration,
                    recordingStartTime: undefined,
                  });
                  setElapsedSeconds(duration);
                } else {
                  // Start: démarrer avec timestamp
                  const startTime = Date.now();
                  // Persister dans le service
                  updateMatch(matchId!, {
                    isRecording: true,
                    recordingStartTime: startTime,
                  });
                  setElapsedSeconds(0);
                  setMatch({
                    ...match,
                    isRecording: true,
                    recordingStartTime: startTime,
                  });
                }
              }}
            >
              <ThemedText style={styles.reviewButtonText}>
                {match.isRecording ? "⏹ Stop" : "▶ Start"}
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Bouton Review */}
        {match.hasRecording && (
          <TouchableOpacity
            style={[styles.reviewButton, { backgroundColor: "#27ae60" }]}
            onPress={handleReview}
          >
            <ThemedText style={styles.reviewButtonText}>Review</ThemedText>
          </TouchableOpacity>
        )}
        {/* Field rectangle (black) with 4 clickable corners */}
        {/* Field rectangle (black) with 4 clickable corners */}
        {!(showSavedTerrains || showInitialChoice) && (
          <View style={styles.fieldWrapper}>
            <View style={styles.fieldContainer}>
              {!terrainValidated && (
                <>
                  {/* Corner: top-left */}
                  <TouchableOpacity
                    accessibilityLabel="corner-top-left"
                    onPress={onCornerPress("tl")}
                    style={[
                      styles.cornerHandle,
                      styles.cornerTL,
                      activeCorner === "tl" && styles.cornerActive,
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.cornerLabel,
                        { color: activeCorner === "tl" ? "#003b22" : "#000" },
                      ]}
                    >
                      TL
                    </ThemedText>
                  </TouchableOpacity>

                  {/* Corner: top-right */}
                  <TouchableOpacity
                    accessibilityLabel="corner-top-right"
                    onPress={onCornerPress("tr")}
                    style={[
                      styles.cornerHandle,
                      styles.cornerTR,
                      activeCorner === "tr" && styles.cornerActive,
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.cornerLabel,
                        { color: activeCorner === "tr" ? "#003b22" : "#000" },
                      ]}
                    >
                      TR
                    </ThemedText>
                  </TouchableOpacity>

                  {/* Corner: bottom-left */}
                  <TouchableOpacity
                    accessibilityLabel="corner-bottom-left"
                    onPress={onCornerPress("bl")}
                    style={[
                      styles.cornerHandle,
                      styles.cornerBL,
                      activeCorner === "bl" && styles.cornerActive,
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.cornerLabel,
                        { color: activeCorner === "bl" ? "#003b22" : "#000" },
                      ]}
                    >
                      BL
                    </ThemedText>
                  </TouchableOpacity>

                  {/* Corner: bottom-right */}
                  <TouchableOpacity
                    accessibilityLabel="corner-bottom-right"
                    onPress={onCornerPress("br")}
                    style={[
                      styles.cornerHandle,
                      styles.cornerBR,
                      activeCorner === "br" && styles.cornerActive,
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.cornerLabel,
                        { color: activeCorner === "br" ? "#003b22" : "#000" },
                      ]}
                    >
                      BR
                    </ThemedText>
                  </TouchableOpacity>
                </>
              )}

              {/* Coordinates shown near each corner */}
              {savedCorners.tl && (
                <ThemedText
                  pointerEvents="none"
                  style={[styles.coordsText, styles.coordsTL]}
                >
                  TL: {savedCorners.tl.coords.latitude.toFixed(6)},{" "}
                  {savedCorners.tl.coords.longitude.toFixed(6)}
                </ThemedText>
              )}
              {savedCorners.tr && (
                <ThemedText
                  pointerEvents="none"
                  style={[styles.coordsText, styles.coordsTR]}
                >
                  TR: {savedCorners.tr.coords.latitude.toFixed(6)},{" "}
                  {savedCorners.tr.coords.longitude.toFixed(6)}
                </ThemedText>
              )}
              {savedCorners.bl && (
                <ThemedText
                  pointerEvents="none"
                  style={[styles.coordsText, styles.coordsBL]}
                >
                  BL: {savedCorners.bl.coords.latitude.toFixed(6)},{" "}
                  {savedCorners.bl.coords.longitude.toFixed(6)}
                </ThemedText>
              )}
              {savedCorners.br && (
                <ThemedText
                  pointerEvents="none"
                  style={[styles.coordsText, styles.coordsBR]}
                >
                  BR: {savedCorners.br.coords.latitude.toFixed(6)},{" "}
                  {savedCorners.br.coords.longitude.toFixed(6)}
                </ThemedText>
              )}
            </View>
          </View>
        )}

        {!(showInitialChoice || showSavedTerrains) && (
          <>
            {/* Confirm button — enabled only after a corner is selected */}
            <View style={styles.confirmWrapper}>
              <TouchableOpacity
                accessible
                accessibilityLabel="confirm-field-button"
                onPress={handleConfirmPress}
                disabled={
                  saving ||
                  (terrainValidated ? true : !(activeCorner || allCornersSaved))
                }
                style={[
                  styles.confirmButton,
                  {
                    backgroundColor:
                      !terrainValidated && (activeCorner || allCornersSaved)
                        ? theme.primary
                        : "#888",
                  },
                ]}
              >
                <ThemedText style={styles.confirmButtonText}>
                  {saving
                    ? "Enregistrement..."
                    : terrainValidated
                    ? "Terrain validé"
                    : activeCorner
                    ? `Valider coin ${activeCorner.toUpperCase()}`
                    : allCornersSaved
                    ? "Valider le terrain"
                    : "Sélectionnez un coin"}
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* saved position feedback removed; coordinates are shown inside the field rectangle */}
          </>
        )}

        {/* Initial choice when arriving on the page: create new or choose existing (placed above field) */}
        {showInitialChoice && (
          <View style={styles.initialChoiceBox}>
            <ThemedText
              style={[styles.metaText, { color: theme.text, marginBottom: 8 }]}
            >
              Que voulez-vous faire ?
            </ThemedText>
            <View style={{ flexDirection: "column", rowGap: 12 }}>
              <TouchableOpacity
                accessibilityLabel="create-new-terrain"
                onPress={() => {
                  // Start creating a new terrain
                  setShowInitialChoice(false);
                  setTerrainValidated(false);
                  setSavedCorners({});
                  setActiveCorner(null);
                  setShowSavedTerrains(false);
                }}
                style={[
                  styles.confirmButton,
                  { backgroundColor: theme.primary },
                ]}
              >
                <ThemedText style={styles.confirmButtonText}>
                  Créer un nouveau terrain
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                accessibilityLabel="choose-existing-terrain"
                onPress={() => {
                  // Open saved terrains picker
                  setShowInitialChoice(false);
                  setShowSavedTerrains(true);
                }}
                style={[
                  styles.confirmButton,
                  { backgroundColor: theme.primary },
                ]}
              >
                <ThemedText style={styles.confirmButtonText}>
                  Choisir un terrain existant
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Picker: allow choosing an existing server terrain at any time (toggleable) */}
        {showSavedTerrains && (
          <View style={styles.terrainsPicker}>
            <ThemedText style={[styles.metaText, { color: theme.text }]}>
              Terrains disponibles
            </ThemedText>
            {loadingServerTerrains ? (
              <ThemedText style={[styles.metaText, { color: theme.text }]}>
                Chargement...
              </ThemedText>
            ) : (
              (() => {
                const list = serverTerrains || [];
                if (!list || list.length === 0) {
                  return (
                    <ThemedText
                      style={[styles.metaText, { color: theme.text }]}
                    >
                      Pas de terrains disponibles
                    </ThemedText>
                  );
                }
                return (
                  <ScrollView style={{ width: "100%", maxHeight: 160 }}>
                    {list.map((t: any, idx: number) => {
                      const key =
                        t.id ?? t.id_field ?? t.field_name ?? `terrain-${idx}`;
                      const selectedKey = selectedTerrainId
                        ? String(selectedTerrainId)
                        : null;
                      const itemId = t.id ?? t.id_field ?? null;
                      return (
                        <View
                          key={key}
                          style={[
                            styles.terrainItem,
                            selectedKey === String(itemId) &&
                              styles.terrainSelected,
                          ]}
                        >
                          <View style={{ flex: 1 }}>
                            <ThemedText
                              style={[
                                styles.terrainName,
                                { color: theme.text },
                              ]}
                            >
                              {t.name ?? t.field_name}
                            </ThemedText>
                          </View>
                          <View style={styles.actionGroup}>
                            <TouchableOpacity
                              onPress={() => loadTerrain(t)}
                              style={styles.terrainLoadAction}
                            >
                              <ThemedText style={styles.terrainLoadActionText}>
                                Charger
                              </ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => {
                                Alert.alert(
                                  "Supprimer le terrain",
                                  "Voulez-vous supprimer ce terrain du serveur ?",
                                  [
                                    { text: "Annuler", style: "cancel" },
                                    {
                                      text: "Supprimer",
                                      style: "destructive",
                                      onPress: () =>
                                        deleteTerrain(
                                          String(itemId ?? ""),
                                          t.name ?? t.field_name
                                        ),
                                    },
                                  ]
                                );
                              }}
                              style={styles.terrainAction}
                            >
                              <ThemedText style={styles.terrainActionText}>
                                Supprimer
                              </ThemedText>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </ScrollView>
                );
              })()
            )}
          </View>
        )}

        {/* Button to toggle saved terrains view - only show after initial choice made */}
        {!showInitialChoice && (
          <View style={{ alignItems: "center", marginTop: 10 }}>
            <TouchableOpacity
              accessibilityLabel="toggle-saved-terrains"
              onPress={() => {
                setShowSavedTerrains((s) => {
                  const next = !s;
                  if (next) fetchServerTerrains();
                  return next;
                });
              }}
              style={[
                styles.smallToggleButton,
                { backgroundColor: theme.primary },
              ]}
            >
              <ThemedText style={styles.confirmButtonText}>
                {showSavedTerrains ? "Masquer terrains" : "Voir terrains"}
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Edit corners, save/load terrains when terrain is validated */}
        {terrainValidated && (
          <View style={styles.editWrapper}>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                accessibilityLabel="edit-corners-button"
                onPress={() => {
                  setTerrainValidated(false);
                  setActiveCorner(null);
                }}
                style={[
                  styles.confirmButton,
                  { backgroundColor: theme.primary },
                ]}
              >
                <ThemedText style={styles.confirmButtonText}>
                  Modifier les coins
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                accessibilityLabel="save-terrain-toggle"
                onPress={() => setShowNameModal(true)}
                style={[
                  styles.confirmButton,
                  { backgroundColor: theme.primary },
                ]}
              >
                <ThemedText style={styles.confirmButtonText}>
                  Enregistrer le terrain
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Name entry as a modal popup */}
            <Modal
              visible={showNameModal}
              transparent
              animationType="fade"
              onRequestClose={() => setShowNameModal(false)}
            >
              <View style={styles.modalOverlay}>
                <KeyboardAvoidingView
                  behavior={Platform.OS === "ios" ? "padding" : "height"}
                  style={styles.modalWrapper}
                >
                  <View
                    style={[
                      styles.modalContent,
                      {
                        borderColor: theme.border,
                        backgroundColor: theme.background,
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.metaText,
                        { color: theme.text, marginBottom: 8 },
                      ]}
                    >
                      Nom du terrain
                    </ThemedText>
                    <TextInput
                      value={newTerrainName}
                      onChangeText={setNewTerrainName}
                      placeholder="Nom du terrain"
                      placeholderTextColor="#999"
                      style={[
                        styles.nameInput,
                        { color: theme.text, borderColor: theme.border },
                      ]}
                    />
                    <View
                      style={{ flexDirection: "row", gap: 12, marginTop: 12 }}
                    >
                      <TouchableOpacity
                        accessibilityLabel="save-terrain-button"
                        onPress={() => saveCurrentTerrain(newTerrainName)}
                        style={[
                          styles.confirmButton,
                          { backgroundColor: theme.primary },
                        ]}
                      >
                        <ThemedText style={styles.confirmButtonText}>
                          Sauvegarder
                        </ThemedText>
                      </TouchableOpacity>

                      <TouchableOpacity
                        accessibilityLabel="cancel-save-terrain"
                        onPress={() => {
                          setShowNameModal(false);
                          setNewTerrainName("");
                        }}
                        style={[
                          styles.confirmButton,
                          { backgroundColor: "#999" },
                        ]}
                      >
                        <ThemedText style={styles.confirmButtonText}>
                          Annuler
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>
                </KeyboardAvoidingView>
              </View>
            </Modal>

            {/* Saved terrains are shown via the "Voir terrains" toggle to avoid automatic display after validation. */}
          </View>
        )}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 24,
  },
  headerRow: {
    alignItems: "center",
    marginBottom: 24,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "600",
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  scoreBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 22,
    paddingHorizontal: 18,
    marginHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 110,
  },
  scoreNumber: {
    fontSize: 42,
    fontWeight: "900",
    lineHeight: 44,
  },
  teamLabel: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
    fontStyle: "italic",
  },
  versus: {
    fontSize: 18,
    fontWeight: "800",
    marginHorizontal: 8,
  },
  metaRow: {
    marginBottom: 36,
  },
  metaText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  recordingBlock: {
    alignItems: "center",
    marginBottom: 16,
  },
  timerContainer: {
    marginBottom: 8,
  },
  timerText: {
    fontSize: 18,
    fontWeight: "700",
  },
  reviewButton: {
    alignSelf: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 20,
    elevation: 6,
    marginBottom: 16,
    minWidth: 180,
  },
  reviewButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 18,
    textAlign: "center",
  },
  backButton: {
    alignSelf: "center",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 20,
    elevation: 6,
  },
  backButtonText: {
    color: "#f0f0f0",
    fontWeight: "700",
    fontSize: 16,
  },
  locationWrapper: {
    marginTop: 12,
    paddingHorizontal: 0,
  },
  locationContainer: {
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  /* Field (black rectangle) and corner handles */
  fieldWrapper: {
    alignItems: "center",
    marginBottom: 12,
  },
  fieldContainer: {
    width: "100%",
    maxWidth: 520,
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    borderRadius: 8,
    position: "relative",
    overflow: "hidden",
  },
  cornerHandle: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 2,
    borderColor: "#000",
  },
  cornerTL: {
    top: 8,
    left: 8,
  },
  cornerTR: {
    top: 8,
    right: 8,
  },
  cornerBL: {
    bottom: 8,
    left: 8,
  },
  cornerBR: {
    bottom: 8,
    right: 8,
  },
  cornerActive: {
    backgroundColor: "#00ff88",
    borderColor: "#006644",
  },
  cornerLabel: {
    fontSize: 10,
    fontWeight: "800",
    lineHeight: 28,
    textAlign: "center",
  },
  confirmWrapper: {
    marginTop: 12,
    alignItems: "center",
  },
  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 18,
    elevation: 4,
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  savedFeedback: {
    marginTop: 8,
    alignItems: "center",
  },
  editWrapper: {
    marginTop: 12,
    alignItems: "center",
  },
  nameInput: {
    width: "90%",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  terrainsList: {
    width: "100%",
    marginTop: 12,
    alignItems: "center",
  },
  terrainItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: "#222",
  },
  terrainName: {
    fontSize: 16,
    fontWeight: "600",
  },
  terrainAction: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#c0392b",
    borderRadius: 8,
  },
  terrainActionText: {
    color: "#fff",
    fontWeight: "700",
  },
  actionGroup: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  terrainLoadAction: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#2ecc71",
    borderRadius: 8,
  },
  terrainLoadActionText: {
    color: "#fff",
    fontWeight: "700",
  },
  terrainsPicker: {
    width: "100%",
    marginTop: 12,
    alignItems: "center",
  },
  terrainSelected: {
    backgroundColor: "rgba(0,128,0,0.12)",
  },
  smallToggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 3,
  },
  initialChoiceBox: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
    marginBottom: 12,
    alignItems: "center",
  },
  coordsText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
  },
  coordsTL: {
    top: 8,
    left: 8,
    textAlign: "left",
  },
  coordsTR: {
    top: 8,
    right: 8,
    textAlign: "right",
  },
  coordsBL: {
    bottom: 8,
    left: 8,
    textAlign: "left",
  },
  coordsBR: {
    bottom: 8,
    right: 8,
    textAlign: "right",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalWrapper: {
    width: "100%",
  },
  modalContent: {
    width: "100%",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    alignItems: "center",
  },
});
