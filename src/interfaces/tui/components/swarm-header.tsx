import { Box, Text } from 'ink';
import type React from 'react';
import type { SwarmStatus } from '../types';

export interface SwarmHeaderProps {
  title: string;
  version?: string;
  subtitle?: string;
  swarmStatus?: SwarmStatus;
  showBorder?: boolean;
  centerAlign?: boolean;
  testId?: string;
}

/**
 * SwarmHeader Component - Swarm-focused header for swarm applications
 *
 * Displays swarm application header with status, topology info, and real-time metrics.
 * Optimized for swarm orchestration and coordination display.
 */
export const SwarmHeader: React.FC<SwarmHeaderProps> = ({
  title,
  version,
  subtitle,
  swarmStatus,
  showBorder = true,
  centerAlign = false,
  testId = 'swarm-header',
}) => {
  const titleText = version ? `${title} v${version}` : title;

  const getStatusIcon = (status?: SwarmStatus['status']) => {
    switch (status) {
      case 'active':
        return '🟢';
      case 'initializing':
        return '🟡';
      case 'error':
        return '🔴';
      case 'idle':
        return '⚪';
      default:
        return '⚫';
    }
  };

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
          🐝 {titleText}
        </Text>
        {swarmStatus && (
          <Text color="gray">
            {' '}
            {getStatusIcon(swarmStatus.status)} {swarmStatus.status}
          </Text>
        )}
      </Box>

      {swarmStatus && (
        <Box justifyContent={centerAlign ? 'center' : 'flex-start'} marginTop={0}>
          <Text dimColor>
            Topology: {swarmStatus.topology} • Agents: {swarmStatus.activeAgents}/
            {swarmStatus.totalAgents}
          </Text>
        </Box>
      )}

      {subtitle && (
        <Box justifyContent={centerAlign ? 'center' : 'flex-start'} marginTop={0}>
          <Text dimColor>{subtitle}</Text>
        </Box>
      )}
    </Box>
  );
};

export default SwarmHeader;
