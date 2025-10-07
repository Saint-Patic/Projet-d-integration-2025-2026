import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ScreenLayout } from "@/components/screenLayout";

export default function SettingsScreen() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedColor, setSelectedColor] = useState("#00d6d6");

  const themeColors = [
    { label: "Cyan (Défaut)", value: "#00d6d6" },
    { label: "Vert", value: "#4CAF50" },
    { label: "Orange", value: "#FF9800" },
    { label: "Violet", value: "#9C27B0" },
    { label: "Rouge", value: "#F44336" },
    { label: "Bleu", value: "#2196F3" },
    { label: "Orange foncé", value: "#FF5722" },
    { label: "Marron", value: "#795548" },
  ];

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    console.log("Mode sombre:", !isDarkMode);
  };

  const selectColor = (color: string) => {
    setSelectedColor(color);
    console.log("Couleur sélectionnée:", color);
  };

  const BackButton = () => (
    <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 16 }}>
      <Ionicons name="arrow-back" size={24} color="#00d6d6" />
    </TouchableOpacity>
  );

  return (
    <ScreenLayout title="Paramètres" headerLeft={<BackButton />}>
      <View style={styles.container}>
        {/* Theme Section */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>Apparence</ThemedText>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons
                name={isDarkMode ? "moon" : "sunny"}
                size={24}
                color={selectedColor}
                style={styles.settingIcon}
              />
              <View>
                <ThemedText style={styles.settingLabel}>Mode sombre</ThemedText>
                <ThemedText style={styles.settingDescription}>
                  {isDarkMode ? "Activé" : "Désactivé"}
                </ThemedText>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: "#767577", true: selectedColor }}
              thumbColor={isDarkMode ? "#f0f0f0" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Color Section */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>Couleur du thème</ThemedText>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedColor}
              onValueChange={(itemValue) => selectColor(itemValue)}
              style={styles.picker}
              dropdownIconColor={selectedColor}
            >
              {themeColors.map((color, index) => (
                <Picker.Item
                  key={index}
                  label={color.label}
                  value={color.value}
                  color={Platform.OS === "ios" ? "#000" : "#fff"}
                />
              ))}
            </Picker>
          </View>

          <View style={styles.colorPreviewContainer}>
            <View
              style={[
                styles.colorPreviewBox,
                { backgroundColor: selectedColor },
              ]}
            />
            <ThemedText style={styles.colorPreview}>
              Couleur actuelle: {selectedColor.toUpperCase()}
            </ThemedText>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>À propos</ThemedText>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons
                name="information-circle"
                size={24}
                color={selectedColor}
                style={styles.settingIcon}
              />
              <View>
                <ThemedText style={styles.settingLabel}>Version</ThemedText>
                <ThemedText style={styles.settingDescription}>1.0.0</ThemedText>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Platform.OS === "android" ? "#4a4a55" : "transparent",
  },
  sectionContainer: {
    marginBottom: 32,
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
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f0f0f0",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: "#e8e8e8",
    fontWeight: "600",
  },
  settingDescription: {
    fontSize: 14,
    color: "#a8a8a8",
    marginTop: 2,
  },
  pickerContainer: {
    backgroundColor:
      Platform.OS === "android" ? "#6a6a75" : "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 217, 217, 0.3)",
  },
  picker: {
    height: 50,
    color: Platform.OS === "android" ? "#fff" : "#000",
  },
  colorPreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  colorPreviewBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#fff",
  },
  colorPreview: {
    fontSize: 14,
    color: "#a8a8a8",
    fontStyle: "italic",
  },
});
