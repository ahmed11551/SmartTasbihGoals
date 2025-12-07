import { Router } from "express";
import { requireAuth, getUserId } from "../middleware/auth";
import { prisma } from "../db-prisma";
import { z } from "zod";
import { logger } from "../lib/logger";
import { randomBytes } from "crypto";

const router = Router();
router.use(requireAuth);

// Проверка Premium тарифа (только для групповых целей)
async function checkPremiumTier(userId: string): Promise<{ allowed: boolean; tier: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  });

  const tier = user?.subscriptionTier || 'muslim';
  const allowed = tier === 'sahibAlWaqf'; // Только Premium тариф

  return { allowed, tier };
}

// Генерация уникального кода приглашения
function generateInviteCode(): string {
  return randomBytes(8).toString('base64url').substring(0, 12).toUpperCase();
}

// Схемы валидации
const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(false),
  maxMembers: z.number().int().min(2).max(100).default(50),
});

const createGroupGoalSchema = z.object({
  category: z.enum(['general', 'surah', 'ayah', 'dua', 'azkar', 'names99', 'salawat', 'kalimat']),
  itemId: z.string().optional(),
  goalType: z.enum(['recite', 'learn']),
  title: z.string().min(1).max(200),
  targetCount: z.number().int().min(1),
  endDate: z.string().datetime().optional(),
  linkedCounterType: z.string().optional(),
});

const joinGroupSchema = z.object({
  inviteCode: z.string().min(1),
});

// GET /api/groups - получить все группы пользователя
router.get("/", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const groups = await prisma.group.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      include: {
        owner: {
          select: { id: true, username: true, firstName: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, username: true, firstName: true },
            },
          },
        },
        goals: {
          include: {
            memberProgress: {
              include: {
                user: {
                  select: { id: true, username: true, firstName: true },
                },
              },
            },
          },
        },
        _count: {
          select: { members: true, goals: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ groups });
  } catch (error) {
    next(error);
  }
});

// GET /api/groups/:id - получить информацию о группе
router.get("/:id", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const group = await prisma.group.findUnique({
      where: { id: req.params.id },
      include: {
        owner: {
          select: { id: true, username: true, firstName: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, username: true, firstName: true },
            },
          },
        },
        goals: {
          include: {
            memberProgress: {
              include: {
                user: {
                  select: { id: true, username: true, firstName: true },
                },
              },
              orderBy: { currentProgress: 'desc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { members: true, goals: true },
        },
      },
    });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Проверка, является ли пользователь участником
    const isMember = group.ownerId === userId || group.members.some(m => m.userId === userId);
    if (!isMember) {
      return res.status(403).json({ error: "Access denied. You are not a member of this group." });
    }

    res.json({ group });
  } catch (error) {
    next(error);
  }
});

// POST /api/groups - создать группу (только Premium)
router.post("/", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Проверка Premium тарифа
    const { allowed, tier } = await checkPremiumTier(userId);
    if (!allowed) {
      return res.status(403).json({
        error: "Premium tier required",
        message: `Групповые цели доступны только для тарифа "Сахиб аль-Вакф". Ваш текущий тариф: "${tier}". Перейдите на Premium, чтобы создавать совместные челленджи.`,
        tier,
        requiredTier: 'sahibAlWaqf',
      });
    }

    const parsed = createGroupSchema.parse(req.body);

    // Генерация уникального кода приглашения
    let inviteCode = generateInviteCode();
    let codeExists = await prisma.group.findUnique({ where: { inviteCode } });
    while (codeExists) {
      inviteCode = generateInviteCode();
      codeExists = await prisma.group.findUnique({ where: { inviteCode } });
    }

    const group = await prisma.group.create({
      data: {
        name: parsed.name,
        description: parsed.description,
        ownerId: userId,
        inviteCode,
        isPublic: parsed.isPublic,
        maxMembers: parsed.maxMembers,
        members: {
          create: {
            userId,
            role: 'owner',
          },
        },
      },
      include: {
        owner: {
          select: { id: true, username: true, firstName: true },
        },
        _count: {
          select: { members: true, goals: true },
        },
      },
    });

    logger.info(`Group created: ${group.id} by user ${userId}`);

    res.status(201).json({ group });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    next(error);
  }
});

