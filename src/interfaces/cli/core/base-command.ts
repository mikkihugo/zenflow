/**
 * Legacy CLI Command Support (Stub)
 * 
 * This is a compatibility stub for legacy CLI command tests.
 * Properly located under /src/interfaces/cli/ for architectural consistency.
 * The actual terminal interface uses Ink-based TUI components.
 * 
 * For real terminal interfaces, see:
 * - /src/interfaces/terminal/ (Ink-based TUI - Primary)
 * - /src/interfaces/tui/ (Terminal UI components)
 * - /src/interfaces/cli.disabled/ (Disabled CLI commands)
 */

export interface CommandConfig {
  name: string;
  description: string;
  minArgs?: number;
  maxArgs?: number;
  flags?: Record<string, {
    type: 'string' | 'boolean' | 'number';
    description: string;
    required?: boolean;
    default?: any;
  }>;
  examples?: string[];
}

export interface CommandContext {
  args: string[];
  flags: Record<string, any>;
  input: string[];
  pkg: { name: string; version: string };
  cwd: string;
  env: Record<string, string>;
  debug: boolean;
  verbose: boolean;
}

export interface CommandResult {
  success: boolean;
  exitCode: number;
  message?: string;
  error?: string;
  executionTime?: number;
}

export interface CommandValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

export interface CommandHooks {
  beforeValidation?: (context: CommandContext) => Promise<void>;
  afterValidation?: (context: CommandContext, result: CommandValidationResult) => Promise<void>;
  beforeExecution?: (context: CommandContext) => Promise<void>;
  afterExecution?: (context: CommandContext, result: CommandResult) => Promise<void>;
  onError?: (context: CommandContext, error: Error) => Promise<void>;
}

export interface CommandMetadata {
  config: CommandConfig;
  handler: (context: CommandContext) => Promise<CommandResult>;
  registeredAt: Date;
  available: boolean;
}

/**
 * Legacy CLI Base Command (Stub Implementation)
 * 
 * NOTE: This is a stub for testing legacy command patterns.
 * Real terminal interactions should use the Ink-based TUI system:
 * 
 * @see /src/interfaces/terminal/interactive-terminal-application.tsx
 * @see /src/interfaces/terminal/screens/ (for actual screens)
 * @see /src/interfaces/tui/ (for TUI components)
 */
export abstract class BaseCommand {
  public executing = false;
  private hooks?: CommandHooks;
  private listeners: Map<string, Function[]> = new Map();

  constructor(public readonly config: CommandConfig) {}

  /**
   * Execute command with full lifecycle
   */
  async execute(context: CommandContext): Promise<CommandResult> {
    if (this.executing) {
      return {
        success: false,
        error: 'Command is already executing',
        exitCode: 1,
        executionTime: 0,
      };
    }

    const startTime = Date.now();
    this.executing = true;

    try {
      // Emit start event
      this.emit('start', context);

      // Before validation hook
      if (this.hooks?.beforeValidation) {
        await this.hooks.beforeValidation(context);
      }

      // Validate context
      const validationResult = await this.validateContext(context);
      
      // Emit validation events
      if (!validationResult.valid) {
        this.emit('validation-error', validationResult);
      }
      if (validationResult.warnings?.length) {
        this.emit('validation-warning', validationResult.warnings);
      }

      // After validation hook
      if (this.hooks?.afterValidation) {
        await this.hooks.afterValidation(context, validationResult);
      }

      if (!validationResult.valid) {
        const executionTime = Date.now() - startTime;
        return {
          success: false,
          error: `Validation failed: ${validationResult.errors?.join(', ')}`,
          exitCode: 1,
          executionTime,
        };
      }

      // Before execution hook
      if (this.hooks?.beforeExecution) {
        await this.hooks.beforeExecution(context);
      }

      this.emit('before-execution', context);

      // Execute command
      const result = await this.run(context);
      const executionTime = Date.now() - startTime;
      const finalResult = { ...result, executionTime };

      // After execution hook
      if (this.hooks?.afterExecution) {
        await this.hooks.afterExecution(context, finalResult);
      }

      this.emit('after-execution', finalResult);
      this.emit('complete', finalResult);

      return finalResult;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        exitCode: 1,
        executionTime,
      };

      // Error hook
      if (this.hooks?.onError && error instanceof Error) {
        await this.hooks.onError(context, error);
      }

      this.emit('error', error);
      return errorResult;
    } finally {
      this.executing = false;
    }
  }

  /**
   * Abstract method for command implementation
   */
  protected abstract run(context: CommandContext): Promise<CommandResult>;

  /**
   * Abstract method for help text
   */
  abstract getHelp(): string;

  /**
   * Validate command context
   */
  protected async validateContext(context: CommandContext): Promise<CommandValidationResult> {
    const errors: string[] = [];

    // Validate arguments count
    if (this.config.minArgs && context.args.length < this.config.minArgs) {
      errors.push(`Expected at least ${this.config.minArgs} arguments, got ${context.args.length}`);
    }
    if (this.config.maxArgs && context.args.length > this.config.maxArgs) {
      errors.push(`Expected at most ${this.config.maxArgs} arguments, got ${context.args.length}`);
    }

    // Validate flags
    if (this.config.flags) {
      for (const [key, flagConfig] of Object.entries(this.config.flags)) {
        const value = context.flags[key];

        // Check required flags
        if (flagConfig.required && (value === undefined || value === null)) {
          errors.push(`Required flag --${key} is missing`);
          continue;
        }

        // Type validation
        if (value !== undefined) {
          const expectedType = flagConfig.type;
          const actualType = typeof value;

          if (expectedType === 'number' && actualType !== 'number') {
            errors.push(`Flag --${key} expected ${expectedType} but got ${actualType}`);
          }
        }
      }
    }

    // Custom validation
    const customResult = await this.validate(context);
    if (customResult && !customResult.valid) {
      errors.push(...(customResult.errors || []));
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: customResult?.warnings,
    };
  }

  /**
   * Custom validation - override in subclasses
   */
  protected async validate(context: CommandContext): Promise<CommandValidationResult | null> {
    return null;
  }

  /**
   * Register hooks for command lifecycle
   */
  registerHooks(hooks: CommandHooks): void {
    this.hooks = hooks;
  }

  /**
   * Get command configuration (immutable copy)
   */
  getConfig(): CommandConfig {
    return JSON.parse(JSON.stringify(this.config));
  }

  /**
   * Get command examples
   */
  getExamples(): string[] {
    return this.config.examples || [];
  }

  /**
   * Get command metadata
   */
  get metadata(): CommandMetadata {
    return {
      config: this.config,
      handler: (context: CommandContext) => this.execute(context),
      registeredAt: new Date(),
      available: true,
    };
  }

  /**
   * Event emitter methods
   */
  on(event: string, listener: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  emit(event: string, ...args: any[]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(...args));
    }
  }

  removeAllListeners(): void {
    this.listeners.clear();
  }

  listenerCount(event: string): number {
    return this.listeners.get(event)?.length || 0;
  }

  dispose(): void {
    this.removeAllListeners();
  }
}