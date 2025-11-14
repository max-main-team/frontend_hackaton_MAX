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
  UNIVERSITIES: "https://msokovykh.ru/personalities/universities",
  FACULTIES: "https://msokovykh.ru/personalities/faculty",
  DEPARTMENTS: "https://msokovykh.ru/personalities/departments",
  GROUPS: "https://msokovykh.ru/personalities/groups",
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

  // form values for approve modal
  const [form, setForm] = useState({
    course_group_id: "",
    faculty_id: "",
    university_department_id: "",
    role: "student",
  });

  // lists for selects
  const [universities, setUniversities] = useState<any[]>([]);
  const [selectedUniversityId, setSelectedUniversityId] = useState<number | null>(null);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loadingUniversities, setLoadingUniversities] = useState(false);
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
      // TODO: если появится реальный reject endpoint — вызвать его здесь
      // await api.post("https://msokovykh.ru/admin/personalities/access/reject", { user_id: it.user_id });
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
      role: it.role || "student",
    });

    // загрузим университеты -> затем факультеты для первого университета
    fetchUniversities();
    setDepartments([]);
    setGroups([]);
    setFaculties([]);
    setSelectedUniversityId(null);
  }

  function closeApprove() {
    setApproving(null);
    setSubmitting(false);
  }

  function onFormChange<K extends keyof typeof form>(key: K, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function fetchUniversities() {
    setLoadingUniversities(true);
    try {
      const res = await api.get(ENDPOINTS.UNIVERSITIES);
      const data = res.data;
      const arr = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      setUniversities(arr || []);
      if (arr && arr.length > 0) {
        const id = arr[0].id ?? arr[0].uni_id ?? null;
        if (id != null) {
          setSelectedUniversityId(Number(id));
          // сразу загрузим факультеты для этого университета
          fetchFaculties(Number(id));
        }
      } else {
        setSelectedUniversityId(null);
        setFaculties([]);
      }
    } catch (e) {
      console.warn("Failed to load universities", e);
      setUniversities([]);
      setSelectedUniversityId(null);
      setFaculties([]);
    } finally {
      setLoadingUniversities(false);
    }
  }

  async function fetchFaculties(universityId: number) {
    if (!universityId) return;
    setLoadingFaculties(true);
    setFaculties([]);
    try {
      const res = await api.get(ENDPOINTS.FACULTIES, { params: { university_id: universityId }});
      const data = res.data;
      const arr = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.items) ? data.items : []));
      setFaculties(arr || []);
    } catch (e) {
      console.warn("Failed to load faculties", e);
      setFaculties([]);
    } finally {
      setLoadingFaculties(false);
    }
  }

  async function fetchDepartments(facultyId: number) {
    if (!facultyId) return;
    setLoadingDepartments(true);
    setDepartments([]);
    setGroups([]);
    try {
      const res = await api.get(ENDPOINTS.DEPARTMENTS, { params: { faculty_id: facultyId }});
      const data = res.data;
      const arr = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.items) ? data.items : []));
      setDepartments(arr || []);
    } catch (e) {
      console.warn("Failed to load departments", e);
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  }

  async function fetchGroups(departmentId: number) {
    if (!departmentId) return;
    setLoadingGroups(true);
    setGroups([]);
    try {
      const res = await api.get(ENDPOINTS.GROUPS, { params: { department_id: departmentId }});
      const data = res.data;
      const arr = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.items) ? data.items : []));
      setGroups(arr || []);
    } catch (e) {
      console.warn("Failed to load groups", e);
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
    const role = form.role;

    if (!course_group_id || !faculty_id || !university_department_id) {
      alert("Заполните все поля ID валидными числами (факультет/направление/группа).");
      return;
    }

    const payload = {
      course_group_id,
      faculty_id,
      role,
      university_department_id,
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
                  <Typography.Title variant="medium-strong">Принять заявку </Typography.Title>
                  <Typography.Label>{ displayName(approving)} — <strong>{approving.role}</strong></Typography.Label>
                </div>
              </Flex>

              <div style={{ marginTop: 12 }}>
                {/* Роль */}
                <div className="apps-field">
                  <Typography.Label className="apps-field-label">Роль</Typography.Label>
                  <select value={form.role} onChange={e => onFormChange("role", e.target.value)}>
                    <option value="student">Студент</option>
                    <option value="teacher">Преподаватель</option>
                    <option value="admin">Администратор</option>
                  </select>
                </div>

                {/* Университет — скрытое поле (берётся автоматически) */}
                <div style={{ marginTop: 10 }}>
                  <Typography.Label className="apps-field-label">Университет</Typography.Label>
                  <div>
                    <Typography.Label style={{ color: "var(--maxui-muted,#6b7280)" }}>
                      {loadingUniversities ? "Загрузка..." : (universities[0]?.uni_name ?? universities[0]?.uni_short_name ?? "—")}
                    </Typography.Label>
                  </div>
                </div>

                {/* Факультет */}
                <div className="apps-field">
                  <Typography.Label className="apps-field-label">Факультет</Typography.Label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <select
                      value={String(form.faculty_id)}
                      onChange={e => {
                        onFormChange("faculty_id", e.target.value);
                        onFormChange("university_department_id", "");
                        onFormChange("course_group_id", "");
                        const fid = Number(e.target.value);
                        if (!Number.isNaN(fid)) fetchDepartments(fid);
                      }}
                      disabled={loadingFaculties || !selectedUniversityId}
                      style={{ flex: 1 }}
                    >
                      <option value="">Выберите факультет</option>
                      {faculties.map((f: any) => (
                        <option key={f.id ?? f.faculty_id ?? JSON.stringify(f)} value={f.id ?? f.faculty_id}>
                          {f.name ?? f.faculty_name ?? f.faculty_name}
                        </option>
                      ))}
                    </select>
                    <Button mode="tertiary" onClick={() => {
                      if (selectedUniversityId) fetchFaculties(selectedUniversityId);
                      else fetchUniversities();
                    }} disabled={loadingFaculties || loadingUniversities}>Обновить</Button>
                  </div>
                </div>

                {/* Департамент/направление */}
                <div className="apps-field">
                  <Typography.Label className="apps-field-label">Направление / кафедра</Typography.Label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <select
                      value={String(form.university_department_id)}
                      onChange={e => {
                        onFormChange("university_department_id", e.target.value);
                        onFormChange("course_group_id", "");
                        const did = Number(e.target.value);
                        if (!Number.isNaN(did)) fetchGroups(did);
                      }}
                      disabled={loadingDepartments || !form.faculty_id}
                      style={{ flex: 1 }}
                    >
                      <option value="">{form.faculty_id ? "Выберите направление" : "Сначала выберите факультет"}</option>
                      {departments.map((d: any) => (
                        <option key={d.id ?? JSON.stringify(d)} value={d.id}>
                          {d.department_name ?? d.name ?? d.title}
                        </option>
                      ))}
                    </select>
                    <Button mode="tertiary" onClick={() => {
                      if (form.faculty_id) fetchDepartments(Number(form.faculty_id));
                    }} disabled={!form.faculty_id || loadingDepartments}>Обновить</Button>
                  </div>
                </div>

                {/* Группа */}
                <div className="apps-field">
                  <Typography.Label className="apps-field-label">Группа</Typography.Label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <select
                      value={String(form.course_group_id)}
                      onChange={e => onFormChange("course_group_id", e.target.value)}
                      disabled={loadingGroups || !form.university_department_id}
                      style={{ flex: 1 }}
                    >
                      <option value="">{form.university_department_id ? "Выберите группу" : "Сначала выберите направление"}</option>
                      {groups.map((g: any) => (
                        <option key={g.id ?? JSON.stringify(g)} value={g.id}>
                          {g.name ?? g.code ?? `Group ${g.id}`}
                        </option>
                      ))}
                    </select>
                    <Button mode="tertiary" onClick={() => {
                      if (form.university_department_id) fetchGroups(Number(form.university_department_id));
                    }} disabled={!form.university_department_id || loadingGroups}>Обновить</Button>
                  </div>
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
