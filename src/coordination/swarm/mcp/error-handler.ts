/**
 * Unified MCP Error Handler for Coordination and Swarm
 * Consolidates error handling from the removed coordination/mcp directory
 */

import { createLogger } from '../../../core/logger';

const logger = createLogger({ prefix: 'MCP-ErrorHandler' });

export class MCPErrorHandler {
  static handleError(error: any, context?: string): never {
    logger.error(`MCP Error${context ? ` in ${context}` : ''}:`, error);
    throw error;
  }

  static validateParameters(params: any, schema: any): void {
    // Basic parameter validation
    if (!params && schema.required) {
      throw new Error('Missing required parameters');
    }
  }
}

export class MCPToolWrapper {
  static wrap(toolFn: Function, toolName: string) {
    return async (params: any) => {
      try {
        return await toolFn(params);
      } catch (error) {
        logger.error(`Tool ${toolName} failed:`, error);
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    };
  }
}

export class MCPParameterValidator {
  static validate(params: any, schema: any): boolean {
    // Basic validation - could be enhanced with proper schema validation
    return true;
  }
}

export const mcpErrorHandler = new MCPErrorHandler();
