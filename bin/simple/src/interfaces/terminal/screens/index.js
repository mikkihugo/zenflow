export { default as ADRManager } from './adr-manager.tsx';
export { default as CommandPalette, } from './command-palette.tsx';
export { default as FileBrowser, } from './file-browser.tsx';
export { default as Help } from './help.tsx';
export { default as LLMStatistics, } from './llm-statistics.tsx';
export { default as LogsViewer } from './logs-viewer.tsx';
export * from './main-menu.tsx';
export { createDefaultMenuItems, Menu as MainMenu, } from './main-menu.tsx';
export { default as MCPServers } from './mcp-servers.tsx';
export { default as MCPTester } from './mcp-tester.tsx';
export { default as NixManager } from './nix-manager.tsx';
export { default as PerformanceMonitor, } from './performance-monitor.tsx';
export { default as Settings } from './settings.tsx';
export { default as Status } from './status.tsx';
export * from './swarm-dashboard.tsx';
export { SwarmDashboard, } from './swarm-dashboard.tsx';
export { default as Workspace } from './workspace.tsx';
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
        requiresSwarm: false,
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
        id: 'mcp-servers',
        title: 'MCP Servers',
        description: 'Model Context Protocol server management',
        showInMenu: true,
    },
    {
        id: 'workspace',
        title: 'Workspace',
        description: 'Document-driven development workflow',
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
        return config?.requiresSwarm;
    },
};
//# sourceMappingURL=index.js.map