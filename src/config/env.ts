/**
 * Environment variables validation on application startup
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'SECRET_KEY',
  'TELEGRAM_BOT_TOKEN',
] as const;

const optionalEnvVars = {
  PORT: '3000',
  NODE_ENV: 'development',
  CORS_ORIGIN: 'http://localhost:5173,http://localhost:3000',
} as const;

export function validateEnv(): void {
  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.error('Error: Missing required environment variables:');
    missing.forEach(envVar => {
      console.error(`   - ${envVar}`);
    });
    console.error('\nPlease create a .env file and specify all required variables.');
    console.error('See .env.example for reference.\n');
    process.exit(1);
  }

  // Set default values for optional variables
  for (const [key, defaultValue] of Object.entries(optionalEnvVars)) {
    if (!process.env[key]) {
      process.env[key] = defaultValue;
    }
  }

  // Check SECRET_KEY security
  if (process.env.SECRET_KEY && process.env.SECRET_KEY.length < 32) {
    console.warn('Warning: SECRET_KEY must be at least 32 characters long for security');
  }

  // Check NODE_ENV
  if (process.env.NODE_ENV === 'production' && !process.env.SECRET_KEY?.includes('your_secret_key')) {
    console.log('Environment variables validated');
  } else if (process.env.NODE_ENV === 'production') {
    console.warn('Warning: Using default SECRET_KEY. Change it in production!');
  }
}

