# CRM Bakhodur - Frontend

Современный фронтенд для CRM системы, построенный на React + TypeScript + Vite.

## 🚀 Технологии

- **React 18** - UI библиотека
- **TypeScript** - Типизированный JavaScript
- **Vite** - Сборщик
- **Tailwind CSS** - Utility-first CSS фреймворк
- **Zustand** - State management
- **React Router** - Маршрутизация
- **Axios** - HTTP клиент
- **Lucide React** - Иконки
- **React Hot Toast** - Уведомления

## 📦 Установка

```bash
npm install
```

## 🏃 Запуск

```bash
# Разработка
npm run dev

# Сборка
npm run build

# Предпросмотр production сборки
npm run preview
```

## 📁 Структура проекта

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/       # Переиспользуемые компоненты
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   └── LoadingSpinner.tsx
│   ├── pages/           # Страницы приложения
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── TasksPage.tsx
│   │   └── UsersPage.tsx
│   ├── stores/          # Zustand stores
│   │   └── authStore.ts
│   ├── lib/             # Утилиты
│   │   └── api.ts
│   ├── config/          # Конфигурация
│   │   └── api.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🎯 Основные функции

### Аутентификация
- Вход в систему
- Управление сессией
- Автоматическое перенаправление

### Панель управления
- Статистика по задачам
- Последние задачи
- Активные пользователи

### Управление задачами
- Создание задач
- Редактирование задач
- Удаление задач
- Фильтрация и поиск
- Статусы: Ожидание, В работе, Выполнено

### Управление пользователями
- Просмотр пользователей
- Удаление пользователей
- Генерация ключей регистрации

## 🔐 Роли и доступ

### ADMIN
- Полный доступ ко всем функциям

### MANAGER
- Управление задачами
- Просмотр пользователей

### WORKER
- Ограниченный доступ (через Telegram бот)

## 🌐 API

Базовый URL: `http://localhost:3000/api`

Все запросы к защищенным эндпоинтам требуют JWT токен в заголовке:
```
Authorization: Bearer <token>
```

Подробная документация API доступна в файле `API_DOCUMENTATION.md` в корне проекта.

## 🎨 Стилизация

Приложение использует Tailwind CSS с кастомной палитрой цветов. 
Основные цвета в `tailwind.config.js`.

Компоненты стилизованы через utility классы и глобальные стили в `index.css`.

## 🔄 State Management

Zustand используется для управления состоянием аутентификации (`authStore`).

## 📱 Адаптивность

Приложение полностью адаптивно и работает на:
- Desktop (1920px+)
- Laptop (1024px+)
- Tablet (768px+)
- Mobile (320px+)
