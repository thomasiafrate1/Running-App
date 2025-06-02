import { useEffect, useState } from "react";
import Navbar from "../components/NavBar";

type Course = {
  id: number;
  distance: number;
  duration: number;
  start_time: string;
  avg_speed: number;
  email: string;
};

export default function AllCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/admin/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Erreur de chargement");
        return;
      }
      setCourses(data);
    };

    fetchCourses();
  }, []);

  return (
    <div className="all-courses">
        <Navbar/>
      <h2>📋 Toutes les courses</h2>
      {error && <p className="error">{error}</p>}
      <ul>
        {courses.map((course) => (
          <div key={course.id} className="course-card">
            <p>👤 {course.email}</p>
            <p>📅 {new Date(course.start_time).toLocaleString()}</p>
            <p>📏 Distance : {course.distance.toFixed(2)} km</p>
            <p>⏱ Durée : {Math.round(course.duration / 60)} min</p>
<p>
  🚀 Vitesse moyenne :{" "}
  {typeof course.avg_speed === "number"
    ? `${course.avg_speed.toFixed(2)} km/h`
    : "N/A"}
</p>          </div>
        ))}
      </ul>
    </div>
  );
}
