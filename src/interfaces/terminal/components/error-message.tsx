/**
 * Unified Error Message Component
 *
 * Displays error messages with appropriate styling and optional actions.
 * Consolidates error display functionality from both command execution and interactive terminal interfaces.
 */

import { Box, Text } from 'ink';
import type React from 'react';

export interface ErrorMessageProps {
  error: string | Error;
  title?: string;
  showStack?: boolean;
  showBorder?: boolean;
  variant?: 'standard' | 'critical' | 'warning';
  actions?: Array<{ key: string; action: string }>;
  testId?: string;
}

/**
 * Unified Error Message Component
 *
 * Displays error information with context-appropriate styling and actions.
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  title = 'Error',
  showStack = false,
  showBorder = true,
  variant = 'standard',
  actions,
  testId = 'error-message',
}) => {
  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : undefined;

  const getVariantConfig = () => {
    switch (variant) {
      case 'critical':
        return {
          color: 'redBright',
          borderColor: 'red',
          icon: '🚨',
          prefix: 'CRITICAL ERROR',
        };
      case 'warning':
        return {
          color: 'yellow',
          borderColor: 'yellow',
          icon: '⚠️',
          prefix: 'WARNING',
        };
      case 'standard':
      default:
        return {
          color: 'red',
          borderColor: 'red',
          icon: '❌',
          prefix: 'ERROR',
        };
    }
  };

  const config = getVariantConfig();
  const displayTitle = title === 'Error' ? config.prefix : title;

  return (
    <Box flexDirection="column">
      {/* Error header */}
      <Box
        borderStyle={showBorder ? 'single' : undefined}
        borderColor={config.borderColor}
        padding={showBorder ? 1 : 0}
        marginBottom={showBorder ? 0 : 1}
      >
        <Box flexDirection="column">
          <Text bold color={config.color}>
            {config.icon} {displayTitle}
          </Text>

          <Box marginTop={1}>
            <Text color={config.color}>{errorMessage}</Text>
          </Box>
        </Box>
      </Box>

      {/* Stack trace */}
      {showStack && errorStack && (
        <Box borderStyle="single" borderColor="gray" padding={1} marginTop={1}>
          <Box flexDirection="column">
            <Text bold color="gray" dimColor>
              Stack Trace:
            </Text>
            <Text color="gray" dimColor>
              {errorStack}
            </Text>
          </Box>
        </Box>
      )}

      {/* Available actions */}
      {actions && actions.length > 0 && (
        <Box marginTop={1}>
          <Text color="gray">
            Available actions:{' '}
            {actions.map((action) => `[${action.key}] ${action.action}`).join(' ')}
          </Text>
        </Box>
      )}
    </Box>
  );
};

// Convenience components for different error types
export const StandardError: React.FC<Omit<ErrorMessageProps, 'variant'>> = (props) => (
  <ErrorMessage {...props} variant="standard" />
);

export const CriticalError: React.FC<Omit<ErrorMessageProps, 'variant'>> = (props) => (
  <ErrorMessage {...props} variant="critical" />
);

export const WarningMessage: React.FC<Omit<ErrorMessageProps, 'variant'>> = (props) => (
  <ErrorMessage {...props} variant="warning" />
);

// Command error component with retry actions
export const CommandError: React.FC<{
  command: string;
  error: string | Error;
  showRetry?: boolean;
}> = ({ command, error, showRetry = true }) => {
  const actions = showRetry
    ? [
        { key: 'R', action: 'Retry' },
        { key: 'Q', action: 'Quit' },
      ]
    : [{ key: 'Q', action: 'Quit' }];

  return (
    <ErrorMessage
      error={error}
      title={`Command Failed: ${command}`}
      variant="standard"
      actions={actions}
    />
  );
};

// Swarm error component with coordination context
export const SwarmError: React.FC<{
  operation: string;
  error: string | Error;
  agentId?: string;
}> = ({ operation, error, agentId }) => {
  const title = agentId ? `Swarm Error (Agent: ${agentId})` : 'Swarm Error';

  const enhancedError = `Operation: ${operation}\n${error instanceof Error ? error.message : error}`;

  return (
    <ErrorMessage
      error={enhancedError}
      title={title}
      variant="critical"
      actions={[
        { key: 'R', action: 'Retry Operation' },
        { key: 'S', action: 'Skip Agent' },
        { key: 'Q', action: 'Quit' },
      ]}
    />
  );
};

export default ErrorMessage;
