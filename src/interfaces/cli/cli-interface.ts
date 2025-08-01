/**
 * CLI Interface - Command Line Interface
 * 
 * Provides a command-line interface for Claude Code Zen
 * Integrates directly with all core systems without plugin architecture
 */

import { EventEmitter } from 'events';
import { createLogger } from '../../utils/logger.js';
import { createInterface } from 'readline/promises';
import chalk from 'chalk';

const logger = createLogger('CLIInterface');

export interface CLIConfig {
  theme?: 'dark' | 'light';
  verbose?: boolean;
  coreSystem?: any; // Reference to UnifiedCoreSystem
}

export interface CLICommand {
  name: string;
  description: string;
  aliases?: string[];
  handler: (args: string[], options: any) => Promise<void>;
}

export class CLIInterface extends EventEmitter {
  private config: CLIConfig;
  private rl?: any;
  private commands: Map<string, CLICommand> = new Map();
  private initialized = false;
  private running = false;

  constructor(config: CLIConfig = {}) {
    super();
    this.config = config;
    this.setupCommands();
  }

  /**
   * Initialize the CLI interface
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    logger.debug('Initializing CLI interface...');

    // Setup readline interface
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: this.getPrompt()
    });

    this.setupEventHandlers();
    this.initialized = true;

    logger.debug('CLI interface initialized');
  }

  /**
   * Start the CLI interface
   */
  async start(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.running) return;

    this.running = true;
    this.displayWelcome();

    // Check if we have arguments to process directly
    const args = process.argv.slice(2);
    if (args.length > 0 && !args.includes('--interactive')) {
      // Non-interactive mode - process command and exit
      await this.processCommand(args.join(' '));
      return;
    }

