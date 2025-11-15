/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, type JSX } from "react";
import {
  Container,
  Panel,
  Typography,
  Grid,
  Flex,
  Button,
} from "@maxhub/max-ui";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import "../css/EventsPage.css";

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

  // admin form state
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

  // fetch events (GET /universities/events)
  useEffect(() => {
    let mounted = true;
    async function fetchEvents() {
      setLoading(true);
      try {
        const resp = await fetch("/universities/events");
        if (!resp.ok) throw new Error("no api");
        const data = (await resp.json()) as EventItem[];
        if (mounted) setEvents(Array.isArray(data) ? data : []);
      } catch {
        // мок-данные
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

  // create event (admin)
  async function createEvent() {
    setError(null);
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedPhoto = photoUrl.trim();

    if (!trimmedTitle) {
      setError("Введите название события.");
      return;
    }
    if (!trimmedDescription) {
      setError("Введите описание события.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: trimmedTitle,
        description: trimmedDescription,
        photo_url: trimmedPhoto || undefined,
      };

      // try real API
      const resp = await fetch("/universities/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        // если неудача — попытка мок-ответа
        throw new Error("no api or bad response");
      }

      const created = (await resp.json()) as EventItem;

      // если API вернул объект — добавляем
      setEvents((prev) => [created, ...prev]);
      resetCreateForm();
      setCreating(false);
    } catch {
      // мок: эмулируем успешное создание
      const newItem: EventItem = {
        id: Math.max(1000, ...events.map((e) => e.id)) + 1,
        title: trimmedTitle,
        description: trimmedDescription,
        photo_url: trimmedPhoto || undefined,
      };
      setEvents((prev) => [newItem, ...prev]);
      resetCreateForm();
      setCreating(false);
    } finally {
      setSubmitting(false);
    }
  }

  function resetCreateForm() {
    setTitle("");
    setPhotoUrl("");
    setDescription("");
    setError(null);
  }

  function openCreate() {
    setCreating(true);
    setTimeout(() => {
      // focus first field if needed (native input focus not shown here)
    }, 0);
  }

  return (
    <MainLayout>
      <Container className="events-container">
        <div className="events-header">
          <Flex justify="space-between" align="center" style={{ width: "100%" }}>
            <Typography.Title variant="large-strong" className="events-title">
              Актуальное
            </Typography.Title>

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
                <Button mode="primary" onClick={openCreate}>
                  Создать событие
                </Button>
                <Button mode="tertiary" onClick={() => { setIsAdminMode(false); }}>
                  Просмотреть как студент
                </Button>
              </div>
            ) : (
              <Panel mode="secondary" className="create-panel">
                <Grid cols={2} gap={12}>
                  <div>
                    <Typography.Label className="form-label">Название</Typography.Label>
                    <input
                      className="form-input"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Короткое название"
                    />
                  </div>

                  <div>
                    <Typography.Label className="form-label">Ссылка на изображение</Typography.Label>
                    <input
                      className="form-input"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <Typography.Label className="form-label">Описание</Typography.Label>
                    <textarea
                      className="form-textarea"
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Короткое подробное описание события"
                    />
                  </div>

                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", gridColumn: "1 / -1" }}>
                    <Button mode="tertiary" onClick={() => { resetCreateForm(); setCreating(false); }}>
                      Отмена
                    </Button>
                    <Button mode="primary" onClick={createEvent} disabled={submitting}>
                      {submitting ? "Создаём..." : "Создать"}
                    </Button>
                  </div>
                </Grid>

                {photoUrl.trim() && (
                  <div className="create-preview">
                    <Typography.Label className="form-label">Превью</Typography.Label>
                    <div className="preview-frame">
                      <img src={photoUrl} alt="preview" onError={(e) => {
                        (e.target as HTMLImageElement).src = "";
                      }} />
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
              {events.map((ev) => (
                <Panel key={ev.id} mode="secondary" className="event-card" aria-label={ev.title}>
                  <div className="event-card-inner">
                    <div className="event-card-head">
                      <Typography.Title variant="small-strong" className="event-title">{ev.title}</Typography.Title>
                    </div>

                    <div className="event-card-media">
                      {ev.photo_url ? (
                        <img src={ev.photo_url} alt={ev.title} onError={(e) => {
                          (e.target as HTMLImageElement).src = "";
                        }} />
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
    </MainLayout>
  );
}
