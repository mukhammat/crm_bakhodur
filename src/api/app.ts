import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { db } from '../database/index.js'

const apiApp = new Hono()
.use(logger())
.use(cors())


import { authRouter } from './routers/auth.router.js'
import { taskRouter } from './routers/task.router.js'
import { userRouter } from "./routers/user.router.js";
apiApp
.route('/auth', authRouter(db))
.route("/tasks", taskRouter(db))
.route("/users", userRouter(db))

// Global handlers
import { errorHandler } from './middleware/error-handler.js'
import { notFound } from './middleware/not-found.js'

apiApp
.onError(errorHandler)
.notFound(notFound)

const app = new Hono()
.route('/api', apiApp)
.use('/*', serveStatic({
  root: './static',
  rewriteRequestPath: (path) => {
    if (path.startsWith('/api/')) {
      return path
    }
    if (path.match(/\.[a-zA-Z0-9]+$/)) {
      return path
    }

    return '/index.html'
  }
}))

serve({
  fetch: app.fetch,
  port: 3322
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
