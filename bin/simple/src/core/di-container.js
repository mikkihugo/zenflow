import { EventEmitter } from 'node:events';
import { getLogger } from '../config/logging-config.ts';
import { CORE_TOKENS, createContainerBuilder, } from '../di/index.ts';
const logger = getLogger('DIContainer');
export class ConsoleLogger {
    logger = getLogger('ConsoleLogger');
    log(message) {
        this.logger.info(message);
    }
    debug(message, meta) {
        this.logger.debug(message, meta);
    }
    info(message, meta) {
        this.logger.info(message, meta);
    }
    warn(message, meta) {
        this.logger.warn(message, meta);
    }
    error(message, meta) {
        this.logger.error(message, meta);
    }
}
export class AppConfig {
    config = new Map();
    constructor() {
        this.config.set('swarm.maxAgents', 10);
        this.config.set('swarm.heartbeatInterval', 5000);
        this.config.set('coordination.timeout', 30000);
        this.config.set('learning.adaptiveEnabled', true);
        this.loadFromEnvironment();
    }
    loadFromEnvironment() {
        if (process.env['PORT']) {
            this.config.set('server.port', Number.parseInt(process.env['PORT'], 10));
        }
        if (process.env['LOG_LEVEL']) {
            this.config.set('logging.level', process.env['LOG_LEVEL']);
        }
    }
    get(key, defaultValue) {
        const value = this.config.get(key);
        if (value !== undefined) {
            return value;
        }
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        throw new Error(`Configuration key '${key}' not found and no default value provided`);
    }
    set(key, value) {
        this.config.set(key, value);
    }
    has(key) {
        return this.config.has(key);
    }
}
export class AppEventBus extends EventEmitter {
    emit(event, ...args) {
        logger.debug(`Event emitted: ${String(event)}`);
        return super.emit(event, ...args);
    }
    on(event, listener) {
        logger.debug(`Event listener registered: ${String(event)}`);
        return super.on(event, listener);
    }
}
export class MockDatabase {
    data = new Map();
    initialized = false;
    async initialize() {
        if (this.initialized)
            return;
        logger.info('Initializing mock database...');
        await new Promise((resolve) => setTimeout(resolve, 100));
        this.initialized = true;
        logger.info('✅ Mock database initialized');
    }
    async get(key) {
        return this.data.get(key);
    }
    async set(key, value) {
        this.data.set(key, value);
    }
    async delete(key) {
        return this.data.delete(key);
    }
    async close() {
        this.data.clear();
        this.initialized = false;
        logger.info('✅ Mock database closed');
    }
}
export function createClaudeZenDIContainer() {
    logger.info('Creating Claude Code Zen DI container...');
    const container = createContainerBuilder()
        .singleton(CORE_TOKENS.Logger, () => new ConsoleLogger())
        .singleton(CORE_TOKENS.Config, () => new AppConfig())
        .singleton(CORE_TOKENS.EventBus, () => new AppEventBus())
        .singleton(CORE_TOKENS.Database, () => new MockDatabase())
        .build();
    logger.info('✅ DI container created successfully');
    return container;
}
export async function initializeDIServices(container) {
    logger.info('Initializing DI services...');
    try {
        const database = container.resolve(CORE_TOKENS.Database);
        if (database && typeof database.initialize === 'function') {
            await database.initialize();
        }
        logger.info('✅ All DI services initialized');
    }
    catch (error) {
        logger.error('❌ Failed to initialize DI services:', error);
        throw error;
    }
}
export async function shutdownDIContainer(container) {
    logger.info('Shutting down DI container...');
    try {
        const database = container.resolve(CORE_TOKENS.Database);
        if (database && typeof database.close === 'function') {
            await database.close();
        }
        await container.dispose();
        logger.info('✅ DI container shutdown complete');
    }
    catch (error) {
        logger.error('❌ Error during DI container shutdown:', error);
        throw error;
    }
}
//# sourceMappingURL=di-container.js.map