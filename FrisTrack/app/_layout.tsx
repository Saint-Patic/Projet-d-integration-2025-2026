import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import "react-native-reanimated";

import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
	anchor: "(tabs)",
};

export default function RootLayout() {
	const colorScheme = useColorScheme();

	return (
		<AuthProvider>
			<ThemeProvider>
				<GestureHandlerRootView style={styles.container}>
					<NavigationThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
						<Stack>
							<Stack.Screen
								name="index"
								options={{
									headerShown: false,
								}}
							/>
							<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
							<Stack.Screen
								name="(modals)/player-profile"
								options={{
									headerShown: false,
									presentation: "modal",
								}}
							/>
							<Stack.Screen
								name="+not-found"
								options={{
									title: "Page non trouvée",
									headerShown: false,
								}}
							/>
						</Stack>
					</NavigationThemeProvider>
				</GestureHandlerRootView>
			</ThemeProvider>
		</AuthProvider>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "rgba(255, 238, 0, 0.88)",
	},
});
