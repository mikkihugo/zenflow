/**
 * Terminal State Hooks - Index
 *
 * React hooks for state management in the unified terminal interface.
 * Note: These are React hooks, NOT Claude Code hooks (which belong in templates/).
 */

// Core React state hooks
export * from './use-config.js';
// Re-export key hooks for convenience
export {
  type TerminalConfig,
  type UseConfigReturn,
  useConfig,
} from './use-config.js';
export * from './use-swarm-status.js';

export {
  type SwarmState,
  type UseSwarmStatusOptions,
  type UseSwarmStatusReturn,
  useSwarmStatus,
} from './use-swarm-status.js';

// Additional React hook utilities
export const StateHookUtils = {
  /**
   * Debounce function for React hooks
   */
  debounce: <T extends (...args: any[]) => any>(func: T, delay: number): T => {
    let timeoutId: NodeJS.Timeout;

    return ((...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
  },

  /**
   * Throttle function for React hooks
   */
  throttle: <T extends (...args: any[]) => any>(func: T, delay: number): T => {
    let lastCall = 0;

    return ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        return func(...args);
      }
    }) as T;
  },
};
