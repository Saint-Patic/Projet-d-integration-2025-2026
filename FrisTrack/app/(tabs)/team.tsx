import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  View,
  Dimensions,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface Team {
  id: number;
  name: string;
  playerCount: number;
  matches: number;
  wins: number;
  color: string;
}

export default function TeamScreen() {
  const [teams, setTeams] = useState<Team[]>([
    {
      id: 1,
      name: "Équipe Alpha",
      playerCount: 7,
      matches: 12,
      wins: 8,
      color: "#3498db",
    },
    {
      id: 2,
      name: "Équipe Beta",
      playerCount: 6,
      matches: 10,
      wins: 5,
      color: "#e74c3c",
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

  const TeamCard = ({ team }: { team: Team }) => (
    <ThemedView style={[styles.teamCard, { borderTopColor: team.color }]}>
      {/* Header */}
      <View style={styles.teamHeader}>
        <ThemedText type="subtitle" style={styles.teamTitle}>
          Team {team.id}
        </ThemedText>
        <View style={styles.teamControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => editTeam(team.id)}
          >
            <IconSymbol name="pencil" size={18} color="#3498db" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => deleteTeam(team.id)}
          >
            <IconSymbol name="trash" size={18} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.teamContent}>
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
      </View>
    </ThemedView>
  );

  return (
    <View style={styles.container}>
      {/* Fixed Title */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.mainTitle}>
          Gestion des Équipes
        </ThemedText>
      </ThemedView>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollableContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Teams Grid */}
        <View style={styles.teamsContainer}>
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </View>

        {/* Add Team Button */}
        <View style={styles.addTeamSection}>
          <TouchableOpacity
            style={styles.addTeamButton}
            onPress={createNewTeam}
          >
            <IconSymbol name="plus" size={20} color="#ffffff" />
            <ThemedText style={styles.addTeamText}>Nouvelle Équipe</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get("window");
const cardWidth = width > 600 ? (width - 60) / 2 : width - 40;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#e3e3e3",
  },
  scrollableContent: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  teamsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 15,
  },
  teamCard: {
    width: cardWidth,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderTopWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 15,
  },
  teamHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#f8f9fa",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  teamTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
  },
  teamControls: {
    flexDirection: "row",
    gap: 8,
  },
  controlButton: {
    padding: 6,
    borderRadius: 4,
  },
  teamContent: {
    padding: 15,
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
  addTeamSection: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  addTeamButton: {
    backgroundColor: "#27ae60",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    gap: 8,
  },
  addTeamText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
