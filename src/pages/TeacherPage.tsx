import "../css/AdminPage.css";
import { Panel, Grid, Container, Flex, Avatar, Typography, Button } from "@maxhub/max-ui";
import MainLayout from "../layouts/MainLayout";
import { useMaxWebApp } from "../hooks/useMaxWebApp";

export default function TeacherPage() {
  const { webAppData } = useMaxWebApp();
  const user = webAppData?.user ?? {};
  const name = user?.first_name ? `${user.first_name}${user.last_name ? " " + user.last_name : ""}` : "Преподаватель";

  return (
    <MainLayout>
      <div style={{ marginBottom: 12 }}>
        <Flex align="center" gap={12}>
          <Avatar.Container size={56} form="circle">
            <Avatar.Image src={user?.full_avatar_url ?? user?.avatar_url ?? ""} />
          </Avatar.Container>

          <div>
            <Typography.Title variant="large-strong">Здравствуйте, {name}!</Typography.Title>
            <Typography.Label>{user?.university ?? ""}</Typography.Label>
          </div>

          <div style={{ marginLeft: "auto" }}>
            <Button>Мои группы</Button>
          </div>
        </Flex>
      </div>

      <Grid cols={2} gap={12}>
        <Panel mode="secondary" className="card">
          <Container style={{ padding: 12 }}>
            <Typography.Title variant="small-strong">Расписания</Typography.Title>
            <Typography.Label>Изменить расписание и вызвать замену</Typography.Label>
          </Container>
        </Panel>

        <Panel mode="secondary" className="card">
          <Container style={{ padding: 12 }}>
            <Typography.Title variant="small-strong">Оценки</Typography.Title>
            <Typography.Label>Просмотр и выставление оценок</Typography.Label>
          </Container>
        </Panel>

        <Panel mode="secondary" className="card card--wide">
          <Container style={{ padding: 12 }}>
            <Typography.Title variant="small-strong">Приемные часы</Typography.Title>
            <Typography.Label>Управление временем приёма студентов</Typography.Label>
          </Container>
        </Panel>

        <Panel mode="secondary" className="card">
          <Container style={{ padding: 12 }}>
            <Typography.Title variant="small-strong">Объявления</Typography.Title>
            <Typography.Label>Создать объявление для группы</Typography.Label>
          </Container>
        </Panel>
      </Grid>

      <div style={{ marginTop: 18 }}>
        <Panel className="card card--feature">
          <Container style={{ padding: 12 }}>
            <Flex align="center" gap={12}>
              <div style={{ flex: 1 }}>
                <Typography.Title variant="medium-strong">Управление курсом</Typography.Title>
                <Typography.Label>Инструменты для загрузки материалов и проверки работ.</Typography.Label>
              </div>
              <div>
                <Button>Перейти</Button>
              </div>
            </Flex>
          </Container>
        </Panel>
      </div>
    </MainLayout>
  );
}
