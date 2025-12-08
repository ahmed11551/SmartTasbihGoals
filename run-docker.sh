#!/bin/bash

# Скрипт для запуска приложения через Docker

echo "Запуск Smart Tasbih через Docker..."

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    echo "Docker не установлен. Установите Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Проверка наличия docker-compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "docker-compose не найден"
    exit 1
fi

# Создание .env если не существует
if [ ! -f .env ]; then
    echo "Создание файла .env..."
    cat > .env << 'ENVEOF'
# Database
DATABASE_URL=postgresql://smarttasbih:smarttasbih_password@postgres:5432/smarttasbih_db

# Session
SESSION_SECRET=dev-secret-key-change-in-production

# Bot.e-replika.ru Integration
TEST_TOKEN=test_token_123
BOT_REPLIKA_API_URL=https://Bot.e-replika.ru/docs

# OpenAI (optional, for AI assistant)
OPENAI_API_KEY=

# Server
PORT=5000
NODE_ENV=production
ENVEOF
    echo "Файл .env создан"
fi

# Остановка предыдущих контейнеров (если есть)
echo "Остановка предыдущих контейнеров..."
docker-compose down 2>/dev/null || docker compose down 2>/dev/null

# Сборка и запуск
echo "Сборка Docker образов..."
docker-compose build || docker compose build

echo "Запуск контейнеров..."
docker-compose up -d || docker compose up -d

echo ""
echo "Приложение запускается!"
echo ""
echo "Приложение будет доступно на: http://localhost:5000"
echo ""
echo "Просмотр логов:"
echo "   docker-compose logs -f app"
echo ""
echo "Остановка:"
echo "   docker-compose down"
echo ""
echo "Подождите несколько секунд, пока приложение запустится..."

