import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";
import { router } from "expo-router";

// Utiliser directement l'instance api au lieu de spread
const apiClient = api;

apiClient.interceptors.request.use(
  async (config) => {
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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
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
