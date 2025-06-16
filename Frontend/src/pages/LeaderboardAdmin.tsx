import { useEffect, useState } from "react";
import Navbar from "../components/NavBar";
import "../styles/leaderboard.css"

type Leader = {
  username: string;
  email: string;
  courseCount: number;
  totalDistance: number;
};

export default function LeaderboardAdmin() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeaders = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:3000/api/admin/leaderboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Erreur chargement");
        } else {
          setLeaders(data);
        }
      } catch (e) {
        setError("Erreur serveur");
      }
    };
    fetchLeaders();
  }, []);

  return (
    <>
      <Navbar />
      <div className="leaderboard-page">
        <h2>🏆 Leaderboard des coureurs</h2>
        {error && <p className="error">{error}</p>}
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Courses</th>
              <th>Distance totale (km)</th>
            </tr>
          </thead>
          <tbody>
            {leaders.map((user, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.courseCount}</td>
                <td>{user.totalDistance.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
