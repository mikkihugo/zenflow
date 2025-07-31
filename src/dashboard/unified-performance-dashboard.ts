/** Unified Performance Dashboard */
/** Real-time monitoring and analytics for Claude Flow systems */

import { EventEmitter } from 'node:events';
import MCPPerformanceMetrics from '../mcp/performance-metrics.js';
import EnhancedMemory from '../memory/enhanced-memory.js';
import LanceDBInterface from '../database/lancedb-interface.js';

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
  };
  alerts: Array<{
    level: 'info' | 'warning' | 'error';
    component: string;
    message: string;
    timestamp: number;
  }>;
}

export class UnifiedPerformanceDashboard extends EventEmitter {
  private mcpMetrics: MCPPerformanceMetrics;
  private enhancedMemory: EnhancedMemory;
  private lanceDB: LanceDBInterface;
  private config: Required<DashboardConfig>;
  private refreshTimer?: NodeJS.Timeout;
  private isRunning = false;

  constructor(
    mcpMetrics: MCPPerformanceMetrics,
    enhancedMemory: EnhancedMemory,
    lanceDB: LanceDBInterface,
    config: DashboardConfig = {}
  ) {
    super();
    
    this.mcpMetrics = mcpMetrics;
    this.enhancedMemory = enhancedMemory;
    this.lanceDB = lanceDB;
    
    this.config = {
      refreshInterval: config.refreshInterval ?? 1000,
      enableRealtime: config.enableRealtime ?? true,
      maxDataPoints: config.maxDataPoints ?? 1000,
      alertThresholds: {
        latency: config.alertThresholds?.latency ?? 1000,
        errorRate: config.alertThresholds?.errorRate ?? 0.05,
        memoryUsage: config.alertThresholds?.memoryUsage ?? 100 * 1024 * 1024,
        ...config.alertThresholds
      }
    };
  }

  /** Start the dashboard monitoring */
  async start(): Promise<void> {
    if (this.isRunning) return;
    
    console.log('🚀 Starting Unified Performance Dashboard...');
    
    if (this.config.enableRealtime) {
      this.refreshTimer = setInterval(() => {
        this.updateDashboard();
      }, this.config.refreshInterval);
    }
    
    this.isRunning = true;
    this.emit('started');
    
    console.log('✅ Dashboard started successfully');
    this.displayInitialStatus();
  }

  /** Stop the dashboard monitoring */
  async stop(): Promise<void> {
    if (!this.isRunning) return;
    
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = undefined;
    }
    
    this.isRunning = false;
    this.emit('stopped');
    
