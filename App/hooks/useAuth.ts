// hooks/useAuth.ts
import { useEffect, useState } from "react";
import { getToken } from "../utils/token";

type User = {
  id: number;
  email: string;
  username: string;
  profile_picture?: string;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = await getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://192.168.1.42:3000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      

      if (!res.ok) throw new Error("Échec de récupération du profil");
      const data = await res.json();
    setUser(data.user);
    } catch (err) {
      console.error("❌ Erreur auth:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return { user, loading, refreshUser: fetchUser };
}
