import apiClient from "./apiClient";
import { User, LoginRequest, LoginResponse } from "@/types/user";

export { LoginRequest, LoginResponse };

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>(
        "/users/login",
        credentials
      );
      return response.data;
    } catch (error: any) {
      console.error("Login error details:", {
        message: error.message,
        code: error.code,
        baseURL: apiClient.defaults.baseURL,
        url: error.config?.url,
        method: error.config?.method,
      });
      throw error;
    }
  },
  getUserById: async (userId: number): Promise<User> => {
    try {
      const response = await apiClient.get<User[]>(`/users/${userId}`);
      return response.data[0];
    } catch (error: any) {
      console.error("Get user error:", error);
      throw error;
    }
  },
  checkEmail: async (email: string) => {
    try {
      const response = await apiClient.post("/auth/check-email", { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default apiClient;
