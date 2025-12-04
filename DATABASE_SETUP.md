#  Настройка базы данных

## Neon Database Setup

Если у вас есть проект ID от Neon (например: `prj_Boi2c18jPGppJ5uioohcbKQoa43L`), вам нужно получить **Connection String**.

### Шаги:

1. **Войдите в Neon Dashboard**: https://console.neon.tech
2. **Выберите ваш проект** (по ID `prj_Boi2c18jPGppJ5uioohcbKQoa43L`)
3. **Перейдите в раздел "Connection Details"** или "Connection String"
4. **Скопируйте Connection String**

### Формат Connection String для Neon:

```
postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
```

**Важно:**
-  Должен начинаться с `postgresql://`
-  Должен содержать `?sslmode=require` для безопасного подключения
-  Не должен содержать `localhost` или `127.0.0.1` (только для production)

### Пример правильного DATABASE_URL:

```env
DATABASE_URL=postgresql://user:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

## Проверка подключения

После настройки `DATABASE_URL` в Vercel:

1. **Деплой на Vercel**
2. **Проверьте логи** в Vercel Dashboard → Functions → Logs
3. **Должно быть сообщение**: ` Подключение к базе данных установлено`

Если видите ошибку:
- ` DATABASE_URL не установлен!` → Добавьте переменную окружения в Vercel
- ` Ошибка подключения к базе данных` → Проверьте формат DATABASE_URL и доступность БД

## Применение миграций

После успешного деплоя:

```bash
# Локально (если нужно)
npx prisma migrate deploy

# Или через Vercel CLI
vercel env pull
npx prisma migrate deploy
```

## Troubleshooting

### Ошибка: "Can't reach database server"
- Проверьте, что БД не в режиме "sleep" (Neon может засыпать на free плане)
- Попробуйте подключиться через Neon Dashboard → SQL Editor

### Ошибка: "Connection string is invalid"
- Убедитесь, что строка начинается с `postgresql://`
- Проверьте, что нет лишних пробелов
- Убедитесь, что пароль не содержит специальных символов без URL-encoding

### Ошибка: "SSL connection required"
- Добавьте `?sslmode=require` в конец connection string

---

**После настройки DATABASE_URL приложение должно работать!** 

