/**
 * @fileoverview Live TUI Monitoring Dashboard for Phase 3 Ensemble Learning
 *
 * Real-time terminal interface for monitoring ensemble learning performance,
 * agent coordination, neural alignment, and system health metrics.
 *
 * Features:
 * - Live performance metrics display
 * - Real-time learning event stream
 * - Agent status and coordination tracking
 * - Interactive controls and filters
 * - Historical trend visualization
 *
 * @author Claude Code Zen Team - Monitoring Infrastructure
 * @since 1.0.0-alpha.44
 * @version 1.0.0
 */

import blessed from 'blessed';
import contrib from 'blessed-contrib';
import chalk from 'chalk';
import { EventEmitter } from 'node:events';
import { Phase3EnsembleLearning } from '../coordination/swarm/learning/phase-3-ensemble';
import { NeuralEnsembleCoordinator } from '../coordination/swarm/learning/neural-ensemble-coordinator';
import { getLogger } from '../config/logging-config';

interface DashboardMetrics {
  accuracy: number;
  confidence: number;
  tokensUsed: number;
  tasksCompleted: number;
  learningEvents: number;
  agentsActive: number;
  adaptationCount: number;
  tierPerformance: {
    tier1: { accuracy: number; models: number };
    tier2: { accuracy: number; models: number };
    tier3: { accuracy: number; models: number };
  };
  recentTasks: Array<{
    id: string;
    type: string;
    accuracy: number;
    duration: number;
    timestamp: Date;
  }>;
  learningStream: Array<{
    event: string;
    data: any;
    timestamp: Date;
  }>;
}

interface TUIComponents {
  screen: blessed.Widgets.Screen;
  grid: contrib.grid;
  performanceGauge: contrib.Widgets.GaugeElement;
  confidenceGauge: contrib.Widgets.GaugeElement;
  accuracyChart: contrib.Widgets.LineElement;
  tierTable: contrib.Widgets.TableElement;
  tasksList: blessed.Widgets.ListElement;
  learningLog: blessed.Widgets.LogElement;
  metricsBox: blessed.Widgets.BoxElement;
  controlsBox: blessed.Widgets.BoxElement;
  statusBar: blessed.Widgets.BoxElement;
}

/**
 * Live TUI Dashboard for Phase 3 Ensemble Monitoring
 */
export class Phase3TUIDashboard extends EventEmitter {
  private components: TUIComponents;
  private ensembleSystem?: Phase3EnsembleLearning;
  private coordinator?: NeuralEnsembleCoordinator;
  private updateInterval: NodeJS.Timeout;
  private metrics: DashboardMetrics;
  private accuracyHistory: number[] = [];
  private isRunning = false;
  private refreshRate = 1000; // 1 second
  private logger = getLogger('Phase3TUIDashboard');

  constructor() {
    super();
    this.initializeComponents();
    this.initializeMetrics();
    this.setupKeyHandlers();
    this.setupUpdateLoop();
  }

