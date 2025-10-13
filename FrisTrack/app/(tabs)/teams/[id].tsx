import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "@/components/themed-text";
import { ScreenLayout } from "@/components/perso_components/screenLayout";
import { useLocalSearchParams, useNavigation, router } from "expo-router";
import { BackButton } from "@/components/perso_components/BackButton";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

// Exemple de données fictives - utilisation des mêmes images que dans profil.tsx
const positionTerrain = { 1: "handler", 2: "stack" };

const fakeMembers = [
  {
    id: 1,
    name: "Nathan Lemaire",
    image: require("@/assets/images/profile_pictures/nathan.png"),
    position: positionTerrain["1"],
  },
  {
    id: 2,
    name: "Antoine Bontems",
    image: require("@/assets/images/profile_pictures/lezard.png"),
    position: positionTerrain["2"],
  },
  {
    id: 3,
    name: "Alexis Demarcq",
    image: require("@/assets/images/profile_pictures/default.png"),
    position: positionTerrain["2"],
  },
  {
    id: 4,
    name: "Cyril Lamand",
    image: require("@/assets/images/profile_pictures/chien.png"),
    position: positionTerrain["1"],
  },
  {
    id: 5,
    name: "Jiale Wu",
    image: require("@/assets/images/profile_pictures/chat.png"),
    position: positionTerrain["2"],
  },
];

export default function TeamDetailsScreen() {
  const { id, teamName, editMode } = useLocalSearchParams();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [isEditMode, setIsEditMode] = useState(editMode === "true");
  const [members, setMembers] = useState(fakeMembers);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Pour afficher 2 membres par ligne
  const rows = [];
  for (let i = 0; i < members.length; i += 2) {
    rows.push(members.slice(i, i + 2));
  }

  const handleAddPlayer = () => {
    console.log("Ajouter un joueur à l'équipe", id);
  };

  const handlePlayerPress = (playerId: number) => {
    router.push({
      pathname: "./(modals)/player-profile",
      params: { playerId: playerId.toString() },
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
  return (
    <ScreenLayout
      title={isEditMode ? "Éditer l'équipe" : "Détails de l'équipe"}
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
                <View style={styles.memberContainer} key={item.id}>
                  <TouchableOpacity
                    onPress={() => handlePlayerPress(item.id)}
                    activeOpacity={0.7}
                    style={styles.memberImageContainer}
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
  },
  memberImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
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
});
