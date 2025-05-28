// app/index.tsx
import { Text, View, Button, FlatList } from "react-native";
import { useEffect, useState } from "react";
import { getToken, removeToken } from "../utils/token";
import { useRouter } from "expo-router";

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const router = useRouter();

  type Course = {
  id: number;
  distance: number;
  duration: number;
  start_time: string;
};

  useEffect(() => {
    const fetchUser = async () => {
      const token = await getToken();

      const res = await fetch("http://192.168.1.42:3000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setUserEmail(data.user?.email || "Inconnu");
    };

    const fetchCourses = async () => {
      const token = await getToken();

      const res = await fetch("http://192.168.1.42:3000/api/courses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setCourses(data);
    };

    fetchUser();
    fetchCourses();
  }, []);

  const handleLogout = async () => {
    await removeToken();
    router.replace("/login");
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Bienvenue {userEmail}</Text>

      <Button title="Commencer une course" onPress={() => router.push("/course/run")} />
      <Button title="Déconnexion" onPress={handleLogout} />

      <Text style={{ marginTop: 20 }}>Courses passées :</Text>
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Text>
            - {item.distance} km en {item.duration} s, le {item.start_time}
          </Text>
        )}
      />
    </View>
  );
}
