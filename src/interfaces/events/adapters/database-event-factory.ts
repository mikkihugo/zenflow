/**
 * @fileoverview Database Event Manager Factory Implementation
 * 
 * Factory for creating database event managers that handle database operations,
 * transactions, connections, and data lifecycle events. Provides specialized
 * event management for database operations and performance monitoring.
 * 
 * ## Features
 * 
 * - **Query Events**: SQL queries, stored procedures, bulk operations
 * - **Transaction Events**: Begin, commit, rollback, savepoint operations
 * - **Connection Events**: Pool management, connection lifecycle, failover
 * - **Performance Monitoring**: Query performance, connection metrics, optimization
 * - **Data Events**: CRUD operations, migrations, schema changes
 * 
 * ## Event Types Handled
 * 
 * - `database:query` - Query execution and optimization events
 * - `database:transaction` - Transaction lifecycle and management events
 * - `database:connection` - Connection pool and management events  
 * - `database:migration` - Schema migration and versioning events
 * - `database:performance` - Performance metrics and monitoring events
 * 
 * @example
 * ```typescript
 * const factory = new DatabaseEventManagerFactory(logger, config);
 * const manager = await factory.create({
 *   name: 'main-database',
 *   type: 'database', 
 *   maxListeners: 300,
 *   processing: { 
 *     strategy: 'queued',
 *     batchSize: 100
 *   }
 * });
 * 
 * // Subscribe to query events
 * manager.subscribeQueryEvents((event) => {
 *   console.log(`Query executed: ${event.data.sql} (${event.data.duration}ms)`);
 * });
 * 
 * // Emit database event
 * await manager.emitDatabaseEvent({
 *   id: 'query-001',
 *   timestamp: new Date(),
 *   source: 'query-engine',
 *   type: 'database:query',
 *   operation: 'SELECT',
 *   database: 'main',
 *   table: 'users',
 *   data: { 
 *     sql: 'SELECT * FROM users WHERE active = ?',
 *     parameters: [true],
 *     duration: 45,
 *     rows: 150
 *   }
 * });
 * ```
 * 
 * @author Claude Code Zen Team  
 * @version 1.0.0-alpha.43
 * @since 1.0.0
 */

import type { IConfig, ILogger } from '../../../core/interfaces/base-interfaces.ts';
import type { 
  EventManagerConfig, 
  EventManagerStatus,
  EventManagerMetrics,
  IEventManagerFactory,
  IEventManager
} from '../core/interfaces.ts';
import { BaseEventManager } from '../core/base-event-manager.ts';
import type { DatabaseEvent } from '../types.ts';
import type { IDatabaseEventManager } from '../factories.ts';

/**
 * Database Event Manager implementation for database operations.
 * 
 * Specialized event manager for handling database-related events including
 * queries, transactions, connections, and performance monitoring. Optimized
 * for high-throughput database workloads with comprehensive metrics tracking.
 * 
 * ## Operation Types
 * 
 * - **Query Operations**: SELECT, INSERT, UPDATE, DELETE, stored procedures
 * - **Transaction Operations**: BEGIN, COMMIT, ROLLBACK, SAVEPOINT
 * - **Connection Operations**: Connect, disconnect, pool management, failover
 * - **Schema Operations**: Migrations, DDL operations, index management
 * 
 * ## Performance Features
 * 
 * - **Query Performance Tracking**: Execution time, row counts, optimization
 * - **Connection Pool Monitoring**: Active connections, wait times, timeouts
 * - **Transaction Analysis**: Duration, rollback rates, deadlock detection
 * - **Performance Alerting**: Slow queries, connection issues, resource limits
 */
class DatabaseEventManager extends BaseEventManager implements IDatabaseEventManager {
  private databaseMetrics = {
    totalQueries: 0,
    totalConnections: 0,
    activeConnections: 0,
    totalTransactions: 0,
    failedQueries: 0,
    rollbackCount: 0,
    totalQueryTime: 0,
    slowQueries: 0,
    connectionPoolStats: {
      activeConnections: 0,
      idleConnections: 0,
      waitingRequests: 0,
      maxConnections: 0
    },
    performanceStats: {
      averageQueryTime: 0,
      longestQueryTime: 0,
      queriesPerSecond: 0,
      lastCalculated: new Date()
    }
  };

