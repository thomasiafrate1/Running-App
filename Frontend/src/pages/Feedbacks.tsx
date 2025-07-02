import { useEffect, useState } from "react";
import Navbar from "../components/NavBar";
import "../styles/users.css"; // ou crée un feedbacks.css si tu préfères séparer

type Feedback = {
  id: number;
  username: string;
  content: string;
  rating: number;
  created_at: string;
};

export default function Feedbacks() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/api/feedback", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          setError("Erreur de récupération des feedbacks");
          return;
        }
        setFeedbacks(data);
      } catch (err) {
        setError("Erreur serveur");
      }
    };

    fetchFeedbacks();
  }, []);

  return (
    <>
      <Navbar />
      <div className="page">
        <h2 className="page-title">Feedbacks des utilisateurs</h2>
        {error && <p className="error">{error}</p>}

        <table className="user-table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Note</th>
              <th>Contenu</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map((f) => (
              <tr key={f.id}>
                <td>{f.username}</td>
                <td>{"⭐".repeat(f.rating)}</td>
                <td>{f.content}</td>
                <td>{new Date(f.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
