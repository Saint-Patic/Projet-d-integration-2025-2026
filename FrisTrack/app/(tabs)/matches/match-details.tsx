import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet, ActivityIndicator, GestureResponderEvent } from "react-native";
import * as Location from "expo-location";
import { ThemedText } from "@/components/themed-text";
import { ScreenLayout } from "@/components/perso_components/screenLayout";
import { useLocalSearchParams, useNavigation, router, useFocusEffect } from "expo-router";
import { BackButton } from "@/components/perso_components/BackButton";
import { useTheme } from "@/contexts/ThemeContext";
import { getMatchById } from "@/services/getMatches";

export default function MatchDetailsScreen() {
  const params = useLocalSearchParams();
  const matchId = params.matchId ? parseInt(params.matchId as string, 10) : null;
  const navigation = useNavigation();
  const { theme } = useTheme();

  const [location, setLocation] = useState<any | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  // Field corners state (store as normalized coords 0..1 relative to field)
  // We only read corners for now; keep as read-only state to avoid unused setter lint.
  const [corners] = useState({
    tl: { x: 0, y: 0 },
    tr: { x: 1, y: 0 },
    bl: { x: 0, y: 1 },
    br: { x: 1, y: 1 },
  });
  const [activeCorner, setActiveCorner] = useState<null | keyof typeof corners>(null);
  // Saved precise positions per corner
  const [savedCorners, setSavedCorners] = useState<Partial<Record<keyof typeof corners, any>>>({});
  const [saving, setSaving] = useState(false);
  const [terrainValidated, setTerrainValidated] = useState(false);

  // undefined = loading, null = not found, object = loaded
  const [match, setMatch] = useState<any | undefined>(undefined);

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
          setLocError(e?.message ?? "Erreur lors de la récupération de la position");
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

  // Corner click handler — receives which corner and optional event
  const onCornerPress = (key: keyof typeof corners) => (e?: GestureResponderEvent) => {
    // Toggle selection: if same corner is already active, deselect it
    setActiveCorner((prev) => (prev === key ? null : key));

    // For now just log the click; could open a modal or allow dragging to reposition
    console.log(`Corner ${key} clicked`, corners[key]);
  };

  const allCornersSaved = ["tl", "tr", "bl", "br"].every((k) => Boolean(savedCorners[k as keyof typeof corners]));

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

        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });

        setSavedCorners((prev) => ({ ...prev, [activeCorner]: pos }));
        console.log(`Saved precise position for ${activeCorner}:`, pos);
      } catch (e: any) {
        setLocError(e?.message ?? "Erreur lors de la sauvegarde de la position");
      } finally {
        setSaving(false);
      }
    } else if (allCornersSaved && !activeCorner) {
      // Finalize/validate the terrain: hide the corner handles
      setTerrainValidated(true);
      console.log("Terrain validé", savedCorners);
    }
  };

  if (match === undefined) {
    return (
      <ScreenLayout title="Détails du match" headerLeft={<BackButton theme={theme} />} theme={theme}>
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <ThemedText style={[styles.loadingText, { color: theme.text }]}>Chargement...</ThemedText>
        </View>
      </ScreenLayout>
    );
  }

  if (match === null) {
    return (
      <ScreenLayout title="Détails du match" headerLeft={<BackButton theme={theme} />} theme={theme}>
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <ThemedText style={[styles.loadingText, { color: theme.text }]}>Match introuvable</ThemedText>
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
    <ScreenLayout title="Détails du match" headerLeft={<BackButton theme={theme} />} theme={theme}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.headerRow}>
          <ThemedText style={[styles.dateText, { color: theme.text }]}>Date: {match.date}</ThemedText>
        </View>

        <View style={styles.scoreRow}>
          <View style={[styles.scoreBox, { borderColor: theme.border }]}>
            <ThemedText style={[styles.scoreNumber, { color: theme.text }]}>{match.score1}</ThemedText>
            <ThemedText style={[styles.teamLabel, { color: theme.primary }]}>{match.team1}</ThemedText>
          </View>

          <View style={[styles.scoreBox, { borderColor: theme.border }]}>
            <ThemedText style={[styles.scoreNumber, { color: theme.text }]}>{match.score2}</ThemedText>
            <ThemedText style={[styles.teamLabel, { color: theme.primary }]}>{match.team2}</ThemedText>
          </View>
        </View>

        <View style={styles.metaRow}>
          <ThemedText style={[styles.metaText, { color: theme.text }]}>Statut: {match.status}</ThemedText>
          <ThemedText style={[styles.metaText, { color: theme.text }]}>Lieu: {match.venue === "indoor" ? "Intérieur" : "Extérieur"}</ThemedText>
        </View>

        {/* Field rectangle (black) with 4 clickable corners */}
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
                />

                {/* Corner: top-right */}
                <TouchableOpacity
                  accessibilityLabel="corner-top-right"
                  onPress={onCornerPress("tr")}
                  style={[
                    styles.cornerHandle,
                    styles.cornerTR,
                    activeCorner === "tr" && styles.cornerActive,
                  ]}
                />

                {/* Corner: bottom-left */}
                <TouchableOpacity
                  accessibilityLabel="corner-bottom-left"
                  onPress={onCornerPress("bl")}
                  style={[
                    styles.cornerHandle,
                    styles.cornerBL,
                    activeCorner === "bl" && styles.cornerActive,
                  ]}
                />

                {/* Corner: bottom-right */}
                <TouchableOpacity
                  accessibilityLabel="corner-bottom-right"
                  onPress={onCornerPress("br")}
                  style={[
                    styles.cornerHandle,
                    styles.cornerBR,
                    activeCorner === "br" && styles.cornerActive,
                  ]}
                />
              </>
            )}
          </View>
        </View>

        {/* Confirm button — enabled only after a corner is selected */}
        <View style={styles.confirmWrapper}>
          <TouchableOpacity
            accessible
            accessibilityLabel="confirm-field-button"
            onPress={handleConfirmPress}
            disabled={saving || (terrainValidated ? true : !activeCorner && !allCornersSaved)}
            style={[
              styles.confirmButton,
              { backgroundColor: !terrainValidated && (activeCorner || allCornersSaved) ? theme.primary : "#888" },
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
        {/* Saved position feedback */}
        <View style={styles.savedFeedback}>
          {activeCorner && savedCorners[activeCorner] ? (
            <ThemedText style={[styles.metaText, { color: theme.text }]}>
              Position sauvegardée ({activeCorner.toUpperCase()}): {savedCorners[activeCorner].coords.latitude.toFixed(6)}, {savedCorners[activeCorner].coords.longitude.toFixed(6)}
            </ThemedText>
          ) : (
            <ThemedText style={[styles.metaText, { color: theme.text }]}>Aucune position sauvegardée</ThemedText>
          )}
        </View>

        {/* Phone location display on black background */}
        <View style={styles.locationWrapper}>
          <View style={styles.locationContainer}>
            {locLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : locError ? (
              <ThemedText style={[styles.locationText, { color: "#fff" }]}>Erreur: {locError}</ThemedText>
            ) : location ? (
              <>
                <ThemedText style={[styles.locationText, { color: "#fff" }]}>Latitude: {location.coords.latitude.toFixed(6)}</ThemedText>
                <ThemedText style={[styles.locationText, { color: "#fff" }]}>Longitude: {location.coords.longitude.toFixed(6)}</ThemedText>
              </>
            ) : (
              <ThemedText style={[styles.locationText, { color: "#fff" }]}>Position non disponible</ThemedText>
            )}
          </View>
        </View>
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
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 6,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "600",
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  metaRow: {
    marginBottom: 36,
  },
  metaText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
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
});