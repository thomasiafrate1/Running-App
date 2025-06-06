import { useEffect, useState } from "react";
import Navbar from "../components/NavBar";
import "../styles/recentlogin.css"

type Login = {
  id: number;
  email: string;
  ip_address: string;
  created_at: string;
};

export default function RecentLogins() {
  const [logins, setLogins] = useState<Login[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLogins = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/admin/logins", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Erreur chargement connexions");
        return;
      }

      setLogins(data);
    };

    fetchLogins();
  }, []);

  return (
    <>
    <Navbar/>
     <div className="recent-logins">
        
      <h2>Activité récente</h2>
      {error && <p className="error">{error}</p>}
      <ul>
        {logins.map((login) => (
          <li key={login.id} className="login-entry">
            <p>{login.email}</p>
            <p>IP : {login.ip_address}</p>
            <p>{new Date(login.created_at).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
    </>
   
  );
}
