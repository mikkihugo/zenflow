/**
 * Unified Interface Launcher
 *
 * Handles launching the appropriate interface (CLI/TUI/Web) based on environment
 * and configuration. Integrates with all core systems directly without plugins.
 */

import { EventEmitter } from 'events';
import { createLogger } from '../utils/logger.js';
import {
  type InterfaceMode,
  InterfaceModeDetector,
  type ModeDetectionOptions,
} from './interface-mode-detector.js';

const logger = createLogger('InterfaceLauncher');

export interface LaunchOptions extends ModeDetectionOptions {
  verbose?: boolean;
  silent?: boolean;
  config?: {
    theme?: 'dark' | 'light';
    realTime?: boolean;
    coreSystem?: any; // Reference to UnifiedCoreSystem
  };
}

export interface LaunchResult {
  mode: InterfaceMode;
  success: boolean;
  url?: string;
  error?: string;
  pid?: number;
}

export class UnifiedInterfaceLauncher extends EventEmitter {
  private static instance: UnifiedInterfaceLauncher;
  private activeInterface?: {
    mode: InterfaceMode;
    process?: any;
    server?: any;
    url?: string;
    pid?: number;
  };

  private constructor() {
    super();
    this.setupShutdownHandlers();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): UnifiedInterfaceLauncher {
    if (!UnifiedInterfaceLauncher.instance) {
      UnifiedInterfaceLauncher.instance = new UnifiedInterfaceLauncher();
    }
    return UnifiedInterfaceLauncher.instance;
  }

