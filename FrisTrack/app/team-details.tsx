import React, { useEffect } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ScreenLayout } from "@/components/screenLayout";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { BackButton } from "@/components/BackButton";

// Exemple de données fictives
const fakeMembers = [
  {
    id: 1,
    name: "Nathan Lemaire",
    image: require("@/assets/images/nathan.png"),
  },
  {
    id: 2,
    name: "Antoine Bontems",
    image: require("@/assets/images/lezard.png"),
  },
  {
    id: 3,
    name: "Alexis Demarcq",
    image: require("@/assets/images/react-logo.png"),
  },
  {
    id: 4,
    name: "Cyril Lamand",
    image: require("@/assets/images/partial-react-logo.png"),
  },
  { id: 5, name: "Jiale Wu", image: require("@/assets/images/react-logo.png") },
];

export default function TeamDetailsScreen() {
  const { teamId, teamName } = useLocalSearchParams();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const members = fakeMembers;

  // Pour afficher 2 membres par ligne
  const rows = [];
  for (let i = 0; i < members.length; i += 2) {
    rows.push(members.slice(i, i + 2));
  }

  const handleAddPlayer = () => {
    console.log("Ajouter un joueur à l'équipe", teamId);
  };

  return (
    <ScreenLayout
      title={"Détails de l'équipe"}
      headerLeft={
        <BackButton
          color="#00b8b8"
          size={28}
          style={{ marginLeft: 4, marginRight: 8 }}
        />
      }
    >
      <View style={styles.headerRow}>
        <ThemedText style={styles.headerTitle}>{teamName}</ThemedText>
      </View>
      <View style={styles.listContent}>
        {rows.map((row, idx) => (
          <View
            style={[
              styles.row,
              row.length === 1 && { justifyContent: "center" }, // Centrer si un seul joueur
            ]}
            key={idx}
          >
            {row.map((item) => (
              <View style={styles.memberContainer} key={item.id}>
                <TouchableOpacity
                  onPress={() =>
                    console.log(`Joueur: ${item.name}, id: ${item.id}`)
                  }
                  activeOpacity={0.7}
                >
                  <Image source={item.image} style={styles.memberImage} />
                </TouchableOpacity>
                <ThemedText style={styles.memberName}>{item.name}</ThemedText>
              </View>
            ))}
            {/* Si la ligne n'a qu'un membre, on n'ajoute rien pour garder le centrage */}
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.addButton} onPress={handleAddPlayer}>
        <ThemedText style={styles.addButtonText}>Ajouter un joueur</ThemedText>
      </TouchableOpacity>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 16,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00b8b8",
    marginLeft: 8, // espace entre la flèche et le titre
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 100,
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
  memberImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
    backgroundColor: "#eee",
  },
  memberName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#f0f0f0",
    textAlign: "center",
  },
  addButton: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: "#00b8b8",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    elevation: 5,
    ...(Platform.OS === "ios" && {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    }),
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
  },
});
