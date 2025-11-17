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
      const response = await apiClient.get<User>(`/users/${userId}`);

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
      const response = await apiClient.get<GetUserResponse>(
        `/users/email/${encodeURIComponent(email)}`
      );

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
      const response = await apiClient.put<UpdateProfileResponse>(
        "/users/profile",
        data
      );

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
      const response = await apiClient.put<UpdateRoleAttackResponse>(
        "/users/team-role-attack",
        data
      );

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
