/**
 * Swarm UI Screens - Centralized exports for swarm-focused screens
 * All screens are optimized for swarm orchestration and coordination workflows
 */

// Re-export from main TUI
export { default as SwarmTUI, launchSwarmTUI } from '../swarm-tui';
// Core swarm screens
export { SwarmOverview, type SwarmOverviewProps } from './swarm-overview';

// Base screen props interface for consistency
export interface BaseSwarmScreenProps {
  onExit?: () => void;
  onBack?: () => void;
  onNavigate?: (screen: string) => void;
  title?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  swarmId?: string;
}

// Screen navigation types
export type SwarmScreen =
  | 'overview'
  | 'agents'
  | 'tasks'
  | 'create-agent'
  | 'create-task'
  | 'metrics'
  | 'coordination'
  | 'settings';

// Screen registry for dynamic screen loading
export const SwarmScreenRegistry = {
  overview: SwarmOverview,
  // Additional screens to be implemented...
} as const;
