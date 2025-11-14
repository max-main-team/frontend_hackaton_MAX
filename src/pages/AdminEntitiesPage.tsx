/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import {
  Panel,
  Container,
  Flex,
  Typography,
  Button,
} from "@maxhub/max-ui";
import api from "../services/api";
import "../css/AdminEntitiesPage.css";
const BACKEND_PREFIX = "https://msokovykh.ru";

export default function AdminEntitiesPage(): JSX.Element {
  const navigate = useNavigate();

  // Faculty
  const [facultyName, setFacultyName] = useState("");
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [facultyMsg, setFacultyMsg] = useState<string | null>(null);

  // Subject
  const [subjectName, setSubjectName] = useState("");
  const [subjectUniId, setSubjectUniId] = useState<string>("");
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [subjectMsg, setSubjectMsg] = useState<string | null>(null);

  // Semesters (periods)
  const [periods, setPeriods] = useState<{ start: string; end: string }[]>([
    { start: "", end: "" },
  ]);
  const [uniId, setUniId] = useState<string>("");
  const [semLoading, setSemLoading] = useState(false);
  const [semMsg, setSemMsg] = useState<string | null>(null);

  useEffect(() => {
    const isVis = window.WebApp?.BackButton?.setVisible;
    if (isVis) {
        window.WebApp?.BackButton?.setHandler?.(() => {
            navigate(-1);
        });
    }
  }, [navigate]);

  /* ---------- helpers ---------- */

  function clearFacultyForm(msg?: string) {
    setFacultyName("");
    setFacultyMsg(msg ?? "Факультет создан");
  }

  function clearSubjectForm(msg?: string) {
    setSubjectName("");
    setSubjectUniId("");
    setSubjectMsg(msg ?? "Предмет создан");
  }

  function clearSemForm(msg?: string) {
    setPeriods([{ start: "", end: "" }]);
    setUniId("");
    setSemMsg(msg ?? "Семестры созданы");
  }

  /* ---------- submit handlers ---------- */

  async function onCreateFaculty() {
    setFacultyMsg(null);
    if (!facultyName.trim()) {
      setFacultyMsg("Введите название факультета");
      return;
    }
    setFacultyLoading(true);
    try {
      const url = `${BACKEND_PREFIX}/admin/faculties`;
      const res = await api.post(url, { faculty_name: facultyName.trim() });
      if (res?.status === 200) {
        clearFacultyForm("Факультет успешно создан");
      } else {
        setFacultyMsg(`Сервер вернул ${res?.status}`);
      }
    } catch (e: any) {
      console.error("create faculty error", e);
      setFacultyMsg(e?.response?.data?.message ?? "Ошибка при создании факультета");
    } finally {
      setFacultyLoading(false);
    }
  }

  async function onCreateSubject() {
    setSubjectMsg(null);
    if (!subjectName.trim() || !subjectUniId.trim()) {
      setSubjectMsg("Заполните название предмета и ID университета");
      return;
    }
    const uni = Number(subjectUniId);
    if (!Number.isFinite(uni)) {
      setSubjectMsg("University ID должен быть числом");
      return;
    }
    setSubjectLoading(true);
    try {
      const url = `${BACKEND_PREFIX}/admin/subjects`;
      const res = await api.post(url, { name: subjectName.trim(), university_id: uni });
      if (res?.status === 200) {
        clearSubjectForm("Предмет успешно создан");
      } else {
        setSubjectMsg(`Сервер вернул ${res?.status}`);
      }
    } catch (e: any) {
      console.error("create subject error", e);
      setSubjectMsg(e?.response?.data?.message ?? "Ошибка при создании предмета");
    } finally {
      setSubjectLoading(false);
    }
  }

  async function onCreateSemesters() {
    setSemMsg(null);
    if (!uniId.trim()) {
      setSemMsg("Введите ID университета");
      return;
    }
    const uni = Number(uniId);
    if (!Number.isFinite(uni)) {
      setSemMsg("University ID должен быть числом");
      return;
    }

    // validate periods
    const periodsPayload = [];
    for (const p of periods) {
      if (!p.start || !p.end) {
        setSemMsg("Укажите даты для всех периодов (start/end)");
        return;
      }
      const startIso = new Date(p.start).toISOString();
      const endIso = new Date(p.end).toISOString();
      periodsPayload.push({ start_date: startIso, end_date: endIso });
    }

    setSemLoading(true);
    try {
      const url = `${BACKEND_PREFIX}/universities/semesters`;
      const res = await api.post(url, {
        periods: periodsPayload,
        uni_id: uni,
      });
      if (res?.status === 200) {
        clearSemForm("Семестры успешно созданы");
      } else {
        setSemMsg(`Сервер вернул ${res?.status}`);
      }
    } catch (e: any) {
      console.error("create semesters error", e);
      setSemMsg(e?.response?.data?.message ?? "Ошибка при создании семестров");
    } finally {
      setSemLoading(false);
    }
  }

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
      <Typography.Title variant="large-strong" style={{ marginBottom: 8 }}>
        Админ: создание сущностей
      </Typography.Title>

      <Typography.Label style={{ display: "block", marginBottom: 12 }}>
        Создавайте факультеты, предметы и семестры. Ответы с кодом 200 считаются успешными.
      </Typography.Label>

      {/* FACULTY */}
      <Panel mode="secondary" className="admin-entity-panel">
        <Flex direction="column" gap={8}>
          <Typography.Title variant="small-strong">Создать факультет</Typography.Title>

          <div className="field-row">
            <input
              value={facultyName}
              onChange={(e) => setFacultyName(e.target.value)}
              placeholder="Название факультета (например: FITIP)"
              className="admin-input"
            />
          </div>

          <Flex justify="space-between" align="center">
            <div className="msg">{facultyMsg}</div>
            <div>
              <Button mode="tertiary" onClick={() => { setFacultyName(""); setFacultyMsg(null); }} style={{ marginRight: 8 }}>
                Очистить
              </Button>
              <Button mode="primary" onClick={onCreateFaculty} disabled={facultyLoading}>
                {facultyLoading ? "Создаём..." : "Создать факультет"}
              </Button>
            </div>
          </Flex>
        </Flex>
      </Panel>

      {/* SUBJECT */}
      <Panel mode="secondary" className="admin-entity-panel">
        <Flex direction="column" gap={8}>
          <Typography.Title variant="small-strong">Создать предмет</Typography.Title>

          <div className="field-row">
            <input
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="Название предмета"
              className="admin-input"
            />
          </div>

          <div className="field-row">
            <input
              value={subjectUniId}
              onChange={(e) => setSubjectUniId(e.target.value)}
              placeholder="ID университета (число)"
              className="admin-input"
            />
          </div>

          <Flex justify="space-between" align="center">
            <div className="msg">{subjectMsg}</div>
            <div>
              <Button mode="tertiary" onClick={() => { setSubjectName(""); setSubjectUniId(""); setSubjectMsg(null); }} style={{ marginRight: 8 }}>
                Очистить
              </Button>
              <Button mode="primary" onClick={onCreateSubject} disabled={subjectLoading}>
                {subjectLoading ? "Создаём..." : "Создать предмет"}
              </Button>
            </div>
          </Flex>
        </Flex>
      </Panel>

      {/* SEMESTERS */}
      <Panel mode="secondary" className="admin-entity-panel">
        <Flex direction="column" gap={8}>
          <Typography.Title variant="small-strong">Создать семестры (periods)</Typography.Title>

          <div className="field-row">
            <input
              value={uniId}
              onChange={(e) => setUniId(e.target.value)}
              placeholder="ID университета (uni_id)"
              className="admin-input"
            />
          </div>

          {periods.map((p, idx) => (
            <div key={idx} className="period-row">
              <div style={{ flex: 1 }}>
                <label className="period-label">Start</label>
                <input
                  type="datetime-local"
                  value={p.start}
                  onChange={(e) => setPeriodAt(idx, "start", e.target.value)}
                  className="admin-input"
                />
              </div>

              <div style={{ flex: 1, marginLeft: 12 }}>
                <label className="period-label">End</label>
                <input
                  type="datetime-local"
                  value={p.end}
                  onChange={(e) => setPeriodAt(idx, "end", e.target.value)}
                  className="admin-input"
                />
              </div>

              <div style={{ display: "flex", alignItems: "flex-end", marginLeft: 12 }}>
                <Button mode="tertiary" size="small" onClick={() => removePeriod(idx)} disabled={periods.length === 1}>
                  Удалить
                </Button>
              </div>
            </div>
          ))}

          <div>
            <Button mode="tertiary" onClick={addPeriod} style={{ marginRight: 8 }}>Добавить период</Button>
          </div>

          <Flex justify="space-between" align="center">
            <div className="msg">{semMsg}</div>
            <div>
              <Button mode="tertiary" onClick={() => { setPeriods([{ start: "", end: "" }]); setUniId(""); setSemMsg(null); }} style={{ marginRight: 8 }}>
                Очистить
              </Button>
              <Button mode="primary" onClick={onCreateSemesters} disabled={semLoading}>
                {semLoading ? "Создаём..." : "Создать семестры"}
              </Button>
            </div>
          </Flex>
        </Flex>
      </Panel>

      <div style={{ height: 18 }} />

      <Flex justify="start">
        <Button mode="tertiary" onClick={() => navigate(-1)}>Назад</Button>
      </Flex>
    </Container>
  );
}
