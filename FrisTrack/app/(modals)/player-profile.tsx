import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  Pressable,
  ActivityIndicator,
  View,
} from "react-native";
import { Image } from "expo-image";
import { BackButton } from "@/components/perso_components/BackButton";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocalSearchParams, useNavigation, router } from "expo-router";
import ProfileView from "@/components/perso_components/ProfileView";
import { authService } from "@/services/getUserLogin";
import { getProfileImage } from "@/components/perso_components/loadImages";
import { ThemedText } from "@/components/themed-text";

export default function PlayerProfilScreen() {
  const { theme } = useTheme();
  const { playerId } = useLocalSearchParams();
  const currentPlayerId = playerId ? parseInt(playerId as string) : 1;
  const [showFullImage, setShowFullImage] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    loadUserData();
  }, [currentPlayerId]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      setError(false);
      const userData = await authService.getUserById(currentPlayerId);

      if (!userData) {
        console.error("User not found");
        setUser(null);
        setError(true);
        return;
      }

      const formattedUser = {
        id: userData.user_id,
        lastname: userData.lastname,
        firstname: userData.firstname,
        profile_picture: userData.profile_picture || "default.png",
        foot_size: userData.foot_size || 0,
        dominant_hand:
          userData.dominant_hand === "left"
            ? "Gauche"
            : userData.dominant_hand === "right"
            ? "Droite"
            : userData.dominant_hand === "ambidextrous"
            ? "Ambidextre"
            : "-",
        user_weight: userData.user_weight || 0,
        user_height: userData.user_height || 0,
        age: userData.birthdate
          ? new Date().getFullYear() -
            new Date(userData.birthdate).getFullYear()
          : 0,
      };
      setUser(formattedUser);
    } catch (error) {
      console.error("Error loading user data:", error);
      setUser(null);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", backgroundColor: theme.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error || !user) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", backgroundColor: theme.background },
        ]}
      >
        <BackButton
          theme={theme}
          style={{ position: "absolute", top: 40, left: 20 }}
        />
        <ThemedText
          style={{
            color: theme.text,
            fontSize: 18,
            textAlign: "center",
            paddingHorizontal: 32,
          }}
        >
          Utilisateur introuvable
        </ThemedText>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.errorButton,
            { backgroundColor: theme.primary, marginTop: 20 },
          ]}
        >
          <ThemedText style={{ color: "#fff", fontWeight: "600" }}>
            Retour
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

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
      getImageSource={getProfileImage}
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
  errorButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
});
