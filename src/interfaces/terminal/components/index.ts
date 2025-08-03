/**
 * Unified Terminal Components - Index
 *
 * Exports all consolidated terminal components that merge functionality
 * from both command execution and interactive terminal interfaces.
 */

export * from './error-message';
export {
  CommandError,
  CriticalError,
  ErrorMessage,
  type ErrorMessageProps,
  StandardError,
  SwarmError,
  WarningMessage,
} from './error-message';
export * from './footer';
export {
  CommandExecutionFooter,
  Footer,
  type FooterProps,
  InteractiveFooter,
  InteractiveTerminalFooter,
  MenuFooter,
} from './footer';
// Core components
export * from './header';
// Re-export key components for convenience
export {
  Header,
  type HeaderProps,
  StandardHeader,
  SwarmHeader,
  type SwarmStatus,
} from './header';
export * from './progress-bar';
export {
  AgentProgress,
  NeuralProgressBar,
  ProgressBar,
  type ProgressBarProps,
  StandardProgressBar,
  SwarmProgressBar,
  TaskProgress,
} from './progress-bar';
export * from './spinner';
export {
  LoadingSpinner,
  Spinner,
  SpinnerPresets,
  type SpinnerProps,
  SwarmSpinner,
} from './spinner';
export * from './status-badge';
export {
  ActiveBadge,
  BusyBadge,
  ErrorBadge,
  IdleBadge,
  InfoBadge,
  InProgressBadge,
  PendingBadge,
  StatusBadge,
  type StatusBadgeProps,
  type StatusType,
  SuccessBadge,
  WarningBadge,
} from './status-badge';

// Common interfaces and types
export interface BaseComponentProps {
  testId?: string;
}

// Theme configuration for unified components
export interface UnifiedTheme {
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

// Default unified theme
export const defaultUnifiedTheme: UnifiedTheme = {
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

// Utility functions for components
export const ComponentUtils = {
  formatDuration: (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
    return `${(ms / 3600000).toFixed(1)}h`;
  },

  formatBytes: (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
      bytes /= 1024;
      i++;
    }
    return `${bytes.toFixed(1)}${units[i]}`;
  },

  truncateText: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  },

  centerText: (text: string, width: number): string => {
    const padding = Math.max(0, width - text.length);
    const leftPad = Math.floor(padding / 2);
    const rightPad = padding - leftPad;
    return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
  },

  formatAgentStatus: (status: string): string => {
    return status.replace('_', ' ').toUpperCase();
  },

  getSwarmStatusColor: (status: string): string => {
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
