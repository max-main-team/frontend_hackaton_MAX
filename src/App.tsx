import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useMaxWebApp } from "./hooks/useMaxWebApp";
import { api } from "./services/api";
import LoadingPage from "./pages/LoadingPage";
import AdminPage from "./pages/AdminPage.tsx";
import TeacherPage from "./pages/TeacherPage.tsx";
import StudentPage from "./pages/StudentPage.tsx";
import MultiSelectPage from "./pages/MultiSelectPage.tsx";


function AppInner() {
  const {
    webAppData,
    saveAccessToken,
    saveRefreshToken,
  } = useMaxWebApp();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!webAppData) return;
    setLoading(true);

    api.post("/auth/webapp-init", webAppData)
      .then(async res => {
        const access = res.data?.token;
        const refresh = res.data?.refresh_token;
        if (access) await saveAccessToken(access);
        if (refresh) await saveRefreshToken(refresh);

        const types: string[] = res.data?.type_user ?? [];

        if (Array.isArray(types) && types.length > 0) {
          if (types.length === 1) {
            if (types[0] == "student") navigate("/student", { replace: true });
            if (types[0] == "teacher") navigate("/teacher", { replace: true });
            if (types[0] == "admin") navigate("/admin", { replace: true });
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
  }, [webAppData, navigate, saveAccessToken, saveRefreshToken]);

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
