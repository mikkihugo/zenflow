/**
 * CLI Application
 *
 * Main CLI application class that orchestrates the entire command-line interface.
 * Handles initialization, command parsing, plugin management, and global coordination.
 */

import chalk from 'chalk';
import { EventEmitter } from 'events';
import meow from 'meow';
import ora from 'ora';
import type {
  AsyncResult,
  CliConfig,
  CommandContext,
  CommandMetadata,
  CommandResult,
} from '../types/index';
import type { BaseCommand } from './base-command';
import { type CommandPlugin, CommandRegistry } from './command-registry';
import { ConfigLoader } from './config-loader';
import { ErrorHandler } from './error-handler';

/**
 * CLI application options
 */
export interface CliAppOptions {
  /** Application name */
  name: string;

  /** Application version */
  version: string;

  /** Application description */
  description: string;

  /** Configuration loading options */
  config?: {
    files?: string[];
    envPrefix?: string;
    createDefault?: boolean;
  };

  /** Command loading paths */
  commandPaths?: string[];

  /** Plugin loading paths */
  pluginPaths?: string[];

  /** Global flags */
  flags?: Record<string, any>;

  /** Whether to setup global error handlers */
  setupErrorHandlers?: boolean;

  /** Whether to enable color output */
  colors?: boolean;

  /** Whether to show help on no command */
  helpOnEmpty?: boolean;
}

/**
 * CLI application statistics
 */
interface AppStats {
  startTime: number;
  commandsExecuted: number;
  errorsHandled: number;
  pluginsLoaded: number;
  uptime: number;
}

/**
 * Main CLI application class
 */
export class CliApp extends EventEmitter {
  private readonly options: CliAppOptions;
  private readonly registry: CommandRegistry;
  private readonly configLoader: ConfigLoader;
  private readonly errorHandler: ErrorHandler;
  private config: CliConfig | null = null;
  private isInitialized = false;
  private stats: AppStats;
  private spinner = ora();

  constructor(options: CliAppOptions) {
    super();

    this.options = {
      setupErrorHandlers: true,
      colors: true,
      helpOnEmpty: true,
      ...options,
    };

    this.registry = new CommandRegistry();
    this.configLoader = new ConfigLoader();
    this.errorHandler = ErrorHandler.getInstance({
      colors: this.options.colors,
      debug: false, // Will be updated from config
      verbose: false, // Will be updated from config
    });

    this.stats = {
      startTime: Date.now(),
      commandsExecuted: 0,
      errorsHandled: 0,
      pluginsLoaded: 0,
      uptime: 0,
    };

    this.setupEventHandlers();
  }

  /**
   * Initialize the CLI application
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    this.emit('initializing');

    try {
      // Load configuration
      await this.loadConfiguration();

      // Setup error handlers
      if (this.options.setupErrorHandlers) {
        this.setupErrorHandlers();
      }

      // Initialize command registry
      if (this.options.commandPaths) {
        for (const path of this.options.commandPaths) {
          this.registry.addLoadingPath(path);
        }
      }

      await this.registry.initialize();

      // Load plugins
      await this.loadPlugins();

      this.isInitialized = true;
      this.emit('initialized');
    } catch (error) {
      this.emit('initialization-error', error);
      throw error;
    }
  }

  /**
   * Run the CLI application
   */
  async run(argv?: string[]): Promise<number> {
    try {
      // Initialize if not already done
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Parse command line arguments
      const cli = this.parseArguments(argv);

      // Handle version flag
      if (cli.flags.version) {
        console.log(this.options.version);
        return 0;
      }

      // Ensure cli.input exists
      const input = cli.input || [];

      // Handle help flag or no command
      if (cli.flags.help || (input.length === 0 && this.options.helpOnEmpty)) {
        this.showHelp(input[0]);
        return 0;
      }

      // Extract command and arguments
      const [commandName, ...commandArgs] = input;

      if (!commandName) {
        if (this.options.helpOnEmpty) {
          this.showHelp();
          return 0;
        } else {
          console.error(chalk.red('No command specified'));
          return 1;
        }
      }

      // Create command context
      const context: CommandContext = {
        args: commandArgs,
        flags: cli.flags,
        input: input,
        pkg: {
          name: this.options.name,
          version: this.options.version,
          description: this.options.description,
        },
        cwd: process.cwd(),
        env: process.env,
        debug: cli.flags.debug || this.config?.defaults.debug || false,
        verbose: cli.flags.verbose || this.config?.defaults.verbose || false,
        config: this.config as Record<string, unknown>,
      };

      // Execute command
      const result = await this.executeCommand(commandName, context);

      // Handle result
      if (result.success) {
        if (result.message) {
          console.log(result.message);
        }
        return result.exitCode || 0;
      } else {
        if (result.error) {
          await this.errorHandler.handle(new Error(result.error), context);
        }
        return result.exitCode || 1;
      }
    } catch (error) {
      await this.errorHandler.handle(error instanceof Error ? error : new Error(String(error)));
      return 1;
    }
  }

