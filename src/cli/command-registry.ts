/**
 * TypeScript Command Registry
 * Clean, maintainable command registration system with comprehensive type safety
 */

import meow from 'meow';
import { 
  CommandRegistry as ICommandRegistry,
  CommandDefinition, 
  CommandContext, 
  CommandResult,
  CommandCategory,
  ValidationResult,
  CLIError,
  CommandNotFoundError,
  InvalidArgumentError
} from '../types/cli';
import { Logger } from '../types/core';
import { loadCommands, createHelpText } from './core/command-loader.js';

// =============================================================================
// COMMAND REGISTRY IMPLEMENTATION
// =============================================================================

class TypeSafeCommandRegistry implements ICommandRegistry {
  private commands = new Map<string, CommandDefinition>();
  private aliases = new Map<string, string>();
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  // Registration methods
  register(name: string, definition: CommandDefinition): void {
    if (this.commands.has(name)) {
      throw new CLIError(`Command '${name}' is already registered`, name);
    }

    // Validate command definition
    this.validateCommandDefinition(name, definition);

    // Register the command
    this.commands.set(name, { ...definition, name });

    // Register aliases
    if (definition.aliases) {
      for (const alias of definition.aliases) {
        if (this.aliases.has(alias) || this.commands.has(alias)) {
          throw new CLIError(`Alias '${alias}' conflicts with existing command or alias`, name);
        }
        this.aliases.set(alias, name);
      }
    }

    this.logger.debug(`Registered command: ${name}`, { 
      category: definition.category,
      aliases: definition.aliases || [],
      requiresArchitecture: definition.requiresArchitecture || false
    });
  }

  unregister(name: string): boolean {
    const definition = this.commands.get(name);
    if (!definition) {
      return false;
    }

    // Remove aliases
    if (definition.aliases) {
      for (const alias of definition.aliases) {
        this.aliases.delete(alias);
      }
    }

    // Remove command
    this.commands.delete(name);
    this.logger.debug(`Unregistered command: ${name}`);
    
    return true;
  }

  // Query methods
  has(name: string): boolean {
    return this.commands.has(name) || this.aliases.has(name);
  }

  get(name: string): CommandDefinition | undefined {
    // Check direct command name first
    let definition = this.commands.get(name);
    if (definition) {
      return definition;
    }

    // Check aliases
    const realName = this.aliases.get(name);
    if (realName) {
      return this.commands.get(realName);
    }

    return undefined;
  }

  list(): CommandDefinition[] {
    return Array.from(this.commands.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );
  }

  listByCategory(category: CommandCategory): CommandDefinition[] {
    return this.list().filter(cmd => cmd.category === category);
  }

  // Execution method
  async execute(name: string, context: CommandContext): Promise<CommandResult> {
    const definition = this.get(name);
    
    if (!definition) {
      throw new CommandNotFoundError(name);
    }

    // Validate command input
    const validationResults = this.validate(name, context);
    if (validationResults.some(r => !r.valid)) {
      const errors = validationResults.filter(r => !r.valid);
      throw new InvalidArgumentError(
        `Validation failed: ${errors.map(e => e.message).join(', ')}`,
        name
      );
    }

    // Execute command with error handling
    try {
      this.logger.info(`Executing command: ${name}`, {
        args: context.args,
        flags: Object.keys(context.flags),
        category: definition.category
      });

      const startTime = Date.now();
      const result = await definition.handler(context);
      const duration = Date.now() - startTime;

      // Enhance result with metadata
      const enhancedResult: CommandResult = {
        ...result,
        duration: result.duration || duration,
        timestamp: result.timestamp || new Date(),
        performance: {
          ...result.performance,
          responseTime: duration,
          memoryUsed: process.memoryUsage().heapUsed
        }
      };

      this.logger.info(`Command completed: ${name}`, {
        success: enhancedResult.success,
        duration,
        exitCode: enhancedResult.exitCode || 0
      });

      return enhancedResult;

    } catch (error) {
      this.logger.error(`Command failed: ${name}`, error, {
        args: context.args,
        flags: context.flags
      });

      // Re-throw as CLIError if not already
      if (error instanceof CLIError) {
        throw error;
      }

      throw new CLIError(
        `Command execution failed: ${error instanceof Error ? error.message : String(error)}`,
        name,
        1,
        error instanceof Error ? error : undefined
      );
    }
  }

