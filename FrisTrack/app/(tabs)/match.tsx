import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { SwipeableCard } from "@/components/perso_components/swipeableCard";
import { ScreenLayout } from "@/components/perso_components/screenLayout";
import { AddButton } from "@/components/perso_components/addButton";
import { getMatches } from "@/services/getMatches";
import { startRecording, stopRecording, savePositions, getRecordingData } from "@/services/recordingService";
import { useTheme } from "@/contexts/ThemeContext";
import * as FileSystem from "expo-file-system";

interface Match {
  id: number;
  team1: string;
  team2: string;
  score1: number;
  score2: number;
  date: string;
  status: string;
  color: string;
  recording?: {
    isRecording: boolean;
    startTime?: number;
    endTime?: number;
    recordingData?: any[];
  };
}

export default function HomeScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentRecordingId, setCurrentRecordingId] = useState<number | null>(null);
  const [positionInterval, setPositionInterval] = useState<number | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    getMatches().then((data) => {
      setMatches(data);
    });
  }, []);

  const editMatch = (matchId: number) => {
    console.log(`Édition du match ${matchId}`);
  };

  const deleteMatch = (matchId: number) => {
    Alert.alert(
      "Supprimer le match",
      `Êtes-vous sûr de vouloir supprimer le match ${matchId} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            setMatches(matches.filter((match) => match.id !== matchId));
          },
        },
      ]
    );
  };

  const viewMatchDetails = (matchId: number) => {
    console.log(`Affichage des détails du match ${matchId}`);
  };

  const startMatch = (matchId: number) => {
    setMatches(matches.map(match => {
      if (match.id === matchId) {
        return {
          ...match,
          status: 'recording',
          recording: {
            isRecording: true,
            startTime: Date.now(),
            recordingData: []
          }
        };
      }
      return match;
    }));

    startRecordingMovement(matchId);
  };

  const stopMatch = async (matchId: number) => {
    setMatches(matches.map(match => {
      if (match.id === matchId) {
        return {
          ...match,
          status: 'finished',
          recording: {
            ...match.recording,
            isRecording: false,
            endTime: Date.now()
          }
        };
      }
      return match;
    }));

    await stopRecordingMovement(matchId);

    // ✅ Sauvegarde automatique du match terminé
    try {
      const data = await getRecordingData(matchId);
      const backupDir = `${FileSystem.documentDirectory}backups`;
      const filePath = `${backupDir}/match_${matchId}.json`;

      await FileSystem.makeDirectoryAsync(backupDir, { intermediates: true });
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(data));

      console.log("✅ Backup enregistré:", filePath);
    } catch (error) {
      console.error("❌ Erreur lors de la sauvegarde du match:", error);
    }
  };

  const startRecordingMovement = async (matchId: number) => {
    try {
      const recording = await startRecording(matchId);
      const recordingId = recording.id;
      setCurrentRecordingId(recordingId);

      const interval = setInterval(async () => {
        const testPositions = [{
          x: Math.random() * 100,
          y: Math.random() * 100,
          z: Math.random() * 10
        }];

        try {
          await savePositions(recordingId, testPositions);
        } catch (error) {
          console.error("Error saving positions:", error);
          clearInterval(interval);
          setPositionInterval(null);
        }
      }, 1000);

      setPositionInterval(interval);
    } catch (error) {
      console.error("Error starting recording:", error);
      Alert.alert("Error", "Failed to start recording");
    }
  };

  const stopRecordingMovement = async (matchId: number) => {
    try {
      if (currentRecordingId) {
        if (positionInterval) {
          clearInterval(positionInterval);
          setPositionInterval(null);
        }
        await stopRecording(matchId);
        setCurrentRecordingId(null);
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
      Alert.alert("Error", "Failed to stop recording");
    }
  };

  const createNewMatch = () => {
    console.log("Création d'un nouveau match");
  };

  const getTeamTextColor = (match: Match, isTeam1: boolean) => {
    if (match.status !== "finished") return theme.text;
    const team1Score = match.score1;
    const team2Score = match.score2;
    if (team1Score === team2Score) return theme.text;
    const isWinner = isTeam1 ? team1Score > team2Score : team2Score > team1Score;
    return isWinner ? "#00e6cc" : "#ff8080";
  };

  const MatchCard = ({ match }: { match: Match }) => (
    <SwipeableCard
      title="Match"
      cardId={match.id}
      borderTopColor={theme.primary}
      onEdit={() => editMatch(match.id)}
      onDelete={() => deleteMatch(match.id)}
      theme={theme}
      actions={[
        {
          text: match.recording?.isRecording ? "Stop" : "Start",
          onPress: () => match.recording?.isRecording ? stopMatch(match.id) : startMatch(match.id),
          color: match.recording?.isRecording ? "#ff4444" : "#44ff44"
        },
        {
          text: "Review",
          onPress: () => viewMatchDetails(match.id),
          color: "#4444ff",
          disabled: !match.recording || match.recording.isRecording
        }
      ]}
    >
      {/* ... contenu visuel inchangé ... */}
    </SwipeableCard>
  );

  return (
    <ScreenLayout title="Historique des Matchs" theme={theme}>
      <View style={[styles.matchesContainer, { backgroundColor: theme.background }]}>
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </View>
      <AddButton onPress={createNewMatch} text="Nouveau Match" theme={theme} />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  matchesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 15,
  },
});
