import React, { useEffect, useRef, useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ScreenLayout } from "@/components/perso_components/screenLayout";
import { useLocalSearchParams, useNavigation, router } from "expo-router";
import { BackButton } from "@/components/perso_components/BackButton";
import { useTheme } from "@/contexts/ThemeContext";
import { getMatchById } from "@/services/getMatches";

export default function MatchDetailsScreen() {
  const params = useLocalSearchParams();
  const matchId = params.matchId ? parseInt(params.matchId as string, 10) : null;
  const navigation = useNavigation();
  const { theme } = useTheme();

  // undefined = loading, null = not found, object = loaded
  const [match, setMatch] = useState<any | undefined>(undefined);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    if (match.isRecording) {
      // démarrage chrono
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
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
  }, [match?.isRecording]);

  const formatTime = (total: number) => {
    const mm = Math.floor(total / 60)
      .toString()
      .padStart(2, "0");
    const ss = (total % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
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

        {/* Affichage du temps total (après Stop) */}
        {!match.isRecording && elapsedSeconds > 0 && (
          <View style={styles.timerContainer}>
            <ThemedText style={[styles.timerText, { color: theme.text }]}>⏱ Temps de match: {formatTime(elapsedSeconds)}</ThemedText>
          </View>
        )}

        {/* Timer + Bouton Start/Stop (visible uniquement si pas encore de recording) */}
        {match.status === "scheduled" && !match.hasRecording && (
          <View style={styles.recordingBlock}>
            {match.isRecording && (
              <View style={styles.timerContainer}>
                <ThemedText style={[styles.timerText, { color: theme.text }]}>⏱ {formatTime(elapsedSeconds)}</ThemedText>
              </View>
            )}
            <TouchableOpacity
              style={[
                styles.reviewButton,
                { backgroundColor: match.isRecording ? "#e74c3c" : "#27ae60" }
              ]}
              onPress={() => {
                if (match.isRecording) {
                  // Stop: marquer l'enregistrement et cacher le bouton Start/Stop
                  setMatch({ ...match, isRecording: false, hasRecording: true });
                } else {
                  // Start: réinitialiser le chrono et démarrer
                  setElapsedSeconds(0);
                  setMatch({ ...match, isRecording: true });
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
});