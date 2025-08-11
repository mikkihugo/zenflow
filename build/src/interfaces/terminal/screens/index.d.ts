/**
 * Terminal Screens - Index.
 *
 * Exports all screen components for the unified terminal interface.
 */
/**
 * @file Screens module exports.
 */
export type { SwarmStatus } from '../components/index.ts';
export * from './main-menu';
export { createDefaultMenuItems, MainMenu, type MainMenuProps, type MenuItem } from './main-menu';
export * from './swarm-dashboard';
export { type SwarmAgent, SwarmDashboard, type SwarmDashboardProps, type SwarmMetrics, type SwarmTask, } from './swarm-dashboard';
export type ScreenType = 'main-menu' | 'swarm-dashboard' | 'agent-manager' | 'task-manager' | 'settings' | 'help' | 'status' | 'create-agent' | 'create-task';
export interface ScreenConfig {
    id: ScreenType;
    title: string;
    description?: string;
    requiresSwarm?: boolean;
    showInMenu?: boolean;
}
export declare const defaultScreenConfigs: ScreenConfig[];
export declare const ScreenUtils: {
    getScreenConfig: (screenId: ScreenType) => ScreenConfig | undefined;
    getMenuScreens: () => ScreenConfig[];
    getSwarmScreens: () => ScreenConfig[];
    isSwarmRequired: (screenId: ScreenType) => boolean;
};
//# sourceMappingURL=index.d.ts.map