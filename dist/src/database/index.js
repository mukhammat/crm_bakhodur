import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/index.js';
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});
export const db = drizzle({
    client: pool,
    casing: 'snake_case',
    schema,
});
db.$client.connect().finally(() => {
    console.log('Бд запущена...');
}).catch((error) => {
    console.log('Ошибка запуска бд: ', error);
});
export * from './schema/index.js';
export * from './helper.js';
export default db;
