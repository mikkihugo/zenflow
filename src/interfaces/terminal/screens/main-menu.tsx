/**
 * Main Menu Screen
 *
 * Interactive menu system for TUI mode navigation.
 * Consolidates menu functionality from command execution interface.
 */

import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import type React from 'react';
import { useState } from 'react';
import { Header, InteractiveFooter, StatusBadge, type SwarmStatus } from '../components/index';

export interface MenuItem {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

export interface MainMenuProps {
  title?: string;
  items?: MenuItem[];
  swarmStatus?: SwarmStatus;
  onSelect: (value: string) => void;
  onExit: () => void;
  showHeader?: boolean;
  showFooter?: boolean;
}

/**
 * Main Menu Screen Component
 *
 * Provides interactive navigation for TUI mode.
 */
export const MainMenu: React.FC<MainMenuProps> = ({
  title = 'Claude Code Zen',
  items,
  swarmStatus,
  onSelect,
  onExit,
  showHeader = true,
  showFooter = true,
}) => {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Default menu items if none provided
  const defaultItems: MenuItem[] = [
    {
      label: '📊 System Status',
      value: 'status',
      description: 'View system health and component status',
    },
    {
      label: '🐝 Swarm Management',
      value: 'swarm',
      description: 'Manage swarms, agents, and coordination',
    },
    {
      label: '🔗 MCP Servers',
      value: 'mcp',
      description: 'Manage Model Context Protocol servers',
    },
    {
      label: '📚 Workspace',
      value: 'workspace',
      description: 'Document-driven development workflow',
    },
    {
      label: '⚙️ Settings',
      value: 'settings',
      description: 'Configure system settings and preferences',
    },
    {
      label: '📖 Help',
      value: 'help',
      description: 'View documentation and help information',
    },
    {
      label: '🚪 Exit',
      value: 'exit',
      description: 'Exit the application',
    },
  ];

  const menuItems = items || defaultItems;

  // Handle keyboard input
  useInput((input, key) => {
    if (key.escape || input === 'q' || input === 'Q') {
      onExit();
    }
  });

  const handleSelect = (item: MenuItem) => {
    if (item.disabled) return;

    if (item.value === 'exit') {
      onExit();
    } else {
      onSelect(item.value);
    }
  };

  const getSystemStatusBadge = () => {
    if (swarmStatus) {
      return <StatusBadge status={swarmStatus.status} variant="minimal" />;
    }
    return <StatusBadge status="active" text="System Ready" variant="minimal" />;
  };

  return (
    <Box flexDirection="column" height="100%">
      {/* Header */}
      {showHeader && (
        <Header
          title={title}
          version="2.0.0-alpha.73"
          swarmStatus={swarmStatus}
          mode={swarmStatus ? 'swarm' : 'standard'}
          showBorder={true}
          centerAlign={false}
        />
      )}

      {/* System status */}
      <Box marginBottom={1} paddingX={2}>
        {getSystemStatusBadge()}
      </Box>

      {/* Main menu */}
      <Box flexGrow={1} paddingX={2}>
        <Box flexDirection="column" width="100%">
          <Text bold marginBottom={1}>
            Select an option:
          </Text>

          <SelectInput
            items={menuItems}
            onSelect={handleSelect}
            onHighlight={(item) => setSelectedItem(item)}
            itemComponent={({ isSelected, label }) => (
              <Text color={isSelected ? 'cyan' : 'white'}>
                {isSelected ? '▶ ' : '  '}
                {label}
              </Text>
            )}
          />

          {/* Description of selected item */}
          {selectedItem?.description && (
            <Box marginTop={1} borderStyle="single" borderColor="gray" padding={1}>
              <Text dimColor>{selectedItem.description}</Text>
            </Box>
          )}
        </Box>
      </Box>

      {/* Footer */}
      {showFooter && (
        <InteractiveFooter
          currentScreen="Main Menu"
          availableScreens={[
            { key: '↑↓', name: 'Navigate' },
            { key: 'Enter', name: 'Select' },
          ]}
          status={
            swarmStatus
              ? `${swarmStatus.activeAgents}/${swarmStatus.totalAgents} agents`
              : undefined
          }
        />
      )}
    </Box>
  );
};

/**
 * Create default menu items for common use cases
 */
export const createDefaultMenuItems = (_handlers: {
  onStartSwarm?: () => void;
  onViewStatus?: () => void;
  onViewLogs?: () => void;
  onSettings?: () => void;
}): MenuItem[] => {
  return [
    {
      label: '🚀 Start Swarm',
      value: 'start-swarm',
      description: 'Initialize and start a new swarm',
    },
    {
      label: '📊 View Status',
      value: 'view-status',
      description: 'Show detailed system status',
    },
    {
      label: '📜 View Logs',
      value: 'view-logs',
      description: 'Show system logs and activity',
    },
    {
      label: '⚙️ Settings',
      value: 'settings',
      description: 'Configure system settings',
    },
    {
      label: '🚪 Exit',
      value: 'exit',
      description: 'Exit the application',
    },
  ];
};

export default MainMenu;
