import { Router, Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { z } from "zod";

const router = Router();

// Token-based auth for Bot.e-replika.ru integration
const TEST_TOKEN = process.env.TEST_TOKEN || "test_token_123";
const BOT_REPLIKA_API_URL = process.env.BOT_REPLIKA_API_URL || "https://Bot.e-replika.ru/docs";

// Middleware to check token or session
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Check for token in header
  const token = req.headers.authorization?.replace("Bearer ", "") || 
                req.headers["x-api-token"] as string;
  
  if (token === TEST_TOKEN) {
    // Token auth - get user from token (could be extended to validate token with Bot.e-replika.ru)
    (req as any).authType = "token";
    (req as any).userId = req.headers["x-user-id"] as string || "default-user";
    return next();
  }
  
  // Check session
  if (req.session?.userId) {
    (req as any).authType = "session";
    return next();
  }
  
  return res.status(401).json({ error: "Unauthorized" });
}

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const registerSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

router.post("/register", async (req, res, next) => {
  try {
    const parsed = registerSchema.parse(req.body);
    
    // Check if user exists
    const existing = await storage.getUserByUsername(parsed.username);
    if (existing) {
      return res.status(400).json({ error: "Username already exists" });
    }
    
    const user = await storage.createUser(parsed);
    
    // Set session
    req.session!.userId = user.id;
    
    res.json({ 
      user: {
        id: user.id,
        username: user.username,
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const parsed = loginSchema.parse(req.body);
    
    const user = await storage.getUserByUsername(parsed.username);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const isValid = await storage.verifyPassword(parsed.password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // Set session
    req.session!.userId = user.id;
    
    res.json({ 
      user: {
        id: user.id,
        username: user.username,
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    next(error);
  }
});

router.post("/logout", (req, res) => {
  req.session?.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to logout" });
    }
    res.json({ message: "Logged out successfully" });
  });
});

router.get("/me", authMiddleware, async (req, res) => {
  const userId = (req as any).userId || req.session?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  const user = await storage.getUser(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  
  res.json({
    user: {
      id: user.id,
      username: user.username,
    }
  });
});

// Token validation endpoint for Bot.e-replika.ru
router.post("/validate-token", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "") || 
                req.body.token;
  
  if (token === TEST_TOKEN) {
    return res.json({ valid: true, userId: req.body.userId || "default-user" });
  }
  
  // Could also validate with Bot.e-replika.ru API
  // const response = await fetch(`${BOT_REPLIKA_API_URL}/validate`, {
  //   method: 'POST',
  //   headers: { 'Authorization': `Bearer ${token}` }
  // });
  
  return res.status(401).json({ valid: false, error: "Invalid token" });
});

export default router;

