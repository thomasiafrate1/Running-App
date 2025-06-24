import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { getToken } from "../../utils/token";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ChangePasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const router = useRouter();
  const [current, setCurrent] = useState(""); 

  const handleChange = async () => {
    if (!password || password.length < 6) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }

    const token = await getToken();

    try {
      const res = await fetch("http://192.168.1.42:3000/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
  currentPassword: current,
  newPassword: password,
}),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("✅ Mot de passe changé !");
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
        <Text style={styles.title}>Mot de passe actuel</Text>
        <TextInput
        style={styles.input}
        placeholder="Mot de passe actuel"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={current}
        onChangeText={setCurrent}
        />

      <Text style={styles.title}>Changer le mot de passe</Text>

      <TextInput
        style={styles.input}
        placeholder="Nouveau mot de passe"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmer le mot de passe"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
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
