import api from "./api";
import { UserProfile } from "./userService";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user: UserProfile;
  token?: string;
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>(
        "/users/login",
        credentials
      );
      return response.data;
    } catch (error: any) {
      console.error("Login error details:", {
        message: error.message,
        code: error.code,
        baseURL: api.defaults.baseURL,
        url: error.config?.url,
        method: error.config?.method,
      });
      throw error;
    }
  },
  getUserById: async (userId: number): Promise<UserProfile> => {
    try {
      const response = await api.get<UserProfile[]>(`/users/${userId}`);
      return response.data[0];
    } catch (error: any) {
      console.error("Get user error:", error);
      throw error;
    }
  },
  checkEmail: async (email: string) => {
    try {
      const response = await api.post("/auth/check-email", { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default api;
