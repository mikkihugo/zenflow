/**
 * MCP Error Handler and Middleware
 *
 * Provides comprehensive error handling for MCP tool execution
 * Integrates with the Claude-Zen error recovery and monitoring systems
 */

import {
  BaseClaudeZenError,
  FACTError,
  MCPError,
  MCPExecutionError,
  MCPTimeoutError,
  MCPValidationError,
  NetworkError,
  RAGError,
  SwarmError,
  WASMError,
} from '../../../core/errors';
import { createLogger } from '../../../core/logger';
import { ErrorMonitoring } from '../../../utils/error-monitoring';
import { ErrorRecoverySystem } from '../../../utils/error-recovery';
import type { MCPTool, MCPToolResult } from '../types/mcp-types';

const logger = createLogger({ prefix: 'MCP-ErrorHandler' });

// Initialize error monitoring and recovery systems
const errorMonitor = new ErrorMonitoring(logger);
const errorRecoveryOrchestrator = new ErrorRecoverySystem();

// ===============================
// MCP Error Context and Tracking
// ===============================

export interface MCPExecutionContext {
  toolName: string;
  sessionId?: string;
  userId?: string;
  startTime: number;
  parameters: any;
  attempt: number;
  correlationId: string;
  operationId: string;
}

export interface MCPErrorDetails {
  toolName: string;
  phase: 'validation' | 'execution' | 'post-processing';
  parameters: any;
  executionTime: number;
  memoryUsage?: number;
  recoveryAttempted: boolean;
  recoverySuccessful: boolean;
  userImpact: 'none' | 'minimal' | 'moderate' | 'severe';
}

// ===============================
// Parameter Validation Middleware
// ===============================

export class MCPParameterValidator {
  public static validateParameters(
    toolName: string,
    parameters: any,
    schema: any
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      // Check required parameters
      if (schema.required) {
        for (const requiredParam of schema.required) {
          if (!(requiredParam in parameters)) {
            errors.push(`Missing required parameter: ${requiredParam}`);
          }
        }
      }

      // Check parameter types and constraints
      if (schema.properties) {
        for (const [paramName, paramSchema] of Object.entries<any>(schema.properties)) {
          const value = parameters[paramName];

          if (value !== undefined) {
            const validation = MCPParameterValidator.validateParameter(
              paramName,
              value,
              paramSchema
            );
            if (!validation.valid) {
              errors.push(...validation.errors);
            }
          }
        }
      }

      return { valid: errors.length === 0, errors };
    } catch (error) {
      logger.error(`Parameter validation error for ${toolName}:`, error);
      return {
        valid: false,
        errors: [
          `Validation system error: ${error instanceof Error ? error.message : String(error)}`,
        ],
      };
    }
  }

  private static validateParameter(
    name: string,
    value: any,
    schema: any
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Type validation
    if (schema.type) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== schema.type) {
        errors.push(`Parameter '${name}' expected type ${schema.type}, got ${actualType}`);
        return { valid: false, errors };
      }
    }

    // String constraints
    if (schema.type === 'string') {
      if (schema.minLength && value.length < schema.minLength) {
        errors.push(`Parameter '${name}' must be at least ${schema.minLength} characters`);
      }
      if (schema.maxLength && value.length > schema.maxLength) {
        errors.push(`Parameter '${name}' must be at most ${schema.maxLength} characters`);
      }
      if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
        errors.push(`Parameter '${name}' does not match required pattern`);
      }
    }

    // Number constraints
    if (schema.type === 'number') {
      if (schema.minimum !== undefined && value < schema.minimum) {
        errors.push(`Parameter '${name}' must be at least ${schema.minimum}`);
      }
      if (schema.maximum !== undefined && value > schema.maximum) {
        errors.push(`Parameter '${name}' must be at most ${schema.maximum}`);
      }
    }

    // Array constraints
    if (schema.type === 'array') {
      if (schema.minItems !== undefined && value.length < schema.minItems) {
        errors.push(`Parameter '${name}' must have at least ${schema.minItems} items`);
      }
      if (schema.maxItems !== undefined && value.length > schema.maxItems) {
        errors.push(`Parameter '${name}' must have at most ${schema.maxItems} items`);
      }
    }

    // Enum validation
    if (schema.enum && !schema.enum.includes(value)) {
      errors.push(`Parameter '${name}' must be one of: ${schema.enum.join(', ')}`);
    }

    return { valid: errors.length === 0, errors };
  }
}

