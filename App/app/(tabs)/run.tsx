import { useEffect, useRef, useState } from "react";
import { View, Text, Button, Alert, StyleSheet } from "react-native";
import * as Location from "expo-location";
import MapView, { Polyline } from "react-native-maps";
import { getToken } from "../../utils/token";
import { useRouter } from "expo-router";

export default function RunScreen() {
  const [running, setRunning] = useState(false);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [path, setPath] = useState<{ latitude: number; longitude: number }[]>([]);
const pathRef = useRef<{ latitude: number; longitude: number }[]>([]);



  const router = useRouter();

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

      startRun(); // ✅ startRun appelé UNE seule fois ici
    };

    initialize();

    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
      if (locationInterval.current) clearInterval(locationInterval.current);
    };
  }, []);

  const startRun = () => {
    setRunning(true);
    setStartTime(new Date());

    timerInterval.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    locationInterval.current = setInterval(async () => {
  console.log("🔄 Nouvelle position demandée");

  const loc = await Location.getCurrentPositionAsync({});
  setLocation(loc);

  const newPoint = {
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude,
  };

  console.log("📍 Nouvelle position GPS :", newPoint);

  // Calcul de distance
  if (pathRef.current.length > 0) {
    const prevPoint = pathRef.current[pathRef.current.length - 1];
    const dist = getDistanceFromLatLon(
      prevPoint.latitude,
      prevPoint.longitude,
      newPoint.latitude,
      newPoint.longitude
    );

    console.log("📏 Distance calculée :", dist.toFixed(2));

    if (dist < 1000) {
      setDistance((prev) => {
        const newDist = prev + dist;
        console.log("✅ Distance actuelle (m):", newDist.toFixed(2));
        return newDist;
      });
    } else {
      console.log("⚠️ Téléportation ignorée (> 1km)");
    }
  } else {
    console.log("🟢 Premier point enregistré");
  }

  // Met à jour path via ref + state pour l'affichage
  pathRef.current.push(newPoint);
  setPath([...pathRef.current]);

}, 3000);


  };

  const handleStop = async () => {
    setRunning(false);
    if (timerInterval.current) clearInterval(timerInterval.current);
    if (locationInterval.current) clearInterval(locationInterval.current);

    const token = await getToken();

    await fetch("http://192.168.1.42:3000/api/courses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        distance: parseFloat((distance / 1000).toFixed(2)),
        duration,
        start_time: startTime?.toISOString(),
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
      >
        <Polyline coordinates={path} strokeColor="blue" strokeWidth={4} />
      </MapView>

      <View style={styles.panel}>
  <Text style={{ fontSize: 18, fontWeight: "bold" }}>
    ⏱ Temps : {duration}s
  </Text>
  <Text style={{ fontSize: 18, fontWeight: "bold" }}>
  📏 Disstance :{" "}
  {distance < 1000
    ? `${Math.round(distance)} m`
    : `${(distance / 1000).toFixed(2)} km`}
</Text>

  <Button title="Arrêter la course" onPress={handleStop} />
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
