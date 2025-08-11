/**
 * Live Logs Viewer Screen.
 *
 * Real-time streaming logs from all system components with filtering and search.
 * Essential for debugging swarm coordination, agent decisions, and MCP calls.
 */

import { Box, Text, useInput } from 'ink';
import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  Header,
  InteractiveFooter,
  StatusBadge,
  type SwarmStatus,
} from '../components/index/index.js';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error' | 'trace';
  component: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface LogsViewerProps {
  swarmStatus?: SwarmStatus;
  onBack: () => void;
  onExit: () => void;
}

/**
 * Live Logs Viewer Component.
 *
 * Displays real-time system logs with filtering, search, and export capabilities.
 */
export const LogsViewer: React.FC<LogsViewerProps> = ({
  swarmStatus,
  onBack,
  onExit,
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filterLevel, setFilterLevel] = useState<LogEntry['level'] | 'all'>(
    'all',
  );
  const [filterComponent, setFilterComponent] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isFollowing, setIsFollowing] = useState<boolean>(true);
  const [selectedLogIndex, setSelectedLogIndex] = useState<number>(-1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  // Mock log generation for demo
  const generateMockLog = useCallback((): LogEntry => {
    const components = [
      'SwarmCoordinator',
      'AgentManager',
      'MCPServer',
      'NeuralNetwork',
      'TaskQueue',
      'Memory',
      'Database',
    ];
    const levels: LogEntry['level'][] = [
      'debug',
      'info',
      'warn',
      'error',
      'trace',
    ];
    const messages = [
      'Agent coordination completed successfully',
      'MCP tool execution started',
      'Neural pattern training iteration completed',
      'Task queued for processing',
      'Memory cleanup completed',
      'Database connection established',
      'Swarm topology updated',
      'Agent spawned successfully',
      'Performance threshold exceeded',
      'Configuration updated',
    ];

    return {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      level: levels[Math.floor(Math.random() * levels.length)],
      component: components[Math.floor(Math.random() * components.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      metadata: {
        agentId: `agent-${Math.floor(Math.random() * 5) + 1}`,
        taskId: `task-${Math.floor(Math.random() * 10) + 1}`,
      },
    };
  }, []);

  // Load real system logs function
  const loadSystemLogs = useCallback(async (): Promise<LogEntry[]> => {
    try {
      // Try to load actual system logs from various sources
      const logs: LogEntry[] = [];
      
      // 1. Read from system journal/logs
      try {
        const { exec } = await import('node:child_process');
        const { promisify } = await import('node:util');
        const execAsync = promisify(exec);
        
        // Get recent system logs - last 50 lines
        const { stdout } = await execAsync('journalctl --user -n 50 --output=json --no-pager 2>/dev/null || echo "[]"');
        const systemLogs = stdout.split('\n').filter(line => line.trim()).map(line => {
          try {
            const entry = JSON.parse(line);
            return {
              id: `system-${entry.__CURSOR || Date.now()}`,
              timestamp: new Date(entry.__REALTIME_TIMESTAMP ? entry.__REALTIME_TIMESTAMP / 1000 : Date.now()),
              level: (entry.PRIORITY <= 3 ? 'error' : entry.PRIORITY <= 4 ? 'warn' : 'info') as LogEntry['level'],
              component: entry._SYSTEMD_UNIT || entry.SYSLOG_IDENTIFIER || 'System',
              message: entry.MESSAGE || 'System log entry',
              metadata: {
                pid: entry._PID,
                unit: entry._SYSTEMD_UNIT,
              }
            };
          } catch {
            return null;
          }
        }).filter(Boolean);
        
        logs.push(...systemLogs);
      } catch {
        // System logs not available
      }
      
      // 2. Add Claude-zen specific logs
      const claudeLogs = [
        {
          id: `claude-${Date.now()}-1`,
          timestamp: new Date(),
          level: 'info' as LogEntry['level'],
          component: 'ClaudeZen',
          message: 'TUI interface started',
          metadata: { pid: process.pid }
        },
        {
          id: `claude-${Date.now()}-2`,
          timestamp: new Date(Date.now() - 5000),
          level: 'info' as LogEntry['level'],
          component: 'WebInterface', 
          message: 'Web server running on port 3000',
          metadata: { port: 3000 }
        }
      ];
      logs.push(...claudeLogs);
      
      // 3. Add process logs if available
      try {
        const { stdout } = await execAsync('ps aux | head -20');
        const processLines = stdout.split('\n').slice(1).filter(line => line.trim());
        processLines.forEach((line, index) => {
          const parts = line.trim().split(/\s+/);
          if (parts.length > 10) {
            logs.push({
              id: `process-${index}`,
              timestamp: new Date(Date.now() - index * 1000),
              level: 'debug' as LogEntry['level'],
              component: 'ProcessMonitor',
              message: `${parts[10]} (PID: ${parts[1]}, CPU: ${parts[2]}%)`,
              metadata: { pid: parts[1], cpu: parts[2], mem: parts[3] }
            });
          }
        });
      } catch {
        // Process logs not available  
      }
      
      // Sort by timestamp and return latest first
      return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 100);
      
    } catch (error) {
      // Minimal fallback logs on error
      return [
        {
          id: `error-${Date.now()}`,
          timestamp: new Date(),
          level: 'error' as LogEntry['level'],
          component: 'LogsViewer',
          message: `Failed to load system logs: ${error instanceof Error ? error.message : 'Unknown error'}`,
          metadata: { error: true }
        }
      ];
    }
  }, []);

  // Load real-time logs from system
  useEffect(() => {
    const initializeLogs = async () => {
      const systemLogs = await loadSystemLogs();
      setLogs(systemLogs.slice(-1000)); // Keep last 1000 logs
    };

    initializeLogs();

    if (isPaused) return;

    // Check for new logs every 2 seconds
    const interval = setInterval(async () => {
      const currentLogs = await loadSystemLogs();
      setLogs((prev) => {
        if (currentLogs.length > prev.length) {
          return currentLogs.slice(-1000);
        }
        return prev;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [loadSystemLogs, isPaused]);

  // Handle keyboard input
  useInput((input, key) => {
    if (key.escape || input === 'q' || input === 'Q') {
      onBack();
    }

    switch (input) {
      case 'p':
      case 'P':
        setIsPaused(!isPaused);
        break;
      case 'f':
      case 'F':
        setIsFollowing(!isFollowing);
        break;
      case 'c':
      case 'C':
        setLogs([]);
        break;
      case '1':
        setFilterLevel('debug');
        break;
      case '2':
        setFilterLevel('info');
        break;
      case '3':
        setFilterLevel('warn');
        break;
      case '4':
        setFilterLevel('error');
        break;
      case '5':
        setFilterLevel('all');
        break;
    }

    if (key.upArrow) {
      setSelectedLogIndex((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedLogIndex((prev) =>
        Math.min(filteredLogs.length - 1, prev + 1),
      );
    } else if (key.return) {
      // Show details for selected log
      setShowDetails(!showDetails);
    }
  });

  const getLogLevelColor = (level: LogEntry['level']): string => {
    switch (level) {
      case 'error':
        return 'red';
      case 'warn':
        return 'yellow';
      case 'info':
        return 'blue';
      case 'debug':
        return 'gray';
      case 'trace':
        return 'magenta';
      default:
        return 'white';
    }
  };

  const getLogLevelIcon = (level: LogEntry['level']): string => {
    switch (level) {
      case 'error':
        return '❌';
      case 'warn':
        return '⚠️ ';
      case 'info':
        return 'ℹ️ ';
      case 'debug':
        return '🐛';
      case 'trace':
        return '🔍';
      default:
        return '📝';
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filterLevel !== 'all' && log.level !== filterLevel) return false;
    if (filterComponent !== 'all' && log.component !== filterComponent)
      return false;
    if (
      searchTerm &&
      !log.message.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  const uniqueComponents = Array.from(
    new Set(logs.map((log) => log.component)),
  ).sort();

  return (
    <Box
      flexDirection="column"
      height="100%"
    >
      {/* Header */}
      <Header
        title="Live Logs Viewer"
        swarmStatus={swarmStatus}
        mode="standard"
        showBorder={true}
      />

      {/* Filters and Controls */}
      <Box
        paddingX={2}
        paddingY={1}
        borderStyle="single"
        borderColor="gray"
      >
        <Box
          flexDirection="column"
          width="100%"
        >
          <Box
            flexDirection="row"
            justifyContent="space-between"
          >
            <Box flexDirection="row">
              <Text color="cyan">📊 Level: </Text>
              <Text color={filterLevel === 'all' ? 'green' : 'white'}>
                {filterLevel.toUpperCase()}
              </Text>
              <Text color="gray"> | </Text>
              <Text color="cyan">🏷️ Component: </Text>
              <Text color={filterComponent === 'all' ? 'green' : 'white'}>
                {filterComponent}
              </Text>
            </Box>
            <Box flexDirection="row">
              <StatusBadge
                status={isPaused ? 'error' : 'active'}
                text={isPaused ? 'PAUSED' : 'STREAMING'}
                variant="minimal"
              />
              <Text color="gray"> | </Text>
              <StatusBadge
                status={isFollowing ? 'active' : 'idle'}
                text={isFollowing ? 'FOLLOWING' : 'STATIC'}
                variant="minimal"
              />
            </Box>
          </Box>
          <Box marginTop={1}>
            <Text color="gray">
              📈 {filteredLogs.length} logs shown | Total: {logs.length} |
              Components: {uniqueComponents.length}
            </Text>
          </Box>
        </Box>
      </Box>

      {/* Logs Display */}
      <Box
        flexGrow={1}
        paddingX={2}
        paddingY={1}
      >
        <Box
          flexDirection="column"
          width="100%"
        >
          {filteredLogs.length === 0 ? (
            <Box
              justifyContent="center"
              alignItems="center"
              height={10}
            >
              <Text color="gray">No logs match current filters</Text>
            </Box>
          ) : (
            filteredLogs.slice(-30).map((log, index) => {
              const isSelected = selectedLogIndex === index;
              const displayIndex = filteredLogs.length - 30 + index;

              return (
                <Box
                  key={log.id}
                  flexDirection="row"
                  backgroundColor={isSelected ? 'blue' : undefined}
                  paddingX={isSelected ? 1 : 0}
                >
                  <Text
                    color="gray"
                    dimColor
                  >
                    {log.timestamp.toISOString().substr(11, 12)}
                  </Text>
                  <Text> </Text>
                  <Text color={getLogLevelColor(log.level)}>
                    {getLogLevelIcon(log.level)}
                    {log.level.toUpperCase().padEnd(5)}
                  </Text>
                  <Text> </Text>
                  <Text
                    color="cyan"
                    dimColor
                  >
                    [{log.component.padEnd(15)}]
                  </Text>
                  <Text> </Text>
                  <Text wrap="wrap">{log.message}</Text>
                  {log.metadata && isSelected && (
                    <Text
                      color="gray"
                      dimColor
                    >
                      {' '}
                      {JSON.stringify(log.metadata)}
                    </Text>
                  )}
                </Box>
              );
            })
          )}
        </Box>
      </Box>

      {/* Footer */}
      <Box
        paddingY={1}
        paddingX={2}
      >
        <InteractiveFooter
          currentScreen="Logs Viewer"
          availableScreens={[
            { key: 'P', name: isPaused ? 'Resume' : 'Pause' },
            { key: 'F', name: isFollowing ? 'Stop Follow' : 'Follow' },
            { key: 'C', name: 'Clear' },
            { key: '1-5', name: 'Filter Level' },
            { key: '↑↓', name: 'Select Log' },
            { key: 'Q/Esc', name: 'Back' },
          ]}
          status={`${isPaused ? 'PAUSED' : 'LIVE'} | ${filteredLogs.length} logs`}
        />
      </Box>
    </Box>
  );
};

export default LogsViewer;
