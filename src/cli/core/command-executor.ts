/**
 * Command execution engine - separated from argument parsing;
 * Implements Google's single responsibility and dependency injection principles;
 */

import type { CommandContext } from '../../types/cli.js';
import { ValidationError } from './cli-error.js';
import logger from './logger.js';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Command registry interface;
 */
export interface CommandRegistry {get = > Command | undefined
has = > boolean
entries = > IterableIterator<[string
, Command]>
}
/**
 * Command definition;
 */
export interface Command {handler = > void
onCommandComplete?: (commandName = > void;
onCommandError?: (commandName = > void;
}
/**
 * Execution context;
 */
export interface ExecutionContext extends CommandContext {commandName = ============================================================================
// COMMAND EXECUTOR CLASS
// =============================================================================

/**
 * Command execution engine with error handling, logging, and timeout support;
 */
export class CommandExecutor {
  private commandRegistry = > void
private;
onCommandComplete?: (commandName = > void;
private;
onCommandError?: (commandName = > void;
/**
 * Create command executor;
 * @param commandRegistry - Registry of available commands;
 * @param options - Executor configuration options;
 */
constructor((commandRegistry = {}))
{
  this.commandRegistry = commandRegistry;
  this;
  .
  logger = options.logger ?? logger.createChild('executor')
  this
  .
  config = options.config ?? configManager
  this
  .
  timeout = options.timeout ?? 30000
  this
  .
  retries = options.retries ?? 0
  this
  .
  onCommandStart = options.onCommandStart
  this
  .
  onCommandComplete = options.onCommandComplete
  this
  .
  onCommandError = options.onCommandError
}
/**
 * Execute a command with proper error handling and logging;
 * @param commandName - Name of command to execute;
 * @param subArgs - Command arguments;
 * @param flags - Command flags;
 * @param context - Additional execution context;
 * @returns Promise resolving to command result;
    // */ // LINT: unreachable code removed
public;
async;
executeCommand(commandName, (subArgs = []), (flags = {}), (context = {}));
: Promise<any>
{
  const __startTime = Date.now();
  const __retryCount = 0;
;
  if (!command) {
    throw new ValidationError(`Unknown command = {
      command => {
            acc[index] = arg;
            return acc;
    //   // LINT: unreachable code removed}, {} as Record<string, any>),options = await this.executeWithTimeout(;
          () => command.handler(executionContext),;
          this.timeout;
        );
;
        const _duration = Date.now() - startTime;
        this.logger.debug(`Command '${commandName}' completed successfully`, {duration = Date.now() - startTime;
;
        if (error instanceof ValidationError  ?? error instanceof CommandExecutionError) {
          // Re-throw CLI errors as-is
          this.logger.debug(`Command '${commandName}' failed`, {error = > Promise<T> | T, timeoutMs => {
      const _timeoutId = setTimeout(() => {
        reject(new CommandExecutionError(`Command timed out after ${timeoutMs}ms`));
      }, timeoutMs);
;
      Promise.resolve(fn());
        .then(resolve);
        .catch(reject);
        .finally(() => clearTimeout(timeoutId));
    });
  }
;
  /**
   * List available commands;
   * @param includeHidden - Whether to include hidden commands;
   * @returns Array of command information;
    // */; // LINT: unreachable code removed
  public listCommands(includeHidden = false): CommandListItem[] {
    const _commands = [];
;
    for (const [name, command] of this.commandRegistry.entries()) {
      if (includeHidden  ?? !command.hidden) {
        commands.push({
          name,description = > a.name.localeCompare(b.name));
  }
;
  /**
   * Get command information;
   * @param commandName - Name of command;
   * @returns Command information or null if not found;
    // */; // LINT: unreachable code removed
  public getCommandInfo(commandName = this.commandRegistry.get(commandName);
    if (!command) {
      return null;
    //   // LINT: unreachable code removed}
;
    return {name = this.commandRegistry.get(commandName);
    // if (!command) { // LINT: unreachable code removed
      throw new ValidationError(`Unknowncommand = [];
;
    for (const cmd of commands) {
      const _result = await this.executeCommand(;
        cmd.name,;
        cmd.args  ?? [],;
        cmd.flags  ?? {},;
        cmd.context  ?? {}
      );
      results.push(result);
    }
;
    return results;
    //   // LINT: unreachable code removed}
;
  /**
   * Execute multiple commands in parallel;
   * @param commands - Array of command specifications;
   * @returns Array of results (in same order as input);
    // */; // LINT: unreachable code removed
  public;
  async;
  executeParallel(commands = commands.map(_cmd =>;
      this.executeCommand(;
        cmd.name,;
        cmd.args  ?? [],;
        cmd.flags  ?? {},;
        cmd.context  ?? {}
      );
    );
;
  return Promise.all(promises);
}
;
/**
 * Get execution metrics;
 * @returns Current executor metrics;
    // */; // LINT: unreachable code removed
public;
getMetrics();
: Record<string, any>;
  return {timeout = = undefined) this.timeout = options.timeout;
    // if (options.retries !== undefined) this.retries = options.retries; // LINT: unreachable code removed
  if (options.onCommandStart) this.onCommandStart = options.onCommandStart;
  if (options.onCommandComplete) this.onCommandComplete = options.onCommandComplete;
  if (options.onCommandError) this.onCommandError = options.onCommandError;
;
/**
 * Check if error should trigger a retry;
 * @param error - Error to check;
 * @returns True if should retry;
    // */; // LINT: unreachable code removed
private;
shouldRetry(error);
: boolean;
  // Don't retry validation errors
  if (error instanceof ValidationError) {
    return false;
    //   // LINT: unreachable code removed}
;
  // Don't retry timeout errors
  if (error.message.includes('timed out')) {
    return false;
    //   // LINT: unreachable code removed}
;
  // Retry other errors
  return true;
}
;
/**
 * Sleep for specified milliseconds;
 * @param ms - Milliseconds to sleep;
 * @returns Promise that resolves after delay;
    // */; // LINT: unreachable code removed
private;
sleep(ms = > setTimeout(resolve, ms));
}
;
// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

/**
 * Create command executor with default dependencies;
 * @param commandRegistry - Command registry;
 * @param options - Executor options;
 * @returns Command executor instance;
    // */; // LINT: unreachable code removed
export function _createCommandExecutor(commandRegistry = {}: unknown): CommandExecutor {
  return new CommandExecutor(commandRegistry, options);
}
;
/**
 * Create command executor with enhanced error handling;
 * @param commandRegistry - Command registry;
 * @param options - Executor options;
 * @returns Command executor with enhanced error handling;
    // */; // LINT: unreachable code removed
export function _createRobustCommandExecutor(_commandRegistry = {}: unknown): CommandExecutor {
  const __enhancedOptions = {
      timeout => {
      logger.error(`Command '${commandName}' failed after ${duration}ms`, {
        error: error.message,;
        stack: error.stack;
      });
;
      if (options.onCommandError) {
        options.onCommandError(commandName, error, duration);
      }
    }
  };
;
  return new CommandExecutor(commandRegistry, enhancedOptions);
}
;