  private subscriptions = {
    query: new Map<string, (event: DatabaseEvent) => void>(),
    transaction: new Map<string, (event: DatabaseEvent) => void>(),
    connection: new Map<string, (event: DatabaseEvent) => void>(),
    migration: new Map<string, (event: DatabaseEvent) => void>(),
    performance: new Map<string, (event: DatabaseEvent) => void>()
  };

  constructor(config: EventManagerConfig, logger: ILogger) {
    super(config, logger);
    this.initializeDatabaseHandlers();
  }

  /**
   * Emit database-specific event with database context.
   */
  async emitDatabaseEvent(event: DatabaseEvent): Promise<void> {
    try {
      // Update database metrics
      this.updateDatabaseMetrics(event);
      
      // Add database-specific metadata
      const enrichedEvent = {
        ...event,
        metadata: {
          ...event.metadata,
          timestamp: new Date(),
          processingTime: Date.now(),
          database: event.database || 'default',
          connectionId: event.data?.connectionId
        }
      };

      // Emit through base manager
      await this.emit(enrichedEvent);

      // Route to specific database handlers
      await this.routeDatabaseEvent(enrichedEvent);

      this.logger.debug(`Database event emitted: ${event.operation} on ${event.database}/${event.table}`);
    } catch (error) {
      this.databaseMetrics.failedQueries++;
      this.logger.error('Failed to emit database event:', error);
      throw error;
    }
  }

  /**
   * Subscribe to query events.
   */
  subscribeQueryEvents(listener: (event: DatabaseEvent) => void): string {
    const subscriptionId = this.generateSubscriptionId();
    this.subscriptions.query.set(subscriptionId, listener);
    
    this.logger.debug(`Query event subscription created: ${subscriptionId}`);
    return subscriptionId;
  }

  /**
   * Subscribe to transaction events.
   */
  subscribeTransactionEvents(listener: (event: DatabaseEvent) => void): string {
    const subscriptionId = this.generateSubscriptionId();
    this.subscriptions.transaction.set(subscriptionId, listener);
    
    this.logger.debug(`Transaction event subscription created: ${subscriptionId}`);
    return subscriptionId;
  }

  /**
   * Subscribe to connection events.
   */
  subscribeConnectionEvents(listener: (event: DatabaseEvent) => void): string {
    const subscriptionId = this.generateSubscriptionId();
    this.subscriptions.connection.set(subscriptionId, listener);
    
    this.logger.debug(`Connection event subscription created: ${subscriptionId}`);
    return subscriptionId;
  }

  /**
   * Subscribe to migration events.
   */
  subscribeMigrationEvents(listener: (event: DatabaseEvent) => void): string {
    const subscriptionId = this.generateSubscriptionId();
    this.subscriptions.migration.set(subscriptionId, listener);
    
    this.logger.debug(`Migration event subscription created: ${subscriptionId}`);
    return subscriptionId;
  }

  /**
   * Subscribe to performance events.
   */
  subscribePerformanceEvents(listener: (event: DatabaseEvent) => void): string {
    const subscriptionId = this.generateSubscriptionId();
    this.subscriptions.performance.set(subscriptionId, listener);
    
    this.logger.debug(`Performance event subscription created: ${subscriptionId}`);
    return subscriptionId;
  }

