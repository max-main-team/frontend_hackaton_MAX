/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Panel, Container, Flex, Typography, Button } from "@maxhub/max-ui";
import api from "../services/api";
import "../css/AdminEntitiesPage.css";

const BACKEND_PREFIX = "https://msokovykh.ru";
const ENDPOINTS = {
  UNIVERSITIES: `${BACKEND_PREFIX}/personalities/universities`,
  FACULTIES_LIST: `${BACKEND_PREFIX}/personalities/faculty`,
  DEPARTMENTS_LIST: `${BACKEND_PREFIX}/personalities/department`,
  GROUPS_LIST: `${BACKEND_PREFIX}/personalities/groups`,

  CREATE_FACULTY: `${BACKEND_PREFIX}/admin/faculties`,
  CREATE_DEPARTMENT: `${BACKEND_PREFIX}/admin/departments`,
  CREATE_GROUP: `${BACKEND_PREFIX}/admin/groups`,
  CREATE_SUBJECT: `${BACKEND_PREFIX}/subjects`,
  CREATE_SEMESTERS: `${BACKEND_PREFIX}/universities/semesters`,
};

export default function AdminEntitiesPage(): JSX.Element {
  const navigate = useNavigate();

  const [universities, setUniversities] = useState<any[]>([]);
  const [loadingUniversities, setLoadingUniversities] = useState(false);

  const [faculties, setFaculties] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [, setGroupsList] = useState<any[]>([]);

  const [facultyUni, setFacultyUni] = useState<number | null>(null);
  const [facultyName, setFacultyName] = useState("");
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [facultyMsg, setFacultyMsg] = useState<string | null>(null);

  const [departmentUni, setDepartmentUni] = useState<number | null>(null);
  const [departmentFacultyId, setDepartmentFacultyId] = useState<number | null>(null);
  const [departmentName, setDepartmentName] = useState("");
  const [departmentLoading, setDepartmentLoading] = useState(false);
  const [departmentMsg, setDepartmentMsg] = useState<string | null>(null);

  const [groupUni, setGroupUni] = useState<number | null>(null);
  const [groupFacultyId, setGroupFacultyId] = useState<number | null>(null);
  const [groupDepartmentId, setGroupDepartmentId] = useState<number | null>(null);
  const [groupName, setGroupName] = useState("");
  const [groupLoading, setGroupLoading] = useState(false);
  const [groupMsg, setGroupMsg] = useState<string | null>(null);

  const [subjectUniId, setSubjectUniId] = useState<number | null>(null);
  const [subjectName, setSubjectName] = useState("");
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [subjectMsg, setSubjectMsg] = useState<string | null>(null);

  const [semUniId, setSemUniId] = useState<number | null>(null);
  const [periods, setPeriods] = useState<{ start: string; end: string }[]>([{ start: "", end: "" }]);
  const [semLoading, setSemLoading] = useState(false);
  const [semMsg, setSemMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchUniversities();
  }, []);

  async function fetchUniversities() {
    setLoadingUniversities(true);
    try {
      const res = await api.get(ENDPOINTS.UNIVERSITIES);
      const data = res.data;
      const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setUniversities(arr || []);
    } catch (e) {
      console.warn("failed to load universities", e);
      setUniversities([]);
    } finally {
      setLoadingUniversities(false);
    }
  }

  async function fetchFacultiesFor(universityId: number | null) {
    if (!universityId) {
      setFaculties([]);
      return;
    }
    try {
      const res = await api.get(ENDPOINTS.FACULTIES_LIST, { params: { university_id: universityId } });
      const data = res.data;
      const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setFaculties(arr || []);
    } catch (e) {
      console.warn("failed to load faculties", e);
      setFaculties([]);
    }
  }

  async function fetchDepartmentsFor(facultyId: number | null) {
    if (!facultyId) {
      setDepartments([]);
      return;
    }
    try {
      const res = await api.get(ENDPOINTS.DEPARTMENTS_LIST, { params: { faculty_id: facultyId } });
      const data = res.data;
      const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setDepartments(arr || []);
    } catch (e) {
      console.warn("failed to load departments", e);
      setDepartments([]);
    }
  }

  async function fetchGroupsFor(departmentId: number | null) {
    if (!departmentId) {
      setGroupsList([]);
      return;
    }
    try {
      const res = await api.get(ENDPOINTS.GROUPS_LIST, { params: { department_id: departmentId } });
      const data = res.data;
      const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setGroupsList(arr || []);
    } catch (e) {
      console.warn("failed to load groups", e);
      setGroupsList([]);
    }
  }


  async function onCreateFaculty() {
    setFacultyMsg(null);
    if (!facultyUni) return setFacultyMsg("Выберите университет");
    if (!facultyName.trim()) return setFacultyMsg("Введите название факультета");
    setFacultyLoading(true);
    try {
      const res = await api.post(ENDPOINTS.CREATE_FACULTY, { faculty_name: facultyName.trim(), university_id: facultyUni });
      if (res?.status === 200) {
        setFacultyName("");
        setFacultyMsg("Факультет успешно создан");
        await fetchFacultiesFor(facultyUni);
      } else setFacultyMsg(`Сервер вернул ${res?.status}`);
    } catch (e: any) {
      console.error(e);
      setFacultyMsg(e?.response?.data?.message ?? "Ошибка при создании факультета");
    } finally {
      setFacultyLoading(false);
    }
  }

  async function onCreateDepartment() {
    setDepartmentMsg(null);
    if (!departmentUni) return setDepartmentMsg("Выберите университет");
    if (!departmentFacultyId) return setDepartmentMsg("Выберите факультет");
    if (!departmentName.trim()) return setDepartmentMsg("Введите название направления");
    setDepartmentLoading(true);
    try {
      const res = await api.post(ENDPOINTS.CREATE_DEPARTMENT, {
        department_name: departmentName.trim(),
        university_id: departmentUni,
        faculty_id: departmentFacultyId,
      });
      if (res?.status === 200) {
        setDepartmentName("");
        setDepartmentMsg("Направление успешно создано");
        await fetchDepartmentsFor(departmentFacultyId);
      } else setDepartmentMsg(`Сервер вернул ${res?.status}`);
    } catch (e: any) {
      console.error(e);
      setDepartmentMsg(e?.response?.data?.message ?? "Ошибка при создании направления");
    } finally {
      setDepartmentLoading(false);
    }
  }

  async function onCreateGroup() {
    setGroupMsg(null);
    if (!groupUni) return setGroupMsg("Выберите университет");
    if (!groupFacultyId) return setGroupMsg("Выберите факультет");
    if (!groupDepartmentId) return setGroupMsg("Выберите направление");
    if (!groupName.trim()) return setGroupMsg("Введите название группы");
    setGroupLoading(true);
    try {
      const res = await api.post(ENDPOINTS.CREATE_GROUP, {
        name: groupName.trim(),
        university_id: groupUni,
        faculty_id: groupFacultyId,
        department_id: groupDepartmentId,
      });
      if (res?.status === 200) {
        setGroupName("");
        setGroupMsg("Группа успешно создана");
        await fetchGroupsFor(groupDepartmentId);
      } else setGroupMsg(`Сервер вернул ${res?.status}`);
    } catch (e: any) {
      console.error(e);
      setGroupMsg(e?.response?.data?.message ?? "Ошибка при создании группы");
    } finally {
      setGroupLoading(false);
    }
  }

  async function onCreateSubject() {
    setSubjectMsg(null);
    if (!subjectUniId) return setSubjectMsg("Выберите университет");
    if (!subjectName.trim()) return setSubjectMsg("Введите название предмета");
    setSubjectLoading(true);
    try {
      const res = await api.post(ENDPOINTS.CREATE_SUBJECT, { name: subjectName.trim(), university_id: subjectUniId });
      if (res?.status === 200) {
        setSubjectName("");
        setSubjectMsg("Предмет успешно создан");
      } else setSubjectMsg(`Сервер вернул ${res?.status}`);
    } catch (e: any) {
      console.error(e);
      setSubjectMsg(e?.response?.data?.message ?? "Ошибка при создании предмета");
    } finally {
      setSubjectLoading(false);
    }
  }

  async function onCreateSemesters() {
    setSemMsg(null);
    if (!semUniId) return setSemMsg("Выберите университет");
    const periodsPayload: any[] = [];
    for (const p of periods) {
      if (!p.start || !p.end) return setSemMsg("Укажите даты для всех периодов (start/end)");
      periodsPayload.push({ start_date: new Date(p.start).toISOString(), end_date: new Date(p.end).toISOString() });
    }
    setSemLoading(true);
    try {
      const res = await api.post(ENDPOINTS.CREATE_SEMESTERS, { uni_id: semUniId, periods: periodsPayload });
      if (res?.status === 200) {
        setPeriods([{ start: "", end: "" }]);
        setSemMsg("Семестры успешно созданы");
      } else setSemMsg(`Сервер вернул ${res?.status}`);
    } catch (e: any) {
      console.error(e);
      setSemMsg(e?.response?.data?.message ?? "Ошибка при создании семестров");
    } finally {
      setSemLoading(false);
    }
  }

  /* periods helpers */
  function setPeriodAt(idx: number, key: "start" | "end", value: string) {
    setPeriods(prev => {
      const cp = prev.slice();
      cp[idx] = { ...cp[idx], [key]: value };
      return cp;
    });
  }
  function addPeriod() {
    setPeriods(prev => [...prev, { start: "", end: "" }]);
  }
  function removePeriod(idx: number) {
    setPeriods(prev => prev.filter((_, i) => i !== idx));
  }

  return (
    <Container style={{ paddingTop: 12, paddingBottom: 28 }}>
      <Flex align="center" justify="space-between" style={{ marginBottom: 8 }}>
        <div>
          <Typography.Title variant="large-strong" style={{ marginBottom: 2 }}>
            Админ: создание сущностей
          </Typography.Title>
          <Typography.Label style={{ display: "block", color: "var(--maxui-muted, #9aa)" }}>
            Создавайте факультеты, направления, группы, предметы и семестры.
          </Typography.Label>
        </div>

        <div>
          <Button mode="tertiary" onClick={() => navigate(-1)}>
            Назад
          </Button>
        </div>
      </Flex>

      <div className="admin-cards">
        <Panel mode="secondary" className="admin-entity-panel">
          <div className="card-header">
            <Typography.Title variant="small-strong">Создать факультет</Typography.Title>
          </div>

          <div className="card-body">
            <label className="field-label">Университет</label>
            <select
              className="admin-input"
              value={facultyUni ?? ""}
              onChange={e => {
                const id = e.target.value ? Number(e.target.value) : null;
                setFacultyUni(id);
                fetchFacultiesFor(id);
              }}
              disabled={loadingUniversities}
            >
              {loadingUniversities ? <option value="">Загрузка...</option> : <option value="">Выберите университет</option>}
              {universities.map(u => (
                <option key={u.id ?? u.uni_id} value={u.id ?? u.uni_id}>
                  {u.uni_name ?? u.uni_short_name ?? u.name}
                </option>
              ))}
            </select>

            <label className="field-label">Название факультета</label>
            <input value={facultyName} onChange={e => setFacultyName(e.target.value)} placeholder="Например: Институт компьютерных наук" className="admin-input" />

            <div className="card-footer">
              <div className="msg">{facultyMsg}</div>
              <Button mode="primary" onClick={onCreateFaculty} disabled={facultyLoading}>
                {facultyLoading ? "Создаём..." : "Создать факультет"}
              </Button>
            </div>
          </div>
        </Panel>

        <Panel mode="secondary" className="admin-entity-panel">
          <div className="card-header">
            <Typography.Title variant="small-strong">Создать направление / кафедру</Typography.Title>
          </div>

          <div className="card-body">
            <label className="field-label">Университет</label>
            <select
              className="admin-input"
              value={departmentUni ?? ""}
              onChange={e => {
                const id = e.target.value ? Number(e.target.value) : null;
                setDepartmentUni(id);
                setDepartmentFacultyId(null);
                setDepartments([]);
                if (id) fetchFacultiesFor(id);
              }}
              disabled={loadingUniversities}
            >
              {loadingUniversities ? <option value="">Загрузка...</option> : <option value="">Выберите университет</option>}
              {universities.map(u => <option key={u.id ?? u.uni_id} value={u.id ?? u.uni_id}>{u.uni_name ?? u.uni_short_name ?? u.name}</option>)}
            </select>

            <label className="field-label">Факультет</label>
            <select
              className="admin-input"
              value={departmentFacultyId ?? ""}
              onChange={e => {
                const id = e.target.value ? Number(e.target.value) : null;
                setDepartmentFacultyId(id);
                setDepartments([]);
                if (id) fetchDepartmentsFor(id);
              }}
            >
              <option value="">Выберите факультет</option>
              {faculties.map(f => <option key={f.id ?? f.faculty_id} value={f.id ?? f.faculty_id}>{f.name ?? f.faculty_name}</option>)}
            </select>

            <label className="field-label">Название направления</label>
            <input value={departmentName} onChange={e => setDepartmentName(e.target.value)} placeholder="Например: Прикладная математика" className="admin-input" />

            <div className="card-footer">
              <div className="msg">{departmentMsg}</div>
              <Button mode="primary" onClick={onCreateDepartment} disabled={departmentLoading}>
                {departmentLoading ? "Создаём..." : "Создать направление"}
              </Button>
            </div>
          </div>
        </Panel>

        <Panel mode="secondary" className="admin-entity-panel">
          <div className="card-header">
            <Typography.Title variant="small-strong">Создать группу</Typography.Title>
          </div>

          <div className="card-body">
            <label className="field-label">Университет</label>
            <select
              className="admin-input"
              value={groupUni ?? ""}
              onChange={e => {
                const id = e.target.value ? Number(e.target.value) : null;
                setGroupUni(id);
                setGroupFacultyId(null);
                setGroupDepartmentId(null);
                setFaculties([]);
                setDepartments([]);
                setGroupsList([]);
                if (id) fetchFacultiesFor(id);
              }}
              disabled={loadingUniversities}
            >
              {loadingUniversities ? <option value="">Загрузка...</option> : <option value="">Выберите университет</option>}
              {universities.map(u => <option key={u.id ?? u.uni_id} value={u.id ?? u.uni_id}>{u.uni_name ?? u.uni_short_name ?? u.name}</option>)}
            </select>

            <label className="field-label">Факультет</label>
            <select
              className="admin-input"
              value={groupFacultyId ?? ""}
              onChange={e => {
                const id = e.target.value ? Number(e.target.value) : null;
                setGroupFacultyId(id);
                setGroupDepartmentId(null);
                setDepartments([]);
                setGroupsList([]);
                if (id) fetchDepartmentsFor(id);
              }}
            >
              <option value="">Выберите факультет</option>
              {faculties.map(f => <option key={f.id ?? f.faculty_id} value={f.id ?? f.faculty_id}>{f.name ?? f.faculty_name}</option>)}
            </select>

            <label className="field-label">Направление</label>
            <select
              className="admin-input"
              value={groupDepartmentId ?? ""}
              onChange={e => {
                const id = e.target.value ? Number(e.target.value) : null;
                setGroupDepartmentId(id);
                setGroupsList([]);
                if (id) fetchGroupsFor(id);
              }}
            >
              <option value="">Выберите направление</option>
              {departments.map(d => <option key={d.id ?? JSON.stringify(d)} value={d.id}>{d.department_name ?? d.name ?? d.title}</option>)}
            </select>

            <label className="field-label">Название группы</label>
            <input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Например: 20ИИ-1" className="admin-input" />

            <div className="card-footer">
              <div className="msg">{groupMsg}</div>
              <Button mode="primary" onClick={onCreateGroup} disabled={groupLoading}>
                {groupLoading ? "Создаём..." : "Создать группу"}
              </Button>
            </div>
          </div>
        </Panel>

        <Panel mode="secondary" className="admin-entity-panel">
          <div className="card-header">
            <Typography.Title variant="small-strong">Создать предмет</Typography.Title>
          </div>

          <div className="card-body">
            <label className="field-label">Университет</label>
            <select
              className="admin-input"
              value={subjectUniId ?? ""}
              onChange={e => setSubjectUniId(e.target.value ? Number(e.target.value) : null)}
              disabled={loadingUniversities}
            >
              {loadingUniversities ? <option value="">Загрузка...</option> : <option value="">Выберите университет</option>}
              {universities.map(u => <option key={u.id ?? u.uni_id} value={u.id ?? u.uni_id}>{u.uni_name ?? u.uni_short_name ?? u.name}</option>)}
            </select>

            <label className="field-label">Название предмета</label>
            <input value={subjectName} onChange={e => setSubjectName(e.target.value)} placeholder="Например: Алгоритмы и структуры данных" className="admin-input" />

            <div className="card-footer">
              <div className="msg">{subjectMsg}</div>
              <Button mode="primary" onClick={onCreateSubject} disabled={subjectLoading}>
                {subjectLoading ? "Создаём..." : "Создать предмет"}
              </Button>
            </div>
          </div>
        </Panel>

        <Panel mode="secondary" className="admin-entity-panel">
          <div className="card-header">
            <Typography.Title variant="small-strong">Создать семестры (periods)</Typography.Title>
          </div>

          <div className="card-body">
            <label className="field-label">Университет</label>
            <select className="admin-input" value={semUniId ?? ""} onChange={e => setSemUniId(e.target.value ? Number(e.target.value) : null)} disabled={loadingUniversities}>
              {loadingUniversities ? <option value="">Загрузка...</option> : <option value="">Выберите университет</option>}
              {universities.map(u => <option key={u.id ?? u.uni_id} value={u.id ?? u.uni_id}>{u.uni_name ?? u.uni_short_name ?? u.name}</option>)}
            </select>

            {periods.map((p, idx) => (
              <div key={idx} className="period-row">
                <div style={{ flex: 1 }}>
                  <label className="period-label">Start</label>
                  <input type="datetime-local" value={p.start} onChange={e => setPeriodAt(idx, "start", e.target.value)} className="admin-input" />
                </div>

                <div style={{ flex: 1 }}>
                  <label className="period-label">End</label>
                  <input type="datetime-local" value={p.end} onChange={e => setPeriodAt(idx, "end", e.target.value)} className="admin-input" />
                </div>

                <div style={{ display: "flex", alignItems: "flex-end", marginLeft: 12 }}>
                  <Button mode="tertiary" size="small" onClick={() => removePeriod(idx)} disabled={periods.length === 1}>
                    Удалить
                  </Button>
                </div>
              </div>
            ))}

            <div style={{ marginTop: 8 }}>
              <Button mode="tertiary" onClick={addPeriod}>Добавить период</Button>
            </div>

            <div className="card-footer">
              <div className="msg">{semMsg}</div>
              <Button mode="primary" onClick={onCreateSemesters} disabled={semLoading}>
                {semLoading ? "Создаём..." : "Создать семестры"}
              </Button>
            </div>
          </div>
        </Panel>
      </div>
    </Container>
  );
}
