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
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import {
  router,
  useNavigation,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";

export default function AuthPage() {
  const { email, password } = useLocalSearchParams<{
    email: string;
    password: string;
  }>();
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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

  function handleSubmit() {
    setErrorMessage("");

    if (nom === "" || prenom === "" || pseudo === "") {
      setErrorMessage("Tous les champs sont obligatoires");
      return;
    }

    Alert.alert(
      "Suite inscription",
      `Création du nouvel utilisateur ${email} : ${prenom} - ${nom} (${pseudo}): `,
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4a4a55" />

      <ThemedText style={styles.title}>Créer un compte</ThemedText>

      <View style={styles.form}>
        <TextInput
          placeholder="Nom"
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          value={nom}
          onChangeText={(text) => {
            setNom(text);
            setErrorMessage(""); // Clear error when user types
          }}
          style={styles.input}
          autoCapitalize="words"
        />

        <TextInput
          placeholder="Prénom"
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          value={prenom}
          onChangeText={(text) => {
            setPrenom(text);
            setErrorMessage(""); // Clear error when user types
          }}
          style={styles.input}
          autoCapitalize="words"
        />

        <TextInput
          placeholder="Pseudo"
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          value={pseudo}
          onChangeText={(text) => {
            setPseudo(text);
            setErrorMessage(""); // Clear error when user types
          }}
          style={styles.input}
          autoCapitalize="none"
        />

        {errorMessage !== "" && (
          <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
        )}

        <TouchableOpacity onPress={handleSubmit} style={styles.button}>
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
    // Fix Android background
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
  input: {
    // Fix Android background
    backgroundColor:
      Platform.OS === "android" ? "#4a4a55" : "rgba(255, 255, 255, 0.12)",
    padding: 16,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "rgba(0, 217, 217, 0.35)",
    fontSize: 16,
    marginBottom: 15,
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
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 15,
    marginTop: -5,
    paddingHorizontal: 5,
    lineHeight: 16,
  },
  button: {
    // Fix Android background
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
  buttonText: {
    color: "#f5f5f5",
    fontSize: 18,
    fontWeight: "700",
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    // Fix Android background
    backgroundColor:
      Platform.OS === "android" ? "#5a5a65" : "rgba(255, 255, 255, 0.04)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(0, 217, 217, 0.15)",
    overflow: "hidden",
  },
  footerText: {
    fontSize: 14,
    color: "#e8e8e8",
    fontWeight: "600",
  },
  linkText: {
    fontSize: 14,
    color: "#00d6d6",
    marginLeft: 8,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
