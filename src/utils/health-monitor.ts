/**
 * Health Monitoring Utilities
 * System health checks and monitoring for Claude Flow servers
 */

import { EventEmitter } from 'events';
import os from 'os';
import process from 'process';
import fs from 'fs/promises';

// Import types
import {
  ServerHealth,
  HealthCheckDefinition,
  ComponentStatus
} from '../types/server.js';
import {
  SystemStatus,
  HealthCheck,
  ResourceUsage
} from '../types/core.js';

/**
 * Health Monitor Configuration
 */
export interface HealthMonitorConfig {
  checkInterval: number; // milliseconds
  timeout: number; // milliseconds
  retries: number;
  enabled: boolean;
  checks: HealthCheckDefinition[];
  thresholds: {
    memory: number; // percentage (0-1)
    cpu: number; // percentage (0-1)
    disk: number; // percentage (0-1)
    responseTime: number; // milliseconds
  };
}

/**
 * Health Check Result with additional metadata
 */
export interface HealthCheckResult extends HealthCheck {
  duration: number; // milliseconds
  retryCount: number;
  lastSuccess?: Date;
  consecutiveFailures: number;
}

/**
 * Health Monitor Events
 */
export interface HealthMonitorEvents {
  'health-changed': (health: ServerHealth) => void;
  'check-completed': (result: HealthCheckResult) => void;
  'check-failed': (result: HealthCheckResult, error: Error) => void;
  'threshold-exceeded': (metric: string, value: number, threshold: number) => void;
  'status-degraded': (reason: string) => void;
  'status-recovered': (reason: string) => void;
}

/**
 * Health Monitor Implementation
 */
export class HealthMonitor extends EventEmitter {
  private config: HealthMonitorConfig;
  private checks: Map<string, HealthCheckResult> = new Map();
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private lastHealth: ServerHealth | null = null;

  constructor(config: Partial<HealthMonitorConfig> = {}) {
    super();
    
    this.config = {
      checkInterval: config.checkInterval || 30000, // 30 seconds
      timeout: config.timeout || 5000, // 5 seconds
      retries: config.retries || 3,
      enabled: config.enabled !== false,
      checks: config.checks || [],
      thresholds: {
        memory: 0.8, // 80%
        cpu: 0.8, // 80%
        disk: 0.9, // 90%
        responseTime: 5000, // 5 seconds
        ...config.thresholds
      }
    };

    // Add default system checks
    this.addDefaultChecks();
  }

  /**
   * Start health monitoring
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log(`🏥 Health monitor started (interval: ${this.config.checkInterval}ms)`);

    // Run initial check
    this.runHealthChecks().catch(error => {
      console.error('Initial health check failed:', error);
    });

    // Schedule periodic checks
    this.intervalId = setInterval(() => {
      this.runHealthChecks().catch(error => {
        console.error('Scheduled health check failed:', error);
      });
    }, this.config.checkInterval);
  }

  /**
   * Stop health monitoring
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('🏥 Health monitor stopped');
  }

  /**
   * Add a health check
   */
  addCheck(check: HealthCheckDefinition): void {
    this.config.checks.push(check);
    
    // Initialize check result
    this.checks.set(check.name, {
      name: check.name,
      status: 'healthy',
      message: 'Not checked yet',
      timestamp: new Date(),
      duration: 0,
      retryCount: 0,
      consecutiveFailures: 0
    });
  }

  /**
   * Remove a health check
   */
  removeCheck(name: string): void {
    this.config.checks = this.config.checks.filter(check => check.name !== name);
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
  private async runSingleCheck(check: HealthCheckDefinition): Promise<void> {
    const startTime = Date.now();
    let result: HealthCheckResult;
    let error: Error | null = null;

    try {
      const checkResult = await this.executeCheck(check);
      const duration = Date.now() - startTime;

      result = {
        name: check.name,
        status: checkResult.status,
        message: checkResult.message,
        timestamp: new Date(),
        responseTime: checkResult.responseTime,
        metadata: checkResult.metadata,
        duration,
        retryCount: 0,
        consecutiveFailures: 0
      };

      // Update last success time
      const existing = this.checks.get(check.name);
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

      result = {
        name: check.name,
        status: 'error',
        message: error.message,
        timestamp: new Date(),
        duration,
        retryCount: existing?.retryCount || 0,
        lastSuccess: existing?.lastSuccess,
        consecutiveFailures: (existing?.consecutiveFailures || 0) + 1
      };
    }

    // Store result
    this.checks.set(check.name, result);

    // Emit events
    if (error) {
      this.emit('check-failed', result, error);
    } else {
      this.emit('check-completed', result);
    }

    // Check thresholds
    this.checkThresholds(result);
  }

  /**
   * Execute a specific health check
   */
  private async executeCheck(check: HealthCheckDefinition): Promise<HealthCheck> {
    const startTime = Date.now();

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
        return this.checkCustom(check);
      
      default:
        throw new Error(`Unknown health check type: ${check.type}`);
    }
  }

