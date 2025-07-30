/**
 * SQLite Connection Pool - TypeScript Edition
 * Manages multiple SQLite connections for improved concurrency
 * with comprehensive type safety and advanced pool management
 */

import { createDatabase, Database } from './sqlite-wrapper';
import { DatabaseConfig, Transaction, QueryResult, OperationResult } from '../types/database';
import { JSONValue } from '../types/core';

interface PoolConnection {
  id: string;
  db: Database;
  lastUsed: number;
  inUse: boolean;
  createdAt: number;
  queryCount: number;
  errorCount: number;
  isHealthy: boolean;
}

interface ConnectionWaiter {
  resolve: (connection: PoolConnection) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
  requestedAt: number;
  priority: 'low' | 'medium' | 'high';
}

interface PoolOptions {
  minConnections?: number;
  maxConnections?: number;
  idleTimeout?: number;
  acquireTimeout?: number;
  maxLifetime?: number;
  healthCheckInterval?: number;
  retryAttempts?: number;
  enableMetrics?: boolean;
  enableHealthChecks?: boolean;
}

interface PoolStats {
  totalConnections: number;
  activeConnections: number;
  availableConnections: number;
  waitingRequests: number;
  idleConnections: number;
  oldestConnection: number;
  totalQueries: number;
  totalErrors: number;
  averageWaitTime: number;
  averageQueryTime: number;
  uptime: number;
}

interface QueryOptions {
  timeout?: number;
  priority?: 'low' | 'medium' | 'high';
  retries?: number;
  useTransaction?: boolean;
}

interface BatchQuery {
  query: string;
  params?: any[];
  options?: QueryOptions;
}

export class SQLiteConnectionPool {
  private dbPath: string;
  private options: Required<PoolOptions>;
  private connections: PoolConnection[] = [];
  private available: PoolConnection[] = [];
  private waiting: ConnectionWaiter[] = [];
  private activeConnections: number = 0;
  private isShuttingDown: boolean = false;
  private healthCheckTimer?: NodeJS.Timeout;
  private cleanupTimer?: NodeJS.Timeout;
  private startTime: number = Date.now();
  
  // Metrics
  private totalQueries: number = 0;
  private totalErrors: number = 0;
  private totalWaitTime: number = 0;
  private totalQueryTime: number = 0;
  private queryCount: number = 0;

  constructor(dbPath: string, options: PoolOptions = {}) {
    this.dbPath = dbPath;
    this.options = {
      minConnections: options.minConnections || 1,
      maxConnections: options.maxConnections || 4,
      idleTimeout: options.idleTimeout || 300000, // 5 minutes
      acquireTimeout: options.acquireTimeout || 5000, // 5 seconds
      maxLifetime: options.maxLifetime || 3600000, // 1 hour
      healthCheckInterval: options.healthCheckInterval || 60000, // 1 minute
      retryAttempts: options.retryAttempts || 3,
      enableMetrics: options.enableMetrics !== false,
      enableHealthChecks: options.enableHealthChecks !== false
    };
  }

  /**
   * Initialize the connection pool
   */
  async initialize(): Promise<void> {
    console.log(`🏊 Initializing SQLite connection pool: ${this.dbPath}`);
    
    try {
      // Create minimum number of connections
      for (let i = 0; i < this.options.minConnections; i++) {
        await this._createConnection();
      }
      
      // Start health checks if enabled
      if (this.options.enableHealthChecks) {
        this.startHealthChecks();
      }
      
      // Start cleanup timer
      this.startCleanupInterval();
      
      console.log(`✅ Connection pool initialized: ${this.connections.length} connections`);
    } catch (error) {
      console.error(`❌ Failed to initialize connection pool: ${error}`);
      throw error;
    }
  }