  // Validation method
  validate(name: string, context: CommandContext): ValidationResult[] {
    const definition = this.get(name);
    const results: ValidationResult[] = [];

    if (!definition) {
      results.push({
        valid: false,
        field: 'command',
        message: `Command '${name}' not found`,
        value: name
      });
      return results;
    }

    // Validate arguments
    if (definition.args) {
      for (let i = 0; i < definition.args.length; i++) {
        const argDef = definition.args[i];
        const argValue = context.args[i];

        // Check required arguments
        if (argDef.required && (argValue === undefined || argValue === '')) {
          results.push({
            valid: false,
            field: `args[${i}]`,
            message: `Required argument '${argDef.name}' is missing`,
            value: argValue
          });
          continue;
        }

        // Validate argument if present
        if (argValue !== undefined && argDef.validate) {
          const validation = argDef.validate(argValue);
          if (typeof validation === 'string') {
            results.push({
              valid: false,
              field: `args[${i}]`,
              message: validation,
              value: argValue
            });
          } else if (!validation) {
            results.push({
              valid: false,
              field: `args[${i}]`,
              message: `Invalid value for argument '${argDef.name}'`,
              value: argValue
            });
          }
        }
      }

      // Check for variadic arguments
      const lastArg = definition.args[definition.args.length - 1];
      if (!lastArg?.variadic && context.args.length > definition.args.length) {
        results.push({
          valid: false,
          field: 'args',
          message: `Too many arguments provided. Expected ${definition.args.length}, got ${context.args.length}`,
          value: context.args
        });
      }
    }

    // Validate flags
    if (definition.flags) {
      for (const flagDef of definition.flags) {
        const flagValue = context.flags[flagDef.name];

        // Check required flags
        if (flagDef.required && flagValue === undefined) {
          results.push({
            valid: false,
            field: `flags.${flagDef.name}`,
            message: `Required flag '--${flagDef.name}' is missing`,
            value: flagValue
          });
          continue;
        }

        // Validate flag if present
        if (flagValue !== undefined) {
          // Type validation
          if (flagDef.type === 'boolean' && typeof flagValue !== 'boolean') {
            results.push({
              valid: false,
              field: `flags.${flagDef.name}`,
              message: `Flag '--${flagDef.name}' must be a boolean`,
              value: flagValue
            });
            continue;
          }

          if (flagDef.type === 'number' && typeof flagValue !== 'number') {
            results.push({
              valid: false,
              field: `flags.${flagDef.name}`,
              message: `Flag '--${flagDef.name}' must be a number`,
              value: flagValue
            });
            continue;
          }

          // Choice validation
          if (flagDef.choices && !flagDef.choices.includes(String(flagValue))) {
            results.push({
              valid: false,
              field: `flags.${flagDef.name}`,
              message: `Flag '--${flagDef.name}' must be one of: ${flagDef.choices.join(', ')}`,
              value: flagValue
            });
            continue;
          }

          // Custom validation
          if (flagDef.validate) {
            const validation = flagDef.validate(flagValue);
            if (typeof validation === 'string') {
              results.push({
                valid: false,
                field: `flags.${flagDef.name}`,
                message: validation,
                value: flagValue
              });
            } else if (!validation) {
              results.push({
                valid: false,
                field: `flags.${flagDef.name}`,
                message: `Invalid value for flag '--${flagDef.name}'`,
                value: flagValue
              });
            }
          }
        }
      }
    }

    return results;
  }

  // Helper methods
  private validateCommandDefinition(name: string, definition: CommandDefinition): void {
    if (!definition.handler || typeof definition.handler !== 'function') {
      throw new CLIError(`Command '${name}' must have a valid handler function`, name);
    }

    if (!definition.description || definition.description.trim() === '') {
      throw new CLIError(`Command '${name}' must have a description`, name);
    }

    if (!definition.usage || definition.usage.trim() === '') {
      throw new CLIError(`Command '${name}' must have usage information`, name);
    }

    // Validate category
    const validCategories: CommandCategory[] = [
      'core', 'swarm', 'hive', 'plugins', 'neural', 'memory', 'debug', 'utility'
    ];
    if (!validCategories.includes(definition.category)) {
      throw new CLIError(
        `Command '${name}' has invalid category. Must be one of: ${validCategories.join(', ')}`,
        name
      );
    }
  }

  // Statistics and introspection
  getStats() {
    const categories: Record<CommandCategory, number> = {
      core: 0,
      swarm: 0,
      hive: 0,
      plugins: 0,
      neural: 0,
      memory: 0,
      debug: 0,
      utility: 0
    };

    for (const cmd of this.commands.values()) {
      categories[cmd.category]++;
    }

    return {
      totalCommands: this.commands.size,
      totalAliases: this.aliases.size,
      categories,
      experimentalCommands: Array.from(this.commands.values())
        .filter(cmd => cmd.isExperimental).length,
      deprecatedCommands: Array.from(this.commands.values())
        .filter(cmd => cmd.deprecated).length
    };
  }
}

// =============================================================================
// GLOBAL REGISTRY INSTANCE
// =============================================================================

