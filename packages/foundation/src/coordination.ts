/**
 * @fileoverview Coordination System Interface Delegation
 * 
 * Provides interface delegation to @claude-zen/coordination-core package following
 * the same architectural pattern as database and monitoring delegation.
 * 
 * Runtime imports prevent circular dependencies while providing unified access
 * to agent coordination functionality through foundation package.
 * 
 * Delegates to:
 * - @claude-zen/coordination-core: Agents, coordinators, swarm management
 * 
 * @author Claude Code Zen Team
 * @since 2.1.0 (Strategic Architecture v2.0.0)
 * @version 1.0.0
 */

import { getLogger } from './logging';

const logger = getLogger('foundation-coordination');

/**
 * Custom error types for coordination system operations
 */
export class CoordinationSystemError extends Error {
  public override cause?: Error;
  
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'CoordinationSystemError';
    this.cause = cause;
  }
}

export class CoordinationSystemConnectionError extends CoordinationSystemError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'CoordinationSystemConnectionError';
  }
}

/**
 * Coordination system module interface for accessing real coordination backends.
 * @internal
 */
interface CoordinationSystemModule {
  QueenCoordinator: any;
  SwarmCommander: any;
  Matron: any;
  createQueenCoordinator: (...args: any[]) => any;
  createSwarmCommander: (...args: any[]) => any;
  createMatron: (...args: any[]) => any;
}

/**
 * Coordination system access interface
 */
export interface CoordinationSystemAccess {
  /**
   * Create a new queen coordinator
   */
  createQueenCoordinator(config?: any): Promise<any>;
  
  /**
   * Create a new swarm commander
   */
  createSwarmCommander(config?: any): Promise<any>;
  
  /**
   * Create a new matron
   */
  createMatron(config?: any): Promise<any>;
}

/**
 * Coordination system configuration interface
 */
export interface CoordinationSystemConfig {
  maxAgents?: number;
  enableMetrics?: boolean;
  enableEventBroadcast?: boolean;
  coordinationTimeout?: number;
}

/**
 * Implementation of coordination system access via runtime delegation
 */
class CoordinationSystemAccessImpl implements CoordinationSystemAccess {
  private coordinationSystemModule: CoordinationSystemModule | null = null;
  
  private async getCoordinationSystemModule(): Promise<CoordinationSystemModule> {
    if (!this.coordinationSystemModule) {
      try {
        // Import the coordination-core package at runtime (matches database pattern)
        // this.coordinationSystemModule = await import('@claude-zen/coordination-core') as CoordinationSystemModule;
        logger.debug('Coordination system module loading temporarily disabled for build');
        throw new Error('Coordination system module loading temporarily disabled for build');
      } catch (error) {
        throw new CoordinationSystemConnectionError(
          'Coordination core package not available. Foundation requires @claude-zen/coordination-core for coordination operations.',
          error instanceof Error ? error : undefined
        );
      }
    }
    return this.coordinationSystemModule;
  }
  
  async createQueenCoordinator(config?: any): Promise<any> {
    const module = await this.getCoordinationSystemModule();
    logger.debug('Creating queen coordinator via foundation delegation', { config });
    return module.createQueenCoordinator(config);
  }
  
  async createSwarmCommander(config?: any): Promise<any> {
    const module = await this.getCoordinationSystemModule();
    logger.debug('Creating swarm commander via foundation delegation', { config });
    return module.createSwarmCommander(config);
  }
  
  async createMatron(config?: any): Promise<any> {
    const module = await this.getCoordinationSystemModule();
    logger.debug('Creating matron via foundation delegation', { config });
    return module.createMatron(config);
  }
}

// Global singleton instance
let globalCoordinationSystemAccess: CoordinationSystemAccess | null = null;

/**
 * Get coordination system access interface (singleton pattern)
 */
export function getCoordinationSystemAccess(): CoordinationSystemAccess {
  if (!globalCoordinationSystemAccess) {
    globalCoordinationSystemAccess = new CoordinationSystemAccessImpl();
    logger.info('Initialized global coordination system access');
  }
  return globalCoordinationSystemAccess;
}

/**
 * Create a queen coordinator through foundation delegation
 * @param config - Queen coordinator configuration
 */
export async function getQueenCoordinator(config?: CoordinationSystemConfig): Promise<any> {
  const coordinationSystem = getCoordinationSystemAccess();
  return coordinationSystem.createQueenCoordinator(config);
}

/**
 * Create a swarm commander through foundation delegation  
 * @param config - Swarm commander configuration
 */
export async function getSwarmCommander(config?: CoordinationSystemConfig): Promise<any> {
  const coordinationSystem = getCoordinationSystemAccess();
  return coordinationSystem.createSwarmCommander(config);
}

/**
 * Create a matron through foundation delegation  
 * @param config - Matron configuration
 */
export async function getMatron(config?: CoordinationSystemConfig): Promise<any> {
  const coordinationSystem = getCoordinationSystemAccess();
  return coordinationSystem.createMatron(config);
}

// Professional coordination system object with proper naming (matches Storage/Telemetry patterns)
export const coordinationSystem = {
  getAccess: getCoordinationSystemAccess,
  getQueenCoordinator: getQueenCoordinator,
  getSwarmCommander: getSwarmCommander,
  getMatron: getMatron
};

// Type exports for external consumers
// Types are already exported above with their definitions