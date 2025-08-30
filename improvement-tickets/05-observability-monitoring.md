# 📊 Ticket #5: Enterprise Observability & Performance Monitoring

## Priority: 🟢 P2 (Medium)

## Problem Statement

Claude Code Zen's **complex multi-level architecture** lacks comprehensive observability and performance monitoring capabilities. Key gaps identified:

- **No System-Wide Visibility**: 52+ packages, 5 domains, multi-database coordination without unified monitoring
- **Missing Performance Insights**: WASM neural processing, multi-level orchestration bottlenecks untracked
- **Limited Production Readiness**: No SLA monitoring, health checks, or performance baselines for enterprise deployment
- **Debugging Complexity**: Multi-agent coordination failures difficult to trace and diagnose

## Current State Analysis

### 1. Monitoring Gaps
```bash
# Missing observability components:
- Multi-level orchestration performance (Portfolio → Program → Swarm)
- Multi-database coordination health (SQLite + LanceDB + Kuzu)
- WASM neural processing performance and memory usage
- Agent coordination bottlenecks and failure patterns
- Web dashboard performance and user experience metrics
- Cross-package dependency performance impacts
- Resource utilization across the 52+ package architecture
```

### 2. Performance Unknowns
```bash
# Critical performance questions without answers:
- How do coordination decisions affect overall system performance?
- What are the bottlenecks in multi-database operations?
- How efficient is WASM memory management under load?
- What is the real-world performance of SAFe 6.0 + SPARC workflows?
- How do the 5 domains interact under production stress?
- What are the resource utilization patterns during peak coordination?
```

### 3. Enterprise Readiness Gaps
```bash
# Missing enterprise monitoring capabilities:
- SLA compliance tracking and alerting
- Business metric correlation with system performance
- Predictive failure detection and prevention
- Comprehensive audit trails for coordination decisions
- Performance regression detection across releases
- Multi-tenant resource isolation monitoring
```

## Proposed Solution

### Phase 1: Core Observability Infrastructure (1 week)

#### 1.1 Unified Metrics Collection Framework
```typescript
// packages/core/monitoring/src/metrics/unified-metrics.ts
import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

export interface MetricEvent {
  readonly timestamp: number;
  readonly source: string;
  readonly domain: string;
  readonly type: 'counter' | 'histogram' | 'gauge' | 'timer';
  readonly name: string;
  readonly value: number;
  readonly labels: Record<string, string>;
  readonly metadata?: Record<string, unknown>;
}

export class UnifiedMetricsCollector extends EventEmitter {
  private static instance: UnifiedMetricsCollector;
  private metrics: Map<string, MetricEvent[]> = new Map();
  private readonly retentionMs = 24 * 60 * 60 * 1000; // 24 hours

  static getInstance(): UnifiedMetricsCollector {
    if (!this.instance) {
      this.instance = new UnifiedMetricsCollector();
    }
    return this.instance;
  }

  recordMetric(event: Omit<MetricEvent, 'timestamp'>): void {
    const metricEvent: MetricEvent = {
      ...event,
      timestamp: performance.now()
    };

    const key = `${event.domain}.${event.name}`;
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    
    this.metrics.get(key)!.push(metricEvent);
    this.emit('metric', metricEvent);
    
    // Cleanup old metrics
    this.cleanupOldMetrics(key);
  }

  // Domain-specific metric helpers
  recordCoordinationMetric(name: string, value: number, labels: Record<string, string> = {}): void {
    this.recordMetric({
      source: 'coordination',
      domain: 'coordination',
      type: 'histogram',
      name,
      value,
      labels
    });
  }

  recordDatabaseMetric(adapter: string, operation: string, duration: number, success: boolean): void {
    this.recordMetric({
      source: `database.${adapter}`,
      domain: 'database',
      type: 'timer',
      name: 'operation_duration',
      value: duration,
      labels: { adapter, operation, success: success.toString() }
    });
  }

  recordNeuralMetric(operation: string, duration: number, memoryUsage: number): void {
    this.recordMetric({
      source: 'neural.wasm',
      domain: 'neural',
      type: 'histogram',
      name: 'operation_performance',
      value: duration,
      labels: { operation },
      metadata: { memoryUsage }
    });
  }

  recordInterfaceMetric(endpoint: string, responseTime: number, statusCode: number): void {
    this.recordMetric({
      source: 'web.dashboard',
      domain: 'interfaces',
      type: 'timer',
      name: 'request_duration',
      value: responseTime,
      labels: { endpoint, status: statusCode.toString() }
    });
  }

  getMetrics(domain?: string): MetricEvent[] {
    const allMetrics: MetricEvent[] = [];
    
    for (const [key, events] of this.metrics.entries()) {
      if (!domain || key.startsWith(domain)) {
        allMetrics.push(...events);
      }
    }
    
    return allMetrics.sort((a, b) => a.timestamp - b.timestamp);
  }

  getAggregatedMetrics(domain?: string, timeWindow?: number): AggregatedMetrics {
    const metrics = this.getMetrics(domain);
    const now = performance.now();
    const windowStart = timeWindow ? now - timeWindow : 0;
    
    const relevantMetrics = metrics.filter(m => m.timestamp >= windowStart);
    
    return this.aggregateMetrics(relevantMetrics);
  }

  private aggregateMetrics(metrics: MetricEvent[]): AggregatedMetrics {
    const aggregated: AggregatedMetrics = {
      counters: new Map(),
      histograms: new Map(),
      gauges: new Map(),
      timers: new Map()
    };

    for (const metric of metrics) {
      const key = `${metric.domain}.${metric.name}`;
      
      switch (metric.type) {
        case 'counter':
          aggregated.counters.set(key, (aggregated.counters.get(key) || 0) + metric.value);
          break;
        case 'histogram':
        case 'timer':
          if (!aggregated.histograms.has(key)) {
            aggregated.histograms.set(key, []);
          }
          aggregated.histograms.get(key)!.push(metric.value);
          break;
        case 'gauge':
          aggregated.gauges.set(key, metric.value);
          break;
      }
    }

    return aggregated;
  }

  private cleanupOldMetrics(key: string): void {
    const events = this.metrics.get(key)!;
    const cutoff = performance.now() - this.retentionMs;
    const filtered = events.filter(e => e.timestamp >= cutoff);
    this.metrics.set(key, filtered);
  }
}

export interface AggregatedMetrics {
  counters: Map<string, number>;
  histograms: Map<string, number[]>;
  gauges: Map<string, number>;
  timers: Map<string, number[]>;
}
```

