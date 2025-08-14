export * from './command-execution-engine.ts';
export { CommandExecutionEngine } from './command-execution-engine.ts';
export * from './command-execution-renderer.js';
export { CommandExecutionRenderer, } from './command-execution-renderer.js';
export { ComponentUtils, defaultUnifiedTheme, ErrorMessage, Footer, Header, ProgressBar, Spinner, StatusBadge, } from './components/index.ts';
export * from './interactive-terminal-application.js';
export { InteractiveTerminalApplication, } from './interactive-terminal-application.js';
export { TerminalManager, } from './process-orchestrator.ts';
export { defaultScreenConfigs, MainMenu, ScreenUtils, SwarmDashboard, } from './screens/index.ts';
export { useConfig } from './state-hooks/use-config.ts';
export { useSwarmStatus, } from './state-hooks/use-swarm-status.ts';
export * from './terminal-interface-router.js';
export { TerminalApp, } from './terminal-interface-router.js';
export * from './utils/mock-command-handler.ts';
export { MockCommandHandler, } from './utils/mock-command-handler.ts';
export * from './utils/mode-detector.ts';
export { detectMode, detectModeWithReason, getEnvironmentInfo, isCommandExecutionSupported, isInteractiveSupported, } from './utils/mode-detector.ts';
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
    async initialize() {
    }
    async render() {
        const { render } = await import('ink');
        const React = await import('react');
        const { TerminalApp } = await import('./terminal-interface-router.js');
        const _mode = this.config.mode === 'auto'
            ? detectMode(process.argv.slice(2), {})
            : this.config.mode;
        const commands = process.argv
            .slice(2)
            .filter((arg) => !arg.startsWith('-'));
        const flags = this.parseFlags(process.argv.slice(2));
        if (this.config.debug) {
            console.log('Debug mode enabled', { mode: _mode, commands, flags });
        }
        const { unmount } = render(React.createElement(TerminalApp, {
            commands,
            flags: { ...flags, ...this.config },
            onExit: (code) => process.exit(code),
        }));
        const shutdown = () => {
            unmount();
            process.exit(0);
        };
        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
    }
    parseFlags(args) {
        const flags = {};
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (arg && arg.startsWith('--')) {
                const key = arg.slice(2);
                const nextArg = args[i + 1];
                if (nextArg && !nextArg.startsWith('-')) {
                    flags[key] = nextArg;
                    i++;
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
    getConfig() {
        return { ...this.config };
    }
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
    }
}
export const createTerminalInterface = (config) => {
    return new TerminalInterface(config);
};
export const launchTerminalInterface = async (config) => {
    const terminal = new TerminalInterface(config);
    await terminal.initialize();
    await terminal.render();
};
export const TERMINAL_INTERFACE_VERSION = '1.0.0';
export default TerminalInterface;
//# sourceMappingURL=index.js.map