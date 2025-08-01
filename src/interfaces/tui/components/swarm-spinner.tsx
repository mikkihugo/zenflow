import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';

export interface SwarmSpinnerProps {
  text?: string;
  type?: 'swarm' | 'neural' | 'coordination' | 'processing';
  color?: string;
  speed?: number;
  testId?: string;
}

/**
 * SwarmSpinner Component - Swarm-focused loading animations
 * 
 * Displays swarm-themed loading animations with neural network and coordination patterns.
 * Optimized for swarm operations: agent spawning, task coordination, neural training.
 */
export const SwarmSpinner: React.FC<SwarmSpinnerProps> = ({
  text = 'Coordinating swarm...',
  type = 'swarm',
  color = 'cyan',
  speed = 120,
  testId = 'swarm-spinner',
}) => {
  const [frame, setFrame] = useState(0);
  
  const swarmAnimations = {
    // Swarm coordination pattern - hexagonal/hive-like
    swarm: ['🐝', '🔗', '🌐', '⚡', '🧠', '💫'],
    
    // Neural network training pattern
    neural: ['🧠', '⚡', '🔄', '💡', '🎯', '✨'],
    
    // Agent coordination pattern
    coordination: ['👥', '🔄', '📊', '⚙️', '🎯', '✅'],
    
    // Task processing pattern
    processing: ['⚡', '🔄', '📈', '🎯', '✨', '🚀'],
  };
  
  const frames = swarmAnimations[type] || swarmAnimations.swarm;
  
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

// Swarm-specific spinner presets
export const SwarmSpinnerPresets = {
  initializing: { type: 'swarm' as const, text: 'Initializing swarm...', color: 'cyan' },
  spawningAgents: { type: 'coordination' as const, text: 'Spawning agents...', color: 'yellow' },
  neuralTraining: { type: 'neural' as const, text: 'Training neural patterns...', color: 'magenta' },
  processing: { type: 'processing' as const, text: 'Processing tasks...', color: 'green' },
  coordinating: { type: 'swarm' as const, text: 'Coordinating swarm...', color: 'blue' },
};

export default SwarmSpinner;