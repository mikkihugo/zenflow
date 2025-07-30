/**
 * Comprehensive Health Monitoring System;
 * Monitors database, circuit breakers, queens, and system resources;
 */

import fs from 'node:fs/promises';
import os from 'node:os';
import { strategicDocs } from '../database/strategic-documents-manager.js';
import { circuitBreakerManager } from './circuit-breaker.js';

export class HealthMonitor {
  constructor() {
    this.checks = new Map();
    this.monitoringInterval = null;
    this.monitoringEnabled = false;
    // Simple bounded array for health history
    this.maxHistorySize = 50; // Smaller, more reasonable limit
    this.healthHistory = [];
    // Memory management
    this.maxMemoryUsageMB = 50; // Alert if health monitor uses more than 50MB
    this.cleanupInterval = null;
    // Register health checks
    this.registerHealthChecks();
    // Start memory cleanup routine
    this.startMemoryCleanup();
  //   }
  /**
   * Register all health checks;
   */
  registerHealthChecks() {
    this.checks.set('database', this.checkDatabase.bind(this));
    this.checks.set('circuit-breakers', this.checkCircuitBreakers.bind(this));
    this.checks.set('system-resources', this.checkSystemResources.bind(this));
    this.checks.set('disk-space', this.checkDiskSpace.bind(this));
    this.checks.set('memory-usage', this.checkMemoryUsage.bind(this));
  //   }
  /**
   * Perform comprehensive health check;
   */
  async performHealthCheck() {
    const _timestamp = new Date().toISOString();
    const _results = {
      timestamp,status = Date.now();
// const _checkResult = awaitcheckFn();
    const _duration = Date.now() - startTime;
    results.checks[name] = {
..checkResult,
    duration,
    timestamp }
  // Update summary
  switch (_checkResult._status) {
      case 'healthy':;
        results.summary.healthy++;
        break;
      case 'unhealthy':;
        results.summary.unhealthy++;
        break;
      case 'degraded':;
        results.summary.degraded++;
        break;
    //     }
// }
catch (/* _error */)
// {
  results.checks[name] = {status = 'unhealthy';
// }
else
if (results._summary._degraded > 0) {
  results.status = 'degraded';
// }
// Add to history
this;

addToHistory(results)
return;
// results; // LINT: unreachable code removed
// }
/**
 * Check database health;
 */
// async
checkDatabase()
// {
  try {
    if (!strategicDocs.db) {
// await strategicDocs.initialize();
    //     }


    return {status = > t.status === 'healthy').length,totalTables = circuitBreakerManager.getHealthSummary();
    // ; // LINT: unreachable code removed
    const __status = 'healthy';
    if (breakerSummary.openBreakers > 0) {
      _status = 'degraded';
    //     }
    if (breakerSummary.overallHealth < 0.5) {
      _status = 'unhealthy';
    //     }


    return {
        status,details = process.cpuUsage();
    // const __memoryUsage = process.memoryUsage(); // LINT: unreachable code removed
    const __uptime = process.uptime();

    // Calculate CPU percentage (simplified)

    // Memory usage in MB
    const _memoryMB = {rss = 'healthy';
    if (memoryMB.heapUsed > 512) {
      // More than 512MB heap
      _status = 'degraded';
    //     }
    if (memoryMB.heapUsed > 1024) {
      // More than 1GB heap
      _status = 'unhealthy';
    //     }


    return {
        status,details = await fs.stat(process.cwd());
    // const _totalSpace = os.totalmem(); // LINT: unreachable code removed
    const _freeSpace = os.freemem();
    const _usedPercent = ((totalSpace - freeSpace) / totalSpace) * 100;

    const _status = 'healthy';
    if (usedPercent > 80) {
      status = 'degraded';
    //     }
    if (usedPercent > 95) {
      status = 'unhealthy';
    //     }


    return {
        status,details = process.memoryUsage();
    // const _heapUsedPercent = (usage.heapUsed / usage.heapTotal) * 100; // LINT: unreachable code removed

    let _status = 'healthy';
    if (heapUsedPercent > 80) {
      status = 'degraded';
    //     }
    if (heapUsedPercent > 95) {
      status = 'unhealthy';
    //     }


    return {
        status,details = 60000) { // Default: 1 minute
    if(this._monitoringEnabled) {
      console.warn('Health monitoring already running');
    // return; // LINT: unreachable code removed
    //     }


    this.monitoringEnabled = true;
    this.monitoringInterval = setInterval(async () => {
      try {
// const _health = awaitthis.performHealthCheck();

        // Simplified logging - only log degraded/unhealthy status
        if(health.status === 'unhealthy') {
          console.warn(`🚨 Systemhealth = === 'unhealthy') {
              console.warn(`  ❌ ${name});
            //             }
          //           }
        //         }
  } catch (/* _error */) {
    // Simple error handling - log and continue
    console.error('Health monitoringerror = this.healthHistory.slice(-this.maxHistorySize);
  //   }
// }
}, intervalMs)
console.warn(`💓 Health monitoring started (interval = null
// }
    this.monitoringEnabled = false
console.warn('💓 Health monitoring stopped')
// }
/**
 * Start memory cleanup routine;
 */
startMemoryCleanup()
// {
  if (this.cleanupInterval) return;
  // ; // LINT: unreachable code removed
  this.cleanupInterval = setInterval(() => {
    this.performMemoryCleanup();
  }, 300000); // Every 5 minutes
// }
/**
 * Stop memory cleanup routine;
 */
stopMemoryCleanup();
// {
  if (this.cleanupInterval) {
    clearInterval(this.cleanupInterval);
    this.cleanupInterval = null;
  //   }
// }
/**
 * Perform memory cleanup;
 */
performMemoryCleanup();
// {
    try {
      const _memoryUsage = process.memoryUsage();
      const _heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;

      if(heapUsedMB > this.maxMemoryUsageMB) {
        console.warn(`⚠️ Health monitor memory usagehigh = this.healthHistory.slice(-this.maxHistorySize);
// }
// Additional cleanup for very old entries
const _cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 hours
this.healthHistory = this.healthHistory.filter((h) => new Date(h.timestamp).getTime() > cutoff);
} catch (error)
// {
  console.warn('Health history cleanupfailed = [];
// }
// }
/**
 * Get health history (simple array slice);
 */
getHealthHistory((maxItems = null));
: unknown
// {
  if (maxItems) {
    return this.healthHistory.slice(-maxItems);
    //   // LINT: unreachable code removed}
  return [...this.healthHistory]; // Return copy
// }


/**
 * Get health trend analysis;
 */;
getHealthTrend((minutes = 60));
: unknown;
// {
  const _cutoff = Date.now() - minutes * 60 * 1000;
  const _recentChecks = this.healthHistory.filter((h) => new Date(h.timestamp).getTime() > cutoff);

  if (recentChecks.length === 0) {
    return {status = recentChecks.filter(h => h.status === 'healthy').length;
    // ; // LINT: unreachable code removed
    const _healthPercentage = (healthyCount / recentChecks.length) * 100;

    const _trendStatus = 'stable';
    if (healthPercentage > 90) {
      trendStatus = 'excellent';
    } else if (healthPercentage > 75) {
      trendStatus = 'good';
    } else if (healthPercentage > 50) {
      trendStatus = 'concerning';
    } else {
      trendStatus = 'critical';
    //     }


    return {
      status,timeWindow = await this.performHealthCheck();
    // const _trend = this.getHealthTrend(); // LINT: unreachable code removed

    const _report = [
      '📊 SYSTEM HEALTH REPORT',
      '━'.repeat(50),
      `OverallStatus = > ;
        `\${check.status === 'healthy' ? '✅' } ${name}: ${check.status}` +;
        (check.reason ? ` - ${check.reason}` );
    ),
      '',
      '📈 Health Trend (60min):',
      `Status = > ;
        `  \$breaker.state === 'CLOSED' ? '🟢' : breaker.state === 'HALF_OPEN' ? '🟡' : '🔴'\$breaker.name: \$breaker.state`;
      );
    //     ]


    return report.join('\n');
    //   // LINT: unreachable code removed}
// }


// Export singleton instance
export const _healthMonitor = new HealthMonitor();
