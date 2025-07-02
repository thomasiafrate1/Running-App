import { useEffect, useState, useCallback  } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions, Image } from "react-native";
import MapView, { Polyline } from "react-native-maps";
import { getToken } from "../../utils/token";
import { useFocusEffect } from "@react-navigation/native";
import { LineChart } from "react-native-chart-kit";
import { useTheme } from "../../context/ThemeContext";


type User = {
  username: string;
}

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
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [path, setPath] = useState<{ latitude: number; longitude: number }[]>([]);
  const [weeklyData, setWeeklyData] = useState<number[]>([]);


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
const { theme } = useTheme();
const isDark = theme === "dark";

const backgroundColor = isDark ? "#1c1c1c" : "#fff";
const cardColor = isDark ? "#2c2c2c" : "#eee";
const textColor = isDark ? "#fff" : "#1c1c1c";
const borderColor = "#fdd835";



  const [dailyGoal, setDailyGoal] = useState<{
  label: string;
  target: number;
  unit: string;
  completed: boolean;
} | null>(null);

useEffect(() => {
  const fetchUser = async () => {
    const token = await getToken();
    const res = await fetch("http://10.188.218.47:3000/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUser(data.user);
  };

  fetchUser();
}, []);


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
        const resGoal = await fetch(`http://10.188.218.47:3000/api/goals/daily`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const statsData = await resStats.json();
        const courses = await resCourses.json();

const now = new Date();
const thisWeek: number[] = Array(7).fill(0);

courses.forEach((course: Course) => {
  const courseDate = new Date(course.start_time);

  // Trouver le lundi de cette semaine
  const currentDay = now.getDay(); // 0 = dimanche, 1 = lundi...
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((currentDay + 6) % 7)); // lundi de la semaine

  // Comparer avec la date de la course
  const isSameWeek =
    courseDate >= monday && courseDate <= now;

  if (isSameWeek) {
    const dayIndex = (courseDate.getDay() + 6) % 7; // transforme dimanche (0) en 6, lundi en 0, etc.
    thisWeek[dayIndex] += course.distance;
  }
});

setWeeklyData(thisWeek);


        const goalData = await resGoal.json();
        console.log("🎯 Objectif reçu :", goalData);


        setStats(statsData);

        if (courses.length > 0) {
          setLastCourse(courses[0]);
          if (courses[0].path) {
            setPath(JSON.parse(courses[0].path));
          }
        }

        setDailyGoal(goalData);

      } catch (err) {
        console.error("Erreur de chargement :", err);
      }

      

    };

    fetchData();
  }, [])
);

  console.log("📊 weeklyData = ", weeklyData);


  return (
  <ScrollView style={[styles.container, { backgroundColor }]}>
    <View style={styles.backgroundDecor}>
    <View style={styles.stripe1} />
    <View style={[styles.stripe2, { top: 300 }]} />
    <View style={[styles.stripe3, { top: 600 }]} />

  </View>
  <Image source={require("../../assets/images/logoRunYnov.png")} style={styles.logo} />
    <Text style={[styles.welcome,{color : textColor }]}>Bienvenue {user?.username} !</Text>



    {/* 📊 Stats */}
    <View style={[styles.section, { backgroundColor: cardColor, borderColor }]}>
      <Text style={[styles.sectionTitle, { color: borderColor }]}>Mes statistiques</Text>
      {stats ? (
        <>
          <Text style={[styles.text, { color: textColor }]}>Courses : {stats.totalCourses}</Text>
          <Text style={[styles.text, { color: textColor }]}>
            {typeof stats.totalDistance === "number"
              ? `${stats.totalDistance.toFixed(2)} km`
              : "Distance inconnue"}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            Durée totale : {Math.round(stats.totalDuration / 60)} min
          </Text>
        </>
      ) : (
        <Text style={[styles.text, { color: textColor }]}>Chargement...</Text>
      )}
    </View>

    {/* 🏃 Dernière course */}
    <View style={[styles.section, { backgroundColor: cardColor, borderColor }]}>
      <Text style={[styles.sectionTitle, { color: borderColor }]}>Dernière course</Text>
      {lastCourse ? (
        <>
          <Text style={[styles.text, { color: textColor }]}>
            {new Date(lastCourse.start_time).toLocaleString()}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            {lastCourse.distance.toFixed(2)} km en {formatDuration(lastCourse.duration)}
          </Text>

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
              <Polyline coordinates={path} strokeColor="#fdd835" strokeWidth={3} />
            </MapView>
          ) : (
            <Text style={{ color: "gray" }}>Aucun tracé disponible</Text>
          )}
        </>
      ) : (
        <Text style={[styles.goalText, { color: textColor }]}>
          Pas encore de course enregistrée
        </Text>
      )}
    </View>

    {/* 🎯 Objectif */}
    {dailyGoal && (
      <View style={[styles.goalContainer, { backgroundColor: cardColor, borderColor }]}>
        <Text style={[styles.goalTitle, { color: borderColor }]}>Objectif du jour :</Text>
        <Text style={[styles.goalText, { color: textColor }]}>
          {dailyGoal.label}{" "}
          <Text style={{ fontWeight: "bold" }}>
            {dailyGoal.target} {dailyGoal.unit}
          </Text>
        </Text>
        <Text
          style={[
            styles.goalStatus,
            dailyGoal.completed ? styles.goalSuccess : styles.goalFail,
          ]}
        >
          {dailyGoal.completed ? "✅ Objectif atteint !" : "❌ Pas encore atteint"}
        </Text>
      </View>
    )}

    {/* 📈 Graph */}
    {weeklyData.length > 0 && (
      <View style={[styles.section, { backgroundColor: cardColor, borderColor }]}>
        <Text style={[styles.sectionTitle, { color: borderColor }]}>Évolution</Text>
        <LineChart
          data={{
            labels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
            datasets: [{ data: weeklyData }],
          }}
          width={Dimensions.get("window").width - 80}
          height={220}
          yAxisSuffix=" km"
          chartConfig={{
            backgroundColor: backgroundColor,
            backgroundGradientFrom: backgroundColor,
            backgroundGradientTo: backgroundColor,
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(253, 216, 53, ${opacity})`,
            labelColor: () => textColor,
          }}
          bezier
          style={{ borderRadius: 10 }}
        />
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
    marginBottom: 30,
    borderColor: "#fdd835",
    borderWidth: 1,

  },
  backgroundDecor: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: -1,
},

stripe1: {
  position: "absolute",
  width: "150%",
  height: 100,
  backgroundColor: "#fdd835",
  transform: [{ rotate: "-5deg" }],
  opacity: 0.05, // pour ne pas trop gêner le texte
  left: -50,
},
stripe2: {
  position: "absolute",
  width: "150%",
  height: 100,
  backgroundColor: "#fdd835",
  transform: [{ rotate: "10deg" }],
  opacity: 0.05, // pour ne pas trop gêner le texte
  left: -50,
},
stripe3: {
  position: "absolute",
  width: "150%",
  height: 100,
  backgroundColor: "#fdd835",
  transform: [{ rotate: "-5deg" }],
  opacity: 0.05, // pour ne pas trop gêner le texte
  left: -50,
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
    marginBottom: 30,
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
  welcome: {
  fontSize: 20,
  fontWeight: "bold",
  color: "#fdd835",
  textAlign: "center",
  marginBottom: 12,
},

logo: {
  width: 80,
  height: 80,
  resizeMode: "contain",
  alignSelf: "center",
  marginBottom: 20,
},

});


