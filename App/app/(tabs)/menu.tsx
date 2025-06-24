// app/(tabs)/menu.tsx

import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function MenuScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>☰ Menu</Text>

      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push("/notifications")}
      >
        <Ionicons name="notifications" size={22} color="#fdd835" />
        <Text style={styles.text}>Notifications</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push("/leaderboard")}
      >
        <Ionicons name="trophy" size={22} color="#fdd835" />
        <Text style={styles.text}>Classement</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push("/settings")}
      >
        <Ionicons name="settings" size={22} color="#fdd835" />
        <Text style={styles.text}>Paramètres</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1c1c1c",
    flex: 1,
    padding: 20,
  },
  title: {
    color: "#fdd835",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 25,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2c2c2c",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 12,
  },
});
