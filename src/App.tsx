import { useEffect, useState } from "react";
import { useMaxWebApp } from "./hooks/useMaxWebApp";
import { api } from "./services/api";
import { Panel, Grid, Container, Flex, Avatar, Typography } from '@maxhub/max-ui';

function App() {
  const { initData} = useMaxWebApp();
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (!initData) return;
    setLoading(true);

    api.post("/auth/webapp-init", initData)
      .then(res => {
        const token = res.data?.token;
        if (token) localStorage.setItem("access_token", token);
      })
      .catch(err => {
        console.error("auth failed", err);
      })
      .finally(() => setLoading(false));
  }, [initData]);

  return (
    <div style={{ padding: 20 }}>
      <h1>MiniApp</h1>
      {loading && <p>Авторизация...</p>}
      {!loading && (
        <>
          <Panel mode="secondary" className="panel">
            <Grid gap={12} cols={1}>
                <Container className="me">
                    <Flex direction="column" align="center">
                        <Avatar.Container size={72} form="squircle" className="me__avatar">
                            <Avatar.Image src="https://sun9-21.userapi.com/1N-rJz6-7hoTDW7MhpWe19e_R_TdGV6Wu5ZC0A/67o6-apnAks.jpg" />
                        </Avatar.Container>

                        <Typography.Title>Иван Иванов</Typography.Title>
                    </Flex>
                </Container>
            </Grid>
        </Panel>
        </>
      )}
    </div>
  );
}

export default App;
