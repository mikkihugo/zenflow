/**
 * Unified Terminal Interface - Main Export.
 *
 * Consolidates command execution and interactive terminal functionality into a single interface.
 * This replaces the separate command execution and interactive terminal interface directories.
 */
/**
 * @file Terminal module exports.
 */
export * from './command-execution-engine.ts';
export { CommandExecutionEngine } from './command-execution-engine.ts';
export * from './command-execution-renderer';
export { type CommandExecutionProps, CommandExecutionRenderer } from './command-execution-renderer';
export type { SwarmStatus } from './components/header';
export { type BaseComponentProps, ComponentUtils, defaultUnifiedTheme, ErrorMessage, type ErrorMessageProps, Footer, type FooterProps, Header, type HeaderProps, ProgressBar, type ProgressBarProps, Spinner, type SpinnerProps, StatusBadge, type StatusBadgeProps, type Theme, } from './components/index.ts';
export * from './interactive-terminal-application';
export { InteractiveTerminalApplication, type TUIModeProps, } from './interactive-terminal-application';
export { type ProcessResult, type TerminalConfig, TerminalManager, type TerminalSession, } from './process-orchestrator.ts';
export { defaultScreenConfigs, MainMenu, type MainMenuProps, type ScreenConfig, type ScreenType, ScreenUtils, SwarmDashboard, type SwarmDashboardProps, } from './screens/index.ts';
export type { SwarmAgent, SwarmMetrics, SwarmTask } from './screens/swarm-dashboard';
export { type UseConfigReturn, useConfig } from './state-hooks/use-config.ts';
export { type SwarmState, type UseSwarmStatusReturn, useSwarmStatus, } from './state-hooks/use-swarm-status.ts';
export * from './terminal-interface-router';
export { TerminalApp, type TerminalAppProps } from './terminal-interface-router';
export * from './utils/mock-command-handler.ts';
export { type CommandContext, type CommandResult, MockCommandHandler, } from './utils/mock-command-handler.ts';
export * from './utils/mode-detector.ts';
export { detectMode, detectModeWithReason, getEnvironmentInfo, isCommandExecutionSupported, isInteractiveSupported, type ModeDetectionResult, type TerminalMode, } from './utils/mode-detector.ts';
export interface TerminalInterfaceConfig {
    mode?: 'auto' | 'command' | 'interactive';
    theme?: 'dark' | 'light';
    verbose?: boolean;
    debug?: boolean;
    autoRefresh?: boolean;
    refreshInterval?: number;
}
export declare class TerminalInterface {
    private config;
    constructor(config?: TerminalInterfaceConfig);
    /**
     * Initialize the terminal interface.
     */
    initialize(): Promise<void>;
    /**
     * Render the terminal interface.
     */
    render(): Promise<void>;
    /**
     * Parse command line flags.
     *
     * @param args
     */
    private parseFlags;
    /**
     * Get current configuration.
     */
    getConfig(): TerminalInterfaceConfig;
    /**
     * Update configuration.
     *
     * @param updates
     */
    updateConfig(updates: Partial<TerminalInterfaceConfig>): void;
}
export declare const createTerminalInterface: (config?: TerminalInterfaceConfig) => TerminalInterface;
export declare const launchTerminalInterface: (config?: TerminalInterfaceConfig) => Promise<void>;
export declare const TERMINAL_INTERFACE_VERSION = "1.0.0";
export default TerminalInterface;
//# sourceMappingURL=index.d.ts.map