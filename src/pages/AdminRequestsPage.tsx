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
} from "@maxhub/max-ui";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../css/AdminRequestsPage.css";

type Application = {
  role: string;
  user_id: number;
  first_name?: string;
  second_name?: string;
  username?: string;
  avatar_url?: string;
  photo_url?: string;
};

const ENDPOINTS = {
  LIST: "https://msokovykh.ru/admin/personalities/access",
  APPROVE: "https://msokovykh.ru/admin/personalities/access/accept",
  // Faculties / departments / groups (we'll try a few common patterns)
  FACULTIES: "https://msokovykh.ru/admin/faculties",
  FACULTY_DEPARTMENTS: [
    "https://msokovykh.ru/admin/faculties/{fid}/departments",
    "https://msokovykh.ru/universities/{fid}/departments",
    "https://msokovykh.ru/admin/faculties/{fid}/directions",
  ],
  DEPARTMENT_GROUPS: [
    "https://msokovykh.ru/admin/departments/{did}/groups",
    "https://msokovykh.ru/universities/departments/{did}/groups",
    "https://msokovykh.ru/admin/directions/{did}/groups",
  ],
};

export default function ApplicationsPage(): JSX.Element {
  const navigate = useNavigate();

  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [offset, setOffset] = useState(0);
  const LIMIT = 20;
  const [hasMore, setHasMore] = useState(false);

  const [approving, setApproving] = useState<Application | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // form values for approve modal (strings kept for input handling)
  const [form, setForm] = useState({
    course_group_id: "",
    faculty_id: "",
    university_department_id: "",
    university_id: "",
    role: "student",
  });

  // lists for selects
  const [faculties, setFaculties] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loadingFaculties, setLoadingFaculties] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);

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
    const prev = items;
    setItems(prevItems => prevItems.filter(x => x.user_id !== it.user_id));
    try {
      // если появится реальный REJECT endpoint — подставь сюда вызов
      // await api.post(ENDPOINTS.REJECT, { user_id: it.user_id });
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
    // load faculties for the selects
    fetchFaculties();
    setDepartments([]);
    setGroups([]);
  }

  function closeApprove() {
    setApproving(null);
    setSubmitting(false);
  }

  function onFormChange<K extends keyof typeof form>(key: K, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  // helper to try multiple candidate endpoints for dependent lists
  async function tryUrls<T = any>(urls: string[]): Promise<T | null> {
    for (const u of urls) {
      try {
        const res = await api.get(u);
        if (res?.data) return res.data;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // try next
      }
    }
    return null;
  }

  async function fetchFaculties() {
    setLoadingFaculties(true);
    try {
      const res = await api.get(ENDPOINTS.FACULTIES);
      const data = res.data;
      // normalize: if array in body or data.items
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.items) ? data.items : []));
      setFaculties(list || []);
    } catch (e) {
      console.warn("Failed to load faculties", e);
      setFaculties([]);
    } finally {
      setLoadingFaculties(false);
    }
  }

  async function fetchDepartmentsForFaculty(facultyId: string | number) {
    setLoadingDepartments(true);
    setDepartments([]);
    setGroups([]);
    try {
      // try candidate patterns
      const urls = ENDPOINTS.FACULTY_DEPARTMENTS.map(p => p.replace("{fid}", String(facultyId)));
      const data = await tryUrls<any>(urls);
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.items) ? data.items : []));
      setDepartments(list || []);
    } catch (e) {
      console.warn("Failed to load departments for faculty", e);
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  }

  async function fetchGroupsForDepartment(departmentId: string | number) {
    setLoadingGroups(true);
    setGroups([]);
    try {
      const urls = ENDPOINTS.DEPARTMENT_GROUPS.map(p => p.replace("{did}", String(departmentId)));
      const data = await tryUrls<any>(urls);
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.items) ? data.items : []));
      setGroups(list || []);
    } catch (e) {
      console.warn("Failed to load groups for department", e);
      setGroups([]);
    } finally {
      setLoadingGroups(false);
    }
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
    <Container className="apps-root">
      <Flex align="center" justify="space-between" style={{ marginBottom: 8 }}>
        <div style={{ marginTop: 6 }}>
          <Typography.Title variant="large-strong" style={{ margin: 0 }}>Заявки на вступление</Typography.Title>
          <Typography.Label style={{ color: "var(--maxui-muted, #6b7280)" }}>
            Здесь показаны поступившие заявки — отклоняйте или принимайте участников в группу.
          </Typography.Label>
        </div>

        <div>
          <Button mode="tertiary" size="small" onClick={() => navigate(-1)}>Назад</Button>
        </div>
      </Flex>

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

      <Grid cols={1} gap={12} style={{ width: '100%' }}>
        {items.map(it => (
          <Panel key={it.user_id} mode="secondary" className="apps-item" style={{ padding: 16 }}>
            <Flex align="center" gap={12}>
              <Avatar.Container size={56} form="squircle">
                {(it.avatar_url || it.photo_url) ? (
                  <Avatar.Image src={it.avatar_url ?? it.photo_url} />
                ) : (
                  <Avatar.Text>{(displayName(it) || "U").slice(0,2).toUpperCase()}</Avatar.Text>
                )}
              </Avatar.Container>

              <div style={{ flex: 1 }}>
                <Typography.Title variant="small-strong" style={{ margin: 0 }}>{displayName(it)}</Typography.Title>
                <div style={{ marginTop: 6 }}>
                  <Typography.Label style={{ color: "var(--maxui-muted, #6b7280)" }}>
                    {it.username ? `@${it.username}` : null}
                  </Typography.Label>
                </div>
                <div style={{ marginTop: 6 }}>
                  <Typography.Label style={{ color: "var(--maxui-muted, #6b7280)" }}>
                    ID: {it.user_id}
                  </Typography.Label>
                </div>

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
                  <Typography.Label>{displayName(approving)} — <strong>{approving.role}</strong></Typography.Label>
                </div>

                {/* убрали отдельную кнопку "Закрыть" — есть Отмена ниже */}
              </Flex>

              <div style={{ marginTop: 12 }}>
                {/* Роль */}
                <div className="apps-field">
                  <Typography.Label className="apps-field-label">Роль</Typography.Label>
                  <select value={form.role} onChange={e => onFormChange("role", e.target.value)}>
                    <option value="student">Студент</option>
                    <option value="teacher">Преподаватель</option>
                    <option value="admin">Администрато</option>
                  </select>
                </div>

                {/* Факультеты */}
                <div className="apps-field">
                  <Typography.Label className="apps-field-label">Факультет</Typography.Label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <select
                      value={form.faculty_id}
                      onChange={e => {
                        onFormChange("faculty_id", e.target.value);
                        onFormChange("university_department_id", ""); // reset dept
                        onFormChange("course_group_id", "");
                        if (e.target.value) fetchDepartmentsForFaculty(e.target.value);
                      }}
                      disabled={loadingFaculties}
                      style={{ flex: 1 }}
                    >
                      <option value="">Выберите факультет</option>
                      {faculties.map((f: any) => (
                        <option key={f.id ?? f.faculty_id ?? f.code ?? JSON.stringify(f)} value={f.id ?? f.faculty_id ?? f.code ?? f.id}>
                          {f.name ?? f.faculty_name ?? f.title ?? `Fac ${f.id ?? ''}`}
                        </option>
                      ))}
                    </select>
                    <Button mode="tertiary" onClick={() => fetchFaculties()} disabled={loadingFaculties}>Обновить</Button>
                  </div>
                </div>

                {/* Департаменты / направления */}
                <div className="apps-field">
                  <Typography.Label className="apps-field-label">Направление / кафедра</Typography.Label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <select
                      value={form.university_department_id}
                      onChange={e => {
                        onFormChange("university_department_id", e.target.value);
                        onFormChange("course_group_id", "");
                        if (e.target.value) fetchGroupsForDepartment(e.target.value);
                      }}
                      disabled={loadingDepartments || !form.faculty_id}
                      style={{ flex: 1 }}
                    >
                      <option value="">{form.faculty_id ? "Выберите направление" : "Сначала выберите факультет"}</option>
                      {departments.map((d: any) => (
                        <option key={d.id ?? d.department_id ?? JSON.stringify(d)} value={d.id ?? d.department_id ?? d.id}>
                          {d.name ?? d.title ?? d.short ?? `Dep ${d.id ?? ''}`}
                        </option>
                      ))}
                    </select>
                    <Button mode="tertiary" onClick={() => {
                      if (form.faculty_id) fetchDepartmentsForFaculty(form.faculty_id);
                    }} disabled={!form.faculty_id || loadingDepartments}>Обновить</Button>
                  </div>
                </div>

                {/* Группы */}
                <div className="apps-field">
                  <Typography.Label className="apps-field-label">Группа (course_group_id)</Typography.Label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <select
                      value={form.course_group_id}
                      onChange={e => onFormChange("course_group_id", e.target.value)}
                      disabled={loadingGroups || !form.university_department_id}
                      style={{ flex: 1 }}
                    >
                      <option value="">{form.university_department_id ? "Выберите группу" : "Сначала выберите направление"}</option>
                      {groups.map((g: any) => (
                        <option key={g.id ?? g.group_id ?? JSON.stringify(g)} value={g.id ?? g.group_id ?? g.id}>
                          {g.name ?? g.title ?? g.code ?? `Group ${g.id ?? ''}`}
                        </option>
                      ))}
                    </select>
                    <Button mode="tertiary" onClick={() => {
                      if (form.university_department_id) fetchGroupsForDepartment(form.university_department_id);
                    }} disabled={!form.university_department_id || loadingGroups}>Обновить</Button>
                  </div>
                </div>

                {/* Университет ID (если нужен) */}
                <div className="apps-field">
                  <Typography.Label className="apps-field-label">ID университета (university_id)</Typography.Label>
                  <input value={form.university_id} onChange={e => onFormChange("university_id", e.target.value)} placeholder="Например: 2" />
                </div>

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
