// lib/logger.js
// Environment-based logging utility.
// In production, only warnings and errors are logged.
// In development, all levels (debug, info, warn, error) are logged.

const isDev = process.env.NODE_ENV !== 'production';

function timestamp() {
  return new Date().toISOString();
}

const logger = {
  /** Debug-level: only logged in development */
  debug(...args) {
    if (isDev) {
      console.log(`[${timestamp()}] [DEBUG]`, ...args);
    }
  },

  /** Info-level: only logged in development */
  info(...args) {
    if (isDev) {
      console.log(`[${timestamp()}] [INFO]`, ...args);
    }
  },

  /** Warning-level: always logged */
  warn(...args) {
    console.warn(`[${timestamp()}] [WARN]`, ...args);
  },

  /** Error-level: always logged */
  error(...args) {
    console.error(`[${timestamp()}] [ERROR]`, ...args);
  },
};

export default logger;
