import axios from "axios";
import { RegisterUserData } from "@/types/user";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export { RegisterUserData };

export const registerService = {
  register: async (userData: RegisterUserData) => {
    try {
      console.log(
        "Sending registration data:",
        JSON.stringify(userData, null, 2)
      );
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.log("Server error response:", error.response.data);
        console.log("Status:", error.response.status);
        throw error;
      }
      throw new Error("Erreur de connexion au serveur");
    }
  },
};
