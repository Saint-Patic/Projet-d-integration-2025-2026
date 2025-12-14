import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	FlatList,
	StyleSheet,
	TouchableOpacity,
	View,
} from "react-native";
import { BackButton } from "@/components/perso_components/BackButton";
import { getProfileImage } from "@/components/perso_components/loadImages";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/contexts/ThemeContext";
import { getTeamById, getTeamPlayers } from "@/services/getTeams";
import { addPlayerToTeam, getAllUsers, type UserForSelection } from "@/services/teams";

export default function AddPlayersScreen() {
	const { teamId, teamName } = useLocalSearchParams();
	const { theme } = useTheme();
	const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
	const [availableUsers, setAvailableUsers] = useState<UserForSelection[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [coachId, setCoachId] = useState<number | null>(null);

	useEffect(() => {
		loadAvailableUsers();
	}, []);

	const loadAvailableUsers = async () => {
		try {
			setIsLoading(true);

			// Récupérer les infos de l'équipe (pour avoir le coach_id)
			const team = await getTeamById(Number(teamId));
			if (team?.coach_id) {
				setCoachId(team.coach_id);
			}

			// Récupérer tous les utilisateurs
			const allUsers = await getAllUsers();

			// Récupérer les joueurs déjà dans l'équipe
			const currentPlayers = await getTeamPlayers(Number(teamId));
			const currentPlayerIds = currentPlayers.map((p) => p.user_id);

			// Filtrer : exclure le coach et les joueurs déjà dans l'équipe
			const available = allUsers.filter(
				(user) =>
					user.user_id !== team?.coach_id && // Exclure le coach
					!currentPlayerIds.includes(user.user_id) // Exclure les joueurs déjà dans l'équipe
			);

			setAvailableUsers(available);
		} catch (error) {
			console.error("Error loading available users:", error);
			Alert.alert("Erreur", "Impossible de charger les utilisateurs disponibles");
		} finally {
			setIsLoading(false);
		}
	};

	const togglePlayerSelection = (playerId: number) => {
		setSelectedPlayers((prev) =>
			prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId]
		);
	};

	const sendInvitations = async () => {
		if (selectedPlayers.length === 0) {
			Alert.alert(
				"Aucun joueur sélectionné",
				"Veuillez sélectionner au moins un joueur pour ajouter à l'équipe."
			);
			return;
		}

		try {
			setIsLoading(true);

			// Ajouter chaque joueur sélectionné à l'équipe
			for (const userId of selectedPlayers) {
				await addPlayerToTeam(Number(teamId), {
					user_id: userId,
					role_attack: "stack",
					role_def: "zone",
				});
			}

			Alert.alert(
				"Succès",
				`${selectedPlayers.length} joueur(s) ajouté(s) à l'équipe ${teamName}.`,
				[
					{
						text: "OK",
						onPress: () => router.back(),
					},
				]
			);
		} catch (error) {
			console.error("Error adding players:", error);
			Alert.alert("Erreur", "Impossible d'ajouter les joueurs à l'équipe");
		} finally {
			setIsLoading(false);
		}
	};

	const ListHeader = () => (
		<View style={styles.headerInfo}>
			<ThemedText style={[styles.teamName, { color: theme.primary }]}>{teamName}</ThemedText>
			<ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
				Sélectionnez les joueurs à ajouter dans votre équipe
			</ThemedText>
			{availableUsers.length === 0 && !isLoading && (
				<ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
					Tous les joueurs disponibles sont déjà dans l'équipe
				</ThemedText>
			)}
		</View>
	);

	const renderPlayer = ({ item }: { item: UserForSelection }) => {
		const isSelected = selectedPlayers.includes(item.user_id);

		return (
			<TouchableOpacity
				style={[
					styles.playerCard,
					{
						backgroundColor: theme.surface,
						borderColor: isSelected ? theme.primary : theme.border,
						borderWidth: isSelected ? 2 : 1,
					},
				]}
				onPress={() => togglePlayerSelection(item.user_id)}
				activeOpacity={0.7}
			>
				<View style={styles.playerInfo}>
					<Image
						source={getProfileImage(item.profile_picture)}
						style={[styles.playerImage, { borderColor: isSelected ? theme.primary : theme.border }]}
					/>
					<View style={styles.playerDetails}>
						<ThemedText style={[styles.playerName, { color: theme.text }]}>{item.name}</ThemedText>
						{item.pseudo && (
							<ThemedText style={[styles.playerPseudo, { color: theme.textSecondary }]}>
								@{item.pseudo}
							</ThemedText>
						)}
						<ThemedText style={[styles.playerType, { color: theme.textSecondary }]}>
							{item.user_type === "coach" ? "Coach" : "Joueur"}
						</ThemedText>
					</View>
				</View>

				<View
					style={[
						styles.checkbox,
						{
							backgroundColor: isSelected ? theme.primary : "transparent",
							borderColor: isSelected ? theme.primary : theme.border,
						},
					]}
				>
					{isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
				</View>
			</TouchableOpacity>
		);
	};

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			{/* Header fixe */}
			<View
				style={[
					styles.header,
					{
						backgroundColor: theme.background,
						borderBottomColor: theme.border,
					},
				]}
			>
				<View style={styles.headerContent}>
					<BackButton theme={theme} />
					<ThemedText style={[styles.headerTitle, { color: theme.text }]}>
						Ajouter des joueurs
					</ThemedText>
				</View>
			</View>

			{/* Loader */}
			{isLoading && availableUsers.length === 0 ? (
				<View style={styles.loaderContainer}>
					<ActivityIndicator size="large" color={theme.primary} />
					<ThemedText style={[styles.loadingText, { color: theme.textSecondary }]}>
						Chargement des joueurs...
					</ThemedText>
				</View>
			) : (
				<>
					{/* Liste avec FlatList uniquement */}
					<FlatList
						data={availableUsers}
						renderItem={renderPlayer}
						keyExtractor={(item) => item.user_id.toString()}
						ListHeaderComponent={ListHeader}
						showsVerticalScrollIndicator={false}
						contentContainerStyle={styles.listContainer}
					/>

					{/* Bouton d'ajout */}
					{availableUsers.length > 0 && (
						<TouchableOpacity
							onPress={sendInvitations}
							style={[
								styles.sendButton,
								{
									backgroundColor: selectedPlayers.length > 0 ? theme.primary : theme.textSecondary,
									opacity: selectedPlayers.length > 0 && !isLoading ? 1 : 0.6,
								},
							]}
							disabled={selectedPlayers.length === 0 || isLoading}
						>
							{isLoading ? (
								<ActivityIndicator size="small" color="#fff" />
							) : (
								<>
									<Ionicons name="add-circle" size={20} color="#fff" style={styles.sendIcon} />
									<ThemedText style={styles.sendButtonText}>
										Ajouter les joueurs ({selectedPlayers.length})
									</ThemedText>
								</>
							)}
						</TouchableOpacity>
					)}
				</>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		paddingTop: 40,
		paddingBottom: 16,
		borderBottomWidth: 1,
	},
	headerContent: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "bold",
		flex: 1,
		textAlign: "center",
		marginHorizontal: 16,
	},
	headerInfo: {
		padding: 20,
		alignItems: "center",
	},
	teamName: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		textAlign: "center",
		lineHeight: 22,
	},
	emptyText: {
		fontSize: 14,
		fontStyle: "italic",
		textAlign: "center",
		marginTop: 20,
	},
	listContainer: {
		paddingHorizontal: 20,
		paddingBottom: 95,
	},
	playerCard: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 16,
		marginBottom: 12,
		borderRadius: 12,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	playerInfo: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
	},
	playerImage: {
		width: 50,
		height: 50,
		borderRadius: 25,
		marginRight: 16,
		borderWidth: 2,
	},
	playerDetails: {
		flex: 1,
	},
	playerName: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 4,
	},
	playerPseudo: {
		fontSize: 14,
		marginBottom: 2,
	},
	playerType: {
		fontSize: 12,
		fontStyle: "italic",
	},
	checkbox: {
		width: 24,
		height: 24,
		borderRadius: 12,
		borderWidth: 2,
		alignItems: "center",
		justifyContent: "center",
	},
	loaderContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		marginTop: 12,
		fontSize: 16,
	},
	sendButton: {
		position: "absolute",
		bottom: 30,
		left: 20,
		right: 20,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 16,
		paddingHorizontal: 24,
		borderRadius: 25,
		elevation: 8,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
	},
	sendIcon: {
		marginRight: 8,
	},
	sendButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
		textAlign: "center",
	},
});
