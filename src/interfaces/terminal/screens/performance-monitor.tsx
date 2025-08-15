/**
 * Performance Monitor Screen.
 *
 * Real-time system metrics dashboard with CPU, memory, network I/O,
 * and process monitoring. Essential for detecting bottlenecks and system health.
 */

import { exec } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { Box, Text, useInput } from 'ink';
import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  Header,
  InteractiveFooter,
  StatusBadge,
  type SwarmStatus,
} from '../components/index/index.js';

const execAsync = promisify(exec);

export interface SystemMetrics {
  cpu: {
    usage: number;
    loadAvg: [number, number, number];
    cores: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    available: number;
    percentage: number;
  };
  process: {
    pid: number;
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
  };
  swarm?: {
    activeAgents: number;
    totalAgents: number;
    tasksInQueue: number;
    completedTasks: number;
    averageResponseTime: number;
  };
}

export interface PerformanceMonitorProps {
  swarmStatus?: SwarmStatus;
  onBack: () => void;
  onExit: () => void;
}

/**
 * Performance Monitor Component.
 *
 * Displays real-time system performance metrics with visual indicators.
 */
export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  swarmStatus,
  onBack,
  onExit,
}) => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: { usage: 0, loadAvg: [0, 0, 0], cores: 1 },
    memory: { total: 0, used: 0, free: 0, available: 0, percentage: 0 },
    process: {
      pid: process.pid,
      uptime: 0,
      memoryUsage: {
        rss: 0,
        heapTotal: 0,
        heapUsed: 0,
        external: 0,
        arrayBuffers: 0,
      },
      cpuUsage: { user: 0, system: 0 },
    },
    network: { bytesIn: 0, bytesOut: 0, packetsIn: 0, packetsOut: 0 },
  });
  const [refreshRate, setRefreshRate] = useState<number>(2000);
  const [selectedView, setSelectedView] = useState<
    'overview' | 'detailed' | 'history'
  >('overview');
  const [metricsHistory, setMetricsHistory] = useState<SystemMetrics[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [networkBaseline, setNetworkBaseline] = useState<{
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
  } | null>(null);

  // Get real CPU usage from system
  const getCpuUsage = async (): Promise<number> => {
    try {
      // Use top command to get CPU usage
      const { stdout } = await execAsync(
        "top -bn1 | grep '%Cpu' | head -n1 | awk '{print $2}' | awk '{print $1}' | tr -d '%'"
      );
      const cpuUsage = parseFloat(stdout.trim());
      return isNaN(cpuUsage) ? 0 : cpuUsage;
    } catch (error) {
      // Fallback: calculate from load average
      const os = await import('node:os');
      const loadAvg = os.loadavg()[0];
      const cores = os.cpus().length;
      return Math.min((loadAvg / cores) * 100, 100);
    }
  };

  // Get real network statistics
  const getNetworkStats = async (): Promise<{
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
  }> => {
    try {
      const netDev = await readFile('/proc/net/dev', 'utf8');
      const lines = netDev.split('\n');

      let totalBytesIn = 0;
      let totalBytesOut = 0;
      let totalPacketsIn = 0;
      let totalPacketsOut = 0;

      // Skip header lines and parse network interfaces
      for (let i = 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(/\s+/);
        if (parts.length < 10) continue;

        const interface_ = parts[0].replace(':', '');
        // Skip loopback interface
        if (interface_ === 'lo') continue;

        const bytesIn = parseInt(parts[1], 10) || 0;
        const packetsIn = parseInt(parts[2], 10) || 0;
        const bytesOut = parseInt(parts[9], 10) || 0;
        const packetsOut = parseInt(parts[10], 10) || 0;

        totalBytesIn += bytesIn;
        totalBytesOut += bytesOut;
        totalPacketsIn += packetsIn;
        totalPacketsOut += packetsOut;
      }

      return {
        bytesIn: totalBytesIn,
        bytesOut: totalBytesOut,
        packetsIn: totalPacketsIn,
        packetsOut: totalPacketsOut,
      };
    } catch (error) {
      // Fallback to netstat if /proc/net/dev is not available
      try {
        const { stdout } = await execAsync('netstat -i | tail -n +3');
        const lines = stdout.split('\n');
        let totalBytesIn = 0;
        let totalBytesOut = 0;

        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 7 && parts[0] !== 'lo') {
            totalBytesIn += parseInt(parts[3], 10) || 0;
            totalBytesOut += parseInt(parts[7], 10) || 0;
          }
        }

        return {
          bytesIn: totalBytesIn,
          bytesOut: totalBytesOut,
          packetsIn: 0,
          packetsOut: 0,
        };
      } catch (fallbackError) {
        return { bytesIn: 0, bytesOut: 0, packetsIn: 0, packetsOut: 0 };
      }
    }
  };

  // Get real swarm metrics from MCP tools or system state
  const getSwarmMetrics = async () => {
    if (!swarmStatus) return undefined;

    try {
      // Try to get real swarm metrics from ruv-swarm
      const { stdout: statusOutput } = await execAsync(
        'npx ruv-swarm memory list --pattern "swarm/*" 2>/dev/null || echo "{}"'
      );

      let tasksInQueue = 0;
      let completedTasks = 0;
      let averageResponseTime = 200;

      try {
        const memoryData = JSON.parse(statusOutput.trim() || '{}');
        // Parse memory data to extract real metrics
        if (memoryData.tasks) {
          tasksInQueue = memoryData.tasks.pending || 0;
          completedTasks = memoryData.tasks.completed || 0;
        }
        if (memoryData.performance) {
          averageResponseTime = memoryData.performance.avgResponseTime || 200;
        }
      } catch (parseError) {
        // Use reasonable defaults if parsing fails
      }

      return {
        activeAgents: swarmStatus.activeAgents || 0,
        totalAgents: swarmStatus.totalAgents || 0,
        tasksInQueue,
        completedTasks,
        averageResponseTime,
      };
    } catch (error) {
      // Fallback to basic swarm status info
      return {
        activeAgents: swarmStatus.activeAgents || 0,
        totalAgents: swarmStatus.totalAgents || 0,
        tasksInQueue: 0,
        completedTasks: 0,
        averageResponseTime: 200,
      };
    }
  };

  // Collect real system metrics
  const collectMetrics = useCallback(async (): Promise<SystemMetrics> => {
    const os = await import('node:os');
    const processMemory = process.memoryUsage();
    const processCpu = process.cpuUsage();

    // Get real system metrics
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    const [cpuUsage, networkStats, swarmMetrics] = await Promise.all([
      getCpuUsage(),
      getNetworkStats(),
      getSwarmMetrics(),
    ]);

    return {
      cpu: {
        usage: cpuUsage,
        loadAvg: os.loadavg(),
        cores: os.cpus().length,
      },
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        available: freeMem,
        percentage: (usedMem / totalMem) * 100,
      },
      process: {
        pid: process.pid,
        uptime: process.uptime(),
        memoryUsage: processMemory,
        cpuUsage: processCpu,
      },
      network: networkStats,
      swarm: swarmMetrics,
    };
  }, [swarmStatus]);

  // Update metrics at refresh rate
  useEffect(() => {
    const updateMetrics = async () => {
      const newMetrics = await collectMetrics();

      // Calculate network deltas for more realistic I/O display
      if (networkBaseline) {
        const deltaMetrics = {
          ...newMetrics,
          network: {
            bytesIn: Math.max(
              0,
              newMetrics.network.bytesIn - networkBaseline.bytesIn
            ),
            bytesOut: Math.max(
              0,
              newMetrics.network.bytesOut - networkBaseline.bytesOut
            ),
            packetsIn: Math.max(
              0,
              newMetrics.network.packetsIn - networkBaseline.packetsIn
            ),
            packetsOut: Math.max(
              0,
              newMetrics.network.packetsOut - networkBaseline.packetsOut
            ),
          },
        };
        setMetrics(deltaMetrics);

        // Store history (keep last 60 entries)
        setMetricsHistory((prev) => [...prev.slice(-59), deltaMetrics]);
      } else {
        // First run - establish baseline
        setNetworkBaseline({
          bytesIn: newMetrics.network.bytesIn,
          bytesOut: newMetrics.network.bytesOut,
          packetsIn: newMetrics.network.packetsIn,
          packetsOut: newMetrics.network.packetsOut,
        });
        setMetrics(newMetrics);
        setMetricsHistory((prev) => [...prev.slice(-59), newMetrics]);
      }

      // Check for alerts
      const newAlerts: string[] = [];
      if (newMetrics.cpu.usage > 90) newAlerts.push('High CPU Usage');
      if (newMetrics.memory.percentage > 85)
        newAlerts.push('High Memory Usage');
      if (newMetrics.swarm && newMetrics.swarm.averageResponseTime > 1000) {
        newAlerts.push('Slow Swarm Response');
      }
      setAlerts(newAlerts);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, refreshRate);
    return () => clearInterval(interval);
  }, [collectMetrics, refreshRate, networkBaseline]);

  // Handle keyboard input
  useInput((input, key) => {
    if (key.escape || input === 'q' || input === 'Q') {
      onBack();
    }

    switch (input) {
      case '1':
        setSelectedView('overview');
        break;
      case '2':
        setSelectedView('detailed');
        break;
      case '3':
        setSelectedView('history');
        break;
      case 'f':
      case 'F':
        setRefreshRate((prev) =>
          prev === 1000 ? 5000 : prev === 5000 ? 10000 : 1000
        );
        break;
    }
  });

  // Utility functions
  const formatBytes = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
  };

  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const createProgressBar = (
    percentage: number,
    width: number = 20
  ): string => {
    const filled = Math.floor((percentage / 100) * width);
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  };

  const getStatusColor = (percentage: number): string => {
    if (percentage > 90) return 'red';
    if (percentage > 75) return 'yellow';
    return 'green';
  };

  const renderOverview = () => (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      {/* Alerts */}
      {alerts.length > 0 && (
        <Box
          marginBottom={2}
          borderStyle="single"
          borderColor="red"
          paddingX={2}
          paddingY={1}
        >
          <Box flexDirection="column">
            <Text color="red" bold>
              ⚠️ System Alerts:
            </Text>
            {alerts.map((alert, index) => (
              <Text key={index} color="red">
                • {alert}
              </Text>
            ))}
          </Box>
        </Box>
      )}

      {/* System Overview */}
      <Box flexDirection="row" marginBottom={2}>
        <Box flexDirection="column" width="50%">
          <Text bold color="cyan">
            💻 System Resources
          </Text>

          {/* CPU */}
          <Box marginTop={1}>
            <Text>CPU Usage: </Text>
            <Text color={getStatusColor(metrics.cpu.usage)}>
              {metrics.cpu.usage.toFixed(1)}%
            </Text>
          </Box>
          <Box>
            <Text color="gray">
              {createProgressBar(metrics.cpu.usage)} ({metrics.cpu.cores} cores)
            </Text>
          </Box>

          {/* Memory */}
          <Box marginTop={1}>
            <Text>Memory: </Text>
            <Text color={getStatusColor(metrics.memory.percentage)}>
              {metrics.memory.percentage.toFixed(1)}%
            </Text>
          </Box>
          <Box>
            <Text color="gray">
              {createProgressBar(metrics.memory.percentage)}{' '}
              {formatBytes(metrics.memory.used)}/
              {formatBytes(metrics.memory.total)}
            </Text>
          </Box>

          {/* Load Average */}
          <Box marginTop={1}>
            <Text>Load Avg: </Text>
            <Text color="white">
              {metrics.cpu.loadAvg.map((l) => l.toFixed(2)).join(' ')}
            </Text>
          </Box>
        </Box>

        <Box flexDirection="column" width="50%">
          <Text bold color="cyan">
            🚀 Process Info
          </Text>

          {/* Process Memory */}
          <Box marginTop={1}>
            <Text>Heap Used: </Text>
            <Text color="green">
              {formatBytes(metrics.process.memoryUsage.heapUsed)}
            </Text>
          </Box>
          <Box>
            <Text>RSS: </Text>
            <Text color="white">
              {formatBytes(metrics.process.memoryUsage.rss)}
            </Text>
          </Box>

          {/* Uptime */}
          <Box marginTop={1}>
            <Text>Uptime: </Text>
            <Text color="cyan">{formatUptime(metrics.process.uptime)}</Text>
          </Box>

          {/* PID */}
          <Box>
            <Text>PID: </Text>
            <Text color="gray">{metrics.process.pid}</Text>
          </Box>
        </Box>
      </Box>

      {/* Network Stats */}
      <Box marginBottom={2}>
        <Box flexDirection="column" width="100%">
          <Text bold color="cyan">
            🌐 Network I/O
          </Text>
          <Box flexDirection="row" marginTop={1}>
            <Box width="50%">
              <Text>Bytes In: </Text>
              <Text color="green">
                {formatBytes(metrics.network.bytesIn)}/s
              </Text>
            </Box>
            <Box width="50%">
              <Text>Bytes Out: </Text>
              <Text color="yellow">
                {formatBytes(metrics.network.bytesOut)}/s
              </Text>
            </Box>
          </Box>
          <Box flexDirection="row" marginTop={1}>
            <Box width="50%">
              <Text>Packets In: </Text>
              <Text color="blue">
                {metrics.network.packetsIn.toLocaleString()}/s
              </Text>
            </Box>
            <Box width="50%">
              <Text>Packets Out: </Text>
              <Text color="magenta">
                {metrics.network.packetsOut.toLocaleString()}/s
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Swarm Metrics */}
      {metrics.swarm && (
        <Box>
          <Box flexDirection="column" width="100%">
            <Text bold color="cyan">
              🐝 Swarm Performance
            </Text>
            <Box flexDirection="row" marginTop={1}>
              <Box width="33%">
                <Text>Active Agents: </Text>
                <Text color="green">
                  {metrics.swarm.activeAgents}/{metrics.swarm.totalAgents}
                </Text>
              </Box>
              <Box width="33%">
                <Text>Queue: </Text>
                <Text color="yellow">{metrics.swarm.tasksInQueue}</Text>
              </Box>
              <Box width="33%">
                <Text>Avg Response: </Text>
                <Text
                  color={
                    metrics.swarm.averageResponseTime > 1000 ? 'red' : 'white'
                  }
                >
                  {metrics.swarm.averageResponseTime.toFixed(0)}ms
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );

  const renderDetailed = () => (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Text bold color="cyan" marginBottom={1}>
        📊 Detailed Metrics
      </Text>

      {/* Detailed CPU */}
      <Box marginBottom={2} borderStyle="single" borderColor="gray" padding={1}>
        <Text bold>CPU Information</Text>
        <Text>Usage: {metrics.cpu.usage.toFixed(2)}%</Text>
        <Text>Cores: {metrics.cpu.cores}</Text>
        <Text>
          Load Average (1m/5m/15m):{' '}
          {metrics.cpu.loadAvg.map((l) => l.toFixed(3)).join(' / ')}
        </Text>
      </Box>

      {/* Detailed Memory */}
      <Box marginBottom={2} borderStyle="single" borderColor="gray" padding={1}>
        <Text bold>Memory Information</Text>
        <Text>Total: {formatBytes(metrics.memory.total)}</Text>
        <Text>
          Used: {formatBytes(metrics.memory.used)} (
          {metrics.memory.percentage.toFixed(2)}%)
        </Text>
        <Text>Free: {formatBytes(metrics.memory.free)}</Text>
        <Text>Available: {formatBytes(metrics.memory.available)}</Text>
      </Box>

      {/* Process Details */}
      <Box borderStyle="single" borderColor="gray" padding={1}>
        <Text bold>Process Memory Details</Text>
        <Text>
          Heap Total: {formatBytes(metrics.process.memoryUsage.heapTotal)}
        </Text>
        <Text>
          Heap Used: {formatBytes(metrics.process.memoryUsage.heapUsed)}
        </Text>
        <Text>
          External: {formatBytes(metrics.process.memoryUsage.external)}
        </Text>
        <Text>
          Array Buffers: {formatBytes(metrics.process.memoryUsage.arrayBuffers)}
        </Text>
        <Text>RSS: {formatBytes(metrics.process.memoryUsage.rss)}</Text>
      </Box>
    </Box>
  );

  const renderHistory = () => (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Text bold color="cyan" marginBottom={1}>
        📈 Performance History
      </Text>

      {metricsHistory.length === 0 ? (
        <Text color="gray">Collecting metrics history...</Text>
      ) : (
        <Box flexDirection="column">
          <Text>History entries: {metricsHistory.length}</Text>
          <Box marginTop={1}>
            <Text bold>CPU Usage Trend (last 20 readings):</Text>
            <Box>
              <Text color="gray">
                {metricsHistory
                  .slice(-20)
                  .map((m) =>
                    m.cpu.usage > 80 ? '█' : m.cpu.usage > 50 ? '▅' : '▂'
                  )
                  .join('')}
              </Text>
            </Box>
          </Box>
          <Box marginTop={1}>
            <Text bold>Memory Usage Trend (last 20 readings):</Text>
            <Box>
              <Text color="gray">
                {metricsHistory
                  .slice(-20)
                  .map((m) =>
                    m.memory.percentage > 80
                      ? '█'
                      : m.memory.percentage > 50
                        ? '▅'
                        : '▂'
                  )
                  .join('')}
              </Text>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );

  const renderCurrentView = () => {
    switch (selectedView) {
      case 'detailed':
        return renderDetailed();
      case 'history':
        return renderHistory();
      default:
        return renderOverview();
    }
  };

  return (
    <Box flexDirection="column" height="100%">
      {/* Header */}
      <Header
        title="Performance Monitor"
        subtitle={`Refresh: ${refreshRate}ms | View: ${selectedView}`}
        swarmStatus={swarmStatus}
        mode="standard"
        showBorder={true}
      />

      {/* Status Bar */}
      <Box paddingX={2} paddingY={1} borderStyle="single" borderColor="gray">
        <Box flexDirection="row" justifyContent="space-between">
          <Box flexDirection="row">
            <StatusBadge
              status={alerts.length > 0 ? 'error' : 'active'}
              text={alerts.length > 0 ? `${alerts.length} ALERTS` : 'HEALTHY'}
              variant="minimal"
            />
          </Box>
          <Box flexDirection="row">
            <Text color="cyan">CPU: </Text>
            <Text color={getStatusColor(metrics.cpu.usage)}>
              {metrics.cpu.usage.toFixed(1)}%
            </Text>
            <Text color="gray"> | </Text>
            <Text color="cyan">MEM: </Text>
            <Text color={getStatusColor(metrics.memory.percentage)}>
              {metrics.memory.percentage.toFixed(1)}%
            </Text>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box flexGrow={1}>{renderCurrentView()}</Box>

      {/* Footer */}
      <Box paddingY={1} paddingX={2}>
        <InteractiveFooter
          currentScreen="Performance Monitor"
          availableScreens={[
            { key: '1', name: 'Overview' },
            { key: '2', name: 'Detailed' },
            { key: '3', name: 'History' },
            { key: 'F', name: `Refresh (${refreshRate}ms)` },
            { key: 'Q/Esc', name: 'Back' },
          ]}
          status={`${alerts.length} alerts | ${refreshRate}ms refresh`}
        />
      </Box>
    </Box>
  );
};

export default PerformanceMonitor;
