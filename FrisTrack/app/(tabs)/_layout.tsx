import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: "#fff",
				headerShown: false,
				tabBarButton: HapticTab,
				tabBarStyle: styles.tabBar,
			}}
		>
			<Tabs.Screen
				name="teams"
				options={{
					title: "Équipes",
					tabBarIcon: ({ color }) => <MaterialIcons name="groups" size={28} color={color} />,
				}}
			/>
			<Tabs.Screen
				name="matches"
				options={{
					title: "Matchs",
					tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profil",
					tabBarIcon: ({ color }) => <MaterialIcons name="person" size={28} color={color} />,
				}}
			/>
		</Tabs>
	);
}

const styles = {
	tabBar: {
		backgroundColor: Platform.OS === "android" ? "#4a4a57ff" : "rgba(0, 204, 255, 0.23)",
	},
};
