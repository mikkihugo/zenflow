/**
 * Connection Pool Manager - TypeScript Edition
 * Manages connection pools across multiple database types with advanced features
 * like load balancing, failover, and adaptive sizing
 */

import {
  DatabaseConfig,
  DatabaseOperations,
  VectorOperations,
  GraphOperations,
  PoolConfig,
  ConnectionPoolStats,
  JSONObject
} from '../types/database';
import { JSONValue } from '../types/core';
import SQLiteConnectionPool from '../memory/sqlite-connection-pool';
import { EventEmitter } from 'events';

interface PoolInstance {
  id: string;
  type: 'sqlite' | 'lancedb' | 'kuzu' | 'postgresql';
  config: DatabaseConfig;
  pool: any; // Will be specific pool type based on database
  stats: ConnectionPoolStats;
  status: 'initializing' | 'active' | 'degraded' | 'failed' | 'shutting_down';
  createdAt: Date;
  lastHealthCheck: Date;
  healthScore: number; // 0-1, where 1 is perfect health
  loadFactor: number; // Current load as percentage of capacity
  failoverTarget?: string; // ID of failover pool
}

interface LoadBalancingStrategy {
  type: 'round_robin' | 'least_connections' | 'weighted' | 'adaptive';
  weights?: Record<string, number>;
  healthThreshold?: number;
}

interface PoolManagerOptions {
  loadBalancing?: LoadBalancingStrategy;
  enableFailover?: boolean;
  healthCheckInterval?: number;
  adaptiveResizing?: boolean;
  maxPoolsPerType?: number;
  globalConnectionLimit?: number;
  monitoringEnabled?: boolean;
}

interface PoolMetrics {
  totalPools: number;
  activePools: number;
  totalConnections: number;
  activeConnections: number;
  averageResponseTime: number;
  errorRate: number;
  throughput: number;
  memoryUsage: number;
}

export class ConnectionPoolManager extends EventEmitter {
  private pools: Map<string, PoolInstance> = new Map();
  private poolsByType: Map<string, Set<string>> = new Map();
  private loadBalancingIndex: number = 0;
  private options: Required<PoolManagerOptions>;
  private healthCheckTimer?: NodeJS.Timeout;
  private metricsTimer?: NodeJS.Timeout;
  private startTime: Date = new Date();
  
  // Metrics tracking
  private metrics: {
    requestCount: number;
    errorCount: number;
    totalResponseTime: number;
    lastRequestTime: Date;
  } = {
    requestCount: 0,
    errorCount: 0,
    totalResponseTime: 0,
    lastRequestTime: new Date()
  };