  /**
   * Initialize TUI components and layout
   */
  private initializeComponents(): void {
    // Create blessed screen
    const screen = blessed.screen({
      smartCSR: true,
      title: 'Phase 3 Ensemble Learning - Live Monitor',
    });

    // Create grid layout
    const grid = new contrib.grid({
      rows: 12,
      cols: 12,
      screen: screen,
    });

    // Performance gauges (top row)
    const performanceGauge = grid.set(0, 0, 3, 3, contrib.gauge, {
      label: 'Accuracy %',
      stroke: 'green',
      fill: 'white',
      border: { type: 'line', fg: 'cyan' },
      style: { fg: 'white', bg: 'black' },
    });

    const confidenceGauge = grid.set(0, 3, 3, 3, contrib.gauge, {
      label: 'Confidence %',
      stroke: 'blue',
      fill: 'white',
      border: { type: 'line', fg: 'cyan' },
      style: { fg: 'white', bg: 'black' },
    });

    // Real-time accuracy chart
    const accuracyChart = grid.set(0, 6, 6, 6, contrib.line, {
      style: {
        line: 'yellow',
        text: 'green',
        baseline: 'black',
      },
      xLabelPadding: 3,
      xPadding: 5,
      label: 'Accuracy Trend (Last 60 Points)',
      border: { type: 'line', fg: 'cyan' },
    });

    // Tier performance table
    const tierTable = grid.set(3, 0, 6, 6, contrib.table, {
      keys: true,
      fg: 'white',
      selectedFg: 'white',
      selectedBg: 'blue',
      interactive: false,
      label: 'Tier Performance',
      width: '30%',
      height: '30%',
      border: { type: 'line', fg: 'cyan' },
      columnSpacing: 2,
      columnWidth: [8, 10, 8, 10, 8],
    });

    // Recent tasks list
    const tasksList = blessed.list({
      parent: screen,
      label: 'Recent Tasks',
      tags: true,
      top: '50%',
      left: 0,
      width: '50%',
      height: '25%',
      border: { type: 'line', fg: 'cyan' },
      style: {
        fg: 'white',
        bg: 'black',
        selected: { bg: 'blue' },
      },
      keys: true,
      vi: true,
    });

    // Learning events log
    const learningLog = blessed.log({
      parent: screen,
      label: 'Learning Events Stream',
      tags: true,
      top: '50%',
      left: '50%',
      width: '50%',
      height: '25%',
      border: { type: 'line', fg: 'cyan' },
      style: { fg: 'white', bg: 'black' },
      scrollable: true,
      alwaysScroll: true,
    });

    // Live metrics box
    const metricsBox = blessed.box({
      parent: screen,
      label: 'Live Metrics',
      tags: true,
      top: '75%',
      left: 0,
      width: '60%',
      height: '20%',
      border: { type: 'line', fg: 'cyan' },
      style: { fg: 'white', bg: 'black' },
    });

    // Controls box
    const controlsBox = blessed.box({
      parent: screen,
      label: 'Controls',
      tags: true,
      top: '75%',
      left: '60%',
      width: '40%',
      height: '15%',
      border: { type: 'line', fg: 'cyan' },
      style: { fg: 'white', bg: 'black' },
      content:
        `{center}Controls:{/center}\n` +
        `{green-fg}q{/} - Quit\n` +
        `{green-fg}r{/} - Reset metrics\n` +
        `{green-fg}p{/} - Pause/Resume\n` +
        `{green-fg}+/-{/} - Speed up/down\n` +
        `{green-fg}s{/} - Save snapshot`,
    });

    // Status bar
    const statusBar = blessed.box({
      parent: screen,
      top: '95%',
      left: 0,
      width: '100%',
      height: '5%',
      style: { fg: 'white', bg: 'blue' },
      content: ' Phase 3 Ensemble Learning Dashboard - Ready',
    });

    this.components = {
      screen,
      grid,
      performanceGauge,
      confidenceGauge,
      accuracyChart,
      tierTable,
      tasksList,
      learningLog,
      metricsBox,
      controlsBox,
      statusBar,
    };
  }

  /**
   * Initialize metrics structure
   */
  private initializeMetrics(): void {
    this.metrics = {
      accuracy: 0,
      confidence: 0,
      tokensUsed: 0,
      tasksCompleted: 0,
      learningEvents: 0,
      agentsActive: 0,
      adaptationCount: 0,
      tierPerformance: {
        tier1: { accuracy: 0, models: 0 },
        tier2: { accuracy: 0, models: 0 },
        tier3: { accuracy: 0, models: 0 },
      },
      recentTasks: [],
      learningStream: [],
    };
  }

  /**
   * Setup keyboard handlers
   */
  private setupKeyHandlers(): void {
    this.components.screen.key(['q', 'C-c'], () => {
      this.shutdown();
    });

    this.components.screen.key(['r'], () => {
      this.resetMetrics();
    });

    this.components.screen.key(['p'], () => {
      this.togglePause();
    });

    this.components.screen.key(['+', '='], () => {
      this.adjustRefreshRate(-200); // Speed up
    });

    this.components.screen.key(['-', '_'], () => {
      this.adjustRefreshRate(200); // Slow down
    });

    this.components.screen.key(['s'], () => {
      this.saveSnapshot();
    });

    // Focus handling
    this.components.screen.key(['tab'], () => {
      this.components.screen.focusNext();
    });

    this.components.screen.key(['S-tab'], () => {
      this.components.screen.focusPrevious();
    });
  }

  /**
   * Setup update loop for live data
   */
  private setupUpdateLoop(): void {
    this.updateInterval = setInterval(() => {
      if (this.isRunning) {
        this.updateMetrics();
        this.renderComponents();
      }
    }, this.refreshRate);
  }

  /**
   * Connect to ensemble systems
   */
  public connectSystems(
    ensembleSystem: Phase3EnsembleLearning,
    coordinator?: NeuralEnsembleCoordinator
  ): void {
    this.ensembleSystem = ensembleSystem;
    this.coordinator = coordinator;

    // Setup real-time event listeners
    this.setupSystemEventListeners();
    this.updateStatus('Connected to Phase 3 systems');
  }

