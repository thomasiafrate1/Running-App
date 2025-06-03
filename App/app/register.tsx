import { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { register } from "../services/authService";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // ⬅️ Ajouté
  const router = useRouter();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return;
    }

    try {
      const data = await register(email, password);
      if (data.message === "Utilisateur inscrit") {
        Alert.alert("Inscription réussie !");
        router.replace("/login");
      } else {
        Alert.alert("Erreur", data.message || "Erreur inconnue");
      }
    } catch (error) {
      Alert.alert("Erreur réseau", "Impossible de contacter le serveur");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>S'inscrire</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        onChangeText={setEmail}
        value={email}
      />

      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        placeholderTextColor="#aaa"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmer le mot de passe"
        placeholderTextColor="#aaa"
        secureTextEntry
        onChangeText={setConfirmPassword}
        value={confirmPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Créer le compte</Text>
      </TouchableOpacity>

      <Text
        style={styles.linkText}
        onPress={() => router.push("/login")}
      >
        Vous avez déjà un compte ? Connectez-vous !
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c1c1c",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 26,
    color: "#fdd835",
    marginBottom: 30,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#2c2c2c",
    borderColor: "#fdd835",
    borderWidth: 1,
    color: "white",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    width: "100%",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#fdd835",
    paddingVertical: 14,
    borderRadius: 8,
    width: "100%",
    marginBottom: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#1c1c1c",
    fontWeight: "bold",
    fontSize: 16,
  },
  linkText: {
    color: "#fdd835",
    textDecorationLine: "underline",
    fontSize: 14,
  },
});
