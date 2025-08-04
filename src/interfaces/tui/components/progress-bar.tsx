/**
 * @fileoverview Progress Bar Component for TUI
 */

import { Box, Text } from 'ink';
import type React from 'react';

export interface ProgressBarProps {
  current: number;
  total: number;
  width?: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  width = 40,
  label,
  showPercentage = false,
  color = 'cyan',
}) => {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));
  const filled = Math.floor((percentage / 100) * width);
  const empty = width - filled;

  const progressBar = '█'.repeat(filled) + '░'.repeat(empty);
  const percentageText = showPercentage ? ` ${percentage.toFixed(0)}%` : '';

  return (
    <Box flexDirection="column">
      {label && (
        <Box marginBottom={0}>
          <Text>{label}</Text>
        </Box>
      )}
      <Box>
        <Text color={color}>[{progressBar}]</Text>
        <Text>{percentageText}</Text>
        <Text dimColor>
          {' '}
          ({current}/{total})
        </Text>
      </Box>
    </Box>
  );
};
