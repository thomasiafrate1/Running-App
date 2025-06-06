import { useEffect, useState } from "react";
import Navbar from "../components/NavBar";
import "../styles/adminnotifications.css"

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3000/api/notifications", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setNotifications(data);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const createNotification = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3000/api/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, message }),
    });
    if (res.ok) {
      setTitle("");
      setMessage("");
      fetchNotifications();
    } else {
      alert("Erreur création notification");
    }
  };

  const deleteNotification = async (id: number) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3000/api/notifications/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchNotifications();
  };

  return (
    <>
    <Navbar/>
     <div className="page-container">
  <h2> Gérer les notifications</h2>

  <div className="notification-form">
    <input
      type="text"
      placeholder="Titre"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
    />
    <input
      type="text"
      placeholder="Message"
      value={message}
      onChange={(e) => setMessage(e.target.value)}
    />
    <button onClick={createNotification}>Créer</button>
  </div>

  <div className="notification-list">
    {notifications.map((notif: any) => (
      <div key={notif.id} className="notification-item">
        <h4>{notif.title}</h4>
        <p>{notif.message}</p>
        <button onClick={() => deleteNotification(notif.id)}>Supprimer</button>
      </div>
    ))}
  </div>
</div>
    </>
   
  );
}
