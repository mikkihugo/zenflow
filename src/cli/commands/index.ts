/**
 * Command Exports
 * 
 * This module exports all available CLI commands for registration
 * with the command registry.
 */

export { InitCommand } from './init/index';
export { StatusCommand } from './status/index';
export { SwarmCommand, SwarmStartCommand, SwarmStopCommand, SwarmListCommand } from './swarm/index';
export { HelpCommand } from './help/index';

// Command metadata for registration
export const AVAILABLE_COMMANDS = [
  'init',
  'status', 
  'swarm',
  'help'
] as const;

export type AvailableCommand = typeof AVAILABLE_COMMANDS[number];
