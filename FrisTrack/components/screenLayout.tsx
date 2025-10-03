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
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  title,
  children,
  titleOffset = 6,
}: ScreenLayoutProps) => {
  return (
    <View
      style={[
        styles.container,
        {
          // Ajoute la hauteur de la status bar Android + offset demandé
          paddingTop:
            (Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0) +
            titleOffset,
        },
      ]}
    >
      {/* Fixed Title */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={[
            styles.mainTitle,
            {
              includeFontPadding: false,
              marginTop: Platform.OS === "android" ? 2 : 0,
            },
          ]}
        >
          {title}
        </ThemedText>
      </ThemedView>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollableContent}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#e3e3e3",
  },
  scrollableContent: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
  },
});
