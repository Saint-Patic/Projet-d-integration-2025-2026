import { Stack } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";

export default function MatchesLayout() {
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
					title: "Matchs",
					headerShown: false,
				}}
			/>
		</Stack>
	);
}
