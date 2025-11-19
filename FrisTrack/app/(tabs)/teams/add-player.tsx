import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
} from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "@/components/themed-text";
// import { ScreenLayout } from "@/components/perso_components/screenLayout";
import { useLocalSearchParams, router } from "expo-router";
import { BackButton } from "@/components/perso_components/BackButton";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

// Données fictives des joueurs disponibles
const availablePlayers = [
  {
    id: 6,
    name: "Marie Dubois",
    image: require("@/assets/images/profile_pictures/default.png"),
  },
  {
    id: 7,
    name: "Pierre Martin",
    image: require("@/assets/images/profile_pictures/default.png"),
  },
  {
    id: 8,
    name: "Sophie Durand",
    image: require("@/assets/images/profile_pictures/default.png"),
  },
  {
    id: 9,
    name: "Lucas Bernard",
    image: require("@/assets/images/profile_pictures/default.png"),
  },
  {
    id: 10,
    name: "Emma Petit",
    image: require("@/assets/images/profile_pictures/default.png"),
  },
];

export default function AddPlayersScreen() {
  const { teamId, teamName } = useLocalSearchParams();
  const { theme } = useTheme();
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);

  const togglePlayerSelection = (playerId: number) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  };

  const sendInvitations = () => {
    if (selectedPlayers.length === 0) {
      Alert.alert(
        "Aucun joueur sélectionné",
        "Veuillez sélectionner au moins un joueur pour envoyer des invitations."
      );
      return;
    }

    Alert.alert(
      "Invitations envoyées",
      `${selectedPlayers.length} invitation(s) envoyée(s) pour rejoindre l'équipe ${teamName}.`,
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]
    );
  };

  const ListHeader = () => (
    <View style={styles.headerInfo}>
      <ThemedText style={[styles.teamName, { color: theme.primary }]}>
        {teamName}
      </ThemedText>
      <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
        Sélectionnez les joueurs à inviter dans votre équipe
      </ThemedText>
    </View>
  );

  const renderPlayer = ({ item }: { item: (typeof availablePlayers)[0] }) => {
    const isSelected = selectedPlayers.includes(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.playerCard,
          {
            backgroundColor: theme.surface,
            borderColor: isSelected ? theme.primary : theme.border,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={() => togglePlayerSelection(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.playerInfo}>
          <Image
            source={item.image}
            style={[
              styles.playerImage,
              { borderColor: isSelected ? theme.primary : theme.border },
            ]}
          />
          <View style={styles.playerDetails}>
            <ThemedText style={[styles.playerName, { color: theme.text }]}>
              {item.name}
            </ThemedText>
          </View>
        </View>

        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: isSelected ? theme.primary : "transparent",
              borderColor: isSelected ? theme.primary : theme.border,
            },
          ]}
        >
          {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header fixe */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.background,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <BackButton theme={theme} />
          <ThemedText style={[styles.headerTitle, { color: theme.text }]}>
            Ajouter des joueurs
          </ThemedText>
        </View>
      </View>

      {/* Liste avec FlatList uniquement */}
      <FlatList
        data={availablePlayers}
        renderItem={renderPlayer}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={ListHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity
        onPress={sendInvitations}
        style={[
          styles.sendButton,
          {
            backgroundColor:
              selectedPlayers.length > 0 ? theme.primary : theme.textSecondary,
            opacity: selectedPlayers.length > 0 ? 1 : 0.6,
          },
        ]}
        disabled={selectedPlayers.length === 0}
      >
        <Ionicons name="send" size={20} color="#fff" style={styles.sendIcon} />
        <ThemedText style={styles.sendButtonText}>
          Envoyer les invitations ({selectedPlayers.length})
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  headerInfo: {
    padding: 20,
    alignItems: "center",
  },
  teamName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 95,
  },
  playerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  playerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  playerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
    borderWidth: 2,
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  playerPosition: {
    fontSize: 14,
    fontStyle: "italic",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButton: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  sendIcon: {
    marginRight: 8,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
