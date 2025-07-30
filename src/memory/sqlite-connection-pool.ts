/**
 * SQLite Connection Pool - TypeScript Edition;
 * Manages multiple SQLite connections for improved concurrency;
 * with comprehensive type safety and advanced pool management;
 */

import { createDatabase } from './sqlite-wrapper';

interface PoolConnection {id = > void
reject = > void
timeout = []
private;
available = []
private;
waiting = []
private;
activeConnections = 0
private;
isShuttingDown = false
private;
healthCheckTimer?: NodeJS.Timeout;
private;
cleanupTimer?: NodeJS.Timeout;
private;
startTime = Date.now();
// Metrics
private;
totalQueries = 0;
private;
totalErrors = 0;
private;
totalWaitTime = 0;
private;
totalQueryTime = 0;
private;
queryCount = 0;
constructor(dbPath, (options = {}));
{
  this.dbPath = dbPath;
  this.options = {minConnections = = false,enableHealthChecks = = false;
}
}
/**
 * Initialize the connection pool;
 */
async
initialize()
: Promise<void>
{
  console.warn(`🏊 Initializing SQLite connectionpool = 0; i < this.options.minConnections; i++) {
        await this._createConnection();
      }
;
      // Start health checks if enabled
      if (this.options.enableHealthChecks) {
        this.startHealthChecks();
      }
;
      // Start cleanup timer
      this.startCleanupInterval();
;
      console.warn(`✅ Connection poolinitialized = this.options.maxConnections);
  throw new Error('Maximum connection limit reached');
;
  try {
      const _db = await createDatabase(this.dbPath);
;
      // Configure each connection for optimal performance
      db.pragma('journal_mode = WAL');
      db.pragma('synchronous = NORMAL');
      db.pragma('temp_store = MEMORY');
      db.pragma('cache_size = -2000'); // 2MB cache per connection
      db.pragma('foreign_keys = ON');
      db.pragma('mmap_size = 268435456'); // 256MB memory-mapped size
      
      const _connection = {id = 'medium'): Promise<PoolConnection> {
    const _requestStart = Date.now();
;
    return new Promise(async (resolve, reject) => {
      if (this.isShuttingDown) {
        reject(new Error('Connection pool is shutting down'));
    // return; // LINT: unreachable code removed
      }
;
      // Check for available connection
      if (this.available.length > 0) {
        const _connection = this.available.pop()!;
        connection.inUse = true;
        connection.lastUsed = Date.now();
;
        // Update metrics
        if (this.options.enableMetrics) {
          this.totalWaitTime += Date.now() - requestStart;
        }
;
        resolve(connection);
        return;
    //   // LINT: unreachable code removed}
;
      // Create new connection if under limit
      if (this.activeConnections < this.options.maxConnections) {
        try {
          const _connection = await this._createConnection();
          connection.inUse = true;
          this.available.pop(); // Remove from available since we're using it
          
          // Update metrics
          if (this.options.enableMetrics) {
            this.totalWaitTime += Date.now() - requestStart;
          }
;
          resolve(connection);
          return;
    //   // LINT: unreachable code removed} catch (/* error */) {
          reject(error);
          return;
    //   // LINT: unreachable code removed}
      }
;
      // Wait for connection to become available
      const __timeout = setTimeout(() => {
        const _index = this.waiting.indexOf(waiter);
        if (index > -1) {
          this.waiting.splice(index, 1);
          reject(new Error('Connection acquisition timeout'));
        }
      }, this.options.acquireTimeout);
;
      const _waiter = {
      resolve => {
          clearTimeout(_timeout);
          // Update metrics
          if (this.options.enableMetrics) {
            this.totalWaitTime += Date.now() - requestStart;
          }
          resolve(connection);
        },;
        reject => {
          clearTimeout(timeout);
          reject(error);
        },;
        timeout,;
        requestedAt = {high = priorityOrder[waiter.priority];
;
    const _insertIndex = this.waiting.length;
    for (let i = 0; i < this.waiting.length; i++) {
      const _existingPriority = priorityOrder[this.waiting[i].priority];
      if (waiterPriority > existingPriority) {
        insertIndex = i;
        break;
      }
    }
;
    this.waiting.splice(insertIndex, 0, waiter);
  }
;
  /**
   * Release a connection back to the pool;
   */;
  release(connection = false;
  connection.lastUsed = Date.now();
;
  // If there are waiting requests, fulfill them
  if (this.waiting.length > 0) {
    const _waiter = this.waiting.shift()!;
    connection.inUse = true;
    waiter.resolve(connection);
    return;
    //   // LINT: unreachable code removed}
;
  // Check connection health before returning to pool
  if (this.isConnectionHealthy(connection)) {
    // Return to available pool
    this.available.push(connection);
    //   // LINT: unreachable code removed} else {
    // Replace unhealthy connection
    this._closeConnection(connection);
    this._createConnection().catch(_error => {
        console.error(`Failed to replace unhealthyconnection = [], ;
    options = {}
  ): Promise<any> {
    const _queryStart = Date.now();
    let _connection = null;
    let _retries = options.retries  ?? this.options.retryAttempts;
;
    while (retries >= 0) {
      try {
        connection = await this.acquire(options.priority);
;
        const _stmt = connection.db.prepare(query);
;
        // Apply timeout if specified
        if (options.timeout) {
          // SQLite doesn't support query timeout directly
          // This would need to be implemented with a Promise.race pattern
        }
;
        // Determine if this is a SELECT query (returns data) or not (INSERT/UPDATE/DELETE)
        const _isSelectQuery = query.trim().toUpperCase().startsWith('SELECT')  ?? query.trim().toUpperCase().startsWith('WITH')  ?? query.trim().toUpperCase().startsWith('EXPLAIN');
    // ; // LINT: unreachable code removed
        let _result = stmt.all(...params);
        } else {
          result = stmt.run(...params);
        }
;
        // Update connection metrics
        connection.queryCount++;
;
        // Update pool metrics
        if (this.options.enableMetrics) {
          this.totalQueries++;
          this.queryCount++;
          this.totalQueryTime += Date.now() - queryStart;
        }
;
        return result;
    // ; // LINT: unreachable code removed
      } catch (error = false;
        }
;
        // Update error metrics
        if (this.options.enableMetrics) {
          this.totalErrors++;
        }
;
        if (retries === 0) {
          throw error;
        }
;
        retries--;
;
        // Wait before retry with exponential backoff
        await this.sleep(Math.pow(2, this.options.retryAttempts - retries) * 100);
;
      } finally {
        if (connection) {
          this.release(connection);
        }
      }
    }
  }
;
  /**
   * Execute multiple queries in a transaction;
   */;
  async executeTransaction(;
    queries = {}
  ): Promise<any[]> {
    const _connection = await this.acquire(options.priority);
;
    try {
      const _transaction = connection.db.transaction(() => {
        const _results = [];
        for (const { query, params = [] } of queries) {
          const _stmt = connection.db.prepare(query);
          const _isSelectQuery = query.trim().toUpperCase().startsWith('SELECT');
;
          if (isSelectQuery) {
            results.push(stmt.all(...params));
          } else {
            results.push(stmt.run(...params));
          }
        }
        return results;
    //   // LINT: unreachable code removed});
;
      const _results = transaction();
;
      // Update metrics
      connection.queryCount += queries.length;
      if (this.options.enableMetrics) {
        this.totalQueries += queries.length;
        this.queryCount += queries.length;
      }
;
      return results;
    // ; // LINT: unreachable code removed
    } catch (error = false;
;
      if (this.options.enableMetrics) {
        this.totalErrors++;
      }
;
      throw error;
    } finally {
      this.release(connection);
    }
  }
;
  /**
   * Execute a batch of queries (non-transactional);
   */;
  async executeBatch(;
    queries = {}
  ): Promise<(any | Error)[]> {
    const { parallel = false, failFast = true, priority = 'medium' } = options;
;
    if (parallel) {
      // Execute queries in parallel using multiple connections
      const _promises = queries.map(async (queryInfo) => {
        try {
          return await this.execute(queryInfo.query, queryInfo.params, {
            ...queryInfo.options,;
    // priority; // LINT: unreachable code removed
          });
        } catch (/* error */) {
          if (failFast) {
            throw error;
          }
          return error;
    //   // LINT: unreachable code removed}
      });
;
      if (failFast) {
        return await Promise.all(promises);
    //   // LINT: unreachable code removed} else {
        return await Promise.allSettled(promises).then(results =>;
    // results.map(result => ; // LINT: unreachable code removed
            result.status === 'fulfilled' ? result.value = await this.acquire(priority);
      const _results = [];
;
      try {
        for (const queryInfo of queries) {
          try {
            const _stmt = connection.db.prepare(queryInfo.query);
            const _isSelectQuery = queryInfo.query.trim().toUpperCase().startsWith('SELECT');
;
            let _result = stmt.all(...(queryInfo.params  ?? []));
            } else {
              result = stmt.run(...(queryInfo.params  ?? []));
            }
;
            results.push(result);
            connection.queryCount++;
;
          } catch (error = queries.length;
          this.queryCount += queries.length;
        }
;
        return results;
    // ; // LINT: unreachable code removed
      } finally {
        this.release(connection);
      }
    }
  }
;
  /**
   * Get pool statistics;
   */;
  getStats(): PoolStats {
    const _now = Date.now();
;
    return {totalConnections = > c.inUse).length,availableConnections = > ;
    // !c.inUse && (now - c.lastUsed) > 60000; // LINT: unreachable code removed
      ).length,oldestConnection = > now - c.createdAt));
        : 0,totalQueries = Date.now();
;
    return this.connections.map(conn => ({id = Date.now();
    // const _connectionsToClose = []; // LINT: unreachable code removed
;
    // Find idle connections to close
    for (const connection of this.connections) {
      if (!connection.inUse && ;
          (now - connection.lastUsed) > this.options.idleTimeout &&;
          this.connections.length > this.options.minConnections) {
        connectionsToClose.push(connection);
      }
    }
;
    // Close idle connections
    for (const connection of connectionsToClose) {
      this._closeConnection(connection);
    }
;
    // Create new connections if below minimum
    while (this.connections.length < this.options.minConnections) {
      try {
        await this._createConnection();
      } catch (/* error */) {
        console.error(`Failed to create minimumconnection = Date.now();
;
    // Check if connection exceeded max lifetime
    if ((now - connection.createdAt) > this.options.maxLifetime) {
      return false;
    //   // LINT: unreachable code removed}
;
    // Check error rate
    const __errorRate = connection.queryCount > 0 ? ;
      connection.errorCount / connection.queryCount = connection.db.prepare('SELECT 1 as health_check');
      const _result = stmt.get();
;
      const _isHealthy = result && result.health_check === 1;
      connection.isHealthy = isHealthy;
;
      return isHealthy;
    //   // LINT: unreachable code removed} catch (/* error */) {
      console.warn(`Health check failed for connection ${connection.id}: ${error}`);
    connection.isHealthy = false;
    return false;
    //   // LINT: unreachable code removed}
}
;
/**
 * Start periodic health checks;
 */;
private;
startHealthChecks();
: void;
  this.healthCheckTimer = setInterval(async () => {
      const _unhealthyConnections = [];
;
      for (const connection of this.connections) {
        if (!connection.inUse) {
          const _isHealthy = await this.performHealthCheck(connection);
          if (!isHealthy) {
            unhealthyConnections.push(connection);
          }
        }
      }
;
      // Replace unhealthy connections
      for (const _connection of unhealthyConnections) {
        console.warn(`⚠️ Replacing unhealthyconnection = this.connections.indexOf(connection);
    if (connIndex > -1) {
      this.connections.splice(connIndex, 1);
    }
;
    const _availIndex = this.available.indexOf(connection);
    if (availIndex > -1) {
      this.available.splice(availIndex, 1);
    }
;
    // Close the database connection
    try {
      connection.db.close();
      console.warn(`➖ Closedconnection = true;
;
    // Stop timers
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    this.stopCleanupInterval();
;
    // Reject all waiting requests
    for (const waiter of this.waiting) {
      clearTimeout(waiter.timeout);
      waiter.reject(new Error('Connection pool is shutting down'));
    }
    this.waiting.length = 0;
;
    // Wait for active connections to finish (with timeout)
    const _shutdownTimeout = 10000; // 10 seconds
    const _startTime = Date.now();
;
    while (this.connections.some(c => c.inUse) && ;
           (Date.now() - startTime) < shutdownTimeout) 
      await this.sleep(100);
;
    // Force close all connections
    for (const connection of this.connections) {
      this._closeConnection(connection);
    }
;
    this.connections.length = 0;
    this.available.length = 0;
    this.activeConnections = 0;
;
    console.warn('✅ Connection pool shutdown complete');
  }
;
  /**
   * Helper method to run periodic cleanup;
   */;
  startCleanupInterval(intervalMs = 60000): void ;
    this.cleanupTimer = setInterval(() => ;
      this.cleanup().catch(_error => ;
        console.warn('Connection pool cleanuperror = undefined;
;
  /**
   * Utility method for sleeping;
   */;
  private sleep(ms): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
    // ; // LINT: unreachable code removed
  /**
   * Get pool health status;
   */;
  getHealth(): {status = this.getStats();
    const _issues = [];
    const _status = 'healthy';
;
    // Check connection availability
    if (stats.availableConnections === 0 && stats.waitingRequests > 0) {
      issues.push('No available connections with pending requests');
      status = 'critical';
    }
;
    // Check error rate
    const __errorRate = stats.totalQueries > 0 ? ;
      stats.totalErrors / stats.totalQueries = status === 'critical' ? 'critical' : 'warning';
    }
;
    // Check connection usage
    const _usageRatio = stats.activeConnections / stats.totalConnections;
    if (usageRatio > 0.9) {
      issues.push('High connection usage');
      status = status === 'critical' ? 'critical' : 'warning';
    }
;
    // Check for unhealthy connections
    const _unhealthyCount = this.connections.filter(c => !c.isHealthy).length;
    if (unhealthyCount > 0) {
      issues.push(`${unhealthyCount} unhealthy connections`);
      status = status === 'critical' ? 'critical' : 'warning';
    }
;
    return { status,metrics = false; // Will be replaced when released
      }
    }
;
  // Create new connections to maintain minimum
  while (this.connections.length < this.options.minConnections) {
    try {
      await this._createConnection();
    } catch (/* error */) {
      console.error(`Failed to create replacement connection: ${error}`);
      break;
    }
  }
;
  console.warn('✅ Connection refresh complete');
}
;
export default SQLiteConnectionPool;
