/**
 * Swarm Status State Hook
 *
 * React hook for managing swarm state and providing real-time updates.
 * Note: This is a React hook, NOT a Claude Code hook (which belongs in templates/).
 */

import { useEffect, useState } from 'react';
import type { SwarmAgent, SwarmMetrics, SwarmStatus, SwarmTask } from '../screens/index.js';
import { createSimpleLogger } from '../../../core/logger.js';

const logger = createSimpleLogger('SwarmStatusHook');

export interface SwarmState {
  status: SwarmStatus;
  metrics: SwarmMetrics;
  agents: SwarmAgent[];
  tasks: SwarmTask[];
  lastUpdated: Date;
}

export interface UseSwarmStatusOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableMockData?: boolean;
}

export interface UseSwarmStatusReturn {
  swarmState: SwarmState;
  isLoading: boolean;
  error?: Error;
  refreshStatus: () => Promise<void>;
  startAgent: (agentConfig: Partial<SwarmAgent>) => Promise<void>;
  stopAgent: (agentId: string) => Promise<void>;
  createTask: (taskConfig: Partial<SwarmTask>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<SwarmTask>) => Promise<void>;
}

const initialSwarmState: SwarmState = {
  status: {
    status: 'idle',
    topology: 'mesh',
    totalAgents: 0,
    activeAgents: 0,
    uptime: 0,
  },
  metrics: {
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
  lastUpdated: new Date(),
};

/**
 * Swarm Status React Hook
 *
 * Provides reactive swarm state management with real-time updates for React components.
 */
export const useSwarmStatus = (options: UseSwarmStatusOptions = {}): UseSwarmStatusReturn => {
  const {
    autoRefresh = true,
    refreshInterval = 3000,
    enableMockData = process.env.NODE_ENV === 'development',
  } = options;

  const [swarmState, setSwarmState] = useState<SwarmState>(initialSwarmState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  // Auto-refresh effect
  useEffect(() => {
    // Initial load
    refreshStatus();

    if (autoRefresh) {
      const interval = setInterval(refreshStatus, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const refreshStatus = async () => {
    try {
      setError(undefined);

      if (enableMockData) {
        // Use mock data for development
        await loadMockSwarmData();
      } else {
        // Load real swarm data
        await loadRealSwarmData();
      }

      logger.debug('Swarm status refreshed successfully');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to refresh swarm status');
      logger.error('Failed to refresh swarm status:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockSwarmData = async () => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    const mockAgents: SwarmAgent[] = [
      {
        id: 'coordinator-main',
        role: 'coordinator',
        status: 'active',
        capabilities: ['coordination', 'planning', 'monitoring', 'optimization'],
        lastActivity: new Date(Date.now() - 1000),
        metrics: {
          tasksCompleted: Math.floor(Math.random() * 20) + 10,
          averageResponseTime: 120 + Math.random() * 100,
          errors: Math.floor(Math.random() * 2),
          successRate: 0.95 + Math.random() * 0.05,
          totalTasks: Math.floor(Math.random() * 25) + 10,
        },
        cognitivePattern: 'systems-thinking',
        performanceScore: 0.9 + Math.random() * 0.1,
      },
      // Add more mock agents as needed
    ];

    const mockTasks: SwarmTask[] = [
      {
        id: 'task-doc-proc',
        description: 'Process document-driven development workflow',
        status: 'in_progress',
        progress: 40 + Math.random() * 40,
        assignedAgents: ['coordinator-main'],
        priority: 'high',
        startTime: new Date(Date.now() - 600000),
        estimatedDuration: 1200000,
      },
      // Add more mock tasks as needed
    ];

    const activeAgents = mockAgents.filter((a) => a.status === 'active' || a.status === 'busy');
    const uptime = Date.now() - (swarmState.status.uptime || Date.now() - 3600000);

    const newState: SwarmState = {
      status: {
        status: activeAgents.length > 0 ? 'active' : 'idle',
        topology: swarmState.status.topology,
        totalAgents: mockAgents.length,
        activeAgents: activeAgents.length,
        uptime,
      },
      metrics: {
        totalAgents: mockAgents.length,
        activeAgents: activeAgents.length,
        tasksInProgress: mockTasks.filter((t) => t.status === 'in_progress').length,
        tasksCompleted: mockTasks.filter((t) => t.status === 'completed').length,
        totalTasks: mockTasks.length,
        uptime,
        performance: {
          throughput: 1.5 + Math.random() * 2.0,
          errorRate: Math.random() * 0.1,
          avgLatency: 150 + Math.random() * 100,
        },
      },
      agents: mockAgents,
      tasks: mockTasks,
      lastUpdated: new Date(),
    };

    setSwarmState(newState);
  };

  const loadRealSwarmData = async () => {
    // TODO: Implement real swarm data loading
    // This would integrate with actual swarm service

    try {
      // Import swarm service when available
      // const { SwarmService } = await import('../../../coordination/services/swarm-service.js');
      // const swarmService = new SwarmService();
      // const realData = await swarmService.getStatus();

      // For now, fall back to mock data
      await loadMockSwarmData();
    } catch (err) {
      logger.warn('Real swarm service not available, using mock data');
      await loadMockSwarmData();
    }
  };

  const startAgent = async (agentConfig: Partial<SwarmAgent>) => {
    try {
      logger.debug('Starting agent:', agentConfig);

      // TODO: Implement real agent starting
      // For now, simulate by adding to mock data

      const newAgent: SwarmAgent = {
        id: agentConfig.id || `agent-${Date.now()}`,
        role: agentConfig.role || 'worker',
        status: 'active',
        capabilities: agentConfig.capabilities || ['general'],
        lastActivity: new Date(),
        metrics: {
          tasksCompleted: 0,
          averageResponseTime: 0,
          errors: 0,
          successRate: 1.0,
          totalTasks: 0,
        },
        cognitivePattern: agentConfig.cognitivePattern || 'adaptive',
        performanceScore: 1.0,
        ...agentConfig,
      };

      setSwarmState((prev) => ({
        ...prev,
        agents: [...prev.agents, newAgent],
        status: {
          ...prev.status,
          totalAgents: prev.status.totalAgents + 1,
          activeAgents: prev.status.activeAgents + 1,
        },
        metrics: {
          ...prev.metrics,
          totalAgents: prev.metrics.totalAgents + 1,
          activeAgents: prev.metrics.activeAgents + 1,
        },
        lastUpdated: new Date(),
      }));

      logger.debug('Agent started successfully:', newAgent.id);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start agent');
      logger.error('Failed to start agent:', error);
      throw error;
    }
  };

  const stopAgent = async (agentId: string) => {
    try {
      logger.debug('Stopping agent:', agentId);

      setSwarmState((prev) => ({
        ...prev,
        agents: prev.agents.map((agent) =>
          agent.id === agentId ? { ...agent, status: 'idle' as const } : agent
        ),
        status: {
          ...prev.status,
          activeAgents: Math.max(0, prev.status.activeAgents - 1),
        },
        metrics: {
          ...prev.metrics,
          activeAgents: Math.max(0, prev.metrics.activeAgents - 1),
        },
        lastUpdated: new Date(),
      }));

      logger.debug('Agent stopped successfully:', agentId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to stop agent');
      logger.error('Failed to stop agent:', error);
      throw error;
    }
  };

  const createTask = async (taskConfig: Partial<SwarmTask>) => {
    try {
      logger.debug('Creating task:', taskConfig);

      const newTask: SwarmTask = {
        id: taskConfig.id || `task-${Date.now()}`,
        description: taskConfig.description || 'New task',
        status: taskConfig.status || 'pending',
        progress: taskConfig.progress || 0,
        assignedAgents: taskConfig.assignedAgents || [],
        priority: taskConfig.priority || 'medium',
        startTime: taskConfig.status === 'in_progress' ? new Date() : undefined,
        ...taskConfig,
      };

      setSwarmState((prev) => ({
        ...prev,
        tasks: [...prev.tasks, newTask],
        metrics: {
          ...prev.metrics,
          totalTasks: prev.metrics.totalTasks + 1,
          tasksInProgress:
            newTask.status === 'in_progress'
              ? prev.metrics.tasksInProgress + 1
              : prev.metrics.tasksInProgress,
        },
        lastUpdated: new Date(),
      }));

      logger.debug('Task created successfully:', newTask.id);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create task');
      logger.error('Failed to create task:', error);
      throw error;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<SwarmTask>) => {
    try {
      logger.debug('Updating task:', taskId, updates);

      setSwarmState((prev) => {
        const oldTask = prev.tasks.find((t) => t.id === taskId);
        const newTasks = prev.tasks.map((task) =>
          task.id === taskId ? { ...task, ...updates } : task
        );

        // Recalculate metrics if status changed
        let metricsUpdate = {};
        if (oldTask && updates.status && oldTask.status !== updates.status) {
          const inProgressChange =
            (updates.status === 'in_progress' ? 1 : 0) - (oldTask.status === 'in_progress' ? 1 : 0);
          const completedChange =
            (updates.status === 'completed' ? 1 : 0) - (oldTask.status === 'completed' ? 1 : 0);

          metricsUpdate = {
            tasksInProgress: prev.metrics.tasksInProgress + inProgressChange,
            tasksCompleted: prev.metrics.tasksCompleted + completedChange,
          };
        }

        return {
          ...prev,
          tasks: newTasks,
          metrics: {
            ...prev.metrics,
            ...metricsUpdate,
          },
          lastUpdated: new Date(),
        };
      });

      logger.debug('Task updated successfully:', taskId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update task');
      logger.error('Failed to update task:', error);
      throw error;
    }
  };

  return {
    swarmState,
    isLoading,
    error,
    refreshStatus,
    startAgent,
    stopAgent,
    createTask,
    updateTask,
  };
};

export default useSwarmStatus;
