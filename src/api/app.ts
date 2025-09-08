import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { db } from '../database/index.js'

const app = new Hono()
.basePath('/api')
.use(logger())

// Routers
import { authRouter } from './modules/auth/auth.router.js'
import { taskRouter } from './modules/task/task.router.js'
import { userRouter } from "./modules/user/user.router.js";

app
.route('/auth', authRouter(db))
.route("/tasks", taskRouter(db))
.route("/user", userRouter())


// Global handlers
import { errorHandler } from './middleware/error-handler.js'
import { notFound } from './middleware/not-found.js'


app
.onError(errorHandler)
.notFound(notFound)


serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
