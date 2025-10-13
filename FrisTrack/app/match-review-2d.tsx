import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Svg, { Circle, Line } from "react-native-svg";
import { getRecordingData } from "@/services/recordingService";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/contexts/ThemeContext";
import * as FileSystem from "expo-file-system";

interface Position {
  id: number;
  recordingId: number;
  playerId?: number;
  timestamp: string;
  x: number;
  y: number;
  z: number;
}

const { width } = Dimensions.get("window");
const FIELD_ASPECT_RATIO = 2;
const FIELD_HEIGHT = width * 0.8;
const FIELD_WIDTH = FIELD_HEIGHT * FIELD_ASPECT_RATIO;

export default function MatchReview2D() {
  const { matchId } = useLocalSearchParams();
  const [positions, setPositions] = useState<Position[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const loadRecordingData = async () => {
      try {
        const filePath = `${FileSystem.documentDirectory}backups/match_${matchId}.json`;
        const fileInfo = await FileSystem.getInfoAsync(filePath);

        if (fileInfo.exists) {
          const json = await FileSystem.readAsStringAsync(filePath);
          setPositions(JSON.parse(json));
          console.log("✅ Backup local chargé");
        } else {
          const data = await getRecordingData(Number(matchId));
          setPositions(data);
          console.log("📡 Données serveur chargées");
        }
      } catch (error) {
        console.error("Erreur de chargement des données:", error);
      }
    };

    loadRecordingData();
  }, [matchId]);

  // Lecture automatique
  useEffect(() => {
    let animationFrame: number;
    if (isPlaying && positions.length > 0) {
      const animate = () => {
        setCurrentFrame((prev) => (prev + 1) % positions.length);
        animationFrame = requestAnimationFrame(animate);
      };
      animationFrame = requestAnimationFrame(animate);
    }
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isPlaying, positions.length]);

  const toSvgX = (x: number) => (x / 100) * FIELD_WIDTH;
  const toSvgY = (y: number) => (y / 100) * FIELD_HEIGHT;

  const currentPosition = positions[currentFrame];

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Match Review</ThemedText>

      <View style={styles.fieldContainer}>
        <Svg width={FIELD_WIDTH} height={FIELD_HEIGHT} style={styles.field}>
          <Line x1={0} y1={0} x2={FIELD_WIDTH} y2={0} stroke={theme.text} strokeWidth="2" />
          <Line x1={FIELD_WIDTH} y1={0} x2={FIELD_WIDTH} y2={FIELD_HEIGHT} stroke={theme.text} strokeWidth="2" />
          <Line x1={FIELD_WIDTH} y1={FIELD_HEIGHT} x2={0} y2={FIELD_HEIGHT} stroke={theme.text} strokeWidth="2" />
          <Line x1={0} y1={FIELD_HEIGHT} x2={0} y2={0} stroke={theme.text} strokeWidth="2" />
          <Line x1={FIELD_WIDTH / 2} y1={0} x2={FIELD_WIDTH / 2} y2={FIELD_HEIGHT} stroke={theme.text} strokeWidth="1" strokeDasharray="5,5" />

          {currentPosition && (
            <Circle cx={toSvgX(currentPosition.x)} cy={toSvgY(currentPosition.y)} r={5} fill={theme.primary} />
          )}
        </Svg>
      </View>

      {/* ✅ Contrôles complets */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={() => setCurrentFrame(f => Math.max(f - 10, 0))}>
          <ThemedText style={styles.buttonText}>-10s</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => setIsPlaying(!isPlaying)}>
          <ThemedText style={styles.buttonText}>{isPlaying ? "Pause" : "Play"}</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => setCurrentFrame(f => Math.min(f + 10, positions.length - 1))}>
          <ThemedText style={styles.buttonText}>+10s</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  fieldContainer: {
    width: FIELD_WIDTH,
    height: FIELD_HEIGHT,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "rgba(0, 200, 200, 0.1)",
  },
  field: { backgroundColor: "transparent" },
  controls: {
    flexDirection: "row",
    marginTop: 20,
    gap: 16,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#4444ff",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});
