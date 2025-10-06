import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface AddButtonProps {
  onPress: () => void;
  text: string;
}

export const AddButton: React.FC<AddButtonProps> = ({ onPress, text }) => {
  return (
    <View style={styles.addSection}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={text}
      >
        <View style={styles.iconContainer}>
          <IconSymbol name="plus" size={24} color="#ffffff" />
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
    backgroundColor: "#00b8b8d0", // Nuance plus douce du cyan
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 35,
    borderRadius: 30,
    gap: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.25)",
    shadowColor: "#00e6e6", // Ombre plus claire
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
    minWidth: 200,
    justifyContent: "center",
  },
  iconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.25)", // Plus opaque
    borderRadius: 20,
    padding: 8,
    shadowColor: "#004d4d", // Ombre plus foncée
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  addText: {
    color: "#f5f5f5", // Blanc cassé plus doux
    fontSize: 18,
    fontWeight: "700",
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
});
