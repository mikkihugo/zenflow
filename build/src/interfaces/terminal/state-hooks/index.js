/**
 * Terminal State Hooks - Index.
 *
 * React hooks for state management in the unified terminal interface.
 * Note: These are React hooks, NOT Claude Code hooks (which belong in templates/).
 */
// Core React state hooks
/**
 * @file State-hooks module exports.
 */
export * from './use-config.ts';
// Re-export key hooks for convenience
export { useConfig } from './use-config.ts';
export * from './use-swarm-status.ts';
export { useSwarmStatus, } from './use-swarm-status.ts';
// Additional React hook utilities
export const StateHookUtils = {
    /**
     * Debounce function for React hooks.
     *
     * @param func
     * @param delay
     */
    debounce: (func, delay) => {
        let timeoutId;
        return ((...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        });
    },
    /**
     * Throttle function for React hooks.
     *
     * @param func
     * @param delay
     */
    throttle: (func, delay) => {
        let lastCall = 0;
        return ((...args) => {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                return func(...args);
            }
        });
    },
};
