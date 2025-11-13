/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState, type JSX } from "react";
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
  site?: string;
};

const FALLBACK_UNIS: University[] = [
  { id: "itmo", name: "ИТМО — Университет", short: "Наука, IT и дизайн", city: "Санкт-Петербург", logo: "", tags: ["IT", "Инженерия"] },
  { id: "msu", name: "МГУ им. М. В. Ломоносова", short: "Классический университет", city: "Москва", logo: "", tags: ["Математика", "Физика"] },
  { id: "spbpu", name: "СПб Политех", short: "Политехнический университет", city: "Санкт-Петербург", logo: "", tags: ["Инженерия", "Технологии"] },
];

export default function ApplicantPage(): JSX.Element {
  const [user, setUser] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | number | null>(null);

  const [query, setQuery] = useState<string>("");
  const [debounced, setDebounced] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<University[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [joinOpen, setJoinOpen] = useState(false);
  const [joinUni, setJoinUni] = useState<University | null>(null);
  const [joinRole, setJoinRole] = useState<"студент" | "преподаватель" | "администатор">("студент");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinResult, setJoinResult] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("https://msokovykh.ru/user/me");
        const data = res.data;
        const u = data?.user;
        if (!mounted) return;
        if (u) {
          const fullName = [u.first_name, u.last_name].filter(Boolean).join(" ").trim() || u.username || "Пользователь";
          setUser(fullName);
          setUserId(u.id ?? null);
        } else {
          setUser(null);
          setUserId(null);
        }
      } catch (e: any) {
        console.warn("Failed to load user info", e);
        if (!mounted) return;
        setUser(null);
        setUserId(null);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function fetchUnis(q: string) {
      setError(null);
      setLoading(true);
      setResults(null);

      try {
        const res = await api.get("https://msokovykh.ru/universities/", { params: q ? { q } : undefined });
        const data = res.data;

        let list: University[] = [];

        const rawItems: any[] = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);

        if (rawItems.length > 0) {
          list = rawItems.map((it: any) => ({
            id: it.id ?? "",
            name: it.uni_name ?? "Без названия",
            short: it.uni_short_name ?? "",
            description: it.description ?? "",
            city: it.city ?? "",
            logo: it.logo ?? it.avatar ?? "",
            site: it.site_url ?? it.site ?? "",
          }));
        } else {
          if (!Array.isArray(data) && data && typeof data === "object") {
            const maybeArr = Object.values(data).filter(v => typeof v === "object");
            if (maybeArr.length > 0) {
              list = maybeArr.map((it: any) => ({
                id: it.id ?? it.uni_id ?? it.code ?? JSON.stringify(it),
                name: it.uni_name ?? it.name ?? it.title ?? "Без названия",
                short: it.uni_short_name ?? it.short ?? "",
                description: it.description ?? "",
                city: it.city ?? "",
                logo: it.logo ?? "",
                tags: Array.isArray(it.tags) ? it.tags : [],
                site: it.site_url ?? "",
              }));
            }
          }
        }

        if (q && list.length > 0) {
          const ql = q.toLowerCase();
          list = list.filter(u => (
            (u.name ?? "").toLowerCase().includes(ql) ||
            (u.short ?? "").toLowerCase().includes(ql) ||
            (u.city ?? "").toLowerCase().includes(ql)
          ));
        }

        if (list.length === 0) {
          setError("По вашему запросу ничего не найдено. Показываем популярные университеты.");
          if (!mounted) return;
          setResults(FALLBACK_UNIS);
        } else {
          if (!mounted) return;
          setResults(list);
        }
      } catch (e: any) {
        console.warn("Universities fetch failed", e);
        if (!mounted) return;
        setError("Сервис поиска временно недоступен — показываем популярные университеты.");
        setResults(FALLBACK_UNIS);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchUnis(debounced);
    return () => { mounted = false; };
  }, [debounced]);

  const handleOpen = (u: University) => {
    setJoinError(null);
    setJoinResult(null);
    setJoinUni(u);
    setJoinRole("студент");
    setJoinOpen(true);
  };
  const handleClose = () => {
    setJoinOpen(false);
    setJoinUni(null);
    setJoinError(null);
    setJoinResult(null);
  };

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

      const res = await api.post("https://msokovykh.ru/universities/", body);
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
      <Container className="applicant-container" style={{ paddingTop: 12 }}>
        <div style={{ marginBottom: 24 }}>
          <Typography.Title variant="large-strong" style={{ margin: 0 }}>
            Абитуриент {user || 'Гость'}
          </Typography.Title>
        </div>

        <Panel mode="secondary" className="card card--feature" style={{ padding: 20, marginBottom: 20 }}>
          <Container>
            <Typography.Label className="search-description">
              Найдите университет по названию — посмотрите описание и вступайте в группу выбранного университета.
            </Typography.Label>

            <div style={{ marginTop: 16 }}>
              <div className="uni-search-input">
                <input
                  placeholder="Поиск по названию университета (например: ИТМО, МГУ...)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="uni-input"
                />
                <Button mode="primary" className="search-button">
                  Найти
                </Button>
              </div>
            </div>
          </Container>
        </Panel>

        <div className="results-scroll-container">
          {loading && (
            <Panel mode="secondary" className="card" style={{ padding: 16 }}>
              <Typography.Label>Поиск...</Typography.Label>
            </Panel>
          )}

          {error && (
            <Panel mode="secondary" className="card" style={{ padding: 16 }}>
              <Typography.Label style={{ color: "var(--maxui-Label, #e11d48)" }}>{error}</Typography.Label>
            </Panel>
          )}

          {!loading && results && results.length === 0 && emptyState}

          {!loading && results && results.length > 0 && (
            <Grid cols={1} gap={16}>
              {results.map((u) => (
                <Panel key={u.id} mode="secondary" className="uni-card">
                  <Flex direction="column" gap={12} style={{ width: "100%" }}>
                    <Flex align="center" gap={12}>
                      <Avatar.Container size={64} form="squircle">
                        {u.logo ? <Avatar.Image src={u.logo} /> : <Avatar.Text>{(u.name || "U").slice(0,2).toUpperCase()}</Avatar.Text>}
                      </Avatar.Container>
                      <div style={{ flex: 1 }}>
                        <Typography.Title variant="small-strong" style={{ margin: 0, fontSize: '18px', lineHeight: '1.3' }}>
                          {u.name}
                        </Typography.Title>
                        {(u.short || u.city) && (
                          <Typography.Label className="uni-short" style={{ fontSize: '14px', display: 'block', marginTop: '4px' }}>
                            {[u.short, u.city].filter(Boolean).join(', ')}
                          </Typography.Label>
                        )}
                      </div>
                    </Flex>
                    
                    {u.tags && u.tags.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        {u.tags.slice(0,3).map(t => (
                          <span key={t} className="uni-tag">{t}</span>
                        ))}
                      </div>
                    )}
                    
                    <Flex justify="end" gap={8} style={{ marginTop: 12 }}>
                     <Button
                        mode="primary"
                        size="small"
                        onClick={() => handleOpen(u)}
                        style={{
                          whiteSpace: 'normal',
                          wordWrap: 'break-word',
                          height: 'auto',
                          minHeight: '32px',
                          padding: '6px 12px',
                          lineHeight: '1.2',
                          textAlign: 'center'
                        }}
                      >
                        Вступить в группу
                      </Button>
                    </Flex>
                  </Flex>
                </Panel>
              ))}
            </Grid>
          )}
        </div>

        {joinOpen && joinUni && (
          <div className="fullscreen-overlay">
            <Panel className="panel-inner" mode="secondary" centeredX centeredY>
              <Container style={{ padding: 18, maxWidth: 680 }}>
                <Flex direction="column" gap={16}>
                  <Flex justify="space-between" align="flex-start">
                    <div style={{ display: "flex", gap: 12, alignItems: "center", flex: 1 }}>
                      <Avatar.Container size={56} form="squircle">
                        {joinUni.logo ? <Avatar.Image src={joinUni.logo} /> : <Avatar.Text>{(joinUni.name||"U").slice(0,2)}</Avatar.Text>}
                      </Avatar.Container>
                      <div style={{ flex: 1 }}>
                        <Typography.Title variant="medium-strong" style={{ margin: 0, lineHeight: '1.3' }}>
                          {joinUni.name}
                        </Typography.Title>
                        {(joinUni.short || joinUni.city) && (
                          <Typography.Label className="uni-short" style={{ display: 'block', marginTop: '4px' }}>
                            {[joinUni.short, joinUni.city].filter(Boolean).join(', ')}
                          </Typography.Label>
                        )}
                      </div>
                    </div>
                    <Button mode="tertiary" onClick={handleClose} style={{ alignSelf: 'flex-start' }}>
                      Закрыть
                    </Button>
                  </Flex>

                  <div>
                    <Typography.Label style={{ display: "block", marginBottom: 8 }}>
                      Выберите роль, в которой хотите вступить
                    </Typography.Label>
                    <select
                      className="uni-role-select"
                      value={joinRole}
                      onChange={(e) => setJoinRole(e.target.value as any)}
                      style={{ 
                        background: 'white',
                        color: 'black',
                        width: '100%'
                      }}
                    >
                      <option value="student" style={{ background: 'white', color: 'black' }}>Студент</option>
                      <option value="teacher" style={{ background: 'white', color: 'black' }}>Преподаватель</option>
                      <option value="admin" style={{ background: 'white', color: 'black' }}>Администратор</option>
                    </select>
                  </div>

                  {joinError && (
                    <Panel mode="secondary" className="card" style={{ padding: 12 }}>
                      <Typography.Label style={{ color: "var(--maxui-Label, #e11d48)" }}>{joinError}</Typography.Label>
                    </Panel>
                  )}

                  {joinResult && (
                    <Panel mode="secondary" className="card" style={{ padding: 12 }}>
                      <Typography.Label style={{ color: "var(--maxui-primary, #0ea5e9)" }}>{joinResult}</Typography.Label>
                    </Panel>
                  )}

                  <Flex justify="end" gap={8} style={{ width: '100%' }}>
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