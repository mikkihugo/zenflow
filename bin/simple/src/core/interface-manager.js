import { EventEmitter } from 'node:events';
import { config } from '../../config';
import { getLogger } from '../config/logging-config.ts';
const logger = getLogger('InterfaceManager');
export class InterfaceManager extends EventEmitter {
    config;
    currentMode = 'auto';
    isActive = false;
    initialized = false;
    constructor(userConfig = {}) {
        super();
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
                await this.launchCLI();
        }
        this.isActive = true;
        this.emit('launched', { mode: this.currentMode });
        logger.info(`${this.currentMode} interface launched`);
    }
    async getStats() {
        return {
            currentMode: this.currentMode,
            isActive: this.isActive,
            activeConnections: 0,
        };
    }
    async shutdown() {
        logger.info('Shutting down interface manager...');
        this.isActive = false;
        this.removeAllListeners();
        logger.info('Interface manager shutdown complete');
    }
    detectInterfaceMode() {
        const centralConfig = config?.['getAll']();
        const environment = centralConfig?.environment;
        if (environment.isCI || !process.stdout.isTTY) {
            return 'cli';
        }
        const termConfig = centralConfig?.interfaces?.terminal;
        if (termConfig?.enableColors && termConfig?.enableProgressBars) {
            return 'tui';
        }
        return 'cli';
    }
    async launchCLI() {
        logger.info('CLI interface active - commands available');
    }
    async launchTUI() {
        logger.info('TUI interface would be launched here');
    }
    async launchWeb() {
        logger.info(`Web interface would be launched on port ${this.config.webPort}`);
    }
    async ensureInitialized() {
        if (!this.initialized) {
            await this.initialize();
        }
    }
}
//# sourceMappingURL=interface-manager.js.map