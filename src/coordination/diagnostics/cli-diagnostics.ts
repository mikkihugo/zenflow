#!/usr/bin/env node

/**
 * Diagnostic CLI for ruv-swarm
 * Usage: npx ruv-swarm diagnose [options]
 */

import fs from 'node:fs';
import path from 'node:path';
import { diagnostics } from './diagnostics';
import type { LogConfiguration, LoggerInterface } from './logging-config';

// Simple logger for CLI diagnostics
const cliLoggingConfig = {
  getLogger: (_name: string, _options: { level: string }): LoggerInterface => ({
    info: (..._args: unknown[]) => {},
    warn: (..._args: unknown[]) => {},
    error: (..._args: unknown[]) => {},
    debug: (..._args: unknown[]) => {},
  }),
  logConfiguration: (): LogConfiguration => ({
    logLevel: process.env.LOG_LEVEL || 'INFO',
    enableConsole: true,
    enableFile: false,
    timestamp: true,
    component: 'cli-diagnostics',
  }),
};

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  // Initialize diagnostics logger
  const logger = cliLoggingConfig.getLogger('cli-diagnostics', { level: 'INFO' });

  try {
    switch (command) {
      case 'test':
        await runDiagnosticTests(logger);
        break;

      case 'report':
        await generateReport(args.slice(1), logger);
        break;

      case 'monitor':
        await startMonitoring(args.slice(1), logger);
        break;

      case 'logs':
        await analyzeLogs(args.slice(1), logger);
        break;

      case 'config':
        showLoggingConfig(logger);
        break;
      default:
        showHelp();
        break;
    }
  } catch (error) {
    logger.error('Diagnostic command failed', { error, command });
    process.exit(1);
  }
}

async function runDiagnosticTests(logger: LoggerInterface): Promise<void> {
  logger.info('Running diagnostic tests...');

  const results = await diagnostics.runDiagnosticTests();

  results.tests.forEach((test) => {
    const _icon = test.success ? '✅' : '❌';
    if (!test.success) {
      if ('error' in test) {
      }
    } else if ('allocated' in test) {
    } else if ('path' in test) {
    } else {
    }
  });

  if (results.summary.failed > 0) {
    process.exit(1);
  }
}

async function generateReport(args: string[], logger: LoggerInterface): Promise<void> {
  const outputPath = args.find((arg) => arg.startsWith('--output='))?.split('=')[1];
  const format = args.find((arg) => arg.startsWith('--format='))?.split('=')[1] || 'json';

  logger.info('Generating diagnostic report...');

  // Enable diagnostics temporarily
  diagnostics.enableAll();

  // Wait a bit to collect some samples
  await new Promise((resolve) => setTimeout(resolve, 5000));

  const report = await diagnostics.generateFullReport();

  if (outputPath) {
    const reportPath = path.resolve(outputPath);

    if (format === 'json') {
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    } else if (format === 'markdown') {
      fs.writeFileSync(reportPath, formatReportAsMarkdown(report));
    }
  } else {
  }

  // Disable diagnostics
  diagnostics.disableAll();
}

async function startMonitoring(args: string[], logger: LoggerInterface): Promise<void> {
  const duration = parseInt(
    args.find((arg) => arg.startsWith('--duration='))?.split('=')[1] || '60',
    10,
  );
  const interval = parseInt(
    args.find((arg) => arg.startsWith('--interval='))?.split('=')[1] || '1000',
    10,
  );

  logger.info('Starting system monitoring...', { duration, interval });

  diagnostics.enableAll();
  diagnostics.system.startMonitoring(interval);

  // Update display periodically
  const displayInterval = setInterval(() => {
    const health = diagnostics.system.getSystemHealth();
    const _connection = diagnostics.connection.getConnectionSummary();

    if (health.issues.length > 0) {
      health.issues.forEach((_issue) => {});
    }

    Object.entries(health.metrics).forEach(([_key, _value]) => {});
  }, 2000);

  // Set up timeout
  setTimeout(() => {
    clearInterval(displayInterval);
    diagnostics.disableAll();
    process.exit(0);
  }, duration * 1000);

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    clearInterval(displayInterval);
    diagnostics.disableAll();
    process.exit(0);
  });
}

