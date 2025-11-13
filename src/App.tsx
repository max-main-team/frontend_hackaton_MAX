import { useEffect, useState } from "react";
import { HashRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { useMaxWebApp } from "./hooks/useMaxWebApp";
import { api } from "./services/api";
import LoadingPage from "./pages/LoadingPage";
import AdminPage from "./pages/AdminPage";
import TeacherPage from "./pages/TeacherPage";
import StudentPage from "./pages/StudentPage";
import MultiSelectPage from "./pages/MultiSelectPage";
import ProfilePage from "./pages/ProfilePage";
import ApplicantPage from "./pages/ApplicantPage";

function AppInner() {
  const {
    webAppData
  } = useMaxWebApp();

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!webAppData) {
      return;
    }
    setLoading(true);

    api.post("https://msokovykh.ru/auth/login", webAppData)
      .then(async res => {
        const access = res.data?.access_token;
        const roles: string[] = res.data?.user_roles;
        
        if (access) {
          localStorage.setItem("access_token", access);
        }

        try {
          if (Array.isArray(roles)) {
            localStorage.setItem("user_roles", JSON.stringify(roles));
          }
        } catch (e) {
          console.warn("Failed to persist user/roles", e);
        }

        if (Array.isArray(roles) && roles.length > 0) {
          if (roles.length === 1) {
            if (roles[0] === "student") navigate("/student", { replace: true });
            if (roles[0] === "teacher") navigate("/teacher", { replace: true });
            if (roles[0] === "admin") navigate("/admin", { replace: true });
          } else {
            navigate("/select", { replace: true });
          }
        } else {
          navigate("/abiturient", { replace: true });
        }
      })
      .catch(err => {
        console.error("auth failed", err);
      })
      .finally(() => setLoading(false));
  }, [webAppData, navigate]);

  if (loading || !webAppData) return <LoadingPage />;

  return (
    <Routes>
      <Route path="/student" element={<StudentPage />} />
      <Route path="/teacher" element={<TeacherPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/select" element={<MultiSelectPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/abiturient" element={<ApplicantPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppInner />
    </Router>
  );
}