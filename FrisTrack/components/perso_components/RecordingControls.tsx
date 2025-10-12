import React from 'react';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';

interface RecordingControlsProps {
  isRecording: boolean;
  onStartStop: () => void;
  onReview: () => void;
  disabled: boolean;
}

export const RecordingControls: React.FC<RecordingControlsProps> = ({
  isRecording,
  onStartStop,
  onReview,
  disabled
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[
          styles.button,
          { backgroundColor: isRecording ? "#ff4444" : "#44ff44" }
        ]}
        onPress={onStartStop}
      >
        <ThemedText style={styles.buttonText}>
          {isRecording ? "Stop" : "Start"} Recording
        </ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.button,
          { 
            backgroundColor: "#4444ff",
            opacity: disabled ? 0.5 : 1
          }
        ]}
        onPress={onReview}
        disabled={disabled}
      >
        <ThemedText style={styles.buttonText}>
          Review Match
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === "ios" && {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    }),
    elevation: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});