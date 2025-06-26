// app/menu/theme.tsx

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import BackButton from "../../components/BackButton";

export default function ThemeScreen() {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#1c1c1c" : "#f5f5f5" }]}>
      <BackButton/>
      <Text style={[styles.title, { color: isDark ? "#fff" : "#1c1c1c" }]}>
        Thème actuel : {isDark ? "Sombre 🌙" : "Clair ☀️"}
      </Text>

      <TouchableOpacity style={styles.button} onPress={toggleTheme}>
        <Ionicons name="color-palette" size={22} color="#1c1c1c" />
        <Text style={styles.buttonText}>Changer de thème</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#fdd835",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  buttonText: {
    fontWeight: "bold",
    color: "#1c1c1c",
    fontSize: 16,
  },
});
