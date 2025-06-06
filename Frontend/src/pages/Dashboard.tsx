import { useEffect, useState } from "react";
import Navbar from "../components/NavBar";
import "../styles/dashboard.css";

type Stats = {
  totalUsers: number;
  totalCourses: number;
  avgDistance: number;
  avgDuration: number;
};



export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  type UserStat = { email: string; courseCount: number };
  const [topUsers, setTopUsers] = useState<UserStat[]>([]);

  


  useEffect(() => {
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");

      // Stats générales
      const res = await fetch("http://localhost:3000/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Erreur lors de la récupération des stats");
        return;
      }

      setStats(data);

      // Top utilisateurs
      const res2 = await fetch("http://localhost:3000/api/admin/top-users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const topData = await res2.json();

      if (res2.ok) {
        setTopUsers(topData);
      }

    } catch (err) {
      setError("Erreur serveur");
    }
  };

  fetchStats();
}, []);


  return (
    <>
<Navbar />
    <div className="dashboard-container">
      
      <h1> Tableau de bord admin</h1>

      {error && <p className="error">{error}</p>}

      {stats ? (
        <>
          <div className="stats-grid">
            <div className="stat-card"> Utilisateurs : {stats.totalUsers}</div>
            <div className="stat-card"> Courses : {stats.totalCourses}</div>
            <div className="stat-card">
               Distance moyenne : {stats.avgDistance.toFixed(2)} km
            </div>
            <div className="stat-card">
               Durée moyenne : {Math.round(stats.avgDuration / 60)} min
            </div>
            <div className="stat-card">
               Objectifs atteints : 1
            </div>
            <div className="stat-card">
               Taux de réussite : 100%
            </div>
          </div>

          <div className="top-users">
            <h3> Top utilisateurs</h3>
            <ul>
              {topUsers.map((u, i) => (
                <li key={i}>
                  <strong>{u.email}</strong> — {u.courseCount} course(s)
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <p>Chargement...</p>
      )}
    </div>
    </>
    
  );
}
