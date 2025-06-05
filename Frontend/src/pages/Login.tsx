import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css"

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://10.188.218.47:3000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Erreur lors de la connexion");
        return;
      }

      localStorage.setItem("token", data.token);
      navigate("/dashboard"); // Redirige vers le tableau de bord admin
    } catch (err) {
      setError("Erreur serveur");
    }
  };

  return (
    <div className="login-container">
      <h1 style={{color:"black"}}>Connexion Admin</h1>
      <form onSubmit={handleLogin} className="login-form">
        <label>Email :</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Mot de passe :</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Se connecter</button>

        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}
