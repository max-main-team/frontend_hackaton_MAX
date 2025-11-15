// types/schedule.ts
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  university_id?: number;
  role?: 'student' | 'teacher' | 'admin';
}

export interface University {
  id: number;
  uni_name: string;
  uni_short_name: string;
  city: string;
  description: string;
  photo_url: string;
  site_url: string;
}

export interface ClassTime {
  id: number;
  pair_number: number;
  start_time: string;
  end_time: string;
  university_id: number;
}

export interface Room {
  id: number;
  room: string;
  university_id: number;
}

export interface ScheduleLesson {
  day: string;
  end_time: string;
  interval: string;
  lesson_id: number;
  pair_number: number;
  room: string;
  room_id: number;
  start_time: string;
  subject_name: string;
  subject_type: string;
  teacher_first_name: string;
  teacher_id: number;
  teacher_last_name: string;
}

export interface ScheduleResponse {
  schedule: ScheduleLesson[];
  user_id: number;
}

export interface CreateClassTimeRequest {
  pair_number: number;
  start_time: string;
  end_time: string;
  university_id: number;
}

export interface CreateRoomRequest {
  room: string;
  university_id: number;
}

export interface CreateLessonRequest {
  class_id: number;
  course_group_subject_id?: number;
  elective_group_subject_id?: number;
  day: string;
  interval: string;
  room_id: number;
}