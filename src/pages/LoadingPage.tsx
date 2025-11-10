import '../css/MainLayout.css';
import { Panel, Container, Typography } from "@maxhub/max-ui";

export default function LoadingPage() {
  return (
    <div className="fullscreen-overlay" >
      <Panel className="panel-inner" mode="secondary" centeredX centeredY>
        <Container style={{ textAlign: "center", padding: 28 }}>
          <Typography.Title variant="large-strong">Загрузка...</Typography.Title>
        </Container>
      </Panel>
    </div>
  );
}