  /**
   * Parse command line arguments
   */
  private parseArguments(argv?: string[]) {
    const globalFlags = {
      help: {
        type: 'boolean',
        shortFlag: 'h',
        description: 'Show help',
      },
      version: {
        type: 'boolean',
        shortFlag: 'v',
        description: 'Show version',
      },
      debug: {
        type: 'boolean',
        shortFlag: 'd',
        description: 'Enable debug mode',
      },
      verbose: {
        type: 'boolean',
        description: 'Enable verbose output',
      },
      config: {
        type: 'string',
        shortFlag: 'c',
        description: 'Configuration file path',
      },
      noColors: {
        type: 'boolean',
        description: 'Disable color output',
      },
      json: {
        type: 'boolean',
        description: 'Output in JSON format',
      },
      ...this.options.flags,
    };

    return meow({
      description: this.options.description,
      flags: globalFlags,
      argv,
      importMeta: import.meta,
      autoHelp: false, // We'll handle help ourselves
      autoVersion: false, // We'll handle version ourselves
    });
  }

  /**
   * Execute a command
   */
  private async executeCommand(name: string, context: CommandContext): Promise<CommandResult> {
    this.emit('command-start', { name, context });

    try {
      // Update error handler config from flags
      this.errorHandler.updateConfig({
        debug: context.debug,
        verbose: context.verbose,
        colors: !context.flags.noColors && this.config?.ui?.theme !== undefined,
      });

      const result = await this.registry.execute(name, context);

      this.stats.commandsExecuted++;
      this.emit('command-complete', { name, result });

      return result;
    } catch (error) {
      this.stats.errorsHandled++;
      const commandError = error instanceof Error ? error : new Error(String(error));

      this.emit('command-error', { name, error: commandError });

      return {
        success: false,
        error: commandError.message,
        exitCode: 1,
        executionTime: 0,
      };
    }
  }

  /**
   * Show help information
   */
  private showHelp(commandName?: string): void {
    if (commandName) {
      // Show help for specific command
      const command = this.registry.getCommand(commandName);
      if (command) {
        console.log(command.getHelp());

        const examples = command.getExamples();
        if (examples.length > 0) {
          console.log('\\nExamples:');
          examples.forEach((example) => {
            console.log(`  ${example}`);
          });
        }
      } else {
        console.error(chalk.red(`Command '${commandName}' not found`));
        this.showAvailableCommands();
      }
    } else {
      // Show general help
      this.showGeneralHelp();
    }
  }

  /**
   * Show general help
   */
  private showGeneralHelp(): void {
    console.log(chalk.bold(this.options.name), `v${this.options.version}`);
    console.log(this.options.description);
    console.log();
    console.log(chalk.bold('Usage:'));
    console.log(`  ${this.options.name} <command> [options]`);
    console.log();

    this.showAvailableCommands();

    console.log();
    console.log(chalk.bold('Global Options:'));
    console.log('  -h, --help     Show help');
    console.log('  -v, --version  Show version');
    console.log('  -d, --debug    Enable debug mode');
    console.log('  --verbose      Enable verbose output');
    console.log('  -c, --config   Configuration file path');
    console.log('  --noColors     Disable color output');
    console.log('  --json         Output in JSON format');
  }

