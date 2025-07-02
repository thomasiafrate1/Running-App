import { useEffect, useState } from "react";
import Navbar from "../components/NavBar";
import "../styles/allcourses.css";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";

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
  email: string;
  path?: PathPoint[] | null;
};

export default function AllCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/admin/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Erreur de chargement");
        return;
      }

      const cleanedCourses = data.map((course: any) => ({
        ...course,
        path: typeof course.path === "string" ? JSON.parse(course.path) : course.path,
      }));

      setCourses(cleanedCourses);
    } catch (err) {
      setError("Erreur serveur");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Supprimer cette course ?")) return;

    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3000/api/admin/courses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } else {
      alert("Erreur suppression");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <>
      <Navbar />
      <div className="all-courses">
        <h2>Toutes les courses</h2>
        {error && <p className="error">{error}</p>}

        <ul>
          {courses.map((course) => (
            <div key={course.id} className="course-card">
              <p><strong>{course.email}</strong></p>
              <p>Date : {new Date(course.start_time).toLocaleString()}</p>
              <p>Distance : {course.distance.toFixed(2)} km</p>
              <p>Durée : {Math.round((course.duration || 0) / 60)} min</p>
              <p>Vitesse moyenne : {(course.avg_speed ?? 0).toFixed(2)} km/h</p>

              {course.path && course.path.length > 0 && (
                <MapContainer
                  center={[course.path[0].latitude, course.path[0].longitude] as L.LatLngExpression}
                  zoom={15}
                  scrollWheelZoom={false}
                  style={{ height: "200px", marginTop: "1rem", borderRadius: "8px" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Polyline
                    positions={course.path.map((point) => [point.latitude, point.longitude])}
                    pathOptions={{ color: "#fdd835" }}
                  />
                </MapContainer>
              )}

              <div className="course-actions">
                <button
                  onClick={() => handleDelete(course.id)}
                  className="btn btn-danger"
                >
                  Supprimer
                </button>
                <button
                  onClick={() => navigate(`/courses/${course.id}/comments`)}
                  className="btn btn-view"
                >
                  Commentaires
                </button>
              </div>
            </div>
          ))}
        </ul>
      </div>
    </>
  );
}
