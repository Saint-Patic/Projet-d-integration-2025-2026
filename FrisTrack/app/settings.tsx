import React, { useState, useEffect } from "react";
import { View, StyleSheet, Platform, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { ThemedText } from "@/components/themed-text";
import { ScreenLayout } from "@/components/screenLayout";
import { BackButton } from "@/components/BackButton";
import { useNavigation } from "expo-router";

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

  // Fonction pour obtenir les couleurs du thème
  const getThemeColors = () => {
    return {
      primary: selectedColor,
      background: isDarkMode ? "#4a4a55" : "#f5f5f5",
      surface: isDarkMode ? "#5a5a65" : "#ffffff",
      text: isDarkMode ? "#f0f0f0" : "#333333",
      textSecondary: isDarkMode ? "#a8a8a8" : "#666666",
      border: isDarkMode ? `${selectedColor}40` : `${selectedColor}30`,
    };
  };

  const theme = getThemeColors();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const selectColor = (color: string) => {
    setSelectedColor(color);
  };

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <ScreenLayout
      title="Paramètres"
      headerLeft={<BackButton theme={theme} />}
      theme={theme}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Theme Section */}
        <View
          style={[
            styles.sectionContainer,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
            Apparence
          </ThemedText>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons
                name={isDarkMode ? "moon" : "sunny"}
                size={24}
                color={selectedColor}
                style={styles.settingIcon}
              />
              <View>
                <ThemedText
                  style={[styles.settingLabel, { color: theme.text }]}
                >
                  Mode sombre
                </ThemedText>
                <ThemedText
                  style={[
                    styles.settingDescription,
                    { color: theme.textSecondary },
                  ]}
                >
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
        <View
          style={[
            styles.sectionContainer,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
            Couleur du thème
          </ThemedText>

          <View
            style={[
              styles.pickerContainer,
              {
                backgroundColor: isDarkMode ? "#6a6a75" : "#f0f0f0",
                borderColor: theme.border,
              },
            ]}
          >
            <Picker
              selectedValue={selectedColor}
              onValueChange={(itemValue) => selectColor(itemValue)}
              style={[styles.picker, { color: theme.text }]}
              dropdownIconColor={selectedColor}
              mode="dropdown"
              itemStyle={styles.pickerItem}
            >
              {themeColors.map((color, index) => (
                <Picker.Item
                  key={index}
                  label={color.label}
                  value={color.value}
                  color={isDarkMode ? "#fff" : "#000"}
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
            <ThemedText
              style={[styles.colorPreview, { color: theme.textSecondary }]}
            >
              Couleur actuelle: {selectedColor.toUpperCase()}
            </ThemedText>
          </View>
        </View>

        {/* About Section */}
        <View
          style={[
            styles.sectionContainer,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
            À propos
          </ThemedText>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons
                name="information-circle"
                size={24}
                color={selectedColor}
                style={styles.settingIcon}
              />
              <View>
                <ThemedText
                  style={[styles.settingLabel, { color: theme.text }]}
                >
                  Version
                </ThemedText>
                <ThemedText
                  style={[
                    styles.settingDescription,
                    { color: theme.textSecondary },
                  ]}
                >
                  1.0.0
                </ThemedText>
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
  },
  sectionContainer: {
    marginBottom: 32,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    ...(Platform.OS === "ios"
      ? {
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
    fontWeight: "600",
  },
  settingDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  pickerContainer: {
    borderRadius: 15,
    marginVertical: 10,
    borderWidth: 1,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    backgroundColor: "transparent",
  },
  pickerItem: {
    height: Platform.OS === "ios" ? 50 : undefined,
    fontSize: 16,
    textAlign: "center",
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
    fontStyle: "italic",
  },
});