let globalRegistry: TypeSafeCommandRegistry | null = null;
let commandRouter: any = null; // Legacy router for backward compatibility

/**
 * Initialize command registry
 */
export async function initializeCommandRegistry(): Promise<void> {
  if (!globalRegistry) {
    const logger = createLogger('registry');
    globalRegistry = new TypeSafeCommandRegistry(logger);
    
    // Load commands from the legacy system for now
    if (!commandRouter) {
      commandRouter = await loadCommands();
    }
  }
}

/**
 * Get the global command registry instance
 */
export async function getCommandRegistry(): Promise<TypeSafeCommandRegistry> {
  await initializeCommandRegistry();
  return globalRegistry!;
}

// =============================================================================
// MEOW CLI CREATION
// =============================================================================

/**
 * Create meow CLI with comprehensive TypeScript configuration
 */
export async function createMeowCLI() {
  await initializeCommandRegistry();
  
  const helpText = commandRouter ? createHelpText(commandRouter) : `
Claude Zen CLI - Revolutionary Unified Architecture

Usage:
  claude-zen <command> [options]

Options:
  --help, -h        Show help
  --version, -v     Show version
  --verbose         Enable verbose logging
  --debug           Enable debug mode
  --tui, --ui       Start terminal UI
  --minimal         Minimal mode (no advanced features)
  --no-swarm        Disable swarm coordination
  --no-graph        Disable graph database
  --no-vector       Disable vector search
  --no-cache        Disable caching
  --no-batch        Disable batch operations
  --concurrency     Set max concurrency (default: 16)

Commands:
  init              Initialize project
  start             Start services
  status            Show system status
  stats             Show architecture statistics
  swarm             Swarm coordination commands
  search            Semantic search
  
For more information about a command, use: claude-zen help <command>
  `;
  
  return meow(helpText, {
    importMeta: import.meta,
    flags: {
      help: { type: 'boolean', shortFlag: 'h' },
      version: { type: 'boolean', shortFlag: 'v' },
      verbose: { type: 'boolean', default: false },
      debug: { type: 'boolean', default: false },
      quiet: { type: 'boolean', default: false },
      config: { type: 'string' },
      logLevel: { type: 'string' },
      
      // UI flags
      tui: { type: 'boolean', default: false },
      ui: { type: 'boolean', default: false },
      
      // Feature flags
      minimal: { type: 'boolean', default: false },
      noSwarm: { type: 'boolean', default: false },
      noGraph: { type: 'boolean', default: false },
      noVector: { type: 'boolean', default: false },
      noCache: { type: 'boolean', default: false },
      noBatch: { type: 'boolean', default: false },
      
      // Performance flags
      concurrency: { type: 'number', default: 16 },
      
      // Legacy compatibility
      nonInteractive: { type: 'boolean', default: false }
    }
  });
}

// =============================================================================
// COMMAND EXECUTION
// =============================================================================

/**
 * Execute a command with comprehensive error handling and validation
 */
export async function executeCommand(
  name: string, 
  context: CommandContext | { args?: string[], flags?: Record<string, any>, [key: string]: any }
): Promise<CommandResult> {
  const registry = await getCommandRegistry();
  
  // Handle legacy context format
  let commandContext: CommandContext;
  if ('command' in context) {
    commandContext = context as CommandContext;
  } else {
    commandContext = {
      command: name,
      args: context.args || [],
      flags: context.flags || {},
      config: context.config || createDefaultConfig(),
      logger: context.logger || createLogger('command'),
      cli: context.cli,
      unifiedArchitecture: context.unifiedArchitecture,
      startTime: new Date(),
      cwd: process.cwd(),
      env: process.env
    };
  }
  
  return registry.execute(name, commandContext);
}

/**
 * Show help for a specific command
 */
export async function showCommandHelp(name: string): Promise<void> {
  const registry = await getCommandRegistry();
  const definition = registry.get(name);
  
  if (!definition) {
    console.error(`❌ Unknown command: ${name}`);
    console.log('\nAvailable commands:');
    listCommands();
    return;
  }

  console.log(`
${definition.name} - ${definition.description}

Usage:
  ${definition.usage}

Category: ${definition.category}
`);

  if (definition.examples && definition.examples.length > 0) {
    console.log('Examples:');
    for (const example of definition.examples) {
      console.log(`  ${example.command}  # ${example.description}`);
    }
    console.log();
  }

  if (definition.aliases && definition.aliases.length > 0) {
    console.log(`Aliases: ${definition.aliases.join(', ')}\n`);
  }

  if (definition.flags && definition.flags.length > 0) {
    console.log('Flags:');
    for (const flag of definition.flags) {
      const alias = flag.alias ? `, -${flag.alias}` : '';
      const required = flag.required ? ' (required)' : '';
      const defaultVal = flag.default !== undefined ? ` (default: ${flag.default})` : '';
      console.log(`  --${flag.name}${alias}  ${flag.description}${required}${defaultVal}`);
    }
    console.log();
  }

  if (definition.isExperimental) {
    console.log('⚠️  This command is experimental and may change in future versions.\n');
  }

  if (definition.deprecated) {
    console.log('🚨 This command is deprecated and will be removed in a future version.\n');
  }
}

