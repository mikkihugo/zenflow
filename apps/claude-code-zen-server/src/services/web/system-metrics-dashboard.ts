/**
 * System Metrics Dashboard - Foundation Pattern
 * 
 * Uses single coordinating facade instead of multiple facade imports.
 * Follows foundation principles for clean architecture.
 */

import {
  getLogger,
  EventEmitter,
  Result,
  ok,
  err
} from '@claude-zen/foundation';

// Follow foundation's actual pattern - direct foundation + selective strategic facades

const logger = getLogger('system-metrics-dashboard');

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

interface DashboardStatus {
  health: SystemHealth;
  metrics: SystemMetrics;
  timestamp: number;
}

/**
 * Unified Performance Dashboard using coordinating facade pattern
 */
export class UnifiedPerformanceDashboard extends EventEmitter {
  private systemCoordinator: SystemCoordinator | null = null;
  private configuration: Required<DashboardConfig>;
  private refreshTimer?: NodeJS.Timeout;
  private isRunning = false;

  constructor(config: DashboardConfig = {}) {
    super();
    
    this.configuration = {
      refreshInterval: config?.refreshInterval ?? 5000,
      enableRealtime: config?.enableRealtime ?? true,
      maxDataPoints: config?.maxDataPoints ?? 1000,
      alertThresholds: {
        latency: config?.alertThresholds?.latency ?? 1000,
        errorRate: config?.alertThresholds?.errorRate ?? 0.05,
        memoryUsage: config?.alertThresholds?.memoryUsage ?? 500 * 1024 * 1024,
        ...config?.alertThresholds
      }
    };

    logger.info('UnifiedPerformanceDashboard initialized', { config: this.configuration });
  }

  /**
   * Start the dashboard monitoring
   */
  async start(): Promise<Result<void, Error>> {
    if (this.isRunning) {
      return ok();
    }

    try {
      // Initialize single coordinating facade
      this.systemCoordinator = await getSystemCoordinator();
      
      // Initialize the system through coordinator
      const initResult = await this.systemCoordinator.initializeSystem();
      if (!initResult.success) {
        throw initResult.error;
      }

      // Start real-time monitoring if enabled
      if (this.configuration.enableRealtime) {
        this.refreshTimer = setInterval(() => {
          this.updateDashboard();
        }, this.configuration.refreshInterval);
      }

      this.isRunning = true;
      this.emit('started', {});
      this.displayInitialStatus();
      
      logger.info('Dashboard monitoring started');
      return ok();
    } catch (error) {
      logger.error('Failed to start dashboard:', error);
      return err(error as Error);
    }
  }

