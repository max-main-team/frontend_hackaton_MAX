import { Panel, Container, Flex, Typography } from "@maxhub/max-ui";

export default function LoadingPage() {
  return (
    <div style={{ padding: 20 }}>
      <Panel mode="secondary">
        <Container style={{ padding: 28 }}>
          <Flex direction="column" align="center" justify="center" style={{ minHeight: 120 }}>
            <Typography.Title variant="large-strong">Загрузка...</Typography.Title>
            <Typography.Label>Подключаемся к MAX и получаем данные</Typography.Label>
          </Flex>
        </Container>
      </Panel>
    </div>
  );
}
