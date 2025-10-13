import { Link, Stack } from "expo-router";
import { StyleSheet, View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";

export default function NotFoundScreen() {
  const { theme } = useTheme();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Page introuvable",
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTintColor: theme.text,
        }}
      />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <MaterialIcons
          name="error-outline"
          size={80}
          color={theme.primary}
          style={styles.icon}
        />

        <Text style={[styles.title, { color: theme.text }]}>
          Oops ! Page introuvable
        </Text>

        <Text style={[styles.description, { color: theme.textSecondary }]}>
          La page que vous recherchez n&#39;existe pas ou a été déplacée.
        </Text>

        <Link
          href="./(tabs)/matches"
          style={[styles.button, { backgroundColor: theme.primary }]}
        >
          <Text style={styles.buttonText}>Retourner aux matchs</Text>
        </Link>

        <Link href="/" style={styles.secondaryButton}>
          <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>
            Aller à l&#39;accueil
          </Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  secondaryButton: {
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});
