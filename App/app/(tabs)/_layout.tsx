// app/(tabs)/_layout.tsx

import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarLabel: (() => {
          switch (route.name) {
            case "index":
              return "Accueil";
            case "history":
              return "Historique";
            case "run":
              return "Course";
            case "profile":
              return "Profil";
            case "menu":
              return "Menu";
            default:
              return "Onglet";
          }
        })(),
        tabBarIcon: ({ color, size }) => {
          let iconName: string;
          switch (route.name) {
            case "index":
              iconName = "home";
              break;
            case "run":
              iconName = "walk";
              break;
            case "history":
              iconName = "time";
              break;
            case "profile":
              iconName = "person";
              break;
            case "menu":
              iconName = "ellipsis-horizontal";
              break;
            default:
              iconName = "ellipse";
          }
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#fdd835",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "#1c1c1c",
          borderTopWidth: 1,
          borderTopColor: "#333",
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "bold",
        },
      })}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="run" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="menu" />
    </Tabs>
  );
}
