/**
 * Interactive Terminal Application - Google Standard Component.
 *
 * Full-featured interactive terminal interface with real-time updates.
 * Manages multiple screens and provides rich user interaction.
 * Renamed from TUIMode to reflect actual responsibility.
 */
/**
 * @file Interface implementation: interactive-terminal-application.
 */

import { Box, Text, useInput } from 'ink';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  ErrorMessage,
  Header,
  InteractiveFooter,
  SwarmSpinner,
  type SwarmStatus,
} from './components/index/index.js';
import {
  ADRManager,
  CommandPalette,
  FileBrowser,
  Help,
  LogsViewer,
  MainMenu,
  MCPServers,
  MCPTester,
  NixManager,
  PerformanceMonitor,
  type ScreenType,
  ScreenUtils,
  Settings,
  Status,
  type SwarmAgent,
  SwarmDashboard,
  type SwarmMetrics,
  type SwarmTask,
  Workspace,
} from './screens/index/index.js';

export interface TUIModeProps {
  flags: Record<string, unknown>;
  onExit: (code: number) => void;
}

interface TUIState {
  currentScreen: ScreenType;
  isInitializing: boolean;
  error?: Error;
  swarmStatus: SwarmStatus;
  swarmMetrics: SwarmMetrics;
  agents: SwarmAgent[];
  tasks: SwarmTask[];
}

/**
 * Interactive Terminal Application Component.
 *
 * Manages multi-screen terminal interface with real-time updates and user interaction.
 * Coordinates between different screens and manages application state.
 *
 * @param root0
 * @param root0.flags
 * @param root0.onExit
 */
