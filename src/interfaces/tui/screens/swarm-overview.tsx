import { Box, Text, useFocus, useInput } from 'ink';
import type React from 'react';
import { useEffect, useState } from 'react';
import { SwarmHeader, SwarmProgressBar, SwarmSpinner, SwarmStatusBadge } from '../components';
import type { SwarmAgent, SwarmMetrics, SwarmStatus } from '../types';

export interface SwarmOverviewProps {
  swarmStatus?: SwarmStatus;
  metrics?: SwarmMetrics;
  agents?: SwarmAgent[];
  refreshInterval?: number;
  onRefresh?: () => Promise<void>;
  onExit?: () => void;
  onNavigate?: (screen: string) => void;
  showHeader?: boolean;
  title?: string;
}

/**
 * SwarmOverview Screen - Main swarm dashboard overview
 *
 * Displays high-level swarm status, key metrics, and agent summaries.
 * Optimized for swarm coordination monitoring and quick status assessment.
 */
export const SwarmOverview: React.FC<SwarmOverviewProps> = ({
  swarmStatus,
  metrics,
  agents = [],
  refreshInterval = 5000,
  onRefresh,
  onExit,
  onNavigate,
  showHeader = true,
  title = 'Swarm Overview',
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { isFocused } = useFocus({ autoFocus: true });

  // Auto-refresh swarm data
  useEffect(() => {
    if (!onRefresh) return;

    const interval = setInterval(async () => {
      if (!isRefreshing) {
        await handleRefresh();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, onRefresh, isRefreshing]);

  // Handle keyboard navigation
  useInput((input, key) => {
    if (!isFocused) return;

    if (input === '1') {
      onNavigate?.('agents');
    } else if (input === '2') {
      onNavigate?.('tasks');
    } else if (input === '3') {
      onNavigate?.('metrics');
    } else if (input === '4') {
      onNavigate?.('coordination');
    } else if (input === 'r' || key.f5) {
      handleRefresh();
    } else if (key.escape || input === 'q') {
      onExit?.();
    }
  });

  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to refresh swarm data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderSystemStatus = () => {
    if (!swarmStatus) {
      return (
        <Box>
          <Text dimColor>Swarm status unavailable</Text>
        </Box>
      );
    }

    return (
      <Box flexDirection="column" marginBottom={2}>
        <Text bold color="cyan">
          🐝 Swarm System Status
        </Text>
        <Box marginTop={1}>
          <SwarmStatusBadge
            status={swarmStatus.status}
            variant="detailed"
            agentCount={swarmStatus.activeAgents}
          />
          <Text dimColor marginLeft={2}>
            Topology: {swarmStatus.topology} • Uptime: {formatUptime(swarmStatus.uptime)}
          </Text>
        </Box>
      </Box>
    );
  };

  const renderKeyMetrics = () => {
    if (!metrics) {
      return (
        <Box>
          <Text dimColor>Metrics unavailable</Text>
        </Box>
      );
    }

    const progressPercentage =
      metrics.totalTasks > 0 ? (metrics.completedTasks / metrics.totalTasks) * 100 : 0;

    return (
      <Box flexDirection="column" marginBottom={2}>
        <Text bold color="cyan">
          📊 Key Performance Metrics
        </Text>

        {/* Overall Progress */}
        <Box marginTop={1}>
          <SwarmProgressBar
            current={metrics.completedTasks}
            total={metrics.totalTasks}
            showPercentage
            showNumbers
            label="Overall Progress"
            width={50}
          />
        </Box>

        {/* Metrics Grid */}
        <Box flexDirection="column" marginTop={1}>
          <Box>
            <Text>🤖 Agents: </Text>
            <Text color="green">{metrics.activeAgents}</Text>
            <Text dimColor>/{metrics.totalAgents} active</Text>
          </Box>

          <Box>
            <Text>📋 Tasks: </Text>
            <Text color="yellow">{metrics.tasksInProgress}</Text>
            <Text dimColor> in progress, </Text>
            <Text color="green">{metrics.completedTasks}</Text>
            <Text dimColor> completed</Text>
          </Box>

          <Box>
            <Text>⚡ Throughput: </Text>
            <Text color="cyan">{metrics.performance.throughput.toFixed(1)}</Text>
            <Text dimColor> tasks/min</Text>
          </Box>

          <Box>
            <Text>📈 Success Rate: </Text>
            <Text color="green">{((1 - metrics.performance.errorRate) * 100).toFixed(1)}%</Text>
          </Box>
        </Box>
      </Box>
    );
  };

  const renderAgentSummary = () => {
    const topAgents = agents
      .sort((a, b) => b.metrics.tasksCompleted - a.metrics.tasksCompleted)
      .slice(0, 5);

    if (topAgents.length === 0) {
      return (
        <Box>
          <Text dimColor>No active agents</Text>
        </Box>
      );
    }

    return (
      <Box flexDirection="column" marginBottom={2}>
        <Text bold color="cyan">
          🏆 Top Performing Agents
        </Text>

        {topAgents.map((agent) => (
          <Box key={agent.id} marginTop={1}>
            <SwarmStatusBadge status={agent.status} text={agent.id} variant="minimal" />
            <Text dimColor marginLeft={2}>
              {agent.metrics.tasksCompleted} tasks • {agent.metrics.averageResponseTime.toFixed(0)}
              ms avg
            </Text>
          </Box>
        ))}

        {agents.length > 5 && (
          <Text dimColor marginTop={1}>
            ... and {agents.length - 5} more agents
          </Text>
        )}
      </Box>
    );
  };

  const formatUptime = (uptime: number): string => {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <Box flexDirection="column" height="100%">
      {showHeader && (
        <SwarmHeader
          title={title}
          subtitle={`Last updated: ${lastRefresh.toLocaleTimeString()}`}
          swarmStatus={swarmStatus}
        />
      )}

      {/* Navigation Hint */}
      <Box marginBottom={1} paddingX={2}>
        <Text color="gray">
          [1] Agents [2] Tasks [3] Metrics [4] Coordination [r] Refresh [q] Quit
        </Text>
        {isRefreshing && (
          <Box marginLeft={2}>
            <SwarmSpinner type="coordination" text="Refreshing..." color="yellow" />
          </Box>
        )}
      </Box>

      {/* Main Content */}
      <Box flexDirection="column" paddingX={2} flexGrow={1}>
        {renderSystemStatus()}
        {renderKeyMetrics()}
        {renderAgentSummary()}
      </Box>
    </Box>
  );
};

export default SwarmOverview;
