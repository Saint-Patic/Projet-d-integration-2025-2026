import { useFocusEffect, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { AddButton } from "@/components/perso_components/addButton";
import { ScreenLayout } from "@/components/perso_components/screenLayout";
import { SwipeableCard } from "@/components/perso_components/swipeableCard";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  getMatchesByUser,
  updateMatch,
  deleteMatch as deleteMatchService,
} from "@/services/getMatches";
import type { Match } from "@/types/user";

export default function HomeScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.user_id) {
      getMatchesByUser(user.user_id).then((data) => {
        setMatches(data);
      });
    }
  }, [user]);

  // Recharger les données quand on revient sur cette page
  useFocusEffect(
    React.useCallback(() => {
      if (user?.user_id) {
        getMatchesByUser(user.user_id).then((data) => {
          setMatches(data);
        });
      }
    }, [user])
  );

  const deleteMatch = (matchId: number) => {
    Alert.alert(
      "Supprimer le match",
      `Êtes-vous sûr de vouloir supprimer ce match ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMatchService(matchId);
              setMatches(matches.filter((match) => match.id !== matchId));
              Alert.alert("Succès", "Match supprimé avec succès");
            } catch (error: any) {
              console.error("Error deleting match:", error);
              const errorMessage =
                error.response?.data?.error || error.response?.status === 403
                  ? "Vous n'êtes pas autorisé à supprimer ce match. Seul le coach de l'équipe à domicile peut le faire."
                  : "Impossible de supprimer le match";
              Alert.alert("Erreur", errorMessage);
            }
          },
        },
      ]
    );
  };

  const viewMatchDetails = (matchId: number) => {
    router.push({ pathname: "./matches/match-details", params: { matchId } });
  };

  const toggleRecording = (matchId: number) => {
    setMatches(
      matches.map((match) => {
        if (match.id === matchId) {
          const isRecording = !match.isRecording;
          if (isRecording) {
            // Enregistrer l'heure de début
            const startTime = Date.now();
            updateMatch(matchId, {
              isRecording: true,
              recordingStartTime: startTime,
            });
            return {
              ...match,
              isRecording: true,
              recordingStartTime: startTime,
            };
          } else {
            // Calculer la durée totale en secondes
            const duration = match.recordingStartTime
              ? Math.floor((Date.now() - match.recordingStartTime) / 1000)
              : 0;
            updateMatch(matchId, {
              isRecording: false,
              hasRecording: true,
              recordingDuration: duration,
              recordingStartTime: undefined,
            });
            return {
              ...match,
              isRecording: false,
              hasRecording: true,
              recordingDuration: duration,
              recordingStartTime: undefined,
            };
          }
        }
        return match;
      })
    );
  };

  const createNewMatch = () => {
    router.push({ pathname: "./matches/create-match" });
  };

  const getTeamTextColor = (match: Match, isteam_name_1: boolean) => {
    if (match.status !== "finished") {
      return theme.text;
    }

    const team_name_1Score = match.team_score_1;
    const team_name_2Score = match.team_score_2;

    if (team_name_1Score === team_name_2Score) {
      return theme.text;
    }

    const isWinner = isteam_name_1
      ? team_name_1Score > team_name_2Score
      : team_name_2Score > team_name_1Score;

    return isWinner ? "#00e6cc" : "#ff8080";
  };

  const MatchCard = ({ match }: { match: Match }) => {
    return (
      <SwipeableCard
         title={match.name}
        cardId={0}
        borderTopColor={theme.primary}
        onEdit={() => viewMatchDetails(match.id)}
        onDelete={() => deleteMatch(match.id)}
        theme={theme}
      >
        <View style={styles.matchInfo}>
          <View
            style={[styles.teamsSection, { backgroundColor: theme.surface }]}
          >
            <View style={styles.teamRow}>
              <ThemedText
                style={[
                  styles.teamName,
                  { color: getTeamTextColor(match, true) },
                ]}
              >
                {match.team_name_1}
              </ThemedText>
              <View
                style={[
                  styles.scoreContainer,
                  { backgroundColor: theme.primary },
                ]}
              >
                <ThemedText style={styles.score}>
                  {match.team_score_1}
                </ThemedText>
              </View>
            </View>
            <View
              style={[
                styles.versusContainer,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <ThemedText style={[styles.versus, { color: theme.primary }]}>
                VS
              </ThemedText>
            </View>
            <View style={styles.teamRow}>
              <ThemedText
                style={[
                  styles.teamName,
                  { color: getTeamTextColor(match, false) },
                ]}
              >
                {match.team_name_2}
              </ThemedText>
              <View
                style={[
                  styles.scoreContainer,
                  { backgroundColor: theme.primary },
                ]}
              >
                <ThemedText style={styles.score}>
                  {match.team_score_2}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.matchActions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.primaryButton,
              { backgroundColor: theme.primary },
            ]}
            onPress={() => viewMatchDetails(match.id)}
          >
            <ThemedText style={styles.primaryButtonText}>
              Voir détails
            </ThemedText>
          </TouchableOpacity>
          {match.status === "scheduled" && !match.hasRecording && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.secondaryButton,
                {
                  backgroundColor: match.isRecording ? "#e74c3c" : "#27ae60",
                  borderColor: match.isRecording ? "#e74c3c" : "#27ae60",
                },
              ]}
              onPress={() => toggleRecording(match.id)}
            >
              <ThemedText
                style={[styles.secondaryButtonText, { color: "#ffffff" }]}
              >
                {match.isRecording ? "⏹ Stop" : "▶ Start"}
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </SwipeableCard>
    );
  };

  return (
    <ScreenLayout title="Historique des Matchs" theme={theme}>
      <View
        style={[styles.matchesContainer, { backgroundColor: theme.background }]}
      >
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </View>
      <AddButton onPress={createNewMatch} text="Nouveau Match" theme={theme} />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  matchesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 15,
  },
  matchInfo: {
    marginBottom: 20,
  },
  teamsSection: {
    alignItems: "center",
    marginBottom: 15,
    borderRadius: 15,
    padding: 15,
    overflow: "hidden",
  },
  teamRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingVertical: 8,
  },
  teamName: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    textShadowColor: "rgba(0, 217, 217, 0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  scoreContainer: {
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 40,
    alignItems: "center",
    ...(Platform.OS === "ios" && {
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.35,
      shadowRadius: 6,
    }),
    elevation: 4,
    overflow: "hidden",
  },
  score: {
    fontSize: 18,
    fontWeight: "800",
    color: "#f5f5f5",
    textAlign: "center",
  },
  versusContainer: {
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginVertical: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  versus: {
    fontSize: 14,
    fontWeight: "800",
  },
  matchActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: "center",
    ...(Platform.OS === "ios" && {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    }),
    elevation: 5,
    overflow: "hidden",
  },
  primaryButton: {
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  primaryButtonText: {
    color: "#f0f0f0",
    fontWeight: "700",
    fontSize: 15,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  secondaryButton: {
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontWeight: "700",
    fontSize: 15,
  },
});
