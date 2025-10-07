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
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  title,
  children,
  titleOffset = 0,
  headerRight,
  headerLeft,
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
      <ThemedView style={styles.titleContainer}>
        {headerLeft && <View style={styles.headerLeft}>{headerLeft}</View>}
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
        {headerRight && <View style={styles.headerRight}>{headerRight}</View>}
      </ThemedView>

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
    backgroundColor: "#4a4a55",
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 45 : 20,
    paddingBottom: Platform.OS === "ios" ? 20 : 20,
    alignItems: "center",
    backgroundColor: "rgba(21, 146, 177, 0.23)",
    borderBottomWidth: 2,
    borderBottomColor: "rgba(0, 230, 230, 0.89)",
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
    backgroundColor: "#4a4a55",
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#f0f0f0",
    letterSpacing: 1,
  },
});
