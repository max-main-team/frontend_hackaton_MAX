import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Panel, Grid, Container, Flex, Avatar, Typography, Button } from "@maxhub/max-ui";
import MainLayout from "../layouts/MainLayout";
import { useMaxWebApp } from "../hooks/useMaxWebApp";
import "../css/StudentPage.css";

export default function StudentPage(): JSX.Element {
  const { webAppData } = useMaxWebApp();
  const user = webAppData?.user ?? {};
  const name = user?.first_name ? `${user.first_name}${user.last_name ? " " + user.last_name : ""}` : "Студент";

  const navigate = useNavigate();

  // avatar handling: ставим src если есть, иначе fallback инициалы
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    const src = user?.full_avatar_url ?? user?.avatar_url ?? null;
    // если хотите использовать локальную заглушку по умолчанию, пишите src || defaultAvatar
    setAvatarSrc(src);
    setAvatarError(false);
  }, [user?.full_avatar_url, user?.avatar_url]);

  const cards = [
    {
      key: "schedule",
      title: "Расписание",
      desc: "Посмотреть текущее расписание занятий и изменения.",
      action: "Открыть",
      to: "/schedule",
    },
    {
      key: "gradebook",
      title: "Зачётка",
      desc: "Оценки и прогресс по дисциплинам.",
      action: "Оценки",
      to: "/grade",
    },
    {
      key: "feed",
      title: "Актуальное",
      desc: "Новости университета и объявления.",
      action: "Читать",
      to: "/events",
    },
    {
      key: "services",
      title: "Сервисы",
      desc: "Полезные кампусные сервисы и ресурсы.",
      action: "Перейти",
      to: "/services",
    },
  ];

  return (
    <MainLayout>
      <Container className="student-container">
        {/* Header */}
        <div className="student-header">
          <Flex align="center" gap={12} style={{ width: "100%" }}>
            <Avatar.Container size={64} form="circle" className="student-avatar-container">
              {avatarSrc && !avatarError ? (
                <Avatar.Image
                  src={avatarSrc}
                  alt={name}
                  className="student-avatar-image"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <Avatar.Text className="student-avatar-fallback">
                  {(name || "СТ").slice(0, 2).toUpperCase()}
                </Avatar.Text>
              )}
            </Avatar.Container>

            <div className="student-greeting">
              <Typography.Title variant="large-strong" className="student-title">Привет, {name}!</Typography.Title>
              <Typography.Label className="student-sub">{user?.university ?? ""}</Typography.Label>
            </div>

            <div style={{ marginLeft: "auto" }} className="student-header-actions">
              <Button mode="secondary" size="small" onClick={() => navigate("/my-courses")}>Мои курсы</Button>
            </div>
          </Flex>
        </div>

        {/* Cards grid */}
        <Grid cols={2} gap={16} className="student-cards-grid">
          {cards.map(c => (
            <Panel key={c.key} mode="secondary" className="student-card" onClick={() => navigate(c.to)} role="button">
              <Flex justify="space-between" align="center" style={{ width: "100%" }}>
                <div className="student-card-left">
                  <Typography.Title variant="small-strong" className="student-card-title">{c.title}</Typography.Title>
                  <Typography.Label className="student-card-desc">{c.desc}</Typography.Label>
                </div>

                <div className="student-card-actions">
                  <Button mode="tertiary" size="small" onClick={(e) => { e.stopPropagation(); navigate(c.to); }}>
                    {c.action}
                  </Button>
                </div>
              </Flex>
            </Panel>
          ))}
        </Grid>

        {/* Feature block */}
        <div style={{ marginTop: 18 }}>
          <Panel className="student-feature" mode="secondary">
            <Container style={{ padding: 14 }}>
              <Flex align="center" gap={12}>
                <Avatar.Container size={72} form="squircle">
                  <Avatar.Image src="https://placekitten.com/800/450" className="feature-img" />
                </Avatar.Container>

                <div style={{ flex: 1 }}>
                  <Typography.Title variant="medium-strong">Студенческий спорт</Typography.Title>
                  <Typography.Label>Расписание тренировок, запись и новости спортивного центра.</Typography.Label>
                </div>

                <div>
                  <Button mode="primary" onClick={() => navigate("/sports")}>Записаться</Button>
                </div>
              </Flex>
            </Container>
          </Panel>
        </div>
      </Container>
    </MainLayout>
  );
}
