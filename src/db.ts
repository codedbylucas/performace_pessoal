import Dexie, { type Table } from 'dexie';

export interface UserProfile {
  id?: number;
  server_id?: string;
  name: string;
  email?: string;
  age: number;
  height: number;
  weight: number;
  goal: 'cut' | 'bulk' | 'maintain' | 'performance';
  deadline?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  training_days_week: number;
  equipment: string;
  routine_daily: string;
  dietary_restrictions: string;
  study_goal_weekly: number;
  schedules: string;
  calories_goal: number;
  protein_goal: number;
  training_goal: number;
  study_minutes_goal: number;
  tasks_goal: number;
  pin?: string;
  isLoggedIn: boolean;
  onboarding_completed: boolean;
  last_synced?: number;
}

export interface DailyLog {
  id?: number;
  server_id?: string;
  date: string; // YYYY-MM-DD
  score: number;
  status: 'green' | 'yellow' | 'red';
  calories_consumed: number;
  protein_consumed: number;
  carbs_consumed: number;
  fats_consumed: number;
  fiber_consumed: number;
  water_liters: number;
  fruit_portions: number;
  veg_portions: number;
  ultraprocessed_count: number;
  training_completed: number;
  training_volume: number;
  study_minutes: number;
  tasks_completed: number;
  tasks_total: number;
  last_synced?: number;
}

export interface Meal {
  id?: number;
  server_id?: string;
  date: string;
  name: string;
  raw_text: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  is_quality: boolean;
  last_synced?: number;
}

export interface Workout {
  id?: number;
  server_id?: string;
  date: string;
  exercise_id: number;
  sets: number;
  reps: number;
  weight: number;
  rpe?: number;
  is_pr: boolean;
  last_synced?: number;
}

export interface Exercise {
  id?: number;
  server_id?: string;
  name: string;
  muscle_group: string;
  secondary_muscle?: string;
  type: 'compound' | 'isolation';
  equipment: string;
  level: string;
  last_synced?: number;
}

export interface StudySession {
  id?: number;
  server_id?: string;
  date: string;
  subject: string;
  type: 'reading' | 'practice' | 'review';
  duration: number;
  evaluation: number; // 1-5
  result?: string; // link or grade
  last_synced?: number;
}

export interface Task {
  id?: number;
  server_id?: string;
  date: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'postponed';
  duration_est: number;
  last_synced?: number;
}

export class PerformanceDB extends Dexie {
  users!: Table<UserProfile>;
  dailyLogs!: Table<DailyLog>;
  meals!: Table<Meal>;
  workouts!: Table<Workout>;
  exercises!: Table<Exercise>;
  studySessions!: Table<StudySession>;
  tasks!: Table<Task>;

  constructor() {
    super('PerformanceDB');
    this.version(3).stores({
      users: '++id, server_id, name, email',
      dailyLogs: '++id, server_id, date, last_synced',
      meals: '++id, server_id, date, last_synced',
      workouts: '++id, server_id, date, exercise_id, last_synced',
      exercises: '++id, server_id, name, muscle_group, last_synced',
      studySessions: '++id, server_id, date, last_synced',
      tasks: '++id, server_id, date, status, last_synced'
    });
  }
}

export const db = new PerformanceDB();
