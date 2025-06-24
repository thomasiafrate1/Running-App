import { useEffect, useState, useRef  } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal
} from "react-native";
import MapView, { Polyline } from "react-native-maps";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getToken } from "../../utils/token";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import ShareCard from "../../components/ShareCard";
import { useTheme } from "../../context/ThemeContext";




type Course = {
  id: number;
  user_id: number;
  distance: number;
  duration: number;
  start_time: string;
  path?: string;
  email?: string;
  profile_picture?: string;
  avg_speed?: number;
};

type Comment = {
  username: string;
  content: string;
  created_at: string;
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
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [path, setPath] = useState<{ latitude: number; longitude: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [showModal, setShowModal] = useState(false);
 const { theme } = useTheme();
const isDark = theme === "dark";

const backgroundColor = isDark ? "#1c1c1c" : "#fff";
const textColor = isDark ? "#fff" : "#1c1c1c";
const cardBg = isDark ? "#2c2c2c" : "#f2f2f2";
const inputBg = isDark ? "#2c2c2c" : "#e0e0e0";
const placeholderColor = isDark ? "#888" : "#555";
const borderColor = "#fdd835";

  



useEffect(() => {
  console.log("👤 Utilisateur connecté :", user);
}, [user]);



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
          setPath(JSON.parse(data.path));
        } catch (e) {
          console.warn("Erreur parsing path:", e);
        }
      }
      setLoading(false);
      fetchLikes();
      fetchComments();
    };
    fetchCourse();
  }, [id]);

  const fetchLikes = async () => {
  const token = await getToken();
  const res = await fetch(`http://192.168.1.42:3000/api/interactions/${id}/likes`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  console.log("🔁 Likes fetched:", data);
  setLikeCount(data.count);
  setLiked(data.liked);
};


const fetchComments = async () => {
  const res = await fetch(`http://192.168.1.42:3000/api/interactions/${id}/comments`);
  const data = await res.json();
  console.log("🧾 Commentaires récupérés :", data);
  setComments(data);
};



const handleLike = async () => {
  const token = await getToken();
  console.log("❤️ Toggle like...");
  await fetch(`http://192.168.1.42:3000/api/interactions/${id}/like`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  await fetchLikes(); // très important
};


const handleAddComment = async () => {
  if (!newComment.trim()) return;

  const token = await getToken();
  console.log("💬 Envoi commentaire :", newComment);

  const res = await fetch(`http://192.168.1.42:3000/api/interactions/${id}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content: newComment }),
  });

  const result = await res.json();
  console.log("🧾 Réponse commentaire :", result);

  setNewComment("");
  fetchComments(); // rafraîchir la liste
};

const shareViewRef = useRef(null);

const handleShare = async () => {
  const permission = await MediaLibrary.requestPermissionsAsync();
  if (!permission.granted) {
    alert("Permission refusée pour accéder à la galerie.");
    return;
  }

  try {
    const uri = await captureRef(shareViewRef, {
      format: "png",
      quality: 1,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    } else {
      await MediaLibrary.saveToLibraryAsync(uri);
      alert("Image enregistrée !");
    }
  } catch (err) {
    console.error("Erreur capture partage :", err);
  }
};




  if (loading || !course) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Chargement...</Text>
      </View>
    );
  }

return (
  <KeyboardAvoidingView
    behavior={Platform.OS === "ios" ? "padding" : undefined}
    style={{ flex: 1, backgroundColor }}
  >
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor }]}
      showsVerticalScrollIndicator={false}
    >
     <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={borderColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: borderColor }]}>Détails de la course</Text>
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
          customMapStyle={isDark ? darkMapStyle : []}
        >
          <Polyline coordinates={path} strokeColor={borderColor} strokeWidth={4} />
        </MapView>
      ) : (
        <View style={[styles.noMap, { backgroundColor: cardBg }]}>
          <Text style={{ color: textColor }}>Pas de trace GPS</Text>
        </View>
      )}

      {course.profile_picture && (
        <View style={{ alignItems: "center", marginBottom: 10 }}>
          <Image
            source={{ uri: course.profile_picture }}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              borderWidth: 2,
              borderColor,
              marginBottom: 10,
            }}
          />
        </View>
      )}

      {course.email && <Text style={[styles.infoText, { color: textColor }]}>{course.email}</Text>}

      <View style={styles.info}>
        <Text style={[styles.infoBox, { color: textColor, borderColor }]}>{course.distance.toFixed(2)} km</Text>
        <Text style={[styles.infoBox, { color: textColor, borderColor }]}>{formatDuration(course.duration)}</Text>
      </View>

      <View style={styles.info}>
        <Text style={[styles.infoBox, { color: textColor, borderColor }]}>{new Date(course.start_time).toLocaleString()}</Text>
        {course.avg_speed != null && (
          <Text style={[styles.infoBox, { color: textColor, borderColor }]}>{course.avg_speed.toFixed(2)} km/h</Text>
        )}
      </View>

      {/* ❤️ Likes */}
      <TouchableOpacity
        onPress={handleLike}
        style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginVertical: 12 }}
      >
        <Ionicons name={liked ? "heart" : "heart-outline"} size={28} color={liked ? "red" : borderColor} />
        <Text style={{ color: textColor, marginLeft: 10 }}>{likeCount} j’aime</Text>
      </TouchableOpacity>

      {/* 🚀 Mode Défi (si c'est sa propre course) */}
        {user?.id === course.user_id && (
          <TouchableOpacity
            style={{ backgroundColor: "#fdd835", padding: 12, borderRadius: 10, alignItems: "center", marginBottom: 20 }}
            onPress={() => setShowModal(true)}
          >
            <Text style={{ fontWeight: "bold" }}>🎯 Refaire cette course en mode défi</Text>
          </TouchableOpacity>
        )}

        {/* Modal */}
        <Modal visible={showModal} transparent animationType="slide">
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.7)" }}>
            <View style={{ backgroundColor: "white", padding: 20, borderRadius: 10, width: "80%" }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 15 }}>
                Voulez-vous lancer cette course en mode défi ?
              </Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Text style={{ color: "red", fontWeight: "bold" }}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowModal(false);
                    router.push({ pathname: "/run", params: { challengePath: JSON.stringify(path) } });
                  }}
                >
                  <Text style={{ color: "green", fontWeight: "bold" }}>Oui, lancer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      {/* 💬 Commentaires */}
      <Text style={[styles.infoText, { fontSize: 20, marginTop: 10, color: textColor }]}>Commentaires</Text>

      {comments.map((comment, index) => (
        <View key={index} style={{ backgroundColor: inputBg, padding: 10, borderRadius: 8, marginVertical: 5 }}>
  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
    <Text style={{ color: textColor, fontWeight: "bold" }}>{comment.username}</Text>
    <Text style={{ color: "#999", fontSize: 12 }}>{new Date(comment.created_at).toLocaleString()}</Text>
  </View>
  <Text style={{ color: textColor, marginTop: 5 }}>{comment.content}</Text>
</View>

      ))}

      {/* ➕ Nouveau commentaire */}
      <View
        style={{
          flexDirection: "row",
          marginTop: 10,
          alignItems: "center",
          backgroundColor: inputBg,
          paddingHorizontal: 10,
          borderRadius: 8,
          marginBottom: 30, // espace pour éviter le bas masqué
        }}
      >
        <TextInput
          style={{ color: textColor, flex: 1, padding: 10 }}
          placeholder="Ajouter un commentaire"
          placeholderTextColor="#888"
          value={newComment}
          onChangeText={setNewComment}
        />
        <TouchableOpacity onPress={handleAddComment}>
          <Ionicons name="send" size={24} color="#fdd835" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
  onPress={handleShare}
  style={{
    backgroundColor: "#fdd835",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  }}
>
  <Text style={{ fontWeight: "bold" }}>📤 Partager cette course</Text>
</TouchableOpacity>

<View style={{ position: "absolute", top: -1000 }} ref={shareViewRef} collapsable={false}>
  <ShareCard
    path={path}
    distance={course.distance}
    duration={course.duration}
    avg_speed={course.avg_speed || 0}
    date={new Date(course.start_time).toLocaleDateString()}
    userEmail={course.email}
    profile_picture={course.profile_picture}
  />
</View>


    </ScrollView>
  </KeyboardAvoidingView>
);


}

const styles = StyleSheet.create({
container: {
  padding: 20,
  paddingBottom: 600,
},

  scroll: {
  flex: 1,
  backgroundColor: "#1c1c1c",
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

