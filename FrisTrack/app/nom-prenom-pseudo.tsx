import React, { useState, useEffect } from "react";
import {
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  StatusBar,
  View,
  BackHandler,
  ActivityIndicator,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import {
  router,
  useNavigation,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function AuthPage() {
  const { email, password } = useLocalSearchParams<{
    email: string;
    password: string;
  }>();
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Validation states
  const [nomError, setNomError] = useState("");
  const [prenomError, setPrenomError] = useState("");
  const [pseudoError, setPseudoError] = useState("");
  const [pseudoAvailable, setPseudoAvailable] = useState<boolean | null>(null);
  const [checkingPseudo, setCheckingPseudo] = useState(false);

  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
      gestureEnabled: false,
    });
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription?.remove();
    }, [])
  );

  // Regex validation
  const validateName = (text: string): boolean => {
    const nameRegex = /^[a-zA-ZÀ-ÿ\s\-]{2,}$/;
    return nameRegex.test(text);
  };

  const validatePseudo = (text: string): boolean => {
    const pseudoRegex = /^[a-zA-Z0-9_\-]{3,}$/;
    return pseudoRegex.test(text);
  };

  // Check pseudo availability with debounce
  useEffect(() => {
    if (pseudo.length >= 3 && validatePseudo(pseudo)) {
      setPseudoAvailable(true);
    } else {
      setPseudoAvailable(null);
    }
  }, [pseudo]);

  const handleNomChange = (text: string) => {
    setNom(text);
    setErrorMessage("");

    if (text.length === 0) {
      setNomError("");
    } else if (text.length < 2) {
      setNomError("Minimum 2 caractères");
    } else if (!validateName(text)) {
      setNomError("Lettres, espaces et tirets uniquement");
    } else {
      setNomError("");
    }
  };

  const handlePrenomChange = (text: string) => {
    setPrenom(text);
    setErrorMessage("");

    if (text.length === 0) {
      setPrenomError("");
    } else if (text.length < 2) {
      setPrenomError("Minimum 2 caractères");
    } else if (!validateName(text)) {
      setPrenomError("Lettres, espaces et tirets uniquement");
    } else {
      setPrenomError("");
    }
  };

  const handlePseudoChange = (text: string) => {
    setPseudo(text);
    setErrorMessage("");
    setPseudoAvailable(null);

    if (text.length === 0) {
      setPseudoError("");
    } else if (text.length < 3) {
      setPseudoError("Minimum 3 caractères");
    } else if (!validatePseudo(text)) {
      setPseudoError("Lettres, chiffres, tirets et underscores uniquement");
    } else {
      setPseudoError("");
    }
  };

  const isFormValid = () => {
    return (
      nom !== "" &&
      prenom !== "" &&
      pseudo !== "" &&
      nomError === "" &&
      prenomError === "" &&
      pseudoError === "" &&
      pseudoAvailable === true
    );
  };

  function handleSubmit() {
    setErrorMessage("");

    if (nom === "" || prenom === "" || pseudo === "") {
      setErrorMessage("Tous les champs sont obligatoires");
      return;
    }

    if (!isFormValid()) {
      setErrorMessage("Veuillez corriger les erreurs avant de continuer");
      return;
    }

    Alert.alert(
      "Suite inscription",
      `Création du nouvel utilisateur ${email} : ${prenom} - ${nom} (${pseudo})`,
      [
        {
          text: "OK",
          onPress: () =>
            router.replace({
              pathname: "./caract-form",
              params: { email, password, nom, prenom, pseudo },
            }),
        },
      ]
    );
  }

  const getInputStyle = (error: string, available: boolean | null) => {
    if (error) {
      return [styles.input, styles.inputError];
    }
    if (available === true) {
      return [styles.input, styles.inputValid];
    }
    return styles.input;
  };

  const renderValidationIcon = (
    error: string,
    available: boolean | null,
    isLoading: boolean
  ) => {
    if (isLoading) {
      return (
        <ActivityIndicator
          size="small"
          color="#00d6d6"
          style={styles.validationIcon}
        />
      );
    }
    if (error) {
      return (
        <Ionicons
          name="close-circle"
          size={20}
          color="#ff4444"
          style={styles.validationIcon}
        />
      );
    }
    if (available === true) {
      return (
        <Ionicons
          name="checkmark-circle"
          size={20}
          color="#00ff88"
          style={styles.validationIcon}
        />
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4a4a55" />

      <ThemedText style={styles.title}>Créer un compte</ThemedText>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Nom"
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            value={nom}
            onChangeText={handleNomChange}
            style={getInputStyle(nomError, null)}
            autoCapitalize="words"
          />
          {nom !== "" && renderValidationIcon(nomError, null, false)}
        </View>
        {nomError !== "" && (
          <ThemedText style={styles.fieldErrorText}>{nomError}</ThemedText>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Prénom"
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            value={prenom}
            onChangeText={handlePrenomChange}
            style={getInputStyle(prenomError, null)}
            autoCapitalize="words"
          />
          {prenom !== "" && renderValidationIcon(prenomError, null, false)}
        </View>
        {prenomError !== "" && (
          <ThemedText style={styles.fieldErrorText}>{prenomError}</ThemedText>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Pseudo"
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            value={pseudo}
            onChangeText={handlePseudoChange}
            style={getInputStyle(pseudoError, pseudoAvailable)}
            autoCapitalize="none"
          />
          {pseudo !== "" &&
            renderValidationIcon(pseudoError, pseudoAvailable, checkingPseudo)}
        </View>
        {pseudoError !== "" && (
          <ThemedText style={styles.fieldErrorText}>{pseudoError}</ThemedText>
        )}
        {pseudoAvailable === true && (
          <ThemedText style={styles.successText}>
            Pseudo disponible ✓
          </ThemedText>
        )}

        {errorMessage !== "" && (
          <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
        )}

        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.button, !isFormValid() && styles.buttonDisabled]}
          disabled={!isFormValid()}
        >
          <ThemedText style={styles.buttonText}>Suite</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#4a4a55",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    paddingTop: 20,
    marginBottom: 40,
    color: "#f0f0f0",
    letterSpacing: 1,
    textShadowColor: "rgba(0, 230, 230, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  form: {
    width: "100%",
    maxWidth: 400,
    backgroundColor:
      Platform.OS === "android" ? "#5a5a65" : "rgba(255, 255, 255, 0.08)",
    borderRadius: 20,
    padding: 25,
    borderWidth: 1,
    borderColor: "rgba(0, 217, 217, 0.25)",
    ...(Platform.OS === "ios" && {
      shadowColor: "#00b3b3",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 15,
    }),
    elevation: 8,
    overflow: "hidden",
  },
  inputContainer: {
    position: "relative",
    marginBottom: 5,
  },
  input: {
    backgroundColor:
      Platform.OS === "android" ? "#4a4a55" : "rgba(255, 255, 255, 0.12)",
    padding: 16,
    paddingRight: 45,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "rgba(0, 217, 217, 0.35)",
    fontSize: 16,
    color: "#f0f0f0",
    fontWeight: "600",
    ...(Platform.OS === "ios" && {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 5,
    }),
    elevation: 4,
    overflow: "hidden",
  },
  inputError: {
    borderColor: "#ff4444",
  },
  inputValid: {
    borderColor: "#00ff88",
  },
  validationIcon: {
    position: "absolute",
    right: 15,
    top: 18,
  },
  fieldErrorText: {
    color: "#ff4444",
    fontSize: 11,
    fontWeight: "500",
    marginBottom: 10,
    marginTop: 2,
    paddingHorizontal: 5,
    lineHeight: 14,
  },
  successText: {
    color: "#00ff88",
    fontSize: 11,
    fontWeight: "500",
    marginBottom: 10,
    marginTop: 2,
    paddingHorizontal: 5,
    lineHeight: 14,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 15,
    marginTop: 5,
    paddingHorizontal: 5,
    lineHeight: 16,
  },
  button: {
    backgroundColor: Platform.OS === "android" ? "#00a8a8" : "#00b8b8d0",
    padding: 18,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.25)",
    ...(Platform.OS === "ios" && {
      shadowColor: "#00e6e6",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 14,
    }),
    elevation: 8,
    overflow: "hidden",
  },
  buttonDisabled: {
    backgroundColor: "#666",
    opacity: 0.5,
  },
  buttonText: {
    color: "#f5f5f5",
    fontSize: 18,
    fontWeight: "700",
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
});
