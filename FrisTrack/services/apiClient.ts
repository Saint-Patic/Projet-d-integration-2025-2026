import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const getBaseURL = () => {
  if (__DEV__) {
    // En développement, utilise la variable d'environnement
    return process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";
  }

  // En production, utilise votre serveur personnel
  // IMPORTANT: Changez cette URL vers votre serveur réel
  return process.env.EXPO_PUBLIC_API_URL || "https://api.votre-domaine.com/api";
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000, // Augmenté à 15s pour les connexions lentes
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur de requête
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error retrieving auth token:", error);
    }

    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// Intercepteur de réponse
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const errorDetails = {
      message: error.message,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    };

    console.error("API Error:", errorDetails);

    // Gestion des erreurs spécifiques
    if (error.code === "ECONNABORTED") {
      console.error("Request timeout - Server took too long to respond");
    } else if (error.message === "Network Error") {
      console.error("Network Error - Possible causes:");
      console.error("1. Backend server is not running");
      console.error("2. Incorrect API URL");
      console.error("3. Device has no internet connection");
      console.error("Current API URL:", getBaseURL());
    }

    // Gérer l'expiration du token (401)
    if (error.response?.status === 401) {
      console.warn("Token expired or invalid - Logging out");
      try {
        await AsyncStorage.multiRemove(["authToken", "userData"]);
        router.replace("/");
      } catch (storageError) {
        console.error("Error clearing auth data:", storageError);
      }
    }

    // Gérer les erreurs de serveur (500+)
    if (error.response?.status >= 500) {
      console.error("Server error:", error.response?.data);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
