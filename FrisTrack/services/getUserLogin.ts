import api from "./api";
import { UserProfile } from "./userService";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user: UserProfile;
  token?: string; // Si vous utilisez des tokens d'authentification
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      console.log("Attempting login with:", { email: credentials.email });
      const response = await api.post<LoginResponse>(
        "/users/login",
        credentials
      );
      console.log("Login successful:", response.data);
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
};

export default api;
