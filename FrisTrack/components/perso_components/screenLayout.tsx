import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";

interface ScreenLayoutProps {
  title: string;
  children: React.ReactNode;
  titleOffset?: number;
  headerRight?: React.ReactNode;
  headerLeft?: React.ReactNode;
  disableScroll?: boolean; // Nouvelle prop
  theme?: {
    primary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
  };
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  title,
  children,
  titleOffset = 0,
  headerRight,
  headerLeft,
  disableScroll = false, // Par défaut, le scroll est activé
  theme,
}: ScreenLayoutProps) => {
  // Couleurs par défaut si aucun thème n'est passé
  const defaultTheme = {
    primary: "#00d6d6",
    background: "#4a4a55",
    surface: "#5a5a65",
    text: "#f0f0f0",
    textSecondary: "#a8a8a8",
    border: "#00d6d640",
  };

  const currentTheme = theme || defaultTheme;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: currentTheme.background,
          paddingTop:
            (Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0) +
            titleOffset,
        },
      ]}
    >
      <ThemedView
        style={[
          styles.titleContainer,
          {
            backgroundColor: `${currentTheme.primary}23`,
            borderBottomColor: `${currentTheme.primary}89`,
          },
        ]}
      >
        {headerLeft && <View style={styles.headerLeft}>{headerLeft}</View>}
        <ThemedText
          type="title"
          style={[
            styles.mainTitle,
            {
              color: currentTheme.text,
              includeFontPadding: false,
              marginTop: Platform.OS === "android" ? 2 : 0,
            },
          ]}
        >
          {title}
        </ThemedText>
        {headerRight && <View style={styles.headerRight}>{headerRight}</View>}
      </ThemedView>

      {disableScroll ? (
        <View
          style={[
            styles.scrollableContent,
            { backgroundColor: currentTheme.background },
          ]}
        >
          {children}
        </View>
      ) : (
        <ScrollView
          style={[
            styles.scrollableContent,
            { backgroundColor: currentTheme.background },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 45 : 20,
    paddingBottom: Platform.OS === "ios" ? 20 : 20,
    alignItems: "center",
    borderBottomWidth: 2,
    overflow: "hidden",
    position: "relative",
  },
  headerLeft: {
    position: "absolute",
    left: 20,
    top: Platform.OS === "ios" ? 45 : 20,
    bottom: Platform.OS === "ios" ? 20 : 20,
    justifyContent: "center",
  },
  headerRight: {
    position: "absolute",
    right: 20,
    top: Platform.OS === "ios" ? 45 : 20,
    bottom: Platform.OS === "ios" ? 20 : 20,
    justifyContent: "center",
  },
  scrollableContent: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 1,
  },
});