    // Interactive mode
    this.displayHelp();
    this.startInteractiveLoop();
  }

  /**
   * Stop the CLI interface
   */
  stop(): void {
    this.running = false;
    if (this.rl) {
      this.rl.close();
    }
    this.emit('stopped');
  }

  /**
   * Setup available commands
   */
  private setupCommands(): void {
    // Status command
    this.commands.set('status', {
      name: 'status',
      description: 'Show system status and component health',
      aliases: ['s', 'stat'],
      handler: async (args, options) => {
        await this.showStatus();
      }
    });

    // Help command
    this.commands.set('help', {
      name: 'help',
      description: 'Show available commands and usage',
      aliases: ['h', '?'],
      handler: async (args, options) => {
        this.displayHelp();
      }
    });

    // Process document command
    this.commands.set('process', {
      name: 'process',
      description: 'Process a document through the workflow system',
      aliases: ['proc', 'p'],
      handler: async (args, options) => {
        const documentPath = args[0];
        if (!documentPath) {
          console.log(chalk.red('❌ Please provide a document path'));
          console.log(chalk.gray('Usage: process <document-path>'));
          return;
        }
        await this.processDocument(documentPath);
      }
    });

    // Export command
    this.commands.set('export', {
      name: 'export',
      description: 'Export system data in specified format',
      aliases: ['exp', 'e'],
      handler: async (args, options) => {
        const format = args[0] || 'json';
        await this.exportSystemData(format);
      }
    });

    // Report command
    this.commands.set('report', {
      name: 'report',
      description: 'Generate comprehensive system report',
      aliases: ['rep', 'r'],
      handler: async (args, options) => {
        await this.generateReport();
      }
    });

    // Launch TUI command
    this.commands.set('tui', {
      name: 'tui',
      description: 'Launch Terminal UI interface',
      handler: async (args, options) => {
        console.log(chalk.blue('🔄 Switching to TUI interface...'));
        console.log(chalk.gray('Restart with --tui flag or use: claude-zen --tui'));
        process.exit(0);
      }
    });

    // Launch Web command
    this.commands.set('web', {
      name: 'web',
      description: 'Launch Web interface',
      handler: async (args, options) => {
        console.log(chalk.blue('🔄 Switching to Web interface...'));
        console.log(chalk.gray('Restart with --web flag or use: claude-zen --web'));
        process.exit(0);
      }
    });

    // Exit command
    this.commands.set('exit', {
      name: 'exit',
      description: 'Exit the CLI interface',
      aliases: ['quit', 'q'],
      handler: async (args, options) => {
        console.log(chalk.blue('👋 Goodbye!'));
        this.stop();
        process.exit(0);
      }
    });
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    if (!this.rl) return;

    this.rl.on('line', async (input: string) => {
      const trimmed = input.trim();
      if (trimmed) {
        await this.processCommand(trimmed);
      }
      if (this.running) {
        this.rl.prompt();
      }
    });

    this.rl.on('close', () => {
      this.stop();
    });

    // Handle Ctrl+C
    this.rl.on('SIGINT', () => {
      console.log(chalk.yellow('\n👋 Goodbye!'));
      this.stop();
      process.exit(0);
    });
  }

  /**
   * Start interactive command loop
   */
  private startInteractiveLoop(): void {
    if (!this.rl) return;
    
    this.rl.prompt();
  }

  /**
   * Process a command input
   */
  private async processCommand(input: string): Promise<void> {
    const parts = input.split(' ');
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Find command by name or alias
    let command = this.commands.get(commandName);
    if (!command) {
      // Check aliases
      for (const [name, cmd] of this.commands) {
        if (cmd.aliases?.includes(commandName)) {
          command = cmd;
          break;
        }
      }
    }

    if (!command) {
      console.log(chalk.red(`❌ Unknown command: ${commandName}`));
      console.log(chalk.gray('Type "help" to see available commands'));
      return;
    }

    try {
      await command.handler(args, {});
    } catch (error) {
      console.log(chalk.red(`❌ Error executing command: ${error instanceof Error ? error.message : error}`));
      if (this.config.verbose) {
        console.error(error);
      }
    }
  }

  /**
   * Display welcome message
   */
  private displayWelcome(): void {
    const theme = this.config.theme || 'dark';
    const titleColor = theme === 'dark' ? chalk.cyan : chalk.blue;
    
    console.log('');
    console.log(titleColor('🧠 Claude Code Zen - CLI Interface'));
    console.log(chalk.gray(`Version 2.0.0-alpha.73`));
    console.log(chalk.gray('Type "help" for available commands or "exit" to quit'));
    console.log('');
  }

  /**
   * Display help information
   */
  private displayHelp(): void {
    console.log(chalk.bold('📋 Available Commands:'));
    console.log('');

    for (const [name, command] of this.commands) {
      const aliases = command.aliases?.length ? ` (${command.aliases.join(', ')})` : '';
      console.log(`  ${chalk.cyan(command.name)}${chalk.gray(aliases)} - ${command.description}`);
    }

    console.log('');
    console.log(chalk.gray('💡 Examples:'));
    console.log(chalk.gray('  status                    - Show system status'));
    console.log(chalk.gray('  process ./docs/vision.md  - Process a vision document'));
    console.log(chalk.gray('  export json               - Export system data as JSON'));
    console.log(chalk.gray('  report                    - Generate system report'));
    console.log('');
  }

  /**
   * Show system status
   */
  private async showStatus(): Promise<void> {
    if (!this.config.coreSystem) {
      console.log(chalk.yellow('⚠️  Core system not available'));
      return;
    }

    try {
      console.log(chalk.blue('📊 System Status:'));
      console.log('');

      const status = await this.config.coreSystem.getSystemStatus();

      console.log(`   Status: ${this.getStatusIcon(status.status)} ${status.status}`);
      console.log(`   Version: ${status.version}`);
      console.log(`   Uptime: ${Math.round(status.uptime / 1000)}s`);
      console.log('');

      console.log(chalk.bold('🔧 Components:'));
      for (const [name, info] of Object.entries(status.components)) {
        const icon = this.getStatusIcon(info.status);
        console.log(`   ${icon} ${name}: ${info.status}`);
        
        if ('sessions' in info) console.log(`      Sessions: ${info.sessions}`);
        if ('activeWorkflows' in info) console.log(`      Active Workflows: ${info.activeWorkflows}`);
        if ('documentsIndexed' in info) console.log(`      Documents Indexed: ${info.documentsIndexed}`);
      }
      console.log('');

    } catch (error) {
      console.log(chalk.red('❌ Failed to get system status:'), error instanceof Error ? error.message : error);
    }
  }

  /**
   * Process a document
   */
  private async processDocument(documentPath: string): Promise<void> {
    if (!this.config.coreSystem) {
      console.log(chalk.yellow('⚠️  Core system not available'));
      return;
    }

    try {
      console.log(chalk.blue(`📄 Processing document: ${documentPath}`));
      
      const result = await this.config.coreSystem.processDocument(documentPath);
      
      if (result.success) {
        console.log(chalk.green('✅ Document processed successfully'));
        if (result.workflowIds.length > 0) {
          console.log(`   Started workflows: ${result.workflowIds.join(', ')}`);
        }
      } else {
        console.log(chalk.red('❌ Failed to process document:'), result.error);
      }

    } catch (error) {
      console.log(chalk.red('❌ Error processing document:'), error instanceof Error ? error.message : error);
    }
  }

  /**
   * Export system data
   */
  private async exportSystemData(format: string): Promise<void> {
    if (!this.config.coreSystem) {
      console.log(chalk.yellow('⚠️  Core system not available'));
      return;
    }

    try {
      console.log(chalk.blue(`📦 Exporting system data as ${format}...`));
      
      const result = await this.config.coreSystem.exportSystemData(format);
      
      if (result.success) {
        console.log(chalk.green('✅ Export completed successfully'));
        if (result.filename) {
          console.log(`   File: ${result.filename}`);
        }
      } else {
        console.log(chalk.red('❌ Export failed:'), result.error);
      }

    } catch (error) {
      console.log(chalk.red('❌ Error during export:'), error instanceof Error ? error.message : error);
    }
  }

  /**
   * Generate system report
   */
  private async generateReport(): Promise<void> {
    if (!this.config.coreSystem) {
      console.log(chalk.yellow('⚠️  Core system not available'));
      return;
    }

    try {
      console.log(chalk.blue('📋 Generating system report...'));
      
      const report = await this.config.coreSystem.generateSystemReport();
      
      console.log('');
      console.log(report);
      console.log('');

    } catch (error) {
      console.log(chalk.red('❌ Error generating report:'), error instanceof Error ? error.message : error);
    }
  }

  /**
   * Get status icon for display
   */
  private getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'ready':
      case 'running':
      case 'healthy':
        return chalk.green('✅');
      case 'initializing':
      case 'starting':
        return chalk.yellow('🔄');
      case 'error':
      case 'failed':
        return chalk.red('❌');
      case 'warning':
        return chalk.yellow('⚠️');
      default:
        return chalk.gray('⚪');
    }
  }

  /**
   * Get command prompt
   */
  private getPrompt(): string {
    const theme = this.config.theme || 'dark';
    const promptColor = theme === 'dark' ? chalk.cyan : chalk.blue;
    return promptColor('claude-zen> ');
  }
}