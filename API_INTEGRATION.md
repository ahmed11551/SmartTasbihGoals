# API Integration Documentation

## Авторизация

### Токен-авторизация (Bot.e-replika.ru)

Приложение поддерживает два типа авторизации:

1. **Token-based auth** - для интеграции с Bot.e-replika.ru
2. **Session-based auth** - для стандартной веб-авторизации

#### Token Authentication

Все API запросы могут использовать токен авторизации:

```http
Authorization: Bearer test_token_123
X-User-Id: user-id-here
```

Или через заголовок:
```http
X-API-Token: test_token_123
X-User-Id: user-id-here
```

**Переменная окружения:**
- `TEST_TOKEN` - токен по умолчанию (default: `test_token_123`)
- `BOT_REPLIKA_API_URL` - URL API Bot.e-replika.ru для валидации токенов

#### Session Authentication

Стандартная cookie-based сессия:
```http
Cookie: connect.sid=<session-id>
```

## API Endpoints

Все эндпоинты возвращают JSON и используют стандартные HTTP коды статусов.

### Аутентификация

#### POST /api/auth/register
Регистрация нового пользователя.

**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "username": "string"
  }
}
```

#### POST /api/auth/login
Вход пользователя.

**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "username": "string"
  }
}
```

#### POST /api/auth/logout
Выход пользователя.

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

#### GET /api/auth/me
Получить информацию о текущем пользователе.

**Headers:**
```
Authorization: Bearer test_token_123
X-User-Id: user-id
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "username": "string"
  }
}
```

#### POST /api/auth/validate-token
Валидация токена для Bot.e-replika.ru.

**Request:**
```json
{
  "token": "test_token_123",
  "userId": "user-id"
}
```

**Response (200):**
```json
{
  "valid": true,
  "userId": "user-id"
}
```

### Привычки (Habits)

#### GET /api/habits
Получить все привычки пользователя.

**Response (200):**
```json
{
  "habits": [
    {
      "id": "uuid",
      "userId": "uuid",
      "title": "string",
      "category": "namaz|quran|dhikr|sadaqa|knowledge|fasting|etiquette",
      "difficulty": "easy|medium|advanced",
      "repeatType": "never|daily|weekly|monthly|custom",
      "repeatDays": ["mon", "tue"],
      "currentStreak": 0,
      "longestStreak": 0,
      "completedDates": ["2024-01-01"],
      "isActive": true,
      ...
    }
  ]
}
```

#### POST /api/habits
Создать новую привычку.

**Request:**
```json
{
  "title": "string",
  "category": "dhikr",
  "difficulty": "easy",
  "repeatType": "daily",
  "iconName": "Sun",
  "isAllDay": true,
  "linkedToTasbih": false,
  "targetCount": 100,
  ...
}
```

#### PATCH /api/habits/:id
Обновить привычку.

**Request:**
```json
{
  "title": "Updated title",
  "currentStreak": 5,
  ...
}
```

#### DELETE /api/habits/:id
Удалить привычку.

### Задачи (Tasks)

#### GET /api/tasks
Получить все задачи пользователя.

#### POST /api/tasks
Создать задачу.

**Request:**
```json
{
  "title": "string",
  "description": "string",
  "dueDate": "2024-01-01T00:00:00Z",
  "priority": "low|medium|high",
  "subtasks": [
    {
      "id": "string",
      "title": "string",
      "isCompleted": false
    }
  ]
}
```

#### PATCH /api/tasks/:id
Обновить задачу.

#### DELETE /api/tasks/:id
Удалить задачу.

### Цели (Goals)

#### GET /api/goals
Получить все цели пользователя.

#### POST /api/goals
Создать цель.

**Request:**
```json
{
  "title": "string",
  "category": "salawat",
  "goalType": "recite|learn",
  "targetCount": 10000,
  "startDate": "2024-01-01T00:00:00Z",
  "status": "active"
}
```

