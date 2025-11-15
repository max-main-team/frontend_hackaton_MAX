import { useState, useEffect } from "react";
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
  type: "exam" | "credit";
  status: "completed" | "planned";
}

export default function GradeBookPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setSubjects([
        {
          id: 1,
          name: "English B1.2 / Английский язык B1.2",
          type: "credit",
          status: "completed"
        },
        {
          id: 2,
          name: "Базы данных",
          type: "exam",
          status: "completed"
        },
        {
          id: 3,
          name: "Безопасность жизнедеятельности",
          type: "credit",
          status: "completed"
        },
        {
          id: 4,
          name: "Дополнительные главы высшей математики",
          type: "exam",
          status: "completed"
        },
        {
          id: 5,
          name: "История российской науки и техники",
          type: "credit",
          status: "completed"
        },
        {
          id: 6,
          name: "Объектно-ориентированное проектирование и программирование на C#",
          type: "exam",
          status: "completed"
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getTypeColor = (type: "exam" | "credit") => {
    return type === "exam" ? "var(--accent, #630eff)" : "var(--accent-2, #3a89fb)";
  };

  const getTypeText = (type: "exam" | "credit") => {
    return type === "exam" ? "Экзамен" : "Зачёт";
  };

  const getStatusText = (status: "completed" | "planned") => {
    return status === "completed" ? "Зачёт" : "Запланирован";
  };

  if (loading) {
    return (
      <MainLayout>
        <Container className="gradebook-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <Typography.Label>Загрузка данных...</Typography.Label>
          </div>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container className="gradebook-container">
        {/* Хедер страницы */}
        <div className="gradebook-header">
          <Flex justify="space-between" align="flex-start">
            <div>
              <Typography.Title variant="large-strong" className="page-title">
                Зачётка
              </Typography.Title>
            </div>
            
            {/* Навигация */}
            <Flex gap={24} className="navigation">
              <Button mode="tertiary" size="small">Расписание</Button>
              <Button mode="tertiary" size="small">Актуальное</Button>
              <Button mode="tertiary" size="small">Сервисы</Button>
            </Flex>
          </Flex>
        </div>

        {/* Сетка предметов */}
        <Grid cols={1} gap={12} className="subjects-grid">
          {subjects.map(subject => (
            <Panel key={subject.id} mode="secondary" className="subject-card">
              <Flex justify="space-between" align="center" style={{ width: "100%" }}>
                {/* Левая часть - название предмета */}
                <div className="subject-info">
                  <Typography.Title variant="small-strong" className="subject-name">
                    {subject.name}
                  </Typography.Title>
                </div>

                {/* Правая часть - тип и статус */}
                <Flex align="center" gap={16}>
                  <div 
                    className="subject-type-badge"
                    style={{ 
                      backgroundColor: getTypeColor(subject.type)
                    }}
                  >
                    {getTypeText(subject.type)}
                  </div>
                  <div className="status-display">
                    <Typography.Title variant="small-strong" className="status-text">
                      {getStatusText(subject.status)}
                    </Typography.Title>
                  </div>
                </Flex>
              </Flex>
            </Panel>
          ))}
        </Grid>
      </Container>
    </MainLayout>
  );
}