    console.log('⏹️ Dashboard stopped');
  }

  /** Get comprehensive system status */
  async getSystemStatus(): Promise<{
    health: SystemHealth;
    metrics: {
      mcp: any;
      memory: any;
      database: any;
      neural: any;
    };
    performance: {
      uptime: number;
      totalOperations: number;
      systemLoad: number;
      memoryUsage: number;
    };
  }> {
    const mcpMetrics = this.mcpMetrics.getMetrics();
    const mcpSummary = this.mcpMetrics.getPerformanceSummary();
    const memoryStats = this.enhancedMemory.getStats();
    const dbStats = await this.lanceDB.getStats().catch(() => ({
      totalVectors: 0,
      totalTables: 0,
      averageSearchTime: 0,
      indexedVectors: 0,
      cacheHitRate: 0
    }));

    const health = this.assessSystemHealth(mcpMetrics, memoryStats, dbStats);
    
    return {
      health,
      metrics: {
        mcp: mcpMetrics,
        memory: memoryStats,
        database: dbStats,
        neural: mcpMetrics.neural
      },
      performance: {
        uptime: mcpSummary.uptime,
        totalOperations: mcpSummary.totalOperations,
        systemLoad: this.getSystemLoad(),
        memoryUsage: process.memoryUsage().heapUsed
      }
    };
  }

  /** Assess overall system health */
  private assessSystemHealth(mcpMetrics: any, memoryStats: any, dbStats: any): SystemHealth {
    const alerts: SystemHealth['alerts'] = [];
    
    // Check MCP health
    const mcpErrorRate = mcpMetrics.requests.failed / Math.max(1, mcpMetrics.requests.total);
    const mcpHealth = this.assessComponentHealth(
      mcpMetrics.requests.averageLatency,
      mcpErrorRate,
      'mcp'
    );
    
    if (mcpHealth !== 'healthy') {
      alerts.push({
        level: mcpHealth === 'warning' ? 'warning' : 'error',
        component: 'MCP',
        message: `High latency (${mcpMetrics.requests.averageLatency}ms) or error rate (${(mcpErrorRate * 100).toFixed(1)}%)`,
        timestamp: Date.now()
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
        timestamp: Date.now()
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
        timestamp: Date.now()
      });
    }

    // Check neural health
    const neuralHealth = mcpMetrics.neural.accuracy < 0.8 ? 'warning' : 'healthy';
    
    if (neuralHealth !== 'healthy') {
      alerts.push({
        level: 'warning',
        component: 'Neural',
        message: `Low accuracy: ${(mcpMetrics.neural.accuracy * 100).toFixed(1)}%`,
        timestamp: Date.now()
      });
    }

    // Determine overall health
    const componentHealths = [mcpHealth, memoryHealth, dbHealth, neuralHealth];
    const overall = componentHealths.includes('critical') ? 'critical' :
      componentHealths.includes('warning') ? 'warning' : 'healthy';

    return {
      overall,
      components: {
        mcp: mcpHealth,
        memory: memoryHealth,
        database: dbHealth,
        neural: neuralHealth
      },
      alerts
    };
  }

  /** Assess individual component health */
  private assessComponentHealth(
    latency: number,
    errorRate: number,
    component: string,
    memoryUsage?: number
  ): 'healthy' | 'warning' | 'critical' {
    if (component === 'memory' && memoryUsage) {
      if (memoryUsage > this.config.alertThresholds.memoryUsage! * 2) {
        return 'critical';
      } else if (memoryUsage > this.config.alertThresholds.memoryUsage!) {
        return 'warning';
      }
    }
    
    if (latency > this.config.alertThresholds.latency! * 2 || 
        errorRate > this.config.alertThresholds.errorRate! * 2) {
      return 'critical';
    } else if (latency > this.config.alertThresholds.latency! || 
               errorRate > this.config.alertThresholds.errorRate!) {
      return 'warning';
    }
    
    return 'healthy';
  }

  /** Get system load (simplified) */
  private getSystemLoad(): number {
    const usage = process.cpuUsage();
    return (usage.user + usage.system) / 1000000; // Convert to seconds
  }

  /** Update dashboard display */
  private async updateDashboard(): Promise<void> {
    try {
      const status = await this.getSystemStatus();
      this.emit('statusUpdate', status);
      
      // Display console output if no UI is connected
      if (this.listenerCount('statusUpdate') === 0) {
        this.displayConsoleStatus(status);
      }
    } catch (error) {
      console.error('❌ Dashboard update failed:', error);
    }
  }

  /** Display initial status */
  private displayInitialStatus(): void {
    console.log('\n📊 Claude Flow Performance Dashboard');
    console.log('=====================================');
    console.log(`🔄 Refresh interval: ${this.config.refreshInterval}ms`);
    console.log(`📈 Real-time monitoring: ${this.config.enableRealtime ? 'Enabled' : 'Disabled'}`);
    console.log(`⚠️ Alert thresholds:`);
    console.log(`   Latency: ${this.config.alertThresholds.latency}ms`);
    console.log(`   Error Rate: ${(this.config.alertThresholds.errorRate! * 100).toFixed(1)}%`);
    console.log(`   Memory: ${Math.round(this.config.alertThresholds.memoryUsage! / 1024 / 1024)}MB`);
    console.log('');
  }

  /** Display console status (fallback) */
  private displayConsoleStatus(status: any): void {
    console.clear();
    console.log('\n📊 Claude Flow Performance Dashboard - Live Status');
    console.log('====================================================');
    
    // Overall health
    const healthEmoji = status.health.overall === 'healthy' ? '✅' : 
      status.health.overall === 'warning' ? '⚠️' : '❌';
    console.log(`${healthEmoji} Overall Health: ${status.health.overall.toUpperCase()}`);
    
    // Component status
    console.log('\n🔧 Component Status:');
    console.log(`   MCP: ${this.getHealthEmoji(status.health.components.mcp)} ${status.health.components.mcp}`);
    console.log(`   Memory: ${this.getHealthEmoji(status.health.components.memory)} ${status.health.components.memory}`);
    console.log(`   Database: ${this.getHealthEmoji(status.health.components.database)} ${status.health.components.database}`);
    console.log(`   Neural: ${this.getHealthEmoji(status.health.components.neural)} ${status.health.components.neural}`);
    
    // Key metrics
    console.log('\n📈 Key Metrics:');
    console.log(`   Requests: ${status.metrics.mcp.requests.total} (${status.metrics.mcp.requests.successful} successful)`);
    console.log(`   Avg Latency: ${status.metrics.mcp.requests.averageLatency.toFixed(1)}ms`);
    console.log(`   Tool Executions: ${status.metrics.mcp.tools.executions}`);
    console.log(`   Memory Sessions: ${status.metrics.memory.totalSessions}`);
    console.log(`   DB Vectors: ${status.metrics.database.totalVectors}`);
    console.log(`   Neural Accuracy: ${(status.metrics.neural.accuracy * 100).toFixed(1)}%`);
    
    // Alerts
    if (status.health.alerts.length > 0) {
      console.log('\n🚨 Active Alerts:');
      status.health.alerts.forEach((alert: any) => {
        const alertEmoji = alert.level === 'error' ? '❌' : 
          alert.level === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`   ${alertEmoji} ${alert.component}: ${alert.message}`);
      });
    }
    
    console.log(`\n⏰ Last Updated: ${new Date().toLocaleTimeString()}`);
    console.log('Press Ctrl+C to stop monitoring');
  }

  /** Get health status emoji */
  private getHealthEmoji(health: string): string {
    switch (health) {
      case 'healthy': return '✅';
      case 'warning': return '⚠️';
      case 'critical': return '❌';
      default: return '❓';
    }
  }

  /** Generate comprehensive report */
  async generateReport(): Promise<string> {
    const status = await this.getSystemStatus();
    const recommendations = this.mcpMetrics.getOptimizationRecommendations();
    
    const report = {
      timestamp: new Date().toISOString(),
      dashboard: 'Claude Flow Performance Dashboard',
      version: '2.0.0',
      status,
      recommendations,
      summary: {
        totalComponents: 4,
        healthyComponents: Object.values(status.health.components).filter(h => h === 'healthy').length,
        totalAlerts: status.health.alerts.length,
        uptime: status.performance.uptime,
        systemLoad: status.performance.systemLoad
      }
    };
    
    return JSON.stringify(report, null, 2);
  }
}

export default UnifiedPerformanceDashboard;