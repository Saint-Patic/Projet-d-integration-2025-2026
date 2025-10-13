import { Stack } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";

export default function ProfileLayout() {
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
          title: "Profil",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: "Paramètres",
          headerShown: false, // Car vous gérez déjà le header dans settings.tsx
        }}
      />
    </Stack>
  );
}