  /**
   * Get database-specific metrics and performance data.
   */
  async getDatabaseMetrics(): Promise<{
    activeConnections: number;
    queryCount: number;
    averageQueryTime: number;
    errorRate: number;
    transactionStats: {
      total: number;
      rollbackRate: number;
    };
    performance: {
      slowQueries: number;
      queriesPerSecond: number;
      longestQueryTime: number;
    };
    connectionPool: {
      active: number;
      idle: number;
      waiting: number;
      max: number;
    };
  }> {
    const errorRate = this.databaseMetrics.totalQueries > 0 
      ? this.databaseMetrics.failedQueries / this.databaseMetrics.totalQueries 
      : 0;

    const rollbackRate = this.databaseMetrics.totalTransactions > 0
      ? this.databaseMetrics.rollbackCount / this.databaseMetrics.totalTransactions
      : 0;

    // Update queries per second calculation
    this.updatePerformanceStats();

    return {
      activeConnections: this.databaseMetrics.activeConnections,
      queryCount: this.databaseMetrics.totalQueries,
      averageQueryTime: this.databaseMetrics.performanceStats.averageQueryTime,
      errorRate,
      transactionStats: {
        total: this.databaseMetrics.totalTransactions,
        rollbackRate
      },
      performance: {
        slowQueries: this.databaseMetrics.slowQueries,
        queriesPerSecond: this.databaseMetrics.performanceStats.queriesPerSecond,
        longestQueryTime: this.databaseMetrics.performanceStats.longestQueryTime
      },
      connectionPool: {
        active: this.databaseMetrics.connectionPoolStats.activeConnections,
        idle: this.databaseMetrics.connectionPoolStats.idleConnections,
        waiting: this.databaseMetrics.connectionPoolStats.waitingRequests,
        max: this.databaseMetrics.connectionPoolStats.maxConnections
      }
    };
  }

  /**
   * Get comprehensive event manager metrics.
   */
  async getMetrics(): Promise<EventManagerMetrics> {
    const baseMetrics = await super.getMetrics();
    const databaseMetrics = await this.getDatabaseMetrics();

    return {
      ...baseMetrics,
      customMetrics: {
        database: databaseMetrics
      }
    };
  }

  /**
   * Health check with database-specific validation.
   */
  async healthCheck(): Promise<EventManagerStatus> {
    const baseStatus = await super.healthCheck();
    const databaseMetrics = await this.getDatabaseMetrics();

    // Database-specific health checks
    const highErrorRate = databaseMetrics.errorRate > 0.1; // 10% error threshold
    const slowQueries = databaseMetrics.performance.slowQueries > 50; // 50 slow queries
    const poolExhausted = databaseMetrics.connectionPool.waiting > 20; // 20 waiting connections
    const highRollbackRate = databaseMetrics.transactionStats.rollbackRate > 0.2; // 20% rollback rate

    const isHealthy = baseStatus.status === 'healthy' && 
                     !highErrorRate && 
                     !slowQueries && 
                     !poolExhausted &&
                     !highRollbackRate;

    return {
      ...baseStatus,
      status: isHealthy ? 'healthy' : 'degraded',
      metadata: {
        ...baseStatus.metadata,
        database: {
          errorRate: databaseMetrics.errorRate,
          averageQueryTime: databaseMetrics.averageQueryTime,
          activeConnections: databaseMetrics.activeConnections,
          slowQueries: databaseMetrics.performance.slowQueries,
          rollbackRate: databaseMetrics.transactionStats.rollbackRate
        }
      }
    };
  }

  /**
   * Private helper methods.
   */

  private initializeDatabaseHandlers(): void {
    this.logger.debug('Initializing database event handlers');
    
    // Set up event type routing
    this.subscribe(['database:query', 'database:transaction', 'database:connection', 
                   'database:migration', 'database:performance'], 
                  this.handleDatabaseEvent.bind(this));
  }

  private async handleDatabaseEvent(event: DatabaseEvent): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Route based on operation type
      const operationType = event.type.split(':')[1];
      
      switch (operationType) {
        case 'query':
          await this.notifySubscribers(this.subscriptions.query, event);
          break;
        case 'transaction':
          await this.notifySubscribers(this.subscriptions.transaction, event);
          break;
        case 'connection':
          await this.notifySubscribers(this.subscriptions.connection, event);
          break;
        case 'migration':
          await this.notifySubscribers(this.subscriptions.migration, event);
          break;
        case 'performance':
          await this.notifySubscribers(this.subscriptions.performance, event);
          break;
        default:
          this.logger.warn(`Unknown database operation type: ${operationType}`);
      }

