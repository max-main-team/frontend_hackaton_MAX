import { Panel, Grid, Container, Flex, Avatar, Typography, Button } from "@maxhub/max-ui";
import MainLayout from "../layouts/MainLayout";
import "./admin-page.css";

export default function AdminPage() {
  return (
    <MainLayout>
      <div className="section">
        <Typography.Title variant="medium-strong">Кампус</Typography.Title>

        <Grid cols={2} gap={12}>
          <Panel className="card card--tall card--accent-left" mode="secondary">
            <Container className="card__content">
              <Typography.Title variant="small-strong">Загруженность</Typography.Title>
            </Container>
          </Panel>

          <Panel className="card card--tall card--right" mode="secondary">
            <Container className="card__content">
              <Typography.Title variant="small-strong">Пропуск</Typography.Title>
            </Container>
          </Panel>

          <Panel className="card card--wide" mode="secondary" style={{ gridColumn: "1 / 2" }}>
            <Container className="card__content">
              <Typography.Title variant="small-strong">Weeeeee</Typography.Title>
            </Container>
          </Panel>
        </Grid>
      </div>

      <div className="section" style={{ marginTop: 18 }}>
        <Typography.Title variant="medium-strong">Административное</Typography.Title>

        <Grid cols={2} gap={12}>
          <Panel className="card" mode="primary">
            <Container style={{ padding: 12 }}>
              <Typography.Title variant="small-strong">Заявки</Typography.Title>
            </Container>
          </Panel>
          <Panel className="card" mode="primary">
            <Container style={{ padding: 12 }}>
              <Typography.Title variant="small-strong">Очереди</Typography.Title>
            </Container>
          </Panel>
        </Grid>
      </div>

      <div className="section" style={{ marginTop: 18 }}>
        <Typography.Title variant="medium-strong">Обучение</Typography.Title>

        <Panel className="card card--feature">
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
