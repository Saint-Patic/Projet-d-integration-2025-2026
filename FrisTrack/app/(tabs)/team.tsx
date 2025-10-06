import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { SwipeableCard } from "@/components/swipeableCard";
import { ScreenLayout } from "@/components/screenLayout";
import { AddButton } from "@/components/addButton";
import { getTeams } from "@/services/getTeams";
import MaterialIcons from "@expo/vector-icons/build/MaterialIcons";

interface Team {
  id: number;
  name: string;
  playerCount: number;
  color: string;
}

export default function TeamScreen() {
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    getTeams().then((data) => {
      setTeams(data);
    });
  }, []);

  const editTeam = (teamId: number) => {
    console.log(`Édition de l'équipe ${teamId}`);
  };

  const deleteTeam = (teamId: number) => {
    Alert.alert(
      "Supprimer l'équipe",
      `Êtes-vous sûr de vouloir supprimer l'équipe ${teamId} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            setTeams(teams.filter((team) => team.id !== teamId));
          },
        },
      ]
    );
  };

  const viewTeamDetails = (teamId: number) => {
    console.log(`Affichage des détails de l'équipe ${teamId}`);
  };

  const addPlayer = (teamId: number) => {
    console.log(`Ajout d'un joueur à l'équipe ${teamId}`);
  };

  const createNewTeam = () => {
    console.log("Création d'une nouvelle équipe");
  };

  const TeamCard = ({ team }: { team: Team }) => {
    return (
      <SwipeableCard
        title="Team"
        cardId={team.id}
        borderTopColor={team.color}
        onEdit={() => editTeam(team.id)}
        onDelete={() => deleteTeam(team.id)}
      >
        <View style={styles.teamInfo}>
          <View style={styles.teamNameSection}>
            <ThemedText style={styles.teamName}>{team.name}</ThemedText>
            <View style={styles.playerCountContainer}>
              <MaterialIcons name="person" size={16} color="#00cccc" />
              <ThemedText style={styles.playerCount}>
                {team.playerCount}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.teamActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => viewTeamDetails(team.id)}
          >
            <ThemedText style={styles.primaryButtonText}>
              Voir détails
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => addPlayer(team.id)}
          >
            <ThemedText style={styles.secondaryButtonText}>+ Joueur</ThemedText>
          </TouchableOpacity>
        </View>
      </SwipeableCard>
    );
  };

  return (
    <ScreenLayout title="Gestion des Équipes" titleOffset={8}>
      <View style={styles.teamsContainer}>
        {teams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </View>
      <AddButton onPress={createNewTeam} text="Nouvelle Équipe" />
    </ScreenLayout>
  );
}

// ...existing code...
const styles = StyleSheet.create({
  teamsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 15,
  },
  teamInfo: {
    marginBottom: 20,
  },
  teamNameSection: {
    alignItems: "flex-start",
  },
  teamName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f0f0f0", // Blanc cassé
    marginBottom: 8,
    textShadowColor: "rgba(0, 217, 217, 0.25)", // Plus lumineux
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  playerCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.08)", // Plus visible
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(0, 217, 217, 0.25)", // Plus lumineux
  },
  playerCount: {
    fontSize: 16,
    color: "#e8e8e8", // Gris clair
    fontWeight: "600",
  },
  teamActions: {
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
    backgroundColor: "#00b8b8", // Nuance plus douce
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
