import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import LoadingPage from "./pages/LoadingPage";
import AdminPage from "./pages/AdminPage";
import TeacherPage from "./pages/TeacherPage";
import StudentPage from "./pages/StudentPage";
import MultiSelectPage from "./pages/MultiSelectPage";
import ProfilePage from "./pages/ProfilePage";
import ApplicantPage from "./pages/ApplicantPage";

function AppInner() {
  /* const {
    webAppData,
  } = useMaxWebApp(); */

  const [loading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/abiturient", { replace: true });
    
  }, [navigate]);

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
