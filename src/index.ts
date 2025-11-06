import 'dotenv/config.js'
import { validateEnv } from './config/env.js'
validateEnv()

import './events/index.js'
import './database/index.js'
import './api/app.js'
import './t-bot/index.js'
import './bootstrap.js'
import './cron/index.js'
import './database/seeds/index.js'