/**
 * UI Screens - Screen Exports
 *
 * This module exports all screen components for the Claude Flow CLI.
 * Screens represent full-page UI layouts and interactive interfaces.
 */

// Screen prop types
export type { MainMenuProps } from './main-menu';
// Screen components
export { MainMenu } from './main-menu';
export type { SwarmDashboardProps } from './swarm-dashboard';
export { SwarmDashboard } from './swarm-dashboard';

// Common screen types
export interface BaseScreenProps {
  onExit?: () => void;
  onBack?: () => void;
  title?: string;
  showHeader?: boolean;
  showFooter?: boolean;
}

export interface NavigationItem {
  key: string;
  label: string;
  description?: string;
  action: () => void | Promise<void>;
  disabled?: boolean;
  icon?: string;
}

export interface ScreenRoute {
  path: string;
  component: React.ComponentType<any>;
  title: string;
  description?: string;
}

// Screen navigation utilities
export const ScreenUtils = {
  createNavigationItem: (
    key: string,
    label: string,
    action: () => void | Promise<void>,
    options: Partial<NavigationItem> = {}
  ): NavigationItem => ({
    key,
    label,
    action,
    ...options,
  }),

  filterEnabledItems: (items: NavigationItem[]): NavigationItem[] => {
    return items.filter((item) => !item.disabled);
  },

  findItemByKey: (items: NavigationItem[], key: string): NavigationItem | undefined => {
    return items.find((item) => item.key === key);
  },
};