async function analyzeLogs(args: string[], logger: LoggerInterface): Promise<void> {
  const logDir = args.find((arg) => arg.startsWith('--dir='))?.split('=')[1] || './logs';
  const pattern = args.find((arg) => arg.startsWith('--pattern='))?.split('=')[1] || 'error';

  logger.info('Analyzing logs...', { logDir, pattern });

  if (!fs.existsSync(logDir)) {
    console.error(`❌ Log directory not found: ${logDir}`);
    process.exit(1);
  }

  const logFiles = fs.readdirSync(logDir).filter((f) => f.endsWith('.log'));

  const results: {
    totalLines: number;
    matches: number;
    files: Record<string, { matches: number; samples: string[] }>;
  } = {
    totalLines: 0,
    matches: 0,
    files: {},
  };

  const regex = new RegExp(pattern, 'i');

  logFiles.forEach((file) => {
    const content = fs.readFileSync(path.join(logDir, file), 'utf8');
    const lines = content.split('\n');
    const matches = lines.filter((line) => regex.test(line));

    results.totalLines += lines.length;
    results.matches += matches.length;

    if (matches.length > 0) {
      results.files[file] = {
        matches: matches.length,
        samples: matches.slice(0, 3),
      };
    }
  });

  if (results.matches > 0) {
    Object.entries(results.files).forEach(([_file, data]) => {
      data.samples.forEach((_sample) => {});
    });
  } else {
  }
}

function showLoggingConfig(logger: LoggerInterface): void {
  const _config = cliLoggingConfig.logConfiguration();

  logger.info('Logging configuration displayed successfully');
}

function _formatReportForConsole(report: any): string {
  const output = [];

  // Connection section
  output.push('🔌 Connection Diagnostics:');
  output.push(`   Active Connections: ${report.connection.connections.activeConnections}`);
  output.push(`   Failure Rate: ${(report.connection.connections.failureRate * 100).toFixed(1)}%`);
  output.push(`   Total Events: ${report.connection.connections.totalEvents}`);

  if (report.connection.patterns.recommendations.length > 0) {
    output.push('\n⚠️  Recommendations:');
    report.connection.patterns.recommendations.forEach((rec) => {
      output.push(`   [${rec.severity.toUpperCase()}] ${rec.issue}`);
      output.push(`   → ${rec.suggestion}`);
    });
  }

  // System section
  output.push('\n💻 System Health:');
  output.push(`   Status: ${report.system.status.toUpperCase()}`);
  if (report.system.metrics) {
    Object.entries(report.system.metrics).forEach(([key, value]) => {
      output.push(`   ${key}: ${value}`);
    });
  }

  return output.join('\n');
}

function formatReportAsMarkdown(report: any): string {
  const lines = [
    '# ruv-swarm Diagnostic Report',
    '',
    `Generated: ${report.timestamp}`,
    '',
    '## Connection Diagnostics',
    '',
    `- **Active Connections**: ${report.connection.connections.activeConnections}`,
    `- **Failure Rate**: ${(report.connection.connections.failureRate * 100).toFixed(1)}%`,
    `- **Total Events**: ${report.connection.connections.totalEvents}`,
    '',
  ];

  if (report.connection.patterns.recommendations.length > 0) {
    lines.push('### Recommendations');
    lines.push('');
    report.connection.patterns.recommendations.forEach((rec) => {
      lines.push(`- **${rec.severity.toUpperCase()}**: ${rec.issue}`);
      lines.push(`  - ${rec.suggestion}`);
    });
    lines.push('');
  }

  lines.push('## System Health');
  lines.push('');
  lines.push(`- **Status**: ${report.system.status.toUpperCase()}`);

  if (report.system.metrics) {
    lines.push('');
    lines.push('### Metrics');
    lines.push('');
    Object.entries(report.system.metrics).forEach(([key, value]) => {
      lines.push(`- **${key}**: ${value}`);
    });
  }

  return lines.join('\n');
}

function showHelp(): void {}

// Export for use in main CLI
export { main as diagnosticsCLI };

// Run if called directly (Node.js ES modules compatibility)
if (
  typeof process !== 'undefined' &&
  process.argv?.[1] &&
  process.argv[1].includes('cli-diagnostics')
) {
  main().catch(console.error);
}
