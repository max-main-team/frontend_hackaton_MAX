import { Panel, Container, Flex, Typography } from "@maxhub/max-ui";
import '@maxhub/max-ui/dist/styles.css';
import '../css/MainLayout.css';

export default function LoadingPage() {
  return (
    <Panel>
      <Container>
        <Flex>
          <Typography.Title variant="large-strong">Загрузка...</Typography.Title>
        </Flex>
      </Container>
    </Panel>
  );
}
