import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/NavBar";
import "../styles/userdetail.css"

export default function UserDetail() {
  const { id } = useParams();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEmail(data.email);
      setRole(data.role);
    };

    fetchUser();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3000/api/admin/users/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, role }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("✅ Modifications enregistrées !");
    } else {
      setMessage(`❌ ${data.message}`);
    }
  };

  return (
    <>
    <Navbar />
    <div className="user-detail-container">
    
    <h2>Modifier l'utilisateur #{id}</h2>
    <form onSubmit={handleUpdate}>
      <label>Email :</label>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />

      <label>Rôle :</label>
      <input value={role} onChange={(e) => setRole(e.target.value)} />

      <button type="submit">Enregistrer</button>
    </form>

    {message && <p>{message}</p>}
  </div>
    </>
    
);

}
