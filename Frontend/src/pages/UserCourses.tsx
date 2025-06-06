import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/NavBar";
import "../styles/usercourses.css";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type PathPoint = {
  latitude: number;
  longitude: number;
  timestamp?: string;
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
  const [courses, setCourses] = useState<Course[]>([]);

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
          parsedPath = typeof course.path === "string" ? JSON.parse(course.path) : course.path;
        } catch (err) {
          console.warn("Erreur parsing course ID", course.id);
        }
        return { ...course, path: parsedPath };
      });

      setCourses(cleaned);
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
              <p> {new Date(c.start_time).toLocaleString()}</p>
              <p> Distance : {c.distance.toFixed(2)} km</p>
              <p> Durée : {Math.round(c.duration / 60)} min</p>
              <p>
                 Vitesse moyenne :{" "}
                {typeof c.avg_speed === "number"
                  ? `${c.avg_speed.toFixed(2)} km/h`
                  : "N/A"}
              </p>

              {c.path && c.path.length > 0 && (
                <MapContainer
                  center={[c.path[0].latitude, c.path[0].longitude]}
                  zoom={16}
                  scrollWheelZoom={false}
                  style={{ height: "200px", marginTop: "1rem", borderRadius: "8px" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Polyline
                    positions={c.path.map((pt) => [pt.latitude, pt.longitude])}
                    pathOptions={{ color: "#fdd835" }}
                  />
                </MapContainer>
              )}
            </div>
          ))}
        </ul>
      </div>
    </>
  );
}
