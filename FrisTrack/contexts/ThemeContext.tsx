import React, { createContext, useContext, useState, ReactNode } from "react";
// import { Platform } from "react-native";

export interface Theme {
  primary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  selectedColor: string;
  setIsDarkMode: (isDark: boolean) => void;
  setSelectedColor: (color: string) => void;
  getThemeColors: () => Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedColor, setSelectedColor] = useState("#00d6d6");

  const getThemeColors = (): Theme => {
    return {
      primary: selectedColor,
      background: isDarkMode ? "#4a4a55" : "#f5f5f5",
      surface: isDarkMode ? "#5a5a65" : "#ffffff",
      text: isDarkMode ? "#f0f0f0" : "#333333",
      textSecondary: isDarkMode ? "#a8a8a8" : "#666666",
      border: isDarkMode ? `${selectedColor}40` : `${selectedColor}30`,
    };
  };

  const theme = getThemeColors();

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode,
        selectedColor,
        setIsDarkMode,
        setSelectedColor,
        getThemeColors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
