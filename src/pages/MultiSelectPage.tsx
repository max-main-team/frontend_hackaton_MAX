import { useNavigate } from "react-router-dom";
import { Panel, Container, Flex, Typography, Button, Grid } from "@maxhub/max-ui";
import MainLayout from "../layouts/MainLayout";
//import { getDeviceItem } from "../services/webappStorage";
import { useEffect, useState } from "react";

const ROLE_LABEL: Record<string, string> = {
  admin: "Администратор",
  teacher: "Преподаватель",
  student: "Студент",
};

export default function MultiSelectPage() {
  const navigate = useNavigate();

  const [roles, setRoles] = useState<string[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // NEW: store token and raw roles string for display
  const [storedToken, setStoredToken] = useState<string | null>(null);
  const [storedRolesRaw, setStoredRolesRaw] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const cached = await window.WebApp?.DeviceStorage?.getItem("user_roles");
        const token = await window.WebApp?.DeviceStorage?.getItem("access_token");
        if (!mounted) return;

        setStoredToken(token ?? null);
        setStoredRolesRaw(cached ?? null);

        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              if (!mounted) return;
              setRoles(parsed.map(String));
              setLoading(false);
              return;
            }
          } catch {
            // ignore parse error, we'll show raw below
          }
        }

        // no roles in storage -> show empty
        setRoles([]);
      } catch (e) {
        console.error("Failed to load roles/token", e);
        setRoles([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  function onSelectRole(role: string) {
    if (role === "student") navigate("/student", { replace: true });
    else if (role === "teacher") navigate("/teacher", { replace: true });
    else if (role === "admin") navigate("/admin", { replace: true });
    else console.warn("Unknown role", role);
  }

  function goProfile() {
    navigate("/profile");
  }

  return (
    <MainLayout>
      <Container style={{ paddingTop: 8 }}>
        <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
          <div>
            <Typography.Title variant="large-strong">Выберите профиль</Typography.Title>
            {(
              <Typography.Label>
                "dgfdg"
              </Typography.Label>
            )}
          </div>

          <div>
            <Button onClick={goProfile} mode="tertiary" size="small">
              Профиль
            </Button>
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

            {/* NEW: debug info — показываем токен и то, что хранилось в user_roles */}
            <div style={{ marginTop: 8, wordBreak: "break-all" }}>
              <Typography.Label style={{ fontWeight: 600 }}>Токен (access_token):</Typography.Label>
              <Typography.Label style={{ display: "block", marginBottom: 8 }}>
                {storedToken ?? <span style={{ color: "var(--maxui-muted, #6b7280)" }}>не найден</span>}
              </Typography.Label>

              <Typography.Label style={{ fontWeight: 600 }}>Роли (raw from storage):</Typography.Label>
              <Typography.Label style={{ display: "block" }}>
                {storedRolesRaw ?? <span style={{ color: "var(--maxui-muted, #6b7280)" }}>не найдены</span>}
              </Typography.Label>

              {/* Попробуем показать распарсенные роли, если можно */}
              <div style={{ marginTop: 8 }}>
                <Typography.Label style={{ fontWeight: 600 }}>Роли (parsed):</Typography.Label>
                <Typography.Label style={{ display: "block" }}>
                  {Array.isArray(roles) && roles.length > 0 ? roles.join(", ") : <span style={{ color: "var(--maxui-muted, #6b7280)" }}>нет</span>}
                </Typography.Label>
              </div>
            </div>
          </Panel>
        )}

        {!loading && roles && roles.length > 0 && (
          <Grid cols={1} gap={12}>
            {roles.map((r) => {
              const key = String(r);
              const label = ROLE_LABEL[key] ?? key;
              return (
                <div key={key}>
                  <Button
                    mode="primary"
                    size="large"
                    onClick={() => onSelectRole(key)}
                    style={{ width: "100%", justifyContent: "flex-start", paddingLeft: 16 }}
                  >
                    <Flex align="center" style={{ width: "100%" }}>
                      <div style={{ flex: 1 }}>
                        <Typography.Title variant="small-strong" style={{ margin: 0 }}>{label}</Typography.Title>
                        <Typography.Label style={{ color: "var(--maxui-muted, #6b7280)" }}>
                          Войти как {label.toLowerCase()}
                        </Typography.Label>
                      </div>
                      <div>
                        <Typography.Label>→</Typography.Label>
                      </div>
                    </Flex>
                  </Button>
                </div>
              );
            })}
          </Grid>
        )}
      </Container>
    </MainLayout>
  );
}
