export type Category = 'general' | 'surah' | 'ayah' | 'dua' | 'azkar' | 'names99' | 'salawat' | 'kalimat';
export type GoalType = 'recite' | 'learn';
export type PrayerSegment = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' | 'none';
export type EventType = 'tap' | 'bulk' | 'repeat' | 'learn_mark' | 'goal_completed' | 'auto_reset';
export type GoalStatus = 'active' | 'completed' | 'archived' | 'paused';
export type BadgeLevel = 'copper' | 'silver' | 'gold';
export type TranscriptionType = 'latin' | 'cyrillic';

export type HabitCategory = 'namaz' | 'quran' | 'dhikr' | 'sadaqa' | 'knowledge' | 'fasting' | 'etiquette';
export type HabitDifficulty = 'easy' | 'medium' | 'advanced';
export type RepeatType = 'never' | 'daily' | 'weekly' | 'monthly' | 'custom';
export type WeekDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type ItemType = 'task' | 'habit' | 'event' | 'reminder';

export interface DhikrItem {
  id: string;
  category: Category;
  slug: string;
  titleAr: string;
  titleRu: string;
  titleEn: string;
  transcriptionLatin?: string;
  transcriptionCyrillic?: string;
  translation?: string;
  audioUrl?: string;
  meta?: {
    surahNumber?: number;
    ayahNumber?: number;
    ayahCount?: number;
    text?: string;
  };
}

export interface Goal {
  id: string;
  userId: string;
  category: Category;
  itemId?: string;
  item?: DhikrItem;
  goalType: GoalType;
  title: string;
  targetCount: number;
  currentProgress: number;
  status: GoalStatus;
  startDate: string;
  endDate?: string;
  linkedCounterType?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Session {
  id: string;
  userId: string;
  goalId?: string;
  prayerSegment: PrayerSegment;
  startedAt: string;
  endedAt?: string;
}

export interface DhikrLog {
  id: string;
  userId: string;
  sessionId: string;
  goalId?: string;
  category: Category;
  itemId?: string;
  eventType: EventType;
  delta: number;
  valueAfter: number;
  prayerSegment: PrayerSegment;
  atTs: string;
  tz: string;
  offlineId: string;
}

export interface DailyAzkar {
  userId: string;
  dateLocal: string;
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
  total: number;
  isComplete: boolean;
}

export interface Badge {
  id: string;
  type: string;
  title: string;
  description: string;
  level: BadgeLevel;
  icon: string;
  achievedAt?: string;
  isUnlocked: boolean;
  progress?: number;
  target?: number;
}

export interface Streak {
  type: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
}

export interface UserStats {
  totalDhikrCount: number;
  goalsCompleted: number;
  currentStreak: number;
  todayCount: number;
}

export interface Reminder {
  id: string;
  time: string;
  enabled: boolean;
  sound?: string;
}

export interface Habit {
  id: string;
  userId: string;
  templateId?: string;
  category: HabitCategory;
  title: string;
  description?: string;
  iconName: string;
  difficulty: HabitDifficulty;
  repeatType: RepeatType;
  repeatDays?: WeekDay[];
  repeatDates?: number[];
  startDate?: string;
  endDate?: string;
  time?: string;
  endTime?: string;
  isAllDay: boolean;
  reminders: Reminder[];
  calendarId?: string;
  notes?: string;
  url?: string;
  linkedToTasbih: boolean;
  targetCount?: number;
  currentStreak: number;
  longestStreak: number;
  completedDates: string[];
  createdAt: string;
  isActive: boolean;
}

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  completedAt?: string;
  subtasks?: Subtask[];
  reminders: Reminder[];
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  location?: string;
  startDate: string;
  startTime?: string;
  endDate: string;
  endTime?: string;
  isAllDay: boolean;
  repeatType: RepeatType;
  calendarId?: string;
  reminders: Reminder[];
  notes?: string;
  url?: string;
  createdAt: string;
}
