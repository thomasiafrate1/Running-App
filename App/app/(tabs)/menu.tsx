import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

export default function MenuScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const backgroundColor = isDark ? "#1c1c1c" : "#fff";
  const itemBg = isDark ? "#2c2c2c" : "#eee";
  const textColor = isDark ? "#fff" : "#1c1c1c";

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: "#fdd835", textAlign: "center", marginTop:13 }]}> Menu</Text>

      <TouchableOpacity
        style={[styles.item, { backgroundColor: itemBg }]}
        onPress={() => router.push("/notifications")}
      >
        <Ionicons name="notifications" size={22} color="#fdd835" />
        <Text style={[styles.text, { color: textColor }]}>Notifications</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.item, { backgroundColor: itemBg }]}
        onPress={() => router.push("/leaderboard")}
      >
        <Ionicons name="trophy" size={22} color="#fdd835" />
        <Text style={[styles.text, { color: textColor }]}>Classement</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.item, { backgroundColor: itemBg }]}
        onPress={() => router.push("/settings")}
      >
        <Ionicons name="settings" size={22} color="#fdd835" />
        <Text style={[styles.text, { color: textColor }]}>Paramètres</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 25,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  text: {
    fontSize: 16,
    marginLeft: 12,
  },
});