// POST /api/groups/:id/invite - создать приглашение
router.post("/:id/invite", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const group = await prisma.group.findUnique({
      where: { id: req.params.id },
      include: {
        members: true,
      },
    });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Проверка прав (владелец или админ)
    const member = group.members.find(m => m.userId === userId);
    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
      return res.status(403).json({ error: "Only group owner or admin can create invites" });
    }

    // Генерация уникального кода приглашения
    let inviteCode = generateInviteCode();
    let codeExists = await prisma.groupInvite.findUnique({ where: { inviteCode } });
    while (codeExists) {
      inviteCode = generateInviteCode();
      codeExists = await prisma.groupInvite.findUnique({ where: { inviteCode } });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Приглашение действует 7 дней

    const invite = await prisma.groupInvite.create({
      data: {
        groupId: group.id,
        inviteCode,
        invitedBy: userId,
        expiresAt,
        maxUses: req.body.maxUses || 10,
        isActive: true,
      },
    });

    res.status(201).json({ invite });
  } catch (error) {
    next(error);
  }
});

// POST /api/groups/join - присоединиться к группе по коду приглашения
router.post("/join", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const parsed = joinGroupSchema.parse(req.body);

    // Проверка Premium тарифа
    const { allowed, tier } = await checkPremiumTier(userId);
    if (!allowed) {
      return res.status(403).json({
        error: "Premium tier required",
        message: `Для участия в групповых целях требуется тариф "Сахиб аль-Вакф". Ваш текущий тариф: "${tier}".`,
        tier,
        requiredTier: 'sahibAlWaqf',
      });
    }

    // Найти группу по inviteCode (либо прямой код группы, либо код приглашения)
    const group = await prisma.group.findUnique({
      where: { inviteCode: parsed.inviteCode },
      include: {
        members: true,
        _count: {
          select: { members: true },
        },
      },
    });

    if (!group) {
      // Попробовать найти через приглашение
      const invite = await prisma.groupInvite.findUnique({
        where: { inviteCode: parsed.inviteCode },
        include: {
          group: {
            include: {
              members: true,
              _count: {
                select: { members: true },
              },
            },
          },
        },
      });

      if (!invite || !invite.isActive) {
        return res.status(404).json({ error: "Invalid invite code" });
      }

      if (invite.expiresAt && invite.expiresAt < new Date()) {
        return res.status(400).json({ error: "Invite code has expired" });
      }

      if (invite.currentUses >= invite.maxUses) {
        return res.status(400).json({ error: "Invite code has reached maximum uses" });
      }

      const targetGroup = invite.group;
      if (targetGroup._count.members >= targetGroup.maxMembers) {
        return res.status(400).json({ error: "Group is full" });
      }

      // Проверка, не является ли пользователь уже участником
      if (targetGroup.ownerId === userId || targetGroup.members.some(m => m.userId === userId)) {
        return res.status(400).json({ error: "You are already a member of this group" });
      }

      // Добавить участника
      await prisma.groupMember.create({
        data: {
          groupId: targetGroup.id,
          userId,
          role: 'member',
        },
      });

      // Обновить счетчик использований
      await prisma.groupInvite.update({
        where: { id: invite.id },
        data: { currentUses: invite.currentUses + 1 },
      });

      const updatedGroup = await prisma.group.findUnique({
        where: { id: targetGroup.id },
        include: {
          owner: {
            select: { id: true, username: true, firstName: true },
          },
          members: {
            include: {
              user: {
                select: { id: true, username: true, firstName: true },
              },
            },
          },
          _count: {
            select: { members: true, goals: true },
          },
        },
      });

      logger.info(`User ${userId} joined group ${targetGroup.id} via invite ${invite.id}`);

      res.status(200).json({ group: updatedGroup });
      return;
    }

    // Прямое присоединение по коду группы (если группа публичная)
    if (!group.isPublic) {
      return res.status(403).json({ error: "This group is private. Use an invite code instead." });
    }

    if (group._count.members >= group.maxMembers) {
      return res.status(400).json({ error: "Group is full" });
    }

    // Проверка, не является ли пользователь уже участником
    if (group.ownerId === userId || group.members.some(m => m.userId === userId)) {
      return res.status(400).json({ error: "You are already a member of this group" });
    }

    // Добавить участника
    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId,
        role: 'member',
      },
    });

    const updatedGroup = await prisma.group.findUnique({
      where: { id: group.id },
      include: {
        owner: {
          select: { id: true, username: true, firstName: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, username: true, firstName: true },
            },
          },
        },
        _count: {
          select: { members: true, goals: true },
        },
      },
    });

    logger.info(`User ${userId} joined public group ${group.id}`);

    res.status(200).json({ group: updatedGroup });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    next(error);
  }
});

