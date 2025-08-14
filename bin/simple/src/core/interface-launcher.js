import { EventEmitter } from 'node:events';
import { getWebDashboardURL } from '../config/defaults.ts';
import { getLogger } from '../config/logging-config.ts';
import { InterfaceModeDetector, } from './interface-mode-detector.ts';
const logger = getLogger('InterfaceLauncher');
export class InterfaceLauncher extends EventEmitter {
    static instance;
    activeInterface;
    constructor() {
        super();
        this.setupShutdownHandlers();
    }
    static getInstance() {
        if (!InterfaceLauncher.instance) {
            InterfaceLauncher.instance = new InterfaceLauncher();
        }
        return InterfaceLauncher.instance;
    }
    async launch(options = {}) {
        const detection = InterfaceModeDetector.detect(options);
        if (!options?.['silent']) {
            logger.info(`🚀 Launching ${detection.mode.toUpperCase()} interface`);
            logger.info(`Reason: ${detection.reason}`);
        }
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
            let result;
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
                    logger.info(`✅ ${detection.mode.toUpperCase()} interface launched successfully`);
                    if (result?.url) {
                        logger.info(`🌐 Available at: ${result?.url}`);
                    }
                }
            }
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error(`❌ Failed to launch ${detection.mode} interface:`, errorMessage);
            return {
                mode: detection.mode,
                success: false,
                error: errorMessage,
            };
        }
    }
    async launchCLI(options) {
        logger.debug('Launching Unified Terminal Interface in CLI mode');
        try {
            const { spawn } = await import('node:child_process');
            const cliArgs = [];
            if (options?.['verbose'])
                cliArgs.push('--verbose');
            if (options?.['config']?.theme)
                cliArgs.push('--theme', options?.['config']?.theme);
            const cliProcess = spawn('npx', ['tsx', 'src/interfaces/terminal/main.tsx', ...cliArgs], {
                stdio: 'inherit',
                cwd: process.cwd(),
            });
            return new Promise((resolve, reject) => {
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
        }
        catch (_error) {
            logger.warn('Unified Terminal Interface launch failed, using basic CLI');
            return this.launchBasicCLI(options);
        }
    }
    async launchTUI(options) {
        logger.debug('Launching Unified Terminal Interface in TUI mode');
        try {
            const { spawn } = await import('node:child_process');
            const tuiArgs = ['--ui'];
            if (options?.['verbose'])
                tuiArgs.push('--verbose');
            if (options?.['config']?.theme)
                tuiArgs.push('--theme', options?.['config']?.theme);
            const tuiProcess = spawn('npx', ['tsx', 'src/interfaces/terminal/main.tsx', ...tuiArgs], {
                stdio: 'inherit',
                cwd: process.cwd(),
            });
            return new Promise((resolve, reject) => {
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
        }
        catch (error) {
            logger.error('Failed to launch TUI interface:', error);
            logger.info('Falling back to CLI interface');
            return this.launchCLI(options);
        }
    }
    async launchWeb(options, port) {
        const webPort = port || options?.['webPort'] || 3456;
        logger.debug(`Launching Web interface on port ${webPort}`);
        try {
            const { WebInterface } = await import('../interfaces/web/web-interface.ts');
            const webConfig = {
                port: webPort,
                theme: options?.['config']?.theme || 'dark',
                realTime: options?.['config']?.realTime !== false,
                coreSystem: options?.['config']?.coreSystem,
            };
            const web = new WebInterface(webConfig);
            await web.run();
            const server = web;
            const url = getWebDashboardURL({ port: webPort });
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
        }
        catch (error) {
            logger.error('Failed to launch Web interface:', error);
            throw error;
        }
    }
    async launchBasicCLI(options) {
        logger.info('🔧 Claude Code Zen - Basic CLI Mode');
        if (options?.['config']?.coreSystem) {
            const system = options?.['config']?.coreSystem;
            try {
                if (system &&
                    typeof system === 'object' &&
                    'getSystemStatus' in system) {
                    const getSystemStatusFn = system['getSystemStatus'];
                    if (typeof getSystemStatusFn === 'function') {
                        const status = await getSystemStatusFn();
                        if (status &&
                            typeof status === 'object' &&
                            'components' in status) {
                            for (const [_name, _info] of Object.entries(status.components)) {
                            }
                        }
                    }
                }
            }
            catch (error) {
                logger.error('Failed to show system status:', error);
            }
        }
        else {
        }
        return {
            mode: 'cli',
            success: true,
            pid: process.pid,
        };
    }
    getStatus() {
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
    async shutdown() {
        if (!this.activeInterface)
            return;
        logger.info(`Shutting down ${this.activeInterface.mode} interface...`);
        try {
            if (this.activeInterface.server) {
                await new Promise((resolve) => {
                    const server = this.activeInterface?.server;
                    if (server && typeof server === 'object' && 'close' in server) {
                        const closeFn = server['close'];
                        if (typeof closeFn === 'function') {
                            closeFn(() => {
                                resolve();
                            });
                        }
                        else {
                            resolve();
                        }
                    }
                    else {
                        resolve();
                    }
                });
            }
            if (this.activeInterface.process) {
                this.activeInterface.process.kill('SIGTERM');
            }
            this.emit('interface:shutdown', {
                mode: this.activeInterface.mode,
            });
            this.activeInterface = undefined;
            logger.info('Interface shutdown complete');
        }
        catch (error) {
            logger.error('Error during interface shutdown:', error);
            throw error;
        }
    }
    async restart(options = {}) {
        logger.info('Restarting interface...');
        await this.shutdown();
        return this.launch(options);
    }
    getRecommendations() {
        return InterfaceModeDetector.getRecommendation();
    }
    getEnvironmentInfo() {
        return InterfaceModeDetector.getEnvironmentInfo();
    }
    setupShutdownHandlers() {
        const shutdown = async (signal) => {
            logger.info(`Received ${signal}, shutting down gracefully...`);
            try {
                await this.shutdown();
                process.exit(0);
            }
            catch (error) {
                logger.error('Error during shutdown:', error);
                process.exit(1);
            }
        };
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('uncaughtException', async (error) => {
            logger.error('Uncaught exception:', error);
            try {
                await this.shutdown();
            }
            catch (shutdownError) {
                logger.error('Error during emergency shutdown:', shutdownError);
            }
            process.exit(1);
        });
        process.on('unhandledRejection', async (reason) => {
            logger.error('Unhandled rejection:', reason);
            try {
                await this.shutdown();
            }
            catch (shutdownError) {
                logger.error('Error during emergency shutdown:', shutdownError);
            }
            process.exit(1);
        });
    }
}
export const launchInterface = async (options) => {
    const launcher = InterfaceLauncher.getInstance();
    return launcher.launch(options);
};
export const getInterfaceStatus = () => {
    const launcher = InterfaceLauncher.getInstance();
    return launcher.getStatus();
};
export const shutdownInterface = async () => {
    const launcher = InterfaceLauncher.getInstance();
    return launcher.shutdown();
};
//# sourceMappingURL=interface-launcher.js.map