#### 1.2 Domain-Specific Monitoring Agents
```typescript
// packages/core/monitoring/src/agents/coordination-monitor.ts
export class CoordinationMonitor {
  private metrics = UnifiedMetricsCollector.getInstance();
  private logger = getLogger('CoordinationMonitor');

  monitorPortfolioOrchestrator(orchestrator: PortfolioOrchestrator): void {
    // WIP limit monitoring
    orchestrator.on('wipLimitApproached', (data) => {
      this.metrics.recordCoordinationMetric('wip_limit_approached', data.currentWIP, {
        level: 'portfolio',
        category: data.category,
        limit: data.limit.toString()
      });
    });

    // Resource allocation tracking
    orchestrator.on('resourceAllocated', (data) => {
      this.metrics.recordCoordinationMetric('resource_allocation_time', data.duration, {
        level: 'portfolio',
        resource_type: data.resourceType,
        allocation_id: data.allocationId
      });
    });

    // Decision gate performance
    orchestrator.on('decisionGateCompleted', (data) => {
      this.metrics.recordCoordinationMetric('decision_gate_duration', data.duration, {
        level: 'portfolio',
        gate_type: data.gateType,
        outcome: data.outcome
      });
    });
  }

  monitorProgramOrchestrator(orchestrator: ProgramOrchestrator): void {
    // Epic coordination tracking
    orchestrator.on('epicStarted', (data) => {
      this.metrics.recordCoordinationMetric('epic_started', 1, {
        level: 'program',
        epic_id: data.epicId,
        program_increment: data.programIncrement
      });
    });

    // Cross-team coordination metrics
    orchestrator.on('crossTeamCoordination', (data) => {
      this.metrics.recordCoordinationMetric('cross_team_coordination_time', data.duration, {
        level: 'program',
        teams_involved: data.teamsInvolved.join(','),
        coordination_type: data.type
      });
    });
  }

  monitorSwarmExecution(orchestrator: SwarmExecutionOrchestrator): void {
    // SPARC phase tracking
    orchestrator.on('sparcPhaseCompleted', (data) => {
      this.metrics.recordCoordinationMetric('sparc_phase_duration', data.duration, {
        level: 'swarm',
        phase: data.phase,
        feature_id: data.featureId,
        success: data.success.toString()
      });
    });

    // Parallel execution efficiency
    orchestrator.on('parallelExecutionCompleted', (data) => {
      this.metrics.recordCoordinationMetric('parallel_execution_efficiency', data.efficiency, {
        level: 'swarm',
        streams_count: data.streamsCount.toString(),
        completion_time: data.completionTime.toString()
      });
    });
  }

  generateCoordinationReport(): CoordinationReport {
    const timeWindow = 60 * 60 * 1000; // 1 hour
    const metrics = this.metrics.getAggregatedMetrics('coordination', timeWindow);
    
    return {
      timestamp: new Date(),
      portfolioHealth: this.calculatePortfolioHealth(metrics),
      programEfficiency: this.calculateProgramEfficiency(metrics),
      swarmPerformance: this.calculateSwarmPerformance(metrics),
      bottlenecks: this.identifyBottlenecks(metrics),
      recommendations: this.generateRecommendations(metrics)
    };
  }

  private calculatePortfolioHealth(metrics: AggregatedMetrics): PortfolioHealth {
    // Implementation for portfolio health calculation
    return {
      wipUtilization: 0.8,
      decisionGateVelocity: 0.9,
      resourceAllocationEfficiency: 0.85,
      overallHealth: 'healthy'
    };
  }

  private identifyBottlenecks(metrics: AggregatedMetrics): CoordinationBottleneck[] {
    // Implementation for bottleneck detection
    return [];
  }
}
```

