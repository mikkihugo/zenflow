/**
 * @fileoverview Modern DI Container Setup Using Foundation Package Directly
 *
 * Uses foundation's DI system directly without wrapper layers for better performance
 * and cleaner architecture. Foundation package provides all needed infrastructure.
 */

import { getLogger } from '../config/logging-config';
import {
  DIContainer,
  TOKENS as CORE_TOKENS,
  TokenFactory,
  createContainer,
  getDatabaseAccess,
  type DatabaseAccess,
} from '@claude-zen/foundation';

const logger = getLogger('DIContainer');

// Domain-specific tokens for claude-code-zen
export const APP_TOKENS = {
  SwarmCoordinator: TokenFactory.create<any>('SwarmCoordinator'),
  AgentManager: TokenFactory.create<any>('AgentManager'), 
  TaskOrchestrator: TokenFactory.create<any>('TaskOrchestrator'),
  QueenCoordinator: TokenFactory.create<any>('QueenCoordinator'),
  CubeMatron: TokenFactory.create<any>('CubeMatron'),
};

/**
 * Create and configure DI container using foundation package directly
 */
export function createClaudeZenDIContainer(): DIContainer {
  logger.info('Creating Claude Code Zen DI container using foundation...');

  // Use foundation's createContainer directly - no wrapper layers
  const container = createContainer('claude-zen-server');

  // Register core services from foundation (foundation provides these automatically)
  // Only register domain-specific services for claude-code-zen

  // Database access via foundation
  container.registerFactory(
    CORE_TOKENS.Database,
    () => getDatabaseAccess(),
    { lifecycle: 'Singleton' }
  );

  logger.info('✅ DI container created successfully with foundation');
  return container;
}

/**
 * Initialize core services using foundation's built-in patterns
 */
export async function initializeDIServices(
  container: DIContainer
): Promise<void> {
  logger.info('🔧 Starting DI services initialization with foundation...');

  try {
    // Foundation's DatabaseAccess handles initialization automatically
    const database = container.resolve(CORE_TOKENS.Database) as DatabaseAccess;
    logger.info('✅ Database access resolved from foundation');
    
    // Test database connectivity
    const isHealthy = await database.healthCheck();
    if (isHealthy) {
      logger.info('✅ Database health check passed');
    } else {
      logger.warn('⚠️ Database health check failed but continuing');
    }

    logger.info('✅ All DI services initialized successfully');
  } catch (error) {
    logger.error('❌ Failed to initialize DI services:', error);
    throw error;
  }
}

/**
 * Graceful shutdown using foundation's disposal patterns
 */
export async function shutdownDIContainer(
  container: DIContainer
): Promise<void> {
  logger.info('Shutting down DI container using foundation...');

  try {
    // Foundation handles database cleanup through dispose()
    await container.dispose();
    logger.info('✅ DI container shutdown complete via foundation');
  } catch (error) {
    logger.error('❌ Error during DI container shutdown:', error);
    throw error;
  }
}
