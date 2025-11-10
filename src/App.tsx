import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useMaxWebApp } from "./hooks/useMaxWebApp";
import { api, setAccessTokenInMemory } from "./services/api";
import LoadingPage from "./pages/LoadingPage";
import AdminPage from "./pages/AdminPage";
import TeacherPage from "./pages/TeacherPage";
import StudentPage from "./pages/StudentPage";
import MultiSelectPage from "./pages/MultiSelectPage";

function AppInner() {
  const {
    webAppData,
    saveAccessToken,
  } = useMaxWebApp();

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!webAppData) return;
    setLoading(true);

    api.post("/auth/login", webAppData)
      .then(async res => {
        const access = res.data?.access_token;

        if (access) {
          if (typeof saveAccessToken === "function") {
            await saveAccessToken(access);
          }
          setAccessTokenInMemory(access);
        }

        const roles: string[] = res.data?.user_roles;

        if (Array.isArray(roles) && roles.length > 0) {
          if (roles.length === 1) {
            if (roles[0] === "student") navigate("/student", { replace: true });
            if (roles[0] === "teacher") navigate("/teacher", { replace: true });
            if (roles[0] === "admin") navigate("/admin", { replace: true });
          } else {
            navigate("/select", { replace: true });
          }
        } else {
          navigate("/select", { replace: true });
        }
      })
      .catch(err => {
        console.error("auth failed", err);
      })
      .finally(() => setLoading(false));
  }, [webAppData, navigate, saveAccessToken]);

  if (loading || !webAppData) return <LoadingPage />;

  return (
    <Routes>
      <Route path="/student" element={<StudentPage />} />
      <Route path="/teacher" element={<TeacherPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/select" element={<MultiSelectPage />} />
      <Route path="*" element={<MultiSelectPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
