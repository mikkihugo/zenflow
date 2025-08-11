#!/usr/bin/env node

/**
 * Simple progress and cost monitoring for TypeScript error fixing
 */

import fs from 'fs';
import path from 'path';

function parseLogFiles() {
  const logsDir = path.resolve('logs');
  if (!fs.existsSync(logsDir)) {
    // console.log('❌ No logs directory found');
    return null;
  }

  const logFile = path.join(logsDir, 'ai-fixing-detailed.log');
  if (!fs.existsSync(logFile)) {
    // console.log('❌ No detailed log file found');
    return null;
  }

  try {
    const content = fs.readFileSync(logFile, 'utf8');
    const lines = content.trim().split('\n');

    const metrics = [];
    let currentSession = null;

    for (const line of lines) {
      // Parse structured logging entries
      if (line.includes('Claude CLI performance metrics')) {
        const match = line.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
        if (match) {
          currentSession = {
            timestamp: match[1],
            type: 'metrics',
          };
          metrics.push(currentSession);
        }
      }
    }

    return {
      totalEntries: lines.length,
      metricsEntries: metrics.length,
      latestEntry: lines[lines.length - 1],
      metricsData: metrics,
    };
  } catch (error) {
    // console.error('Error parsing log file:', error.message);
    return null;
  }
}

function estimateProgress() {
  // Based on known progress data
  const knownIterations = [
    { iteration: 1, errors: { before: 2356, after: 2319 }, cost: 1.32 },
    { iteration: 7, errors: { before: 2299, after: 2249 }, cost: 2.54 },
    { iteration: 8, errors: { before: 2249, after: 2210 }, cost: 1.5 },
    { iteration: 9, errors: { before: 2210, after: 2197 }, cost: 1.0 },
    { iteration: 10, errors: { before: 2197, after: 2180 }, cost: 2.15 },
    { iteration: 11, errors: { before: 2180, after: 2175 }, cost: 4.07 },
  ];

  const totalCost = knownIterations.reduce((sum, iter) => sum + iter.cost, 0);
  const totalErrorsFixed = 2356 - 2175;
  const avgCostPerError = totalCost / totalErrorsFixed;
  const avgCostPerIteration = totalCost / knownIterations.length;

  const remainingErrors = 2175; // Last known count
  const estimatedIterationsRemaining = Math.ceil(remainingErrors / 25); // ~25 errors per iteration average
  const estimatedCostRemaining = estimatedIterationsRemaining * avgCostPerIteration;

  return {
    totalCost: totalCost.toFixed(2),
    totalErrorsFixed,
    avgCostPerError: avgCostPerError.toFixed(3),
    avgCostPerIteration: avgCostPerIteration.toFixed(2),
    remainingErrors,
    estimatedIterationsRemaining,
    estimatedCostRemaining: estimatedCostRemaining.toFixed(2),
    knownIterations,
  };
}

function main() {
  // console.log('📊 Claude-Zen TypeScript Fixing Progress Monitor\n');

  const logData = parseLogFiles();
  const progress = estimateProgress();

  // console.log('📈 Progress Summary:');
  // console.log(`   Total cost so far: $${progress.totalCost}`);
  // console.log(`   Errors fixed: ${progress.totalErrorsFixed}`);
  // console.log(`   Average cost per error: $${progress.avgCostPerError}`);
  // console.log(`   Average cost per iteration: $${progress.avgCostPerIteration}`);
  // console.log(`   Remaining errors (last known): ${progress.remainingErrors}`);
  // console.log(`   Estimated iterations remaining: ${progress.estimatedIterationsRemaining}`);
  // console.log(`   Estimated remaining cost: $${progress.estimatedCostRemaining}`);

  // console.log('\n🔍 Recent Iteration Performance:');
  const recentIterations = progress.knownIterations.slice(-3);
  for (const iter of recentIterations) {
    const fixed = iter.errors.before - iter.errors.after;
    const costPerError = (iter.cost / fixed).toFixed(3);
    // console.log(
    `   Iteration ${iter.iteration}: ${fixed} errors fixed for $${iter.cost} ($${costPerError}/error)`;
    )
  }

  if (logData) {
    // console.log('\n📋 Logging Status:');
    // console.log(`   Total log entries: ${logData.totalEntries}`);
    // console.log(`   Structured metrics entries: ${logData.metricsEntries}`);
    // console.log(`   Latest entry: ${logData.latestEntry.slice(0, 100)}...`);

    if (logData.metricsEntries === 0) {
      // console.log('   ⚠️  No structured metrics found - logging may need fixes');
    } else {
      // console.log('   ✅ Structured logging working');
    }
  }

  // console.log('\n💡 Recommendations:');
  if (parseFloat(progress.avgCostPerIteration) > 2.0) {
    // console.log(
    ('   ⚠️  High average cost per iteration - consider optimizing prompts or targeting simpler files');
    )
  }
  if (progress.remainingErrors > 1500) {
    // console.log(
    ('   📊 Large number of errors remaining - consider parallel processing or different strategy');
    )
  }
  if (logData && logData.metricsEntries < 3) {
    // console.log('   🔧 Structured logging needs improvement for better cost visibility');
  }

  // console.log('\n✅ Monitor script completed');
}

main();
