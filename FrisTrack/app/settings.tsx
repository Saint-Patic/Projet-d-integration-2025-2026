import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Platform,
  Switch,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { ScreenLayout } from "@/components/perso_components/screenLayout";
import { BackButton } from "@/components/perso_components/BackButton";
import { ColorOption } from "@/components/perso_components/ColorOption";
import { useNavigation } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";

export default function SettingsScreen() {
  const { theme, isDarkMode, selectedColor, setIsDarkMode, setSelectedColor } =
    useTheme();

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
