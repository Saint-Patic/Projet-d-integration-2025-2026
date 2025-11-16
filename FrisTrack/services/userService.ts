import apiClient from "./apiClient";
import { User } from "@/types/user";

export interface GetUserResponse {
  success: boolean;
  user: User;
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

export interface UpdateProfileRequest {
  user_id: number;
  user_weight?: number;
  user_height?: number;
  foot_size?: number;
  dominant_hand?: string;
  pseudo?: string;
  profile_picture?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
}

export const userService = {
  getUserById: async (userId: number): Promise<User> => {
    try {
      console.log("Fetching user data for ID:", userId);
      const response = await apiClient.get<User>(`/users/${userId}`);
      console.log("User data retrieved successfully");
      return response.data;
    } catch (error: any) {
      console.error("Error fetching user data by ID:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },
  getUserByEmail: async (email: string): Promise<GetUserResponse> => {
    try {
      console.log("Fetching user data for:", email);
      const response = await apiClient.get<GetUserResponse>(
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
  updateProfile: async (
    data: UpdateProfileRequest
  ): Promise<UpdateProfileResponse> => {
    try {
      console.log("Updating user profile:", data);
      const response = await apiClient.put<UpdateProfileResponse>(
        "/users/profile",
        data
      );
      console.log("Profile updated successfully");
      return response.data;
    } catch (error: any) {
      console.error("Error updating profile:", {
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
      const response = await apiClient.put<UpdateRoleAttackResponse>(
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
