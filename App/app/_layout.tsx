import { Stack, useRouter, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { getToken } from "../utils/token";
import { View, ActivityIndicator, Text } from "react-native";
import { ThemeProvider } from "../context/ThemeContext";

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken();

      const isAuthPage = pathname === "/login" || pathname === "/register";

      if (!token && !isAuthPage) {
        router.replace("/login");
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Chargement de l'auth...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider>
      <Stack />
    </ThemeProvider>
  );
}
