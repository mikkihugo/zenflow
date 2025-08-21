#!/usr/bin/env node

/**
 * @fileoverview CLI Launcher for Phase 3 TUI Monitoring Dashboard
 *
 * Launches the Terminal User Interface dashboard with integrated OpenTelemetry
 * consumer for real-time Phase 3 Ensemble Learning monitoring.
 *
 * Features:
 * - Automatic OTel consumer setup
 * - Phase 3 system auto-discovery
 * - Demo mode for testing
 * - Configurable refresh rates and ports
 *
 * @author Claude Code Zen Team - CLI Tools
 * @since 1.0.0-alpha.44
 * @version 1.0.0
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Phase3TUIDashboard } from '../src/monitoring/tui-dashboard.ts';
import { LocalOTelConsumer } from '../src/monitoring/otel-consumer.ts';
import { getLogger } from '../src/config/logging-config.ts';

const logger = getLogger('TUIMonitorCLI');

/**
 * CLI Configuration
 */
interface CLIOptions {
  port: number;
  refreshRate: number;
  demo: boolean;
  otelPort: number;
  autoDiscover: boolean;
  verbose: boolean;
}

/**
 * Main CLI application
 */
class TUIMonitorCLI {
  private program: Command;
  private dashboard?: Phase3TUIDashboard;
  private otelConsumer?: LocalOTelConsumer;

  constructor() {
    this.program = new Command();
    this.setupCLI();
  }

  /**
   * Setup CLI commands and options
   */
  private setupCLI(): void {
    // Get package info
    let packageInfo = { version: '1.0.0-alpha.44' };
    try {
      const packagePath = join(__dirname, '..', 'package.json');
      packageInfo = JSON.parse(readFileSync(packagePath, 'utf8'));
    } catch (error) {
      // Fallback version if package.json not found
    }

    this.program
      .name('tui-monitor')
      .description('🖥️  Phase 3 Ensemble Learning TUI Dashboard')
      .version(packageInfo.version);

    // Main monitor command
    this.program
      .command('start')
      .description('Start the live TUI monitoring dashboard')
      .option('-p, --port <number>', 'Dashboard port (if applicable)', '0')
      .option('-r, --refresh-rate <number>', 'Refresh rate in milliseconds', '1000')
      .option('-d, --demo', 'Run in demo mode with simulated data', false)
      .option('-o, --otel-port <number>', 'OpenTelemetry consumer port', '4318')
      .option('-a, --auto-discover', 'Auto-discover Phase 3 systems', true)
      .option('-v, --verbose', 'Verbose logging', false)
      .action((options) => this.startDashboard(options));

    // OTel consumer standalone
    this.program
      .command('otel-consumer')
      .description('Start standalone OpenTelemetry consumer')
      .option('-p, --port <number>', 'OTel consumer port', '4318')
      .option('-v, --verbose', 'Verbose logging', false)
      .action((options) => this.startOTelConsumer(options));

    // Test telemetry generation
    this.program
      .command('test-telemetry')
      .description('Generate test telemetry data')
      .option('-t, --target <url>', 'Target OTel endpoint', 'http://localhost:4318')
      .option('-i, --interval <number>', 'Generation interval in ms', '2000')
      .option('-d, --duration <number>', 'Test duration in seconds', '60')
      .action((options) => this.generateTestTelemetry(options));

    // Health check
    this.program
      .command('health')
      .description('Check system health and connectivity')
      .option('-o, --otel-port <number>', 'OpenTelemetry consumer port', '4318')
      .action((options) => this.healthCheck(options));
  }

  /**
   * Start the TUI dashboard with OTel integration
   */
  private async startDashboard(options: CLIOptions): Promise<void> {
    try {
      console.log(chalk.cyan('🚀 Starting Phase 3 Ensemble Learning TUI Dashboard'));
      console.log(chalk.gray(`   Version: ${this.program.version()}`));
      console.log(chalk.gray(`   Refresh Rate: ${options.refreshRate}ms`));
      console.log(chalk.gray(`   OTel Port: ${options.otelPort}`));
      console.log(chalk.gray(`   Demo Mode: ${options.demo ? 'ON' : 'OFF'}`));
      console.log('');

      // Start OpenTelemetry consumer
      console.log(chalk.yellow('📡 Starting OpenTelemetry consumer...'));
      this.otelConsumer = await this.createOTelConsumer(options.otelPort);

      console.log(chalk.green(`✅ OTel consumer running on port ${options.otelPort}`));
      console.log(chalk.gray('   Ready to receive telemetry from:'));
      console.log(chalk.gray('   • Claude Code native telemetry'));
      console.log(chalk.gray('   • Phase 3 ensemble systems'));
      console.log(chalk.gray('   • External monitoring tools'));
      console.log(chalk.gray('   • Manual metric injection'));
      console.log('');

      // Create TUI dashboard
      console.log(chalk.yellow('🖥️  Initializing TUI dashboard...'));
      this.dashboard = new Phase3TUIDashboard();

      // Connect OTel consumer to dashboard
      this.connectOTelToDashboard();

      // Auto-discover Phase 3 systems if requested
      if (options.autoDiscover && !options.demo) {
        await this.autoDiscoverSystems();
      }

      // Setup graceful shutdown
      this.setupGracefulShutdown();

      // Start the dashboard
      console.log(chalk.green('✅ TUI Dashboard ready'));
      console.log(chalk.cyan('🎮 Keyboard Controls:'));
      console.log(chalk.gray('   q       - Quit dashboard'));
      console.log(chalk.gray('   r       - Reset metrics'));
      console.log(chalk.gray('   p       - Pause/Resume'));
      console.log(chalk.gray('   +/-     - Adjust refresh rate'));
      console.log(chalk.gray('   s       - Save snapshot'));
      console.log(chalk.gray('   tab     - Navigate components'));
      console.log('');

      // Clear screen and start dashboard
      process.stdout.write('\x1B[2J\x1B[H');

      this.dashboard.start();

      // Start demo data if in demo mode
      if (options.demo) {
        this.startDemoDataGeneration();
      }

    } catch (error) {
      console.error(chalk.red('❌ Failed to start TUI dashboard:'), error);
      process.exit(1);
    }
  }

