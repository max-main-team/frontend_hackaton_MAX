/* eslint-disable @typescript-eslint/no-explicit-any */
// components/AdminSchedulePanel.tsx
import { useState, useEffect } from "react";
import {
  Panel,
  Typography,
  Flex,
  Button,
  Input
} from "@maxhub/max-ui";
import type { ClassTime, Room, CreateClassTimeRequest, CreateRoomRequest, CreateLessonRequest } from "../types/schedule.ts";

interface AdminSchedulePanelProps {
  universityId: number;
}

const DAYS_OF_WEEK = [
  { value: 'monday', title: 'Понедельник' },
  { value: 'tuesday', title: 'Вторник' },
  { value: 'wednesday', title: 'Среда' },
  { value: 'thursday', title: 'Четверг' },
  { value: 'friday', title: 'Пятница' },
  { value: 'saturday', title: 'Суббота' },
  { value: 'sunday', title: 'Воскресенье' }
];

export default function AdminSchedulePanel({ universityId }: AdminSchedulePanelProps) {
  const [classTimes, setClassTimes] = useState<ClassTime[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeTab, setActiveTab] = useState<'classes' | 'rooms' | 'lessons'>('classes');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    loadClassTimes();
    loadRooms();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [universityId]);

  const loadClassTimes = async () => {
    const data = await fetchClassTimes(universityId);
    setClassTimes(data);
  };

  const loadRooms = async () => {
    const data = await fetchRooms(universityId);
    setRooms(data);
  };

  const handleCreateClassTime = async () => {
    try {
      await createClassTime({
        pair_number: formData.pair_number,
        start_time: formData.start_time,
        end_time: formData.end_time,
        university_id: universityId
      });
      setShowForm(false);
      setFormData({});
      loadClassTimes();
    } catch (error) {
      console.error('Failed to create class time', error);
    }
  };

  const handleCreateRoom = async () => {
    try {
      await createRoom({
        room: formData.room,
        university_id: universityId
      });
      setShowForm(false);
      setFormData({});
      loadRooms();
    } catch (error) {
      console.error('Failed to create room', error);
    }
  };

  const handleCreateLesson = async () => {
    try {
      await createLesson({
        class_id: formData.class_id,
        day: formData.day,
        interval: formData.interval,
        room_id: formData.room_id,
        course_group_subject_id: formData.course_group_subject_id
      });
      setShowForm(false);
      setFormData({});
    } catch (error) {
      console.error('Failed to create lesson', error);
    }
  };

  const renderClassTimeForm = () => (
    <Panel mode="secondary" className="admin-form-panel">
      <Typography.Title variant="small-strong">Добавление времени пары</Typography.Title>
      <div className="admin-form">
        <Input
          title="Номер пары"
          type="number"
          value={formData.pair_number || ''}
          onChange={(e) => setFormData({...formData, pair_number: parseInt(e.target.value)})}
        />
        <Input
          title="Время начала (HH:MM)"
          value={formData.start_time || ''}
          onChange={(e) => setFormData({...formData, start_time: e.target.value})}
          placeholder="09:00"
        />
        <Input
          title="Время окончания (HH:MM)"
          value={formData.end_time || ''}
          onChange={(e) => setFormData({...formData, end_time: e.target.value})}
          placeholder="10:30"
        />
      </div>
      <Flex gap={8} justify="end" style={{ marginTop: 16 }}>
        <Button mode="tertiary" onClick={() => setShowForm(false)}>
          Отмена
        </Button>
        <Button mode="primary" onClick={handleCreateClassTime}>
          Создать
        </Button>
      </Flex>
    </Panel>
  );

  const renderRoomForm = () => (
    <Panel mode="secondary" className="admin-form-panel">
      <Typography.Title variant="small-strong">Добавление аудитории</Typography.Title>
      <div className="admin-form">
        <Input
          title="Номер аудитории"
          value={formData.room || ''}
          onChange={(e) => setFormData({...formData, room: e.target.value})}
          placeholder="А-101"
        />
      </div>
      <Flex gap={8} justify="end" style={{ marginTop: 16 }}>
        <Button mode="tertiary" onClick={() => setShowForm(false)}>
          Отмена
        </Button>
        <Button mode="primary" onClick={handleCreateRoom}>
          Создать
        </Button>
      </Flex>
    </Panel>
  );

  const renderLessonForm = () => (
    <Panel mode="secondary" className="admin-form-panel">
      <Typography.Title variant="small-strong">Добавление занятия</Typography.Title>
      <div className="admin-form">
        {/* Выбор времени пары через кнопки */}
        <Typography.Label>Выберите время пары:</Typography.Label>
        <Flex gap={8} wrap="wrap" style={{ marginBottom: 16 }}>
          {classTimes.map(ct => (
            <Button
              key={ct.id}
              mode={formData.class_id === ct.id ? 'primary' : 'tertiary'}
              size="small"
              onClick={() => setFormData({...formData, class_id: ct.id})}
            >
              Пара {ct.pair_number} ({ct.start_time}-{ct.end_time})
            </Button>
          ))}
        </Flex>

        {/* Выбор дня недели через кнопки */}
        <Typography.Label>Выберите день недели:</Typography.Label>
        <Flex gap={8} wrap="wrap" style={{ marginBottom: 16 }}>
          {DAYS_OF_WEEK.map(day => (
            <Button
              key={day.value}
              mode={formData.day === day.value ? 'primary' : 'tertiary'}
              size="small"
              onClick={() => setFormData({...formData, day: day.value})}
            >
              {day.title}
            </Button>
          ))}
        </Flex>

        {/* Выбор аудитории через кнопки */}
        <Typography.Label>Выберите аудиторию:</Typography.Label>
        <Flex gap={8} wrap="wrap" style={{ marginBottom: 16 }}>
          {rooms.map(room => (
            <Button
              key={room.id}
              mode={formData.room_id === room.id ? 'primary' : 'tertiary'}
              size="small"
              onClick={() => setFormData({...formData, room_id: room.id})}
            >
              {room.room}
            </Button>
          ))}
        </Flex>

        <Input
          title="ID предмета группы"
          type="number"
          value={formData.course_group_subject_id || ''}
          onChange={(e) => setFormData({...formData, course_group_subject_id: parseInt(e.target.value)})}
        />
        <Input
          title="Интервал"
          value={formData.interval || ''}
          onChange={(e) => setFormData({...formData, interval: e.target.value})}
          placeholder="weekly"
        />
      </div>
      <Flex gap={8} justify="end" style={{ marginTop: 16 }}>
        <Button mode="tertiary" onClick={() => setShowForm(false)}>
          Отмена
        </Button>
        <Button mode="primary" onClick={handleCreateLesson}>
          Создать
        </Button>
      </Flex>
    </Panel>
  );

  const renderForm = () => {
    if (!showForm) return null;

    switch (activeTab) {
      case 'classes': return renderClassTimeForm();
      case 'rooms': return renderRoomForm();
      case 'lessons': return renderLessonForm();
      default: return null;
    }
  };

  const handleAddClick = () => {
    setFormData({});
    setShowForm(true);
  };

  return (
    <div className="admin-panel">
      <Typography.Title variant="medium-strong">Панель администратора</Typography.Title>
      
      {/* Табы */}
      <Flex gap={8} style={{ marginBottom: 16 }}>
        <Button
          mode={activeTab === 'classes' ? 'primary' : 'tertiary'}
          size="small"
          onClick={() => {
            setActiveTab('classes');
            setShowForm(false);
          }}
        >
          Время пар
        </Button>
        <Button
          mode={activeTab === 'rooms' ? 'primary' : 'tertiary'}
          size="small"
          onClick={() => {
            setActiveTab('rooms');
            setShowForm(false);
          }}
        >
          Аудитории
        </Button>
        <Button
          mode={activeTab === 'lessons' ? 'primary' : 'tertiary'}
          size="small"
          onClick={() => {
            setActiveTab('lessons');
            setShowForm(false);
          }}
        >
          Занятия
        </Button>
      </Flex>

      {/* Списки существующих данных */}
      <Panel mode="secondary" className="admin-list">
        {activeTab === 'classes' && (
          <div>
            <Typography.Title variant="small-strong">Существующее время пар</Typography.Title>
            {classTimes.map(ct => (
              <div key={ct.id} className="admin-list-item">
                <Typography.Label>Пара {ct.pair_number}: {ct.start_time} - {ct.end_time}</Typography.Label>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'rooms' && (
          <div>
            <Typography.Title variant="small-strong">Существующие аудитории</Typography.Title>
            {rooms.map(room => (
              <div key={room.id} className="admin-list-item">
                <Typography.Label>{room.room}</Typography.Label>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'lessons' && (
          <div>
            <Typography.Title variant="small-strong">Инструкция</Typography.Title>
            <Typography.Label>
              Для создания занятия выберите время пары, день недели и аудиторию из доступных вариантов
            </Typography.Label>
          </div>
        )}
      </Panel>

      {/* Кнопка добавления */}
      {!showForm && (
        <Button mode="primary" onClick={handleAddClick} style={{ marginTop: 16 }}>
          Добавить {getButtonText(activeTab)}
        </Button>
      )}

      {/* Форма создания */}
      {renderForm()}
    </div>
  );
}

const getButtonText = (tab: string) => {
  switch (tab) {
    case 'classes': return 'время пары';
    case 'rooms': return 'аудиторию';
    case 'lessons': return 'занятие';
    default: return '';
  }
};

// Заглушки для API
const fetchClassTimes = async (universityId: number): Promise<ClassTime[]> => {
  return [
    { id: 1, pair_number: 1, start_time: "09:00", end_time: "10:30", university_id: universityId },
    { id: 2, pair_number: 2, start_time: "10:45", end_time: "12:00", university_id: universityId },
    { id: 3, pair_number: 3, start_time: "12:45", end_time: "14:15", university_id: universityId },
    { id: 4, pair_number: 4, start_time: "14:30", end_time: "16:00", university_id: universityId }
  ];
};

const fetchRooms = async (universityId: number): Promise<Room[]> => {
  return [
    { id: 1, room: "А-101", university_id: universityId },
    { id: 2, room: "Б-205", university_id: universityId },
    { id: 3, room: "В-301", university_id: universityId },
    { id: 4, room: "Г-102", university_id: universityId }
  ];
};

const createClassTime = async (data: CreateClassTimeRequest): Promise<ClassTime> => {
  console.log('Creating class time:', data);
  return { ...data, id: Date.now() };
};

const createRoom = async (data: CreateRoomRequest): Promise<Room> => {
  console.log('Creating room:', data);
  return { ...data, id: Date.now() };
};

const createLesson = async (data: CreateLessonRequest): Promise<any> => {
  console.log('Creating lesson:', data);
  return { ...data, id: Date.now() };
};