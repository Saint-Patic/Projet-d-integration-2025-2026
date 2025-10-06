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
    backgroundColor: "#4a4a55", // Nuance plus claire du background
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: "center",
    backgroundColor: "rgba(0, 204, 204, 0.08)", // Plus subtil
    borderBottomWidth: 2,
    borderBottomColor: "rgba(0, 230, 230, 0.25)", // Plus lumineux
    shadowColor: "#00d9d9", // Ombre plus vive
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  scrollableContent: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#f0f0f0", // Blanc cassé
    textShadowColor: "rgba(0, 230, 230, 0.5)", // Plus lumineux
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 1,
  },
});
