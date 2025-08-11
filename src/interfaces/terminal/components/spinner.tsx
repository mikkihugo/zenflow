/**
 * Unified Spinner Component.
 *
 * Consolidates functionality from both command execution Spinner and interactive terminal SwarmSpinner.
 * Supports both standard and swarm-specific animation types.
 */
/**
 * @file Interface implementation: spinner.
 */

import { Box, Text } from 'ink';
import React from 'react';
import { useEffect, useState } from 'react';

export interface SpinnerProps {
  text?: string;
  type?:
    | 'dots'
    | 'line'
    | 'arc'
    | 'bounce'
    | 'swarm'
    | 'neural'
    | 'coordination'
    | 'processing';
  color?: string;
  speed?: number;
  testId?: string;
}

/**
 * Unified Spinner Component.
 *
 * Displays animated loading spinner with both standard and swarm-specific animations.
 * Supports customizable text, colors, and animation speed.
 *
 * @param root0
 * @param root0.text
 * @param root0.type
 * @param root0.color
 * @param root0.speed
 * @param root0.testId
 */
export const Spinner: React.FC<SpinnerProps> = ({
  text = 'Loading...',
  type = 'dots',
  color = 'cyan',
  speed = 80,
  testId = 'spinner',
}) => {
  const [frame, setFrame] = useState(0);

  // Standard animations (from command execution mode)
  const standardAnimations = {
    dots: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
    line: ['-', '\\', '|', '/'],
    arc: ['◜', '◝', '◞', '◟'],
    bounce: ['⠁', '⠂', '⠄', '⡀', '⢀', '⠠', '⠐', '⠈'],
  };

  // Swarm-specific animations (from TUI)
  const swarmAnimations = {
    swarm: ['🐝', '🔗', '🌐', '⚡', '🧠', '💫'],
    neural: ['🧠', '⚡', '🔄', '💡', '🎯', '✨'],
    coordination: ['👥', '🔄', '📊', '⚙️', '🎯', '✅'],
    processing: ['⚡', '🔄', '📈', '🎯', '✨', '🚀'],
  };

  // Determine which animation set to use
  const isSwarmType = [
    'swarm',
    'neural',
    'coordination',
    'processing',
  ].includes(type);
  const animations = isSwarmType ? swarmAnimations : standardAnimations;
  const frames: string[] =
    animations[type as keyof typeof animations] || standardAnimations.dots;

  // Adjust speed for swarm animations (they tend to be more visual, so slower)
  const adjustedSpeed = isSwarmType ? Math.max(speed, 120) : speed;

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prevFrame) => (prevFrame + 1) % frames.length);
    }, adjustedSpeed);

    return () => clearInterval(interval);
  }, [type, speed]); // Use stable props instead of computed values

  return (
    <Box>
      <Text color={color}>{frames[frame]}</Text>
      {text && <Text> {text}</Text>}
    </Box>
  );
};

// Preset spinner configurations combining both command execution and interactive terminal presets
export const SpinnerPresets = {
  // Standard presets (from command execution mode)
  loading: { type: 'dots' as const, text: 'Loading...', color: 'cyan' },
  processing_standard: {
    type: 'arc' as const,
    text: 'Processing...',
    color: 'yellow',
  },
  thinking: { type: 'bounce' as const, text: 'Thinking...', color: 'magenta' },
  working: { type: 'line' as const, text: 'Working...', color: 'green' },

  // Swarm presets (from TUI)
  initializing: {
    type: 'swarm' as const,
    text: 'Initializing swarm...',
    color: 'cyan',
  },
  spawningAgents: {
    type: 'coordination' as const,
    text: 'Spawning agents...',
    color: 'yellow',
  },
  neuralTraining: {
    type: 'neural' as const,
    text: 'Training neural patterns...',
    color: 'magenta',
  },
  processing: {
    type: 'processing' as const,
    text: 'Processing tasks...',
    color: 'green',
  },
  coordinating: {
    type: 'swarm' as const,
    text: 'Coordinating swarm...',
    color: 'blue',
  },
};

// Convenience components for common use cases
export const LoadingSpinner: React.FC<{ text?: string }> = ({ text }) => (
  <Spinner
    {...SpinnerPresets.loading}
    text={text ?? undefined}
  />
);

export const SwarmSpinner: React.FC<{
  text?: string;
  type?: 'swarm' | 'neural' | 'coordination' | 'processing';
}> = ({ text, type = 'swarm' }) => (
  <Spinner
    type={type}
    text={text ?? undefined}
    color="cyan"
    speed={120}
  />
);

export default Spinner;
