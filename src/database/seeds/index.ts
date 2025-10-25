import * as schema from '../schema/index.js'
import { db } from '../index.js'
import { eq } from "drizzle-orm";

async function main() {
  console.log('🌱 Seeding database...');

  const ROLES = {Admin: 'ADMIN', Manager: 'MANAGER', Worker: 'WORKER'} as const;
  const STATUSES = {New: 'NEW'} as const;

  const userRoles  = await db.insert(schema.userRoles).values([
    { title: STATUSES.New},
  ])
  .onConflictDoNothing()
  .returning()

  const taskStatus  = await db.insert(schema.taskStatuses).values([
    { title: ROLES.Admin},
    { title: ROLES.Manager },
    { title: ROLES.Worker },
  ])
  .onConflictDoNothing()
  .returning()

  const adminRole = userRoles.find(r => r.title === ROLES.Admin) 
  || (await db.query.userRoles.findFirst({
    where: eq(schema.userRoles.title, ROLES.Admin)
  }));

  await db.insert(schema.users).values({
    email: 'dosnet2200@gmail.com',
    name: 'Bakhodur',
    hash: '$2b$10$vf75cfhn7GH0afZboAcPK.uKj4HhLdR/bsii7f76vhUEwLv7UZa.C',
    roleId: adminRole!.id
  })
  .onConflictDoNothing();

  console.log('🎉 Seeding completed!');
}

main();