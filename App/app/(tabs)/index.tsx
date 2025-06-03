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

  const darkMapStyle = [
  {
    elementType: "geometry",
    stylers: [{ color: "#212121" }],
  },
  {
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#212121" }],
  },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#181818" }],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [{ color: "#2c2c2c" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8a8a8a" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#3c3c3c" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#000000" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3d3d3d" }],
  },
];


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
      <Text style={styles.title}>Tableau de bord</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes statistiques</Text>
        {stats ? (
          <>
            <Text style={styles.text}>Courses : {stats.totalCourses}</Text>
            <Text style={styles.text}>
  {" "}
  {typeof stats.totalDistance === "number"
    ? `${stats.totalDistance.toFixed(2)} km`
    : "Distance inconnue"}{" "}
  
</Text>

            <Text style={styles.text}>Durée total : {Math.round(stats.totalDuration / 60)} min</Text>
          </>
        ) : (
          <Text>Chargement...</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dernière course</Text>
        {lastCourse ? (
          <>
            <Text style={styles.text}>{new Date(lastCourse.start_time).toLocaleString()}</Text>
            <Text style={styles.text}>{lastCourse.distance.toFixed(2)} km en {formatDuration(lastCourse.duration)}</Text>

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
                customMapStyle={darkMapStyle}
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
    <Text style={{ fontWeight: "bold", color: "#f8b400" }}>Objectif du jour :</Text>
    <Text style={{color : "#fff"}}>{dailyGoal.label}</Text>
    <Text style={[styles.goalStatus, dailyGoal.completed ? styles.goalSuccess : styles.goalFail]}>
  {dailyGoal.completed ? "✅ Objectif atteint !" : "❌ Pas encore atteint"}
</Text>
  </View>
)}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c1c1c",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fdd835",
    marginBottom: 25,
    textAlign: "center",
  },
  section: {
    backgroundColor: "#2c2c2c",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderColor: "#fdd835",
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#fdd835",
    marginBottom: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  text: {
    color: "#fff",
    fontSize: 15,
    marginBottom: 6,
  },
  goalContainer: {
    backgroundColor: "#2c2c2c",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderColor: "#fdd835",
    borderWidth: 1,
  },
  goalTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#fdd835",
    marginBottom: 5,
  },
  goalText: {
    color: "#fff",
    marginBottom: 5,
  },
  goalStatus: {
    fontWeight: "bold",
    marginTop: 8,
    fontSize: 15,
  },
  goalSuccess: {
    color: "lime",
  },
  goalFail: {
    color: "#ff4d4d",
  },
  map: {
    height: 160,
    borderRadius: 10,
    marginTop: 12,
  },
});


