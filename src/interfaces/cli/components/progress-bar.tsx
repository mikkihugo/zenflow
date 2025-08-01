import React from 'react';
import { Box, Text } from 'ink';
import { BaseComponentProps } from './index';

export interface ProgressBarProps extends BaseComponentProps {
  current: number;
  total: number;
  width?: number;
  showPercentage?: boolean;
  showNumbers?: boolean;
  label?: string;
  color?: string;
  backgroundColor?: string;
  fillChar?: string;
  emptyChar?: string;
}

/**
 * ProgressBar Component
 * 
 * Displays a visual progress bar with percentage and optional labels.
 * Supports customizable styling and progress indicators.
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  width = 40,
  showPercentage = true,
  showNumbers = false,
  label,
  color = 'green',
  backgroundColor = 'gray',
  fillChar = '█',
  emptyChar = '░',
  testId = 'progress-bar',
}) => {
  // Ensure values are within bounds
  const safeCurrent = Math.max(0, Math.min(current, total));
  const percentage = total > 0 ? (safeCurrent / total) * 100 : 0;
  const filledWidth = Math.round((percentage / 100) * width);
  const emptyWidth = width - filledWidth;
  
  const progressText = (
    <Text>
      <Text color={color}>
        {fillChar.repeat(filledWidth)}
      </Text>
      <Text color={backgroundColor}>
        {emptyChar.repeat(emptyWidth)}
      </Text>
    </Text>
  );
  
  return (
    <Box flexDirection="column">
      {label && (
        <Box marginBottom={0}>
          <Text>
            {label}
          </Text>
        </Box>
      )}
      
      <Box>
        {progressText}
        
        {showPercentage && (
          <Text>
            {' '}
            {percentage.toFixed(1)}%
          </Text>
        )}
        
        {showNumbers && (
          <Text dimColor>
            {' ('}
            {safeCurrent}
            /
            {total}
            {')'}
          </Text>
        )}
      </Box>
    </Box>
  );
};

// Utility function to create progress bar with common configurations
export const createProgressBar = (
  current: number,
  total: number,
  options: Partial<ProgressBarProps> = {}
) => {
  return (
    <ProgressBar
      current={current}
      total={total}
      {...options}
    />
  );
};

// Default export for convenience
export default ProgressBar;
