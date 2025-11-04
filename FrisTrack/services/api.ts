import axios from "axios";
import { Platform } from "react-native";

const getBaseURL = () => {
  // En développement
  if (__DEV__) {
    // Variable d'environnement ou fallback selon la plateforme
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;

    if (apiUrl) {
      return apiUrl;
    }

    // Fallback: localhost pour web, erreur pour mobile
    if (Platform.OS === "web") {
      return "http://localhost:3300/api";
    }
    return "http://localhost:3300/api";
  }

  // En production
  return (
    process.env.EXPO_PUBLIC_API_URL || "https://votre-api-production.com/api"
  );
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Intercepteur pour logger les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", {
      message: error.message,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
    });
    return Promise.reject(error);
  }
);

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user: {
    user_id: number;
    email: string;
    firstname: string;
    lastname: string;
    pseudo: string | null;
    user_type: "playeronly" | "coach";
  };
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/users/login", credentials);
    return response.data;
  },
};

export default api;
