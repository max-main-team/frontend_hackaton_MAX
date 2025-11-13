import { useNavigate } from "react-router-dom";
import { Panel, Container, Flex, Typography, Grid, Avatar } from "@maxhub/max-ui";
import MainLayout from "../layouts/MainLayout";
import { getDeviceItem } from "../services/webappStorage";
import { useEffect, useState } from "react";
import api from "../services/api";

const ROLE_LABEL: Record<string, string> = {
  admin: "Администратор",
  teacher: "Преподаватель",
  student: "Студент",
};

export default function MultiSelectPage() {
  const navigate = useNavigate();

  const [roles, setRoles] = useState<string[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // user profile info from /user/me
  const [userName, setUserName] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  useEffect(() => {
    // fetch roles and token from device storage (getDeviceItem has fallback)
    let mounted = true;
    async function loadRoles() {
      setLoading(true);
      try {
        const cached = await getDeviceItem("user_roles");
        if (!mounted) return;

        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setRoles(parsed.map(String));
              setLoading(false);
              return;
            }
          } catch {
            // parse error -> treat as no roles
          }
        }

        // no roles in storage -> empty array
        setRoles([]);
      } catch (e) {
        console.error("Failed to load roles/token", e);
        setRoles([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadRoles();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    // fetch profile from backend
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("https://msokovykh.ru/user/me");
        const data = res.data;
        const u = data?.user;
        if (!mounted) return;
        if (u) {
          const fullName = [u.first_name, u.last_name].filter(Boolean).join(" ").trim() || u.username || null;
          setUserName(fullName);
          setUserPhoto(u.photo_url ?? null);
        } else {
          setUserName(null);
          setUserPhoto(null);
        }
      } catch (e) {
        console.warn("Failed to load user profile", e);
        if (!mounted) return;
        setUserName(null);
        setUserPhoto(null);
      }
    })();

    return () => { mounted = false; };
  }, []);

  function onSelectRole(role: string) {
    if (role === "student") navigate("/student", { replace: true });
    else if (role === "teacher") navigate("/teacher", { replace: true });
    else if (role === "admin") navigate("/admin", { replace: true });
    else console.warn("Unknown role", role);
  }

  function goProfile() {
    navigate("/profile", { replace: true });
  }

  const initials = (name?: string | null) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <MainLayout>
      <Container style={{ paddingTop: 8 }}>
        <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
          <div>
            <Typography.Title variant="large-strong">Выберите профиль</Typography.Title>
            {userName ? (
              <Typography.Label>{userName}</Typography.Label>
            ) : (
              <Typography.Label>Гость</Typography.Label>
            )}
          </div>

          <div style={{ cursor: "pointer" }} onClick={goProfile} aria-label="Профиль">
            <Avatar.Container size={40} form="circle">
              {userPhoto ? <Avatar.Image src={userPhoto} /> : <Avatar.Text>{initials(userName)}</Avatar.Text>}
            </Avatar.Container>
          </div>
        </Flex>

        <Panel mode="secondary" className="card card--feature" style={{ padding: 12, marginBottom: 14 }}>
          <Container>
            <Typography.Label>
              Выберите роль, в которой хотите работать в этом сеансе.
            </Typography.Label>
          </Container>
        </Panel>

        {loading && (
          <Panel mode="secondary" className="card" style={{ padding: 14 }}>
            <Typography.Label>Загрузка...</Typography.Label>
          </Panel>
        )}

        {!loading && (!roles || roles.length === 0) && (
          <Panel mode="secondary" className="card" style={{ padding: 14 }}>
            <Typography.Label style={{ display: "block", marginBottom: 8 }}>
              Не удалось определить доступные роли. Попробуйте перезайти в приложение.
            </Typography.Label>
          </Panel>
        )}

        {!loading && roles && roles.length > 0 && (
          <Grid cols={1} gap={12}>
            {roles.map((r) => {
              const key = String(r);
              const label = ROLE_LABEL[key] ?? key;
              return (
                <div key={key}>
                  <button type="button" onClick={() => onSelectRole(key)}
                          style={{ width: "100%", display: "block", paddingLeft: 16 }}>
                    <div style={{display: "flex", alignItems: "center", width: "100%"}}>
                      <div style={{ flex: 1 }}>
                        <Typography.Title variant="small-strong" style={{ margin: 0 }}>{label}</Typography.Title>
                        <Typography.Label style={{ color: "var(--maxui-muted, #6b7280)" }}>
                          Войти как {label.toLowerCase()}
                        </Typography.Label>
                      </div>
                      <div><Typography.Label>→</Typography.Label></div>
                    </div>
                  </button>
                
                </div>
              );
            })}
          </Grid>
        )}
      </Container>
    </MainLayout>
  );
}
