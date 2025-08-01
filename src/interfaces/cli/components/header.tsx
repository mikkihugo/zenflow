import { Box, Text } from 'ink';
import type React from 'react';
import type { BaseComponentProps } from './index';

export interface HeaderProps extends BaseComponentProps {
  title: string;
  version?: string;
  subtitle?: string;
  showBorder?: boolean;
  centerAlign?: boolean;
}

/**
 * Header Component
 *
 * Displays the application header with title, version, and optional subtitle.
 * Supports centered alignment and border styling.
 */
export const Header: React.FC<HeaderProps> = ({
  title,
  version,
  subtitle,
  showBorder = true,
  centerAlign = false,
  testId = 'header',
}) => {
  const titleText = version ? `${title} v${version}` : title;

  return (
    <Box
      flexDirection="column"
      borderStyle={showBorder ? 'round' : undefined}
      borderColor="cyan"
      padding={showBorder ? 1 : 0}
      marginBottom={1}
    >
      <Box justifyContent={centerAlign ? 'center' : 'flex-start'}>
        <Text bold color="cyan">
          {titleText}
        </Text>
      </Box>

      {subtitle && (
        <Box justifyContent={centerAlign ? 'center' : 'flex-start'} marginTop={0}>
          <Text dimColor>{subtitle}</Text>
        </Box>
      )}
    </Box>
  );
};

// Default export for convenience
export default Header;
