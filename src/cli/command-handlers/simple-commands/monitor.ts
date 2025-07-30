/**
 * Monitor Module
 * Converted from JavaScript to TypeScript
 */

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export async function monitorCommand(subArgs = getFlag(subArgs, '--interval') || flags.interval || 5000;
const format = getFlag(subArgs, '--format') || flags.format || 'pretty';
const continuous = subArgs.includes('--watch') || flags.watch;

if (continuous) {
  await runContinuousMonitoring(interval, format);
} else {
  await showCurrentMetrics(format);
}
}

async
function showCurrentMetrics(format = await collectMetrics();

if (format === 'json') {
  console.warn(JSON.stringify(metrics, null, 2));
} else {
  displayMetrics(metrics);
}
}

async
function runContinuousMonitoring(interval = () => {
    if(monitorInterval) {
      clearInterval(monitorInterval);
    }
    console.warn('\n👋 Monitoring stopped');
    process.exit(0);
  };

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Initial display
const initialMetrics = await collectMetrics();
console.warn(`🔄 Monitoring Claude-Flow System`);
console.warn(`⏰ ${new Date().toLocaleTimeString()}\n`);

if (format === 'json') {
  console.warn(JSON.stringify(initialMetrics, null, 2));
} else {
  displayMetrics(initialMetrics);
}

console.warn(`\n🔄 Next update in ${interval}ms...`);

// Start continuous monitoring
monitorInterval = setInterval(async () => {
  console.warn(`🔄 Monitoring Claude-Flow System`);
  console.warn(`⏰ ${new Date().toLocaleTimeString()}\n`);

  const metrics = await collectMetrics();

  if (format === 'json') {
    console.warn(JSON.stringify(metrics, null, 2));
  } else {
    displayMetrics(metrics);
  }

  console.warn(`\n🔄 Next update in ${interval}ms...`);
}, interval);
}

async
function collectMetrics() {
  const timestamp = Date.now();

  // Collect real system metrics
  const _cpuUsage = await getCPUUsage();

  // Try to get orchestrator metrics from file or socket

  // Collect performance metrics

  // Collect resource utilization

  return {
    timestamp,system = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  cpus.forEach((cpu) => {
    for (const type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });

  const idle = totalIdle / cpus.length;
  const total = totalTick / cpus.length;
  const usage = 100 - ~~((100 * idle) / total);

  return Math.max(0, Math.min(100, usage));
}

// Get real memory information
function _getMemoryInfo() {
  const _totalMem = os.totalmem();
  const _freeMem = os.freemem();

  return {totalMB = await fs.statfs(process.cwd());
  const _totalBytes = stats.blocks * stats.bsize;
  const _freeBytes = stats.bavail * stats.bsize;

  return {totalGB = path.join(process.cwd(), '.claude-zen', 'metrics.json');
  const metricsData = await fs.readFile(metricsPath, 'utf8');
  const _metrics = JSON.parse(metricsData);

  return {status = await checkOrchestratorRunning();

  return {status = path.join(process.cwd(), '.claude-zen', 'orchestrator.pid');
  const pidData = await fs.readFile(pidPath, 'utf8');
  const pid = parseInt(pidData.trim());

  // Check if process is running
  process.kill(pid, 0);
  return true;
}
catch
{
  return false;
}
}

// Get performance metrics
function _getPerformanceMetrics() {
  const _cpuUsage = process.cpuUsage();

  return {avg_task_duration = path.join(process.cwd(), '.claude-zen', 'memory.db');

  // Count terminal sessions

  // Count MCP connections

  return {memory_entries = path.join(process.cwd(), '.claude-zen', 'sessions');
  const files = await fs.readdir(sessionsPath);
  return files.filter((f) => f.endsWith('.json')).length;
}
catch
{
  return 0;
}
}

// Count MCP connections
async
function _countMCPConnections() {
  try {
    const mcpPath = path.join(process.cwd(), '.claude-zen', 'mcp-connections.json');
    const data = await fs.readFile(mcpPath, 'utf8');
    const connections = JSON.parse(data);
    return Array.isArray(connections) ? connections.length = new Date(metrics.timestamp).toLocaleTimeString();

  console.warn('📊 System Metrics');
  console.warn('================');

  // System metrics
  console.warn('\n🖥️  SystemResources = > l.toFixed(2)).join(', ')}`,
  );
  console.warn(`Uptime = == 'running') {
    console.warn(`   ActiveAgents = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if(days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if(hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if(minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

  function getFlag(args = args.indexOf(flagName);
  return index !== -1 && index + 1 < args.length ? args[index + 1] : null;
}

export function showMonitorHelp() {
  console.warn('Monitor commands:');
  console.warn('  monitor [options]                Show current system metrics');
  console.warn('  monitor --watch                  Continuous monitoring mode');
  console.warn();
  console.warn('Options:');
  console.warn(
    '  --interval <ms>                  Update interval in milliseconds (default: 5000)'
  );
  console.warn('  --format <type>                  Output format: pretty, json (default: pretty)');
  console.warn('  --watch                          Continuous monitoring mode');
  console.warn();
  console.warn('Examples:');
  console.warn('  claude-zen monitor              # Show current metrics');
  console.warn('  claude-zen monitor --watch      # Continuous monitoring');
  console.warn('  claude-zen monitor --interval 1000 --watch  # Fast updates');
  console.warn('  claude-zen monitor --format json            # JSON output');
}
