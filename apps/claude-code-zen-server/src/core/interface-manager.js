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
import { EventEmitter } from 'node:events';
import { config } from '../config';
import { getLogger } from '../config/logging-config';
const logger = getLogger('InterfaceManager');
/**
 * Clean interface manager for user interface handling.
 *
 * @example
 */
export class InterfaceManager extends EventEmitter {
    config;
    currentMode = 'auto';
    isActive = false;
    initialized = false;
    constructor(userConfig = {}) {
        super();
        // Use centralized configuration with user overrides
        const centralConfig = config?.['getAll']();
        this.config = {
            defaultMode: userConfig?.defaultMode || 'auto',
            webPort: userConfig?.webPort || centralConfig?.interfaces?.web?.port,
            theme: userConfig?.theme ||
                centralConfig?.interfaces?.shared?.theme,
            enableRealTime: userConfig?.enableRealTime ??
                centralConfig?.interfaces?.shared?.realTimeUpdates,
            coreSystem: userConfig?.coreSystem,
        };
    }
    async initialize() {
        if (this.initialized)
            return;
        logger.info('Initializing interface manager');
        // Detect appropriate interface mode if auto
        if (this.config.defaultMode === 'auto') {
            this.currentMode = this.detectInterfaceMode();
        }
        else {
            this.currentMode = this.config.defaultMode;
        }
        this.initialized = true;
        this.emit('initialized');
        logger.info(`Interface manager ready (mode: ${this.currentMode})`);
    }
    async launch() {
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
    async getStats() {
        return {
            currentMode: this.currentMode,
            isActive: this.isActive,
            activeConnections: 0, // Would track real connections in web mode
        };
    }
    async shutdown() {
        logger.info('Shutting down interface manager...');
        this.isActive = false;
        this.removeAllListeners();
        logger.info('Interface manager shutdown complete');
    }
    // ==================== PRIVATE METHODS ====================
    detectInterfaceMode() {
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
    async launchCLI() {
        logger.info('CLI interface active - commands available');
        // In a real implementation, this would set up CLI command handlers
    }
    async launchTUI() {
        logger.info('TUI interface would be launched here');
        // In a real implementation, this would launch the terminal UI
    }
    async launchWeb() {
        logger.info(`Web interface would be launched on port ${this.config.webPort}`);
        // In a real implementation, this would start the web server
    }
    async ensureInitialized() {
        if (!this.initialized) {
            await this.initialize();
        }
    }
}
//# sourceMappingURL=interface-manager.js.map