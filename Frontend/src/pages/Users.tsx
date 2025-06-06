import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";
import "../styles/users.css"

type User = {
  id: number;
  email: string;
  role: string;
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");

  const navigate = useNavigate();

const handleDelete = async (id: number) => {
  if (!window.confirm("Confirmer suppression ?")) return;
  const token = localStorage.getItem("token");
  await fetch(`http://localhost:3000/api/admin/users/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  setUsers(users.filter(u => u.id !== id));
};

const toggleRole = async (id: number, currentRole: string) => {
  const newRole = currentRole === "admin" ? "user" : "admin";
  const token = localStorage.getItem("token");

  await fetch(`http://localhost:3000/api/admin/users/${id}/role`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role: newRole }),
  });

  setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
};


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/api/admin/users", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (!res.ok) {
          setError("Erreur chargement utilisateurs");
          return;
        }
        setUsers(data);
      } catch (err) {
        setError("Erreur serveur");
      }
    };

    fetchUsers();
  }, []);

  return (
    <>
    <Navbar />
    <div className="page">
      
      <h2 className="page-title">Gestion des utilisateurs</h2>
      {error && <p className="error">{error}</p>}

      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td className="actions">
                <button onClick={() => toggleRole(u.id, u.role)} className="btn btn-secondary">
                   Rôle
                </button>
                <button onClick={() => handleDelete(u.id)} className="btn btn-danger">
                   Supprimer
                </button>
                <button
                  onClick={() => navigate(`/users/${u.id}/courses`)}
                  className="btn btn-view"
                >
                   Courses
                </button>
                <button
    onClick={() => navigate(`/users/${u.id}`)}
    className="btn btn-edit"
  >
     Modifier
  </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
    
  );
}
