/**
 * Unified Database Manager - TypeScript Edition
 * Provides a unified interface for managing multiple database types
 * (SQLite, LanceDB, Kuzu, PostgreSQL) with connection pooling,
 * transaction management, and health monitoring
 */

import {
  DatabaseManager,
  DatabaseConfig,
  DatabaseConnection,
  DatabaseOperations,
  VectorOperations,
  GraphOperations,
  Query,
  QueryResult,
  QueryOptions,
  Transaction,
  TransactionIsolation,
  OperationResult,
  DatabaseHealthReport,
  DatabaseMetrics,
  JSONObject,
  UUID
} from '../types/database';
import { JSONValue } from '../types/core';
import LanceDBInterface from './lancedb-interface';
import KuzuAdvancedInterface from './kuzu-advanced-interface';
import SQLiteConnectionPool from '../memory/sqlite-connection-pool';
import TransactionManager from './transaction-manager';
import ConnectionPoolManager from './connection-pool-manager';
import DatabaseMonitor from './database-monitor';
import { EventEmitter } from 'events';

interface DatabaseInstance {
  id: string;
  type: 'sqlite' | 'lancedb' | 'kuzu' | 'postgresql';
  config: DatabaseConfig;
  connection: DatabaseOperations | VectorOperations | GraphOperations;
  pool?: SQLiteConnectionPool;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  metrics: {
    queryCount: number;
    errorCount: number;
    lastUsed: Date;
    avgResponseTime: number;
  };
  healthCheck: {
    lastCheck: Date;
    isHealthy: boolean;
    issues: string[];
  };
}

interface ManagerOptions {
  enableMetrics?: boolean;
  enableHealthChecks?: boolean;
  healthCheckInterval?: number;
  maxRetries?: number;
  connectionTimeout?: number;
  queryTimeout?: number;
}

export class UnifiedDatabaseManager extends EventEmitter implements DatabaseManager {
  private databases: Map<string, DatabaseInstance> = new Map();
  private options: Required<ManagerOptions>;
  private healthCheckTimer?: NodeJS.Timeout;
  private isShuttingDown: boolean = false;
  private startTime: Date = new Date();
  private transactionManager: TransactionManager;
  private connectionPoolManager: ConnectionPoolManager;
  private databaseMonitor: DatabaseMonitor;

  constructor(options: ManagerOptions = {}) {
    super();
    
    this.options = {
      enableMetrics: options.enableMetrics !== false,
      enableHealthChecks: options.enableHealthChecks !== false,
      healthCheckInterval: options.healthCheckInterval || 60000, // 1 minute
      maxRetries: options.maxRetries || 3,
      connectionTimeout: options.connectionTimeout || 10000, // 10 seconds
      queryTimeout: options.queryTimeout || 30000 // 30 seconds
    };

    // Initialize advanced management systems
    this.transactionManager = new TransactionManager(this, {
      defaultTimeout: this.options.queryTimeout,
      maxTransactionDuration: this.options.queryTimeout * 10,
      enableDeadlockDetection: true
    });

    this.connectionPoolManager = new ConnectionPoolManager({
      loadBalancing: { type: 'least_connections' },
      enableFailover: true,
      healthCheckInterval: 30000,
      adaptiveResizing: true
    });

    // Initialize database monitor
    this.databaseMonitor = new DatabaseMonitor(this, {
      checkInterval: 30000,
      metricsRetention: 86400000, // 24 hours
      enableAlerts: true,
      enableTrends: true,
      enablePredictiveAnalysis: true,
      alertThresholds: {
        errorRate: 5.0,
        responseTime: 1000,
        connectionUsage: 80,
        memoryUsage: 85
      }
    });

    if (this.options.enableHealthChecks) {
      this.startHealthChecks();
      this.databaseMonitor.start();
    }

    // Handle graceful shutdown
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
  }

