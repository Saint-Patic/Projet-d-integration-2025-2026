import { router, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Platform,
	StatusBar,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/getUserLogin";

export default function AuthPage() {
	const navigation = useNavigation();
	const { login } = useAuth();

	useEffect(() => {
		navigation.setOptions({
			gestureEnabled: false,
		});
	}, [navigation]);

	const [isLogin, setIsLogin] = useState(true);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	// Regex pour valider l'email
	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

	// Regex pour valider le mot de passe (min 15, au moins une minuscule, une majuscule, un caractère spécial)
	// La validation complète est implémentée dans `validateMdp` et `validateMdpLowercaseRule`.
	const passwordRegex = /^(?=.*[A-Z])(?=.*[@$!%*?&]).{15,}$/;
	//zone mdp (un commentaire pr commit)
	const passwordCriteria = [
		{
			key: "length",
			label: "Au moins 15 caractères",
			test: (pw: string) => pw.length >= 15,
		},
		{
			key: "upper",
			label: "Au moins 1 lettre majuscule",
			test: (pw: string) => /[A-Z]/.test(pw),
		},
		{
			key: "lower",
			label: "Au moins 1 lettre minuscule (ou premier/dernier caractère compté)",
			// test
			test: (pw: string) => validateMdpLowercaseRule(pw),
		},
		{
			key: "special",
			label: "Au moins 1 caractère spécial (@$!%*?&)",
			test: (pw: string) => /[@$!%*?&]/.test(pw),
		},
	];

	const allPassed = passwordCriteria.every((c) => c.test(password));

	function validateEmail(email: string): boolean {
		return emailRegex.test(email);
	}

	function validateMdp(mdp: string): boolean {
		// check du mdp sur le critère demander
		if (!passwordRegex.test(mdp)) return false;

		// vérifie si c'est bien minuscule début et fin du mdp
		if (!validateMdpLowercaseRule(mdp)) return false;

		return true;
	}

	function validateMdpLowercaseRule(mdp: string): boolean {
		// check de minuscule
		if (/[a-z]/.test(mdp)) return true;

		// refuser les maj et symbole spéciaux au début et fin du mdp, si y'en a ça compte comme min
		if (!mdp || mdp.length === 0) return false;
		const first = mdp.charAt(0);
		const last = mdp.charAt(mdp.length - 1);
		const isUpperOrSpecial = (ch: string) => /[A-Z@$!%*?&]/.test(ch);
		return !(isUpperOrSpecial(first) || isUpperOrSpecial(last));
	}

	async function handleLogin() {
		if (password === "" || email === "") {
			setErrorMessage("Email et/ou mot de passe non fourni");
			return;
		}

		if (!validateEmail(email)) {
			setErrorMessage("Veuillez entrer une adresse email valide");
			return;
		}

		setIsLoading(true);
		setErrorMessage("");

		try {
			await login({ email, password });
			router.replace("./(tabs)/matches");
		} catch (error: any) {
			console.error("Erreur de connexion:", error);

			if (error.response) {
				const status = error.response.status;
				const message = error.response.data?.error || "Erreur de connexion";

				if (status === 401) {
					// alert error
					setErrorMessage(message);
				} else if (status === 400) {
					setErrorMessage(message);
				} else {
					setErrorMessage("Une erreur est survenue. Veuillez réessayer.");
				}
			} else if (error.request) {
				setErrorMessage("Impossible de contacter le serveur. Vérifiez votre connexion.");
			} else {
				setErrorMessage("Une erreur est survenue. Veuillez réessayer.");
			}
		} finally {
			setIsLoading(false);
		}
	}

	async function handleRegister() {
		if (password === "" || email === "" || confirmPassword === "") {
			setErrorMessage("Tous les champs sont obligatoires");
			return;
		}

		if (!validateEmail(email)) {
			setErrorMessage("Veuillez entrer une adresse email valide");
			return;
		}

		if (!validateMdp(password)) {
			setErrorMessage(
				"Le mot de passe doit contenir au moins :\n• 10 caractères\n• 1 majuscule\n• 1 minuscule\n• 1 chiffre\n• 1 caractère spécial (@$!%*?&)"
			);
			return;
		}

		if (password !== confirmPassword) {
			setErrorMessage("Les mots de passe ne correspondent pas !");
			return;
		}

		// Vérification que l'email n'existe pas déjà
		setIsLoading(true);
		setErrorMessage("");

		try {
			// Appel API pour vérifier si l'email existe
			const response = await authService.checkEmail(email);

			if (response.exists) {
				setErrorMessage("Cette adresse email est déjà utilisée");
				setIsLoading(false);
				return;
			}

			// Si l'email n'existe pas, continuer vers la page suivante
			setIsLoading(false);
			router.replace({
				pathname: "./nom-prenom-pseudo",
				params: { email, password },
			});
		} catch (error: any) {
			console.error("Erreur vérification email:", error);

			if (error.response?.status === 409) {
				setErrorMessage("Cette adresse email est déjà utilisée");
			} else {
				setErrorMessage("Impossible de vérifier l'email. Veuillez réessayer.");
			}
			setIsLoading(false);
		}
	}

	function handleSubmit() {
		if (isLogin) {
			handleLogin();
		} else {
			handleRegister();
		}
	}

	function toggleMode() {
		setIsLogin(!isLogin);
		setErrorMessage("");
		setConfirmPassword("");
	}

	return (
		<View style={styles.container}>
			<StatusBar barStyle="light-content" backgroundColor="#4a4a55" />

			<ThemedText style={styles.title}>{isLogin ? "Connexion" : "Créer un compte"}</ThemedText>

			<View style={styles.form}>
				<TextInput
					placeholder="Email"
					placeholderTextColor="rgba(255, 255, 255, 0.6)"
					value={email}
					onChangeText={(text) => {
						setEmail(text);
						setErrorMessage("");
					}}
					style={styles.input}
					keyboardType="email-address"
					autoCapitalize="none"
					editable={!isLoading}
				/>

				<TextInput
					placeholder="Mot de passe"
					placeholderTextColor="rgba(255, 255, 255, 0.6)"
					value={password}
					onChangeText={(text) => {
						setPassword(text);
						setErrorMessage("");
					}}
					style={styles.input}
					secureTextEntry
					editable={!isLoading}
					// refuser le copier coller du mdp
					contextMenuHidden={true}
				/>

				{!isLogin && (
					<TextInput
						placeholder="Confirmer le mot de passe"
						placeholderTextColor="rgba(255, 255, 255, 0.6)"
						value={confirmPassword}
						onChangeText={(text) => {
							setConfirmPassword(text);
							setErrorMessage("");
						}}
						style={styles.input}
						secureTextEntry
						editable={!isLoading}
						// refuser le copier coller du mdp lors de la confirmation
						contextMenuHidden={true}
					/>
				)}

				{!(isLogin || allPassed) && (
					<View style={styles.criteriaContainer}>
						{passwordCriteria.map((c) => {
							const passed = c.test(password);
							return (
								<View key={c.key} style={styles.criteriaItem}>
									<ThemedText
										style={[
											styles.criteriaText,
											passed ? styles.criteriaValid : styles.criteriaInvalid,
										]}
									>
										{c.label}
									</ThemedText>
								</View>
							);
						})}
					</View>
				)}

				{errorMessage !== "" && <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>}

				<TouchableOpacity
					onPress={handleSubmit}
					style={[styles.button, isLoading && styles.buttonDisabled]}
					disabled={isLoading}
				>
					{isLoading ? (
						<ActivityIndicator color="#f5f5f5" />
					) : (
						<ThemedText style={styles.buttonText}>
							{isLogin ? "Se connecter" : "S'inscrire"}
						</ThemedText>
					)}
				</TouchableOpacity>
			</View>

			<View style={styles.footer}>
				<ThemedText style={styles.footerText}>
					{isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
				</ThemedText>
				<TouchableOpacity onPress={toggleMode} disabled={isLoading}>
					<ThemedText style={styles.linkText}>
						{isLogin ? "Créer un compte" : "Se connecter"}
					</ThemedText>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
		backgroundColor: "#4a4a55",
		paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
	},
	title: {
		fontSize: 28,
		fontWeight: "800",
		paddingTop: 20,
		marginBottom: 40,
		color: "#f0f0f0",
		letterSpacing: 1,
		textShadowColor: "rgba(0, 230, 230, 0.5)",
		textShadowOffset: { width: 0, height: 2 },
		textShadowRadius: 6,
	},
	form: {
		width: "100%",
		maxWidth: 400,
		// Fix Android background
		backgroundColor: Platform.OS === "android" ? "#5a5a65" : "rgba(255, 255, 255, 0.08)",
		borderRadius: 20,
		padding: 25,
		borderWidth: 1,
		borderColor: "rgba(0, 217, 217, 0.25)",
		...(Platform.OS === "ios" && {
			shadowColor: "#00b3b3",
			shadowOffset: { width: 0, height: 6 },
			shadowOpacity: 0.25,
			shadowRadius: 15,
		}),
		elevation: 8,
		overflow: "hidden",
	},
	input: {
		// Fix Android background
		backgroundColor: Platform.OS === "android" ? "#4a4a55" : "rgba(255, 255, 255, 0.12)",
		padding: 16,
		borderRadius: 15,
		borderWidth: 2,
		borderColor: "rgba(0, 217, 217, 0.35)",
		fontSize: 16,
		marginBottom: 15,
		color: "#f0f0f0",
		fontWeight: "600",
		...(Platform.OS === "ios" && {
			shadowColor: "#000",
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.15,
			shadowRadius: 5,
		}),
		elevation: 4,
		overflow: "hidden",
	},
	errorText: {
		color: "#ff4444",
		fontSize: 12,
		fontWeight: "500",
		marginBottom: 15,
		marginTop: -5,
		paddingHorizontal: 5,
		lineHeight: 16,
	},
	button: {
		// Fix Android background
		backgroundColor: Platform.OS === "android" ? "#00a8a8" : "#00b8b8d0",
		padding: 18,
		borderRadius: 25,
		alignItems: "center",
		marginTop: 10,
		borderWidth: 2,
		borderColor: "rgba(255, 255, 255, 0.25)",
		...(Platform.OS === "ios" && {
			shadowColor: "#00e6e6",
			shadowOffset: { width: 0, height: 6 },
			shadowOpacity: 0.35,
			shadowRadius: 14,
		}),
		elevation: 8,
		overflow: "hidden",
	},
	buttonText: {
		color: "#f5f5f5",
		fontSize: 18,
		fontWeight: "700",
		textShadowColor: "rgba(0, 0, 0, 0.4)",
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 3,
		letterSpacing: 0.5,
	},
	footer: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 30,
		// Fix Android background
		backgroundColor: Platform.OS === "android" ? "#5a5a65" : "rgba(255, 255, 255, 0.04)",
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 15,
		borderWidth: 1,
		borderColor: "rgba(0, 217, 217, 0.15)",
		overflow: "hidden",
	},
	footerText: {
		fontSize: 14,
		color: "#e8e8e8",
		fontWeight: "600",
	},
	linkText: {
		fontSize: 14,
		color: "#00d6d6",
		marginLeft: 8,
		fontWeight: "700",
		textDecorationLine: "underline",
	},

	// --- styles ajoutés pour les critères ---
	criteriaContainer: {
		marginBottom: 12,
		paddingHorizontal: 6,
	},
	criteriaItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 2,
	},
	criteriaText: {
		fontSize: 13,
		marginLeft: 6,
		fontWeight: "600",
	},
	criteriaValid: {
		color: "#4CAF50", // vert
	},
	criteriaInvalid: {
		color: "#ff5252", // rouge
	},
	buttonDisabled: {
		opacity: 0.6,
	},
});
