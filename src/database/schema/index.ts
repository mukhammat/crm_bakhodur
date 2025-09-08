import { pgTable as table } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';

export const userRoleEnum = t.pgEnum('user_role', ['admin', 'manager', 'worker']);

export const users = table("users", {
  id: t.uuid().primaryKey().notNull().defaultRandom(),
  role: userRoleEnum("role").default("manager").notNull(),
  email: t.varchar('email', { length: 100 }).notNull().unique(),
  hash: t.varchar('hash').notNull(),
  isActive: t.boolean('is_active').notNull().default(true),
});

export const managers = table("managers", {
  id: t.uuid().primaryKey().notNull().defaultRandom(),
  userId: t.uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  name: t.varchar('name', { length: 100 }).notNull(),
});

export const workers = table("workers", {
  id: t.uuid().primaryKey().notNull().defaultRandom(),
  userId: t.uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  telegramId: t.integer('telegram_id').notNull().unique(),
  name: t.varchar('name', { length: 100 }).notNull(),
});

export const taskStatusEnum = t.pgEnum('task_status', ['pending', 'in_progress', 'completed']);

export const tasks = table("tasks", {
  id: t.uuid().primaryKey().notNull().defaultRandom(),
  description: t.text('description').notNull(),
  status: taskStatusEnum('status').notNull().default('pending'),
  createdBy: t.uuid('created_by')
  .notNull()
  .references(() => users.id, { onDelete: 'cascade' }),
});

export const taskAssignments = table("task_assignments", {
  id: t.uuid().primaryKey().notNull().defaultRandom(),
  taskId: t.uuid('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  workerId: t.uuid('worker_id').notNull().references(() => workers.id, { onDelete: 'cascade' }),
});