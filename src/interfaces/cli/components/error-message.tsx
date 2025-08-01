import { Box, Text } from 'ink';
import type React from 'react';
import { defaultTheme } from '../index';
import type { BaseComponentProps } from './index';

export interface ErrorMessageProps extends BaseComponentProps {
  title?: string;
  message: string;
  details?: string | string[];
  showIcon?: boolean;
  variant?: 'error' | 'warning' | 'info';
  showBorder?: boolean;
  actions?: Array<{
    key: string;
    label: string;
    description?: string;
  }>;
}

/**
 * ErrorMessage Component
 *
 * Displays error messages with optional details and actions.
 * Supports different severity levels and formatting.
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  details,
  showIcon = true,
  variant = 'error',
  showBorder = true,
  actions = [],
  testId = 'error-message',
}) => {
  const variantConfig = {
    error: {
      color: 'red',
      icon: defaultTheme.symbols.cross,
      borderColor: 'red',
      defaultTitle: 'Error',
    },
    warning: {
      color: 'yellow',
      icon: defaultTheme.symbols.warning,
      borderColor: 'yellow',
      defaultTitle: 'Warning',
    },
    info: {
      color: 'blue',
      icon: defaultTheme.symbols.info,
      borderColor: 'blue',
      defaultTitle: 'Information',
    },
  };

  const config = variantConfig[variant];
  const displayTitle = title || config.defaultTitle;
  const detailsList = Array.isArray(details) ? details : details ? [details] : [];

  return (
    <Box
      flexDirection="column"
      borderStyle={showBorder ? 'round' : undefined}
      borderColor={showBorder ? config.borderColor : undefined}
      padding={showBorder ? 1 : 0}
      marginY={1}
    >
      {/* Title */}
      <Box marginBottom={message ? 1 : 0}>
        <Text bold color={config.color}>
          {showIcon && <>{config.icon} </>}
          {displayTitle}
        </Text>
      </Box>

      {/* Main message */}
      <Box marginBottom={detailsList.length > 0 ? 1 : 0}>
        <Text>{message}</Text>
      </Box>

      {/* Details */}
      {detailsList.length > 0 && (
        <Box flexDirection="column" marginBottom={actions.length > 0 ? 1 : 0}>
          {detailsList.map((detail, index) => (
            <Box key={index}>
              <Text dimColor>
                {defaultTheme.symbols.bullet} {detail}
              </Text>
            </Box>
          ))}
        </Box>
      )}

      {/* Actions */}
      {actions.length > 0 && (
        <Box flexDirection="column">
          <Text bold dimColor>
            Available actions:
          </Text>
          {actions.map((action, index) => (
            <Box key={index}>
              <Text color="cyan">{action.key}</Text>
              <Text>
                {' - '}
                {action.label}
              </Text>
              {action.description && (
                <Text dimColor>
                  {' ('}
                  {action.description}
                  {')'}
                </Text>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

// Utility functions for common error scenarios
export const createErrorMessage = (message: string, options: Partial<ErrorMessageProps> = {}) => {
  return <ErrorMessage message={message} {...options} />;
};

export const createValidationError = (field: string, requirement: string) => {
  return (
    <ErrorMessage
      title="Validation Error"
      message={`Invalid ${field}`}
      details={[requirement]}
      variant="warning"
    />
  );
};

// Default export for convenience
export default ErrorMessage;
