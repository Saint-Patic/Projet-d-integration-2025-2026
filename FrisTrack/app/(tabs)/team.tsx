import React, { useState } from "react";
import { View, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { SwipeableCard } from "@/components/swipeableCard";
import { ScreenLayout } from "@/components/screenLayout";
import { AddButton } from "@/components/addButton";

interface Team {
  id: number;
  name: string;
  playerCount: number;
  color: string;
}

export default function TeamScreen() {
  const [teams, setTeams] = useState<Team[]>([
    {
      id: 1,
      name: "Équipe Alpha",
      playerCount: 7,
      color: "#3498db",
    },
    {
      id: 2,
      name: "Équipe Beta",
      playerCount: 6,
      color: "#e74c3c",
    },
    {
      id: 3,
      name: "Équipe Gamma",
      playerCount: 0,
      color: "#b4918dff",
    },
  ]);

  const editTeam = (teamId: number) => {
    console.log(`Édition de l'équipe ${teamId}`);
    // Navigation vers écran d'édition
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
    // Navigation vers écran de détails
  };

  const addPlayer = (teamId: number) => {
    console.log(`Ajout d'un joueur à l'équipe ${teamId}`);
    // Navigation vers écran d'ajout de joueur
  };

  const createNewTeam = () => {
    console.log("Création d'une nouvelle équipe");
    // Navigation vers écran de création
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
        {/* Team Info */}
        <View style={styles.teamInfo}>
          <View style={styles.teamNameSection}>
            <ThemedText style={styles.teamName}>{team.name}</ThemedText>
            <View style={styles.playerCountContainer}>
              <IconSymbol name="person" size={16} color="#7f8c8d" />
              <ThemedText style={styles.playerCount}>
                {team.playerCount}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Actions */}
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
    <ScreenLayout title="Gestion des Équipes">
      {/* Teams Grid */}
      <View style={styles.teamsContainer}>
        {teams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </View>

      {/* Add Team Button */}
      <AddButton onPress={createNewTeam} text="Nouvelle Équipe" />
    </ScreenLayout>
  );
}

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
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  playerCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  playerCount: {
    fontSize: 16,
    color: "#7f8c8d",
    fontWeight: "500",
  },
  teamActions: {
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
