import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ScreenLayout } from "@/components/perso_components/screenLayout";
import { BackButton } from "@/components/perso_components/BackButton";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getTeams, getTeamsByUser } from "@/services/getTeams";
import { getLocalisation, type Localisation } from "@/services/getLocalisation";
import { createMatch } from "@/services/createMatch";
import type { Team } from "@/types/user";

export default function CreateMatchScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [opponentTeams, setOpponentTeams] = useState<Team[]>([]);
  const [Localisations, setLocalisations] = useState<Localisation[]>([]);
  const [selectedUserTeam, setSelectedUserTeam] = useState<number | null>(null);
  const [selectedOpponentTeam, setSelectedOpponentTeam] = useState<
    number | null
  >(null);
  const [selectedLocalisation, setSelectedLocalisation] =
    useState<Localisation | null>(null);
  const [matchTitle, setMatchTitle] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [matchTime, setMatchTime] = useState("");
  const [inOutdoor, setInOutdoor] = useState<"indoor" | "outdoor">("outdoor");

  // États pour les messages d'erreur
  const [userTeamError, setUserTeamError] = useState("");
  const [opponentTeamError, setOpponentTeamError] = useState("");
  const [localisationError, setLocalisationError] = useState("");
  const [titleError, setTitleError] = useState("");
  const [dateError, setDateError] = useState("");
  const [timeError, setTimeError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.user_id) return;

      try {
        const allMyTeams = await getTeamsByUser(user.user_id);
        const coachTeams = allMyTeams.filter(
          (team) => team.coach_id === user.user_id
        );
        setUserTeams(coachTeams);

        if (coachTeams.length === 0) {
          Alert.alert(
            "Information",
            "Vous devez être coach d'une équipe pour créer un match."
          );
        }

        const allTeams = await getTeams();
        const myTeamIds = allMyTeams.map((team) => team.id);
        const opponentTeamsList = allTeams.filter(
          (team) => !myTeamIds.includes(team.id)
        );
        setOpponentTeams(opponentTeamsList);

        const LocalisationsList = await getLocalisation();
        setLocalisations(LocalisationsList);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        Alert.alert("Erreur", "Impossible de charger les données");
      }
    };

    fetchData();
  }, [user]);

  const validateDate = (
    dateString: string
  ): { valid: boolean; message?: string } => {
    const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = dateString.match(dateRegex);

    if (!match) {
      return {
        valid: false,
        message: "Le format de la date doit être JJ/MM/AAAA",
      };
    }

    const [, day, month, year] = match;
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    if (monthNum < 1 || monthNum > 12) {
      return {
        valid: false,
        message: "Le mois doit être entre 1 et 12",
      };
    }

    if (dayNum < 1 || dayNum > 31) {
      return {
        valid: false,
        message: "Le jour doit être entre 1 et 31",
      };
    }

    const date = new Date(yearNum, monthNum - 1, dayNum);
    if (
      date.getDate() !== dayNum ||
      date.getMonth() !== monthNum - 1 ||
      date.getFullYear() !== yearNum
    ) {
      return {
        valid: false,
        message: "Cette date n'existe pas",
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
      return {
        valid: false,
        message: "La date ne peut pas être antérieure à aujourd'hui",
      };
    }

    const maxDate = new Date(today);
    maxDate.setFullYear(today.getFullYear() + 10);

    if (date > maxDate) {
      return {
        valid: false,
        message: "La date ne peut pas dépasser 10 ans dans le futur",
      };
    }

    return { valid: true };
  };

  const validateTime = (
    timeString: string
  ): { valid: boolean; message?: string } => {
    // Si l'heure est vide, c'est valide (optionnel)
    if (!timeString.trim()) {
      return { valid: true };
    }

    // Regex pour le format HH:MM
    const timeRegex = /^(\d{1,2}):(\d{2})$/;
    const match = timeString.match(timeRegex);

    if (!match) {
      return {
        valid: false,
        message: "Le format de l'heure doit être HH:MM",
      };
    }

    const [, hours, minutes] = match;
    const hoursNum = parseInt(hours, 10);
    const minutesNum = parseInt(minutes, 10);

    // Vérifier que les heures sont entre 0 et 23
    if (hoursNum < 0 || hoursNum > 23) {
      return {
        valid: false,
        message: "Les heures doivent être entre 0 et 23",
      };
    }

    // Vérifier que les minutes sont entre 0 et 59
    if (minutesNum < 0 || minutesNum > 59) {
      return {
        valid: false,
        message: "Les minutes doivent être entre 0 et 59",
      };
    }

    return { valid: true };
  };
  const handleCreateMatch = async () => {
    // Réinitialiser toutes les erreurs
    setUserTeamError("");
    setOpponentTeamError("");
    setLocalisationError("");
    setTitleError("");
    setDateError("");

    let hasError = false;

    // Validation
    if (!selectedUserTeam) {
      setUserTeamError("Veuillez sélectionner votre équipe");
      hasError = true;
    }
    if (!selectedOpponentTeam) {
      setOpponentTeamError("Veuillez sélectionner l'équipe adverse");
      hasError = true;
    }
    if (!selectedLocalisation) {
      setLocalisationError("Veuillez sélectionner un lieu");
      hasError = true;
    }
    if (!matchDate.trim()) {
      setDateError("Veuillez entrer une date");
      hasError = true;
    } else {
      // Valider le format et la validité de la date
      const dateValidation = validateDate(matchDate);
      if (!dateValidation.valid) {
        setDateError(dateValidation.message || "Date invalide");
        hasError = true;
      }
    }

    // Valider l'heure si elle est renseignée
    if (matchTime.trim()) {
      const timeValidation = validateTime(matchTime);
      if (!timeValidation.valid) {
        setTimeError(timeValidation.message || "Heure invalide");
        hasError = true;
      }
    }

    // Générer un titre si aucun titre n'a été saisi
    let finalTitle = matchTitle.trim();
    if (!finalTitle) {
      const userTeam = userTeams.find((t) => t.id === selectedUserTeam);
      const opponentTeam = opponentTeams.find(
        (t) => t.id === selectedOpponentTeam
      );
      if (userTeam && opponentTeam) {
        finalTitle = `${userTeam.team_name} vs ${opponentTeam.team_name}`;
      }
    }

    if (finalTitle.length > 26) {
      setTitleError("Titre de match trop long (max 26 caractères)");
      hasError = true;
    }

    if (hasError) {
      return;
    }
    if (!selectedUserTeam || !selectedOpponentTeam || !selectedLocalisation) {
      return; // Double vérification pour TypeScript
    }

    try {
      await createMatch({
        title: finalTitle,
        userTeamId: selectedUserTeam,
        opponentTeamId: selectedOpponentTeam,
        Localisation: selectedLocalisation,
        date: matchDate,
        time: matchTime,
        inOutdoor,
        label: "schedule",
      });

      Alert.alert("Succès", "Le match a été créé avec succès", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Erreur lors de la création du match:", error);
      Alert.alert("Erreur", "Impossible de créer le match");
    }
  };

  const TeamSelector = ({
    title,
    teams,
    selectedTeamId,
    onSelect,
    error,
  }: {
    title: string;
    teams: Team[];
    selectedTeamId: number | null;
    onSelect: (id: number) => void;
    error?: string;
  }) => (
    <View style={styles.sectionContainer}>
      <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
        {title}
      </ThemedText>
      <View style={styles.teamsGrid}>
        {teams.length === 0 ? (
          <ThemedText
            style={[styles.emptyText, { color: theme.textSecondary }]}
          >
            {title === "Votre équipe"
              ? "Vous devez être coach d'une équipe pour créer un match"
              : "Aucune équipe adverse disponible"}
          </ThemedText>
        ) : (
          teams.map((team) => (
            <TouchableOpacity
              key={team.id}
              style={[
                styles.teamCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: error
                    ? "#e74c3c"
                    : selectedTeamId === team.id
                    ? theme.primary
                    : theme.border,
                },
                selectedTeamId === team.id && styles.selectedTeamCard,
              ]}
              onPress={() => onSelect(team.id)}
            >
              <ThemedText
                style={[
                  styles.teamName,
                  {
                    color:
                      selectedTeamId === team.id ? theme.primary : theme.text,
                  },
                ]}
              >
                {team.team_name}
              </ThemedText>
              {selectedTeamId === team.id && (
                <ThemedText
                  style={[styles.checkmark, { color: theme.primary }]}
                >
                  ✓
                </ThemedText>
              )}
            </TouchableOpacity>
          ))
        )}
      </View>
      {error && (
        <ThemedText style={[styles.errorText, { color: "#e74c3c" }]}>
          {error}
        </ThemedText>
      )}
    </View>
  );

  const LocalisationSelector = () => (
    <View style={styles.sectionContainer}>
      <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
        Lieu
      </ThemedText>
      <View style={styles.teamsGrid}>
        {Localisations.length === 0 ? (
          <ThemedText
            style={[styles.emptyText, { color: theme.textSecondary }]}
          >
            Aucun lieu disponible
          </ThemedText>
        ) : (
          Localisations.map((Localisation, index) => (
            <TouchableOpacity
              key={`${Localisation.city}-${Localisation.postcode}-${index}`}
              style={[
                styles.teamCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: localisationError
                    ? "#e74c3c"
                    : selectedLocalisation === Localisation
                    ? theme.primary
                    : theme.border,
                },
                selectedLocalisation === Localisation &&
                  styles.selectedTeamCard,
              ]}
              onPress={() => setSelectedLocalisation(Localisation)}
            >
              <View style={{ flex: 1 }}>
                <ThemedText
                  style={[
                    styles.teamName,
                    {
                      color:
                        selectedLocalisation === Localisation
                          ? theme.primary
                          : theme.text,
                    },
                  ]}
                >
                  {Localisation.city}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.LocalisationDetails,
                    { color: theme.textSecondary },
                  ]}
                >
                  {Localisation.postcode} - {Localisation.country}
                </ThemedText>
              </View>
              {selectedLocalisation === Localisation && (
                <ThemedText
                  style={[styles.checkmark, { color: theme.primary }]}
                >
                  ✓
                </ThemedText>
              )}
            </TouchableOpacity>
          ))
        )}
      </View>
      {localisationError && (
        <ThemedText style={[styles.errorText, { color: "#e74c3c" }]}>
          {localisationError}
        </ThemedText>
      )}
    </View>
  );

  const IndoorOutdoorSelector = () => (
    <View style={styles.sectionContainer}>
      <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
        Type de terrain
      </ThemedText>
      <View style={styles.radioContainer}>
        <TouchableOpacity
          style={[
            styles.radioButton,
            {
              backgroundColor: theme.surface,
              borderColor:
                inOutdoor === "outdoor" ? theme.primary : theme.border,
            },
            inOutdoor === "outdoor" && styles.selectedRadio,
          ]}
          onPress={() => setInOutdoor("outdoor")}
        >
          <View
            style={[
              styles.radioCircle,
              {
                borderColor:
                  inOutdoor === "outdoor" ? theme.primary : theme.border,
              },
            ]}
          >
            {inOutdoor === "outdoor" && (
              <View
                style={[
                  styles.radioCircleSelected,
                  { backgroundColor: theme.primary },
                ]}
              />
            )}
          </View>
          <ThemedText
            style={[
              styles.radioText,
              {
                color: inOutdoor === "outdoor" ? theme.primary : theme.text,
              },
            ]}
          >
            Extérieur (Outdoor)
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.radioButton,
            {
              backgroundColor: theme.surface,
              borderColor:
                inOutdoor === "indoor" ? theme.primary : theme.border,
            },
            inOutdoor === "indoor" && styles.selectedRadio,
          ]}
          onPress={() => setInOutdoor("indoor")}
        >
          <View
            style={[
              styles.radioCircle,
              {
                borderColor:
                  inOutdoor === "indoor" ? theme.primary : theme.border,
              },
            ]}
          >
            {inOutdoor === "indoor" && (
              <View
                style={[
                  styles.radioCircleSelected,
                  { backgroundColor: theme.primary },
                ]}
              />
            )}
          </View>
          <ThemedText
            style={[
              styles.radioText,
              {
                color: inOutdoor === "indoor" ? theme.primary : theme.text,
              },
            ]}
          >
            Intérieur (Indoor)
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenLayout
      title="Détails du match"
      headerLeft={<BackButton theme={theme} />}
      theme={theme}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sélection de votre équipe */}
        <TeamSelector
          title="Votre équipe"
          teams={userTeams}
          selectedTeamId={selectedUserTeam}
          onSelect={setSelectedUserTeam}
          error={userTeamError}
        />

        {/* Sélection de l'équipe adverse */}
        <TeamSelector
          title="Équipe adverse"
          teams={opponentTeams}
          selectedTeamId={selectedOpponentTeam}
          onSelect={setSelectedOpponentTeam}
          error={opponentTeamError}
        />

        {/* Titre du match */}
        <View style={styles.sectionContainer}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
            Titre du match (optionnel)
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                borderColor: titleError ? "#e74c3c" : theme.border,
                color: theme.text,
              },
            ]}
            placeholder="Ex: EPHEC Ultimate vs LLN Wolf UCL1"
            placeholderTextColor={theme.textSecondary}
            value={matchTitle}
            onChangeText={setMatchTitle}
            multiline
          />
          {titleError && (
            <ThemedText style={[styles.errorText, { color: "#e74c3c" }]}>
              {titleError}
            </ThemedText>
          )}
          <ThemedText
            style={[styles.helperText, { color: theme.textSecondary }]}
          >
            Si vide, le titre sera généré automatiquement
          </ThemedText>
        </View>

        {/* Sélection du lieu */}
        <LocalisationSelector />

        {/* Indoor/Outdoor */}
        <IndoorOutdoorSelector />

        {/* Date */}
        <View style={styles.sectionContainer}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
            Date
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                borderColor: dateError ? "#e74c3c" : theme.border,
                color: theme.text,
              },
            ]}
            placeholder="JJ/MM/AAAA"
            placeholderTextColor={theme.textSecondary}
            value={matchDate}
            onChangeText={setMatchDate}
            maxLength={10}
          />
          {dateError && (
            <ThemedText style={[styles.errorText, { color: "#e74c3c" }]}>
              {dateError}
            </ThemedText>
          )}
          <ThemedText
            style={[styles.helperText, { color: theme.textSecondary }]}
          >
            Format: JJ/MM/AAAA (ex: 25/12/2025)
          </ThemedText>
        </View>

        {/* Heure (optionnel) */}
        <View style={styles.sectionContainer}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
            Heure (optionnel)
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                borderColor: timeError ? "#e74c3c" : theme.border,
                color: theme.text,
              },
            ]}
            placeholder="HH:MM"
            placeholderTextColor={theme.textSecondary}
            value={matchTime}
            onChangeText={setMatchTime}
            maxLength={5}
          />
          {timeError && (
            <ThemedText style={[styles.errorText, { color: "#e74c3c" }]}>
              {timeError}
            </ThemedText>
          )}
          <ThemedText
            style={[styles.helperText, { color: theme.textSecondary }]}
          >
            Format: HH:MM (ex: 14:30)
          </ThemedText>
        </View>

        {/* Bouton de création */}
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: theme.primary }]}
          onPress={handleCreateMatch}
        >
          <ThemedText style={styles.createButtonText}>
            Créer le match
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  teamsGrid: {
    gap: 10,
  },
  teamCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    ...(Platform.OS === "ios" && {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    }),
    elevation: 2,
  },
  selectedTeamCard: {
    borderWidth: 3,
  },
  teamName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  LocalisationDetails: {
    fontSize: 12,
    marginTop: 4,
  },
  checkmark: {
    fontSize: 20,
    fontWeight: "bold",
  },
  emptyText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 20,
  },
  input: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    marginTop: 6,
    fontStyle: "italic",
  },
  errorText: {
    fontSize: 13,
    marginTop: 6,
    fontWeight: "600",
  },
  radioContainer: {
    gap: 12,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    ...(Platform.OS === "ios" && {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    }),
    elevation: 2,
  },
  selectedRadio: {
    borderWidth: 3,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radioCircleSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  radioText: {
    fontSize: 16,
    fontWeight: "600",
  },
  createButton: {
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 10,
    ...(Platform.OS === "ios" && {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    }),
    elevation: 5,
  },
  createButtonText: {
    color: "#f0f0f0",
    fontSize: 18,
    fontWeight: "700",
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
