import { View, Text, StyleSheet, ScrollView, Linking } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import BackButton from "../../components/BackButton";

export default function AboutScreen() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const backgroundColor = isDark ? "#1c1c1c" : "#fff";
  const textColor = isDark ? "#fff" : "#1c1c1c";
  const accent = "#fdd835";
  const secondary = isDark ? "#aaa" : "#555";

  return (
    <ScrollView style={{ flex: 1, backgroundColor }} contentContainerStyle={styles.container}>
        <BackButton/>
      <Text style={[styles.title, { color: accent, marginTop:22 }]}>À propos</Text>

      <Text style={[styles.text, { color: textColor }]}>
        Cette application a été conçue pour suivre vos courses, vos progrès, et atteindre vos objectifs sportifs. 
      </Text>

      <Text style={[styles.text, { color: textColor }]}>
        ➤ Suivi GPS en temps réel{"\n"}
        ➤ Objectifs quotidiens{"\n"}
        ➤ Historique de courses{"\n"}
        ➤ Statistiques détaillées{"\n"}
        ➤ Mode défi, classement et bien plus...
      </Text>

      <Text style={[styles.sectionTitle, { color: accent }]}>Développeur</Text>
      <Text style={[styles.text, { color: textColor }]}> Thomas | Étudiant Ynov</Text>
      <Text style={[styles.text, { color: textColor }]}> Matt | Étudiant Ynov</Text>

      <Text style={[styles.sectionTitle, { color: accent }]}>Contact</Text>
      <Text
        style={[styles.link, { color: accent }]}
        onPress={() => Linking.openURL("mailto:runynov@gmail.com")}
      >
        📧 runynov@gmail.com
      </Text>

      <Text
        style={[styles.link, { color: accent }]}
        onPress={() => Linking.openURL("https://github.com/thomasiafrate1/Running-App")}
      >
        🌐 Voir sur GitHub
      </Text>

      <Text style={[styles.footer, { color: secondary }]}>
        © {new Date().getFullYear()} Running App - Tous droits réservés.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 6,
    fontWeight: "bold",
  },
  text: {
    fontSize: 15,
    marginBottom: 12,
    lineHeight: 22,
  },
  link: {
    fontSize: 15,
    marginBottom: 10,
    textDecorationLine: "underline",
  },
  footer: {
    marginTop: 30,
    textAlign: "center",
    fontSize: 13,
  },
});
