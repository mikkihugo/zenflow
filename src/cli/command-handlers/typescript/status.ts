/**
 * Status Command Handler - TypeScript Edition
 * Comprehensive system status monitoring with full type safety
 */

import { FlagValidator } from '../core/argument-parser.js';

// =============================================================================
// STATUS COMMAND TYPES
// =============================================================================

interface StatusOptions {verbose = ============================================================================
// STATUS COMMAND IMPLEMENTATION
// =============================================================================

export const statusCommand = {
      name => {

    const logger = context.logger.child({command = parseStatusOptions(context
, logger)

// Get system status
const status = await getSystemStatus(options.verbose, logger);

// Output status
if (options.json) {
  console.warn(JSON.stringify(status, null, 2));
} else {
  displayStatus(status, options.verbose, logger);
}

// Return success result
return {success = ============================================================================
// OPTION PARSING AND VALIDATION
// =============================================================================

function parseStatusOptions(context = new FlagValidator(context.flags as any);

logger.debug('Parsing status options', {flags = validator.getBooleanFlag('verbose', false);
const _json = validator.getBooleanFlag('json', false);

const options = {verbose = ============================================================================
// SYSTEM STATUS GATHERING
// =============================================================================

async function getSystemStatus(_verbose = {timestamp = await import('node:fs/promises');
const memoryStore = './memory/memory-store.json';
const content = await fs.readFile(memoryStore, 'utf-8');
const data = JSON.parse(content);

let totalEntries = 0;
for (const entries of Object.values(data)) {
  if (Array.isArray(entries)) {
    totalEntries += entries.length;
  }
}

logger.debug('Memory stats retrieved', { totalEntries });
return totalEntries;
} catch (error)
{
  logger.warn('Failed to get memory stats', error);
  return 0;
}
}

async
function getResourceUsage(logger = await import('node:os');
} catch
{
      try {
        os = await import('node:os');
      } catch {
        logger.warn('OS module unavailable, returning fallback resource info');
        return {memory = os.totalmem();

    // Get CPU info

    let _loadAvg = 'N/A';

    try {
      const loadAvgData = os.loadavg();
      _loadAvg = `${loadAvgData[0].toFixed(2)}, ${loadAvgData[1].toFixed(2)}, ${loadAvgData[2].toFixed(2)}`;
    } catch {
      // Load average not available on all platforms
      logger.debug('Load average not available on this platform');
    }

  console.warn(`${overallStatus} (orchestrator ${status.orchestrator.running ? 'active' : 'not started'})`);

  // Core components
  console.warn(`🤖Agents = == 0) {
    console.warn('   Run "claude-zen agent spawn researcher" to create an agent');
  }
  if (status.memory.entries === 0) {
    console.warn('   Run "claude-zen memory store key value" to test memory');
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function formatBytes(bytes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const size = bytes;
  const unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

function formatUptime(milliseconds = == 0) return '0s';

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}
