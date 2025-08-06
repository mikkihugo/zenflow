/**
 * @file Core System Initialization
 * Provides basic initialization for the system.
 */

// Core logger - essential for all operations
export { createLogger, Logger, LogLevel } from './logger';

// Essential config
export interface ClaudeZenCoreConfig {
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  port?: number;
  host?: string;
}

export const defaultCoreConfig: ClaudeZenCoreConfig = {
  logLevel: 'info',
  port: 3000,
  host: 'localhost',
};

/**
 * Initialize the core system
 *
 * @param config
 */
export async function initializeCore(config: Partial<ClaudeZenCoreConfig> = {}): Promise<void> {
  const finalConfig = { ...defaultCoreConfig, ...config };

  const { createLogger } = await import('../utils/logger');
  const logger = createLogger({ prefix: 'claude-zen-core' });
  logger.info('🚀 Claude-Zen Core System initializing...');
  if (finalConfig.port) logger.info(`   Port: ${finalConfig.port}`);
  if (finalConfig.host) logger.info(`   Host: ${finalConfig.host}`);
  logger.info(`   Log Level: ${finalConfig.logLevel}`);

  logger.info('✅ Claude-Zen Core System ready!');
}
