/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, type JSX } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Panel, Typography, Grid, Flex, Button } from "@maxhub/max-ui";
import api from "../services/api";
import "../css/EventsPage.css";

const BACKEND_PREFIX = "https://msokovykh.ru";
const ENDPOINTS = {
  GET_EVENTS: `${BACKEND_PREFIX}/universities/events`,
  CREATE_EVENT: `${BACKEND_PREFIX}/universities/events`,
};

interface EventItem {
  id: number;
  title: string;
  description: string;
  photo_url?: string | null;
  university_id?: number | null;
}

export default function EventsPage(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);

  // create form state
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fromState = (location.state as any)?.from;
    const qp = new URLSearchParams(location.search).get("mode");
    const ref = typeof document !== "undefined" ? document.referrer : "";
    const adminDetected =
      fromState === "/admin" || qp === "admin" || /\/admin(\/|$)/.test(ref);
    setIsAdminMode(Boolean(adminDetected));
  }, [location]);

  useEffect(() => {
    let mounted = true;

    async function fetchEvents() {
      setLoading(true);
      try {
        const res = await api.get(ENDPOINTS.GET_EVENTS);
        const data = res.data;
        const arr: any[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        if (mounted) setEvents(arr as EventItem[]);
      } catch (e) {
        console.warn("failed to load events, using mock", e);
        if (mounted) {
          setEvents([
            {
              id: 101,
              title: "Открытие спортивного сезона",
              description:
                "Большое открытие сезона: турниры, мастер-классы и бесплатные тренировки для студентов.",
              photo_url:
                "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=1200&q=80",
              university_id: 1,
            },
            {
              id: 102,
              title: "Ярмарка стартапов",
              description:
                "Приходите посмотреть проекты студентов и встретиться с менторами и инвесторами.",
              photo_url:
                "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80",
              university_id: 1,
            },
            {
              id: 103,
              title: "Лекция: История IT",
              description:
                "Погрузимся в важнейшие вехи развития отрасли: от первых компьютеров до облачных решений.",
              photo_url:
                "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=1200&q=80",
              university_id: 1,
            },
          ]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchEvents();
    return () => {
      mounted = false;
    };
  }, []);

  async function createEvent() {
    setError(null);
    const t = title.trim();
    const d = description.trim();
    const p = photoUrl.trim();

    if (!t) return setError("Введите название события.");
    if (!d) return setError("Введите описание.");

    setSubmitting(true);
    try {
      const payload = { title: t, description: d, photo_url: p || undefined };

      const res = await api.post(ENDPOINTS.CREATE_EVENT, payload);
      if (res?.status === 200 || res?.status === 201) {
        // API вернул созданный объект — пытаемся взять res.data
        const created = res.data ?? { id: Date.now(), ...payload };
        setEvents(prev => [created, ...prev]);
        resetForm();
        setCreating(false);
      } else {
        setError(`Сервер вернул ${res?.status}`);
      }
    } catch (e: any) {
      console.error("create event failed", e);
      // мок: добавить локально
      const newItem: EventItem = {
        id: Math.max(1000, ...events.map(ev => ev.id)) + 1,
        title: t,
        description: d,
        photo_url: p || undefined,
      };
      setEvents(prev => [newItem, ...prev]);
      resetForm();
      setCreating(false);
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setTitle("");
    setPhotoUrl("");
    setDescription("");
    setError(null);
  }

  return (
    <Container className="events-container">
      <div className="events-header">
        <Flex justify="space-between" align="center" style={{ width: "100%" }}>
          <div style={{ flex: 1 }}>
            <Typography.Title variant="large-strong" className="events-title">
              Актуальное
            </Typography.Title>
            <div className="events-sub">Новости университета и события для студентов</div>
          </div>

          <div className="header-actions">
            <Button mode="secondary" size="small" onClick={() => navigate(-1)}>
              Назад
            </Button>
          </div>
        </Flex>
      </div>

      {isAdminMode && (
        <div className="create-area">
          {!creating ? (
            <div style={{ display: "flex", gap: 8 }}>
              <Button mode="primary" onClick={() => setCreating(true)}>Создать событие</Button>
              <Button mode="tertiary" onClick={() => setIsAdminMode(false)}>Просмотреть как студент</Button>
            </div>
          ) : (
            <Panel mode="secondary" className="create-panel">
              <Grid cols={2} gap={12}>
                <div>
                  <Typography.Label className="form-label">Название</Typography.Label>
                  <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Короткое название" />
                </div>
                <div>
                  <Typography.Label className="form-label">Ссылка на изображение</Typography.Label>
                  <input className="form-input" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Typography.Label className="form-label">Описание</Typography.Label>
                  <textarea className="form-textarea" rows={4} value={description} onChange={e => setDescription(e.target.value)} />
                </div>

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", gridColumn: "1 / -1" }}>
                  <Button mode="tertiary" onClick={() => { resetForm(); setCreating(false); }}>Отмена</Button>
                  <Button mode="primary" onClick={createEvent} disabled={submitting}>{submitting ? "Создаём..." : "Создать"}</Button>
                </div>
              </Grid>

              {photoUrl.trim() && (
                <div className="create-preview">
                  <Typography.Label className="form-label">Превью</Typography.Label>
                  <div className="preview-frame">
                    <img src={photoUrl} alt="preview" onError={e => ((e.target as HTMLImageElement).src = "")} />
                  </div>
                </div>
              )}

              {error && <div className="form-error">{error}</div>}
            </Panel>
          )}
        </div>
      )}

      <div className="events-list">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <Typography.Label>Загрузка событий...</Typography.Label>
          </div>
        ) : events.length === 0 ? (
          <Panel mode="secondary" className="empty-panel">
            <Typography.Label>Событий пока нет.</Typography.Label>
          </Panel>
        ) : (
          <Grid cols={1} gap={16} className="events-grid">
            {events.map(ev => (
              <Panel key={ev.id} mode="secondary" className="event-card" aria-label={ev.title}>
                <div className="event-card-inner">
                  <div className="event-card-head">
                    <Typography.Title variant="small-strong" className="event-title">{ev.title}</Typography.Title>
                  </div>

                  <div className="event-card-media">
                    {ev.photo_url ? (
                      <img src={ev.photo_url} alt={ev.title} onError={e => ((e.target as HTMLImageElement).src = "")} />
                    ) : (
                      <div className="media-placeholder">Нет изображения</div>
                    )}
                  </div>

                  <div className="event-card-body">
                    <Typography.Label className="event-desc">{ev.description}</Typography.Label>
                  </div>
                </div>
              </Panel>
            ))}
          </Grid>
        )}
      </div>
    </Container>
  );
}
