// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    
    <Tabs 
      screenOptions={({ route }) => ({
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
            default:
              iconName = "ellipse";
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#1e90ff",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
      
    />
    
  );
}
