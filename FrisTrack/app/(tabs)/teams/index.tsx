import MaterialIcons from "@expo/vector-icons/build/MaterialIcons";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
	Alert,
	Platform,
	StyleSheet,
	TouchableOpacity,
	View,
} from "react-native";
import { AddButton } from "@/components/perso_components/addButton";
import { ScreenLayout } from "@/components/perso_components/screenLayout";
import { SwipeableCard } from "@/components/perso_components/swipeableCard";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getPlayerCount, getTeamsByUser } from "@/services/getTeams";
import type { Team } from "@/types/user";

export default function TeamScreen() {
	const [teams, setTeams] = useState<Team[]>([]);
	const router = useRouter();
	const { theme } = useTheme();
	const { user } = useAuth();

	const fetchTeamsWithPlayerCount = useCallback(async () => {
		if (!user?.user_id) return;

		const teamsData = await getTeamsByUser(user.user_id);

		const teamsWithCount = await Promise.all(
			teamsData.map(async (team) => {
				const playerCountData = await getPlayerCount(team.id);
				return {
					...team,
					playerCount: playerCountData?.playerCount ?? 0,
				};
			}),
		);
		setTeams(teamsWithCount);
	}, [user]);

	useFocusEffect(
		useCallback(() => {
			fetchTeamsWithPlayerCount();
		}, [fetchTeamsWithPlayerCount]),
	);

	const editTeam = (teamId: number) => {
		const team = teams.find((t) => t.id === teamId);
		if (team) {
			router.push({
				pathname: "/(tabs)/teams/[id]",
				params: {
					id: teamId.toString(),
					teamId: teamId.toString(),
					teamName: team.team_name,
					editMode: "true",
				},
			});
		}
	};

	const deleteTeam = (teamId: number) => {
		Alert.alert(
			"Supprimer l'équipe",
			`Êtes-vous sûr de vouloir supprimer l'équipe ${teamId} ?`,
			[
				{ text: "Annuler", style: "cancel" },
				{
					text: "Supprimer",
					style: "destructive",
					onPress: () => {
						setTeams(teams.filter((team) => team.id !== teamId));
					},
				},
			],
		);
	};

	const viewTeamDetails = (teamId: number, teamName: string) => {
		router.push({
			pathname: "/(tabs)/teams/[id]",
			params: {
				id: teamId.toString(),
				teamName,
			},
		});
	};

	const addPlayer = (teamId: number) => {
		const team = teams.find((t) => t.id === teamId);
		if (team) {
			router.push({
				pathname: "../teams/add-player",
				params: {
					teamId: teamId.toString(),
					teamName: team.team_name,
				},
			});
		}
	};

	const createNewTeam = () => {
		console.log("Création d'une nouvelle équipe");
	};

	const TeamCard = ({ team }: { team: Team }) => {
		return (
			<SwipeableCard
				title="Team"
				cardId={team.id}
				borderTopColor={theme.primary}
				onEdit={() => editTeam(team.id)}
				onDelete={() => deleteTeam(team.id)}
				theme={theme}
			>
				<View style={styles.teamInfo}>
					<View style={styles.teamNameSection}>
						<ThemedText style={[styles.teamName, { color: theme.primary }]}>
							{team.team_name}
						</ThemedText>
						<View
							style={[
								styles.playerCountContainer,
								{ backgroundColor: theme.surface, borderColor: theme.border },
							]}
						>
							<MaterialIcons name="person" size={16} color={theme.primary} />
							<ThemedText style={[styles.playerCount, { color: theme.text }]}>
								{team.playerCount || 0}
							</ThemedText>
						</View>
					</View>
				</View>

				<View style={styles.teamActions}>
					<TouchableOpacity
						style={[
							styles.actionButton,
							styles.primaryButton,
							{ backgroundColor: theme.primary },
						]}
						onPress={() => viewTeamDetails(team.id, team.team_name)}
					>
						<ThemedText style={styles.primaryButtonText}>
							Voir détails
						</ThemedText>
					</TouchableOpacity>
					<TouchableOpacity
						style={[
							styles.actionButton,
							styles.secondaryButton,
							{ backgroundColor: theme.surface, borderColor: theme.border },
						]}
						onPress={() => addPlayer(team.id)}
					>
						<ThemedText
							style={[styles.secondaryButtonText, { color: theme.primary }]}
						>
							+ Joueur
						</ThemedText>
					</TouchableOpacity>
				</View>
			</SwipeableCard>
		);
	};

	return (
		<ScreenLayout title="Gestion des Équipes" theme={theme}>
			<View
				style={[styles.teamsContainer, { backgroundColor: theme.background }]}
			>
				{teams.map((team) => (
					<TeamCard key={team.id} team={team} />
				))}
			</View>
			<AddButton onPress={createNewTeam} text="Nouvelle Équipe" theme={theme} />
		</ScreenLayout>
	);
}

const styles = StyleSheet.create({
	teamsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-around",
		paddingHorizontal: 20,
		paddingTop: 20,
		gap: 15,
	},
	teamInfo: {
		marginBottom: 20,
	},
	teamNameSection: {
		alignItems: "flex-start",
	},
	teamName: {
		fontSize: 18,
		fontWeight: "700",
		marginBottom: 8,
		textShadowColor: "rgba(0, 217, 217, 0.25)",
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 3,
	},
	playerCountContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 15,
		borderWidth: 1,
		overflow: "hidden",
	},
	playerCount: {
		fontSize: 16,
		fontWeight: "600",
	},
	teamActions: {
		flexDirection: "row",
		gap: 8,
	},
	actionButton: {
		flex: 1,
		paddingVertical: 14,
		paddingHorizontal: 12,
		borderRadius: 20,
		alignItems: "center",
		...(Platform.OS === "ios" && {
			shadowColor: "#000",
			shadowOffset: { width: 0, height: 3 },
			shadowOpacity: 0.15,
			shadowRadius: 8,
		}),
		elevation: 5,
		overflow: "hidden",
	},
	primaryButton: {
		borderWidth: 2,
		borderColor: "rgba(255, 255, 255, 0.18)",
	},
	primaryButtonText: {
		color: "#f0f0f0",
		fontWeight: "700",
		fontSize: 15,
		textShadowColor: "rgba(0, 0, 0, 0.4)",
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 3,
	},
	secondaryButton: {
		borderWidth: 2,
	},
	secondaryButtonText: {
		fontWeight: "700",
		fontSize: 15,
	},
});
