# Скрипт для исправления зависимостей и ошибки ExpoFontLoader
# Запустите: .\fix-dependencies.ps1

Write-Host "Очистка старых зависимостей..." -ForegroundColor Yellow

# Удаляем node_modules если существует
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force node_modules
    Write-Host "✓ node_modules удален" -ForegroundColor Green
}

# Удаляем package-lock.json если существует
if (Test-Path "package-lock.json") {
    Remove-Item -Force package-lock.json
    Write-Host "✓ package-lock.json удален" -ForegroundColor Green
}

# Очищаем кэш npm
Write-Host "`nОчистка кэша npm..." -ForegroundColor Yellow
npm cache clean --force
Write-Host "✓ Кэш npm очищен" -ForegroundColor Green

# Устанавливаем зависимости заново
Write-Host "`nУстановка зависимостей..." -ForegroundColor Yellow
npm install
Write-Host "✓ Зависимости установлены" -ForegroundColor Green

# Проверяем установку expo-font
Write-Host "`nПроверка установки expo-font..." -ForegroundColor Yellow
$fontCheck = npm list expo-font 2>&1
if ($fontCheck -match "expo-font@") {
    Write-Host "✓ expo-font установлен" -ForegroundColor Green
} else {
    Write-Host "✗ expo-font не найден, устанавливаем..." -ForegroundColor Red
    npm install expo-font@~11.10.0
}

Write-Host "`nГотово! Теперь запустите: expo start -c" -ForegroundColor Green

