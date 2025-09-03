/**
 * Simple logger implementation for compliance package
 * This is a temporary solution to avoid dependency issues
 */
export interface Logger {
  info: (message: string, meta?: any) => void;
  warn: (message: string, meta?: any) => void;
  error: (message: string, meta?: any) => void;
  debug: (message: string, meta?: any) => void;
}

export function getLogger(name: string): Logger {
  return {
    info: (message: string, meta?: any) => {
      console.log(`[INFO] ${name}: ${message}`, meta ? JSON.stringify(meta) : '');
    },
    warn: (message: string, meta?: any) => {
      console.warn(`[WARN] ${name}: ${message}`, meta ? JSON.stringify(meta) : '');
    },
    error: (message: string, meta?: any) => {
      console.error(`[ERROR] ${name}: ${message}`, meta ? JSON.stringify(meta) : '');
    },
    debug: (message: string, meta?: any) => {
      console.log(`[DEBUG] ${name}: ${message}`, meta ? JSON.stringify(meta) : '');
    }
  };
}