  constructor(options: PoolManagerOptions = {}) {
    super();
    
    this.options = {
      loadBalancing: options.loadBalancing || { type: 'least_connections', healthThreshold: 0.7 },
      enableFailover: options.enableFailover !== false,
      healthCheckInterval: options.healthCheckInterval || 30000, // 30 seconds
      adaptiveResizing: options.adaptiveResizing !== false,
      maxPoolsPerType: options.maxPoolsPerType || 5,
      globalConnectionLimit: options.globalConnectionLimit || 100,
      monitoringEnabled: options.monitoringEnabled !== false
    };

    if (this.options.monitoringEnabled) {
      this.startMonitoring();
    }

    // Initialize pool type tracking
    ['sqlite', 'lancedb', 'kuzu', 'postgresql'].forEach(type => {
      this.poolsByType.set(type, new Set());
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
  }

  /**
   * Create a new connection pool
   */
  async createPool(config: DatabaseConfig): Promise<string> {
    const poolId = this.generatePoolId(config.type, config.name);
    
    console.log(`🏊 Creating connection pool: ${poolId} (${config.type})`);
    
    // Check limits
    const typeSet = this.poolsByType.get(config.type);
    if (typeSet && typeSet.size >= this.options.maxPoolsPerType) {
      throw new Error(`Maximum pools reached for type ${config.type}: ${this.options.maxPoolsPerType}`);
    }

    if (this.getTotalConnections() + (config.pool.max || 10) > this.options.globalConnectionLimit) {
      throw new Error(`Global connection limit would be exceeded: ${this.options.globalConnectionLimit}`);
    }

    try {
      const poolInstance: PoolInstance = {
        id: poolId,
        type: config.type as any,
        config,
        pool: null,
        stats: this.initializeStats(),
        status: 'initializing',
        createdAt: new Date(),
        lastHealthCheck: new Date(),
        healthScore: 1.0,
        loadFactor: 0.0
      };

      // Create pool based on database type
      switch (config.type) {
        case 'sqlite':
          poolInstance.pool = new SQLiteConnectionPool(
            config.filePath || `${config.name}.db`,
            {
              minConnections: config.pool.min,
              maxConnections: config.pool.max,
              acquireTimeout: config.pool.acquireTimeout,
              idleTimeout: config.pool.idleTimeout,
              enableHealthChecks: true,
              enableMetrics: true
            }
          );
          await poolInstance.pool.initialize();
          break;

        case 'lancedb':
          poolInstance.pool = new LanceDBConnectionPool(config);
          await poolInstance.pool.initialize();
          break;

        case 'kuzu':
          poolInstance.pool = new KuzuConnectionPool(config);
          await poolInstance.pool.initialize();
          break;

        case 'postgresql':
          poolInstance.pool = new PostgreSQLConnectionPool(config);
          await poolInstance.pool.initialize();
          break;

        default:
          throw new Error(`Unsupported database type: ${config.type}`);
      }

      poolInstance.status = 'active';
      this.pools.set(poolId, poolInstance);
      
      const typeSet = this.poolsByType.get(config.type)!;
      typeSet.add(poolId);

      console.log(`✅ Connection pool created: ${poolId}`);
      this.emit('pool:created', { poolId, config });

      return poolId;

    } catch (error: any) {
      console.error(`❌ Failed to create pool ${poolId}: ${error.message}`);
      this.emit('pool:error', { poolId, error: error.message });
      throw error;
    }
  }

  /**
   * Get a connection from the most suitable pool
   */
  async getConnection(
    databaseType: string,
    options: {
      preferredPool?: string;
      timeout?: number;
      priority?: 'low' | 'medium' | 'high';
      readonly?: boolean;
    } = {}
  ): Promise<{ connection: any; poolId: string }> {
    const startTime = Date.now();
    
    try {
      const poolId = await this.selectPool(databaseType, options);
      const pool = this.pools.get(poolId);
      
      if (!pool) {
        throw new Error(`Pool not found: ${poolId}`);
      }

      if (pool.status !== 'active') {
        // Try failover if enabled
        if (this.options.enableFailover && pool.failoverTarget) {
          return this.getConnection(databaseType, { ...options, preferredPool: pool.failoverTarget });
        }
        throw new Error(`Pool ${poolId} is not active (status: ${pool.status})`);
      }

      const connection = await pool.pool.acquire(options.priority || 'medium');
      
      // Update metrics
      this.updatePoolMetrics(pool, Date.now() - startTime, true);
      this.metrics.requestCount++;
      this.metrics.totalResponseTime += Date.now() - startTime;
      this.metrics.lastRequestTime = new Date();

      this.emit('connection:acquired', { poolId, responseTime: Date.now() - startTime });
      
      return { connection, poolId };

    } catch (error: any) {
      this.metrics.errorCount++;
      this.emit('connection:error', { databaseType, error: error.message });
      throw error;
    }
  }

  /**
   * Release a connection back to its pool
   */
  async releaseConnection(poolId: string, connection: any): Promise<void> {
    const pool = this.pools.get(poolId);
    if (!pool) {
      console.warn(`Cannot release connection: pool ${poolId} not found`);
      return;
    }

    try {
      if (pool.pool && pool.pool.release) {
        pool.pool.release(connection);
      }
      
      this.emit('connection:released', { poolId });
    } catch (error: any) {
      console.error(`Error releasing connection to pool ${poolId}: ${error.message}`);
      this.emit('connection:release_error', { poolId, error: error.message });
    }
  }

  /**
   * Execute a query using connection pool
   */
  async executeWithPool(
    databaseType: string,
    query: string,
    params: any[] = [],
    options: {
      preferredPool?: string;
      timeout?: number;
      priority?: 'low' | 'medium' | 'high';
      retries?: number;
    } = {}
  ): Promise<any> {
    const maxRetries = options.retries || 3;
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const { connection, poolId } = await this.getConnection(databaseType, options);
        
        try {
          // Execute query with timeout
          const timeoutPromise = options.timeout ? 
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Query timeout')), options.timeout)
            ) : null;

          const queryPromise = connection.execute ? 
            connection.execute(query, params) :
            connection.query(query, params);

          const result = timeoutPromise ? 
            await Promise.race([queryPromise, timeoutPromise]) :
            await queryPromise;

          return result;

        } finally {
          await this.releaseConnection(poolId, connection);
        }

      } catch (error: any) {
        lastError = error;
        console.warn(`Query attempt ${attempt + 1} failed: ${error.message}`);
        
        if (attempt === maxRetries) break;
        
        // Exponential backoff
        const backoffTime = Math.pow(2, attempt) * 100;
        await this.sleep(backoffTime);
      }
    }

