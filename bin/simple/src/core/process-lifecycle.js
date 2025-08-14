import { getLogger } from '../config/logging-config.js';
const logger = getLogger('ProcessLifecycle');
export class ProcessLifecycleManager {
    handlers;
    options;
    isShuttingDown = false;
    shutdownTimeout;
    constructor(handlers = {}, options = {}) {
        this.handlers = handlers;
        this.options = {
            gracefulShutdownTimeout: options.gracefulShutdownTimeout ?? 30000,
            exitOnUncaughtException: options.exitOnUncaughtException ?? true,
            exitOnUnhandledRejection: options.exitOnUnhandledRejection ?? true,
        };
        this.setupProcessHandlers();
    }
    setupProcessHandlers() {
        process.on('SIGINT', this.handleShutdownSignal.bind(this, 'SIGINT'));
        process.on('SIGTERM', this.handleShutdownSignal.bind(this, 'SIGTERM'));
        process.on('SIGHUP', this.handleShutdownSignal.bind(this, 'SIGHUP'));
        process.on('uncaughtException', this.handleUncaughtException.bind(this));
        process.on('unhandledRejection', this.handleUnhandledRejection.bind(this));
        logger.info('✅ Process lifecycle handlers registered');
    }
    async handleShutdownSignal(signal) {
        if (this.isShuttingDown) {
            logger.warn(`Received ${signal} during shutdown, forcing exit...`);
            process.exit(1);
            return;
        }
        logger.info(`📡 Received ${signal}, initiating graceful shutdown...`);
        this.isShuttingDown = true;
        this.shutdownTimeout = setTimeout(() => {
            logger.error('⏰ Graceful shutdown timeout exceeded, forcing exit');
            process.exit(1);
        }, this.options.gracefulShutdownTimeout);
        try {
            if (this.handlers.onShutdown) {
                await this.handlers.onShutdown();
            }
            logger.info('✅ Graceful shutdown completed');
            if (this.shutdownTimeout) {
                clearTimeout(this.shutdownTimeout);
            }
            process.exit(0);
        }
        catch (error) {
            logger.error('❌ Error during graceful shutdown:', error);
            if (this.handlers.onError) {
                try {
                    await this.handlers.onError(error instanceof Error ? error : new Error(String(error)));
                }
                catch (handlerError) {
                    logger.error('❌ Error in shutdown error handler:', handlerError);
                }
            }
            process.exit(1);
        }
    }
    handleUncaughtException(error) {
        logger.error('💥 Uncaught exception:', error);
        if (this.handlers.onUncaughtException) {
            try {
                this.handlers.onUncaughtException(error);
            }
            catch (handlerError) {
                logger.error('❌ Error in uncaught exception handler:', handlerError);
            }
        }
        if (this.options.exitOnUncaughtException) {
            logger.error('🚨 Exiting due to uncaught exception');
            process.exit(1);
        }
    }
    handleUnhandledRejection(reason) {
        logger.error('🚫 Unhandled promise rejection:', reason);
        if (this.handlers.onUnhandledRejection) {
            try {
                this.handlers.onUnhandledRejection(reason);
            }
            catch (handlerError) {
                logger.error('❌ Error in unhandled rejection handler:', handlerError);
            }
        }
        if (this.options.exitOnUnhandledRejection) {
            logger.error('🚨 Exiting due to unhandled promise rejection');
            process.exit(1);
        }
    }
    async shutdown() {
        await this.handleShutdownSignal('MANUAL');
    }
    dispose() {
        process.removeAllListeners('SIGINT');
        process.removeAllListeners('SIGTERM');
        process.removeAllListeners('SIGHUP');
        process.removeAllListeners('uncaughtException');
        process.removeAllListeners('unhandledRejection');
        if (this.shutdownTimeout) {
            clearTimeout(this.shutdownTimeout);
        }
        logger.info('✅ Process lifecycle handlers removed');
    }
}
export function setupProcessLifecycle(shutdownHandler) {
    return new ProcessLifecycleManager({
        onShutdown: shutdownHandler,
        onError: async (error) => {
            logger.error('🔥 Application error during shutdown:', error);
        },
    });
}
//# sourceMappingURL=process-lifecycle.js.map