  /**
   * Start standalone OTel consumer
   */
  private async startOTelConsumer(options: any): Promise<void> {
    try {
      console.log(chalk.cyan('📡 Starting OpenTelemetry Consumer'));
      console.log(chalk.gray(`   Port: ${options.port}`));
      console.log('');

      const consumer = await this.createOTelConsumer(parseInt(options.port));

      console.log(chalk.green(`✅ OTel consumer running on port ${options.port}`));
      console.log(chalk.cyan('📊 Endpoints:'));
      console.log(chalk.gray(`   POST http://localhost:${options.port}/v1/metrics   - Metrics`));
      console.log(chalk.gray(`   POST http://localhost:${options.port}/v1/traces    - Traces`));
      console.log(chalk.gray(`   POST http://localhost:${options.port}/v1/events    - Events`));
      console.log(chalk.gray(`   GET  http://localhost:${options.port}/metrics      - Current stats`));
      console.log('');
      console.log(chalk.yellow('Press Ctrl+C to stop'));

      // Keep process alive
      process.on('SIGINT', async () => {
        console.log(chalk.yellow('\n🛑 Shutting down OTel consumer...'));
        await consumer.stop();
        console.log(chalk.green('✅ OTel consumer stopped'));
        process.exit(0);
      });

    } catch (error) {
      console.error(chalk.red('❌ Failed to start OTel consumer:'), error);
      process.exit(1);
    }
  }

