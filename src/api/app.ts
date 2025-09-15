import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { db } from '../database/index.js'

const apiApp = new Hono()
.use(logger())
.use(cors())

// Routers
import { authRouter } from './modules/auth/auth.router.js'
import { taskRouter } from './modules/task/task.router.js'
import { userRouter } from "./modules/user/user.router.js";
import { workerRouter } from './modules/worker/worker.router.js'

apiApp
.route('/auth', authRouter(db))
.route("/tasks", taskRouter(db))
.route("/users", userRouter(db))
.route('/workers', workerRouter(db))

// Global handlers
import { errorHandler } from './middleware/error-handler.js'
import { notFound } from './middleware/not-found.js'

apiApp
.onError(errorHandler)
.notFound(notFound)

const app = new Hono()
.route('/api', apiApp)
.use('/*', serveStatic({
  root: './static'
}))

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
