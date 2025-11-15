import { useEffect, useState, type JSX } from "react";
import {
  Container,
  Panel,
  Typography,
  Grid,
  Flex,
} from "@maxhub/max-ui";
import MainLayout from "../layouts/MainLayout";
import "../css/GradeBookPage.css";

interface Subject {
  id: number;
  name: string;
  score: number | null; 
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
        {/* Заголовок страницы */}
        <div className="gradebook-header">
          <Typography.Title variant="large-strong" className="page-title">
            Зачетка
          </Typography.Title>
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
                const pct = s.score == null ? 0 : Math.max(0, Math.min(100, s.score));
                return (
                  <Panel key={s.id} mode="secondary" className="subject-card" aria-label={`${s.name} — ${s.score ?? "—"}`}>
                    <Flex justify="space-between" align="center" style={{ width: "100%" }}>
                      <div className="subject-info">
                        <Typography.Title variant="small-strong" className="subject-name" title={s.name}>
                          {s.name}
                        </Typography.Title>
                        <Typography.Label className="subject-sub">Оценка</Typography.Label>
                      </div>

                      <div className="subject-right">
                        <div className="score-bubble" aria-hidden>
                          {s.score == null ? "—" : Math.round(s.score)}
                        </div>

                        <div className="score-bar" aria-hidden>
                          <div
                            className="score-fill"
                            style={{ width: `${pct}%` }}
                          />
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
