/**
 * Simple Logger for React CLI
 * 
 * Simplified logger implementation to avoid dependency issues
 */

export interface SimpleLogger {
  debug: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}

export function createSimpleLogger(prefix?: string): SimpleLogger {
  const getTimestamp = () => new Date().toISOString();
  const formatMessage = (level: string, message: string) => {
    const timestamp = getTimestamp();
    const prefixStr = prefix ? `[${prefix}] ` : '';
    return `${timestamp} ${level.toUpperCase()} ${prefixStr}${message}`;
  };

  return {
    debug: (message: string, ...args: any[]) => {
      if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
        console.debug(formatMessage('debug', message), ...args);
      }
    },
    info: (message: string, ...args: any[]) => {
      console.info(formatMessage('info', message), ...args);
    },
    warn: (message: string, ...args: any[]) => {
      console.warn(formatMessage('warn', message), ...args);
    },
    error: (message: string, ...args: any[]) => {
      console.error(formatMessage('error', message), ...args);
    },
  };
}