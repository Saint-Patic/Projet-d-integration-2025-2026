import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import {
  router,
  useLocalSearchParams,
  useNavigation,
  useFocusEffect,
} from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { BackButton } from "@/components/perso_components/BackButton";
import { getProfileImage } from "@/components/perso_components/loadImages";
import { ScreenLayout } from "@/components/perso_components/screenLayout";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getTeamById, getTeamPlayers } from "@/services/getTeams";
import { removePlayerFromTeam } from "@/services/players";
import { userService } from "@/services/userService";

interface Member {
  id: number;
  user_id: number;
  name: string;
  image: any;
  position: string;
}

export default function TeamDetailsScreen() {
  const { id, teamName, editMode } = useLocalSearchParams();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [isEditMode, setIsEditMode] = useState(editMode === "true");
  const [members, setMembers] = useState<Member[]>([]);
  const [originalMembers, setOriginalMembers] = useState<Member[]>([]);
  const [playersToRemove, setPlayersToRemove] = useState<number[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCoach, setIsCoach] = useState(false);

  const loadTeamData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Récupérer les infos de l'équipe pour vérifier si le user est coach
      const teamData = await getTeamById(Number(id));
      const userIsCoach = teamData?.coach_id === user?.user_id;
      setIsCoach(userIsCoach);

      // Récupérer les joueurs
      const players = await getTeamPlayers(Number(id));

      const formattedMembers: Member[] = players.map((player, index) => ({
        id: index + 1,
        user_id: player.user_id,
        name: player.player_name,
        image: getProfileImage(player.profile_picture),
        position: player.role_attack === "handler" ? "handler" : "stack",
      }));

      setMembers(formattedMembers);
      setOriginalMembers(formattedMembers);
    } catch (error) {
      console.error("Error loading team data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id, user?.user_id]);

  useFocusEffect(
    useCallback(() => {
      loadTeamData();
    }, [loadTeamData])
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (
        !isEditMode ||
        (members.length === originalMembers.length &&
          playersToRemove.length === 0)
      ) {
        return;
      }

      e.preventDefault();

      Alert.alert(
        "Modifications non enregistrées",
        "Voulez-vous quitter sans enregistrer vos modifications ?",
        [
          { text: "Rester", style: "cancel" },
          {
            text: "Quitter",
            style: "destructive",
            onPress: () => {
              setMembers([...originalMembers]);
              setPlayersToRemove([]);
              setIsEditMode(false);
              navigation.dispatch(e.data.action);
            },
          },
        ]
      );
    });

    return unsubscribe;
  }, [isEditMode, members, originalMembers, playersToRemove, navigation]);

  if (isLoading) {
    return (
      <ScreenLayout
        title="Détails équipe"
        headerLeft={<BackButton theme={theme} />}
        theme={theme}
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.background,
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </ScreenLayout>
    );
  }

  const screenWidth = Dimensions.get("window").width;
  let columns = 2;
  if (screenWidth > 700) columns = 3;
  if (screenWidth > 1000) columns = 4;

  const rows = [];
  for (let i = 0; i < members.length; i += columns) {
    rows.push(members.slice(i, i + columns));
  }

  const handleAddPlayer = () => {
    if (!isCoach) {
      Alert.alert(
        "Permission refusée",
        "Seul le coach peut ajouter des joueurs"
      );
      return;
    }
    router.push({
      pathname: "./add-player",
      params: {
        teamId: id,
        teamName: teamName,
      },
    });
  };

  const handlePlayerPress = (userId: number) => {
    console.log("🚀 ~ handlePlayerPress ~ userId:", userId);
    if (!userId || userId <= 0) {
      console.warn("Invalid user ID:", userId);
      Alert.alert(
        "Erreur",
        "Impossible d'ouvrir le profil de ce joueur. Données invalides."
      );
      return;
    }
    router.push({
      pathname: "../../(modals)/player-profile",
      params: { playerId: userId.toString() },
    });
  };

  const HeaderRight = () => {
    if (!isCoach) return null;

    return (
      <TouchableOpacity onPress={toggleEditMode} style={{ marginRight: 16 }}>
        <Ionicons
          name={isEditMode ? "checkmark" : "pencil"}
          size={24}
          color={theme.primary}
        />
      </TouchableOpacity>
    );
  };

  const handlePositionChange = (
    userId: number,
    newPosition: "handler" | "stack"
  ) => {
    setMembers((prevMembers) =>
      prevMembers.map((member) =>
        member.user_id === userId
          ? { ...member, position: newPosition }
          : member
      )
    );
  };

  const saveChanges = async () => {
    try {
      const changedMembers = members.filter((member) => {
        const original = originalMembers.find(
          (m) => m.user_id === member.user_id
        );
        return original && original.position !== member.position;
      });

      // S'il y a des joueurs à supprimer, afficher une alerte de confirmation
      if (playersToRemove.length > 0) {
        const playersNames = playersToRemove
          .map((userId) => {
            const player = originalMembers.find((m) => m.user_id === userId);
            return player?.name;
          })
          .filter(Boolean)
          .join(", ");

        Alert.alert(
          "Confirmer les suppressions",
          `Voulez-vous vraiment retirer ${playersNames} de l'équipe ?`,
          [
            {
              text: "Annuler",
              style: "cancel",
              onPress: () => {
                setMembers([...originalMembers]);
                setPlayersToRemove([]);
                setIsEditMode(false);
              },
            },
            {
              text: "Confirmer",
              style: "destructive",
              onPress: async () => {
                await performSaveChanges(changedMembers);
              },
            },
          ]
        );
      } else {
        // Aucun changement
        await performSaveChanges(changedMembers);
        setIsEditMode(false);
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des changements:", error);
      setMembers([...originalMembers]);
      setPlayersToRemove([]);
    }
  };

  const performSaveChanges = async (changedMembers: Member[]) => {
    let errorCount = 0;

    // Supprimer les joueurs
    for (const userId of playersToRemove) {
      try {
        await removePlayerFromTeam(userId, Number(id));
      } catch (error) {
        console.error(`Erreur pour la suppression du joueur ${userId}:`, error);
        errorCount++;
      }
    }

    // Mettre à jour les positions
    for (const member of changedMembers) {
      try {
        const updateData = {
          user_id: member.user_id,
          team_id: Number(id),
          role_attack: member.position as "handler" | "stack",
        };

        await userService.updateTeamRoleAttack(updateData);
      } catch (error) {
        console.error(`Erreur pour le joueur ${member.name}:`, error);
        errorCount++;
      }
    }

    if (errorCount === 0) {
      setOriginalMembers([...members]);
      setPlayersToRemove([]);
      setIsEditMode(false);
      Alert.alert("Succès", "Les modifications ont été enregistrées");
    } else {
      await loadTeamData();
      setPlayersToRemove([]);
      setIsEditMode(false);
      Alert.alert(
        "Attention",
        "Certaines modifications n'ont pas pu être enregistrées"
      );
    }
  };

  const toggleEditMode = () => {
    if (!isCoach) {
      Alert.alert("Permission refusée", "Seul le coach peut modifier l'équipe");
      return;
    }

    if (isEditMode) {
      // Sauvegarder uniquement s'il y a des suppressions ou des changements de position
      const changedMembers = members.filter((member) => {
        const original = originalMembers.find(
          (m) => m.user_id === member.user_id
        );
        return original && original.position !== member.position;
      });

      if (playersToRemove.length > 0 || changedMembers.length > 0) {
        saveChanges();
      } else {
        setIsEditMode(false);
      }
    } else {
      setIsEditMode(true);
    }
  };

  const handleAddPlayerWithValidation = () => {
    if (!isCoach) {
      Alert.alert(
        "Permission refusée",
        "Seul le coach peut ajouter des joueurs"
      );
      return;
    }

    // Si des joueurs sont marqués pour suppression, demander confirmation
    if (playersToRemove.length > 0) {
      const playersNames = playersToRemove
        .map((userId) => {
          const player = originalMembers.find((m) => m.user_id === userId);
          return player?.name;
        })
        .filter(Boolean)
        .join(", ");

      Alert.alert(
        "Confirmer les suppressions",
        `Vous avez marqué ${playersNames} pour suppression. Voulez-vous valider ces suppressions avant d'ajouter de nouveaux joueurs ?`,
        [
          {
            text: "Annuler",
            style: "cancel",
            // Ne fait rien, reste sur la page
          },
          {
            text: "Valider et continuer",
            onPress: async () => {
              // Sauvegarder les suppressions
              await performSaveChangesForAdd();
              // Puis naviguer vers l'ajout
              handleAddPlayer();
            },
          },
        ]
      );
    } else {
      // Pas de suppression, aller directement à l'ajout
      handleAddPlayer();
    }
  };

  const performSaveChangesForAdd = async () => {
    let errorCount = 0;

    // Supprimer les joueurs
    for (const userId of playersToRemove) {
      try {
        await removePlayerFromTeam(userId, Number(id));
      } catch (error) {
        console.error(`Erreur pour la suppression du joueur ${userId}:`, error);
        errorCount++;
      }
    }

    if (errorCount === 0) {
      // Mettre à jour l'état local
      const newMembers = members.filter(
        (m) => !playersToRemove.includes(m.user_id)
      );
      setMembers(newMembers);
      setOriginalMembers(newMembers);
      setPlayersToRemove([]);
    } else {
      await loadTeamData();
      setPlayersToRemove([]);
      Alert.alert(
        "Attention",
        "Certaines suppressions n'ont pas pu être effectuées"
      );
    }
  };

  const handleRemovePlayer = (player: Member) => {
    setMembers((prev) => prev.filter((m) => m.user_id !== player.user_id));
    setPlayersToRemove((prev) => [...prev, player.user_id]);
  };

  const handleEditImagePress = (playerId: number) => {
    if (selectedPlayerId === null) {
      setSelectedPlayerId(playerId);
    } else if (selectedPlayerId === playerId) {
      setSelectedPlayerId(null);
    } else {
      setMembers((prev) => {
        const idx1 = prev.findIndex((m) => m.id === selectedPlayerId);
        const idx2 = prev.findIndex((m) => m.id === playerId);
        if (idx1 === -1 || idx2 === -1) return prev;
        const newArr = prev.map((m) => ({ ...m }));
        [newArr[idx1], newArr[idx2]] = [newArr[idx2], newArr[idx1]];
        return newArr;
      });
      setSelectedPlayerId(null);
    }
  };

  return (
    <ScreenLayout
      title={isEditMode ? "Éditer l'équipe" : "Détails équipe"}
      headerLeft={<BackButton theme={theme} />}
      headerRight={<HeaderRight />}
      theme={theme}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.headerRow}>
          <ThemedText style={[styles.headerTitle, { color: theme.primary }]}>
            {teamName}
          </ThemedText>
          {isCoach && (
            <View
              style={[styles.coachBadge, { backgroundColor: theme.primary }]}
            >
              <Ionicons name="star" size={14} color="#fff" />
              <ThemedText style={styles.coachBadgeText}>
                Vous êtes coach
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.listContent}>
          {rows.map((row, idx) => (
            <View
              style={[
                styles.row,
                row.length === 1 && { justifyContent: "center" },
              ]}
              key={idx}
            >
              {row.map((item) => (
                <View style={styles.memberContainer} key={item.user_id}>
                  <View style={styles.memberImageContainer}>
                    {isEditMode ? (
                      <TouchableOpacity
                        onPress={() => handleEditImagePress(item.id)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.imageHighlight}>
                          <Image
                            source={item.image}
                            style={styles.memberImage}
                          />
                          {selectedPlayerId === item.id && (
                            <View
                              style={[
                                styles.memberImageOverlay,
                                {
                                  backgroundColor: theme.primary + "66",
                                },
                              ]}
                              pointerEvents="none"
                            />
                          )}
                          <View
                            style={[
                              styles.imageGlow,
                              { backgroundColor: `${theme.primary}15` },
                            ]}
                          />
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => handlePlayerPress(item.user_id)}
                        activeOpacity={0.7}
                      >
                        <Image
                          source={item.image}
                          style={[
                            styles.memberImage,
                            { borderColor: theme.primary },
                          ]}
                        />
                        <View
                          style={[
                            styles.imageGlow,
                            { backgroundColor: `${theme.primary}15` },
                          ]}
                        />
                      </TouchableOpacity>
                    )}
                    {isEditMode && (
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemovePlayer(item)}
                        hitSlop={10}
                      >
                        <Ionicons
                          name="remove-circle"
                          size={26}
                          color="#e85555"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                  <ThemedText
                    style={[styles.memberName, { color: theme.text }]}
                  >
                    {item.name}
                  </ThemedText>

                  {isEditMode ? (
                    <View style={styles.positionSelector}>
                      <TouchableOpacity
                        style={[
                          styles.positionButton,
                          item.position === "handler" && {
                            backgroundColor: theme.primary,
                          },
                          item.position !== "handler" && {
                            backgroundColor: theme.surface,
                            borderColor: theme.border,
                            borderWidth: 1,
                          },
                        ]}
                        onPress={() =>
                          handlePositionChange(item.user_id, "handler")
                        }
                      >
                        <ThemedText
                          style={[
                            styles.positionButtonText,
                            item.position === "handler"
                              ? { color: "#fff" }
                              : { color: theme.text },
                          ]}
                        >
                          Handler
                        </ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.positionButton,
                          item.position === "stack" && {
                            backgroundColor: theme.primary,
                          },
                          item.position !== "stack" && {
                            backgroundColor: theme.surface,
                            borderColor: theme.border,
                            borderWidth: 1,
                          },
                        ]}
                        onPress={() =>
                          handlePositionChange(item.user_id, "stack")
                        }
                      >
                        <ThemedText
                          style={[
                            styles.positionButtonText,
                            item.position === "stack"
                              ? { color: "#fff" }
                              : { color: theme.text },
                          ]}
                        >
                          Stack
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <ThemedText
                      style={[
                        styles.memberPosition,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {item.position}
                    </ThemedText>
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>

        {isEditMode && isCoach && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={handleAddPlayerWithValidation}
          >
            <ThemedText style={styles.addButtonText}>
              Ajouter un joueur
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </ScreenLayout>
  );
}

const IMAGE_SIZE = 90;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  headerRow: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 1,
    textShadowColor: "rgba(0, 230, 230, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
    paddingVertical: 10,
  },
  coachBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  coachBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 120,
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  memberContainer: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 8,
  },
  memberImageContainer: {
    position: "relative",
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  memberImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: IMAGE_SIZE / 2,
    ...(Platform.OS === "ios"
      ? {
          borderWidth: 3,
          shadowColor: "#00d9d9",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.4,
          shadowRadius: 10,
        }
      : {
          backgroundColor: "#fff",
        }),
    elevation: 6,
  },
  memberImageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: IMAGE_SIZE / 2,
    backgroundColor: "rgba(255, 255, 255, 0.66)",
    zIndex: 2,
  },
  imageGlow: {
    position: "absolute",
    top: Platform.OS === "android" ? -2 : -4,
    left: Platform.OS === "android" ? -2 : -4,
    right: Platform.OS === "android" ? -2 : -4,
    bottom: Platform.OS === "android" ? -2 : -4,
    borderRadius: Platform.OS === "android" ? 47 : 49,
    zIndex: -1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginBottom: 4,
  },
  memberPosition: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    fontStyle: "italic",
    opacity: 0.8,
  },
  addButton: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: "center",
    ...(Platform.OS === "ios"
      ? {
          borderWidth: 2,
          borderColor: "rgba(255, 255, 255, 0.25)",
          shadowColor: "#00e6e6",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.35,
          shadowRadius: 14,
        }
      : {}),
    elevation: 8,
    overflow: "hidden",
  },
  addButtonText: {
    color: "#f0f0f0",
    fontWeight: "700",
    fontSize: 17,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
  positionSelector: {
    flexDirection: "row",
    gap: 4,
    marginTop: 4,
  },
  positionButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#444",
  },
  positionButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  removeButton: {
    position: "absolute",
    top: -5,
    right: -5,
    zIndex: 10,
    backgroundColor: "transparent",
  },
  imageHighlight: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: IMAGE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  imageHighlightSelected: {
    backgroundColor: "rgba(255,255,255,0.25)",
  },
});
