import React, { createContext, useState, useContext, useEffect } from "react";
import { authUtils } from "@/services/authUtils";
import { authService } from "@/services/getUserLogin";
import apiClient from "@/services/apiClient";
import { User } from "@/types/user";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger le token et les données utilisateur au démarrage
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        authUtils.getToken(),
        authUtils.getUser(),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }
    } catch (error) {
      console.error("Error loading auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await authService.login(credentials);

      if (response?.success && response.token && response.user) {
        // Sauvegarder dans AsyncStorage
        await authUtils.saveAuth(response.token, response.user);

        // Mettre à jour l'état
        setToken(response.token);
        setUser(response.user);

        // Note: Le thème sera synchronisé via useTheme dans les composants qui en ont besoin
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authUtils.clearAuth();
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (!user) return;

      const updatedUser = { ...user, ...userData };
      await authUtils.updateUser(updatedUser);
      setUser(updatedUser);
    } catch (error) {
      console.error("Update user error:", error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      if (!user) return;

      const userData = await apiClient.get(`/users/${user.user_id}`);
      if (userData.data) {
        await authUtils.updateUser(userData.data);
        setUser(userData.data);
      }
    } catch (error) {
      console.error("Refresh user error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