  /**
   * Create a new database connection
   */
  private async _createConnection(): Promise<PoolConnection> {
    if (this.activeConnections >= this.options.maxConnections) {
      throw new Error('Maximum connection limit reached');
    }

    try {
      const db = await createDatabase(this.dbPath);
      
      // Configure each connection for optimal performance
      db.pragma('journal_mode = WAL');
      db.pragma('synchronous = NORMAL');
      db.pragma('temp_store = MEMORY');
      db.pragma('cache_size = -2000'); // 2MB cache per connection
      db.pragma('foreign_keys = ON');
      db.pragma('mmap_size = 268435456'); // 256MB memory-mapped size
      
      const connection: PoolConnection = {
        id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        db,
        lastUsed: Date.now(),
        inUse: false,
        createdAt: Date.now(),
        queryCount: 0,
        errorCount: 0,
        isHealthy: true
      };

      this.connections.push(connection);
      this.available.push(connection);
      this.activeConnections++;

      console.log(`➕ Created connection: ${connection.id}`);
      return connection;
    } catch (error) {
      console.error(`❌ Failed to create connection: ${error}`);
      throw error;
    }
  }

  /**
   * Acquire a connection from the pool
   */
  async acquire(priority: 'low' | 'medium' | 'high' = 'medium'): Promise<PoolConnection> {
    const requestStart = Date.now();
    
    return new Promise(async (resolve, reject) => {
      if (this.isShuttingDown) {
        reject(new Error('Connection pool is shutting down'));
        return;
      }

      // Check for available connection
      if (this.available.length > 0) {
        const connection = this.available.pop()!;
        connection.inUse = true;
        connection.lastUsed = Date.now();
        
        // Update metrics
        if (this.options.enableMetrics) {
          this.totalWaitTime += Date.now() - requestStart;
        }
        
        resolve(connection);
        return;
      }

      // Create new connection if under limit
      if (this.activeConnections < this.options.maxConnections) {
        try {
          const connection = await this._createConnection();
          connection.inUse = true;
          this.available.pop(); // Remove from available since we're using it
          
          // Update metrics
          if (this.options.enableMetrics) {
            this.totalWaitTime += Date.now() - requestStart;
          }
          
          resolve(connection);
          return;
        } catch (error) {
          reject(error);
          return;
        }
      }

      // Wait for connection to become available
      const timeout = setTimeout(() => {
        const index = this.waiting.indexOf(waiter);
        if (index > -1) {
          this.waiting.splice(index, 1);
          reject(new Error('Connection acquisition timeout'));
        }
      }, this.options.acquireTimeout);

      const waiter: ConnectionWaiter = {
        resolve: (connection: PoolConnection) => {
          clearTimeout(timeout);
          // Update metrics
          if (this.options.enableMetrics) {
            this.totalWaitTime += Date.now() - requestStart;
          }
          resolve(connection);
        },
        reject: (error: Error) => {
          clearTimeout(timeout);
          reject(error);
        },
        timeout,
        requestedAt: requestStart,
        priority
      };
      
      // Insert waiter based on priority
      this.insertWaiterByPriority(waiter);
    });
  }

  /**
   * Insert waiter into queue based on priority
   */
  private insertWaiterByPriority(waiter: ConnectionWaiter): void {
    const priorityOrder = { high: 2, medium: 1, low: 0 };
    const waiterPriority = priorityOrder[waiter.priority];
    
    let insertIndex = this.waiting.length;
    for (let i = 0; i < this.waiting.length; i++) {
      const existingPriority = priorityOrder[this.waiting[i].priority];
      if (waiterPriority > existingPriority) {
        insertIndex = i;
        break;
      }
    }
    
    this.waiting.splice(insertIndex, 0, waiter);
  }

  /**
   * Release a connection back to the pool
   */
  release(connection: PoolConnection): void {
    if (!connection || !connection.inUse) {
      return;
    }

    connection.inUse = false;
    connection.lastUsed = Date.now();

    // If there are waiting requests, fulfill them
    if (this.waiting.length > 0) {
      const waiter = this.waiting.shift()!;
      connection.inUse = true;
      waiter.resolve(connection);
      return;
    }

    // Check connection health before returning to pool
    if (this.isConnectionHealthy(connection)) {
      // Return to available pool
      this.available.push(connection);
    } else {
      // Replace unhealthy connection
      this._closeConnection(connection);
      this._createConnection().catch(error => {
        console.error(`Failed to replace unhealthy connection: ${error}`);
      });
    }
  }

