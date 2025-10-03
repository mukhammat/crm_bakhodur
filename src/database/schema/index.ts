import { relations } from 'drizzle-orm';
import { pgTable as table } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';

export const userRoleEnum = t.pgEnum('user_role', ['admin', 'manager', 'worker']);

export const users = table("users", {
  id: t.uuid().primaryKey().notNull().defaultRandom(),
  role: userRoleEnum("role").default("manager").notNull(),
  email: t.varchar('email', { length: 100 }).notNull().unique(),
  hash: t.varchar('hash').notNull(),
  name: t.varchar('name', { length: 100 }).notNull(),
  isActive: t.boolean('is_active').notNull().default(true),
  telegramId: t.integer('telegram_id').unique(),
});

export const taskStatusEnum = t.pgEnum('task_status', ['pending', 'in_progress', 'completed']);

export const tasks = table("tasks", {
  id: t.uuid().primaryKey().notNull().defaultRandom(),
  title: t.varchar().notNull(),
  description: t.text('description').notNull(),
  status: taskStatusEnum('status').notNull().default('pending'),
  createdAt: t.timestamp('created_at').notNull().defaultNow(),
  dueDate: t.timestamp('due_date'), // Срок выполнения задачи
  priority: t.integer('priority').notNull().default(0), // Приоритет задачи
  createdBy: t.uuid('created_by')
  .notNull()
  .references(() => users.id, { onDelete: 'cascade' }),
});

export const taskAssignments = table("task_assignments", {
  id: t.uuid().primaryKey().notNull().defaultRandom(),
  taskId: t.uuid('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  userId: t.uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
}, (table) => ({
  uniq: t.unique().on(table.taskId, table.userId)
}));

export const taskAssignmentsRelations = relations(taskAssignments, ({ one }) => ({
  task: one(tasks, {
    fields: [taskAssignments.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [taskAssignments.userId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ many, one }) => ({
  assignments: many(taskAssignments),
  createdBy: one(users, {
    fields: [tasks.createdBy],
    references: [users.id],
  }),
}))