  /**
   * Show available commands
   */
  private showAvailableCommands(): void {
    const commands = this.registry.list();

    if (commands.length === 0) {
      console.log('No commands available');
      return;
    }

    // Group commands by category
    const categories = new Map<string, CommandMetadata[]>();

    for (const command of commands) {
      const category = command.config.category || 'General';
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(command);
    }

    console.log(chalk.bold('Available Commands:'));

    for (const [category, categoryCommands] of categories) {
      console.log();
      console.log(chalk.yellow(category + ':'));

      for (const command of categoryCommands.sort((a, b) =>
        a.config.name.localeCompare(b.config.name)
      )) {
        const deprecated = command.config.deprecated ? chalk.red(' (deprecated)') : '';
        console.log(
          `  ${chalk.green(command.config.name.padEnd(20))} ${command.config.description}${deprecated}`
        );
      }
    }
  }

  /**
   * Load configuration
   */
  private async loadConfiguration(): Promise<void> {
    this.spinner.start('Loading configuration...');

    try {
      this.config = await this.configLoader.load({
        configFiles: this.options.config?.files,
        envPrefix: this.options.config?.envPrefix,
        createDefault: this.options.config?.createDefault,
      });

      this.spinner.succeed('Configuration loaded');
      this.emit('config-loaded', this.config);
    } catch (error) {
      this.spinner.fail('Failed to load configuration');
      throw error;
    }
  }

  /**
   * Load plugins
   */
  private async loadPlugins(): Promise<void> {
    if (!this.options.pluginPaths || this.options.pluginPaths.length === 0) {
      return;
    }

    this.spinner.start('Loading plugins...');

    try {
      // This is a simplified plugin loading implementation
      // In a real implementation, you would scan the plugin paths and load actual plugins
      this.spinner.succeed(`Loaded ${this.stats.pluginsLoaded} plugins`);
      this.emit('plugins-loaded', this.stats.pluginsLoaded);
    } catch (error) {
      this.spinner.fail('Failed to load plugins');
      throw error;
    }
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Registry events
    this.registry.on('command-registered', (data) => {
      this.emit('command-registered', data);
    });

    this.registry.on('command-executing', (data) => {
      if (this.config?.defaults.verbose) {
        console.log(chalk.gray(`Executing command: ${data.name}`));
      }
    });

    this.registry.on('command-executed', (data) => {
      if (this.config?.defaults.debug) {
        console.log(chalk.gray(`Command completed in ${data.result.executionTime}ms`));
      }
    });
  }

  /**
   * Setup global error handlers
   */
  private setupErrorHandlers(): void {
    this.errorHandler.setupGlobalHandlers();
  }

  /**
   * Register a command
   */
  registerCommand(command: BaseCommand): void {
    this.registry.registerCommand(command);
  }

  /**
   * Register a plugin
   */
  async registerPlugin(plugin: CommandPlugin): Promise<void> {
    await this.registry.registerPlugin(plugin);
    this.stats.pluginsLoaded++;
  }

  /**
   * Get application statistics
   */
  getStats(): AppStats {
    return {
      ...this.stats,
      uptime: Date.now() - this.stats.startTime,
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): CliConfig | null {
    return this.config;
  }

  /**
   * Get command registry
   */
  getRegistry(): CommandRegistry {
    return this.registry;
  }

  /**
   * Get error handler
   */
  getErrorHandler(): ErrorHandler {
    return this.errorHandler;
  }

  /**
   * Check if application is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    this.emit('shutting-down');

    try {
      // Dispose of registry
      await this.registry.dispose();

      // Clean up resources
      this.removeAllListeners();

      this.emit('shutdown-complete');
    } catch (error) {
      this.emit('shutdown-error', error);
      throw error;
    }
  }

  /**
   * Create a new CLI application instance
   */
  static create(options: CliAppOptions): CliApp {
    return new CliApp(options);
  }

  /**
   * Run a CLI application with error handling
   */
  static async runApp(options: CliAppOptions, argv?: string[]): Promise<number> {
    const app = new CliApp(options);

    try {
      const exitCode = await app.run(argv);
      await app.shutdown();
      return exitCode;
    } catch (error) {
      console.error(
        chalk.red('Fatal error:'),
        error instanceof Error ? error.message : String(error)
      );
      try {
        await app.shutdown();
      } catch (shutdownError) {
        // Ignore shutdown errors during fatal error handling
      }
      return 1;
    }
  }
}
