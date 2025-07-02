import { useState, useEffect } from "react";
import Navbar from "../components/NavBar";
import "../styles/goalsadmin.css";

type GoalTemplate = {
  id: number;
  type: string;
  value: number;
  unit: string;
};

export default function GoalTemplateAdmin() {
  const [type, setType] = useState("Courir au moins");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("km");
  const [templates, setTemplates] = useState<GoalTemplate[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Partial<GoalTemplate>>({});

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
      setType("Courir au moins");
      setValue("");
      setUnit("km");
      fetchTemplates();
    } else {
      alert("Erreur lors de l’ajout");
    }
  };

  const deleteGoal = async (id: number) => {
  if (!window.confirm("Confirmer suppression ?")) return;
  const res = await fetch(`http://localhost:3000/api/admin/goals/templates/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const data = await res.json();

  if (res.ok) {
    alert(data.message || "🗑️ Supprimé !");
    fetchTemplates(); // Refresh
  } else {
    alert(data.message || "❌ Erreur suppression");
  }
};


  

  const saveEdit = async (id: number) => {
  const res = await fetch(`http://localhost:3000/api/admin/goals/templates/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(editValues),
  });

  const data = await res.json();

  if (res.ok) {
    alert(data.message || "✅ Modifié avec succès !");
    setEditingId(null);
    setEditValues({});
    fetchTemplates(); // Refresh
  } else {
    alert(data.message || "❌ Erreur modification");
  }
};


  useEffect(() => {
    fetchTemplates();
  }, []);

  return (
    <>
      <Navbar />
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
              {editingId === t.id ? (
                <>
                  <input
                    value={editValues.type || t.type}
                    onChange={(e) =>
                      setEditValues({ ...editValues, type: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    value={editValues.value || t.value}
                    onChange={(e) =>
                      setEditValues({ ...editValues, value: parseFloat(e.target.value) })
                    }
                  />
                  <select
                    value={editValues.unit || t.unit}
                    onChange={(e) =>
                      setEditValues({ ...editValues, unit: e.target.value })
                    }
                  >
                    <option value="km">km</option>
                    <option value="min">minutes</option>
                  </select>
                  <button onClick={() => saveEdit(t.id)}>💾</button>
                  <button onClick={() => setEditingId(null)}>❌</button>
                </>
              ) : (
                <>
                  {t.type} {t.value} {t.unit}
                  <button onClick={() => {
                    setEditingId(t.id);
                    setEditValues(t);
                  }}>
                    ✏️
                  </button>
                  <button onClick={() => deleteGoal(t.id)}>🗑️</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
