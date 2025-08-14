export * from './error-message.tsx';
export { CommandError, CriticalError, ErrorMessage, StandardError, SwarmError, WarningMessage, } from './error-message.tsx';
export * from './footer.tsx';
export { CommandExecutionFooter, Footer, InteractiveFooter, InteractiveTerminalFooter, MenuFooter, } from './footer.tsx';
export * from './header.tsx';
export { Header, StandardHeader, SwarmHeader, } from './header.tsx';
export * from './progress-bar.tsx';
export { AgentProgress, NeuralProgressBar, ProgressBar, StandardProgressBar, SwarmProgressBar, TaskProgress, } from './progress-bar.tsx';
export * from './spinner.tsx';
export { LoadingSpinner, Spinner, SpinnerPresets, SwarmSpinner, } from './spinner.tsx';
export * from './status-badge.tsx';
export { ActiveBadge, BusyBadge, ErrorBadge, IdleBadge, InfoBadge, InProgressBadge, PendingBadge, StatusBadge, SuccessBadge, WarningBadge, } from './status-badge.tsx';
export const defaultUnifiedTheme = {
    colors: {
        primary: '#00D7FF',
        secondary: '#6C7B7F',
        success: '#00D100',
        warning: '#FFAB00',
        error: '#FF5722',
        info: '#2196F3',
        text: '#FFFFFF',
        dimText: '#6C7B7F',
        background: '#1A1A1A',
        swarmAccent: '#00D7FF',
        neuralAccent: '#FF6B6B',
    },
    symbols: {
        check: '✓',
        cross: '✗',
        warning: '⚠',
        info: 'ℹ',
        arrow: '→',
        bullet: '•',
        spinner: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
        swarmIcon: '🐝',
        neuralIcon: '🧠',
    },
};
export const ComponentUtils = {
    formatDuration: (ms) => {
        if (ms < 1000)
            return `${ms}ms`;
        if (ms < 60000)
            return `${(ms / 1000).toFixed(1)}s`;
        if (ms < 3600000)
            return `${(ms / 60000).toFixed(1)}m`;
        return `${(ms / 3600000).toFixed(1)}h`;
    },
    formatBytes: (bytes) => {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let i = 0;
        while (bytes >= 1024 && i < units.length - 1) {
            bytes /= 1024;
            i++;
        }
        return `${bytes.toFixed(1)}${units[i]}`;
    },
    truncateText: (text, maxLength) => {
        if (text.length <= maxLength)
            return text;
        return `${text.substring(0, maxLength - 3)}...`;
    },
    centerText: (text, width) => {
        const padding = Math.max(0, width - text.length);
        const leftPad = Math.floor(padding / 2);
        const rightPad = padding - leftPad;
        return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
    },
    formatAgentStatus: (status) => {
        return status.replace('_', ' ').toUpperCase();
    },
    getSwarmStatusColor: (status) => {
        switch (status) {
            case 'active':
                return 'green';
            case 'initializing':
                return 'yellow';
            case 'error':
                return 'red';
            case 'idle':
                return 'gray';
            default:
                return 'white';
        }
    },
};
//# sourceMappingURL=index.js.map