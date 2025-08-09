/**
 * @file Interface implementation: mcp-logger
 */


import { getLogger } from '../config/logging-config';

const logger = getLogger('interfaces-mcp-mcp-logger');
/**
 * MCP Logger for MCP Server.
 * Standalone logger to avoid dependency issues.
 */

export interface MCPLogger {
  debug(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
}

export function createLogger(name: string): MCPLogger {
  const prefix = `[${name}]`;

  return {
    debug(message: string, meta?: any): void {
      if (process.env['DEBUG'] || process.env['MCP_DEBUG']) {
        logger.error(`${prefix} DEBUG: ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
      }
    },

    info(message: string, meta?: any): void {
      logger.error(`${prefix} INFO: ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
    },

    warn(message: string, meta?: any): void {
      logger.error(`${prefix} WARN: ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
    },

    error(message: string, meta?: any): void {
      logger.error(`${prefix} ERROR: ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
    },
  };
}
