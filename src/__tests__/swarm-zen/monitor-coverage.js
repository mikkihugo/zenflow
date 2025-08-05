#!/usr/bin/env node

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import {
  generateProgressReport,
  startLiveMonitoring,
  trackCoverage,
} from './coverage-dashboard.js';

const execAsync = promisify(exec);

async function main() {
  // Get initial coverage
  const initial = await trackCoverage();

  if (initial) {
    if (initial.uncovered.length > 0) {
      initial.uncovered.slice(0, 5).forEach((_file) => {});
    }
  }

  // Store initial metrics
  await execAsync(
    `npx ruv-swarm hook notification --message "Initial coverage: Lines ${initial?.coverage.lines || 0}%, Branches ${initial?.coverage.branches || 0}%, Functions ${initial?.coverage.functions || 0}%, Statements ${initial?.coverage.statements || 0}%" --telemetry true`,
  );
  const monitoringInterval = await startLiveMonitoring(15000);

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    clearInterval(monitoringInterval);

    const final = await trackCoverage();
    const _progress = await generateProgressReport();

    // Store final metrics
    await execAsync(
      `npx ruv-swarm hook notification --message "Session complete: Achieved ${final.coverage.lines.toFixed(1)}% line coverage" --telemetry true`,
    );

    process.exit(0);
  });
}

// Run the monitoring
main().catch(console.error);
