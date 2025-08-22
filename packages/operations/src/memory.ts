/**
 * @fileoverview Memory System Interface Delegation
 *
 * Provides interface delegation to @claude-zen/memory package following
 * the same architectural pattern as database and monitoring delegation.
 *
 * Runtime imports prevent circular dependencies while providing unified access
 * to memory orchestration, persistence, and coordination systems through operations package.
 *
 * Delegates to:
 * - @claude-zen/memory: Memory orchestration, persistence management, memory coordination
 *
 * @author Claude Code Zen Team
 * @since 2.1.0 (Strategic Architecture v2.0.0)
 * @version 1.0.0
 */

import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('operations-memory');

/**
 * Custom error types for memory operations
 */
export class MemorySystemError extends Error {
  public override cause?: Error|undefined;

  constructor(message: string, cause?: Error|undefined) {
    super(message);
    this.name ='MemorySystemError';
    this.cause = cause;
  }
}

export class MemorySystemConnectionError extends MemorySystemError {
  constructor(message: string, cause?: Error|undefined) {
    super(message, cause);
    this.name ='MemorySystemConnectionError';
  }
}

/**
 * Memory module interface for accessing real memory backends.
 * @internal
 */
interface MemorySystemModule {
  MemoryOrchestrator: any;
  MemoryCoordinator: any;
  PersistenceManager: any;
  MemoryController: any;
  MemorySystemCore: any;
  createMemoryOrchestrator: (...args: any[]) => any;
  createMemoryCoordinator: (...args: any[]) => any;
  createPersistenceManager: (...args: any[]) => any;
}

/**
 * Memory access interface
 */
interface MemorySystemAccess {
  /**
   * Create a new memory orchestrator
   */
  createMemoryOrchestrator(config?: any): Promise<any>;

  /**
   * Create a new memory coordinator
   */
  createMemoryCoordinator(config?: any): Promise<any>;

  /**
   * Create a new persistence manager
   */
  createPersistenceManager(config?: any): Promise<any>;

  /**
   * Create a new memory controller
   */
  createMemoryController(config?: any): Promise<any>;

  /**
   * Create a memory system core
   */
  createMemorySystemCore(config?: any): Promise<any>;
}

/**
 * Memory configuration interface
 */
interface MemorySystemConfig {
  enableMemoryOrchestration?: boolean;
  enablePersistence?: boolean;
  enableMemoryCoordination?: boolean;
  enableMemoryControl?: boolean;
  memoryRetention?: number;
  persistenceInterval?: number;
  coordinationTimeout?: number;
  maxMemorySize?: number;
  compressionEnabled?: boolean;
}

/**
 * Implementation of memory access via runtime delegation
 */
class MemorySystemAccessImpl implements MemorySystemAccess {
  private memoryModule: MemorySystemModule|null = null;

  private async getMemoryModule(): Promise<MemorySystemModule> {
    if (!this.memoryModule) {
      try {
        // Import the memory package at runtime (matches database pattern)
        // Use dynamic import with string to avoid TypeScript compile-time checking
        const packageName ='@claude-zen/memory';
        this.memoryModule = (await import(packageName)) as MemorySystemModule;
        logger.debug('Memory module loaded successfully');
      } catch (error) {
        throw new MemorySystemConnectionError(
          'Memory package not available. Operations requires @claude-zen/memory for memory operations.',
          error instanceof Error ? error : undefined
        );
      }
    }
    return this.memoryModule;
  }

  async createMemoryOrchestrator(config?: any): Promise<any> {
    const module = await this.getMemoryModule();
    logger.debug('Creating memory orchestrator via operations delegation', {
      config,
    });
    return module.createMemoryOrchestrator
      ? module.createMemoryOrchestrator(config)
      : new module.MemoryOrchestrator(config);
  }

  async createMemoryCoordinator(config?: any): Promise<any> {
    const module = await this.getMemoryModule();
    logger.debug('Creating memory coordinator via operations delegation', {
      config,
    });
    return module.createMemoryCoordinator
      ? module.createMemoryCoordinator(config)
      : new module.MemoryCoordinator(config);
  }

  async createPersistenceManager(config?: any): Promise<any> {
    const module = await this.getMemoryModule();
    logger.debug('Creating persistence manager via operations delegation', {
      config,
    });
    return module.createPersistenceManager
      ? module.createPersistenceManager(config)
      : new module.PersistenceManager(config);
  }

  async createMemoryController(config?: any): Promise<any> {
    const module = await this.getMemoryModule();
    logger.debug('Creating memory controller via operations delegation', {
      config,
    });
    return new module.MemoryController(config);
  }

  async createMemorySystemCore(config?: any): Promise<any> {
    const module = await this.getMemoryModule();
    logger.debug('Creating memory system core via operations delegation', {
      config,
    });
    return new module.MemorySystemCore(config);
  }
}

// Global singleton instance
let globalMemorySystemAccess: MemorySystemAccess|null = null;

/**
 * Get memory access interface (singleton pattern)
 */
export function getMemorySystemAccess(): MemorySystemAccess {
  if (!globalMemorySystemAccess) {
    globalMemorySystemAccess = new MemorySystemAccessImpl();
    logger.info('Initialized global memory access');
  }
  return globalMemorySystemAccess;
}

/**
 * Create a memory orchestrator through operations delegation
 * @param config - Memory orchestrator configuration
 */
export async function getMemoryOrchestrator(
  config?: MemorySystemConfig
): Promise<any> {
  const memorySystem = getMemorySystemAccess();
  return await Promise.resolve(memorySystem.createMemoryOrchestrator(config));
}

/**
 * Create a memory coordinator through operations delegation
 * @param config - Memory coordinator configuration
 */
export async function getMemoryCoordinator(
  config?: MemorySystemConfig
): Promise<any> {
  const memorySystem = getMemorySystemAccess();
  return await Promise.resolve(memorySystem.createMemoryCoordinator(config));
}

/**
 * Create a persistence manager through operations delegation
 * @param config - Persistence manager configuration
 */
export async function getPersistenceManager(
  config?: MemorySystemConfig
): Promise<any> {
  const memorySystem = getMemorySystemAccess();
  return await Promise.resolve(memorySystem.createPersistenceManager(config));
}

/**
 * Create a memory controller through operations delegation
 * @param config - Memory controller configuration
 */
export async function getMemoryController(
  config?: MemorySystemConfig
): Promise<any> {
  const memorySystem = getMemorySystemAccess();
  return await Promise.resolve(memorySystem.createMemoryController(config));
}

/**
 * Create a memory system core through operations delegation
 * @param config - Memory system core configuration
 */
export async function getMemorySystemCore(
  config?: MemorySystemConfig
): Promise<any> {
  const memorySystem = getMemorySystemAccess();
  return await Promise.resolve(memorySystem.createMemorySystemCore(config));
}

// Professional memory object with proper naming (matches Storage/Telemetry patterns)
export const memorySystem = {
  getAccess: getMemorySystemAccess,
  getOrchestrator: getMemoryOrchestrator,
  getCoordinator: getMemoryCoordinator,
  getPersistenceManager: getPersistenceManager,
  getController: getMemoryController,
  getSystemCore: getMemorySystemCore,
};

// Type exports for external consumers
export type { MemorySystemAccess, MemorySystemConfig };
