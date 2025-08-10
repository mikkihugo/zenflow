/**
 * Interactive Terminal Application - Google Standard Component.
 *
 * Full-featured interactive terminal interface with real-time updates.
 * Manages multiple screens and provides rich user interaction.
 * Renamed from TUIMode to reflect actual responsibility.
 */
/**
 * @file Interface implementation: interactive-terminal-application
 */



import { Box, Text, useInput } from 'ink';
import { useEffect, useState } from 'react';
import { ErrorMessage, SwarmSpinner } from './components/index';
import { MainMenu, ScreenUtils, SwarmDashboard } from './screens/index';

export interface TUIModeProps {
  flags: Record<string, any>;
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
export const InteractiveTerminalApplication: React.FC<TUIModeProps> = ({ flags, onExit }) => {
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

  const initializeTUI = async () => {
    try {
      setState((prev) => ({ ...prev, isInitializing: true }));

      // Simulate swarm initialization
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Initialize with mock data (replace with actual swarm integration)
      const mockAgents: SwarmAgent[] = [
        {
          id: 'coordinator-1',
          role: 'coordinator',
          status: 'active',
          capabilities: ['coordination', 'planning', 'monitoring'],
          lastActivity: new Date(),
          metrics: {
            tasksCompleted: 15,
            averageResponseTime: 150,
            errors: 0,
            successRate: 1.0,
            totalTasks: 15,
          },
          cognitivePattern: 'systems-thinking',
          performanceScore: 0.95,
        },
        {
          id: 'worker-1',
          role: 'worker',
          status: 'busy',
          capabilities: ['execution', 'analysis'],
          lastActivity: new Date(),
          metrics: {
            tasksCompleted: 8,
            averageResponseTime: 200,
            errors: 1,
            successRate: 0.89,
            totalTasks: 9,
          },
          cognitivePattern: 'convergent',
          performanceScore: 0.87,
        },
        {
          id: 'worker-2',
          role: 'worker',
          status: 'active',
          capabilities: ['execution', 'optimization'],
          lastActivity: new Date(),
          metrics: {
            tasksCompleted: 12,
            averageResponseTime: 180,
            errors: 0,
            successRate: 1.0,
            totalTasks: 12,
          },
          cognitivePattern: 'creative',
          performanceScore: 0.92,
        },
      ];

      const mockTasks: SwarmTask[] = [
        {
          id: 'task-1',
          description: 'Process documentation workflow',
          status: 'in_progress',
          progress: 65,
          assignedAgents: ['coordinator-1', 'worker-1'],
          priority: 'high',
          startTime: new Date(Date.now() - 300000),
          estimatedDuration: 600000,
        },
        {
          id: 'task-2',
          description: 'Optimize neural network training',
          status: 'completed',
          progress: 100,
          assignedAgents: ['worker-2'],
          priority: 'medium',
          startTime: new Date(Date.now() - 600000),
          endTime: new Date(Date.now() - 60000),
        },
        {
          id: 'task-3',
          description: 'Generate API documentation',
          status: 'pending',
          progress: 0,
          assignedAgents: [],
          priority: 'low',
        },
      ];

      setState((prev) => ({
        ...prev,
        isInitializing: false,
        swarmStatus: {
          status: 'active',
          topology: 'mesh',
          totalAgents: mockAgents.length,
          activeAgents: mockAgents.filter((a) => a.status === 'active' || a.status === 'busy')
            .length,
          uptime: Date.now(),
        },
        swarmMetrics: {
          totalAgents: mockAgents.length,
          activeAgents: mockAgents.filter((a) => a.status === 'active' || a.status === 'busy')
            .length,
          tasksInProgress: mockTasks.filter((t) => t.status === 'in_progress').length,
          tasksCompleted: mockTasks.filter((t) => t.status === 'completed').length,
          totalTasks: mockTasks.length,
          uptime: Date.now(),
          performance: {
            throughput: 2.5,
            errorRate: 0.05,
            avgLatency: 175,
          },
        },
        agents: mockAgents,
        tasks: mockTasks,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isInitializing: false,
        error: error as Error,
      }));
    }
  };

  const updateState = async () => {
    // Update real-time metrics (simulate)
    setState((prev) => ({
      ...prev,
      swarmStatus: {
        ...prev.swarmStatus,
        uptime: Date.now() - prev.swarmStatus.uptime,
      },
      swarmMetrics: {
        ...prev.swarmMetrics,
        uptime: Date.now() - prev.swarmMetrics.uptime,
        performance: {
          ...prev.swarmMetrics.performance,
          throughput: 2.0 + Math.random() * 1.5,
          avgLatency: 150 + Math.random() * 100,
        },
      },
    }));
  };

  // Initialize TUI on mount
  useEffect(() => {
    initializeTUI();

    // Set up auto-refresh for real-time updates
    const refreshInterval = setInterval(updateState, 3000);

    return () => clearInterval(refreshInterval);
  }, [initializeTUI, updateState]);

  // Global keyboard shortcuts
  useInput((input, key) => {
    if (key.escape && state.currentScreen !== 'main-menu') {
      navigateToScreen('main-menu');
    }
  });

  const navigateToScreen = (screen: ScreenType) => {
    // Check if screen requires swarm and swarm is available
    if (ScreenUtils.isSwarmRequired(screen) && state.swarmStatus.status !== 'active') {
      setState((prev) => ({
        ...prev,
        error: new Error(`Screen "${screen}" requires an active swarm`),
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      currentScreen: screen,
      error: undefined, // Clear any previous errors
    }));
  };

  const handleMainMenuSelect = (value: string) => {
    switch (value) {
      case 'status':
        navigateToScreen('status');
        break;
      case 'swarm':
        navigateToScreen('swarm-dashboard');
        break;
      case 'mcp':
        // Handle MCP management
        break;
      case 'workspace':
        // Handle workspace management
        break;
      case 'settings':
        navigateToScreen('settings');
        break;
      case 'help':
        navigateToScreen('help');
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
          showStack={flags.verbose}
          actions={[
            { key: 'Esc', action: 'Main Menu' },
            { key: 'Q', action: 'Quit' },
          ]}
        />
      );
    }

    if (state.isInitializing) {
      return (
        <Box flexDirection="column" alignItems="center" justifyContent="center" height={20}>
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
          <Box flexDirection="column">
            <Text color="yellow">⚙️ Settings</Text>
            <Text>System settings interface coming soon...</Text>
            <Text color="gray">Press 'q' to return to main menu</Text>
          </Box>
        );
      case 'help':
        return (
          <Box flexDirection="column">
            <Text color="cyan">❓ Help</Text>
            <Text>Help documentation interface coming soon...</Text>
            <Text color="gray">Press 'q' to return to main menu</Text>
          </Box>
        );
      case 'status':
        return (
          <Box flexDirection="column">
            <Text color="magenta">📊 System Status</Text>
            <Text>System status interface coming soon...</Text>
            <Text color="gray">Press 'q' to return to main menu</Text>
          </Box>
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
