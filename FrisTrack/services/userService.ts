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
};

export default userService;
