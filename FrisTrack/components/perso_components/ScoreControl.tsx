import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

type Props = {
  teamLabel: string;
  score: string | number;
  onDelta: (delta: number) => void;
  disabled?: boolean;
};

export default function ScoreControl({
  teamLabel,
  score,
  onDelta,
  disabled = false,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={[styles.label, disabled && styles.labelDisabled]}>
        {teamLabel}
      </Text>
      <View style={styles.controls}>
        <Pressable
          style={[styles.button, disabled && styles.buttonDisabled]}
          onPress={() => !disabled && onDelta(-1)}
          disabled={disabled}
        >
          <Text
            style={[styles.buttonText, disabled && styles.buttonTextDisabled]}
          >
            -1
          </Text>
        </Pressable>
        <Text style={[styles.score, disabled && styles.scoreDisabled]}>
          {score}
        </Text>
        <Pressable
          style={[styles.button, disabled && styles.buttonDisabled]}
          onPress={() => !disabled && onDelta(+1)}
          disabled={disabled}
        >
          <Text
            style={[styles.buttonText, disabled && styles.buttonTextDisabled]}
          >
            +1
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", margin: 8 },
  label: { fontSize: 14, marginBottom: 6 },
  labelDisabled: { opacity: 0.5 },
  controls: { flexDirection: "row", alignItems: "center" },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonDisabled: {
    backgroundColor: "#999999",
    opacity: 0.6,
  },
  buttonText: { color: "#fff", fontSize: 16 },
  buttonTextDisabled: { opacity: 0.6 },
  score: {
    marginHorizontal: 1,
    fontSize: 18,
    minWidth: 34,
    textAlign: "center",
  },
  scoreDisabled: { opacity: 0.5 },
});