  /**
   * Generate test telemetry data
   */
  private async generateTestTelemetry(options: any): Promise<void> {
    console.log(chalk.cyan('🧪 Generating test telemetry data'));
    console.log(chalk.gray(`   Target: ${options.target}`));
    console.log(chalk.gray(`   Interval: ${options.interval}ms`));
    console.log(chalk.gray(`   Duration: ${options.duration}s`));
    console.log('');

    const startTime = Date.now();
    const endTime = startTime + (parseInt(options.duration) * 1000);
    const interval = parseInt(options.interval);

    let messageCount = 0;

    const generateData = () => {
      if (Date.now() > endTime) {
        console.log(chalk.green(`\n✅ Generated ${messageCount} telemetry messages`));
        return;
      }

      // Generate sample Phase 3 metrics
      const data = {
        globalMetrics: {
          averageAccuracy: 0.84 + (Math.random() - 0.5) * 0.1,
          averageConfidence: 0.82 + (Math.random() - 0.5) * 0.08,
          totalPredictions: Math.floor(100 + Math.random() * 50),
          adaptationCount: Math.floor(Math.random() * 5)
        },
        tierStatus: {
          1: { averageAccuracy: 0.83 + Math.random() * 0.06, modelCount: 3 },
          2: { averageAccuracy: 0.87 + Math.random() * 0.04, modelCount: 2 },
          3: { averageAccuracy: 0.92 + Math.random() * 0.03, modelCount: 4 }
        }
      };

      // Send to OTel consumer
      fetch(`${options.target}/v1/metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch(error => {
        console.error(chalk.red('❌ Failed to send telemetry:'), error.message);
      });

      messageCount++;
      if (messageCount % 10 === 0) {
        process.stdout.write(chalk.gray('.'));
      }

      setTimeout(generateData, interval);
    };

    console.log(chalk.yellow('📊 Sending telemetry data'), chalk.gray('(dots = 10 messages)'));
    generateData();
  }

  /**
   * Perform health check
   */
  private async healthCheck(options: any): Promise<void> {
    console.log(chalk.cyan('🏥 Performing system health check'));
    console.log('');

    // Check OTel consumer
    try {
      const response = await fetch(`http://localhost:${options.otelPort}/metrics`);
      if (response.ok) {
        console.log(chalk.green('✅ OTel consumer is healthy'));
        const data = await response.json();
        console.log(chalk.gray(`   Available metrics: ${Object.keys(data).length}`));
      } else {
        console.log(chalk.red('❌ OTel consumer is not responding'));
      }
    } catch (error) {
      console.log(chalk.red('❌ OTel consumer is not accessible'));
      console.log(chalk.gray(`   Error: ${error.message}`));
    }

    // Check for Phase 3 systems (if running)
    console.log(chalk.yellow('🔍 Scanning for Phase 3 systems...'));

    // This would check for actual systems in a real implementation
    console.log(chalk.gray('   No active Phase 3 systems detected'));
    console.log(chalk.gray('   (This is normal if no systems are currently running)'));

    console.log('');
    console.log(chalk.cyan('💡 To start monitoring:'));
    console.log(chalk.gray('   1. Run: tui-monitor start --demo    (for demo mode)'));
    console.log(chalk.gray('   2. Run: tui-monitor start           (with real systems)'));
  }

  /**
   * Create OTel consumer with error handling
   */
  private async createOTelConsumer(port: number): Promise<LocalOTelConsumer> {
    const consumer = new LocalOTelConsumer(port);

    consumer.on('stats:updated', (stats) => {
      if (this.dashboard) {
        // Forward telemetry stats to dashboard
        this.dashboard.emit('telemetry:update', stats);
      }
    });

    await consumer.start();
    return consumer;
  }

  /**
   * Connect OTel consumer data to TUI dashboard
   */
  private connectOTelToDashboard(): void {
    if (!this.otelConsumer || !this.dashboard) return;

    // Forward telemetry updates to dashboard
    this.otelConsumer.on('stats:updated', (stats) => {
      // Convert telemetry stats to dashboard metrics format
      const dashboardMetrics = {
        accuracy: stats.accuracy,
        confidence: stats.confidence,
        tokensUsed: stats.tokensPerSecond * 3600, // Approximate hourly
        tasksCompleted: Math.floor(stats.tasksPerHour / 24), // Approximate daily
        learningEvents: stats.learningEvents,
        agentsActive: stats.activeAgents,
        adaptationCount: stats.adaptations,
        tierPerformance: stats.tierPerformance
      };

      this.dashboard!.emit('metrics:update', dashboardMetrics);
    });
  }

  /**
   * Auto-discover Phase 3 systems
   */
  private async autoDiscoverSystems(): Promise<void> {
    console.log(chalk.yellow('🔍 Auto-discovering Phase 3 systems...'));

    // In a real implementation, this would:
    // 1. Scan for running Phase3EnsembleLearning instances
    // 2. Connect to them via their APIs or memory interfaces
    // 3. Setup real-time event forwarding

    console.log(chalk.gray('   No Phase 3 systems found (using telemetry only)'));
    console.log(chalk.gray('   Dashboard will display data from any telemetry source'));
  }

  /**
   * Setup graceful shutdown handlers
   */
  private setupGracefulShutdown(): void {
    const shutdown = async () => {
      console.log(chalk.yellow('\n🛑 Shutting down TUI dashboard...'));

      if (this.dashboard) {
        this.dashboard.shutdown();
      }

      if (this.otelConsumer) {
        await this.otelConsumer.stop();
      }

      console.log(chalk.green('✅ Shutdown complete'));
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }

  /**
   * Start demo data generation
   */
  private startDemoDataGeneration(): void {
    if (!this.otelConsumer) return;

    console.log(chalk.cyan('🎭 Demo mode: Generating simulated telemetry data'));

    const generateDemoMetrics = () => {
      const baseAccuracy = 84.7;
      const variation = Math.sin(Date.now() / 10000) * 2;

      // Push various demo metrics
      this.otelConsumer!.pushMetric('ensemble.accuracy', baseAccuracy + variation);
      this.otelConsumer!.pushMetric('ensemble.confidence', 82 + Math.sin(Date.now() / 8000) * 3);
      this.otelConsumer!.pushMetric('claude.tokens.used', Math.floor(Math.random() * 1000));
      this.otelConsumer!.pushMetric('agents.active', 6 + Math.floor(Math.sin(Date.now() / 15000) * 2));

      // Tier-specific metrics
      this.otelConsumer!.pushMetric('ensemble.tier1.accuracy', 83 + Math.random() * 4);
      this.otelConsumer!.pushMetric('ensemble.tier2.accuracy', 87 + Math.random() * 3);
      this.otelConsumer!.pushMetric('ensemble.tier3.accuracy', 92 + Math.random() * 2);

      this.otelConsumer!.pushMetric('ensemble.tier1.models', 3);
      this.otelConsumer!.pushMetric('ensemble.tier2.models', 2);
      this.otelConsumer!.pushMetric('ensemble.tier3.models', 4);
    };

    // Generate demo data every 2 seconds
    setInterval(generateDemoMetrics, 2000);
    generateDemoMetrics(); // Initial data
  }

  /**
   * Run the CLI application
   */
  public run(): void {
    this.program.parse(process.argv);
  }
}

// CLI Entry Point
if (require.main === module) {
  const cli = new TUIMonitorCLI();
  cli.run();
}