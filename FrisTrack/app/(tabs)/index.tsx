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
    // Utiliser le service pour obtenir les données des matchs
    getMatches().then((data) => {
      setMatches(data);
    });
  }, []);

  const editMatch = (matchId: number) => {
    console.log(`Édition du match ${matchId}`);
    // Navigation vers écran d'édition
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
    // Navigation vers écran de détails
  };

  const startMatch = (matchId: number) => {
    console.log(`Démarrage du match ${matchId}`);
    // Logic pour démarrer le match
  };

  const createNewMatch = () => {
    console.log("Création d'un nouveau match");
    // Navigation vers écran de création
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
        return "#27ae60";
      case "ongoing":
        return "#f39c12";
      case "scheduled":
        return "#3498db";
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
        {/* Match Info */}
        <View style={styles.matchInfo}>
          <View style={styles.teamsSection}>
            <View style={styles.teamRow}>
              <ThemedText style={styles.teamName}>{match.team1}</ThemedText>
              <ThemedText style={styles.score}>{match.score1}</ThemedText>
            </View>
            <ThemedText style={styles.versus}>VS</ThemedText>
            <View style={styles.teamRow}>
              <ThemedText style={styles.teamName}>{match.team2}</ThemedText>
              <ThemedText style={styles.score}>{match.score2}</ThemedText>
            </View>
          </View>

          <View style={styles.matchMeta}>
            <View style={styles.dateContainer}>
              <IconSymbol name="calendar" size={16} color="#7f8c8d" />
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

        {/* Actions */}
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
      {/* Matches Grid */}
      <View style={styles.matchesContainer}>
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </View>

      {/* Add Match Button */}
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
    fontWeight: "600",
    color: "#2c3e50",
    flex: 1,
  },
  score: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    minWidth: 30,
    textAlign: "center",
  },
  versus: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7f8c8d",
    marginVertical: 5,
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
  },
  date: {
    fontSize: 14,
    color: "#7f8c8d",
    fontWeight: "500",
  },
  statusContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  status: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "600",
  },
  matchActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#3498db",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#ecf0f1",
    borderWidth: 1,
    borderColor: "#bdc3c7",
  },
  secondaryButtonText: {
    color: "#2c3e50",
    fontWeight: "600",
  },
});