  /**
   * Add a database to the manager
   */
  async addDatabase(config: DatabaseConfig): Promise<string> {
    const id = `${config.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`📁 Adding ${config.type} database: ${config.name}`);
    
    try {
      const instance: DatabaseInstance = {
        id,
        type: config.type as any,
        config,
        connection: null as any,
        status: 'connecting',
        metrics: {
          queryCount: 0,
          errorCount: 0,
          lastUsed: new Date(),
          avgResponseTime: 0
        },
        healthCheck: {
          lastCheck: new Date(),
          isHealthy: false,
          issues: []
        }
      };

      // Initialize connection based on database type
      switch (config.type) {
        case 'sqlite':
          instance.pool = new SQLiteConnectionPool(
            config.filePath || `${config.name}.db`,
            {
              minConnections: config.pool.min,
              maxConnections: config.pool.max,
              acquireTimeout: config.pool.acquireTimeout,
              idleTimeout: config.pool.idleTimeout,
              enableHealthChecks: this.options.enableHealthChecks
            }
          );
          await instance.pool.initialize();
          instance.connection = new SQLiteOperations(instance.pool);
          break;

        case 'lancedb':
          const lanceDB = new LanceDBInterface({
            dbPath: config.filePath || './vector-db',
            dbName: config.name,
            vectorDim: 1536,
            similarity: 'cosine',
            batchSize: config.performance.batchSize,
            cacheSize: config.performance.cacheSize
          });
          await lanceDB.initialize();
          instance.connection = lanceDB;
          break;

        case 'kuzu':
          const kuzuDB = new KuzuAdvancedInterface({
            dbPath: config.filePath || './graph-db',
            dbName: config.name,
            enableAnalytics: true,
            enableCache: true,
            enableMetrics: this.options.enableMetrics
          });
          await kuzuDB.initializeAdvanced();
          instance.connection = kuzuDB;
          break;

        case 'postgresql':
          throw new Error('PostgreSQL not yet implemented');

        default:
          throw new Error(`Unsupported database type: ${config.type}`);
      }

      instance.status = 'connected';
      instance.healthCheck.isHealthy = true;
      
      this.databases.set(id, instance);
      
      console.log(`✅ Database ${config.name} (${config.type}) connected: ${id}`);
      this.emit('database:connected', { id, config });
      
      return id;
      
    } catch (error: any) {
      console.error(`❌ Failed to add database ${config.name}: ${error.message}`);
      this.emit('database:error', { id, error: error.message });
      throw error;
    }
  }

  /**
   * Remove a database from the manager
   */
  async removeDatabase(id: string): Promise<boolean> {
    const instance = this.databases.get(id);
    if (!instance) {
      return false;
    }

    console.log(`🗑️ Removing database: ${instance.config.name}`);
    
    try {
      // Close connections
      if (instance.pool) {
        await instance.pool.shutdown();
      }
      
      if ('close' in instance.connection && typeof instance.connection.close === 'function') {
        await instance.connection.close();
      }
      
      this.databases.delete(id);
      this.emit('database:removed', { id, config: instance.config });
      
      console.log(`✅ Database removed: ${instance.config.name}`);
      return true;
      
    } catch (error: any) {
      console.error(`❌ Failed to remove database ${instance.config.name}: ${error.message}`);
      this.emit('database:error', { id, error: error.message });
      return false;
    }
  }

  /**
   * Get a database connection
   */
  async getDatabase(id: string): Promise<DatabaseOperations | VectorOperations | GraphOperations | null> {
    const instance = this.databases.get(id);
    if (!instance || instance.status !== 'connected') {
      return null;
    }

    instance.metrics.lastUsed = new Date();
    return instance.connection;
  }

  /**
   * Get all database connections
   */
  async getAllDatabases(): Promise<DatabaseConnection[]> {
    const connections: DatabaseConnection[] = [];
    
    for (const [id, instance] of this.databases) {
      connections.push({
        id,
        type: instance.type,
        status: instance.status,
        config: instance.config,
        connectedAt: new Date(), // Would track actual connection time
        lastActivity: instance.metrics.lastUsed,
        queryCount: instance.metrics.queryCount,
        errorCount: instance.metrics.errorCount,
        averageResponseTime: instance.metrics.avgResponseTime
      });
    }
    
    return connections;
  }

  /**
   * Execute a query on a specific database
   */
  async executeQuery(
    databaseId: string, 
    query: Query, 
    options: QueryOptions = {}
  ): Promise<QueryResult> {
    const startTime = Date.now();
    const instance = this.databases.get(databaseId);
    
    if (!instance) {
      throw new Error(`Database not found: ${databaseId}`);
    }
    
    if (instance.status !== 'connected') {
      throw new Error(`Database not connected: ${databaseId}`);
    }

    try {
      let result: QueryResult;
      
      // Route query based on database type and query type
      if (query.type === 'vector' && 'similaritySearch' in instance.connection) {
        if (!query.vectorQuery) {
          throw new Error('Vector query parameters required');
        }
        
        const vectorResults = await instance.connection.similaritySearch(query.vectorQuery);
        result = {
          success: true,
          data: vectorResults,
          count: vectorResults.length,
          executionTime: Date.now() - startTime,
          cache: { hit: false },
          metadata: { queryType: 'vector' }
        };
        
      } else if (query.type === 'graph' && 'executeGraphQuery' in instance.connection) {
        if (!query.graphQuery) {
          throw new Error('Graph query parameters required');
        }
        
        const graphResult = await instance.connection.executeGraphQuery(query.graphQuery);
        result = graphResult;
        
      } else if (instance.pool && query.sql) {
        // SQL query via connection pool
        const sqlResult = await instance.pool.execute(
          query.sql,
          query.parameters,
          {
            timeout: options.timeout || this.options.queryTimeout,
            priority: 'medium'
          }
        );
        
        result = {
          success: true,
          data: Array.isArray(sqlResult) ? sqlResult : [sqlResult],
          count: Array.isArray(sqlResult) ? sqlResult.length : 1,
          executionTime: Date.now() - startTime,
          cache: { hit: false },
          metadata: { queryType: 'sql' }
        };
        
      } else {
        throw new Error(`Unsupported query type ${query.type} for database ${instance.type}`);
      }
      
      // Update metrics
      if (this.options.enableMetrics) {
        this.updateInstanceMetrics(instance, Date.now() - startTime, true);
      }
      
      return result;
      
    } catch (error: any) {
      // Update error metrics
      if (this.options.enableMetrics) {
        this.updateInstanceMetrics(instance, Date.now() - startTime, false);
      }
      
      this.emit('query:error', { databaseId, query, error: error.message });
      throw error;
    }
  }

  /**
   * Execute multiple queries in batch
   */
  async executeBatch(
    databaseId: string, 
    queries: Query[], 
    options: QueryOptions = {}
  ): Promise<OperationResult[]> {
    const results: OperationResult[] = [];
    
    for (const query of queries) {
      try {
        const result = await this.executeQuery(databaseId, query, options);
        results.push({
          success: result.success,
          message: `Query executed successfully`,
          data: result.data
        });
      } catch (error: any) {
        results.push({
          success: false,
          message: `Query failed: ${error.message}`,
          error
        });
        
        // Stop on first error if not specified otherwise
        if (!options.cache) { // Using cache as continue on error flag
          break;
        }
      }
    }
    
    return results;
  }

  /**
   * Execute queries in a transaction
   */
  async executeTransaction(
    databaseId: string, 
    queries: Query[], 
    isolation: TransactionIsolation = 'read_committed'
  ): Promise<OperationResult[]> {
    const instance = this.databases.get(databaseId);
    
    if (!instance) {
      throw new Error(`Database not found: ${databaseId}`);
    }
    
    if (!instance.pool) {
      throw new Error(`Transactions not supported for database type: ${instance.type}`);
    }

    try {
      // Convert queries to batch format for transaction
      const batchQueries = queries.map(query => ({
        query: query.sql || '',
        params: query.parameters || []
      }));
      
      const results = await instance.pool.executeTransaction(batchQueries);
      
      return results.map((result, index) => ({
        success: true,
        message: `Transaction query ${index + 1} executed successfully`,
        data: result
      }));
      
    } catch (error: any) {
      this.emit('transaction:error', { databaseId, queries, error: error.message });
      throw error;
    }
  }

  /**
   * Check health of all databases
   */
  async checkHealth(): Promise<DatabaseHealthReport> {
    const report: DatabaseHealthReport = {
      overall: 'healthy',
      databases: {},
      systemHealth: {
        resourceUsage: {
          memoryUsage: process.memoryUsage(),
          uptime: Date.now() - this.startTime.getTime()
        },
        performance: {
          totalDatabases: this.databases.size,
          connectedDatabases: Array.from(this.databases.values())
            .filter(db => db.status === 'connected').length
        },
        errors: []
      }
    };

    let healthyCount = 0;
    let totalCount = 0;

    for (const [id, instance] of this.databases) {
      totalCount++;
      
      const dbHealth = await this.checkDatabaseHealth(instance);
      report.databases[id] = dbHealth;
      
      if (dbHealth.health > 0.7) {
        healthyCount++;
      }
    }

    // Determine overall health
    if (totalCount === 0) {
      report.overall = 'critical';
      report.systemHealth.errors.push('No databases configured');
    } else {
      const healthRatio = healthyCount / totalCount;
      if (healthRatio < 0.5) {
        report.overall = 'critical';
      } else if (healthRatio < 0.8) {
        report.overall = 'degraded';
      }
    }

    return report;
  }

  /**
   * Get metrics for all databases
   */
  async getMetrics(): Promise<DatabaseMetrics[]> {
    const metrics: DatabaseMetrics[] = [];
    
    for (const [id, instance] of this.databases) {
      const dbMetrics: DatabaseMetrics = {
        connectionCount: instance.pool ? (await instance.pool.getStats()).totalConnections : 1,
        activeConnections: instance.pool ? (await instance.pool.getStats()).activeConnections : 1,
        idleConnections: instance.pool ? (await instance.pool.getStats()).availableConnections : 0,
        
        queryStats: {
          totalQueries: instance.metrics.queryCount,
          successfulQueries: instance.metrics.queryCount - instance.metrics.errorCount,
          failedQueries: instance.metrics.errorCount,
          averageExecutionTime: instance.metrics.avgResponseTime,
          slowQueries: 0 // Would need to track
        },
        
        performance: {
          throughput: 0, // Would need to calculate
          latency: {
            p50: instance.metrics.avgResponseTime * 0.8,
            p95: instance.metrics.avgResponseTime * 1.2,
            p99: instance.metrics.avgResponseTime * 1.5
          },
          cacheHitRatio: 0.8, // Would need to track
          indexUsageRatio: 0.9 // Would need to track
        },
        
        storage: {
          totalSize: 0,
          dataSize: 0,
          indexSize: 0,
          freeSpace: 0,
          fragmentationRatio: 0.1
        },
        
        system: {
          cpuUsage: 0,
          memoryUsage: 0,
          diskIO: {
            reads: 0,
            writes: 0,
            iops: 0
          },
          networkIO: {
            bytesIn: 0,
            bytesOut: 0
          }
        }
      };
      
      metrics.push(dbMetrics);
    }
    
    return metrics;
  }

  /**
   * Optimize all databases
   */
  async optimizeAll(): Promise<string[]> {
    const optimized: string[] = [];
    
    for (const [id, instance] of this.databases) {
      try {
        // Perform optimization based on database type
        if ('optimize' in instance.connection && typeof instance.connection.optimize === 'function') {
          await instance.connection.optimize();
          optimized.push(`${instance.config.name} (${instance.type})`);
        }
        
        if (instance.pool) {
          await instance.pool.cleanup();
          optimized.push(`${instance.config.name} connection pool`);
        }
        
      } catch (error: any) {
        console.warn(`Failed to optimize ${instance.config.name}: ${error.message}`);
      }
    }
    
    console.log(`✨ Optimized ${optimized.length} databases`);
    return optimized;
  }

  /**
   * Backup a specific database
   */
  async backupDatabase(databaseId: string, location: string): Promise<void> {
    const instance = this.databases.get(databaseId);
    
    if (!instance) {
      throw new Error(`Database not found: ${databaseId}`);
    }
    
    console.log(`💾 Starting backup of ${instance.config.name} to ${location}`);
    
    // Backup implementation would depend on database type
    throw new Error('Backup functionality not yet implemented');
  }

  /**
   * Restore a database from backup
   */
  async restoreDatabase(databaseId: string, location: string): Promise<void> {
    const instance = this.databases.get(databaseId);
    
    if (!instance) {
      throw new Error(`Database not found: ${databaseId}`);
    }
    
    console.log(`🔄 Starting restore of ${instance.config.name} from ${location}`);
    
    // Restore implementation would depend on database type
    throw new Error('Restore functionality not yet implemented');
  }

  /**
   * Schedule backup for a database
   */
  async scheduleBackup(databaseId: string, schedule: string): Promise<void> {
    // Schedule implementation using cron or similar
    throw new Error('Backup scheduling not yet implemented');
  }

  /**
   * Migrate data between databases
   */
  async migrateData(sourceId: string, targetId: string, mapping: JSONObject): Promise<void> {
    const source = this.databases.get(sourceId);
    const target = this.databases.get(targetId);
    
    if (!source || !target) {
      throw new Error('Source or target database not found');
    }
    
    console.log(`🔄 Migrating data from ${source.config.name} to ${target.config.name}`);
    
    // Migration implementation would depend on database types
    throw new Error('Data migration not yet implemented');
  }

  /**
   * Sync databases
   */
  async syncDatabases(primaryId: string, replicaIds: string[]): Promise<void> {
    const primary = this.databases.get(primaryId);
    
    if (!primary) {
      throw new Error(`Primary database not found: ${primaryId}`);
    }
    
    console.log(`🔄 Syncing databases from ${primary.config.name}`);
    
    // Sync implementation would depend on database types
    throw new Error('Database sync not yet implemented');
  }

  /**
   * Begin a transaction across one or more databases
   */
  async beginTransaction(
    databaseIds: string | string[],
    options: {
      isolation?: TransactionIsolation;
      timeout?: number;
      readonly?: boolean;
    } = {}
  ): Promise<Transaction> {
    return this.transactionManager.beginTransaction(databaseIds, {
      isolation: options.isolation,
      timeout: options.timeout || this.options.queryTimeout,
      readonly: options.readonly
    });
  }

  /**
   * Execute query within a transaction
   */
  async executeInTransaction(
    transactionId: UUID,
    databaseId: string,
    query: Query
  ): Promise<QueryResult> {
    return this.transactionManager.executeInTransaction(transactionId, databaseId, query);
  }

  /**
   * Commit a transaction
   */
  async commitTransaction(transactionId: UUID): Promise<void> {
    return this.transactionManager.commitTransaction(transactionId);
  }

  /**
   * Rollback a transaction
   */
  async rollbackTransaction(transactionId: UUID): Promise<void> {
    return this.transactionManager.rollbackTransaction(transactionId);
  }

  /**
   * Create a savepoint within a transaction
   */
  async createSavepoint(transactionId: UUID, name: string): Promise<void> {
    return this.transactionManager.createSavepoint(transactionId, name);
  }

  /**
   * Rollback to a savepoint
   */
  async rollbackToSavepoint(transactionId: UUID, name: string): Promise<void> {
    return this.transactionManager.rollbackToSavepoint(transactionId, name);
  }

  /**
   * Get transaction status
   */
  getTransactionStatus(transactionId: UUID): Transaction | null {
    return this.transactionManager.getTransactionStatus(transactionId);
  }

  /**
   * Get all active transactions
   */
  getActiveTransactions(): Transaction[] {
    return this.transactionManager.getActiveTransactions();
  }

  /**
   * Get transaction statistics
   */
  getTransactionStats(): any {
    return this.transactionManager.getStats();
  }

  /**
   * Get connection pool manager for advanced operations
   */
  getConnectionPoolManager(): ConnectionPoolManager {
    return this.connectionPoolManager;
  }

  /**
   * Get database monitor for health and metrics
   */
  getDatabaseMonitor(): DatabaseMonitor {
    return this.databaseMonitor;
  }

  /**
   * Get all active alerts
   */
  getActiveAlerts(filters?: {
    level?: 'info' | 'warning' | 'critical' | 'emergency';
    type?: 'performance' | 'availability' | 'capacity' | 'security';
    database?: string;
  }): any[] {
    return this.databaseMonitor.getActiveAlerts(filters || {});
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy?: string): boolean {
    return this.databaseMonitor.acknowledgeAlert(alertId as UUID, acknowledgedBy);
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string, resolvedBy?: string): boolean {
    return this.databaseMonitor.resolveAlert(alertId as UUID, resolvedBy);
  }

  /**
   * Get historical performance metrics
   */
  getHistoricalMetrics(options?: {
    database?: string;
    metric?: string;
    startTime?: Date;
    endTime?: Date;
    limit?: number;
  }): any[] {
    return this.databaseMonitor.getHistoricalMetrics(options || {});
  }

  /**
   * Get trend analysis
   */
  getTrendAnalysis(database?: string): any[] {
    return this.databaseMonitor.getTrendAnalysis(database);
  }

  /**
   * Generate comprehensive performance report
   */
  async generatePerformanceReport(options?: {
    timeRange?: 'hour' | 'day' | 'week' | 'month';
    includeAlerts?: boolean;
    includeTrends?: boolean;
    includeRecommendations?: boolean;
  }): Promise<any> {
    return this.databaseMonitor.generateReport(options || {});
  }

  /**
   * Get monitoring statistics
   */
  getMonitoringStats(): any {
    return this.databaseMonitor.getStats();
  }

  /**
   * Execute query with automatic connection pooling
   */
  async executeWithPooling(
    databaseType: string,
    query: string,
    params: any[] = [],
    options: {
      timeout?: number;
      priority?: 'low' | 'medium' | 'high';
      retries?: number;
    } = {}
  ): Promise<any> {
    return this.connectionPoolManager.executeWithPool(databaseType, query, params, {
      timeout: options.timeout || this.options.queryTimeout,
      priority: options.priority || 'medium',
      retries: options.retries || 3
    });
  }

  /**
   * Shutdown the database manager
   */
  async shutdown(): Promise<void> {
    if (this.isShuttingDown) return;
    
    console.log('🛑 Shutting down database manager...');
    this.isShuttingDown = true;
    
    // Stop health checks
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    
    // Stop database monitor
    this.databaseMonitor.stop();
    
    // Shutdown transaction manager
    await this.transactionManager.shutdown();
    
    // Shutdown connection pool manager
    await this.connectionPoolManager.shutdown();
    
    // Close all databases
    const shutdownPromises = Array.from(this.databases.keys()).map(id => 
      this.removeDatabase(id)
    );
    
    await Promise.all(shutdownPromises);
    
    console.log('✅ Database manager shutdown complete');
    this.emit('manager:shutdown');
  }

  // Private helper methods

  private async checkDatabaseHealth(instance: DatabaseInstance): Promise<{
    status: any;
    health: number;
    issues: string[];
    recommendations: string[];
    lastCheck: Date;
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let health = 1.0;
    
    try {
      // Check connection status
      if (instance.status !== 'connected') {
        issues.push('Database not connected');
        health -= 0.5;
      }
      
      // Check error rate
      const errorRate = instance.metrics.queryCount > 0 ? 
        instance.metrics.errorCount / instance.metrics.queryCount : 0;
      if (errorRate > 0.1) {
        issues.push(`High error rate: ${(errorRate * 100).toFixed(1)}%`);
        recommendations.push('Investigate query failures');
        health -= 0.3;
      }
      
      // Check response time
      if (instance.metrics.avgResponseTime > 5000) {
        issues.push('High average response time');
        recommendations.push('Consider query optimization');
        health -= 0.2;
      }
      
      // Database-specific health checks
      if (instance.pool) {
        const poolHealth = instance.pool.getHealth();
        if (poolHealth.status !== 'healthy') {
          issues.push(...poolHealth.issues);
          health -= 0.3;
        }
      }
      
    } catch (error: any) {
      issues.push(`Health check failed: ${error.message}`);
      health = 0;
    }
    
    instance.healthCheck = {
      lastCheck: new Date(),
      isHealthy: health > 0.7,
      issues
    };
    
    return {
      status: instance.status,
      health: Math.max(0, health),
      issues,
      recommendations,
      lastCheck: new Date()
    };
  }

  private updateInstanceMetrics(
    instance: DatabaseInstance, 
    executionTime: number, 
    success: boolean
  ): void {
    instance.metrics.queryCount++;
    instance.metrics.lastUsed = new Date();
    
    // Update average response time
    instance.metrics.avgResponseTime = 
      (instance.metrics.avgResponseTime + executionTime) / 2;
    
    if (!success) {
      instance.metrics.errorCount++;
    }
  }

  private startHealthChecks(): void {
    this.healthCheckTimer = setInterval(async () => {
      if (this.isShuttingDown) return;
      
      try {
        const healthReport = await this.checkHealth();
        this.emit('health:check', healthReport);
        
        // Alert on critical issues
        if (healthReport.overall === 'critical') {
          this.emit('health:critical', healthReport);
        }
      } catch (error: any) {
        console.error(`Health check failed: ${error.message}`);
      }
    }, this.options.healthCheckInterval);
  }
}

/**
 * SQLite Database Operations wrapper
 */
class SQLiteOperations implements DatabaseOperations {
  constructor(private pool: SQLiteConnectionPool) {}

  async connect(): Promise<void> {
    // Connection managed by pool
  }

  async disconnect(): Promise<void> {
    await this.pool.shutdown();
  }

  async ping(): Promise<boolean> {
    try {
      await this.pool.execute('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  async getStatus(): Promise<any> {
    const health = this.pool.getHealth();
    return health.status;
  }

  async query<T = any>(sql: string, params?: any[], options?: QueryOptions): Promise<QueryResult<T>> {
    const startTime = Date.now();
    
    try {
      const result = await this.pool.execute(sql, params, {
        timeout: options?.timeout,
        priority: 'medium'
      });
      
      return {
        success: true,
        data: Array.isArray(result) ? result : [result],
        count: Array.isArray(result) ? result.length : 1,
        executionTime: Date.now() - startTime,
        cache: { hit: false },
        metadata: { sql, params }
      };
    } catch (error: any) {
      return {
        success: false,
        executionTime: Date.now() - startTime,
        cache: { hit: false },
        metadata: { sql, params, error: error.message }
      };
    }
  }

  async execute(sql: string, params?: any[], options?: QueryOptions): Promise<OperationResult> {
    try {
      const result = await this.pool.execute(sql, params);
      return {
        success: true,
        message: 'Query executed successfully',
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Query failed: ${error.message}`,
        error
      };
    }
  }

  async batch(queries: Query[], options?: QueryOptions): Promise<OperationResult[]> {
    const batchQueries = queries.map(q => ({
      query: q.sql || '',
      params: q.parameters || []
    }));
    
    const results = await this.pool.executeBatch(batchQueries, {
      parallel: false,
      failFast: false
    });
    
    return results.map((result, index) => ({
      success: !(result instanceof Error),
      message: result instanceof Error ? result.message : 'Query executed successfully',
      data: result instanceof Error ? undefined : result,
      error: result instanceof Error ? result : undefined
    }));
  }

  // Placeholder implementations for remaining interface methods
  async beginTransaction(isolation?: TransactionIsolation): Promise<Transaction> {
    throw new Error('Transaction management not yet implemented');
  }

  async commitTransaction(transaction: Transaction): Promise<void> {
    throw new Error('Transaction management not yet implemented');
  }

  async rollbackTransaction(transaction: Transaction): Promise<void> {
    throw new Error('Transaction management not yet implemented');
  }

  async createSavepoint(transaction: Transaction, name: string): Promise<void> {
    throw new Error('Savepoint management not yet implemented');
  }

  async rollbackToSavepoint(transaction: Transaction, name: string): Promise<void> {
    throw new Error('Savepoint management not yet implemented');
  }

  async createTable(schema: any): Promise<void> {
    throw new Error('Schema management not yet implemented');
  }

  async alterTable(tableName: string, changes: any[]): Promise<void> {
    throw new Error('Schema management not yet implemented');
  }

  async dropTable(tableName: string): Promise<void> {
    throw new Error('Schema management not yet implemented');
  }

  async getSchema(tableName?: string): Promise<any[]> {
    throw new Error('Schema management not yet implemented');
  }

  async createIndex(definition: any): Promise<void> {
    throw new Error('Index management not yet implemented');
  }

  async dropIndex(indexName: string): Promise<void> {
    throw new Error('Index management not yet implemented');
  }

  async reindexTable(tableName: string): Promise<void> {
    throw new Error('Index management not yet implemented');
  }

  async analyzeTable(tableName: string): Promise<any> {
    throw new Error('Analysis not yet implemented');
  }

  async vacuum(): Promise<void> {
    await this.pool.execute('VACUUM');
  }

  async analyze(): Promise<void> {
    await this.pool.execute('ANALYZE');
  }

  async optimize(): Promise<void> {
    await this.vacuum();
    await this.analyze();
    await this.pool.cleanup();
  }

  async backup(location: string): Promise<void> {
    throw new Error('Backup not yet implemented');
  }

  async restore(location: string): Promise<void> {
    throw new Error('Restore not yet implemented');
  }

  async getMetrics(): Promise<any> {
    return this.pool.getStats();
  }

  async getSlowQueries(limit?: number): Promise<any[]> {
    throw new Error('Slow query tracking not yet implemented');
  }

  async explainQuery(sql: string, params?: any[]): Promise<any> {
    const result = await this.pool.execute(`EXPLAIN QUERY PLAN ${sql}`, params);
    return { nodes: result, totalCost: 0, estimatedRows: 0 };
  }
}

export default UnifiedDatabaseManager;