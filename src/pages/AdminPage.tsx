import "../css/admin-page.css";
import { Panel, Grid, Container, Flex, Avatar, Typography, Button } from "@maxhub/max-ui";
import MainLayout from "../layouts/MainLayout";

export default function AdminPage() {
  return (
    <MainLayout>
      <div className="admin-section">
        <Typography.Title variant="medium-strong">Кампус</Typography.Title>

        <Grid cols={2} gap={12}>
          <Panel className="admin-card admin-card--tall admin-card--accent-left" mode="secondary">
            <Container className="admin-card__content">
              <Typography.Title variant="small-strong">Загруженность</Typography.Title>
            </Container>
          </Panel>

          <Panel className="admin-card admin-card--tall admin-card--right" mode="secondary">
            <Container className="admin-card__content">
              <Typography.Title variant="small-strong">Пропуск</Typography.Title>
            </Container>
          </Panel>

          <Panel
            className="admin-card admin-card--wide admin-card--wide-bg"
            mode="secondary"
            style={{ gridColumn: "1 / 2" }}
          >
            <Container className="admin-card__content">
              <Typography.Title variant="small-strong">Weeeeee</Typography.Title>
            </Container>
          </Panel>
        </Grid>
      </div>

      <div className="admin-section" style={{ marginTop: 18 }}>
        <Typography.Title variant="medium-strong">Административное</Typography.Title>

        <Grid cols={2} gap={12}>
          <Panel className="admin-card" mode="primary">
            <Container style={{ padding: 12 }}>
              <Typography.Title variant="small-strong">Заявки</Typography.Title>
            </Container>
          </Panel>
          <Panel className="admin-card" mode="primary">
            <Container style={{ padding: 12 }}>
              <Typography.Title variant="small-strong">Очереди</Typography.Title>
            </Container>
          </Panel>
        </Grid>
      </div>

      <div className="admin-section" style={{ marginTop: 18 }}>
        <Typography.Title variant="medium-strong">Обучение</Typography.Title>

        <Panel className="admin-card admin-card--feature admin-card--feature-bg">
          <Container style={{ padding: 12 }}>
            <Flex align="center" gap={12}>
              <Avatar.Container size={72} form="squircle">
                <Avatar.Image src="https://placekitten.com/400/200" />
              </Avatar.Container>

              <div style={{ flex: 1 }}>
                <Typography.Title variant="small-strong">Спорт</Typography.Title>
                <Typography.Label>Короткое описание сервиса — как на картинке.</Typography.Label>
              </div>

              <div style={{ marginLeft: "auto" }}>
                <Button>Открыть</Button>
              </div>
            </Flex>
          </Container>
        </Panel>
      </div>
    </MainLayout>
  );
}
