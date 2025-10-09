import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Platform, TextInput, KeyboardAvoidingView, ScrollView } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ScreenLayout } from "@/components/screenLayout";

// Liste manuelle des images du dossier profile_pictures
const profilePictures = [
  { name: "chat.png", src: require("@/assets/images/profile_pictures/chat.png") },
  { name: "chien.png", src: require("@/assets/images/profile_pictures/chien.png") },
  { name: "default.png", src: require("@/assets/images/profile_pictures/default.png") },
  { name: "Frisbee.png", src: require("@/assets/images/profile_pictures/Frisbee.png") },
  { name: "lezard.png", src: require("@/assets/images/profile_pictures/lezard.png") },
  { name: "nathan.png", src: require("@/assets/images/profile_pictures/nathan.png") },
];

function getImageSource(imageName: string) {
  const found = profilePictures.find((img) => img.name === imageName);
  return found ? found.src : profilePictures[0].src;
}

// Fonction de filtrage pour les champs numériques (pas de min/max ici)
function filterNumericInput(
  text: string,
  type: "int" | "float"
): string {
  let filtered = text.replace(type === "int" ? /[^0-9]/g : /[^0-9.,]/g, "");
  if (type === "float") filtered = filtered.replace(",", ".");
  return filtered;
}

export default function ProfilScreen() {
  const [editMode, setEditMode] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [user, setUser] = useState({
    id: 1,
    nom: "Lemaire",
    prenom: "Nathan",
    imageName: "nathan.png",
    pointure: 37,
    main: "Droite", // "Gauche", "Droite" ou "Ambidextre"
    poids: 52.5,
    taille: 157,
    age: 22,
  });
  const [form, setForm] = useState({ ...user });

  // Etats temporaires pour les champs numériques
  const [poidsInput, setPoidsInput] = useState(user.poids.toString());
  const [pointureInput, setPointureInput] = useState(user.pointure.toString());
  const [tailleInput, setTailleInput] = useState(user.taille.toString());
  const [ageInput, setAgeInput] = useState(user.age.toString());

  // Etat temporaire pour la sélection main (jamais envoyé au backend)
  const [mainSelection, setMainSelection] = useState(
    user.main === "Ambidextre"
      ? { gauche: true, droite: true }
      : user.main === "Gauche"
      ? { gauche: true, droite: false }
      : { gauche: false, droite: true }
  );

  const editProfile = () => {
    setForm({ ...user });
    setPoidsInput(user.poids.toString());
    setPointureInput(user.pointure.toString());
    setTailleInput(user.taille.toString());
    setAgeInput(user.age.toString());
    setMainSelection(
      user.main === "Ambidextre"
        ? { gauche: true, droite: true }
        : user.main === "Gauche"
        ? { gauche: true, droite: false }
        : { gauche: false, droite: true }
    );
    setEditMode(true);
    setShowImagePicker(false);
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

  const handleSave = () => {
    // Détermine la valeur à sauvegarder pour main
    let mainValue = "Droite";
    if (mainSelection.gauche && mainSelection.droite) mainValue = "Ambidextre";
    else if (mainSelection.gauche) mainValue = "Gauche";
    // else mainValue = "Droite" (défaut)
    const newForm = { ...form, main: mainValue };
    console.log("Enregistrer profil :", { ...newForm });
    setUser({ ...newForm });
    setEditMode(false);
    setShowImagePicker(false);
  };

  const handleCancel = () => {
    setEditMode(false);
    setShowImagePicker(false);
  };

  const HeaderRight = () => (
    <TouchableOpacity onPress={settings} style={{ marginRight: 16 }}>
      <Ionicons name="settings-outline" size={24} color="#00d6d6" />
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
                <ThemedText style={styles.editPhotoText}>Choisissez une photo de profil</ThemedText>
                <View style={styles.imagePickerGrid}>
                  {profilePictures.map((img, idx) => (
                    <TouchableOpacity
                      key={img.name}
                      onPress={() => {
                        setForm((f) => ({ ...f, imageName: img.name }));
                        setShowImagePicker(false);
                      }}
                    >
                      <Image source={img.src} style={styles.profileImageSmall} />
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity onPress={() => setShowImagePicker(false)} style={styles.cancelPickerButton}>
                  <ThemedText style={styles.cancelPickerText}>Annuler</ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.profileImageContainer}>
                <TouchableOpacity
                  onPress={() => setShowImagePicker(true)}
                  activeOpacity={0.7}
                >
                  <Image source={getImageSource(form.imageName)} style={styles.profileImage} />
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
                  onChangeText={(text) => setForm((f) => ({ ...f, prenom: text }))}
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
                    const filtered = filterNumericInput(text, "int");
                    setPointureInput(filtered);
                    if (filtered !== "") setForm((f) => ({ ...f, pointure: parseInt(filtered) }));
                  }}
                  onBlur={() => {
                    let value = parseInt(pointureInput);
                    if (isNaN(value)) value = user.pointure;
                    if (value < 15) value = 15;
                    if (value > 65) value = 65;
                    setPointureInput(value.toString());
                    setForm((f) => ({ ...f, pointure: value }));
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
                      mainSelection.gauche && styles.choiceButtonSelected,
                    ]}
                    onPress={() => {
                      setMainSelection((sel) => {
                        const newSel = { ...sel, gauche: !sel.gauche };
                        // Empêche tout décocher : au moins un reste sélectionné
                        if (!newSel.gauche && !newSel.droite) newSel.gauche = true;
                        return newSel;
                      });
                    }}
                  >
                    <ThemedText
                      style={[
                        styles.choiceButtonText,
                        mainSelection.gauche && styles.choiceButtonTextSelected,
                      ]}
                    >
                      Gauche
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.choiceButton,
                      mainSelection.droite && styles.choiceButtonSelected,
                    ]}
                    onPress={() => {
                      setMainSelection((sel) => {
                        const newSel = { ...sel, droite: !sel.droite };
                        if (!newSel.gauche && !newSel.droite) newSel.droite = true;
                        return newSel;
                      });
                    }}
                  >
                    <ThemedText
                      style={[
                        styles.choiceButtonText,
                        mainSelection.droite && styles.choiceButtonTextSelected,
                      ]}
                    >
                      Droite
                    </ThemedText>
                  </TouchableOpacity>
                </View>
                <ThemedText style={{ color: "#00b8b8", marginLeft: 8 }}>
                  {(mainSelection.gauche && mainSelection.droite)
                    ? "Ambidextre"
                    : mainSelection.gauche
                    ? "Gauche"
                    : "Droite"}
                </ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Poids</ThemedText>
                <TextInput
                  style={styles.input}
                  value={poidsInput}
                  onChangeText={(text) => {
                    const filtered = filterNumericInput(text, "float");
                    setPoidsInput(filtered);
                    if (filtered !== "" && filtered !== "." && filtered !== ",")
                      setForm((f) => ({ ...f, poids: parseFloat(filtered) }));
                  }}
                  onBlur={() => {
                    let value = parseFloat(poidsInput);
                    if (isNaN(value)) value = user.poids;
                    if (value < 10) value = 10;
                    if (value > 300) value = 300;
                    setPoidsInput(value.toString());
                    setForm((f) => ({ ...f, poids: value }));
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
                    const filtered = filterNumericInput(text, "int");
                    setTailleInput(filtered);
                    if (filtered !== "") setForm((f) => ({ ...f, taille: parseInt(filtered) }));
                  }}
                  onBlur={() => {
                    let value = parseInt(tailleInput);
                    if (isNaN(value)) value = user.taille;
                    if (value < 50) value = 50;
                    if (value > 250) value = 250;
                    setTailleInput(value.toString());
                    setForm((f) => ({ ...f, taille: value }));
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
                    const filtered = filterNumericInput(text, "int");
                    setAgeInput(filtered);
                    if (filtered !== "") setForm((f) => ({ ...f, age: parseInt(filtered) }));
                  }}
                  onBlur={() => {
                    let value = parseInt(ageInput);
                    if (isNaN(value)) value = user.age;
                    if (value < 1) value = 1;
                    if (value > 120) value = 120;
                    setAgeInput(value.toString());
                    setForm((f) => ({ ...f, age: value }));
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
    <ScreenLayout title="Profil" headerRight={<HeaderRight />}>
      <View style={styles.container}>
        <View style={styles.profileImageContainer}>
          <Image source={getImageSource(user.imageName)} style={styles.profileImage} />
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
            <ThemedText style={styles.infoValue}>
              {user.main}
            </ThemedText>
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
    alignItems: "center",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
          backgroundColor: "#fff",
        }),
    elevation: 8,
  },
  profileImageSmall: {
    width: 70,
    height: 70,
    borderRadius: 35,
    margin: 8,
    borderWidth: 2,
    borderColor: "#00b8b8",
  },
  imageGlow: {
    position: "absolute",
    top: Platform.OS === "android" ? -2 : -5,
    left: Platform.OS === "android" ? -2 : -5,
    right: Platform.OS === "android" ? -2 : -5,
    bottom: Platform.OS === "android" ? -2 : -5,
    borderRadius: Platform.OS === "android" ? 62 : 65,
    backgroundColor: "rgba(0, 217, 217, 0.15)",
    zIndex: -1,
  },
  imagePickerContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  imagePickerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 12,
  },
  cancelPickerButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: "#5a5a65",
  },
  cancelPickerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
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
  editPhotoText: {
    color: "#00b8b8",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  infoContainer: {
    marginBottom: 32,
    width: "85%",
    backgroundColor:
      Platform.OS === "android" ? "#5a5a65" : "rgba(255, 255, 255, 0.08)",
    borderRadius: 20,
    padding: 20,
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
    ...(Platform.OS === "ios" && {
      borderColor: "rgba(255, 255, 255, 0.25)",
    }),
  },
  sensorButton: {
    backgroundColor:
      Platform.OS === "android" ? "#00a0a0" : "rgba(0, 184, 184, 0.7)",
    ...(Platform.OS === "ios" && {
      borderColor: "rgba(255, 255, 255, 0.18)",
    }),
  },
  logoutButton: {
    marginBottom: 10,
    backgroundColor:
      Platform.OS === "android" ? "#5a5a65" : "rgba(255, 255, 255, 0.08)",
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
  input: {
    minWidth: 80,
    flex: 1,
    fontSize: 16,
    color: "#00d6d6",
    fontWeight: "700",
    backgroundColor: "rgba(0,0,0,0.08)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 8 : 4,
    marginLeft: 12,
  },
  choiceButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#444",
    marginHorizontal: 4,
  },
  choiceButtonSelected: {
    backgroundColor: "#00b8b8",
  },
  choiceButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  choiceButtonTextSelected: {
    color: "#fff",
  },
});
