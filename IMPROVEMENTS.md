# Конкретные мелкие улучшения для приложения

## Приоритет 1: Важные улучшения (рекомендуется сделать)

### 1.1 Добавить Zod валидацию для `/api/dhikr/logs`

**Текущая ситуация:**
- Ручная валидация полей в `server/routes/dhikr.ts:188`
- Нет единообразной схемы валидации

**Улучшение:**
Создать Zod схему для валидации запросов на создание логов:

```typescript
const createDhikrLogSchema = z.object({
  sessionId: z.string().uuid().optional(),
  goalId: z.string().uuid().optional(),
  category: z.enum(['general', 'surah', 'ayah', 'dua', 'azkar', 'names99', 'salawat', 'kalimat']),
  itemId: z.string().optional().nullable(),
  eventType: z.enum(['tap', 'bulk', 'repeat', 'learn_mark', 'goal_completed', 'auto_reset']),
  delta: z.number().int().min(0),
  valueAfter: z.number().int().min(0),
  prayerSegment: z.enum(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'none']).default('none'),
  offlineId: z.string().uuid().optional(),
  atTs: z.string().datetime().optional(),
  tz: z.string().default('UTC'),
});
```

**Преимущества:**
- Единообразная валидация
- Автоматические сообщения об ошибках
- TypeScript типы из схемы

---

### 1.2 Унифицировать источники данных в GoalsPage

**Текущая ситуация:**
```typescript
// Используется и локальный контекст
const { habits, tasks, addHabit, ... } = useData();

// И API hooks
const { data: apiHabits = [] } = useHabits();
const { data: apiTasks = [] } = useTasks();
```

**Проблема:**
- Два источника данных могут рассинхронизироваться
- Непонятно, какой источник истинный

**Улучшение:**
Использовать только API hooks, убрать `useData()` для habits и tasks в GoalsPage:

```typescript
// Убрать useData() для habits/tasks
// Использовать только:
const { data: habits = [] } = useHabits();
const { data: tasks = [] } = useTasks();
const createHabitMutation = useCreateHabit();
const updateHabitMutation = useUpdateHabit();
// и т.д.
```

---

### 1.3 Добавить Zod схемы для favorites endpoints

**Текущая ситуация:**
В `server/routes/dhikr.ts` для `/api/dhikr/favorites` нет валидации:

```typescript
// POST /api/dhikr/favorites
const { category, itemId } = req.body;
if (!category || !itemId) {
  return res.status(400).json({ error: "Invalid input", message: "category and itemId are required" });
}
```

**Улучшение:**
```typescript
const addFavoriteSchema = z.object({
  category: z.enum(['general', 'surah', 'ayah', 'dua', 'azkar', 'names99', 'salawat', 'kalimat']),
  itemId: z.string().min(1),
});
```

---

## Приоритет 2: Средние улучшения (желательно сделать)

### 2.1 Оптимизировать инвалидацию кэша React Query

**Текущая ситуация:**
В некоторых местах инвалидируется весь кэш, когда можно точечно обновить:

```typescript
// В useUpdateHabit()
onSuccess: (data) => {
  queryClient.setQueryData<Habit[]>(["habits"], (old = []) =>
    old.map(habit => (habit.id === data.id ? data : habit))
  );
  queryClient.invalidateQueries({ queryKey: ["habits"] }); // ← избыточно
  queryClient.invalidateQueries({ queryKey: ["stats"] });
}
```

**Улучшение:**
Убрать избыточную инвалидацию, если данные уже обновлены оптимистично:

```typescript
onSuccess: (data) => {
  // Данные уже обновлены оптимистично, не нужно инвалидировать habits
  queryClient.invalidateQueries({ queryKey: ["stats"] }); // Только stats
}
```

---

### 2.2 Улучшить сообщения об ошибках для пользователя

**Текущая ситуация:**
Некоторые ошибки возвращают технические сообщения:

```typescript
return res.status(400).json({ 
  error: "Validation error",
  message: error.message // ← может быть техническим
});
```

**Улучшение:**
Добавить пользовательские сообщения:

```typescript
const USER_FRIENDLY_MESSAGES = {
  'P2025': 'Запись не найдена',
  'P2002': 'Такая запись уже существует',
  // и т.д.
};

const userMessage = USER_FRIENDLY_MESSAGES[error.code] || 'Произошла ошибка. Попробуйте еще раз.';

return res.status(400).json({ 
  error: "Validation error",
  message: userMessage,
  code: error.code // для отладки
});
```

---

### 2.3 Добавить валидацию для daily azkar endpoints

**Текущая ситуация:**
В `POST /api/dhikr/daily-azkar` нет валидации структуры данных.

**Улучшение:**
```typescript
const upsertDailyAzkarSchema = z.object({
  dateLocal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fajr: z.number().int().min(0).default(0),
  dhuhr: z.number().int().min(0).default(0),
  asr: z.number().int().min(0).default(0),
  maghrib: z.number().int().min(0).default(0),
  isha: z.number().int().min(0).default(0),
  total: z.number().int().min(0).default(0),
  isComplete: z.boolean().default(false),
});
```

---

## Приоритет 3: Мелкие улучшения (можно сделать позже)

### 3.1 Добавить rate limiting для API endpoints

**Цель:** Защита от злоупотреблений

```typescript
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов
  message: 'Слишком много запросов, попробуйте позже'
});

router.post('/logs', apiLimiter, async (req, res, next) => {
  // ...
});
```

---

### 3.2 Добавить логирование важных действий

**Цель:** Отслеживание активности пользователей

```typescript
// В createDhikrLog
logger.info('Dhikr log created', {
  userId,
  category,
  itemId,
  delta,
  prayerSegment,
  timestamp: new Date().toISOString()
});
```

---

### 3.3 Оптимизировать запросы к БД

**Текущая ситуация:**
В некоторых местах делаются множественные запросы:

```typescript
// Можно объединить в один запрос
const user = await prisma.user.findUnique({ where: { id: userId } });
const goals = await prisma.goal.findMany({ where: { userId } });
```

**Улучшение:**
Использовать `include` для связанных данных:

```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { goals: true }
});
```

---

### 3.4 Добавить типы для всех API ответов

**Цель:** Улучшить типизацию

```typescript
// Создать файл server/types/api.ts
export interface CreateDhikrLogResponse {
  log: DhikrLog;
  value_after: number;
  goal_progress?: {
    goalId: string;
    progress: number;
  } | null;
  daily_azkar?: DailyAzkar | null;
}
```

---

## Итоговая таблица приоритетов

| Приоритет | Улучшение | Сложность | Время |
|-----------|-----------|-----------|-------|
| 🔴 P1 | Zod валидация для `/api/dhikr/logs` | Средняя | 1-2 часа |
| 🔴 P1 | Унификация источников данных | Средняя | 2-3 часа |
| 🔴 P1 | Zod схемы для favorites | Низкая | 30 мин |
| 🟡 P2 | Оптимизация инвалидации кэша | Низкая | 1 час |
| 🟡 P2 | Улучшение сообщений об ошибках | Средняя | 1-2 часа |
| 🟡 P2 | Валидация daily azkar | Низкая | 30 мин |
| 🟢 P3 | Rate limiting | Средняя | 1-2 часа |
| 🟢 P3 | Логирование действий | Низкая | 1 час |
| 🟢 P3 | Оптимизация запросов БД | Средняя | 2-3 часа |
| 🟢 P3 | Типы для API ответов | Низкая | 1-2 часа |

**Рекомендация:** Начать с приоритета 1, так как эти улучшения повысят надежность и консистентность приложения.

