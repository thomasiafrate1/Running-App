import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { getToken } from "../utils/token";

type User = {
  id: number;
  username: string;
  email: string;
  profile_picture?: string;
  totalDistance: number;
  courseCount: number;
};

export default function LeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const token = await getToken();
      try {
        const res = await fetch("http://192.168.1.42:3000/api/leaderboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setLeaderboard(data);
      } catch (err) {
        console.error("Erreur leaderboard :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 50 }} color="#fdd835" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Leaderboard</Text>
      <FlatList
        data={leaderboard}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <Text style={styles.rank}>#{index + 1}</Text>
            <Image
              source={
                item.profile_picture
                  ? { uri: item.profile_picture }
                  : require("../assets/images/logoRunYnov.png")
              }
              style={styles.avatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.username}>{item.username || item.email}</Text>
              <Text style={styles.detail}>
                {item.totalDistance?.toFixed(2) || 0} km | {item.courseCount} courses
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c1c1c",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fdd835",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2c2c2c",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#fdd83533",
  },
  rank: {
    fontSize: 18,
    color: "#fdd835",
    width: 30,
    textAlign: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  detail: {
    color: "#ccc",
    fontSize: 13,
  },
});

