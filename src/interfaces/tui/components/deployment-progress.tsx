/**
 * @file Deployment Progress Component for TUI - Shows per-swarm deployment status
 */

import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import type React from 'react';
import type { DeploymentStatus } from '../types.js';
import { ProgressBar } from './progress-bar.js';

export interface DeploymentProgressProps {
  domain: string;
  status: DeploymentStatus;
}

export const DeploymentProgress: React.FC<DeploymentProgressProps> = ({
  domain,
  status,
}) => {
  const getStatusIcon = (statusValue: DeploymentStatus['status']) => {
    switch (statusValue) {
      case 'pending':
        return '⏳';
      case 'deploying':
        return <Spinner type="dots" />;
      case 'deployed':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '❓';
    }
  };

  const getStatusColor = (statusValue: DeploymentStatus['status']) => {
    switch (statusValue) {
      case 'pending':
        return 'yellow';
      case 'deploying':
        return 'cyan';
      case 'deployed':
        return 'green';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatDomain = (domain: string) => {
    return domain.charAt(0).toUpperCase() + domain.slice(1).replace(/-/g, ' ');
  };

  return (
    <Box flexDirection="column" marginBottom={1}>
      {/* Header with domain name and status */}
      <Box marginBottom={0}>
        <Box width={3}>{getStatusIcon(status)}</Box>
        <Text bold color={getStatusColor(status.status)}>
          {formatDomain(domain)}
        </Text>
        <Text dimColor> ({status.status})</Text>
        <Box marginLeft={2}>
          <Text dimColor>
            🤖 {status.agents.created}/{status.agents.total} agents
          </Text>
        </Box>
      </Box>

      {/* Progress bar (only show during deployment) */}
      {status.status === 'deploying' && (
        <Box marginLeft={3} marginBottom={0}>
          <ProgressBar
            current={status.progress}
            total={100}
            width={30}
            showPercentage
            color="cyan"
          />
        </Box>
      )}

      {/* Status message */}
      <Box marginLeft={3}>
        <Text dimColor>{status.message}</Text>
      </Box>

      {/* Agent creation progress (during deployment) */}
      {status.status === 'deploying' && status.agents.total > 0 && (
        <Box marginLeft={3}>
          <Text dimColor>Agent Progress:</Text>
          <ProgressBar
            current={status.agents.created}
            total={status.agents.total}
            width={20}
            color="magenta"
          />
        </Box>
      )}

      {/* Success details (when deployed) */}
      {status.status === 'deployed' && (
        <Box marginLeft={3}>
          <Text color="green">
            🎉 Swarm operational with {status.agents.created} active agents
          </Text>
        </Box>
      )}

      {/* Error details (when failed) */}
      {status.status === 'failed' && (
        <Box marginLeft={3}>
          <Text color="red">💥 Deployment failed: {status.message}</Text>
        </Box>
      )}
    </Box>
  );
};
