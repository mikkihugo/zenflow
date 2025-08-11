/**
 * Unified Terminal Interface - Main Export.
 *
 * Consolidates command execution and interactive terminal functionality into a single interface.
 * This replaces the separate command execution and interactive terminal interface directories.
 */
// Business logic (separated from UI)
/**
 * @file Terminal module exports.
 */
export * from './command-execution-engine.ts';
export { CommandExecutionEngine } from './command-execution-engine.ts';
export * from './command-execution-renderer';
export { CommandExecutionRenderer } from './command-execution-renderer';
// Components - specific exports to avoid conflicts
export { ComponentUtils, defaultUnifiedTheme, ErrorMessage, Footer, Header, ProgressBar, Spinner, StatusBadge, } from './components/index.ts';
export * from './interactive-terminal-application';
export { InteractiveTerminalApplication, } from './interactive-terminal-application';
// Process orchestrator - specific export to avoid conflicts
export { TerminalManager, } from './process-orchestrator.ts';
// Screens - specific exports to avoid conflicts
export { defaultScreenConfigs, MainMenu, ScreenUtils, SwarmDashboard, } from './screens/index.ts';
// State Hooks (React hooks for component state management) - avoid conflicts
// Note: Re-exporting from state-hooks causes conflicts, import directly when needed
// Specific exports to avoid conflicts:
export { useConfig } from './state-hooks/use-config.ts';
export { useSwarmStatus, } from './state-hooks/use-swarm-status.ts';
// Main components (updated for Google standards)
export * from './terminal-interface-router';
// Re-export key items for convenience (updated names)
export { TerminalApp } from './terminal-interface-router';
export * from './utils/mock-command-handler.ts';
export { MockCommandHandler, } from './utils/mock-command-handler.ts';
// Utilities (updated for Google standards)
export * from './utils/mode-detector.ts';
export { detectMode, detectModeWithReason, getEnvironmentInfo, isCommandExecutionSupported, isInteractiveSupported, } from './utils/mode-detector.ts';
// Terminal interface class for external integration
export class TerminalInterface {
    config;
    constructor(config = {}) {
        this.config = {
            mode: 'auto',
            theme: 'dark',
            verbose: false,
            autoRefresh: true,
            refreshInterval: 3000,
            ...config,
        };
    }
    /**
     * Initialize the terminal interface.
     */
    async initialize() {
        // Initialization logic if needed
    }
    /**
     * Render the terminal interface.
     */
    async render() {
        const { render } = await import('ink');
        const React = await import('react');
        const { TerminalApp } = await import('./terminal-interface-router');
        // Determine mode
        const _mode = this.config.mode === 'auto'
            ? detectMode(process.argv.slice(2), {})
            : this.config.mode;
        const commands = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));
        const flags = this.parseFlags(process.argv.slice(2));
        if (this.config.debug) {
            console.log('Debug mode enabled', { mode: _mode, commands, flags });
        }
        // Render the appropriate interface
        const { unmount } = render(React.createElement(TerminalApp, {
            commands,
            flags: { ...flags, ...this.config },
            onExit: (code) => process.exit(code),
        }));
        // Setup graceful shutdown
        const shutdown = () => {
            unmount();
            process.exit(0);
        };
        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
    }
    /**
     * Parse command line flags.
     *
     * @param args
     */
    parseFlags(args) {
        const flags = {};
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (arg && arg.startsWith('--')) {
                const key = arg.slice(2);
                const nextArg = args[i + 1];
                if (nextArg && !nextArg.startsWith('-')) {
                    flags[key] = nextArg;
                    i++; // Skip next arg
                }
                else {
                    flags[key] = true;
                }
            }
            else if (arg && arg.startsWith('-')) {
                const key = arg.slice(1);
                flags[key] = true;
            }
        }
        return flags;
    }
    /**
     * Get current configuration.
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update configuration.
     *
     * @param updates
     */
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
    }
}
// Convenience functions for direct usage
export const createTerminalInterface = (config) => {
    return new TerminalInterface(config);
};
export const launchTerminalInterface = async (config) => {
    const terminal = new TerminalInterface(config);
    await terminal.initialize();
    await terminal.render();
};
// Version info
export const TERMINAL_INTERFACE_VERSION = '1.0.0';
// Export default for convenience
export default TerminalInterface;
