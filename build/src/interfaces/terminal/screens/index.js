/**
 * Terminal Screens - Index.
 *
 * Exports all screen components for the unified terminal interface.
 */
// Main screens
export * from './main-menu';
// Re-export key screens for convenience
export { createDefaultMenuItems, MainMenu } from './main-menu';
export * from './swarm-dashboard';
export { SwarmDashboard, } from './swarm-dashboard';
// Default screen configurations
export const defaultScreenConfigs = [
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
    getScreenConfig: (screenId) => {
        return defaultScreenConfigs.find((config) => config.id === screenId);
    },
    getMenuScreens: () => {
        return defaultScreenConfigs.filter((config) => config?.showInMenu);
    },
    getSwarmScreens: () => {
        return defaultScreenConfigs.filter((config) => config?.requiresSwarm);
    },
    isSwarmRequired: (screenId) => {
        const config = ScreenUtils.getScreenConfig(screenId);
        return config?.requiresSwarm || false;
    },
};
