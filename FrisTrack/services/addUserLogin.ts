import axios from "axios";
import { RegisterUserData } from "@/types/user";

// Utilisez apiClient au lieu d'axios directement
import apiClient from "./apiClient";

export const registerService = {
  register: async (userData: RegisterUserData) => {
    try {
      // Utilisez apiClient qui gère déjà l'URL de base
      const response = await apiClient.post("/auth/register", userData);

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw error;
      }
      throw new Error("Erreur de connexion au serveur");
    }
  },
};
