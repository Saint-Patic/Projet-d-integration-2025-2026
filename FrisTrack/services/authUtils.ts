import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@/types/user";

export const authUtils = {
  // Sauvegarder les données d'authentification
  async saveAuth(token: string, user: User): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        ["authToken", token],
        ["userData", JSON.stringify(user)],
      ]);
    } catch (error) {
      console.error("Error saving auth data:", error);
      throw error;
    }
  },

  // Récupérer le token
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem("authToken");
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  },

  // Récupérer les données utilisateur
  async getUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem("userData");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  },

  // Mettre à jour les données utilisateur
  async updateUser(userData: Partial<User>): Promise<void> {
    try {
      const currentUser = await this.getUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...userData };
        await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Error updating user data:", error);
      throw error;
    }
  },

  // Supprimer les données d'authentification
  async clearAuth(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(["authToken", "userData"]);
    } catch (error) {
      console.error("Error clearing auth data:", error);
      throw error;
    }
  },

  // Vérifier si l'utilisateur est authentifié
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getToken();
      return !!token;
    } catch (error) {
      console.error("Error checking authentication:", error);
      return false;
    }
  },
};
