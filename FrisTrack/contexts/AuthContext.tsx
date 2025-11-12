import React, { createContext, useState, useContext, useEffect } from "react";
import { authUtils } from "@/services/authUtils";
import apiClient from "@/services/apiClient";

interface User {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  pseudo: string;
  birthdate: string;
  user_weight: number;
  user_height: number;
  foot_size: number;
  dominant_hand: "Gauche" | "Droite" | "Ambidextre";
  profile_picture?: string;
}

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
      const response = await apiClient.post("/users/login", credentials);

      if (response.data?.success && response.data.token && response.data.user) {
        await authUtils.saveAuth(response.data.token, response.data.user);
        setToken(response.data.token);
        setUser(response.data.user);
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

      await authUtils.updateUser(userData);
      setUser({ ...user, ...userData });
    } catch (error) {
      console.error("Update user error:", error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const response = await apiClient.get("/users/me");
      if (response.data?.success && response.data.user) {
        await authUtils.updateUser(response.data.user);
        setUser(response.data.user);
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
