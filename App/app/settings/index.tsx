import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";


export default function SettingsScreen() {
  const router = useRouter();

  const Item = ({ icon, label, path }: { icon: any; label: string; path: string }) => (
    <TouchableOpacity style={styles.item} onPress={() => router.push(path)}>
      <Ionicons name={icon} size={20} color="#fdd835" style={{ marginRight: 12 }} />
      <Text style={styles.itemText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Paramètres</Text>

      <Text style={styles.section}>Compte & Sécurité</Text>
      <Item icon="key-outline" label="Changer le mot de passe" path="/settings/change-password" />
      <Item icon="mail-outline" label="Changer l'adresse email" path="/settings/change-email" />
      <Item icon="trash-outline" label="Supprimer mon compte" path="/settings/delete-account" />

      <Text style={styles.section}>Apparence</Text>
      <Item icon="color-palette-outline" label="Thème" path="/settings/theme" />
      <Item icon="language-outline" label="Langue" path="/settings/language" />

      <Text style={styles.section}>Support & Infos</Text>
      <Item icon="notifications-outline" label="Notifications" path="/settings/notifications" />
      <Item icon="chatbubble-ellipses-outline" label="Donner un avis" path="/settings/feedback" />
      <Item icon="information-circle-outline" label="À propos" path="/settings/about" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c1c1c",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fdd835",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fdd835",
    marginTop: 25,
    marginBottom: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomColor: "#333",
    borderBottomWidth: 1,
  },
  itemText: {
    color: "white",
    fontSize: 15,
  },
});
