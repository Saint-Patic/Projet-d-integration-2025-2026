import api from "./api";

export interface UserProfile {
  user_id: number;
  firstname: string;
  lastname: string;
  pseudo: string;
  birthdate: string;
  email: string;
  user_weight?: number;
  user_height?: number;
  foot_size?: number;
  dominant_hand?: string;
  profile_picture?: string;
  user_type: string;
  created_at: string;
  color_mode?: string;
  color_id?: number;
}

export interface GetUserResponse {
  success: boolean;
  user: UserProfile;
}
export interface UpdateRoleAttackRequest {
  user_id: number;
  team_id: number;
  role_attack: "handler" | "stack";
}

export interface UpdateRoleAttackResponse {
  success: boolean;
  message: string;
}

export const userService = {
  getUserByEmail: async (email: string): Promise<GetUserResponse> => {
    try {
      console.log("Fetching user data for:", email);
      const response = await api.get<GetUserResponse>(
        `/users/email/${encodeURIComponent(email)}`
      );
      console.log("User data retrieved successfully");
      return response.data;
    } catch (error: any) {
      console.error("Error fetching user data:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },
  updateTeamRoleAttack: async (
    data: UpdateRoleAttackRequest
  ): Promise<UpdateRoleAttackResponse> => {
    try {
      console.log("Updating role_attack:", data);
      const response = await api.put<UpdateRoleAttackResponse>(
        "/users/team-role-attack",
        data
      );
      console.log("Role attack updated successfully");
      return response.data;
    } catch (error: any) {
      console.error("Error updating role attack:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },
};

export default userService;
