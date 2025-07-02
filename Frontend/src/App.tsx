import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import UserCourses from "./pages/UserCourses";
import UserDetail from "./pages/UserDetail";
import AllCourses from "./pages/AllCourses";
import GoalTemplateAdmin from "./pages/GoalsAdmin";
import RecentLogins from "./pages/RecentLogins";
import AdminNotifications from "./pages/Notifications";
import LeaderboardAdmin from "./pages/LeaderboardAdmin";
import Feedbacks from "./pages/Feedbacks";
import CommentsAdmin from "./pages/CommentsAdmin";



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:id/courses" element={<UserCourses />} />
        <Route path="/users/:id/" element={<UserDetail />} />
        <Route path="/courses" element={<AllCourses />} />
        <Route path="/logins" element={<RecentLogins />} />
        <Route path="/goals" element={<GoalTemplateAdmin />} />
        <Route path="/notifications" element={<AdminNotifications />} />
        <Route path="/leaderboard" element={<LeaderboardAdmin />} />
        <Route path="/feedbacks" element={<Feedbacks />} />
        <Route path="/comments" element={<CommentsAdmin />} />

      </Routes>
    </BrowserRouter>
  );
}
