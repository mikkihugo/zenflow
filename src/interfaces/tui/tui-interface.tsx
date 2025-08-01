/**
 * TUI Interface - Terminal User Interface
 *
 * Full-screen terminal interface built with React/Ink
 * Real-time updates, keyboard navigation, multi-panel layout
 */

import chalk from 'chalk';
import { Box, render, Static, Text, useApp, useInput } from 'ink';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { createLogger } from '../../utils/logger.js';

export interface TUIConfig {
  port?: number;
  theme?: 'dark' | 'light';
  refreshInterval?: number;
  enableKeyboardShortcuts?: boolean;
}

interface SystemStatus {
  system: string;
  version: string;
  swarms: { active: number; total: number };
  tasks: { pending: number; active: number; completed: number };
  resources: { cpu: string; memory: string; disk: string };
  uptime: string;
}

interface SwarmInfo {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  agents: number;
  tasks: number;
  progress: number;
}

interface TaskInfo {
  id: string;
  title: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  assignedAgents: string[];
  progress: number;
  eta: string;
}

type TabName = 'dashboard' | 'swarms' | 'tasks' | 'documents' | 'logs';

interface AppState {
  activeTab: TabName;
  systemStatus: SystemStatus;
  swarms: SwarmInfo[];
  tasks: TaskInfo[];
  logs: Array<{ timestamp: string; level: string; message: string }>;
  isLoading: boolean;
  error: string | null;
}

