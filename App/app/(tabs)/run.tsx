import { useEffect, useRef, useState } from "react";
import { View, Text, Button, Alert, StyleSheet } from "react-native";
import * as Location from "expo-location";
import MapView, { Polyline } from "react-native-maps";
import { getToken } from "../../utils/token";
import { useRouter } from "expo-router";

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





  const router = useRouter();
  const avgSpeed = duration > 0 ? (distance / 1000) / (duration / 3600) : 0;
// km/h


const timerInterval = useRef<number | null>(null);
const locationInterval = useRef<number | null>(null);

  useEffect(() => {
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
    router.replace("/");
  };

  if (!location) {
    return (
      <View style={styles.center}>
        <Text>Chargement de la position GPS...</Text>
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
      <Polyline coordinates={path} strokeColor="blue" strokeWidth={4} />

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
      {/* Mode objectif : bouton pour activer/désactiver */}
      <View style={{ marginBottom: 10 }}>
        <Button
          title={goalMode ? "🎯 Mode objectif activé" : "🏃 Mode libre activé"}
          color={goalMode ? "#4caf50" : "#2196f3"}
          onPress={() => {
            setGoalMode(!goalMode);
            setTargetPoint(null); // reset le point si on change de mode
          }}
        />
      </View>

      {/* Infos de la course */}
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>
        ⏱ Temps : {formatDuration(duration)}
      </Text>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>
        📏 Distance :{" "}
        {distance < 1000
          ? `${Math.round(distance)} m`
          : `${(distance / 1000).toFixed(2)} km`}
      </Text>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>
        🚀 Vitesse : {speed.toFixed(2)} km/h
      </Text>

      {/* Boutons : démarrer / pause / stop */}
      {!running ? (
        <Button title="Démarrer la course" onPress={startRun} />
      ) : paused ? (
        <Button title="Reprendre" onPress={startRun} />
      ) : (
        <>
          <Button title="Pause" onPress={pauseRun} />
          <View style={{ marginTop: 10 }} />
          <Button title="Arrêter la course" onPress={handleStop} />
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
  panel: {
    backgroundColor: "white",
    padding: 15,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
