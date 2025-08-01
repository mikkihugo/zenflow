import { Box, Text } from 'ink';
import type React from 'react';

export interface SwarmStatusBadgeProps {
  status: 'active' | 'idle' | 'busy' | 'error' | 'initializing' | 'coordinating';
  text?: string;
  variant?: 'default' | 'minimal' | 'detailed';
  showIcon?: boolean;
  agentCount?: number;
  testId?: string;
}

/**
 * SwarmStatusBadge Component - Swarm-focused status indicators
 *
 * Displays swarm status with agent-aware styling and swarm-specific states.
 * Supports multi-agent status aggregation and coordination states.
 */
export const SwarmStatusBadge: React.FC<SwarmStatusBadgeProps> = ({
  status,
  text,
  variant = 'default',
  showIcon = true,
  agentCount,
  testId = 'swarm-status-badge',
}) => {
  const getStatusConfig = (status: SwarmStatusBadgeProps['status']) => {
    const configs = {
      active: { color: 'green', icon: '🟢', bgChar: '●' },
      idle: { color: 'blue', icon: '🔵', bgChar: '●' },
      busy: { color: 'yellow', icon: '🟡', bgChar: '●' },
      error: { color: 'red', icon: '🔴', bgChar: '●' },
      initializing: { color: 'cyan', icon: '🔄', bgChar: '○' },
      coordinating: { color: 'magenta', icon: '🐝', bgChar: '◐' },
    };
    return configs[status];
  };

  const config = getStatusConfig(status);
  const displayText = text || status.toUpperCase();

  if (variant === 'minimal') {
    return (
      <Box>
        {showIcon && <Text color={config.color}>{config.icon}</Text>}
        <Text color={config.color}>
          {!showIcon ? '' : ' '}
          {displayText}
        </Text>
        {agentCount !== undefined && <Text dimColor> ({agentCount})</Text>}
      </Box>
    );
  }

  if (variant === 'detailed') {
    return (
      <Box borderStyle="round" borderColor={config.color} paddingX={1}>
        {showIcon && <Text color={config.color}>{config.icon}</Text>}
        <Text color={config.color} bold>
          {!showIcon ? '' : ' '}
          {displayText}
        </Text>
        {agentCount !== undefined && <Text color={config.color}> [{agentCount} agents]</Text>}
      </Box>
    );
  }

  // Default variant
  return (
    <Box>
      <Text backgroundColor={config.color} color="black">
        {' '}
        {showIcon ? config.icon : config.bgChar} {displayText}
        {agentCount !== undefined ? ` (${agentCount})` : ''}{' '}
      </Text>
    </Box>
  );
};

export default SwarmStatusBadge;
