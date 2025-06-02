import { useEffect, useState, useCallback  } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import MapView, { Polyline } from "react-native-maps";
import { getToken } from "../../utils/token";
import { useFocusEffect } from "@react-navigation/native";

type Course = {
  id: number;
  distance: number;
  duration: number;
  start_time: string;
  path?: string;
};

type Stats = {
  totalCourses: number;
  totalDistance: number;
  totalDuration: number;
  distance : number;
};

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;

  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}min ${sec}s`;
}


export default function HomeScreen() {
  const [lastCourse, setLastCourse] = useState<Course | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [path, setPath] = useState<{ latitude: number; longitude: number }[]>([]);
  const [dailyGoal, setDailyGoal] = useState<{
  label: string;
  completed: boolean;
} | null>(null);

  

  useFocusEffect(
  useCallback(() => {
    const fetchData = async () => {
      const token = await getToken();

      try {
        const resStats = await fetch(`http://10.188.218.47:3000/api/courses/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const resCourses = await fetch(`http://10.188.218.47:3000/api/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const statsData = await resStats.json();
        const courses = await resCourses.json();

        setStats(statsData);

        // Objectif du jour : courir au moins 2 km
        const objectifAtteint =
          courses.length > 0 && courses[0].distance >= 2;

        setDailyGoal({
          label: "Courir au moins 2 km",
          completed: objectifAtteint,
        });


        if (courses.length > 0) {
          setLastCourse(courses[0]);
          if (courses[0].path) {
            setPath(JSON.parse(courses[0].path));
          }
        } else {
          setLastCourse(null); // 👈 gérer le cas aucune course
        }
      } catch (err) {
        console.error("Erreur de chargement :", err);
      }
    };

    fetchData();
  }, [])
);


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🏠 Tableau de bord</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Mes statistiques</Text>
        {stats ? (
          <>
            <Text>🏃 Courses : {stats.totalCourses}</Text>
            <Text>
  📍{" "}
  {typeof stats.totalDistance === "number"
    ? `${stats.totalDistance.toFixed(2)} km`
    : "Distance inconnue"}{" "}
  
</Text>

            <Text>⏱ Durée total : {Math.round(stats.totalDuration / 60)} min</Text>
          </>
        ) : (
          <Text>Chargement...</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏁 Dernière course</Text>
        {lastCourse ? (
          <>
            <Text>📅 {new Date(lastCourse.start_time).toLocaleString()}</Text>
            <Text>📍 {lastCourse.distance.toFixed(2)} km en {formatDuration(lastCourse.duration)}</Text>

            {path.length > 1 ? (
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: path[0].latitude,
                  longitude: path[0].longitude,
                  latitudeDelta: 0.002,
                  longitudeDelta: 0.002,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Polyline coordinates={path} strokeColor="blue" strokeWidth={3} />
              </MapView>
            ) : (
              <Text style={{ color: "gray" }}>Aucun tracé disponible</Text>
            )}
          </>
        ) : (
          <Text>Pas encore de course enregistrée</Text>
        )}
      </View>
      {dailyGoal && (
  <View style={{ marginVertical: 10 }}>
    <Text style={{ fontWeight: "bold" }}>🎯 Objectif du jour :</Text>
    <Text>{dailyGoal.label}</Text>
    <Text style={{ color: dailyGoal.completed ? "green" : "red" }}>
      {dailyGoal.completed ? "✅ Objectif atteint !" : "❌ Pas encore atteint"}
    </Text>
  </View>
)}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  map: {
    height: 150,
    marginTop: 10,
    borderRadius: 10,
  },
});
