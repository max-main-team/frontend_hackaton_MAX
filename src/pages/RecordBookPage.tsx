import { useEffect, useState, type JSX } from "react";
import {
  Container,
  Panel,
  Typography,
  Grid,
  Flex,
  Button,
} from "@maxhub/max-ui";
import MainLayout from "../layouts/MainLayout";
import "../css/GradeBookPage.css";

interface Subject {
  id: number;
  name: string;
  score: number | null; 
}

/* Небольшой компонент SVG круговой диаграммы */
function CircularProgress({ value, size = 72, strokeWidth = 8, idSuffix = "" }: { value: number | null; size?: number; strokeWidth?: number; idSuffix?: string | number; }) {
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

      {/* фон круга */}
      <circle
        className="circular-bg"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        fill="none"
      />

      {/* прогресс */}
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

      {/* текст внутри */}
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="circular-text">
        {value == null ? "—" : Math.round(value)}
      </text>
    </svg>
  );
}

export default function GradeBookPage(): JSX.Element {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGrades() {
      try {
        const resp = await fetch("/grades");
        if (!resp.ok) throw new Error("no api");
        const data = (await resp.json()) as Subject[];
        if (Array.isArray(data)) {
          setSubjects(data.map(s => ({ id: s.id, name: s.name, score: s.score ?? null })));
        } else {
          throw new Error("unexpected data");
        }
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
  }, []);

  return (
    <MainLayout>
      <Container className="gradebook-container">
        {/* Заголовок страницы + кнопка назад справа */}
        <div className="gradebook-header">
          <Typography.Title variant="large-strong" className="page-title">
            Зачетка
          </Typography.Title>

          <div className="header-actions">
            <Button mode="secondary" size="small" onClick={() => window.history.back()} className="back-btn">
              Назад
            </Button>
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
                          <CircularProgress value={s.score} size={72} strokeWidth={8} idSuffix={s.id} />
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
