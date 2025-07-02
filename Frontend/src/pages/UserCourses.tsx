import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";
import "../styles/usercourses.css";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet"; // 👈 À ajouter si pas encore importé


type PathPoint = {
  latitude: number;
  longitude: number;
};

type Course = {
  id: number;
  distance: number;
  duration: number;
  start_time: string;
  avg_speed: number;
  path: PathPoint[] | null;
};

export default function UserCourses() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);

  const handleDelete = async (courseId: number) => {
    if (!window.confirm("Confirmer suppression ?")) return;
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3000/api/admin/courses/${courseId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setCourses(courses.filter(c => c.id !== courseId));
  };

  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/api/admin/users/${id}/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      const cleaned = data.map((course: any) => {
  let parsedPath = null;
  try {
    if (course.path) {
      parsedPath = typeof course.path === "string"
        ? JSON.parse(course.path)
        : course.path;
    }
  } catch (err) {
    console.warn("Erreur parsing path:", course.id, err);
  }

  return { ...course, path: parsedPath };
});


      setCourses(cleaned);
console.log("✅ Courses nettoyées :", cleaned);

    };

    fetchCourses();
  }, [id]);

  return (
    <>
      <Navbar />
      <div className="all-courses">
        <h2>Courses de l'utilisateur #{id}</h2>

        <ul>
          {courses.map((c) => (
            
            <div key={c.id} className="course-card">
              <p>Date : {new Date(c.start_time).toLocaleString()}</p>
              <p>Distance : {c.distance.toFixed(2)} km</p>
              <p>Durée : {Math.round(c.duration / 60)} min</p>
              <p>
                Vitesse moyenne :{" "}
                {typeof c.avg_speed === "number"
                  ? `${c.avg_speed.toFixed(2)} km/h`
                  : "N/A"}
              </p>

              <div className="course-actions">
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(c.id)}
                >
                  Supprimer
                </button>
                <button
                  className="btn btn-view"
                  onClick={() => navigate(`/courses/${c.id}/comments`)}
                >
                  Commentaires
                </button>
                
              </div>
              
                  
              {c.path && c.path.length > 0 && (
                <>
                  {console.log("🗺️ Rendering map for course", c.id, "with path:", c.path)}
  <MapContainer
  
    key={c.id}
    center={[c.path[0].latitude, c.path[0].longitude] as L.LatLngExpression}
    zoom={16}
    scrollWheelZoom={false}
    style={{ height: "200px", marginTop: "1rem", borderRadius: "8px" }}
  >
    
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <Polyline
      positions={c.path.map((pt) => [pt.latitude, pt.longitude])}
      pathOptions={{ color: "#fdd835" }}
    />
  </MapContainer>
                </>
                
)}

            </div>
          ))}
        </ul>
      </div>
    </>
  );
}
