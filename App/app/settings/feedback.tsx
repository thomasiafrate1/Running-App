import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getToken } from "../../utils/token";
import { useTheme } from "../../context/ThemeContext";
import BackButton from "../../components/BackButton";

export default function FeedbackScreen() {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0); // ⭐ note de 1 à 5

  const { theme } = useTheme();
  const isDark = theme === "dark";
  const backgroundColor = isDark ? "#1c1c1c" : "#fff";
  const textColor = isDark ? "#fff" : "#1c1c1c";
  const inputColor = isDark ? "#2c2c2c" : "#eee";

  const handleSubmit = async () => {
    if (!feedback.trim() || rating === 0) {
      Alert.alert("Erreur", "Merci de donner une note et un avis.");
      return;
    }

    const token = await getToken();

    try {
      const res = await fetch("http://192.168.1.42:3000/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: feedback, rating }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("✅ Merci pour votre avis !");
        setFeedback("");
        setRating(0);
      } else {
        Alert.alert("Erreur", data.message || "Échec de l’envoi.");
      }
    } catch (err) {
      Alert.alert("Erreur", "Impossible de contacter le serveur.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
        <BackButton/>
      <Text style={[styles.title, { color: textColor }]}>🗨️ Donner un avis</Text>

      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <TouchableOpacity key={i} onPress={() => setRating(i)}>
            <Ionicons
              name={i <= rating ? "star" : "star-outline"}
              size={32}
              color="#fdd835"
              style={{ marginHorizontal: 4 }}
            />
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={[styles.input, { backgroundColor: inputColor, color: textColor }]}
        placeholder="Écris ton avis ici..."
        placeholderTextColor="#aaa"
        multiline
        numberOfLines={5}
        value={feedback}
        onChangeText={setFeedback}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Envoyer</Text>
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
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  input: {
    borderColor: "#fdd835",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    minHeight: 120,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#fdd835",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#1c1c1c",
    fontWeight: "bold",
    fontSize: 16,
  },
});
