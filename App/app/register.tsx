import { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { useRouter } from "expo-router";
import { register } from "../services/authService";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

const handleRegister = async () => {
  try {
    const data = await register(email, password);
    console.log("Réponse du backend :", data);

    if (data.message === "Utilisateur inscrit") {
      Alert.alert("Inscription réussie !");
      router.replace("/login");
    } else {
      Alert.alert("Erreur", data.message || "Erreur inconnue");
    }
  } catch (error) {
    console.error("Erreur lors de l’inscription :", error);
    Alert.alert("Erreur réseau", "Impossible de contacter le serveur");
  }
};

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Email" onChangeText={setEmail} value={email} />
      <TextInput placeholder="Mot de passe" secureTextEntry onChangeText={setPassword} value={password} />
      <Button title="Créer le compte" onPress={handleRegister} />
    </View>
  );
}
