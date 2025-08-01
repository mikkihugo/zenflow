/**
 * UI Hooks - Hook Exports
 * 
 * This module exports custom React hooks for the Claude Flow CLI.
 * Hooks provide reusable state management and side effects.
 */

// Custom hooks
export { useSwarmStatus } from './use-swarm-status';
export { useConfig } from './use-config';

// Hook types
export type { SwarmStatusHook, SwarmStatusData } from './use-swarm-status';
export type { ConfigHook, ConfigData } from './use-config';

// Common hook utilities
export interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface UsePeriodicRefresh {
  isActive: boolean;
  interval: number;
  start: () => void;
  stop: () => void;
  setInterval: (ms: number) => void;
}

// Hook utility functions
export const HookUtils = {
  createAsyncState: <T>(initialData: T | null = null): UseAsyncState<T> => ({
    data: initialData,
    loading: false,
    error: null,
    refetch: async () => {},
  }),
  
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },
  
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
};
