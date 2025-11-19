import axios from "axios";
import { RegisterUserData } from "@/types/user";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export { RegisterUserData };

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
