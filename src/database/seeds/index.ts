import * as schema from '../schema/index.js'
import { db } from '../index.js'
import { eq } from "drizzle-orm";

async function main() {
  console.log('Seeding database...');

  const ROLES = {Admin: 'ADMIN', Manager: 'MANAGER', Worker: 'WORKER'} as const;
  const STATUSES = {New: 'NEW', InProgress: 'IN_PROGRESS', Completed: 'COMPLETED'} as const;
  const PERMISSIONS = {
    ViewTasks: 'VIEW_TASKS',
    CreateTasks: 'CREATE_TASKS',
    UpdateTasks: 'UPDATE_TASKS',
    DeleteTasks: 'DELETE_TASKS',
    ViewUsers: 'VIEW_USERS',
    CreateUsers: 'CREATE_USERS',
    UpdateUsers: 'UPDATE_USERS',
    DeleteUsers: 'DELETE_USERS',
    ViewReports: 'VIEW_REPORTS',
    ManagePermissions: 'MANAGE_PERMISSIONS'
  } as const;

  // Insert user roles
  const userRoles = await db.insert(schema.userRoles).values([
    { title: ROLES.Admin},
    { title: ROLES.Manager },
    { title: ROLES.Worker },
  ])
  .onConflictDoNothing()
  .returning()

  // Insert task statuses
  const taskStatuses = await db.insert(schema.taskStatuses).values([
    { title: STATUSES.New},
    { title: STATUSES.InProgress },
    { title: STATUSES.Completed },
  ])
  .onConflictDoNothing()
  .returning()

  // Insert permissions
  const permissions = await db.insert(schema.permissions).values([
    { title: PERMISSIONS.ViewTasks },
    { title: PERMISSIONS.CreateTasks },
    { title: PERMISSIONS.UpdateTasks },
    { title: PERMISSIONS.DeleteTasks },
    { title: PERMISSIONS.ViewUsers },
    { title: PERMISSIONS.CreateUsers },
    { title: PERMISSIONS.UpdateUsers },
    { title: PERMISSIONS.DeleteUsers },
    { title: PERMISSIONS.ViewReports },
    { title: PERMISSIONS.ManagePermissions },
  ])
  .onConflictDoNothing()
  .returning()

  // Get roles
  const adminRole = await db.query.userRoles.findFirst({
    where: eq(schema.userRoles.title, ROLES.Admin)
  });

  const managerRole = await db.query.userRoles.findFirst({
    where: eq(schema.userRoles.title, ROLES.Manager)
  });

  const workerRole = await db.query.userRoles.findFirst({
    where: eq(schema.userRoles.title, ROLES.Worker)
  });

  // Assign permissions to roles
  if (adminRole && permissions.length > 0) {
    const adminPermissions = permissions.map(p => ({
      roleId: adminRole.id,
      permissionId: p.id
    }));
    
    await db.insert(schema.rolePermissions)
      .values(adminPermissions)
      .onConflictDoNothing();
  }

  if (managerRole && permissions.length > 0) {
    const managerPermissions = permissions
      .filter(p => [
        PERMISSIONS.ViewTasks, 
        PERMISSIONS.CreateTasks, 
        PERMISSIONS.UpdateTasks,
        PERMISSIONS.ViewUsers,
        PERMISSIONS.ViewReports
      ].includes(p.title as any))
      .map(p => ({
        roleId: managerRole.id,
        permissionId: p.id
      }));
    
    await db.insert(schema.rolePermissions)
      .values(managerPermissions)
      .onConflictDoNothing();
  }

  if (workerRole && permissions.length > 0) {
    const workerPermissions = permissions
      .filter(p => [
        PERMISSIONS.ViewTasks,
        PERMISSIONS.UpdateTasks,
        PERMISSIONS.ViewUsers
      ].includes(p.title as any))
      .map(p => ({
        roleId: workerRole.id,
        permissionId: p.id
      }));
    
    await db.insert(schema.rolePermissions)
      .values(workerPermissions)
      .onConflictDoNothing();
  }

  // Create admin user
  if (adminRole) {
    await db.insert(schema.users).values({
      email: 'dosnet2200@gmail.com',
      name: 'Bakhodur',
      hash: '$2b$10$vf75cfhn7GH0afZboAcPK.uKj4HhLdR/bsii7f76vhUEwLv7UZa.C',
      roleId: adminRole.id
    })
    .onConflictDoNothing();
  }

  console.log('Seeding completed!');
}

main();