      // Track processing time
      const processingTime = Date.now() - startTime;
      this.databaseMetrics.totalQueryTime += processingTime;

    } catch (error) {
      this.databaseMetrics.failedQueries++;
      this.logger.error('Database event handling failed:', error);
      throw error;
    }
  }

  private async routeDatabaseEvent(event: DatabaseEvent): Promise<void> {
    // Handle special database operations
    switch (event.operation) {
      case 'SELECT':
      case 'INSERT':
      case 'UPDATE':
      case 'DELETE':
        if (event.data?.duration && event.data.duration > 1000) { // 1 second threshold
          this.databaseMetrics.slowQueries++;
          this.logger.warn(`Slow query detected: ${event.data.duration}ms - ${event.data?.sql}`);
        }
        break;
      case 'BEGIN':
        this.logger.debug(`Transaction started: ${event.data?.transactionId}`);
        break;
      case 'COMMIT':
        this.logger.debug(`Transaction committed: ${event.data?.transactionId}`);
        break;
      case 'ROLLBACK':
        this.databaseMetrics.rollbackCount++;
        this.logger.debug(`Transaction rolled back: ${event.data?.transactionId}`);
        break;
      case 'CONNECT':
        this.databaseMetrics.activeConnections++;
        this.logger.debug(`Database connection established: ${event.data?.connectionId}`);
        break;
      case 'DISCONNECT':
        this.databaseMetrics.activeConnections = Math.max(0, this.databaseMetrics.activeConnections - 1);
        this.logger.debug(`Database connection closed: ${event.data?.connectionId}`);
        break;
      case 'MIGRATION':
        this.logger.info(`Database migration: ${event.data?.version} - ${event.data?.description}`);
        break;
      case 'ERROR':
        this.logger.error(`Database error: ${event.data?.error} - Query: ${event.data?.sql}`);
        break;
    }

    // Update performance tracking
    if (event.data?.duration) {
      if (event.data.duration > this.databaseMetrics.performanceStats.longestQueryTime) {
        this.databaseMetrics.performanceStats.longestQueryTime = event.data.duration;
      }
    }
  }

  private updateDatabaseMetrics(event: DatabaseEvent): void {
    const operationType = event.type.split(':')[1];
    
    switch (operationType) {
      case 'query':
        this.databaseMetrics.totalQueries++;
        break;
      case 'transaction':
        if (['BEGIN', 'COMMIT', 'ROLLBACK'].includes(event.operation)) {
          this.databaseMetrics.totalTransactions++;
        }
        break;
      case 'connection':
        if (event.operation === 'CONNECT') {
          this.databaseMetrics.totalConnections++;
        }
        break;
    }

    // Update connection pool stats if provided
    if (event.data?.connectionPool) {
      this.databaseMetrics.connectionPoolStats = {
        ...this.databaseMetrics.connectionPoolStats,
        ...event.data.connectionPool
      };
    }
  }

  private updatePerformanceStats(): void {
    const now = new Date();
    const timeDiff = (now.getTime() - this.databaseMetrics.performanceStats.lastCalculated.getTime()) / 1000; // seconds

    if (timeDiff > 60) { // Update every minute
      this.databaseMetrics.performanceStats.queriesPerSecond = 
        this.databaseMetrics.totalQueries / timeDiff;

      this.databaseMetrics.performanceStats.averageQueryTime = 
        this.databaseMetrics.totalQueries > 0 
          ? this.databaseMetrics.totalQueryTime / this.databaseMetrics.totalQueries 
          : 0;

      this.databaseMetrics.performanceStats.lastCalculated = now;
    }
  }

  private async notifySubscribers(
    subscribers: Map<string, (event: DatabaseEvent) => void>, 
    event: DatabaseEvent
  ): Promise<void> {
    const notifications = Array.from(subscribers.values()).map(async (listener) => {
      try {
        await listener(event);
      } catch (error) {
        this.logger.error('Database event listener failed:', error);
      }
    });

    await Promise.allSettled(notifications);
  }

  private generateSubscriptionId(): string {
    return `database-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}

/**
 * Factory for creating DatabaseEventManager instances.
 * 
 * Provides configuration management and instance creation for database
 * event managers with optimized settings for database operations and
 * high-throughput data processing workloads.
 * 
 * ## Configuration Options
 * 
 * - **Query Processing**: Efficient handling of database operations
 * - **Connection Monitoring**: Pool management and connection tracking
 * - **Performance Analytics**: Query performance and optimization insights
 * - **Transaction Support**: Comprehensive transaction lifecycle management
 * 
 * @example
 * ```typescript
 * const factory = new DatabaseEventManagerFactory(logger, config);
 * 
 * const mainDbManager = await factory.create({
 *   name: 'main-database',
 *   type: 'database',
 *   maxListeners: 500,
 *   processing: { 
 *     strategy: 'queued',
 *     batchSize: 200
 *   }
 * });
 * 
 * const analyticsDbManager = await factory.create({
 *   name: 'analytics-database', 
 *   type: 'database',
 *   processing: {
 *     strategy: 'batched',
 *     batchSize: 1000,
 *     timeout: 10000
 *   }
 * });
 * ```
 */
export class DatabaseEventManagerFactory implements IEventManagerFactory<EventManagerConfig> {
  constructor(
    private logger: ILogger,
    private config: IConfig
  ) {
    this.logger.debug('DatabaseEventManagerFactory initialized');
  }

  /**
   * Create a new DatabaseEventManager instance.
   * 
   * @param config - Configuration for the database event manager
   * @returns Promise resolving to configured manager instance
   */
  async create(config: EventManagerConfig): Promise<IEventManager> {
    this.logger.info(`Creating database event manager: ${config.name}`);

    // Validate database-specific configuration
    this.validateConfig(config);

    // Apply database-optimized defaults
    const optimizedConfig = this.applyDatabaseDefaults(config);

    // Create and configure manager
    const manager = new DatabaseEventManager(optimizedConfig, this.logger);
    
    // Initialize with database-specific settings
    await this.configureDatabaseManager(manager, optimizedConfig);

    this.logger.info(`Database event manager created successfully: ${config.name}`);
    return manager;
  }

  /**
   * Validate database event manager configuration.
   */
  private validateConfig(config: EventManagerConfig): void {
    if (!config.name) {
      throw new Error('Database event manager name is required');
    }

    if (config.type !== 'database') {
      throw new Error('Manager type must be "database"');
    }

    // Validate database-specific settings
    if (config.processing?.batchSize && config.processing.batchSize < 10) {
      this.logger.warn('Database batch size < 10 may be inefficient for database operations');
    }

    if (config.maxListeners && config.maxListeners < 100) {
      this.logger.warn('Database managers should support at least 100 listeners for concurrent operations');
    }
  }

  /**
   * Apply database-optimized default configuration.
   */
  private applyDatabaseDefaults(config: EventManagerConfig): EventManagerConfig {
    return {
      ...config,
      maxListeners: config.maxListeners || 300,
      processing: {
        strategy: 'queued', // Database operations benefit from queuing
        timeout: 10000, // 10 second timeout for database operations
        retries: 3,
        batchSize: 100, // Efficient batch processing for DB operations
        ...config.processing
      },
      persistence: {
        enabled: true, // Important to track database metrics
        maxAge: 604800000, // 7 days
        ...config.persistence
      },
      monitoring: {
        enabled: true,
        metricsInterval: 30000, // 30 second metrics collection
        healthCheckInterval: 120000, // 2 minute health checks
        ...config.monitoring
      }
    };
  }

  /**
   * Configure database-specific manager settings.
   */
  private async configureDatabaseManager(
    manager: DatabaseEventManager, 
    config: EventManagerConfig
  ): Promise<void> {
    // Start monitoring if enabled
    if (config.monitoring?.enabled) {
      await manager.start();
      this.logger.debug(`Database event manager monitoring started: ${config.name}`);
    }

    // Set up health checking with database-specific intervals
    if (config.monitoring?.healthCheckInterval) {
      setInterval(async () => {
        try {
          const status = await manager.healthCheck();
          if (status.status !== 'healthy') {
            this.logger.warn(`Database manager health degraded: ${config.name}`, status.metadata);
          }
        } catch (error) {
          this.logger.error(`Database manager health check failed: ${config.name}`, error);
        }
      }, config.monitoring.healthCheckInterval);
    }
  }
}

export default DatabaseEventManagerFactory;