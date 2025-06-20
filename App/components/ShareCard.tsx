// components/ShareCard.tsx
import { View, Text, StyleSheet, Image } from "react-native";
import MapView, { Polyline } from "react-native-maps";

type Props = {
  path: { latitude: number; longitude: number }[];
  distance: number;
  duration: number;
  avg_speed: number;
  date: string;
  userEmail?: string;
  profile_picture?: string;
};

function formatDuration(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}min ${sec}s`;
}

export default function ShareCard({
  path,
  distance,
  duration,
  avg_speed,
  date,
  userEmail,
  profile_picture,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>🏃 Ma course</Text>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: path[0]?.latitude || 0,
          longitude: path[0]?.longitude || 0,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        customMapStyle={[{ elementType: "geometry", stylers: [{ color: "#1c1c1c" }] }]}
        pointerEvents="none"
      >
        <Polyline coordinates={path} strokeColor="#fdd835" strokeWidth={4} />
      </MapView>

      <View style={styles.stats}>
        <Text style={styles.stat}>📏 {distance.toFixed(2)} km</Text>
        <Text style={styles.stat}>⏱️ {formatDuration(duration)}</Text>
        <Text style={styles.stat}>🚀 {avg_speed.toFixed(2)} km/h</Text>
        <Text style={styles.stat}>📅 {date}</Text>
      </View>

      {userEmail && (
        <View style={styles.footer}>
          {profile_picture && (
            <Image source={{ uri: profile_picture }} style={styles.avatar} />
          )}
          <Text style={styles.email}>{userEmail}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 300,
    backgroundColor: "#121212",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 20,
    color: "#fdd835",
    fontWeight: "bold",
  },
  map: {
    width: "100%",
    height: 150,
    borderRadius: 10,
  },
  stats: {
    gap: 4,
  },
  stat: {
    color: "white",
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },
  email: {
    color: "#fdd835",
    fontSize: 12,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
});
