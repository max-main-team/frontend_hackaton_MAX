import '../css/MainLayout.css';
import { Panel, Container, Spinner } from "@maxhub/max-ui";

export default function LoadingPage() {
  return (
    <div className="fullscreen-overlay" >
      <Panel className="panel-inner" mode="secondary" centeredX centeredY>
        <Container style={{ textAlign: "center", padding: 20 }}>
          <Spinner
            appearance="neutral-themed"
            size={40}
          />
        </Container>
      </Panel>
    </div>
  );
}
