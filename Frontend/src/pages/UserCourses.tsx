import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/NavBar";

type Course = {
  id: number;
  distance: number;
  duration: number;
  start_time: string;
  avg_speed: number;
  path: { lat: number; lng: number }[];
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
      setCourses(data);
    };

    fetchCourses();
  }, [id]);

  return (
    <div>
        <Navbar />
      <h2>Courses de l'utilisateur #{id}</h2>
      <ul>
        {courses.map((c, i) => (
        <div key={i} className="course-card">
            <p>📅 {new Date(c.start_time).toLocaleString()}</p>
            <p>📏 Distance : {c.distance.toFixed(2)} km</p>
            <p>⏱ Durée : {Math.round(c.duration / 60)} min</p>
            <p>
            🚀 Vitesse moyenne :{" "}
            {typeof c.avg_speed === "number"
                ? `${c.avg_speed.toFixed(2)} km/h`
                : "N/A"}
            </p>
        </div>
        ))}
      </ul>
    </div>
  );
}
