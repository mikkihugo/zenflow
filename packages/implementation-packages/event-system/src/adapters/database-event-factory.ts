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

import { getLogger, type Logger, type Config } from '@claude-zen/foundation';
import { BaseEventManager } from '../core/base-event-manager';
import type {
  EventManagerConfig,
  EventManagerMetrics,
  EventManagerStatus,
  EventManager,
  EventManagerFactory,
  SystemEvent,
} from '../core/interfaces';
import type { DatabaseEventManager } from '../event-manager-types';
import type { DatabaseEvent } from '../types';

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
class DatabaseEventManagerImpl
  extends BaseEventManager
  implements DatabaseEventManager
{
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
      maxConnections: 0,
    },
    performanceStats: {
      averageQueryTime: 0,
      longestQueryTime: 0,
      queriesPerSecond: 0,
      lastCalculated: new Date(),
    },
  };

  private subscriptions = {
    query: new Map<string, (event: DatabaseEvent) => void>(),
    transaction: new Map<string, (event: DatabaseEvent) => void>(),
    connection: new Map<string, (event: DatabaseEvent) => void>(),
    migration: new Map<string, (event: DatabaseEvent) => void>(),
    performance: new Map<string, (event: DatabaseEvent) => void>(),
  };

  constructor(config: EventManagerConfig, logger: Logger) {
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
          database: event.details?.tableName || 'default',
          connectionId: event.details?.transactionId,
        },
      };

      // Emit through base manager
      await this.emit(enrichedEvent);

      // Route to specific database handlers
      await this.routeDatabaseEvent(enrichedEvent);

      this.logger.debug(
        `Database event emitted: ${event.operation} on ${event.details?.tableName || 'unknown'}`
      );
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

    this.logger.debug(
      `Transaction event subscription created: ${subscriptionId}`
    );
    return subscriptionId;
  }

  /**
   * Subscribe to connection events.
   */
  subscribeConnectionEvents(listener: (event: DatabaseEvent) => void): string {
    const subscriptionId = this.generateSubscriptionId();
    this.subscriptions.connection.set(subscriptionId, listener);

    this.logger.debug(
      `Connection event subscription created: ${subscriptionId}`
    );
    return subscriptionId;
  }

  /**
   * Subscribe to migration events.
   */
  subscribeMigrationEvents(listener: (event: DatabaseEvent) => void): string {
    const subscriptionId = this.generateSubscriptionId();
    this.subscriptions.migration.set(subscriptionId, listener);

    this.logger.debug(
      `Migration event subscription created: ${subscriptionId}`
    );
    return subscriptionId;
  }

  /**
   * Subscribe to performance events.
   */
  subscribePerformanceEvents(listener: (event: DatabaseEvent) => void): string {
    const subscriptionId = this.generateSubscriptionId();
    this.subscriptions.performance.set(subscriptionId, listener);

    this.logger.debug(
      `Performance event subscription created: ${subscriptionId}`
    );
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
    const errorRate =
      this.databaseMetrics.totalQueries > 0
        ? this.databaseMetrics.failedQueries / this.databaseMetrics.totalQueries
        : 0;

    const rollbackRate =
      this.databaseMetrics.totalTransactions > 0
        ? this.databaseMetrics.rollbackCount /
          this.databaseMetrics.totalTransactions
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
        rollbackRate,
      },
      performance: {
        slowQueries: this.databaseMetrics.slowQueries,
        queriesPerSecond:
          this.databaseMetrics.performanceStats.queriesPerSecond,
        longestQueryTime:
          this.databaseMetrics.performanceStats.longestQueryTime,
      },
      connectionPool: {
        active: this.databaseMetrics.connectionPoolStats.activeConnections,
        idle: this.databaseMetrics.connectionPoolStats.idleConnections,
        waiting: this.databaseMetrics.connectionPoolStats.waitingRequests,
        max: this.databaseMetrics.connectionPoolStats.maxConnections,
      },
    };
  }

  /**
   * Get comprehensive event manager metrics.
   */
  override async getMetrics(): Promise<EventManagerMetrics> {
    const baseMetrics = await super.getMetrics();
    const databaseMetrics = await this.getDatabaseMetrics();

    return {
      ...baseMetrics,
      // Note: customMetrics not part of EventManagerMetrics interface
      // database metrics available via getDatabaseMetrics() method
    };
  }

  /**
   * Health check with database-specific validation.
   */
  override async healthCheck(): Promise<EventManagerStatus> {
    const baseStatus = await super.healthCheck();
    const databaseMetrics = await this.getDatabaseMetrics();

    // Database-specific health checks
    const highErrorRate = databaseMetrics.errorRate > 0.1; // 10% error threshold
    const slowQueries = databaseMetrics.performance.slowQueries > 50; // 50 slow queries
    const poolExhausted = databaseMetrics.connectionPool.waiting > 20; // 20 waiting connections
    const highRollbackRate =
      databaseMetrics.transactionStats.rollbackRate > 0.2; // 20% rollback rate

    const isHealthy =
      baseStatus.status === 'healthy' &&
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
          rollbackRate: databaseMetrics.transactionStats.rollbackRate,
        },
      },
    };
  }

  /**
   * Private helper methods.
   */

  private initializeDatabaseHandlers(): void {
    this.logger.debug('Initializing database event handlers');

    // Set up event type routing
    this.subscribe(
      [
        'database:query',
        'database:transaction',
        'database:connection',
        'database:migration',
        'database:backup',
      ],
      (event: SystemEvent) => this.handleDatabaseEvent(event as DatabaseEvent)
    );
  }

  private async handleDatabaseEvent(event: DatabaseEvent): Promise<void> {
    const startTime = Date.now();

    try {
      // Route based on operation type
      const operationType = event.type.split(':')[1];

      switch (operationType) {
        case 'query':
          await this.notifyDatabaseSubscribers(this.subscriptions.query, event);
          break;
        case 'transaction':
          await this.notifyDatabaseSubscribers(this.subscriptions.transaction, event);
          break;
        case 'connection':
          await this.notifyDatabaseSubscribers(this.subscriptions.connection, event);
          break;
        case 'migration':
          await this.notifyDatabaseSubscribers(this.subscriptions.migration, event);
          break;
        case 'performance':
          await this.notifyDatabaseSubscribers(this.subscriptions.performance, event);
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
      case 'select':
      case 'insert':
      case 'update':
      case 'delete':
        if (event.details?.queryTime && event.details.queryTime > 1000) {
          // 1 second threshold
          this.databaseMetrics.slowQueries++;
          this.logger.warn(
            `Slow query detected: ${event.details.queryTime}ms - table: ${event.details?.tableName}`
          );
        }
        break;
      // Note: These operations don't exist in the DatabaseEvent operation union
      // They would need to be handled through the details property or as metadata
      default:
        // Handle custom operations through details
        if (event.details?.transactionId) {
          this.logger.debug(`Transaction operation: ${event.operation} - ${event.details.transactionId}`);
        }
        if (event.details?.errorCode) {
          this.logger.error(`Database error: ${event.details.errorCode} - table: ${event.details?.tableName}`);
        }
        break;
    }

    // Update performance tracking
    if (event.details?.queryTime) {
      if (
        event.details.queryTime >
        this.databaseMetrics.performanceStats.longestQueryTime
      ) {
        this.databaseMetrics.performanceStats.longestQueryTime =
          event.details.queryTime;
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
        // All transaction operations count as transactions
        this.databaseMetrics.totalTransactions++;
        break;
      case 'migration':
      case 'backup':
        // Connection-like operations tracked as connections
        this.databaseMetrics.totalConnections++;
        break;
    }

    // Update connection pool stats through metadata if provided
    if (event.metadata && typeof event.metadata === 'object') {
      const connectionPool = (event.metadata as any).connectionPool;
      if (connectionPool) {
        this.databaseMetrics.connectionPoolStats = {
          ...this.databaseMetrics.connectionPoolStats,
          ...connectionPool,
        };
      }
    }
  }

  private updatePerformanceStats(): void {
    const now = new Date();
    const timeDiff =
      (now.getTime() -
        this.databaseMetrics.performanceStats.lastCalculated.getTime()) /
      1000; // seconds

    if (timeDiff > 60) {
      // Update every minute
      this.databaseMetrics.performanceStats.queriesPerSecond =
        this.databaseMetrics.totalQueries / timeDiff;

      this.databaseMetrics.performanceStats.averageQueryTime =
        this.databaseMetrics.totalQueries > 0
          ? this.databaseMetrics.totalQueryTime /
            this.databaseMetrics.totalQueries
          : 0;

      this.databaseMetrics.performanceStats.lastCalculated = now;
    }
  }

  private async notifyDatabaseSubscribers(
    subscribers: Map<string, (event: DatabaseEvent) => void>,
    event: DatabaseEvent
  ): Promise<void> {
    const notifications = Array.from(subscribers.values()).map(
      async (listener) => {
        try {
          await listener(event);
        } catch (error) {
          this.logger.error('Database event listener failed:', error);
        }
      }
    );

    await Promise.allSettled(notifications);
  }

  protected override generateSubscriptionId(): string {
    return `database-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Process transaction operations.
   * Required by DatabaseEventManager interface.
   */
  async processTransaction(transactionId: string): Promise<void> {
    this.logger.debug(`Processing transaction: ${transactionId}`);
    
    try {
      // Emit transaction processing event
      await this.emitDatabaseEvent({
        id: `transaction-process-${transactionId}`,
        timestamp: new Date(),
        source: 'database-transaction-processor',
        type: 'database:transaction',
        operation: 'select',
        payload: { transactionId },
        metadata: {
          transactionId,
          processingStart: new Date(),
        },
      });
      
      this.logger.info(`Transaction processed successfully: ${transactionId}`);
    } catch (error) {
      this.logger.error(`Failed to process transaction ${transactionId}:`, error);
      throw error;
    }
  }

  /**
   * Handle schema change operations.
   * Required by DatabaseEventManager interface.
   */
  async handleSchemaChange(changeId: string): Promise<void> {
    this.logger.debug(`Handling schema change: ${changeId}`);
    
    try {
      // Emit schema change event
      await this.emitDatabaseEvent({
        id: `schema-change-${changeId}`,
        timestamp: new Date(),
        source: 'database-schema-manager',
        type: 'database:migration',
        operation: 'create',
        payload: { changeId },
        metadata: {
          changeId,
          changeStart: new Date(),
        },
      });
      
      this.logger.info(`Schema change handled successfully: ${changeId}`);
    } catch (error) {
      this.logger.error(`Failed to handle schema change ${changeId}:`, error);
      throw error;
    }
  }

  /**
   * Optimize query operations.
   * Required by DatabaseEventManager interface.
   */
  async optimizeQuery(queryId: string): Promise<void> {
    this.logger.debug(`Optimizing query: ${queryId}`);
    
    try {
      // Emit query optimization event
      await this.emitDatabaseEvent({
        id: `query-optimize-${queryId}`,
        timestamp: new Date(),
        source: 'database-query-optimizer',
        type: 'database:query',
        operation: 'index',
        payload: { queryId },
        metadata: {
          queryId,
          optimizationStart: new Date(),
        },
      });
      
      this.logger.info(`Query optimized successfully: ${queryId}`);
    } catch (error) {
      this.logger.error(`Failed to optimize query ${queryId}:`, error);
      throw error;
    }
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
export class DatabaseEventManagerFactory
  implements EventManagerFactory<EventManagerConfig>
{
  private managers = new Map<string, EventManager>();

  constructor(
    private logger: Logger,
    private config: Config
  ) {
    this.logger.debug('DatabaseEventManagerFactory initialized');
  }

  /**
   * Create a new DatabaseEventManager instance.
   *
   * @param config - Configuration for the database event manager
   * @returns Promise resolving to configured manager instance
   */
  async create(config: EventManagerConfig): Promise<EventManager> {
    this.logger.info(`Creating database event manager: ${config.name}`);

    // Validate database-specific configuration
    this.validateConfig(config);

    // Apply database-optimized defaults
    const optimizedConfig = this.applyDatabaseDefaults(config);

    // Create and configure manager
    const manager = new DatabaseEventManagerImpl(optimizedConfig, this.logger);

    // Initialize with database-specific settings
    await this.configureDatabaseManager(manager, optimizedConfig);

    // Register the manager in our registry
    this.managers.set(config.name, manager as unknown as EventManager);

    this.logger.info(
      `Database event manager created successfully: ${config.name}`
    );
    return manager as unknown as EventManager;
  }

  /**
   * Create multiple event managers in batch.
   */
  async createMultiple(configs: EventManagerConfig[]): Promise<EventManager[]> {
    this.logger.info(`Creating ${configs.length} database event managers`);
    
    const results = await Promise.allSettled(
      configs.map(config => this.create(config))
    );
    
    const managers: EventManager[] = [];
    const errors: Error[] = [];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        managers.push(result.value);
      } else {
        errors.push(new Error(`Failed to create manager ${configs[index]?.name}: ${result.reason}`));
      }
    });
    
    if (errors.length > 0) {
      this.logger.error(`${errors.length} managers failed to create:`, errors);
      throw new Error(`Failed to create ${errors.length} out of ${configs.length} managers`);
    }
    
    return managers;
  }

  /**
   * Get an event manager by name.
   */
  get(name: string): EventManager | undefined {
    return this.managers.get(name);
  }

  /**
   * List all event managers managed by this factory.
   */
  list(): EventManager[] {
    return Array.from(this.managers.values());
  }

  /**
   * Check if an event manager exists.
   */
  has(name: string): boolean {
    return this.managers.has(name);
  }

  /**
   * Remove and destroy an event manager.
   */
  async remove(name: string): Promise<boolean> {
    const manager = this.managers.get(name);
    if (!manager) {
      return false;
    }
    
    try {
      await manager.destroy();
      this.managers.delete(name);
      this.logger.info(`Database event manager removed: ${name}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to remove database event manager ${name}:`, error);
      throw error;
    }
  }

  /**
   * Perform health check on all managed event managers.
   */
  async healthCheckAll(): Promise<Map<string, EventManagerStatus>> {
    const results = new Map<string, EventManagerStatus>();
    
    const healthChecks = Array.from(this.managers.entries()).map(async ([name, manager]) => {
      try {
        const status = await manager.healthCheck();
        results.set(name, status);
      } catch (error) {
        this.logger.error(`Health check failed for manager ${name}:`, error);
        results.set(name, {
          name,
          type: 'database',
          status: 'unhealthy',
          lastCheck: new Date(),
          subscriptions: 0,
          queueSize: 0,
          errorRate: 1,
          uptime: 0,
          metadata: { error: String(error) }
        });
      }
    });
    
    await Promise.allSettled(healthChecks);
    return results;
  }

  /**
   * Get metrics for all managed event managers.
   */
  async getMetricsAll(): Promise<Map<string, EventManagerMetrics>> {
    const results = new Map<string, EventManagerMetrics>();
    
    const metricRequests = Array.from(this.managers.entries()).map(async ([name, manager]) => {
      try {
        const metrics = await manager.getMetrics();
        results.set(name, metrics);
      } catch (error) {
        this.logger.error(`Failed to get metrics for manager ${name}:`, error);
      }
    });
    
    await Promise.allSettled(metricRequests);
    return results;
  }

  /**
   * Start all managed event managers.
   */
  async startAll(): Promise<void> {
    const startRequests = Array.from(this.managers.entries()).map(async ([name, manager]) => {
      try {
        await manager.start();
        this.logger.debug(`Started database event manager: ${name}`);
      } catch (error) {
        this.logger.error(`Failed to start manager ${name}:`, error);
        throw error;
      }
    });
    
    const results = await Promise.allSettled(startRequests);
    const failures = results.filter(result => result.status === 'rejected');
    
    if (failures.length > 0) {
      throw new Error(`Failed to start ${failures.length} out of ${results.length} managers`);
    }
  }

  /**
   * Stop all managed event managers.
   */
  async stopAll(): Promise<void> {
    const stopRequests = Array.from(this.managers.entries()).map(async ([name, manager]) => {
      try {
        await manager.stop();
        this.logger.debug(`Stopped database event manager: ${name}`);
      } catch (error) {
        this.logger.error(`Failed to stop manager ${name}:`, error);
        throw error;
      }
    });
    
    const results = await Promise.allSettled(stopRequests);
    const failures = results.filter(result => result.status === 'rejected');
    
    if (failures.length > 0) {
      throw new Error(`Failed to stop ${failures.length} out of ${results.length} managers`);
    }
  }

  /**
   * Shutdown the factory and all managed event managers.
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down database event manager factory');
    
    try {
      await this.stopAll();
      
      // Destroy all managers
      const destroyRequests = Array.from(this.managers.entries()).map(async ([name, manager]) => {
        try {
          await manager.destroy();
        } catch (error) {
          this.logger.error(`Failed to destroy manager ${name}:`, error);
        }
      });
      
      await Promise.allSettled(destroyRequests);
      this.managers.clear();
      
      this.logger.info('Database event manager factory shutdown complete');
    } catch (error) {
      this.logger.error('Error during factory shutdown:', error);
      throw error;
    }
  }

  /**
   * Get count of active event managers.
   */
  getActiveCount(): number {
    return this.managers.size;
  }

  /**
   * Get factory performance metrics.
   */
  getFactoryMetrics(): {
    totalManagers: number;
    runningManagers: number;
    errorCount: number;
    uptime: number;
  } {
    const runningManagers = Array.from(this.managers.values())
      .filter(manager => manager.isRunning()).length;
    
    return {
      totalManagers: this.managers.size,
      runningManagers,
      errorCount: 0, // TODO: Track factory-level errors
      uptime: Date.now() - this.factoryStartTime,
    };
  }

  private factoryStartTime = Date.now();

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
      this.logger.warn(
        'Database batch size < 10 may be inefficient for database operations'
      );
    }

    if (config.maxListeners && config.maxListeners < 100) {
      this.logger.warn(
        'Database managers should support at least 100 listeners for concurrent operations'
      );
    }
  }

  /**
   * Apply database-optimized default configuration.
   */
  private applyDatabaseDefaults(
    config: EventManagerConfig
  ): EventManagerConfig {
    return {
      ...config,
      maxListeners: config.maxListeners || 300,
      processing: {
        batchSize: 100, // Efficient batch processing for DB operations
        queueSize: 5000,
        ...config.processing,
        strategy: config.processing?.strategy || 'queued', // Database operations benefit from queuing
      },
      retry: {
        attempts: 3,
        delay: 1000,
        backoff: 'exponential',
        maxDelay: 10000,
      },
      monitoring: {
        enabled: true,
        metricsInterval: 30000, // 30 second metrics collection
        trackLatency: true,
        trackThroughput: true,
        trackErrors: true,
        enableProfiling: false,
        ...config.monitoring,
      },
    };
  }

  /**
   * Configure database-specific manager settings.
   */
  private async configureDatabaseManager(
    manager: DatabaseEventManagerImpl,
    config: EventManagerConfig
  ): Promise<void> {
    // Start monitoring if enabled
    if (config.monitoring?.enabled) {
      await manager.start();
      this.logger.debug(
        `Database event manager monitoring started: ${config.name}`
      );
    }

    // Set up health checking with database-specific intervals  
    const healthCheckInterval = 120000; // 2 minutes default
    setInterval(async () => {
      try {
        const status = await manager.healthCheck();
        if (status.status !== 'healthy') {
          this.logger.warn(
            `Database manager health degraded: ${config.name}`,
            status.metadata
          );
        }
      } catch (error) {
        this.logger.error(
          `Database manager health check failed: ${config.name}`,
          error
        );
      }
    }, healthCheckInterval);
  }
}

export default DatabaseEventManagerFactory;
