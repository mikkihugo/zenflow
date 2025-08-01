/**
 * Swarm UI - Main entry point for swarm-focused UI components and screens
 * Comprehensive swarm orchestration and coordination user interface
 */

// Core components
export * from './components';

// Screens
export * from './screens';

// Types
export * from './types';

// Utilities
export * from './utils';

// Main TUI export
export { default as SwarmTUI, launchSwarmTUI } from './swarm-tui';

// Re-export key types for convenience
export type { 
  SwarmStatus, 
  SwarmMetrics, 
  SwarmAgent, 
  SwarmTask,
  SwarmCoordination,
  SwarmMemory,
  NeuralPatterns,
  SwarmUIEvent,
  SwarmEventData,
  SwarmUIConfig
} from './types';

// Re-export key components for convenience
export { 
  SwarmHeader,
  SwarmSpinner,
  SwarmStatusBadge,
  SwarmProgressBar,
  SwarmOverview
} from './components';

// Configuration and theme
export const SwarmUIConfig = {
  defaultTheme: {
    primaryColor: 'cyan',
    secondaryColor: 'yellow',
    accentColor: 'magenta',
    errorColor: 'red',
    successColor: 'green',
  },
  defaultRefreshInterval: 5000,
  maxVisibleAgents: 10,
  maxVisibleTasks: 15,
  enableAnimations: true,
  showAdvancedMetrics: false,
} as const;

// Swarm UI version
export const SWARM_UI_VERSION = '1.0.0';