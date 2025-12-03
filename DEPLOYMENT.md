# Инструкция по развертыванию

## Быстрый старт с Docker

### 1. Клонировать репозиторий
```bash
git clone <repository-url>
cd SmartTasbihGoals_pub-main
```

### 2. Настроить переменные окружения

Создайте файл `.env`:
```env
SESSION_SECRET=your-super-secret-key-change-in-production
TEST_TOKEN=test_token_123
BOT_REPLIKA_API_URL=https://Bot.e-replika.ru/docs
OPENAI_API_KEY=your-openai-api-key
DATABASE_URL=postgresql://smarttasbih:smarttasbih_password@postgres:5432/smarttasbih_db
```

### 3. Запустить через Docker Compose

```bash
# Сборка и запуск
docker-compose up -d

# Проверить статус
docker-compose ps

# Просмотр логов
docker-compose logs -f app
```

### 4. Применить миграции БД

Миграции применяются автоматически при запуске контейнера. Если нужно применить вручную:

```bash
docker-compose exec app npx prisma migrate deploy
```

### 5. Доступ к приложению

- **Приложение**: http://localhost:5000
- **Prisma Studio** (для просмотра БД): 
  ```bash
  docker-compose exec app npx prisma studio
  ```

## Локальная разработка

### Требования
- Node.js 20+
- PostgreSQL 16+
- npm или yarn

### Установка

```bash
# Установить зависимости
npm install

# Настроить переменные окружения
cp .env.example .env
# Отредактировать .env

# Сгенерировать Prisma Client
npm run db:generate

# Применить миграции
npm run db:push

# Запустить в режиме разработки
npm run dev
```

## Продакшн деплой

### 1. Сборка Docker образа

```bash
docker build -t smarttasbih:latest .
```

### 2. Запуск с Docker Compose

```bash
docker-compose -f docker-compose.yml up -d
```

### 3. Обновление

```bash
# Пересобрать и перезапустить
docker-compose up -d --build

# Применить новые миграции
docker-compose exec app npx prisma migrate deploy
```

## Переменные окружения

| Переменная | Описание | Обязательно | По умолчанию |
|-----------|----------|-------------|--------------|
| `DATABASE_URL` | PostgreSQL connection string | Да | - |
| `SESSION_SECRET` | Секретный ключ для сессий | Да | - |
| `TEST_TOKEN` | Токен для Bot.e-replika.ru | Нет | `test_token_123` |
| `BOT_REPLIKA_API_URL` | URL API Bot.e-replika.ru | Нет | `https://Bot.e-replika.ru/docs` |
| `OPENAI_API_KEY` | OpenAI API ключ для AI ассистента | Нет | - |
| `PORT` | Порт приложения | Нет | `5000` |
| `NODE_ENV` | Окружение (development/production) | Нет | `development` |

## Проверка работоспособности

### 1. Проверить API

```bash
# Health check
curl http://localhost:5000/api/auth/me

# С токеном
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer test_token_123" \
  -H "X-User-Id: test-user"
```

### 2. Проверить базу данных

```bash
# Подключиться к БД
docker-compose exec postgres psql -U smarttasbih -d smarttasbih_db

# Или через Prisma Studio
docker-compose exec app npx prisma studio
```

### 3. Проверить логи

```bash
# Логи приложения
docker-compose logs -f app

# Логи БД
docker-compose logs -f postgres
```

## Решение проблем

### БД не подключается

```bash
# Проверить статус контейнера БД
docker-compose ps postgres

# Проверить логи
docker-compose logs postgres

# Пересоздать БД
docker-compose down -v
docker-compose up -d
```

### Миграции не применяются

```bash
# Применить вручную
docker-compose exec app npx prisma migrate deploy

# Сбросить БД и применить заново (ОСТОРОЖНО: удалит все данные)
docker-compose exec app npx prisma migrate reset
```

### Порт занят

Измените порт в `docker-compose.yml`:
```yaml
ports:
  - "5001:5000"  # Вместо 5000:5000
```

## Backup и Restore

### Backup БД

```bash
docker-compose exec postgres pg_dump -U smarttasbih smarttasbih_db > backup.sql
```

### Restore БД

```bash
docker-compose exec -T postgres psql -U smarttasbih smarttasbih_db < backup.sql
```

