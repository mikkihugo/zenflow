/**
 * TypeScript Command Registry
 * Clean, maintainable command registration system with comprehensive type safety
 */

import type { CommandContext, CommandRegistry as ICommandRegistry } from '../types/cli';
import { loadCommands } from './core/command-loader.js';

// =============================================================================
// COMMAND REGISTRY IMPLEMENTATION
// =============================================================================

class TypeSafeCommandRegistry implements ICommandRegistry {}

// Registration methods
register(name,definition = this.commands.get(name);
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
this.logger.debug(`Unregisteredcommand = this.commands.get(name);
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

  listByCategory(category = > cmd.category === category);
  }

  // Execution method
  async execute(name = this.get(name);
    
    if (!definition) {
      throw new CommandNotFoundError(name);
    }

    // Validate command input
    const validationResults = this.validate(name, context);
    if (validationResults.some(r => !r.valid)) {

      throw new InvalidArgumentError(
        `Validationfailed = > e.message).join(', ')
}`,
        name
      )
}

// Execute command with error handling
try {
      this.logger.info(`Executingcommand = Date.now();
      const result = await definition.handler(context);
      const duration = Date.now() - startTime;

      // Enhance result with metadata

    const results = [];

    if (!definition) {
      results.push({valid = 0; i < definition.args.length; i++) {
        const argDef = definition.args[i];
        const argValue = context.args[i];

        // Check required arguments
        if (argDef.required && (argValue === undefined || argValue === '')) {
          results.push({valid = = undefined && argDef.validate) {
          const validation = argDef.validate(argValue);
          if (typeof validation === 'string') {
            results.push({valid = definition.args[definition.args.length - 1];
      if (!lastArg?.variadic && context.args.length > definition.args.length) {
        results.push({valid = context.flags[flagDef.name];

        // Check required flags
        if (flagDef.required && flagValue === undefined) {
          results.push({valid = = undefined) {
          // Type validation
          if (flagDef.type === 'boolean' && typeof flagValue !== 'boolean') {
            results.push({valid = == 'number' && typeof flagValue !== 'number') {
            results.push({valid = flagDef.validate(flagValue);
            if (typeof validation === 'string') {
              results.push({valid = = 'function') {
      throw new CLIError(`Command '${name}' must have a valid handler function`, name);
    }

    if (!definition.description || definition.description.trim() === '') {
      throw new CLIError(`Command '${name}' must have a description`, name);
    }

    if (!definition.usage || definition.usage.trim() === '') {
      throw new CLIError(`Command '${name}' must have usage information`, name);
    }

    // Validate category
    const validCategories = [
      'core', 'swarm', 'hive', 'plugins', 'neural', 'memory', 'debug', 'utility'
    ];
    if (!validCategories.includes(definition.category)) {
      throw new CLIError(
        `Command '${name}' has invalid category. Must be one of = {core = > cmd.isExperimental).length,deprecatedCommands = > cmd.deprecated).length
    };
  }
}

// =============================================================================
// GLOBAL REGISTRY INSTANCE
// =============================================================================

let globalRegistry = null;
let commandRouter = null; // Legacy router for backward compatibility

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

  // Handle legacy context format
  const _commandContext = context as CommandContext;
}
else
{
  commandContext = {
      command,args = await getCommandRegistry();
  const definition = registry.get(name);

  if (!definition) {
    console.error(`❌ Unknowncommand = flag.alias ? `, -${flag.alias}` : '';
      const required = flag.required ? ' (required)' : '';

  const commands = registry.list();
  
  // Group by category

    console.warn(`${category.toUpperCase()}:`);
    for (const cmd of cmds) {
      const deprecated = cmd.deprecated ? ' (deprecated)' : '';
      const experimental = cmd.isExperimental ? ' (experimental)' : '';
      console.warn(`  ${cmd.name.padEnd(15)} ${cmd.description}${deprecated}${experimental}`);
    }
    console.warn();
  }
}

/**
 * Check if command exists
 */
export async function hasCommand(name = await getCommandRegistry();
return registry.has(name);
}

/**
 * Get command definition
 */
export async function getCommand(name = await getCommandRegistry();
return registry.get(name);
}

/**
 * Register a new command
 */
export async function registerCommand(name = await getCommandRegistry();
registry.register(name, definition);
}

// =============================================================================
// LEGACY COMPATIBILITY
// =============================================================================

/**
 * Legacy command registry for backward compatibility
 */
export const commandRegistry = {register = await getCommandRegistry();
return registry.getStats();
}

// Re-export for maximum compatibility
export {
  type executeCommand as execute,
  type listCommands as list,
  hasCommand as has,
  getCommand as get,
  registerCommand as register,
  type showCommandHelp as help,
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function createLogger(name = > console.warn(`[TRACE:${name}] ${message}`, metadata),debug = > console.warn(`[DEBUG:${name}] ${message}`, metadata),info = > console.warn(`[INFO:${name}] ${message}`, metadata),warn = > console.warn(`[WARN:${name}] ${message}`, metadata),error = > console.error(`[ERROR:${name}] ${message}`, error, metadata),fatal = > console.error(`[FATAL:${name}] ${message}`, error, metadata),child = > createLogger(`${name}:child`),
    setLevel => {},getLevel = > 'info'
}
}

function _createDefaultConfig() {
  return { name = === 'development', isProduction = === 'production', isTest = === 'test' }, paths;
  : 
      dataDir: `$
    process.cwd()
  /,-.
  `acdeelnuz;
  configDir: `;
  $process.cwd()/
  .claude-zen/config`, logsDir
  : `$process.cwd()/.claude-zen/logs`,
      cacheDir: `$process.cwd()/.claude-zen/cache`,
      tempDir: `$process.cwd()/.claude-zen/temp`
}
}
}
