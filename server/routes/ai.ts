import { Router, Request, Response, NextFunction } from "express";
import { requireAuth, getUserId } from "../middleware/auth";
import { z } from "zod";
import OpenAI from "openai";

const router = Router();
router.use(requireAuth);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const aiPromptSchema = z.object({
  message: z.string().min(1),
  context: z.object({
    habits: z.array(z.any()).optional(),
    tasks: z.array(z.any()).optional(),
    goals: z.array(z.any()).optional(),
  }).optional(),
});

router.post("/assistant", async (req, res, next) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: "AI service is not configured" });
    }

    const { message, context } = aiPromptSchema.parse(req.body);

    const systemPrompt = `You are an AI assistant for a Muslim spiritual practice app called "Умный Тасбих" (Smart Tasbih). 
Your role is to help users create habits, tasks, and goals related to Islamic practices such as:
- Prayer (namaz)
- Quran reading
- Dhikr (remembrance of Allah)
- Charity (sadaqa)
- Islamic knowledge
- Fasting
- Islamic etiquette

When users ask you to create a task or habit, respond with a JSON object containing the structured data.
For habits, include: title, description, category, iconName, difficulty, repeatType, repeatDays (if weekly), time, isAllDay, linkedToTasbih, targetCount.
For tasks, include: title, description, dueDate, dueTime, priority (low/medium/high).

Always respond in Russian. Be helpful, respectful, and supportive.`;

    const userMessage = context
      ? `${message}\n\nCurrent context:\nHabits: ${JSON.stringify(context.habits || [])}\nTasks: ${JSON.stringify(context.tasks || [])}\nGoals: ${JSON.stringify(context.goals || [])}`
      : message;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || "Sorry, I couldn't process your request.";

    res.json({ response });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    next(error);
  }
});

// GET /api/ai/report - получить AI-отчет с дифференциацией по тарифам
router.get("/report", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const period = (req.query.period as 'week' | 'month' | 'quarter' | 'year') || 'week';

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ 
        error: "AI service is not configured",
        message: "AI-отчеты недоступны. Настройте OPENAI_API_KEY."
      });
    }

    const { generateAIReport } = await import("../lib/ai-reports");
    const report = await generateAIReport(userId, period);

    res.json({ report });
  } catch (error) {
    next(error);
  }
});

export default router;

