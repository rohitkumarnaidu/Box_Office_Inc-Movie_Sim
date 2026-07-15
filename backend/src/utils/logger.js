const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL] ?? LOG_LEVELS.INFO;

const formatTimestamp = () => new Date().toISOString();

const formatMessage = (level, message, meta) => {
  const parts = [`[${formatTimestamp()}]`, `[${level}]`, message];
  if (meta) {
    parts.push(JSON.stringify(meta, null, 0));
  }
  return parts.join(" ");
};

export const logger = {
  error(message, meta) {
    if (currentLevel >= LOG_LEVELS.ERROR) {
      console.error(formatMessage("ERROR", message, meta));
    }
  },

  warn(message, meta) {
    if (currentLevel >= LOG_LEVELS.WARN) {
      console.warn(formatMessage("WARN", message, meta));
    }
  },

  info(message, meta) {
    if (currentLevel >= LOG_LEVELS.INFO) {
      console.info(formatMessage("INFO", message, meta));
    }
  },

  debug(message, meta) {
    if (currentLevel >= LOG_LEVELS.DEBUG) {
      console.debug(formatMessage("DEBUG", message, meta));
    }
  },
};

export default logger;
