import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { db } from '../database/index.js'
import { bootstrap } from '../bootstrap.js'

const app = new Hono()
.use(logger())
.use(cors())
.basePath('/api')

import { authRouter } from './routers/auth.router.js'
import { taskRouter } from './routers/task.router.js'
import { taskStatusRouter } from './routers/task-status.router.js'
import { taskAssignmentRouter } from './routers/task-assignment.router.js'
import { userRouter } from "./routers/user.router.js";
import { userRoleRouter } from "./routers/user-role.router.js";
import { permissionRouter } from "./routers/permission.router.js";
import { rolePermissionRouter } from "./routers/role-permission.router.js";
import { notificationRouter } from './routers/notification.router.js'

app
.route('/auth', authRouter(bootstrap.api.controllers.authController))
.route("/tasks", taskRouter(bootstrap.api.controllers.taskController))
.route('/task-statuses', taskStatusRouter(bootstrap.api.controllers.taskStatusController))
.route('/task-assignments', taskAssignmentRouter(bootstrap.api.controllers.taskAssignmentController))
.route("/users", userRouter(bootstrap.api.controllers.userController))
.route("/user-roles", userRoleRouter(bootstrap.api.controllers.userRoleController))
.route("/permissions", permissionRouter(bootstrap.api.controllers.permissionController))
.route("/role-permissions", rolePermissionRouter(bootstrap.api.controllers.rolePermissionController))
.route('/notification', notificationRouter(bootstrap.api.controllers.notificationController))

// Global handlers
import { errorHandler } from './middlewares/error-handler.js'
import { notFound } from './middlewares/not-found.js'

app
.onError(errorHandler)
.notFound(notFound)

serve({
  fetch: app.fetch,
  port: Number(process.env.PORT!)
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
