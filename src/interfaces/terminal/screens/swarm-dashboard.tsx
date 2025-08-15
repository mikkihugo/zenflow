/**
 * Swarm Dashboard Screen.
 *
 * Real-time swarm monitoring and management interface.
 * Consolidates swarm functionality from TUI interface.
 */
/**
 * @file Interface implementation: swarm-dashboard.
 */

import { Box, Text, useInput } from 'ink';
import React from 'react';
import { useEffect, useState } from 'react';
import {
  AgentProgress,
  Header,
  InteractiveFooter,
  StatusBadge,
  SwarmSpinner,
  TaskProgress,
} from '../components/index/index.js';
import { formatUptimeFromStart } from '../utils/time-utils.js';

export interface SwarmAgent {
  id: string;
  role: 'coordinator' | 'worker' | 'specialist';
  status: 'active' | 'idle' | 'busy' | 'error';
  capabilities: string[];
  lastActivity: Date;
  metrics: {
    tasksCompleted: number;
    averageResponseTime: number;
    errors: number;
    successRate: number;
    totalTasks: number;
  };
  cognitivePattern: string;
  performanceScore: number;
}

export interface SwarmTask {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  assignedAgents: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  startTime?: Date;
  endTime?: Date;
  estimatedDuration?: number;
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

export interface SwarmDashboardProps {
  swarmStatus: SwarmStatus;
  metrics: SwarmMetrics;
  agents: SwarmAgent[];
  tasks?: SwarmTask[];
  onNavigate: (screen: string) => void;
  onExit: () => void;
  showHeader?: boolean;
}

/**
 * Swarm Dashboard Screen Component.
 *
 * Provides real-time monitoring of swarm activities.
 *
 * @param root0
 * @param root0.swarmStatus
 * @param root0.metrics
 * @param root0.agents
 * @param root0.tasks
 * @param root0.onNavigate
 * @param root0.onExit
 * @param root0.showHeader
 */
export const SwarmDashboard: React.FC<SwarmDashboardProps> = ({
  swarmStatus,
  metrics,
  agents,
  tasks = [],
  onNavigate,
  onExit,
  showHeader = true,
}) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedSection, setSelectedSection] = useState<
    'overview' | 'agents' | 'tasks'
  >('overview');

  // Auto-refresh every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Handle keyboard navigation
  useInput((input, key) => {
    if (key.escape || input === 'q' || input === 'Q') {
      onExit();
    }

    switch (input) {
      case '1':
        setSelectedSection('overview');
        break;
      case '2':
        onNavigate('agents');
        break;
      case '3':
        onNavigate('tasks');
        break;
      case '4':
        onNavigate('create-agent');
        break;
      case '5':
        onNavigate('create-task');
        break;
      case '6':
        onNavigate('settings');
        break;
      case 'r':
      case 'R':
        setRefreshKey((prev) => prev + 1);
        break;
    }
  });

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'active':
        return '🟢';
      case 'idle':
        return '🟡';
      case 'busy':
        return '🔵';
      case 'error':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const renderOverview = () => (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      {/* Swarm Status */}
      <Box marginBottom={2}>
        <Text bold color="cyan" wrap="wrap">
          🐝 Swarm Status Overview
        </Text>
      </Box>

      <Box flexDirection="row" marginBottom={3}>
        <Box flexDirection="column" width="50%">
          <Box marginBottom={1}>
            <StatusBadge
              status={swarmStatus.status}
              text={`Swarm ${swarmStatus.status.toUpperCase()}`}
              variant="full"
            />
          </Box>

          <Text>
            🔗 Topology: <Text color="cyan">{swarmStatus.topology}</Text>
          </Text>
          <Text>
            ⏱️ Uptime:{' '}
            <Text color="green">
              {formatUptimeFromStart(swarmStatus.uptime)}
            </Text>
          </Text>
          <Text>
            🎯 Throughput:{' '}
            <Text color="yellow">
              {metrics.performance.throughput.toFixed(1)} ops/sec
            </Text>
          </Text>
          <Text>
            📊 Error Rate:{' '}
            <Text color={metrics.performance.errorRate > 0.1 ? 'red' : 'green'}>
              {(metrics.performance.errorRate * 100).toFixed(1)}%
            </Text>
          </Text>
        </Box>

        <Box flexDirection="column" width="50%">
          <AgentProgress
            active={metrics.activeAgents}
            total={metrics.totalAgents}
            label="Active Agents"
          />

          <Box marginTop={1}>
            <TaskProgress
              completed={metrics.tasksCompleted}
              total={metrics.totalTasks}
              label="Tasks Progress"
            />
          </Box>
        </Box>
      </Box>

      {/* Quick Agent Status */}
      <Box marginBottom={1}>
        <Text bold>👥 Agent Status Summary:</Text>
      </Box>

      <Box flexDirection="column" marginLeft={2}>
        {agents.slice(0, 5).map((agent) => (
          <Box key={agent.id} marginBottom={0}>
            <Text>
              {getStatusIcon(agent.status)}
              <Text color="cyan">{agent.id}</Text>
              <Text color="gray"> ({agent.role})</Text>
              <Text> - {agent.metrics.tasksCompleted} tasks completed</Text>
            </Text>
          </Box>
        ))}

        {agents.length > 5 && (
          <Text color="gray">... and {agents.length - 5} more agents</Text>
        )}
      </Box>

      {/* Recent Tasks */}
      {tasks.length > 0 && (
        <Box marginTop={1}>
          <Text bold>📋 Recent Tasks:</Text>
          <Box flexDirection="column" marginLeft={2}>
            {tasks.slice(0, 3).map((task) => (
              <Box key={task.id} marginBottom={0}>
                <Text>
                  {task.status === 'completed'
                    ? '✅'
                    : task.status === 'in_progress'
                      ? '🔄'
                      : '⏳'}
                  <Text>{task.description}</Text>
                  <Text color="gray"> ({task.progress}%)</Text>
                </Text>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <Box flexDirection="column" height="100%">
      {/* Header - starts at very top */}
      {showHeader && (
        <Header
          title="Swarm Dashboard"
          swarmStatus={swarmStatus}
          mode="swarm"
          showBorder={true}
        />
      )}

      {/* Main content with more spacing */}
      <Box flexGrow={1} paddingX={2} paddingY={1}>
        {swarmStatus.status === 'initializing' ? (
          <Box
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
          >
            <SwarmSpinner
              type="swarm"
              text="Initializing swarm coordination..."
            />
          </Box>
        ) : (
          renderOverview()
        )}
      </Box>

      {/* Footer - fixed at bottom */}
      <Box marginTop={1}>
        <InteractiveFooter
          currentScreen="Swarm Dashboard"
          availableScreens={[
            { key: '2', name: 'Agents' },
            { key: '3', name: 'Tasks' },
            { key: '4', name: 'New Agent' },
            { key: '5', name: 'New Task' },
            { key: '6', name: 'Settings' },
            { key: 'R', name: 'Refresh' },
          ]}
          status={`${metrics.activeAgents}/${metrics.totalAgents} agents • ${metrics.tasksInProgress} tasks in progress`}
        />
      </Box>
    </Box>
  );
};

export default SwarmDashboard;
