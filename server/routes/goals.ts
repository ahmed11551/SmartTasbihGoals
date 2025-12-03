import { Router } from "express";
import { storage } from "../storage";
import { requireAuth, getUserId } from "../middleware/auth";
import { z } from "zod";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const userId = getUserId(req)!;
    const goals = await storage.getGoals(userId);
    res.json({ goals });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const userId = getUserId(req)!;
    const goal = await storage.getGoal(req.params.id, userId);
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }
    res.json({ goal });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const userId = getUserId(req)!;
    const parsed = req.body;
    const goal = await storage.createGoal(userId, parsed);
    res.status(201).json({ goal });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const userId = getUserId(req)!;
    const parsed = req.body;
    const goal = await storage.updateGoal(req.params.id, userId, parsed);
    res.json({ goal });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    if (error instanceof Error && error.message === "Goal not found") {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const userId = getUserId(req)!;
    await storage.deleteGoal(req.params.id, userId);
    res.json({ message: "Goal deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;