  /**
   * Execute a single query
   */
  async execute(
    query: string, 
    params: any[] = [], 
    options: QueryOptions = {}
  ): Promise<any> {
    const queryStart = Date.now();
    let connection: PoolConnection | null = null;
    let retries = options.retries || this.options.retryAttempts;
    
    while (retries >= 0) {
      try {
        connection = await this.acquire(options.priority);
        
        const stmt = connection.db.prepare(query);
        
        // Apply timeout if specified
        if (options.timeout) {
          // SQLite doesn't support query timeout directly
          // This would need to be implemented with a Promise.race pattern
        }
        
        // Determine if this is a SELECT query (returns data) or not (INSERT/UPDATE/DELETE)
        const isSelectQuery = query.trim().toUpperCase().startsWith('SELECT') ||
                            query.trim().toUpperCase().startsWith('WITH') ||
                            query.trim().toUpperCase().startsWith('EXPLAIN');
        
        let result: any;
        if (isSelectQuery) {
          result = stmt.all(...params);
        } else {
          result = stmt.run(...params);
        }
        
        // Update connection metrics
        connection.queryCount++;
        
        // Update pool metrics
        if (this.options.enableMetrics) {
          this.totalQueries++;
          this.queryCount++;
          this.totalQueryTime += Date.now() - queryStart;
        }
        
        return result;
        
      } catch (error: any) {
        console.error(`Query execution error (${retries} retries left): ${error.message}`);
        
        if (connection) {
          connection.errorCount++;
          connection.isHealthy = false;
        }
        
        // Update error metrics
        if (this.options.enableMetrics) {
          this.totalErrors++;
        }
        
        if (retries === 0) {
          throw error;
        }
        
        retries--;
        
        // Wait before retry with exponential backoff
        await this.sleep(Math.pow(2, this.options.retryAttempts - retries) * 100);
        
      } finally {
        if (connection) {
          this.release(connection);
        }
      }
    }
  }

  /**
   * Execute multiple queries in a transaction
   */
  async executeTransaction(
    queries: BatchQuery[],
    options: QueryOptions = {}
  ): Promise<any[]> {
    const connection = await this.acquire(options.priority);
    
    try {
      const transaction = connection.db.transaction(() => {
        const results: any[] = [];
        for (const { query, params = [] } of queries) {
          const stmt = connection.db.prepare(query);
          const isSelectQuery = query.trim().toUpperCase().startsWith('SELECT');
          
          if (isSelectQuery) {
            results.push(stmt.all(...params));
          } else {
            results.push(stmt.run(...params));
          }
        }
        return results;
      });
      
      const results = transaction();
      
      // Update metrics
      connection.queryCount += queries.length;
      if (this.options.enableMetrics) {
        this.totalQueries += queries.length;
        this.queryCount += queries.length;
      }
      
      return results;
      
    } catch (error: any) {
      connection.errorCount++;
      connection.isHealthy = false;
      
      if (this.options.enableMetrics) {
        this.totalErrors++;
      }
      
      throw error;
    } finally {
      this.release(connection);
    }
  }

  /**
   * Execute a batch of queries (non-transactional)
   */
  async executeBatch(
    queries: BatchQuery[],
    options: { 
      parallel?: boolean;
      failFast?: boolean;
      priority?: 'low' | 'medium' | 'high';
    } = {}
  ): Promise<(any | Error)[]> {
    const { parallel = false, failFast = true, priority = 'medium' } = options;
    
    if (parallel) {
      // Execute queries in parallel using multiple connections
      const promises = queries.map(async (queryInfo) => {
        try {
          return await this.execute(queryInfo.query, queryInfo.params, {
            ...queryInfo.options,
            priority
          });
        } catch (error) {
          if (failFast) {
            throw error;
          }
          return error;
        }
      });
      
      if (failFast) {
        return await Promise.all(promises);
      } else {
        return await Promise.allSettled(promises).then(results =>
          results.map(result => 
            result.status === 'fulfilled' ? result.value : result.reason
          )
        );
      }
    } else {
      // Execute queries sequentially using single connection
      const connection = await this.acquire(priority);
      const results: (any | Error)[] = [];
      
      try {
        for (const queryInfo of queries) {
          try {
            const stmt = connection.db.prepare(queryInfo.query);
            const isSelectQuery = queryInfo.query.trim().toUpperCase().startsWith('SELECT');
            
            let result: any;
            if (isSelectQuery) {
              result = stmt.all(...(queryInfo.params || []));
            } else {
              result = stmt.run(...(queryInfo.params || []));
            }
            
            results.push(result);
            connection.queryCount++;
            
          } catch (error: any) {
            connection.errorCount++;
            
            if (failFast) {
              throw error;
            }
            results.push(error);
          }
        }
        
        // Update metrics
        if (this.options.enableMetrics) {
          this.totalQueries += queries.length;
          this.queryCount += queries.length;
        }
        
        return results;
        
      } finally {
        this.release(connection);
      }
    }
  }