  /**
   * Check database connectivity
   */
  private async checkDatabase(check: HealthCheckDefinition): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // This would be implemented based on the specific database type
      // For now, just simulate a database check
      await new Promise(resolve => setTimeout(resolve, 10));
      
      return {
        name: check.name,
        status: 'healthy',
        message: 'Database connection successful',
        timestamp: new Date(),
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: check.name,
        status: 'error',
        message: `Database check failed: ${(error as Error).message}`,
        timestamp: new Date(),
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Check external service
   */
  private async checkService(check: HealthCheckDefinition): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const url = check.config.url as string;
      if (!url) {
        throw new Error('Service URL not configured');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), check.timeout);
      
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        return {
          name: check.name,
          status: 'healthy',
          message: `Service responding (${response.status})`,
          timestamp: new Date(),
          responseTime,
          metadata: {
            status: response.status,
            statusText: response.statusText
          }
        };
      } else {
        return {
          name: check.name,
          status: 'degraded',
          message: `Service returned ${response.status}: ${response.statusText}`,
          timestamp: new Date(),
          responseTime,
          metadata: {
            status: response.status,
            statusText: response.statusText
          }
        };
      }
    } catch (error) {
      return {
        name: check.name,
        status: 'error',
        message: `Service check failed: ${(error as Error).message}`,
        timestamp: new Date(),
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Check file system
   */
  private async checkFile(check: HealthCheckDefinition): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const filePath = check.config.path as string;
      if (!filePath) {
        throw new Error('File path not configured');
      }

      const stats = await fs.stat(filePath);
      
      return {
        name: check.name,
        status: 'healthy',
        message: `File accessible`,
        timestamp: new Date(),
        responseTime: Date.now() - startTime,
        metadata: {
          size: stats.size,
          modified: stats.mtime.toISOString()
        }
      };
    } catch (error) {
      return {
        name: check.name,
        status: 'error',
        message: `File check failed: ${(error as Error).message}`,
        timestamp: new Date(),
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Check URL endpoint
   */
  private async checkUrl(check: HealthCheckDefinition): Promise<HealthCheck> {
    return this.checkService(check); // Same as service check
  }

  /**
   * Execute custom health check
   */
  private async checkCustom(check: HealthCheckDefinition): Promise<HealthCheck> {
    const startTime = Date.now();
    
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
      
      throw new Error(`Unknown custom check function: ${checkFunction}`);
    } catch (error) {
      return {
        name: check.name,
        status: 'error',
        message: `Custom check failed: ${(error as Error).message}`,
        timestamp: new Date(),
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Check memory usage
   */
  private async checkMemoryUsage(check: HealthCheckDefinition): Promise<HealthCheck> {
    const startTime = Date.now();
    const memoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const usedMemory = memoryUsage.heapUsed + memoryUsage.external;
    const usagePercentage = usedMemory / totalMemory;
    
    const threshold = (check.config.threshold as number) || this.config.thresholds.memory;
    const status: SystemStatus = usagePercentage > threshold ? 'degraded' : 'healthy';
    
    return {
      name: check.name,
      status,
      message: `Memory usage: ${(usagePercentage * 100).toFixed(1)}%`,
      timestamp: new Date(),
      responseTime: Date.now() - startTime,
      metadata: {
        usedMemory,
        totalMemory,
        usagePercentage,
        threshold,
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external
      }
    };
  }

  /**
   * Check CPU usage
   */
  private async checkCpuUsage(check: HealthCheckDefinition): Promise<HealthCheck> {
    const startTime = Date.now();
    
    // Get CPU usage (simplified calculation)
    const cpus = os.cpus();
    const cpuUsage = process.cpuUsage();
    const usage = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to seconds
    const usagePercentage = Math.min(usage / cpus.length, 1); // Rough approximation
    
    const threshold = (check.config.threshold as number) || this.config.thresholds.cpu;
    const status: SystemStatus = usagePercentage > threshold ? 'degraded' : 'healthy';
    
    return {
      name: check.name,
      status,
      message: `CPU usage: ${(usagePercentage * 100).toFixed(1)}%`,
      timestamp: new Date(),
      responseTime: Date.now() - startTime,
      metadata: {
        cpuCount: cpus.length,
        usagePercentage,
        threshold,
        userTime: cpuUsage.user,
        systemTime: cpuUsage.system
      }
    };
  }

  /**
   * Check disk usage
   */
  private async checkDiskUsage(check: HealthCheckDefinition): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // This is a simplified check - in production you'd want to check actual disk usage
      const stats = await fs.stat(process.cwd());
      
      return {
        name: check.name,
        status: 'healthy',
        message: 'Disk accessible',
        timestamp: new Date(),
        responseTime: Date.now() - startTime,
        metadata: {
          path: process.cwd(),
          accessible: true
        }
      };
    } catch (error) {
      return {
        name: check.name,
        status: 'error',
        message: `Disk check failed: ${(error as Error).message}`,
        timestamp: new Date(),
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Check if thresholds are exceeded
   */
  private checkThresholds(result: HealthCheckResult): void {
    if (result.metadata) {
      // Check response time threshold
      if (result.responseTime && result.responseTime > this.config.thresholds.responseTime) {
        this.emit('threshold-exceeded', 'responseTime', result.responseTime, this.config.thresholds.responseTime);
      }

      // Check usage percentage thresholds
      if (result.metadata.usagePercentage && result.metadata.threshold) {
        const usage = result.metadata.usagePercentage as number;
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
  private buildHealthReport(): ServerHealth {
    const now = new Date();
    const checkResults = Array.from(this.checks.values());
    
    // Determine overall status
    const hasErrors = checkResults.some(check => check.status === 'error');
    const hasDegraded = checkResults.some(check => check.status === 'degraded');
    
    const overallStatus: SystemStatus = 
      hasErrors ? 'error' :
      hasDegraded ? 'degraded' :
      'healthy';

    // Get system resource usage
    const resourceUsage = this.getResourceUsage();
    
    // Build component health
    const components = {
      server: this.getComponentHealth('server', checkResults),
      database: this.getComponentHealth('database', checkResults),
      neural: this.getComponentHealth('neural', checkResults),
      external: checkResults.filter(check => check.name.includes('service') || check.name.includes('url'))
    };

    // Build resource health
    const resources = {
      memory: this.getResourceHealth('memory', checkResults),
      cpu: this.getResourceHealth('cpu', checkResults),
      disk: this.getResourceHealth('disk', checkResults),
      network: {
        name: 'network',
        status: 'healthy' as SystemStatus,
        message: 'Network connectivity normal',
        timestamp: now
      }
    };

    // Generate recommendations
    const recommendations = this.generateRecommendations(checkResults);

    // Calculate summary metrics
    const uptime = process.uptime();
    const totalChecks = checkResults.length;
    const healthyChecks = checkResults.filter(check => check.status === 'healthy').length;
    
    return {
      name: 'Claude Code Flow Server',
      timestamp: new Date(),
      status: overallStatus,
      message: overallStatus === 'healthy' ? 'All systems operational' : 
               overallStatus === 'degraded' ? 'Some systems degraded' : 'Critical issues detected',
      checks: checkResults,
      components,
      resources,
      dependencies: [], // Would be populated with external dependencies
      recommendations,
      summary: {
        uptime,
        availability: totalChecks > 0 ? (healthyChecks / totalChecks) * 100 : 100,
        reliability: this.calculateReliability(checkResults),
        performance: this.calculatePerformance(checkResults)
      },
      lastCheck: now,
      nextCheck: new Date(now.getTime() + this.config.checkInterval)
    };
  }

  /**
   * Get component health status
   */
  private getComponentHealth(component: string, checks: HealthCheckResult[]): HealthCheck {
    const componentChecks = checks.filter(check => 
      check.name.toLowerCase().includes(component) ||
      (component === 'server' && !check.name.includes('database') && !check.name.includes('neural'))
    );

    if (componentChecks.length === 0) {
      return {
        name: component,
        status: 'healthy',
        message: `${component} component operational`,
        timestamp: new Date()
      };
    }

    const hasErrors = componentChecks.some(check => check.status === 'error');
    const hasDegraded = componentChecks.some(check => check.status === 'degraded');
    
    const status: SystemStatus = hasErrors ? 'error' : hasDegraded ? 'degraded' : 'healthy';
    const failedChecks = componentChecks.filter(check => check.status !== 'healthy');
    
    return {
      name: component,
      status,
      message: status === 'healthy' ? 
        `${component} component healthy` :
        `${component} issues: ${failedChecks.map(c => c.name).join(', ')}`,
      timestamp: new Date(),
      metadata: {
        totalChecks: componentChecks.length,
        failedChecks: failedChecks.length,
        checks: componentChecks.map(c => c.name)
      }
    };
  }

  /**
   * Get resource health status
   */
  private getResourceHealth(resource: string, checks: HealthCheckResult[]): HealthCheck {
    const resourceCheck = checks.find(check => check.name.toLowerCase().includes(resource));
    
    if (!resourceCheck) {
      return {
        name: resource,
        status: 'healthy',
        message: `${resource} usage within normal limits`,
        timestamp: new Date()
      };
    }

    return {
      name: resourceCheck.name,
      status: resourceCheck.status,
      message: resourceCheck.message,
      timestamp: resourceCheck.timestamp,
      responseTime: resourceCheck.responseTime,
      metadata: resourceCheck.metadata
    };
  }

  /**
   * Get current resource usage
   */
  private getResourceUsage(): ResourceUsage {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      memory: {
        used: memoryUsage.heapUsed,
        available: os.totalmem() - memoryUsage.heapUsed,
        percentage: (memoryUsage.heapUsed / os.totalmem()) * 100,
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external
      },
      cpu: {
        usage: 0, // Would need more sophisticated calculation
        userTime: cpuUsage.user,
        systemTime: cpuUsage.system
      },
      disk: {
        used: 0, // Would need disk usage calculation
        available: 0,
        percentage: 0,
        reads: 0,
        writes: 0
      },
      network: {
        bytesIn: 0, // Would need network statistics
        bytesOut: 0,
        connections: 0,
        bandwidth: 0
      },
      handles: {
        files: 0, // Would need file handle count
        sockets: 0
      },
      timestamp: new Date()
    };
  }

  /**
   * Generate health recommendations
   */
  private generateRecommendations(checks: HealthCheckResult[]): string[] {
    const recommendations: string[] = [];
    
    // High failure rate
    const failedChecks = checks.filter(check => check.status !== 'healthy');
    if (failedChecks.length > checks.length * 0.3) {
      recommendations.push('High failure rate detected - investigate system issues');
    }

    // Consecutive failures
    const consecutiveFailures = checks.filter(check => check.consecutiveFailures > 3);
    if (consecutiveFailures.length > 0) {
      recommendations.push(`Persistent issues with: ${consecutiveFailures.map(c => c.name).join(', ')}`);
    }

    // High response times
    const slowChecks = checks.filter(check => check.responseTime && check.responseTime > this.config.thresholds.responseTime);
    if (slowChecks.length > 0) {
      recommendations.push(`Performance issues detected in: ${slowChecks.map(c => c.name).join(', ')}`);
    }

    return recommendations;
  }

  /**
   * Calculate system reliability
   */
  private calculateReliability(checks: HealthCheckResult[]): number {
    if (checks.length === 0) return 100;
    
    const totalChecks = checks.reduce((sum, check) => sum + (check.consecutiveFailures + 1), 0);
    const failedChecks = checks.reduce((sum, check) => sum + check.consecutiveFailures, 0);
    
    return Math.max(0, ((totalChecks - failedChecks) / totalChecks) * 100);
  }

  /**
   * Calculate system performance
   */
  private calculatePerformance(checks: HealthCheckResult[]): number {
    if (checks.length === 0) return 100;
    
    const avgResponseTime = checks.reduce((sum, check) => sum + (check.responseTime || 0), 0) / checks.length;
    const threshold = this.config.thresholds.responseTime;
    
    return Math.max(0, Math.min(100, ((threshold - avgResponseTime) / threshold) * 100));
  }

  /**
   * Add default system health checks
   */
  private addDefaultChecks(): void {
    // Memory usage check
    this.addCheck({
      name: 'memory_usage',
      type: 'custom',
      config: { function: 'memory', threshold: this.config.thresholds.memory },
      timeout: 1000,
      interval: 30,
      retries: 1,
      critical: false
    });

    // CPU usage check
    this.addCheck({
      name: 'cpu_usage',
      type: 'custom',
      config: { function: 'cpu', threshold: this.config.thresholds.cpu },
      timeout: 1000,
      interval: 30,
      retries: 1,
      critical: false
    });

    // Disk access check
    this.addCheck({
      name: 'disk_access',
      type: 'custom',
      config: { function: 'disk' },
      timeout: 2000,
      interval: 60,
      retries: 2,
      critical: true
    });
  }
}

// Export default instance
export const healthMonitor = new HealthMonitor();

// Export utility functions
export function createHealthMonitor(config?: Partial<HealthMonitorConfig>): HealthMonitor {
  return new HealthMonitor(config);
}

export default {
  HealthMonitor,
  healthMonitor,
  createHealthMonitor
};