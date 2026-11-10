// utils/logger.js — TEMPORARY SHIM
const log = (level, message, meta) => {
  const line = meta ? `${message} ${JSON.stringify(meta)}` : message;
  if (level === 'error') console.error(`[${level}] ${line}`);
  else if (level === 'warn') console.warn(`[${level}] ${line}`);
  else console.log(`[${level}] ${line}`);
};

const logger = {
  error: (message, meta) => log('error', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  info: (message, meta) => log('info', message, meta),
  debug: (message, meta) => log('debug', message, meta),
  child: (meta) => ({
    error: (message, extra) => log('error', message, { ...meta, ...extra }),
    warn: (msg, extra) => log('warn', msg, { ...meta, ...extra }),
    info: (msg, extra) => log('info', msg, { ...meta, ...extra }),
    debug: (msg, extra) => log('debug', msg, { ...meta, ...extra }),
  }),
};

export default logger;