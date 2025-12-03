#!/bin/bash

# Скрипт для установки и запуска приложения

set -e

echo "🚀 Smart Tasbih - Установка и запуск"
echo "======================================"
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Функция проверки Docker
check_docker() {
    if command -v docker &> /dev/null; then
        echo -e "${GREEN}✅ Docker найден${NC}"
        docker --version
        return 0
    else
        echo -e "${RED}❌ Docker не найден${NC}"
        return 1
    fi
}

# Функция проверки Docker Compose
check_docker_compose() {
    if docker compose version &> /dev/null 2>&1; then
        echo -e "${GREEN}✅ Docker Compose V2 найден${NC}"
        docker compose version
        return 0
    elif command -v docker-compose &> /dev/null; then
        echo -e "${GREEN}✅ Docker Compose V1 найден${NC}"
        docker-compose --version
        return 0
    else
        echo -e "${RED}❌ Docker Compose не найден${NC}"
        return 1
    fi
}

# Проверка Docker
echo "1️⃣ Проверка Docker..."
if ! check_docker; then
    echo ""
    echo -e "${YELLOW}⚠️  Docker не установлен или не в PATH${NC}"
    echo ""
    echo "Установите Docker Desktop:"
    echo "  macOS: https://docs.docker.com/desktop/install/mac-install/"
    echo "  Linux: https://docs.docker.com/engine/install/"
    echo ""
    echo "После установки:"
    echo "  1. Запустите Docker Desktop"
    echo "  2. Дождитесь полной загрузки"
    echo "  3. Запустите этот скрипт снова"
    exit 1
fi

# Проверка что Docker запущен
echo ""
echo "2️⃣ Проверка что Docker запущен..."
if ! docker info &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker не запущен${NC}"
    echo ""
    echo "Запустите Docker Desktop и попробуйте снова"
    exit 1
fi
echo -e "${GREEN}✅ Docker запущен${NC}"

# Проверка Docker Compose
echo ""
echo "3️⃣ Проверка Docker Compose..."
if ! check_docker_compose; then
    echo -e "${YELLOW}⚠️  Docker Compose не найден${NC}"
    exit 1
fi

# Создание .env файла
echo ""
echo "4️⃣ Проверка .env файла..."
if [ ! -f .env ]; then
    echo "Создание .env файла..."
    cat > .env << 'ENVEOF'
DATABASE_URL=postgresql://smarttasbih:smarttasbih_password@postgres:5432/smarttasbih_db
SESSION_SECRET=dev-secret-key-change-in-production
TEST_TOKEN=test_token_123
BOT_REPLIKA_API_URL=https://Bot.e-replika.ru/docs
OPENAI_API_KEY=
PORT=5000
NODE_ENV=production
ENVEOF
    echo -e "${GREEN}✅ .env файл создан${NC}"
else
    echo -e "${GREEN}✅ .env файл существует${NC}"
fi

# Остановка предыдущих контейнеров
echo ""
echo "5️⃣ Остановка предыдущих контейнеров..."
if docker compose ps -q &> /dev/null 2>&1; then
    docker compose down 2>/dev/null || true
elif docker-compose ps -q &> /dev/null 2>&1; then
    docker-compose down 2>/dev/null || true
fi

# Сборка и запуск
echo ""
echo "6️⃣ Сборка Docker образов..."
if docker compose version &> /dev/null 2>&1; then
    docker compose build
    echo ""
    echo "7️⃣ Запуск контейнеров..."
    docker compose up -d
    COMPOSE_CMD="docker compose"
else
    docker-compose build
    echo ""
    echo "7️⃣ Запуск контейнеров..."
    docker-compose up -d
    COMPOSE_CMD="docker-compose"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Приложение запущено!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📱 Приложение доступно на: http://localhost:5000"
echo ""
echo "📊 Полезные команды:"
echo "   Просмотр логов:     $COMPOSE_CMD logs -f app"
echo "   Статус:             $COMPOSE_CMD ps"
echo "   Остановка:          $COMPOSE_CMD down"
echo "   Перезапуск:         $COMPOSE_CMD restart"
echo ""
echo "⏳ Подождите 10-15 секунд, пока приложение полностью запустится..."
echo ""

