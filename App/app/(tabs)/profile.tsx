import { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { getToken, removeToken } from "../../utils/token";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";




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


  const updateProfilePicture = async (base64Image: string) => {
  try {
    const token = await getToken();
    const res = await fetch(`http://192.168.1.42:3000/api/auth/${user?.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ profile_picture: base64Image }),
    });

    const data = await res.json();
    if (res.ok) {
      Alert.alert("✅ Photo mise à jour !");
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
  const res = await fetch("http://192.168.1.42:3000/api/goals/history", {
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

      const res = await fetch(`http://192.168.1.42:3000/api/courses/stats`, {
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
          const res = await fetch("http://192.168.1.42:3000/api/auth/me", {
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
      await fetch("http://192.168.1.42:3000/api/goals/daily", {
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
    {user.profile_picture ? (
      <View style={styles.avatarWrapper}>
        <Image source={{ uri: user.profile_picture }} style={styles.avatar} />
      </View>
      
    ) : (
      <View style={styles.avatarPlaceholder}>
        <Text style={{ color: "#666" }}>Pas de photo</Text>
      </View>
    )}
    <TouchableOpacity onPress={pickImage} style={styles.logoutButton}>
      <Text style={styles.logoutText}>Changer la photo</Text>
    </TouchableOpacity>
    <Text style={styles.username}>{user.username}</Text>
    <Text style={styles.userText}>{user.email}</Text>
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
            {goalHistory?.filter((g) => g.completed).length ?? 0}
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
  resizeMode: "cover",
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
username: {
  fontSize: 20,
  fontWeight: "bold",
  color: "#fdd835",
  marginBottom: 5,
},

});
