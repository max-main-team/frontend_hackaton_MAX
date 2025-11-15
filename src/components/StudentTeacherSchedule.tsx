// components/StudentTeacherSchedule.tsx
import { useState, useEffect } from "react";
import {
  Container,
  Panel,
  Typography,
  Flex,
  Avatar,
  Button
} from "@maxhub/max-ui";
import type { ScheduleLesson, ClassTime } from "../types/schedule.ts";
import "../css/SchedulePage.css";

interface StudentTeacherScheduleProps {
  userId: number;
  universityId: number;
  userRole: 'student' | 'teacher';
}

const DAYS_OF_WEEK = [
  { key: 'monday', name: 'Понедельник', short: 'ПН' },
  { key: 'tuesday', name: 'Вторник', short: 'ВТ' },
  { key: 'wednesday', name: 'Среда', short: 'СР' },
  { key: 'thursday', name: 'Четверг', short: 'ЧТ' },
  { key: 'friday', name: 'Пятница', short: 'ПТ' },
  { key: 'saturday', name: 'Суббота', short: 'СБ' },
  { key: 'sunday', name: 'Воскресенье', short: 'ВС' }
];

export default function StudentTeacherSchedule({ 
  userId, 
  universityId, 
  userRole 
}: StudentTeacherScheduleProps) {
  const [schedule, setSchedule] = useState<ScheduleLesson[]>([]);
  const [classTimes, setClassTimes] = useState<ClassTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Здесь должен быть вызов useScheduleApi, но для простоты используем моки
        const mockSchedule = await fetchUserSchedule(userId);
        const mockClassTimes = await fetchClassTimes(universityId);
        
        setSchedule(mockSchedule[0]?.schedule || []);
        setClassTimes(mockClassTimes);
      } catch (error) {
        console.error('Failed to load schedule data', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId, universityId]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getLessonsForDay = (dayKey: string, _weekOffset: number = 0) => {
    return schedule.filter(lesson => lesson.day === dayKey);
  };

  const getWeekDates = (weekOffset: number) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + (weekOffset * 7)); // Понедельник
    
    return DAYS_OF_WEEK.map((_, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      return date;
    });
  };

  const formatDate = (date: Date) => {
    return date.getDate().toString().padStart(2, '0');
  };

  const getSubjectTypeColor = (type: string) => {
    switch (type) {
      case 'lecture': return 'var(--accent, #630eff)';
      case 'practice': return 'var(--accent-2, #3a89fb)';
      case 'lab': return 'var(--accent-success, #10b981)';
      default: return 'var(--maxui-text-tertiary, #6b7280)';
    }
  };

  const getSubjectTypeText = (type: string) => {
    switch (type) {
      case 'lecture': return 'Лекция';
      case 'practice': return 'Практика';
      case 'lab': return 'Лабораторная';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="schedule-loading">
        <div className="loading-spinner"></div>
        <Typography.Label>Загрузка расписания...</Typography.Label>
      </div>
    );
  }

  const weekDates = getWeekDates(currentWeekOffset);

  return (
    <Container className="schedule-container">
      {/* Заголовок и навигация по неделям */}
      <div className="schedule-header">
        <Flex justify="space-between" align="center">
          <div>
            <Typography.Title variant="large-strong" className="schedule-title">
              Расписание
            </Typography.Title>
            <Typography.Label className="schedule-subtitle">
              {userRole === 'student' ? 'Ваше расписание занятий' : 'Ваше расписание преподавания'}
            </Typography.Label>
          </div>
          
          <Flex gap={12} align="center">
            <Button
              mode="tertiary"
              size="small"
              onClick={() => setCurrentWeekOffset(prev => prev - 1)}
            >
              Предыдущая неделя
            </Button>
            <Typography.Label className="current-week">
              Неделя {currentWeekOffset + 1}
            </Typography.Label>
            <Button
              mode="tertiary"
              size="small"
              onClick={() => setCurrentWeekOffset(prev => prev + 1)}
            >
              Следующая неделя
            </Button>
          </Flex>
        </Flex>
      </div>

      {/* Сетка расписания */}
      <div className="schedule-grid">
        {/* Заголовки дней */}
        <div className="schedule-days-header">
          <div className="time-header"></div>
          {DAYS_OF_WEEK.map((day, index) => (
            <Panel key={day.key} mode="secondary" className="day-header">
              <Typography.Title variant="small-strong" className="day-name">
                {day.name}
              </Typography.Title>
              <Typography.Label className="day-date">
                {formatDate(weekDates[index])}
              </Typography.Label>
            </Panel>
          ))}
        </div>

        {/* Временные слоты */}
        {classTimes.map(classTime => (
          <div key={classTime.id} className="schedule-row">
            {/* Время пары */}
            <Panel mode="secondary" className="time-slot">
              <Typography.Title variant="small-strong" className="pair-number">
                {classTime.pair_number}
              </Typography.Title>
              <Typography.Label className="time-range">
                {classTime.start_time} - {classTime.end_time}
              </Typography.Label>
            </Panel>

            {/* Занятия по дням */}
            {DAYS_OF_WEEK.map(day => {
              const lessons = getLessonsForDay(day.key, currentWeekOffset)
                .filter(lesson => lesson.pair_number === classTime.pair_number);
              
              return (
                <div key={day.key} className="day-slot">
                  {lessons.map(lesson => (
                    <Panel
                      key={lesson.lesson_id}
                      mode="primary"
                      className="lesson-card"
                      style={{ 
                        borderLeft: `4px solid ${getSubjectTypeColor(lesson.subject_type)}` 
                      }}
                    >
                      <div className="lesson-header">
                        <Typography.Title variant="small-strong" className="subject-name">
                          {lesson.subject_name}
                        </Typography.Title>
                        <div 
                          className="subject-type-badge"
                          style={{ backgroundColor: getSubjectTypeColor(lesson.subject_type) }}
                        >
                          {getSubjectTypeText(lesson.subject_type)}
                        </div>
                      </div>
                      
                      <Flex align="center" gap={8} className="teacher-info">
                        <Avatar.Container size={24} form="circle">
                          <Avatar.Text>
                            {lesson.teacher_first_name[0]}{lesson.teacher_last_name[0]}
                          </Avatar.Text>
                        </Avatar.Container>
                        <Typography.Label className="teacher-name">
                          {lesson.teacher_first_name} {lesson.teacher_last_name}
                        </Typography.Label>
                      </Flex>
                      
                      <Flex justify="space-between" align="center" className="lesson-footer">
                        <Typography.Label className="room-number">
                          {lesson.room}
                        </Typography.Label>
                        <Typography.Label className="lesson-time">
                          {lesson.start_time} - {lesson.end_time}
                        </Typography.Label>
                      </Flex>
                    </Panel>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Легенда */}
      <Panel mode="secondary" className="schedule-legend">
        <Flex gap={16} wrap="wrap">
          <Flex align="center" gap={8}>
            <div className="legend-color" style={{ backgroundColor: 'var(--accent, #630eff)' }}></div>
            <Typography.Label>Лекции</Typography.Label>
          </Flex>
          <Flex align="center" gap={8}>
            <div className="legend-color" style={{ backgroundColor: 'var(--accent-2, #3a89fb)' }}></div>
            <Typography.Label>Практики</Typography.Label>
          </Flex>
          <Flex align="center" gap={8}>
            <div className="legend-color" style={{ backgroundColor: 'var(--accent-success, #10b981)' }}></div>
            <Typography.Label>Лабораторные</Typography.Label>
          </Flex>
        </Flex>
      </Panel>
    </Container>
  );
}

// Заглушки для API вызовов
const fetchUserSchedule = async (userId: number) => {
  return [getMockSchedule(userId)];
};

const fetchClassTimes = async (universityId: number) => {
  return getMockClassTimes(universityId);
};

const getMockSchedule = (userId: number) => ({
  user_id: userId,
  schedule: [
    {
      day: "monday",
      end_time: "10:30",
      interval: "weekly",
      lesson_id: 1,
      pair_number: 1,
      room: "А-101",
      room_id: 1,
      start_time: "09:00",
      subject_name: "Математический анализ",
      subject_type: "lecture",
      teacher_first_name: "Анна",
      teacher_id: 1,
      teacher_last_name: "Иванова"
    },
    {
      day: "monday",
      end_time: "12:00",
      interval: "weekly",
      lesson_id: 2,
      pair_number: 2,
      room: "Б-205",
      room_id: 2,
      start_time: "10:45",
      subject_name: "Программирование на C++",
      subject_type: "practice",
      teacher_first_name: "Петр",
      teacher_id: 2,
      teacher_last_name: "Сидоров"
    },
    {
      day: "tuesday",
      end_time: "10:30",
      interval: "weekly",
      lesson_id: 3,
      pair_number: 1,
      room: "В-301",
      room_id: 3,
      start_time: "09:00",
      subject_name: "Базы данных",
      subject_type: "lecture",
      teacher_first_name: "Мария",
      teacher_id: 3,
      teacher_last_name: "Петрова"
    }
  ]
});

const getMockClassTimes = (universityId: number) => [
  { id: 1, pair_number: 1, start_time: "09:00", end_time: "10:30", university_id: universityId },
  { id: 2, pair_number: 2, start_time: "10:45", end_time: "12:00", university_id: universityId },
  { id: 3, pair_number: 3, start_time: "12:45", end_time: "14:15", university_id: universityId },
  { id: 4, pair_number: 4, start_time: "14:30", end_time: "16:00", university_id: universityId }
];