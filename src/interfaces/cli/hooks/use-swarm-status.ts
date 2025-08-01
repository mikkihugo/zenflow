import { useCallback, useEffect, useRef, useState } from 'react';
import type { UseAsyncState } from './index';

// Types for swarm status data
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

export interface SwarmStatusData {
  agents: SwarmAgent[];
  metrics: SwarmMetrics;
  isOnline: boolean;
  lastUpdated: Date;
}

export interface SwarmStatusHook extends UseAsyncState<SwarmStatusData> {
  agents: SwarmAgent[];
  metrics: SwarmMetrics | null;
  isOnline: boolean;
  startPolling: (interval?: number) => void;
  stopPolling: () => void;
  isPolling: boolean;
}

export interface UseSwarmStatusOptions {
  autoStart?: boolean;
  pollInterval?: number;
  onError?: (error: Error) => void;
  onStatusChange?: (status: SwarmStatusData) => void;
}

/**
 * Custom hook for managing swarm status data
 *
 * Provides real-time swarm status with automatic polling,
 * error handling, and data management.
 */
export const useSwarmStatus = (options: UseSwarmStatusOptions = {}): SwarmStatusHook => {
  const { autoStart = false, pollInterval = 5000, onError, onStatusChange } = options;

  const [data, setData] = useState<SwarmStatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Mock API function - replace with actual API call
  const fetchSwarmStatus = useCallback(async (signal?: AbortSignal): Promise<SwarmStatusData> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (signal?.aborted) {
      throw new Error('Request aborted');
    }

    // Mock data - replace with actual API response
    const mockAgents: SwarmAgent[] = [
      {
        id: 'agent-1',
        name: 'Research Agent',
        type: 'researcher',
        status: 'active',
        tasksCompleted: 15,
        currentTask: 'Analyzing market trends',
        lastActivity: new Date(),
        performance: {
          successRate: 0.95,
          avgResponseTime: 1200,
          totalTasks: 20,
        },
      },
      {
        id: 'agent-2',
        name: 'Code Agent',
        type: 'coder',
        status: 'idle',
        tasksCompleted: 8,
        lastActivity: new Date(Date.now() - 300000), // 5 minutes ago
        performance: {
          successRate: 0.88,
          avgResponseTime: 2100,
          totalTasks: 12,
        },
      },
    ];

    const mockMetrics: SwarmMetrics = {
      totalAgents: 2,
      activeAgents: 1,
      tasksInProgress: 1,
      tasksCompleted: 23,
      totalTasks: 32,
      uptime: Date.now() - new Date().setHours(0, 0, 0, 0),
      performance: {
        throughput: 4.2,
        errorRate: 0.08,
        avgLatency: 1650,
      },
    };

    return {
      agents: mockAgents,
      metrics: mockMetrics,
      isOnline: true,
      lastUpdated: new Date(),
    };
  }, []);

  const refetch = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      // Cancel previous request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      const statusData = await fetchSwarmStatus(abortControllerRef.current.signal);

      setData(statusData);
      onStatusChange?.(statusData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch swarm status');

      if (error.message !== 'Request aborted') {
        setError(error);
        onError?.(error);
      }
    } finally {
      setLoading(false);
    }
  }, [loading, fetchSwarmStatus, onError, onStatusChange]);

  const startPolling = useCallback(
    (interval: number = pollInterval) => {
      if (isPolling) return;

      setIsPolling(true);

      // Initial fetch
      refetch();

      // Set up polling
      pollIntervalRef.current = setInterval(() => {
        refetch();
      }, interval);
    },
    [isPolling, pollInterval, refetch]
  );

  const stopPolling = useCallback(() => {
    if (!isPolling) return;

    setIsPolling(false);

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    // Cancel ongoing request
    abortControllerRef.current?.abort();
  }, [isPolling]);

  // Auto-start polling if enabled
  useEffect(() => {
    if (autoStart) {
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [autoStart, startPolling, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
      abortControllerRef.current?.abort();
    };
  }, [stopPolling]);

  return {
    data,
    loading,
    error,
    refetch,
    agents: data?.agents || [],
    metrics: data?.metrics || null,
    isOnline: data?.isOnline || false,
    startPolling,
    stopPolling,
    isPolling,
  };
};

// Default export for convenience
export default useSwarmStatus;
