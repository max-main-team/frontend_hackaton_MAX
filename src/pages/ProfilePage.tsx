import { useNavigate } from "react-router-dom";
import { Panel, Container, Flex, Avatar, Typography, Button } from "@maxhub/max-ui";
import { useMaxWebApp } from "../hooks/useMaxWebApp";

export default function ProfilePage() {
  const { webAppData } = useMaxWebApp();
  const user = webAppData?.user ?? null;
  const navigate = useNavigate();

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();

  function initials(name?: string | null) {
    if (!name) return "U";
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  async function onLogout() {
    navigate("/select", { replace: true });
  }

  return (
      <Container style={{ paddingTop: 8 }}>
        <Panel
          mode="secondary"
          style={{
            padding: 24,
            borderRadius: 12,
            marginTop: 12,
            maxWidth: 720,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <Flex direction="column" align="center" gap={16}>
            {/* Аватар */}
            <Avatar.Container size={96} form="circle">
              {user?.avatar_url || user?.photo_url ? (
                <Avatar.Image src={user?.photo_url ?? ""} />
              ) : (
                <Avatar.Text>{initials(fullName ?? user?.username ?? null)}</Avatar.Text>
              )}
            </Avatar.Container>

            {/* Имя и фамилия */}
            <Flex direction="column" align="center" gap={4}>
              <Typography.Title variant="large-strong" style={{ margin: 0, textAlign: "center" }}>
                {fullName || "Пользователь"}
              </Typography.Title>
            </Flex>

            {/* Пустое пространство (чтобы карточка выглядела как в примере) */}
            <div style={{ height: 6 }} />

            {/* Кнопки */}
            <Flex gap={8} style={{ width: "100%", marginTop: 8 }}>
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
  );
}
