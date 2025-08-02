import { Box, Text, useFocus, useInput } from 'ink';
import React from 'react';
import { useEffect, useState } from 'react';
import { Footer, Header, StatusBadge } from '../components';
import { type BaseScreenProps, type NavigationItem, ScreenUtils } from './index';

export interface MainMenuProps extends BaseScreenProps {
  items?: NavigationItem[];
  selectedIndex?: number;
  onSelect?: (item: NavigationItem) => void;
  showStatus?: boolean;
  statusText?: string;
  maxVisibleItems?: number;
}

/**
 * MainMenu Component
 *
 * Interactive main menu with keyboard navigation.
 * Displays navigation items with highlighting and selection.
 */
export const MainMenu: React.FC<MainMenuProps> = ({
  items = [],
  selectedIndex: initialSelectedIndex = 0,
  onSelect,
  onExit,
  title = 'Claude Flow CLI',
  showHeader = true,
  showFooter = true,
  showStatus = false,
  statusText,
  maxVisibleItems = 10,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
  const [isLoading, setIsLoading] = useState(false);
  const { isFocused } = useFocus({ autoFocus: true });

  const enabledItems = ScreenUtils.filterEnabledItems(items);
  const visibleItems = enabledItems.slice(0, maxVisibleItems);

  // Handle keyboard input
  useInput((input, key) => {
    if (!isFocused || isLoading) return;

    if (key.upArrow || input === 'k') {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow || input === 'j') {
      setSelectedIndex((prev) => Math.min(visibleItems.length - 1, prev + 1));
    } else if (key.return || input === ' ') {
      handleSelection();
    } else if (key.escape || input === 'q') {
      onExit?.();
    }
  });

  const handleSelection = async () => {
    const selectedItem = visibleItems[selectedIndex];
    if (!selectedItem || selectedItem.disabled) return;

    setIsLoading(true);

    try {
      await selectedItem.action();
      onSelect?.(selectedItem);
    } catch (error) {
      console.error('Menu action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-adjust selection if items change
  useEffect(() => {
    if (selectedIndex >= visibleItems.length && visibleItems.length > 0) {
      setSelectedIndex(visibleItems.length - 1);
    }
  }, [visibleItems.length, selectedIndex]);

  const shortcuts = [
    { key: '↑/↓ or j/k', description: 'Navigate' },
    { key: 'Enter/Space', description: 'Select' },
    { key: 'q/Esc', description: 'Exit' },
  ];

  return (
    <Box flexDirection="column" height="100%">
      {showHeader && <Header title={title} version={process.env.npm_package_version} centerAlign />}

      {showStatus && statusText && (
        <Box marginBottom={1} justifyContent="center">
          <StatusBadge status="info" text={statusText} />
        </Box>
      )}

      <Box flexDirection="column" flexGrow={1}>
        {visibleItems.length === 0 ? (
          <Box justifyContent="center" flexGrow={1}>
            <Text dimColor>No menu items available</Text>
          </Box>
        ) : (
          visibleItems.map((item, index) => {
            const isSelected = index === selectedIndex;
            const isDisabled = item.disabled;

            return (
              <Box key={item.key} marginBottom={0}>
                <Text
                  color={isSelected ? 'cyan' : isDisabled ? 'gray' : 'white'}
                  bold={isSelected}
                  dimColor={isDisabled}
                  inverse={isSelected && !isDisabled}
                >
                  {isSelected ? '▶ ' : '  '}
                  {item.icon && <>{item.icon} </>}
                  {item.label}
                </Text>

                {item.description && (
                  <Text dimColor>
                    {' - '}
                    {item.description}
                  </Text>
                )}
              </Box>
            );
          })
        )}

        {isLoading && (
          <Box marginTop={1}>
            <Text color="yellow">⏳ Processing...</Text>
          </Box>
        )}
      </Box>

      {showFooter && <Footer shortcuts={shortcuts} centerAlign />}
    </Box>
  );
};

// Default menu items for common actions
export const createDefaultMenuItems = (handlers: {
  onStartSwarm?: () => void;
  onViewStatus?: () => void;
  onViewLogs?: () => void;
  onSettings?: () => void;
}): NavigationItem[] => [
  {
    key: 'start-swarm',
    label: 'Start Swarm',
    description: 'Initialize a new swarm',
    icon: '🐝',
    action: handlers.onStartSwarm || (() => {}),
  },
  {
    key: 'view-status',
    label: 'View Status',
    description: 'Check swarm status and metrics',
    icon: '📈',
    action: handlers.onViewStatus || (() => {}),
  },
  {
    key: 'view-logs',
    label: 'View Logs',
    description: 'Browse system logs',
    icon: '📜',
    action: handlers.onViewLogs || (() => {}),
  },
  {
    key: 'settings',
    label: 'Settings',
    description: 'Configure system settings',
    icon: '⚙️',
    action: handlers.onSettings || (() => {}),
  },
];

// Default export for convenience
export default MainMenu;
