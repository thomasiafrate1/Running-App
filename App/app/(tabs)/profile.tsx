import { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity } from "react-native";
import { getToken, removeToken } from "../../utils/token";
import { useRouter } from "expo-router";



type Stats = {
  totalCourses: number;
  totalDistance: number;
  totalDuration: number;
  avgSpeed?: number;
};


export default function ProfileScreen() {
  const [user, setUser] = useState<{ id: number; email: string } | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const router = useRouter();
  const [goalHistory, setGoalHistory] = useState([]);

  

useEffect(() => {

  const fetchGoalHistory = async () => {
  const token = await getToken();
  const res = await fetch("http://10.188.218.47:3000/api/goals/history", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  setGoalHistory(data);
};


  const fetchStats = async () => {
    try {
      console.log("🔄 Tentative de récupération du token...");
      const token = await getToken();
      console.log("🔑 Token récupéré :", token);

      const res = await fetch(`http://10.188.218.47:3000/api/courses/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("❌ Erreur de réponse :", res.status);
        return;
      }

      const data = await res.json();
      console.log("📊 Données reçues :", data);
      setStats(data);
      } catch (err) {
        console.error("💥 Erreur lors de la récupération des stats :", err);
      }
      const token = await getToken();
      console.log("TOKEN:", token);

      };

       const fetchUser = async () => {
        const token = await getToken();
        try {
          const res = await fetch("http://10.188.218.47:3000/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await res.json();
          setUser(data.user); // <- "user" est le champ que tu as dans ton res.json
        } catch (err) {
          console.error("Erreur lors de la récupération de l'utilisateur :", err);
        }
      };

      fetchUser();

      fetchStats();

      const createDailyGoal = async () => {
    const token = await getToken();
    try {
      await fetch("http://10.188.218.47:3000/api/goals/daily", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error("Erreur lors de la création de l’objectif quotidien", err);
    }
  };

  createDailyGoal();

}, []);


  const handleLogout = async () => {
    await removeToken();
    router.replace("/login");
  };

  return (
  <View style={styles.container}>
    <Text style={styles.title}>Profil</Text>

    {user && (
      <View style={styles.userBox}>
        <Text style={styles.userText}>{user.email}</Text>
        <Text style={styles.userText}>ID : {user.id}</Text>
      </View>
    )}

    {stats && (
      <>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.totalCourses}</Text>
            <Text style={styles.statLabel}>Courses</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.totalDistance.toFixed(2)} km</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{Math.round(stats.totalDuration / 60)} min</Text>
            <Text style={styles.statLabel}>Temps total</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {stats.avgSpeed != null ? stats.avgSpeed.toFixed(2) : "N/A"} km/h
            </Text>
            <Text style={styles.statLabel}>Vitesse moy.</Text>
          </View>
        </View>

        <View style={styles.goalSection}>
          <Text style={styles.subTitle}>Objectifs Accomplis</Text>
          <Text style={styles.goalSummary}>
            {goalHistory.filter(g => g.completed).length} 
          </Text>
        </View>
      </>
    )}

    <View style={styles.bottom}>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  </View>
);


}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c1c1c",
    padding: 20,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fdd835",
    marginBottom: 20,
    textAlign: "center",
  },
  userBox: {
    marginBottom: 20,
    alignItems: "center",
  },
  userText: {
    fontSize: 22,
    color: "white",
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 20,
  },
  statBox: {
    width: 130,
    height: 70,
    backgroundColor: "#2c2c2c",
    borderColor: "#fdd835",
    borderWidth: 1,
    borderRadius: 0,
    margin: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fdd835",
  },
  statLabel: {
    fontSize: 13,
    color: "#ccc",
    marginTop: 4,
  },
  goalSection: {
    marginTop: 30,
    alignItems: "center",
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fdd835",
    marginBottom: 8,
  },
  goalSummary: {
    fontSize: 16,
    color: "white",
  },
  bottom: {
    marginTop: "auto",
    width: "100%",
  },
  logoutButton: {
    backgroundColor: "#fdd835",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1c1c1c",
  },
});
