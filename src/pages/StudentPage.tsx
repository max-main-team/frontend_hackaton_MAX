import { Panel, Grid, Container, Flex, Avatar, Typography, Button } from "@maxhub/max-ui";
import MainLayout from "../layouts/MainLayout";
import { useMaxWebApp } from "../hooks/useMaxWebApp";
import "./css/admin-page.css";

export default function StudentPage() {
  const { webAppData } = useMaxWebApp();
  const user = webAppData?.user ?? {};
  const name = user?.first_name ? `${user.first_name}${user.last_name ? " " + user.last_name : ""}` : "Студент";

  return (
    <MainLayout>
      <div style={{ marginBottom: 12 }}>
        <Flex align="center" gap={12}>
          <Avatar.Container size={56} form="circle">
            <Avatar.Image src={user?.full_avatar_url ?? user?.avatar_url ?? ""} />
          </Avatar.Container>

          <div>
            <Typography.Title variant="large-strong">Привет, {name}!</Typography.Title>
            <Typography.Label>{user?.university ?? ""}</Typography.Label>
          </div>

          <div style={{ marginLeft: "auto" }}>
            <Button>Мои курсы</Button>
          </div>
        </Flex>
      </div>

      {/* Быстрые карточки */}
      <Grid cols={2} gap={12}>
        <Panel mode="secondary" className="card">
          <Container style={{ padding: 12 }}>
            <Typography.Title variant="small-strong">Расписание</Typography.Title>
            <Typography.Label>Посмотреть текущее расписание</Typography.Label>
          </Container>
        </Panel>

        <Panel mode="secondary" className="card">
          <Container style={{ padding: 12 }}>
            <Typography.Title variant="small-strong">Зачётка</Typography.Title>
            <Typography.Label>Оценки и прогресс</Typography.Label>
          </Container>
        </Panel>

        <Panel mode="secondary" className="card card--wide">
          <Container style={{ padding: 12 }}>
            <Typography.Title variant="small-strong">Актуальное</Typography.Title>
            <Typography.Label>Новости университета и объявления</Typography.Label>
          </Container>
        </Panel>

        <Panel mode="secondary" className="card">
          <Container style={{ padding: 12 }}>
            <Typography.Title variant="small-strong">Сервисы</Typography.Title>
            <Typography.Label>Доступные сервисы кампуса</Typography.Label>
          </Container>
        </Panel>
      </Grid>

      <div style={{ marginTop: 18 }}>
        <Panel className="card card--feature">
          <Container style={{ padding: 12 }}>
            <Flex align="center" gap={12}>
              <Avatar.Container size={72} form="squircle">
                <Avatar.Image src="https://placekitten.com/400/200" />
              </Avatar.Container>
              <div style={{ flex: 1 }}>
                <Typography.Title variant="medium-strong">Студенческий спорт</Typography.Title>
                <Typography.Label>
                  Расписание тренировок, запись и новости спортивного центра.
                </Typography.Label>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <Button>Записаться</Button>
              </div>
            </Flex>
          </Container>
        </Panel>
      </div>
    </MainLayout>
  );
}