  /**
   * Get pool statistics
   */
  getStats(): PoolStats {
    const now = Date.now();
    const uptime = now - this.startTime;
    
    return {
      totalConnections: this.connections.length,
      activeConnections: this.connections.filter(c => c.inUse).length,
      availableConnections: this.available.length,
      waitingRequests: this.waiting.length,
      idleConnections: this.connections.filter(c => 
        !c.inUse && (now - c.lastUsed) > 60000
      ).length,
      oldestConnection: this.connections.length > 0 
        ? Math.min(...this.connections.map(c => now - c.createdAt))
        : 0,
      totalQueries: this.totalQueries,
      totalErrors: this.totalErrors,
      averageWaitTime: this.queryCount > 0 ? this.totalWaitTime / this.queryCount : 0,
      averageQueryTime: this.queryCount > 0 ? this.totalQueryTime / this.queryCount : 0,
      uptime
    };
  }

  /**
   * Get detailed connection information
   */
  getConnectionInfo(): {
    id: string;
    inUse: boolean;
    age: number;
    idleTime: number;
    queryCount: number;
    errorCount: number;
    isHealthy: boolean;
  }[] {
    const now = Date.now();
    
    return this.connections.map(conn => ({
      id: conn.id,
      inUse: conn.inUse,
      age: now - conn.createdAt,
      idleTime: conn.inUse ? 0 : now - conn.lastUsed,
      queryCount: conn.queryCount,
      errorCount: conn.errorCount,
      isHealthy: conn.isHealthy
    }));
  }

  /**
   * Cleanup idle connections
   */
  async cleanup(): Promise<number> {
    const now = Date.now();
    const connectionsToClose: PoolConnection[] = [];

    // Find idle connections to close
    for (const connection of this.connections) {
      if (!connection.inUse && 
          (now - connection.lastUsed) > this.options.idleTimeout &&
          this.connections.length > this.options.minConnections) {
        connectionsToClose.push(connection);
      }
    }

    // Close idle connections
    for (const connection of connectionsToClose) {
      this._closeConnection(connection);
    }

    // Create new connections if below minimum
    while (this.connections.length < this.options.minConnections) {
      try {
        await this._createConnection();
      } catch (error) {
        console.error(`Failed to create minimum connection: ${error}`);
        break;
      }
    }

    if (connectionsToClose.length > 0) {
      console.log(`🧹 Cleaned up ${connectionsToClose.length} idle connections`);
    }

    return connectionsToClose.length;
  }

  /**
   * Check if a connection is healthy
   */
  private isConnectionHealthy(connection: PoolConnection): boolean {
    const now = Date.now();
    
    // Check if connection exceeded max lifetime
    if ((now - connection.createdAt) > this.options.maxLifetime) {
      return false;
    }
    
    // Check error rate
    const errorRate = connection.queryCount > 0 ? 
      connection.errorCount / connection.queryCount : 0;
    if (errorRate > 0.1) { // More than 10% error rate
      return false;
    }
    
    // Check if connection is marked as unhealthy
    if (!connection.isHealthy) {
      return false;
    }
    
    return true;
  }

  /**
   * Perform health check on a connection
   */
  private async performHealthCheck(connection: PoolConnection): Promise<boolean> {
    try {
      const stmt = connection.db.prepare('SELECT 1 as health_check');
      const result = stmt.get();
      
      const isHealthy = result && result.health_check === 1;
      connection.isHealthy = isHealthy;
      
      return isHealthy;
    } catch (error) {
      console.warn(`Health check failed for connection ${connection.id}: ${error}`);
      connection.isHealthy = false;
      return false;
    }
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    this.healthCheckTimer = setInterval(async () => {
      const unhealthyConnections: PoolConnection[] = [];
      
      for (const connection of this.connections) {
        if (!connection.inUse) {
          const isHealthy = await this.performHealthCheck(connection);
          if (!isHealthy) {
            unhealthyConnections.push(connection);
          }
        }
      }
      
      // Replace unhealthy connections
      for (const connection of unhealthyConnections) {
        console.warn(`⚠️ Replacing unhealthy connection: ${connection.id}`);
        this._closeConnection(connection);
        
        try {
          await this._createConnection();
        } catch (error) {
          console.error(`Failed to replace unhealthy connection: ${error}`);
        }
      }
    }, this.options.healthCheckInterval);
  }

