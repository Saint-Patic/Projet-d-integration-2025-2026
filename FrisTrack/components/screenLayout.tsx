import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";

interface ScreenLayoutProps {
  title: string;
  children: React.ReactNode;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  title,
  children,
}) => {
  return (
    <View style={styles.container}>
      {/* Fixed Title */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.mainTitle}>
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
