import { defineConfig } from 'drizzle-kit';
console.log('DATABASE_URL', process.env.DATABASE_URL);
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/database/schema',
  out: './src/database/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'false',
  },
});