#### 1.3 Multi-Database Performance Monitor
```typescript
// packages/core/monitoring/src/agents/database-monitor.ts
export class DatabasePerformanceMonitor {
  private metrics = UnifiedMetricsCollector.getInstance();
  private adapters: Map<string, DatabaseAdapter> = new Map();
  private healthChecks: Map<string, NodeJS.Timeout> = new Map();

  registerAdapter(name: string, adapter: DatabaseAdapter): void {
    this.adapters.set(name, adapter);
    this.setupAdapterMonitoring(name, adapter);
    this.startHealthChecks(name, adapter);
  }

  private setupAdapterMonitoring(name: string, adapter: DatabaseAdapter): void {
    // Wrap adapter methods to collect metrics
    const originalQuery = adapter.query.bind(adapter);
    adapter.query = async (sql: string, params?: unknown[]) => {
      const startTime = performance.now();
      try {
        const result = await originalQuery(sql, params);
        const duration = performance.now() - startTime;
        
        this.metrics.recordDatabaseMetric(name, 'query', duration, true);
        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        this.metrics.recordDatabaseMetric(name, 'query', duration, false);
        throw error;
      }
    };

    // Similar wrapping for other methods...
  }

  private startHealthChecks(name: string, adapter: DatabaseAdapter): void {
    const interval = setInterval(async () => {
      const startTime = performance.now();
      try {
        const health = await adapter.healthCheck();
        const duration = performance.now() - startTime;
        
        this.metrics.recordDatabaseMetric(name, 'health_check', duration, health.status === 'healthy');
      } catch (error) {
        const duration = performance.now() - startTime;
        this.metrics.recordDatabaseMetric(name, 'health_check', duration, false);
      }
    }, 30000); // Every 30 seconds

    this.healthChecks.set(name, interval);
  }

  async generateDatabaseReport(): Promise<DatabaseReport> {
    const reports: Record<string, AdapterReport> = {};
    
    for (const [name, adapter] of this.adapters.entries()) {
      reports[name] = await this.generateAdapterReport(name, adapter);
    }

    return {
      timestamp: new Date(),
      adapters: reports,
      crossAdapterMetrics: await this.analyzeCrossAdapterPerformance(),
      recommendations: this.generateDatabaseRecommendations(reports)
    };
  }

  private async generateAdapterReport(name: string, adapter: DatabaseAdapter): Promise<AdapterReport> {
    const timeWindow = 60 * 60 * 1000; // 1 hour
    const metrics = this.metrics.getMetrics('database').filter(m => m.labels.adapter === name);
    
    const queryMetrics = metrics.filter(m => m.labels.operation === 'query');
    const healthMetrics = metrics.filter(m => m.labels.operation === 'health_check');
    
    return {
      name,
      health: await adapter.healthCheck(),
      queryPerformance: this.analyzeQueryPerformance(queryMetrics),
      healthCheckResults: this.analyzeHealthChecks(healthMetrics),
      resourceUtilization: await this.getResourceUtilization(name, adapter)
    };
  }

  private async analyzeCrossAdapterPerformance(): Promise<CrossAdapterMetrics> {
    // Analyze coordination patterns across databases
    const coordinated_operations = this.metrics.getMetrics().filter(m => 
      m.metadata?.multi_database === true
    );

    return {
      coordinatedOperations: coordinated_operations.length,
      averageCoordinationTime: this.calculateAverage(coordinated_operations.map(m => m.value)),
      consistencyLatency: await this.measureConsistencyLatency(),
      failureCorrelation: this.analyzeFailureCorrelation()
    };
  }
}
```

### Phase 2: Real-Time Performance Dashboard (4-5 days)

