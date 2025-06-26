import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

export default function BackButton({ color = "#fdd835", size = 26 }: { color?: string; size?: number }) {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, position: "absolute", top: 40, left: 20, zIndex: 10 }}>
      <Ionicons name="arrow-back" size={size} color={color} />
    </TouchableOpacity>
  );
}
