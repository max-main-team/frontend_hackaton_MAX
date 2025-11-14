import "../css/MultiSelectPage.css";
import { useNavigate } from "react-router-dom";
import { Panel, Container, Typography, Button, Grid } from "@maxhub/max-ui";
import { useEffect, useState } from "react";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout";

const ROLE_LABEL: Record<string, string> = {
  admin: "Администратор",
  teacher: "Преподаватель",
  student: "Студент",
};

export default function MultiSelectPage() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<string[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadRoles() {
      setLoading(true);
      try {
        const cached = localStorage.getItem("user_roles");
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
    let mounted = true;

    async function loadProfile() {
      try {
        const res = await api.get("https://msokovykh.ru/user/me");
        const data = res.data;
        const u = data?.user;
        if (!mounted) return;

        if (u) {
          const fullName = [u.first_name, u.last_name].filter(Boolean).join(" ").trim() || u.username || null;
          setUserName(fullName);
        } else {
          setUserName(null);
        }
      } catch (e) {
        console.warn("Failed to load user profile", e);
        if (!mounted) return;
        setUserName(null);
      }
    }

    loadProfile();
    return () => { mounted = false; };
  }, []);

  const onSelectRole = (role: string) => {
    switch (role) {
      case "student":
        navigate("/student", { replace: true });
        break;
      case "teacher":
        navigate("/teacher", { replace: true });
        break;
      case "admin":
        navigate("/admin", { replace: true });
        break;
      default:
        console.warn("Unknown role", role);
    }
  };

  return (
    <MainLayout hideTabs={true}>
      <Container className="ms-container">
        <div className="ms-header">
          <Typography.Title variant="large-strong" className="ms-title">
            Выберите профиль, {userName || "Гость"}
          </Typography.Title>

          <Panel mode="secondary" className="ms-note-panel">
            <Typography.Label className="ms-note">
              Выберите роль, в которой хотите работать в этом сеансе.
            </Typography.Label>
          </Panel>
        </div>

        {loading && (
          <Panel mode="secondary" className="ms-note-panel ms-loading">
            <Typography.Label>Загрузка...</Typography.Label>
          </Panel>
        )}

        {!loading && (!roles || roles.length === 0) && (
          <Panel mode="secondary" className="ms-note-panel ms-empty">
            <Typography.Label style={{ display: "block", marginBottom: 8 }}>
              Не удалось определить доступные роли. Попробуйте перезайти в приложение.
            </Typography.Label>
            <div className="ms-actions">
              <Button mode="tertiary" onClick={() => { localStorage.removeItem("user_roles"); window.location.reload(); }}>
                Повторить попытку
              </Button>
            </div>
          </Panel>
        )}

        {!loading && roles && roles.length > 0 && (
          <Grid cols={1} gap={12} className="ms-roles-grid">
            {roles.map((r) => {
              const key = String(r);
              const label = ROLE_LABEL[key] ?? key;
              return (
                <div key={key} className="ms-role-row">
                  <Button
                    className="role-button"
                    onClick={() => onSelectRole(key)}
                    aria-label={`Выбрать роль ${label}`}
                  >
                    <Typography.Title variant="small-strong" className="role-button__title">
                      {label}
                    </Typography.Title>
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
