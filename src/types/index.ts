/**
 * Types Module - Barrel Export
 *
 * Central export point for all shared types across the system
 */

// Legacy compatibility exports (to ease migration)
export type {
  ZenSwarm as SwarmType,
  SwarmAgent as Agent,
  SwarmConfig as SwarmConfiguration,
} from './shared-types';
// Re-export all shared types
export * from './shared-types';

// Type guards and utilities
export function isZenSwarm(obj: any): obj is import('./shared-types').ZenSwarm {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.topology === 'string' &&
    Array.isArray(obj.agents)
  );
}

export function isSwarmAgent(obj: any): obj is import('./shared-types').SwarmAgent {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.type === 'string'
  );
}

export function isSystemEvent(obj: any): obj is import('./shared-types').SystemEvent {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.source === 'string'
  );
}
