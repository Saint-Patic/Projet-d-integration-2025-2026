import axios from "axios";
import Constants from "expo-constants";

// Récupérer l'URL de l'API depuis .env
const getBaseURL = () => {
  // En développement
  if (__DEV__) {
    // Priorité 1: Variable d'environnement
    const apiUrl = Constants.expoConfig?.extra?.apiUrl;
    if (apiUrl) {
      return apiUrl;
    }

    // Priorité 2: Pour le web
    if (typeof window !== "undefined") {
      return process.env.API_URL || "http://localhost:3300/api";
    }

    // Priorité 3: Pour React Native (téléphone/émulateur)
    const debuggerHost = Constants.expoConfig?.hostUri;
    if (debuggerHost) {
      const host = debuggerHost.split(":")[0];
      return `http://${host}:3300/api`;
    }

    return "http://localhost:3300/api";
  }

  // En production
  return (
    Constants.expoConfig?.extra?.apiUrl ||
    "https://votre-api-production.com/api"
  );
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

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
