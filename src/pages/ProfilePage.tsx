// src/pages/ProfilePage.tsx
import{ type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Panel, Flex, Avatar, Typography, Button } from "@maxhub/max-ui";
import { useMaxWebApp } from "../hooks/useMaxWebApp";

export default function ProfilePage(): JSX.Element {
  const navigate = useNavigate();
  const { webAppData } = useMaxWebApp();
  const user = webAppData?.user ?? null;
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim() || user?.username || "Пользователь";

  function initials(name?: string | null) {
    if (!name) return "U";
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  function onLogout() {
    navigate("/select", { replace: true });
  }

  return (
    // wrapper гарантированно занимает весь экран и не подвержен ограничениям родителя
    <div style={{
      position: "fixed",
      inset: 0,
      width: "100vw",
      height: "100vh",
      boxSizing: "border-box",
      background: "transparent",
      paddingTop: "env(safe-area-inset-top)",
      paddingBottom: "env(safe-area-inset-bottom)",
    }}>
      <Panel
        mode="secondary"
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 0,       // полноэкранно без скруглений
          boxSizing: "border-box",
          padding: 28,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* внутренности панели: по центру, но Panel сам full-bleed */}
        <Flex direction="column" align="center" justify="center" style={{ width: "100%", height: "100%" }} gap={16}>
          <Avatar.Container size={120} form="circle">
            {user?.avatar_url || user?.photo_url ? (
              <Avatar.Image src={user?.avatar_url ?? user?.photo_url ?? ""} />
            ) : (
              <Avatar.Text>{initials(fullName)}</Avatar.Text>
            )}
          </Avatar.Container>

          <Typography.Title variant="large-strong" style={{ margin: 0, textAlign: "center" }}>
            {fullName}
          </Typography.Title>

          <div style={{ height: 10 }} />

          <Flex gap={12} style={{ width: "100%", maxWidth: 480 }}>
            <Button mode="secondary" appearance="neutral" stretched onClick={() => navigate(-1)}>
              Назад
            </Button>

            <Button mode="secondary" appearance="neutral" stretched onClick={onLogout}>
              Выйти
            </Button>
          </Flex>
        </Flex>
      </Panel>
    </div>
  );
}
