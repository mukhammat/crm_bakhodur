import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/index.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  max: 20, // Максимальное количество клиентов в пуле
  idleTimeoutMillis: 30000, // Закрыть неактивные клиенты через 30 секунд
  connectionTimeoutMillis: 2000, // Таймаут подключения 2 секунды
});

// Обработка ошибок подключения
pool.on('error', (err) => {
  console.error('Неожиданная ошибка в пуле подключений к БД:', err);
});

export const db = drizzle({
  client: pool,
  casing: 'snake_case',
  schema,
});

// Проверка подключения к БД
pool.connect()
  .then((client) => {
    console.log('БД успешно подключена');
    client.release();
  })
  .catch((error) => {
    console.error('Ошибка подключения к БД:', error.message);
    console.error('Проверьте правильность DATABASE_URL и доступность сервера БД');
    process.exit(1);
  });

export type DrizzleClient = typeof db;
export type TransactionType = Parameters<Parameters<DrizzleClient['transaction']>[0]>[0];

export * from './schema/index.js';
export * as schema from './schema/index.js';
export * from './helper.js';
export default db;
