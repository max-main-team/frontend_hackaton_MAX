import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Container,
  Panel,
  Typography,
  Flex,
} from "@maxhub/max-ui";
import MainLayout from "../layouts/MainLayout";
import StudentTeacherSchedule from "../components/StudentTeacherSchedule.tsx";
import AdminSchedulePanel from "../components/AdminSchedulePanel.tsx";
import { useScheduleApi } from "../hooks/useScheduleApi.ts";
import "../css/SchedulePage.css";

export default function SchedulePage() {
  const location = useLocation();
  const { user, university, loading } = useScheduleApi();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Проверяем, перешли ли мы из админ-панели
    const fromAdmin = location.state?.fromAdmin;
    const userRole = user?.role;
    
    setIsAdmin(fromAdmin || userRole === 'admin');
  }, [location, user]);

  if (loading) {
    return (
      <MainLayout>
        <Container className="schedule-container">
          <div className="schedule-loading">
            <div className="loading-spinner"></div>
            <Typography.Label>Загрузка...</Typography.Label>
          </div>
        </Container>
      </MainLayout>
    );
  }

  if (!user || !university) {
    return (
      <MainLayout>
        <Container className="schedule-container">
          <Panel mode="secondary" className="error-panel">
            <Typography.Title variant="medium-strong">Ошибка загрузки</Typography.Title>
            <Typography.Label>Не удалось загрузить данные пользователя</Typography.Label>
          </Panel>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container className="schedule-container">
        {/* Заголовок университета */}
        <Panel mode="secondary" className="university-header">
          <Flex justify="space-between" align="center">
            <div>
              <Typography.Title variant="medium-strong" className="uni-name">
                {university.uni_name}
              </Typography.Title>
              <Typography.Label className="uni-city">
                {university.city}
              </Typography.Label>
            </div>
            <div className="user-welcome">
              <Typography.Label>
                {user.first_name} {user.last_name}
              </Typography.Label>
              {isAdmin && (
                <div className="admin-badge">Администратор</div>
              )}
            </div>
          </Flex>
        </Panel>

        {/* Основной контент */}
        <div className="schedule-content">
          {isAdmin ? (
            <Flex gap={24} align="flex-start">
              <div className="admin-schedule-section">
                <AdminSchedulePanel universityId={university.id} />
              </div>
              <div className="preview-section">
                <Typography.Title variant="small-strong">Предпросмотр расписания</Typography.Title>
                <StudentTeacherSchedule
                  userId={user.id}
                  universityId={university.id}
                  userRole={user.role as 'student' | 'teacher'}
                />
              </div>
            </Flex>
          ) : (
            <StudentTeacherSchedule
              userId={user.id}
              universityId={university.id}
              userRole={user.role as 'student' | 'teacher'}
            />
          )}
        </div>
      </Container>
    </MainLayout>
  );
}