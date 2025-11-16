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

  fcmToken: t.text('fcm_token')
});

export const tasks = table("tasks", {
  id: t.uuid().primaryKey().notNull().defaultRandom(),
  title: t.varchar().notNull(),
  description: t.text('description').notNull(),
  statusId: t.serial('status_id')
  //.notNull()
  .references(() => taskStatuses.id),
  createdAt: t.timestamp('created_at').notNull().defaultNow(),
  dueDate: t.timestamp('due_date'), // Task due date
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

export const permissions = table('permissions', {
  id: t.uuid().primaryKey().notNull().defaultRandom(),
  title: t.varchar().notNull().unique(),
})

export const rolePermissions = table('role_permissions', {
  id: t.uuid().primaryKey().notNull().defaultRandom(),
  roleId: t.serial('role_id').references(() => userRoles.id, { onDelete: 'cascade' }),
  permissionId: t.uuid('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' })
}, (table) => ({
  uniq: t.unique().on(table.permissionId, table.roleId)
}))

export const notifications = table('notifications', {
  id: t.uuid().primaryKey().notNull().defaultRandom(),
  userId: t.uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  // message: t.text().notNull(),
  // isRead: t.boolean('is_read').notNull().default(false),
  createdAt: t.timestamp('created_at').notNull().defaultNow(),
});

// *
// *
// * Relations
// *
// *
// *

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

export const userRolesRelations = relations(userRoles, ({ many }) => ({
  users: many(users),
  rolePermissions: many(rolePermissions)
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(userRoles, {
    fields: [users.roleId],
    references: [userRoles.id],
  }),
}));

export const taskStatusesRelations = relations(taskStatuses, ({ many }) => ({
  tasks: many(tasks),
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

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions)
}))

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(userRoles, {
    fields: [rolePermissions.roleId],
    references: [userRoles.id]
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id]
  })
}))

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id]
  }),
}));
