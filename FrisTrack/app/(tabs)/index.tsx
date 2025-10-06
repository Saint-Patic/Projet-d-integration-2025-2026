import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { SwipeableCard } from "@/components/swipeableCard";
import { ScreenLayout } from "@/components/screenLayout";
import { AddButton } from "@/components/addButton";
import { getMatches } from "@/services/getMatches";

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
    console.log(`Affichage des détails du match ${matchId}`);
  };

  const startMatch = (matchId: number) => {
    console.log(`Démarrage du match ${matchId}`);
  };

  const createNewMatch = () => {
    console.log("Création d'un nouveau match");
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "finished":
        return "Terminé";
      case "ongoing":
        return "En cours";
      case "scheduled":
        return "Programmé";
      default:
        return "Inconnu";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "finished":
        return "#00cccc";
      case "ongoing":
        return "#ff6b6b";
      case "scheduled":
        return "rgba(255, 255, 255, 0.7)";
      default:
        return "#7f8c8d";
    }
  };

  const MatchCard = ({ match }: { match: Match }) => {
    return (
      <SwipeableCard
        title="Match"
        cardId={match.id}
        borderTopColor={match.color}
        onEdit={() => editMatch(match.id)}
        onDelete={() => deleteMatch(match.id)}
      >
        <View style={styles.matchInfo}>
          <View style={styles.teamsSection}>
            <View style={styles.teamRow}>
              <ThemedText style={styles.teamName}>{match.team1}</ThemedText>
              <View style={styles.scoreContainer}>
                <ThemedText style={styles.score}>{match.score1}</ThemedText>
              </View>
            </View>
            <View style={styles.versusContainer}>
              <ThemedText style={styles.versus}>VS</ThemedText>
            </View>
            <View style={styles.teamRow}>
              <ThemedText style={styles.teamName}>{match.team2}</ThemedText>
              <View style={styles.scoreContainer}>
                <ThemedText style={styles.score}>{match.score2}</ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.matchMeta}>
            <View style={styles.dateContainer}>
              <IconSymbol name="calendar" size={16} color="#00cccc" />
              <ThemedText style={styles.date}>{match.date}</ThemedText>
            </View>
            <View
              style={[
                styles.statusContainer,
                { backgroundColor: getStatusColor(match.status) },
              ]}
            >
              <ThemedText style={styles.status}>
                {getStatusText(match.status)}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.matchActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => viewMatchDetails(match.id)}
          >
            <ThemedText style={styles.primaryButtonText}>
              Voir détails
            </ThemedText>
          </TouchableOpacity>
          {match.status === "scheduled" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => startMatch(match.id)}
            >
              <ThemedText style={styles.secondaryButtonText}>
                Démarrer
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </SwipeableCard>
    );
  };

  return (
    <ScreenLayout title="Historique des Matchs" titleOffset={8}>
      <View style={styles.matchesContainer}>
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </View>
      <AddButton onPress={createNewMatch} text="Nouveau Match" />
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
    backgroundColor: "rgba(255, 255, 255, 0.04)", // Plus subtil
    borderRadius: 15,
    padding: 15,
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
    color: "#f0f0f0", // Blanc cassé
    flex: 1,
    textShadowColor: "rgba(0, 217, 217, 0.25)", // Plus lumineux
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  scoreContainer: {
    backgroundColor: "#00b8b8", // Nuance plus douce
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 40,
    alignItems: "center",
    shadowColor: "#00e6e6", // Plus clair
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  score: {
    fontSize: 18,
    fontWeight: "800",
    color: "#f5f5f5", // Blanc cassé
    textAlign: "center",
  },
  versusContainer: {
    backgroundColor: "rgba(0, 217, 217, 0.15)", // Plus lumineux
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginVertical: 8,
  },
  versus: {
    fontSize: 14,
    fontWeight: "800",
    color: "#00d6d6", // Plus lumineux
  },
  matchMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.08)", // Plus visible
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },
  date: {
    fontSize: 14,
    color: "#e8e8e8", // Gris plus clair
    fontWeight: "600",
  },
  statusContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  status: {
    fontSize: 12,
    color: "#f5f5f5", // Blanc cassé
    fontWeight: "700",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButton: {
    backgroundColor: "#00a8a8c0", // Plus transparent et nuancé
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  primaryButtonText: {
    color: "#f0f0f0", // Blanc cassé
    fontWeight: "700",
    fontSize: 15,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.12)", // Plus visible
    borderWidth: 2,
    borderColor: "rgba(0, 217, 217, 0.35)", // Plus lumineux
  },
  secondaryButtonText: {
    color: "#00d6d6", // Plus lumineux
    fontWeight: "700",
    fontSize: 15,
  },
});
