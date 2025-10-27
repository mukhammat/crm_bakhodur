import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { db } from '../database/index.js'

const app = new Hono()
.use(logger())
.use(cors())
.basePath('/api')

import { authRouter } from './routers/auth.router.js'
import { taskRouter } from './routers/task.router.js'
import { userRouter } from "./routers/user.router.js";
import { userRoleRouter } from "./routers/user-role.router.js";

app
.route('/auth', authRouter(db))
.route("/tasks", taskRouter(db))
.route("/users", userRouter(db))
.route("/user-roles", userRoleRouter(db))

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
