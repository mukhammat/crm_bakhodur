# Быстрый старт

## Установка зависимостей

```bash
cd mobile
npm install
```

## Настройка API URL

Откройте файл `src/config/api.ts` и измените URL на адрес вашего бэкенда:

```typescript
export const API_BASE_URL = 'http://YOUR_IP_ADDRESS:3322/api';
```

**Важно:** 
- Для Android эмулятора используйте `10.0.2.2` вместо `localhost`
- Для iOS симулятора используйте `localhost`
- Для физических устройств используйте IP адрес вашего компьютера в локальной сети

Пример для физического устройства:
```typescript
export const API_BASE_URL = 'http://192.168.1.100:3322/api';
```

## Запуск приложения

```bash
# Запуск Expo сервера
npm start

# Затем выберите:
# - 'a' для Android
# - 'i' для iOS
# - 'w' для веб-браузера
```

## Требования

- Node.js 16+ 
- npm или yarn
- Для Android: Android Studio с эмулятором или физическое устройство с включенной отладкой
- Для iOS: Xcode (только на macOS)

## Установка Expo CLI (если нужно)

```bash
npm install -g expo-cli
```

## Устранение проблем

### Ошибка подключения к API
- Убедитесь, что бэкенд запущен
- Проверьте правильность IP адреса в `src/config/api.ts`
- Убедитесь, что CORS настроен на бэкенде для мобильных запросов

### Ошибки при установке зависимостей
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Очистка кэша Expo
```bash
expo start -c
```

