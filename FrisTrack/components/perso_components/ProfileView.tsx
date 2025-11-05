import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "@/components/themed-text";

interface Props {
  theme: any;
  HeaderRight: React.ReactNode;
  HeaderLeft: React.ReactNode;
  user: any;
  getImageSource: (name: string) => any;
  connectSensor: () => void;
  logout: () => void;
  editProfile: () => void;
  styles: any;
  onImagePress?: () => void;
  showActions?: boolean;
}

export default function ProfileView(props: Props) {
  const {
    theme,
    user,
    getImageSource,
    connectSensor,
    logout,
    editProfile,
    styles,
    onImagePress,
    showActions = false, // false par défaut
  } = props;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.profileImageContainer}>
        <TouchableOpacity
          onPress={() => {
            if (onImagePress) onImagePress();
          }}
        >
          <Image
            source={getImageSource(user.imageName)}
            style={[styles.profileImage, { borderColor: theme.primary }]}
          />
        </TouchableOpacity>
        <View
          style={[styles.imageGlow, { backgroundColor: `${theme.primary}15` }]}
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

      {showActions && (
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
      )}
    </View>
  );
}
