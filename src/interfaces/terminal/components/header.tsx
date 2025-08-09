/**
 * Unified Header Component.
 *
 * Consolidates functionality from both command execution Header and interactive terminal SwarmHeader.
 * Supports both standard and swarm-specific display modes.
 */
/**
 * @file Interface implementation: header
 */



import { Box, Text } from 'ink';
import type React from 'react';

export interface SwarmStatus {
  status: 'active' | 'initializing' | 'error' | 'idle';
  topology: string;
  totalAgents: number;
  activeAgents: number;
  uptime: number;
}

export interface HeaderProps {
  title: string;
  version?: string;
  subtitle?: string;
  swarmStatus?: SwarmStatus;
  showBorder?: boolean;
  centerAlign?: boolean;
  mode?: 'standard' | 'swarm';
  testId?: string;
}

/**
 * Unified Header Component.
 *
 * Displays application header with optional swarm status information.
 * Adapts display based on mode (standard command execution or swarm interactive terminal).
 *
 * @param root0
 * @param root0.title
 * @param root0.version
 * @param root0.subtitle
 * @param root0.swarmStatus
 * @param root0.showBorder
 * @param root0.centerAlign
 * @param root0.mode
 * @param root0.testId
 */
export const Header: React.FC<HeaderProps> = ({
  title,
  version,
  subtitle,
  swarmStatus,
  showBorder = true,
  centerAlign = false,
  mode = 'standard',
  testId = 'header',
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

  const formatUptime = (uptime: number): string => {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
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
      {/* Main title line */}
      <Box justifyContent={centerAlign ? 'center' : 'flex-start'}>
        <Text bold color="cyan">
          {mode === 'swarm' ? '🐝 ' : ''}
          {titleText}
        </Text>
        {swarmStatus && (
          <Text color="gray">
            {' '}
            {getStatusIcon(swarmStatus.status)} {swarmStatus.status}
          </Text>
        )}
      </Box>

      {/* Swarm status line */}
      {swarmStatus && mode === 'swarm' && (
        <Box justifyContent={centerAlign ? 'center' : 'flex-start'} marginTop={0}>
          <Text dimColor>
            Topology: {swarmStatus.topology} • Agents: {swarmStatus.activeAgents}/
            {swarmStatus.totalAgents}
            {swarmStatus.uptime > 0 && ` • Uptime: ${formatUptime(swarmStatus.uptime)}`}
          </Text>
        </Box>
      )}

      {/* Subtitle */}
      {subtitle && (
        <Box justifyContent={centerAlign ? 'center' : 'flex-start'} marginTop={0}>
          <Text dimColor>{subtitle}</Text>
        </Box>
      )}
    </Box>
  );
};

// Export specific variants for convenience.
export const StandardHeader: React.FC<Omit<HeaderProps, 'mode'>> = (props) => (
  <Header {...props} mode="standard" />
);

export const SwarmHeader: React.FC<Omit<HeaderProps, 'mode'>> = (props) => (
  <Header {...props} mode="swarm" />
);

export default Header;