  /**
   * Stop the dashboard monitoring
   */
  async stop(): Promise<Result<void, Error>> {
    if (!this.isRunning) {
      return ok();
    }

    try {
      // Clear refresh timer
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
        this.refreshTimer = undefined;
      }

      // Shutdown system through coordinator
      if (this.systemCoordinator) {
        const shutdownResult = await this.systemCoordinator.shutdownSystem();
        if (!shutdownResult.success) {
          logger.warn('System shutdown warning:', shutdownResult.error);
        }
      }

      this.isRunning = false;
      this.emit('stopped', {});
      
      logger.info('Dashboard monitoring stopped');
      return ok();
    } catch (error) {
      logger.error('Failed to stop dashboard:', error);
      return err(error as Error);
    }
  }

  /**
   * Get comprehensive system status using coordinating facade
   */
  async getSystemStatus(): Promise<Result<DashboardStatus, Error>> {
    if (!this.systemCoordinator) {
      return err(new Error('Dashboard not initialized'));
    }

    try {
      // Use single coordinating facade instead of multiple facades
      const healthResult = await this.systemCoordinator.getSystemHealth();
      const metricsResult = await this.systemCoordinator.getSystemMetrics();

      if (!healthResult.success) {
        throw healthResult.error;
      }
      if (!metricsResult.success) {
        throw metricsResult.error;
      }

      const status: DashboardStatus = {
        health: healthResult.data,
        metrics: metricsResult.data,
        timestamp: Date.now()
      };

      return ok(status);
    } catch (error) {
      logger.error('Failed to get system status:', error);
      return err(error as Error);
    }
  }

  /**
   * Generate comprehensive system report
   */
  async generateReport(): Promise<Result<string, Error>> {
    try {
      const statusResult = await this.getSystemStatus();
      if (!statusResult.success) {
        throw statusResult.error;
      }

      const { health, metrics, timestamp } = statusResult.data;

      const report = {
        timestamp: new Date(timestamp).toISOString(),
        dashboard: 'Claude Zen Performance Dashboard',
        version: '2.0',
        architecture: 'Coordinating Facade Pattern',
        status: {
          overall: health.overall,
          components: health.components,
          alerts: health.alerts
        },
        metrics: {
          uptime: metrics.uptime,
          memoryUsage: `${Math.round(metrics.memoryUsage / 1024 / 1024)  }MB`,
          cpuUsage: `${metrics.cpuUsage.toFixed(2)  }%`,
          activeConnections: metrics.activeConnections,
          performance: metrics.performance
        },
        summary: {
          totalComponents: Object.keys(health.components).length,
          healthyComponents: Object.values(health.components).filter(h => h === 'healthy').length,
          totalAlerts: health.alerts.length,
          systemLoad: metrics.performance.averageLatency
        }
      };

      return ok(JSON.stringify(report, null, 2));
    } catch (error) {
      logger.error('Failed to generate report:', error);
      return err(error as Error);
    }
  }

  /**
   * Update dashboard display
   */
  private async updateDashboard(): Promise<void> {
    try {
      const statusResult = await this.getSystemStatus();
      if (statusResult.success) {
        this.emit('statusUpdate', statusResult.data);
        
        // Display console output if no UI is connected
        if (this.listenerCount('statusUpdate') === 0) {
          this.displayConsoleStatus(statusResult.data);
        }
      } else {
        logger.warn('Dashboard update failed:', statusResult.error);
      }
    } catch (error) {
      logger.error('Dashboard update error:', error);
    }
  }

  /**
   * Display initial status
   */
  private displayInitialStatus(): void {
    logger.info('🚀 System Metrics Dashboard started with coordinating facade pattern');
    logger.info(`📊 Refresh interval: ${this.configuration.refreshInterval}ms`);
    logger.info(`⚡ Real-time monitoring: ${this.configuration.enableRealtime ? 'enabled' : 'disabled'}`);
  }

  /**
   * Display console status (fallback when no UI connected)
   */
  private displayConsoleStatus(status: DashboardStatus): void {
    const healthEmoji = status.health.overall === 'healthy' ? '✅' : 
                       status.health.overall === 'warning' ? '⚠️' : '❌';
    
    logger.info(`${healthEmoji} System Health: ${status.health.overall}`);
    
    if (status.health.alerts.length > 0) {
      for (const alert of status.health.alerts) {
        const alertEmoji = alert.level === 'error' ? '❌' : 
                          alert.level === 'warning' ? '⚠️' : 'ℹ️';
        logger.info(`${alertEmoji} ${alert.component}: ${alert.message}`);
      }
    }
  }

  /**
   * Get dashboard configuration
   */
  getConfig(): DashboardConfig {
    return { ...this.configuration };
  }

  /**
   * Update dashboard configuration
   */
  updateConfig(updates: Partial<DashboardConfig>): void {
    this.configuration = {
      ...this.configuration,
      ...updates,
      alertThresholds: {
        ...this.configuration.alertThresholds,
        ...updates.alertThresholds
      }
    };
    
    logger.info('Dashboard configuration updated', { config: this.configuration });
  }

  /**
   * Check if dashboard is running
   */
  isActive(): boolean {
    return this.isRunning;
  }
}

export default UnifiedPerformanceDashboard;