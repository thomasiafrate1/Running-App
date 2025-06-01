import { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
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
  const res = await fetch("http://192.168.1.64:3000/api/goals/history", {
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

      const res = await fetch(`http://192.168.1.64:3000/api/courses/stats`, {
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
          const res = await fetch("http://192.168.1.64:3000/api/auth/me", {
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
      await fetch("http://192.168.1.64:3000/api/goals/daily", {
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
      <Text style={styles.title}>👤 Profil</Text>

      {user && (
        <>
          <Text style={styles.text}>Email : {user.email}</Text>
          <Text style={styles.text}>ID : {user.id}</Text>
        </>
      )}

      <View style={styles.stats}>
        <Text style={styles.subTitle}>📊 Mes statistiques</Text>
        {stats ? (
          <>
            <Text>🏃 Courses : {stats.totalCourses}</Text>
            <Text>
  📍{" "}
  {typeof stats.totalDistance === "number"
    ? `${stats.totalDistance.toFixed(2)} km`
    : "Distance inconnue"}{" "}
  
</Text>
            <Text>⏱ Temps total : {Math.round(stats.totalDuration / 60)} min</Text>
            <Text>
  🚀 Vitesse moyenne :{" "}
  {stats.avgSpeed != null
    ? stats.avgSpeed.toFixed(2)
    : "N/A"}{" "}
  km/h
</Text>
<View>
  <Text style={styles.subTitle}>📅 Historique Objectifs</Text>
  <Text>
    ✅ Objectifs atteints :{" "}
    {goalHistory.filter((g) => g.completed).length} / {goalHistory.length}
  </Text>

  {goalHistory.map((goal, i) => (
    <Text key={i}>
      {goal.date} – {goal.label} – {goal.completed ? "✅" : "❌"}
    </Text>
  ))}
</View>




          </>
        ) : (
          <Text>Chargement des stats...</Text>
        )}
      </View>

      <Button title="Se déconnecter" color="#ff4444" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 15 },
  text: { fontSize: 16, marginBottom: 5 },
  subTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  stats: { marginVertical: 20 },
});