  /**
   * Setup event listeners for real-time updates
   */
  private setupSystemEventListeners(): void {
    if (!this.ensembleSystem) return;

    // Listen for learning events
    this.ensembleSystem.on('model:updated', (event) => {
      this.addLearningEvent('Model Updated', {
        modelId: event.modelId,
        accuracy: event.newAccuracy,
        tier: event.tier,
      });
    });

    this.ensembleSystem.on('strategy:adapted', (event) => {
      this.addLearningEvent('Strategy Adapted', {
        oldStrategy: event.oldStrategy,
        newStrategy: event.newStrategy,
        improvement: event.performanceGain,
      });
    });

    this.ensembleSystem.on('prediction:completed', (event) => {
      this.addTaskEvent({
        id: event.predictionId,
        type: event.taskType || 'prediction',
        accuracy: event.accuracy,
        duration: event.duration,
        timestamp: new Date(),
      });
    });

    if (this.coordinator) {
      this.coordinator.on('coordination:completed', (event) => {
        this.addLearningEvent('Neural Coordination', {
          alignment: event.alignmentScore,
          consensus: event.consensusLevel,
          mode: event.activeMode,
        });
      });
    }
  }

  /**
   * Update metrics from connected systems
   */
  private updateMetrics(): void {
    if (!this.ensembleSystem) {
      // Generate demo data if no systems connected
      this.generateDemoMetrics();
      return;
    }

    try {
      const ensembleStatus = this.ensembleSystem.getEnsembleStatus();
      const coordinationStatus = this.coordinator?.getCoordinationStatus();

      // Update main metrics
      this.metrics.accuracy =
        ensembleStatus.globalMetrics.averageAccuracy * 100;
      this.metrics.confidence =
        ensembleStatus.globalMetrics.averageConfidence * 100;
      this.metrics.tasksCompleted =
        ensembleStatus.globalMetrics.totalPredictions;
      this.metrics.adaptationCount =
        ensembleStatus.globalMetrics.adaptationCount || 0;

      // Update tier performance
      Object.entries(ensembleStatus.tierStatus).forEach(([tier, status]) => {
        const tierNum = parseInt(tier) as 1 | 2 | 3;
        this.metrics.tierPerformance[`tier${tierNum}`] = {
          accuracy: status.averageAccuracy * 100,
          models: status.modelCount,
        };
      });

      // Update coordination metrics if available
      if (coordinationStatus) {
        this.metrics.agentsActive = coordinationStatus.activeIntegrations;
        // Use coordination accuracy if available
        if (coordinationStatus.performanceMetrics.averageAccuracy > 0) {
          this.metrics.accuracy =
            coordinationStatus.performanceMetrics.averageAccuracy * 100;
        }
      }

      // Track accuracy history
      this.accuracyHistory.push(this.metrics.accuracy);
      if (this.accuracyHistory.length > 60) {
        this.accuracyHistory.shift();
      }
    } catch (error) {
      this.logger.error('Failed to update metrics:', error);
      this.updateStatus(`Error updating metrics: ${error.message}`);
    }
  }

  /**
   * Generate demo metrics for testing
   */
  private generateDemoMetrics(): void {
    const baseAccuracy = 84.7;
    const variation = Math.sin(Date.now() / 10000) * 2;

    this.metrics.accuracy = baseAccuracy + variation + (Math.random() - 0.5);
    this.metrics.confidence =
      82 + Math.sin(Date.now() / 8000) * 3 + (Math.random() - 0.5);
    this.metrics.tasksCompleted += Math.random() > 0.95 ? 1 : 0;
    this.metrics.learningEvents += Math.random() > 0.98 ? 1 : 0;
    this.metrics.agentsActive =
      6 + Math.floor(Math.sin(Date.now() / 15000) * 2);

    // Update tier performance with realistic variations
    this.metrics.tierPerformance.tier1.accuracy =
      83 + Math.sin(Date.now() / 12000) * 4;
    this.metrics.tierPerformance.tier1.models =
      3 + (Math.random() > 0.9 ? 1 : 0);
    this.metrics.tierPerformance.tier2.accuracy =
      87 + Math.sin(Date.now() / 14000) * 3;
    this.metrics.tierPerformance.tier2.models =
      2 + (Math.random() > 0.95 ? 1 : 0);
    this.metrics.tierPerformance.tier3.accuracy =
      92 + Math.sin(Date.now() / 16000) * 2;
    this.metrics.tierPerformance.tier3.models =
      4 + (Math.random() > 0.92 ? 1 : 0);

    this.accuracyHistory.push(this.metrics.accuracy);
    if (this.accuracyHistory.length > 60) {
      this.accuracyHistory.shift();
    }

    // Occasionally add demo events
    if (Math.random() > 0.97) {
      this.addDemoLearningEvent();
    }
    if (Math.random() > 0.94) {
      this.addDemoTaskEvent();
    }
  }

