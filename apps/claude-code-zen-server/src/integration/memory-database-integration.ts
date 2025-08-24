import {
  getLogger,
  Result,
  ok,
  err,
  UUID,
  generateUUID,
} from '@claude-zen/foundation';
import { getDatabaseSystem } from '@claude-zen/infrastructure';
import { getBrainSystem, getMemorySystem } from '@claude-zen/intelligence';
import { getPerformanceTracker } from '@claude-zen/operations';

const logger = getLogger('memory-database-integration');

export interface IntegratedMemorySystem {
  storeWithCoordination(
    sessionId: string,
    key: string,
    data: any
  ): Promise<Result<void, Error>>;
  retrieveWithOptimization(
    sessionId: string,
    key: string
  ): Promise<Result<any, Error>>;
  getSystemHealth(): Promise<Result<SystemHealthMetrics, Error>>;
  initializeSystem(): Promise<Result<void, Error>>;
  shutdownSystem(): Promise<Result<void, Error>>;
}

export interface SystemHealthMetrics {
  databaseConnections: number;
  memoryUsage: number;
  activeCoordinations: number;
  performanceScore: number;
  lastHealthCheck: Date;
}

export interface CoordinationMetadata {
  sessionId: string;
  timestamp: Date;
  operationType: 'store' | 'retrieve' | 'update' | 'delete';
  dataType: string;
  coordinationId: UUID;
}

class IntegratedMemorySystemImpl implements IntegratedMemorySystem {
  private databaseSystem: any;
  private brainSystem: any;
  private memorySystem: any;
  private performanceTracker: any;
  private initialized = false;

  async initializeSystem(): Promise<Result<void, Error>> {
    try {
      if (this.initialized) {
        return ok();
      }

      logger.info('Initializing integrated memory system...');

      this.databaseSystem = await getDatabaseSystem();
      this.brainSystem = await getBrainSystem();
      this.memorySystem = await getMemorySystem();
      this.performanceTracker = await getPerformanceTracker();

      await this.databaseSystem.initialize();
      await this.memorySystem.initialize();
      await this.performanceTracker.initialize();

      this.initialized = true;
      logger.info('Integrated memory system initialized successfully');

      return ok();
    } catch (error) {
      logger.error('Failed to initialize integrated memory system:', error);
      return err(error as Error);
    }
  }

  async storeWithCoordination(
    sessionId: string,
    key: string,
    data: any
  ): Promise<Result<void, Error>> {
    try {
      if (!this.initialized) {
        const initResult = await this.initializeSystem();
        if (initResult.isErr()) {
          return initResult;
        }
      }

      const coordinationId = generateUUID();
      const metadata: CoordinationMetadata = {
        sessionId,
        timestamp: new Date(),
        operationType: 'store',
        dataType: typeof data,
        coordinationId,
      };

      logger.debug(`Storing data with coordination: ${sessionId}/${key}`);

      // Start performance tracking
      const trackingId =
        await this.performanceTracker.startOperation('memory-store');

      // Coordinate with brain system for optimal storage strategy
      const coordinator = this.brainSystem.createCoordinator();
      const storageStrategy = await coordinator.optimizeStorageStrategy({
        dataSize: JSON.stringify(data).length,
        dataType: typeof data,
        sessionId,
        key,
      });

      // Store in database with coordination metadata
      await this.databaseSystem.store(sessionId, key, {
        data,
        metadata,
        strategy: storageStrategy,
      });

      // Update memory system
      await this.memorySystem.updateCache(sessionId, key, data);

      // End performance tracking
      await this.performanceTracker.endOperation(trackingId);

      logger.debug(
        `Successfully stored data with coordination: ${sessionId}/${key}`
      );
      return ok();
    } catch (error) {
      logger.error('Failed to store data with coordination:', error);
      return err(error as Error);
    }
  }

  async retrieveWithOptimization(
    sessionId: string,
    key: string
  ): Promise<Result<any, Error>> {
    try {
      if (!this.initialized) {
        const initResult = await this.initializeSystem();
        if (initResult.isErr()) {
          return err(initResult.error);
        }
      }

      const coordinationId = generateUUID();
      logger.debug(`Retrieving data with optimization: ${sessionId}/${key}`);

      // Start performance tracking
      const trackingId =
        await this.performanceTracker.startOperation('memory-retrieve');

      // Coordinate with brain system for optimal retrieval strategy
      const coordinator = this.brainSystem.createCoordinator();
      const retrievalStrategy = await coordinator.optimizeRetrievalStrategy({
        sessionId,
        key,
      });

      let result: any;

      // Try memory system first if strategy suggests it
      if (retrievalStrategy.useCache) {
        const cacheResult = await this.memorySystem.getFromCache(
          sessionId,
          key
        );
        if (cacheResult) {
          result = cacheResult;
          logger.debug(`Retrieved from cache: ${sessionId}/${key}`);
        }
      }

      // Fall back to database if not in cache
      if (!result) {
        const dbResult = await this.databaseSystem.retrieve(sessionId, key);
        if (dbResult) {
          result = dbResult.data;
          // Update cache for future retrievals
          await this.memorySystem.updateCache(sessionId, key, result);
          logger.debug(`Retrieved from database: ${sessionId}/${key}`);
        }
      }

      // End performance tracking
      await this.performanceTracker.endOperation(trackingId);

      return result
        ? ok(result)
        : err(new Error(`Data not found: ${sessionId}/${key}`));
    } catch (error) {
      logger.error('Failed to retrieve data with optimization:', error);
      return err(error as Error);
    }
  }

  async getSystemHealth(): Promise<Result<SystemHealthMetrics, Error>> {
    try {
      if (!this.initialized) {
        return err(new Error('System not initialized'));
      }

      logger.debug('Getting system health metrics...');

      const databaseHealth = await this.databaseSystem.getHealthMetrics();
      const memoryHealth = await this.memorySystem.getHealthMetrics();
      const performanceHealth =
        await this.performanceTracker.getHealthMetrics();

      const metrics: SystemHealthMetrics = {
        databaseConnections: databaseHealth.activeConnections || 0,
        memoryUsage: memoryHealth.memoryUsage || 0,
        activeCoordinations: performanceHealth.activeOperations || 0,
        performanceScore: performanceHealth.averageResponseTime || 0,
        lastHealthCheck: new Date(),
      };

      logger.debug('System health metrics retrieved successfully');
      return ok(metrics);
    } catch (error) {
      logger.error('Failed to get system health metrics:', error);
      return err(error as Error);
    }
  }

  async shutdownSystem(): Promise<Result<void, Error>> {
    try {
      if (!this.initialized) {
        return ok();
      }

      logger.info('Shutting down integrated memory system...');

      await this.databaseSystem?.shutdown();
      await this.memorySystem?.shutdown();
      await this.performanceTracker?.shutdown();

      this.initialized = false;
      logger.info('Integrated memory system shut down successfully');

      return ok();
    } catch (error) {
      logger.error('Failed to shutdown integrated memory system:', error);
      return err(error as Error);
    }
  }
}

export async function createIntegratedSystem(): Promise<IntegratedMemorySystem> {
  const system = new IntegratedMemorySystemImpl();
  const initResult = await system.initializeSystem();

  if (initResult.isErr()) {
    throw initResult.error;
  }

  return system;
}

// Example usage:
// const system = await createIntegratedSystem();
// await system.storeWithCoordination(
//   'session-123',
//   'user-profile',
//   userData
// );
// const profile = await system.retrieveWithOptimization('session-123', 'user-profile');
// const health = await system.getSystemHealth();
