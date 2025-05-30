import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity
} from "react-native";
import MapView, { Polyline } from "react-native-maps";
import { getToken } from "../../utils/token";

type PathPoint = { latitude: number; longitude: number };

type Course = {
  id: number;
  user_id: number;
  email?: string;
  distance: number;
  duration: number;
  start_time: string;
  path?: string; // JSON.stringify(path) stocké dans MySQL
};

export default function HistoryScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [viewMode, setViewMode] = useState<"mine" | "recent">("mine");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchCourses = async () => {
    setLoading(true);
    const token = await getToken();
    const endpoint = viewMode === "recent" ? "courses/recent" : "courses";

    try {
      const res = await fetch(`http://192.168.1.42:3000/api/${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error("Erreur fetch :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [viewMode]);

  const renderItem = ({ item }: { item: Course }) => {
    const path: PathPoint[] = item.path ? JSON.parse(item.path) : [];

    return (
      <TouchableOpacity onPress={() =>
  router.push(
    viewMode === "recent"
      ? `/course/historyDetail?id=${item.id}&public=true`
      : `/course/historyDetail?id=${item.id}`
  )
}>
        <View style={styles.courseRow}>
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
              pitchEnabled={false}
              rotateEnabled={false}
            >
              <Polyline coordinates={path} strokeColor="blue" strokeWidth={3} />
            </MapView>
          ) : (
            <View style={styles.placeholderMap}>
              <Text>Pas de trace</Text>
            </View>
          )}

          <View style={styles.info}>
            <Text>📍 {item.distance.toFixed(2)} km en {item.duration}s</Text>
            <Text>🕒 {new Date(item.start_time).toLocaleString()}</Text>
            {viewMode === "recent" && item.email && (
              <Text>📧 {item.email}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏃 Historique des courses</Text>

      <View style={styles.buttonRow}>
        <Button
          title="Mes courses"
          onPress={() => setViewMode("mine")}
          color={viewMode === "mine" ? "#1e90ff" : "gray"}
        />
        <Button
          title="Dernières courses"
          onPress={() => setViewMode("recent")}
          color={viewMode === "recent" ? "#1e90ff" : "gray"}
        />
      </View>

      {loading ? (
        <Text style={styles.loading}>Chargement...</Text>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  loading: { textAlign: "center", marginTop: 20 },
  courseRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    gap: 10,
  },
  map: {
    width: 120,
    height: 100,
    borderRadius: 8,
  },
  placeholderMap: {
    width: 120,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
    justifyContent: "center",
  },
});