  /**
   * Render all components with updated data
   */
  private renderComponents(): void {
    // Update performance gauges
    this.components.performanceGauge.setPercent(
      Math.round(this.metrics.accuracy)
    );
    this.components.confidenceGauge.setPercent(
      Math.round(this.metrics.confidence)
    );

    // Update accuracy chart
    const chartData = {
      title: 'Accuracy',
      x: this.accuracyHistory.map((_, i) => i.toString()),
      y: this.accuracyHistory,
      style: { line: 'green' },
    };
    this.components.accuracyChart.setData([chartData]);

    // Update tier table
    const tierData = [
      ['Tier', 'Type', 'Accuracy', 'Models', 'Status'],
      [
        'T1',
        'Swarm Cmd',
        `${this.metrics.tierPerformance.tier1.accuracy.toFixed(1)}%`,
        this.metrics.tierPerformance.tier1.models.toString(),
        this.metrics.tierPerformance.tier1.models > 0 ? 'Active' : 'Idle',
      ],
      [
        'T2',
        'Queen Coord',
        `${this.metrics.tierPerformance.tier2.accuracy.toFixed(1)}%`,
        this.metrics.tierPerformance.tier2.models.toString(),
        this.metrics.tierPerformance.tier2.models > 0 ? 'Active' : 'Idle',
      ],
      [
        'T3',
        'Neural DL',
        `${this.metrics.tierPerformance.tier3.accuracy.toFixed(1)}%`,
        this.metrics.tierPerformance.tier3.models.toString(),
        this.metrics.tierPerformance.tier3.models > 0 ? 'Active' : 'Idle',
      ],
    ];
    this.components.tierTable.setData({
      headers: tierData[0],
      data: tierData.slice(1),
    });

    // Update recent tasks
    const taskItems = this.metrics.recentTasks
      .slice(-10)
      .reverse()
      .map((task) => {
        const duration = `${(task.duration / 1000).toFixed(1)}s`;
        const accuracy = `${task.accuracy.toFixed(1)}%`;
        const time = task.timestamp.toLocaleTimeString();
        return `{green-fg}${accuracy}{/} ${task.type.padEnd(15)} ${duration.padStart(6)} ${time}`;
      });
    this.components.tasksList.setItems(taskItems);

    // Update live metrics display
    const metricsContent =
      `{bold}Performance Summary:{/bold}\n` +
      `Tasks Completed: {green-fg}${this.metrics.tasksCompleted}{/}\n` +
      `Learning Events: {yellow-fg}${this.metrics.learningEvents}{/}\n` +
      `Agents Active: {blue-fg}${this.metrics.agentsActive}{/}\n` +
      `Adaptations: {magenta-fg}${this.metrics.adaptationCount}{/}\n` +
      `\n{bold}System Health:{/bold}\n` +
      `Accuracy Trend: ${this.getAccuracyTrend()}\n` +
      `Confidence Level: ${this.getConfidenceLevel()}\n` +
      `Update Rate: {cyan-fg}${this.refreshRate}ms{/}`;

    this.components.metricsBox.setContent(metricsContent);

    // Refresh screen
    this.components.screen.render();
  }

  /**
   * Add learning event to stream
   */
  private addLearningEvent(event: string, data: any): void {
    const logEntry = {
      event,
      data,
      timestamp: new Date(),
    };

    this.metrics.learningStream.unshift(logEntry);
    this.metrics.learningEvents++;

    // Keep only last 100 events
    if (this.metrics.learningStream.length > 100) {
      this.metrics.learningStream = this.metrics.learningStream.slice(0, 100);
    }

    // Add to learning log display
    const timeStr = logEntry.timestamp.toLocaleTimeString();
    const dataStr =
      typeof data === 'object' ? JSON.stringify(data) : String(data);
    const logLine = `{yellow-fg}${timeStr}{/} {green-fg}${event}{/}: ${dataStr}`;

    this.components.learningLog.log(logLine);
  }

  /**
   * Add task completion event
   */
  private addTaskEvent(task: DashboardMetrics['recentTasks'][0]): void {
    this.metrics.recentTasks.unshift(task);

    // Keep only last 50 tasks
    if (this.metrics.recentTasks.length > 50) {
      this.metrics.recentTasks = this.metrics.recentTasks.slice(0, 50);
    }

    this.metrics.tasksCompleted++;
  }

