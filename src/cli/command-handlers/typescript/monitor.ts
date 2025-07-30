/**
 * Monitor Command Handler - TypeScript Edition
 * Real-time system monitoring with comprehensive metrics
 */

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { CLIError } from '../../types/cli.js';
import { FlagValidator } from '../core/argument-parser.js';

// =============================================================================
// MONITOR COMMAND TYPES
// =============================================================================

interface MonitorOptions {interval = ============================================================================
// MONITOR COMMAND IMPLEMENTATION
// =============================================================================

export const monitorCommand = {
      name => {
        if (value < 1000 || value > 60000) {
          return 'Interval must be between 1000ms and 60000ms';
        }
return true;
}
    },
{
  (_name) => {
    const logger = context.logger.child({command = parseMonitorOptions(context, logger);

    // Run monitoring
    if (options.watch) {
      await runContinuousMonitoring(options, logger);
    } else {
      await showCurrentMetrics(options, logger);
    }

    // Return success result
    return {success = ============================================================================
// OPTION PARSING AND VALIDATION
// =============================================================================

function parseMonitorOptions(context = new FlagValidator(context.flags as any);

    logger.debug('Parsing monitor options', {flags = validator.getNumberFlag('interval', 5000);
    const format = validator.getStringFlag('format', 'pretty') as 'pretty' | 'json';
    const _watch = validator.getBooleanFlag('watch', false);

    // Validate interval range
    if (interval < 1000 || interval > 60000) {
      throw new CLIError('Interval must be between 1000ms and 60000ms', 'monitor');
    }

    // Validate format
    if (!['pretty', 'json'].includes(format)) {
      throw new CLIError('Format must be either "pretty" or "json"', 'monitor');
    }

    const options = {interval = ============================================================================
// MONITORING IMPLEMENTATION
// =============================================================================

async function showCurrentMetrics(_options = await collectMetrics(logger);

    if (options.format === 'json') {
      console.warn(JSON.stringify(metrics, null, 2));
    } else {
      displayMetrics(metrics);
    }
  };

  async function runContinuousMonitoring(options = null;
  const cleanup = () => {
    if (monitorInterval) {
      clearInterval(monitorInterval);
    }
    console.warn('\n👋 Monitoring stopped');
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  // Initial display
  const initialMetrics = await collectMetrics(logger);
  console.warn(`🔄 Monitoring Claude-Flow System`);
  console.warn(`⏰ ${new Date().toLocaleTimeString()}\n`);

  if (options.format === 'json') {
    console.warn(JSON.stringify(initialMetrics, null, 2));
  } else {
    displayMetrics(initialMetrics);
  }

  console.warn(`\n🔄 Next update in ${options.interval}ms...`);

  // Start continuous monitoring
  monitorInterval = setInterval(async () => {
    try {
      console.warn(`🔄 Monitoring Claude-Flow System`);
      console.warn(`⏰ ${new Date().toLocaleTimeString()}\n`);

      const metrics = await collectMetrics(logger);

      if (options.format === 'json') {
        console.warn(JSON.stringify(metrics, null, 2));
      } else {
        displayMetrics(metrics);
      }

      console.warn(`\n🔄 Next update in ${options.interval}ms...`);
    } catch (error) {
      logger.error('Error during continuous monitoring', error);
      console.error('❌ Error collectingmetrics = ============================================================================
// METRICS COLLECTION
// =============================================================================

async function collectMetrics(_logger = Date.now();

  // Collect real system metrics
  const _cpuUsage = await getCPUUsage();

  // Try to get orchestrator metrics from file or socket

  // Collect performance metrics

  // Collect resource utilization

  const _metrics = {timestamp = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  cpus.forEach((cpu) => {
    for (const type in cpu.times) {
      totalTick += cpu.times[type as keyof typeof cpu.times];
    }
    totalIdle += cpu.times.idle;
  });

  const idle = totalIdle / cpus.length;
  const total = totalTick / cpus.length;
  const usage = 100 - Math.floor((100 * idle) / total);

  return Math.max(0, Math.min(100, usage));
}

// Get real memory information
function _getMemoryInfo(): MemoryInfo {
  const _totalMem = os.totalmem();
  const _freeMem = os.freemem();

  return {totalMB = await fs.statfs(process.cwd());
    const _totalBytes = stats.blocks * stats.bsize;
    const _freeBytes = stats.bavail * stats.bsize;

    return {totalGB = path.join(process.cwd(), '.claude-zen', 'metrics.json');
    const metricsData = await fs.readFile(metricsPath, 'utf8');
    const _metrics = JSON.parse(metricsData);

    logger.debug('Retrieved orchestrator metrics from file');
    
    return {status = await checkOrchestratorRunning(logger);

    return {status = path.join(process.cwd(), '.claude-zen', 'orchestrator.pid');
    const pidData = await fs.readFile(pidPath, 'utf8');
    const pid = parseInt(pidData.trim());

    // Check if process is running
    process.kill(pid, 0);
    logger.debug('Orchestrator process is running', { pid });
    return true;
  } catch (error) 
    logger.debug('Orchestrator process is not running', error);
    return false;
}

// Get performance metrics
function getPerformanceMetrics(): PerformanceMetrics {

  const _cpuUsage = process.cpuUsage();

  return {avg_task_duration = path.join(process.cwd(), '.claude-zen', 'memory.db');

    // Count terminal sessions

    // Count MCP connections

    // Get Node.js process handles (if available)

    const files = await fs.readdir(sessionsPath);
    const count = files.filter((f) => f.endsWith('.json')).length;
    logger.debug('Counted terminal sessions', { count });
    return count;
  } catch (error) {
    logger.debug('Could not count terminal sessions', error);
  return 0;
}
}

// Count MCP connections
async
function countMCPConnections(logger = path.join(process.cwd(), '.claude-zen', 'mcp-connections.json');
const data = await fs.readFile(mcpPath, 'utf8');
const connections = JSON.parse(data);
const _count = Array.isArray(connections) ? connections.length = ============================================================================
// DISPLAY FUNCTIONS
// =============================================================================

function displayMetrics(metrics = new Date(metrics.timestamp).toLocaleTimeString();

console.warn('📊 System Metrics');
console.warn('================');

// System metrics
console.warn('\n🖥️  SystemResources = > l.toFixed(2)).join(', ')}`,
  );
console.warn(`Uptime = == 'running') {
    console.warn(`   ActiveAgents = Math.floor(seconds / 86400);
const hours = Math.floor((seconds % 86400) / 3600);
const minutes = Math.floor((seconds % 3600) / 60);
const secs = Math.floor(seconds % 60);

if (days > 0) {
  return `${days}d ${hours}h ${minutes}m`;
} else if (hours > 0) {
  return `${hours}h ${minutes}m ${secs}s`;
} else if (minutes > 0) {
  return `${minutes}m ${secs}s`;
} else {
  return `${secs}s`;
}
}
