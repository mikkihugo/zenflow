/**
 * Terminal State Hooks - Index.
 *
 * React hooks for state management in the unified terminal interface.
 * Note: These are React hooks, NOT Claude Code hooks (which belong in templates/).
 */
/**
 * @file State-hooks module exports.
 */
export * from './use-config.ts';
export { type TerminalConfig, type UseConfigReturn, useConfig } from './use-config.ts';
export * from './use-swarm-status.ts';
export { type SwarmState, type UseSwarmStatusOptions, type UseSwarmStatusReturn, useSwarmStatus, } from './use-swarm-status.ts';
export declare const StateHookUtils: {
    /**
     * Debounce function for React hooks.
     *
     * @param func
     * @param delay
     */
    debounce: <T extends (...args: any[]) => any>(func: T, delay: number) => T;
    /**
     * Throttle function for React hooks.
     *
     * @param func
     * @param delay
     */
    throttle: <T extends (...args: any[]) => any>(func: T, delay: number) => T;
};
//# sourceMappingURL=index.d.ts.map