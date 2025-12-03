import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const categoryEnum = pgEnum("category", ["general", "surah", "ayah", "dua", "azkar", "names99", "salawat", "kalimat"]);
export const goalTypeEnum = pgEnum("goal_type", ["recite", "learn"]);
export const goalStatusEnum = pgEnum("goal_status", ["active", "completed", "archived", "paused"]);
export const prayerSegmentEnum = pgEnum("prayer_segment", ["fajr", "dhuhr", "asr", "maghrib", "isha", "none"]);
export const eventTypeEnum = pgEnum("event_type", ["tap", "bulk", "repeat", "learn_mark", "goal_completed", "auto_reset"]);
export const badgeLevelEnum = pgEnum("badge_level", ["copper", "silver", "gold"]);
export const habitCategoryEnum = pgEnum("habit_category", ["namaz", "quran", "dhikr", "sadaqa", "knowledge", "fasting", "etiquette"]);
export const habitDifficultyEnum = pgEnum("habit_difficulty", ["easy", "medium", "advanced"]);
export const repeatTypeEnum = pgEnum("repeat_type", ["never", "daily", "weekly", "monthly", "custom"]);
export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);

// Users
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Habits
export const habits = pgTable("habits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  templateId: varchar("template_id"),
  category: habitCategoryEnum("category").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  iconName: text("icon_name").notNull(),
  difficulty: habitDifficultyEnum("difficulty").notNull(),
  repeatType: repeatTypeEnum("repeat_type").notNull(),
  repeatDays: jsonb("repeat_days").$type<string[]>(),
  repeatDates: jsonb("repeat_dates").$type<number[]>(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  time: text("time"),
  endTime: text("end_time"),
  isAllDay: boolean("is_all_day").notNull().default(true),
  reminders: jsonb("reminders").$type<Array<{ id: string; time: string; enabled: boolean; sound?: string }>>().default([]),
  calendarId: varchar("calendar_id"),
  notes: text("notes"),
  url: text("url"),
  linkedToTasbih: boolean("linked_to_tasbih").notNull().default(false),
  targetCount: integer("target_count"),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  completedDates: jsonb("completed_dates").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

// Tasks
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  dueTime: text("due_time"),
  priority: priorityEnum("priority").notNull().default("medium"),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  subtasks: jsonb("subtasks").$type<Array<{ id: string; title: string; isCompleted: boolean }>>().default([]),
  reminders: jsonb("reminders").$type<Array<{ id: string; time: string; enabled: boolean; sound?: string }>>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Goals
export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  category: categoryEnum("category").notNull(),
  itemId: varchar("item_id"),
  goalType: goalTypeEnum("goal_type").notNull(),
  title: text("title").notNull(),
  targetCount: integer("target_count").notNull(),
  currentProgress: integer("current_progress").notNull().default(0),
  status: goalStatusEnum("status").notNull().default("active"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  linkedCounterType: varchar("linked_counter_type"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// Sessions
export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  goalId: varchar("goal_id").references(() => goals.id, { onDelete: "set null" }),
  prayerSegment: prayerSegmentEnum("prayer_segment").notNull().default("none"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
});

// Dhikr Logs
export const dhikrLogs = pgTable("dhikr_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: varchar("session_id").notNull().references(() => sessions.id, { onDelete: "cascade" }),
  goalId: varchar("goal_id").references(() => goals.id, { onDelete: "set null" }),
  category: categoryEnum("category").notNull(),
  itemId: varchar("item_id"),
  eventType: eventTypeEnum("event_type").notNull(),
  delta: integer("delta").notNull(),
  valueAfter: integer("value_after").notNull(),
  prayerSegment: prayerSegmentEnum("prayer_segment").notNull().default("none"),
  atTs: timestamp("at_ts").defaultNow().notNull(),
  tz: text("tz").notNull().default("UTC"),
  offlineId: varchar("offline_id"),
});

// Daily Azkar
export const dailyAzkar = pgTable("daily_azkar", {
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  dateLocal: text("date_local").notNull(),
  fajr: integer("fajr").notNull().default(0),
  dhuhr: integer("dhuhr").notNull().default(0),
  asr: integer("asr").notNull().default(0),
  maghrib: integer("maghrib").notNull().default(0),
  isha: integer("isha").notNull().default(0),
  total: integer("total").notNull().default(0),
  isComplete: boolean("is_complete").notNull().default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  pk: { primaryKey: { columns: [table.userId, table.dateLocal] } },
}));

// Badges
export const badges = pgTable("badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  level: badgeLevelEnum("level").notNull(),
  icon: text("icon").notNull(),
  achievedAt: timestamp("achieved_at"),
  isUnlocked: boolean("is_unlocked").notNull().default(false),
  progress: integer("progress"),
  target: integer("target"),
});

// Calendar Events
export const calendarEvents = pgTable("calendar_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  location: text("location"),
  startDate: timestamp("start_date").notNull(),
  startTime: text("start_time"),
  endDate: timestamp("end_date").notNull(),
  endTime: text("end_time"),
  isAllDay: boolean("is_all_day").notNull().default(true),
  repeatType: repeatTypeEnum("repeat_type").notNull().default("never"),
  calendarId: varchar("calendar_id"),
  reminders: jsonb("reminders").$type<Array<{ id: string; time: string; enabled: boolean; sound?: string }>>().default([]),
  notes: text("notes"),
  url: text("url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertHabitSchema = createInsertSchema(habits).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  userId: true,
});

export const insertDhikrLogSchema = createInsertSchema(dhikrLogs).omit({
  id: true,
  userId: true,
});

export const insertDailyAzkarSchema = createInsertSchema(dailyAzkar).omit({
  userId: true,
  updatedAt: true,
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
  userId: true,
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({
  id: true,
  userId: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Habit = typeof habits.$inferSelect;
export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type DhikrLog = typeof dhikrLogs.$inferSelect;
export type InsertDhikrLog = z.infer<typeof insertDhikrLogSchema>;
export type DailyAzkar = typeof dailyAzkar.$inferSelect;
export type InsertDailyAzkar = z.infer<typeof insertDailyAzkarSchema>;
export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
