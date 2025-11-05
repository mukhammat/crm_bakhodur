/**
 * Валидация переменных окружения при старте приложения
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'SECRET_KEY',
  'TELEGRAM_BOT_TOKEN',
] as const;

const optionalEnvVars = {
  PORT: '3000',
  NODE_ENV: 'development',
  CORS_ORIGIN: 'http://localhost:5173,http://localhost:3000',
} as const;

export function validateEnv(): void {
  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.error('Ошибка: Отсутствуют обязательные переменные окружения:');
    missing.forEach(envVar => {
      console.error(`   - ${envVar}`);
    });
    console.error('\nПожалуйста, создайте файл .env и укажите все необходимые переменные.');
    console.error('Смотрите .env.example для примера.\n');
    process.exit(1);
  }

  // Устанавливаем значения по умолчанию для опциональных переменных
  for (const [key, defaultValue] of Object.entries(optionalEnvVars)) {
    if (!process.env[key]) {
      process.env[key] = defaultValue;
    }
  }

  // Проверка SECRET_KEY на безопасность
  if (process.env.SECRET_KEY && process.env.SECRET_KEY.length < 32) {
    console.warn('Предупреждение: SECRET_KEY должен быть длиной минимум 32 символа для безопасности');
  }

  // Проверка NODE_ENV
  if (process.env.NODE_ENV === 'production' && !process.env.SECRET_KEY?.includes('your_secret_key')) {
    console.log('Переменные окружения проверены');
  } else if (process.env.NODE_ENV === 'production') {
    console.warn('Предупреждение: Используется дефолтный SECRET_KEY. Измените его в продакшене!');
  }
}

