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
const SWIPE_THRESHOLD = 100; // Seuil de déclenchement automatique

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

  // Gestion de l'ouverture du swipeable
  const handleSwipeableOpen = (direction: "left" | "right") => {
    if (direction === "right") {
      // Pour l'action d'édition, exécuter immédiatement et refermer
      onEdit();
      // Fermer le swipeable après l'action d'édition
    } else if (direction === "left") {
      onDelete();
    }
    setTimeout(() => {
      swipeableRef.current?.close();
    }, 300);
  };

  // Indicateurs visuels uniquement
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

  // Indicateurs visuels uniquement
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
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    backgroundColor: "#ffffff",
    borderTopWidth: 5,
    borderRadius: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7f8c8d",
  },
  swipeHint: {
    fontSize: 12,
    color: "#bdc3c7",
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
  },
  editAction: {
    backgroundColor: "#3498db",
  },
  deleteAction: {
    backgroundColor: "#e74c3c",
  },
  actionText: {
    color: "#ffffff",
    fontSize: 12,
    marginTop: 4,
  },
});
