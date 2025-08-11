/**
 * @fileoverview Extracted DI Container Setup from legacy claude-zen-core.ts
 *
 * This module preserves the valuable dependency injection patterns while
 * making them reusable across the new architecture.
 */

import { EventEmitter } from 'node:events';
import { getLogger } from '../config/logging-config.ts';
import {
  CORE_TOKENS,
  createContainerBuilder,
  createToken,
  type DIContainer,
  type IConfig,
  type IDatabase,
  type IEventBus,
  type ILogger,
  SWARM_TOKENS,
} from '../di/index.ts';

const logger = getLogger('DIContainer');

/**
 * Console Logger Implementation
 * Preserved from claude-zen-core.ts
 */
export class ConsoleLogger implements ILogger {
  private logger = getLogger('ConsoleLogger');

  log(message: string): void {
    this.logger.info(message);
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }
}

/**
 * Application Configuration Implementation
 * Preserved from claude-zen-core.ts
 */
export class AppConfig implements IConfig {
  private config = new Map<string, any>();

  constructor() {
    // Default configuration - preserved from original
    this.config.set('swarm.maxAgents', 10);
    this.config.set('swarm.heartbeatInterval', 5000);
    this.config.set('coordination.timeout', 30000);
    this.config.set('learning.adaptiveEnabled', true);

    // Load from environment
    this.loadFromEnvironment();
  }

  private loadFromEnvironment(): void {
    // Port configuration
    if (process.env['PORT']) {
      this.config.set('server.port', Number.parseInt(process.env['PORT'], 10));
    }

    // Log level
    if (process.env['LOG_LEVEL']) {
      this.config.set('logging.level', process.env['LOG_LEVEL']);
    }
  }

  get<T>(key: string, defaultValue?: T): T {
    const value = this.config.get(key);
    if (value !== undefined) {
      return value as T;
    }
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(
      `Configuration key '${key}' not found and no default value provided`,
    );
  }

  set<T>(key: string, value: T): void {
    this.config.set(key, value);
  }

  has(key: string): boolean {
    return this.config.has(key);
  }
}

/**
 * Application Event Bus Implementation
 * Preserved from claude-zen-core.ts
 */
export class AppEventBus extends EventEmitter implements IEventBus {
  emit(event: string | symbol, ...args: any[]): boolean {
    logger.debug(`Event emitted: ${String(event)}`);
    return super.emit(event, ...args);
  }

  on(event: string | symbol, listener: (...args: any[]) => void): this {
    logger.debug(`Event listener registered: ${String(event)}`);
    return super.on(event, listener);
  }
}

/**
 * Mock Database Implementation
 * Preserved from claude-zen-core.ts
 */
export class MockDatabase implements IDatabase {
  private data = new Map<string, any>();
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    logger.info('Initializing mock database...');
    // Simulate initialization
    await new Promise((resolve) => setTimeout(resolve, 100));
    this.initialized = true;
    logger.info('✅ Mock database initialized');
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.data.get(key) as T | undefined;
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.data.set(key, value);
  }

  async delete(key: string): Promise<boolean> {
    return this.data.delete(key);
  }

  async close(): Promise<void> {
    this.data.clear();
    this.initialized = false;
    logger.info('✅ Mock database closed');
  }
}

/**
 * Create and configure comprehensive DI container
 * Preserves the exact setup from claude-zen-core.ts
 */
export function createClaudeZenDIContainer(): DIContainer {
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
export async function initializeDIServices(
  container: DIContainer,
): Promise<void> {
  logger.info('Initializing DI services...');

  try {
    // Initialize database
    const database = container.resolve(CORE_TOKENS.Database);
    if (database && typeof database.initialize === 'function') {
      await database.initialize();
    }

    logger.info('✅ All DI services initialized');
  } catch (error) {
    logger.error('❌ Failed to initialize DI services:', error);
    throw error;
  }
}

/**
 * Graceful shutdown of DI container
 * Preserves the cleanup pattern from claude-zen-core.ts
 */
export async function shutdownDIContainer(
  container: DIContainer,
): Promise<void> {
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
  } catch (error) {
    logger.error('❌ Error during DI container shutdown:', error);
    throw error;
  }
}
