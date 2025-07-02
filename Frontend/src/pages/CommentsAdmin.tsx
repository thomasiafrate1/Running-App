import { useEffect, useState } from "react";
import Navbar from "../components/NavBar";
import { useNavigate } from "react-router-dom";
import "../styles/adminnotifications.css"; // Réutilisé pour la mise en forme
import { color } from "chart.js/helpers";

type Comment = {
  id: number;
  course_id: number;
  user_id: number;
  username: string;
  content: string;
  created_at: string;
};

export default function CommentsAdmin() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState<string>("");
  const navigate = useNavigate();

  const fetchComments = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3000/api/admin/comments", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setComments(data);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Confirmer suppression ?")) return;
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3000/api/admin/comments/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    fetchComments();
  };

  const handleUpdate = async (id: number) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3000/api/admin/comments/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: editContent }),
    });
    setEditId(null);
    setEditContent("");
    fetchComments();
  };

  useEffect(() => {
    fetchComments();
  }, []);

  return (
    <>
      <Navbar />
      <div className="page-container">
        <h2 style={{color: "white"}}>📝 Commentaires</h2>

        {comments.map((comment) => (
          <div key={comment.id} className="notification-item">
            <p>
              <strong>{comment.username}</strong> | {new Date(comment.created_at).toLocaleString()}
            </p>
            {editId === comment.id ? (
              <>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  style={{ width: "100%", marginBottom: "10px" }}
                />
                <button onClick={() => handleUpdate(comment.id)}>💾</button>
                <button onClick={() => setEditId(null)}>❌</button>
              </>
            ) : (
              <p>{comment.content}</p>
            )}

            <div style={{ marginTop: "8px" }}>
              <button onClick={() => navigate(`/courses/${comment.course_id}/comments`)}>
                Voir la course
              </button>
              <button
                onClick={() => {
                  setEditId(comment.id);
                  setEditContent(comment.content);
                }}
              >
                ✏️ Modifier
              </button>
              <button onClick={() => handleDelete(comment.id)}>🗑️ Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
