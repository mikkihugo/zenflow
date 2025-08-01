/**
 * Swarm UI Components - Centralized exports for swarm-focused components
 * All components are optimized for swarm orchestration and coordination
 */

// Core swarm components
// Re-export from legacy components for backward compatibility
export { default as Header, SwarmHeader, type SwarmHeaderProps } from './swarm-header';
export {
  default as ProgressBar,
  SwarmProgressBar,
  type SwarmProgressBarProps,
} from './swarm-progress-bar';
export {
  default as Spinner,
  SwarmSpinner,
  SwarmSpinnerPresets,
  type SwarmSpinnerProps,
} from './swarm-spinner';
export {
  default as StatusBadge,
  SwarmStatusBadge,
  type SwarmStatusBadgeProps,
} from './swarm-status-badge';

// Base component props interface
export interface BaseSwarmComponentProps {
  testId?: string;
  swarmId?: string;
  agentContext?: {
    id: string;
    type: string;
    status: string;
  };
}

// Component theme for swarm UI consistency
export const SwarmComponentTheme = {
  colors: {
    primary: 'cyan',
    secondary: 'yellow',
    success: 'green',
    warning: 'yellow',
    error: 'red',
    info: 'blue',
    swarm: 'magenta',
    neural: 'purple',
    coordination: 'cyan',
  },
  icons: {
    swarm: '🐝',
    agent: '🤖',
    task: '📋',
    coordination: '🔗',
    neural: '🧠',
    active: '🟢',
    busy: '🟡',
    idle: '🔵',
    error: '🔴',
    initializing: '🔄',
  },
  borders: {
    default: 'round',
    minimal: 'single',
    emphasis: 'double',
  },
} as const;
