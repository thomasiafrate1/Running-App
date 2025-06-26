import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import BackButton from "../../components/BackButton";

export default function SettingsScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const isDark = theme === "dark";
  const backgroundColor = isDark ? "#1c1c1c" : "#f9f9f9";
  const textColor = isDark ? "#fff" : "#1c1c1c";
  const sectionColor = "#fdd835";
  const borderColor = isDark ? "#333" : "#ddd";

  const Item = ({ icon, label, path }: { icon: any; label: string; path: string }) => (
    <TouchableOpacity
      style={[styles.item, { borderBottomColor: borderColor }]}
      onPress={() => router.push(path)}
    >
      <Ionicons name={icon} size={20} color={sectionColor} style={{ marginRight: 12 }} />
      <Text style={[styles.itemText, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <BackButton/>
      <Text style={[styles.title, { color: sectionColor, marginTop : 43 }]}>Paramètres</Text>

      <Text style={[styles.section, { color: sectionColor }]}>Compte & Sécurité</Text>
      <Item icon="key-outline" label="Changer le mot de passe" path="/settings/change-password" />
      <Item icon="mail-outline" label="Changer l'adresse email" path="/settings/change-email" />
      <Item icon="trash-outline" label="Supprimer mon compte" path="/settings/delete-account" />

      <Text style={[styles.section, { color: sectionColor }]}>Apparence</Text>
      <Item icon="color-palette-outline" label="Thème" path="/settings/theme" />

      <Text style={[styles.section, { color: sectionColor }]}>Support & Infos</Text>
      <Item icon="chatbubble-ellipses-outline" label="Donner un avis" path="/settings/feedback" />
      <Item icon="information-circle-outline" label="À propos" path="/settings/about" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 25,
    marginBottom: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  itemText: {
    fontSize: 15,
  },
});
