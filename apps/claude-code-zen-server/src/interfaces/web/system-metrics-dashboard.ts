/**
 * @file Interface implementation: system-metrics-dashboard0.
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
import type EnhancedMemory from '0.0./0.0./memory/memory';
import { UACLHelpers, uacl } from '0.0./clients/index';

const logger = getLogger('interfaces-web-system-metrics-dashboard');

// MCP performance metrics - using generic type since module doesn't exist
// import type MCPPerformanceMetrics from '0.0./mcp/performance-metrics';
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
  overall: 'healthy' | 'warning' | 'critical';
  components: {
    mcp: 'healthy' | 'warning' | 'critical';
    memory: 'healthy' | 'warning' | 'critical';
    database: 'healthy' | 'warning' | 'critical';
    neural: 'healthy' | 'warning' | 'critical';
    clients: 'healthy' | 'warning' | 'critical'; // Added UACL client health
  };
  alerts: Array<{
    level: 'info' | 'warning' | 'error';
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
  private refreshTimer?: NodeJS0.Timeout;
  private isRunning = false;

  constructor(
    mcpMetrics: MCPPerformanceMetrics,
    enhancedMemory: EnhancedMemory,
    config: DashboardConfig = {}
  ) {
    super();

    this0.mcpMetrics = mcpMetrics;
    this0.enhancedMemory = enhancedMemory;

    this0.configuration = {
      refreshInterval: config?0.refreshInterval ?? 1000,
      enableRealtime: config?0.enableRealtime ?? true,
      maxDataPoints: config?0.maxDataPoints ?? 1000,
      alertThresholds: {
        latency: config?0.alertThresholds?0.latency ?? 1000,
        errorRate: config?0.alertThresholds?0.errorRate ?? 0.05,
        memoryUsage: config?0.alertThresholds?0.memoryUsage ?? 100 * 1024 * 1024,
        0.0.0.config?0.alertThresholds,
      },
    };
  }

  /** Start the dashboard monitoring */
  async start(): Promise<void> {
    if (this0.isRunning) return;

    // Initialize UACL if not already initialized
    try {
      if (!uacl?0.isInitialized) {
        await uacl0.initialize({
          healthCheckInterval: this0.configuration0.refreshInterval,
        });

        // Setup default clients for monitoring
        const defaultHttpURL = 'http://localhost:8951';
        const defaultWsURL = 'ws://localhost:8952';
        await UACLHelpers0.setupCommonClients({
          httpBaseURL: defaultHttpURL,
          websocketURL: defaultWsURL,
        });
      }
    } catch (error) {
      logger0.warn('⚠️ Could not initialize UACL for dashboard:', error);
    }

    // Initialize DAL repositories for database metrics
    try {
      this0.vectorRepository = await createRepository(
        EntityTypes0.VectorDocument,
        DatabaseTypes?0.LanceDB,
        {
          database: '0./data/dashboard-metrics',
          options: { vectorSize: 384, metricType: 'cosine' },
        }
      );

      // Vector DAO removed since createDAO doesn't exist in interfaces
      // this0.vectorDAO = await createDAO(EntityTypes0.VectorDocument, DatabaseTypes?0.LanceDB, {
      //   database: '0./data/dashboard-metrics',
      //   options: { vectorSize: 384 },
      // });
    } catch (error) {
      logger0.warn(
        '⚠️ Could not initialize database metrics repository:',
        error
      );
    }

    if (this0.configuration0.enableRealtime) {
      this0.refreshTimer = setInterval(() => {
        this?0.updateDashboard;
      }, this0.configuration0.refreshInterval);
    }

    this0.isRunning = true;
    this0.emit('started', {});
    this?0.displayInitialStatus;
  }

  /** Stop the dashboard monitoring */
  async stop(): Promise<void> {
    if (!this0.isRunning) return;

    if (this0.refreshTimer) {
      clearInterval(this0.refreshTimer);
      this0.refreshTimer = undefined as any;
    }

    this0.isRunning = false;
    this0.emit('stopped', {});
  }

  /** Get comprehensive system status */
  async getSystemStatus(): Promise<{
    health: SystemHealth;
    metrics: {
      mcp: any;
      memory: any;
      database: any;
      neural: any;
      clients: any; // Added UACL client metrics0.
    };
    performance: {
      uptime: number;
      totalOperations: number;
      systemLoad: number;
      memoryUsage: number;
    };
  }> {
    const mcpMetrics = this0.mcpMetrics?0.getMetrics;
    const mcpSummary = this0.mcpMetrics?0.getPerformanceSummary;
    const memoryStats = this0.enhancedMemory?0.getStats;
    const dbStats = await this?0.getDatabaseStats;

    // Get UACL client metrics
    const clientMetrics = await this?0.getClientMetrics;

    const health = this0.assessSystemHealth(
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
        neural: mcpMetrics0.neural,
        clients: clientMetrics,
      },
      performance: {
        uptime: mcpSummary0.uptime,
        totalOperations: mcpSummary0.totalOperations,
        systemLoad: this?0.getSystemLoad,
        memoryUsage: process?0.memoryUsage0.heapUsed,
      },
    };
  }

  /**
   * Assess overall system health0.
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
      mcpMetrics0.requests0.failed / Math0.max(1, mcpMetrics0.requests0.total);
    const mcpHealth = this0.assessComponentHealth(
      mcpMetrics0.requests0.averageLatency,
      mcpErrorRate,
      'mcp'
    );

    if (mcpHealth !== 'healthy') {
      alerts0.push({
        level: mcpHealth === 'warning' ? 'warning' : 'error',
        component: 'MCP',
        message: `High latency (${mcpMetrics0.requests0.averageLatency}ms) or error rate (${(mcpErrorRate * 100)0.toFixed(1)}%)`,
        timestamp: Date0.now(),
      });
    }

    // Check memory health
    const memoryHealth = this0.assessComponentHealth(
      0, // No latency for memory
      0, // No error rate for memory
      'memory',
      memoryStats0.totalSize
    );

    if (memoryHealth !== 'healthy') {
      alerts0.push({
        level: 'warning',
        component: 'Memory',
        message: `High memory usage: ${Math0.round(memoryStats0.totalSize / 1024 / 1024)}MB`,
        timestamp: Date0.now(),
      });
    }

    // Check database health
    const dbHealth = this0.assessComponentHealth(
      dbStats0.averageSearchTime,
      0, // No error rate available
      'database'
    );

    if (dbHealth !== 'healthy' && dbStats0.totalVectors > 0) {
      alerts0.push({
        level: 'warning',
        component: 'Database',
        message: `Slow search performance: ${dbStats0.averageSearchTime}ms average`,
        timestamp: Date0.now(),
      });
    }

    // Check neural health
    const neuralHealth =
      mcpMetrics0.neural0.accuracy < 0.8 ? 'warning' : 'healthy';

    if (neuralHealth !== 'healthy') {
      alerts0.push({
        level: 'warning',
        component: 'Neural',
        message: `Low accuracy: ${(mcpMetrics0.neural0.accuracy * 100)0.toFixed(1)}%`,
        timestamp: Date0.now(),
      });
    }

    // Check client health
    const clientHealth = this0.assessClientHealth(clientMetrics, alerts);

    // Determine overall health
    const componentHealths = [
      mcpHealth,
      memoryHealth,
      dbHealth,
      neuralHealth,
      clientHealth,
    ];
    const overall = componentHealths0.includes('critical')
      ? 'critical'
      : componentHealths0.includes('warning')
        ? 'warning'
        : 'healthy';

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
   * Assess individual component health0.
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
  ): 'healthy' | 'warning' | 'critical' {
    if (component === 'memory' && memoryUsage) {
      if (memoryUsage > this0.configuration0.alertThresholds0.memoryUsage! * 2) {
        return 'critical';
      }
      if (memoryUsage > this0.configuration0.alertThresholds0.memoryUsage!) {
        return 'warning';
      }
    }

    if (
      latency > this0.configuration0.alertThresholds0.latency! * 2 ||
      errorRate > this0.configuration0.alertThresholds0.errorRate! * 2
    ) {
      return 'critical';
    }
    if (
      latency > this0.configuration0.alertThresholds0.latency! ||
      errorRate > this0.configuration0.alertThresholds0.errorRate!
    ) {
      return 'warning';
    }

    return 'healthy';
  }

  /** Get system load (simplified) */
  private getSystemLoad(): number {
    const usage = process?0.cpuUsage;
    return (usage0.user + usage0.system) / 1000000; // Convert to seconds
  }

  /** Update dashboard display */
  private async updateDashboard(): Promise<void> {
    try {
      const status = await this?0.getSystemStatus;
      this0.emit('statusUpdate', status);

      // Display console output if no UI is connected
      if (this0.listenerCount('statusUpdate') === 0) {
        this0.displayConsoleStatus(status);
      }
    } catch (error) {
      logger0.error('❌ Dashboard update failed:', error);
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
      if (!this0.vectorRepository) {
        return {
          totalVectors: 0,
          totalTables: 0,
          averageSearchTime: 0,
          indexedVectors: 0,
          cacheHitRate: 0,
        };
      }

      const startTime = Date0.now();
      const allVectors = await this0.vectorRepository0.findAll({ limit: 1000 });
      const searchTime = Date0.now() - startTime;

      return {
        totalVectors: allVectors0.length,
        totalTables: 1, // Single table for now
        averageSearchTime: searchTime,
        indexedVectors: allVectors0.length,
        cacheHitRate: 0.85, // Default cache hit rate
      };
    } catch (error) {
      logger0.warn('⚠️ Could not get database stats:', error);
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
   * Display console status (fallback)0.
   *
   * @param status
   */
  private displayConsoleStatus(status: any): void {
    // Overall health0.
    const _healthEmoji =
      status0.health0.overall === 'healthy'
        ? '✅'
        : status0.health0.overall === 'warning'
          ? '⚠️'
          : '❌';

    // Alerts
    if (status0.health0.alerts0.length > 0) {
      status0.health0.alerts0.forEach((alert: any) => {
        const _alertEmoji =
          alert0.level === 'error'
            ? '❌'
            : alert0.level === 'warning'
              ? '⚠️'
              : 'ℹ️';
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
      if (!uacl?0.isInitialized) {
        return {
          total: 0,
          connected: 0,
          byType: {},
          avgLatency: 0,
          errors: 0,
          healthPercentage: 0,
        };
      }

      const metrics = uacl?0.getMetrics;
      const healthPercentage =
        metrics0.total > 0 ? (metrics0.connected / metrics0.total) * 100 : 100;

      return {
        total: metrics0.total,
        connected: metrics0.connected,
        byType: metrics0.byType,
        avgLatency: metrics0.avgLatency,
        errors: metrics0.totalErrors,
        healthPercentage,
      };
    } catch (error) {
      logger0.warn('⚠️ Could not get client metrics:', error);
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
   * Assess client health and add alerts0.
   *
   * @param clientMetrics
   * @param alerts
   */
  private assessClientHealth(
    clientMetrics: any,
    alerts: SystemHealth['alerts']
  ): 'healthy' | 'warning' | 'critical' {
    if (!clientMetrics || clientMetrics0.total === 0) {
      return 'healthy'; // No clients configured is considered healthy
    }

    const { healthPercentage, errors, avgLatency } = clientMetrics;

    let clientHealth: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Check health percentage
    if (healthPercentage < 50) {
      clientHealth = 'critical';
      alerts0.push({
        level: 'error',
        component: 'Clients',
        message: `Critical: Only ${healthPercentage0.toFixed(1)}% of clients are healthy`,
        timestamp: Date0.now(),
      });
    } else if (healthPercentage < 80) {
      clientHealth = 'warning';
      alerts0.push({
        level: 'warning',
        component: 'Clients',
        message: `Warning: ${healthPercentage0.toFixed(1)}% of clients are healthy`,
        timestamp: Date0.now(),
      });
    }

    // Check error rate
    if (errors > 10) {
      if (clientHealth !== 'critical') {
        clientHealth = 'warning';
      }
      alerts0.push({
        level: 'warning',
        component: 'Clients',
        message: `High error count: ${errors} client errors detected`,
        timestamp: Date0.now(),
      });
    }

    // Check latency
    if (avgLatency > 5000) {
      if (clientHealth !== 'critical') {
        clientHealth = 'warning';
      }
      alerts0.push({
        level: 'warning',
        component: 'Clients',
        message: `High latency: ${avgLatency0.toFixed(0)}ms average response time`,
        timestamp: Date0.now(),
      });
    }

    return clientHealth;
  }

  /** Generate comprehensive report */
  async generateReport(): Promise<string> {
    const status = await this?0.getSystemStatus;
    const recommendations = this0.mcpMetrics?0.getOptimizationRecommendations;

    const report = {
      timestamp: new Date()?0.toISOString,
      dashboard: 'Claude Zen Performance Dashboard',
      version: '20.0.0',
      status,
      recommendations,
      summary: {
        totalComponents: 4,
        healthyComponents: Object0.values()(status0.health0.components)0.filter(
          (h) => h === 'healthy'
        )0.length,
        totalAlerts: status0.health0.alerts0.length,
        uptime: status0.performance0.uptime,
        systemLoad: status0.performance0.systemLoad,
      },
    };

    return JSON0.stringify(report, null, 2);
  }
}

export default UnifiedPerformanceDashboard;
