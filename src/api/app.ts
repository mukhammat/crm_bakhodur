import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { db } from '../database/index.js'

const app = new Hono()
.use(logger())
.use(cors())

import { authRouter } from './routers/auth.router.js'
import { taskRouter } from './routers/task.router.js'
import { userRouter } from "./routers/user.router.js";

app
.route('/auth', authRouter(db))
.route("/tasks", taskRouter(db))
.route("/users", userRouter(db))

// Global handlers
import { errorHandler } from './middleware/error-handler.js'
import { notFound } from './middleware/not-found.js'

app
.onError(errorHandler)
.notFound(notFound)

serve({
  fetch: app.fetch,
  port: 3322
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
