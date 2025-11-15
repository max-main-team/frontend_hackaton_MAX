/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import  { useEffect, useMemo, useRef, useState, type JSX } from "react";
import {
  Panel,
  Flex,
  Typography,
  Button,
  Grid,
  Input
} from "@maxhub/max-ui";
import { useLocation } from "react-router-dom";
import api from "../services/api";
import "../css/SchedulePage.css";

type DayKey = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

interface Lesson {
  day: string;
  end_time: string;
  interval?: string;
  lesson_id: number;
  pair_number: number;
  room?: string;
  room_id?: number;
  start_time?: string; // sometimes provided
  subject_name: string;
  subject_type?: string;
  teacher_first_name?: string;
  teacher_id?: number;
  teacher_last_name?: string;
}

interface UserSchedule {
  schedule: Lesson[];
  user_id: number;
}

interface ClassTime {
  id?: number;
  pair_number: number;
  start_time: string;
  end_time: string;
  university_id?: number;
}

interface Room {
  id: number;
  room: string;
  university_id?: number;
}

const WEEK_DAYS: DayKey[] = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const RU_WEEK_NAMES: Record<DayKey, string> = {
  Monday: "Понедельник",
  Tuesday: "Вторник",
  Wednesday: "Среда",
  Thursday: "Четверг",
  Friday: "Пятница",
  Saturday: "Суббота",
  Sunday: "Воскресенье",
};

