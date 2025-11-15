import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/index.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Обработка ошибок подключения
pool.on('error', (err) => {
  console.error('Error in pull db:', err);
});

export const db = drizzle({
  client: pool,
  casing: 'snake_case',
  schema,
});

// Connect db
pool.connect()
  .then((client) => {
    console.log('Db connected');
    client.release();
  })
  .catch((error) => {
    console.error('Error db connect:', error.message);
    console.error('Check DATABASE_URL and db server');
    process.exit(1);
  });

export type DrizzleClient = typeof db;
export type TransactionType = Parameters<Parameters<DrizzleClient['transaction']>[0]>[0];

export * from './schema/index.js';
export * as schema from './schema/index.js';
export * from './helper.js';
export default db;
