# Настройка уведомлений Firebase

## Бэкенд

Бэкенд уже настроен и использует Firebase Admin SDK для отправки уведомлений.

### Переменные окружения
Убедитесь, что в `.env` есть:
```
FIREBASE_SERVICE_ACCOUNT_PATH=./src/infrastructure/firebase/serviceAccount.json
```

## Мобильное приложение (Expo)

### Установка зависимостей
```bash
cd mobile
npm install
```

### Настройка
1. Убедитесь, что в `app.json` указан правильный `projectId` (уже настроен)
2. Уведомления будут автоматически регистрироваться при входе пользователя

### Тестирование
- Запустите приложение: `npm start`
- При входе система автоматически запросит разрешение на уведомления
- Токен будет отправлен на бэкенд автоматически

## Фронтенд (Web)

### Установка зависимостей
```bash
cd frontend
npm install
```

### Настройка Firebase для Web

1. Перейдите в Firebase Console: https://console.firebase.google.com/
2. Выберите проект `crm-bakhodur`
3. Перейдите в Project Settings > General
4. В разделе "Your apps" найдите или создайте Web app
5. Скопируйте конфигурацию Firebase

### Настройка переменных окружения

Создайте файл `frontend/.env` или добавьте в `frontend/.env.local`:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=crm-bakhodur
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_VAPID_KEY=your-vapid-key
```

### Получение VAPID ключа

1. В Firebase Console перейдите в Project Settings > Cloud Messaging
2. В разделе "Web configuration" найдите "Web Push certificates"
3. Если ключа нет, нажмите "Generate key pair"
4. Скопируйте ключ в `VITE_FIREBASE_VAPID_KEY`

### Настройка Service Worker (опционально)

Для работы уведомлений в фоновом режиме создайте файл `frontend/public/firebase-messaging-sw.js`:

```javascript
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'your-api-key',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'crm-bakhodur',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: 'your-sender-id',
  appId: 'your-app-id'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

## Типы уведомлений

### 1. Назначение задачи (`task_assigned`)
Отправляется когда пользователю назначается новая задача.

**Данные:**
- `type`: `task_assigned`
- `taskId`: ID задачи
- `userId`: ID пользователя

### 2. Напоминание о задаче (`task_reminder`)
Отправляется как напоминание о задаче с установленным сроком выполнения.

**Данные:**
- `type`: `task_reminder`
- `taskId`: ID задачи
- `userId`: ID пользователя

## Проверка работы

1. Войдите в систему через мобильное приложение или веб-интерфейс
2. Убедитесь, что токен отправлен на бэкенд (проверьте логи)
3. Создайте задачу и назначьте её пользователю
4. Пользователь должен получить уведомление

## Отладка

### Мобильное приложение
- Проверьте логи в консоли Expo
- Убедитесь, что разрешения на уведомления предоставлены
- Проверьте, что токен отправлен на бэкенд

### Фронтенд
- Откройте DevTools > Application > Service Workers
- Проверьте консоль браузера на наличие ошибок
- Убедитесь, что все переменные окружения установлены

### Бэкенд
- Проверьте логи в `logs/application.log`
- Убедитесь, что Firebase инициализирован корректно
- Проверьте, что у пользователя есть `fcmToken` в базе данных

