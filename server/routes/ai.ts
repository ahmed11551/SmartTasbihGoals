import { Router, Request, Response, NextFunction } from "express";
import { requireAuth, getUserId } from "../middleware/auth";
import { z } from "zod";
import OpenAI from "openai";
import { logger } from "../lib/logger";

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
      return res.status(503).json({ 
        error: "AI service is not configured",
        message: "AI-помощник временно недоступен. Для активации необходим API ключ OpenAI (OPENAI_API_KEY)."
      });
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

    try {
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
    } catch (openaiError: any) {
      // Обработка ошибок OpenAI SDK
      const errorMessage = openaiError?.message || openaiError?.error?.message || String(openaiError || '');
      const errorStatus = openaiError?.status || openaiError?.statusCode || openaiError?.response?.status || openaiError?.error?.code;
      
      logger.error("OpenAI API error details:", {
        message: errorMessage,
        status: errorStatus,
        type: openaiError?.constructor?.name,
        fullError: JSON.stringify(openaiError, null, 2),
      });
      
      // Проверяем различные варианты сообщения об ошибке (case-insensitive)
      const lowerMessage = errorMessage.toLowerCase();
      if (errorStatus === 403 || String(errorStatus) === '403' || errorMessage.includes('403') || lowerMessage.includes('country') || lowerMessage.includes('region') || lowerMessage.includes('territory') || lowerMessage.includes('not supported')) {
        return res.status(503).json({ 
          error: "OpenAI API недоступен в вашем регионе",
          message: "OpenAI API недоступен в вашем регионе. Возможно, требуется VPN или прокси."
        });
      }
      
      if (errorStatus === 401 || errorMessage.includes('401') || errorMessage.includes('Invalid') || errorMessage.includes('authentication')) {
        return res.status(503).json({ 
          error: "Неверный API ключ OpenAI",
          message: "Проверьте правильность OPENAI_API_KEY."
        });
      }
      
      throw openaiError; // Пробрасываем дальше для общей обработки
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    
    // Обработка специфичных ошибок OpenAI
    const errorMessage = error?.message || error?.error?.message || String(error || '');
    const errorStatus = error?.status || error?.statusCode || error?.response?.status;
    
    if (errorStatus === 403 || errorMessage.includes('403') || errorMessage.includes('Country') || errorMessage.includes('region') || errorMessage.includes('territory')) {
      logger.error("OpenAI API error:", errorMessage);
      return res.status(503).json({ 
        error: "OpenAI API недоступен в вашем регионе",
        message: "OpenAI API недоступен в вашем регионе. Возможно, требуется VPN или прокси."
      });
    }
    
    if (error?.status === 401 || error?.message?.includes('401') || error?.message?.includes('Invalid')) {
      logger.error("OpenAI API authentication error:", error.message);
      return res.status(503).json({ 
        error: "Неверный API ключ OpenAI",
        message: "Проверьте правильность OPENAI_API_KEY."
      });
    }
    
    logger.error("AI assistant error:", error);
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