// Helpers: get monday of current week (start of week)
function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 Sun .. 6 Sat
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0,0,0,0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDateRu(d: Date) {
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export default function SchedulePage(): JSX.Element {
  const loc = useLocation();
  // role detection: if navigated from admin we enable admin forms
  const fromState = (loc.state as any)?.from;
  const qp = new URLSearchParams(loc.search).get("mode");
  const referrer = typeof document !== "undefined" ? document.referrer : "";
  const isAdminMode = Boolean(fromState === "/admin" || qp === "admin" || /\/admin(\/|$)/.test(referrer));

  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [universityId, setUniversityId] = useState<number | null>(null);

  const [schedules, setSchedules] = useState<UserSchedule[]>([]);
  const [classTimes, setClassTimes] = useState<ClassTime[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  /* Admin form state */
  const [createClassLoading, setCreateClassLoading] = useState(false);
  const [createRoomLoading, setCreateRoomLoading] = useState(false);
  const [createLessonLoading, setCreateLessonLoading] = useState(false);

  const [newClassPair, setNewClassPair] = useState<number | null>(null);
  const [newClassStart, setNewClassStart] = useState<string>("");
  const [newClassEnd, setNewClassEnd] = useState<string>("");

  const [newRoomName, setNewRoomName] = useState<string>("");

  const [lessonSubjectId, setLessonSubjectId] = useState<number | null>(null); // course_group_subject_id
  const [lessonDay, setLessonDay] = useState<DayKey | null>(null);
  const [lessonClassPair, setLessonClassPair] = useState<number | null>(null); // pair_number
  const [lessonRoomId, setLessonRoomId] = useState<number | null>(null);
  const [lessonInterval] = useState<string>("week");

  /* Infinite weeks state: array of weekStart dates (Date) */
  const [weeks, setWeeks] = useState<Date[]>(() => {
    const monday = startOfWeek(new Date());
    return [monday];
  });
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // derived: group lessons by dayKey
  const groupedByDay = useMemo(() => {
    // flatten schedule[0]?.schedule etc. API returns array of user schedules; combine
    const allLessons: Lesson[] = schedules.flatMap(s => s.schedule || []);
    // Group by lesson.day; we expect lesson.day to be English weekday (Monday etc.)
    const map = new Map<DayKey, Lesson[]>();
    WEEK_DAYS.forEach(d => map.set(d, []));
    for (const ls of allLessons) {
      const dayKey = (WEEK_DAYS.find(d => d.toLowerCase() === String(ls.day).toLowerCase()) ?? null) as DayKey | null;
      if (dayKey) map.get(dayKey)!.push(ls);
    }
    // sort lessons inside day by pair_number or start_time
    const result: Record<DayKey, Lesson[]> = {
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: []
    };
    for (const d of WEEK_DAYS) {
      const arr = map.get(d) || [];
      arr.sort((a,b) => {
        if (a.pair_number && b.pair_number) return a.pair_number - b.pair_number;
        if (a.start_time && b.start_time) return a.start_time.localeCompare(b.start_time);
        return 0;
      });
      result[d] = arr;
    }
    return result;
  }, [schedules]);

  // fetch user -> schedules -> classTimes -> rooms
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        // 1) user/me
        const resUser = await api.get("https://msokovykh.ru/user/me");
        const u = resUser?.data?.user ?? resUser?.data;
        if (!mounted) return;
        if (u) {
          const fullName = [u.first_name, u.last_name].filter(Boolean).join(" ").trim() || u.username || "Пользователь";
          setUserName(fullName);
          setUserId(u.id ?? null);
          // university id may be present in user object or we will query universities/info
          if (u.university_id) setUniversityId(u.university_id);
        } else {
          setUserName(null);
          setUserId(null);
        }

        // 2) if universityId not known, fetch universities/info
        let uniId = u?.university_id ?? null;
        if (!uniId) {
          try {
            const resUni = await api.get("https://msokovykh.ru/universities/info");
            const info = resUni?.data;
            if (info?.id) uniId = info.id;
          } catch (e) {
            // ignore
          }
        }
        if (!mounted) return;
        if (uniId) setUniversityId(uniId);

        // 3) fetch class times for uni (if have)
        if (uniId) {
          try {
            const resClasses = await api.get("/schedules/classes", { params: { university_id: uniId } });
            const data: ClassTime[] = Array.isArray(resClasses?.data) ? resClasses.data : [];
            if (mounted && data.length) {
              setClassTimes(data);
            } else if (mounted && !data.length) {
              // fallback defaults
              setClassTimes([
                { pair_number: 1, start_time: "09:00", end_time: "10:30" },
                { pair_number: 2, start_time: "10:40", end_time: "12:10" },
                { pair_number: 3, start_time: "12:30", end_time: "14:00" },
                { pair_number: 4, start_time: "14:10", end_time: "15:40" },
                { pair_number: 5, start_time: "16:00", end_time: "17:30" },
              ]);
            }
          } catch (e) {
            if (mounted) {
              setClassTimes([
                { pair_number: 1, start_time: "09:00", end_time: "10:30" },
                { pair_number: 2, start_time: "10:40", end_time: "12:10" },
                { pair_number: 3, start_time: "12:30", end_time: "14:00" },
                { pair_number: 4, start_time: "14:10", end_time: "15:40" },
                { pair_number: 5, start_time: "16:00", end_time: "17:30" },
              ]);
            }
          }
        }

        // 4) fetch user schedule
        if (u?.id) {
          try {
            const resSched = await api.get<UserSchedule[]>(`/schedules/users/${u.id}`);
            const data = Array.isArray(resSched?.data) ? resSched.data : [];
            if (!mounted) return;
            if (data.length) {
              setSchedules(data);
            } else {
              // fallback mock schedule: simple example repeating Monday..Friday
              setSchedules([{
                user_id: u.id,
                schedule: [
                  {
                    day: "Monday",
                    end_time: "10:30",
                    interval: "week",
                    lesson_id: 101,
                    pair_number: 1,
                    room: "101",
                    room_id: 1,
                    start_time: "09:00",
                    subject_name: "Математика",
                    subject_type: "Лекция",
                    teacher_first_name: "Иван",
                    teacher_last_name: "Иванов",
                  },
                  {
                    day: "Tuesday",
                    end_time: "12:10",
                    interval: "week",
                    lesson_id: 102,
                    pair_number: 2,
                    room: "202",
                    room_id: 2,
                    start_time: "10:40",
                    subject_name: "Физика",
                    subject_type: "Практика",
                    teacher_first_name: "Пётр",
                    teacher_last_name: "Петров",
                  },
                  {
                    day: "Wednesday",
                    end_time: "15:40",
                    interval: "week",
                    lesson_id: 103,
                    pair_number: 4,
                    room: "305",
                    room_id: 3,
                    start_time: "14:10",
                    subject_name: "Программирование",
                    subject_type: "Лаб",
                    teacher_first_name: "Елена",
                    teacher_last_name: "Сидорова",
                  }
                ]
              }]);
            }
          } catch (e) {
            // fallback on error
            if (!mounted) return;
            setSchedules([{
              user_id: u.id,
              schedule: [
                {
                  day: "Monday",
                  end_time: "10:30",
                  interval: "week",
                  lesson_id: 101,
                  pair_number: 1,
                  room: "101",
                  room_id: 1,
                  start_time: "09:00",
                  subject_name: "Математика",
                  subject_type: "Лекция",
                  teacher_first_name: "Иван",
                  teacher_last_name: "Иванов",
                }
              ]
            }]);
          }
        }

        // 5) if admin mode -- fetch rooms list
        if (isAdminMode && uniId) {
          try {
            const resRooms = await api.get("/schedules/rooms", { params: { university_id: uniId } });
            const dataRooms: Room[] = Array.isArray(resRooms?.data) ? resRooms.data : [];
            if (mounted) setRooms(dataRooms);
          } catch (e) {
            // leave empty
            if (mounted) setRooms([]);
          }
        }

        if (mounted) setError(null);
      } catch (e: any) {
        if (mounted) setError("Ошибка загрузки расписания");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [isAdminMode]);

  // IntersectionObserver for infinite weeks
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const io = new IntersectionObserver(entries => {
      for (const ent of entries) {
        if (ent.isIntersecting) {
          // append next week
          setWeeks(prev => {
            const last = prev[prev.length - 1];
            const next = addDays(last, 7);
            return [...prev, next];
          });
        }
      }
    }, { root: null, rootMargin: "300px", threshold: 0.1 });

    io.observe(sentinel);
    return () => io.disconnect();
  }, []);

  // Admin actions: create class time
  async function handleCreateClass() {
    if (!universityId) return alert("University id missing");
    if (!newClassPair || !newClassStart || !newClassEnd) return alert("Заполните все поля для времени пары");
    setCreateClassLoading(true);
    try {
      const payload = {
        pair_number: newClassPair,
        start_time: newClassStart,
        end_time: newClassEnd,
        university_id: universityId
      };
      const res = await api.post("/schedules/classes", payload);
      if (res?.status === 200 || res?.status === 201) {
        // optimistic update: append
        setClassTimes(prev => [...prev, { pair_number: newClassPair, start_time: newClassStart, end_time: newClassEnd, university_id: universityId }]);
        setNewClassPair(null); setNewClassStart(""); setNewClassEnd("");
      } else {
        alert(`Сервер вернул ${res?.status}`);
      }
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.message ?? "Ошибка при создании времени пары (мок)");
      // fallback: append locally
      setClassTimes(prev => [...prev, { pair_number: newClassPair!, start_time: newClassStart, end_time: newClassEnd, university_id: universityId }]);
    } finally {
      setCreateClassLoading(false);
    }
  }

  // Admin: create room
  async function handleCreateRoom() {
    if (!universityId) return alert("University id missing");
    if (!newRoomName.trim()) return alert("Введите название аудитории");
    setCreateRoomLoading(true);
    try {
      const payload = { room: newRoomName.trim(), university_id: universityId };
      const res = await api.post("/schedules/rooms", payload);
      if (res?.status === 200 || res?.status === 201) {
        // append returned room or mocked
        const created = res.data ?? { id: Date.now(), room: newRoomName.trim(), university_id: universityId };
        setRooms(prev => [...prev, created]);
        setNewRoomName("");
      } else {
        alert(`Сервер вернул ${res?.status}`);
      }
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.message ?? "Ошибка при создании аудитории (мок)");
      setRooms(prev => [...prev, { id: Date.now(), room: newRoomName.trim(), university_id: universityId }]);
      setNewRoomName("");
    } finally {
      setCreateRoomLoading(false);
    }
  }

  // Admin: create lesson
  async function handleCreateLesson() {
    if (!lessonDay || !lessonClassPair || !lessonRoomId || !lessonSubjectId) return alert("Заполните все поля создания занятия");
    setCreateLessonLoading(true);
    try {
      const payload = {
        class_id: lessonClassPair,
        course_group_subject_id: lessonSubjectId,
        day: lessonDay,
        elective_group_subject_id: 0,
        interval: lessonInterval || "week",
        room_id: lessonRoomId
      };
      const res = await api.post("/schedules/lessons", payload);
      if (res?.status === 200 || res?.status === 201) {
        alert("Занятие создано");
        // optionally refresh schedules from server — here we optimistic: add to local schedules for user
        // Build an lesson-like object
        const classTime = classTimes.find(ct => ct.pair_number === lessonClassPair);
        const newLesson: Lesson = {
          day: lessonDay,
          end_time: classTime?.end_time ?? "",
          interval: lessonInterval,
          lesson_id: res.data?.id ?? Date.now(),
          pair_number: lessonClassPair,
          room: rooms.find(r => r.id === lessonRoomId)?.room ?? "",
          room_id: lessonRoomId,
          start_time: classTime?.start_time ?? "",
          subject_name: `Предмет #${lessonSubjectId}`,
          subject_type: "Лекция",
          teacher_first_name: userName ?? "Преподаватель",
          teacher_last_name: ""
        };
        // attach to schedules[0].schedule
        setSchedules(prev => {
          if (!prev.length) return [{ user_id: userId ?? 0, schedule: [newLesson] }];
          const copy = prev.slice();
          copy[0] = { ...copy[0], schedule: [...copy[0].schedule, newLesson] };
          return copy;
        });
      } else {
        alert(`Сервер вернул ${res?.status}`);
      }
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.message ?? "Ошибка при создании занятия (мок)");
      // optimistic add
      const classTime = classTimes.find(ct => ct.pair_number === lessonClassPair);
      const newLesson: Lesson = {
        day: lessonDay,
        end_time: classTime?.end_time ?? "",
        interval: lessonInterval,
        lesson_id: Date.now(),
        pair_number: lessonClassPair,
        room: rooms.find(r => r.id === lessonRoomId)?.room ?? "",
        room_id: lessonRoomId,
        start_time: classTime?.start_time ?? "",
        subject_name: `Предмет #${lessonSubjectId}`,
        subject_type: "Лекция",
        teacher_first_name: userName ?? "Преподаватель",
        teacher_last_name: ""
      };
      setSchedules(prev => {
        if (!prev.length) return [{ user_id: userId ?? 0, schedule: [newLesson] }];
        const copy = prev.slice();
        copy[0] = { ...copy[0], schedule: [...copy[0].schedule, newLesson] };
        return copy;
      });
    } finally {
      setCreateLessonLoading(false);
    }
  }

  return (
    <div className="schedule-page-root">
      <Flex justify="space-between" align="center" className="schedule-header">
        <Typography.Title variant="large-strong">Расписание</Typography.Title>
        <div>
          <Button mode="tertiary" onClick={() => window.history.back()}>Назад</Button>
          {isAdminMode && <Button style={{ marginLeft: 8 }} mode="primary">Админ</Button>}
        </div>
      </Flex>

      <div className="schedule-meta">
        <Typography.Label className="muted">{userName ? `Пользователь: ${userName}` : "Гость"}</Typography.Label>
        {universityId && <Typography.Label className="muted" style={{ marginLeft: 12 }}>Университет ID: {universityId}</Typography.Label>}
      </div>

      <div className="weeks-container">
        {weeks.map((weekStart, weekIndex) => (
          <div className="week-block" key={weekStart.toISOString()}>
            <div className="week-title">
              <Typography.Title variant="medium-strong">
                Неделя от {formatDateRu(weekStart)}
              </Typography.Title>
            </div>

            {/* days */}
            <Grid cols={1} gap={12}>
              {WEEK_DAYS.map((dayKey, idx) => {
                const date = addDays(weekStart, idx); // date for this day
                const lessons = groupedByDay[dayKey] ?? [];
                return (
                  <Panel key={`${weekIndex}-${dayKey}`} mode="secondary" className="day-panel">
                    <div className="day-header-row">
                      <div>
                        <Typography.Title variant="small-strong">{RU_WEEK_NAMES[dayKey]}</Typography.Title>
                        <Typography.Label className="day-date">{formatDateRu(date)}</Typography.Label>
                      </div>

                      <div className="day-actions">
                        <Typography.Label className="muted">{lessons.length ? `${lessons.length} пар` : "Пар нет"}</Typography.Label>
                      </div>
                    </div>

                    <div className="day-lessons">
                      {lessons.length === 0 ? (
                        <div className="lesson-empty">Занятий нет</div>
                      ) : (
                        lessons.map(lesson => {
                          const ct = classTimes.find(c => c.pair_number === lesson.pair_number);
                          const timeLabel = ct ? `${ct.start_time} — ${ct.end_time}` : `${lesson.start_time ?? ""} — ${lesson.end_time ?? ""}`;
                          return (
                            <div className="lesson-row" key={`${lesson.lesson_id}-${lesson.pair_number}`}>
                              <div className="lesson-time">{timeLabel}</div>
                              <div className="lesson-main">
                                <div className="lesson-title">{lesson.subject_name}</div>
                                <div className="lesson-meta">
                                  <span>{lesson.subject_type ?? ""}</span>
                                  <span>•</span>
                                  <span>{lesson.teacher_first_name} {lesson.teacher_last_name}</span>
                                  <span>•</span>
                                  <span>Аудит.: {lesson.room ?? "—"}</span>
                                </div>
                              </div>
                              <div className="lesson-badge">Пара {lesson.pair_number}</div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </Panel>
                );
              })}
            </Grid>
          </div>
        ))}
        {/* sentinel for infinite scroll */}
        <div ref={sentinelRef} style={{ height: 32 }} aria-hidden />
      </div>

      {/* Admin panel */}
      {isAdminMode && (
        <div className="admin-panel-wrapper">
          <Panel mode="primary" className="admin-panel">
            <Typography.Title variant="medium-strong">Панель администратора — управление расписанием</Typography.Title>

            <Grid cols={3} gap={12} style={{ marginTop: 12 }}>
              <div>
                <Typography.Label>Номер пары</Typography.Label>
                <Input
                  value={newClassPair ?? ""}
                  onChange={(e: any) => setNewClassPair(Number(e.target.value || null))}
                  placeholder="1"
                  type="number"
                />
              </div>

              <div>
                <Typography.Label>Время начала</Typography.Label>
                <Input value={newClassStart} onChange={(e: any) => setNewClassStart(e.target.value)} placeholder="09:00" />
              </div>

              <div>
                <Typography.Label>Время окончания</Typography.Label>
                <Input value={newClassEnd} onChange={(e: any) => setNewClassEnd(e.target.value)} placeholder="10:30" />
              </div>
            </Grid>

            <Flex style={{ marginTop: 10 }} gap={8}>
              <Button mode="tertiary" disabled={createClassLoading} onClick={() => { setNewClassPair(null); setNewClassStart(""); setNewClassEnd(""); }}>Сброс</Button>
              <Button mode="primary" disabled={createClassLoading} onClick={handleCreateClass}>
                {createClassLoading ? "Создаём..." : "Создать время пары"}
              </Button>
            </Flex>

            <hr style={{ margin: "18px 0", border: "none", height: 1, background: "rgba(255,255,255,0.04)" }} />

            <Grid cols={3} gap={12}>
              <div>
                <Typography.Label>Название аудитории</Typography.Label>
                <Input value={newRoomName} onChange={(e: any) => setNewRoomName(e.target.value)} placeholder="101" />
              </div>

              <div style={{ alignSelf: "end" }}>
                <Button mode="primary" disabled={createRoomLoading} onClick={handleCreateRoom}>
                  {createRoomLoading ? "Создаём..." : "Создать аудиторию"}
                </Button>
              </div>
            </Grid>

            <hr style={{ margin: "18px 0", border: "none", height: 1, background: "rgba(255,255,255,0.04)" }} />

            <Grid cols={4} gap={12}>
              <div>
                <Typography.Label>Day</Typography.Label>
                <select
                    className="mp-select"
                    value={lessonDay ?? ""}
                    onChange={(e) => setLessonDay(e.target.value as DayKey)}
                    >
                    <option value="">Выберите день</option>
                    {WEEK_DAYS.map(d => (
                        <option key={d} value={d}>{RU_WEEK_NAMES[d as DayKey]}</option>
                    ))}
                </select>
              </div>

              <div>
                <Typography.Label>Пара (номер)</Typography.Label>
                <select
                    className="mp-select"
                    value={lessonClassPair ?? ""}
                    onChange={(e) => setLessonClassPair(Number(e.target.value))}
                    >
                    <option value="">Выберите пару</option>
                    {classTimes.map(ct => (
                        <option key={ct.pair_number} value={ct.pair_number}>
                        {ct.pair_number} ({ct.start_time}—{ct.end_time})
                        </option>
                    ))}
                </select>

              </div>

              <div>
                <Typography.Label>Аудитория</Typography.Label>
                <select
                    className="mp-select"
                    value={lessonRoomId ?? ""}
                    onChange={(e) => setLessonRoomId(Number(e.target.value))}
                    >
                    <option value="">Выберите аудиторию</option>
                    {rooms.map(r => (
                        <option key={r.id} value={r.id}>{r.room}</option>
                    ))}
                </select>

              </div>

              <div>
                <Typography.Label>Course subject ID</Typography.Label>
                <Input
                  value={lessonSubjectId ?? ""}
                  onChange={(e: any) => setLessonSubjectId(Number(e.target.value || null))}
                  placeholder="course_group_subject_id"
                  type="number"
                />
              </div>
            </Grid>

            <Flex gap={8} style={{ marginTop: 12 }}>
              <Button mode="tertiary" onClick={() => {
                setLessonDay(null); setLessonClassPair(null); setLessonRoomId(null); setLessonSubjectId(null);
              }}>Сброс</Button>
              <Button mode="primary" disabled={createLessonLoading} onClick={handleCreateLesson}>
                {createLessonLoading ? "Создаём..." : "Создать занятие"}
              </Button>
            </Flex>
          </Panel>
        </div>
      )}
    </div>
  );
}