#### PATCH /api/goals/:id
Обновить цель.

#### DELETE /api/goals/:id
Удалить цель.

### Тасбих и Зикры

#### GET /api/dhikr/logs?limit=100
Получить логи зикров.

#### POST /api/dhikr/logs
Создать лог зикра.

**Request:**
```json
{
  "sessionId": "uuid",
  "category": "azkar",
  "eventType": "tap",
  "delta": 1,
  "valueAfter": 5,
  "prayerSegment": "fajr"
}
```

#### GET /api/dhikr/daily-azkar/:dateLocal
Получить ежедневные азкары для даты (формат: YYYY-MM-DD).

#### POST /api/dhikr/daily-azkar
Обновить ежедневные азкары.

**Request:**
```json
{
  "dateLocal": "2024-01-01",
  "fajr": 99,
  "dhuhr": 99,
  "asr": 99,
  "maghrib": 99,
  "isha": 99,
  "total": 495,
  "isComplete": false
}
```

### Сессии

#### GET /api/sessions
Получить все сессии пользователя.

#### POST /api/sessions
Создать сессию тасбиха.

**Request:**
```json
{
  "goalId": "uuid",
  "prayerSegment": "fajr"
}
```

#### PATCH /api/sessions/:id
Обновить сессию (например, завершить).

**Request:**
```json
{
  "endedAt": "2024-01-01T10:00:00Z"
}
```

### Статистика

#### GET /api/stats
Получить статистику пользователя.

**Response (200):**
```json
{
  "stats": {
    "totalDhikrCount": 15420,
    "goalsCompleted": 8,
    "currentStreak": 7,
    "todayCount": 245
  },
  "counts": {
    "habits": 5,
    "tasks": 10,
    "goals": 3,
    "activeGoals": 2
  }
}
```

### AI Ассистент

#### POST /api/ai/assistant
Запрос к AI ассистенту.

**Request:**
```json
{
  "message": "Напомни мне читать Коран каждый день",
  "context": {
    "habits": [...],
    "tasks": [...],
    "goals": [...]
  }
}
```

**Response (200):**
```json
{
  "response": "Создаю привычку: Читать Коран каждый день..."
}
```

## Обработка ошибок

Все ошибки возвращаются в формате:

```json
{
  "error": "Error message",
  "details": {} // опционально, для ошибок валидации
}
```

### Коды ошибок:

- `400` - Bad Request (валидация)
- `401` - Unauthorized (нет авторизации)
- `404` - Not Found (ресурс не найден)
- `409` - Conflict (уникальное ограничение)
- `500` - Internal Server Error

### Примеры ошибок:

**Валидация:**
```json
{
  "error": "Validation error",
  "details": [
    {
      "path": "username",
      "message": "Username is required"
    }
  ]
}
```

**Prisma ошибки:**
```json
{
  "error": "Unique constraint violation",
  "field": ["username"]
}
```

## Требования к бэкенду Владимира

Если какие-то API отсутствуют, необходимо реализовать:

1. **Все CRUD операции** для привычек, задач, целей
2. **Логирование зикров** с поддержкой офлайн ID
3. **Ежедневные азкары** с upsert операцией
4. **Статистика** агрегированная из всех данных
5. **Сессии тасбиха** для отслеживания активных сессий

### Минимальные требования к форматам:

- Все даты в ISO 8601 формате
- UUID для всех ID
- JSON для сложных типов (массивы, объекты)
- Поддержка токен-авторизации через заголовки
- CORS для фронтенда
- Обработка ошибок в едином формате

## Примеры запросов

### С токеном:

```bash
curl -X GET http://localhost:5000/api/habits \
  -H "Authorization: Bearer test_token_123" \
  -H "X-User-Id: user-id-here"
```

### С сессией:

```bash
curl -X GET http://localhost:5000/api/habits \
  -H "Cookie: connect.sid=<session-id>"
```

