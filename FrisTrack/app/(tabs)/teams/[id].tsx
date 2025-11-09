import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "@/components/themed-text";
import { ScreenLayout } from "@/components/perso_components/screenLayout";
import { useLocalSearchParams, useNavigation, router } from "expo-router";
import { BackButton } from "@/components/perso_components/BackButton";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { getTeamPlayers, TeamPlayer } from "@/services/getTeams";
import { getProfileImage } from "@/components/perso_components/loadImages";

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
  const [isEditMode, setIsEditMode] = useState(editMode === "true");
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    loadTeamPlayers();
  }, [id]);

  const loadTeamPlayers = async () => {
    try {
      setIsLoading(true);
      const players = await getTeamPlayers(Number(id));

      // Convertir les données de l'API au format attendu
      const formattedMembers: Member[] = players.map((player, index) => ({
        id: index + 1, // ID temporaire pour la liste
        user_id: player.user_id, // ID réel de l'utilisateur
        name: player.player_name,
        image: getProfileImage(player.profile_picture), // Utiliser l'image de la DB
        position: player.role_attack === "handler" ? "handler" : "stack",
      }));

      setMembers(formattedMembers);
    } catch (error) {
      console.error("Error loading team players:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
  // Calcule le nombre de colonnes dynamiquement
  const screenWidth = Dimensions.get("window").width;
  let columns = 2;
  if (screenWidth > 700) columns = 3;
  if (screenWidth > 1000) columns = 4;

  // Découpe les membres en lignes selon le nombre de colonnes
  const rows = [];
  for (let i = 0; i < members.length; i += columns) {
    rows.push(members.slice(i, i + columns));
  }

  const handleAddPlayer = () => {
    router.push({
      pathname: "./add-player",
      params: {
        teamId: id,
        teamName: teamName,
      },
    });
  };

  const handlePlayerPress = (userId: number) => {
    router.push({
      pathname: "../../(modals)/player-profile",
      params: { playerId: userId.toString() },
    });
  };

  const HeaderRight = () => (
    <TouchableOpacity
      onPress={() => setIsEditMode(!isEditMode)}
      style={{ marginRight: 16 }}
    >
      <Ionicons
        name={isEditMode ? "checkmark" : "pencil"}
        size={24}
        color={theme.primary}
      />
    </TouchableOpacity>
  );

  const handlePositionChange = (playerId: number, newPosition: string) => {
    setMembers((prevMembers) =>
      prevMembers.map((member) =>
        member.id === playerId ? { ...member, position: newPosition } : member
      )
    );
  };

  // Pour Cyril :)
  const handleRemovePlayer = (player: {
    id: number;
    name: string;
    image: any;
    position: string;
  }) => {
    // Affiche les données nécessaires à la suppression dans la console
    console.log("Suppression joueur:", {
      id: player.id,
      name: player.name,
      teamId: id,
      // Ajoute d'autres infos si besoin
    });
    setMembers((prev) => prev.filter((m) => m.id !== player.id));
  };

  // Swap la position de deux joueurs dans le tableau
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
        // Clone les objets pour éviter les bugs de référence
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
                        onPress={() => handlePositionChange(item.id, "handler")}
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
                        onPress={() => handlePositionChange(item.id, "stack")}
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

        {isEditMode && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={handleAddPlayer}
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
