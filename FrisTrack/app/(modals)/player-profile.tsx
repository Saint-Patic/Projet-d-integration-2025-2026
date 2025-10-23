import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  Pressable,
} from "react-native";
import { Image } from "expo-image";

import { BackButton } from "@/components/perso_components/BackButton";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import ProfileView from "@/components/perso_components/ProfileView";

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

const mockPlayers: {
  [key: string]: {
    id: number;
    nom: string;
    prenom: string;
    imageName: string;
    pointure: number;
    main: string;
    poids: number;
    taille: number;
    age: number;
  };
} = {
  1: {
    id: 1,
    nom: "Lemaire",
    prenom: "Nathan",
    imageName: "nathan.png",
    pointure: 37,
    main: "Droite",
    poids: 52.5,
    taille: 157,
    age: 22,
  },
  2: {
    id: 2,
    nom: "Bontems",
    prenom: "Antoine",
    imageName: "lezard.png",
    pointure: 42,
    main: "Gauche",
    poids: 75.0,
    taille: 178,
    age: 24,
  },
  3: {
    id: 3,
    nom: "Demarcq",
    prenom: "Alexis",
    imageName: "default.png",
    pointure: 40,
    main: "Ambidextre",
    poids: 68.5,
    taille: 172,
    age: 21,
  },
  4: {
    id: 4,
    nom: "Lamand",
    prenom: "Cyril",
    imageName: "chien.png",
    pointure: 44,
    main: "Droite",
    poids: 82.0,
    taille: 185,
    age: 26,
  },
  5: {
    id: 5,
    nom: "Wu",
    prenom: "Jiale",
    imageName: "chat.png",
    pointure: 38,
    main: "Gauche",
    poids: 58.0,
    taille: 162,
    age: 20,
  },
};

function getImageSource(imageName: string) {
  const found = profilePictures.find((img) => img.name === imageName);
  return found ? found.src : profilePictures[0].src;
}

export default function PlayerProfilScreen() {
  const { theme } = useTheme();
  const { playerId } = useLocalSearchParams();
  const currentPlayerId = playerId ? parseInt(playerId as string) : 1;
  const [showFullImage, setShowFullImage] = useState(false);

  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const getUserData = React.useCallback(() => {
    return mockPlayers[currentPlayerId] || mockPlayers[1];
  }, [currentPlayerId]);

  const [user, setUser] = useState(getUserData());
  useEffect(() => {
    setUser(getUserData());
  }, [getUserData]);

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
            source={getImageSource(user.imageName)}
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

  // handlers minimal pour affichage joueur (pas d'édition)
  const connectSensor = () => {
    console.log("Connexion capteur (player view)");
  };
  const logout = () => {
    console.log("Logout (player view)");
  };
  const editProfile = () => {
    /* no-op for player modal */
  };

  return (
    <ProfileView
      theme={theme}
      HeaderLeft={<BackButton theme={theme} />}
      HeaderRight={undefined}
      user={user}
      getImageSource={getImageSource}
      connectSensor={connectSensor}
      logout={logout}
      editProfile={editProfile}
      styles={styles}
      onImagePress={() => setShowFullImage(true)}
    />
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
});