export const InteractiveTerminalApplication: React.FC<TUIModeProps> = ({
  flags,
  onExit,
}) => {
  const [state, setState] = useState<TUIState>({
    currentScreen: 'main-menu',
    isInitializing: true,
    swarmStatus: {
      status: 'initializing',
      topology: 'mesh',
      totalAgents: 0,
      activeAgents: 0,
      uptime: 0,
    },
    swarmMetrics: {
      totalAgents: 0,
      activeAgents: 0,
      tasksInProgress: 0,
      tasksCompleted: 0,
      totalTasks: 0,
      uptime: 0,
      performance: {
        throughput: 0,
        errorRate: 0,
        avgLatency: 0,
      },
    },
    agents: [],
    tasks: [],
  });

  const initializeTUI = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isInitializing: true }));

      // Store start time for proper uptime calculation
      const startTime = Date.now();

      // Check for real swarm integration
      const swarmModule = await import(
        '../../coordination/swarm/index.ts'
      ).catch(() => null);
      let realAgents: SwarmAgent[] = [];

      if (swarmModule?.SwarmManager) {
        try {
          const swarmManager = new swarmModule.SwarmManager();
          const swarmData = await swarmManager.getStatus().catch(() => null);
          realAgents = swarmData?.agents || [];
        } catch (error) {
          console.error('Failed to load swarm data:', error);
        }
      }

      // Get real tasks from swarm or system
      let realTasks: SwarmTask[] = [];

      if (swarmModule?.SwarmManager) {
        try {
          const swarmManager = new swarmModule.SwarmManager();
          const taskData = await swarmManager.getTasks().catch(() => null);
          realTasks = taskData || [];
        } catch (error) {
          console.error('Failed to load task data:', error);
        }
      }

      setState((prev) => ({
        ...prev,
        isInitializing: false,
        swarmStatus: {
          status: realAgents.length > 0 ? 'active' : 'idle',
          topology: 'mesh',
          totalAgents: realAgents.length,
          activeAgents: realAgents.filter(
            (a) => a.status === 'active' || a.status === 'busy'
          ).length,
          uptime: startTime,
        },
        swarmMetrics: {
          totalAgents: realAgents.length,
          activeAgents: realAgents.filter(
            (a) => a.status === 'active' || a.status === 'busy'
          ).length,
          tasksInProgress: realTasks.filter((t) => t.status === 'in_progress')
            .length,
          tasksCompleted: realTasks.filter((t) => t.status === 'completed')
            .length,
          totalTasks: realTasks.length,
          uptime: startTime,
          performance: {
            throughput: 0,
            errorRate: 0,
            avgLatency: 0,
          },
        },
        agents: realAgents,
        tasks: realTasks,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isInitializing: false,
        error: error as Error,
      }));
    }
  }, []);

  const updateState = useCallback(async () => {
    // Update real-time metrics from actual system data
    try {
      const swarmModule = await import(
        '../../coordination/swarm/index.ts'
      ).catch(() => null);

      if (swarmModule?.SwarmManager) {
        const swarmManager = new swarmModule.SwarmManager();
        const [swarmData, taskData, metricsData] = await Promise.all([
          swarmManager.getStatus().catch(() => null),
          swarmManager.getTasks().catch(() => null),
          swarmManager.getMetrics().catch(() => null),
        ]);

        setState((prev) => ({
          ...prev,
          agents: swarmData?.agents || [],
          tasks: taskData || [],
          swarmStatus: {
            ...prev.swarmStatus,
            totalAgents: swarmData?.agents?.length || 0,
            activeAgents:
              swarmData?.agents?.filter((a: unknown) => a.status === 'active')
                ?.length || 0,
            status: swarmData?.agents?.length > 0 ? 'active' : 'idle',
          },
          swarmMetrics: {
            ...prev.swarmMetrics,
            totalAgents: swarmData?.agents?.length || 0,
            activeAgents:
              swarmData?.agents?.filter((a: unknown) => a.status === 'active')
                ?.length || 0,
            tasksInProgress:
              taskData?.filter((t: unknown) => t.status === 'in_progress')
                ?.length || 0,
            tasksCompleted:
              taskData?.filter((t: unknown) => t.status === 'completed')?.length ||
              0,
            totalTasks: taskData?.length || 0,
            performance: metricsData?.performance || {
              throughput: 0,
              errorRate: 0,
              avgLatency: 0,
            },
          },
        }));
      }
    } catch (error) {
      console.error('Failed to update state with real data:', error);
    }
  }, []);

  // Initialize TUI on mount
  useEffect(() => {
    initializeTUI();

    // Set up auto-refresh for real-time updates
    const refreshInterval = setInterval(updateState, 3000);

    return () => clearInterval(refreshInterval);
  }, []); // Remove dependencies to prevent infinite loop

  // Global keyboard shortcuts
  useInput((input, key) => {
    if (key.escape && state.currentScreen !== 'main-menu') {
      navigateToScreen('main-menu');
    }
  });

  const navigateToScreen = (screen: ScreenType) => {
    // Check if screen requires swarm and swarm is available
    if (
      ScreenUtils.isSwarmRequired(screen) &&
      state.swarmStatus.status !== 'active'
    ) {
      setState((prev) => ({
        ...prev,
        error: new Error(`Screen "${screen}" requires an active swarm`),
      }));
      return;
    }

    setState((prev: TUIState) => ({
      ...prev,
      currentScreen: screen,
      error: undefined, // Clear any previous errors
    }));
  };

  const handleMainMenuSelect = (value: string) => {
    switch (value) {
      case 'command-palette':
        navigateToScreen('command-palette');
        break;
      case 'logs-viewer':
        navigateToScreen('logs-viewer');
        break;
      case 'performance-monitor':
        navigateToScreen('performance-monitor');
        break;
      case 'file-browser':
        navigateToScreen('file-browser');
        break;
      case 'mcp-tester':
        navigateToScreen('mcp-tester');
        break;
      case 'status':
        navigateToScreen('status');
        break;
      case 'swarm':
        navigateToScreen('swarm-dashboard');
        break;
      case 'mcp':
        navigateToScreen('mcp-servers');
        break;
      case 'workspace':
        navigateToScreen('workspace');
        break;
      case 'settings':
        navigateToScreen('settings');
        break;
      case 'help':
        navigateToScreen('help');
        break;
      case 'document-ai':
        navigateToScreen('document-ai');
        break;
      case 'adr-manager':
        navigateToScreen('adr-manager');
        break;
      case 'nix-manager':
        navigateToScreen('nix-manager');
        break;
      default:
        break;
    }
  };

  const renderCurrentScreen = () => {
    if (state.error) {
      return (
        <ErrorMessage
          error={state.error}
          title="TUI Error"
          showStack={flags['verbose']}
          actions={[
            { key: 'Esc', action: 'Main Menu' },
            { key: 'Q', action: 'Quit' },
          ]}
        />
      );
    }

    if (state.isInitializing) {
      return (
        <Box
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height={20}
        >
          <SwarmSpinner type="swarm" text="Initializing TUI interface..." />
        </Box>
      );
    }

    switch (state.currentScreen) {
      case 'main-menu':
        return (
          <MainMenu
            title="Claude Code Zen"
            swarmStatus={state.swarmStatus}
            onSelect={handleMainMenuSelect}
            onExit={() => onExit(0)}
            showHeader={true}
            showFooter={true}
          />
        );

      case 'swarm-dashboard':
        return (
          <SwarmDashboard
            swarmStatus={state.swarmStatus}
            metrics={state.swarmMetrics}
            agents={state.agents}
            tasks={state.tasks}
            onNavigate={navigateToScreen}
            onExit={() => onExit(0)}
            showHeader={true}
          />
        );

      case 'mcp-servers':
        return (
          <MCPServers
            swarmStatus={state.swarmStatus}
            onBack={() => navigateToScreen('main-menu')}
            onExit={() => onExit(0)}
          />
        );

      case 'workspace':
        return (
          <Workspace
            swarmStatus={state.swarmStatus}
            onBack={() => navigateToScreen('main-menu')}
            onExit={() => onExit(0)}
          />
        );

      // New essential TUI screens
      case 'command-palette':
        return (
          <CommandPalette
            swarmStatus={state.swarmStatus}
            onBack={() => navigateToScreen('main-menu')}
            onExit={() => onExit(0)}
          />
        );

      case 'logs-viewer':
        return (
          <LogsViewer
            swarmStatus={state.swarmStatus}
            onBack={() => navigateToScreen('main-menu')}
            onExit={() => onExit(0)}
          />
        );

      case 'performance-monitor':
        return (
          <PerformanceMonitor
            swarmStatus={state.swarmStatus}
            onBack={() => navigateToScreen('main-menu')}
            onExit={() => onExit(0)}
          />
        );

      case 'file-browser':
        return (
          <FileBrowser
            swarmStatus={state.swarmStatus}
            onBack={() => navigateToScreen('main-menu')}
            onExit={() => onExit(0)}
          />
        );

      case 'mcp-tester':
        return (
          <MCPTester
            swarmStatus={state.swarmStatus}
            onBack={() => navigateToScreen('main-menu')}
            onExit={() => onExit(0)}
          />
        );

      // Other screens with placeholder implementations
      case 'agent-manager':
        return (
          <Box flexDirection="column">
            <Text color="blue">🤖 Agent Manager</Text>
            <Text>Agent management interface coming soon...</Text>
            <Text color="gray">Press 'q' to return to main menu</Text>
          </Box>
        );
      case 'task-manager':
        return (
          <Box flexDirection="column">
            <Text color="green">📋 Task Manager</Text>
            <Text>Task management interface coming soon...</Text>
            <Text color="gray">Press 'q' to return to main menu</Text>
          </Box>
        );
      case 'settings':
        return (
          <Settings
            swarmStatus={state.swarmStatus}
            onBack={() => navigateToScreen('main-menu')}
            onExit={() => onExit(0)}
          />
        );
      case 'help':
        return (
          <Help
            swarmStatus={state.swarmStatus}
            onBack={() => navigateToScreen('main-menu')}
            onExit={() => onExit(0)}
          />
        );
      case 'status':
        return (
          <Status
            swarmStatus={state.swarmStatus}
            onBack={() => navigateToScreen('main-menu')}
            onExit={() => onExit(0)}
          />
        );

      case 'document-ai':
        return (
          <Box flexDirection="column" height="100%">
            <Header
              title="Document AI - Analysis & Rewriting"
              swarmStatus={state.swarmStatus}
              showBorder={true}
            />
            <Box flexGrow={1} padding={2}>
              <Box flexDirection="column">
                <Text bold color="cyan">
                  🤖 AI-Powered Document Intelligence
                </Text>
                <Box marginY={1} />

                <Box borderStyle="single" borderColor="yellow" padding={2}>
                  <Text bold color="yellow">
                    📝 Document Analysis Features:
                  </Text>
                  <Box flexDirection="column" marginTop={1}>
                    <Text>
                      • Read any document type (README, specs, docs, etc.)
                    </Text>
                    <Text>• Analyze structure, clarity, and completeness</Text>
                    <Text>• Suggest improvements and rewrites</Text>
                    <Text>• Recommend optimal organization and placement</Text>
                    <Text>• Extract key insights and action items</Text>
                  </Box>
                </Box>

                <Box
                  marginTop={2}
                  borderStyle="single"
                  borderColor="blue"
                  padding={2}
                >
                  <Text bold color="blue">
                    🔄 Workflow:
                  </Text>
                  <Box flexDirection="column" marginTop={1}>
                    <Text>1. Select document or directory to analyze</Text>
                    <Text>2. AI reads and understands content</Text>
                    <Text>3. Provides rewrite suggestions with reasoning</Text>
                    <Text>4. User can approve, reject, or comment</Text>
                    <Text>
                      5. AI learns from feedback for better suggestions
                    </Text>
                  </Box>
                </Box>

                <Box marginTop={2}>
                  <Text color="gray">
                    Press 'Esc' or 'Q' to return to main menu
                  </Text>
                </Box>
              </Box>
            </Box>
            <InteractiveFooter
              currentScreen="Document AI"
              availableScreens={[{ key: 'Esc/Q', name: 'Back' }]}
              status="Ready to analyze documents"
            />
          </Box>
        );

      case 'adr-manager':
        return (
          <ADRManager
            swarmStatus={state.swarmStatus}
            onBack={() => navigateToScreen('main-menu')}
            onExit={() => onExit(0)}
          />
        );

      case 'nix-manager':
        return (
          <NixManager
            swarmStatus={state.swarmStatus}
            onBack={() => navigateToScreen('main-menu')}
            onExit={() => onExit(0)}
          />
        );

      case 'create-agent':
        return (
          <Box flexDirection="column">
            <Text color="blue">➕ Create Agent</Text>
            <Text>Agent creation interface coming soon...</Text>
            <Text color="gray">Press 'q' to return to main menu</Text>
          </Box>
        );
      case 'create-task':
        return (
          <Box padding={2}>
            <ErrorMessage
              error={`Screen "${state.currentScreen}" is not yet implemented`}
              title="Coming Soon"
              variant="warning"
              actions={[{ key: 'Esc', action: 'Back to Main Menu' }]}
            />
          </Box>
        );

      default:
        return (
          <ErrorMessage
            error={`Unknown screen: ${state.currentScreen}`}
            title="Navigation Error"
            actions={[{ key: 'Esc', action: 'Main Menu' }]}
          />
        );
    }
  };

  return (
    <Box flexDirection="column" height="100%">
      {renderCurrentScreen()}
    </Box>
  );
};

export default InteractiveTerminalApplication;
