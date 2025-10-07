import React, { useState } from "react";
import { TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const tint = useThemeColor({}, "tint");
  const linkColor = useThemeColor({}, "tint");

  function handleSubmit() {
    if (isLogin) {
      Alert.alert("Connexion", `Tentative de connexion avec ${email}`);
    } else {
      if (password !== confirmPassword) {
        Alert.alert("Erreur", "Les mots de passe ne correspondent pas !");
        return;
      }
      Alert.alert("Inscription", `Création d’un nouvel utilisateur : ${email}`);
    }
  }

  function toggleMode() {
    setIsLogin(!isLogin);
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        {isLogin ? "Connexion" : "Créer un compte"}
      </ThemedText>

      <ThemedView style={styles.form}>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Mot de passe"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />

        {!isLogin && (
          <TextInput
            placeholder="Confirmez le mot de passe"
            placeholderTextColor="#888"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
            secureTextEntry
          />
        )}

        <TouchableOpacity onPress={handleSubmit} style={[styles.button, { backgroundColor: tint }]}>
          <ThemedText style={styles.buttonText}>
            {isLogin ? "Se connecter" : "S’inscrire"}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.footer}>
        <ThemedText style={styles.footerText}>
          {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
        </ThemedText>
        <TouchableOpacity onPress={toggleMode}>
          <ThemedText style={[styles.linkText, { color: linkColor }]}>
            {isLogin ? "Créer un compte" : "Se connecter"}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  form: {
    width: "100%",
    maxWidth: 400,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#3498db",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: "#333",
  },
  linkText: {
    fontSize: 14,
    color: "#3498db",
    marginLeft: 5,
    textDecorationLine: "underline",
  },
});
