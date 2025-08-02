/**
 * Terminal Screens - Index
 *
 * Exports all screen components for the unified terminal interface.
 */

// Main screens
export * from './main-menu.js';
// Re-export key screens for convenience
export {
  createDefaultMenuItems,
  MainMenu,
  type MainMenuProps,
  type MenuItem,
} from './main-menu.js';
export * from './swarm-dashboard.js';

export {
  type SwarmAgent,
  SwarmDashboard,
  type SwarmDashboardProps,
  type SwarmMetrics,
  type SwarmTask,
} from './swarm-dashboard.js';

// Screen types for navigation
export type ScreenType =
  | 'main-menu'
  | 'swarm-dashboard'
  | 'agent-manager'
  | 'task-manager'
  | 'settings'
  | 'help'
  | 'status'
  | 'create-agent'
  | 'create-task';

// Screen configuration interface
export interface ScreenConfig {
  id: ScreenType;
  title: string;
  description?: string;
  requiresSwarm?: boolean;
  showInMenu?: boolean;
}

// Default screen configurations
export const defaultScreenConfigs: ScreenConfig[] = [
  {
    id: 'main-menu',
    title: 'Main Menu',
    description: 'Main navigation menu',
    showInMenu: false,
  },
  {
    id: 'swarm-dashboard',
    title: 'Swarm Dashboard',
    description: 'Real-time swarm monitoring',
    requiresSwarm: true,
    showInMenu: true,
  },
  {
    id: 'agent-manager',
    title: 'Agent Manager',
    description: 'Manage swarm agents',
    requiresSwarm: true,
    showInMenu: true,
  },
  {
    id: 'task-manager',
    title: 'Task Manager',
    description: 'Manage swarm tasks',
    requiresSwarm: true,
    showInMenu: true,
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'System configuration',
    showInMenu: true,
  },
  {
    id: 'help',
    title: 'Help',
    description: 'Documentation and help',
    showInMenu: true,
  },
  {
    id: 'status',
    title: 'System Status',
    description: 'System health and metrics',
    showInMenu: true,
  },
];

// Screen navigation utilities
export const ScreenUtils = {
  getScreenConfig: (screenId: ScreenType): ScreenConfig | undefined => {
    return defaultScreenConfigs.find((config) => config.id === screenId);
  },

  getMenuScreens: (): ScreenConfig[] => {
    return defaultScreenConfigs.filter((config) => config.showInMenu);
  },

  getSwarmScreens: (): ScreenConfig[] => {
    return defaultScreenConfigs.filter((config) => config.requiresSwarm);
  },

  isSwarmRequired: (screenId: ScreenType): boolean => {
    const config = ScreenUtils.getScreenConfig(screenId);
    return config?.requiresSwarm || false;
  },
};
