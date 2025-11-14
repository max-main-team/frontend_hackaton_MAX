/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, type JSX } from "react";
import {
  Panel,
  Container,
  Flex,
  Avatar,
  Typography,
  Button,
  Grid,
  // если в вашей версии MAX UI есть CellList/CellSimple — можно заменить карточки на них
} from "@maxhub/max-ui";
import api from "../services/api";
import "../css/AdminRequestsPage.css";

type Application = {
  role: string;
  user_id: number;
  first_name?: string;
  second_name?: string;
  username?: string;
  avatar_url?: string;
};

const ENDPOINTS = {
  LIST: "https://msokovykh.ru/admin/personalities/access",
  REJECT: "/applications/reject",
  APPROVE: "https://msokovykh.ru/admin/personalities/access/accept",
};

export default function ApplicationsPage(): JSX.Element {
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [offset, setOffset] = useState(0);
  const LIMIT = 20;
  const [hasMore, setHasMore] = useState(false);

  const [approving, setApproving] = useState<Application | null>(null);
  const [form, setForm] = useState({
    course_group_id: "",
    faculty_id: "",
    university_department_id: "",
    university_id: "",
    role: "student",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadList(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadList(reset = false) {
    if (reset) {
      setLoading(true);
      setOffset(0);
    } else {
      setMoreLoading(true);
    }
    setError(null);

    try {
      const off = reset ? 0 : offset;
      const res = await api.get(ENDPOINTS.LIST, { params: { limit: LIMIT, offset: off }});
      const data = res.data;
      const list: Application[] = Array.isArray(data?.data) ? data.data : [];

      if (reset) {
        setItems(list);
      } else {
        setItems(prev => [...prev, ...list]);
      }

      setHasMore(Boolean(data?.has_more));
      setOffset(off + LIMIT);
    } catch (e: any) {
      console.warn("Failed to load applications", e);
      setError("Не удалось загрузить заявки. Проверьте соединение.");
    } finally {
      setLoading(false);
      setMoreLoading(false);
    }
  }

  function displayName(it: Application) {
    return [it.first_name, it.second_name].filter(Boolean).join(" ") || it.username || `user#${it.user_id}`;
  }

  async function handleReject(it: Application) {
    if (!confirm(`Отклонить заявку от ${displayName(it)} (${it.role})?`)) return;
    // оптимистично удаляем из UI
    const prev = items;
    setItems(prevItems => prevItems.filter(x => x.user_id !== it.user_id));
    try {
      await api.post(ENDPOINTS.REJECT, { user_id: it.user_id });
    } catch (e) {
      console.warn("Reject failed", e);
      alert("Не удалось отклонить заявку. Попробуйте позже.");
      setItems(prev); // rollback
    }
  }

  function openApprove(it: Application) {
    setApproving(it);
    setForm({
      course_group_id: "",
      faculty_id: "",
      university_department_id: "",
      university_id: "",
      role: it.role || "student",
    });
  }

  function closeApprove() {
    setApproving(null);
    setSubmitting(false);
  }

  function onFormChange<K extends keyof typeof form>(key: K, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function submitApprove() {
    if (!approving) return;

    const toNum = (v: string) => {
      const n = Number(v);
      return Number.isFinite(n) && !Number.isNaN(n) ? n : null;
    };

    const course_group_id = toNum(form.course_group_id);
    const faculty_id = toNum(form.faculty_id);
    const university_department_id = toNum(form.university_department_id);
    const university_id = toNum(form.university_id);
    const role = form.role;

    if (!course_group_id || !faculty_id || !university_department_id || !university_id) {
      alert("Заполните все поля ID валидными числами.");
      return;
    }

    const payload = {
      course_group_id,
      faculty_id,
      role,
      university_department_id,
      university_id,
      user_id: approving.user_id,
    };

    setSubmitting(true);
    try {
      await api.post(ENDPOINTS.APPROVE, payload);
      // удаляем из UI
      setItems(prev => prev.filter(x => x.user_id !== approving.user_id));
      closeApprove();
    } catch (e) {
      console.warn("Approve failed", e);
      alert("Не удалось принять заявку. Попробуйте позже.");
      setSubmitting(false);
    }
  }

  return (
    <Container style={{ paddingTop: 12 }}>
      <Typography.Title variant="large-strong" style={{ marginBottom: 8 }}>
        Заявки на вступление
      </Typography.Title>

      <Typography.Label style={{ display: "block", marginBottom: 16 }}>
        Здесь показаны поступившие заявки — отклоняйте или принимайте участников в группу.
      </Typography.Label>

      {loading && (
        <Panel mode="secondary" className="apps-placeholder" style={{ padding: 18, marginBottom: 12 }}>
          <Typography.Label>Загрузка заявок…</Typography.Label>
        </Panel>
      )}

      {error && (
        <Panel mode="secondary" style={{ padding: 12, marginBottom: 12 }}>
          <Typography.Label style={{ color: "var(--maxui-negative, #e11d48)" }}>{error}</Typography.Label>
          <div style={{ marginTop: 10 }}>
            <Button mode="primary" onClick={() => loadList(true)}>Повторить</Button>
          </div>
        </Panel>
      )}

      {!loading && items.length === 0 && !error && (
        <Panel mode="secondary" style={{ padding: 16, marginBottom: 12 }}>
          <Typography.Title variant="small-strong">Заявок пока нет</Typography.Title>
          <Typography.Label>Новые заявки появятся здесь автоматически.</Typography.Label>
        </Panel>
      )}

      <Grid cols={1} gap={12}>
        {items.map(it => (
          <Panel key={it.user_id} mode="secondary" className="apps-item" style={{ padding: 12 }}>
            <Flex align="center" gap={12}>
              <Avatar.Container size={56} form="squircle">
                {it.avatar_url ? <Avatar.Image src={it.avatar_url} /> : <Avatar.Text>{(displayName(it) || "U").slice(0,2).toUpperCase()}</Avatar.Text>}
              </Avatar.Container>

              <div style={{ flex: 1 }}>
                <Typography.Title variant="small-strong" style={{ margin: 0 }}>{displayName(it)}</Typography.Title>
                <Typography.Label style={{ color: "var(--maxui-muted, #6b7280)" }}>{it.username ?? `ID ${it.user_id}`}</Typography.Label>

                <div style={{ marginTop: 10 }}>
                  <span className="apps-role-badge">{it.role}</span>
                </div>
              </div>

              <div className="apps-actions">
                <Button mode="tertiary" size="small" onClick={() => openApprove(it)}>Принять</Button>
                <Button mode="tertiary" size="small" onClick={() => handleReject(it)} style={{ marginLeft: 8 }}>Отклонить</Button>
              </div>
            </Flex>
          </Panel>
        ))}
      </Grid>

      {hasMore && (
        <div style={{ marginTop: 12, textAlign: "center" }}>
          <Button mode="secondary" onClick={() => loadList(false)} disabled={moreLoading}>
            {moreLoading ? "Загрузка..." : "Показать ещё"}
          </Button>
        </div>
      )}

      {/* Approve modal overlay */}
      {approving && (
        <div className="apps-modal-overlay" role="dialog" aria-modal="true">
          <Panel className="apps-modal" mode="secondary">
            <Container style={{ padding: 18 }}>
              <Flex justify="space-between" align="center">
                <div>
                  <Typography.Title variant="medium-strong">Принять заявку</Typography.Title>
                  <Typography.Label>{displayName(approving)} — {approving.role}</Typography.Label>
                </div>
                <div>
                  <Button mode="tertiary" onClick={closeApprove}>Закрыть</Button>
                </div>
              </Flex>

              <div style={{ marginTop: 12 }}>
                <label className="apps-field">
                  <div className="apps-field-label">Роль</div>
                  <select value={form.role} onChange={e => onFormChange("role", e.target.value)}>
                    <option value="student">Студент</option>
                    <option value="teacher">Преподаватель</option>
                    <option value="admin">Администратор</option>
                  </select>
                </label>

                <label className="apps-field">
                  <div className="apps-field-label">ID группы (course_group_id)</div>
                  <input value={form.course_group_id} onChange={e => onFormChange("course_group_id", e.target.value)} placeholder="123" />
                </label>

                <label className="apps-field">
                  <div className="apps-field-label">ID факультета (faculty_id)</div>
                  <input value={form.faculty_id} onChange={e => onFormChange("faculty_id", e.target.value)} placeholder="10" />
                </label>

                <label className="apps-field">
                  <div className="apps-field-label">ID департамента (university_department_id)</div>
                  <input value={form.university_department_id} onChange={e => onFormChange("university_department_id", e.target.value)} placeholder="5" />
                </label>

                <label className="apps-field">
                  <div className="apps-field-label">ID университета (university_id)</div>
                  <input value={form.university_id} onChange={e => onFormChange("university_id", e.target.value)} placeholder="2" />
                </label>

                <Flex justify="end" style={{ marginTop: 16 }}>
                  <Button mode="tertiary" onClick={closeApprove} style={{ marginRight: 8 }}>Отмена</Button>
                  <Button mode="primary" onClick={submitApprove} disabled={submitting}>
                    {submitting ? "Сохраняем..." : "Принять и сохранить"}
                  </Button>
                </Flex>
              </div>
            </Container>
          </Panel>
        </div>
      )}
    </Container>
  );
}
