/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Panel, Container, Flex, Avatar, Typography, Button } from "@maxhub/max-ui";
import api from "../services/api";

type UserLike = {
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  avatar_url?: string;
  university?: string;
  [k: string]: any;
};

export default function ProfilePage(): JSX.Element {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserLike | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      setLoading(true);
      try {
        const res = await api.get("https://msokovykh.ru/user/me");
        const data = res.data;
        const u = data?.user ?? data;
        if (!mounted) return;
        setUser(u ?? null);
      } catch (e) {
        console.warn("Failed to load user profile", e);
        if (!mounted) return;
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadProfile();
    return () => { mounted = false; };
  }, []);

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim() || user?.username || "Пользователь";

  function initials(name?: string | null) {
    if (!name) return "U";
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  function onLogout() {
    // тут можно очистить storage если нужно
    navigate("/select", { replace: true });
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "stretch",  
      justifyContent: "stretch",
      paddingTop: "env(safe-area-inset-top)",
      paddingBottom: "env(safe-area-inset-bottom)",
      boxSizing: "border-box"
    }}>
      <Panel
        mode="secondary"
        style={{
          width: "100%",
          maxWidth: "100%",
          minHeight: "100vh",
          borderRadius: 0,
          boxSizing: "border-box",
          padding: 28,
        }}
      >
        <Container style={{ width: "100%", padding: 0, boxSizing: "border-box" }}>
            {loading ? (
              <Typography.Title variant="large-strong">Загрузка...</Typography.Title>
            ) : (
              <>
                <Avatar.Container size={120} form="circle">
                  {user?.avatar_url || user?.photo_url ? (
                    <Avatar.Image src={user?.avatar_url ?? user?.photo_url ?? ""} />
                  ) : (
                    <Avatar.Text>{initials(fullName)}</Avatar.Text>
                  )}
                </Avatar.Container>

                <Flex direction="column" align="center" gap={6}>
                  <Typography.Title variant="large-strong" style={{ margin: 0, textAlign: "center" }}>
                    {fullName}
                  </Typography.Title>

                  {user?.university && (
                    <Typography.Label style={{ color: "var(--maxui-muted, #6b7280)" }}>
                      {user.university}
                    </Typography.Label>
                  )}
                </Flex>

                <div style={{ height: 10 }} />

                <Flex gap={12} style={{ width: "100%", maxWidth: 480 }}>
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
              </>
            )}
        </Container>
      </Panel>
    </div>
  );
}
