import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  Pressable,
  View,
  Alert,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ScreenLayout } from "@/components/perso_components/screenLayout";
import { useTheme } from "@/contexts/ThemeContext";
import { BackButton } from "@/components/perso_components/BackButton";
import ProfileView from "@/components/perso_components/ProfileView";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/userService";
import { authUtils } from "@/services/authUtils";
import {
  profilePictures,
  getProfileImage,
} from "@/components/perso_components/loadImages";

function filterNumericInput(text: string, type: "int" | "float"): string {
  let filtered = text.replace(type === "int" ? /[^0-9]/g : /[^0-9.,]/g, "");
  if (type === "float") filtered = filtered.replace(",", ".");
  return filtered;
}

function calculateAge(birthdate: string | undefined): number {
  if (!birthdate) return 0;

  const birth = new Date(birthdate);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  // Ajuster l'âge si l'anniversaire n'est pas encore passé cette année
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ProfilScreen() {
  const { theme } = useTheme();
  const { user: authUser, logout: authLogout, refreshUser } = useAuth();
  const { width } = useWindowDimensions();
  const isWide = width > 420;
  const [editMode, setEditMode] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  const [form, setForm] = useState({
    user_id: 0,
    lastname: "",
    firstname: "",
    pseudo: "",
    profile_picture: "default.png",
    foot_size: 0,
    dominant_hand: "right",
    user_weight: 0,
    user_height: 0,
    age: 0,
  });

  // Etats temporaires pour les champs numériques
  const [poidsInput, setPoidsInput] = useState("0");
  const [pointureInput, setPointureInput] = useState("0");
  const [tailleInput, setTailleInput] = useState("0");
  const [pseudoInput, setPseudoInput] = useState("0");

  // Validation states
  const [lastnameError, setLastnameError] = useState("");
  const [firstnameError, setFirstnameError] = useState("");
  const [pseudoError, setPseudoError] = useState("");
  const [pseudoAvailable, setPseudoAvailable] = useState<boolean | null>(null);
  const [checkingPseudo, setCheckingPseudo] = useState(false);
  const [originalPseudo, setOriginalPseudo] = useState("");

  // Pour la main dominante (ambidextre)
  const [mainSelection, setMainSelection] = useState({
    gauche: false,
    droite: true,
  });

  // Calculer les données utilisateur à partir de authUser
  const user = authUser
    ? {
        user_id: authUser.user_id,
        lastname: authUser.lastname,
        firstname: authUser.firstname,
        pseudo: authUser.pseudo,
        profile_picture: authUser.profile_picture || "default.png",
        foot_size: authUser.foot_size || 0,
        dominant_hand: authUser.dominant_hand || "right",
        user_weight: authUser.user_weight || 0,
        user_height: authUser.user_height || 0,
        age: calculateAge(authUser.birthdate),
      }
    : null;

  const connectSensor = () => {
    console.log("Connexion à un capteur");
  };

  const logout = async () => {
    await authLogout();
    await authUtils.clearAuth();
    router.replace("/");
  };

  // Validation functions
  const validateName = (text: string): boolean => {
    const nameRegex = /^[a-zA-ZÀ-ÿ\s\-]{2,}$/;
    return nameRegex.test(text);
  };

  const validatePseudo = (text: string): boolean => {
    const pseudoRegex = /^[a-zA-Z0-9_\-]{3,}$/;
    return pseudoRegex.test(text);
  };

  // Check pseudo availability
  useEffect(() => {
    const checkPseudoAvailability = async () => {
      // Vérifier que form.pseudo existe et n'est pas vide
      if (!form.pseudo || form.pseudo === originalPseudo) {
        setPseudoAvailable(true);
        setPseudoError("");
        return;
      }

      if (form.pseudo.length >= 3 && validatePseudo(form.pseudo)) {
        setCheckingPseudo(true);
        try {
          const response = await fetch(
            `${API_URL}/users/check-pseudo/${form.pseudo}`
          );
          const data = await response.json();
          setPseudoAvailable(data.available);

          if (!data.available) {
            setPseudoError("Ce pseudo est déjà pris");
          } else {
            setPseudoError("");
          }
        } catch (error) {
          console.error("Erreur vérification pseudo:", error);
        } finally {
          setCheckingPseudo(false);
        }
      }
    };

    const timer = setTimeout(() => {
      if (form.pseudo && form.pseudo.length >= 3) {
        checkPseudoAvailability();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [form.pseudo]);

  const handleFirstnameChange = (text: string) => {
    setForm({ ...form, firstname: text });

    if (text.length === 0) {
      setFirstnameError("");
    } else if (text.length < 2) {
      setFirstnameError("Minimum 2 caractères");
    } else if (!validateName(text)) {
      setFirstnameError("Lettres, espaces et tirets uniquement");
    } else {
      setFirstnameError("");
    }
  };

  const handleLastnameChange = (text: string) => {
    setForm({ ...form, lastname: text });

    if (text.length === 0) {
      setLastnameError("");
    } else if (text.length < 2) {
      setLastnameError("Minimum 2 caractères");
    } else if (!validateName(text)) {
      setLastnameError("Lettres, espaces et tirets uniquement");
    } else {
      setLastnameError("");
    }
  };

  const handlePseudoChange = (text: string) => {
    setForm({ ...form, pseudo: text });
    setPseudoAvailable(null);

    if (text.length === 0) {
      setPseudoError("");
    } else if (text.length < 3) {
      setPseudoError("Minimum 3 caractères");
    } else if (!validatePseudo(text)) {
      setPseudoError("Lettres, chiffres, tirets et underscores uniquement");
    } else {
      setPseudoError("");
    }
  };

  const getInputStyle = (error: string, available: boolean | null) => {
    if (error) {
      return [styles.input, styles.inputError];
    }
    if (available === true) {
      return [styles.input, styles.inputValid];
    }
    return styles.input;
  };

  const renderValidationIcon = (
    error: string,
    available: boolean | null,
    isLoading: boolean
  ) => {
    if (isLoading) {
      return (
        <ActivityIndicator
          size="small"
          color="#00d6d6"
          style={styles.validationIcon}
        />
      );
    }
    if (error) {
      return (
        <Ionicons
          name="close-circle"
          size={20}
          color="#ff4444"
          style={styles.validationIcon}
        />
      );
    }
    if (available === true) {
      return (
        <Ionicons
          name="checkmark-circle"
          size={20}
          color="#00ff88"
          style={styles.validationIcon}
        />
      );
    }
    return null;
  };

  const editProfile = () => {
    if (!user) return;

    setForm({
      ...user,
      pseudo: user.pseudo || "",
    });
    setOriginalPseudo(user.pseudo || "");
    setPoidsInput(user.user_weight.toString());
    setPointureInput(user.foot_size.toString());
    setPseudoInput(user.pseudo || "");
    setTailleInput(user.user_height.toString());
    setMainSelection(
      user.dominant_hand === "ambidextrous"
        ? { gauche: true, droite: true }
        : user.dominant_hand === "left"
        ? { gauche: true, droite: false }
        : { gauche: false, droite: true }
    );
    setEditMode(true);
    setShowImagePicker(false);
    setFirstnameError("");
    setLastnameError("");
    setPseudoError("");
    setPseudoAvailable(null);
  };

  const handleSave = async () => {
    if (!authUser) return;

    // Validation finale
    if (
      firstnameError ||
      lastnameError ||
      pseudoError ||
      pseudoAvailable === false
    ) {
      Alert.alert(
        "Erreur",
        "Veuillez corriger les erreurs avant de sauvegarder"
      );
      return;
    }

    try {
      let dominantHand = "right";
      if (mainSelection.gauche && mainSelection.droite)
        dominantHand = "ambidextrous";
      else if (mainSelection.gauche) dominantHand = "left";

      // Mise à jour du profil
      await userService.updateProfile({
        user_id: authUser.user_id,
        user_weight: form.user_weight,
        user_height: form.user_height,
        foot_size: form.foot_size,
        dominant_hand: dominantHand,
        profile_picture: form.profile_picture,
        pseudo: form.pseudo,
      });

      await userService.updateBasicInfo({
        user_id: authUser.user_id,
        firstname: form.firstname,
        lastname: form.lastname,
        birthdate: authUser.birthdate,
        email: authUser.email, // Conserver l'email existant
      });

      // Recharger les données utilisateur
      await refreshUser();

      setEditMode(false);
      setShowImagePicker(false);

      Alert.alert("Succès", "Profil mis à jour avec succès");
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Erreur", "Impossible de sauvegarder le profil");
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setShowImagePicker(false);
  };

  const HeaderRight = () => (
    <TouchableOpacity
      onPress={() => router.push("./profile/settings")}
      style={{ marginRight: 16 }}
    >
      <Ionicons name="settings-outline" size={24} color={theme.primary} />
    </TouchableOpacity>
  );

  const HeaderLeft = () => (
    <TouchableOpacity
      onPress={() => router.push("./profile/notifs")}
      style={{ marginRight: 16 }}
    >
      <Ionicons
        name={"file-tray-full-outline"}
        size={24}
        color={theme.primary}
      />
    </TouchableOpacity>
  );

  // Affichage de l'image en grand (overlay modal)
  if (showFullImage && user) {
    const { width } = Dimensions.get("window");
    return (
      <Pressable
        style={styles.fullImageOverlay}
        onPress={() => setShowFullImage(false)}
      >
        <BackButton
          onPress={() => setShowFullImage(false)}
          style={styles.fullImageBack}
          color="#fff"
        />
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowFullImage(false)}
        >
          <Image
            source={getProfileImage(user.profile_picture)}
            style={{
              width: width * 0.8,
              height: width * 0.8,
              borderRadius: width * 0.4,
              borderWidth: 4,
              borderColor: theme.primary,
              backgroundColor: "#222",
            }}
          />
        </TouchableOpacity>
      </Pressable>
    );
  }

  if (!user) {
    return (
      <ScreenLayout
        title="Mon profil"
        headerRight={<HeaderRight />}
        headerLeft={<HeaderLeft />}
        theme={theme}
      >
        <View
          style={[
            styles.container,
            {
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <ThemedText>Aucun utilisateur connecté</ThemedText>
          <TouchableOpacity
            onPress={() => router.replace("/")}
            style={[styles.actionButton, styles.editButton, { marginTop: 20 }]}
          >
            <ThemedText style={styles.buttonText}>Se connecter</ThemedText>
          </TouchableOpacity>
        </View>
      </ScreenLayout>
    );
  }

  // Maintenir le ScreenLayout dans tous les cas
  return (
    <ScreenLayout
      title="Mon profil"
      headerRight={<HeaderRight />}
      headerLeft={<HeaderLeft />}
      theme={theme}
    >
      {editMode ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={[
              styles.container,
              { backgroundColor: theme.background },
            ]}
          >
            {/* Photo de profil */}
            {showImagePicker ? (
              <View style={styles.imagePickerContainer}>
                <ThemedText
                  style={[styles.editPhotoText, { color: theme.primary }]}
                >
                  Choisissez une photo de profil
                </ThemedText>
                <View style={styles.imagePickerGrid}>
                  {profilePictures.map((img) => (
                    <TouchableOpacity
                      key={img.name}
                      onPress={() => {
                        setForm({ ...form, profile_picture: img.name });
                        setShowImagePicker(false);
                      }}
                    >
                      <Image
                        source={img.src}
                        style={[
                          styles.profileImageSmall,
                          { borderColor: theme.primary },
                        ]}
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
                    source={getProfileImage(form.profile_picture)}
                    style={[
                      styles.profileImage,
                      { borderColor: theme.primary },
                    ]}
                  />
                  <View style={styles.imageGlow} />
                </TouchableOpacity>
                <ThemedText
                  style={[styles.editPhotoText, { color: theme.primary }]}
                >
                  Cliquez sur la photo pour la changer
                </ThemedText>
              </View>
            )}

            {/* Formulaire d'édition */}
            <View style={styles.infoContainer}>
              {/* Prénom */}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.infoLabel}>Prénom</ThemedText>
                <TextInput
                  style={getInputStyle(firstnameError, null)}
                  value={form.firstname}
                  onChangeText={handleFirstnameChange}
                  placeholder="Prénom"
                  placeholderTextColor="#aaa"
                  autoCapitalize="words"
                />
                {form.firstname !== "" &&
                  renderValidationIcon(firstnameError, null, false)}
              </View>
              {firstnameError !== "" && (
                <ThemedText style={styles.fieldErrorText}>
                  {firstnameError}
                </ThemedText>
              )}

              {/* Nom */}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.infoLabel}>Nom</ThemedText>
                <TextInput
                  style={getInputStyle(lastnameError, null)}
                  value={form.lastname}
                  onChangeText={handleLastnameChange}
                  placeholder="Nom"
                  placeholderTextColor="#aaa"
                  autoCapitalize="words"
                />
                {form.lastname !== "" &&
                  renderValidationIcon(lastnameError, null, false)}
              </View>
              {lastnameError !== "" && (
                <ThemedText style={styles.fieldErrorText}>
                  {lastnameError}
                </ThemedText>
              )}

              {/* Pseudo */}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.infoLabel}>Pseudo</ThemedText>
                <TextInput
                  style={getInputStyle(pseudoError, pseudoAvailable)}
                  value={form.pseudo}
                  onChangeText={handlePseudoChange}
                  placeholder="Pseudo"
                  placeholderTextColor="#aaa"
                  autoCapitalize="none"
                />
                {form.pseudo !== "" &&
                  renderValidationIcon(
                    pseudoError,
                    pseudoAvailable,
                    checkingPseudo
                  )}
              </View>
              {pseudoError !== "" && (
                <ThemedText style={styles.fieldErrorText}>
                  {pseudoError}
                </ThemedText>
              )}
              {pseudoAvailable === true &&
                pseudoError === "" &&
                form.pseudo !== originalPseudo && (
                  <ThemedText style={styles.successText}>
                    Pseudo disponible ✓
                  </ThemedText>
                )}

              {/* Pointure */}
              <View
                style={[styles.infoRow, { borderBottomColor: theme.border }]}
              >
                <ThemedText style={styles.infoLabel}>Pointure</ThemedText>
                <TextInput
                  style={styles.input}
                  value={pointureInput}
                  onChangeText={(text) => {
                    const filtered = filterNumericInput(text, "int");
                    setPointureInput(filtered);
                    if (filtered !== "")
                      setForm({ ...form, foot_size: parseInt(filtered) });
                  }}
                  onBlur={() => {
                    let value = parseInt(pointureInput);
                    if (isNaN(value)) value = form.foot_size;
                    if (value < 15) value = 15;
                    if (value > 65) value = 65;
                    setPointureInput(value.toString());
                    setForm({ ...form, foot_size: value });
                  }}
                  keyboardType="numeric"
                  placeholder="Pointure"
                  placeholderTextColor="#aaa"
                />
              </View>

              {/* Main dominante */}
              <View
                style={[styles.infoRow, { borderBottomColor: theme.border }]}
              >
                <ThemedText style={styles.infoLabel}>Main dominante</ThemedText>
                <View
                  style={{
                    flexDirection: isWide ? "row" : "column",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <TouchableOpacity
                    style={[
                      styles.choiceButton,
                      mainSelection.gauche && styles.choiceButtonSelected,
                      isWide ? { marginHorizontal: 4 } : { marginVertical: 6 },
                    ]}
                    onPress={() => {
                      setMainSelection((sel) => {
                        const newSel = { ...sel, gauche: !sel.gauche };
                        if (!newSel.gauche && !newSel.droite)
                          newSel.gauche = true;
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
                      isWide ? { marginHorizontal: 4 } : { marginVertical: 6 },
                    ]}
                    onPress={() => {
                      setMainSelection((sel) => {
                        const newSel = { ...sel, droite: !sel.droite };
                        if (!newSel.gauche && !newSel.droite)
                          newSel.droite = true;
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
              </View>

              {/* Poids */}
              <View
                style={[styles.infoRow, { borderBottomColor: theme.border }]}
              >
                <ThemedText style={styles.infoLabel}>Poids (kg)</ThemedText>
                <TextInput
                  style={styles.input}
                  value={poidsInput}
                  onChangeText={(text) => {
                    const filtered = filterNumericInput(text, "float");
                    setPoidsInput(filtered);
                    if (filtered !== "" && filtered !== "." && filtered !== ",")
                      setForm({ ...form, user_weight: parseFloat(filtered) });
                  }}
                  onBlur={() => {
                    let value = parseFloat(poidsInput);
                    if (isNaN(value)) value = form.user_weight;
                    if (value < 10) value = 10;
                    if (value > 300) value = 300;
                    setPoidsInput(value.toString());
                    setForm({ ...form, user_weight: value });
                  }}
                  keyboardType="numeric"
                  placeholder="Poids"
                  placeholderTextColor="#aaa"
                />
              </View>

              {/* Taille */}
              <View
                style={[styles.infoRow, { borderBottomColor: theme.border }]}
              >
                <ThemedText style={styles.infoLabel}>Taille (cm)</ThemedText>
                <TextInput
                  style={styles.input}
                  value={tailleInput}
                  onChangeText={(text) => {
                    const filtered = filterNumericInput(text, "int");
                    setTailleInput(filtered);
                    if (filtered !== "")
                      setForm({ ...form, user_height: parseInt(filtered) });
                  }}
                  onBlur={() => {
                    let value = parseInt(tailleInput);
                    if (isNaN(value)) value = form.user_height;
                    if (value < 50) value = 50;
                    if (value > 250) value = 250;
                    setTailleInput(value.toString());
                    setForm({ ...form, user_height: value });
                  }}
                  keyboardType="numeric"
                  placeholder="Taille"
                  placeholderTextColor="#aaa"
                />
              </View>

              {/* Âge (lecture seule) */}
              <View
                style={[styles.infoRow, { borderBottomColor: "transparent" }]}
              >
                <ThemedText style={styles.infoLabel}>Âge</ThemedText>
                <ThemedText style={styles.infoValue}>{form.age} ans</ThemedText>
              </View>
            </View>

            {/* Boutons */}
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
      ) : (
        <ProfileView
          theme={theme}
          user={user}
          getImageSource={getProfileImage}
          connectSensor={connectSensor}
          logout={logout}
          editProfile={editProfile}
          HeaderRight={<HeaderRight />}
          HeaderLeft={<HeaderLeft />}
          styles={styles}
          onImagePress={() => setShowFullImage(true)}
          showActions={true}
        />
      )}
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
  fullImageOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  fullImageBack: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 101,
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
  inputContainer: {
    position: "relative",
    marginBottom: 5,
  },
  inputError: {
    borderColor: "#ff4444",
    borderWidth: 1,
  },
  inputValid: {
    borderColor: "#00ff88",
    borderWidth: 1,
  },
  validationIcon: {
    position: "absolute",
    right: 15,
    top: 18,
  },
  fieldErrorText: {
    color: "#ff4444",
    fontSize: 11,
    fontWeight: "500",
    marginBottom: 10,
    marginTop: 2,
    paddingHorizontal: 5,
    lineHeight: 14,
  },
  successText: {
    color: "#00ff88",
    fontSize: 11,
    fontWeight: "500",
    marginBottom: 10,
    marginTop: 2,
    paddingHorizontal: 5,
    lineHeight: 14,
  },
});