#### 2.1 Enterprise Monitoring Dashboard
```typescript
// packages/interfaces/monitoring-dashboard/src/dashboard.ts
import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';

export class EnterpriseMonitoringDashboard {
  private app = express();
  private server = createServer(this.app);
  private wss = new WebSocketServer({ server: this.server });
  private metrics = UnifiedMetricsCollector.getInstance();

  async start(port: number = 3003): Promise<void> {
    this.setupRoutes();
    this.setupWebSocket();
    this.startMetricsBroadcast();

    this.server.listen(port, () => {
      console.log(`📊 Enterprise Monitoring Dashboard: http://localhost:${port}`);
    });
  }

  private setupRoutes(): void {
    this.app.use(express.static('public'));

    // Main dashboard
    this.app.get('/', (req, res) => {
      res.send(this.generateDashboardHTML());
    });

    // API endpoints
    this.app.get('/api/metrics/:domain?', (req, res) => {
      const domain = req.params.domain;
      const timeWindow = parseInt(req.query.timeWindow as string) || 3600000; // 1 hour default
      
      const metrics = this.metrics.getAggregatedMetrics(domain, timeWindow);
      res.json(this.formatMetricsForAPI(metrics));
    });

    this.app.get('/api/health', async (req, res) => {
      const health = await this.generateSystemHealthReport();
      res.json(health);
    });

    this.app.get('/api/performance', async (req, res) => {
      const performance = await this.generatePerformanceReport();
      res.json(performance);
    });

    this.app.get('/api/alerts', (req, res) => {
      const alerts = this.generateActiveAlerts();
      res.json(alerts);
    });
  }

  private setupWebSocket(): void {
    this.wss.on('connection', (ws) => {
      console.log('Client connected to monitoring dashboard');
      
      ws.on('message', (message) => {
        const data = JSON.parse(message.toString());
        this.handleWebSocketMessage(ws, data);
      });

      ws.on('close', () => {
        console.log('Client disconnected from monitoring dashboard');
      });
    });
  }

  private startMetricsBroadcast(): void {
    // Broadcast real-time metrics to all connected clients
    this.metrics.on('metric', (metric) => {
      const message = JSON.stringify({
        type: 'metric_update',
        data: metric
      });

      this.wss.clients.forEach(client => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(message);
        }
      });
    });

    // Broadcast periodic summaries
    setInterval(async () => {
      const summary = await this.generateRealTimeSummary();
      const message = JSON.stringify({
        type: 'summary_update',
        data: summary
      });

      this.wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(message);
        }
      });
    }, 5000); // Every 5 seconds
  }

  private generateDashboardHTML(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude Code Zen - Enterprise Monitoring</title>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .metric-card { transition: all 0.3s ease; }
        .metric-card:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        .status-healthy { border-left: 4px solid #10B981; }
        .status-warning { border-left: 4px solid #F59E0B; }
        .status-critical { border-left: 4px solid #EF4444; }
        .real-time-indicator { animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    </style>
</head>
<body class="bg-gray-100">
    <div class="container mx-auto px-4 py-8">
        <header class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">
                📊 Claude Code Zen - Enterprise Monitoring
                <span class="real-time-indicator inline-block w-3 h-3 bg-green-500 rounded-full ml-2"></span>
            </h1>
            <p class="text-gray-600">Real-time performance monitoring across 5 domains and 52+ packages</p>
        </header>

        <!-- System Health Overview -->
        <section class="mb-8">
            <h2 class="text-2xl font-semibold mb-4">🏥 System Health Overview</h2>
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4" id="health-overview">
                <!-- Dynamic health cards will be inserted here -->
            </div>
        </section>

        <!-- Performance Metrics -->
        <section class="mb-8">
            <h2 class="text-2xl font-semibold mb-4">⚡ Performance Metrics</h2>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="metric-card bg-white p-6 rounded-lg shadow">
                    <h3 class="text-lg font-semibold mb-3">🤝 Coordination Performance</h3>
                    <div id="coordination-chart"></div>
                </div>
                <div class="metric-card bg-white p-6 rounded-lg shadow">
                    <h3 class="text-lg font-semibold mb-3">🗄️ Database Performance</h3>
                    <div id="database-chart"></div>
                </div>
                <div class="metric-card bg-white p-6 rounded-lg shadow">
                    <h3 class="text-lg font-semibold mb-3">🧠 Neural Processing</h3>
                    <div id="neural-chart"></div>
                </div>
                <div class="metric-card bg-white p-6 rounded-lg shadow">
                    <h3 class="text-lg font-semibold mb-3">🌐 Interface Response Times</h3>
                    <div id="interface-chart"></div>
                </div>
            </div>
        </section>

        <!-- Active Alerts -->
        <section class="mb-8">
            <h2 class="text-2xl font-semibold mb-4">🚨 Active Alerts</h2>
            <div id="alerts-container" class="space-y-3">
                <!-- Dynamic alert cards will be inserted here -->
            </div>
        </section>

        <!-- Multi-Level Orchestration Flow -->
        <section class="mb-8">
            <h2 class="text-2xl font-semibold mb-4">🎭 Multi-Level Orchestration Flow</h2>
            <div class="bg-white p-6 rounded-lg shadow">
                <div id="orchestration-flow-chart"></div>
            </div>
        </section>
    </div>

    <script>
        class MonitoringDashboard {
            constructor() {
                this.ws = new WebSocket('ws://localhost:3003');
                this.setupWebSocket();
                this.initializeCharts();
                this.startDataRefresh();
            }

            setupWebSocket() {
                this.ws.onmessage = (event) => {
                    const message = JSON.parse(event.data);
                    this.handleRealtimeUpdate(message);
                };

                this.ws.onopen = () => {
                    console.log('Connected to monitoring WebSocket');
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                };
            }

            async initializeCharts() {
                // Initialize all Plotly charts
                await this.updateHealthOverview();
                await this.updatePerformanceCharts();
                await this.updateAlertsDisplay();
                await this.updateOrchestrationFlow();
            }

            async updateHealthOverview() {
                const response = await fetch('/api/health');
                const health = await response.json();
                
                const container = document.getElementById('health-overview');
                container.innerHTML = '';

                const domains = ['neural', 'coordination', 'database', 'memory', 'interfaces'];
                domains.forEach(domain => {
                    const domainHealth = health.domains[domain] || { status: 'unknown' };
                    const card = this.createHealthCard(domain, domainHealth);
                    container.appendChild(card);
                });
            }

            createHealthCard(domain, health) {
                const div = document.createElement('div');
                const statusClass = \`status-\${health.status === 'healthy' ? 'healthy' : health.status === 'degraded' ? 'warning' : 'critical'}\`;
                
                div.className = \`metric-card bg-white p-4 rounded-lg shadow \${statusClass}\`;
                div.innerHTML = \`
                    <h3 class="font-semibold capitalize">\${this.getDomainEmoji(domain)} \${domain}</h3>
                    <p class="text-2xl font-bold \${this.getStatusColor(health.status)}">\${health.status}</p>
                    <p class="text-sm text-gray-600">\${health.message || 'All systems operational'}</p>
                \`;
                
                return div;
            }

            getDomainEmoji(domain) {
                const emojis = {
                    'neural': '🧠',
                    'coordination': '🤝',
                    'database': '🗄️',
                    'memory': '💾',
                    'interfaces': '🌐'
                };
                return emojis[domain] || '📊';
            }

            getStatusColor(status) {
                const colors = {
                    'healthy': 'text-green-600',
                    'degraded': 'text-yellow-600',
                    'unhealthy': 'text-red-600',
                    'unknown': 'text-gray-600'
                };
                return colors[status] || 'text-gray-600';
            }

            async updatePerformanceCharts() {
                const response = await fetch('/api/performance');
                const performance = await response.json();

                // Update coordination chart
                const coordinationData = [{
                    x: performance.coordination.timestamps,
                    y: performance.coordination.responseTime,
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: 'Response Time',
                    line: { color: '#10B981' }
                }];

                Plotly.newPlot('coordination-chart', coordinationData, {
                    title: 'Coordination Response Time (ms)',
                    xaxis: { title: 'Time' },
                    yaxis: { title: 'Response Time (ms)' }
                });

                // Similar updates for other charts...
            }

            handleRealtimeUpdate(message) {
                switch (message.type) {
                    case 'metric_update':
                        this.updateMetricDisplay(message.data);
                        break;
                    case 'summary_update':
                        this.updateSummaryDisplay(message.data);
                        break;
                    case 'alert':
                        this.displayNewAlert(message.data);
                        break;
                }
            }

            startDataRefresh() {
                // Refresh charts every 30 seconds
                setInterval(() => {
                    this.updatePerformanceCharts();
                }, 30000);

                // Refresh health overview every 60 seconds
                setInterval(() => {
                    this.updateHealthOverview();
                }, 60000);
            }
        }

        // Initialize dashboard when page loads
        document.addEventListener('DOMContentLoaded', () => {
            new MonitoringDashboard();
        });
    </script>
</body>
</html>
    `;
  }
}
```

### Phase 3: Predictive Analytics & Alerting (3-4 days)

#### 3.1 Intelligent Alert System
```typescript
// packages/core/monitoring/src/alerting/intelligent-alerts.ts
export class IntelligentAlertSystem {
  private rules: Map<string, AlertRule> = new Map();
  private metrics = UnifiedMetricsCollector.getInstance();
  private logger = getLogger('IntelligentAlerts');
  private alertHistory: Alert[] = [];

  constructor() {
    this.setupDefaultRules();
    this.startMonitoring();
  }

  private setupDefaultRules(): void {
    // Coordination performance alerts
    this.addRule({
      id: 'coordination_response_time',
      name: 'Coordination Response Time',
      description: 'Alert when coordination operations exceed acceptable latency',
      condition: {
        metric: 'coordination.operation_duration',
        operator: 'greater_than',
        threshold: 5000, // 5 seconds
        timeWindow: 300000, // 5 minutes
        minOccurrences: 3
      },
      severity: 'warning',
      actions: ['log', 'webhook', 'dashboard']
    });

    // Database performance alerts
    this.addRule({
      id: 'database_query_timeout',
      name: 'Database Query Timeout',
      description: 'Alert when database queries consistently exceed timeout',
      condition: {
        metric: 'database.operation_duration',
        operator: 'greater_than',
        threshold: 10000, // 10 seconds
        timeWindow: 180000, // 3 minutes
        minOccurrences: 2
      },
      severity: 'critical',
      actions: ['log', 'webhook', 'dashboard', 'pager']
    });

    // WASM memory alerts
    this.addRule({
      id: 'wasm_memory_leak',
      name: 'WASM Memory Leak Detection',
      description: 'Alert when WASM memory usage shows leak patterns',
      condition: {
        metric: 'neural.operation_performance',
        operator: 'trend_increasing',
        threshold: 0.1, // 10% increase over time
        timeWindow: 1800000, // 30 minutes
        minOccurrences: 1
      },
      severity: 'warning',
      actions: ['log', 'webhook', 'dashboard']
    });

    // Multi-level orchestration bottleneck
    this.addRule({
      id: 'orchestration_bottleneck',
      name: 'Multi-Level Orchestration Bottleneck',
      description: 'Alert when orchestration levels show coordination bottlenecks',
      condition: {
        metric: 'coordination.wip_limit_approached',
        operator: 'greater_than',
        threshold: 0.9, // 90% of WIP limit
        timeWindow: 600000, // 10 minutes
        minOccurrences: 1
      },
      severity: 'warning',
      actions: ['log', 'webhook', 'dashboard']
    });
  }

  addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
    this.logger.info(`Alert rule added: ${rule.name}`);
  }

  private startMonitoring(): void {
    this.metrics.on('metric', (metric) => {
      this.evaluateRules(metric);
    });

    // Periodic evaluation for trend-based rules
    setInterval(() => {
      this.evaluateTrendRules();
    }, 60000); // Every minute
  }

  private evaluateRules(metric: MetricEvent): void {
    for (const rule of this.rules.values()) {
      if (this.doesMetricMatchRule(metric, rule)) {
        this.evaluateRuleCondition(rule, metric);
      }
    }
  }

  private doesMetricMatchRule(metric: MetricEvent, rule: AlertRule): boolean {
    const metricName = `${metric.domain}.${metric.name}`;
    return metricName === rule.condition.metric;
  }

  private evaluateRuleCondition(rule: AlertRule, metric: MetricEvent): void {
    const timeWindow = rule.condition.timeWindow;
    const now = performance.now();
    const windowStart = now - timeWindow;

    // Get recent metrics for this rule
    const recentMetrics = this.metrics.getMetrics(metric.domain)
      .filter(m => 
        m.name === metric.name && 
        m.timestamp >= windowStart &&
        m.timestamp <= now
      );

    const shouldAlert = this.checkCondition(rule.condition, recentMetrics);

    if (shouldAlert) {
      this.triggerAlert(rule, metric, recentMetrics);
    }
  }

  private checkCondition(condition: AlertCondition, metrics: MetricEvent[]): boolean {
    switch (condition.operator) {
      case 'greater_than':
        const exceedingMetrics = metrics.filter(m => m.value > condition.threshold);
        return exceedingMetrics.length >= condition.minOccurrences;

      case 'less_than':
        const belowMetrics = metrics.filter(m => m.value < condition.threshold);
        return belowMetrics.length >= condition.minOccurrences;

      case 'trend_increasing':
        return this.detectIncreasingTrend(metrics, condition.threshold);

      case 'trend_decreasing':
        return this.detectDecreasingTrend(metrics, condition.threshold);

      default:
        return false;
    }
  }

  private detectIncreasingTrend(metrics: MetricEvent[], threshold: number): boolean {
    if (metrics.length < 2) return false;

    const sorted = metrics.sort((a, b) => a.timestamp - b.timestamp);
    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2));

    const firstAvg = firstHalf.reduce((sum, m) => sum + m.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, m) => sum + m.value, 0) / secondHalf.length;

    const percentageIncrease = (secondAvg - firstAvg) / firstAvg;
    return percentageIncrease > threshold;
  }

  private triggerAlert(rule: AlertRule, triggeringMetric: MetricEvent, context: MetricEvent[]): void {
    const alert: Alert = {
      id: `${rule.id}_${Date.now()}`,
      ruleId: rule.id,
      ruleName: rule.name,
      severity: rule.severity,
      message: this.generateAlertMessage(rule, triggeringMetric, context),
      timestamp: new Date(),
      triggeringMetric,
      context: {
        recentMetrics: context,
        threshold: rule.condition.threshold,
        actualValue: triggeringMetric.value
      },
      status: 'active'
    };

    this.alertHistory.push(alert);
    this.executeAlertActions(rule, alert);
    
    this.logger.warn(`Alert triggered: ${alert.message}`, { alert });
  }

  private generateAlertMessage(rule: AlertRule, metric: MetricEvent, context: MetricEvent[]): string {
    const avg = context.reduce((sum, m) => sum + m.value, 0) / context.length;
    
    return `${rule.name}: ${metric.domain}.${metric.name} = ${metric.value.toFixed(2)} ` +
           `(threshold: ${rule.condition.threshold}, avg: ${avg.toFixed(2)})`;
  }

  private executeAlertActions(rule: AlertRule, alert: Alert): void {
    rule.actions.forEach(action => {
      switch (action) {
        case 'log':
          this.logger.error(`ALERT: ${alert.message}`);
          break;
        case 'webhook':
          this.sendWebhook(alert);
          break;
        case 'dashboard':
          this.sendToDashboard(alert);
          break;
        case 'pager':
          this.sendToPageService(alert);
          break;
      }
    });
  }

  private sendToDashboard(alert: Alert): void {
    // Send alert to monitoring dashboard via WebSocket
    // Implementation would integrate with dashboard WebSocket
  }

  getActiveAlerts(): Alert[] {
    return this.alertHistory.filter(a => a.status === 'active');
  }

  getAlertHistory(hours: number = 24): Alert[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.alertHistory.filter(a => a.timestamp >= cutoff);
  }
}
```

#### 3.2 Performance Prediction Engine
```typescript
// packages/core/monitoring/src/prediction/performance-predictor.ts
export class PerformancePredictionEngine {
  private models: Map<string, PredictionModel> = new Map();
  private metrics = UnifiedMetricsCollector.getInstance();
  private logger = getLogger('PerformancePrediction');

  constructor() {
    this.initializeModels();
    this.startPredictionCycle();
  }

  private initializeModels(): void {
    // Coordination performance prediction
    this.models.set('coordination_performance', {
      name: 'Coordination Performance',
      type: 'linear_regression',
      features: ['wip_utilization', 'resource_allocation_rate', 'decision_gate_velocity'],
      target: 'overall_coordination_latency',
      trainingWindow: 7 * 24 * 60 * 60 * 1000, // 7 days
      predictionHorizon: 60 * 60 * 1000, // 1 hour ahead
      accuracy: 0.0,
      lastTrained: null
    });

    // Database load prediction
    this.models.set('database_load', {
      name: 'Database Load Prediction',
      type: 'time_series',
      features: ['query_rate', 'connection_count', 'data_size_growth'],
      target: 'database_response_time',
      trainingWindow: 3 * 24 * 60 * 60 * 1000, // 3 days
      predictionHorizon: 30 * 60 * 1000, // 30 minutes ahead
      accuracy: 0.0,
      lastTrained: null
    });

    // WASM memory usage prediction
    this.models.set('wasm_memory', {
      name: 'WASM Memory Usage',
      type: 'exponential_smoothing',
      features: ['operation_frequency', 'batch_size', 'complexity_score'],
      target: 'memory_usage',
      trainingWindow: 24 * 60 * 60 * 1000, // 1 day
      predictionHorizon: 15 * 60 * 1000, // 15 minutes ahead
      accuracy: 0.0,
      lastTrained: null
    });
  }

  private startPredictionCycle(): void {
    // Retrain models periodically
    setInterval(() => {
      this.retrainModels();
    }, 60 * 60 * 1000); // Every hour

    // Generate predictions
    setInterval(() => {
      this.generatePredictions();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  private async retrainModels(): Promise<void> {
    for (const [modelId, model] of this.models.entries()) {
      try {
        await this.retrainModel(modelId, model);
        this.logger.info(`Model retrained: ${model.name}, accuracy: ${model.accuracy}`);
      } catch (error) {
        this.logger.error(`Failed to retrain model ${model.name}`, error);
      }
    }
  }

  private async retrainModel(modelId: string, model: PredictionModel): Promise<void> {
    const trainingData = await this.getTrainingData(model);
    
    if (trainingData.length < 100) {
      this.logger.warn(`Insufficient training data for ${model.name}: ${trainingData.length} points`);
      return;
    }

    const accuracy = await this.trainModel(model, trainingData);
    model.accuracy = accuracy;
    model.lastTrained = new Date();
    
    this.models.set(modelId, model);
  }

  private async getTrainingData(model: PredictionModel): Promise<TrainingDataPoint[]> {
    const endTime = Date.now();
    const startTime = endTime - model.trainingWindow;
    
    const metrics = this.metrics.getMetrics().filter(m => 
      m.timestamp >= startTime && m.timestamp <= endTime
    );

    return this.preprocessMetricsForTraining(metrics, model);
  }

  private preprocessMetricsForTraining(metrics: MetricEvent[], model: PredictionModel): TrainingDataPoint[] {
    // Group metrics by time windows for feature extraction
    const timeWindows = this.groupMetricsByTimeWindows(metrics, 5 * 60 * 1000); // 5-minute windows
    
    const trainingPoints: TrainingDataPoint[] = [];
    
    for (const window of timeWindows) {
      const features = this.extractFeatures(window, model.features);
      const target = this.extractTarget(window, model.target);
      
      if (features && target !== null) {
        trainingPoints.push({
          timestamp: window.timestamp,
          features,
          target
        });
      }
    }
    
    return trainingPoints;
  }

  private groupMetricsByTimeWindows(metrics: MetricEvent[], windowSize: number): TimeWindow[] {
    const windows: Map<number, MetricEvent[]> = new Map();
    
    for (const metric of metrics) {
      const windowStart = Math.floor(metric.timestamp / windowSize) * windowSize;
      
      if (!windows.has(windowStart)) {
        windows.set(windowStart, []);
      }
      
      windows.get(windowStart)!.push(metric);
    }
    
    return Array.from(windows.entries()).map(([timestamp, metrics]) => ({
      timestamp,
      metrics
    }));
  }

  private extractFeatures(window: TimeWindow, featureNames: string[]): number[] | null {
    const features: number[] = [];
    
    for (const featureName of featureNames) {
      const feature = this.calculateFeature(window.metrics, featureName);
      if (feature === null) return null;
      features.push(feature);
    }
    
    return features;
  }

  private calculateFeature(metrics: MetricEvent[], featureName: string): number | null {
    switch (featureName) {
      case 'wip_utilization':
        const wipMetrics = metrics.filter(m => m.name === 'wip_limit_approached');
        return wipMetrics.length > 0 ? wipMetrics[wipMetrics.length - 1].value : 0;
        
      case 'resource_allocation_rate':
        const allocationMetrics = metrics.filter(m => m.name === 'resource_allocation_time');
        return allocationMetrics.length;
        
      case 'query_rate':
        const queryMetrics = metrics.filter(m => m.name === 'operation_duration' && m.labels.operation === 'query');
        return queryMetrics.length;
        
      case 'operation_frequency':
        const operationMetrics = metrics.filter(m => m.domain === 'neural');
        return operationMetrics.length;
        
      default:
        return null;
    }
  }

  private async trainModel(model: PredictionModel, trainingData: TrainingDataPoint[]): Promise<number> {
    switch (model.type) {
      case 'linear_regression':
        return this.trainLinearRegression(trainingData);
      case 'time_series':
        return this.trainTimeSeries(trainingData);
      case 'exponential_smoothing':
        return this.trainExponentialSmoothing(trainingData);
      default:
        throw new Error(`Unknown model type: ${model.type}`);
    }
  }

  private trainLinearRegression(data: TrainingDataPoint[]): number {
    // Simple linear regression implementation
    // In production, would use a proper ML library
    const n = data.length;
    if (n === 0) return 0;
    
    // For simplicity, assume single feature for now
    const x = data.map(d => d.features[0]);
    const y = data.map(d => d.target);
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate R-squared
    const yMean = sumY / n;
    const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - (slope * x[i] + intercept), 2), 0);
    const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    
    return 1 - ssRes / ssTot;
  }

  async generatePredictions(): Promise<PredictionResult[]> {
    const predictions: PredictionResult[] = [];
    
    for (const [modelId, model] of this.models.entries()) {
      if (!model.lastTrained) continue;
      
      try {
        const prediction = await this.makePrediction(modelId, model);
        predictions.push(prediction);
      } catch (error) {
        this.logger.error(`Prediction failed for ${model.name}`, error);
      }
    }
    
    return predictions;
  }

  private async makePrediction(modelId: string, model: PredictionModel): Promise<PredictionResult> {
    const currentFeatures = await this.getCurrentFeatures(model);
    const predictedValue = this.predict(model, currentFeatures);
    
    return {
      modelId,
      modelName: model.name,
      timestamp: new Date(),
      horizon: model.predictionHorizon,
      predictedValue,
      confidence: model.accuracy,
      features: currentFeatures
    };
  }

  private async getCurrentFeatures(model: PredictionModel): Promise<number[]> {
    const recentWindow = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();
    const recentMetrics = this.metrics.getMetrics().filter(m => 
      m.timestamp >= now - recentWindow && m.timestamp <= now
    );
    
    const features: number[] = [];
    for (const featureName of model.features) {
      const feature = this.calculateFeature(recentMetrics, featureName);
      features.push(feature || 0);
    }
    
    return features;
  }

  private predict(model: PredictionModel, features: number[]): number {
    // Simplified prediction logic
    // In production, would use trained model parameters
    switch (model.type) {
      case 'linear_regression':
        return features[0] * 1.2 + 100; // Placeholder
      case 'time_series':
        return features.reduce((sum, f) => sum + f, 0) / features.length * 1.1;
      case 'exponential_smoothing':
        return features[features.length - 1] * 1.05;
      default:
        return 0;
    }
  }
}
```

## Implementation Plan

### Week 1: Core Infrastructure
- [ ] Unified metrics collection framework
- [ ] Domain-specific monitoring agents
- [ ] Basic dashboard with real-time updates
- [ ] Database performance monitoring

### Week 2: Advanced Monitoring  
- [ ] Enterprise monitoring dashboard
- [ ] WebSocket real-time updates
- [ ] Multi-level orchestration monitoring
- [ ] WASM performance tracking

### Week 3: Intelligence & Alerts
- [ ] Intelligent alert system with rules
- [ ] Performance prediction engine
- [ ] Bottleneck detection and analysis
- [ ] Comprehensive reporting system

### Week 4: Production Readiness
- [ ] SLA monitoring and compliance
- [ ] Production deployment monitoring
- [ ] Performance regression detection
- [ ] Documentation and training

## Success Metrics

### Observability Coverage
- **100% domain monitoring** across all 5 domains
- **Real-time dashboards** with <5 second latency
- **Comprehensive alerting** for critical performance issues
- **Historical trend analysis** with 7+ days retention

### Performance Insights
- **Bottleneck identification** in multi-level orchestration
- **Database optimization** recommendations with measurable improvements
- **WASM performance** optimization with memory leak detection
- **Prediction accuracy** >80% for key performance metrics

### Enterprise Readiness
- **SLA compliance tracking** with automated reporting
- **Production monitoring** with 99.9% uptime visibility
- **Performance regression** detection with automatic alerts
- **Capacity planning** with predictive analytics

## Risk Mitigation

### Technical Risks
- **Performance Impact**: Monitor overhead of monitoring itself
- **Data Volume**: Implement intelligent retention and aggregation
- **Prediction Accuracy**: Start with simple models and iterate

### Operational Risks
- **Alert Fatigue**: Implement intelligent noise reduction
- **Dashboard Performance**: Optimize for real-time updates
- **Data Privacy**: Ensure compliance with enterprise requirements

## Expected ROI

### Operational Excellence
- **60-70% faster** issue resolution through better visibility
- **Proactive issue prevention** through predictive analytics
- **Improved SLA compliance** through continuous monitoring

### Performance Optimization
- **20-30% performance improvements** through bottleneck identification
- **Resource optimization** leading to cost reduction
- **Better capacity planning** preventing performance degradation

## Dependencies

- Metrics collection libraries (Prometheus-compatible)
- Real-time dashboard framework (WebSocket, Plotly)
- Alerting infrastructure (webhooks, notifications)
- Machine learning libraries for prediction
- Enterprise logging and monitoring integration

## Notes

This ticket establishes **enterprise-grade observability** for the sophisticated Claude Code Zen architecture. The multi-level monitoring approach matches the multi-level orchestration architecture, providing visibility into Portfolio → Program → Swarm coordination flows.

The predictive analytics component provides proactive performance management, crucial for enterprise deployments where performance degradation must be prevented rather than reactively addressed.