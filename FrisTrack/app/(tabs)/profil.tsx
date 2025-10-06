import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "@/components/themed-text";
import { ScreenLayout } from "@/components/screenLayout";

export default function ProfilScreen() {
  const user = {
    nom: "Lemaire",
    prenom: "Nathan",
    image: require("@/assets/images/nathan.png"),
    pointure: 37,
    main: "Droite",
    poids: 52.5,
    taille: 157,
    age: 22,
  };

  const editProfile = () => {
    console.log("Modifier les informations du profil");
  };

  const connectSensor = () => {
    console.log("Connexion à un capteur");
  };

  const logout = () => {
    console.log("Déconnexion");
  };

  return (
    <ScreenLayout title="Profil" titleOffset={8}>
      <View style={styles.container}>
        <View style={styles.profileImageContainer}>
          <Image source={user.image} style={styles.profileImage} />
          <View style={styles.imageGlow} />
        </View>

        <ThemedText style={styles.name}>
          {user.prenom} {user.nom}
        </ThemedText>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Pointure</ThemedText>
            <ThemedText style={styles.infoValue}>{user.pointure}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Main dominante</ThemedText>
            <ThemedText style={styles.infoValue}>{user.main}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Poids</ThemedText>
            <ThemedText style={styles.infoValue}>{user.poids} kg</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Taille</ThemedText>
            <ThemedText style={styles.infoValue}>{user.taille} cm</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Âge</ThemedText>
            <ThemedText style={styles.infoValue}>{user.age} ans</ThemedText>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={editProfile}
          >
            <ThemedText style={styles.buttonText}>
              Modifier les informations
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.sensorButton]}
            onPress={connectSensor}
          >
            <ThemedText style={styles.buttonText}>
              Se connecter à un capteur
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={logout}
          >
            <ThemedText style={styles.buttonText}>Se déconnecter</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenLayout>
  );
}

// ...existing code...
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 32,
    flex: 1,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#00b8b8", // Nuance plus douce
    shadowColor: "#00d9d9", // Plus lumineux
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  imageGlow: {
    position: "absolute",
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 65,
    backgroundColor: "rgba(0, 217, 217, 0.15)", // Plus lumineux
    zIndex: -1,
  },
  name: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 24,
    color: "#f0f0f0", // Blanc cassé
    textShadowColor: "rgba(0, 230, 230, 0.4)", // Plus lumineux
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  infoContainer: {
    marginBottom: 32,
    width: "85%",
    backgroundColor: "rgba(255, 255, 255, 0.08)", // Plus visible
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 217, 217, 0.25)", // Plus lumineux
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 217, 217, 0.15)", // Plus lumineux
  },
  infoLabel: {
    fontSize: 16,
    color: "#e8e8e8", // Gris clair
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 16,
    color: "#00d6d6", // Plus lumineux
    fontWeight: "700",
  },
  buttonContainer: {
    width: "85%",
    gap: 16,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 2,
  },
  editButton: {
    backgroundColor: "#00b8b8", // Nuance plus douce
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  sensorButton: {
    backgroundColor: "rgba(0, 184, 184, 0.7)", // Plus transparent
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  logoutButton: {
    backgroundColor: "rgba(255, 255, 255, 0.08)", // Plus subtil
    borderColor: "rgba(232, 85, 85, 0.5)", // Rouge plus doux
  },
  buttonText: {
    color: "#f0f0f0", // Blanc cassé
    fontWeight: "700",
    fontSize: 16,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
