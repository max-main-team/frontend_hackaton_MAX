import { useNavigate } from "react-router-dom";
import { Panel, Container, Flex, Avatar, Typography, Button } from "@maxhub/max-ui";
import MainLayout from "../layouts/MainLayout";
import { useMaxWebApp } from "../hooks/useMaxWebApp";

export default function ProfilePage() {
  const { webAppData } = useMaxWebApp();
  const user = webAppData?.user ?? null;
  const navigate = useNavigate();

  async function onLogout() {
    try { /* empty */ } catch (e) {
      console.warn("Logout error", e);
    } finally {
      navigate("/select", { replace: true });
    }
  }

  return (
    <MainLayout>
      <Container style={{ paddingTop: 8 }}>
        <Panel 
          mode="secondary" 
          style={{ 
            padding: 24, 
            borderRadius: 12,
            marginTop: 12
          }}
        >
          <Flex direction="column" align="center" gap={16}>
            {/* Аватар */}
            <Avatar.Container size={96} form="circle">
              <Avatar.Image src={user?.avatar_url ?? user?.photo_url ?? ""} />
            </Avatar.Container>

            {/* Имя и фамилия */}
            <Flex direction="column" align="center" gap={4}>
              <Typography.Title variant="large-strong" style={{ margin: 0, textAlign: 'center' }}>
                {user?.first_name ?? ""} {user?.last_name ?? ""}
              </Typography.Title>
              
              {/* Username */}
              {user?.username && (
                <Typography.Label style={{ color: 'var(--maxui-muted, #6b7280)' }}>
                  @{user.username}
                </Typography.Label>
              )}
            </Flex>

            {/* Описание и университет */}
            <Flex direction="column" align="center" gap={8} style={{ width: '100%' }}>
              {user?.description && (
                <Typography.Label style={{ textAlign: 'center' }}>
                  {user.description}
                </Typography.Label>
              )}
              
              {user?.university && (
                <Typography.Label style={{ textAlign: 'center' }}>
                  {user.university}
                </Typography.Label>
              )}
            </Flex>

            {/* Кнопки */}
            <Flex gap={8} style={{ width: '100%', marginTop: 8 }}>
              <Button 
                mode="secondary" 
                appearance="neutral" 
                stretched
                onClick={() => navigate(-1)}
              >
                Назад
              </Button>
              
              <Button 
                mode="secondary" 
                appearance="neutral" 
                stretched
                onClick={onLogout}
              >
                Выйти
              </Button>
            </Flex>
          </Flex>
        </Panel>
      </Container>
    </MainLayout>
  );
}