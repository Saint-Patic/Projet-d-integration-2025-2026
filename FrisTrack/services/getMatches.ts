import apiClient from "./apiClient";

export interface Match {
  id: number;
  team_name_1: string;
  team_name_2: string;
  team_score_1: number;
  team_score_2: number;
  team1_status: string; // 'home' ou 'away'
  team2_status: string; // 'home' ou 'away'
  date: string;
  status?: string;
  color?: string;
  isRecording?: boolean;
  hasRecording?: boolean;
  recordingStartTime?: number;
  recordingDuration?: number;
}
export const getMatches = async (): Promise<Match[]> => {
  try {
    const response = await apiClient.get<Match[]>("/matches");
    return response.data;
  } catch (error) {
    console.error("Error fetching matches:", error);
    throw error;
  }
};

export const getMatchById = async (id: number): Promise<Match | null> => {
  try {
    const response = await apiClient.get<Match>(`/matches/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching match ${id}:`, error);
    return null;
  }
};

export const createMatch = async (match: Partial<Match>): Promise<Match> => {
  try {
    const response = await apiClient.post<Match>("/matches", match);
    return response.data;
  } catch (error) {
    console.error("Error creating match:", error);
    throw error;
  }
};

export const updateMatch = async (
  id: number,
  updates: Partial<Match>
): Promise<Match | null> => {
  try {
    const response = await apiClient.put<Match>(`/matches/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error(`Error updating match ${id}:`, error);
    return null;
  }
};

export async function updateMatchScore(matchId: string | number, playload: Record<string, any>) {
  return apiClient.put(`/matches/${matchId}/score`, playload);
}


export const deleteMatch = async (id: number): Promise<Match | null> => {
  try {
    const response = await apiClient.delete<Match>(`/matches/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting match ${id}:`, error);
    return null;
  }
};

export const finishMatch = async (
  id: number,
  score1: number,
  score2: number
): Promise<Match | null> => {
  return updateMatch(id, {
    status: "finished",
    team_score_1: score1,
    team_score_2: score2,
    color: score1 > score2 ? "#27ae60" : "#e74c3c",
  });
};

export const getMatchesByUser = async (userId: number): Promise<Match[]> => {
  try {
    const response = await apiClient.get<Match[]>(`/matches/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching matches for user ${userId}:`, error);
    throw error;
  }
};
