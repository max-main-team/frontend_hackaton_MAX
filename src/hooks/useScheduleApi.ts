/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useScheduleApi.ts
import { useState, useEffect } from 'react';
import type {
    User,
    University,
    ClassTime,
    Room,
    ScheduleResponse,
    CreateClassTimeRequest,
    CreateRoomRequest,
    CreateLessonRequest
} from '../types/schedule.ts';

const API_BASE = 'https://msokovykh.ru';

export const useScheduleApi = () => {
  const [user, setUser] = useState<User | null>(null);
  const [university, setUniversity] = useState<University | null>(null);
  const [loading, setLoading] = useState(true);

  // Получение информации о пользователе
  useEffect(() => {
    let mounted = true;
    
    const fetchUserData = async () => {
      try {
        const res = await fetch(`${API_BASE}/user/me`);
        const data = await res.json();
        const u = data?.user;
        
        if (!mounted) return;
        
        if (u) {
          setUser(u);
          // Получаем информацию об университете
          if (u.university_id) {
            await fetchUniversity(u.university_id);
          }
        }
      } catch (error) {
        console.error('Failed to load user info', error);
        // Моковые данные для демонстрации
        setUser({
          id: 1,
          first_name: 'Иван',
          last_name: 'Петров',
          university_id: 123456789,
          role: 'student'
        });
        setUniversity({
          id: 123456789,
          uni_name: 'ITMO University',
          uni_short_name: 'ITMO',
          city: 'Saint-Petersburg',
          description: 'One of the leading Russian universities',
          photo_url: 'https://itmo.ru/images/itmo.jpg',
          site_url: 'https://itmo.ru'
        });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const fetchUniversity = async (universityId: number) => {
      try {
        const res = await fetch(`${API_BASE}/universities/info?university_id=${universityId}`);
        const data = await res.json();
        if (!mounted) return;
        setUniversity(data);
      } catch (error) {
        console.error('Failed to load university info', error);
      }
    };

    fetchUserData();

    return () => { mounted = false; };
  }, []);

  // Получение расписания пользователя
  const fetchUserSchedule = async (userId: number): Promise<ScheduleResponse[]> => {
    try {
      const res = await fetch(`${API_BASE}/schedules/users/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch schedule');
      return await res.json();
    } catch (error) {
      console.error('Failed to fetch schedule', error);
      // Моковые данные
      return [getMockSchedule(userId)];
    }
  };

  // Получение времени пар
  const fetchClassTimes = async (universityId: number): Promise<ClassTime[]> => {
    try {
      const res = await fetch(`${API_BASE}/schedules/classes?university_id=${universityId}`);
      if (!res.ok) throw new Error('Failed to fetch class times');
      return await res.json();
    } catch (error) {
      console.error('Failed to fetch class times', error);
      return getMockClassTimes(universityId);
    }
  };

  // Получение аудиторий
  const fetchRooms = async (universityId: number): Promise<Room[]> => {
    try {
      const res = await fetch(`${API_BASE}/schedules/rooms?university_id=${universityId}`);
      if (!res.ok) throw new Error('Failed to fetch rooms');
      return await res.json();
    } catch (error) {
      console.error('Failed to fetch rooms', error);
      return getMockRooms(universityId);
    }
  };

  // Создание времени пар (админ)
  const createClassTime = async (data: CreateClassTimeRequest): Promise<ClassTime> => {
    const res = await fetch(`${API_BASE}/schedules/classes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create class time');
    return await res.json();
  };

  // Создание аудитории (админ)
  const createRoom = async (data: CreateRoomRequest): Promise<Room> => {
    const res = await fetch(`${API_BASE}/schedules/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create room');
    return await res.json();
  };

  // Создание занятия (админ)
  const createLesson = async (data: CreateLessonRequest): Promise<any> => {
    const res = await fetch(`${API_BASE}/schedules/lessons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create lesson');
    return await res.json();
  };

  return {
    user,
    university,
    loading,
    fetchUserSchedule,
    fetchClassTimes,
    fetchRooms,
    createClassTime,
    createRoom,
    createLesson
  };
};

// Моковые данные для демонстрации
const getMockSchedule = (userId: number): ScheduleResponse => ({
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

const getMockClassTimes = (universityId: number): ClassTime[] => [
  { id: 1, pair_number: 1, start_time: "09:00", end_time: "10:30", university_id: universityId },
  { id: 2, pair_number: 2, start_time: "10:45", end_time: "12:00", university_id: universityId },
  { id: 3, pair_number: 3, start_time: "12:45", end_time: "14:15", university_id: universityId },
  { id: 4, pair_number: 4, start_time: "14:30", end_time: "16:00", university_id: universityId },
  { id: 5, pair_number: 5, start_time: "16:15", end_time: "17:45", university_id: universityId }
];

const getMockRooms = (universityId: number): Room[] => [
  { id: 1, room: "А-101", university_id: universityId },
  { id: 2, room: "Б-205", university_id: universityId },
  { id: 3, room: "В-301", university_id: universityId },
  { id: 4, room: "Г-102", university_id: universityId }
];