/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import {
  Panel,
  Container,
  Flex,
  Avatar,
  Typography,
  Button,
  Grid,
} from "@maxhub/max-ui";
import MainLayout from "../layouts/MainLayout";
import { useMaxWebApp } from "../hooks/useMaxWebApp";
import api from "../services/api";
import "../css/ApplicantPage.css";

type University = {
  id: string | number;
  name: string;
  short?: string;
  description?: string;
  city?: string;
  logo?: string;
  tags?: string[];
};

const FALLBACK_UNIS: University[] = [
  { id: "itmo", name: "ИТМО — Университет", short: "Наука, IT и дизайн", city: "Санкт-Петербург", logo: "", tags: ["IT", "Инженерия"] },
  { id: "msu", name: "МГУ им. М. В. Ломоносова", short: "Классический университет", city: "Москва", logo: "", tags: ["Математика", "Физика"] },
  { id: "spbpu", name: "СПб Политех", short: "Политехнический университет", city: "Санкт-Петербург", logo: "", tags: ["Инженерия", "Технологии"] },
];

export default function ApplicantPage(): JSX.Element {
  const { webAppData } = useMaxWebApp();
  const user = webAppData?.user;
  const userId = webAppData?.user.id;
  const navigate = useNavigate();

  const [query, setQuery] = useState<string>("");
  const [debounced, setDebounced] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<University[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [joinOpen, setJoinOpen] = useState(false);
  const [joinUni, setJoinUni] = useState<University | null>(null);
  const [joinRole, setJoinRole] = useState<"student" | "teacher" | "admin">("student");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinResult, setJoinResult] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let mounted = true;
    async function search(q: string) {
      setError(null);
      setLoading(true);
      setResults(null);
      try {
        if (!q) {
          if (!mounted) return;
          setResults(FALLBACK_UNIS);
          return;
        }

        const res = await api.get("/universities", { params: { q } });
        const data = res.data;
        let list: University[] = [];

        if (Array.isArray(data)) {
          list = data.map((it: any) => ({
            id: it.id ?? it.code ?? it.slug ?? JSON.stringify(it),
            name: it.name ?? it.title ?? "Без названия",
            short: it.short ?? it.subtitle ?? "",
            description: it.description ?? "",
            city: it.city ?? "",
            logo: it.logo ?? it.avatar ?? "",
            tags: Array.isArray(it.tags) ? it.tags : [],
          }));
        } else if (data?.items && Array.isArray(data.items)) { 
          list = data.items.map((it: any) => ({
            id: it.id,
            name: it.name,
            short: it.short,
            description: it.description,
            city: it.city,
            logo: it.logo,
            tags: it.tags,
          }));
        } else {
          list = FALLBACK_UNIS;
        }

        if (!mounted) return;
        setResults(list);
      } catch (e: any) {
        console.warn("Universities search failed, using fallback", e);
        if (!mounted) return;
        setError("Сервис поиска временно недоступен — показываем популярные университеты.");
        setResults(FALLBACK_UNIS);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    search(debounced);
    return () => { mounted = false; };
  }, [debounced]);

  const handleOpen = (u: University) => {
    setJoinError(null);
    setJoinResult(null);
    setJoinUni(u);
    setJoinRole("student");
    setJoinOpen(true);
  };
  const handleClose = () => {
    setJoinOpen(false);
    setJoinUni(null);
    setJoinError(null);
    setJoinResult(null);
  };

  const goProfile = () => navigate("/profile");

  const emptyState = useMemo(() => (
    <Panel mode="secondary" className="card" style={{ padding: 16 }}>
      <Typography.Title variant="small-strong">Ничего не найдено</Typography.Title>
      <Typography.Label>Попробуйте другое имя или уберите часть запроса.</Typography.Label>
    </Panel>
  ), []);

  async function handleJoinSubmit() {
    if (!joinUni) return;
    if (!userId) {
      setJoinError("Не удалось определить идентификатор пользователя. Попробуйте ещё раз.");
      return;
    }

    setJoinLoading(true);
    setJoinError(null);
    setJoinResult(null);

    try {
      const body = {
        user_id: userId,
        university_id: joinUni.id,
        user_role: joinRole,
      };

      const res = await api.post("/universities/join", body);
      const message = res.data?.message ?? "Заявка отправлена успешно.";
      setJoinResult(typeof message === "string" ? message : "Успешно");
    } catch (e: any) {
      console.error("Join request failed", e);
      const msg = e?.response?.data?.message ?? e?.message ?? "Ошибка отправки заявки";
      setJoinError(String(msg));
    } finally {
      setJoinLoading(false);
    }
  }

  return (
    <MainLayout>
      <Container style={{ paddingTop: 12 }}>
        <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
          <div>
            <Typography.Title variant="large-strong">Абитуриент</Typography.Title>
            {user?.first_name && (
              <Typography.Label>{user.first_name} {user.last_name ?? ""}</Typography.Label>
            )}
          </div>

          <div>
            <Button mode="tertiary" size="small" onClick={goProfile}>
              Профиль
            </Button>
          </div>
        </Flex>

        <Panel mode="secondary" className="card card--feature" style={{ padding: 12, marginBottom: 14 }}>
          <Container>
            <Typography.Label>
              Найдите университет по названию — посмотрите описание и вступайте в группу выбранного университета.
            </Typography.Label>

            <div style={{ marginTop: 12 }}>
              <div className="uni-search-input">
                <input
                  placeholder="Поиск по названию университета (например: ИТМО, МГУ...)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="uni-input"
                />
                <Button mode="primary" onClick={() => setDebounced(query)}>
                  Найти
                </Button>
              </div>
            </div>
          </Container>
        </Panel>

        {loading && (
          <Panel mode="secondary" className="card" style={{ padding: 14 }}>
            <Typography.Label>Поиск...</Typography.Label>
          </Panel>
        )}

        {error && (
          <Panel mode="secondary" className="card" style={{ padding: 14 }}>
            <Typography.Label style={{ color: "var(--maxui-Label, #e11d48)" }}>{error}</Typography.Label>
          </Panel>
        )}

        {!loading && results && results.length === 0 && emptyState}

        {!loading && results && results.length > 0 && (
          <Grid cols={1} gap={12}>
            {results.map((u) => (
              <Panel key={u.id} mode="secondary" className="uni-card" onClick={() => handleOpen(u)}>
                <Flex align="center" gap={12} style={{ width: "100%" }}>
                  <Avatar.Container size={56} form="squircle">
                    {u.logo ? <Avatar.Image src={u.logo} /> : <Avatar.Text>{(u.name || "U").slice(0,2).toUpperCase()}</Avatar.Text>}
                  </Avatar.Container>

                  <div style={{ flex: 1 }}>
                    <Typography.Title variant="small-strong" style={{ margin: 0 }}>{u.name}</Typography.Title>
                    <Typography.Label className="uni-short">{u.short ?? u.city}</Typography.Label>
                    <div style={{ marginTop: 8 }}>
                      {u.tags?.slice(0,3).map(t => (
                        <span key={t} className="uni-tag">{t}</span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <Button
                      mode="primary"
                      size="small"
                      onClick={(e) => { e.stopPropagation(); setJoinError(null); setJoinResult(null); setJoinUni(u); setJoinRole("student"); setJoinOpen(true); }}
                    >
                      Вступить в группу {u.name}
                    </Button>

                    <Button mode="tertiary" size="small" onClick={(e) => { e.stopPropagation(); setJoinUni(u); setJoinOpen(true); }}>
                      Подробнее
                    </Button>
                  </div>
                </Flex>
              </Panel>
            ))}
          </Grid>
        )}

        {joinOpen && joinUni && (
          <div className="fullscreen-overlay">
            <Panel className="panel-inner" mode="secondary" centeredX centeredY>
              <Container style={{ padding: 18, maxWidth: 680 }}>
                <Flex direction="column" gap={12}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <Avatar.Container size={56} form="squircle">
                        {joinUni.logo ? <Avatar.Image src={joinUni.logo} /> : <Avatar.Text>{(joinUni.name||"U").slice(0,2)}</Avatar.Text>}
                      </Avatar.Container>
                      <div>
                        <Typography.Title variant="medium-strong" style={{ margin: 0 }}>{joinUni.name}</Typography.Title>
                        <Typography.Label className="uni-short">{joinUni.city ?? ""}</Typography.Label>
                      </div>
                    </div>

                    <div>
                      <Button mode="tertiary" onClick={handleClose}>Закрыть</Button>
                    </div>
                  </div>

                  <div>
                    <Typography.Label style={{ display: "block", marginBottom: 8 }}>Выберите роль, в которой хотите вступить</Typography.Label>
                    <select
                      className="uni-role-select"
                      value={joinRole}
                      onChange={(e) => setJoinRole(e.target.value as any)}
                    >
                      <option value="student">Студент</option>
                      <option value="teacher">Преподаватель</option>
                      <option value="admin">Администратор</option>
                    </select>
                  </div>

                  {joinError && (
                    <Panel mode="secondary" className="card" style={{ padding: 10 }}>
                      <Typography.Label style={{ color: "var(--maxui-Label, #e11d48)" }}>{joinError}</Typography.Label>
                    </Panel>
                  )}

                  {joinResult && (
                    <Panel mode="secondary" className="card" style={{ padding: 10 }}>
                      <Typography.Label style={{ color: "var(--maxui-primary, #0ea5e9)" }}>{joinResult}</Typography.Label>
                    </Panel>
                  )}

                  <Flex justify="end" gap={8}>
                    <Button mode="tertiary" onClick={handleClose}>Отмена</Button>
                    <Button mode="primary" onClick={handleJoinSubmit} disabled={joinLoading}>
                      {joinLoading ? "Отправка..." : `Вступить как ${joinRole}`}
                    </Button>
                  </Flex>
                </Flex>
              </Container>
            </Panel>
          </div>
        )}
      </Container>
    </MainLayout>
  );
}
