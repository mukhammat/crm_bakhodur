# Проверка наличия Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js не установлен. Пожалуйста, установите Node.js версии 16 или выше!"
    exit 1
fi

# Проверка наличия PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL не установлен. Пожалуйста, установите PostgreSQL!"
    exit 1
fi

echo "Все зависимости установлены"

# Установка зависимостей backend
echo "Установка зависимостей backend..."
npm install

# Установка зависимостей frontend
echo "
Установка зависимостей frontend..."
cd frontend
npm install
cd ..

# Проверка наличия .env файла
if [ ! -f .env ]; then
    echo "Файл .env не найден. Создаю из примера..."
    cp env.example .env
    echo "Пожалуйста, отредактируйте файл .env с вашими настройками базы данных и email."
fi

# Генерация бд
echo "Генерация бд..."
npm run genmig

# Запуск системы
npm run dev:server
npm run dev:front