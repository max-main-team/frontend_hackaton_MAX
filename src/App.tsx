import { useEffect, useState } from "react";
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useMaxWebApp } from "./hooks/useMaxWebApp";
import { api, setAccessTokenInMemory } from "./services/api";
import LoadingPage from "./pages/LoadingPage";
import AdminPage from "./pages/AdminPage";
import TeacherPage from "./pages/TeacherPage";
import StudentPage from "./pages/StudentPage";
import MultiSelectPage from "./pages/MultiSelectPage";
import ProfilePage from "./pages/ProfilePage";
import ApplicantPage from "./pages/ApplicantPage";

function AppInner() {
  const { webAppData } = useMaxWebApp();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Если webAppData еще не загружен, ждем
    if (!webAppData) {
      return;
    }

    // Если пользователь уже на какой-то конкретной странице (не корневой), не делаем редирект
    const currentPath = location.pathname;
    if (currentPath !== "/" && currentPath !== "") {
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        setLoading(true);
        console.log("Making login request...");
        
        const res = await api.post("https://msokovykh.ru/auth/login", webAppData);
        const access = res.data?.access_token;
        const roles: string[] = res.data?.user_roles;
        
        console.log("Login response:", { access, roles });

        if (access) {
          localStorage.setItem("access_token", access);
          setAccessTokenInMemory(access);
        }

        if (Array.isArray(roles)) {
          localStorage.setItem("user_roles", JSON.stringify(roles));
          
          if (roles.length === 0) {
            navigate("/abiturient", { replace: true });
          } else if (roles.length === 1) {
            if (roles[0] === "student") navigate("/student", { replace: true });
            else if (roles[0] === "teacher") navigate("/teacher", { replace: true });
            else if (roles[0] === "admin") navigate("/admin", { replace: true });
            else navigate("/abiturient", { replace: true });
          } else {
            navigate("/select", { replace: true });
          }
        } else {
          navigate("/abiturient", { replace: true });
        }
      } catch (err) {
        console.error("Auth failed", err);
        navigate("/abiturient", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [webAppData, navigate, location.pathname]);

  // Если загружаемся и на корневой странице
  if (loading && (location.pathname === "/" || location.pathname === "")) {
    return <LoadingPage />;
  }

  return (
    <Routes>
      <Route path="/student" element={<StudentPage />} />
      <Route path="/teacher" element={<TeacherPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/select" element={<MultiSelectPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/abiturient" element={<ApplicantPage />} />
      <Route path="*" element={<LoadingPage />} />
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