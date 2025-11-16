import fs from 'fs'
import path from 'path'

export const logToFile = (message: string, filePath = 'application.log') => {
  const logsDir = path.resolve('./logs')

  // Check if logs directory exists, create if not
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true })
  }

  const fullPath = path.join(logsDir, filePath)
  const timestamp = new Date().toISOString()
  const logEntry = `${timestamp} - ${message}\n`

  fs.appendFile(fullPath, logEntry, (err) => {
    if (err) {
      console.error('Failed to write log to file:', err)
    }
  })
}
