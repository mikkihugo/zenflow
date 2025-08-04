/**
 * Utility logger implementation
 * Provides simple logging functionality for the application
 */

export interface Logger {
  debug(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
}

// Helper function to sanitize log meta data
function sanitizeLogMeta(meta: any): any {
  if (typeof meta === 'string') {
    // Remove newlines and carriage returns
    return meta.replace(/[\n\r]/g, '');
  } else if (typeof meta === 'object' && meta !== null) {
    // Recursively sanitize all string properties
    const sanitized: any = Array.isArray(meta) ? [] : {};
    for (const key in meta) {
      if (Object.prototype.hasOwnProperty.call(meta, key)) {
        const value = meta[key];
        if (typeof value === 'string') {
          sanitized[key] = value.replace(/[\n\r]/g, '');
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = sanitizeLogMeta(value);
        } else {
          sanitized[key] = value;
        }
      }
    }
    return sanitized;
  }
  return meta;
}

class SimpleLogger implements Logger {
  constructor(private prefix: string = '') {}

  debug(_message: string, _meta?: any): void {
    if (process.env['NODE_ENV'] === 'development') {
    }
  }

  info(_message: string, _meta?: any): void {}

  warn(message: string, meta?: any): void {
    console.warn(
      `[${new Date().toISOString()}] WARN ${this.prefix}: ${message}`,
      sanitizeLogMeta(meta) || ''
    );
  }

  error(message: string, meta?: any): void {
    console.error(
      `[${new Date().toISOString()}] ERROR ${this.prefix}: ${message}`,
      sanitizeLogMeta(meta) || ''
    );
  }
}

export function createLogger(prefix?: string): Logger {
  return new SimpleLogger(prefix);
}

export const defaultLogger = createLogger('claude-zen');
