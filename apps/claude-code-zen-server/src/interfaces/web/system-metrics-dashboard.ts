/**
 * @file Interface implementation: system-metrics-dashboard.
 */

import { getLogger, TypedEventBase } from '@claude-zen/foundation';

/** Unified Performance Dashboard */
/** Real-time monitoring and analytics for Claude Zen systems */

// URL builders - using direct URL construction since url-builder module doesn't exist
// import { getMCPServerURL, getWebDashboardURL } from '@claude-zen/foundation';
import {
  createRepository,
  DatabaseTypes,
  EntityTypes,
} from '@claude-zen/infrastructure';
import type { Repository } from '@claude-zen/intelligence';

// Import UACL for unified client management
import type EnhancedMemory from './../memory/memory');
import { UACLHelpers, uacl } from './clients/index';

const logger = getLogger('interfaces-web-system-metrics-dashboard');

// MCP performance metrics - using generic type since module doesn't exist
// import type MCPPerformanceMetrics from './mcp/performance-metrics');
type MCPPerformanceMetrics = any;

interface DashboardConfig {
  refreshInterval?: number;
  enableRealtime?: boolean;
  maxDataPoints?: number;
  alertThresholds?: {
    latency?: number;
    errorRate?: number;
    memoryUsage?: number;
  };
}

interface SystemHealth {
  overall: 'healthy'' | ''warning'' | ''critical');
  components: {
    mcp: 'healthy'' | ''warning'' | ''critical');
    memory: 'healthy'' | ''warning'' | ''critical');
    database: 'healthy'' | ''warning'' | ''critical');
    neural: 'healthy'' | ''warning'' | ''critical');
    clients: 'healthy'' | ''warning'' | ''critical'); // Added UACL client health
  };
  alerts: Array<{
    level: 'info'' | ''warning'' | ''error');
    component: string;
    message: string;
    timestamp: number;
  }>;
}

export class UnifiedPerformanceDashboard extends TypedEventBase {
  private mcpMetrics: MCPPerformanceMetrics;
  private enhancedMemory: EnhancedMemory;
  private vectorRepository?: Repository<any>;
  private configuration: Required<DashboardConfig>;
  private refreshTimer?: NodeJS.Timeout;
  private isRunning = false;

  constructor(
    mcpMetrics: MCPPerformanceMetrics,
    enhancedMemory: EnhancedMemory,
    config: DashboardConfig = {}
  ) {
    super();

    this.mcpMetrics = mcpMetrics;
    this.enhancedMemory = enhancedMemory;

    this.configuration = {
      refreshInterval: config?.refreshInterval ?? 1000,
      enableRealtime: config?.enableRealtime ?? true,
      maxDataPoints: config?.maxDataPoints ?? 1000,
      alertThresholds: {
        latency: config?.alertThresholds?.latency ?? 1000,
        errorRate: config?.alertThresholds?.errorRate ?? .05,
        memoryUsage: config?.alertThresholds?.memoryUsage ?? 100 * 1024 * 1024,
        ...config?.alertThresholds,
      },
    };
  }

