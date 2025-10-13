import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { SwipeableCard } from "@/components/perso_components/swipeableCard";
import { ScreenLayout } from "@/components/perso_components/screenLayout";
import { AddButton } from "@/components/perso_components/addButton";
import { getMatches } from "@/services/getMatches";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "expo-router";

interface Match {
  id: number;
  team1: string;
  team2: string;
  score1: number;
  score2: number;
  date: string;
  status: string;
  color: string;
}

export default function HomeScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    getMatches().then((data) => {
      setMatches(data);
    });
  }, []);

  const editMatch = (matchId: number) => {
    console.log(`Édition du match ${matchId}`);
  };

  const deleteMatch = (matchId: number) => {
    Alert.alert(
      "Supprimer le match",
      `Êtes-vous sûr de vouloir supprimer le match ${matchId} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            setMatches(matches.filter((match) => match.id !== matchId));
          },
        },
      ]
    );
  };

  const viewMatchDetails = (matchId: number) => {
    router.push({ pathname: "./match-details", params: { matchId } });
  };

  const startMatch = (matchId: number) => {
    console.log(`Démarrage du match ${matchId}`);
  };

  const createNewMatch = () => {
    console.log("Création d'un nouveau match");
  };

  const getTeamTextColor = (match: Match, isTeam1: boolean) => {
    if (match.status !== "finished") {
      return theme.text;
    }

    const team1Score = match.score1;
    const team2Score = match.score2;

    if (team1Score === team2Score) {
      return theme.text;
    }

    const isWinner = isTeam1
      ? team1Score > team2Score
      : team2Score > team1Score;

    return isWinner ? "#00e6cc" : "#ff8080";
  };

  const MatchCard = ({ match }: { match: Match }) => {
    return (
      <SwipeableCard
        title="Match"
        cardId={match.id}
        borderTopColor={theme.primary}
        onEdit={() => editMatch(match.id)}
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
                {match.team1}
              </ThemedText>
              <View
                style={[
                  styles.scoreContainer,
                  { backgroundColor: theme.primary },
                ]}
              >
                <ThemedText style={styles.score}>{match.score1}</ThemedText>
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
                {match.team2}
              </ThemedText>
              <View
                style={[
                  styles.scoreContainer,
                  { backgroundColor: theme.primary },
                ]}
              >
                <ThemedText style={styles.score}>{match.score2}</ThemedText>
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
          {match.status === "scheduled" && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.secondaryButton,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
              onPress={() => startMatch(match.id)}
            >
              <ThemedText
                style={[styles.secondaryButtonText, { color: theme.primary }]}
              >
                Démarrer
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

// ...existing code...
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