  /**
   * Launch the appropriate interface based on options and environment
   */
  async launch(options: LaunchOptions = {}): Promise<LaunchResult> {
    const detection = InterfaceModeDetector.detect(options);

    if (!options.silent) {
      logger.info(`🚀 Launching ${detection.mode.toUpperCase()} interface`);
      logger.info(`Reason: ${detection.reason}`);
    }

    // Validate the selected mode
    const validation = InterfaceModeDetector.validateMode(detection.mode);
    if (!validation.valid) {
      const error = `Cannot launch ${detection.mode} interface: ${validation.reason}`;
      logger.error(error);
      return {
        mode: detection.mode,
        success: false,
        error,
      };
    }

    try {
      let result: LaunchResult;

      switch (detection.mode) {
        case 'cli':
          result = await this.launchCLI(options);
          break;
        case 'tui':
          result = await this.launchTUI(options);
          break;
        case 'web':
          result = await this.launchWeb(options, detection.config.port);
          break;
        default:
          throw new Error(`Unknown interface mode: ${detection.mode}`);
      }

      if (result.success) {
        this.activeInterface = {
          mode: detection.mode,
          url: result.url,
          pid: result.pid,
        };

        this.emit('interface:launched', {
          mode: detection.mode,
          url: result.url,
          pid: result.pid,
        });

        if (!options.silent) {
          logger.info(`✅ ${detection.mode.toUpperCase()} interface launched successfully`);
          if (result.url) {
            logger.info(`🌐 Available at: ${result.url}`);
          }
        }
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`❌ Failed to launch ${detection.mode} interface:`, errorMessage);

      return {
        mode: detection.mode,
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Launch CLI interface
   */
  private async launchCLI(options: LaunchOptions): Promise<LaunchResult> {
    logger.debug('Launching CLI interface');

    try {
      // Dynamic import of CLI interface
      const { CLIInterface } = await import('../interfaces/cli/cli-interface.js');

      const cli = new CLIInterface({
        theme: options.config?.theme || 'dark',
        verbose: options.verbose || false,
        coreSystem: options.config?.coreSystem,
      });

      await cli.initialize();
      await cli.start();

      return {
        mode: 'cli',
        success: true,
        pid: process.pid,
      };
    } catch (error) {
      // Fallback to basic CLI if the interface file doesn't exist
      logger.warn('CLI interface file not found, using basic CLI');
      return this.launchBasicCLI(options);
    }
  }

  /**
   * Launch TUI interface using React/Ink
   */
  private async launchTUI(options: LaunchOptions): Promise<LaunchResult> {
    logger.debug('Launching TUI interface');

    try {
      // Dynamic import of TUI interface
      const { TUIInterface } = await import('../interfaces/tui/tui-interface.js');

      const tui = new TUIInterface({
        theme: options.config?.theme || 'dark',
        realTime: options.config?.realTime || true,
        coreSystem: options.config?.coreSystem,
      });

      await tui.initialize();
      await tui.render();

      return {
        mode: 'tui',
        success: true,
        pid: process.pid,
      };
    } catch (error) {
      logger.error('Failed to launch TUI interface:', error);

      // Fallback to CLI
      logger.info('Falling back to CLI interface');
      return this.launchCLI(options);
    }
  }

  /**
   * Launch Web interface
   */
  private async launchWeb(options: LaunchOptions, port?: number): Promise<LaunchResult> {
    const webPort = port || options.webPort || 3456;

    logger.debug(`Launching Web interface on port ${webPort}`);

    try {
      // Dynamic import of Web interface
      const { WebInterface } = await import('../interfaces/web/web-interface.js');

      const web = new WebInterface({
        port: webPort,
        theme: options.config?.theme || 'dark',
        realTime: options.config?.realTime !== false,
        coreSystem: options.config?.coreSystem,
      });

      await web.initialize();
      const server = await web.start();

      const url = `http://localhost:${webPort}`;

      this.activeInterface = {
        mode: 'web',
        server,
        url,
        pid: process.pid,
      };

      return {
        mode: 'web',
        success: true,
        url,
        pid: process.pid,
      };
    } catch (error) {
      logger.error('Failed to launch Web interface:', error);
      throw error;
    }
  }

  /**
   * Basic CLI fallback when TUI/Web interfaces aren't available
   */
  private async launchBasicCLI(options: LaunchOptions): Promise<LaunchResult> {
    logger.info('🔧 Claude Code Zen - Basic CLI Mode');

    if (options.config?.coreSystem) {
      const system = options.config.coreSystem;

      try {
        // Show system status
        const status = await system.getSystemStatus();
        console.log('\n📊 System Status:');
        console.log(`   Version: ${status.version}`);
        console.log(`   Status: ${status.status}`);
        console.log(`   Uptime: ${Math.round(status.uptime / 1000)}s`);

        console.log('\n🔧 Available Components:');
        for (const [name, info] of Object.entries(status.components)) {
          console.log(`   ${name}: ${info.status}`);
        }

        console.log('\n📋 Commands:');
        console.log('   claude-zen status    - Show system status');
        console.log('   claude-zen --tui     - Launch TUI interface');
        console.log('   claude-zen --web     - Launch web interface');
        console.log('   claude-zen --help    - Show help');
      } catch (error) {
        logger.error('Failed to show system status:', error);
      }
    } else {
      console.log('\n📋 Claude Code Zen CLI');
      console.log('   Use --tui for terminal interface');
      console.log('   Use --web for web interface');
      console.log('   Use --help for more options');
    }

    return {
      mode: 'cli',
      success: true,
      pid: process.pid,
    };
  }

  /**
   * Get current interface status
   */
  getStatus(): {
    active: boolean;
    mode?: InterfaceMode;
    url?: string;
    pid?: number;
  } {
    return {
      active: !!this.activeInterface,
      mode: this.activeInterface?.mode,
      url: this.activeInterface?.url,
      pid: this.activeInterface?.pid,
    };
  }

  /**
   * Shutdown active interface
   */
  async shutdown(): Promise<void> {
    if (!this.activeInterface) return;

    logger.info(`Shutting down ${this.activeInterface.mode} interface...`);

    try {
      if (this.activeInterface.server) {
        // Web server shutdown
        await new Promise<void>((resolve) => {
          this.activeInterface!.server.close(() => {
            resolve();
          });
        });
      }

      if (this.activeInterface.process) {
        // Process-based interface shutdown
        this.activeInterface.process.kill();
      }

      this.emit('interface:shutdown', {
        mode: this.activeInterface.mode,
      });

      this.activeInterface = undefined;
      logger.info('Interface shutdown complete');
    } catch (error) {
      logger.error('Error during interface shutdown:', error);
      throw error;
    }
  }

  /**
   * Restart interface with new options
   */
  async restart(options: LaunchOptions = {}): Promise<LaunchResult> {
    logger.info('Restarting interface...');

    await this.shutdown();
    return this.launch(options);
  }

  /**
   * Get interface recommendations for current environment
   */
  getRecommendations() {
    return InterfaceModeDetector.getRecommendation();
  }

  /**
   * Get environment information for debugging
   */
  getEnvironmentInfo() {
    return InterfaceModeDetector.getEnvironmentInfo();
  }

  /**
   * Setup graceful shutdown handlers
   */
  private setupShutdownHandlers(): void {
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      try {
        await this.shutdown();
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    // Handle uncaught exceptions
    process.on('uncaughtException', async (error) => {
      logger.error('Uncaught exception:', error);
      try {
        await this.shutdown();
      } catch (shutdownError) {
        logger.error('Error during emergency shutdown:', shutdownError);
      }
      process.exit(1);
    });

    process.on('unhandledRejection', async (reason, promise) => {
      logger.error('Unhandled rejection at:', promise, 'reason:', reason);
      try {
        await this.shutdown();
      } catch (shutdownError) {
        logger.error('Error during emergency shutdown:', shutdownError);
      }
      process.exit(1);
    });
  }
}

// Export convenience functions
export const launchInterface = async (options?: LaunchOptions): Promise<LaunchResult> => {
  const launcher = UnifiedInterfaceLauncher.getInstance();
  return launcher.launch(options);
};

export const getInterfaceStatus = () => {
  const launcher = UnifiedInterfaceLauncher.getInstance();
  return launcher.getStatus();
};

export const shutdownInterface = async (): Promise<void> => {
  const launcher = UnifiedInterfaceLauncher.getInstance();
  return launcher.shutdown();
};
