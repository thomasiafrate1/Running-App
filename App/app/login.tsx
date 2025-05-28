import { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { useRouter } from "expo-router";
import { login } from "../services/authService";
import { saveToken } from "../utils/token";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    const data = await login(email, password);
    if (data.token) {
      await saveToken(data.token);
      Alert.alert("Connexion réussie !");
      router.replace("/"); // Redirige vers la page d'accueil
    } else {
      Alert.alert("Erreur", data.message || "Connexion échouée");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Email" onChangeText={setEmail} value={email} />
      <TextInput placeholder="Mot de passe" secureTextEntry onChangeText={setPassword} value={password} />
      <Button title="Connexion" onPress={handleLogin} />
      <Button title="Créer un compte" onPress={() => router.push("/register")} />
    </View>
  );
}
