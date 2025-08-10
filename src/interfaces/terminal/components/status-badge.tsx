/**
 * Unified Status Badge Component.
 *
 * Consolidates functionality from both command execution StatusBadge and interactive terminal SwarmStatusBadge.
 * Supports both standard and swarm-specific status displays.
 */
/**
 * @file Interface implementation: status-badge.
 */

import { Box, Text } from 'ink';
import type React from 'react';

export type StatusType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'pending'
  | 'active'
  | 'idle'
  | 'busy'
  | 'initializing'
  | 'completed'
  | 'failed'
  | 'in_progress';

export interface StatusBadgeProps {
  status: StatusType;
  text?: string;
  variant?: 'full' | 'minimal' | 'icon-only';
  showBorder?: boolean;
  testId?: string;
}

/**
 * Unified Status Badge Component.
 *
 * Displays status information with appropriate colors and icons.
 * Supports both standard and swarm-specific status types.
 *
 * @param root0
 * @param root0.status
 * @param root0.text
 * @param root0.variant
 * @param root0.showBorder
 * @param root0.testId
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  text,
  variant = 'full',
  showBorder = false,
  testId = 'status-badge',
}) => {
  const getStatusConfig = (status: StatusType) => {
    switch (status) {
      // Standard statuses
      case 'success':
      case 'completed':
        return { icon: '✅', color: 'green', bgColor: 'greenBright' };
      case 'error':
      case 'failed':
        return { icon: '❌', color: 'red', bgColor: 'redBright' };
      case 'warning':
        return { icon: '⚠️', color: 'yellow', bgColor: 'yellowBright' };
      case 'info':
        return { icon: 'ℹ️', color: 'blue', bgColor: 'blueBright' };
      case 'pending':
      case 'initializing':
        return { icon: '⏳', color: 'yellow', bgColor: 'yellowBright' };

      // Swarm-specific statuses
      case 'active':
        return { icon: '🟢', color: 'green', bgColor: 'greenBright' };
      case 'idle':
        return { icon: '⚪', color: 'gray', bgColor: 'white' };
      case 'busy':
        return { icon: '🔵', color: 'blue', bgColor: 'blueBright' };
      case 'in_progress':
        return { icon: '🔄', color: 'cyan', bgColor: 'cyanBright' };

      default:
        return { icon: '⚫', color: 'gray', bgColor: 'white' };
    }
  };

  const config = getStatusConfig(status);
  const displayText = text || status.replace('_', ' ').toUpperCase();

  const renderContent = () => {
    switch (variant) {
      case 'icon-only':
        return <Text color={config?.color}>{config?.icon}</Text>;

      case 'minimal':
        return (
          <Box>
            <Text color={config?.color}>{config?.icon}</Text>
            <Text> {displayText}</Text>
          </Box>
        );
      default:
        return (
          <Box>
            <Text color={config?.color} bold>
              {config?.icon} {displayText}
            </Text>
          </Box>
        );
    }
  };

  if (showBorder) {
    return (
      <Box borderStyle="single" borderColor={config?.color} paddingX={1}>
        {renderContent()}
      </Box>
    );
  }

  return renderContent();
};

// Convenience components for common status types
export const SuccessBadge: React.FC<{ text?: string }> = ({ text }) => (
  <StatusBadge status="success" text={text} />
);

export const ErrorBadge: React.FC<{ text?: string }> = ({ text }) => (
  <StatusBadge status="error" text={text} />
);

export const WarningBadge: React.FC<{ text?: string }> = ({ text }) => (
  <StatusBadge status="warning" text={text} />
);

export const InfoBadge: React.FC<{ text?: string }> = ({ text }) => (
  <StatusBadge status="info" text={text} />
);

export const PendingBadge: React.FC<{ text?: string }> = ({ text }) => (
  <StatusBadge status="pending" text={text} />
);

// Swarm-specific convenience components
export const ActiveBadge: React.FC<{ text?: string }> = ({ text }) => (
  <StatusBadge status="active" text={text} variant="minimal" />
);

export const IdleBadge: React.FC<{ text?: string }> = ({ text }) => (
  <StatusBadge status="idle" text={text} variant="minimal" />
);

export const BusyBadge: React.FC<{ text?: string }> = ({ text }) => (
  <StatusBadge status="busy" text={text} variant="minimal" />
);

export const InProgressBadge: React.FC<{ text?: string }> = ({ text }) => (
  <StatusBadge status="in_progress" text={text} />
);

export default StatusBadge;
