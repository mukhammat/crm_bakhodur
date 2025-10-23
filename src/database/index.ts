import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/index.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle({
  client: pool,
  casing: 'snake_case',
  schema,
});

db.$client.connect().finally(() => {
  console.log('Бд запущена...')
}).catch((error) => {
  console.log('Ошибка запуска бд: ', error)
});

export type DrizzleClient = typeof db;
export type TransactionType = Parameters<Parameters<DrizzleClient['transaction']>[0]>[0];

export * from './schema/index.js';
export * as schema from './schema/index.js';
export * from './helper.js';
export default db;
