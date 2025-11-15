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
import "../css/GradeBookPage.css";

interface Subject {
  id: number;
  name: string;
  score: number | null;
}

/* Для teacher: группы и участники */
interface Group {
  id: number;
  name: string;
}
interface Participant {
  id: number;
  name: string;
  score: number | null;
  saving?: boolean;
}

function CircularProgressMini({ value, size = 64, strokeWidth = 8, idSuffix = "" }: { value: number | null; size?: number; strokeWidth?: number; idSuffix?: string | number; }) {
  const v = value == null ? 0 : Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - v / 100);
  const gradId = `g-${idSuffix}`;

  return (
    <svg className="circular-root" width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${v}%`}>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--accent-2)" />
        </linearGradient>
      </defs>

      <circle className="circular-bg" cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} fill="none" />
      <circle
        className="circular-progress"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        stroke={`url(#${gradId})`}
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        fill="none"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="circular-text">
        {value == null ? "—" : Math.round(value)}
      </text>
    </svg>
  );
}

export default function GradeBookPage(): JSX.Element {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // teacher state
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fromState = (location.state as any)?.from;
    const qp = new URLSearchParams(location.search).get("mode");
    const ref = typeof document !== "undefined" ? document.referrer : "";

    const teacherDetected =
      fromState === "/teacher" ||
      qp === "teacher" ||
      /\/teacher(\/|$)/.test(ref);

    setIsTeacherMode(Boolean(teacherDetected));
  }, [location]);

  useEffect(() => {
    if (isTeacherMode) {
      setLoading(false);
      return;
    }

    async function fetchGrades() {
      setLoading(true);
      try {
        const resp = await fetch("/grades");
        if (!resp.ok) throw new Error("no api");
        const data = (await resp.json()) as Subject[];
        if (Array.isArray(data)) {
          setSubjects(data.map(s => ({ id: s.id, name: s.name, score: s.score ?? null })));
        } else throw new Error("unexpected data");
      } catch {
        // Мок-данные (пока)
        setSubjects([
          { id: 1, name: "English B1.2 / Английский язык B1.2", score: 88 },
          { id: 2, name: "Базы данных", score: 92 },
          { id: 3, name: "Безопасность жизнедеятельности", score: 74 },
          { id: 4, name: "Дополнительные главы высшей математики", score: 81 },
          { id: 5, name: "История российской науки и техники", score: 95 },
          { id: 6, name: "ООП и проектирование на C#", score: 87 },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchGrades();
  }, [isTeacherMode]);

  /* -------- Teacher mode: загрузка групп -------- */
  useEffect(() => {
    if (!isTeacherMode) return;

    async function fetchGroups() {
      setGroupsLoading(true);
      try {
        const resp = await fetch("/api/teacher/groups");
        if (!resp.ok) throw new Error("no groups api");
        const data = (await resp.json()) as Group[];
        if (Array.isArray(data) && data.length) {
          setGroups(data);
        } else {
          // если API вернул пустое — мок
          throw new Error("empty");
        }
      } catch {
        // мок групп
        setGroups([
          { id: 11, name: "БПИ-21" },
          { id: 12, name: "ИП-20" },
          { id: 13, name: "КС-19" },
        ]);
      } finally {
        setGroupsLoading(false);
      }
    }

    fetchGroups();
  }, [isTeacherMode]);

  /* -------- Teacher mode: загрузка участников группы -------- */
  async function openGroup(g: Group) {
    setSelectedGroup(g);
    setParticipants([]);
    setParticipantsLoading(true);

    try {
      const resp = await fetch(`/personalities/student?group_id=${encodeURIComponent(g.id)}`);
      if (!resp.ok) throw new Error("no participants api");
      const data = (await resp.json()) as Participant[];
      if (Array.isArray(data) && data.length) setParticipants(data.map(p => ({ ...p, score: p.score ?? null })));
      else throw new Error("empty");
    } catch {
      // мок участников
      setParticipants([
        { id: 1001, name: "Иванов Иван", score: 78 },
        { id: 1002, name: "Петров Пётр", score: 85 },
        { id: 1003, name: "Сидорова Мария", score: 92 },
      ]);
    } finally {
      setParticipantsLoading(false);
    }
  }

  function closeGroup() {
    setSelectedGroup(null);
    setParticipants([]);
  }

  async function saveParticipant(participant: Participant) {
    // имитация сохранения (replace with real API)
    const idx = participants.findIndex(p => p.id === participant.id);
    if (idx === -1) return;
    const arr = [...participants];
    arr[idx] = { ...participant, saving: true };
    setParticipants(arr);

    try {
      // пример: POST /personalities/student (или PUT /grades)
      await new Promise((r) => setTimeout(r, 600)); // мок-отправка
      // if using real API:
      // await fetch('/personalities/student', { method: 'PUT', body: JSON.stringify({ id: participant.id, score: participant.score }) })
      arr[idx] = { ...participant, saving: false };
      setParticipants([...arr]);
    } catch {
      arr[idx] = { ...participant, saving: false };
      setParticipants([...arr]);
      // можно показывать toast/error
    }
  }

  async function saveAll() {
    // простая последовательная отправка
    for (const p of participants) {
      await saveParticipant(p);
    }
  }

  /* helper для изменения локальной оценки */
  function updateParticipantScore(id: number, newScore: number | null) {
    setParticipants(prev => prev.map(p => (p.id === id ? { ...p, score: newScore } : p)));
  }

  /* ---------- Render ---------- */

  // Teacher mode view
  if (isTeacherMode) {
    return (
      <MainLayout>
        <Container className="gradebook-container">
          <div className="gradebook-header">
            <Typography.Title variant="large-strong" className="page-title">Зачетка — преподаватель</Typography.Title>
            <div className="header-actions">
              <Button mode="secondary" size="small" onClick={() => navigate(-1)}>Назад</Button>
            </div>
          </div>

          {/* Если группа не выбрана — показываем список групп */}
          {!selectedGroup ? (
            <div>
              <Typography.Label style={{ display: "block", marginBottom: 12 }}>Выберите группу</Typography.Label>
              <Grid cols={2} gap={12} className="groups-grid">
                {groupsLoading ? (
                  <div className="loading-state">
                    <div className="loading-spinner" aria-hidden />
                    <Typography.Label>Загрузка групп...</Typography.Label>
                  </div>
                ) : (
                  groups.map(g => (
                    <Panel key={g.id} mode="secondary" className="group-card" onClick={() => openGroup(g)} style={{ cursor: "pointer" }}>
                      <Flex direction="column" style={{ gap: 6 }}>
                        <Typography.Title variant="small-strong" className="group-name">{g.name}</Typography.Title>
                        <Typography.Label className="group-sub">Открыть участников</Typography.Label>
                      </Flex>
                    </Panel>
                  ))
                )}
              </Grid>
            </div>
          ) : (
            // Список участников выбранной группы
            <div>
              <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
                <div>
                  <Typography.Title variant="medium-strong">{selectedGroup.name}</Typography.Title>
                  <Typography.Label className="group-sub">Участники группы</Typography.Label>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button mode="tertiary" size="small" onClick={closeGroup}>К группам</Button>
                  <Button mode="primary" size="small" onClick={saveAll}>Сохранить все</Button>
                </div>
              </Flex>

              {participantsLoading ? (
                <div className="loading-state">
                  <div className="loading-spinner" aria-hidden />
                  <Typography.Label>Загрузка участников...</Typography.Label>
                </div>
              ) : (
                <div className="participants-list">
                  {participants.map(p => (
                    <Panel key={p.id} mode="secondary" className="participant-row">
                      <Flex justify="space-between" align="center" style={{ width: "100%" }}>
                        <div style={{ flex: "1 1 60%", minWidth: 0 }}>
                          <Typography.Title variant="small-strong" className="participant-name" title={p.name}>{p.name}</Typography.Title>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 84, display: "flex", justifyContent: "center" }}>
                            <CircularProgressMini value={p.score} size={64} strokeWidth={6} idSuffix={p.id} />
                          </div>

                          <div style={{ width: 120, display: "flex", flexDirection: "column", gap: 6 }}>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={p.score ?? ""}
                              placeholder="-"
                              onChange={(e) => {
                                const v = e.target.value === "" ? null : Math.max(0, Math.min(100, Number(e.target.value || 0)));
                                updateParticipantScore(p.id, v);
                              }}
                              className="score-input"
                              aria-label={`Балл ${p.name}`}
                            />
                            <div style={{ display: "flex", gap: 8 }}>
                              <Button mode="secondary" size="small" onClick={() => updateParticipantScore(p.id, null)}>Сброс</Button>
                              <Button mode="primary" size="small" onClick={() => saveParticipant(p)} disabled={p.saving}>
                                {p.saving ? "Сохраняю..." : "Сохранить"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Flex>
                    </Panel>
                  ))}
                </div>
              )}
            </div>
          )}
        </Container>
      </MainLayout>
    );
  }

  /* ---------- Student (view-only) ---------- */
  return (
    <MainLayout>
      <Container className="gradebook-container">
        {/* Заголовок страницы */}
        <div className="gradebook-header">
          <Typography.Title variant="large-strong" className="page-title">
            Зачетка
          </Typography.Title>
          <div className="header-actions">
            <Button mode="secondary" size="small" onClick={() => navigate(-1)}>Назад</Button>
          </div>
        </div>

        {/* Сетка карточек */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" aria-hidden />
            <Typography.Label>Загрузка данных...</Typography.Label>
          </div>
        ) : (
          <div className="subjects-grid-wrapper">
            <Grid cols={2} gap={16} className="subjects-grid">
              {subjects.map((s) => {
                return (
                  <Panel key={s.id} mode="secondary" className="subject-card" aria-label={`${s.name} — ${s.score ?? "—"}`}>
                    <Flex justify="space-between" align="center" style={{ width: "100%" }}>
                      <div className="subject-info">
                        <Typography.Title variant="small-strong" className="subject-name" title={s.name}>
                          {s.name}
                        </Typography.Title>
                        <Typography.Label className="subject-sub">Предмет</Typography.Label>
                      </div>

                      <div className="subject-right">
                        <div className="circular-wrapper" aria-hidden>
                          <CircularProgressMini value={s.score} size={72} strokeWidth={8} idSuffix={s.id} />
                        </div>
                      </div>
                    </Flex>
                  </Panel>
                );
              })}
            </Grid>
          </div>
        )}
      </Container>
    </MainLayout>
  );
}
