import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface BackButtonProps {
  color?: string;
  size?: number;
  style?: object;
  onPress?: () => void;
}

export const BackButton: React.FC<BackButtonProps> = ({
  color = "#00d6d6",
  size = 24,
  style = {},
  onPress,
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.defaultStyle, style]}
    >
      <Ionicons name="arrow-back" size={size} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  defaultStyle: {
    marginLeft: 16,
  },
});
