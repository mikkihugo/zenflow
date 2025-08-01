import React from 'react';
import { Box, Text } from 'ink';

export interface SwarmProgressBarProps {
  current: number;
  total: number;
  width?: number;
  showPercentage?: boolean;
  showNumbers?: boolean;
  showAgentBreakdown?: boolean;
  agentProgress?: Array<{ id: string; progress: number; status: string }>;
  label?: string;
  color?: string;
  testId?: string;
}

/**
 * SwarmProgressBar Component - Swarm-focused progress visualization
 * 
 * Displays task progress with swarm agent breakdown and coordination metrics.
 * Shows individual agent contributions and overall swarm progress.
 */
export const SwarmProgressBar: React.FC<SwarmProgressBarProps> = ({
  current,
  total,
  width = 40,
  showPercentage = false,
  showNumbers = false,
  showAgentBreakdown = false,
  agentProgress = [],
  label,
  color = 'cyan',
  testId = 'swarm-progress-bar',
}) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  
  // Create swarm-themed progress bar with agent indicators
  const filledBar = '█'.repeat(filled);
  const emptyBar = '░'.repeat(empty);
  const bar = `${filledBar}${emptyBar}`;
  
  // Calculate agent contribution percentages
  const agentContributions = agentProgress.map(agent => ({
    ...agent,
    contribution: total > 0 ? (agent.progress / total) * 100 : 0
  }));
  
  return (
    <Box flexDirection="column">
      {label && (
        <Text bold color={color}>
          {label}
        </Text>
      )}
      
      <Box>
        <Text color={color}>
          [
        </Text>
        <Text color={color}>
          {bar}
        </Text>
        <Text color={color}>
          ]
        </Text>
        
        {showPercentage && (
          <Text color={color}>
            {' '}
            {percentage.toFixed(1)}%
          </Text>
        )}
        
        {showNumbers && (
          <Text dimColor>
            {' '}
            ({current}/{total})
          </Text>
        )}
      </Box>
      
      {showAgentBreakdown && agentContributions.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          <Text bold dimColor>
            Agent Contributions:
          </Text>
          {agentContributions.slice(0, 5).map((agent) => {
            const agentStatusIcon = {
              active: '🟢',
              busy: '🟡',
              idle: '🔵',
              error: '🔴',
            }[agent.status as keyof typeof agentStatusIcon] || '⚪';
            
            return (
              <Box key={agent.id}>
                <Text dimColor>
                  {agentStatusIcon} {agent.id}: {agent.progress} tasks ({agent.contribution.toFixed(1)}%)
                </Text>
              </Box>
            );
          })}
          {agentContributions.length > 5 && (
            <Text dimColor>
              ... and {agentContributions.length - 5} more agents
            </Text>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SwarmProgressBar;