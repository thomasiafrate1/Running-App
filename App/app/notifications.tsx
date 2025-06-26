import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { getToken } from "../utils/token";
import { useTheme } from "../context/ThemeContext";
import BackButton from "../components/BackButton";

type Notification = {
  id: number;
  title: string;
  message: string;
  date: string;
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { theme } = useTheme();

  const isDark = theme === "dark";
  const bgColor = isDark ? "#1c1c1c" : "#fff";
  const titleColor = isDark ? "#fdd835" : "#222";
  const subtitleColor = isDark ? "#ccc" : "#444";
  const cardBg = isDark ? "#fdd835" : "#f6f6f6";
  const cardText = isDark ? "#000" : "#000";

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = await getToken();
      try {
        const res = await fetch("http://192.168.1.42:3000/api/notifications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error("Erreur lors du chargement des notifications :", err);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <ScrollView style={[styles.container, { backgroundColor: bgColor }]}>
      <BackButton/>
      <Text style={[styles.title, { color: titleColor, marginTop: 43 }]}> Notifications</Text>
      <Text style={[styles.subtitle, { color: subtitleColor }]}>
        Vous avez {notifications.length} notifications :
      </Text>

      {notifications.map((notif) => (
        <View key={notif.id} style={[styles.card, { backgroundColor: cardBg }]}>
          <Text style={[styles.cardTitle, { color: cardText }]}>{notif.title}</Text>
          <Text style={[styles.cardMessage, { color: cardText }]}>{notif.message}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  card: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  cardMessage: {
    fontSize: 14,
  },
});
