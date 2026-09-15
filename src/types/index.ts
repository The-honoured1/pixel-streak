export type PaletteKey = 
  | 'emerald' 
  | 'cyberpunk' 
  | 'sunset' 
  | 'ocean' 
  | 'amethyst' 
  | 'ruby' 
  | 'monochrome';

export interface Palette {
  id: PaletteKey;
  name: string;
  levels: [string, string, string, string, string]; // [Level 0 (empty), Level 1, Level 2, Level 3, Level 4]
  accent: string;
}

export type FrequencyType = 'daily' | 'weekdays' | 'weekends' | 'custom';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon: string;
  palette: PaletteKey;
  frequency: FrequencyType;
  customDays?: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  category?: string;
  createdAt: string; // ISO date
  archived: boolean;
  order: number;
  records: Record<string, number>; // date "YYYY-MM-DD" -> level (0 to 4)
  freezeDays?: Record<string, true>; // date "YYYY-MM-DD" -> excused (streak freeze)
  reminderEnabled?: boolean;
  reminderHour?: number; // 0–23
  reminderMinute?: number; // 0–59
  reminderNotificationId?: string; // identifier returned by expo-notifications
}

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number; // 0 to 100
  lastCompletedDate?: string;
}

export interface DayActivity {
  date: string; // YYYY-MM-DD
  level: number; // 0 to 4
  count: number; // number of habits completed
  totalHabits: number;
}

export type ViewSpan = '30days' | '90days' | '180days' | 'year';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  unlocked: boolean;
}
