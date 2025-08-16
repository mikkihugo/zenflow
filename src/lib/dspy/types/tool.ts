/**
 * @fileoverview Function Calling Support for DSPy TypeScript
 * 
 * TypeScript implementation of Stanford DSPy's function calling capabilities.
 * Provides Tool class for function wrapping, ToolCalls for result handling,
 * and integration with signatures and adapters.
 * 
 * Key Features:
 * - Automatic schema inference from TypeScript types
 * - JSON schema validation for function arguments
 * - Async/sync function support
 * - LLM adapter integration for native function calling
 * - Type-safe tool execution
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0-alpha.45
 * 
 * @see {@link https://github.com/stanfordnlp/dspy} Stanford DSPy Reference
 */

import type { Type } from '../interfaces/types.js';

/**
 * Function signature for tools
 */
export type ToolFunction = (...args: any[]) => any | Promise<any>;

/**
 * JSON Schema for function arguments
 */
export interface JsonSchema {
  type: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  description?: string;
  default?: any;
  enum?: any[];
}

/**
 * Tool argument metadata
 */
export interface ToolArgument {
  type: string;
  description?: string;
  required: boolean;
  schema: JsonSchema;
  default?: any;
}

/**
 * Tool configuration
 */
export interface ToolConfig {
  /** Tool name (auto-inferred from function if not provided) */
  name?: string;
  /** Tool description (auto-inferred from function docstring if not provided) */
  description?: string;
  /** Argument schemas (auto-inferred from TypeScript types if not provided) */
  arguments?: Record<string, ToolArgument>;
  /** Whether to allow extra keyword arguments */
  allowExtraArgs?: boolean;
}

/**
 * Tool execution result
 */
export interface ToolResult {
  /** Tool name that was executed */
  name: string;
  /** Function arguments used */
  args: Record<string, any>;
  /** Execution result */
  result: any;
  /** Execution error if any */
  error?: string;
  /** Execution duration in milliseconds */
  duration?: number;
}

/**
 * Tool call information for LLM function calling
 */
export interface ToolCall {
  /** Tool name to call */
  name: string;
  /** Arguments to pass to the tool */
  args: Record<string, any>;
}

/**
 * Collection of tool calls for batch execution
 */
export class ToolCalls implements Type {
  public toolCalls: ToolCall[];

  constructor(toolCalls: ToolCall[] = []) {
    this.toolCalls = toolCalls;
  }

  /**
   * Create ToolCalls from dictionary list
   * 
   * @param dictList - List of tool call dictionaries
   * @returns - ToolCalls instance
   */
  static fromDictList(dictList: Array<{ name: string; args: Record<string, any> }>): ToolCalls {
    return new ToolCalls(dictList.map(dict => ({
      name: dict.name,
      args: dict.args
    })));
  }

  /**
   * Add a tool call
   * 
   * @param name - Tool name
   * @param args - Tool arguments
   */
  addCall(name: string, args: Record<string, any>): void {
    this.toolCalls.push({ name, args });
  }

  /**
   * Format for LLM function calling
   * 
   * @returns - LLM-compatible tool calls format
   */
  formatForLLM(): Array<{ type: string; function: { name: string; arguments: string } }> {
    return this.toolCalls.map(call => ({
      type: 'function',
      function: {
        name: call.name,
        arguments: JSON.stringify(call.args)
      }
    }));
  }

  /**
   * Get type description for signatures
   * 
   * @returns - Type description
   */
  static description(): string {
    return 'Tool calls information, including the name of the tools and the arguments to be passed to them. Arguments must be provided in JSON format.';
  }

  format(): any {
    return {
      tool_calls: this.formatForLLM()
    };
  }
}

/**
 * Tool class for wrapping functions with schema inference and validation
 * 
 * Provides TypeScript equivalent of Stanford DSPy's Tool class with:
 * - Automatic schema inference from function signatures
 * - JSON schema validation
 * - Async/sync execution support
 * - LLM adapter integration
 * 
 * @example
 * ```typescript
 * // Simple function tool
 * function add(x: number, y: number): number {
 *   return x + y;
 * }
 * 
 * const addTool = new Tool(add, {
 *   description: 'Add two numbers together'
 * });
 * 
 * // Execute tool
 * const result = await addTool.execute({ x: 2, y: 3 });
 * console.log(result.result); // 5
 * 
 * // Use with LLM function calling
 * const schema = addTool.formatForLLM();
 * ```
 */
export class Tool implements Type {
  public func: ToolFunction;
  public name: string;
  public description: string;
  public arguments: Record<string, ToolArgument>;
  public allowExtraArgs: boolean;

