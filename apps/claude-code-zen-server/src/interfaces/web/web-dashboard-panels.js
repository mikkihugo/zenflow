/**
 * Web Dashboard Panels - Migrated TUI functionality to web
 *
 * Converts key Terminal UI components to web dashboard panels
 * for a unified web-only interface experience.
 */
import { getLogger } from '../../config/logging-config';
import { getVersion } from '../../config/version';
export class WebDashboardPanels {
    logger = getLogger('DashboardPanels');
    llmStatsService;
    constructor(llmStatsService) {
        this.llmStatsService = llmStatsService;
    }
    /**
     * Get system status panel (migrated from status.tsx)
     */
    getStatusPanel() {
        return {
            id: 'status',
            title: 'System Status',
            icon: '⚡',
            content: this.generateStatusHTML(),
        };
    }
    /**
     * Get swarm dashboard panel (migrated from swarm-dashboard.tsx)
     */
    getSwarmPanel() {
        return {
            id: 'swarm',
            title: 'Swarm Management',
            icon: '🐝',
            content: this.generateSwarmHTML(),
        };
    }
    /**
     * Get performance monitor panel (migrated from performance-monitor.tsx)
     */
    getPerformancePanel() {
        return {
            id: 'performance',
            title: 'Performance Monitor',
            icon: '📊',
            content: this.generatePerformanceHTML(),
        };
    }
    /**
     * Get logs viewer panel (migrated from logs-viewer.tsx)
     */
    getLogsPanel() {
        return {
            id: 'logs',
            title: 'Live Logs',
            icon: '📝',
            content: this.generateLogsHTML(),
        };
    }
    /**
     * Get settings panel (migrated from settings.tsx)
     */
    getSettingsPanel() {
        return {
            id: 'settings',
            title: 'Settings',
            icon: '⚙️',
            content: this.generateSettingsHTML(),
        };
    }
    /**
     * Get LLM Statistics panel (migrated from llm-statistics.tsx)
     */
    getLLMStatsPanel() {
        const analytics = this.llmStatsService?.getAnalytics() || {
            summary: { totalCalls: 0, successRate: 100, averageResponseTime: 0, totalTokensUsed: 0, costSavings: 0 },
            providerStats: [],
            routingStats: { totalRoutingDecisions: 0, optimalRoutingRate: 100, fallbackRate: 0, averageFallbackSteps: 0, routingEfficiency: 100, commonRoutingPatterns: [], taskTypeRouting: {} },
            systemHealth: { overallHealth: 'excellent', healthScore: 100, activeProviders: 0, providersInCooldown: 0, systemThroughput: 0, averageLatency: 0, errorRate: 0, resourceUtilization: 0, recommendations: [], alerts: [] },
            trends: { callVolume: [], successRate: [], latency: [], providerUsage: {} },
            insights: { topPerformingProvider: 'none', mostEfficientProvider: 'none', bottlenecks: [], optimizationOpportunities: [] }
        };
        const systemHealth = this.llmStatsService?.getSystemHealth() || {
            overallHealth: 'excellent',
            healthScore: 100,
            activeProviders: 0,
            providersInCooldown: 0,
            systemThroughput: 0,
            averageLatency: 0,
            errorRate: 0,
            resourceUtilization: 0,
            recommendations: [],
            alerts: []
        };
        return {
            id: 'llm-stats',
            title: 'LLM Statistics',
            icon: '🧠',
            content: this.generateLLMStatsHTML(analytics, systemHealth),
            data: { analytics, systemHealth }
        };
    }
    /**
     * ADR Manager Panel (migrated from adr-manager.tsx)
     */
    getADRManagerPanel() {
        return {
            id: 'adr-manager',
            title: 'ADR Manager',
            icon: '📋',
            content: this.generateADRManagerHTML()
        };
    }
    /**
     * Command Palette Panel (migrated from command-palette.tsx)
     */
    getCommandPalettePanel() {
        return {
            id: 'command-palette',
            title: 'Command Palette',
            icon: '⌘',
            content: this.generateCommandPaletteHTML()
        };
    }
    /**
     * File Browser Panel (migrated from file-browser.tsx)
     */
    getFileBrowserPanel() {
        return {
            id: 'file-browser',
            title: 'File Browser',
            icon: '📁',
            content: this.generateFileBrowserHTML()
        };
    }
    /**
     * Help Panel (migrated from help.tsx)
     */
    getHelpPanel() {
        return {
            id: 'help',
            title: 'Help',
            icon: '❓',
            content: this.generateHelpHTML()
        };
    }
    /**
     * Main Menu Panel (migrated from main-menu.tsx)
     */
    getMainMenuPanel() {
        return {
            id: 'main-menu',
            title: 'Main Menu',
            icon: '🏠',
            content: this.generateMainMenuHTML()
        };
    }
    /**
     * MCP Servers Panel (migrated from mcp-servers.tsx)
     */
    getMCPServersPanel() {
        return {
            id: 'mcp-servers',
            title: 'MCP Servers',
            icon: '🔌',
            content: this.generateMCPServersHTML()
        };
    }
    /**
     * MCP Tester Panel (migrated from mcp-tester.tsx)
     */
    getMCPTesterPanel() {
        return {
            id: 'mcp-tester',
            title: 'MCP Tester',
            icon: '🧪',
            content: this.generateMCPTesterHTML()
        };
    }
    /**
     * Nix Manager Panel (migrated from nix-manager.tsx)
     */
    getNixManagerPanel() {
        return {
            id: 'nix-manager',
            title: 'Nix Manager',
            icon: '❄️',
            content: this.generateNixManagerHTML()
        };
    }
    /**
     * Phase3 Learning Monitor Panel (migrated from phase3-learning-monitor.tsx)
     */
    getPhase3LearningMonitorPanel() {
        return {
            id: 'phase3-learning',
            title: 'Neural Learning',
            icon: '🧬',
            content: this.generatePhase3LearningHTML()
        };
    }
    /**
     * Enhanced Swarm Dashboard Panel (migrated from swarm-dashboard.tsx)
     */
    getSwarmDashboardPanel() {
        return {
            id: 'swarm-dashboard',
            title: 'Swarm Dashboard',
            icon: '🌐',
            content: this.generateSwarmDashboardHTML()
        };
    }
    /**
     * Workspace Panel (migrated from workspace.tsx)
     */
    getWorkspacePanel() {
        return {
            id: 'workspace',
            title: 'Workspace',
            icon: '🗂️',
            content: this.generateWorkspaceHTML()
        };
    }
    /**
     * Get all dashboard panels (includes all restored TUI screens)
     */
    getAllPanels() {
        return [
            // Core System Panels (6)
            this.getStatusPanel(),
            this.getSwarmPanel(),
            this.getPerformancePanel(),
            this.getLLMStatsPanel(),
            this.getLogsPanel(),
            this.getSettingsPanel(),
            // Main TUI Restored Screens (11)
            this.getADRManagerPanel(),
            this.getCommandPalettePanel(),
            this.getFileBrowserPanel(),
            this.getHelpPanel(),
            this.getMainMenuPanel(),
            this.getMCPServersPanel(),
            this.getMCPTesterPanel(),
            this.getNixManagerPanel(),
            this.getPhase3LearningMonitorPanel(),
            this.getSwarmDashboardPanel(),
            this.getWorkspacePanel(),
            // Coordination System Panels (8)
            this.getAgentHealthPanel(),
            this.getTaskCoordinatorPanel(),
            this.getQueenCoordinatorPanel(),
            this.getSwarmCommanderPanel(),
            this.getIntelligenceEnginePanel(),
            this.getLoadBalancingPanel(),
            this.getOrchestrationPanel(),
            this.getSafePipelinePanel(),
            // Database & Memory Panels (6)
            this.getDatabaseManagerPanel(),
            this.getMemorySystemPanel(),
            this.getVectorStorePanel(),
            this.getGraphDatabasePanel(),
            this.getDocumentServicePanel(),
            this.getHybridFactoryPanel(),
            // Neural & AI Panels (7)
            this.getNeuralNetworkPanel(),
            this.getDspyEnginePanel(),
            this.getAdaptiveLearningPanel(),
            this.getPatternRecognitionPanel(),
            this.getBehavioralOptimizationPanel(),
            this.getKnowledgeEvolutionPanel(),
            this.getMLIntegrationPanel(),
            // Development & Diagnostics Panels (8)
            this.getDiagnosticsPanel(),
            this.getHealthMonitorPanel(),
            this.getLoggingConfigPanel(),
            this.getCliDiagnosticsPanel(),
            this.getErrorMonitoringPanel(),
            this.getSystemResiliencePanel(),
            this.getTypeEventSystemPanel(),
            this.getDomainValidatorPanel(),
            // Interface & Client Panels (7)
            this.getApiClientPanel(),
            this.getWebSocketClientPanel(),
            this.getEventAdapterPanel(),
            this.getServiceAdapterPanel(),
            this.getKnowledgeClientPanel(),
            this.getHttpClientPanel(),
            this.getWebServicePanel(),
            // Monitoring & Analytics Panels (6)
            this.getOtelConsumerPanel(),
            this.getWorkflowMonitorPanel(),
            this.getTuiDashboardPanel(),
            this.getAnalyticsPanel(),
            this.getOptimizationPanel(),
            this.getBenchmarkPanel(),
        ];
    }
    generateStatusHTML() {
        return `
      <div class="status-panel">
        <div class="status-grid">
          <div class="status-card">
            <div class="status-icon">🟢</div>
            <div class="status-info">
              <h3>Web Server</h3>
              <p>Healthy • ${getVersion()}</p>
            </div>
          </div>
          <div class="status-card">
            <div class="status-icon">📡</div>
            <div class="status-info">
              <h3>WebSocket</h3>
              <p>Connected • Real-time</p>
            </div>
          </div>
          <div class="status-card">
            <div class="status-icon">🧠</div>
            <div class="status-info">
              <h3>Neural Engine</h3>
              <p>Active • WASM</p>
            </div>
          </div>
          <div class="status-card">
            <div class="status-icon">💾</div>
            <div class="status-info">
              <h3>Memory</h3>
              <p id="memory-usage">Loading...</p>
            </div>
          </div>
        </div>
        <div class="uptime-info">
          <h4>Uptime: <span id="uptime">Loading...</span></h4>
        </div>
      </div>
    `;
    }
    generateSwarmHTML() {
        return `
      <div class="swarm-panel">
        <div class="swarm-controls">
          <button class="btn btn-primary" onclick="initializeSwarm()">
            <span class="icon">🚀</span>
            Initialize Swarm
          </button>
          <button class="btn btn-secondary" onclick="refreshSwarmStatus()">
            <span class="icon">🔄</span>
            Refresh
          </button>
        </div>
        <div class="swarm-status">
          <div class="swarm-topology">
            <h4>Topology: <span id="topology">None</span></h4>
            <p>Agents: <span id="agent-count">0</span> active</p>
          </div>
          <div id="agent-list" class="agent-list">
            <div class="no-agents">No swarm initialized</div>
          </div>
        </div>
        <div class="task-queue">
          <h4>Task Queue</h4>
          <div id="task-list" class="task-list">
            <div class="no-tasks">No tasks queued</div>
          </div>
        </div>
      </div>
    `;
    }
    generatePerformanceHTML() {
        const analytics = this.llmStatsService?.getAnalytics() || null;
        const systemHealth = this.llmStatsService?.getSystemHealth() || null;
        const memoryUsage = process.memoryUsage();
        const uptime = process.uptime();
        const formatBytes = (bytes) => {
            if (bytes === 0)
                return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };
        const formatUptime = (seconds) => {
            const days = Math.floor(seconds / 86400);
            const hours = Math.floor((seconds % 86400) / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = Math.floor(seconds % 60);
            if (days > 0)
                return `${days}d ${hours}h ${minutes}m`;
            if (hours > 0)
                return `${hours}h ${minutes}m ${secs}s`;
            if (minutes > 0)
                return `${minutes}m ${secs}s`;
            return `${secs}s`;
        };
        const formatDuration = (ms) => {
            if (ms < 1000)
                return `${Math.round(ms)}ms`;
            return `${(ms / 1000).toFixed(1)}s`;
        };
        const formatNumber = (num) => {
            if (num >= 1000000)
                return `${(num / 1000000).toFixed(1)}M`;
            if (num >= 1000)
                return `${(num / 1000).toFixed(1)}K`;
            return num.toString();
        };
        const getStatusColor = (value, thresholds) => {
            if (value >= thresholds.critical)
                return '#f85149';
            if (value >= thresholds.warning)
                return '#d29922';
            return '#238636';
        };
        const memoryUsagePercent = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);
        const memoryColor = getStatusColor(memoryUsagePercent, { warning: 70, critical: 85 });
        return `
      <div class="performance-panel">
        <!-- Performance Header -->
        <div class="performance-header">
          <h3>📊 System Performance Monitor</h3>
          <div class="performance-controls">
            <button class="btn btn-secondary" onclick="refreshPerformanceMetrics()" title="Refresh metrics">
              <span class="icon">🔄</span>
              Refresh
            </button>
            <button class="btn btn-secondary" onclick="exportPerformanceReport()" title="Export performance data">
              <span class="icon">📊</span>
              Export
            </button>
            <button class="btn btn-secondary" onclick="toggleRealTimeMonitoring()" title="Toggle real-time monitoring">
              <span class="icon">⚡</span>
              <span id="realtime-status">Real-time</span>
            </button>
          </div>
        </div>

        <!-- System Overview -->
        <div class="performance-overview">
          <div class="perf-metric-grid">
            <div class="perf-metric-card">
              <div class="perf-metric-header">
                <span class="perf-icon">⚡</span>
                <h4>System Uptime</h4>
              </div>
              <div class="perf-metric-value large">${formatUptime(uptime)}</div>
              <div class="perf-metric-label">Running continuously</div>
            </div>

            <div class="perf-metric-card">
              <div class="perf-metric-header">
                <span class="perf-icon">💾</span>
                <h4>Memory Usage</h4>
              </div>
              <div class="perf-progress-container">
                <div class="perf-progress-bar">
                  <div class="perf-progress-fill" style="width: ${memoryUsagePercent}%; background-color: ${memoryColor}"></div>
                </div>
                <div class="perf-progress-text">${memoryUsagePercent}%</div>
              </div>
              <div class="perf-metric-details">
                <span>Used: ${formatBytes(memoryUsage.heapUsed)}</span>
                <span>Total: ${formatBytes(memoryUsage.heapTotal)}</span>
              </div>
            </div>

            <div class="perf-metric-card">
              <div class="perf-metric-header">
                <span class="perf-icon">🔥</span>
                <h4>CPU Usage</h4>
              </div>
              <div id="cpu-usage-container">
                <div class="perf-metric-value large" id="cpu-percentage">Loading...</div>
                <div class="perf-metric-label">Current load</div>
                <div class="perf-progress-bar">
                  <div class="perf-progress-fill" id="cpu-progress-bar" style="width: 0%; background-color: #238636"></div>
                </div>
              </div>
            </div>

            <div class="perf-metric-card">
              <div class="perf-metric-header">
                <span class="perf-icon">📈</span>
                <h4>Event Loop Lag</h4>
              </div>
              <div id="event-loop-container">
                <div class="perf-metric-value large" id="event-loop-lag">Loading...</div>
                <div class="perf-metric-label">Milliseconds</div>
                <div class="perf-metric-status" id="event-loop-status">Measuring...</div>
              </div>
            </div>
          </div>
        </div>

        <!-- LLM Performance Integration -->
        ${analytics && systemHealth ? `
        <div class="llm-performance-section">
          <h4>🧠 LLM System Performance</h4>
          <div class="llm-perf-grid">
            <div class="llm-perf-card">
              <div class="llm-perf-header">
                <span class="llm-perf-icon">⚡</span>
                <h5>Response Time</h5>
              </div>
              <div class="llm-perf-value">${formatDuration(analytics.summary.averageResponseTime)}</div>
              <div class="llm-perf-trend ${analytics.summary.averageResponseTime < 2000 ? 'good' : analytics.summary.averageResponseTime < 5000 ? 'warning' : 'critical'}">
                ${analytics.summary.averageResponseTime < 2000 ? '✓ Excellent' : analytics.summary.averageResponseTime < 5000 ? '⚠ Fair' : '⚠ Slow'}
              </div>
            </div>

            <div class="llm-perf-card">
              <div class="llm-perf-header">
                <span class="llm-perf-icon">📊</span>
                <h5>Throughput</h5>
              </div>
              <div class="llm-perf-value">${systemHealth.systemThroughput.toFixed(1)} calls/min</div>
              <div class="llm-perf-trend good">📈 ${formatNumber(analytics.summary.totalCalls)} total</div>
            </div>

            <div class="llm-perf-card">
              <div class="llm-perf-header">
                <span class="llm-perf-icon">✅</span>
                <h5>Success Rate</h5>
              </div>
              <div class="llm-perf-value">${Math.round(analytics.summary.successRate * 100)}%</div>
              <div class="llm-perf-trend ${analytics.summary.successRate > 0.95 ? 'good' : analytics.summary.successRate > 0.85 ? 'warning' : 'critical'}">
                ${analytics.summary.successRate > 0.95 ? '✓ Excellent' : analytics.summary.successRate > 0.85 ? '⚠ Good' : '❌ Needs attention'}
              </div>
            </div>

            <div class="llm-perf-card">
              <div class="llm-perf-header">
                <span class="llm-perf-icon">🏥</span>
                <h5>System Health</h5>
              </div>
              <div class="llm-perf-value">${systemHealth.healthScore}/100</div>
              <div class="llm-perf-trend ${systemHealth.overallHealth === 'excellent' ? 'good' : systemHealth.overallHealth === 'good' ? 'warning' : 'critical'}">
                ${systemHealth.overallHealth.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
        ` : ''}

        <!-- Real-time Charts -->
        <div class="performance-charts">
          <div class="chart-container">
            <h4>📈 Real-time System Metrics</h4>
            <div class="chart-tabs">
              <button class="chart-tab active" onclick="switchChart('system')">System</button>
              <button class="chart-tab" onclick="switchChart('memory')">Memory</button>
              <button class="chart-tab" onclick="switchChart('llm')">LLM</button>
              <button class="chart-tab" onclick="switchChart('network')">Network</button>
            </div>
            <div class="chart-content">
              <canvas id="performance-chart" width="800" height="300"></canvas>
            </div>
          </div>

          <div class="metrics-sidebar">
            <h4>📊 Live Metrics</h4>
            <div class="live-metrics">
              <div class="live-metric">
                <span class="metric-label">Requests/sec:</span>
                <span class="metric-value" id="requests-per-sec">0</span>
              </div>
              <div class="live-metric">
                <span class="metric-label">Active connections:</span>
                <span class="metric-value" id="active-connections">0</span>
              </div>
              <div class="live-metric">
                <span class="metric-label">Error rate:</span>
                <span class="metric-value" id="error-rate">${systemHealth ? (systemHealth.errorRate * 100).toFixed(1) : '0'}%</span>
              </div>
              <div class="live-metric">
                <span class="metric-label">Cache hit ratio:</span>
                <span class="metric-value" id="cache-hit-ratio">N/A</span>
              </div>
              <div class="live-metric">
                <span class="metric-label">GC pressure:</span>
                <span class="metric-value" id="gc-pressure">Low</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Alerts -->
        <div class="performance-alerts" id="performance-alerts">
          <h4>🚨 Performance Alerts</h4>
          <div class="alert-list" id="alert-list">
            ${memoryUsagePercent > 85 ? `
            <div class="perf-alert critical">
              <span class="alert-icon">🔴</span>
              <div class="alert-content">
                <span class="alert-message">Critical: Memory usage at ${memoryUsagePercent}%</span>
                <span class="alert-time">${new Date().toLocaleTimeString()}</span>
              </div>
            </div>
            ` : memoryUsagePercent > 70 ? `
            <div class="perf-alert warning">
              <span class="alert-icon">⚠️</span>
              <div class="alert-content">
                <span class="alert-message">Warning: Memory usage at ${memoryUsagePercent}%</span>
                <span class="alert-time">${new Date().toLocaleTimeString()}</span>
              </div>
            </div>
            ` : ''}
            ${systemHealth && systemHealth.alerts ? systemHealth.alerts.slice(0, 3).map(alert => `
            <div class="perf-alert ${alert.level}">
              <span class="alert-icon">${alert.level === 'critical' ? '🔴' : alert.level === 'error' ? '❌' : alert.level === 'warning' ? '⚠️' : 'ℹ️'}</span>
              <div class="alert-content">
                <span class="alert-message">${alert.message}</span>
                <span class="alert-time">${alert.timestamp.toLocaleTimeString()}</span>
              </div>
            </div>
            `).join('') : ''}
            <div class="perf-alert info" id="no-alerts" style="display: ${memoryUsagePercent <= 70 && (!systemHealth || systemHealth.alerts.length === 0) ? 'flex' : 'none'}">
              <span class="alert-icon">✅</span>
              <div class="alert-content">
                <span class="alert-message">System performance is optimal</span>
                <span class="alert-time">${new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Recommendations -->
        <div class="performance-recommendations">
          <h4>💡 Performance Recommendations</h4>
          <div class="recommendation-list">
            ${memoryUsagePercent > 80 ? `
            <div class="recommendation">
              <span class="rec-icon">💾</span>
              <div class="rec-content">
                <span class="rec-title">Memory Optimization</span>
                <span class="rec-description">High memory usage detected. Consider running garbage collection or restarting the application.</span>
              </div>
            </div>
            ` : ''}
            ${systemHealth && systemHealth.recommendations ? systemHealth.recommendations.map(rec => `
            <div class="recommendation">
              <span class="rec-icon">🧠</span>
              <div class="rec-content">
                <span class="rec-title">LLM Optimization</span>
                <span class="rec-description">${rec}</span>
              </div>
            </div>
            `).join('') : ''}
            <div class="recommendation">
              <span class="rec-icon">📊</span>
              <div class="rec-content">
                <span class="rec-title">Monitoring Enhancement</span>
                <span class="rec-description">Enable detailed logging and profiling for better performance insights.</span>
              </div>
            </div>
            <div class="recommendation">
              <span class="rec-icon">⚡</span>
              <div class="rec-content">
                <span class="rec-title">Performance Tuning</span>
                <span class="rec-description">Consider implementing response caching and connection pooling for improved throughput.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Resource Utilization Details -->
        <div class="resource-details">
          <h4>🔧 Resource Utilization Details</h4>
          <div class="resource-grid">
            <div class="resource-item">
              <span class="resource-label">Heap Size:</span>
              <span class="resource-value">${formatBytes(memoryUsage.heapTotal)}</span>
            </div>
            <div class="resource-item">
              <span class="resource-label">Heap Used:</span>
              <span class="resource-value">${formatBytes(memoryUsage.heapUsed)}</span>
            </div>
            <div class="resource-item">
              <span class="resource-label">External:</span>
              <span class="resource-value">${formatBytes(memoryUsage.external)}</span>
            </div>
            <div class="resource-item">
              <span class="resource-label">Array Buffers:</span>
              <span class="resource-value">${formatBytes(memoryUsage.arrayBuffers)}</span>
            </div>
            <div class="resource-item">
              <span class="resource-label">RSS:</span>
              <span class="resource-value">${formatBytes(memoryUsage.rss)}</span>
            </div>
            <div class="resource-item">
              <span class="resource-label">Node.js Version:</span>
              <span class="resource-value">${process.version}</span>
            </div>
            <div class="resource-item">
              <span class="resource-label">Platform:</span>
              <span class="resource-value">${process.platform} ${process.arch}</span>
            </div>
            <div class="resource-item">
              <span class="resource-label">PID:</span>
              <span class="resource-value">${process.pid}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance JavaScript -->
      <script>
        // Performance monitoring JavaScript
        let performanceChart;
        let currentChartType = 'system';
        let realTimeMonitoring = true;
        let performanceData = {
          timestamps: [],
          cpu: [],
          memory: [],
          eventLoop: [],
          llmLatency: [],
          errorRate: []
        };

        // Initialize performance monitoring
        function initializePerformanceMonitor() {
          // Start real-time monitoring
          if (realTimeMonitoring) {
            setInterval(updatePerformanceMetrics, 2000); // Update every 2 seconds
            setInterval(updateLiveCharts, 1000); // Update charts every second
          }

          // Initialize chart
          initializePerformanceChart();

          // Start CPU monitoring
          startCPUMonitoring();

          // Start event loop monitoring
          startEventLoopMonitoring();
        }

        function initializePerformanceChart() {
          const canvas = document.getElementById('performance-chart');
          if (!canvas) return;
          
          const ctx = canvas.getContext('2d');
          performanceChart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: [],
              datasets: [
                {
                  label: 'CPU %',
                  data: [],
                  borderColor: '#58a6ff',
                  backgroundColor: 'rgba(88, 166, 255, 0.1)',
                  tension: 0.4
                },
                {
                  label: 'Memory %',
                  data: [],
                  borderColor: '#f85149',
                  backgroundColor: 'rgba(248, 81, 73, 0.1)',
                  tension: 0.4
                },
                {
                  label: 'Event Loop Lag (ms)',
                  data: [],
                  borderColor: '#a5a5a5',
                  backgroundColor: 'rgba(165, 165, 165, 0.1)',
                  tension: 0.4,
                  yAxisID: 'y1'
                }
              ]
            },
            options: {
              responsive: true,
              interaction: {
                mode: 'index',
                intersect: false
              },
              scales: {
                x: {
                  display: true,
                  title: {
                    display: true,
                    text: 'Time'
                  }
                },
                y: {
                  type: 'linear',
                  display: true,
                  position: 'left',
                  title: {
                    display: true,
                    text: 'Percentage (%)'
                  },
                  min: 0,
                  max: 100
                },
                y1: {
                  type: 'linear',
                  display: true,
                  position: 'right',
                  title: {
                    display: true,
                    text: 'Latency (ms)'
                  },
                  grid: {
                    drawOnChartArea: false
                  },
                  min: 0
                }
              },
              plugins: {
                title: {
                  display: true,
                  text: 'Real-time System Performance'
                },
                legend: {
                  display: true
                }
              }
            }
          });
        }

        function updatePerformanceMetrics() {
          // This would typically make an API call to get fresh metrics
          fetch('/api/performance/metrics')
            .then(response => response.json())
            .then(data => {
              updateMetricDisplays(data);
            })
            .catch(error => {
              console.log('Performance metrics not available:', error);
              // Simulate some data for demonstration
              simulatePerformanceData();
            });
        }

        function simulatePerformanceData() {
          const now = new Date();
          const timestamp = now.toLocaleTimeString();
          
          // Simulate CPU usage
          const cpuUsage = Math.random() * 30 + 10; // 10-40%
          document.getElementById('cpu-percentage').textContent = cpuUsage.toFixed(1) + '%';
          const cpuProgressBar = document.getElementById('cpu-progress-bar');
          if (cpuProgressBar) {
            cpuProgressBar.style.width = cpuUsage + '%';
            cpuProgressBar.style.backgroundColor = cpuUsage > 70 ? '#f85149' : cpuUsage > 40 ? '#d29922' : '#238636';
          }

          // Simulate event loop lag
          const eventLoopLag = Math.random() * 5 + 1; // 1-6ms
          const eventLoopElement = document.getElementById('event-loop-lag');
          if (eventLoopElement) {
            eventLoopElement.textContent = eventLoopLag.toFixed(1) + 'ms';
          }
          const eventLoopStatus = document.getElementById('event-loop-status');
          if (eventLoopStatus) {
            eventLoopStatus.textContent = eventLoopLag < 2 ? 'Excellent' : eventLoopLag < 4 ? 'Good' : 'Needs attention';
            eventLoopStatus.className = 'perf-metric-status ' + (eventLoopLag < 2 ? 'good' : eventLoopLag < 4 ? 'warning' : 'critical');
          }

          // Update live metrics
          document.getElementById('requests-per-sec').textContent = (Math.random() * 50 + 10).toFixed(1);
          document.getElementById('active-connections').textContent = Math.floor(Math.random() * 20 + 5);
          
          // Update performance data for charts
          updatePerformanceData(timestamp, cpuUsage, ${memoryUsagePercent}, eventLoopLag);
        }

        function updatePerformanceData(timestamp, cpu, memory, eventLoop) {
          const maxDataPoints = 50;
          
          performanceData.timestamps.push(timestamp);
          performanceData.cpu.push(cpu);
          performanceData.memory.push(memory);
          performanceData.eventLoop.push(eventLoop);
          
          // Keep only last N data points
          if (performanceData.timestamps.length > maxDataPoints) {
            performanceData.timestamps.shift();
            performanceData.cpu.shift();
            performanceData.memory.shift();
            performanceData.eventLoop.shift();
          }
        }

        function updateLiveCharts() {
          if (!performanceChart) return;
          
          performanceChart.data.labels = performanceData.timestamps;
          performanceChart.data.datasets[0].data = performanceData.cpu;
          performanceChart.data.datasets[1].data = performanceData.memory;
          performanceChart.data.datasets[2].data = performanceData.eventLoop;
          
          performanceChart.update('none'); // No animation for smooth real-time updates
        }

        function switchChart(type) {
          currentChartType = type;
          
          // Update tab appearance
          document.querySelectorAll('.chart-tab').forEach(tab => tab.classList.remove('active'));
          event.target.classList.add('active');
          
          // This would switch chart data based on type
          console.log('Switched to chart type:', type);
        }

        function refreshPerformanceMetrics() {
          updatePerformanceMetrics();
          // Show refresh feedback
          const btn = event.target.closest('button');
          const originalText = btn.innerHTML;
          btn.innerHTML = '<span class="icon">⏳</span> Refreshing...';
          btn.disabled = true;
          
          setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
          }, 1000);
        }

        function toggleRealTimeMonitoring() {
          realTimeMonitoring = !realTimeMonitoring;
          const statusElement = document.getElementById('realtime-status');
          if (statusElement) {
            statusElement.textContent = realTimeMonitoring ? 'Real-time' : 'Paused';
          }
          
          if (realTimeMonitoring) {
            initializePerformanceMonitor();
          }
        }

        function exportPerformanceReport() {
          const reportData = {
            timestamp: new Date().toISOString(),
            systemInfo: {
              nodeVersion: '${process.version}',
              platform: '${process.platform}',
              arch: '${process.arch}',
              uptime: ${uptime},
              pid: ${process.pid}
            },
            memoryUsage: {
              heapUsed: ${memoryUsage.heapUsed},
              heapTotal: ${memoryUsage.heapTotal},
              external: ${memoryUsage.external},
              arrayBuffers: ${memoryUsage.arrayBuffers},
              rss: ${memoryUsage.rss}
            },
            performanceData: performanceData
          };
          
          const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = \`performance-report-\${new Date().toISOString().split('T')[0]}.json\`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }

        // Initialize when the page loads
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initializePerformanceMonitor);
        } else {
          initializePerformanceMonitor();
        }
      </script>
    `;
    }
    generateLogsHTML() {
        return `
      <div class="logs-panel">
        <!-- Logs Header -->
        <div class="logs-header">
          <div class="logs-title">
            <h3>📝 Live System Logs</h3>
            <span class="logs-count" id="logs-count">0 entries</span>
          </div>
          <div class="logs-status">
            <span class="connection-status" id="connection-status">
              <span class="status-dot connected"></span>
              Live
            </span>
          </div>
        </div>

        <!-- Advanced Controls -->
        <div class="logs-controls">
          <!-- Filter Controls -->
          <div class="filter-group">
            <label for="log-level">Level:</label>
            <select id="log-level" class="log-filter" onchange="filterLogs()">
              <option value="all">All Levels</option>
              <option value="error">Error</option>
              <option value="warn">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
              <option value="trace">Trace</option>
            </select>

            <label for="log-source">Source:</label>
            <select id="log-source" class="log-filter" onchange="filterLogs()">
              <option value="all">All Sources</option>
              <option value="system">System</option>
              <option value="swarm-coordinator">Swarm</option>
              <option value="neural-network">Neural</option>
              <option value="mcp-server">MCP</option>
              <option value="database">Database</option>
              <option value="coordination">Coordination</option>
              <option value="llm">LLM</option>
              <option value="terminal">Terminal</option>
            </select>

            <input 
              type="text" 
              id="log-search" 
              class="log-search" 
              placeholder="Search logs..." 
              oninput="searchLogs()"
            >
          </div>

          <!-- Action Controls -->
          <div class="action-group">
            <button class="btn btn-secondary" id="auto-scroll-btn" onclick="toggleAutoScroll()">
              <span class="icon">📜</span>
              <span id="auto-scroll-text">Auto-scroll</span>
            </button>
            
            <button class="btn btn-secondary" onclick="pauseLogging()">
              <span class="icon" id="pause-icon">⏸️</span>
              <span id="pause-text">Pause</span>
            </button>

            <button class="btn btn-secondary" onclick="exportLogs()">
              <span class="icon">📥</span>
              Export
            </button>

            <button class="btn btn-secondary" onclick="clearLogs()">
              <span class="icon">🗑️</span>
              Clear
            </button>

            <button class="btn btn-secondary" onclick="refreshLogs()">
              <span class="icon">🔄</span>
              Refresh
            </button>
          </div>
        </div>

        <!-- Log Statistics -->
        <div class="logs-stats">
          <div class="stat-item">
            <span class="stat-label">Total:</span>
            <span class="stat-value" id="total-logs">0</span>
          </div>
          <div class="stat-item error">
            <span class="stat-label">Errors:</span>
            <span class="stat-value" id="error-logs">0</span>
          </div>
          <div class="stat-item warning">
            <span class="stat-label">Warnings:</span>
            <span class="stat-value" id="warning-logs">0</span>
          </div>
          <div class="stat-item info">
            <span class="stat-label">Info:</span>
            <span class="stat-value" id="info-logs">0</span>
          </div>
          <div class="stat-item debug">
            <span class="stat-label">Debug:</span>
            <span class="stat-value" id="debug-logs">0</span>
          </div>
        </div>

        <!-- Main Log Container -->
        <div id="logs-container" class="logs-container">
          <div class="logs-placeholder">
            <div class="placeholder-icon">📝</div>
            <div class="placeholder-text">Waiting for log entries...</div>
            <div class="placeholder-subtext">Real-time logs will appear here</div>
          </div>
        </div>

        <!-- Log Entry Template (hidden) -->
        <template id="log-entry-template">
          <div class="log-entry" data-level="" data-source="" data-timestamp="">
            <div class="log-meta">
              <span class="log-timestamp"></span>
              <span class="log-level"></span>
              <span class="log-source"></span>
            </div>
            <div class="log-content">
              <div class="log-message"></div>
              <div class="log-metadata" style="display: none;"></div>
            </div>
            <div class="log-actions">
              <button class="log-action-btn" onclick="toggleLogMetadata(this)" title="Show metadata">
                <span class="icon">ℹ️</span>
              </button>
              <button class="log-action-btn" onclick="copyLogEntry(this)" title="Copy log entry">
                <span class="icon">📋</span>
              </button>
            </div>
          </div>
        </template>
      </div>

      <style>
        /* Logs Panel Styles */
        .logs-panel {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--bg-color, #1a1a1a);
          color: var(--text-color, #ffffff);
        }

        .logs-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid var(--border-color, #333);
        }

        .logs-title h3 {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logs-count {
          font-size: 0.85em;
          color: var(--text-secondary, #999);
          margin-left: 8px;
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.9em;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .status-dot.connected {
          background-color: #00ff00;
        }

        .status-dot.disconnected {
          background-color: #ff4444;
          animation: none;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .logs-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color, #333);
          background: var(--bg-secondary, #2a2a2a);
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .filter-group label {
          font-size: 0.9em;
          color: var(--text-secondary, #999);
        }

        .log-filter {
          background: var(--input-bg, #333);
          border: 1px solid var(--border-color, #555);
          color: var(--text-color, #fff);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.9em;
        }

        .log-search {
          background: var(--input-bg, #333);
          border: 1px solid var(--border-color, #555);
          color: var(--text-color, #fff);
          padding: 6px 12px;
          border-radius: 4px;
          min-width: 200px;
        }

        .action-group {
          display: flex;
          gap: 8px;
        }

        .logs-stats {
          display: flex;
          gap: 24px;
          padding: 8px 16px;
          background: var(--bg-tertiary, #1e1e1e);
          border-bottom: 1px solid var(--border-color, #333);
          font-size: 0.85em;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .stat-label {
          color: var(--text-secondary, #999);
        }

        .stat-value {
          font-weight: bold;
          color: var(--text-color, #fff);
        }

        .stat-item.error .stat-value {
          color: #ff4444;
        }

        .stat-item.warning .stat-value {
          color: #ffaa00;
        }

        .stat-item.info .stat-value {
          color: #00aaff;
        }

        .stat-item.debug .stat-value {
          color: #999;
        }

        .logs-container {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
          background: var(--bg-color, #1a1a1a);
          scroll-behavior: smooth;
        }

        .logs-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: var(--text-secondary, #666);
          text-align: center;
        }

        .placeholder-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .placeholder-text {
          font-size: 1.1em;
          margin-bottom: 8px;
        }

        .placeholder-subtext {
          font-size: 0.9em;
          opacity: 0.7;
        }

        .log-entry {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 8px 12px;
          margin-bottom: 2px;
          border-radius: 4px;
          transition: background-color 0.2s;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          line-height: 1.4;
        }

        .log-entry:hover {
          background: var(--bg-secondary, #2a2a2a);
        }

        .log-entry.error {
          border-left: 3px solid #ff4444;
          background: rgba(255, 68, 68, 0.05);
        }

        .log-entry.warn {
          border-left: 3px solid #ffaa00;
          background: rgba(255, 170, 0, 0.05);
        }

        .log-entry.info {
          border-left: 3px solid #00aaff;
          background: rgba(0, 170, 255, 0.05);
        }

        .log-entry.debug {
          border-left: 3px solid #999;
          background: rgba(153, 153, 153, 0.05);
        }

        .log-entry.trace {
          border-left: 3px solid #666;
          background: rgba(102, 102, 102, 0.05);
        }

        .log-entry.filtered {
          display: none;
        }

        .log-meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 180px;
          font-size: 0.8em;
        }

        .log-timestamp {
          color: var(--text-secondary, #888);
        }

        .log-level {
          font-weight: bold;
          text-transform: uppercase;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 0.75em;
          text-align: center;
        }

        .log-level.error {
          background: #ff4444;
          color: white;
        }

        .log-level.warn {
          background: #ffaa00;
          color: black;
        }

        .log-level.info {
          background: #00aaff;
          color: white;
        }

        .log-level.debug {
          background: #999;
          color: white;
        }

        .log-level.trace {
          background: #666;
          color: white;
        }

        .log-source {
          color: var(--accent-color, #00ff88);
          font-size: 0.75em;
        }

        .log-content {
          flex: 1;
        }

        .log-message {
          word-break: break-word;
          white-space: pre-wrap;
        }

        .log-metadata {
          margin-top: 8px;
          padding: 8px;
          background: var(--bg-tertiary, #1e1e1e);
          border-radius: 4px;
          font-size: 0.85em;
          color: var(--text-secondary, #999);
          white-space: pre-wrap;
        }

        .log-actions {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .log-action-btn {
          background: none;
          border: none;
          color: var(--text-secondary, #666);
          cursor: pointer;
          padding: 2px;
          border-radius: 2px;
          font-size: 0.8em;
          transition: color 0.2s;
        }

        .log-action-btn:hover {
          color: var(--accent-color, #00ff88);
          background: var(--bg-secondary, #2a2a2a);
        }

        /* Auto-scroll indicator */
        .auto-scroll-active #auto-scroll-btn {
          background: var(--accent-color, #00ff88) !important;
          color: black !important;
        }

        /* Paused state */
        .logging-paused .connection-status .status-dot {
          background-color: #ffaa00 !important;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .logs-controls {
            flex-direction: column;
            gap: 12px;
          }

          .filter-group {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }

          .log-entry {
            flex-direction: column;
            gap: 8px;
          }

          .log-meta {
            min-width: auto;
            flex-direction: row;
            flex-wrap: wrap;
          }
        }
      </style>

      <script>
        // Logs Panel JavaScript
        (function() {
          let autoScroll = true;
          let loggingPaused = false;
          let logEntries = [];
          let filteredEntries = [];
          let socket = null;
          
          // Initialize logs panel
          function initLogsPanel() {
            // Connect to WebSocket for real-time updates
            connectWebSocket();
            
            // Load initial logs
            loadInitialLogs();
            
            // Update stats
            updateLogStats();
            
            // Setup keyboard shortcuts
            setupKeyboardShortcuts();
          }
          
          // Connect to WebSocket
          function connectWebSocket() {
            if (typeof io !== 'undefined') {
              socket = io();
              
              socket.on('connect', () => {
                document.getElementById('connection-status').innerHTML = 
                  '<span class="status-dot connected"></span>Live';
                document.body.classList.remove('logging-paused');
              });
              
              socket.on('disconnect', () => {
                document.getElementById('connection-status').innerHTML = 
                  '<span class="status-dot disconnected"></span>Offline';
              });
              
              // Subscribe to logs channel
              socket.emit('subscribe', 'logs');
              
              // Handle real-time log updates
              socket.on('logs:new', (data) => {
                if (!loggingPaused && data.data) {
                  addLogEntry(data.data);
                }
              });
              
              // Handle bulk log updates
              socket.on('logs:bulk', (data) => {
                if (!loggingPaused && data.data && Array.isArray(data.data)) {
                  data.data.forEach(entry => addLogEntry(entry));
                }
              });
            }
          }
          
          // Load initial logs from server
          async function loadInitialLogs() {
            try {
              const response = await fetch('/api/logs');
              if (response.ok) {
                const data = await response.json();
                if (data.logs) {
                  logEntries = data.logs;
                  renderLogs();
                  updateLogStats();
                }
              }
            } catch (error) {
              console.error('Failed to load initial logs:', error);
              // Add fallback sample logs for development
              addSampleLogs();
            }
          }
          
          // Add sample logs for development
          function addSampleLogs() {
            const samples = [
              { level: 'info', component: 'system', message: 'Web dashboard initialized', timestamp: new Date() },
              { level: 'info', component: 'swarm-coordinator', message: 'Swarm system ready', timestamp: new Date() },
              { level: 'debug', component: 'neural-network', message: 'Neural patterns loaded', timestamp: new Date() },
              { level: 'warn', component: 'mcp-server', message: 'MCP connection timeout, retrying...', timestamp: new Date() },
              { level: 'error', component: 'database', message: 'Connection failed: timeout', timestamp: new Date() }
            ];
            
            samples.forEach(entry => addLogEntry(entry));
          }
          
          // Add new log entry
          function addLogEntry(entry) {
            const logEntry = {
              id: entry.id || \`log-\${Date.now()}-\${Math.random()}\`,
              timestamp: entry.timestamp instanceof Date ? entry.timestamp : new Date(entry.timestamp || Date.now()),
              level: entry.level || 'info',
              component: entry.component || 'system',
              message: entry.message || '',
              metadata: entry.metadata || null,
              ...entry
            };
            
            logEntries.unshift(logEntry);
            
            // Keep only last 1000 entries
            if (logEntries.length > 1000) {
              logEntries.splice(1000);
            }
            
            // Re-render if entry matches current filters
            if (matchesCurrentFilters(logEntry)) {
              renderSingleLogEntry(logEntry, true);
            }
            
            updateLogStats();
            
            // Auto-scroll if enabled
            if (autoScroll) {
              const container = document.getElementById('logs-container');
              container.scrollTop = container.scrollHeight;
            }
          }
          
          // Check if log entry matches current filters
          function matchesCurrentFilters(entry) {
            const levelFilter = document.getElementById('log-level').value;
            const sourceFilter = document.getElementById('log-source').value;
            const searchTerm = document.getElementById('log-search').value.toLowerCase();
            
            // Level filter
            if (levelFilter !== 'all' && entry.level !== levelFilter) {
              return false;
            }
            
            // Source filter
            if (sourceFilter !== 'all' && entry.component !== sourceFilter) {
              return false;
            }
            
            // Search filter
            if (searchTerm && !entry.message.toLowerCase().includes(searchTerm)) {
              return false;
            }
            
            return true;
          }
          
          // Render single log entry
          function renderSingleLogEntry(entry, prepend = false) {
            const container = document.getElementById('logs-container');
            const template = document.getElementById('log-entry-template');
            const clone = template.content.cloneNode(true);
            
            const logElement = clone.querySelector('.log-entry');
            logElement.classList.add(entry.level);
            logElement.setAttribute('data-level', entry.level);
            logElement.setAttribute('data-source', entry.component);
            logElement.setAttribute('data-timestamp', entry.timestamp.toISOString());
            logElement.setAttribute('data-id', entry.id);
            
            // Set timestamp
            clone.querySelector('.log-timestamp').textContent = 
              entry.timestamp.toLocaleTimeString();
            
            // Set level
            const levelElement = clone.querySelector('.log-level');
            levelElement.textContent = entry.level.toUpperCase();
            levelElement.classList.add(entry.level);
            
            // Set source
            clone.querySelector('.log-source').textContent = entry.component;
            
            // Set message
            clone.querySelector('.log-message').textContent = entry.message;
            
            // Set metadata if available
            if (entry.metadata) {
              const metadataElement = clone.querySelector('.log-metadata');
              metadataElement.textContent = JSON.stringify(entry.metadata, null, 2);
            }
            
            // Remove placeholder if present
            const placeholder = container.querySelector('.logs-placeholder');
            if (placeholder) {
              placeholder.remove();
            }
            
            if (prepend) {
              container.insertBefore(clone, container.firstChild);
            } else {
              container.appendChild(clone);
            }
          }
          
          // Render all logs
          function renderLogs() {
            const container = document.getElementById('logs-container');
            container.innerHTML = '';
            
            const filtered = getFilteredLogs();
            
            if (filtered.length === 0) {
              container.innerHTML = \`
                <div class="logs-placeholder">
                  <div class="placeholder-icon">🔍</div>
                  <div class="placeholder-text">No logs match current filters</div>
                  <div class="placeholder-subtext">Try adjusting your filter settings</div>
                </div>
              \`;
              return;
            }
            
            filtered.forEach(entry => {
              renderSingleLogEntry(entry, false);
            });
            
            if (autoScroll) {
              container.scrollTop = container.scrollHeight;
            }
          }
          
          // Get filtered logs
          function getFilteredLogs() {
            const levelFilter = document.getElementById('log-level').value;
            const sourceFilter = document.getElementById('log-source').value;
            const searchTerm = document.getElementById('log-search').value.toLowerCase();
            
            return logEntries.filter(entry => {
              if (levelFilter !== 'all' && entry.level !== levelFilter) return false;
              if (sourceFilter !== 'all' && entry.component !== sourceFilter) return false;
              if (searchTerm && !entry.message.toLowerCase().includes(searchTerm)) return false;
              return true;
            });
          }
          
          // Update log statistics
          function updateLogStats() {
            const total = logEntries.length;
            const errors = logEntries.filter(e => e.level === 'error').length;
            const warnings = logEntries.filter(e => e.level === 'warn').length;
            const info = logEntries.filter(e => e.level === 'info').length;
            const debug = logEntries.filter(e => e.level === 'debug').length;
            
            document.getElementById('logs-count').textContent = \`\${total} entries\`;
            document.getElementById('total-logs').textContent = total;
            document.getElementById('error-logs').textContent = errors;
            document.getElementById('warning-logs').textContent = warnings;
            document.getElementById('info-logs').textContent = info;
            document.getElementById('debug-logs').textContent = debug;
          }
          
          // Filter logs
          window.filterLogs = function() {
            renderLogs();
          };
          
          // Search logs
          window.searchLogs = function() {
            renderLogs();
          };
          
          // Toggle auto-scroll
          window.toggleAutoScroll = function() {
            autoScroll = !autoScroll;
            const btn = document.getElementById('auto-scroll-btn');
            const text = document.getElementById('auto-scroll-text');
            
            if (autoScroll) {
              btn.classList.add('auto-scroll-active');
              text.textContent = 'Auto-scroll';
              
              // Scroll to bottom
              const container = document.getElementById('logs-container');
              container.scrollTop = container.scrollHeight;
            } else {
              btn.classList.remove('auto-scroll-active');
              text.textContent = 'Manual';
            }
          };
          
          // Pause/resume logging
          window.pauseLogging = function() {
            loggingPaused = !loggingPaused;
            const icon = document.getElementById('pause-icon');
            const text = document.getElementById('pause-text');
            
            if (loggingPaused) {
              icon.textContent = '▶️';
              text.textContent = 'Resume';
              document.body.classList.add('logging-paused');
            } else {
              icon.textContent = '⏸️';
              text.textContent = 'Pause';
              document.body.classList.remove('logging-paused');
            }
          };
          
          // Clear logs
          window.clearLogs = function() {
            if (confirm('Clear all log entries? This action cannot be undone.')) {
              logEntries = [];
              const container = document.getElementById('logs-container');
              container.innerHTML = \`
                <div class="logs-placeholder">
                  <div class="placeholder-icon">📝</div>
                  <div class="placeholder-text">Logs cleared</div>
                  <div class="placeholder-subtext">New logs will appear here</div>
                </div>
              \`;
              updateLogStats();
            }
          };
          
          // Refresh logs
          window.refreshLogs = function() {
            loadInitialLogs();
          };
          
          // Export logs
          window.exportLogs = function() {
            const filtered = getFilteredLogs();
            const data = filtered.map(entry => ({
              timestamp: entry.timestamp.toISOString(),
              level: entry.level,
              component: entry.component,
              message: entry.message,
              metadata: entry.metadata
            }));
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = \`logs-\${new Date().toISOString().split('T')[0]}.json\`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          };
          
          // Toggle log metadata display
          window.toggleLogMetadata = function(button) {
            const entry = button.closest('.log-entry');
            const metadata = entry.querySelector('.log-metadata');
            
            if (metadata.style.display === 'none') {
              metadata.style.display = 'block';
              button.innerHTML = '<span class="icon">🙈</span>';
              button.title = 'Hide metadata';
            } else {
              metadata.style.display = 'none';
              button.innerHTML = '<span class="icon">ℹ️</span>';
              button.title = 'Show metadata';
            }
          };
          
          // Copy log entry
          window.copyLogEntry = function(button) {
            const entry = button.closest('.log-entry');
            const timestamp = entry.querySelector('.log-timestamp').textContent;
            const level = entry.querySelector('.log-level').textContent;
            const source = entry.querySelector('.log-source').textContent;
            const message = entry.querySelector('.log-message').textContent;
            
            const text = \`\${timestamp} [\${level}] \${source}: \${message}\`;
            
            navigator.clipboard.writeText(text).then(() => {
              button.innerHTML = '<span class="icon">✅</span>';
              setTimeout(() => {
                button.innerHTML = '<span class="icon">📋</span>';
              }, 1000);
            });
          };
          
          // Setup keyboard shortcuts
          function setupKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
              if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                  case 'f':
                    e.preventDefault();
                    document.getElementById('log-search').focus();
                    break;
                  case 'k':
                    e.preventDefault();
                    clearLogs();
                    break;
                  case 'e':
                    e.preventDefault();
                    exportLogs();
                    break;
                }
              }
            });
          }
          
          // Initialize when DOM is ready
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initLogsPanel);
          } else {
            initLogsPanel();
          }
        })();
      </script>
    `;
    }
    generateSettingsHTML() {
        return `
      <div class="settings-panel">
        <div class="settings-section">
          <h4>General Settings</h4>
          <div class="setting-item">
            <label>Theme:</label>
            <select id="theme-selector">
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          <div class="setting-item">
            <label>Auto-refresh interval:</label>
            <input type="range" id="refresh-interval" min="1" max="60" value="5">
            <span id="refresh-value">5s</span>
          </div>
        </div>
        <div class="settings-section">
          <h4>Performance Settings</h4>
          <div class="setting-item">
            <label>
              <input type="checkbox" id="real-time-updates" checked>
              Enable real-time updates
            </label>
          </div>
          <div class="setting-item">
            <label>
              <input type="checkbox" id="performance-monitoring" checked>
              Enable performance monitoring
            </label>
          </div>
        </div>
        <div class="settings-section">
          <h4>System Information</h4>
          <div class="info-grid">
            <div class="info-item">
              <strong>Version:</strong> ${getVersion()}
            </div>
            <div class="info-item">
              <strong>Node.js:</strong> ${process.version}
            </div>
            <div class="info-item">
              <strong>Platform:</strong> ${process.platform}
            </div>
            <div class="info-item">
              <strong>Architecture:</strong> ${process.arch}
            </div>
          </div>
        </div>
      </div>
    `;
    }
    /**
     * Get ADR Manager panel (restored from adr-manager.tsx)
     */
    getADRManagerPanel() {
        return {
            id: 'adr-manager',
            title: 'ADR Manager',
            icon: '📋',
            content: this.generateADRManagerHTML(),
        };
    }
    /**
     * Get Command Palette panel (restored from command-palette.tsx)
     */
    getCommandPalettePanel() {
        return {
            id: 'command-palette',
            title: 'Command Palette',
            icon: '🔧',
            content: this.generateCommandPaletteHTML(),
        };
    }
    /**
     * Get File Browser panel (restored from file-browser.tsx)
     */
    getFileBrowserPanel() {
        return {
            id: 'file-browser',
            title: 'File Browser',
            icon: '📁',
            content: this.generateFileBrowserHTML(),
        };
    }
    /**
     * Get Help panel (restored from help.tsx)
     */
    getHelpPanel() {
        return {
            id: 'help',
            title: 'Help & Documentation',
            icon: '❓',
            content: this.generateHelpHTML(),
        };
    }
    /**
     * Get Main Menu panel (restored from main-menu.tsx)
     */
    getMainMenuPanel() {
        return {
            id: 'main-menu',
            title: 'Main Menu',
            icon: '🏠',
            content: this.generateMainMenuHTML(),
        };
    }
    /**
     * Get MCP Servers panel (restored from mcp-servers.tsx)
     */
    getMCPServersPanel() {
        return {
            id: 'mcp-servers',
            title: 'MCP Servers',
            icon: '🔌',
            content: this.generateMCPServersHTML(),
        };
    }
    /**
     * Get MCP Tester panel (restored from mcp-tester.tsx)
     */
    getMCPTesterPanel() {
        return {
            id: 'mcp-tester',
            title: 'MCP Tester',
            icon: '🧪',
            content: this.generateMCPTesterHTML(),
        };
    }
    /**
     * Get Nix Manager panel (restored from nix-manager.tsx)
     */
    getNixManagerPanel() {
        return {
            id: 'nix-manager',
            title: 'Nix Environment',
            icon: '❄️',
            content: this.generateNixManagerHTML(),
        };
    }
    /**
     * Get Phase3 Learning Monitor panel (restored from phase3-learning-monitor.tsx)
     */
    getPhase3LearningMonitorPanel() {
        return {
            id: 'phase3-learning',
            title: 'Neural Learning Monitor',
            icon: '🧠',
            content: this.generatePhase3LearningHTML(),
        };
    }
    /**
     * Get Enhanced Swarm Dashboard panel (restored from swarm-dashboard.tsx)
     */
    getSwarmDashboardPanel() {
        return {
            id: 'swarm-dashboard',
            title: 'Enhanced Swarm Dashboard',
            icon: '🐝',
            content: this.generateSwarmDashboardHTML(),
        };
    }
    /**
     * Get Workspace panel (restored from workspace.tsx)
     */
    getWorkspacePanel() {
        return {
            id: 'workspace',
            title: 'Project Workspace',
            icon: '💼',
            content: this.generateWorkspaceHTML(),
        };
    }
    /**
     * Generate LLM Statistics HTML content
     */
    generateLLMStatsHTML(analytics, systemHealth) {
        const formatDuration = (ms) => {
            if (ms < 1000)
                return `${Math.round(ms)}ms`;
            return `${(ms / 1000).toFixed(1)}s`;
        };
        const formatNumber = (num) => {
            if (num >= 1000000)
                return `${(num / 1000000).toFixed(1)}M`;
            if (num >= 1000)
                return `${(num / 1000).toFixed(1)}K`;
            return num.toString();
        };
        const formatPercentage = (ratio) => {
            return `${Math.round(ratio * 100)}%`;
        };
        const getHealthColor = (health) => {
            switch (health) {
                case 'excellent': return '#238636';
                case 'good': return '#58a6ff';
                case 'fair': return '#d29922';
                case 'poor': return '#f85149';
                case 'critical': return '#da3633';
                default: return '#8b949e';
            }
        };
        return `
      <div class="llm-stats-panel">
        <!-- LLM Statistics Header -->
        <div class="llm-stats-header">
          <h3>🧠 LLM Statistics Dashboard</h3>
          <div class="llm-stats-controls">
            <button class="btn btn-secondary" onclick="refreshLLMStats()">
              <span class="icon">🔄</span>
              Refresh
            </button>
            <button class="btn btn-secondary" onclick="exportLLMStats()">
              <span class="icon">📊</span>
              Export
            </button>
          </div>
        </div>

        <!-- System Overview -->
        <div class="llm-overview-grid">
          <div class="llm-card">
            <div class="llm-card-header">
              <span class="llm-icon">📊</span>
              <h4>System Overview</h4>
            </div>
            <div class="llm-metrics">
              <div class="llm-metric">
                <span class="llm-metric-label">Total Calls</span>
                <span class="llm-metric-value">${formatNumber(analytics.summary.totalCalls)}</span>
              </div>
              <div class="llm-metric">
                <span class="llm-metric-label">Success Rate</span>
                <span class="llm-metric-value success">${formatPercentage(analytics.summary.successRate)}</span>
              </div>
              <div class="llm-metric">
                <span class="llm-metric-label">Avg Response</span>
                <span class="llm-metric-value">${formatDuration(analytics.summary.averageResponseTime)}</span>
              </div>
              <div class="llm-metric">
                <span class="llm-metric-label">Tokens Used</span>
                <span class="llm-metric-value">${formatNumber(analytics.summary.totalTokensUsed)}</span>
              </div>
            </div>
          </div>

          <div class="llm-card">
            <div class="llm-card-header">
              <span class="llm-icon">🏥</span>
              <h4>System Health</h4>
            </div>
            <div class="llm-health-status" style="border-left: 4px solid ${getHealthColor(systemHealth.overallHealth)}">
              <div class="llm-health-main">
                <span class="llm-health-level">${systemHealth.overallHealth.toUpperCase()}</span>
                <span class="llm-health-score">${systemHealth.healthScore}/100</span>
              </div>
              <div class="llm-health-details">
                <div class="llm-metric">
                  <span class="llm-metric-label">Active Providers</span>
                  <span class="llm-metric-value">${systemHealth.activeProviders}</span>
                </div>
                <div class="llm-metric">
                  <span class="llm-metric-label">Error Rate</span>
                  <span class="llm-metric-value ${systemHealth.errorRate > 0.1 ? 'error' : ''}">${formatPercentage(systemHealth.errorRate)}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="llm-card">
            <div class="llm-card-header">
              <span class="llm-icon">🗺️</span>
              <h4>Routing Efficiency</h4>
            </div>
            <div class="llm-metrics">
              <div class="llm-metric">
                <span class="llm-metric-label">Optimal Rate</span>
                <span class="llm-metric-value success">${formatPercentage(analytics.routingStats.optimalRoutingRate)}</span>
              </div>
              <div class="llm-metric">
                <span class="llm-metric-label">Fallback Rate</span>
                <span class="llm-metric-value ${analytics.routingStats.fallbackRate > 0.3 ? 'warning' : ''}">${formatPercentage(analytics.routingStats.fallbackRate)}</span>
              </div>
              <div class="llm-metric">
                <span class="llm-metric-label">Efficiency</span>
                <span class="llm-metric-value">${analytics.routingStats.routingEfficiency.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div class="llm-card">
            <div class="llm-card-header">
              <span class="llm-icon">💡</span>
              <h4>Key Insights</h4>
            </div>
            <div class="llm-insights">
              <div class="llm-insight">
                <span class="llm-insight-label">Top Performer:</span>
                <span class="llm-insight-value">${analytics.insights.topPerformingProvider}</span>
              </div>
              <div class="llm-insight">
                <span class="llm-insight-label">Most Efficient:</span>
                <span class="llm-insight-value">${analytics.insights.mostEfficientProvider}</span>
              </div>
              <div class="llm-insight">
                <span class="llm-insight-label">Cost Savings:</span>
                <span class="llm-insight-value success">$${analytics.summary.costSavings.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Provider Performance -->
        <div class="llm-section">
          <h4>🔌 Provider Performance</h4>
          <div class="llm-providers-grid">
            ${analytics.providerStats.slice(0, 6).map(provider => `
              <div class="llm-provider-card">
                <div class="llm-provider-header">
                  <span class="llm-provider-name">${provider.displayName}</span>
                  <span class="llm-provider-status status-${provider.currentStatus}">${provider.currentStatus}</span>
                </div>
                <div class="llm-provider-metrics">
                  <div class="llm-provider-metric">
                    <span class="llm-metric-label">Calls</span>
                    <span class="llm-metric-value">${formatNumber(provider.totalCalls)}</span>
                  </div>
                  <div class="llm-provider-metric">
                    <span class="llm-metric-label">Success</span>
                    <span class="llm-metric-value ${provider.successRate > 0.9 ? 'success' : provider.successRate > 0.7 ? 'warning' : 'error'}">${formatPercentage(provider.successRate)}</span>
                  </div>
                  <div class="llm-provider-metric">
                    <span class="llm-metric-label">Latency</span>
                    <span class="llm-metric-value">${formatDuration(provider.averageResponseTime)}</span>
                  </div>
                  <div class="llm-provider-metric">
                    <span class="llm-metric-label">Reliability</span>
                    <span class="llm-metric-value">${provider.reliability}/100</span>
                  </div>
                </div>
                ${provider.lastUsed ? `
                <div class="llm-provider-last-used">
                  Last used: ${provider.lastUsed.toLocaleTimeString()}
                </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- System Alerts -->
        ${systemHealth.alerts.length > 0 ? `
        <div class="llm-section">
          <h4>🚨 System Alerts</h4>
          <div class="llm-alerts">
            ${systemHealth.alerts.slice(0, 5).map(alert => `
              <div class="llm-alert alert-${alert.level}">
                <span class="llm-alert-icon">${alert.level === 'critical' ? '🔴' : '⚠️'}</span>
                <div class="llm-alert-content">
                  <span class="llm-alert-message">${alert.message}</span>
                  <span class="llm-alert-time">${alert.timestamp.toLocaleTimeString()}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Recommendations -->
        ${systemHealth.recommendations.length > 0 ? `
        <div class="llm-section">
          <h4>💡 Recommendations</h4>
          <div class="llm-recommendations">
            ${systemHealth.recommendations.map(rec => `
              <div class="llm-recommendation">
                <span class="llm-rec-icon">💡</span>
                <span class="llm-rec-text">${rec}</span>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Routing Patterns -->
        <div class="llm-section">
          <h4>🔀 Common Routing Patterns</h4>
          <div class="llm-routing-patterns">
            ${analytics.routingStats.commonRoutingPatterns.slice(0, 5).map(pattern => `
              <div class="llm-routing-pattern">
                <div class="llm-pattern-route">${pattern.pattern.join(' → ')}</div>
                <div class="llm-pattern-stats">
                  <span class="llm-pattern-frequency">${pattern.frequency} times</span>
                  <span class="llm-pattern-success ${pattern.successRate > 0.9 ? 'success' : pattern.successRate > 0.7 ? 'warning' : 'error'}">${formatPercentage(pattern.successRate)} success</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    }
    generateADRManagerHTML() {
        return `
      <div class="adr-manager-panel">
        <div class="adr-controls">
          <button class="btn btn-primary" onclick="createADR()">
            <span class="icon">📝</span>
            Create ADR
          </button>
          <button class="btn btn-secondary" onclick="refreshADRs()">
            <span class="icon">🔄</span>
            Refresh
          </button>
        </div>
        <div class="adr-list">
          <h4>Architectural Decision Records</h4>
          <div id="adr-items" class="adr-items">
            <div class="adr-item">
              <div class="adr-header">
                <h5>ADR-001: Use TypeScript for Development</h5>
                <span class="adr-status accepted">Accepted</span>
              </div>
              <p class="adr-summary">Decision to use TypeScript for type safety and developer experience</p>
            </div>
            <div class="adr-item">
              <div class="adr-header">
                <h5>ADR-002: Web-only Interface</h5>
                <span class="adr-status accepted">Accepted</span>
              </div>
              <p class="adr-summary">Migrate from TUI to pure web interface for better accessibility</p>
            </div>
          </div>
        </div>
      </div>
    `;
    }
    generateCommandPaletteHTML() {
        return `
      <div class="command-palette-panel">
        <div class="command-input-container">
          <input type="text" id="command-input" class="command-input" 
                 placeholder="Type a command..." onkeyup="filterCommands(this.value)">
        </div>
        <div class="command-list">
          <div class="command-category">
            <h4>🐝 Swarm Commands</h4>
            <div class="command-item" onclick="executeCommand('swarm:init')">
              <span class="command-name">swarm:init</span>
              <span class="command-desc">Initialize a new swarm</span>
            </div>
            <div class="command-item" onclick="executeCommand('swarm:status')">
              <span class="command-name">swarm:status</span>
              <span class="command-desc">Show swarm status</span>
            </div>
          </div>
          <div class="command-category">
            <h4>📊 System Commands</h4>
            <div class="command-item" onclick="executeCommand('system:health')">
              <span class="command-name">system:health</span>
              <span class="command-desc">Check system health</span>
            </div>
            <div class="command-item" onclick="executeCommand('system:restart')">
              <span class="command-name">system:restart</span>
              <span class="command-desc">Restart services</span>
            </div>
          </div>
        </div>
      </div>
    `;
    }
    generateFileBrowserHTML() {
        const cwd = process.cwd();
        return `
      <div class="file-browser-panel">
        <div class="file-browser-header">
          <div class="path-bar">
            <span class="current-path">${cwd}</span>
            <button class="btn btn-secondary" onclick="refreshFiles()">
              <span class="icon">🔄</span>
              Refresh
            </button>
          </div>
        </div>
        <div class="file-browser-content">
          <div class="file-tree" id="file-tree">
            <div class="file-item folder" onclick="toggleFolder(this)">
              <span class="file-icon">📁</span>
              <span class="file-name">src</span>
            </div>
            <div class="file-item file" onclick="selectFile(this)">
              <span class="file-icon">📄</span>
              <span class="file-name">package.json</span>
            </div>
            <div class="file-item file" onclick="selectFile(this)">
              <span class="file-icon">📄</span>
              <span class="file-name">README.md</span>
            </div>
          </div>
        </div>
      </div>
    `;
    }
    generateHelpHTML() {
        return `
      <div class="help-panel">
        <!-- Help Header with Search and Navigation -->
        <div class="help-header">
          <div class="help-title">
            <h2>📚 claude-code-zen Help & Documentation</h2>
            <p>Comprehensive guide to AI-powered development tools</p>
          </div>
          <div class="help-controls">
            <input type="text" id="help-search" placeholder="Search help topics..." 
                   class="help-search-input" onkeyup="searchHelp(this.value)">
            <button class="btn btn-secondary" onclick="showAllHelpSections()">
              <span class="icon">📋</span>
              Show All
            </button>
            <button class="btn btn-secondary" onclick="exportHelpPDF()">
              <span class="icon">📄</span>
              Export PDF
            </button>
          </div>
        </div>

        <!-- Help Category Tabs -->
        <div class="help-tabs">
          <button class="help-tab active" onclick="showHelpCategory('getting-started')">🚀 Getting Started</button>
          <button class="help-tab" onclick="showHelpCategory('navigation')">🧭 Navigation</button>
          <button class="help-tab" onclick="showHelpCategory('swarm')">🐝 Swarm Management</button>
          <button class="help-tab" onclick="showHelpCategory('commands')">⌘ Command Reference</button>
          <button class="help-tab" onclick="showHelpCategory('panels')">🎛️ Panel Guide</button>
          <button class="help-tab" onclick="showHelpCategory('troubleshooting')">🔧 Troubleshooting</button>
          <button class="help-tab" onclick="showHelpCategory('keyboard')">⌨️ Shortcuts</button>
        </div>

        <!-- Help Content Sections -->
        <div class="help-content" id="help-content">
          
          <!-- Getting Started Section -->
          <div class="help-category" id="getting-started" style="display: block;">
            <div class="help-section">
              <h3>🚀 Welcome to claude-code-zen</h3>
              <div class="help-intro">
                <p>claude-code-zen is a comprehensive AI-powered development platform that provides intelligent coordination, 
                   swarm management, and advanced analytics for modern software development workflows.</p>
                
                <div class="help-feature-grid">
                  <div class="feature-card">
                    <div class="feature-icon">🧠</div>
                    <h4>AI Intelligence</h4>
                    <p>Advanced LLM routing, analytics, and optimization</p>
                  </div>
                  <div class="feature-card">
                    <div class="feature-icon">🐝</div>
                    <h4>Swarm Coordination</h4>
                    <p>Multi-agent task orchestration and management</p>
                  </div>
                  <div class="feature-card">
                    <div class="feature-icon">📊</div>
                    <h4>Performance Analytics</h4>
                    <p>Real-time monitoring and system insights</p>
                  </div>
                  <div class="feature-card">
                    <div class="feature-icon">🔧</div>
                    <h4>Developer Tools</h4>
                    <p>Comprehensive development and debugging utilities</p>
                  </div>
                </div>
              </div>

              <div class="help-subsection">
                <h4>📋 Quick Setup Checklist</h4>
                <div class="checklist">
                  <label class="checklist-item">
                    <input type="checkbox"> System status shows all services healthy
                  </label>
                  <label class="checklist-item">
                    <input type="checkbox"> MCP servers are connected and running
                  </label>
                  <label class="checklist-item">
                    <input type="checkbox"> Web dashboard loads without errors
                  </label>
                  <label class="checklist-item">
                    <input type="checkbox"> Neural learning systems are active
                  </label>
                  <label class="checklist-item">
                    <input type="checkbox"> File browser shows project structure
                  </label>
                </div>
              </div>

              <div class="help-subsection">
                <h4>🏃‍♂️ First Steps</h4>
                <ol class="help-steps">
                  <li>Start by checking the <strong>System Status</strong> panel to ensure all services are healthy</li>
                  <li>Explore the <strong>Main Menu</strong> to get familiar with available features</li>
                  <li>Try the <strong>Command Palette</strong> (Ctrl+K) for quick navigation</li>
                  <li>Initialize a <strong>Swarm</strong> to begin coordinated development tasks</li>
                  <li>Monitor <strong>LLM Statistics</strong> to track AI performance</li>
                </ol>
              </div>
            </div>
          </div>

          <!-- Navigation Section -->
          <div class="help-category" id="navigation" style="display: none;">
            <div class="help-section">
              <h3>🧭 Dashboard Navigation</h3>
              
              <div class="help-subsection">
                <h4>🎛️ Panel Overview</h4>
                <div class="panel-guide">
                  <div class="panel-item">
                    <span class="panel-icon">🏠</span>
                    <div class="panel-info">
                      <h5>Main Menu</h5>
                      <p>Central hub for accessing all major features and getting an overview of system capabilities</p>
                    </div>
                  </div>
                  <div class="panel-item">
                    <span class="panel-icon">⚡</span>
                    <div class="panel-info">
                      <h5>System Status</h5>
                      <p>Real-time health monitoring of all system components, services, and performance metrics</p>
                    </div>
                  </div>
                  <div class="panel-item">
                    <span class="panel-icon">🐝</span>
                    <div class="panel-info">
                      <h5>Swarm Management</h5>
                      <p>Initialize, configure, and monitor AI agent swarms for coordinated development tasks</p>
                    </div>
                  </div>
                  <div class="panel-item">
                    <span class="panel-icon">🧠</span>
                    <div class="panel-info">
                      <h5>LLM Statistics</h5>
                      <p>Comprehensive analytics on AI model usage, performance, costs, and routing efficiency</p>
                    </div>
                  </div>
                  <div class="panel-item">
                    <span class="panel-icon">📊</span>
                    <div class="panel-info">
                      <h5>Performance Monitor</h5>
                      <p>System resource usage, task throughput, and performance optimization insights</p>
                    </div>
                  </div>
                  <div class="panel-item">
                    <span class="panel-icon">📝</span>
                    <div class="panel-info">
                      <h5>Live Logs</h5>
                      <p>Real-time system logs with filtering, search, and export capabilities</p>
                    </div>
                  </div>
                  <div class="panel-item">
                    <span class="panel-icon">📁</span>
                    <div class="panel-info">
                      <h5>File Browser</h5>
                      <p>Navigate project structure, view files, and manage workspace organization</p>
                    </div>
                  </div>
                  <div class="panel-item">
                    <span class="panel-icon">⌘</span>
                    <div class="panel-info">
                      <h5>Command Palette</h5>
                      <p>Quick access to system commands, actions, and navigation shortcuts</p>
                    </div>
                  </div>
                  <div class="panel-item">
                    <span class="panel-icon">⚙️</span>
                    <div class="panel-info">
                      <h5>Settings</h5>
                      <p>System configuration, preferences, and customization options</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="help-subsection">
                <h4>🔗 Quick Navigation Tips</h4>
                <ul class="help-tips">
                  <li><strong>Tab Navigation:</strong> Use tabs at the top to switch between panels quickly</li>
                  <li><strong>Auto-Refresh:</strong> Most panels update automatically with real-time data</li>
                  <li><strong>Panel State:</strong> Your last viewed panel is remembered across sessions</li>
                  <li><strong>Responsive Design:</strong> Interface adapts to different screen sizes</li>
                  <li><strong>Theme Support:</strong> Dark/light themes available in Settings</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Swarm Management Section -->
          <div class="help-category" id="swarm" style="display: none;">
            <div class="help-section">
              <h3>🐝 Swarm Management Guide</h3>
              
              <div class="help-subsection">
                <h4>🏗️ Swarm Architecture</h4>
                <p>claude-code-zen supports multiple swarm topologies for different use cases:</p>
                <div class="topology-grid">
                  <div class="topology-card">
                    <h5>🌐 Mesh Topology</h5>
                    <p>All agents communicate directly. Best for collaborative research and brainstorming.</p>
                    <div class="topology-props">
                      <span class="prop-tag">High Collaboration</span>
                      <span class="prop-tag">Fault Tolerant</span>
                    </div>
                  </div>
                  <div class="topology-card">
                    <h5>🏗️ Hierarchical</h5>
                    <p>Structured leadership with coordinators. Ideal for complex project management.</p>
                    <div class="topology-props">
                      <span class="prop-tag">Clear Leadership</span>
                      <span class="prop-tag">Scalable</span>
                    </div>
                  </div>
                  <div class="topology-card">
                    <h5>⭐ Star Topology</h5>
                    <p>Central coordinator manages all agents. Perfect for focused task execution.</p>
                    <div class="topology-props">
                      <span class="prop-tag">Centralized Control</span>
                      <span class="prop-tag">Efficient</span>
                    </div>
                  </div>
                  <div class="topology-card">
                    <h5>🔄 Ring Topology</h5>
                    <p>Sequential agent communication. Great for pipeline processing workflows.</p>
                    <div class="topology-props">
                      <span class="prop-tag">Sequential Processing</span>
                      <span class="prop-tag">Resource Efficient</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="help-subsection">
                <h4>🤖 Agent Types</h4>
                <div class="agent-types">
                  <div class="agent-type">
                    <span class="agent-icon">🔬</span>
                    <h5>Researcher</h5>
                    <p>Specializes in information gathering, analysis, and knowledge synthesis</p>
                  </div>
                  <div class="agent-type">
                    <span class="agent-icon">💻</span>
                    <h5>Coder</h5>
                    <p>Focuses on code generation, debugging, and implementation tasks</p>
                  </div>
                  <div class="agent-type">
                    <span class="agent-icon">📊</span>
                    <h5>Analyst</h5>
                    <p>Handles data analysis, performance metrics, and optimization strategies</p>
                  </div>
                  <div class="agent-type">
                    <span class="agent-icon">⚡</span>
                    <h5>Optimizer</h5>
                    <p>Improves system performance, resource utilization, and efficiency</p>
                  </div>
                  <div class="agent-type">
                    <span class="agent-icon">🎯</span>
                    <h5>Coordinator</h5>
                    <p>Manages task distribution, workflow orchestration, and team coordination</p>
                  </div>
                  <div class="agent-type">
                    <span class="agent-icon">🧪</span>
                    <h5>Tester</h5>
                    <p>Creates and executes tests, validates functionality, and ensures quality</p>
                  </div>
                </div>
              </div>

              <div class="help-subsection">
                <h4>🚀 Swarm Operations</h4>
                <div class="operation-steps">
                  <div class="operation-step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                      <h5>Initialize Swarm</h5>
                      <p>Choose topology and maximum agents based on your project needs</p>
                      <code>Click "Initialize Swarm" → Select topology → Set agent limit</code>
                    </div>
                  </div>
                  <div class="operation-step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                      <h5>Spawn Agents</h5>
                      <p>Add specialized agents for different aspects of your project</p>
                      <code>Use "Add Agent" → Choose type → Configure specialization</code>
                    </div>
                  </div>
                  <div class="operation-step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                      <h5>Orchestrate Tasks</h5>
                      <p>Assign complex tasks to the swarm for coordinated execution</p>
                      <code>Input task description → Select strategy → Monitor progress</code>
                    </div>
                  </div>
                  <div class="operation-step">
                    <div class="step-number">4</div>
                    <div class="step-content">
                      <h5>Monitor Progress</h5>
                      <p>Track agent performance, task completion, and system health</p>
                      <code>View real-time metrics → Adjust parameters → Optimize performance</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Command Reference Section -->
          <div class="help-category" id="commands" style="display: none;">
            <div class="help-section">
              <h3>⌘ Command Reference</h3>
              
              <div class="help-subsection">
                <h4>🐝 Swarm Commands</h4>
                <div class="command-group">
                  <div class="command-item">
                    <code class="command-syntax">swarm:init [topology] [max-agents]</code>
                    <p>Initialize a new swarm with specified topology and agent limit</p>
                    <div class="command-examples">
                      <strong>Examples:</strong>
                      <code>swarm:init mesh 6</code>
                      <code>swarm:init hierarchical 12</code>
                    </div>
                  </div>
                  <div class="command-item">
                    <code class="command-syntax">swarm:spawn [agent-type] [name]</code>
                    <p>Create a new agent of specified type with optional name</p>
                    <div class="command-examples">
                      <strong>Examples:</strong>
                      <code>swarm:spawn researcher DataAnalyst</code>
                      <code>swarm:spawn coder BackendDev</code>
                    </div>
                  </div>
                  <div class="command-item">
                    <code class="command-syntax">swarm:status</code>
                    <p>Display current swarm status, topology, and agent information</p>
                  </div>
                  <div class="command-item">
                    <code class="command-syntax">swarm:orchestrate [task-description]</code>
                    <p>Assign a complex task to the swarm for coordinated execution</p>
                  </div>
                  <div class="command-item">
                    <code class="command-syntax">swarm:terminate</code>
                    <p>Safely shut down the current swarm and release resources</p>
                  </div>
                </div>
              </div>

              <div class="help-subsection">
                <h4>📊 System Commands</h4>
                <div class="command-group">
                  <div class="command-item">
                    <code class="command-syntax">system:health</code>
                    <p>Comprehensive system health check including all services and components</p>
                  </div>
                  <div class="command-item">
                    <code class="command-syntax">system:restart [service]</code>
                    <p>Restart specific service or all services if no service specified</p>
                  </div>
                  <div class="command-item">
                    <code class="command-syntax">system:logs [level] [service]</code>
                    <p>View system logs with optional filtering by level and service</p>
                  </div>
                  <div class="command-item">
                    <code class="command-syntax">system:metrics</code>
                    <p>Display current system performance metrics and resource usage</p>
                  </div>
                  <div class="command-item">
                    <code class="command-syntax">system:version</code>
                    <p>Show version information for claude-code-zen and dependencies</p>
                  </div>
                </div>
              </div>

              <div class="help-subsection">
                <h4>🧠 AI/LLM Commands</h4>
                <div class="command-group">
                  <div class="command-item">
                    <code class="command-syntax">llm:stats</code>
                    <p>Display comprehensive LLM usage statistics and performance metrics</p>
                  </div>
                  <div class="command-item">
                    <code class="command-syntax">llm:providers</code>
                    <p>List all available LLM providers and their current status</p>
                  </div>
                  <div class="command-item">
                    <code class="command-syntax">llm:routing</code>
                    <p>Show routing efficiency and fallback statistics</p>
                  </div>
                  <div class="command-item">
                    <code class="command-syntax">neural:status</code>
                    <p>Check neural learning system status and adaptation metrics</p>
                  </div>
                  <div class="command-item">
                    <code class="command-syntax">neural:train</code>
                    <p>Trigger neural pattern training and optimization</p>
                  </div>
                </div>
              </div>

              <div class="help-subsection">
                <h4>📁 File Commands</h4>
                <div class="command-group">
                  <div class="command-item">
                    <code class="command-syntax">file:browse [path]</code>
                    <p>Open file browser at specified path or current workspace root</p>
                  </div>
                  <div class="command-item">
                    <code class="command-syntax">file:search [pattern]</code>
                    <p>Search for files matching the specified pattern</p>
                  </div>
                  <div class="command-item">
                    <code class="command-syntax">workspace:info</code>
                    <p>Display current workspace information and statistics</p>
                  </div>
                  <div class="command-item">
                    <code class="command-syntax">workspace:switch [path]</code>
                    <p>Switch to a different workspace or project directory</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Panel Guide Section -->
          <div class="help-category" id="panels" style="display: none;">
            <div class="help-section">
              <h3>🎛️ Panel-Specific Guides</h3>
              
              <div class="panel-guide-section">
                <details class="panel-details">
                  <summary class="panel-summary">
                    <span class="panel-icon">🏠</span>
                    <strong>Main Menu Panel</strong>
                  </summary>
                  <div class="panel-help-content">
                    <p>Central navigation hub providing quick access to all major features.</p>
                    <ul>
                      <li><strong>Feature Cards:</strong> Click any card to jump directly to that panel</li>
                      <li><strong>Status Indicators:</strong> Visual indicators show system health at a glance</li>
                      <li><strong>Quick Actions:</strong> Common tasks are highlighted for easy access</li>
                    </ul>
                  </div>
                </details>

                <details class="panel-details">
                  <summary class="panel-summary">
                    <span class="panel-icon">⚡</span>
                    <strong>System Status Panel</strong>
                  </summary>
                  <div class="panel-help-content">
                    <p>Real-time monitoring of all system components and services.</p>
                    <ul>
                      <li><strong>Service Status:</strong> Green indicators mean healthy, red means issues</li>
                      <li><strong>Uptime Tracking:</strong> Shows how long the system has been running</li>
                      <li><strong>Memory Usage:</strong> Real-time memory consumption monitoring</li>
                      <li><strong>Auto-Refresh:</strong> Updates every 5 seconds automatically</li>
                    </ul>
                  </div>
                </details>

                <details class="panel-details">
                  <summary class="panel-summary">
                    <span class="panel-icon">🐝</span>
                    <strong>Swarm Management Panel</strong>
                  </summary>
                  <div class="panel-help-content">
                    <p>Complete swarm lifecycle management and monitoring.</p>
                    <ul>
                      <li><strong>Initialize Swarm:</strong> Choose topology and configure initial parameters</li>
                      <li><strong>Agent Management:</strong> Add, remove, and configure individual agents</li>
                      <li><strong>Task Queue:</strong> View and manage queued tasks</li>
                      <li><strong>Performance Metrics:</strong> Real-time agent performance monitoring</li>
                      <li><strong>Health Monitoring:</strong> Agent health and coordination status</li>
                    </ul>
                  </div>
                </details>

                <details class="panel-details">
                  <summary class="panel-summary">
                    <span class="panel-icon">🧠</span>
                    <strong>LLM Statistics Panel</strong>
                  </summary>
                  <div class="panel-help-content">
                    <p>Comprehensive analytics for AI model usage and performance.</p>
                    <ul>
                      <li><strong>Provider Metrics:</strong> Performance comparison across different LLM providers</li>
                      <li><strong>Cost Tracking:</strong> Monitor token usage and associated costs</li>
                      <li><strong>Routing Efficiency:</strong> Analyze request routing and fallback patterns</li>
                      <li><strong>System Health:</strong> Overall AI system health and recommendations</li>
                      <li><strong>Export Data:</strong> Export metrics for external analysis</li>
                    </ul>
                  </div>
                </details>

                <details class="panel-details">
                  <summary class="panel-summary">
                    <span class="panel-icon">📊</span>
                    <strong>Performance Monitor Panel</strong>
                  </summary>
                  <div class="panel-help-content">
                    <p>System resource monitoring and performance optimization.</p>
                    <ul>
                      <li><strong>Resource Usage:</strong> CPU, memory, and disk utilization</li>
                      <li><strong>Task Throughput:</strong> Processing speed and bottleneck identification</li>
                      <li><strong>Historical Charts:</strong> Performance trends over time</li>
                      <li><strong>Optimization Alerts:</strong> Automatic recommendations for improvement</li>
                    </ul>
                  </div>
                </details>

                <details class="panel-details">
                  <summary class="panel-summary">
                    <span class="panel-icon">📁</span>
                    <strong>File Browser Panel</strong>
                  </summary>
                  <div class="panel-help-content">
                    <p>Navigate and manage project files and workspace structure.</p>
                    <ul>
                      <li><strong>Tree Navigation:</strong> Hierarchical file and folder browsing</li>
                      <li><strong>File Operations:</strong> Basic file management operations</li>
                      <li><strong>Search Function:</strong> Quick file and content search</li>
                      <li><strong>Workspace Context:</strong> Automatically loads current workspace</li>
                    </ul>
                  </div>
                </details>
              </div>
            </div>
          </div>

          <!-- Troubleshooting Section -->
          <div class="help-category" id="troubleshooting" style="display: none;">
            <div class="help-section">
              <h3>🔧 Troubleshooting Guide</h3>
              
              <div class="help-subsection">
                <h4>🚨 Common Issues</h4>
                
                <div class="troubleshooting-item">
                  <h5>❌ Web Dashboard Not Loading</h5>
                  <div class="problem-solution">
                    <p><strong>Symptoms:</strong> Blank page, loading errors, or connection timeouts</p>
                    <div class="solution-steps">
                      <h6>Solutions:</h6>
                      <ol>
                        <li>Check if the server is running on port 3000: <code>curl http://localhost:3000</code></li>
                        <li>Verify no other service is using port 3000: <code>lsof -i :3000</code></li>
                        <li>Clear browser cache and cookies for localhost</li>
                        <li>Check browser console for JavaScript errors (F12 → Console)</li>
                        <li>Restart the web server: <code>npm run dev</code></li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div class="troubleshooting-item">
                  <h5>🐝 Swarm Initialization Fails</h5>
                  <div class="problem-solution">
                    <p><strong>Symptoms:</strong> "Failed to initialize swarm" errors or agents not spawning</p>
                    <div class="solution-steps">
                      <h6>Solutions:</h6>
                      <ol>
                        <li>Check MCP server status in the MCP Servers panel</li>
                        <li>Verify claude-zen MCP server is running: <code>ps aux | grep claude-zen</code></li>
                        <li>Restart MCP servers: Use the restart buttons in MCP panel</li>
                        <li>Check system resources (CPU/memory) aren't exhausted</li>
                        <li>Review logs for specific error messages in Live Logs panel</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div class="troubleshooting-item">
                  <h5>📊 LLM Statistics Not Updating</h5>
                  <div class="problem-solution">
                    <p><strong>Symptoms:</strong> Statistics show zero values or stale data</p>
                    <div class="solution-steps">
                      <h6>Solutions:</h6>
                      <ol>
                        <li>Click "Refresh" button in LLM Statistics panel</li>
                        <li>Check if any LLM providers are configured and active</li>
                        <li>Verify API keys and provider configurations</li>
                        <li>Look for provider-specific errors in system logs</li>
                        <li>Test individual providers in MCP Tester panel</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div class="troubleshooting-item">
                  <h5>🔌 MCP Connection Issues</h5>
                  <div class="problem-solution">
                    <p><strong>Symptoms:</strong> MCP servers show as disconnected or tools unavailable</p>
                    <div class="solution-steps">
                      <h6>Solutions:</h6>
                      <ol>
                        <li>Check MCP server status in dedicated panel</li>
                        <li>Verify MCP server processes are running</li>
                        <li>Test connectivity using MCP Tester panel</li>
                        <li>Check for port conflicts or firewall issues</li>
                        <li>Review MCP server logs for connection errors</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              <div class="help-subsection">
                <h4>🔍 Diagnostic Tools</h4>
                <div class="diagnostic-tools">
                  <div class="diagnostic-tool">
                    <h5>System Health Check</h5>
                    <p>Run comprehensive system diagnostics</p>
                    <button class="btn btn-secondary" onclick="runSystemHealthCheck()">
                      🏥 Run Health Check
                    </button>
                  </div>
                  <div class="diagnostic-tool">
                    <h5>Connection Test</h5>
                    <p>Test all MCP server connections</p>
                    <button class="btn btn-secondary" onclick="testAllConnections()">
                      🔌 Test Connections
                    </button>
                  </div>
                  <div class="diagnostic-tool">
                    <h5>Performance Baseline</h5>
                    <p>Establish performance benchmarks</p>
                    <button class="btn btn-secondary" onclick="runPerformanceBaseline()">
                      📊 Run Benchmark
                    </button>
                  </div>
                </div>
              </div>

              <div class="help-subsection">
                <h4>📞 Getting Help</h4>
                <div class="support-options">
                  <div class="support-option">
                    <h5>📋 System Information</h5>
                    <p>Gather system info for support requests</p>
                    <button class="btn btn-secondary" onclick="exportSystemInfo()">
                      📤 Export System Info
                    </button>
                  </div>
                  <div class="support-option">
                    <h5>📝 Log Export</h5>
                    <p>Export logs for detailed analysis</p>
                    <button class="btn btn-secondary" onclick="exportSystemLogs()">
                      📁 Export Logs
                    </button>
                  </div>
                  <div class="support-option">
                    <h5>🔍 Debug Mode</h5>
                    <p>Enable verbose logging and debugging</p>
                    <button class="btn btn-secondary" onclick="toggleDebugMode()">
                      🐛 Toggle Debug
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Keyboard Shortcuts Section -->
          <div class="help-category" id="keyboard" style="display: none;">
            <div class="help-section">
              <h3>⌨️ Keyboard Shortcuts</h3>
              
              <div class="help-subsection">
                <h4>🚀 Global Shortcuts</h4>
                <div class="shortcut-group">
                  <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>K</kbd>
                    <span class="shortcut-desc">Open Command Palette</span>
                  </div>
                  <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>
                    <span class="shortcut-desc">Show all panels overview</span>
                  </div>
                  <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>/</kbd>
                    <span class="shortcut-desc">Open this help panel</span>
                  </div>
                  <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>R</kbd>
                    <span class="shortcut-desc">Refresh current panel</span>
                  </div>
                  <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd>
                    <span class="shortcut-desc">Hard refresh (clear cache)</span>
                  </div>
                </div>
              </div>

              <div class="help-subsection">
                <h4>🎛️ Panel Navigation</h4>
                <div class="shortcut-group">
                  <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>1</kbd>
                    <span class="shortcut-desc">Main Menu panel</span>
                  </div>
                  <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>2</kbd>
                    <span class="shortcut-desc">System Status panel</span>
                  </div>
                  <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>3</kbd>
                    <span class="shortcut-desc">Swarm Management panel</span>
                  </div>
                  <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>4</kbd>
                    <span class="shortcut-desc">LLM Statistics panel</span>
                  </div>
                  <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>5</kbd>
                    <span class="shortcut-desc">Performance Monitor panel</span>
                  </div>
                  <div class="shortcut-item">
                    <kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd>
                    <span class="shortcut-desc">Navigate between panels</span>
                  </div>
                </div>
              </div>

              <div class="help-subsection">
                <h4>🐝 Swarm Shortcuts</h4>
                <div class="shortcut-group">
                  <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd>
                    <span class="shortcut-desc">Initialize new swarm</span>
                  </div>
                  <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>A</kbd>
                    <span class="shortcut-desc">Add new agent</span>
                  </div>
                  <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd>
                    <span class="shortcut-desc">Show swarm status</span>
                  </div>
                  <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>T</kbd>
                    <span class="shortcut-desc">Orchestrate new task</span>
                  </div>
                </div>
              </div>

              <div class="help-subsection">
                <h4>🔍 Search & Filter</h4>
                <div class="shortcut-group">
                  <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>F</kbd>
                    <span class="shortcut-desc">Search current panel</span>
                  </div>
                  <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>F</kbd>
                    <span class="shortcut-desc">Global search (all panels)</span>
                  </div>
                  <div class="shortcut-item">
                    <kbd>Esc</kbd>
                    <span class="shortcut-desc">Clear search / Close dialogs</span>
                  </div>
                  <div class="shortcut-item">
                    <kbd>Enter</kbd>
                    <span class="shortcut-desc">Execute search / command</span>
                  </div>
                </div>
              </div>

              <div class="help-subsection">
                <h4>📊 Data Operations</h4>
                <div class="shortcut-group">
                  <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>E</kbd>
                    <span class="shortcut-desc">Export current data</span>
                  </div>
                  <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>S</kbd>
                    <span class="shortcut-desc">Save current state</span>
                  </div>
                  <div class="shortcut-item">
                    <kbd>F5</kbd>
                    <span class="shortcut-desc">Refresh data</span>
                  </div>
                  <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>D</kbd>
                    <span class="shortcut-desc">Download logs/data</span>
                  </div>
                </div>
              </div>

              <div class="help-subsection">
                <h4>🛠️ Development Shortcuts</h4>
                <div class="shortcut-group">
                  <div class="shortcut-item">
                    <kbd>F12</kbd>
                    <span class="shortcut-desc">Open browser developer tools</span>
                  </div>
                  <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd>
                    <span class="shortcut-desc">Open developer tools (alternate)</span>
                  </div>
                  <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>J</kbd>
                    <span class="shortcut-desc">Open console</span>
                  </div>
                  <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>U</kbd>
                    <span class="shortcut-desc">View page source</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Help Footer with Links -->
        <div class="help-footer">
          <div class="help-links">
            <h4>📚 Additional Resources</h4>
            <div class="resource-links">
              <a href="https://github.com/zen-neural/claude-code-zen" target="_blank" class="help-link">
                <span class="link-icon">🔗</span>
                GitHub Repository
              </a>
              <a href="https://github.com/zen-neural/claude-code-zen/wiki" target="_blank" class="help-link">
                <span class="link-icon">📖</span>
                Documentation Wiki
              </a>
              <a href="https://github.com/zen-neural/claude-code-zen/issues" target="_blank" class="help-link">
                <span class="link-icon">🐛</span>
                Report Issues
              </a>
              <a href="https://github.com/zen-neural/claude-code-zen/discussions" target="_blank" class="help-link">
                <span class="link-icon">💬</span>
                Community Discussions
              </a>
            </div>
          </div>
          
          <div class="help-version">
            <p>claude-code-zen v${getVersion()} • Web Dashboard Help System</p>
            <p>Last updated: ${new Date().toLocaleDateString()}</p>
          </div>
        </div>

      </div>

      <!-- Help System JavaScript -->
      <script>
        function showHelpCategory(categoryId) {
          // Hide all categories
          const categories = document.querySelectorAll('.help-category');
          categories.forEach(cat => cat.style.display = 'none');
          
          // Show selected category
          const selectedCategory = document.getElementById(categoryId);
          if (selectedCategory) {
            selectedCategory.style.display = 'block';
          }
          
          // Update tab styling
          const tabs = document.querySelectorAll('.help-tab');
          tabs.forEach(tab => tab.classList.remove('active'));
          
          const activeTab = document.querySelector(\`[onclick="showHelpCategory('\${categoryId}')"]\`);
          if (activeTab) {
            activeTab.classList.add('active');
          }
        }

        function searchHelp(query) {
          const searchTerm = query.toLowerCase().trim();
          const sections = document.querySelectorAll('.help-section, .help-subsection, .command-item, .troubleshooting-item, .panel-item');
          
          if (searchTerm === '') {
            // Show all sections when search is empty
            sections.forEach(section => {
              section.style.display = '';
            });
            return;
          }
          
          sections.forEach(section => {
            const text = section.textContent.toLowerCase();
            const shouldShow = text.includes(searchTerm);
            section.style.display = shouldShow ? '' : 'none';
          });
          
          // Show all categories if search is active
          if (searchTerm) {
            const categories = document.querySelectorAll('.help-category');
            categories.forEach(cat => cat.style.display = 'block');
          }
        }

        function showAllHelpSections() {
          const categories = document.querySelectorAll('.help-category');
          categories.forEach(cat => cat.style.display = 'block');
          
          const sections = document.querySelectorAll('.help-section, .help-subsection');
          sections.forEach(section => section.style.display = '');
          
          // Clear search
          const searchInput = document.getElementById('help-search');
          if (searchInput) searchInput.value = '';
          
          // Remove active tab styling
          const tabs = document.querySelectorAll('.help-tab');
          tabs.forEach(tab => tab.classList.remove('active'));
        }

        function exportHelpPDF() {
          // This would typically integrate with a PDF generation library
          alert('PDF export feature coming soon! For now, use browser print (Ctrl+P) to create PDF.');
        }

        function runSystemHealthCheck() {
          // Implementation would call actual health check functions
          alert('Running comprehensive system health check...');
        }

        function testAllConnections() {
          // Implementation would test MCP and other connections
          alert('Testing all system connections...');
        }

        function runPerformanceBaseline() {
          // Implementation would run performance benchmarks
          alert('Running performance baseline tests...');
        }

        function exportSystemInfo() {
          // Implementation would gather and export system information
          alert('Exporting system information for support...');
        }

        function exportSystemLogs() {
          // Implementation would export system logs
          alert('Exporting system logs...');
        }

        function toggleDebugMode() {
          // Implementation would toggle debug mode
          alert('Debug mode toggled. Check console for detailed logging.');
        }

        // Initialize help system
        document.addEventListener('DOMContentLoaded', function() {
          // Set up keyboard shortcuts for help
          document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === '/') {
              e.preventDefault();
              showHelpCategory('getting-started');
            }
          });
        });
      </script>
    `;
    }
    generateMainMenuHTML() {
        return `
      <div class="main-menu-panel">
        <div class="menu-grid">
          <div class="menu-card" onclick="showPanel('swarm')">
            <div class="menu-icon">🐝</div>
            <h3>Swarm Management</h3>
            <p>Coordinate AI agents</p>
          </div>
          <div class="menu-card" onclick="showPanel('llm-stats')">
            <div class="menu-icon">🧠</div>
            <h3>LLM Statistics</h3>
            <p>Monitor AI performance</p>
          </div>
          <div class="menu-card" onclick="showPanel('file-browser')">
            <div class="menu-icon">📁</div>
            <h3>File Browser</h3>
            <p>Navigate project files</p>
          </div>
          <div class="menu-card" onclick="showPanel('performance')">
            <div class="menu-icon">📊</div>
            <h3>Performance</h3>
            <p>System metrics</p>
          </div>
          <div class="menu-card" onclick="showPanel('workspace')">
            <div class="menu-icon">🗂️</div>
            <h3>Workspace</h3>
            <p>Project management</p>
          </div>
          <div class="menu-card" onclick="showPanel('settings')">
            <div class="menu-icon">⚙️</div>
            <h3>Settings</h3>
            <p>Configuration</p>
          </div>
        </div>
      </div>
    `;
    }
    generateMCPServersHTML() {
        return `
      <div class="mcp-servers-panel">
        <div class="mcp-controls">
          <button class="btn btn-primary" onclick="addMCPServer()">
            <span class="icon">➕</span>
            Add Server
          </button>
          <button class="btn btn-secondary" onclick="refreshMCPServers()">
            <span class="icon">🔄</span>
            Refresh
          </button>
        </div>
        <div class="mcp-servers-list">
          <div class="mcp-server-item">
            <div class="server-header">
              <h4>claude-zen</h4>
              <span class="server-status running">Running</span>
            </div>
            <div class="server-details">
              <p>Command: npx claude-zen mcp start</p>
              <p>Tools: swarm_init, agent_spawn, task_orchestrate</p>
            </div>
          </div>
          <div class="mcp-server-item">
            <div class="server-header">
              <h4>context7</h4>
              <span class="server-status running">Running</span>
            </div>
            <div class="server-details">
              <p>Library documentation and code examples</p>
              <p>Tools: resolve-library-id, get-library-docs</p>
            </div>
          </div>
        </div>
      </div>
    `;
    }
    generateMCPTesterHTML() {
        return `
      <div class="mcp-tester-panel">
        <div class="test-controls">
          <select id="mcp-server-select" class="mcp-select">
            <option value="claude-zen">claude-zen</option>
            <option value="context7">context7</option>
          </select>
          <button class="btn btn-primary" onclick="runMCPTest()">
            <span class="icon">🧪</span>
            Run Test
          </button>
        </div>
        <div class="test-results">
          <h4>Test Results</h4>
          <div id="test-output" class="test-output">
            <div class="test-item success">
              <span class="test-status">✅</span>
              <span class="test-name">Connection Test</span>
              <span class="test-result">PASS</span>
            </div>
            <div class="test-item success">
              <span class="test-status">✅</span>
              <span class="test-name">Tool Discovery</span>
              <span class="test-result">PASS</span>
            </div>
            <div class="test-item pending">
              <span class="test-status">⏳</span>
              <span class="test-name">Tool Execution</span>
              <span class="test-result">PENDING</span>
            </div>
          </div>
        </div>
      </div>
    `;
    }
    generateNixManagerHTML() {
        return `
      <div class="nix-manager-panel">
        <div class="nix-status">
          <h4>Nix Environment Status</h4>
          <div class="status-item">
            <span class="status-label">Nix Version:</span>
            <span class="status-value">2.18.1</span>
          </div>
          <div class="status-item">
            <span class="status-label">Current Shell:</span>
            <span class="status-value">nix-shell</span>
          </div>
        </div>
        <div class="nix-commands">
          <h4>Quick Actions</h4>
          <button class="btn btn-secondary" onclick="executeNixCommand('nix-env -q')">
            <span class="icon">📦</span>
            List Packages
          </button>
          <button class="btn btn-secondary" onclick="executeNixCommand('nix-shell')">
            <span class="icon">🐚</span>
            Enter Shell
          </button>
          <button class="btn btn-secondary" onclick="executeNixCommand('nix-collect-garbage')">
            <span class="icon">🗑️</span>
            Collect Garbage
          </button>
        </div>
      </div>
    `;
    }
    generatePhase3LearningHTML() {
        return `
      <div class="phase3-learning-panel">
        <div class="learning-overview">
          <h4>Neural Learning Status</h4>
          <div class="learning-metrics">
            <div class="metric-item">
              <span class="metric-label">Learning Rate:</span>
              <span class="metric-value">0.85</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Pattern Recognition:</span>
              <span class="metric-value">92%</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Adaptation Score:</span>
              <span class="metric-value">87%</span>
            </div>
          </div>
        </div>
        <div class="learning-patterns">
          <h4>Recognized Patterns</h4>
          <div class="pattern-list">
            <div class="pattern-item">
              <span class="pattern-name">Code Review Optimization</span>
              <span class="pattern-confidence">95%</span>
            </div>
            <div class="pattern-item">
              <span class="pattern-name">Task Routing Efficiency</span>
              <span class="pattern-confidence">88%</span>
            </div>
            <div class="pattern-item">
              <span class="pattern-name">Error Recovery Patterns</span>
              <span class="pattern-confidence">91%</span>
            </div>
          </div>
        </div>
      </div>
    `;
    }
    generateSwarmDashboardHTML() {
        return `
      <div class="enhanced-swarm-panel">
        <div class="swarm-overview">
          <div class="swarm-metrics">
            <div class="metric-card">
              <h5>Active Agents</h5>
              <span class="metric-value">6</span>
            </div>
            <div class="metric-card">
              <h5>Tasks Completed</h5>
              <span class="metric-value">42</span>
            </div>
            <div class="metric-card">
              <h5>Success Rate</h5>
              <span class="metric-value">94%</span>
            </div>
          </div>
        </div>
        <div class="agent-grid">
          <div class="agent-card active">
            <div class="agent-header">
              <span class="agent-icon">🤖</span>
              <span class="agent-name">Coordinator</span>
              <span class="agent-status active">Active</span>
            </div>
            <div class="agent-metrics">
              <div class="agent-metric">
                <span>Tasks: 12</span>
                <span>Success: 100%</span>
              </div>
            </div>
          </div>
          <div class="agent-card busy">
            <div class="agent-header">
              <span class="agent-icon">⚡</span>
              <span class="agent-name">Researcher</span>
              <span class="agent-status busy">Busy</span>
            </div>
            <div class="agent-metrics">
              <div class="agent-metric">
                <span>Tasks: 8</span>
                <span>Success: 87%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    }
    generateWorkspaceHTML() {
        return `
      <div class="workspace-panel">
        <div class="workspace-header">
          <h4>Current Workspace</h4>
          <button class="btn btn-secondary" onclick="switchWorkspace()">
            <span class="icon">🔄</span>
            Switch
          </button>
        </div>
        <div class="workspace-info">
          <div class="workspace-detail">
            <span class="detail-label">Project:</span>
            <span class="detail-value">claude-code-zen</span>
          </div>
          <div class="workspace-detail">
            <span class="detail-label">Type:</span>
            <span class="detail-value">TypeScript</span>
          </div>
          <div class="workspace-detail">
            <span class="detail-label">Files:</span>
            <span class="detail-value">234 files</span>
          </div>
        </div>
        <div class="recent-files">
          <h5>Recent Files</h5>
          <div class="file-list">
            <div class="recent-file" onclick="openFile('src/main')">
              <span class="file-icon">📄</span>
              <span class="file-path">src/main.ts</span>
            </div>
            <div class="recent-file" onclick="openFile('src/interfaces/web/index')">
              <span class="file-icon">📄</span>
              <span class="file-path">src/interfaces/web/index.ts</span>
            </div>
          </div>
        </div>
      </div>
    `;
    }
    // Coordination System Panels (8)
    getAgentHealthPanel() { return { id: 'agent-health', title: 'Agent Health', icon: '🏥', content: '<div class="panel">Agent Health Monitor</div>' }; }
    getTaskCoordinatorPanel() { return { id: 'task-coordinator', title: 'Task Coordinator', icon: '📋', content: '<div class="panel">Task Coordination System</div>' }; }
    getQueenCoordinatorPanel() { return { id: 'queen-coordinator', title: 'Queen Coordinator', icon: '👑', content: '<div class="panel">Queen Coordination Hub</div>' }; }
    getSwarmCommanderPanel() { return { id: 'swarm-commander', title: 'Swarm Commander', icon: '⚔️', content: '<div class="panel">Swarm Command Center</div>' }; }
    getIntelligenceEnginePanel() { return { id: 'intelligence-engine', title: 'Intelligence Engine', icon: '🤖', content: '<div class="panel">AI Intelligence Engine</div>' }; }
    getLoadBalancingPanel() { return { id: 'load-balancing', title: 'Load Balancing', icon: '⚖️', content: '<div class="panel">Load Balancer Management</div>' }; }
    getOrchestrationPanel() { return { id: 'orchestration', title: 'Orchestration', icon: '🎼', content: '<div class="panel">Workflow Orchestration</div>' }; }
    getSafePipelinePanel() { return { id: 'safe-pipeline', title: 'SAFe Pipeline', icon: '🔧', content: '<div class="panel">SAFe Development Pipeline</div>' }; }
    // Database & Memory Panels (6)
    getDatabaseManagerPanel() { return { id: 'database-manager', title: 'Database Manager', icon: '🗄️', content: '<div class="panel">Database Management Console</div>' }; }
    getMemorySystemPanel() { return { id: 'memory-system', title: 'Memory System', icon: '💾', content: '<div class="panel">Memory System Monitor</div>' }; }
    getVectorStorePanel() { return { id: 'vector-store', title: 'Vector Store', icon: '🔢', content: '<div class="panel">Vector Database Management</div>' }; }
    getGraphDatabasePanel() { return { id: 'graph-database', title: 'Graph Database', icon: '🕸️', content: '<div class="panel">Graph Database Console</div>' }; }
    getDocumentServicePanel() { return { id: 'document-service', title: 'Document Service', icon: '📄', content: '<div class="panel">Document Management Service</div>' }; }
    getHybridFactoryPanel() { return { id: 'hybrid-factory', title: 'Hybrid Factory', icon: '🏭', content: '<div class="panel">Hybrid System Factory</div>' }; }
    // Neural & AI Panels (7)
    getNeuralNetworkPanel() { return { id: 'neural-network', title: 'Neural Network', icon: '🧠', content: '<div class="panel">Neural Network Monitor</div>' }; }
    getDspyEnginePanel() { return { id: 'dspy-engine', title: 'DSPy Engine', icon: '⚡', content: '<div class="panel">DSPy AI Engine</div>' }; }
    getAdaptiveLearningPanel() { return { id: 'adaptive-learning', title: 'Adaptive Learning', icon: '📚', content: '<div class="panel">Adaptive Learning System</div>' }; }
    getPatternRecognitionPanel() { return { id: 'pattern-recognition', title: 'Pattern Recognition', icon: '🔍', content: '<div class="panel">Pattern Recognition Engine</div>' }; }
    getBehavioralOptimizationPanel() { return { id: 'behavioral-optimization', title: 'Behavioral Optimization', icon: '🎯', content: '<div class="panel">Behavioral Optimization</div>' }; }
    getKnowledgeEvolutionPanel() { return { id: 'knowledge-evolution', title: 'Knowledge Evolution', icon: '🌱', content: '<div class="panel">Knowledge Evolution Tracker</div>' }; }
    getMLIntegrationPanel() { return { id: 'ml-integration', title: 'ML Integration', icon: '🔗', content: '<div class="panel">Machine Learning Integration</div>' }; }
    // Development & Diagnostics Panels (8)
    getDiagnosticsPanel() { return { id: 'diagnostics', title: 'Diagnostics', icon: '🔬', content: '<div class="panel">System Diagnostics</div>' }; }
    getHealthMonitorPanel() { return { id: 'health-monitor', title: 'Health Monitor', icon: '🏥', content: '<div class="panel">System Health Monitor</div>' }; }
    getLoggingConfigPanel() { return { id: 'logging-config', title: 'Logging Config', icon: '📊', content: '<div class="panel">Logging Configuration</div>' }; }
    getCliDiagnosticsPanel() { return { id: 'cli-diagnostics', title: 'CLI Diagnostics', icon: '⌨️', content: '<div class="panel">CLI Diagnostics Tool</div>' }; }
    getErrorMonitoringPanel() { return { id: 'error-monitoring', title: 'Error Monitoring', icon: '🚨', content: '<div class="panel">Error Monitoring System</div>' }; }
    getSystemResiliencePanel() { return { id: 'system-resilience', title: 'System Resilience', icon: '🛡️', content: '<div class="panel">System Resilience Monitor</div>' }; }
    getTypeEventSystemPanel() { return { id: 'type-event-system', title: 'Type Event System', icon: '🎪', content: '<div class="panel">Type-Safe Event System</div>' }; }
    getDomainValidatorPanel() { return { id: 'domain-validator', title: 'Domain Validator', icon: '✅', content: '<div class="panel">Domain Boundary Validator</div>' }; }
    // Interface & Client Panels (7)
    getApiClientPanel() { return { id: 'api-client', title: 'API Client', icon: '🌐', content: '<div class="panel">API Client Manager</div>' }; }
    getWebSocketClientPanel() { return { id: 'websocket-client', title: 'WebSocket Client', icon: '📡', content: '<div class="panel">WebSocket Client Console</div>' }; }
    getEventAdapterPanel() { return { id: 'event-adapter', title: 'Event Adapter', icon: '🔄', content: '<div class="panel">Event Adapter System</div>' }; }
    getServiceAdapterPanel() { return { id: 'service-adapter', title: 'Service Adapter', icon: '🔌', content: '<div class="panel">Service Adapter Manager</div>' }; }
    getKnowledgeClientPanel() { return { id: 'knowledge-client', title: 'Knowledge Client', icon: '📖', content: '<div class="panel">Knowledge Client Interface</div>' }; }
    getHttpClientPanel() { return { id: 'http-client', title: 'HTTP Client', icon: '🌍', content: '<div class="panel">HTTP Client Manager</div>' }; }
    getWebServicePanel() { return { id: 'web-service', title: 'Web Service', icon: '🚀', content: '<div class="panel">Web Service Console</div>' }; }
    // Monitoring & Analytics Panels (6)
    getOtelConsumerPanel() { return { id: 'otel-consumer', title: 'OTEL Consumer', icon: '📈', content: '<div class="panel">OpenTelemetry Consumer</div>' }; }
    getWorkflowMonitorPanel() { return { id: 'workflow-monitor', title: 'Workflow Monitor', icon: '🔄', content: '<div class="panel">Workflow Monitoring</div>' }; }
    getTuiDashboardPanel() { return { id: 'tui-dashboard', title: 'TUI Dashboard', icon: '📊', content: '<div class="panel">TUI Dashboard Legacy</div>' }; }
    getAnalyticsPanel() { return { id: 'analytics', title: 'Analytics', icon: '📊', content: '<div class="panel">Analytics Dashboard</div>' }; }
    getOptimizationPanel() { return { id: 'optimization', title: 'Optimization', icon: '⚡', content: '<div class="panel">Performance Optimization</div>' }; }
    getBenchmarkPanel() { return { id: 'benchmark', title: 'Benchmark', icon: '⏱️', content: '<div class="panel">Benchmark Testing</div>' }; }
}
/**
 * Default export
 */
export default WebDashboardPanels;
//# sourceMappingURL=web-dashboard-panels.js.map