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
        <IconSymbol name="plus" size={20} color="#ffffff" />
        <ThemedText style={styles.addText}>{text}</ThemedText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  addSection: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  addButton: {
    backgroundColor: "#27ae60",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    gap: 8,
  },
  addText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
