/**
 * Unified Progress Bar Component.
 *
 * Consolidates progress bar functionality from both command execution and interactive terminal interfaces.
 * Supports both standard and swarm-specific progress displays.
 */
/**
 * @file Interface implementation: progress-bar.
 */

import { Box, Text } from 'ink';
import React from 'react';

export interface ProgressBarProps {
  progress: number; // 0-100
  total?: number;
  current?: number;
  label?: string;
  showPercentage?: boolean;
  showNumbers?: boolean;
  width?: number;
  color?: string;
  backgroundColor?: string;
  variant?: 'standard' | 'swarm' | 'neural';
  testId?: string;
}

/**
 * Unified Progress Bar Component.
 *
 * Displays progress with customizable styling and information.
 * Supports different visual variants for different contexts.
 *
 * @param root0
 * @param root0.progress
 * @param root0.total
 * @param root0.current
 * @param root0.label
 * @param root0.showPercentage
 * @param root0.showNumbers
 * @param root0.width
 * @param root0.color
 * @param root0.backgroundColor
 * @param root0.variant
 * @param root0.testId
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  total,
  current,
  label,
  showPercentage = true,
  showNumbers = false,
  width = 30,
  color = 'green',
  backgroundColor = 'gray',
  variant = 'standard',
  testId = 'progress-bar',
}) => {
  // Ensure progress is within bounds
  const normalizedProgress = Math.max(0, Math.min(100, progress));
  const filledWidth = Math.round((normalizedProgress / 100) * width);
  const emptyWidth = width - filledWidth;

  // Different character sets for different variants
  const getProgressChars = () => {
    switch (variant) {
      case 'swarm':
        return {
          filled: '🐝',
          empty: '⬜',
          prefix: '🔗',
        };
      case 'neural':
        return {
          filled: '🧠',
          empty: '⚪',
          prefix: '⚡',
        };
      default:
        return {
          filled: '█',
          empty: '░',
          prefix: '▶',
        };
    }
  };

  const chars = getProgressChars();

  // Calculate display values
  const percentage = Math.round(normalizedProgress);
  const currentValue =
    current !== undefined
      ? current
      : Math.round((normalizedProgress / 100) * (total || 100));
  const totalValue = total || 100;

  return (
    <Box flexDirection="column">
      {/* Label */}
      {label && (
        <Box marginBottom={0}>
          <Text>
            {chars.prefix} {label}
          </Text>
        </Box>
      )}

      {/* Progress bar */}
      <Box>
        <Text color={color}>{'█'.repeat(filledWidth)}</Text>
        <Text color={backgroundColor}>{'░'.repeat(emptyWidth)}</Text>

        {/* Progress information */}
        <Text> </Text>

        {showPercentage && (
          <Text
            color={color}
            bold
          >
            {percentage}%
          </Text>
        )}

        {showNumbers && (
          <Text color="gray">
            {showPercentage ? ' ' : ''}({currentValue}/{totalValue})
          </Text>
        )}
      </Box>
    </Box>
  );
};

// Convenience components for specific use cases.
export const StandardProgressBar: React.FC<
  Omit<ProgressBarProps, 'variant'>
> = (props) => (
  <ProgressBar
    {...props}
    variant="standard"
  />
);

export const SwarmProgressBar: React.FC<Omit<ProgressBarProps, 'variant'>> = (
  props,
) => (
  <ProgressBar
    {...props}
    variant="swarm"
    color="cyan"
  />
);

export const NeuralProgressBar: React.FC<Omit<ProgressBarProps, 'variant'>> = (
  props,
) => (
  <ProgressBar
    {...props}
    variant="neural"
    color="magenta"
  />
);

// Task progress component with predefined styling
export const TaskProgress: React.FC<{
  completed: number;
  total: number;
  label?: string;
}> = ({ completed, total, label }) => {
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <ProgressBar
      progress={progress}
      current={completed}
      total={total}
      label={label}
      showNumbers={true}
      showPercentage={true}
      width={25}
      color="green"
    />
  );
};

// Agent coordination progress component
export const AgentProgress: React.FC<{
  active: number;
  total: number;
  label?: string;
}> = ({ active, total, label = 'Agents' }) => {
  const progress = total > 0 ? (active / total) * 100 : 0;

  return (
    <SwarmProgressBar
      progress={progress}
      current={active}
      total={total}
      label={label}
      showNumbers={true}
      showPercentage={false}
      width={20}
    />
  );
};

export default ProgressBar;
