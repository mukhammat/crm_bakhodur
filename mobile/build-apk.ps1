# Скрипт для быстрой сборки APK (Windows PowerShell)

Write-Host "🚀 Начинаем сборку APK..." -ForegroundColor Green

# Проверяем установлен ли EAS CLI
$easInstalled = Get-Command eas -ErrorAction SilentlyContinue
if (-not $easInstalled) {
    Write-Host "📦 Устанавливаем EAS CLI..." -ForegroundColor Yellow
    npm install -g eas-cli
}

# Проверяем авторизацию
Write-Host "🔐 Проверяем авторизацию..." -ForegroundColor Yellow
$whoami = eas whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Необходимо войти в аккаунт Expo" -ForegroundColor Red
    Write-Host "Выполните: eas login" -ForegroundColor Yellow
    exit 1
}

# Собираем APK
Write-Host "🔨 Запускаем сборку APK..." -ForegroundColor Green
eas build --platform android --profile preview

Write-Host "✅ Сборка завершена! Проверьте ссылку для скачивания выше." -ForegroundColor Green

