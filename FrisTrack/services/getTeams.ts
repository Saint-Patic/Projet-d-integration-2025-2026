import api from "./api";

export interface Team {
  id: number;
  team_name: string;
  logo?: string;
  playerCount?: number;
  color?: string;
  players?: string[];
  coach_id?: number;
}

export interface TeamPlayer {
  team_id: number;
  team_name: string;
  user_id: number;
  player_name: string;
  role_attack: "handler" | "stack";
  profile_picture?: string;
}

export const getTeams = async (): Promise<Team[]> => {
  try {
    const response = await api.get<Team[]>("/teams");
    return response.data;
  } catch (error) {
    console.error("Error fetching teams:", error);
    throw error;
  }
};

export const getTeamById = async (id: number): Promise<Team | null> => {
  try {
    const response = await api.get<Team>(`/teams/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching team ${id}:`, error);
    return null;
  }
};

export const getPlayerCount = async (id: number): Promise<Team | null> => {
  try {
    const response = await api.get<Team>(`/teams/${id}/player-count`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching team ${id}:`, error);
    return null;
  }
};

export const getTeamPlayers = async (id: number): Promise<TeamPlayer[]> => {
  try {
    const response = await api.get<TeamPlayer[]>(`/teams/${id}/players`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching players for team ${id}:`, error);
    return [];
  }
};
