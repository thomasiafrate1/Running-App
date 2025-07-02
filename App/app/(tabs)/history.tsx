import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image
} from "react-native";
import MapView, { Polyline } from "react-native-maps";
import { getToken } from "../../utils/token";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";


type PathPoint = { latitude: number; longitude: number };

type Course = {
  id: number;
  user_id: number;
  email?: string;
  profile_picture?: string; // 👈 Ajout
  distance: number;
  duration: number;
  start_time: string;
  path?: string;
  avg_speed?: number;
  likeCount?: number;
commentCount?: number;

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




function formatDurationParts(seconds: number): { value: string; unit: string } {
  if (seconds < 60) {
    return { value: `${seconds}`, unit: "s" };
  }
  const min = Math.floor(seconds / 60);
  return { value: `${min}`, unit: "min" };
}



export default function HistoryScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [viewMode, setViewMode] = useState<"mine" | "recent">("mine");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
const isDark = theme === "dark";

const backgroundColor = isDark ? "#1c1c1c" : "#fff";
const cardColor = isDark ? "#2b2b2b" : "#f4f4f4";
const textColor = isDark ? "#fff" : "#1c1c1c";
const accent = "#fdd835";
const borderColor = accent;

  const fetchCourses = async () => {
    setLoading(true);
    const token = await getToken();
    const endpoint = viewMode === "recent" ? "courses/recent" : "courses";

    try {
      const res = await fetch(`http://10.188.218.47:3000/api/${endpoint}`, {
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
    console.log("📷 photo de", item.email, "=>", item.profile_picture);

    return (
      <TouchableOpacity onPress={() =>
  router.push(
    viewMode === "recent"
      ? `/course/historyDetail?id=${item.id}&public=true`
      : `/course/historyDetail?id=${item.id}`
  )
}>
  <Text style={styles.dateText}>
        {new Date(item.start_time).toLocaleString()}
    </Text>
        <View style={[styles.courseRow, { backgroundColor: cardColor, borderColor }]}>
              
  {path.length > 1 ? (
    
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: path[0].latitude,
        longitude: path[0].longitude,
        latitudeDelta: 0.002,
        longitudeDelta: 0.002,
      }}
      customMapStyle={darkMapStyle}
      scrollEnabled={false}
      zoomEnabled={false}
      pitchEnabled={false}
      rotateEnabled={false}
    >
      <Polyline coordinates={path} strokeColor="#fdd835" strokeWidth={3} />
    </MapView>
  ) : (
    <View style={styles.placeholderMap}>
      <Text style={{ color: "white" }}>Pas de trace</Text>
    </View>
  )}

  <View style={styles.info}>
    
    {viewMode === "recent" && (
  <View style={styles.userRow}>
    {item.profile_picture ? (
      <View style={styles.avatarWrapper}>
        <Image
          source={{ uri: item.profile_picture }}
          style={styles.avatar}
        />
      </View>
    ) : (
      <View style={styles.avatarPlaceholder}>
        <Text style={{ color: "#999", fontSize: 10 }}>?</Text>
      </View>
    )}
    <Text style={[styles.emailText, { color: "#f6b500" }]}>{item.email}</Text>
  </View>
)}

    <View style={styles.testCourseRow}>
      <Text style={[styles.infoText, { color: "#f6b500" }]}>
        {item.distance.toFixed(2)} <Text style={{color : textColor}}>km</Text>
      </Text>
      {(() => {
  const { value, unit } = formatDurationParts(item.duration);
  return (
    <Text style={[styles.infoText, { color: "#f6b500" }]}>
      {value}
      <Text style={{ color: textColor }}> {unit}</Text>
    </Text>
  );
})()}


    </View>
    {item.avg_speed != null && (
    <View style={styles.row}>
      <Text style={styles.infoText}>
        {item.avg_speed.toFixed(2)} <Text style={{ color: textColor }}>km/h</Text>
      </Text>
    </View>
    
  )}
  <View style={styles.row2}>
  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
    <Ionicons name="heart" size={18} color="#fdd835" />
    <Text style={{ color: textColor }}>{item.likeCount || 0}</Text>
  </View>
  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
    <Ionicons name="chatbubble-ellipses" size={18} color="#fdd835" />
    <Text style={{ color: textColor }}>{item.commentCount || 0}</Text>
  </View>
</View>



    
  </View>
</View>

      </TouchableOpacity>
    );
  };

  return (
  <View style={[styles.container, { backgroundColor }]}>
    
    <Text style={[styles.title, { color: borderColor, marginTop:20 }]}>Historique des courses</Text>

    <View style={styles.buttonRow}>
      <Button
        title="Mes courses"
        onPress={() => setViewMode("mine")}
        color={viewMode === "mine" ? "#f6b500" : "gray"}
      />
      <Button
        title="Dernières courses"
        onPress={() => setViewMode("recent")}
        color={viewMode === "recent" ? "#f6b500" : "gray"}
      />
    </View>

    {loading ? (
      <Text style={[styles.loading, { color: textColor }]}>Chargement...</Text>
    ) : courses.length === 0 ? (
      <Text style={[styles.loading, { color: textColor }]}>
        {viewMode === "mine" ? "Aucune course effectuée." : "Aucune course à afficher."}
      </Text>
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
  container: {
    flex: 1,
    backgroundColor: "#1c1c1c",
    padding: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#f6b500",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,

  },

  userRow: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 8,
  gap: 8,
},
avatarWrapper: {
  width: 30,
  height: 30,
  borderRadius: 15,
  overflow: "hidden",
  borderWidth: 1,
  borderColor: "#f6b500",
},
avatar: {
  width: "100%",
  height: "100%",
  resizeMode: "cover",
},
avatarPlaceholder: {
  width: 30,
  height: 30,
  borderRadius: 15,
  backgroundColor: "#444",
  justifyContent: "center",
  alignItems: "center",
},


  dateText : {
    zIndex: 1000,
    position : "absolute",
    right : 0,
    top : 15,
    color : "#f6b500",
  },


  loading: {
    color: "white",
    textAlign: "center",
    marginTop: 20,
  },
  courseRow: {
    flexDirection: "row", // 📍 map à gauche, infos à droite
    marginTop : 35,
    backgroundColor: "#2b2b2b",
    borderRadius: 0,
    marginBottom: 15,
    borderTopColor: "#f6b500",
    borderBottomColor: "#f6b500",
    borderWidth: 1,
    overflow: "hidden",
    height: 125,
  },
  row: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 4,
  marginLeft: 20,
  marginRight: 20,
},
row2: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 4,
  marginLeft: 20,
  marginRight: 20,
  
},

  map: {
    width: 120,
    height: 150,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  placeholderMap: {
    width: 120,
    height: 100,
    backgroundColor: "#444",
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },

  testCourseRow:{
        flexDirection: "row",
        position: "relative",
    justifyContent: "space-between",
    marginLeft: 25,
    marginRight: 25
  },
  info: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
  },
  infoText: {
    color: "#f6b500",
    fontSize: 14,
    marginBottom: 4,

  },
  emailText: {
    color: "#f6b500",
    fontSize: 17,
    fontStyle: "italic",
    fontWeight:"bold"
  },
});


