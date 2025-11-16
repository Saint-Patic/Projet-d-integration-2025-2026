import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  Pressable,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScreenLayout } from "@/components/perso_components/screenLayout";
import { useTheme } from "@/contexts/ThemeContext";
import { BackButton } from "@/components/perso_components/BackButton";
import EditProfile from "@/components/perso_components/EditProfile";
import ProfileView from "@/components/perso_components/ProfileView";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/userService";
import { authUtils } from "@/services/authUtils";

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

function filterNumericInput(text: string, type: "int" | "float"): string {
  let filtered = text.replace(type === "int" ? /[^0-9]/g : /[^0-9.,]/g, "");
  if (type === "float") filtered = filtered.replace(",", ".");
  return filtered;
}

export default function ProfilScreen() {
  const { theme } = useTheme();
  const { user: authUser, logout: authLogout } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [user, setUser] = useState({
    user_id: 0,
    lastname: "",
    firstname: "",
    profile_picture: "default.png",
    foot_size: 0,
    dominant_hand: "right",
    user_weight: 0,
    user_height: 0,
    age: 0,
  });
  const [form, setForm] = useState({ ...user });

  // Etats temporaires pour les champs numériques
  const [poidsInput, setPoidsInput] = useState(user.user_weight.toString());
  const [pointureInput, setPointureInput] = useState(user.foot_size.toString());
  const [tailleInput, setTailleInput] = useState(user.user_height.toString());
  const [ageInput, setAgeInput] = useState(user.age.toString());

  // Pour la main dominante (ambidextre)
  const [mainSelection, setMainSelection] = useState(
    user.dominant_hand === "ambidextrous"
      ? { gauche: true, droite: true }
      : user.dominant_hand === "left"
      ? { gauche: true, droite: false }
      : { gauche: false, droite: true }
  );

  useEffect(() => {
    loadUserProfile();
  }, [authUser]);

  const loadUserProfile = async () => {
    if (!authUser) {
      console.log("No authUser, skipping profile load");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log("Loading profile for user:", authUser.user_id);
      const userData = await userService.getUserById(authUser.user_id);

      const formattedUser = {
        user_id: userData.user_id,
        lastname: userData.lastname,
        firstname: userData.firstname,
        profile_picture: userData.profile_picture || "default.png",
        foot_size: userData.foot_size || 0,
        dominant_hand: userData.dominant_hand || "right",
        user_weight: userData.user_weight || 0,
        user_height: userData.user_height || 0,
        age: userData.birthdate
          ? new Date().getFullYear() -
            new Date(userData.birthdate).getFullYear()
          : 0,
      };

      setUser(formattedUser);
    } catch (error) {
      console.error("Error loading user profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectSensor = () => {
    console.log("Connexion à un capteur");
  };

  const logout = async () => {
    await authLogout();
    await authUtils.clearAuth();
    router.replace("/");
  };

  const editProfile = () => {
    setForm({ ...user });
    setPoidsInput(user.user_weight.toString());
    setPointureInput(user.foot_size.toString());
    setTailleInput(user.user_height.toString());
    setAgeInput(user.age.toString());
    setMainSelection(
      user.dominant_hand === "ambidextrous"
        ? { gauche: true, droite: true }
        : user.dominant_hand === "left"
        ? { gauche: true, droite: false }
        : { gauche: false, droite: true }
    );
    setEditMode(true);
    setShowImagePicker(false);
  };

  const handleSave = async () => {
    if (!authUser) return;

    try {
      let dominantHand = "right";
      if (mainSelection.gauche && mainSelection.droite)
        dominantHand = "ambidextrous";
      else if (mainSelection.gauche) dominantHand = "left";

      await userService.updateProfile({
        user_id: authUser.user_id,
        user_weight: form.user_weight,
        user_height: form.user_height,
        foot_size: form.foot_size,
        dominant_hand: dominantHand,
        profile_picture: form.profile_picture,
      });

      const newForm = { ...form, dominant_hand: dominantHand };
      setUser({ ...newForm });
      setEditMode(false);
      setShowImagePicker(false);

      // Recharger le profil
      await loadUserProfile();
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
  if (showFullImage) {
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
            source={getImageSource(user.profile_picture)}
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

  if (isLoading) {
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
          <ActivityIndicator size="large" color={theme.primary} />
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
        <EditProfile
          {...({
            theme,
            profilePictures,
            getImageSource,
            form,
            setForm,
            showImagePicker,
            setShowImagePicker,
            pointureInput,
            setPointureInput,
            poidsInput,
            setPoidsInput,
            tailleInput,
            setTailleInput,
            ageInput,
            setAgeInput,
            mainSelection,
            setMainSelection,
            filterNumericInput,
            handleSave,
            handleCancel,
            styles,
          } as any)}
        />
      ) : (
        <ProfileView
          theme={theme}
          user={user}
          getImageSource={getImageSource}
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
});
