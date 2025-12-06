import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface BackButtonProps {
  color?: string;
  size?: number;
  style?: object;
  onPress?: () => void;
  theme?: {
    primary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
  };
  testID?: string;
  id?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  color,
  size = 24,
  style = {},
  onPress,
  theme,
  testID,
  id,
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  const buttonColor = color || theme?.primary || "#00d6d6";

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.defaultStyle, style]}
      testID={testID}
      {...(id ? { id } : {})}
    >
      <Ionicons name="arrow-back" size={size} color={buttonColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  defaultStyle: {
    marginLeft: 16,
  },
});
