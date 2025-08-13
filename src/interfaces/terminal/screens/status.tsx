/**
 * Status Screen.
 *
 * System status and health monitoring interface.
 * Displays comprehensive system information and metrics.
 */

import os from 'node:os';
import { Box, Text, useInput } from 'ink';
import type React from 'react';
import { useEffect, useState } from 'react';
import {
  Header,
  InteractiveFooter,
  LoadingSpinner,
  StatusBadge,
  type SwarmStatus,
} from '../components/index/index.js';
import { formatUptime } from '../utils/time-utils.js';
import { getVersion } from '../utils/version-utils.js';

export interface SystemStatus {
  version: string;
  status: 'healthy' | 'warning' | 'error';
  uptime: number;
  components: {
    mcp: { status: string; port?: number; endpoints?: string[] };
    swarm: { status: string; agents: number; topology: string };
    memory: { status: string; usage: unknown; sessions: number };
    terminal: { status: string; mode: string; active: boolean };
  };
  environment: {
    node: string;
    platform: string;
    arch: string;
    pid: number;
    cwd: string;
  };
  performance: {
    cpuUsage: { user: number; system: number };
    loadAverage: number[];
  };
}

export interface StatusProps {
  swarmStatus?: SwarmStatus;
  onBack: () => void;
  onExit: () => void;
}

