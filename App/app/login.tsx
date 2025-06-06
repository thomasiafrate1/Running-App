import { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image
} from "react-native";
import { useRouter } from "expo-router";
import { login } from "../services/authService";
import { saveToken } from "../utils/token";
import "../assets/images/logoRunYnov.png"

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    const data = await login(email, password);
    if (data.token) {
      await saveToken(data.token);
      Alert.alert("Connexion réussie !");
      router.replace("/");
    } else {
      Alert.alert("Erreur", data.message || "Connexion échouée");
    }
  };

  return (
    <View style={styles.container}>
      <Image
  source={require("../assets/images/logoRunYnov.png")}
  style={{ width: 120, height: 120, marginBottom: 20 }}
  resizeMode="contain"
/>

      <Text style={styles.title}>Se connecter</Text>
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
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Connexion</Text>
      </TouchableOpacity>
            <Text style={styles.linkText} onPress={() => router.push("/register")}
      >Vous n'avez pas de compte ? Inscrivez-vous !</Text>
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
      linkText: {
    color: "#fdd835",
    textDecorationLine: "underline",
    fontSize: 14,
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
});