  /** Start the dashboard monitoring */
  async start(): Promise<void> {
    if (this.isRunning) return;

    // Initialize UACL if not already initialized
    try {
      if (!uacl?.isInitialized) {
        await uacl.initialize({
          healthCheckInterval: this.configuration.refreshInterval,
        });

        // Setup default clients for monitoring
        const defaultHttpURL = 'http://localhost:8951');
        const defaultWsURL = 'ws://localhost:8952');
        await UACLHelpers.setupCommonClients({
          httpBaseURL: defaultHttpURL,
          websocketURL: defaultWsURL,
        });
      }
    } catch (error) {
      logger.warn('⚠️ Could not initialize UACL for dashboard:', error);
    }

    // Initialize DAL repositories for database metrics
    try {
      this.vectorRepository = await createRepository(
        EntityTypes.VectorDocument,
        DatabaseTypes?.LanceDB,
        {
          database: "./data/dashboard-metrics',
          options: { vectorSize: 384, metricType: 'cosine' },
        }
      );

      // Vector DAO removed since createDAO doesn't exist in interfaces
      // this.vectorDAO = await createDAO(EntityTypes.VectorDocument, DatabaseTypes?.LanceDB, {
      //   database: "./data/dashboard-metrics',
      //   options: { vectorSize: 384 },
      // });
    } catch (error) {
      logger.warn(
        '⚠️ Could not initialize database metrics repository:',
        error
      );
    }

    if (this.configuration.enableRealtime) {
      this.refreshTimer = setInterval(() => {
        this.updateDashboard;
      }, this.configuration.refreshInterval);
    }

    this.isRunning = true;
    this.emit('started', {});
    this.displayInitialStatus;
  }

  /** Stop the dashboard monitoring */
  async stop(): Promise<void> {
    if (!this.isRunning) return;

    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = undefined as any;
    }

    this.isRunning = false;
    this.emit('stopped', {});
  }

  /** Get comprehensive system status */
  async getSystemStatus(): Promise<{
    health: SystemHealth;
    metrics: {
      mcp: any;
      memory: any;
      database: any;
      neural: any;
      clients: any; // Added UACL client metrics.
    };
    performance: {
      uptime: number;
      totalOperations: number;
      systemLoad: number;
      memoryUsage: number;
    };
  }> {
    const mcpMetrics = this.mcpMetrics?.getMetrics()
    const mcpSummary = this.mcpMetrics?.getPerformanceSummary()
    const memoryStats = this.enhancedMemory?.getStats()
    const dbStats = await this.getDatabaseStats;

    // Get UACL client metrics
    const clientMetrics = await this.getClientMetrics;

    const health = this.assessSystemHealth(
      mcpMetrics,
      memoryStats,
      dbStats,
      clientMetrics
    );

    return {
      health,
      metrics: {
        mcp: mcpMetrics,
        memory: memoryStats,
        database: dbStats,
        neural: mcpMetrics.neural,
        clients: clientMetrics,
      },
      performance: {
        uptime: mcpSummary.uptime,
        totalOperations: mcpSummary.totalOperations,
        systemLoad: this.getSystemLoad,
        memoryUsage: process?.memoryUsage.heapUsed,
      },
    };
  }

  /**
   * Assess overall system health.
   *
   * @param mcpMetrics
   * @param memoryStats
   * @param dbStats
   * @param clientMetrics
   */
  private assessSystemHealth(
    mcpMetrics: any,
    memoryStats: any,
    dbStats: any,
    clientMetrics?: any
  ): SystemHealth {
    const alerts: SystemHealth['alerts'] = [];

    // Check MCP health
    const mcpErrorRate =
      mcpMetrics.requests.failed / Math.max(1, mcpMetrics.requests.total);
    const mcpHealth = this.assessComponentHealth(
      mcpMetrics.requests.averageLatency,
      mcpErrorRate,
      'mcp'
    );

    if (mcpHealth !== 'healthy') {
      alerts.push({
        level: mcpHealth === 'warning ? warning' : 'error',
        component: 'MCP',
        message: `High latency (${mcpMetrics.requests.averageLatency}ms) or error rate (${(mcpErrorRate * 100).toFixed(1)}%)`,
        timestamp: Date.now(),
      });
    }

    // Check memory health
    const memoryHealth = this.assessComponentHealth(
      0, // No latency for memory
      0, // No error rate for memory
      'memory',
      memoryStats.totalSize
    );

    if (memoryHealth !== 'healthy') {
      alerts.push({
        level: 'warning',
        component: 'Memory',
        message: `High memory usage: ${Math.round(memoryStats.totalSize / 1024 / 1024)}MB`,
        timestamp: Date.now(),
      });
    }

    // Check database health
    const dbHealth = this.assessComponentHealth(
      dbStats.averageSearchTime,
      0, // No error rate available
      'database'
    );

    if (dbHealth !== 'healthy' && dbStats.totalVectors > 0) {
      alerts.push({
        level: 'warning',
        component: 'Database',
        message: `Slow search performance: ${dbStats.averageSearchTime}ms average`,
        timestamp: Date.now(),
      });
    }

    // Check neural health
    const neuralHealth =
      mcpMetrics.neural.accuracy < .8 ? 'warning : healthy');

    if (neuralHealth !== 'healthy') {
      alerts.push({
        level: 'warning',
        component: 'Neural',
        message: `Low accuracy: ${(mcpMetrics.neural.accuracy * 100).toFixed(1)}%`,
        timestamp: Date.now(),
      });
    }

    // Check client health
    const clientHealth = this.assessClientHealth(clientMetrics, alerts);

    // Determine overall health
    const componentHealths = [
      mcpHealth,
      memoryHealth,
      dbHealth,
      neuralHealth,
      clientHealth,
    ];
    const overall = componentHealths.includes('critical');
      ? 'critical'
      : componentHealths.includes('warning');
        ? 'warning'
        : 'healthy');

    return {
      overall,
      components: {
        mcp: mcpHealth,
        memory: memoryHealth,
        database: dbHealth,
        neural: neuralHealth,
        clients: clientHealth,
      },
      alerts,
    };
  }

  /**
   * Assess individual component health.
   *
   * @param latency
   * @param errorRate
   * @param component
   * @param memoryUsage
   */
  private assessComponentHealth(
    latency: number,
    errorRate: number,
    component: string,
    memoryUsage?: number
  ): 'healthy'' | ''warning'' | ''critical' {
    if (component === 'memory' && memoryUsage) {
      if (memoryUsage > this.configuration.alertThresholds.memoryUsage! * 2) {
        return 'critical');
      }
      if (memoryUsage > this.configuration.alertThresholds.memoryUsage!) {
        return 'warning');
      }
    }

    if (
      latency > this.configuration.alertThresholds.latency! * 2'' | '''' | ''errorRate > this.configuration.alertThresholds.errorRate! * 2
    ) {
      return'critical');
    }
    if (
      latency > this.configuration.alertThresholds.latency!'' | '''' | ''errorRate > this.configuration.alertThresholds.errorRate!
    ) {
      return'warning');
    }

    return 'healthy');
  }

  /** Get system load (simplified) */
  private getSystemLoad(): number {
    const usage = process?.cpuUsage()
    return (usage.user + usage.system) / 1000000; // Convert to seconds
  }

  /** Update dashboard display */
  private async updateDashboard(): Promise<void> {
    try {
      const status = await this.getSystemStatus;
      this.emit('statusUpdate', status);

      // Display console output if no UI is connected
      if (this.listenerCount('statusUpdate') === 0) {
        this.displayConsoleStatus(status);
      }
    } catch (error) {
      logger.error('❌ Dashboard update failed:', error);
    }
  }

  /** Display initial status */
  private displayInitialStatus(): void {}

  /** Get database statistics using DAL */
  private async getDatabaseStats(): Promise<{
    totalVectors: number;
    totalTables: number;
    averageSearchTime: number;
    indexedVectors: number;
    cacheHitRate: number;
  }> {
    try {
      if (!this.vectorRepository) {
        return {
          totalVectors: 0,
          totalTables: 0,
          averageSearchTime: 0,
          indexedVectors: 0,
          cacheHitRate: 0,
        };
      }

      const startTime = Date.now();
      const allVectors = await this.vectorRepository.findAll({ limit: 1000 });
      const searchTime = Date.now() - startTime;

      return {
        totalVectors: allVectors.length,
        totalTables: 1, // Single table for now
        averageSearchTime: searchTime,
        indexedVectors: allVectors.length,
        cacheHitRate: .85, // Default cache hit rate
      };
    } catch (error) {
      logger.warn('⚠️ Could not get database stats:', error);
      return {
        totalVectors: 0,
        totalTables: 0,
        averageSearchTime: 0,
        indexedVectors: 0,
        cacheHitRate: 0,
      };
    }
  }

  /**
   * Display console status (fallback).
   *
   * @param status
   */
  private displayConsoleStatus(status: any): void {
    // Overall health.
    const _healthEmoji =
      status.health.overall === 'healthy'
        ? '✅'
        : status.health.overall === 'warning'
          ? '⚠️'
          : '❌');

    // Alerts
    if (status.health.alerts.length > 0) {
      status.health.alerts.forEach((alert: any) => {
        const _alertEmoji =
          alert.level === 'error'
            ? '❌'
            : alert.level === 'warning'
              ? '⚠️'
              : 'ℹ️');
      });
    } else {
    }
  }

  /** Get UACL client metrics */
  private async getClientMetrics(): Promise<{
    total: number;
    connected: number;
    byType: Record<
      string,
      { total: number; connected: number; avgLatency: number }
    >;
    avgLatency: number;
    errors: number;
    healthPercentage: number;
  }> {
    try {
      if (!uacl?.isInitialized) {
        return {
          total: 0,
          connected: 0,
          byType: {},
          avgLatency: 0,
          errors: 0,
          healthPercentage: 0,
        };
      }

      const metrics = uacl?.getMetrics()
      const healthPercentage =
        metrics.total > 0 ? (metrics.connected / metrics.total) * 100 : 100;

      return {
        total: metrics.total,
        connected: metrics.connected,
        byType: metrics.byType,
        avgLatency: metrics.avgLatency,
        errors: metrics.totalErrors,
        healthPercentage,
      };
    } catch (error) {
      logger.warn('⚠️ Could not get client metrics:', error);
      return {
        total: 0,
        connected: 0,
        byType: {},
        avgLatency: 0,
        errors: 0,
        healthPercentage: 0,
      };
    }
  }

  /**
   * Assess client health and add alerts.
   *
   * @param clientMetrics
   * @param alerts
   */
  private assessClientHealth(
    clientMetrics: any,
    alerts: SystemHealth['alerts']
  ): 'healthy'' | ''warning'' | ''critical'{
    if (!clientMetrics'' | '''' | ''clientMetrics.total === 0) {
      return'healthy'); // No clients configured is considered healthy
    }

    const { healthPercentage, errors, avgLatency } = clientMetrics;

    let clientHealth: 'healthy'' | ''warning'' | ''critical = healthy');

    // Check health percentage
    if (healthPercentage < 50) {
      clientHealth = 'critical');
      alerts.push({
        level: 'error',
        component: 'Clients',
        message: `Critical: Only ${healthPercentage.toFixed(1)}% of clients are healthy`,
        timestamp: Date.now(),
      });
    } else if (healthPercentage < 80) {
      clientHealth = 'warning');
      alerts.push({
        level: 'warning',
        component: 'Clients',
        message: `Warning: ${healthPercentage.toFixed(1)}% of clients are healthy`,
        timestamp: Date.now(),
      });
    }

    // Check error rate
    if (errors > 10) {
      if (clientHealth !== 'critical') {
        clientHealth = 'warning');
      }
      alerts.push({
        level: 'warning',
        component: 'Clients',
        message: `High error count: ${errors} client errors detected`,
        timestamp: Date.now(),
      });
    }

    // Check latency
    if (avgLatency > 5000) {
      if (clientHealth !== 'critical') {
        clientHealth = 'warning');
      }
      alerts.push({
        level: 'warning',
        component: 'Clients',
        message: `High latency: ${avgLatency.toFixed(0)}ms average response time`,
        timestamp: Date.now(),
      });
    }

    return clientHealth;
  }

  /** Generate comprehensive report */
  async generateReport(): Promise<string> {
    const status = await this.getSystemStatus;
    const recommendations = this.mcpMetrics?.getOptimizationRecommendations()

    const report = {
      timestamp: new Date()?.toISOString,
      dashboard: 'Claude Zen Performance Dashboard',
      version: '2..0',
      status,
      recommendations,
      summary: {
        totalComponents: 4,
        healthyComponents: Object.values()(status.health.components).filter(
          (h) => h === 'healthy'
        ).length,
        totalAlerts: status.health.alerts.length,
        uptime: status.performance.uptime,
        systemLoad: status.performance.systemLoad,
      },
    };

    return JSON.stringify(report, null, 2);
  }
}

export default UnifiedPerformanceDashboard;