// ===============================
// Error Classification and Recovery
// ===============================

export class MCPErrorClassifier {
  public static classifyError(error: Error, context: MCPExecutionContext): BaseClaudeZenError {
    const errorContext = {
      timestamp: Date.now(),
      component: 'MCP',
      operation: context.toolName,
      correlationId: context.correlationId,
      metadata: {
        toolName: context.toolName,
        attempt: context.attempt,
        parameters: context.parameters,
        executionTime: Date.now() - context.startTime,
      },
      sessionId: context.sessionId,
      userId: context.userId,
    };

    // Already a Claude-Zen error
    if (error instanceof BaseClaudeZenError) {
      return error;
    }

    // Timeout errors
    if (error.message.includes('timeout') || error.name === 'TimeoutError') {
      return new MCPTimeoutError(
        error.message,
        context.toolName,
        30000, // Default timeout
        Date.now() - context.startTime
      );
    }

    // Network errors
    if (
      error.message.includes('network') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ENOTFOUND') ||
      error.message.includes('fetch failed')
    ) {
      return new NetworkError(error.message, undefined, context.toolName, 'high');
    }

    // FACT system errors
    if (context.toolName.startsWith('fact_')) {
      return new FACTError(error.message, 'high', errorContext);
    }

    // RAG system errors
    if (
      context.toolName.includes('rag_') ||
      context.toolName.includes('vector') ||
      context.toolName.includes('embedding')
    ) {
      return new RAGError(error.message, 'high', errorContext);
    }

    // Swarm coordination errors
    if (context.toolName.includes('swarm_') || context.toolName.includes('agent_')) {
      return new SwarmError(error.message, undefined, 'high', errorContext);
    }

    // WASM errors
    if (error.message.includes('wasm') || error.message.includes('WebAssembly')) {
      return new WASMError(error.message, 'high', errorContext);
    }

    // Memory errors
    if (error.message.includes('out of memory') || error.message.includes('heap')) {
      return new MCPExecutionError(error.message, context.toolName, 'during', error, 'critical');
    }

    // Default MCP execution error
    return new MCPExecutionError(error.message, context.toolName, 'during', error, 'high');
  }

  public static createValidationError(
    toolName: string,
    parameterName: string,
    expectedType: string,
    actualValue: any
  ): MCPValidationError {
    return new MCPValidationError(
      `Invalid parameter '${parameterName}': expected ${expectedType}`,
      parameterName,
      expectedType,
      actualValue,
      toolName
    );
  }
}

// ===============================
// MCP Tool Wrapper with Error Handling
// ===============================

export class MCPToolWrapper {
  private static executionCounter = 0;