// POST /api/groups/:id/goals - создать групповую цель
router.post("/:id/goals", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const group = await prisma.group.findUnique({
      where: { id: req.params.id },
      include: {
        members: true,
      },
    });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Проверка, является ли пользователь участником
    const isMember = group.ownerId === userId || group.members.some(m => m.userId === userId);
    if (!isMember) {
      return res.status(403).json({ error: "You must be a member of the group to create goals" });
    }

    const parsed = createGroupGoalSchema.parse(req.body);

    const groupGoal = await prisma.groupGoal.create({
      data: {
        groupId: group.id,
        category: parsed.category,
        itemId: parsed.itemId,
        goalType: parsed.goalType,
        title: parsed.title,
        targetCount: parsed.targetCount,
        startDate: new Date(),
        endDate: parsed.endDate ? new Date(parsed.endDate) : null,
        linkedCounterType: parsed.linkedCounterType,
        status: 'active',
      },
      include: {
        memberProgress: {
          include: {
            user: {
              select: { id: true, username: true, firstName: true },
            },
          },
        },
      },
    });

    logger.info(`Group goal created: ${groupGoal.id} in group ${group.id} by user ${userId}`);

    res.status(201).json({ goal: groupGoal });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    next(error);
  }
});

// GET /api/groups/:id/leaderboard - получить таблицу лидеров для группы
router.get("/:id/leaderboard", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const groupId = req.params.id;

    // Проверка, является ли пользователь участником
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: true,
      },
    });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const isMember = group.ownerId === userId || group.members.some(m => m.userId === userId);
    if (!isMember) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Получить все цели группы
    const goals = await prisma.groupGoal.findMany({
      where: { groupId },
      include: {
        memberProgress: {
          include: {
            user: {
              select: { id: true, username: true, firstName: true },
            },
          },
        },
      },
    });

    // Подсчитать общий прогресс каждого участника
    const leaderboard: Record<string, {
      user: { id: string; username: string; firstName: string | null };
      totalProgress: number;
      totalGoals: number;
      completedGoals: number;
    }> = {};

    // Добавить владельца группы
    const owner = await prisma.user.findUnique({
      where: { id: group.ownerId },
      select: { id: true, username: true, firstName: true },
    });

    if (owner) {
      leaderboard[owner.id] = {
        user: owner,
        totalProgress: 0,
        totalGoals: goals.length,
        completedGoals: 0,
      };
    }

    // Обработать прогресс по всем целям
    goals.forEach(goal => {
      goal.memberProgress.forEach(progress => {
        if (!leaderboard[progress.userId]) {
          leaderboard[progress.userId] = {
            user: progress.user,
            totalProgress: 0,
            totalGoals: goals.length,
            completedGoals: 0,
          };
        }

        leaderboard[progress.userId].totalProgress += progress.currentProgress;
        if (progress.currentProgress >= goal.targetCount) {
          leaderboard[progress.userId].completedGoals += 1;
        }
      });
    });

    // Преобразовать в массив и отсортировать
    const leaderboardArray = Object.values(leaderboard)
      .sort((a, b) => {
        // Сначала по количеству завершенных целей
        if (b.completedGoals !== a.completedGoals) {
          return b.completedGoals - a.completedGoals;
        }
        // Затем по общему прогрессу
        return b.totalProgress - a.totalProgress;
      })
      .map((entry, index) => ({
        rank: index + 1,
        ...entry,
      }));

    res.json({
      groupId,
      leaderboard: leaderboardArray,
      goals: goals.map(g => ({
        id: g.id,
        title: g.title,
        targetCount: g.targetCount,
        currentProgress: g.currentProgress,
      })),
    });
  } catch (error) {
    next(error);
  }
});

export default router;

