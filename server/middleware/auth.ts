import { Request, Response, NextFunction } from "express";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

// Token-based auth support
const TEST_TOKEN = process.env.TEST_TOKEN || "test_token_123";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Check for token in header (Bot.e-replika.ru integration)
  const token = req.headers.authorization?.replace("Bearer ", "") || 
                req.headers["x-api-token"] as string;
  
  if (token === TEST_TOKEN) {
    // Token auth
    (req as any).authType = "token";
    (req as any).userId = req.headers["x-user-id"] as string || "default-user";
    return next();
  }
  
  // Check session
  if (req.session?.userId) {
    (req as any).authType = "session";
    (req as any).userId = req.session.userId;
    return next();
  }
  
  return res.status(401).json({ error: "Unauthorized" });
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "") || 
                req.headers["x-api-token"] as string;
  
  if (token === TEST_TOKEN) {
    (req as any).authType = "token";
    (req as any).userId = req.headers["x-user-id"] as string;
  } else if (req.session?.userId) {
    (req as any).authType = "session";
    (req as any).userId = req.session.userId;
  }
  
  next();
}

// Get userId from request (works with both auth types)
export function getUserId(req: Request): string | undefined {
  return (req as any).userId || req.session?.userId;
}

