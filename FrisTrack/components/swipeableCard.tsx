import React, { useRef } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from "react-native-reanimated";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";

const SCREEN_WIDTH = Dimensions.get("window").width;
const ACTION_WIDTH = 80;
const SWIPE_THRESHOLD = 100;

interface SwipeableCardProps {
  title: string;
  cardId: number;
  borderTopColor: string;
  onEdit: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  title,
  cardId,
  borderTopColor,
  onEdit,
  onDelete,
  children,
}) => {
  const swipeableRef = useRef<any>(null);

  const handleSwipeableOpen = (direction: "left" | "right") => {
    if (direction === "right") {
      onEdit();
    } else if (direction === "left") {
      onDelete();
    }
    setTimeout(() => {
      swipeableRef.current?.close();
    }, 300);
  };

  const RenderRightActions = (progress: SharedValue<number>) => {
    const animatedStyle = useAnimatedStyle(() => {
      const trans = interpolate(
        progress.value,
        [0, 1],
        [ACTION_WIDTH, 0],
        Extrapolation.CLAMP
      );
      return {
        transform: [{ translateX: trans }],
      };
    });

    return (
      <Animated.View style={[styles.actionContainer, animatedStyle]}>
        <View style={[styles.action, styles.deleteAction]}>
          <IconSymbol name="trash" size={24} color="#ffffff" />
          <ThemedText style={styles.actionText}>Supprimer</ThemedText>
        </View>
      </Animated.View>
    );
  };

  const RenderLeftActions = (progress: SharedValue<number>) => {
    const animatedStyle = useAnimatedStyle(() => {
      const trans = interpolate(
        progress.value,
        [0, 1],
        [-ACTION_WIDTH, 0],
        Extrapolation.CLAMP
      );
      return {
        transform: [{ translateX: trans }],
      };
    });

    return (
      <Animated.View style={[styles.actionContainer, animatedStyle]}>
        <View style={[styles.action, styles.editAction]}>
          <IconSymbol name="pencil" size={24} color="#ffffff" />
          <ThemedText style={styles.actionText}>Modifier</ThemedText>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.cardContainer}>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={RenderRightActions}
        renderLeftActions={RenderLeftActions}
        friction={2}
        overshootFriction={8}
        rightThreshold={SWIPE_THRESHOLD}
        leftThreshold={SWIPE_THRESHOLD}
        onSwipeableOpen={handleSwipeableOpen}
      >
        <View style={[styles.card, { borderTopColor }]}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>
              {title} #{cardId}
            </ThemedText>
            <ThemedText style={styles.swipeHint}>← Glisser →</ThemedText>
          </View>
          <View style={styles.cardContent}>{children}</View>
        </View>
      </Swipeable>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: SCREEN_WIDTH * 0.9,
    maxWidth: 480,
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#00b3b3", // Nuance plus douce
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.12)", // Légèrement plus opaque
    borderTopWidth: 4,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 230, 230, 0.18)", // Plus lumineux
    backdropFilter: "blur(10px)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "rgba(0, 217, 217, 0.25)", // Plus vif
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#00d6d6", // Plus lumineux
    textShadowColor: "rgba(0, 204, 204, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  swipeHint: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    fontWeight: "600",
  },
  cardContent: {
    width: "100%",
  },
  actionContainer: {
    width: ACTION_WIDTH,
    height: "100%",
  },
  action: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    margin: 2,
  },
  editAction: {
    backgroundColor: "#00b8b8", // Nuance plus douce
    shadowColor: "#00d9d9", // Ombre plus claire
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  deleteAction: {
    backgroundColor: "#e85555", // Rouge plus doux
    shadowColor: "#ff8080", // Ombre plus claire
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  actionText: {
    color: "#f5f5f5", // Blanc cassé
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
