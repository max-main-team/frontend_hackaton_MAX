import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import ApplicantPage from "./pages/ApplicantPage";
import LoadingPage from "./pages/LoadingPage";
import AdminPage from "./pages/AdminPage";
import TeacherPage from "./pages/TeacherPage";
import StudentPage from "./pages/StudentPage";
import MultiSelectPage from "./pages/MultiSelectPage";
import ProfilePage from "./pages/ProfilePage";

function AppInner() {
  const [loading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // ← ДОБАВЬТЕ ЭТОТ ХУК

  useEffect(() => {
    // Редиректим ТОЛЬКО если НЕ на странице абитуриента
    if (location.pathname !== "/abiturient") {
      navigate("/abiturient", { replace: true });
    }
  }, [navigate, location.pathname]); // ← Добавьте location.pathname в зависимости

  if (loading) return <LoadingPage />;
  
  return (
    <Routes>
      <Route path="/student" element={<StudentPage />} />
      <Route path="/teacher" element={<TeacherPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/select" element={<MultiSelectPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/abiturient" element={<ApplicantPage />} />
      <Route path="*" element={<ApplicantPage />} />
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