# Исправление ошибки ExpoFontLoader

## Проблема
Ошибка: `TypeError: ExpoFontLoader.default.getLoadedFonts is not a function`

## Решение

### Шаг 1: Установите зависимости
```bash
cd mobile
npm install
```

### Шаг 2: Очистите кэш и перезапустите
```bash
# Очистите кэш Expo
expo start -c

# Или полностью переустановите зависимости
rm -rf node_modules
rm package-lock.json
npm install
expo start -c
```

### Шаг 3: Для Android - пересоберите приложение
Если вы используете Android, может потребоваться пересборка:
```bash
# Остановите текущий процесс
# Затем запустите заново
npm start
# Нажмите 'a' для Android
```

## Что было исправлено

1. ✅ Добавлена зависимость `expo-font` в `package.json`
2. ✅ Добавлена явная загрузка шрифтов Ionicons в `App.tsx`
3. ✅ Исправлено имя иконки в LoginScreen: `log-in` → `log-in-outline`
4. ✅ Исправлено имя иконки в RegisterScreen: `person-add` → `person-add-outline`

## Альтернативное решение

Если проблема сохраняется, попробуйте использовать веб-версию для тестирования:
```bash
npm run web
```

Или используйте Expo Go приложение на телефоне вместо сборки.

