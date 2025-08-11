/**
 * Terminal Screens - Index.
 *
 * Exports all screen components for the unified terminal interface.
 */

// Re-export SwarmStatus from components for convenience
/**
 * @file Screens module exports.
 */

export type { SwarmStatus } from '../components/index.ts';
export {
  type CommandPaletteProps,
  default as CommandPalette,
} from './command-palette.tsx';
export {
  default as FileBrowser,
  type FileBrowserProps,
} from './file-browser.tsx';
export { default as Help, type HelpProps } from './help.tsx';
export {
  default as LLMStatistics,
  type LLMStatisticsProps,
} from './llm-statistics.tsx';
// New essential TUI screens
export { default as LogsViewer, type LogsViewerProps } from './logs-viewer.tsx';
// Main screens
export * from './main-menu.tsx';
// Re-export key screens for convenience
export {
  createDefaultMenuItems,
  Menu as MainMenu,
  type MenuItem,
  type MenuProps as MainMenuProps,
} from './main-menu.tsx';
// Additional screens
export { default as MCPServers, type MCPServersProps } from './mcp-servers.tsx';
export { default as MCPTester, type MCPTesterProps } from './mcp-tester.tsx';
export { default as NixManager, type NixManagerProps } from './nix-manager.tsx';
export {
  default as PerformanceMonitor,
  type PerformanceMonitorProps,
} from './performance-monitor.tsx';
export { default as Settings, type SettingsProps } from './settings.tsx';
export { default as Status, type StatusProps } from './status.tsx';
export * from './swarm-dashboard.tsx';
export {
  type SwarmAgent,
  SwarmDashboard,
  type SwarmDashboardProps,
  type SwarmMetrics,
  type SwarmTask,
} from './swarm-dashboard.tsx';
export { default as Workspace, type WorkspaceProps } from './workspace.tsx';

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
  | 'create-task'
  | 'mcp-servers'
  | 'workspace'
  | 'logs-viewer'
  | 'command-palette'
  | 'performance-monitor'
  | 'file-browser'
  | 'mcp-tester'
  | 'llm-statistics'
  | 'document-ai'
  | 'adr-generator'
  | 'nix-manager';

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
    requiresSwarm: false, // Allow access without swarm for demo
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

// Screen navigation utilities
export const ScreenUtils = {
  getScreenConfig: (screenId: ScreenType): ScreenConfig | undefined => {
    return defaultScreenConfigs.find((config) => config.id === screenId);
  },

  getMenuScreens: (): ScreenConfig[] => {
    return defaultScreenConfigs.filter((config) => config?.showInMenu);
  },

  getSwarmScreens: (): ScreenConfig[] => {
    return defaultScreenConfigs.filter((config) => config?.requiresSwarm);
  },

  isSwarmRequired: (screenId: ScreenType): boolean => {
    const config = ScreenUtils.getScreenConfig(screenId);
    return config?.requiresSwarm;
  },
};
