import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const getBaseURL = () => {
  if (__DEV__) {
    console.log(`EXPO_PUBLIC_API_URL = ${process.env.EXPO_PUBLIC_API_URL}`);
    return process.env.EXPO_PUBLIC_API_URL || "http://localhost:3300/api";
  }

  return "https://votre-api-production.com/api";
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur de requête pour ajouter le token et logger
apiClient.interceptors.request.use(
  async (config) => {
    // Ajouter le token d'authentification
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (__DEV__) {
        console.log("Auth Token:", token ? "Present" : "Missing");
      }
    } catch (error) {
      console.error("Error retrieving auth token:", error);
    }

    // Logger la requête
    console.log("API Request:", {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      data: config.data,
    });

    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// Intercepteur de réponse pour logger et gérer les erreurs
apiClient.interceptors.response.use(
  (response) => {
    console.log("API Response:", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
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
      console.error(
        "Request timeout - Check if your backend server is running"
      );
    } else if (error.message === "Network Error") {
      console.error("Network Error - Possible causes:");
      console.error("1. Backend server is not running");
      console.error("2. Incorrect baseURL configuration");
      console.error("3. CORS issues");
      console.error("4. Device/emulator cannot reach the backend");
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

    return Promise.reject(error);
  }
);

export default apiClient;
