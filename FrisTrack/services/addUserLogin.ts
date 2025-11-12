import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface RegisterUserData {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  pseudo: string;
  birthdate: string; // Format: YYYY-MM-DD
  user_weight?: number;
  user_height?: number;
  foot_size?: number;
  dominant_hand?: "Gauche" | "Droite" | "Ambidextre";
}

export const registerService = {
  register: async (userData: RegisterUserData) => {
    try {
      const response = await axios.post(`${API_URL}/users/register`, userData);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw error;
      }
      throw new Error("Erreur de connexion au serveur");
    }
  },
};
