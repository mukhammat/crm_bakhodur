# --- Этап сборки сервера ---
FROM node:20-slim AS builder
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем все зависимости (dev + prod)
RUN npm ci

# Копируем весь backend код
COPY . .

# Сборка TypeScript проекта
RUN npm run build

# --- Финальный продакшен-образ ---
FROM node:20-slim AS server
WORKDIR /app

# Копируем только prod зависимости
COPY package*.json ./
RUN npm ci --omit=dev

# Копируем скомпилированный код из builder
COPY --from=builder /app/dist ./dist

# Копируем остальные нужные файлы (если есть конфиги)
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/index.js"]
