import { Box, Text, useFocus, useInput } from 'ink';
import React from 'react';
import { useEffect, useState } from 'react';
import { Footer, Header, ProgressBar, Spinner, StatusBadge } from '../components';
import { UIUtils } from '../index';
import type { BaseScreenProps } from './index';

export interface SwarmAgent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'idle' | 'error' | 'stopped';
  tasksCompleted: number;
  currentTask?: string;
  lastActivity: Date;
  performance: {
    successRate: number;
    avgResponseTime: number;
    totalTasks: number;
  };
}

export interface SwarmMetrics {
  totalAgents: number;
  activeAgents: number;
  tasksInProgress: number;
  tasksCompleted: number;
  totalTasks: number;
  uptime: number;
  performance: {
    throughput: number;
    errorRate: number;
    avgLatency: number;
  };
}

export interface SwarmDashboardProps extends BaseScreenProps {
  agents?: SwarmAgent[];
  metrics?: SwarmMetrics;
  refreshInterval?: number;
  onRefresh?: () => Promise<void>;
  showDetails?: boolean;
  maxAgentsVisible?: number;
}

/**
 * SwarmDashboard Component
 *
 * Real-time dashboard for monitoring swarm status and metrics.
 * Displays agent information, performance metrics, and system health.
 */
export const SwarmDashboard: React.FC<SwarmDashboardProps> = ({
  agents = [],
  metrics,
  refreshInterval = 5000,
  onRefresh,
  onExit,
  onBack,
  title = 'Swarm Dashboard',
  showHeader = true,
  showFooter = true,
  showDetails = true,
  maxAgentsVisible = 8,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [selectedView, setSelectedView] = useState<'overview' | 'agents' | 'metrics'>('overview');
  const { isFocused } = useFocus({ autoFocus: true });

  // Auto-refresh data
  useEffect(() => {
    if (!onRefresh) return;

    const interval = setInterval(async () => {
      if (!isRefreshing) {
        await handleRefresh();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, onRefresh, isRefreshing]);

  // Handle keyboard input
  useInput((input, key) => {
    if (!isFocused) return;

    if (input === '1') {
      setSelectedView('overview');
    } else if (input === '2') {
      setSelectedView('agents');
    } else if (input === '3') {
      setSelectedView('metrics');
    } else if (input === 'r' || key.f5) {
      handleRefresh();
    } else if (key.escape || input === 'q') {
      onExit?.();
    } else if (key.backspace || input === 'b') {
      onBack?.();
    }
  });

  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderOverview = () => {
    if (!metrics) {
      return (
        <Box justifyContent="center" flexGrow={1}>
          <Text dimColor>No metrics available</Text>
        </Box>
      );
    }

    const progressPercentage =
      metrics.totalTasks > 0 ? (metrics.tasksCompleted / metrics.totalTasks) * 100 : 0;

    return (
      <Box flexDirection="column" paddingX={2}>
        {/* System Status */}
        <Box marginBottom={1}>
          <Text bold>System Status:</Text>
          <StatusBadge
            status={metrics.activeAgents > 0 ? 'success' : 'warning'}
            text={metrics.activeAgents > 0 ? 'Active' : 'Idle'}
            showIcon
          />
          <Text dimColor>
            {' • Uptime: '}
            {UIUtils.formatDuration(metrics.uptime)}
          </Text>
        </Box>

        {/* Progress */}
        <Box flexDirection="column" marginBottom={1}>
          <Text bold>Overall Progress</Text>
          <ProgressBar
            current={metrics.tasksCompleted}
            total={metrics.totalTasks}
            showPercentage
            showNumbers
            width={50}
          />
        </Box>

        {/* Key Metrics */}
        <Box flexDirection="column">
          <Text bold>Key Metrics</Text>
          <Text>
            • Agents: {metrics.activeAgents}/{metrics.totalAgents} active
          </Text>
          <Text>
            • Tasks: {metrics.tasksInProgress} in progress, {metrics.tasksCompleted} completed
          </Text>
          <Text>• Throughput: {metrics.performance.throughput.toFixed(1)} tasks/min</Text>
          <Text>• Error Rate: {(metrics.performance.errorRate * 100).toFixed(1)}%</Text>
          <Text>• Avg Latency: {metrics.performance.avgLatency.toFixed(0)}ms</Text>
        </Box>
      </Box>
    );
  };

  const renderAgents = () => {
    const visibleAgents = agents.slice(0, maxAgentsVisible);

    if (visibleAgents.length === 0) {
      return (
        <Box justifyContent="center" flexGrow={1}>
          <Text dimColor>No agents available</Text>
        </Box>
      );
    }

    return (
      <Box flexDirection="column" paddingX={2}>
        <Text bold marginBottom={1}>
          Active Agents ({visibleAgents.length})
        </Text>

        {visibleAgents.map((agent) => {
          const statusMap = {
            active: 'success' as const,
            idle: 'info' as const,
            error: 'error' as const,
            stopped: 'warning' as const,
          };

          return (
            <Box key={agent.id} flexDirection="column" marginBottom={1}>
              <Box>
                <Text bold>{agent.name}</Text>
                <Text dimColor>
                  {' ('}
                  {agent.type}
                  {')'}
                </Text>
                <StatusBadge
                  status={statusMap[agent.status]}
                  text={agent.status}
                  variant="minimal"
                />
              </Box>

              {showDetails && (
                <Box flexDirection="column" paddingLeft={2}>
                  <Text dimColor>• Tasks: {agent.tasksCompleted} completed</Text>
                  {agent.currentTask && (
                    <Text dimColor>• Current: {UIUtils.truncateText(agent.currentTask, 40)}</Text>
                  )}
                  <Text dimColor>
                    • Success Rate: {(agent.performance.successRate * 100).toFixed(1)}%
                  </Text>
                  <Text dimColor>
                    • Avg Response: {agent.performance.avgResponseTime.toFixed(0)}ms
                  </Text>
                </Box>
              )}
            </Box>
          );
        })}

        {agents.length > maxAgentsVisible && (
          <Text dimColor>... and {agents.length - maxAgentsVisible} more agents</Text>
        )}
      </Box>
    );
  };

  const renderMetrics = () => {
    if (!metrics) {
      return (
        <Box justifyContent="center" flexGrow={1}>
          <Text dimColor>No detailed metrics available</Text>
        </Box>
      );
    }

    return (
      <Box flexDirection="column" paddingX={2}>
        <Text bold marginBottom={1}>
          Detailed Metrics
        </Text>

        <Box flexDirection="column">
          <Text bold color="cyan">
            Resource Utilization
          </Text>
          <Text>
            • Active Agents: {((metrics.activeAgents / metrics.totalAgents) * 100).toFixed(1)}%
          </Text>
          <Text>• Task Queue: {metrics.tasksInProgress} pending</Text>

          <Text bold color="cyan" marginTop={1}>
            Performance
          </Text>
          <Text>• Throughput: {metrics.performance.throughput.toFixed(2)} tasks/min</Text>
          <Text>• Success Rate: {((1 - metrics.performance.errorRate) * 100).toFixed(1)}%</Text>
          <Text>• Average Latency: {metrics.performance.avgLatency.toFixed(0)}ms</Text>

          <Text bold color="cyan" marginTop={1}>
            System Health
          </Text>
          <Text>• Uptime: {UIUtils.formatDuration(metrics.uptime)}</Text>
          <Text>• Total Tasks Processed: {metrics.tasksCompleted.toLocaleString()}</Text>
        </Box>
      </Box>
    );
  };

  const renderCurrentView = () => {
    switch (selectedView) {
      case 'agents':
        return renderAgents();
      case 'metrics':
        return renderMetrics();
      default:
        return renderOverview();
    }
  };

  const shortcuts = [
    { key: '1/2/3', description: 'Switch views' },
    { key: 'r/F5', description: 'Refresh' },
    { key: 'b/Backspace', description: 'Back' },
    { key: 'q/Esc', description: 'Exit' },
  ];

  return (
    <Box flexDirection="column" height="100%">
      {showHeader && (
        <Header title={title} subtitle={`Last updated: ${lastRefresh.toLocaleTimeString()}`} />
      )}

      {/* View Tabs */}
      <Box marginBottom={1} paddingX={2}>
        {(['overview', 'agents', 'metrics'] as const).map((view) => (
          <Box key={view} marginRight={2}>
            <Text
              color={selectedView === view ? 'cyan' : 'gray'}
              bold={selectedView === view}
              inverse={selectedView === view}
            >
              {view === 'overview' ? '1' : view === 'agents' ? '2' : '3'}
              {'. '}
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </Text>
          </Box>
        ))}

        {isRefreshing && (
          <Box marginLeft={2}>
            <Spinner text="Refreshing..." type="dots" color="yellow" />
          </Box>
        )}
      </Box>

      {/* Main Content */}
      <Box flexDirection="column" flexGrow={1}>
        {renderCurrentView()}
      </Box>

      {showFooter && <Footer shortcuts={shortcuts} />}
    </Box>
  );
};

// Default export for convenience
export default SwarmDashboard;
