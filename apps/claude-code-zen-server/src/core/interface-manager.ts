/**
 * Interface Manager - User Interface Management.
 *
 * Clean, focused interface manager that handles different user interfaces (CLI, TUI, Web)
 * without bloated "unified" architecture.
 *
 * @example
 * ```typescript
 * const interfaceManager = new InterfaceManager({
 *   defaultMode: 'auto',
 *   webPort: 3456,
 *   coreSystem: coreSystem
 * });
 *
 * await interfaceManager.initialize();
 * await interfaceManager.launch();
 * ```
 */
/**
 * @file Interface management system.
 */

import { EventEmitter } from 'eventemitter3';
import { config } from '../config';
import { getLogger } from '../config/logging-config';

const logger = getLogger('InterfaceManager');

/**
 * Interface mode types.
 */
export type InterfaceMode = 'auto' | 'cli' | 'tui' | 'web';

/**
 * Interface manager configuration.
 *
 * @example
 */
export interface InterfaceManagerConfig {
  /** Default interface mode */
  defaultMode?: InterfaceMode;
  /** Web interface port */
  webPort?: number;
  /** TUI theme */
  theme?: 'dark' | 'light';
  /** Enable real-time updates */
  enableRealTime?: boolean;
  /** Reference to core system */
  coreSystem?: unknown;
}

/**
 * Interface statistics.
 *
 * @example
 */
export interface InterfaceStats {
  /** Current active mode */
  currentMode: InterfaceMode;
  /** Whether interface is active */
  isActive: boolean;
  /** Number of active connections (for web mode) */
  activeConnections: number;
}

/**
 * Clean interface manager for user interface handling.
 *
 * @example
 */
export class InterfaceManager extends EventEmitter {
  private config: Required<InterfaceManagerConfig>;
  private currentMode: InterfaceMode = 'auto';
  private isActive = false;
  private initialized = false;

  constructor(userConfig: InterfaceManagerConfig = {}) {
    super();
    // Use centralized configuration with user overrides
    const centralConfig = config?.['getAll']();
    this.config = {
      defaultMode: userConfig?.defaultMode || 'auto',
      webPort: userConfig?.webPort || centralConfig?.interfaces?.web?.port,
      theme:
        userConfig?.theme ||
        (centralConfig?.interfaces?.shared?.theme as 'dark' | 'light'),
      enableRealTime:
        userConfig?.enableRealTime ??
        centralConfig?.interfaces?.shared?.realTimeUpdates,
      coreSystem: userConfig?.coreSystem,
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    logger.info('Initializing interface manager');

    // Detect appropriate interface mode if auto
    if (this.config.defaultMode === 'auto') {
      this.currentMode = this.detectInterfaceMode();
    } else {
      this.currentMode = this.config.defaultMode;
    }

    this.initialized = true;
    this.emit('initialized');
    logger.info(`Interface manager ready (mode: ${this.currentMode})`);
  }

  async launch(): Promise<void> {
    await this.ensureInitialized();

    if (this.isActive) {
      logger.warn('Interface already active');
      return;
    }

    logger.info(`Launching ${this.currentMode} interface...`);

    switch (this.currentMode) {
      case 'cli':
        await this.launchCLI();
        break;
      case 'tui':
        await this.launchTUI();
        break;
      case 'web':
        await this.launchWeb();
        break;
      default:
        await this.launchCLI(); // fallback
    }

    this.isActive = true;
    this.emit('launched', { mode: this.currentMode });
    logger.info(`${this.currentMode} interface launched`);
  }

  async getStats(): Promise<InterfaceStats> {
    return {
      currentMode: this.currentMode,
      isActive: this.isActive,
      activeConnections: 0, // Would track real connections in web mode
    };
  }

  async shutdown(): Promise<void> {
    logger.info('Shutting down interface manager...');

    this.isActive = false;
    this.removeAllListeners();

    logger.info('Interface manager shutdown complete');
  }

  // ==================== PRIVATE METHODS ====================

  private detectInterfaceMode(): InterfaceMode {
    // Use centralized environment detection
    const centralConfig = config?.['getAll']();
    const environment = centralConfig?.environment;

    // CI environment detection
    if (environment.isCI || !process.stdout.isTTY) {
      return 'cli';
    }

    // Check if we're in a terminal that supports TUI
    const termConfig = centralConfig?.interfaces?.terminal;
    if (termConfig?.enableColors && termConfig?.enableProgressBars) {
      return 'tui';
    }

    return 'cli';
  }

  private async launchCLI(): Promise<void> {
    logger.info('CLI interface active - commands available');
    // In a real implementation, this would set up CLI command handlers
  }

  private async launchTUI(): Promise<void> {
    logger.info('TUI interface would be launched here');
    // In a real implementation, this would launch the terminal UI
  }

  private async launchWeb(): Promise<void> {
    logger.info(
      `Web interface would be launched on port ${this.config.webPort}`
    );
    // In a real implementation, this would start the web server
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }
}
