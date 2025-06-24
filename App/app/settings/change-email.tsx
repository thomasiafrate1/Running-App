import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { getToken } from "../../utils/token";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ChangeEmailScreen() {
  const [newEmail, setNewEmail] = useState("");
  const router = useRouter();

  const handleChange = async () => {
    if (!newEmail || !newEmail.includes("@")) {
      Alert.alert("Erreur", "Veuillez entrer une adresse email valide.");
      return;
    }

    const token = await getToken();

    try {
      const res = await fetch("http://192.168.1.42:3000/api/auth/change-email", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert(
          "📧 Vérification requise",
          "Un lien de validation vous a été envoyé à votre nouvelle adresse."
        );
        router.back();
      } else {
        Alert.alert("Erreur", data.message || "Une erreur est survenue.");
      }
    } catch (err) {
      Alert.alert("Erreur", "Impossible de contacter le serveur.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Changer mon email</Text>

      <TextInput
        style={styles.input}
        placeholder="Nouvelle adresse email"
        placeholderTextColor="#aaa"
        keyboardType="email-address"
        autoCapitalize="none"
        value={newEmail}
        onChangeText={setNewEmail}
      />

      <TouchableOpacity style={styles.button} onPress={handleChange}>
        <Text style={styles.buttonText}>Mettre à jour</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c1c1c",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    color: "#fdd835",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#2c2c2c",
    borderColor: "#fdd835",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    color: "white",
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
