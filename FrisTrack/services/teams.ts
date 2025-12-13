import apiClient from "./apiClient";
import type { Team } from "./getTeams";

export interface CreateTeamData {
	team_name: string;
	logo?: string;
	coach_id: number;
	players?: {
		user_id: number;
		role_attack?: "handler" | "stack";
		role_def?: "chien" | "zone";
	}[];
}

export interface CreateTeamResponse {
	message: string;
	team_id: number;
	team_name: string;
}

export interface UserForSelection {
	user_id: number;
	name: string;
	pseudo?: string;
	profile_picture?: string;
	user_type: "playeronly" | "coach";
}

/**
 * Créer une nouvelle équipe
 */
export const createTeam = async (
	teamData: CreateTeamData,
): Promise<CreateTeamResponse> => {
	try {
		const response = await apiClient.post<CreateTeamResponse>(
			"/teams",
			teamData,
		);
		return response.data;
	} catch (error) {
		console.error("Error creating team:", error);
		throw error;
	}
};

/**
 * Récupérer tous les utilisateurs pour sélection
 */
export const getAllUsers = async (): Promise<UserForSelection[]> => {
	try {
		const response =
			await apiClient.get<UserForSelection[]>("/teams/users/all");
		return response.data;
	} catch (error) {
		console.error("Error fetching users:", error);
		throw error;
	}
};