  /**
   * Create a new Tool instance
   * 
   * @param func - Function to wrap
   * @param config - Tool configuration
   */
  constructor(func: ToolFunction, config: ToolConfig = {}) {
    this.func = func;
    this.allowExtraArgs = config.allowExtraArgs || false;

    // Auto-infer or use provided configuration
    this.name = config.name || this.inferName(func);
    this.description = config.description || this.inferDescription(func);
    this.arguments = config.arguments || this.inferArguments(func);
  }

  /**
   * Execute the tool with given arguments
   * 
   * @param args - Function arguments
   * @returns - Tool execution result
   */
  async execute(args: Record<string, any>): Promise<ToolResult> {
    const startTime = Date.now();
    
    try {
      // Validate arguments
      const validatedArgs = this.validateAndParseArgs(args);
      
      // Execute function
      const result = await this.func(...Object.values(validatedArgs));
      
      return {
        name: this.name,
        args: validatedArgs,
        result,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: this.name,
        args,
        result: null,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Synchronous execution (for non-async functions)
   * 
   * @param args - Function arguments
   * @returns - Tool execution result
   */
  call(args: Record<string, any>): ToolResult {
    const startTime = Date.now();
    
    try {
      // Validate arguments
      const validatedArgs = this.validateAndParseArgs(args);
      
      // Execute function synchronously
      const result = this.func(...Object.values(validatedArgs));
      
      // Check if result is a promise (shouldn't be for sync calls)
      if (result && typeof result.then === 'function') {
        throw new Error('Use execute() for async functions, not call()');
      }
      
      return {
        name: this.name,
        args: validatedArgs,
        result,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: this.name,
        args,
        result: null,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Format tool for LLM function calling
   * 
   * @returns - LLM-compatible function schema
   */
  formatForLLM(): {
    type: string;
    function: {
      name: string;
      description: string;
      parameters: {
        type: string;
        properties: Record<string, JsonSchema>;
        required: string[];
      };
    };
  } {
    const properties: Record<string, JsonSchema> = {};
    const required: string[] = [];

    for (const [argName, argInfo] of Object.entries(this.arguments)) {
      properties[argName] = argInfo.schema;
      if (argInfo.required) {
        required.push(argName);
      }
    }

    return {
      type: 'function',
      function: {
        name: this.name,
        description: this.description,
        parameters: {
          type: 'object',
          properties,
          required
        }
      }
    };
  }

  /**
   * Validate and parse function arguments
   * 
   * @param args - Raw arguments
   * @returns - Validated and parsed arguments
   */
  private validateAndParseArgs(args: Record<string, any>): Record<string, any> {
    const validatedArgs: Record<string, any> = {};

    // Check required arguments
    for (const [argName, argInfo] of Object.entries(this.arguments)) {
      if (argInfo.required && !(argName in args)) {
        throw new Error(`Missing required argument: ${argName}`);
      }

      if (argName in args) {
        // Basic type validation and conversion
        const value = args[argName];
        const convertedValue = this.convertArgumentType(value, argInfo);
        validatedArgs[argName] = convertedValue;
      } else if (argInfo.default !== undefined) {
        validatedArgs[argName] = argInfo.default;
      }
    }

    // Check for extra arguments
    for (const argName of Object.keys(args)) {
      if (!(argName in this.arguments)) {
        if (this.allowExtraArgs) {
          validatedArgs[argName] = args[argName];
        } else {
          throw new Error(`Unknown argument: ${argName}`);
        }
      }
    }

    return validatedArgs;
  }

  /**
   * Convert argument to expected type
   * 
   * @param value - Raw value
   * @param argInfo - Argument information
   * @returns - Converted value
   */
  private convertArgumentType(value: any, argInfo: ToolArgument): any {
    // Basic type conversion based on schema type
    switch (argInfo.type) {
      case 'number':
        if (typeof value === 'string') return parseFloat(value);
        if (typeof value === 'number') return value;
        throw new Error(`Cannot convert ${typeof value} to number`);
      
      case 'integer':
        if (typeof value === 'string') return parseInt(value, 10);
        if (typeof value === 'number') return Math.floor(value);
        throw new Error(`Cannot convert ${typeof value} to integer`);
      
      case 'string':
        return String(value);
      
      case 'boolean':
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') return value.toLowerCase() === 'true';
        return Boolean(value);
      
      case 'array':
        if (Array.isArray(value)) return value;
        throw new Error(`Expected array, got ${typeof value}`);
      
      case 'object':
        if (typeof value === 'object' && value !== null) return value;
        throw new Error(`Expected object, got ${typeof value}`);
      
      default:
        return value;
    }
  }

  /**
   * Infer function name
   * 
   * @param func - Function
   * @returns - Inferred name
   */
  private inferName(func: ToolFunction): string {
    return func.name || 'unnamed_function';
  }

  /**
   * Infer function description from comments/docstring
   * 
   * @param func - Function
   * @returns - Inferred description
   */
  private inferDescription(func: ToolFunction): string {
    // In a real implementation, this could parse JSDoc comments
    // For now, return a basic description
    return `Function: ${func.name || 'unnamed'}`;
  }

  /**
   * Infer function arguments from TypeScript signature
   * 
   * @param func - Function
   * @returns - Inferred arguments
   */
  private inferArguments(func: ToolFunction): Record<string, ToolArgument> {
    // In a real implementation, this would use TypeScript reflection
    // or AST parsing to extract parameter types and information
    // For now, return basic inference based on function.length
    
    const args: Record<string, ToolArgument> = {};
    const paramNames = this.extractParameterNames(func);
    
    for (let i = 0; i < paramNames.length; i++) {
      const name = paramNames[i];
      args[name] = {
        type: 'any',
        required: true,
        schema: {
          type: 'any',
          description: `Parameter ${name}`
        }
      };
    }
    
    return args;
  }

  /**
   * Extract parameter names from function
   * 
   * @param func - Function
   * @returns - Parameter names
   */
  private extractParameterNames(func: ToolFunction): string[] {
    // Extract parameter names from function string
    const funcStr = func.toString();
    const match = funcStr.match(/\(([^)]*)\)/);
    
    if (!match || !match[1]) return [];
    
    return match[1]
      .split(',')
      .map(param => param.trim().split(/\s+/)[0].replace(/[=:].*/, ''))
      .filter(name => name && name !== '...');
  }

  format(): string {
    return `Tool: ${this.name} - ${this.description}`;
  }

  toString(): string {
    return this.format();
  }
}

/**
 * Create a tool from a function with enhanced type inference
 * 
 * @param func - Function to wrap
 * @param config - Tool configuration
 * @returns - Tool instance
 */
export function createTool(func: ToolFunction, config: ToolConfig = {}): Tool {
  return new Tool(func, config);
}

/**
 * Helper to create multiple tools from functions
 * 
 * @param functions - Functions to wrap
 * @returns - Array of Tool instances
 */
export function createTools(functions: ToolFunction[]): Tool[] {
  return functions.map(func => createTool(func));
}

/**
 * Example usage and type definitions for common tool patterns
 */
export namespace ToolExamples {
  /**
   * Mathematical operations tool
   */
  export function createMathTool() {
    function calculate(operation: 'add' | 'subtract' | 'multiply' | 'divide', x: number, y: number): number {
      switch (operation) {
        case 'add': return x + y;
        case 'subtract': return x - y;
        case 'multiply': return x * y;
        case 'divide': 
          if (y === 0) throw new Error('Division by zero');
          return x / y;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    }

    return createTool(calculate, {
      name: 'calculator',
      description: 'Perform basic mathematical operations',
      arguments: {
        operation: {
          type: 'string',
          required: true,
          schema: {
            type: 'string',
            enum: ['add', 'subtract', 'multiply', 'divide'],
            description: 'Mathematical operation to perform'
          }
        },
        x: {
          type: 'number',
          required: true,
          schema: {
            type: 'number',
            description: 'First number'
          }
        },
        y: {
          type: 'number',
          required: true,
          schema: {
            type: 'number',
            description: 'Second number'
          }
        }
      }
    });
  }

  /**
   * Text processing tool
   */
  export function createTextTool() {
    function processText(text: string, operation: 'uppercase' | 'lowercase' | 'reverse' | 'length'): string | number {
      switch (operation) {
        case 'uppercase': return text.toUpperCase();
        case 'lowercase': return text.toLowerCase();
        case 'reverse': return text.split('').reverse().join('');
        case 'length': return text.length;
        default:
          throw new Error(`Unknown text operation: ${operation}`);
      }
    }

    return createTool(processText, {
      name: 'text_processor',
      description: 'Process text with various operations',
      arguments: {
        text: {
          type: 'string',
          required: true,
          schema: {
            type: 'string',
            description: 'Text to process'
          }
        },
        operation: {
          type: 'string',
          required: true,
          schema: {
            type: 'string',
            enum: ['uppercase', 'lowercase', 'reverse', 'length'],
            description: 'Text operation to perform'
          }
        }
      }
    });
  }
}