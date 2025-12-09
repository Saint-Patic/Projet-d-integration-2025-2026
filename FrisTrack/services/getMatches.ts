import apiClient from "./apiClient";

export interface Match {
  id: number;
  team_id_1?: number;  // Ajoutez ceci
  team_id_2?: number;  // Ajoutez ceci
  team_name_1: string;
  team_name_2: string;
  team_score_1: number;
  team_score_2: number;
  team1_status: string;
  team2_status: string;
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

export async function updateMatchScore(matchId: string | number, score: string | number, teamId: number | undefined) {
  console.log(`matchId: ${matchId}, score: ${score}, team id: ${teamId}`)
  try {
    if (teamId === undefined) return console.error(`Team id undefined`);
    const response = await apiClient.put(`/matches/${matchId}/${teamId}/score`, { score });
    return response.data;
  } catch(error) {
    console.error(`Error updating score match ${matchId}:`, error);
  }
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
