import { type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Panel, Grid, Container, Flex, Avatar, Typography, Button } from "@maxhub/max-ui";
import MainLayout from "../layouts/MainLayout";
import { useMaxWebApp } from "../hooks/useMaxWebApp";
import "../css/TeacherPage.css";
import hiTeacher from "../images/hi_teacher.webp";

export default function TeacherPage(): JSX.Element {
  const { webAppData } = useMaxWebApp();
  const user = webAppData?.user ?? {};
  const name = user?.first_name ? `${user.first_name}${user.last_name ? " " + user.last_name : ""}` : "Преподаватель";

  const navigate = useNavigate();

  const cards = [
    {
      key: "schedule",
      title: "Расписания",
      desc: "Изменить расписание, назначить замену и экспортировать в календарь.",
      action: "Управлять",
    },
    {
      key: "grades",
      title: "Оценки",
      desc: "Просмотр, массовое выставление и экспорт оценок студентов.",
      action: "Перейти",
    },
    {
      key: "office_hours",
      title: "Приёмные часы",
      desc: "Управление временем приёма, запись студентов и уведомления.",
      action: "Настроить",
    },
    {
      key: "announcements",
      title: "Объявления",
      desc: "Создать объявление для группы или дисциплины.",
      action: "Создать",
    },
  ];

  return (
    <MainLayout>
      <Container className="teacher-container">
        {/* Header */}
        <div className="teacher-header">
          <Flex align="center" gap={12} style={{ width: "100%" }}>
            <Avatar.Container size={64} form="circle">
                <Avatar.Image
                  src={hiTeacher}
                  alt="Teacher"
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
                />
            </Avatar.Container>

            <div className="teacher-greeting">
              <Typography.Title variant="large-strong" className="teacher-title">Здравствуйте, {name}!</Typography.Title>
              <Typography.Label className="teacher-sub">{user?.university ?? ""}</Typography.Label>
            </div>

            <div style={{ marginLeft: "auto" }} className="teacher-header-actions">
              <Button mode="primary" size="small" onClick={() => {}}>Мои группы</Button>
            </div>
          </Flex>
        </div>

        <div className="teacher-cards-container">
          <Grid cols={2} gap={16} className="teacher-cards-grid">
            {cards.map(c => (
              <Panel key={c.key} mode="secondary" className="teacher-card" onClick={() => {
                if (c.key === "grades") navigate("/grade?mode=teacher");
                if (c.key === "schedule") navigate("/admin/workload");
                if (c.key === "office_hours") navigate("/admin/workload-hours");
                if (c.key === "announcements") navigate("/admin/workload");
              }} role="button">
                <Flex justify="space-between" align="center" style={{ width: "100%" }}>
                  <div className="teacher-card-left">
                    <Typography.Title variant="small-strong" className="teacher-card-title">{c.title}</Typography.Title>
                    <Typography.Label className="teacher-card-desc">{c.desc}</Typography.Label>
                  </div>

                  <div className="teacher-card-actions">
                    <Button mode="tertiary" size="small">{}</Button>
                  </div>
                </Flex>
              </Panel>
            ))}
          </Grid>
        </div>

        {/* Feature block */}
        <div style={{ marginTop: 18 }}>
          <Panel className="teacher-feature" mode="secondary">
            <Container style={{ padding: 14 }}>
              <Flex align="center" gap={12}>
                <div style={{ flex: 1 }}>
                  <Typography.Title variant="medium-strong">Управление курсом</Typography.Title>
                  <Typography.Label>Инструменты для загрузки материалов, домашек и проверки работ — всё в одном месте.</Typography.Label>
                </div>

                <div>
                  <Button mode="primary" onClick={() => {}}>Перейти</Button>
                </div>
              </Flex>
            </Container>
          </Panel>
        </div>
      </Container>
    </MainLayout>
  );
}