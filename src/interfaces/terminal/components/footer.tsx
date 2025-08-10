/**
 * Unified Footer Component.
 *
 * Displays navigation help and status information at the bottom of the terminal interface.
 * Adapts content based on current mode and available actions.
 */
/**
 * @file Interface implementation: footer.
 */

import { Box, Text } from 'ink';

export interface FooterProps {
  mode?: 'command' | 'interactive' | 'menu';
  shortcuts?: Array<{ key: string; action: string }>;
  status?: string;
  showBorder?: boolean;
  testId?: string;
}

/**
 * Unified Footer Component.
 *
 * Provides context-appropriate navigation and help information.
 *
 * @param root0
 * @param root0.mode
 * @param root0.shortcuts
 * @param root0.status
 * @param root0.showBorder
 * @param root0.testId
 */
export const Footer: React.FC<FooterProps> = ({
  mode = 'command',
  shortcuts,
  status,
  showBorder = true,
  testId = 'footer',
}) => {
  const getDefaultShortcuts = () => {
    switch (mode) {
      case 'interactive':
        return [
          { key: '1-6', action: 'Navigate' },
          { key: 'Q', action: 'Quit' },
          { key: 'Esc', action: 'Exit' },
        ];

      case 'menu':
        return [
          { key: '↑↓', action: 'Navigate' },
          { key: 'Enter', action: 'Select' },
          { key: 'Q', action: 'Quit' },
        ];
      default:
        return [
          { key: 'Ctrl+C', action: 'Exit' },
          { key: '--help', action: 'Help' },
        ];
    }
  };

  const displayShortcuts = shortcuts || getDefaultShortcuts();

  return (
    <Box
      borderStyle={showBorder ? 'single' : undefined}
      borderColor="gray"
      paddingX={1}
      justifyContent="space-between"
    >
      {/* Navigation shortcuts */}
      <Box>
        {displayShortcuts.map((shortcut, index) => (
          <Text key={index} color="gray">
            [{shortcut.key}] {shortcut.action}
            {index < displayShortcuts.length - 1 ? ' ' : ''}
          </Text>
        ))}
      </Box>

      {/* Status information */}
      {status && (
        <Box>
          <Text color="cyan">{status}</Text>
        </Box>
      )}
    </Box>
  );
};

// Specialized footer variants.
export const CommandExecutionFooter: React.FC<{ status?: string }> = ({ status }) => (
  <Footer mode="command" status={status} />
);

export const InteractiveTerminalFooter: React.FC<{ status?: string }> = ({ status }) => (
  <Footer
    mode="interactive"
    status={status}
    shortcuts={[
      { key: '1', action: 'Overview' },
      { key: '2', action: 'Agents' },
      { key: '3', action: 'Tasks' },
      { key: '4', action: 'Create Agent' },
      { key: '5', action: 'Create Task' },
      { key: '6', action: 'Settings' },
      { key: 'Q', action: 'Quit' },
    ]}
  />
);

export const MenuFooter: React.FC<{ status?: string }> = ({ status }) => (
  <Footer mode="menu" status={status} />
);

// Interactive footer with dynamic shortcuts
export const InteractiveFooter: React.FC<{
  currentScreen?: string;
  availableScreens?: Array<{ key: string; name: string }>;
  status?: string;
}> = ({ currentScreen, availableScreens, status }) => {
  const shortcuts = [
    ...(availableScreens || []).map((screen) => ({
      key: screen.key,
      action: screen.name,
    })),
    { key: 'Q', action: 'Quit' },
    { key: 'Esc', action: 'Back' },
  ];

  const displayStatus = currentScreen ? `${currentScreen}${status ? ` • ${status}` : ''}` : status;

  return <Footer mode="interactive" shortcuts={shortcuts} status={displayStatus} />;
};

export default Footer;
