import { useNavigate } from "react-router-dom";
import { Panel, Container, Flex, Avatar, Typography, Button } from "@maxhub/max-ui";
import MainLayout from "../layouts/MainLayout";
import { useMaxWebApp } from "../hooks/useMaxWebApp";

export default function ProfilePage() {
  const { webAppData, clearAuthStorage } = useMaxWebApp();
  const user = webAppData?.user ?? null;
  const navigate = useNavigate();

  async function onLogout() {
    try {
      await clearAuthStorage?.();
    } catch (e) {
      console.warn("Logout error", e);
    } finally {
      navigate("/select", { replace: true });
    }
  }

  return (
    <MainLayout>
      <Container style={{ paddingTop: 8 }}>
        <Typography.Title variant="large-strong">Профиль</Typography.Title>

        <Panel mode="secondary" className="card card--feature" style={{ padding: 16, marginTop: 12 }}>
          <Flex align="center" gap={12}>
            <Avatar.Container size={96} form="squircle">
              <Avatar.Image src={user?.avatar_url ?? user?.photo_url ?? ""} />
            </Avatar.Container>

            <div style={{ flex: 1 }}>
              <Typography.Title variant="medium-strong" style={{ margin: 0 }}>
                {user?.first_name ?? ""} {user?.last_name ?? ""}
              </Typography.Title>
              {user?.username && <Typography.Label>@{user.username}</Typography.Label>}
              <div style={{ marginTop: 8 }}>
                {user?.description && <Typography.Label>{user.description}</Typography.Label>}
                {user?.university && <Typography.Label style={{ display: "block", marginTop: 6 }}>{user.university}</Typography.Label>}
              </div>
            </div>
          </Flex>
        </Panel>

        <div style={{ marginTop: 18 }}>
          <Button mode="tertiary" onClick={() => navigate(-1)}>Назад</Button>
          <Button mode="tertiary" style={{ marginLeft: 8 }} onClick={onLogout}>Выйти</Button>
        </div>
      </Container>
    </MainLayout>
  );
}
