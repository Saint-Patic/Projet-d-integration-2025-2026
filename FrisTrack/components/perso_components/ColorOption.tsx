import React from "react";
import { TouchableOpacity, View, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/contexts/ThemeContext";

interface ColorOptionProps {
  color: { label: string; value: string };
  label: string;
  isSelected: boolean;
  onSelect: (color: string) => void;
}

export const ColorOption: React.FC<ColorOptionProps> = ({
  color,
  label,
  isSelected,
  onSelect,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.colorOption,
        {
          backgroundColor: isSelected ? theme.surface : theme.surface,
          borderColor: isSelected ? color.value : theme.border,
          borderWidth: isSelected ? 2 : 1,
        },
      ]}
      onPress={() => onSelect(color.value)}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      <View
        style={[
          styles.colorDot,
          { backgroundColor: color.value },
          isSelected && { borderColor: "#fff" },
        ]}
      />
      <ThemedText style={[styles.colorLabel, { color: theme.text }]}>
        {label}
      </ThemedText>
      {isSelected && (
        <Ionicons name="checkmark-circle" size={20} color={color.value} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  colorOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginVertical: 4,
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
