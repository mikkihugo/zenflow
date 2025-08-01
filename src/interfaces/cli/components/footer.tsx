import React from 'react';
import { Box, Text } from 'ink';
import { BaseComponentProps } from './index';

export interface FooterProps extends BaseComponentProps {
  helpText?: string;
  showBorder?: boolean;
  centerAlign?: boolean;
  shortcuts?: Array<{
    key: string;
    description: string;
  }>;
}

/**
 * Footer Component
 * 
 * Displays help text and keyboard shortcuts at the bottom of the interface.
 * Provides contextual help and navigation guidance.
 */
export const Footer: React.FC<FooterProps> = ({
  helpText = 'Press Ctrl+C to exit',
  showBorder = true,
  centerAlign = false,
  shortcuts = [],
  testId = 'footer',
}) => {
  return (
    <Box
      flexDirection="column"
      borderStyle={showBorder ? 'round' : undefined}
      borderColor="gray"
      padding={showBorder ? 1 : 0}
      marginTop={1}
    >
      {shortcuts.length > 0 && (
        <Box flexDirection="column" marginBottom={shortcuts.length > 0 ? 1 : 0}>
          {shortcuts.map((shortcut, index) => (
            <Box key={index} justifyContent="flex-start">
              <Text bold color="yellow">
                {shortcut.key}
              </Text>
              <Text dimColor>
                {' - '}
                {shortcut.description}
              </Text>
            </Box>
          ))}
        </Box>
      )}
      
      <Box justifyContent={centerAlign ? 'center' : 'flex-start'}>
        <Text dimColor>
          {helpText}
        </Text>
      </Box>
    </Box>
  );
};

// Default export for convenience
export default Footer;