  public static wrapTool(tool: MCPTool): MCPTool {
    return {
      ...tool,
      handler: async (parameters: any): Promise<MCPToolResult> => {
        const executionId = ++MCPToolWrapper.executionCounter;
        const correlationId = `mcp_${executionId}_${Date.now()}`;

        const context: MCPExecutionContext = {
          toolName: tool.name,
          startTime: Date.now(),
          parameters,
          attempt: 1,
          correlationId,
          operationId: `${tool.name}_${executionId}`,
        };

        logger.info(`MCP tool execution started: ${tool.name}`, {
          correlationId: context.correlationId,
          parameters: MCPToolWrapper.sanitizeParameters(parameters),
        });

        // Check if feature is enabled (graceful degradation)
        const isEnabled = (errorRecoveryOrchestrator as any).isFeatureEnabled
          ? (errorRecoveryOrchestrator as any).isFeatureEnabled(
              MCPToolWrapper.getFeatureName(tool.name)
            )
          : true; // Default to enabled if method doesn't exist

        if (!isEnabled) {
          logger.warn(`Feature disabled due to system degradation: ${tool.name}`);
          return MCPToolWrapper.createDegradedResponse(tool.name);
        }

        try {
          // Use recovery if available, otherwise execute directly
          if ((errorRecoveryOrchestrator as any).executeWithRecovery) {
            return await (errorRecoveryOrchestrator as any).executeWithRecovery(
              tool.name,
              async () => {
                return await MCPToolWrapper.executeToolWithValidation(tool, parameters, context);
              },
              {
                maxRetries: MCPToolWrapper.getMaxRetries(tool.name),
                retryDelayMs: 1000,
                exponentialBackoff: true,
                circuitBreakerThreshold: 5,
                fallbackEnabled: true,
                gracefulDegradation: true,
              }
            );
          } else {
            // Fallback: execute directly without recovery
            return await MCPToolWrapper.executeToolWithValidation(tool, parameters, context);
          }
        } catch (error) {
          return MCPToolWrapper.handleToolError(error as Error, context);
        }
      },
    };
  }

  private static async executeToolWithValidation(
    tool: MCPTool,
    parameters: any,
    context: MCPExecutionContext
  ): Promise<MCPToolResult> {
    // Phase 1: Parameter Validation
    try {
      const validation = MCPParameterValidator.validateParameters(
        tool.name,
        parameters,
        tool.inputSchema
      );

      if (!validation.valid) {
        const validationError = new MCPValidationError(
          `Validation failed: ${validation.errors.join(', ')}`,
          'multiple',
          'valid',
          parameters,
          tool.name
        );

        // Use recordError if reportError doesn't exist
        const reportMethod = (errorMonitor as any).reportError || (errorMonitor as any).recordError;
        if (reportMethod) {
          reportMethod.call(errorMonitor, validationError, {
            component: 'MCP',
            operation: tool.name,
            correlationId: context.correlationId,
          });
        }

        return {
          success: false,
          content: [
            {
              type: 'text',
              text: `❌ Parameter validation failed for ${tool.name}:
      ${validation.errors.map((e) => `• ${e}`).join('\n')}`,
            },
          ],
        };
      }
    } catch (validationError) {
      logger.error(`Validation error for ${tool.name}:`, validationError);
      throw MCPErrorClassifier.classifyError(validationError as Error, context);
    }

    // Phase 2: Tool Execution
    const executionStartTime = Date.now();

    try {
      const result = await tool.handler(parameters);

      const executionTime = Date.now() - executionStartTime;

      logger.info(`MCP tool execution completed: ${tool.name}`, {
        correlationId: context.correlationId,
        executionTime,
        success: result.success,
      });

      // Phase 3: Post-processing
      return MCPToolWrapper.postProcessResult(result, tool.name, context);
    } catch (executionError) {
      const executionTime = Date.now() - executionStartTime;

      logger.error(`MCP tool execution failed: ${tool.name}`, {
        correlationId: context.correlationId,
        executionTime,
        error: executionError,
      });

      throw MCPErrorClassifier.classifyError(executionError as Error, context);
    }
  }

  private static postProcessResult(
    result: MCPToolResult,
    _toolName: string,
    context: MCPExecutionContext
  ): MCPToolResult {
    // Add execution metadata to successful results
    if (result.success && result.content) {
      const executionTime = Date.now() - context.startTime;

      // Add execution info to text content if appropriate
      const lastContent = result.content[result.content.length - 1];
      if (lastContent?.type === 'text' && !lastContent.text.includes('Execution Time:')) {
        lastContent.text += `
      \n🔧 Execution: ${executionTime}ms | ID: ${context.correlationId}`;
      }
    }

    return result;
  }

