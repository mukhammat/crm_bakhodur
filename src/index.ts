import 'dotenv/config.js'
import { validateEnv } from './config/env.js'
validateEnv()

import './events/index.js'
import './database/index.js'
import './infrastructure/http/app.js'
import './infrastructure/t-bot/index.js'
import './bootstrap.js'
import './infrastructure/cron/index.js'
import './database/seeds/index.js'