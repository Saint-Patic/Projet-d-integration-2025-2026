import MaterialIcons from "@expo/vector-icons/build/MaterialIcons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { AddButton } from "@/components/perso_components/addButton";
import { ScreenLayout } from "@/components/perso_components/screenLayout";
import { SwipeableCard } from "@/components/perso_components/swipeableCard";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getPlayerCount, getTeamsByUser } from "@/services/getTeams";
import type { Team } from "@/types/user";

export default function TeamScreen() {
	const [playerTeams, setPlayerTeams] = useState<Team[]>([]);
	const [coachTeams, setCoachTeams] = useState<Team[]>([]);
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
			})
		);

		// Séparer les équipes selon le rôle
		const asPlayer = teamsWithCount.filter((team) => team.coach_id !== user.user_id);
		const asCoach = teamsWithCount.filter((team) => team.coach_id === user.user_id);

		setPlayerTeams(asPlayer);
		setCoachTeams(asCoach);
	}, [user]);

	useFocusEffect(
		useCallback(() => {
			fetchTeamsWithPlayerCount();
		}, [fetchTeamsWithPlayerCount])
	);

	const editTeam = (teamId: number) => {
		const allTeams = [...playerTeams, ...coachTeams];
		const team = allTeams.find((t) => t.id === teamId);
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
		const allTeams = [...playerTeams, ...coachTeams];
		const team = allTeams.find((t) => t.id === teamId);
		Alert.alert(
			"Supprimer l'équipe",
			`Êtes-vous sûr de vouloir supprimer l'équipe "${team?.team_name}" ?`,
			[
				{ text: "Annuler", style: "cancel" },
				{
					text: "Supprimer",
					style: "destructive",
					onPress: () => {
						setPlayerTeams(playerTeams.filter((t) => t.id !== teamId));
						setCoachTeams(coachTeams.filter((t) => t.id !== teamId));
					},
				},
			]
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
		const allTeams = [...playerTeams, ...coachTeams];
		const team = allTeams.find((t) => t.id === teamId);
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
		router.push("/(tabs)/teams/create-team");
	};

	const TeamCard = ({ team, isCoach }: { team: Team; isCoach: boolean }) => {
		return (
			<SwipeableCard
				title={"team"}
				cardId={team.id}
				borderTopColor={theme.primary}
				onEdit={() => editTeam(team.id)}
				onDelete={() => deleteTeam(team.id)}
				theme={theme}
			>
				<View style={styles.teamInfo}>
					<View style={styles.teamNameSection}>
						<View style={styles.teamHeader}>
							<ThemedText style={[styles.teamName, { color: theme.primary }]}>
								{team.team_name}
							</ThemedText>
							{isCoach && (
								<View style={[styles.coachBadge, { backgroundColor: theme.primary }]}>
									<MaterialIcons name="star" size={12} color="#fff" />
									<ThemedText style={styles.coachBadgeText}>Coach</ThemedText>
								</View>
							)}
						</View>
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
						style={[styles.actionButton, styles.primaryButton, { backgroundColor: theme.primary }]}
						onPress={() => viewTeamDetails(team.id, team.team_name)}
					>
						<ThemedText style={styles.primaryButtonText}>Voir détails</ThemedText>
					</TouchableOpacity>
					{isCoach && (
						<TouchableOpacity
							style={[
								styles.actionButton,
								styles.secondaryButton,
								{ backgroundColor: theme.surface, borderColor: theme.border },
							]}
							onPress={() => addPlayer(team.id)}
						>
							<ThemedText style={[styles.secondaryButtonText, { color: theme.primary }]}>
								+ Joueur
							</ThemedText>
						</TouchableOpacity>
					)}
				</View>
			</SwipeableCard>
		);
	};

	return (
		<ScreenLayout title="Gestion des Équipes" theme={theme}>
			<View style={[styles.teamsContainer, { backgroundColor: theme.background }]}>
				{/* Section Coach */}
				{coachTeams.length > 0 && (
					<View style={styles.section}>
						<View style={styles.sectionHeader}>
							<MaterialIcons name="star" size={20} color={theme.primary} />
							<ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
								Mes équipes (Coach)
							</ThemedText>
						</View>
						{coachTeams.map((team) => (
							<TeamCard key={`coach-${team.id}`} team={team} isCoach={true} />
						))}
					</View>
				)}

				{/* Section Joueur */}
				{playerTeams.length > 0 && (
					<View style={styles.section}>
						<View style={styles.sectionHeader}>
							<MaterialIcons name="people" size={20} color={theme.primary} />
							<ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
								Mes équipes (Joueur)
							</ThemedText>
						</View>
						{playerTeams.map((team) => (
							<TeamCard key={`player-${team.id}`} team={team} isCoach={false} />
						))}
					</View>
				)}

				{/* Message si aucune équipe */}
				{playerTeams.length === 0 && coachTeams.length === 0 && (
					<View style={styles.emptyState}>
						<MaterialIcons name="group-add" size={64} color={theme.textSecondary} />
						<ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
							Vous n&apos;avez pas encore d&apos;équipe
						</ThemedText>
						<ThemedText style={[styles.emptySubtext, { color: theme.textSecondary }]}>
							Créez votre première équipe ou rejoignez-en une
						</ThemedText>
					</View>
				)}
			</View>
			<AddButton onPress={createNewTeam} text="Nouvelle Équipe" theme={theme} />
		</ScreenLayout>
	);
}

const styles = StyleSheet.create({
	teamsContainer: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: 20,
	},
	section: {
		marginBottom: 32,
	},
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 16,
		paddingHorizontal: 4,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "700",
		letterSpacing: 0.5,
	},
	teamInfo: {
		marginBottom: 20,
	},
	teamNameSection: {
		alignItems: "flex-start",
	},
	teamHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 8,
		flexWrap: "wrap",
	},
	teamName: {
		fontSize: 18,
		fontWeight: "700",
		textShadowColor: "rgba(0, 217, 217, 0.25)",
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 3,
	},
	coachBadge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
	},
	coachBadgeText: {
		color: "#fff",
		fontSize: 11,
		fontWeight: "700",
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
	emptyState: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 60,
	},
	emptyText: {
		fontSize: 18,
		fontWeight: "600",
		marginTop: 16,
		textAlign: "center",
	},
	emptySubtext: {
		fontSize: 14,
		marginTop: 8,
		textAlign: "center",
		paddingHorizontal: 40,
	},
});
