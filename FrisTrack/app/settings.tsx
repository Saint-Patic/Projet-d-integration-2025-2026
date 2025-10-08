import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Platform,
  Switch,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { ThemedText } from "@/components/themed-text";
import { ScreenLayout } from "@/components/screenLayout";
import { BackButton } from "@/components/BackButton";
import { useNavigation } from "expo-router";

export default function SettingsScreen() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedColor, setSelectedColor] = useState("#00d6d6");
  const [showColorPicker, setShowColorPicker] = useState(false);

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

  type ColorOptionProps = {
    color: { label: string; value: string };
    label: string;
    isSelected: boolean;
    onSelect: (colorValue: string) => void;
  };

  const ColorOption: React.FC<ColorOptionProps> = ({
    color,
    label,
    isSelected,
    onSelect,
  }) => (
    <TouchableOpacity
      style={[
        styles.colorOption,
        {
          backgroundColor: theme.surface,
          borderColor: isSelected ? color.value : theme.border,
          borderWidth: isSelected ? 2 : 1,
        },
      ]}
      onPress={() => onSelect(color.value)}
    >
      <View style={[styles.colorDot, { backgroundColor: color.value }]} />
      <ThemedText style={[styles.colorLabel, { color: theme.text }]}>
        {color.label}
      </ThemedText>
      {isSelected && (
        <Ionicons name="checkmark-circle" size={20} color={color.value} />
      )}
    </TouchableOpacity>
  );

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

          {/* Interface personnalisée pour iOS et Android */}
          <View style={styles.colorGrid}>
            {themeColors.map((color, index) => (
              <ColorOption
                key={index}
                color={color}
                label={color.label}
                isSelected={selectedColor === color.value}
                onSelect={selectColor}
              />
            ))}
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
  colorGrid: {
    gap: 12,
  },
  colorOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginVertical: 4,
    // Amélioration pour iOS
    ...(Platform.OS === "ios"
      ? {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        }
      : {}),
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: Platform.OS === "ios" ? 2 : 1,
    borderColor:
      Platform.OS === "ios"
        ? "rgba(255, 255, 255, 0.8)"
        : "rgba(255, 255, 255, 0.3)",
    // Ombre pour iOS pour mieux faire ressortir les couleurs
    ...(Platform.OS === "ios"
      ? {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.3,
          shadowRadius: 2,
        }
      : {}),
  },
  colorLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: Platform.OS === "ios" ? "600" : "500",
  },
});
