import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import MapView, { Polyline } from "react-native-maps";
import { useLocalSearchParams } from "expo-router";
import { getToken } from "../../utils/token";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image } from "react-native";



type Course = {
  id: number;
  distance: number;
  duration: number;
  start_time: string;
  path?: string;
  email?: string;
   profile_picture?: string; // ✅ AJOUTE CECI
  avg_speed?: number;

};

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


function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;

  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}min ${sec}s`;
}


export default function HistoryDetailScreen() {
    
  const { id, public: isPublic } = useLocalSearchParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [path, setPath] = useState<{ latitude: number; longitude: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();


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
      <View style={styles.header}>
  <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
    <Ionicons name="arrow-back" size={24} color="#fdd835" />
  </TouchableOpacity>
  <Text style={styles.title}>     Détails de la course</Text>
</View>


      {path.length > 0 ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: path[0].latitude,
            longitude: path[0].longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          customMapStyle={darkMapStyle}
        >
          <Polyline coordinates={path} strokeColor="#fdd835" strokeWidth={4} />
        </MapView>
      ) : (
        <View style={styles.noMap}>
          <Text>Pas de trace GPS</Text>
        </View>
      )}
      {course.profile_picture ? (
  <View style={{ alignItems: "center", marginBottom: 10 }}>
    <Image
      source={{ uri: course.profile_picture }}
      style={{
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: "#fdd835",
        marginBottom: 10,
      }}
    />
  </View>
) : null}

        {course.email && (
    <Text style={styles.infoText}>{course.email}</Text>
  )}
      <View style={styles.info}>
        <Text style={styles.infoBox}>{course.distance.toFixed(2)} km</Text>
        <Text style={styles.infoBox}>{formatDuration(course.duration)}</Text>
  

</View>
  <View style={styles.info}>
    <Text style={styles.infoBox}>{new Date(course.start_time).toLocaleString()}</Text>
  {course.avg_speed != null && (
    <Text style={styles.infoBox}>{course.avg_speed.toFixed(2)} km/h</Text>
  )}
  </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#1c1c1c",
    height : "100%",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1c1c1c",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fdd835", // Jaune
    marginBottom: 20,
    textAlign: "center",
  },
  map: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    marginBottom:25

  },
  noMap: {
    height: 300,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginBottom: 20,
  },
  info: {
    padding: 15,
    borderRadius: 12,
    gap: 8,
    display:"flex",
    flexDirection:"row",
    justifyContent:"space-between",
    marginLeft:20,
    marginRight:20
  },
  infoText: {
    color: "#fff",
    fontSize: 25,
    textAlign:"center",
    marginBottom:15,
    fontWeight:"bold"
  },
    infoBox: {
    color: "#fff",
    borderColor:"#fdd835",
    borderWidth: 2,
    fontSize: 17,
    width:125,
    padding: 12,
    textAlign:"center",
    alignContent:"center",
    alignItems:"center"
  },
  header: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 20,
},
backButton: {
  marginRight: 10,
  padding: 4,
},

});

