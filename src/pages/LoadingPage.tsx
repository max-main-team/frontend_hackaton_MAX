import { Panel, Container, Flex, Typography } from "@maxhub/max-ui";
import '../css/MainLayout.css';

export default function LoadingPage() {
  return (
        <Panel>
          <Container style={{ padding: 28 }}>
            <Flex>
              <Typography.Title variant="large-strong">Загрузка...</Typography.Title>
            </Flex>
          </Container>
        </Panel>
  );
}
