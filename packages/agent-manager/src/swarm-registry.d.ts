/**
 * @fileoverview Global Swarm Registry - Persistent swarm storage across CLI sessions
 *
 * This module provides a file-based registry for ephemeral swarms that persists
 * across CLI command invocations. Swarms are stored in a JSON file in the project
 * root directory to maintain state between commands within the same project.
 */
import type { EphemeralSwarm } from './types';
/**
 * Add a swarm to the global registry.
 */
export declare function registerSwarm(swarm: EphemeralSwarm): void;
/**
 * Get a swarm from the global registry.
 */
export declare function getSwarm(swarmId: string): EphemeralSwarm | undefined;
/**
 * Get all active swarms from the global registry.
 */
export declare function getAllSwarms(): EphemeralSwarm[];
/**
 * Update a swarm in the global registry.
 */
export declare function updateSwarm(swarm: EphemeralSwarm): void;
/**
 * Remove a swarm from the global registry.
 */
export declare function removeSwarm(swarmId: string): void;
/**
 * Clear all swarms from the global registry.
 */
export declare function clearRegistry(): void;
/**
 * Get the count of active swarms.
 */
export declare function getSwarmCount(): number;
//# sourceMappingURL=swarm-registry.d.ts.map