export const Status: React.FC<StatusProps> = ({
  swarmStatus,
  onBack,
  onExit,
}) => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Handle keyboard input
  useInput((input, key) => {
    if (key.escape || input === 'q' || input === 'Q') {
      onBack();
    } else if (input === 'r' || input === 'R') {
      setRefreshKey((prev) => prev + 1);
    }
  });

  // Load system status
  useEffect(() => {
    const loadStatus = async () => {
      setIsLoading(true);

      try {
        // Load real system status data
        const actualUptime = process.uptime() * 1000; // Convert to milliseconds
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        // Using ESM import for os to avoid runtime crash in ESM context (previous require caused ReferenceError)
        let loadAvg: number[] = [0, 0, 0];
        try {
          loadAvg = os.loadavg();
        } catch (_e) {
          // loadavg not supported (very rare) – keep defaults
        }

        setSystemStatus({
          version: getVersion(),
          status: 'healthy',
          uptime: actualUptime,
          components: {
            mcp: {
              status: 'idle',
              port: 3000,
              endpoints: [],
            },
            swarm: {
              status: swarmStatus?.status || 'idle',
              agents: swarmStatus?.totalAgents || 0,
              topology: swarmStatus?.topology || 'none',
            },
            memory: {
              status: 'ready',
              usage: memUsage,
              sessions: 0,
            },
            terminal: {
              status: 'ready',
              mode: 'interactive',
              active: true,
            },
          },
          environment: {
            node: process.version,
            platform: process.platform,
            arch: process.arch,
            pid: process.pid,
            cwd: process.cwd(),
          },
          performance: {
            cpuUsage: cpuUsage,
            loadAverage: loadAvg,
          },
        });
      } catch (error) {
        console.error('Failed to load system status:', error);
      }

      setIsLoading(false);
    };

    loadStatus();
  }, [refreshKey, swarmStatus]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / k ** i).toFixed(2)) + ' ' + sizes[i];
  };

  const getComponentStatusBadge = (status: string) => {
    const statusMap: Record<string, unknown> = {
      ready: { status: 'active', text: 'Ready' },
      active: { status: 'active', text: 'Active' },
      error: { status: 'error', text: 'Error' },
      warning: { status: 'warning', text: 'Warning' },
    };

    const mapped = statusMap[status] || { status: 'idle', text: status };
    return (
      <StatusBadge
        status={mapped.status}
        text={mapped.text}
        variant="minimal"
      />
    );
  };

  if (isLoading) {
    return (
      <Box flexDirection="column" height="100%">
        <Header
          title="System Status"
          swarmStatus={swarmStatus}
          showBorder={true}
        />
        <Box flexGrow={1} justifyContent="center" alignItems="center">
          <LoadingSpinner text="Loading system status..." />
        </Box>
      </Box>
    );
  }

  if (!systemStatus) {
    return (
      <Box flexDirection="column" height="100%">
        <Header title="System Status" showBorder={true} />
        <Box flexGrow={1} justifyContent="center" alignItems="center">
          <Text color="red">❌ Failed to load system status</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" height="100%">
      <Header
        title="System Status & Health"
        swarmStatus={swarmStatus}
        showBorder={true}
      />

      <Box flexGrow={1} paddingX={2}>
        <Box flexDirection="column" width="100%">
          {/* Overall Status */}
          <Box marginBottom={2}>
            <Text bold color="cyan">
              🖥️ System Overview
            </Text>
            <Box
              marginTop={1}
              flexDirection="row"
              justifyContent="space-between"
            >
              <Box flexDirection="column" width="50%">
                <Text>
                  Version: <Text color="green">{systemStatus.version}</Text>
                </Text>
                {/* Avoid nesting Box (from StatusBadge minimal variant) inside Text to prevent Ink runtime error */}
                <Box flexDirection="row">
                  <Text>Status:</Text>
                  <Box marginLeft={1}>
                    {getComponentStatusBadge(systemStatus.status)}
                  </Box>
                </Box>
                <Text>
                  Uptime:{' '}
                  <Text color="cyan">{formatUptime(systemStatus.uptime)}</Text>
                </Text>
              </Box>
              <Box flexDirection="column" width="50%">
                <Text>
                  Platform:{' '}
                  <Text color="yellow">
                    {systemStatus.environment.platform}
                  </Text>
                </Text>
                <Text>
                  Node.js:{' '}
                  <Text color="green">{systemStatus.environment.node}</Text>
                </Text>
                <Text>
                  PID: <Text color="gray">{systemStatus.environment.pid}</Text>
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Components */}
          <Box marginBottom={2}>
            <Text bold color="cyan">
              🔧 Components Status
            </Text>
            <Box marginTop={1}>
              {Object.entries(systemStatus.components).map(
                ([name, component]) => (
                  <Box
                    key={name}
                    justifyContent="space-between"
                    marginBottom={1}
                  >
                    <Box width="70%">
                      <Text bold>{name.toUpperCase()}</Text>
                      {component.port && (
                        <Text dimColor> :${component.port}</Text>
                      )}
                      {component.agents !== undefined && (
                        <Text dimColor> ({component.agents} agents)</Text>
                      )}
                    </Box>
                    <Box width="30%" justifyContent="flex-end">
                      {getComponentStatusBadge(component.status)}
                    </Box>
                  </Box>
                )
              )}
            </Box>
          </Box>

          {/* Memory Usage */}
          <Box marginBottom={2}>
            <Text bold color="cyan">
              💾 Memory Usage
            </Text>
            <Box marginTop={1}>
              <Box flexDirection="row" justifyContent="space-between">
                <Text>
                  RSS:{' '}
                  <Text color="yellow">
                    {formatBytes(systemStatus.components.memory.usage.rss)}
                  </Text>
                </Text>
                <Text>
                  Heap Used:{' '}
                  <Text color="green">
                    {formatBytes(systemStatus.components.memory.usage.heapUsed)}
                  </Text>
                </Text>
              </Box>
              <Box flexDirection="row" justifyContent="space-between">
                <Text>
                  Heap Total:{' '}
                  <Text color="cyan">
                    {formatBytes(
                      systemStatus.components.memory.usage.heapTotal
                    )}
                  </Text>
                </Text>
                <Text>
                  External:{' '}
                  <Text color="gray">
                    {formatBytes(systemStatus.components.memory.usage.external)}
                  </Text>
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Performance */}
          <Box marginBottom={1}>
            <Text bold color="cyan">
              📊 Performance
            </Text>
            <Box marginTop={1}>
              <Text>
                Load Average:{' '}
                <Text color="yellow">
                  {systemStatus.performance.loadAverage
                    .map((l) => l.toFixed(2))
                    .join(', ')}
                </Text>
              </Text>
              <Text>
                CPU Usage: User{' '}
                <Text color="green">
                  {(systemStatus.performance.cpuUsage.user / 1000).toFixed(1)}s
                </Text>
                , System{' '}
                <Text color="blue">
                  {(systemStatus.performance.cpuUsage.system / 1000).toFixed(1)}
                  s
                </Text>
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>

      <InteractiveFooter
        currentScreen="System Status"
        availableScreens={[
          { key: 'R', name: 'Refresh' },
          { key: 'Esc/Q', name: 'Back' },
        ]}
        status={`Last updated: ${new Date().toLocaleTimeString()}`}
      />
    </Box>
  );
};

export default Status;
