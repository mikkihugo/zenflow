/**
 * @file Integration module exports.
 */

import { getLogger } from '../core/logger.ts';

const logger = getLogger('src-integration-index');

/**
 * Integration Module - Barrel Export.
 *
 * Central export point for multi-system integration functionality.
 */

// Core integration components
export * from './multi-system-coordinator.ts';
export { MultiSystemCoordinator as default } from './multi-system-coordinator.ts';

// Integration utilities
export const IntegrationUtils = {
  /**
   * Validate system compatibility.
   *
   * @param systemA
   * @param systemB
   */
  validateCompatibility: (systemA: string, systemB: string): boolean => {
    const compatiblePairs = [
      ['neural', 'coordination'],
      ['memory', 'database'],
      ['interfaces', 'api'],
      ['workflows', 'coordination'],
    ];

    return compatiblePairs.some(
      (pair) =>
        (pair[0] === systemA && pair[1] === systemB) ||
        (pair[1] === systemA && pair[0] === systemB)
    );
  },

  /**
   * Get integration requirements.
   *
   * @param systems
   */
  getRequirements: (systems: string[]): string[] => {
    const requirements = new Set<string>();

    systems.forEach((system) => {
      switch (system) {
        case 'neural':
          requirements.add('wasm');
          requirements.add('memory');
          break;
        case 'database':
          requirements.add('storage');
          break;
        case 'coordination':
          requirements.add('mcp');
          requirements.add('agents');
          break;
      }
    });

    return Array.from(requirements);
  },

  /**
   * Check system health.
   *
   * @param system
   */
  checkSystemHealth: async (system: string): Promise<boolean> => {
    try {
      switch (system) {
        case 'neural': {
          const neural = await import('../neural/index.ts');
          return Boolean(neural);
        }
        case 'database': {
          const database = await import('../database/index.ts');
          return Boolean(database);
        }
        case 'coordination': {
          const coordination = await import('../coordination/index.ts');
          return Boolean(coordination);
        }
        default:
          return false;
      }
    } catch {
      return false;
    }
  },
};

// Integration factory
export class IntegrationFactory {
  private static coordinators = new Map<string, any>();

  /**
   * Create or get integration coordinator.
   *
   * @param systems
   * @param instanceKey
   */
  static async getCoordinator(
    systems: string[],
    instanceKey = 'default'
  ): Promise<unknown> {
    const key = `${systems.sort().join('-')}:${instanceKey}`;

    if (!IntegrationFactory.coordinators.has(key)) {
      const { MultiSystemCoordinator } = await import(
        './multi-system-coordinator.ts'
      );

      // Create a simple logger for the coordinator
      const logger = {
        debug: (_msg: string, _meta?: unknown) => {},
        info: (_msg: string, _meta?: unknown) => {},
        warn: (msg: string, meta?: unknown) =>
          logger.warn(`[MultiSystemCoordinator] ${msg}`, meta),
        error: (msg: string, meta?: unknown) =>
          logger.error(`[MultiSystemCoordinator] ${msg}`, meta),
      };

      // Create coordinator with logger and systems config
      const coordinator = new (MultiSystemCoordinator as any)(logger, {
        systems,
      });
      IntegrationFactory.coordinators.set(key, coordinator);
    }

    return IntegrationFactory.coordinators.get(key);
  }

  /**
   * Clear all coordinators.
   */
  static clearCoordinators(): void {
    IntegrationFactory.coordinators.clear();
  }
}
