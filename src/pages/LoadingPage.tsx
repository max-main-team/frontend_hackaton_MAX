import { Panel, Container, Flex, Typography } from "@maxhub/max-ui";

export default function LoadingPage() {
  return (
    <div style={{ padding: 20 }}>
      <div className="full-screen-page">
        <Panel className="full-screen-panel" mode="secondary">
          <Container style={{ padding: 28 }}>
            <Flex direction="column" align="center" justify="center" style={{ minHeight: 120 }}>
              <Typography.Title variant="large-strong">Загрузка...</Typography.Title>
            </Flex>
          </Container>
        </Panel>
      </div>
    </div>
  );
}
