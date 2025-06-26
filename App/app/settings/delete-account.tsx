import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { getToken, removeToken } from "../../utils/token";
import { useRouter } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import BackButton from "../../components/BackButton";

export default function DeleteAccountScreen() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const backgroundColor = isDark ? "#1c1c1c" : "#fff";
  const textColor = isDark ? "#fff" : "#1c1c1c";
  const inputColor = isDark ? "#2c2c2c" : "#eee";

  const handleDelete = async () => {
    if (!password || password.length < 6) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }

    Alert.alert(
      "Suppression de compte",
      "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            const token = await getToken();
            try {
              const res = await fetch("http://192.168.1.42:3000/api/auth/delete-account", {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ password }),
              });

              const data = await res.json();
              if (res.ok) {
                await removeToken();
                Alert.alert("✅ Compte supprimé");
                router.replace("/login");
              } else {
                Alert.alert("Erreur", data.message || "Échec de la suppression.");
              }
            } catch (err) {
              Alert.alert("Erreur", "Impossible de contacter le serveur.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <BackButton />
      <Text style={[styles.title, { color: "#f44336" }]}>Supprimer mon compte</Text>

      <TextInput
        style={[styles.input, { backgroundColor: inputColor, color: textColor }]}
        placeholder="Mot de passe"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={[styles.input, { backgroundColor: inputColor, color: textColor }]}
        placeholder="Confirmer le mot de passe"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
      />

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteText}>Supprimer définitivement</Text>
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
    marginBottom: 25,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#fdd835",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  deleteButton: {
    backgroundColor: "#ff4d4d",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
