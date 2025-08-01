import { Box, Text } from 'ink';
import type React from 'react';
import { defaultTheme } from '../index';
import type { BaseComponentProps, StatusType } from './index';

export interface StatusBadgeProps extends BaseComponentProps {
  status: StatusType;
  text?: string;
  showIcon?: boolean;
  variant?: 'solid' | 'outline' | 'minimal';
  size?: 'small' | 'medium' | 'large';
}

/**
 * StatusBadge Component
 *
 * Displays status indicators with icons and text.
 * Supports multiple status types and visual variants.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  text,
  showIcon = true,
  variant = 'solid',
  size = 'medium',
  testId = 'status-badge',
}) => {
  const statusConfig = {
    success: {
      color: 'green',
      icon: defaultTheme.symbols.check,
      defaultText: 'Success',
    },
    error: {
      color: 'red',
      icon: defaultTheme.symbols.cross,
      defaultText: 'Error',
    },
    warning: {
      color: 'yellow',
      icon: defaultTheme.symbols.warning,
      defaultText: 'Warning',
    },
    info: {
      color: 'blue',
      icon: defaultTheme.symbols.info,
      defaultText: 'Info',
    },
    pending: {
      color: 'gray',
      icon: '⏳',
      defaultText: 'Pending',
    },
  };

  const config = statusConfig[status];
  const displayText = text || config.defaultText;

  const getBorderStyle = () => {
    if (variant === 'outline') return 'round';
    return undefined;
  };

  const getPadding = () => {
    if (variant === 'solid' || variant === 'outline') {
      return size === 'small' ? 0 : size === 'large' ? 1 : 0;
    }
    return 0;
  };

  return (
    <Box
      borderStyle={getBorderStyle()}
      borderColor={variant === 'outline' ? config.color : undefined}
      padding={getPadding()}
      display="inline-flex"
    >
      <Text color={config.color} bold={variant === 'solid'} dimColor={variant === 'minimal'}>
        {showIcon && (
          <>
            {config.icon}
            {displayText ? ' ' : ''}
          </>
        )}
        {displayText}
      </Text>
    </Box>
  );
};

// Preset status badge configurations
export const StatusBadgePresets = {
  online: { status: 'success' as const, text: 'Online', showIcon: true },
  offline: { status: 'error' as const, text: 'Offline', showIcon: true },
  loading: { status: 'pending' as const, text: 'Loading', showIcon: true },
  ready: { status: 'success' as const, text: 'Ready', showIcon: true },
  failed: { status: 'error' as const, text: 'Failed', showIcon: true },
  warning: { status: 'warning' as const, text: 'Warning', showIcon: true },
};

// Default export for convenience
export default StatusBadge;
