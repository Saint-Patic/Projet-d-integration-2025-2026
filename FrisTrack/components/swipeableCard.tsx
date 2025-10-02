import React, { useState, useRef } from "react";
import {
  View,
  TouchableOpacity,
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
  const [revealedSide, setRevealedSide] = useState<"none" | "left" | "right">(
    "none"
  );
  const ACTION_WIDTH = 80;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
    },
    onPanResponderMove: (evt, gestureState) => {
      const newValue = Math.max(
        -ACTION_WIDTH,
        Math.min(ACTION_WIDTH, gestureState.dx)
      );
      translateX.setValue(newValue);

      if (newValue > 2) {
        setRevealedSide("left");
      } else if (newValue < -2) {
        setRevealedSide("right");
      } else {
        setRevealedSide("none");
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      const actionWindow = 30;
      if (gestureState.dx < -actionWindow) {
        setRevealedSide("right");
        Animated.spring(translateX, {
          toValue: -ACTION_WIDTH,
          useNativeDriver: true,
        }).start();
      } else if (gestureState.dx > actionWindow) {
        setRevealedSide("left");
        Animated.spring(translateX, {
          toValue: ACTION_WIDTH,
          useNativeDriver: true,
        }).start();
      } else {
        setRevealedSide("none");
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const resetPosition = () => {
    setRevealedSide("none");
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.cardContainer}>
      {/* Action gauche - Delete */}
      {revealedSide === "left" && onDelete && (
        <View style={styles.leftAction}>
          <TouchableOpacity
            style={[styles.actionHidden, styles.deleteAction]}
            onPress={() => {
              resetPosition();
              onDelete();
            }}
          >
            <Icon name="delete" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Action droite - Edit */}
      {revealedSide === "right" && onEdit && (
        <View style={styles.rightAction}>
          <TouchableOpacity
            style={[styles.actionHidden, styles.editAction]}
            onPress={() => {
              resetPosition();
              onEdit();
            }}
          >
            <Icon name="edit" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Carte principale */}
      <Animated.View
        style={[styles.cardWrapper, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            if (revealedSide !== "none") {
              resetPosition();
            }
          }}
          style={{ flex: 1 }}
        >
          <ThemedView
            style={[
              styles.card,
              { borderTopColor },
              revealedSide === "left" && styles.cardLeftRevealed,
              revealedSide === "right" && styles.cardRightRevealed,
            ]}
          >
            {/* Header */}
            <View
              style={[
                styles.header,
                revealedSide === "left" && styles.headerLeftRevealed,
                revealedSide === "right" && styles.headerRightRevealed,
              ]}
            >
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
        </TouchableOpacity>
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
  leftAction: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 80,
    zIndex: 1,
  },
  rightAction: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    zIndex: 1,
  },
  actionHidden: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  editAction: {
    backgroundColor: "#3498db",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  deleteAction: {
    backgroundColor: "#e74c3c",
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
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
  cardLeftRevealed: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  cardRightRevealed: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerLeftRevealed: {
    borderTopLeftRadius: 0,
  },
  headerRightRevealed: {
    borderTopRightRadius: 0,
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
