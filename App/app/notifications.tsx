import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { getToken } from "../utils/token";

type Notification = {
  id: number;
  title: string;
  message: string;
  date: string;
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔔 Notifications</Text>
      <Text style={styles.subtitle}>Vous avez {notifications.length} notifications :</Text>

      {notifications.map((notif) => (
        <View key={notif.id} style={styles.card}>
          <Text style={styles.cardTitle}>{notif.title}</Text>
          <Text style={styles.cardMessage}>{notif.message}</Text>

        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1c1c1c",
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    color: "#fdd835",
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fdd835",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
    color: "#000",
  },
  cardMessage: {
    fontSize: 14,
    color: "#000",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#1c1c1c",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
