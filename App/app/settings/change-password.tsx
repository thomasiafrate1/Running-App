import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { getToken } from "../../utils/token";
import { useRouter } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import BackButton from "../../components/BackButton";

export default function ChangePasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [current, setCurrent] = useState("");
  const router = useRouter();
  const { theme } = useTheme();

  const isDark = theme === "dark";
  const backgroundColor = isDark ? "#1c1c1c" : "#fff";
  const textColor = isDark ? "#fff" : "#1c1c1c";
  const inputBg = isDark ? "#2c2c2c" : "#eee";
  const inputText = isDark ? "#fff" : "#000";

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
    <View style={[styles.container, { backgroundColor }]}>
      <BackButton/>
      <Text style={[styles.title, { color: "#fdd835" }]}>Mot de passe actuel</Text>
      <TextInput
        style={[styles.input, { backgroundColor: inputBg, color: inputText }]}
        placeholder="Mot de passe actuel"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={current}
        onChangeText={setCurrent}
      />

      <Text style={[styles.title, { color: "#fdd835" }]}>Nouveau mot de passe</Text>
      <TextInput
        style={[styles.input, { backgroundColor: inputBg, color: inputText }]}
        placeholder="Nouveau mot de passe"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={[styles.input, { backgroundColor: inputBg, color: inputText }]}
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
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  input: {
    borderColor: "#fdd835",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
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
