import React, { useState, useRef } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  View,
  Dimensions,
  Animated,
  PanResponder,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import Icon from "react-native-vector-icons/MaterialIcons";

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
    const translateX = useRef(new Animated.Value(0)).current;
    const [revealedSide, setRevealedSide] = useState<"none" | "left" | "right">(
      "none"
    );
    const ACTION_WIDTH = 80; // Largeur d'une seule action

    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: (evt, gestureState) => {
        // Permettre le mouvement dans les deux directions
        const newValue = Math.max(
          -ACTION_WIDTH,
          Math.min(ACTION_WIDTH, gestureState.dx)
        );
        translateX.setValue(newValue);

        // Mettre à jour revealedSide en temps réel pendant le mouvement
        if (newValue > 2) {
          // Mouvement vers la droite - révéler delete à gauche
          setRevealedSide("left");
        } else if (newValue < -2) {
          // Mouvement vers la gauche - révéler edit à droite
          setRevealedSide("right");
        } else {
          // Position neutre
          setRevealedSide("none");
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const actionWindow = 30;
        if (gestureState.dx < -actionWindow) {
          // Swipe vers la gauche - révéler l'action de droite (edit)
          setRevealedSide("right");
          Animated.spring(translateX, {
            toValue: -ACTION_WIDTH,
            useNativeDriver: true,
          }).start();
        } else if (gestureState.dx > actionWindow) {
          // Swipe vers la droite - révéler l'action de gauche (delete)
          setRevealedSide("left");
          Animated.spring(translateX, {
            toValue: ACTION_WIDTH,
            useNativeDriver: true,
          }).start();
        } else {
          // Retour au centre - cacher les actions
          setRevealedSide("none");
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    });

    const resetPosition = () => {
      setRevealedSide("none");
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    };

    return (
      <View style={styles.teamCardContainer}>
        {/* Action gauche - Delete */}
        {revealedSide === "left" && (
          <View style={styles.leftAction}>
            <TouchableOpacity
              style={[styles.actionHidden, styles.deleteAction]}
              onPress={() => {
                resetPosition();
                deleteTeam(team.id);
              }}
            >
              <Icon name="delete" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Action droite - Edit */}
        {revealedSide === "right" && (
          <View style={styles.rightAction}>
            <TouchableOpacity
              style={[styles.actionHidden, styles.editAction]}
              onPress={() => {
                resetPosition();
                editTeam(team.id);
              }}
            >
              <Icon name="edit" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Carte principale */}
        <Animated.View
          style={[styles.teamCardWrapper, { transform: [{ translateX }] }]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              if (revealedSide !== "none") {
                resetPosition();
              }
            }}
            style={{ flex: 1 }}
          >
            <ThemedView
              style={[
                styles.teamCard,
                { borderTopColor: team.color },
                revealedSide === "left" && styles.teamCardLeftRevealed,
                revealedSide === "right" && styles.teamCardRightRevealed,
              ]}
            >
              {/* Header */}
              <View
                style={[
                  styles.teamHeader,
                  revealedSide === "left" && styles.teamHeaderLeftRevealed,
                  revealedSide === "right" && styles.teamHeaderRightRevealed,
                ]}
              >
                <ThemedText type="subtitle" style={styles.teamTitle}>
                  Team {team.id}
                </ThemedText>
                <View style={styles.swipeIndicator}>
                  <IconSymbol
                    name="chevron.left.chevron.right"
                    size={16}
                    color="#bdc3c7"
                  />
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
                    onPress={() => {
                      resetPosition();
                      viewTeamDetails(team.id);
                    }}
                  >
                    <ThemedText style={styles.primaryButtonText}>
                      Voir détails
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.secondaryButton]}
                    onPress={() => {
                      resetPosition();
                      addPlayer(team.id);
                    }}
                  >
                    <ThemedText style={styles.secondaryButtonText}>
                      + Joueur
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </ThemedView>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };
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
  teamCardContainer: {
    width: cardWidth,
    marginBottom: 15,
    position: "relative",
  },
  teamCardWrapper: {
    width: cardWidth,
  },
  hiddenActions: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 120,
    flexDirection: "row",
    zIndex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  leftAction: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 80,
    zIndex: 1,
  },
  rightAction: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    zIndex: 1,
  },
  actionHidden: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  editAction: {
    backgroundColor: "#3498db",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  deleteAction: {
    backgroundColor: "#e74c3c",
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  teamCard: {
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
  teamCardLeftRevealed: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  teamCardRightRevealed: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  teamHeaderLeftRevealed: {
    borderTopLeftRadius: 0,
  },
  teamHeaderRightRevealed: {
    borderTopRightRadius: 0,
  },
  teamTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
  },
  swipeIndicator: {
    opacity: 0.5,
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
