import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { BaseComponentProps } from './index';
import { defaultTheme } from '../index';

export interface SpinnerProps extends BaseComponentProps {
  text?: string;
  type?: 'dots' | 'line' | 'arc' | 'bounce';
  color?: string;
  speed?: number;
}

/**
 * Spinner Component
 * 
 * Displays an animated loading spinner with customizable text and style.
 * Supports multiple animation types and colors.
 */
export const Spinner: React.FC<SpinnerProps> = ({
  text = 'Loading...',
  type = 'dots',
  color = 'cyan',
  speed = 80,
  testId = 'spinner',
}) => {
  const [frame, setFrame] = useState(0);
  
  const animations = {
    dots: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
    line: ['-', '\\', '|', '/'],
    arc: ['◜', '◝', '◞', '◟'],
    bounce: ['⠁', '⠂', '⠄', '⡀', '⢀', '⠠', '⠐', '⠈'],
  };
  
  const frames = animations[type] || animations.dots;
  
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prevFrame) => (prevFrame + 1) % frames.length);
    }, speed);
    
    return () => clearInterval(interval);
  }, [frames.length, speed]);
  
  return (
    <Box>
      <Text color={color}>
        {frames[frame]}
      </Text>
      {text && (
        <Text>
          {' '}
          {text}
        </Text>
      )}
    </Box>
  );
};

// Preset spinner configurations
export const SpinnerPresets = {
  loading: { type: 'dots' as const, text: 'Loading...', color: 'cyan' },
  processing: { type: 'arc' as const, text: 'Processing...', color: 'yellow' },
  thinking: { type: 'bounce' as const, text: 'Thinking...', color: 'magenta' },
  working: { type: 'line' as const, text: 'Working...', color: 'green' },
};

// Default export for convenience
export default Spinner;