    throw lastError!;
  }

  /**
   * Remove a pool
   */
  async removePool(poolId: string): Promise<boolean> {
    const pool = this.pools.get(poolId);
    if (!pool) {
      return false;
    }

    console.log(`🗑️ Removing pool: ${poolId}`);
    
    try {
      pool.status = 'shutting_down';
      
      // Shutdown the pool
      if (pool.pool && pool.pool.shutdown) {
        await pool.pool.shutdown();
      }

      // Remove from tracking
      this.pools.delete(poolId);
      const typeSet = this.poolsByType.get(pool.type);
      if (typeSet) {
        typeSet.delete(poolId);
      }

      console.log(`✅ Pool removed: ${poolId}`);
      this.emit('pool:removed', { poolId });
      
      return true;

    } catch (error: any) {
      console.error(`❌ Failed to remove pool ${poolId}: ${error.message}`);
      this.emit('pool:remove_error', { poolId, error: error.message });
      return false;
    }
  }

  /**
   * Get pool statistics
   */
  getPoolStats(poolId?: string): PoolInstance | PoolInstance[] | null {
    if (poolId) {
      return this.pools.get(poolId) || null;
    }

    return Array.from(this.pools.values());
  }

  /**
   * Get overall metrics
   */
  getMetrics(): PoolMetrics {
    const totalConnections = this.getTotalConnections();
    const activeConnections = this.getActiveConnections();
    
    return {
      totalPools: this.pools.size,
      activePools: Array.from(this.pools.values()).filter(p => p.status === 'active').length,
      totalConnections,
      activeConnections,
      averageResponseTime: this.metrics.requestCount > 0 ? 
        this.metrics.totalResponseTime / this.metrics.requestCount : 0,
      errorRate: this.metrics.requestCount > 0 ? 
        this.metrics.errorCount / this.metrics.requestCount : 0,
      throughput: this.calculateThroughput(),
      memoryUsage: process.memoryUsage().heapUsed
    };
  }

  /**
   * Optimize all pools
   */
  async optimizeAll(): Promise<{ optimized: string[]; failed: string[] }> {
    const optimized: string[] = [];
    const failed: string[] = [];

    console.log('🔧 Optimizing all connection pools...');

    for (const [poolId, pool] of this.pools) {
      try {
        if (pool.pool && pool.pool.cleanup) {
          await pool.pool.cleanup();
        }
        
        // Adaptive resizing based on load
        if (this.options.adaptiveResizing) {
          await this.adaptiveResize(pool);
        }
        
        optimized.push(poolId);
      } catch (error: any) {
        console.warn(`Failed to optimize pool ${poolId}: ${error.message}`);
        failed.push(poolId);
      }
    }

    console.log(`✨ Optimization complete: ${optimized.length} pools optimized, ${failed.length} failed`);
    return { optimized, failed };
  }

  /**
   * Check health of all pools
   */
  async checkHealth(): Promise<{
    overall: 'healthy' | 'degraded' | 'critical';
    pools: Record<string, {
      status: string;
      health: number;
      issues: string[];
      recommendations: string[];
    }>;
  }> {
    const healthReport: any = {
      overall: 'healthy',
      pools: {}
    };

    let healthyPools = 0;
    let totalPools = 0;

    for (const [poolId, pool] of this.pools) {
      totalPools++;
      
      const poolHealth = await this.checkPoolHealth(pool);
      healthReport.pools[poolId] = poolHealth;
      
      if (poolHealth.health > 0.7) {
        healthyPools++;
      }
    }

    // Determine overall health
    if (totalPools === 0) {
      healthReport.overall = 'critical';
    } else {
      const healthRatio = healthyPools / totalPools;
      if (healthRatio < 0.5) {
        healthReport.overall = 'critical';
      } else if (healthRatio < 0.8) {
        healthReport.overall = 'degraded';
      }
    }

    return healthReport;
  }

  /**
   * Shutdown all pools
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down connection pool manager...');
    
    // Stop timers
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
    }

    // Shutdown all pools
    const shutdownPromises = Array.from(this.pools.keys()).map(poolId =>
      this.removePool(poolId)
    );

    await Promise.all(shutdownPromises);
    
    console.log('✅ Connection pool manager shutdown complete');
    this.emit('manager:shutdown');
  }

  // Private helper methods

  private async selectPool(
    databaseType: string,
    options: { preferredPool?: string; readonly?: boolean }
  ): Promise<string> {
    const typeSet = this.poolsByType.get(databaseType);
    if (!typeSet || typeSet.size === 0) {
      throw new Error(`No pools available for database type: ${databaseType}`);
    }

    // Use preferred pool if specified and available
    if (options.preferredPool && typeSet.has(options.preferredPool)) {
      const pool = this.pools.get(options.preferredPool);
      if (pool && pool.status === 'active') {
        return options.preferredPool;
      }
    }

    const availablePools = Array.from(typeSet)
      .map(poolId => this.pools.get(poolId)!)
      .filter(pool => pool.status === 'active' && pool.healthScore >= (this.options.loadBalancing.healthThreshold || 0.7));

    if (availablePools.length === 0) {
      throw new Error(`No healthy pools available for database type: ${databaseType}`);
    }

    // Apply load balancing strategy
    return this.applyLoadBalancing(availablePools).id;
  }

  private applyLoadBalancing(pools: PoolInstance[]): PoolInstance {
    const strategy = this.options.loadBalancing;

    switch (strategy.type) {
      case 'round_robin':
        const selected = pools[this.loadBalancingIndex % pools.length];
        this.loadBalancingIndex++;
        return selected;

      case 'least_connections':
        return pools.reduce((best, current) => 
          current.loadFactor < best.loadFactor ? current : best
        );

      case 'weighted':
        if (strategy.weights) {
          const weighted = pools.map(pool => ({
            pool,
            weight: strategy.weights![pool.id] || 1
          }));
          // Weighted random selection (simplified)
          const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
          const random = Math.random() * totalWeight;
          let current = 0;
          for (const { pool, weight } of weighted) {
            current += weight;
            if (current >= random) return pool;
          }
        }
        // Fallback to least connections
        return pools.reduce((best, current) => 
          current.loadFactor < best.loadFactor ? current : best
        );

      case 'adaptive':
        // Consider both load factor and health score
        return pools.reduce((best, current) => {
          const bestScore = best.healthScore * (1 - best.loadFactor);
          const currentScore = current.healthScore * (1 - current.loadFactor);
          return currentScore > bestScore ? current : best;
        });

      default:
        return pools[0];
    }
  }

  private async checkPoolHealth(pool: PoolInstance): Promise<{
    status: string;
    health: number;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let health = 1.0;

    try {
      // Check pool status
      if (pool.status !== 'active') {
        issues.push(`Pool status: ${pool.status}`);
        health -= 0.5;
      }

      // Check load factor
      if (pool.loadFactor > 0.9) {
        issues.push('High load factor');
        recommendations.push('Consider increasing pool size');
        health -= 0.3;
      }

      // Database-specific health checks
      if (pool.pool && pool.pool.getHealth) {
        const poolHealth = pool.pool.getHealth();
        if (poolHealth.status !== 'healthy') {
          issues.push(...poolHealth.issues);
          health -= 0.2;
        }
      }

      pool.healthScore = Math.max(0, health);
      pool.lastHealthCheck = new Date();

    } catch (error: any) {
      issues.push(`Health check failed: ${error.message}`);
      health = 0;
    }

    return {
      status: pool.status,
      health: Math.max(0, health),
      issues,
      recommendations
    };
  }

  private async adaptiveResize(pool: PoolInstance): Promise<void> {
    if (!pool.pool || !pool.pool.getStats) return;

    const stats = pool.pool.getStats();
    const utilizationRatio = stats.activeConnections / stats.totalConnections;

    // Scale up if utilization is high
    if (utilizationRatio > 0.8 && stats.totalConnections < (pool.config.pool.max || 10)) {
      console.log(`📈 Scaling up pool ${pool.id}: utilization ${(utilizationRatio * 100).toFixed(1)}%`);
      // Implementation would depend on pool type
    }

    // Scale down if utilization is low for extended period
    if (utilizationRatio < 0.3 && stats.totalConnections > (pool.config.pool.min || 1)) {
      console.log(`📉 Scaling down pool ${pool.id}: utilization ${(utilizationRatio * 100).toFixed(1)}%`);
      // Implementation would depend on pool type
    }

    pool.loadFactor = utilizationRatio;
  }

  private updatePoolMetrics(pool: PoolInstance, responseTime: number, success: boolean): void {
    // Update pool-specific metrics
    pool.stats.responseTime = (pool.stats.responseTime + responseTime) / 2;
    pool.stats.requestCount++;
    
    if (!success) {
      pool.stats.errorCount++;
    }
  }

  private getTotalConnections(): number {
    return Array.from(this.pools.values())
      .reduce((total, pool) => {
        if (pool.pool && pool.pool.getStats) {
          return total + pool.pool.getStats().totalConnections;
        }
        return total + (pool.config.pool.max || 10);
      }, 0);
  }

  private getActiveConnections(): number {
    return Array.from(this.pools.values())
      .reduce((total, pool) => {
        if (pool.pool && pool.pool.getStats) {
          return total + pool.pool.getStats().activeConnections;
        }
        return total;
      }, 0);
  }

  private calculateThroughput(): number {
    const uptimeMs = Date.now() - this.startTime.getTime();
    return uptimeMs > 0 ? (this.metrics.requestCount / uptimeMs) * 1000 : 0;
  }

  private initializeStats(): ConnectionPoolStats {
    return {
      responseTime: 0,
      requestCount: 0,
      errorCount: 0,
      createdAt: new Date(),
      lastActivity: new Date()
    };
  }

  private startMonitoring(): void {
    this.healthCheckTimer = setInterval(async () => {
      try {
        await this.checkHealth();
      } catch (error: any) {
        console.error(`Health check error: ${error.message}`);
      }
    }, this.options.healthCheckInterval);

    this.metricsTimer = setInterval(() => {
      this.emit('metrics:update', this.getMetrics());
    }, 10000); // Emit metrics every 10 seconds
  }

  private generatePoolId(type: string, name: string): string {
    return `${type}_${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Placeholder connection pool classes for different database types
class LanceDBConnectionPool {
  constructor(private config: DatabaseConfig) {}
  async initialize(): Promise<void> { /* Implementation */ }
  async acquire(priority: string): Promise<any> { /* Implementation */ return {}; }
  release(connection: any): void { /* Implementation */ }
  async shutdown(): Promise<void> { /* Implementation */ }
  getStats(): any { return { totalConnections: 0, activeConnections: 0 }; }
  getHealth(): any { return { status: 'healthy', issues: [] }; }
}

class KuzuConnectionPool {
  constructor(private config: DatabaseConfig) {}
  async initialize(): Promise<void> { /* Implementation */ }
  async acquire(priority: string): Promise<any> { /* Implementation */ return {}; }
  release(connection: any): void { /* Implementation */ }
  async shutdown(): Promise<void> { /* Implementation */ }
  getStats(): any { return { totalConnections: 0, activeConnections: 0 }; }
  getHealth(): any { return { status: 'healthy', issues: [] }; }
}

class PostgreSQLConnectionPool {
  constructor(private config: DatabaseConfig) {}
  async initialize(): Promise<void> { /* Implementation */ }
  async acquire(priority: string): Promise<any> { /* Implementation */ return {}; }
  release(connection: any): void { /* Implementation */ }
  async shutdown(): Promise<void> { /* Implementation */ }
  getStats(): any { return { totalConnections: 0, activeConnections: 0 }; }
  getHealth(): any { return { status: 'healthy', issues: [] }; }
}

export default ConnectionPoolManager;