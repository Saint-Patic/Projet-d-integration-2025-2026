import apiClient from "./apiClient";

export interface UserForSelection {
  user_id: number;
  name: string;
  pseudo?: string;
  profile_picture?: string;
  user_type: "playeronly" | "coach";
}

export interface CreateTeamData {
  team_name: string;
  coach_id: number;
  logo?: string;
  players?: {
    user_id: number;
    role_attack: "handler" | "stack";
    role_def: "chien" | "zone";
  }[];
}

export interface CreateTeamResponse {
  message: string;
  team_id: number;
  team_name: string;
}

export interface AddPlayerData {
  user_id: number;
  role_attack?: "handler" | "stack";
  role_def?: "chien" | "zone";
}

/**
 * Créer une nouvelle équipe
 */
export const createTeam = async (
  teamData: CreateTeamData
): Promise<CreateTeamResponse> => {
  try {
    const response = await apiClient.post<CreateTeamResponse>(
      "/teams",
      teamData
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
    const response = await apiClient.get<UserForSelection[]>(
      "/teams/users/all"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const addPlayerToTeam = async (
  teamId: number,
  playerData: AddPlayerData
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post(
      `/teams/${teamId}/players`,
      playerData
    );
    return response.data;
  } catch (error) {
    console.error(`Error adding player to team ${teamId}:`, error);
    throw error;
  }
};

export const removePlayerFromTeam = async (
  teamId: number,
  userId: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.delete(
      `/teams/${teamId}/players/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error removing player from team ${teamId}:`, error);
    throw error;
  }
};
