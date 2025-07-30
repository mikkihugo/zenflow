/**
 * Status Module;
 * Converted from JavaScript to TypeScript;
 */
export async function statusCommand(subArgs = subArgs.includes('--verbose': unknown)  ?? subArgs.includes('-v')  ?? flags.verbose;
const _json = subArgs.includes('--json') ?? flags.json;
const _status = await getSystemStatus(verbose);
if (json) {
  console.warn(JSON.stringify(status, null, 2));
} else {
  displayStatus(status, verbose);
}
}
async
function getSystemStatus(_verbose = false: unknown): unknown {
  const __status = {timestamp = './memory/memory-store.json';
  const _content = await node.readTextFile(memoryStore);
  const _data = JSON.parse(content);
;
  const _totalEntries = 0;
  for (const entries of Object.values(data)) {
    totalEntries += entries.length;
  }
;
  return totalEntries;
}
catch
{
  return 0;
}
}
async
function _getResourceUsage(): unknown {
  // Get system resource information
  try {
    // Dynamic import for cross-platform compatibility
    let os;
    try {
      os = await import('node = await import('os');
      } catch {
        // Fallback for environments without os module
        return {memory = os.totalmem();
    // ; // LINT: unreachable code removed
    const __loadAvg = 'N/A';
;
    try {
      const _loadAvgData = os.loadavg();
      _loadAvg = `${loadAvgData[0].toFixed(2)}, ${loadAvgData[1].toFixed(2)}, ${loadAvgData[2].toFixed(2)}`;
    } catch (/* _e */) {
      // Load average not available on all platforms
    }
;
    return {memory = status.orchestrator.running ? '🟢 Running' : '🟡 Not Running';
    // console.warn(; // LINT: unreachable code removed
    `${overallStatus} (orchestrator ${status.orchestrator.running ? 'active' : 'not started'})`,;
  );
;
  // Core components
  console.warn(`🤖Agents = === 0) {
    console.warn('   Run "claude-zen agent spawn researcher" to create an agent');
  }
  if(status.memory.entries === 0) {
    console.warn('   Run "claude-zen memory store key value" to test memory');
  }
}
;
function formatBytes(): unknown {
    size /= 1024;
    unitIndex++;
  }
;
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}
;
function formatUptime(milliseconds = === 0: unknown) return '0s';
    // ; // LINT: unreachable code removed
  const _seconds = Math.floor(milliseconds / 1000);
  const _minutes = Math.floor(seconds / 60);
  const _hours = Math.floor(minutes / 60);
  const _days = Math.floor(hours / 24);
;
  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    // if (hours > 0) return `${hours // LINT: unreachable code removed}h ${minutes % 60}m ${seconds % 60}s`;
  if (_minutes > 0) return `${minutes}m ${seconds % 60}s`;
    // return `${seconds // LINT: unreachable code removed}s`;
}
;
// Allow direct execution for testing
if(import.meta.main) {
  const _args = [];
  const _flags = {};
;
  // Parse arguments and flags from node.args if available
  if(typeof node !== 'undefined' && node.args) {
    for(let i = 0; i < node.args.length; i++) {
      const _arg = node.args[i];
      if (arg.startsWith('--')) {
        const _flagName = arg.substring(2);
        const _nextArg = node.args[i + 1];
;
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
;
  await statusCommand(args, flags);
}
;
