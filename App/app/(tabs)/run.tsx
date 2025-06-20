import { useEffect, useRef, useState } from "react";
import { View, Text, Button, Alert, StyleSheet } from "react-native";
import * as Location from "expo-location";
import MapView, { Polyline } from "react-native-maps";
import { getToken } from "../../utils/token";
import * as Notifications from "expo-notifications";
import { useRouter, useLocalSearchParams } from "expo-router";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // ✅ Affiche la notif en haut de l'écran
    shouldShowList: true,   // ✅ Affiche la notif dans le centre de notif
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});




function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;

  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}min ${sec}s`;
}




export default function RunScreen() {
  const [running, setRunning] = useState(false);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [path, setPath] = useState<{ latitude: number; longitude: number }[]>([]);
const pathRef = useRef<{ latitude: number; longitude: number }[]>([]);
const [speed, setSpeed] = useState(0);
const [paused, setPaused] = useState(false);
const [goalMode, setGoalMode] = useState(false); // mode objectif
const [targetPoint, setTargetPoint] = useState<{ latitude: number; longitude: number } | null>(null); // point d'arrivée
const { challengePath } = useLocalSearchParams();
const challengeCoords = challengePath ? JSON.parse(challengePath as string) : null;



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





  const router = useRouter();
  const avgSpeed = duration > 0 ? (distance / 1000) / (duration / 3600) : 0;
// km/h


const timerInterval = useRef<number | null>(null);
const locationInterval = useRef<number | null>(null);

  useEffect(() => {

    const setupNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      console.log("🚫 Notifications non autorisées");
    }
  };

  setupNotifications();

  


    const initialize = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log("Permission GPS :", status); // 👈 très important
      if (status !== "granted") {
        Alert.alert("Permission refusée", "Activez la géolocalisation.");
        return;
      }

      try {
    const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        maximumAge: 5000,
        timeout: 10000,
    });
    console.log("GPS position récupérée:", current);
    setLocation(current);
    } catch (error) {
    console.error("Erreur GPS :", error);
    Alert.alert("Erreur", "Impossible de récupérer votre position GPS");
    }
    };

    initialize();

    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
      if (locationInterval.current) clearInterval(locationInterval.current);
    };
  }, []);

  const pauseRun = () => {
  if (timerInterval.current) clearInterval(timerInterval.current);
  setPaused(true);
};

const sendNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🏁 Course terminée",
      body: `Tu as couru ${(distance / 1000).toFixed(2)} km en ${formatDuration(duration)} !`,
    },
    trigger: null, // immédiat
  });
};

const startRun = () => {
  if (paused) {
    // Reprendre
    setPaused(false);
    timerInterval.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
    return;
  }

  // Premier démarrage
  setRunning(true);
  setStartTime(new Date());
  setDuration(0);
  setDistance(0);
  pathRef.current = [];
  setPath([]);

  timerInterval.current = setInterval(() => {
    setDuration((prev) => prev + 1);
  }, 1000);

  locationInterval.current = setInterval(async () => {
    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc);

    const newPoint = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      timestamp: Date.now(),
    };

    if (targetPoint) {
  const distToTarget = getDistanceFromLatLon(
    newPoint.latitude,
    newPoint.longitude,
    targetPoint.latitude,
    targetPoint.longitude
  );

  console.log("🎯 Distance vers objectif :", distToTarget.toFixed(2), "m");

  if (distToTarget < 20) { // Seuil de 20m
    console.log("✅ Objectif atteint !");
    handleStop();
    return;
  }
}


    if (pathRef.current.length > 0) {
      const prevPoint = pathRef.current[pathRef.current.length - 1];
      const dist = getDistanceFromLatLon(
        prevPoint.latitude,
        prevPoint.longitude,
        newPoint.latitude,
        newPoint.longitude
      );

      const timeDiff = (newPoint.timestamp - (prevPoint.timestamp || newPoint.timestamp - 3000)) / 1000;
      const instSpeed = (dist / 1000) / (timeDiff / 3600);

      if (!isNaN(instSpeed) && isFinite(instSpeed)) setSpeed(instSpeed);

      if (dist < 1000) {
        setDistance((prev) => prev + dist);
      }
    }

    pathRef.current.push(newPoint);
    setPath([...pathRef.current]);
  }, 3000);
};


  const handleStop = async () => {
    setRunning(false);
    if (timerInterval.current) clearInterval(timerInterval.current);
    if (locationInterval.current) clearInterval(locationInterval.current);

    const token = await getToken();

    await fetch("http://192.168.1.64:3000/api/courses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  distance: parseFloat((distance / 1000).toFixed(2)),
  duration,
  start_time: startTime?.toISOString(),
  path: pathRef.current,
  avg_speed: parseFloat(avgSpeed.toFixed(2))

}),

    });

    Alert.alert("Course enregistrée !");
    if (distance / 1000 >= 2) { // ✔️ tu peux ajuster ce seuil selon ton objectif
  try {
    await fetch("http://192.168.1.64:3000/api/goals/complete", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("🎯 Objectif quotidien validé !");
  } catch (err) {
    console.error("❌ Erreur lors de la validation de l’objectif", err);
  }
}
  await sendNotification();

    router.replace("/");

  };

  if (!location) {
    return (
      <View style={styles.center}>
        <Text style={{color:"white"}}>Chargement de la position GPS...</Text>
      </View>
    );
  }

return (
  <View style={{ flex: 1 }}>
    

    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      customMapStyle={darkMapStyle}
      showsUserLocation
      onPress={(e) => {
        if (!running && goalMode) {
          const coord = e.nativeEvent.coordinate;
          setTargetPoint(coord);
          console.log("🎯 Point d'arrivée défini :", coord);
        }
      }}
    >
      {/* Trajet effectué */}
      <Polyline coordinates={path} strokeColor="#f6b500" strokeWidth={4} />
      {challengeCoords && (
  <Polyline
    coordinates={challengeCoords}
    strokeColor="#999"  // gris
    strokeWidth={3}
    lineDashPattern={[4, 6]} // pointillés pour différencier
  />
)}

      {/* Trait A ➝ B si en mode objectif */}
      {goalMode && targetPoint && location && (
        <Polyline
          coordinates={[
            {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            },
            targetPoint,
          ]}
          strokeColor="green"
          strokeDasharray={[5, 5]}
          strokeWidth={2}
          
        />
      )}
    </MapView>
    

    <View style={styles.panel}>
      <View style={styles.button2}>
        <Button
          title={goalMode ? "🎯 Mode objectif activé" : "🏃 Mode libre activé"}
          color={goalMode ? "#f6b500" :"rgb(33, 243, 68)"}
          
          onPress={() => {
            setGoalMode(!goalMode);
            setTargetPoint(null); 
          }}
        />
      </View>
  <View style={styles.statsRow}>
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>Durée</Text>
      <Text style={styles.statValue}>{formatDuration(duration)}</Text>
    </View>
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>Distance</Text>
      <Text style={styles.statValue}>
        {distance < 1000
          ? `${Math.round(distance)} m`
          : `${(distance / 1000).toFixed(2)} km`}
      </Text>
    </View>
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>Vitesse</Text>
      <Text style={styles.statValue}>{speed.toFixed(1)} km/h</Text>
    </View>
  </View>

  {!running ? (
    <View style={styles.button}>
      <Text style={styles.buttonText} onPress={startRun}>Démarrer</Text>
    </View>
  ) : paused ? (
    <View style={styles.button}>
      <Text style={styles.buttonText} onPress={startRun}>Reprendre</Text>
    </View>
  ) : (
    <>
      <View style={styles.button}>
        <Text style={styles.buttonText} onPress={pauseRun}>Pause</Text>
      </View>
      <View style={styles.button}>
        <Text style={styles.buttonText} onPress={handleStop}>Terminer</Text>
      </View>
    </>
  )}
</View>

  </View>
);


}

function getDistanceFromLatLon(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  panel: {
    backgroundColor: "#121212", // fond noir
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderColor: "#333",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 15,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: "#f6b500",
    borderRadius: 8,
  },
  statLabel: {
    color: "#f6b500",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  statValue: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#f6b500",
    paddingVertical: 12,
    marginTop: 10,
    borderRadius: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  button2: {
    marginBottom:20,
    
  },
});

