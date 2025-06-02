// src/components/Navbar.tsx
import { NavLink } from "react-router-dom";
import "../styles/navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">🏃‍♂️ Admin Panel</div>
      <ul className="navbar-links">
        <li>
            <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
            >
            Dashboard
          </NavLink>
        </li>
        <li>
            <NavLink
            to="/users"
            className={({ isActive }) => (isActive ? "active" : "")}
            >
            Utilisateurs
          </NavLink>
        </li>
        <li>
            <NavLink to="/courses" className={({ isActive }) => (isActive ? "active" : "")}>
  Toutes les courses
</NavLink>

        </li>
        <li>
            <NavLink to="/logins" className={({ isActive }) => isActive ? "active" : ""}>
  Connexions
</NavLink>

        </li>
      </ul>
    </nav>
  );
}
