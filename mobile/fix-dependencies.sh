#!/bin/bash
# Скрипт для исправления зависимостей и ошибки ExpoFontLoader
# Запустите: chmod +x fix-dependencies.sh && ./fix-dependencies.sh

echo "Очистка старых зависимостей..."

# Удаляем node_modules если существует
if [ -d "node_modules" ]; then
    rm -rf node_modules
    echo "✓ node_modules удален"
fi

# Удаляем package-lock.json если существует
if [ -f "package-lock.json" ]; then
    rm package-lock.json
    echo "✓ package-lock.json удален"
fi

# Очищаем кэш npm
echo ""
echo "Очистка кэша npm..."
npm cache clean --force
echo "✓ Кэш npm очищен"

# Устанавливаем зависимости заново
echo ""
echo "Установка зависимостей..."
npm install
echo "✓ Зависимости установлены"

# Проверяем установку expo-font
echo ""
echo "Проверка установки expo-font..."
if npm list expo-font > /dev/null 2>&1; then
    echo "✓ expo-font установлен"
else
    echo "✗ expo-font не найден, устанавливаем..."
    npm install expo-font@~11.10.0
fi

echo ""
echo "Готово! Теперь запустите: expo start -c"