  private static handleToolError(error: Error, context: MCPExecutionContext): MCPToolResult {
    const claudeZenError = MCPErrorClassifier.classifyError(error, context);
    const executionTime = Date.now() - context.startTime;

    // Report error to monitoring system
    const reportMethod = (errorMonitor as any).reportError || (errorMonitor as any).recordError;
    if (reportMethod) {
      reportMethod.call(errorMonitor, claudeZenError, {
        component: 'MCP',
        operation: context.toolName,
        correlationId: context.correlationId,
        metadata: {
          executionTime,
          parameters: MCPToolWrapper.sanitizeParameters(context.parameters),
        },
      });
    }

    // Create user-friendly error response
    const errorMessage = MCPToolWrapper.createUserFriendlyErrorMessage(claudeZenError, context);

    return {
      success: false,
      content: [
        {
          type: 'text',
          text: errorMessage,
        },
      ],
    };
  }

  private static createUserFriendlyErrorMessage(
    error: BaseClaudeZenError,
    context: MCPExecutionContext
  ): string {
    const executionTime = Date.now() - context.startTime;

    let message = `❌ ${context.toolName} execution failed
      \n`;

    // Add specific error information based on type
    if (error instanceof MCPValidationError) {
      message += `🔍 **Validation Error**\n`;
      message += `Parameter '${error.parameterName}' is invalid.\n`;
      message += `Expected: ${error.expectedType}\n`;
      message += `Received: ${typeof error.actualValue}
      \n`;
      message += `💡 **Solution**: Check the parameter format and try again.`;
    } else if (error instanceof MCPTimeoutError) {
      message += `⏱️ **Timeout Error**\n`;
      message += `Operation timed out after ${error.timeoutMs}ms.
      \n`;
      message += `💡 **Solutions**:\n`;
      message += `• Try again with simpler parameters\n`;
      message += `• Check system load and network connectivity\n`;
      message += `• Consider breaking the operation into smaller parts`;
    } else if (error instanceof NetworkError) {
      message += `🌐 **Network Error**\n`;
      message += `Failed to connect to external services.
      \n`;
      message += `💡 **Solutions**:\n`;
      message += `• Check internet connectivity\n`;
      message += `• Try again in a few moments\n`;
      message += `• Use cached results if available`;
    } else if (error instanceof FACTError) {
      message += `🧠 **FACT System Error**\n`;
      message += `Knowledge gathering operation failed.
      \n`;
      message += `💡 **Solutions**:\n`;
      message += `• Try with different search terms\n`;
      message += `• Check if FACT system is initialized\n`;
      message += `• Use fact_status to check system health`;
    } else if (error instanceof SwarmError) {
      message += `🐝 **Swarm Coordination Error**\n`;
      message += `Agent coordination failed.
      \n`;
      message += `💡 **Solutions**:\n`;
      message += `• Check swarm status and health\n`;
      message += `• Try with fewer agents or simpler tasks\n`;
      message += `• Restart swarm if necessary`;
    } else {
      message += `⚠️ **System Error**\n`;
      message += `${error.message}
      \n`;
      message += `💡 **Next Steps**:\n`;
      message += `• Try again in a few moments\n`;
      message += `• Check system status\n`;
      message += `• Contact support if the issue persists`;
    }

    // Add technical details
    message += `
      \n🔧 **Technical Details**:\n`;
    message += `• Tool: ${context.toolName}\n`;
    message += `• Error Type: ${error.constructor.name}\n`;
    message += `• Severity: ${error.severity}\n`;
    message += `• Execution Time: ${executionTime}ms\n`;
    message += `• Correlation ID: ${context.correlationId}\n`;
    message += `• Recoverable: ${error.recoverable ? 'Yes' : 'No'}`;

    return message;
  }

  private static createDegradedResponse(toolName: string): MCPToolResult {
    return {
      success: false,
      content: [
        {
          type: 'text',
          text:
            `⚠️ ${toolName} is temporarily unavailable due to system degradation.
      \n` +
            `The system is operating in reduced functionality mode to maintain stability.
      \n` +
            `💡 **Alternatives**:\n` +
            `• Try basic operations instead of complex ones\n` +
            `• Check system status for recovery updates\n` +
            `• Use cached results if available`,
        },
      ],
    };
  }

