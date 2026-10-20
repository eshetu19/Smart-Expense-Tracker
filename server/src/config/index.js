
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const required = (key) => {
  const value = process.env[key];
  if (value === undefined || value === '') {
    throw new Error(` Missing required environment variable: ${key}`);
  }
  return value;
};

const optional = (key, fallback) => {
  const value = process.env[key];
  return value === undefined || value === '' ? fallback : value;
};

const toNumber = (value, key) => {
  const n = Number(value);
  if (Number.isNaN(n)) {
    throw new Error(` Env var ${key} must be a number, got: ${value}`);
  }
  return n;
};

const toBoolean = (value) => {
  return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
};

const NODE_ENV = optional('NODE_ENV', 'development');
const isProduction = NODE_ENV === 'production';
const isDevelopment = NODE_ENV === 'development';
const isTest = NODE_ENV === 'test';

const config = {
  env: NODE_ENV,
  isProduction,
  isDevelopment,
  isTest,

  app: {
    name: optional('APP_NAME', 'Smart Expense Tracker'),
    port: toNumber(optional('PORT', '5000'), 'PORT'),
    apiPrefix: optional('API_PREFIX', '/api/v1'),
    clientUrl: optional('CLIENT_URL', 'http://localhost:5173'),
  },

  db: {
    uri: required('MONGO_URI'),
    options: {
      maxPoolSize: toNumber(optional('DB_POOL_SIZE', '10'), 'DB_POOL_SIZE'),
      serverSelectionTimeoutMS: toNumber(
        optional('DB_TIMEOUT_MS', '5000'),
        'DB_TIMEOUT_MS'
      ),
    },
  },

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpiresIn: optional('JWT_ACCESS_EXPIRES_IN', '15m'),
    refreshExpiresInDays: toNumber(optional('JWT_REFRESH_EXPIRES_IN_DAYS', '7'), 'JWT_REFRESH_EXPIRES_IN_DAYS'),
  },

  security: {
    bcryptSaltRounds: toNumber(
      optional('BCRYPT_SALT_ROUNDS', '10'),
      'BCRYPT_SALT_ROUNDS'
    ),
    rateLimitWindowMs: toNumber(
      optional('RATE_LIMIT_WINDOW_MS', '900000'),
      'RATE_LIMIT_WINDOW_MS'
    ),
    rateLimitMax: toNumber(
      optional('RATE_LIMIT_MAX', '100'),
      'RATE_LIMIT_MAX'
    ),
  },

  cors: {
    origin: optional('CORS_ORIGIN', 'http://localhost:5173').split(','),
  },

  mail: {
    host: optional('SMTP_HOST', ''),
    port: toNumber(optional('SMTP_PORT', '587'), 'SMTP_PORT'),
    user: optional('SMTP_USER', ''),
    pass: optional('SMTP_PASS', ''),
    from: optional('MAIL_FROM', 'no-reply@expensetracker.com'),
  },

  upload: {
    dir: optional('UPLOAD_DIR', 'uploads'),
    maxFileSizeMb: toNumber(
      optional('MAX_FILE_SIZE_MB', '5'),
      'MAX_FILE_SIZE_MB'
    ),
  },

  logging: {
    level: optional('LOG_LEVEL', isProduction ? 'info' : 'debug'),
  },
};

if (isProduction) {
  if (config.jwt.accessSecret.length < 32) {
    throw new Error(' JWT_ACCESS_SECRET must be at least 32 chars in production');
  }
  if (config.jwt.refreshSecret.length < 32) {
    throw new Error('JWT_REFRESH_SECRET must be at least 32 chars in production');
  }
}

const deepFreeze=(obj)=>{
    Object.keys(obj).forEach((key)=>{
        const value=obj[key]
        if(value && typeof value==='object')deepFreeze(value);

        
    })
    return object.freeze(obj);
}
export default deepFreeze(config);