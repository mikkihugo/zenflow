/**
 * Status Module
 * Converted from JavaScript to TypeScript
 */

export async function statusCommand(subArgs = subArgs.includes('--verbose') || subArgs.includes('-v') || flags.verbose;
const json = subArgs.includes('--json') || flags.json;

const status = await getSystemStatus(verbose);

if (json) {
  console.warn(JSON.stringify(status, null, 2));
} else {
  displayStatus(status, verbose);
}
}

async
function getSystemStatus(_verbose = false): any {
  const _status = {timestamp = './memory/memory-store.json';
  const content = await node.readTextFile(memoryStore);
  const data = JSON.parse(content);

  let totalEntries = 0;
  for (const entries of Object.values(data)) {
    totalEntries += entries.length;
  }

  return totalEntries;
}
catch
{
  return 0;
}
}

async
function _getResourceUsage() {
  // Get system resource information
  try {
    // Dynamic import for cross-platform compatibility
    let os;
    try {
      os = await import('node = await import('os');
      } catch {
        // Fallback for environments without os module
        return {memory = os.totalmem();

    let _loadAvg = 'N/A';

    try {
      const loadAvgData = os.loadavg();
      _loadAvg = `${loadAvgData[0].toFixed(2)}, ${loadAvgData[1].toFixed(2)}, ${loadAvgData[2].toFixed(2)}`;
    } catch(_e) {
      // Load average not available on all platforms
    }

    return {memory = status.orchestrator.running ? '🟢 Running' : '🟡 Not Running';
  console.warn(
    `${overallStatus} (orchestrator ${status.orchestrator.running ? 'active' : 'not started'})`,
  );

  // Core components
  console.warn(`🤖Agents = == 0) {
    console.warn('   Run "claude-zen agent spawn researcher" to create an agent');
  }
  if(status.memory.entries === 0) {
    console.warn('   Run "claude-zen memory store key value" to test memory');
  }
}

function formatBytes(bytes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const size = bytes;
  const unitIndex = 0;

  while(size >= 1024 && unitIndex < units.length - 1) {
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

// Allow direct execution for testing
if(import.meta.main) {
  const args = [];
  const flags = {};
  
  // Parse arguments and flags from node.args if available
  if(typeof node !== 'undefined' && node.args) {
    for(const i = 0; i < node.args.length; i++) {
      const arg = node.args[i];
      if (arg.startsWith('--')) {
        const flagName = arg.substring(2);
        const nextArg = node.args[i + 1];

        if (nextArg && !nextArg.startsWith('--')) {
          flags[flagName] = nextArg;
          i++; // Skip the next argument
        } else {
          flags[flagName] = true;
        }
      } else {
        args.push(arg);
      }
    }
  }

  await statusCommand(args, flags);
}
