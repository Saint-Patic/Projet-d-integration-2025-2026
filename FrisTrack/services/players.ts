import apiClient from "./apiClient";

export interface PlayerTeamRemoval {
	user_id: number;
	team_id: number;
}

/**
 * Remove a player from a team
 * @param user_id - ID of the user to remove
 * @param team_id - ID of the team
// FrisTrack/services/players.ts
import apiClient from "./apiClient";

/**
 * Remove a player from a team
 * @param user_id - The ID of the player to remove
 * @param team_id - The ID of the team
 * @returns Promise<void>
 */
export const removePlayerFromTeam = async (
	user_id: number,
	team_id: number,
): Promise<void> => {
	try {
		await apiClient.delete(`/teams/${team_id}/players/${user_id}`);
	} catch (error) {
		console.error(
			`Error removing player ${user_id} from team ${team_id}:`,
			error,
		);
		throw error;
	}
};
