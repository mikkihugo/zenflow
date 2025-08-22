/**
 * Interface Launcher.
 *
 * Handles launching the appropriate interface (CLI/TUI/Web) based on environment.
 * And configuration. Integrates with all core systems directly without plugins.
 */
/**
 * @file Interface-launcher implementation.
 */

import { TypedEventBase } from '@claude-zen/foundation';

// Removed broken import - using simple URL construction
import { getLogger } from '@claude-zen/foundation';
// WebConfig interface - using fallback type if infrastructure facade not available
interface WebConfig {
  port: number;
  theme?: 'dark''' | '''light';
  realTime?: boolean;
  coreSystem?: Record<string, unknown>;
}

import {
  type InterfaceMode,
  InterfaceModeDetector,
  type ModeDetectionOptions,
} from './interface-mode-detector';

const logger = getLogger('InterfaceLauncher');

export interface LaunchOptions extends ModeDetectionOptions {
  verbose?: boolean;
  silent?: boolean;
  config?: {
    theme?: 'dark''' | '''light';
    realTime?: boolean;
    coreSystem?: Record<string, unknown>; // Reference to ApplicationCoordinator
  };
}

// Remove local WebConfig interface since we import.*from.*

export interface LaunchResult {
  mode: InterfaceMode;
  success: boolean;
  url?: string;
  error?: string;
  pid?: number;
}

export class InterfaceLauncher extends TypedEventBase {
  private static instance: InterfaceLauncher;
  private activeInterface?:'' | ''{
        mode: InterfaceMode;
        process?: NodeJS.Process;
        server?: Record<string, unknown>;
        url?: string;
        pid?: number;
      }'' | ''undefined;

  private constructor() {
    super();
    this.setupShutdownHandlers();
  }

  /**
   * Get singleton instance.
   */
  static getInstance(): InterfaceLauncher {
    if (!InterfaceLauncher.instance) {
      InterfaceLauncher.instance = new InterfaceLauncher();
    }
    return InterfaceLauncher.instance;
  }

  /**
   * Launch the appropriate interface based on options and environment.
   *
   * @param options
   */
  async launch(options: LaunchOptions = {}): Promise<LaunchResult> {
    const detection = InterfaceModeDetector.detect(options);

    if (!options?.['silent']) {
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

      if (result?.success) {
        this.activeInterface = {
          mode: detection.mode,
          ...(result?.url !== undefined && { url: result?.url }),
          ...(result?.pid !== undefined && { pid: result?.pid }),
        };

        this.emit('interface:launched', {
          mode: detection.mode,
          url: result?.url,
          pid: result?.pid,
        });

        if (!options?.['silent']) {
          logger.info(
            `✅ ${detection.mode.toUpperCase()} interface launched successfully`
          );
          if (result?.url) {
            logger.info(`🌐 Available at: ${result?.url}`);
          }
        }
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      logger.error(
        `❌ Failed to launch ${detection.mode} interface:`,
        errorMessage
      );

      return {
        mode: detection.mode,
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Launch CLI interface (Unified Terminal Interface).
   *
   * @param options
   */
  private async launchCLI(options: LaunchOptions): Promise<LaunchResult> {
    logger.debug('Launching Unified Terminal Interface in CLI mode');

    try {
      // Use the unified terminal interface
      const { spawn } = await import('node:child_process');
      const cliArgs: string[] = [];

      if (options?.['verbose']) cliArgs.push('--verbose');
      if (options?.['config']?.theme)
        cliArgs.push('--theme', options?.['config']?.theme);

      // CLI mode will be detected automatically based on presence of commands
      // Don't add interactive flag to keep CLI mode behavior

      const cliProcess = spawn(
        'npx',
        ['tsx', 'src/interfaces/terminal/main.tsx', ...cliArgs],
        {
          stdio: 'inherit',
          cwd: process.cwd(),
        }
      );

      return new Promise<LaunchResult>((resolve, reject) => {
        cliProcess.on('close', (code) => {
          resolve({
            mode: 'cli',
            success: code === 0,
            ...(cliProcess.pid !== undefined && { pid: cliProcess.pid }),
          });
        });

        cliProcess.on('error', (error) => {
          logger.error('Unified Terminal Interface launch error:', error);
          reject(error);
        });
      });
    } catch (_error) {
      // Fallback to basic CLI if unified terminal fails
      logger.warn('Unified Terminal Interface launch failed, using basic CLI');
      return this.launchBasicCLI(options);
    }
  }

  /**
   * Launch TUI interface using Unified Terminal Interface.
   *
   * @param options
   */
  private async launchTUI(options: LaunchOptions): Promise<LaunchResult> {
    logger.debug('Launching Unified Terminal Interface in TUI mode');

    try {
      // Use the unified terminal interface with TUI mode flag
      const { spawn } = await import('node:child_process');
      const tuiArgs = ['--ui']; // Force TUI mode

      if (options?.['verbose']) tuiArgs.push('--verbose');
      if (options?.['config']?.theme)
        tuiArgs.push('--theme', options?.['config']?.theme);

      const tuiProcess = spawn(
        'npx',
        ['tsx', 'src/interfaces/terminal/main.tsx', ...tuiArgs],
        {
          stdio: 'inherit',
          cwd: process.cwd(),
        }
      );

      return new Promise<LaunchResult>((resolve, reject) => {
        tuiProcess.on('close', (code) => {
          resolve({
            mode: 'tui',
            success: code === 0,
            ...(tuiProcess.pid !== undefined && { pid: tuiProcess.pid }),
          });
        });

        tuiProcess.on('error', (error) => {
          logger.error('Unified Terminal Interface TUI launch error:', error);
          reject(error);
        });
      });
    } catch (error) {
      logger.error('Failed to launch TUI interface:', error);

      // Fallback to CLI
      logger.info('Falling back to CLI interface');
      return this.launchCLI(options);
    }
  }

  /**
   * Launch Web interface.
   *
   * @param options
   * @param port
   */
  private async launchWeb(
    options: LaunchOptions,
    port?: number
  ): Promise<LaunchResult> {
    const webPort = port'' | '''' | ''options?.['webPort']'' | '''' | ''3456;

    logger.debug(`Launching Web interface on port ${webPort}`);

    try {
      // Dynamic import of Web interface
      const { WebInterface } = await import('./interfaces/web/web-interface');

      const webConfig: WebConfig = {
        port: webPort,
        theme: options?.['config']?.theme'' | '''' | '''dark',
        realTime: options?.['config']?.realTime !== false,
        coreSystem: options?.['config']?.coreSystem,
      };

      const web = new WebInterface(webConfig);

      // Web interface auto-initializes on construction
      await web.run();
      const server = web as any; // Use the web interface instance as server

      // Simple URL construction
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
   * Basic CLI fallback when TUI/Web interfaces aren't available.
   *
   * @param options
   */
  private async launchBasicCLI(options: LaunchOptions): Promise<LaunchResult> {
    logger.info('🔧 Claude Code Zen - Basic CLI Mode');

    if (options?.['config']?.coreSystem) {
      const system = options?.['config']?.coreSystem;

      try {
        // Show system status
        if (
          system &&
          typeof system === 'object' &&
          'getSystemStatus' in system
        ) {
          const getSystemStatusFn = system['getSystemStatus'];
          if (typeof getSystemStatusFn === 'function') {
            const status = await getSystemStatusFn();
            if (
              status &&
              typeof status === 'object' &&
              'components' in status
            ) {
              for (const [_name, _info] of Object.entries(
                status.components as Record<string, unknown>
              )) {
              }
            }
          }
        }
      } catch (error) {
        logger.error('Failed to show system status:', error);
      }
    } else {
    }

    return {
      mode: 'cli',
      success: true,
      pid: process.pid,
    };
  }

  /**
   * Get current interface status.
   */
  getStatus(): {
    active: boolean;
    mode?: InterfaceMode;
    url?: string;
    pid?: number;
  } {
    return {
      active: !!this.activeInterface,
      ...(this.activeInterface?.mode !== undefined && {
        mode: this.activeInterface.mode,
      }),
      ...(this.activeInterface?.url !== undefined && {
        url: this.activeInterface.url,
      }),
      ...(this.activeInterface?.pid !== undefined && {
        pid: this.activeInterface.pid,
      }),
    };
  }

  /**
   * Shutdown active interface.
   */
  async shutdown(): Promise<void> {
    if (!this.activeInterface) return;

    logger.info(`Shutting down ${this.activeInterface.mode} interface...`);

    try {
      if (this.activeInterface.server) {
        // Web server shutdown
        await new Promise<void>((resolve) => {
          const server = this.activeInterface?.server;
          if (server && typeof server === 'object' && 'close' in server) {
            const closeFn = server['close'];
            if (typeof closeFn === 'function') {
              closeFn(() => {
                resolve();
              });
            } else {
              resolve();
            }
          } else {
            resolve();
          }
        });
      }

      if (this.activeInterface.process) {
        // Process-based interface shutdown
        this.activeInterface.process.kill(15); // SIGTERM
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
   * Restart interface with new options.
   *
   * @param options
   */
  async restart(options: LaunchOptions = {}): Promise<LaunchResult> {
    logger.info('Restarting interface...');

    await this.shutdown();
    return this.launch(options);
  }

  /**
   * Get interface recommendations for current environment.
   */
  getRecommendations() {
    return InterfaceModeDetector.getRecommendation();
  }

  /**
   * Get environment information for debugging.
   */
  getEnvironmentInfo() {
    return InterfaceModeDetector.getEnvironmentInfo();
  }

  /**
   * Setup graceful shutdown handlers.
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

    process.on('unhandledRejection', async (reason: unknown) => {
      logger.error('Unhandled rejection:', reason);
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
export const launchInterface = async (
  options?: LaunchOptions
): Promise<LaunchResult> => {
  const launcher = InterfaceLauncher.getInstance();
  return launcher.launch(options);
};

export const getInterfaceStatus = () => {
  const launcher = InterfaceLauncher.getInstance();
  return launcher.getStatus();
};

export const shutdownInterface = async (): Promise<void> => {
  const launcher = InterfaceLauncher.getInstance();
  return launcher.shutdown();
};
