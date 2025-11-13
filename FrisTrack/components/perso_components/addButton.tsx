import React from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { ThemedText } from "@/components/themed-text";
import MaterialIcons from "@expo/vector-icons/build/MaterialIcons";
import { Theme } from "@/contexts/ThemeContext";

interface AddButtonProps {
  onPress: () => void;
  text: string;
  theme?: Theme;
}

export const AddButton: React.FC<AddButtonProps> = ({
  onPress,
  text,
  theme,
}) => {
  const getStyles = () => {
    if (!theme) {
      // Styles par défaut si pas de thème
      return {
        addSection: {
          backgroundColor:
            Platform.OS === "android" ? "#4a4a55" : "transparent",
        },
        addButton: {
          backgroundColor: Platform.OS === "android" ? "#00a8a8" : "#00b8b8d0",
        },
      };
    }

    return {
      addSection: {
        backgroundColor:
          Platform.OS === "android" ? theme.background : "transparent",
      },
      addButton: {
        backgroundColor:
          Platform.OS === "android" ? theme.primary : `${theme.primary}d0`,
      },
    };
  };

  const dynamicStyles = getStyles();

  return (
    <View style={[styles.addSection, dynamicStyles.addSection]}>
      <TouchableOpacity
        style={[styles.addButton, dynamicStyles.addButton]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={text}
      >
        <View style={styles.iconContainer}>
          <MaterialIcons name="add" size={24} color="#ffffff" />
        </View>
        <ThemedText style={styles.addText}>{text}</ThemedText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  addSection: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 35,
    borderRadius: 30,
    gap: 12,
    ...(Platform.OS === "ios"
      ? {
          borderWidth: 2,
          borderColor: "rgba(255, 255, 255, 0.25)",
          shadowColor: "#00e6e6",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.35,
          shadowRadius: 14,
        }
      : {}),
    elevation: 8,
    minWidth: 200,
    justifyContent: "center",
    overflow: "hidden",
  },
  iconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 20,
    padding: 8,
    ...(Platform.OS === "ios" && {
      shadowColor: "#004d4d",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 5,
    }),
    elevation: 4,
    overflow: "hidden",
  },
  addText: {
    color: "#f5f5f5",
    fontSize: 18,
    fontWeight: "700",
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
});
