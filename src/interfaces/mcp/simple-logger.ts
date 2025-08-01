/**
 * Simple Logger for MCP Server
 * Standalone logger to avoid dependency issues
 */

export interface SimpleLogger {
  debug(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
}

export function createLogger(name: string): SimpleLogger {
  const prefix = `[${name}]`;
  
  return {
    debug(message: string, meta?: any): void {
      if (process.env.DEBUG || process.env.MCP_DEBUG) {
        console.error(`${prefix} DEBUG: ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
      }
    },
    
    info(message: string, meta?: any): void {
      console.error(`${prefix} INFO: ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
    },
    
    warn(message: string, meta?: any): void {
      console.error(`${prefix} WARN: ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
    },
    
    error(message: string, meta?: any): void {
      console.error(`${prefix} ERROR: ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
    }
  };
}