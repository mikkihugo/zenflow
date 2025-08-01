/**
 * Swarm UI - Main entry point for swarm-focused UI components and screens
 * Comprehensive swarm orchestration and coordination user interface
 */

// Core components
export * from './components';
// Re-export key components for convenience
export {
  SwarmHeader,
  SwarmOverview,
  SwarmProgressBar,
  SwarmSpinner,
  SwarmStatusBadge,
} from './components';
// Screens
export * from './screens';
// Main TUI export
export { default as SwarmTUI, launchSwarmTUI } from './swarm-tui';
export { launchSwarmTUI as launchSwarmTUISimple } from './swarm-tui-simple';
// Re-export key types for convenience
export type {
  NeuralPatterns,
  SwarmAgent,
  SwarmCoordination,
  SwarmEventData,
  SwarmMemory,
  SwarmMetrics,
  SwarmStatus,
  SwarmTask,
  SwarmUIConfig,
  SwarmUIEvent,
} from './types';
// Types
export * from './types';
// Utilities
export * from './utils';

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
