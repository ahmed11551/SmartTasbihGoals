import type { Express, Request, Response } from "express";
import type { Server } from "http";
import authRoutes from "./routes/auth";
import habitsRoutes from "./routes/habits";
import tasksRoutes from "./routes/tasks";
import goalsRoutes from "./routes/goals";
import sessionsRoutes from "./routes/sessions";
import dhikrRoutes from "./routes/dhikr";
import statsRoutes from "./routes/stats";
import aiRoutes from "./routes/ai";
import telegramRoutes from "./routes/telegram";
import qazaRoutes from "./routes/qaza";
import badgesRoutes from "./routes/badges";
import categoryStreaksRoutes from "./routes/category-streaks";
import usersRoutes from "./routes/users";
import notificationsRoutes from "./routes/notifications";
import notificationSettingsRoutes from "./routes/notification-settings";
import groupsRoutes from "./routes/groups";
import bootstrapRoutes from "./routes/bootstrap";
import reportsRoutes from "./routes/reports";
import learnRoutes from "./routes/learn";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // API root endpoints (both /api and /api/)
  const apiInfoHandler = (_req: Request, res: Response) => {
    res.json({ 
      message: "SmartTasbihGoals API",
      version: "1.0.0",
      endpoints: [
        "/api/bootstrap",
        "/api/auth",
        "/api/habits",
        "/api/tasks",
        "/api/goals",
        "/api/sessions",
        "/api/dhikr",
        "/api/stats",
        "/api/ai",
        "/api/telegram",
        "/api/qaza",
        "/api/badges",
        "/api/category-streaks",
        "/api/users",
        "/api/notifications",
        "/api/notification-settings",
        "/api/groups",
        "/api/v1/reports",
        "/api/v1/learn"
      ]
    });
  };
  
  app.get("/api", apiInfoHandler);
  app.get("/api/", apiInfoHandler);
  
  // API routes
  app.use("/api/bootstrap", bootstrapRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/habits", habitsRoutes);
  app.use("/api/tasks", tasksRoutes);
  app.use("/api/goals", goalsRoutes);
  app.use("/api/sessions", sessionsRoutes);
  console.log("[ROUTES] Registering /api/dhikr routes...");
  app.use("/api/dhikr", dhikrRoutes);
  console.log("[ROUTES] /api/dhikr routes registered");
  app.use("/api/stats", statsRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/telegram", telegramRoutes);
  app.use("/api/qaza", qazaRoutes);
  app.use("/api/badges", badgesRoutes);
  app.use("/api/category-streaks", categoryStreaksRoutes);
  app.use("/api/users", usersRoutes);
  app.use("/api/notifications", notificationsRoutes);
  app.use("/api/notification-settings", notificationSettingsRoutes);
  app.use("/api/groups", groupsRoutes);
  app.use("/api/v1/reports", reportsRoutes);
  app.use("/api/v1/learn", learnRoutes);

  return httpServer;
}