  private static getFeatureName(toolName: string): string {
    if (toolName.startsWith('fact_')) return 'fact_gather';
    if (toolName.includes('rag_') || toolName.includes('vector')) return 'rag_search';
    if (toolName.includes('swarm_') || toolName.includes('agent_')) return 'swarm_coordination';
    if (toolName.includes('neural_')) return 'neural_processing';
    if (toolName.includes('wasm_')) return 'wasm_computation';
    return 'basic_operations';
  }

  private static getMaxRetries(toolName: string): number {
    // Different retry strategies for different tool types
    if (toolName.includes('critical_') || toolName.includes('wasm_')) return 1;
    if (toolName.includes('swarm_') || toolName.includes('coordination_')) return 2;
    return 3; // Default
  }

  private static sanitizeParameters(parameters: any): any {
    // Remove sensitive information from parameters for logging
    const sanitized = { ...parameters };

    // Remove common sensitive fields
    const sensitiveFields = ['password', 'token', 'key', 'secret', 'auth', 'credential'];

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    // Truncate large text fields
    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === 'string' && value.length > 500) {
        sanitized[key] = `${value.substring(0, 500)}... [TRUNCATED]`;
      }
    }

    return sanitized;
  }
}

// ===============================
// Error Boundary for Tool Registration
// ===============================

export class MCPToolRegistry {
  private static tools: Map<string, MCPTool> = new Map();

  public static registerTool(tool: MCPTool): void {
    try {
      // Wrap tool with error handling
      const wrappedTool = MCPToolWrapper.wrapTool(tool);

      // Validate tool structure
      MCPToolRegistry.validateToolStructure(wrappedTool);

      // Register tool
      MCPToolRegistry.tools.set(tool.name, wrappedTool);

      logger.info(`MCP tool registered with error handling: ${tool.name}`);
    } catch (error) {
      logger.error(`Failed to register MCP tool ${tool.name}:`, error);
      throw new MCPError(
        `Tool registration failed: ${error instanceof Error ? error.message : String(error)}`,
        tool.name,
        'critical'
      );
    }
  }

  public static getTool(name: string): MCPTool | undefined {
    return MCPToolRegistry.tools.get(name);
  }

  public static getAllTools(): MCPTool[] {
    return Array.from(MCPToolRegistry.tools.values());
  }

  public static getToolNames(): string[] {
    return Array.from(MCPToolRegistry.tools.keys());
  }

  private static validateToolStructure(tool: MCPTool): void {
    if (!tool.name || typeof tool.name !== 'string') {
      throw new Error('Tool must have a valid name');
    }

    if (!tool.description || typeof tool.description !== 'string') {
      throw new Error('Tool must have a valid description');
    }

    if (!tool.inputSchema || typeof tool.inputSchema !== 'object') {
      throw new Error('Tool must have a valid input schema');
    }

    if (!tool.handler || typeof tool.handler !== 'function') {
      throw new Error('Tool must have a valid handler function');
    }
  }
}

// ===============================
// Export Main Error Handler
// ===============================

export class MCPErrorHandler {
  public validator = MCPParameterValidator;
  public classifier = MCPErrorClassifier;
  public wrapper = MCPToolWrapper;
  public registry = MCPToolRegistry;

  constructor() {
    // Initialize if needed
  }

  validateParameters(toolName: string, parameters: any, schema: any) {
    return this.validator.validateParameters(toolName, parameters, schema);
  }

  classifyError(error: Error, context: MCPExecutionContext) {
    return this.classifier.classifyError(error, context);
  }

  wrapTool(tool: MCPTool) {
    return this.wrapper.wrapTool(tool);
  }
}

export const mcpErrorHandler = {
  MCPParameterValidator,
  MCPErrorClassifier,
  MCPToolWrapper,
  MCPToolRegistry,
};
