import { useCallback, useEffect, useState } from "react";
import { HashRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
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
  const [authCompleted, setAuthCompleted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!webAppData) return;

    const handleBeforeUnload = () => {
      localStorage.removeItem("auth_completed");
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    if (webAppData.onClose) {
      webAppData.onClose(() => {
        localStorage.removeItem("auth_completed");
      });
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [webAppData]);

  const handleRoleNavigation = useCallback((roles: string[]) => {
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
  }, [navigate]);

  useEffect(() => {
    if (authCompleted || !webAppData) {
      if (!webAppData) setLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        setLoading(true);
        console.log("Starting authentication...");
        
        const res = await api.post("https://msokovykh.ru/auth/login", webAppData);
        const access = res.data?.access_token;
        const roles: string[] = res.data?.user_roles;
        
        console.log("Authentication successful", { access, roles });

        if (access) {
          localStorage.setItem("access_token", access);
          setAccessTokenInMemory(access);
        }

        if (Array.isArray(roles)) {
          localStorage.setItem("user_roles", JSON.stringify(roles));
          localStorage.setItem("auth_completed", "true");
          handleRoleNavigation(roles);
        } else {
          navigate("/abiturient", { replace: true });
        }
        
        setAuthCompleted(true);
      } catch (err) {
        console.error("Auth failed", err);
        navigate("/abiturient", { replace: true });
        setAuthCompleted(true);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [webAppData, navigate, handleRoleNavigation, authCompleted]);

  useEffect(() => {
    const wasAuthCompleted = localStorage.getItem("auth_completed") === "true";
    if (wasAuthCompleted) {
      setAuthCompleted(true);
      setLoading(false);
    }
  }, []);

  if (loading) return <LoadingPage />;

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