/**
 * Command Type Definitions
 *
 * This module defines the core command interfaces for the CLI system,
 * providing type safety for command execution, configuration, and metadata.
 */

/**
 * Configuration options for a CLI command
 */
export interface CommandConfig {
  /** Command name (e.g., 'status', 'init') */
  name: string;

  /** Short description of the command */
  description: string;

  /** Detailed usage information */
  usage?: string;

  /** Command examples */
  examples?: string[];

  /** Command aliases */
  aliases?: string[];

  /** Whether command requires plugin initialization */
  requiresPlugins?: boolean;

  /** Whether command is deprecated */
  deprecated?: boolean;

  /** Deprecation message if applicable */
  deprecationMessage?: string;

  /** Command category for grouping in help */
  category?: 'core' | 'swarm' | 'config' | 'utility' | 'experimental';

  /** Minimum required arguments */
  minArgs?: number;

  /** Maximum allowed arguments */
  maxArgs?: number;

  /** Command-specific flags configuration */
  flags?: Record<string, CommandFlagConfig>;
}

/**
 * Configuration for individual command flags
 */
export interface CommandFlagConfig {
  /** Flag type */
  type: 'boolean' | 'string' | 'number';

  /** Flag description */
  description: string;

  /** Default value */
  default?: unknown;

  /** Whether flag is required */
  required?: boolean;

  /** Flag aliases */
  aliases?: string[];

  /** Validation function */
  validator?: (value: unknown) => boolean | string;
}

/**
 * Runtime context passed to command handlers
 */
export interface CommandContext {
  /** Parsed command-line arguments */
  args: string[];

  /** Parsed command-line flags */
  flags: CommandFlags;

  /** Original CLI input */
  input: string[];

  /** Plugin manager instance */
  pluginManager?: unknown;

  /** CLI package information */
  pkg: {
    name: string;
    version: string;
    description?: string;
  };

  /** Working directory */
  cwd: string;

  /** Environment variables */
  env: Record<string, string | undefined>;

  /** Debug mode flag */
  debug: boolean;

  /** Verbose output flag */
  verbose: boolean;

  /** Configuration object */
  config?: Record<string, unknown>;
}

/**
 * Command execution result
 */
export interface CommandResult {
  /** Whether command executed successfully */
  success: boolean;

  /** Exit code (0 for success, non-zero for failure) */
  exitCode: number;

  /** Output message */
  message?: string;

  /** Error message if execution failed */
  error?: string;

  /** Additional data returned by command */
  data?: unknown;

  /** Execution time in milliseconds */
  executionTime?: number;

  /** Whether command was cancelled */
  cancelled?: boolean;
}

/**
 * Generic command flags interface
 */
export interface CommandFlags {
  /** Show help flag */
  help?: boolean;

  /** Help flag alias */
  h?: boolean;

  /** Show version flag */
  version?: boolean;

  /** Version flag alias */
  v?: boolean;

  /** Debug mode flag */
  debug?: boolean;

  /** Verbose output flag */
  verbose?: boolean;

  /** UI mode flag */
  ui?: boolean;

  /** Force operation flag */
  force?: boolean;

  /** Quiet mode flag */
  quiet?: boolean;

  /** Configuration file path */
  config?: string;

  /** Output format */
  format?: 'json' | 'yaml' | 'table' | 'text';

  /** Additional dynamic flags */
  [key: string]: unknown;
}

/**
 * Command metadata for registration and discovery
 */
export interface CommandMetadata {
  /** Command configuration */
  config: CommandConfig;

  /** Command handler function */
  handler: CommandHandler;

  /** Registration timestamp */
  registeredAt: Date;

  /** Plugin that registered this command */
  plugin?: string;

  /** Command execution statistics */
  stats?: CommandExecutionStats;

  /** Whether command is currently available */
  available: boolean;

  /** Command dependencies */
  dependencies?: string[];
}

/**
 * Command handler function signature
 */
export type CommandHandler = (context: CommandContext) => Promise<CommandResult> | CommandResult;

/**
 * Command execution statistics
 */
export interface CommandExecutionStats {
  /** Total number of executions */
  executionCount: number;

  /** Total execution time in milliseconds */
  totalExecutionTime: number;

  /** Average execution time in milliseconds */
  averageExecutionTime: number;

  /** Number of successful executions */
  successCount: number;

  /** Number of failed executions */
  failureCount: number;

  /** Last execution timestamp */
  lastExecuted?: Date;

  /** Last execution result */
  lastResult?: CommandResult;
}

/**
 * Command validation result
 */
export interface CommandValidationResult {
  /** Whether validation passed */
  valid: boolean;

  /** Validation errors */
  errors: string[];

  /** Validation warnings */
  warnings: string[];
}

/**
 * Command registry interface
 */
export interface CommandRegistry {
  /** Register a new command */
  register(metadata: CommandMetadata): void;

  /** Unregister a command */
  unregister(name: string): boolean;

  /** Get command metadata */
  get(name: string): CommandMetadata | undefined;

  /** Check if command exists */
  has(name: string): boolean;

  /** List all registered commands */
  list(): CommandMetadata[];

  /** Find commands by category */
  findByCategory(category: string): CommandMetadata[];

  /** Execute a command */
  execute(name: string, context: CommandContext): Promise<CommandResult>;
}
