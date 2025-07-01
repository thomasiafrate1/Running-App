import { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { getToken, removeToken } from "../../utils/token";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";




type Stats = {
  totalCourses: number;
  totalDistance: number;
  totalDuration: number;
  avgSpeed?: number;
};

type Goal = {
  id: number;
  label: string;
  completed: boolean;
  date: string;
};

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





export default function ProfileScreen() {
  const [user, setUser] = useState<{ id: number; email: string; username: string; profile_picture: string | null } | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const router = useRouter();
  const [goalHistory, setGoalHistory] = useState<Goal[]>([]);
  const { theme } = useTheme();
const isDark = theme === "dark";
const backgroundColor = isDark ? "#1c1c1c" : "#fff";
const textColor = isDark ? "#fff" : "#1c1c1c";
const cardColor = isDark ? "#2c2c2c" : "#eee";
const borderColor = "#fdd835";

  const updateProfilePicture = async (base64Image: string) => {
  try {
    const token = await getToken();
    const res = await fetch(`http://10.15.6.135:3000/api/auth/${user?.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ profile_picture: base64Image }),
    });

    const data = await res.json();
    if (res.ok) {
      Alert.alert("Photo mise à jour.");
      setUser({ ...user!, profile_picture: base64Image });
    } else {
      Alert.alert("Erreur", data.message || "Échec de la mise à jour");
    }
  } catch (err) {
    Alert.alert("Erreur", "Impossible de mettre à jour la photo");
    console.error(err);
  }
};


const pickImage = async () => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert("Permission requise", "L'accès à la galerie est nécessaire.");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 1,
    base64: true,
  });

  if (!result.canceled && result.assets.length > 0) {
    const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
    updateProfilePicture(base64Img); // 👈 fonction à définir
  }
};
  

useEffect(() => {

  const fetchGoalHistory = async () => {
  const token = await getToken();
  const res = await fetch("http://10.15.6.135:3000/api/goals/history", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
if (Array.isArray(data)) {
  setGoalHistory(data);
} else {
  console.warn("⛔ Mauvaise réponse reçue :", data);
}

  };







  const fetchStats = async () => {
    try {
      console.log("🔄 Tentative de récupération du token...");
      const token = await getToken();
      console.log("🔑 Token récupéré :", token);

      const res = await fetch(`http://10.15.6.135:3000/api/courses/stats`, {
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
          const res = await fetch("http://10.15.6.135:3000/api/auth/me", {
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
      fetchGoalHistory();

      fetchStats();

      const createDailyGoal = async () => {
    const token = await getToken();
    try {
      await fetch("http://10.15.6.135:3000/api/goals/daily", {
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

  console.log("User", user?.username)

  return (
  <View style={[styles.container, { backgroundColor }]}>
    
    <View style={styles.logoutIconWrapper}>
      <TouchableOpacity
        onPress={() =>
          Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
            { text: "Annuler", style: "cancel" },
            { text: "Se déconnecter", style: "destructive", onPress: handleLogout },
          ])
        }
      >
        <Ionicons name="log-out-outline" size={26} color="#fdd835" />
      </TouchableOpacity>
    </View>

    <Text style={[styles.title, { color: borderColor, marginTop:20}]}>Profil</Text>

    {user && (
      <View style={styles.userBox}>
        <View style={styles.avatarContainer}>
          {user.profile_picture ? (
            <Image source={{ uri: user.profile_picture }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={{ color: "#666" }}>Pas de photo</Text>
            </View>
          )}
          <TouchableOpacity onPress={pickImage} style={styles.editIcon}>
            <Ionicons name="pencil" size={20} color="#1c1c1c" />
          </TouchableOpacity>
        </View>
        <Text style={[styles.username, { color: borderColor }]}>{user.username}</Text>
        <Text style={[styles.email, { color: textColor }]}>{user.email}</Text>
      </View>
    )}

    {stats ? (
  <>
    <View style={styles.statsContainer}>
      <View style={[styles.statBox, { backgroundColor: cardColor, borderColor }]}>
        <Text style={[styles.statLabel, { color: textColor }]}>Courses</Text>
        <Text style={[styles.statValue, { color: borderColor }]}>
          {stats.totalCourses ?? 0}
        </Text>
        
      </View>

      <View style={[styles.statBox, { backgroundColor: cardColor, borderColor }]}>
        <Text style={[styles.statLabel, { color: textColor }]}>Distance</Text>
        <Text style={[styles.statValue, { color: borderColor }]}>
          {typeof stats.totalDistance === "number" ? `${stats.totalDistance.toFixed(2)} km` : "0"}
        </Text>
        
      </View>

      <View style={[styles.statBox, { backgroundColor: cardColor, borderColor }]}>
        <Text style={[styles.statLabel, { color: textColor }]}>Temps total</Text>
        <Text style={[styles.statValue, { color: borderColor }]}>
          {typeof stats.totalDuration === "number" ? `${Math.round(stats.totalDuration / 60)} min` : "0"}
        </Text>
        
      </View>

      <View style={[styles.statBox, { backgroundColor: cardColor, borderColor }]}>
        <Text style={[styles.statLabel, { color: textColor }]}>Vitesse moy.</Text>
        <Text style={[styles.statValue, { color: borderColor }]}>
          {typeof stats.avgSpeed === "number" ? `${stats.avgSpeed.toFixed(2)} km/h` : "0"}
        </Text>
        
      </View>
    </View>

    <View style={styles.goalSection}>
      <Text style={[styles.subTitle, { color: borderColor }]}>Objectifs Accomplis</Text>
      <Text style={[styles.goalSummary, { color: textColor }]}>
        {goalHistory?.filter((g) => g.completed).length ?? 0}
      </Text>
    </View>
  </>
) : (
  <Text style={[styles.goalSummary, { color: textColor, marginTop: 20 }]}>
    Aucune donnée disponible
  </Text>
)}

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
  logoutIconWrapper: {
  position: "absolute",
  top: 40,
  right: 20,
  zIndex: 10,
},

avatarContainer: {
  position: "relative",
  width: 100,
  height: 100,
  marginBottom: 10,
},
editIcon: {
  position: "absolute",
  bottom: 0,
  right: 0,
  backgroundColor: "#fdd835",
  borderRadius: 20,
  padding: 4,
  borderWidth: 2,
  borderColor: "#1c1c1c", // pour bien découper sur fond sombre
},
username: {
  fontSize: 22,
  fontWeight: "bold",
  color: "#fdd835",
  marginBottom: 3,
},
email: {
  fontSize: 14,
  color: "#ccc",
  marginBottom: 10,
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

  avatarWrapper: {
  width: 100,
  height: 100,
  borderRadius: 50,
  overflow: "hidden",
  borderWidth: 2,
  borderColor: "#fdd835",
  marginBottom: 10,
},
avatar: {
  width: "100%",
  height: "100%",
  borderRadius: 50, // ✅ rend l'image ronde
  borderWidth: 2,
  borderColor: "#fdd835",
},
avatarPlaceholder: {
  width: 100,
  height: 100,
  borderRadius: 50,
  backgroundColor: "#333",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 10,
},


});
