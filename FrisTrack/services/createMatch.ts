import apiClient from "./apiClient";
import type { Localisation } from "./getLocalisation";

export interface CreateMatchData {
  title: string;
  userTeamId: number;
  opponentTeamId: number;
  Localisation: Localisation;
  date: string;
  time?: string;
  inOutdoor: "indoor" | "outdoor";
  label: "finished" | "schedule" | "en cours";
}

export const createMatch = async (matchData: CreateMatchData) => {
  try {
    const response = await apiClient.post("/matches", matchData);
    return response.data;
  } catch (error) {
    console.error("Error creating match:", error);
    throw error;
  }
};
