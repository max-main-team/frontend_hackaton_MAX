import { Panel, Container, Typography } from "@maxhub/max-ui";
import '@maxhub/max-ui/dist/styles.css';
import '../css/MainLayout.css';

export default function LoadingPage() {
  return (
    <div className="fullscreen-overlay">
      <Panel className="panel-inner" mode="secondary">
        <Container style={{ textAlign: "center" }}>
          <Typography.Title variant="large-strong">Загрузка...</Typography.Title>
        </Container>
      </Panel>
    </div>
  );
}
