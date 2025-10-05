import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "@/components/themed-text";
import { ScreenLayout } from "@/components/screenLayout";

export default function ProfilScreen() {
  // Données fictives pour l'exemple
  const user = {
    nom: "Lemaire",
    prenom: "Nathan",
    image: require("@/assets/images/nathan.png"),
    pointure: 36,
    main: "Droite",
    poids: 12,
    taille: 120,
    age: 23,
  };

  const editProfile = () => {
    console.log("Modifier les informations du profil");
    // Navigation vers la partie édition
  };

  const connectSensor = () => {
    console.log("Connexion à un capteur");
    // Connexion au capteur à implémenter
  };

  const logout = () => {
    console.log("Déconnexion");
    // Déconnexion à implémenter
  };

  return (
    <ScreenLayout title="Profil" titleOffset={8}>
      <View style={styles.container}>
        {/* Image de profil */}
        <Image source={user.image} style={styles.profileImage} />

        {/* Nom et prénom */}
        <ThemedText style={styles.name}>
          {user.prenom} {user.nom}
        </ThemedText>

        {/* Infos */}
        <View style={styles.infoContainer}>
          <ThemedText style={styles.infoText}>Pointure : {user.pointure}</ThemedText>
          <ThemedText style={styles.infoText}>Main dominante : {user.main}</ThemedText>
          <ThemedText style={styles.infoText}>Poids : {user.poids} kg</ThemedText>
          <ThemedText style={styles.infoText}>Taille : {user.taille} cm</ThemedText>
          <ThemedText style={styles.infoText}>Âge : {user.age} ans</ThemedText>
        </View>

        {/* Boutons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={editProfile}
          >
            <ThemedText style={styles.buttonText}>Modifier les informations</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.sensorButton]}
            onPress={connectSensor}
          >
            <ThemedText style={styles.buttonText}>Se connecter à un capteur</ThemedText>
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

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 32,
    flex: 1,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    backgroundColor: "#eee",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 18,
    color: "#2c3e50",
  },
  infoContainer: {
    marginBottom: 32,
    width: "80%",
    backgroundColor: "#f5f6fa",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 16,
    color: "#333",
  },
  buttonContainer: {
    width: "80%",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  editButton: {
    backgroundColor: "#3498db",
  },
  sensorButton: {
    backgroundColor: "#27ae60",
  },
  logoutButton: {
    backgroundColor: "#e74c3c",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
