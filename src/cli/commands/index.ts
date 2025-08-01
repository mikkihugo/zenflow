/**
 * Command Exports
 *
 * This module exports all available CLI commands for registration
 * with the command registry.
 */

export { HelpCommand } from './help/index';
export { InitCommand } from './init/index';
export { StatusCommand } from './status/index';
export { SwarmCommand, SwarmListCommand, SwarmStartCommand, SwarmStopCommand } from './swarm/index';

// Command metadata for registration
export const AVAILABLE_COMMANDS = ['init', 'status', 'swarm', 'help'] as const;

export type AvailableCommand = (typeof AVAILABLE_COMMANDS)[number];
