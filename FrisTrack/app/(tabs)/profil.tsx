import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ScreenLayout } from "@/components/screenLayout";
import { useTheme } from "@/contexts/ThemeContext";

// Liste manuelle des images du dossier profile_pictures
const profilePictures = [
  {
    name: "chat.png",
    src: require("@/assets/images/profile_pictures/chat.png"),
  },
  {
    name: "chien.png",
    src: require("@/assets/images/profile_pictures/chien.png"),
  },
  {
    name: "default.png",
    src: require("@/assets/images/profile_pictures/default.png"),
  },
  {
    name: "Frisbee.png",
    src: require("@/assets/images/profile_pictures/Frisbee.png"),
  },
  {
    name: "lezard.png",
    src: require("@/assets/images/profile_pictures/lezard.png"),
  },
  {
    name: "nathan.png",
    src: require("@/assets/images/profile_pictures/nathan.png"),
  },
];

function getImageSource(imageName: string) {
  const found = profilePictures.find((img) => img.name === imageName);
  return found ? found.src : profilePictures[0].src;
}

export default function ProfilScreen() {
  const { theme } = useTheme();
  const [editMode, setEditMode] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [user, setUser] = useState({
    id: 1,
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

  const settings = () => {
    router.push("/settings");
  };

  const HeaderRight = () => (
    <TouchableOpacity onPress={settings} style={{ marginRight: 16 }}>
      <Ionicons name="settings-outline" size={24} color={theme.primary} />
    </TouchableOpacity>
  );

  if (editMode) {
    return (
      <ScreenLayout title="Profil" headerRight={<HeaderRight />}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView contentContainerStyle={styles.container}>
            {showImagePicker ? (
              <View style={styles.imagePickerContainer}>
                <ThemedText style={styles.editPhotoText}>
                  Choisissez une photo de profil
                </ThemedText>
                <View style={styles.imagePickerGrid}>
                  {profilePictures.map((img, idx) => (
                    <TouchableOpacity
                      key={img.name}
                      onPress={() => {
                        setForm((f) => ({ ...f, imageName: img.name }));
                        setShowImagePicker(false);
                      }}
                    >
                      <Image
                        source={img.src}
                        style={styles.profileImageSmall}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  onPress={() => setShowImagePicker(false)}
                  style={styles.cancelPickerButton}
                >
                  <ThemedText style={styles.cancelPickerText}>
                    Annuler
                  </ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.profileImageContainer}>
                <TouchableOpacity
                  onPress={() => setShowImagePicker(true)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={getImageSource(form.imageName)}
                    style={styles.profileImage}
                  />
                </TouchableOpacity>
                <ThemedText style={styles.editPhotoText}>
                  Cliquez sur la photo pour la changer
                </ThemedText>
              </View>
            )}
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Prénom</ThemedText>
                <TextInput
                  style={styles.input}
                  value={form.prenom}
                  onChangeText={(text) =>
                    setForm((f) => ({ ...f, prenom: text }))
                  }
                  placeholder="Prénom"
                  placeholderTextColor="#aaa"
                />
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Nom</ThemedText>
                <TextInput
                  style={styles.input}
                  value={form.nom}
                  onChangeText={(text) => setForm((f) => ({ ...f, nom: text }))}
                  placeholder="Nom"
                  placeholderTextColor="#aaa"
                />
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Pointure</ThemedText>
                <TextInput
                  style={styles.input}
                  value={pointureInput}
                  onChangeText={(text) => {
                    const filtered = text.replace(/[^0-9]/g, "");
                    setPointureInput(filtered);
                    if (filtered !== "") {
                      setForm((f) => ({ ...f, pointure: parseInt(filtered) }));
                    }
                  }}
                  onBlur={() => {
                    if (pointureInput === "") {
                      setPointureInput(user.pointure.toString());
                      setForm((f) => ({ ...f, pointure: user.pointure }));
                    }
                  }}
                  keyboardType="numeric"
                  placeholder="Pointure"
                  placeholderTextColor="#aaa"
                />
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Main dominante</ThemedText>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity
                    style={[
                      styles.choiceButton,
                      form.main === "Gauche" && styles.choiceButtonSelected,
                    ]}
                    onPress={() => setForm((f) => ({ ...f, main: "Gauche" }))}
                  >
                    <ThemedText
                      style={[
                        styles.choiceButtonText,
                        form.main === "Gauche" &&
                          styles.choiceButtonTextSelected,
                      ]}
                    >
                      Gauche
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.choiceButton,
                      form.main === "Droite" && styles.choiceButtonSelected,
                    ]}
                    onPress={() => setForm((f) => ({ ...f, main: "Droite" }))}
                  >
                    <ThemedText
                      style={[
                        styles.choiceButtonText,
                        form.main === "Droite" &&
                          styles.choiceButtonTextSelected,
                      ]}
                    >
                      Droite
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Poids</ThemedText>
                <TextInput
                  style={styles.input}
                  value={poidsInput}
                  onChangeText={(text) => {
                    // Autorise chiffres, point, virgule
                    const filtered = text.replace(/[^0-9.,]/g, "");
                    setPoidsInput(filtered);
                    if (
                      filtered !== "" &&
                      filtered !== "." &&
                      filtered !== ","
                    ) {
                      setForm((f) => ({
                        ...f,
                        poids: parseFloat(filtered.replace(",", ".")),
                      }));
                    }
                  }}
                  onBlur={() => {
                    if (
                      poidsInput === "" ||
                      poidsInput === "." ||
                      poidsInput === ","
                    ) {
                      setPoidsInput(user.poids.toString());
                      setForm((f) => ({ ...f, poids: user.poids }));
                    }
                  }}
                  keyboardType="numeric"
                  placeholder="Poids"
                  placeholderTextColor="#aaa"
                />
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Taille</ThemedText>
                <TextInput
                  style={styles.input}
                  value={tailleInput}
                  onChangeText={(text) => {
                    const filtered = text.replace(/[^0-9]/g, "");
                    setTailleInput(filtered);
                    if (filtered !== "") {
                      setForm((f) => ({ ...f, taille: parseInt(filtered) }));
                    }
                  }}
                  onBlur={() => {
                    if (tailleInput === "") {
                      setTailleInput(user.taille.toString());
                      setForm((f) => ({ ...f, taille: user.taille }));
                    }
                  }}
                  keyboardType="numeric"
                  placeholder="Taille"
                  placeholderTextColor="#aaa"
                />
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Âge</ThemedText>
                <TextInput
                  style={styles.input}
                  value={ageInput}
                  onChangeText={(text) => {
                    const filtered = text.replace(/[^0-9]/g, "");
                    setAgeInput(filtered);
                    if (filtered !== "") {
                      setForm((f) => ({ ...f, age: parseInt(filtered) }));
                    }
                  }}
                  onBlur={() => {
                    if (ageInput === "") {
                      setAgeInput(user.age.toString());
                      setForm((f) => ({ ...f, age: user.age }));
                    }
                  }}
                  keyboardType="numeric"
                  placeholder="Âge"
                  placeholderTextColor="#aaa"
                />
              </View>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={handleSave}
              >
                <ThemedText style={styles.buttonText}>Enregistrer</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.logoutButton]}
                onPress={handleCancel}
              >
                <ThemedText style={styles.buttonText}>Annuler</ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ScreenLayout>
    );
  }

  // Affichage normal du profil
  return (
    <ScreenLayout title="Profil" headerRight={<HeaderRight />} theme={theme}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.profileImageContainer}>
          <Image
            source={getImageSource(user.imageName)}
            style={[styles.profileImage, { borderColor: theme.primary }]}
          />
          <View
            style={[
              styles.imageGlow,
              { backgroundColor: `${theme.primary}15` },
            ]}
          />
        </View>

        <ThemedText
          style={[
            styles.name,
            { color: theme.text, textShadowColor: `${theme.primary}50` },
          ]}
        >
          {user.prenom} {user.nom}
        </ThemedText>

        <View
          style={[
            styles.infoContainer,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <ThemedText style={[styles.infoLabel, { color: theme.text }]}>
              Pointure
            </ThemedText>
            <ThemedText style={[styles.infoValue, { color: theme.primary }]}>
              {user.pointure}
            </ThemedText>
          </View>
          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <ThemedText style={[styles.infoLabel, { color: theme.text }]}>
              Main dominante
            </ThemedText>
            <ThemedText style={[styles.infoValue, { color: theme.primary }]}>
              {user.main}
            </ThemedText>
          </View>
          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <ThemedText style={[styles.infoLabel, { color: theme.text }]}>
              Poids
            </ThemedText>
            <ThemedText style={[styles.infoValue, { color: theme.primary }]}>
              {user.poids} kg
            </ThemedText>
          </View>
          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <ThemedText style={[styles.infoLabel, { color: theme.text }]}>
              Taille
            </ThemedText>
            <ThemedText style={[styles.infoValue, { color: theme.primary }]}>
              {user.taille} cm
            </ThemedText>
          </View>
          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <ThemedText style={[styles.infoLabel, { color: theme.text }]}>
              Âge
            </ThemedText>
            <ThemedText style={[styles.infoValue, { color: theme.primary }]}>
              {user.age} ans
            </ThemedText>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.editButton,
              { backgroundColor: theme.primary },
            ]}
            onPress={editProfile}
          >
            <ThemedText style={styles.buttonText}>
              Modifier les informations
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.sensorButton,
              { backgroundColor: `${theme.primary}B0` },
            ]}
            onPress={connectSensor}
          >
            <ThemedText style={styles.buttonText}>
              Se connecter à un capteur
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.logoutButton,
              { backgroundColor: theme.surface, borderColor: "#e85555" },
            ]}
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
    backgroundColor: Platform.OS === "android" ? "#4a4a55" : "transparent",
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    // Supprimer borderWidth et borderColor sur Android
    ...(Platform.OS === "ios"
      ? {
          borderWidth: 4,
          borderColor: "#00b8b8",
          shadowColor: "#00d9d9",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
        }
      : {
          // Sur Android, utiliser une approche différente
          backgroundColor: "#00b8b8",
        }),
    elevation: 8,
  },
  imageGlow: {
    position: "absolute",
    // Ajuster pour Android
    top: Platform.OS === "android" ? -2 : -5,
    left: Platform.OS === "android" ? -2 : -5,
    right: Platform.OS === "android" ? -2 : -5,
    bottom: Platform.OS === "android" ? -2 : -5,
    borderRadius: Platform.OS === "android" ? 62 : 65,
    backgroundColor: "rgba(0, 217, 217, 0.15)",
    zIndex: -1,
  },
  name: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 24,
    color: "#f0f0f0",
    textShadowColor: "rgba(0, 230, 230, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    letterSpacing: 1,
  },
  infoContainer: {
    marginBottom: 32,
    width: "85%",
    // Fix Android background
    backgroundColor:
      Platform.OS === "android" ? "#5a5a65" : "rgba(255, 255, 255, 0.08)",
    borderRadius: 20,
    padding: 20,
    // Supprimer borderWidth et borderColor sur Android
    ...(Platform.OS === "ios"
      ? {
          borderWidth: 1,
          borderColor: "rgba(0, 217, 217, 0.25)",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
        }
      : {}),
    elevation: 6,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 217, 217, 0.15)",
  },
  infoLabel: {
    fontSize: 16,
    color: "#e8e8e8",
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 16,
    color: "#00d6d6",
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
    // Supprimer borderWidth sur Android
    ...(Platform.OS === "ios"
      ? {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
          borderWidth: 2,
        }
      : {}),
    elevation: 6,
    overflow: "hidden",
  },
  editButton: {
    backgroundColor: "#00b8b8",
    // Appliquer borderColor seulement sur iOS
    ...(Platform.OS === "ios" && {
      borderColor: "rgba(255, 255, 255, 0.25)",
    }),
  },
  sensorButton: {
    // Fix Android background
    backgroundColor:
      Platform.OS === "android" ? "#00a0a0" : "rgba(0, 184, 184, 0.7)",
    // Appliquer borderColor seulement sur iOS
    ...(Platform.OS === "ios" && {
      borderColor: "rgba(255, 255, 255, 0.18)",
    }),
  },
  logoutButton: {
    marginBottom: 10,
    // Fix Android background
    backgroundColor:
      Platform.OS === "android" ? "#5a5a65" : "rgba(255, 255, 255, 0.08)",
    // Appliquer borderColor seulement sur iOS
    ...(Platform.OS === "ios" && {
      borderColor: "rgba(232, 85, 85, 0.5)",
    }),
  },
  buttonText: {
    color: "#f0f0f0",
    fontWeight: "700",
    fontSize: 16,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
