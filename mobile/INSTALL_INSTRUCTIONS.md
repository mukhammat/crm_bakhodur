# Инструкции по установке и исправлению ошибки

## ⚠️ Важно: Ошибка ExpoFontLoader

Если вы видите ошибку `ExpoFontLoader.default.getLoadedFonts is not a function`, выполните следующие шаги:

### Шаг 1: Установите зависимости

Откройте терминал в папке `mobile` и выполните:

```bash
cd mobile
npm install
```

Это установит все зависимости, включая `expo-font`, которая была добавлена в `package.json`.

### Шаг 2: Очистите кэш Expo

После установки зависимостей очистите кэш:

```bash
expo start -c
```

Флаг `-c` очищает кэш Metro bundler.

### Шаг 3: Перезапустите приложение

Если приложение уже запущено:
1. Остановите его (Ctrl+C)
2. Запустите заново: `npm start` или `expo start -c`
3. Нажмите `a` для Android или `i` для iOS

### Шаг 4: Если проблема сохраняется

Выполните полную переустановку:

**Windows PowerShell:**
```powershell
cd mobile
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
expo start -c
```

**Windows CMD:**
```cmd
cd mobile
rmdir /s /q node_modules
del package-lock.json
npm install
expo start -c
```

**Linux/Mac:**
```bash
cd mobile
rm -rf node_modules
rm package-lock.json
npm install
expo start -c
```

### Шаг 5: Для Android - пересборка

Если используете Android и проблема сохраняется, может потребоваться пересборка:

1. Остановите Expo сервер
2. Запустите: `expo start -c`
3. Нажмите `a` для Android
4. Дождитесь полной пересборки

## Что было исправлено в коде

1. ✅ Добавлена зависимость `expo-font@~11.10.0` в `package.json`
2. ✅ Исправлены имена иконок:
   - `log-in` → `log-in-outline` в LoginScreen
   - `person-add` → `person-add-outline` в RegisterScreen

## Альтернативные решения

### Вариант 1: Использовать Expo Go
Вместо сборки используйте Expo Go приложение:
1. Установите Expo Go на телефон
2. Запустите `expo start`
3. Отсканируйте QR-код

### Вариант 2: Тестировать на веб
Для быстрого тестирования используйте веб-версию:
```bash
npm run web
```

## Проверка установки

Убедитесь, что `expo-font` установлен:
```bash
npm list expo-font
```

Должно показать версию `11.10.0` или выше.

## Дополнительная помощь

Если проблема не решается:
1. Проверьте версию Node.js (должна быть 16+)
2. Проверьте версию Expo CLI: `npx expo --version`
3. Убедитесь, что вы используете правильную версию Expo SDK (50)