  /**
   * Close a specific connection
   */
  private _closeConnection(connection: PoolConnection): void {
    // Remove from all arrays
    const connIndex = this.connections.indexOf(connection);
    if (connIndex > -1) {
      this.connections.splice(connIndex, 1);
    }

    const availIndex = this.available.indexOf(connection);
    if (availIndex > -1) {
      this.available.splice(availIndex, 1);
    }

    // Close the database connection
    try {
      connection.db.close();
      console.log(`➖ Closed connection: ${connection.id}`);
    } catch (error) {
      console.error(`Error closing connection ${connection.id}: ${error}`);
    }

    this.activeConnections--;
  }

  /**
   * Shutdown the connection pool
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down connection pool...');
    
    this.isShuttingDown = true;

    // Stop timers
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    this.stopCleanupInterval();

    // Reject all waiting requests
    for (const waiter of this.waiting) {
      clearTimeout(waiter.timeout);
      waiter.reject(new Error('Connection pool is shutting down'));
    }
    this.waiting.length = 0;

    // Wait for active connections to finish (with timeout)
    const shutdownTimeout = 10000; // 10 seconds
    const startTime = Date.now();
    
    while (this.connections.some(c => c.inUse) && 
           (Date.now() - startTime) < shutdownTimeout) {
      await this.sleep(100);
    }

    // Force close all connections
    for (const connection of this.connections) {
      this._closeConnection(connection);
    }

    this.connections.length = 0;
    this.available.length = 0;
    this.activeConnections = 0;
    
    console.log('✅ Connection pool shutdown complete');
  }

  /**
   * Helper method to run periodic cleanup
   */
  startCleanupInterval(intervalMs: number = 60000): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup().catch(error => {
        console.warn('Connection pool cleanup error:', error);
      });
    }, intervalMs);
  }

  stopCleanupInterval(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  /**
   * Utility method for sleeping
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get pool health status
   */
  getHealth(): {
    status: 'healthy' | 'warning' | 'critical';
    metrics: PoolStats;
    issues: string[];
  } {
    const stats = this.getStats();
    const issues: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    // Check connection availability
    if (stats.availableConnections === 0 && stats.waitingRequests > 0) {
      issues.push('No available connections with pending requests');
      status = 'critical';
    }
    
    // Check error rate
    const errorRate = stats.totalQueries > 0 ? 
      stats.totalErrors / stats.totalQueries : 0;
    if (errorRate > 0.1) {
      issues.push(`High error rate: ${(errorRate * 100).toFixed(1)}%`);
      status = status === 'critical' ? 'critical' : 'warning';
    }
    
    // Check connection usage
    const usageRatio = stats.activeConnections / stats.totalConnections;
    if (usageRatio > 0.9) {
      issues.push('High connection usage');
      status = status === 'critical' ? 'critical' : 'warning';
    }
    
    // Check for unhealthy connections
    const unhealthyCount = this.connections.filter(c => !c.isHealthy).length;
    if (unhealthyCount > 0) {
      issues.push(`${unhealthyCount} unhealthy connections`);
      status = status === 'critical' ? 'critical' : 'warning';
    }
    
    return { status, metrics: stats, issues };
  }

  /**
   * Force refresh all connections
   */
  async refreshConnections(): Promise<void> {
    console.log('🔄 Refreshing all connections...');
    
    // Mark all connections for replacement
    for (const connection of this.connections) {
      if (!connection.inUse) {
        this._closeConnection(connection);
      } else {
        connection.isHealthy = false; // Will be replaced when released
      }
    }
    
    // Create new connections to maintain minimum
    while (this.connections.length < this.options.minConnections) {
      try {
        await this._createConnection();
      } catch (error) {
        console.error(`Failed to create replacement connection: ${error}`);
        break;
      }
    }
    
    console.log('✅ Connection refresh complete');
  }
}

export default SQLiteConnectionPool;