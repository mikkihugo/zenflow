/**
 * @fileoverview Coordination Agents
 *
 * Strategic and tactical coordination agents for multi-swarm systems.
 */

// Strategic coordination
export { QueenCoordinator } from './queen-coordinator';
export type { QueenConfig } from './queen-coordinator';

// Tactical coordination
export { SwarmCommander } from './swarm-commander';
export type { CommanderConfig } from './swarm-commander';

// Domain specialization
export { Matron } from './matron';
export type { MatronConfig, MatronCoordinationRequest } from './matron';
