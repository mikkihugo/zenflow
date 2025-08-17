/**
 * @fileoverview Extracted DI Container Setup from legacy claude-zen-core.ts
 *
 * This module preserves the valuable dependency injection patterns while
 * making them reusable across the new architecture.
 */
import { EventEmitter } from 'node:events';
import { getLogger } from '../config/logging-config';
import { CORE_TOKENS, createContainerBuilder, } from '../di/index';
const logger = getLogger('DIContainer');
/**
 * Console Logger Implementation
 * Preserved from claude-zen-core.ts
 */
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
/**
 * Application Configuration Implementation
 * Preserved from claude-zen-core.ts
 */
export class AppConfig {
    config = new Map();
    constructor() {
        // Default configuration - preserved from original
        this.config.set('swarm.maxAgents', 10);
        this.config.set('swarm.heartbeatInterval', 5000);
        this.config.set('coordination.timeout', 30000);
        this.config.set('learning.adaptiveEnabled', true);
        // Load from environment
        this.loadFromEnvironment();
    }
    loadFromEnvironment() {
        // Port configuration
        if (process.env['PORT']) {
            this.config.set('server.port', Number.parseInt(process.env['PORT'], 10));
        }
        // Log level
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
/**
 * Application Event Bus Implementation
 * Preserved from claude-zen-core.ts
 */
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
/**
 * Mock Database Implementation
 * Preserved from claude-zen-core.ts
 */
export class MockDatabase {
    data = new Map();
    initialized = false;
    async initialize() {
        if (this.initialized)
            return;
        logger.info('Initializing mock database...');
        // Simulate initialization
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
/**
 * Create and configure comprehensive DI container
 * Preserves the exact setup from claude-zen-core.ts
 */
export function createClaudeZenDIContainer() {
    logger.info('Creating Claude Code Zen DI container...');
    const container = createContainerBuilder()
        // Core services - preserved from original
        .singleton(CORE_TOKENS.Logger, () => new ConsoleLogger())
        .singleton(CORE_TOKENS.Config, () => new AppConfig())
        .singleton(CORE_TOKENS.EventBus, () => new AppEventBus())
        .singleton(CORE_TOKENS.Database, () => new MockDatabase())
        // Additional tokens for future expansion
        .build();
    logger.info('✅ DI container created successfully');
    return container;
}
/**
 * Initialize core services in the DI container
 */
export async function initializeDIServices(container) {
    logger.info('🔧 Starting DI services initialization...');
    try {
        logger.info('🗃️ Resolving database from container...');
        // Initialize database
        const database = container.resolve(CORE_TOKENS.Database);
        logger.info('✅ Database resolved from container');
        if (database && typeof database.initialize === 'function') {
            logger.info('🚀 Calling database.initialize()...');
            await database.initialize();
            logger.info('✅ Database initialization completed');
        }
        else {
            logger.info('ℹ️ Database does not have initialize method or is null');
        }
        logger.info('✅ All DI services initialized successfully');
    }
    catch (error) {
        logger.error('❌ Failed to initialize DI services:', error);
        throw error;
    }
}
/**
 * Graceful shutdown of DI container
 * Preserves the cleanup pattern from claude-zen-core.ts
 */
export async function shutdownDIContainer(container) {
    logger.info('Shutting down DI container...');
    try {
        // Close database connection
        const database = container.resolve(CORE_TOKENS.Database);
        if (database && typeof database.close === 'function') {
            await database.close();
        }
        // Dispose container (cleans up all singletons)
        await container.dispose();
        logger.info('✅ DI container shutdown complete');
    }
    catch (error) {
        logger.error('❌ Error during DI container shutdown:', error);
        throw error;
    }
}
//# sourceMappingURL=di-container.js.map