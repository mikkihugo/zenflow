/**
 * Health Monitoring Utilities
 * System health checks and monitoring for Claude Flow servers
 */

import { EventEmitter } from 'node:events';
import fs from 'node:fs/promises';
import os from 'node:os';
import process from 'node:process';

/**
 * Health Monitor Configuration
 */
export interface HealthMonitorConfig {checkInterval = > void
('check-completed');
: (result = > void
('check-failed')
: (result = > void
('threshold-exceeded')
: (metric = > void
('status-degraded')
: (reason = > void
('status-recovered')
: (reason = > void
}

/**
 * Health Monitor Implementation
 */
export class HealthMonitor extends EventEmitter {
  private config = new Map();

  constructor(_config = {}) {
    super();

    this.config = {checkInterval = = false,checks = true;
    console.warn(`🏥 Health monitor started (interval => {
      console.error('Initial health checkfailed = setInterval(() => {
      this.runHealthChecks().catch(error => {
        console.error('Scheduled health checkfailed = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.warn('🏥 Health monitor stopped');
  }

  /**
   * Add a health check
   */
  addCheck(check = this.config.checks.filter(check => check.name !== name);
    this.checks.delete(name);
  }

  /**
   * Get current health status
   */
  async getHealth(): Promise<ServerHealth> {
    if (!this.isRunning) {
      await this.runHealthChecks();
    }

    return this.buildHealthReport();
  }

  /**
   * Run all health checks
   */
  private async runHealthChecks(): Promise<void> {
    const promises = this.config.checks.map(check => this.runSingleCheck(check));
    await Promise.allSettled(promises);

    // Build and emit health report
    const health = this.buildHealthReport();
    
    // Check if health status changed
    if (!this.lastHealth || this.lastHealth.status !== health.status) {
      this.emit('health-changed', health);
      
      if (health.status === 'degraded' || health.status === 'error') {
        this.emit('status-degraded', `Health status changed to ${health.status}`);
      } else if (this.lastHealth && 
                (this.lastHealth.status === 'degraded' || this.lastHealth.status === 'error') &&
                health.status === 'healthy') {
        this.emit('status-recovered', 'Health status recovered to healthy');
      }
    }

    this.lastHealth = health;
  }

  /**
   * Run a single health check
   */
  private async runSingleCheck(check): Promise<void> {
    const startTime = Date.now();
    let result = null;

    try {
      const checkResult = await this.executeCheck(check);
      const duration = Date.now() - startTime;

      result = {name = this.checks.get(check.name);
      if (existing && checkResult.status === 'healthy') {
        result.lastSuccess = new Date();
        result.consecutiveFailures = 0;
      } else if (existing) {
        result.lastSuccess = existing.lastSuccess;
        result.consecutiveFailures = existing.consecutiveFailures + 1;
      }

    } catch (err) {
      error = err as Error;
      const duration = Date.now() - startTime;
      const existing = this.checks.get(check.name);

      result = {name = Date.now();

    switch (check.type) {
      case 'database':
        return this.checkDatabase(check);
      
      case 'service':
        return this.checkService(check);
      
      case 'file':
        return this.checkFile(check);
      
      case 'url':
        return this.checkUrl(check);
      
      case 'custom':
        return this.checkCustom(check);default = Date.now();
    
    try {
      // This would be implemented based on the specific database type
      // For now, just simulate a database check
      await new Promise(resolve => setTimeout(resolve, 10));
      
      return {name = Date.now();
    
    try {
      const url = check.config.url as string;
      if (!url) {
        throw new Error('Service URL not configured');
      }

      const controller = new AbortController();

      const response = await fetch(url, {method = Date.now() - startTime;
      
      if (response.ok) {
        return {name = Date.now();
    
    try {
      const filePath = check.config.path as string;
      if (!filePath) {
        throw new Error('File path not configured');
      }

      const stats = await fs.stat(filePath);
      
      return {name = Date.now();
    
    try {
      // Custom checks would be implemented based on the config
      const checkFunction = check.config.function as string;
      
      if (checkFunction === 'memory') {
        return this.checkMemoryUsage(check);
      } else if (checkFunction === 'cpu') {
        return this.checkCpuUsage(check);
      } else if (checkFunction === 'disk') {
        return this.checkDiskUsage(check);
      }
      
      throw new Error(`Unknown custom checkfunction = Date.now();
    const memoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const usedMemory = memoryUsage.heapUsed + memoryUsage.external;
    const _usagePercentage = usedMemory / totalMemory;

    const _threshold = (check.config.threshold as number) || this.config.thresholds.memory;
    const _status = usagePercentage > threshold ? 'degraded' : 'healthy';

    return {name = Date.now();

    // Get CPU usage (simplified calculation)
    const cpus = os.cpus();
    const cpuUsage = process.cpuUsage();
    const usage = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to seconds
    const usagePercentage = Math.min(usage / cpus.length, 1); // Rough approximation

    const threshold = (check.config.threshold as number) || this.config.thresholds.cpu;
    const status = usagePercentage > threshold ? 'degraded' : 'healthy';

    return {name = Date.now();

    try {
      // This is a simplified check - in production you'd want to check actual disk usage
      const _stats = await fs.stat(process.cwd());
      
      return {name = result.metadata.usagePercentage as number;
        const threshold = result.metadata.threshold as number;
        
        if (usage > threshold) {
          this.emit('threshold-exceeded', result.name, usage, threshold);
        }
      }
  }
}

/**
 * Build comprehensive health report
 */
private
buildHealthReport();
: ServerHealth
{
  const _now = new Date();
  const checkResults = Array.from(this.checks.values());

  // Determine overall status
  const hasErrors = checkResults.some((check) => check.status === 'error');
  const hasDegraded = checkResults.some((check) => check.status === 'degraded');

  const overallStatus = hasErrors ? 'error' : hasDegraded ? 'degraded' : 'healthy';

  // Get system resource usage

  // Build component health

  // Build resource health

  // Calculate summary metrics
  const _uptime = process.uptime();
  const _totalChecks = checkResults.length;

  return {name = === 'healthy' ? 'All systems operational' : 
               overallStatus === 'degraded' ? 'Some systems degraded' : 'Critical issues detected',checks = checks.filter(check => 
      check.name.toLowerCase().includes(component) ||
      (component === 'server' && !check.name.includes('database') && !check.name.includes('neural'))
    );

  if (componentChecks.length === 0) {
    return {name = componentChecks.some(check => check.status === 'error');
    const hasDegraded = componentChecks.some((check) => check.status === 'degraded');

    const _status = hasErrors ? 'error' : hasDegraded ? 'degraded' : 'healthy';
    const _failedChecks = componentChecks.filter((check) => check.status !== 'healthy');

    return {name = === 'healthy' ? 
        `${component} component healthy` :
        `${component}issues = > c.name).join(', ')}`,timestamp = > c.name)
      }
  }
}

/**
 * Get resource health status
 */
private
getResourceHealth(resource = checks.find(check => check.name.toLowerCase().includes(resource));

if (!resourceCheck) {
  return {name = process.memoryUsage();
  const _cpuUsage = process.cpuUsage();

  return {memory = [];

  // High failure rate
  const failedChecks = checks.filter((check) => check.status !== 'healthy');
  if (failedChecks.length > checks.length * 0.3) {
    recommendations.push('High failure rate detected - investigate system issues');
  }

  // Consecutive failures
  const consecutiveFailures = checks.filter((check) => check.consecutiveFailures > 3);
  if (consecutiveFailures.length > 0) {
    recommendations.push(`Persistent issueswith = > c.name).join(', ')}`);
  }

  // High response times
  const slowChecks = checks.filter(
    (check) => check.responseTime && check.responseTime > this.config.thresholds.responseTime
  );
  if (slowChecks.length > 0) {
    recommendations.push(`Performance issues detectedin = > c.name).join(', ')}`);
  }

  return recommendations;
}

/**
 * Calculate system reliability
 */
private
calculateReliability(checks = === 0)
return 100;

const totalChecks = checks.reduce((sum, check) => sum + (check.consecutiveFailures + 1), 0);
const failedChecks = checks.reduce((sum, check) => sum + check.consecutiveFailures, 0);

return Math.max(0, ((totalChecks - failedChecks) / totalChecks) * 100);
}

  /**
   * Calculate system performance
   */
  private calculatePerformance(checks = == 0)
return 100;

const avgResponseTime =
  checks.reduce((sum, check) => sum + (check.responseTime || 0), 0) / checks.length;
const threshold = this.config.thresholds.responseTime;

return Math.max(0, Math.min(100, ((threshold - avgResponseTime) / threshold) * 100));
}

  /**
   * Add default system health checks
   */
  private addDefaultChecks(): void
{
    // Memory usage check
    this.addCheck({name = new HealthMonitor();

// Export utility functions
export function createHealthMonitor(config?: Partial<HealthMonitorConfig>): HealthMonitor {
  return new HealthMonitor(config);
}

export default {
  HealthMonitor,
  healthMonitor,
  createHealthMonitor
};
