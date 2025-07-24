/**
 * Comprehensive Health Monitoring System
 * Monitors database, circuit breakers, queens, and system resources
 */

import { strategicDocs } from '../database/strategic-documents-manager.js';
import { circuitBreakerManager } from './circuit-breaker.js';
import { CliError } from './cli-error.js';
import fs from 'fs/promises';
import os from 'os';

export class HealthMonitor {
  constructor() {
    this.checks = new Map();
    this.monitoringInterval = null;
    this.monitoringEnabled = false;
    
    // Circular buffer for health history to prevent memory leaks
    this.maxHistorySize = 100;
    this.healthHistory = new Array(this.maxHistorySize);
    this.historyIndex = 0;
    this.historyCount = 0;
    
    // Memory management
    this.maxMemoryUsageMB = 50; // Alert if health monitor uses more than 50MB
    this.cleanupInterval = null;
    
    // Register health checks
    this.registerHealthChecks();
    
    // Start memory cleanup routine
    this.startMemoryCleanup();
  }

  /**
   * Register all health checks
   */
  registerHealthChecks() {
    this.checks.set('database', this.checkDatabase.bind(this));
    this.checks.set('circuit-breakers', this.checkCircuitBreakers.bind(this));
    this.checks.set('system-resources', this.checkSystemResources.bind(this));
    this.checks.set('disk-space', this.checkDiskSpace.bind(this));
    this.checks.set('memory-usage', this.checkMemoryUsage.bind(this));
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck() {
    const timestamp = new Date().toISOString();
    const results = {
      timestamp,
      status: 'healthy',
      checks: {},
      summary: {
        total: this.checks.size,
        healthy: 0,
        unhealthy: 0,
        degraded: 0
      }
    };

    // Execute all health checks
    for (const [name, checkFn] of this.checks.entries()) {
      try {
        const startTime = Date.now();
        const checkResult = await checkFn();
        const duration = Date.now() - startTime;
        
        results.checks[name] = {
          ...checkResult,
          duration,
          timestamp
        };

        // Update summary
        switch (checkResult.status) {
          case 'healthy':
            results.summary.healthy++;
            break;
          case 'unhealthy':
            results.summary.unhealthy++;
            break;
          case 'degraded':
            results.summary.degraded++;
            break;
        }
      } catch (error) {
        results.checks[name] = {
          status: 'unhealthy',
          reason: `Health check failed: ${error.message}`,
          error: error.message,
          timestamp
        };
        results.summary.unhealthy++;
      }
    }

    // Determine overall status
    if (results.summary.unhealthy > 0) {
      results.status = 'unhealthy';
    } else if (results.summary.degraded > 0) {
      results.status = 'degraded';
    }

    // Add to history
    this.addToHistory(results);

    return results;
  }

  /**
   * Check database health
   */
  async checkDatabase() {
    try {
      if (!strategicDocs.db) {
        await strategicDocs.initialize();
      }
      
      const dbHealth = await strategicDocs.healthCheck();
      return {
        status: dbHealth.status,
        details: {
          tables: dbHealth.tables,
          projectId: dbHealth.projectId,
          dbPath: dbHealth.dbPath
        },
        metrics: {
          tablesHealthy: Object.values(dbHealth.tables || {}).filter(t => t.status === 'healthy').length,
          totalTables: Object.keys(dbHealth.tables || {}).length
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        reason: `Database health check failed: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Check circuit breaker health
   */
  async checkCircuitBreakers() {
    try {
      const breakerSummary = circuitBreakerManager.getHealthSummary();
      
      let status = 'healthy';
      if (breakerSummary.openBreakers > 0) {
        status = 'degraded';
      }
      if (breakerSummary.overallHealth < 0.5) {
        status = 'unhealthy';
      }

      return {
        status,
        details: breakerSummary,
        metrics: {
          totalBreakers: breakerSummary.totalBreakers,
          healthyBreakers: breakerSummary.healthyBreakers,
          openBreakers: breakerSummary.openBreakers,
          overallHealth: Math.round(breakerSummary.overallHealth * 100)
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        reason: `Circuit breaker health check failed: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Check system resource usage
   */
  async checkSystemResources() {
    try {
      const cpuUsage = process.cpuUsage();
      const memoryUsage = process.memoryUsage();
      const uptime = process.uptime();
      
      // Calculate CPU percentage (simplified)
      const cpuPercent = ((cpuUsage.user + cpuUsage.system) / 1000000) / uptime * 100;
      
      // Memory usage in MB
      const memoryMB = {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024)
      };

      let status = 'healthy';
      if (memoryMB.heapUsed > 512) { // More than 512MB heap
        status = 'degraded';
      }
      if (memoryMB.heapUsed > 1024) { // More than 1GB heap
        status = 'unhealthy';
      }

      return {
        status,
        details: {
          uptime: Math.round(uptime),
          memory: memoryMB,
          cpuUsage: Math.round(cpuPercent * 100) / 100
        },
        metrics: {
          uptimeHours: Math.round(uptime / 3600 * 100) / 100,
          memoryUsageMB: memoryMB.heapUsed,
          cpuPercent: Math.round(cpuPercent * 100) / 100
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        reason: `System resource check failed: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Check disk space availability
   */
  async checkDiskSpace() {
    try {
      const stats = await fs.stat(process.cwd());
      const totalSpace = os.totalmem();
      const freeSpace = os.freemem();
      const usedPercent = ((totalSpace - freeSpace) / totalSpace) * 100;

      let status = 'healthy';
      if (usedPercent > 80) {
        status = 'degraded';
      }
      if (usedPercent > 95) {
        status = 'unhealthy';
      }

      return {
        status,
        details: {
          totalGB: Math.round(totalSpace / 1024 / 1024 / 1024),
          freeGB: Math.round(freeSpace / 1024 / 1024 / 1024),
          usedPercent: Math.round(usedPercent * 100) / 100
        },
        metrics: {
          diskUsagePercent: Math.round(usedPercent * 100) / 100,
          freeSpaceGB: Math.round(freeSpace / 1024 / 1024 / 1024)
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        reason: `Disk space check failed: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Check memory usage patterns
   */
  async checkMemoryUsage() {
    try {
      const usage = process.memoryUsage();
      const heapUsedPercent = (usage.heapUsed / usage.heapTotal) * 100;
      
      let status = 'healthy';
      if (heapUsedPercent > 80) {
        status = 'degraded';
      }
      if (heapUsedPercent > 95) {
        status = 'unhealthy';
      }

      return {
        status,
        details: {
          heapUsedPercent: Math.round(heapUsedPercent * 100) / 100,
          heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
          heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
          external: Math.round(usage.external / 1024 / 1024)
        },
        metrics: {
          heapUsagePercent: Math.round(heapUsedPercent * 100) / 100,
          totalMemoryMB: Math.round(usage.heapTotal / 1024 / 1024)
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        reason: `Memory usage check failed: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring(intervalMs = 60000) { // Default: 1 minute
    if (this.monitoringEnabled) {
      console.warn('Health monitoring already running');
      return;
    }

    this.monitoringEnabled = true;
    this.monitoringInterval = setInterval(async () => {
      try {
        const health = await this.performHealthCheck();
        
        // Log unhealthy status
        if (health.status !== 'healthy') {
          console.warn(`🚨 System health: ${health.status.toUpperCase()}`);
          
          // Log specific issues
          for (const [name, check] of Object.entries(health.checks)) {
            if (check.status !== 'healthy') {
              console.warn(`  ⚠️  ${name}: ${check.status} - ${check.reason || 'See details'}`);
            }
          }
        }
      } catch (error) {
        console.error('Health monitoring error:', error.message);
      }
    }, intervalMs);

    console.log(`💓 Health monitoring started (interval: ${intervalMs}ms)`);
  }

  /**
   * Stop continuous monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.monitoringEnabled = false;
    console.log('💓 Health monitoring stopped');
  }

  /**
   * Start memory cleanup routine
   */
  startMemoryCleanup() {
    if (this.cleanupInterval) return;
    
    this.cleanupInterval = setInterval(() => {
      this.performMemoryCleanup();
    }, 300000); // Every 5 minutes
  }

  /**
   * Stop memory cleanup routine
   */
  stopMemoryCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Perform memory cleanup
   */
  performMemoryCleanup() {
    try {
      const memoryUsage = process.memoryUsage();
      const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
      
      if (heapUsedMB > this.maxMemoryUsageMB) {
        console.warn(`⚠️ Health monitor memory usage high: ${Math.round(heapUsedMB)}MB`);
        
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }
    } catch (error) {
      console.warn('Memory cleanup error:', error.message);
    }
  }

  /**
   * Add health check result to circular buffer
   */
  addToHistory(result) {
    // Add to circular buffer
    this.healthHistory[this.historyIndex] = {
      timestamp: result.timestamp,
      status: result.status,
      summary: result.summary, // Only store summary to save memory
      checkCount: Object.keys(result.checks).length
    };
    
    this.historyIndex = (this.historyIndex + 1) % this.maxHistorySize;
    
    if (this.historyCount < this.maxHistorySize) {
      this.historyCount++;
    }
  }

  /**
   * Get health history with efficient circular buffer access
   */
  getHealthHistory(maxItems = null) {
    const itemCount = maxItems ? Math.min(maxItems, this.historyCount) : this.historyCount;
    const history = [];
    
    for (let i = 0; i < itemCount; i++) {
      const index = (this.historyIndex - 1 - i + this.maxHistorySize) % this.maxHistorySize;
      if (this.healthHistory[index]) {
        history.push(this.healthHistory[index]);
      }
    }
    
    return history.reverse(); // Return in chronological order
  }

  /**
   * Get health trend analysis
   */
  getHealthTrend(minutes = 60) {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    const recentChecks = this.healthHistory.filter(h => 
      new Date(h.timestamp).getTime() > cutoff
    );

    if (recentChecks.length === 0) {
      return { status: 'no-data', message: 'No recent health data available' };
    }

    const healthyCount = recentChecks.filter(h => h.status === 'healthy').length;
    const degradedCount = recentChecks.filter(h => h.status === 'degraded').length;
    const unhealthyCount = recentChecks.filter(h => h.status === 'unhealthy').length;

    const healthPercentage = (healthyCount / recentChecks.length) * 100;
    
    let trendStatus = 'stable';
    if (healthPercentage > 90) {
      trendStatus = 'excellent';
    } else if (healthPercentage > 75) {
      trendStatus = 'good';
    } else if (healthPercentage > 50) {
      trendStatus = 'concerning';
    } else {
      trendStatus = 'critical';
    }

    return {
      status: trendStatus,
      timeWindow: minutes,
      totalChecks: recentChecks.length,
      healthyCount,
      degradedCount,
      unhealthyCount,
      healthPercentage: Math.round(healthPercentage * 100) / 100,
      latestStatus: recentChecks[recentChecks.length - 1]?.status || 'unknown'
    };
  }

  /**
   * Get formatted health report
   */
  async generateHealthReport() {
    const health = await this.performHealthCheck();
    const trend = this.getHealthTrend();
    
    const report = [
      '📊 SYSTEM HEALTH REPORT',
      '━'.repeat(50),
      `Overall Status: ${health.status.toUpperCase()}`,
      `Timestamp: ${health.timestamp}`,
      '',
      '🔍 Health Checks:',
      ...Object.entries(health.checks).map(([name, check]) => 
        `  ${check.status === 'healthy' ? '✅' : check.status === 'degraded' ? '⚠️' : '❌'} ${name}: ${check.status}` +
        (check.reason ? ` - ${check.reason}` : '')
      ),
      '',
      '📈 Health Trend (60min):',
      `  Status: ${trend.status}`,
      `  Health Rate: ${trend.healthPercentage}% (${trend.healthyCount}/${trend.totalChecks})`,
      '',
      '🔧 Circuit Breakers:',
      ...Object.entries(health.checks['circuit-breakers']?.details?.breakers || {}).map(breaker => 
        `  ${breaker.state === 'CLOSED' ? '🟢' : breaker.state === 'HALF_OPEN' ? '🟡' : '🔴'} ${breaker.name}: ${breaker.state}`
      )
    ];

    return report.join('\n');
  }
}

// Export singleton instance
export const healthMonitor = new HealthMonitor();