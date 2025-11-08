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
