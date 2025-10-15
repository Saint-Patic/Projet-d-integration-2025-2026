import { Stack } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";

export default function TeamsLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Équipes",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Détails de l'équipe",
          headerShown: true,
          headerBackTitle: "Retour",
        }}
      />
    </Stack>
  );
}