const TUIApp: React.FC<{ config: TUIConfig }> = ({ config }) => {
  const { exit } = useApp();
  const [state, setState] = useState<AppState>({
    activeTab: 'dashboard',
    systemStatus: {
      system: 'healthy',
      version: '2.0.0-alpha.73',
      swarms: { active: 0, total: 0 },
      tasks: { pending: 0, active: 0, completed: 0 },
      resources: { cpu: '0%', memory: '0%', disk: '0%' },
      uptime: '0m',
    },
    swarms: [],
    tasks: [],
    logs: [],
    isLoading: true,
    error: null,
  });

  // Keyboard shortcuts
  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      exit();
      return;
    }

    if (config.enableKeyboardShortcuts !== false) {
      switch (input) {
        case '1':
          setState((prev) => ({ ...prev, activeTab: 'dashboard' }));
          break;
        case '2':
          setState((prev) => ({ ...prev, activeTab: 'swarms' }));
          break;
        case '3':
          setState((prev) => ({ ...prev, activeTab: 'tasks' }));
          break;
        case '4':
          setState((prev) => ({ ...prev, activeTab: 'documents' }));
          break;
        case '5':
          setState((prev) => ({ ...prev, activeTab: 'logs' }));
          break;
        case 'r':
          refreshData();
          break;
        case 'q':
          exit();
          break;
      }
    }
  });

  // Data fetching
  const refreshData = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Simulate API calls - in real implementation, these would be actual service calls
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockSystemStatus: SystemStatus = {
        system: 'healthy',
        version: '2.0.0-alpha.73',
        swarms: { active: 2, total: 5 },
        tasks: { pending: 3, active: 1, completed: 12 },
        resources: { cpu: '45%', memory: '60%', disk: '23%' },
        uptime: '2h 15m',
      };

      const mockSwarms: SwarmInfo[] = [
        {
          id: 'swarm-1',
          name: 'Document Processing',
          status: 'active',
          agents: 4,
          tasks: 8,
          progress: 65,
        },
        {
          id: 'swarm-2',
          name: 'Feature Development',
          status: 'active',
          agents: 6,
          tasks: 12,
          progress: 40,
        },
      ];

      const mockTasks: TaskInfo[] = [
        {
          id: 'task-1',
          title: 'Process PRD: User Authentication',
          status: 'active',
          assignedAgents: ['agent-1', 'agent-2'],
          progress: 75,
          eta: '15m',
        },
        {
          id: 'task-2',
          title: 'Generate ADR: Database Architecture',
          status: 'pending',
          assignedAgents: [],
          progress: 0,
          eta: '30m',
        },
      ];

      const mockLogs = [
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Swarm initialized successfully',
        },
        { timestamp: new Date().toISOString(), level: 'info', message: 'Processing PRD document' },
        { timestamp: new Date().toISOString(), level: 'warn', message: 'Agent pool running low' },
      ];

      setState((prev) => ({
        ...prev,
        systemStatus: mockSystemStatus,
        swarms: mockSwarms,
        tasks: mockTasks,
        logs: mockLogs,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      }));
    }
  }, []);

  // Auto-refresh
  useEffect(() => {
    refreshData();

    if (config.refreshInterval) {
      const interval = setInterval(refreshData, config.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshData, config.refreshInterval]);

  const theme =
    config.theme === 'light'
      ? {
          primary: '#0969da',
          secondary: '#656d76',
          background: '#ffffff',
          surface: '#f6f8fa',
          accent: '#1a7f37',
          success: '#1a7f37',
          warning: '#d1242f',
          error: '#cf222e',
        }
      : {
          primary: '#58a6ff',
          secondary: '#7d8590',
          background: '#0d1117',
          surface: '#21262d',
          accent: '#238636',
          success: '#238636',
          warning: '#d29922',
          error: '#f85149',
        };

  const renderHeader = () => (
    <Box flexDirection="column" marginBottom={1}>
      <Box justifyContent="space-between">
        <Text color={theme.primary} bold>
          🧠 Claude Code Zen - Terminal Interface
        </Text>
        <Text color={theme.secondary}>
          {new Date().toLocaleTimeString()} | {state.systemStatus.uptime} uptime
        </Text>
      </Box>

      <Box marginTop={1}>
        {(['dashboard', 'swarms', 'tasks', 'documents', 'logs'] as TabName[]).map((tab, index) => (
          <Box key={tab} marginRight={1}>
            <Text
              color={state.activeTab === tab ? theme.primary : theme.secondary}
              bold={state.activeTab === tab}
            >
              [{index + 1}] {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );

  const renderDashboard = () => (
    <Box flexDirection="column">
      <Text color={theme.primary} bold marginBottom={1}>
        📊 System Dashboard
      </Text>

      <Box flexDirection="row" justifyContent="space-between" marginBottom={1}>
        <Box flexDirection="column" width="30%">
          <Text color={theme.secondary} bold>
            System Health
          </Text>
          <Text color={theme.success}>● {state.systemStatus.system}</Text>
          <Text>Version: {state.systemStatus.version}</Text>
        </Box>

        <Box flexDirection="column" width="30%">
          <Text color={theme.secondary} bold>
            Resources
          </Text>
          <Text>
            CPU: {getResourceColor(state.systemStatus.resources.cpu)}{' '}
            {state.systemStatus.resources.cpu}
          </Text>
          <Text>
            Memory: {getResourceColor(state.systemStatus.resources.memory)}{' '}
            {state.systemStatus.resources.memory}
          </Text>
          <Text>
            Disk: {getResourceColor(state.systemStatus.resources.disk)}{' '}
            {state.systemStatus.resources.disk}
          </Text>
        </Box>

        <Box flexDirection="column" width="30%">
          <Text color={theme.secondary} bold>
            Activity
          </Text>
          <Text>
            Swarms: {state.systemStatus.swarms.active}/{state.systemStatus.swarms.total}
          </Text>
          <Text>Active Tasks: {state.systemStatus.tasks.active}</Text>
          <Text>Completed: {state.systemStatus.tasks.completed}</Text>
        </Box>
      </Box>

      <Box flexDirection="column" marginTop={1}>
        <Text color={theme.secondary} bold>
          Recent Activity
        </Text>
        {state.logs.slice(0, 5).map((log, index) => (
          <Text key={index} color={getLogColor(log.level)}>
            {log.timestamp.split('T')[1].substring(0, 8)} [{log.level.toUpperCase()}] {log.message}
          </Text>
        ))}
      </Box>
    </Box>
  );

  const renderSwarms = () => (
    <Box flexDirection="column">
      <Text color={theme.primary} bold marginBottom={1}>
        🐝 Active Swarms
      </Text>

      {state.swarms.map((swarm) => (
        <Box
          key={swarm.id}
          flexDirection="column"
          borderStyle="round"
          borderColor={theme.secondary}
          padding={1}
          marginBottom={1}
        >
          <Box justifyContent="space-between">
            <Text bold>{swarm.name}</Text>
            <Text color={getStatusColor(swarm.status)}>● {swarm.status}</Text>
          </Box>
          <Text>
            Agents: {swarm.agents} | Tasks: {swarm.tasks}
          </Text>
          <Box>
            <Text>Progress: </Text>
            <Text color={theme.accent}>
              [{generateProgressBar(swarm.progress)}] {swarm.progress}%
            </Text>
          </Box>
        </Box>
      ))}
    </Box>
  );

  const renderTasks = () => (
    <Box flexDirection="column">
      <Text color={theme.primary} bold marginBottom={1}>
        ✅ Task Management
      </Text>

      {state.tasks.map((task) => (
        <Box
          key={task.id}
          flexDirection="column"
          borderStyle="round"
          borderColor={theme.secondary}
          padding={1}
          marginBottom={1}
        >
          <Box justifyContent="space-between">
            <Text bold>{task.title}</Text>
            <Text color={getStatusColor(task.status)}>● {task.status}</Text>
          </Box>
          <Text>
            Agents: {task.assignedAgents.length > 0 ? task.assignedAgents.join(', ') : 'None'}
          </Text>
          <Box>
            <Text>Progress: </Text>
            <Text color={theme.accent}>
              [{generateProgressBar(task.progress)}] {task.progress}%
            </Text>
            <Text> ETA: {task.eta}</Text>
          </Box>
        </Box>
      ))}
    </Box>
  );

  const renderDocuments = () => (
    <Box flexDirection="column">
      <Text color={theme.primary} bold marginBottom={1}>
        📄 Document Workflow
      </Text>
      <Text color={theme.secondary}>Vision → ADRs → PRDs → Epics → Features → Tasks → Code</Text>
      <Text marginTop={1}>Document management features coming soon...</Text>
    </Box>
  );

  const renderLogs = () => (
    <Box flexDirection="column">
      <Text color={theme.primary} bold marginBottom={1}>
        📋 System Logs
      </Text>

      <Static items={state.logs}>
        {(log, index) => (
          <Box key={index}>
            <Text color={theme.secondary}>{log.timestamp.split('T')[1].substring(0, 8)}</Text>
            <Text color={getLogColor(log.level)} marginLeft={1}>
              [{log.level.toUpperCase()}] {log.message}
            </Text>
          </Box>
        )}
      </Static>
    </Box>
  );

  const renderFooter = () => (
    <Box marginTop={1} borderStyle="single" borderColor={theme.secondary} padding={1}>
      <Text color={theme.secondary}>
        [1-5] Switch tabs | [R] Refresh | [Q] Quit | [Ctrl+C] Exit
        {state.isLoading && ' | ⟳ Loading...'}
        {state.error && ` | ❌ ${state.error}`}
      </Text>
    </Box>
  );

  const getResourceColor = (usage: string) => {
    const percent = parseInt(usage);
    if (percent > 80) return '🔴';
    if (percent > 60) return '🟡';
    return '🟢';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'healthy':
      case 'completed':
        return theme.success;
      case 'pending':
      case 'paused':
        return theme.warning;
      case 'failed':
      case 'error':
        return theme.error;
      default:
        return theme.secondary;
    }
  };

  const getLogColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return theme.error;
      case 'warn':
        return theme.warning;
      case 'info':
        return theme.primary;
      default:
        return theme.secondary;
    }
  };

  const generateProgressBar = (progress: number, width: number = 20) => {
    const filled = Math.round((progress / 100) * width);
    return '█'.repeat(filled) + '░'.repeat(width - filled);
  };

  const renderContent = () => {
    switch (state.activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'swarms':
        return renderSwarms();
      case 'tasks':
        return renderTasks();
      case 'documents':
        return renderDocuments();
      case 'logs':
        return renderLogs();
      default:
        return <Text>Unknown tab</Text>;
    }
  };

  return (
    <Box flexDirection="column" height="100%">
      {renderHeader()}
      <Box flexGrow={1} paddingY={1}>
        {renderContent()}
      </Box>
      {renderFooter()}
    </Box>
  );
};

export class TUIInterface {
  private logger = createLogger('TUI');
  private config: TUIConfig;

  constructor(config: TUIConfig = {}) {
    this.config = {
      theme: 'dark',
      refreshInterval: 5000,
      enableKeyboardShortcuts: true,
      ...config,
    };
  }

  /**
   * Launch the TUI interface
   */
  async run(): Promise<void> {
    this.logger.info('Starting TUI interface');

    try {
      // Validate terminal capabilities
      if (!process.stdin.isTTY) {
        throw new Error('TUI requires an interactive terminal');
      }

      // Launch React/Ink app
      const { waitUntilExit } = render(<TUIApp config={this.config} />);

      await waitUntilExit();

      this.logger.info('TUI interface closed');
    } catch (error) {
      this.logger.error('TUI interface failed:', error);
      throw error;
    }
  }

  /**
   * Get TUI capabilities
   */
  static getCapabilities(): any {
    return {
      supportsKeyboard: true,
      supportsRealTime: true,
      supportsTabs: true,
      supportsProgress: true,
      requiresTTY: true,
      features: [
        'multi-panel-layout',
        'real-time-updates',
        'keyboard-navigation',
        'progress-bars',
        'status-indicators',
        'log-streaming',
      ],
    };
  }
}
