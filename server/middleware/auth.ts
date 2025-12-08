import { Request, Response, NextFunction } from "express";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

// Token-based auth support
const TEST_TOKEN = process.env.TEST_TOKEN || "test_token_123";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Все запросы идут через Bot.e-replika.ru/docs с test_token_123
  // Авторизация не требуется - всегда пропускаем
  // Устанавливаем userId из заголовка или используем default-user
  const token = req.headers.authorization?.replace("Bearer ", "") || 
                req.headers["x-api-token"] as string ||
                TEST_TOKEN; // По умолчанию используем test_token_123
  
  (req as any).authType = "token";
  (req as any).userId = req.headers["x-user-id"] as string || req.session?.userId || "default-user";
  
  // Всегда пропускаем - авторизация не требуется
  return next();
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  // Все запросы идут через Bot.e-replika.ru/docs с test_token_123
  // Авторизация не требуется - всегда пропускаем
  const token = req.headers.authorization?.replace("Bearer ", "") || 
                req.headers["x-api-token"] as string ||
                TEST_TOKEN; // По умолчанию используем test_token_123
  
  (req as any).authType = "token";
  (req as any).userId = req.headers["x-user-id"] as string || req.session?.userId || "default-user";
  
  // Всегда пропускаем - авторизация не требуется
  return next();
}

// Get userId from request (works with both auth types)
// Авторизация отключена - всегда возвращаем userId или default-user
export function getUserId(req: Request): string {
  return (req as any).userId || req.session?.userId || "default-user";
}

