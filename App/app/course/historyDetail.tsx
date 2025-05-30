import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import MapView, { Polyline } from "react-native-maps";
import { useLocalSearchParams } from "expo-router";
import { getToken } from "../../utils/token";

type Course = {
  id: number;
  distance: number;
  duration: number;
  start_time: string;
  path?: string;
  email?: string;
};

export default function HistoryDetailScreen() {
    
  const { id, public: isPublic } = useLocalSearchParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [path, setPath] = useState<{ latitude: number; longitude: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      const token = await getToken();
      const url = isPublic
      ? `http://192.168.1.42:3000/api/courses/public/${id}`
      : `http://192.168.1.42:3000/api/courses/${id}`;
      const res = await fetch(url, {
      headers: isPublic ? {} : { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setCourse(data);

      if (data.path) {
        try {
          const parsed = JSON.parse(data.path);
          setPath(parsed);
        } catch (e) {
          console.warn("Erreur parsing path:", e);
        }
      }

      setLoading(false);
    };

    fetchCourse();
  }, [id]);

  if (loading || !course) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📍 Détails de la course</Text>

      {path.length > 0 ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: path[0].latitude,
            longitude: path[0].longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Polyline coordinates={path} strokeColor="blue" strokeWidth={4} />
        </MapView>
      ) : (
        <View style={styles.noMap}>
          <Text>Pas de trace GPS</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text>📏 Distance : {course.distance.toFixed(2)} km</Text>
        <Text>⏱ Durée : {course.duration}s</Text>
        <Text>🕒 Date : {new Date(course.start_time).toLocaleString()}</Text>
        

        {course.email && <Text>📧 Utilisateur : {course.email}</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  map: {
    width: "100%",
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  noMap: {
    height: 300,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 20,
  },
  info: {
    gap: 10,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
  },
});