  /**
   * Add demo learning event for testing
   */
  private addDemoLearningEvent(): void {
    const events = [
      { name: 'Model Updated', data: { tier: 'T1', accuracy: 0.89 } },
      { name: 'Strategy Adapted', data: { from: 'weighted', to: 'stacking' } },
      {
        name: 'Neural Coordination',
        data: { alignment: 0.87, consensus: 0.91 },
      },
      {
        name: 'Performance Boost',
        data: { improvement: 0.03, duration: '2.3s' },
      },
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    this.addLearningEvent(event.name, event.data);
  }

  /**
   * Add demo task event for testing
   */
  private addDemoTaskEvent(): void {
    const taskTypes = [
      'TypeScript',
      'Debug',
      'Refactor',
      'Review',
      'Test',
      'API',
    ];
    const type = taskTypes[Math.floor(Math.random() * taskTypes.length)];

    this.addTaskEvent({
      id: `task_${Date.now()}`,
      type,
      accuracy: 80 + Math.random() * 15,
      duration: 5000 + Math.random() * 30000,
      timestamp: new Date(),
    });
  }

  /**
   * Get accuracy trend indicator
   */
  private getAccuracyTrend(): string {
    if (this.accuracyHistory.length < 5) return '{gray-fg}Insufficient data{/}';

    const recent = this.accuracyHistory.slice(-5);
    const trend = recent[recent.length - 1] - recent[0];

    if (trend > 1) return '{green-fg}↗️ Rising{/}';
    if (trend < -1) return '{red-fg}↘️ Falling{/}';
    return '{yellow-fg}→ Stable{/}';
  }

  /**
   * Get confidence level indicator
   */
  private getConfidenceLevel(): string {
    const confidence = this.metrics.confidence;
    if (confidence > 90) return '{green-fg}Excellent{/}';
    if (confidence > 80) return '{yellow-fg}Good{/}';
    if (confidence > 70) return '{red-fg}Fair{/}';
    return '{red-fg}Poor{/}';
  }

  /**
   * Update status bar message
   */
  private updateStatus(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.components.statusBar.setContent(` ${timestamp} - ${message}`);
    this.components.screen.render();
  }

  /**
   * Reset all metrics
   */
  private resetMetrics(): void {
    this.initializeMetrics();
    this.accuracyHistory = [];
    this.components.learningLog.setContent('');
    this.updateStatus('Metrics reset');
  }

  /**
   * Toggle pause/resume updates
   */
  private togglePause(): void {
    this.isRunning = !this.isRunning;
    this.updateStatus(
      this.isRunning ? 'Resumed monitoring' : 'Paused monitoring'
    );
  }

  /**
   * Adjust refresh rate
   */
  private adjustRefreshRate(delta: number): void {
    this.refreshRate = Math.max(200, Math.min(5000, this.refreshRate + delta));

    // Restart update interval with new rate
    clearInterval(this.updateInterval);
    this.setupUpdateLoop();

    this.updateStatus(`Refresh rate: ${this.refreshRate}ms`);
  }

  /**
   * Save current metrics snapshot
   */
  private saveSnapshot(): void {
    const snapshot = {
      timestamp: new Date(),
      metrics: this.metrics,
      accuracyHistory: this.accuracyHistory,
    };

    // In a real implementation, save to file
    this.logger.info('Snapshot saved:', snapshot);
    this.updateStatus('Snapshot saved to logs');
  }

  /**
   * Start the dashboard
   */
  public start(): void {
    this.isRunning = true;
    this.components.screen.render();
    this.updateStatus('Dashboard started - Press q to quit');

    // Focus the screen
    this.components.screen.focus();
  }

  /**
   * Shutdown dashboard and cleanup
   */
  public shutdown(): void {
    this.isRunning = false;

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.components.screen.destroy();
    process.exit(0);
  }
}

/**
 * CLI entry point for TUI dashboard
 */
export async function startTUIDashboard(
  options: {
    ensembleSystem?: Phase3EnsembleLearning;
    coordinator?: NeuralEnsembleCoordinator;
    refreshRate?: number;
  } = {}
): Promise<void> {
  const dashboard = new Phase3TUIDashboard();

  if (options.ensembleSystem) {
    dashboard.connectSystems(options.ensembleSystem, options.coordinator);
  }

  // Handle process termination
  process.on('SIGINT', () => {
    dashboard.shutdown();
  });

  process.on('SIGTERM', () => {
    dashboard.shutdown();
  });

  dashboard.start();

  console.log('\n🖥️  Phase 3 Ensemble Learning TUI Dashboard Started');
  console.log('📊 Live monitoring with real-time metrics and learning events');
  console.log(
    '🎮 Use keyboard controls: q=quit, r=reset, p=pause, +/-=speed\n'
  );
}
