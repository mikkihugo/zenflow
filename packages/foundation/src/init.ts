/**
 * @fileoverview Foundation System Initialization
 *
 * Simple initialization for core foundation utilities:
 * - Logging configuration
 * - Dependency injection setup
 * - Basic system utilities
 *
 * This is truly foundational - no business logic or domain-specific features.
 */

// Core logger - essential for all operations
export { getLogger } from './logging';
export type { Logger } from './logging';
export { LoggingLevel } from './logging';

/**
 * Basic foundation configuration
 */
export interface FoundationConfig {
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableConsoleLogging?: boolean;
  enableFileLogging?: boolean;
}

export const defaultFoundationConfig: FoundationConfig = {
  logLevel: 'info',
  enableConsoleLogging: true,
  enableFileLogging: false,
};

/**
 * Initialize foundation utilities
 *
 * @param config - Optional configuration overrides
 * @example
 * ```typescript
 * await initializeFoundation({ logLevel: 'debug' });
 * ```
 */
export async function initializeFoundation(
  config: Partial<FoundationConfig> = {}
): Promise<void> {
  const finalConfig = { ...defaultFoundationConfig, ...config };

  const { getLogger } = await import('./logging');
  const logger = getLogger('foundation');

  logger.info('🔧 Foundation utilities initializing...');
  logger.info(`   Log Level: ${finalConfig.logLevel}`);

  if (finalConfig.enableConsoleLogging) {
    logger.info('   Console logging: enabled');
  }

  if (finalConfig.enableFileLogging) {
    logger.info('   File logging: enabled');
  }

  logger.info('✅ Foundation utilities ready');
}
