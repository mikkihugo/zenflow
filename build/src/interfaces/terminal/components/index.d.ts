/**
 * Unified Terminal Components - Index.
 *
 * Exports all consolidated terminal components that merge functionality.
 * From both command execution and interactive terminal interfaces.
 */
/**
 * @file Components module exports.
 */
export * from './error-message';
export { CommandError, CriticalError, ErrorMessage, type ErrorMessageProps, StandardError, SwarmError, WarningMessage, } from './error-message';
export * from './footer';
export { CommandExecutionFooter, Footer, type FooterProps, InteractiveFooter, InteractiveTerminalFooter, MenuFooter, } from './footer';
export * from './header';
export { Header, type HeaderProps, StandardHeader, SwarmHeader, type SwarmStatus } from './header';
export * from './progress-bar';
export { AgentProgress, NeuralProgressBar, ProgressBar, type ProgressBarProps, StandardProgressBar, SwarmProgressBar, TaskProgress, } from './progress-bar';
export * from './spinner';
export { LoadingSpinner, Spinner, SpinnerPresets, type SpinnerProps, SwarmSpinner, } from './spinner';
export * from './status-badge';
export { ActiveBadge, BusyBadge, ErrorBadge, IdleBadge, InfoBadge, InProgressBadge, PendingBadge, StatusBadge, type StatusBadgeProps, type StatusType, SuccessBadge, WarningBadge, } from './status-badge';
export interface BaseComponentProps {
    testId?: string;
}
export interface Theme {
    colors: {
        primary: string;
        secondary: string;
        success: string;
        warning: string;
        error: string;
        info: string;
        text: string;
        dimText: string;
        background: string;
        swarmAccent: string;
        neuralAccent: string;
    };
    symbols: {
        check: string;
        cross: string;
        warning: string;
        info: string;
        arrow: string;
        bullet: string;
        spinner: string[];
        swarmIcon: string;
        neuralIcon: string;
    };
}
export declare const defaultUnifiedTheme: Theme;
export declare const ComponentUtils: {
    formatDuration: (ms: number) => string;
    formatBytes: (bytes: number) => string;
    truncateText: (text: string, maxLength: number) => string;
    centerText: (text: string, width: number) => string;
    formatAgentStatus: (status: string) => string;
    getSwarmStatusColor: (status: string) => string;
};
//# sourceMappingURL=index.d.ts.map