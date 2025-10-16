import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { ScreenLayout } from "@/components/perso_components/screenLayout";
import { useTheme } from "@/contexts/ThemeContext";
import { BackButton } from "@/components/perso_components/BackButton";
import { SwipeableCard } from "@/components/perso_components/swipeableCard";

interface Notification {
  id: number;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: "info" | "warning" | "success" | "error";
}

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "Capteur connecté",
      message: "Votre capteur de frisbee a été connecté avec succès.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
      type: "success",
    },
    {
      id: 2,
      title: "Nouvelle session",
      message: "Votre dernière session d'entraînement a été sauvegardée.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: true,
      type: "info",
    },
    {
      id: 3,
      title: "Batterie faible",
      message: "La batterie de votre capteur est faible (15%).",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      read: false,
      type: "warning",
    },
    {
      id: 4,
      title: "Record personnel battu !",
      message:
        "Félicitations ! Vous avez atteint une vitesse de 85 km/h, votre nouveau record !",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
      read: false,
      type: "success",
    },
    {
      id: 5,
      title: "Mise à jour disponible",
      message:
        "Une nouvelle version de l'application est disponible avec de nouvelles fonctionnalités.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      read: true,
      type: "info",
    },
    {
      id: 6,
      title: "Connexion perdue",
      message:
        "La connexion avec votre capteur a été interrompue. Vérifiez la portée Bluetooth.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18), // 18 hours ago
      read: false,
      type: "error",
    },
    {
      id: 7,
      title: "Objectif atteint",
      message:
        "Bravo ! Vous avez effectué 50 lancers aujourd'hui et atteint votre objectif quotidien.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
      type: "success",
    },
    {
      id: 8,
      title: "Calibrage nécessaire",
      message:
        "Votre capteur nécessite un recalibrage pour maintenir la précision des mesures.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36), // 1.5 days ago
      read: false,
      type: "warning",
    },
    {
      id: 9,
      title: "Données synchronisées",
      message:
        "Toutes vos données d'entraînement ont été synchronisées avec succès.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      read: true,
      type: "info",
    },
    {
      id: 10,
      title: "Erreur de capteur",
      message:
        "Le capteur a rencontré une erreur. Redémarrez l'appareil et reconnectez-le.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
      read: false,
      type: "error",
    },
    {
      id: 11,
      title: "Nouvelle fonctionnalité",
      message:
        "Découvrez l'analyse de trajectoire 3D maintenant disponible dans l'onglet Statistiques !",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96), // 4 days ago
      read: true,
      type: "info",
    },
    {
      id: 12,
      title: "Maintenance programmée",
      message:
        "Maintenance serveur prévue dimanche de 2h à 4h. Certaines fonctionnalités pourraient être indisponibles.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120), // 5 days ago
      read: false,
      type: "warning",
    },
  ]);

  const getIconForType = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "warning":
        return "warning";
      case "error":
        return "close-circle";
      default:
        return "information-circle";
    }
  };

  const getColorForType = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "#4CAF50";
      case "warning":
        return "#FF9800";
      case "error":
        return "#F44336";
      default:
        return theme.primary;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `Il y a ${minutes} min`;
    } else if (hours < 24) {
      return `Il y a ${hours}h`;
    } else {
      return `Il y a ${days}j`;
    }
  };

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    setShowHeaderMenu(false);
  };

  const clearAllNotifications = () => {
    Alert.alert(
      "Effacer toutes les notifications",
      "Êtes-vous sûr de vouloir supprimer toutes les notifications ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Effacer tout",
          style: "destructive",
          onPress: () => {
            setNotifications([]);
            setShowHeaderMenu(false);
          },
        },
      ]
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const HeaderRight = () => (
    <View style={styles.headerRightContainer}>
      {showHeaderMenu && (
        <View
          style={[
            styles.dropdownMenu,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {unreadCount > 0 && (
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: theme.border }]}
              onPress={markAllAsRead}
            >
              <Ionicons name="checkmark-done" size={20} color={theme.primary} />
              <ThemedText style={[styles.menuText, { color: theme.text }]}>
                Marquer tout lu
              </ThemedText>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={clearAllNotifications}
          >
            <Ionicons name="trash-outline" size={20} color="#e74c3c" />
            <ThemedText style={[styles.menuText, { color: "#e74c3c" }]}>
              Effacer tout
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity
        onPress={() => setShowHeaderMenu(!showHeaderMenu)}
        style={[styles.headerButton, { backgroundColor: theme.surface }]}
      >
        <Ionicons name="ellipsis-horizontal" size={24} color={theme.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenLayout
      title={`Notifs${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
      theme={theme}
      headerLeft={<BackButton />}
      headerRight={<HeaderRight />}
    >
      <TouchableOpacity
        style={styles.container}
        activeOpacity={1}
        onPress={() => setShowHeaderMenu(false)}
      >
        <View
          style={[styles.innerContainer, { backgroundColor: theme.background }]}
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="notifications-off-outline"
                size={64}
                color={theme.primary}
                style={{ opacity: 0.5 }}
              />
              <ThemedText
                style={[styles.emptyText, { color: theme.text, opacity: 0.7 }]}
              >
                Aucune notification
              </ThemedText>
            </View>
          ) : (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {notifications.map((notification) => (
                <SwipeableCard
                  key={notification.id}
                  title={notification.title}
                  cardId={notification.id}
                  borderTopColor={getColorForType(notification.type)}
                  onEdit={() => markAsRead(notification.id)}
                  onDelete={() => deleteNotification(notification.id)}
                  theme={theme}
                >
                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <View style={styles.iconAndTitle}>
                        <Ionicons
                          name={getIconForType(notification.type)}
                          size={20}
                          color={getColorForType(notification.type)}
                          style={styles.notificationIcon}
                        />
                        <View style={styles.titleContainer}>
                          <ThemedText
                            style={[
                              styles.notificationTitle,
                              {
                                color: theme.text,
                                fontWeight: notification.read
                                  ? "normal"
                                  : "bold",
                              },
                            ]}
                          >
                            {notification.title}
                          </ThemedText>
                          {!notification.read && (
                            <View
                              style={[
                                styles.unreadDot,
                                { backgroundColor: theme.primary },
                              ]}
                            />
                          )}
                        </View>
                      </View>
                    </View>
                    <ThemedText
                      style={[
                        styles.notificationMessage,
                        { color: theme.text, opacity: 0.8 },
                      ]}
                    >
                      {notification.message}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.notificationTimestamp,
                        { color: theme.primary, opacity: 0.7 },
                      ]}
                    >
                      {formatTimestamp(notification.timestamp)}
                    </ThemedText>
                  </View>
                </SwipeableCard>
              ))}
            </ScrollView>
          )}
        </View>
      </TouchableOpacity>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 16,
  },
  headerRightContainer: {
    position: "relative",
    marginRight: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownMenu: {
    position: "absolute",
    top: 50,
    right: -10,
    borderWidth: 1,
    borderRadius: 12,
    elevation: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    minWidth: 140,
    overflow: "visible",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  menuText: {
    fontSize: 13,
    fontWeight: "500",
  },
  notificationContent: {
    width: "100%",
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  iconAndTitle: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  notificationIcon: {
    marginRight: 8,
  },
  notificationTitle: {
    fontSize: 14,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationMessage: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  notificationTimestamp: {
    fontSize: 11,
  },
});