/**
 * List all available commands
 */
export async function listCommands(includeHidden = false): Promise<void> {
  const registry = await getCommandRegistry();
  const commands = registry.list();
  
  // Group by category
  const grouped: Record<CommandCategory, CommandDefinition[]> = {
    core: [],
    swarm: [],
    hive: [],
    plugins: [],
    neural: [],
    memory: [],
    debug: [],
    utility: []
  };

  for (const cmd of commands) {
    grouped[cmd.category].push(cmd);
  }

  console.log('\nAvailable commands:\n');

  for (const [category, cmds] of Object.entries(grouped)) {
    if (cmds.length === 0) continue;
    
    console.log(`${category.toUpperCase()}:`);
    for (const cmd of cmds) {
      const deprecated = cmd.deprecated ? ' (deprecated)' : '';
      const experimental = cmd.isExperimental ? ' (experimental)' : '';
      console.log(`  ${cmd.name.padEnd(15)} ${cmd.description}${deprecated}${experimental}`);
    }
    console.log();
  }
}

/**
 * Check if command exists
 */
export async function hasCommand(name: string): Promise<boolean> {
  const registry = await getCommandRegistry();
  return registry.has(name);
}

/**
 * Get command definition
 */
export async function getCommand(name: string): Promise<CommandDefinition | undefined> {
  const registry = await getCommandRegistry();
  return registry.get(name);
}

/**
 * Register a new command
 */
export async function registerCommand(name: string, definition: CommandDefinition): Promise<void> {
  const registry = await getCommandRegistry();
  registry.register(name, definition);
}

// =============================================================================
// LEGACY COMPATIBILITY
// =============================================================================

/**
 * Legacy command registry for backward compatibility
 */
export const commandRegistry = {
  register: registerCommand,
  has: hasCommand,
  get: getCommand,
  execute: executeCommand
};

export async function registerCoreCommands(): Promise<void> {
  await initializeCommandRegistry();
  console.log('✅ Core commands loaded');
}

export function showAllCommands() {
  // This will be implemented to work with the new registry
  return {
    core: ['init', 'start', 'status', 'config'],
    coordination: ['hive-mind', 'swarm', 'agent', 'task'],
    management: ['memory', 'mcp', 'monitor', 'security', 'backup'],
    development: ['github', 'deploy', 'workflow', 'analytics', 'neural', 'queen'],
    other: []
  };
}

export async function getRegistryStats() {
  const registry = await getCommandRegistry();
  return registry.getStats();
}

// Re-export for maximum compatibility
export {
  executeCommand as execute,
  listCommands as list,
  hasCommand as has,
  getCommand as get,
  registerCommand as register,
  showCommandHelp as help
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function createLogger(name: string): Logger {
  return {
    trace: (message: string, metadata?: any) => console.log(`[TRACE:${name}] ${message}`, metadata),
    debug: (message: string, metadata?: any) => console.log(`[DEBUG:${name}] ${message}`, metadata),
    info: (message: string, metadata?: any) => console.log(`[INFO:${name}] ${message}`, metadata),
    warn: (message: string, metadata?: any) => console.warn(`[WARN:${name}] ${message}`, metadata),
    error: (message: string, error?: Error, metadata?: any) => console.error(`[ERROR:${name}] ${message}`, error, metadata),
    fatal: (message: string, error?: Error, metadata?: any) => console.error(`[FATAL:${name}] ${message}`, error, metadata),
    child: (metadata: any) => createLogger(`${name}:child`),
    setLevel: (level: string) => {},
    getLevel: () => 'info'
  };
}

function createDefaultConfig(): any {
  return {
    name: 'claude-zen',
    version: '1.0.0',
    description: 'Revolutionary Claude Zen CLI',
    usage: 'claude-zen <command> [options]',
    flags: {},
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      isDevelopment: process.env.NODE_ENV === 'development',
      isProduction: process.env.NODE_ENV === 'production',
      isTest: process.env.NODE_ENV === 'test'
    },
    paths: {
      dataDir: `${process.cwd()}/.claude-zen`,
      configDir: `${process.cwd()}/.claude-zen/config`,
      logsDir: `${process.cwd()}/.claude-zen/logs`,
      cacheDir: `${process.cwd()}/.claude-zen/cache`,
      tempDir: `${process.cwd()}/.claude-zen/temp`
    }
  };
}