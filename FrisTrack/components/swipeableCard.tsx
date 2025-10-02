import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Animated,
  PanResponder,
  StyleSheet,
  Dimensions,
} from "react-native";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import Icon from "react-native-vector-icons/MaterialIcons";

interface SwipeableCardProps {
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  borderTopColor?: string;
  title: string;
  cardId: number;
}

const { width } = Dimensions.get("window");
const cardWidth = width > 600 ? (width - 60) / 2 : width - 40;

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onEdit,
  onDelete,
  borderTopColor = "#3498db",
  title,
  cardId,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [swipeDirection, setSwipeDirection] = useState<
    "none" | "left" | "right"
  >("none");
  const ACTION_THRESHOLD = 50; // Distance required to trigger action

  // Force reset position on component mount and when props change
  useEffect(() => {
    translateX.setValue(0);
    setSwipeDirection("none");
  }, [translateX, cardId]);

  // Utility function to reset card position with force reset
  const resetCardPosition = () => {
    setSwipeDirection("none");

    // Stop any ongoing animation first
    translateX.stopAnimation();

    // Force immediate reset then animate smoothly
    translateX.setValue(0);

    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start(() => {
      // Double check the value is actually 0
      translateX.setValue(0);
    });
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
    },
    onPanResponderGrant: () => {
      // When the user starts touching, stop any ongoing animation
      translateX.stopAnimation();
    },
    onPanResponderMove: (evt, gestureState) => {
      // Provide visual feedback during swipe with stricter limits
      const newValue = Math.max(-120, Math.min(120, gestureState.dx));
      translateX.setValue(newValue);

      // Update swipe direction for icon display
      if (gestureState.dx > 10) {
        setSwipeDirection("right");
      } else if (gestureState.dx < -10) {
        setSwipeDirection("left");
      } else {
        setSwipeDirection("none");
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      // Perform actions based on swipe direction and distance
      const shouldEdit = gestureState.dx < -ACTION_THRESHOLD && onEdit;
      const shouldDelete = gestureState.dx > ACTION_THRESHOLD && onDelete;

      // Force immediate reset to prevent getting stuck
      setSwipeDirection("none");
      translateX.stopAnimation();

      // Animate back to center position
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 150,
        friction: 10,
        restSpeedThreshold: 0.01,
        restDisplacementThreshold: 0.01,
      }).start(() => {
        // Ensure position is exactly 0
        translateX.setValue(0);

        // Execute actions after reset is complete
        if (shouldEdit) {
          onEdit();
        } else if (shouldDelete) {
          onDelete();
        }
      });
    },
    onPanResponderTerminate: () => {
      // If the gesture is terminated (interrupted), force reset position
      resetCardPosition();
    },
  });

  return (
    <View style={styles.cardContainer}>
      {/* Icône de suppression (swipe right) */}
      {swipeDirection === "right" && onDelete && (
        <View style={styles.leftIcon}>
          <Icon name="delete" size={24} color="#e74c3c" />
        </View>
      )}

      {/* Icône d'édition (swipe left) */}
      {swipeDirection === "left" && onEdit && (
        <View style={styles.rightIcon}>
          <Icon name="edit" size={24} color="#3498db" />
        </View>
      )}

      {/* Swipeable card - Swipe right to delete, swipe left to edit */}
      <Animated.View
        style={[styles.cardWrapper, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <ThemedView style={[styles.card, { borderTopColor }]}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="subtitle" style={styles.title}>
              {title} {cardId}
            </ThemedText>
            <View style={styles.swipeIndicator}>
              <IconSymbol
                name="chevron.left.chevron.right"
                size={16}
                color="#bdc3c7"
              />
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>{children}</View>
        </ThemedView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: cardWidth,
    marginBottom: 15,
    position: "relative",
  },
  cardWrapper: {
    width: cardWidth,
  },
  leftIcon: {
    position: "absolute",
    left: 20,
    top: "50%",
    transform: [{ translateY: -12 }],
    zIndex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  rightIcon: {
    position: "absolute",
    right: 20,
    top: "50%",
    transform: [{ translateY: -12 }],
    zIndex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderTopWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#f8f9fa",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
  },
  swipeIndicator: {
    opacity: 0.5,
  },
  content: {
    padding: 15,
  },
});
