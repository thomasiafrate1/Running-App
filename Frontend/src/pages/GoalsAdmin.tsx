import { useState, useEffect } from "react";
import Navbar from "../components/NavBar";
import "../styles/goalsadmin.css"

export default function GoalTemplateAdmin() {
  const [type, setType] = useState("Courir au moins");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("km");
  const [templates, setTemplates] = useState([]);

  const fetchTemplates = async () => {
    const res = await fetch("http://localhost:3000/api/admin/goals/templates", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    setTemplates(data);
  };

  const submitGoal = async () => {
    const res = await fetch("http://localhost:3000/api/admin/goals/templates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ type, value: parseFloat(value), unit }),
    });

    if (res.ok) {
      alert("Objectif ajouté !");
      fetchTemplates();
    } else {
      alert("Erreur lors de l’ajout");
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return (
    <>
    <Navbar/>
     <div className="goal-template-container">
  <h2>Créer un objectif</h2>

  <div className="goal-form">
    <input
      type="text"
      value={type}
      onChange={(e) => setType(e.target.value)}
      placeholder="Type"
    />
    <input
      type="number"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Valeur"
    />
    <select value={unit} onChange={(e) => setUnit(e.target.value)}>
      <option value="km">km</option>
      <option value="min">minutes</option>
    </select>
    <button onClick={submitGoal}>Ajouter</button>
  </div>

  <h3>Modèles existants</h3>
  <ul className="goal-template-list">
    {templates.map((t) => (
      <li key={t.id}>
        {t.type} {t.value} {t.unit}
      </li>
    ))}
  </ul>
</div>

    </>
   
  );
}
