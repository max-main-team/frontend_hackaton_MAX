/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState, type JSX } from "react";
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

interface Faculty {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
  faculty_id: number;
}

interface Group {
  id: number;
  name: string;
  department_id: number;
}

const ENDPOINTS = {
  LIST: "https://msokovykh.ru/admin/personalities/access",
  APPROVE: "https://msokovykh.ru/admin/personalities/access/accept",
  FACULTIES: "https://msokovykh.ru/faculties",
  DEPARTMENTS: "https://msokovykh.ru/departments",
  GROUPS: "https://msokovykh.ru/groups",
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
  const [form, setForm] = useState({
    course_group_id: "",
    faculty_id: "",
    university_department_id: "",
    university_id: "",
    role: "student",
  });
  const [submitting, setSubmitting] = useState(false);

  // Новые состояния для выпадающих списков
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingFaculties, setLoadingFaculties] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // Загрузка факультетов
  useEffect(() => {
    if (approving) {
      loadFaculties();
    }
  }, [approving]);

  // Загрузка направлений при выборе факультета
  useEffect(() => {
    if (form.faculty_id) {
      loadDepartments(Number(form.faculty_id));
    } else {
      setDepartments([]);
      setForm(prev => ({ ...prev, university_department_id: "" }));
    }
  }, [form.faculty_id]);

  // Загрузка групп при выборе направления
  useEffect(() => {
    if (form.university_department_id) {
      loadGroups(Number(form.university_department_id));
    } else {
      setGroups([]);
      setForm(prev => ({ ...prev, course_group_id: "" }));
    }
  }, [form.university_department_id]);

  async function loadFaculties() {
    setLoadingFaculties(true);
    try {
      const res = await api.get(ENDPOINTS.FACULTIES);
      setFaculties(res.data?.data || res.data || []);
    } catch (e) {
      console.error("Failed to load faculties", e);
    } finally {
      setLoadingFaculties(false);
    }
  }

  async function loadDepartments(facultyId: number) {
    setLoadingDepartments(true);
    try {
      const res = await api.get(`${ENDPOINTS.DEPARTMENTS}?faculty_id=${facultyId}`);
      setDepartments(res.data?.data || res.data || []);
    } catch (e) {
      console.error("Failed to load departments", e);
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  }

  async function loadGroups(departmentId: number) {
    setLoadingGroups(true);
    try {
      const res = await api.get(`${ENDPOINTS.GROUPS}?department_id=${departmentId}`);
      setGroups(res.data?.data || res.data || []);
    } catch (e) {
      console.error("Failed to load groups", e);
      setGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  }

  const loadList = useCallback(async (reset = false) => {
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
  }, [offset, LIMIT]);

  useEffect(() => {
  loadList(true);
}, [loadList]);

  // Затем в useEffect используйте loadList как зависимость:
  useEffect(() => {
    loadList(true);
  }, [loadList]);

  function displayName(it: Application) {
    return [it.first_name, it.second_name].filter(Boolean).join(" ") || it.username || `user#${it.user_id}`;
  }

  function getAvatarUrl(it: Application) {
    return it.avatar_url || it.photo_url || undefined;
  }

  async function handleReject(it: Application) {
    if (!confirm(`Отклонить заявку от ${displayName(it)} (${it.role})?`)) return;
    const prev = items;
    setItems(prevItems => prevItems.filter(x => x.user_id !== it.user_id));
    try {
      //await api.post(ENDPOINTS.REJECT, { user_id: it.user_id });
    } catch (e) {
      console.warn("Reject failed", e);
      alert("Не удалось отклонить заявку. Попробуйте позже.");
      setItems(prev);
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
    setFaculties([]);
    setDepartments([]);
    setGroups([]);
  }

  function onFormChange<K extends keyof typeof form>(key: K, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function submitApprove() {
    if (!approving) return;

    const toNum = (v: string) => {
      const n = Number(v);
      return Number.isFinite(n) && !Number.isNaN(n) ? n : undefined;
    };

    const course_group_id = toNum(form.course_group_id);
    const faculty_id = toNum(form.faculty_id);
    const university_department_id = toNum(form.university_department_id);
    const university_id = toNum(form.university_id);
    const role = form.role;

    // Валидация в зависимости от роли
    if (role === "student") {
      if (!faculty_id || !university_department_id || !course_group_id) {
        alert("Для студента необходимо выбрать факультет, направление и группу.");
        return;
      }
    } else {
      if (!university_id) {
        alert("Для преподавателя и администратора необходимо указать ID университета.");
        return;
      }
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
      setItems(prev => prev.filter(x => x.user_id !== approving.user_id));
      closeApprove();
    } catch (e) {
      console.warn("Approve failed", e);
      alert("Не удалось принять заявку. Попробуйте позже.");
      setSubmitting(false);
    }
  }

  return (
    <MainLayout>
      <Container className="admin-requests-container">
        {/* Заголовок с кнопкой назад */}
        <Flex justify="space-between" align="flex-start" style={{ marginBottom: 24 }}>
          <div>
            <Typography.Title variant="large-strong" style={{ marginBottom: 8 }}>
              Заявки на вступление
            </Typography.Title>
            <Typography.Label style={{ display: "block" }}>
              Здесь показаны поступившие заявки — отклоняйте или принимайте участников в группу.
            </Typography.Label>
          </div>
          <Button mode="tertiary" onClick={() => navigate(-1)}>
            Назад
          </Button>
        </Flex>

        {loading && (
          <Panel mode="secondary" className="apps-placeholder">
            <Typography.Label>Загрузка заявок…</Typography.Label>
          </Panel>
        )}

        {error && (
          <Panel mode="secondary" className="error-panel">
            <Typography.Label style={{ color: "var(--maxui-negative, #e11d48)" }}>{error}</Typography.Label>
            <div style={{ marginTop: 10 }}>
              <Button mode="primary" onClick={() => loadList(true)}>Повторить</Button>
            </div>
          </Panel>
        )}

        {!loading && items.length === 0 && !error && (
          <Panel mode="secondary" className="empty-state">
            <Typography.Title variant="small-strong">Заявок пока нет</Typography.Title>
            <Typography.Label>Новые заявки появятся здесь автоматически.</Typography.Label>
          </Panel>
        )}

        {/* Контейнер со статичной высотой */}
        <div className="requests-scroll-container">
          <Grid cols={1} gap={12}>
            {items.map(it => (
              <Panel key={it.user_id} mode="secondary" className="request-card">
                <Flex align="center" gap={12}>
                  <Avatar.Container size={56} form="squircle">
                    {getAvatarUrl(it) ? 
                      <Avatar.Image src={getAvatarUrl(it)} /> : 
                      <Avatar.Text>{(displayName(it) || "U").slice(0,2).toUpperCase()}</Avatar.Text>
                    }
                  </Avatar.Container>

                  <div style={{ flex: 1 }}>
                    <Typography.Title variant="small-strong" style={{ margin: 0 }}>
                      {displayName(it)}
                    </Typography.Title>
                    <Typography.Label className="user-id">
                      ID: {it.user_id}
                    </Typography.Label>

                    <div style={{ marginTop: 8 }}>
                      <span className="role-badge">{it.role}</span>
                    </div>
                  </div>

                  <div className="action-buttons">
                    <Button mode="primary" size="small" onClick={() => openApprove(it)}>
                      Принять
                    </Button>
                    <Button mode="tertiary" size="small" onClick={() => handleReject(it)}>
                      Отклонить
                    </Button>
                  </div>
                </Flex>
              </Panel>
            ))}
          </Grid>
        </div>

        {hasMore && (
          <div className="load-more-container">
            <Button mode="secondary" onClick={() => loadList(false)} disabled={moreLoading}>
              {moreLoading ? "Загрузка..." : "Показать ещё"}
            </Button>
          </div>
        )}

        {/* Модальное окно с выпадающими списками */}
        {approving && (
          <div className="modal-overlay">
            <Panel className="modal-panel" mode="secondary">
              <Container>
                <div className="modal-header">
                  <Typography.Title variant="medium-strong">
                    Принять заявку
                  </Typography.Title>
                  <Typography.Label style={{ display: "block", marginTop: 8 }}>
                    {displayName(approving)} — {approving.role}
                  </Typography.Label>
                </div>

                <div className="form-container">
                  {approving.role === "student" ? (
                    <>
                      <div className="form-field">
                        <Typography.Label style={{ display: "block", marginBottom: 8 }}>
                          Факультет *
                        </Typography.Label>
                        <select 
                          value={form.faculty_id} 
                          onChange={e => onFormChange("faculty_id", e.target.value)}
                          className="form-select"
                          disabled={loadingFaculties}
                        >
                          <option value="">Выберите факультет</option>
                          {faculties.map(faculty => (
                            <option key={faculty.id} value={faculty.id}>
                              {faculty.name}
                            </option>
                          ))}
                        </select>
                        {loadingFaculties && <Typography.Label>Загрузка...</Typography.Label>}
                      </div>

                      <div className="form-field">
                        <Typography.Label style={{ display: "block", marginBottom: 8 }}>
                          Направление *
                        </Typography.Label>
                        <select 
                          value={form.university_department_id} 
                          onChange={e => onFormChange("university_department_id", e.target.value)}
                          className="form-select"
                          disabled={!form.faculty_id || loadingDepartments}
                        >
                          <option value="">Выберите направление</option>
                          {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                        {loadingDepartments && <Typography.Label>Загрузка...</Typography.Label>}
                      </div>

                      <div className="form-field">
                        <Typography.Label style={{ display: "block", marginBottom: 8 }}>
                          Группа *
                        </Typography.Label>
                        <select 
                          value={form.course_group_id} 
                          onChange={e => onFormChange("course_group_id", e.target.value)}
                          className="form-select"
                          disabled={!form.university_department_id || loadingGroups}
                        >
                          <option value="">Выберите группу</option>
                          {groups.map(group => (
                            <option key={group.id} value={group.id}>
                              {group.name}
                            </option>
                          ))}
                        </select>
                        {loadingGroups && <Typography.Label>Загрузка...</Typography.Label>}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="form-field">
                        <Typography.Label style={{ display: "block", marginBottom: 8 }}>
                          ID университета *
                        </Typography.Label>
                        <input 
                          value={form.university_id} 
                          onChange={e => onFormChange("university_id", e.target.value)}
                          placeholder="Введите ID университета"
                          className="form-input"
                          type="number"
                        />
                      </div>

                      <div className="form-field">
                        <Typography.Label style={{ display: "block", marginBottom: 8 }}>
                          ID факультета
                        </Typography.Label>
                        <input 
                          value={form.faculty_id} 
                          onChange={e => onFormChange("faculty_id", e.target.value)}
                          placeholder="Введите ID факультета (опционально)"
                          className="form-input"
                          type="number"
                        />
                      </div>
                    </>
                  )}

                  <Flex justify="end" gap={12} style={{ marginTop: 24 }}>
                    <Button mode="tertiary" onClick={closeApprove} disabled={submitting}>
                      Отмена
                    </Button>
                    <Button mode="primary" onClick={submitApprove} disabled={submitting}>
                      {submitting ? "Сохранение..." : "Принять заявку"}
                    </Button>
                  </Flex>
                </div>
              </Container>
            </Panel>
          </div>
        )}
      </Container>
    </MainLayout>
  );
}