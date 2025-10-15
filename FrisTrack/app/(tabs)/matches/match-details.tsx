import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import { ThemedText } from "@/components/themed-text";
import { ScreenLayout } from "@/components/perso_components/screenLayout";
import { useLocalSearchParams, useNavigation, router } from "expo-router";
import { BackButton } from "@/components/perso_components/BackButton";
import { useTheme } from "@/contexts/ThemeContext";
import { getMatchById } from "@/services/getMatches";

export default function MatchDetailsScreen() {
  const params = useLocalSearchParams();
  const matchId = params.matchId ? parseInt(params.matchId as string, 10) : null;
  const navigation = useNavigation();
  const { theme } = useTheme();

  const [location, setLocation] = useState<any | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  // undefined = loading, null = not found, object = loaded
  const [match, setMatch] = useState<any | undefined>(undefined);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    if (matchId != null) {
      // start loading
      setMatch(undefined);
      getMatchById(matchId).then((m) => {
        // m can be an object or null
        setMatch(m ?? null);
      });
    } else {
      setMatch(null);
    }
  }, [matchId]);

  // Request permission and fetch current location
  useEffect(() => {
    let mounted = true;

    const fetchLocation = async () => {
      try {
        setLocLoading(true);
        setLocError(null);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!mounted) return;
        if (status !== "granted") {
          setLocError("Permission refusée");
          setLocLoading(false);
          return;
        }

        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
        if (!mounted) return;
        setLocation(pos);
      } catch (e: any) {
        setLocError(e?.message ?? "Erreur lors de la récupération de la position");
      } finally {
        if (mounted) setLocLoading(false);
      }
    };

    fetchLocation();

    return () => {
      mounted = false;
    };
  }, []);

  const handleBack = () => {
    router.back();
  };

  if (match === undefined) {
    return (
      <ScreenLayout title="Détails du match" headerLeft={<BackButton theme={theme} />} theme={theme}>
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <ThemedText style={[styles.loadingText, { color: theme.text }]}>Chargement...</ThemedText>
        </View>
      </ScreenLayout>
    );
  }

  if (match === null) {
    return (
      <ScreenLayout title="Détails du match" headerLeft={<BackButton theme={theme} />} theme={theme}>
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <ThemedText style={[styles.loadingText, { color: theme.text }]}>Match introuvable</ThemedText>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.primary }]}
            onPress={handleBack}
          >
            <ThemedText style={styles.backButtonText}>Retour</ThemedText>
          </TouchableOpacity>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title="Détails du match" headerLeft={<BackButton theme={theme} />} theme={theme}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.headerRow}>
          <ThemedText style={[styles.dateText, { color: theme.text }]}>Date: {match.date}</ThemedText>
        </View>

        <View style={styles.scoreRow}>
          <View style={[styles.scoreBox, { borderColor: theme.border }]}>
            <ThemedText style={[styles.scoreNumber, { color: theme.text }]}>{match.score1}</ThemedText>
            <ThemedText style={[styles.teamLabel, { color: theme.primary }]}>{match.team1}</ThemedText>
          </View>

          <View style={[styles.scoreBox, { borderColor: theme.border }]}>
            <ThemedText style={[styles.scoreNumber, { color: theme.text }]}>{match.score2}</ThemedText>
            <ThemedText style={[styles.teamLabel, { color: theme.primary }]}>{match.team2}</ThemedText>
          </View>
        </View>

        <View style={styles.metaRow}>
          <ThemedText style={[styles.metaText, { color: theme.text }]}>Statut: {match.status}</ThemedText>
          <ThemedText style={[styles.metaText, { color: theme.text }]}>Lieu: {match.venue === "indoor" ? "Intérieur" : "Extérieur"}</ThemedText>
        </View>

        {/* Phone location display on black background */}
        <View style={styles.locationWrapper}>
          <View style={styles.locationContainer}>
            {locLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : locError ? (
              <ThemedText style={[styles.locationText, { color: "#fff" }]}>Erreur: {locError}</ThemedText>
            ) : location ? (
              <>
                <ThemedText style={[styles.locationText, { color: "#fff" }]}>Latitude: {location.coords.latitude.toFixed(6)}</ThemedText>
                <ThemedText style={[styles.locationText, { color: "#fff" }]}>Longitude: {location.coords.longitude.toFixed(6)}</ThemedText>
              </>
            ) : (
              <ThemedText style={[styles.locationText, { color: "#fff" }]}>Position non disponible</ThemedText>
            )}
          </View>
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 24,
  },
  headerRow: {
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 6,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "600",
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  scoreBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 22,
    paddingHorizontal: 18,
    marginHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 110,
  },
  scoreNumber: {
    fontSize: 42,
    fontWeight: "900",
    lineHeight: 44,
  },
  teamLabel: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
  },
  metaRow: {
    marginBottom: 36,
  },
  metaText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  backButton: {
    alignSelf: "center",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 20,
    elevation: 6,
  },
  backButtonText: {
    color: "#f0f0f0",
    fontWeight: "700",
    fontSize: 16,
  },
  locationWrapper: {
    marginTop: 12,
    paddingHorizontal: 0,
  },
  locationContainer: {
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
});