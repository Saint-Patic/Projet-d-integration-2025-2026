import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useNavigation } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	FlatList,
	ScrollView,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { BackButton } from "@/components/perso_components/BackButton";
import { getProfileImage } from "@/components/perso_components/loadImages";
import { ScreenLayout } from "@/components/perso_components/screenLayout";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { createTeam, getAllUsers, type UserForSelection } from "@/services/teams";

type SelectionMode = "players" | null;

export default function CreateTeamScreen() {
	const { theme } = useTheme();
	const { user } = useAuth();
	const navigation = useNavigation();
	const [teamName, setTeamName] = useState("");
	const [confirmedPlayers, setConfirmedPlayers] = useState<UserForSelection[]>([]); // Joueurs confirmés
	const [tempSelectedPlayers, setTempSelectedPlayers] = useState<UserForSelection[]>([]); // Sélection temporaire pendant le modal
	const [availableUsers, setAvailableUsers] = useState<UserForSelection[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [showUserSelection, setShowUserSelection] = useState(false);
	const [selectionMode, setSelectionMode] = useState<SelectionMode>(null);

	useEffect(() => {
		navigation.setOptions({ headerShown: false });
	}, [navigation]);

	useEffect(() => {
		loadUsers();
	}, []);

	const loadUsers = async () => {
		try {
			setIsLoading(true);
			const users = await getAllUsers();
			setAvailableUsers(users);
		} catch (error) {
			console.error("Error loading users:", error);
			Alert.alert("Erreur", "Impossible de charger les utilisateurs");
		} finally {
			setIsLoading(false);
		}
	};

	const openPlayerSelection = () => {
		// Initialiser la sélection temporaire avec les joueurs déjà confirmés
		setTempSelectedPlayers([...confirmedPlayers]);
		setSelectionMode("players");
		setShowUserSelection(true);
	};

	const closeUserSelection = () => {
		// Annuler sans sauvegarder - réinitialiser la sélection temporaire
		setTempSelectedPlayers([]);
		setShowUserSelection(false);
		setSelectionMode(null);
	};

	const handleUserSelect = (userItem: UserForSelection) => {
		// Toggle selection dans la liste temporaire
		const isAlreadySelected = tempSelectedPlayers.some((p) => p.user_id === userItem.user_id);
		if (isAlreadySelected) {
			setTempSelectedPlayers(tempSelectedPlayers.filter((p) => p.user_id !== userItem.user_id));
		} else {
			setTempSelectedPlayers([...tempSelectedPlayers, userItem]);
		}
	};

	const confirmPlayerSelection = () => {
		// Confirmer la sélection - copier la sélection temporaire vers les confirmés
		setConfirmedPlayers([...tempSelectedPlayers]);
		setTempSelectedPlayers([]);
		setShowUserSelection(false);
		setSelectionMode(null);
	};

	const removePlayer = (userId: number) => {
		setConfirmedPlayers(confirmedPlayers.filter((p) => p.user_id !== userId));
	};

	const handleCreateTeam = async () => {
		// Validation
		if (!teamName.trim()) {
			Alert.alert("Erreur", "Veuillez entrer un nom d'équipe");
			return;
		}

		// Validation du nom (max 11 caractères)
		if (teamName.length > 11) {
			Alert.alert("Erreur", "Titre trop long (max 11 charactères)");
			return;
		}

		if (!user?.user_id) {
			Alert.alert("Erreur", "Utilisateur non connecté");
			return;
		}

		try {
			setIsLoading(true);

			const teamData = {
				team_name: teamName.trim(),
				coach_id: user.user_id,
				players: confirmedPlayers.map((p) => ({
					user_id: p.user_id,
					role_attack: "stack" as const,
					role_def: "zone" as const,
				})),
			};

			const result = await createTeam(teamData);

			Alert.alert("Succès", `L'équipe "${result.team_name}" a été créée avec succès`, [
				{
					text: "OK",
					onPress: () => router.back(),
				},
			]);
		} catch (error) {
			console.error("Error creating team:", error);
			Alert.alert("Erreur", "Impossible de créer l'équipe. Veuillez réessayer.");
		} finally {
			setIsLoading(false);
		}
	};

	if (showUserSelection) {
		return (
			<ScreenLayout
				title="Sélection"
				headerLeft={
					<TouchableOpacity onPress={closeUserSelection}>
						<Ionicons name="arrow-back" size={24} color={theme.primary} />
					</TouchableOpacity>
				}
				headerRight={
					<TouchableOpacity onPress={confirmPlayerSelection} style={{ marginRight: 16 }}>
						<Ionicons name="checkmark" size={24} color={theme.primary} />
					</TouchableOpacity>
				}
				theme={theme}
				disableScroll={true}
			>
				<FlatList
					data={availableUsers.filter(
						(u) => u.user_id !== user?.user_id // Exclure le coach (utilisateur actuel)
					)}
					renderItem={({ item }) => {
						const isSelected = tempSelectedPlayers.some((p) => p.user_id === item.user_id);

						return (
							<TouchableOpacity
								style={[
									styles.userCard,
									{
										backgroundColor: theme.surface,
										borderColor: isSelected ? theme.primary : theme.border,
										borderWidth: isSelected ? 2 : 1,
									},
								]}
								onPress={() => handleUserSelect(item)}
								activeOpacity={0.7}
							>
								<View style={styles.userInfo}>
									<Image
										source={getProfileImage(item.profile_picture)}
										style={[
											styles.userImage,
											{
												borderColor: isSelected ? theme.primary : theme.border,
											},
										]}
									/>
									<View style={styles.userDetails}>
										<ThemedText style={[styles.userName, { color: theme.text }]}>
											{item.name}
										</ThemedText>
										{item.pseudo && (
											<ThemedText style={[styles.userPseudo, { color: theme.textSecondary }]}>
												@{item.pseudo}
											</ThemedText>
										)}
										<ThemedText style={[styles.userType, { color: theme.textSecondary }]}>
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
					}}
					keyExtractor={(item) => item.user_id.toString()}
					contentContainerStyle={styles.listContainer}
				/>
			</ScreenLayout>
		);
	}

	return (
		<ScreenLayout title="Créer une équipe" headerLeft={<BackButton theme={theme} />} theme={theme}>
			<ScrollView
				style={[styles.container, { backgroundColor: theme.background }]}
				contentContainerStyle={styles.formContent}
			>
				{/* Nom de l'équipe */}
				<View style={styles.section}>
					<ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
						Nom de l&apos;équipe *
					</ThemedText>
					<TextInput
						style={[
							styles.input,
							{
								backgroundColor: theme.surface,
								color: theme.text,
								borderColor: theme.border,
							},
						]}
						placeholder="Entrez le nom de l'équipe"
						placeholderTextColor={theme.textSecondary}
						value={teamName}
						onChangeText={setTeamName}
					/>
				</View>

				{/* Coach (info) */}
				<View style={styles.section}>
					<ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Coach</ThemedText>
					<View
						style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
					>
						<View style={styles.userInfo}>
							<Image
								source={getProfileImage(user?.profile_picture)}
								style={[styles.userImage, { borderColor: theme.primary }]}
							/>
							<View style={styles.userDetails}>
								<ThemedText style={[styles.userName, { color: theme.text }]}>
									{user?.firstname} {user?.lastname}
								</ThemedText>
								{user?.pseudo && (
									<ThemedText style={[styles.userPseudo, { color: theme.textSecondary }]}>
										@{user.pseudo}
									</ThemedText>
								)}
								<ThemedText style={[styles.coachBadge, { color: theme.primary }]}>
									Vous êtes le coach
								</ThemedText>
							</View>
						</View>
					</View>
				</View>

				{/* Joueurs */}
				<View style={styles.section}>
					<ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
						Joueurs ({confirmedPlayers.length})
					</ThemedText>

					{confirmedPlayers.map((player) => (
						<View
							key={player.user_id}
							style={[
								styles.selectedCard,
								{ backgroundColor: theme.surface, borderColor: theme.border },
							]}
						>
							<View style={styles.userInfo}>
								<Image
									source={getProfileImage(player.profile_picture)}
									style={[styles.userImage, { borderColor: theme.border }]}
								/>
								<View style={styles.userDetails}>
									<ThemedText style={[styles.userName, { color: theme.text }]}>
										{player.name}
									</ThemedText>
									{player.pseudo && (
										<ThemedText style={[styles.userPseudo, { color: theme.textSecondary }]}>
											@{player.pseudo}
										</ThemedText>
									)}
								</View>
							</View>
							<TouchableOpacity onPress={() => removePlayer(player.user_id)}>
								<Ionicons name="close-circle" size={24} color="#e74c3c" />
							</TouchableOpacity>
						</View>
					))}

					<TouchableOpacity
						style={[
							styles.selectButton,
							{ backgroundColor: theme.surface, borderColor: theme.border },
						]}
						onPress={openPlayerSelection}
					>
						<Ionicons name="people" size={20} color={theme.primary} />
						<ThemedText style={[styles.selectButtonText, { color: theme.primary }]}>
							Ajouter des joueurs
						</ThemedText>
					</TouchableOpacity>
				</View>
			</ScrollView>

			{/* Bouton créer */}
			<TouchableOpacity
				style={[
					styles.createButton,
					{
						backgroundColor: theme.primary,
						opacity: isLoading ? 0.6 : 1,
					},
				]}
				onPress={handleCreateTeam}
				disabled={isLoading}
			>
				{isLoading ? (
					<ActivityIndicator size="small" color="#fff" />
				) : (
					<>
						<Ionicons name="add-circle" size={20} color="#fff" style={styles.buttonIcon} />
						<ThemedText style={styles.createButtonText}>Créer l&apos;équipe</ThemedText>
					</>
				)}
			</TouchableOpacity>
		</ScreenLayout>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
	},
	formContent: {
		paddingBottom: 100,
	},
	section: {
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: "700",
		marginBottom: 12,
	},
	input: {
		borderWidth: 1,
		borderRadius: 12,
		padding: 16,
		fontSize: 16,
	},
	infoCard: {
		padding: 12,
		borderRadius: 12,
		borderWidth: 1,
	},
	selectButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		padding: 16,
		borderRadius: 12,
		borderWidth: 1,
		borderStyle: "dashed",
	},
	selectButtonText: {
		marginLeft: 8,
		fontSize: 16,
		fontWeight: "600",
	},
	selectedCard: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 12,
		marginBottom: 12,
		borderRadius: 12,
		borderWidth: 1,
	},
	userCard: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 16,
		marginBottom: 12,
		borderRadius: 12,
		marginHorizontal: 20,
	},
	userInfo: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
	},
	userImage: {
		width: 50,
		height: 50,
		borderRadius: 25,
		marginRight: 12,
		borderWidth: 2,
	},
	userDetails: {
		flex: 1,
	},
	userName: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 2,
	},
	userPseudo: {
		fontSize: 14,
		marginBottom: 2,
	},
	userType: {
		fontSize: 12,
		fontStyle: "italic",
	},
	coachBadge: {
		fontSize: 12,
		fontWeight: "700",
		marginTop: 2,
	},
	checkbox: {
		width: 24,
		height: 24,
		borderRadius: 12,
		borderWidth: 2,
		alignItems: "center",
		justifyContent: "center",
	},
	listContainer: {
		paddingTop: 20,
		paddingBottom: 20,
	},
	createButton: {
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
	buttonIcon: {
		marginRight: 8,
	},
	createButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
});
