/**
 * Base Command Abstract Class
 *
 * Provides common functionality for all CLI commands including validation,
 * error handling, hooks, and lifecycle management.
 */

import { EventEmitter } from 'events';
import type {
  AsyncResult,
  CommandConfig,
  CommandContext,
  CommandHandler,
  CommandMetadata,
  CommandResult,
  CommandValidationResult,
} from '../types/index';

/**
 * Hook types for command lifecycle
 */
export interface CommandHooks {
  beforeValidation?: (context: CommandContext) => Promise<void> | void;
  afterValidation?: (
    context: CommandContext,
    result: CommandValidationResult
  ) => Promise<void> | void;
  beforeExecution?: (context: CommandContext) => Promise<void> | void;
  afterExecution?: (context: CommandContext, result: CommandResult) => Promise<void> | void;
  onError?: (context: CommandContext, error: Error) => Promise<void> | void;
}

/**
 * Abstract base class for all CLI commands
 */
export abstract class BaseCommand extends EventEmitter {
  protected readonly config: CommandConfig;
  protected readonly hooks: CommandHooks = {};
  protected isExecuting = false;

  constructor(config: CommandConfig) {
    super();
    this.config = config;
  }

  /**
   * Get command metadata
   */
  get metadata(): CommandMetadata {
    return {
      config: this.config,
      handler: this.run.bind(this) as CommandHandler,
      registeredAt: new Date(),
      available: true,
    };
  }

  /**
   * Check if command is currently executing
   */
  get executing(): boolean {
    return this.isExecuting;
  }

  /**
   * Register lifecycle hooks
   */
  registerHooks(hooks: Partial<CommandHooks>): void {
    Object.assign(this.hooks, hooks);
  }

  /**
   * Validate command context and arguments
   */
  protected async validateContext(context: CommandContext): Promise<CommandValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Run pre-validation hook
      await this.hooks.beforeValidation?.(context);

      // Validate required flags
      if (this.config.flags) {
        for (const [flagName, flagConfig] of Object.entries(this.config.flags)) {
          if (flagConfig.required && context.flags[flagName] === undefined) {
            errors.push(`Required flag --${flagName} is missing`);
          }

          // Type validation
          if (context.flags[flagName] !== undefined) {
            const value = context.flags[flagName];
            const expectedType = flagConfig.type || 'string';

            if (!this.validateFlagType(value, expectedType)) {
              errors.push(`Flag --${flagName} expected ${expectedType} but got ${typeof value}`);
            }
          }
        }
      }

      // Validate arguments count
      const minArgs = this.config.minArgs || 0;
      const maxArgs = this.config.maxArgs;

      if (context.args.length < minArgs) {
        errors.push(`Expected at least ${minArgs} arguments, got ${context.args.length}`);
      }

      if (maxArgs !== undefined && context.args.length > maxArgs) {
        errors.push(`Expected at most ${maxArgs} arguments, got ${context.args.length}`);
      }

      // Custom validation
      const customValidation = await this.validate(context);
      if (customValidation) {
        errors.push(...customValidation.errors);
        warnings.push(...customValidation.warnings);
      }

      const result: CommandValidationResult = {
        valid: errors.length === 0,
        errors,
        warnings,
      };

      // Run post-validation hook
      await this.hooks.afterValidation?.(context, result);

      return result;
    } catch (error) {
      errors.push(`Validation failed: ${error instanceof Error ? error.message : String(error)}`);

      return {
        valid: false,
        errors,
        warnings,
      };
    }
  }

  /**
   * Validate flag type
   */
  private validateFlagType(value: unknown, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'boolean':
        return typeof value === 'boolean';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'array':
        return Array.isArray(value);
      default:
        return true; // Unknown types pass validation
    }
  }

  /**
   * Execute the command with full lifecycle management
   */
  async execute(context: CommandContext): Promise<CommandResult> {
    if (this.isExecuting) {
      return {
        success: false,
        error: 'Command is already executing',
        exitCode: 1,
        executionTime: 0,
      };
    }

    const startTime = Date.now();
    this.isExecuting = true;

    try {
      this.emit('start', context);

      // Validate context
      const validation = await this.validateContext(context);
      if (!validation.valid) {
        const errorMsg = `Validation failed: ${validation.errors.join(', ')}`;
        this.emit('validation-error', validation);
        return {
          success: false,
          error: errorMsg,
          exitCode: 1,
          executionTime: Date.now() - startTime,
        };
      }

      if (validation.warnings.length > 0) {
        this.emit('validation-warning', validation.warnings);
      }

      // Run pre-execution hook
      await this.hooks.beforeExecution?.(context);
      this.emit('before-execution', context);

      // Execute the command
      const result = await this.run(context);

      // Calculate duration and add metadata
      const finalResult: CommandResult = {
        ...result,
        executionTime: Date.now() - startTime,
      };

      // Run post-execution hook
      await this.hooks.afterExecution?.(context, finalResult);
      this.emit('after-execution', finalResult);
      this.emit('complete', finalResult);

      return finalResult;
    } catch (error) {
      const commandError = error instanceof Error ? error : new Error(String(error));

      // Run error hook
      await this.hooks.onError?.(context, commandError);
      this.emit('error', commandError);

      const result: CommandResult = {
        success: false,
        error: commandError.message,
        exitCode: 1,
        executionTime: Date.now() - startTime,
      };

      this.emit('complete', result);
      return result;
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * Abstract methods to be implemented by concrete commands
   */

  /**
   * Custom validation logic - override in subclasses
   */
  protected async validate(context: CommandContext): Promise<CommandValidationResult | null> {
    return null;
  }

  /**
   * Main command execution logic - must be implemented by subclasses
   */
  protected abstract run(context: CommandContext): Promise<CommandResult>;

  /**
   * Get help text for the command
   */
  abstract getHelp(): string;

  /**
   * Get usage examples
   */
  getExamples(): string[] {
    return this.config.examples || [];
  }

  /**
   * Get command configuration
   */
  getConfig(): CommandConfig {
    return { ...this.config };
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.removeAllListeners();
  }
}
