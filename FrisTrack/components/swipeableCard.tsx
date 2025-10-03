import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Animated,
  PanResponder,
  StyleSheet,
  Dimensions,
  Platform,
  Vibration,
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
  const [isDeleteArmed, setIsDeleteArmed] = useState(false);
  const [isEditArmed, setIsEditArmed] = useState(false);
  const actionLockedRef = useRef(false);
  const ACTION_THRESHOLD = 50;

  useEffect(() => {
    translateX.setValue(0);
    setSwipeDirection("none");
    setIsDeleteArmed(false);
    setIsEditArmed(false);
    actionLockedRef.current = false;
  }, [translateX, cardId]);

  const resetCardPosition = () => {
    setSwipeDirection("none");
    setIsDeleteArmed(false);
    setIsEditArmed(false);
    translateX.stopAnimation();
    translateX.setValue(0);
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start(() => {
      translateX.setValue(0);
    });
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
    },
    onPanResponderGrant: () => {
      translateX.stopAnimation();
    },
    onPanResponderMove: (evt, gestureState) => {
      const newValue = Math.max(-120, Math.min(120, gestureState.dx));
      translateX.setValue(newValue);

      if (gestureState.dx > 10) setSwipeDirection("right");
      else if (gestureState.dx < -10) setSwipeDirection("left");
      else setSwipeDirection("none");

      setIsDeleteArmed(gestureState.dx > ACTION_THRESHOLD);
      setIsEditArmed(gestureState.dx < -ACTION_THRESHOLD);
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (actionLockedRef.current) {
        resetCardPosition();
        return;
      }

      const triggerEdit = gestureState.dx < -ACTION_THRESHOLD && !!onEdit;
      const triggerDelete = gestureState.dx > ACTION_THRESHOLD && !!onDelete;

      setSwipeDirection("none");
      translateX.stopAnimation();

      // Feedback + anti-spam + action immédiate
      if (triggerEdit || triggerDelete) {
        actionLockedRef.current = true;
        Vibration.vibrate(10);
        if (triggerEdit) onEdit?.();
        if (triggerDelete) onDelete?.();
      }

      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 150,
        friction: 10,
        restSpeedThreshold: 0.01,
        restDisplacementThreshold: 0.01,
      }).start(() => {
        translateX.setValue(0);
        setIsDeleteArmed(false);
        setIsEditArmed(false);
        setTimeout(() => {
          actionLockedRef.current = false;
        }, 250);
      });
    },
    onPanResponderTerminate: () => {
      resetCardPosition();
    },
  });

  return (
    <View style={styles.cardContainer}>
      {/* Icône de suppression (swipe right) */}
      {swipeDirection === "right" && onDelete && (
        <View style={[styles.leftIcon, isDeleteArmed && styles.leftIconArmed]}>
          <Icon
            name="delete"
            size={24}
            color={isDeleteArmed ? "#fff" : "#e74c3c"}
          />
        </View>
      )}

      {/* Icône d'édition (swipe left) */}
      {swipeDirection === "left" && onEdit && (
        <View style={[styles.rightIcon, isEditArmed && styles.rightIconArmed]}>
          <Icon
            name="edit"
            size={24}
            color={isEditArmed ? "#fff" : "#3498db"}
          />
        </View>
      )}

      {/* Swipeable card */}
      <Animated.View
        style={[styles.cardWrapper, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <ThemedView style={[styles.card, { borderTopColor }]}>
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  leftIconArmed: {
    backgroundColor: "#e74c3c",
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  rightIconArmed: {
    backgroundColor: "#3498db",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderTopWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
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
    lineHeight: 22,
    includeFontPadding: false,
    marginTop: Platform.OS === "android" ? 1 : 0,
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
