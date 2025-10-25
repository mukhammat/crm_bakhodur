import { relations } from 'drizzle-orm';
import { pgTable as table } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';

export const taskStatuses = table("task_statuses", {
  id: t.serial().primaryKey(),
  title: t.varchar().unique().notNull()
})

export const userRoles = table("user_roles", {
  id: t.serial().primaryKey(),
  title: t.varchar().unique().notNull()
});

export const users = table("users", {
  id: t.uuid().primaryKey().notNull().defaultRandom(),
  roleId: t.serial('role_id')
  //.notNull()
  .references(() => userRoles.id),
  email: t.varchar('email', { length: 100 }).notNull().unique(),
  hash: t.varchar('hash').notNull(),
  name: t.varchar('name', { length: 100 }).notNull(),
  isActive: t.boolean('is_active').notNull().default(true),
  telegramId: t.integer('telegram_id').unique(),
});

export const userRolesRelations = relations(userRoles, ({ many }) => ({
  users: many(users),
}));

export const usersRelations = relations(users, ({ one }) => ({
  role: one(userRoles, {
    fields: [users.roleId],
    references: [userRoles.id],
  }),
}));

export const taskStatusesRelations = relations(taskStatuses, ({ many }) => ({
  tasks: many(tasks),
}));

export const tasks = table("tasks", {
  id: t.uuid().primaryKey().notNull().defaultRandom(),
  title: t.varchar().notNull(),
  description: t.text('description').notNull(),
  statusId: t.serial('status_id').default(1)
  //.notNull()
  .references(() => taskStatuses.id),
  createdAt: t.timestamp('created_at').notNull().defaultNow(),
  dueDate: t.timestamp('due_date'), // Срок выполнения задачи
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
  status: one(taskStatuses, {
    fields: [tasks.statusId],
    references: [taskStatuses.id],
  }),
}))