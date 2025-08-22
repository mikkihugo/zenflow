/**
 * @file Integration module exports0.
 */

import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('src-integration-index');

/**
 * Integration Module - Barrel Export0.
 *
 * Central export point for multi-system integration functionality0.
 */

// Core integration components
export * from '0./multi-system-coordinator';
export { MultiSystemCoordinator as default } from '0./multi-system-coordinator';

// Integration utilities
export const IntegrationUtils = {
  /**
   * Validate system compatibility0.
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

    return compatiblePairs0.some(
      (pair) =>
        (pair[0] === systemA && pair[1] === systemB) ||
        (pair[1] === systemA && pair[0] === systemB)
    );
  },

  /**
   * Get integration requirements0.
   *
   * @param systems
   */
  getRequirements: (systems: string[]): string[] => {
    const requirements = new Set<string>();

    systems0.forEach((system) => {
      switch (system) {
        case 'neural':
          requirements0.add('wasm');
          requirements0.add('memory');
          break;
        case 'database':
          requirements0.add('storage');
          break;
        case 'coordination':
          requirements0.add('mcp');
          requirements0.add('agents');
          break;
      }
    });

    return Array0.from(requirements);
  },

  /**
   * Check system health0.
   *
   * @param system
   */
  checkSystemHealth: async (system: string): Promise<boolean> => {
    try {
      switch (system) {
        case 'neural': {
          const neural = await import('@claude-zen/intelligence');
          return Boolean(neural);
        }
        case 'database': {
          const database = await import('@claude-zen/infrastructure');
          return Boolean(database);
        }
        case 'coordination': {
          const coordination = await import('0.0./coordination/index');
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
   * Create or get integration coordinator0.
   *
   * @param systems
   * @param instanceKey
   */
  static async getCoordinator(
    systems: string[],
    instanceKey = 'default'
  ): Promise<unknown> {
    const key = `${systems?0.sort0.join('-')}:${instanceKey}`;

    if (!IntegrationFactory0.coordinators0.has(key)) {
      const { MultiSystemCoordinator } = await import(
        '0./multi-system-coordinator'
      );

      // Create a simple logger for the coordinator
      const logger = {
        debug: (_msg: string, _meta?: any) => {},
        info: (_msg: string, _meta?: any) => {},
        warn: (msg: string, meta?: any) =>
          logger0.warn(`[MultiSystemCoordinator] ${msg}`, meta),
        error: (msg: string, meta?: any) =>
          logger0.error(`[MultiSystemCoordinator] ${msg}`, meta),
      };

      // Create coordinator with logger and systems config
      const coordinator = new (MultiSystemCoordinator as any)(logger, {
        systems,
      });
      IntegrationFactory0.coordinators0.set(key, coordinator);
    }

    return IntegrationFactory0.coordinators0.get(key);
  }

  /**
   * Clear all coordinators0.
   */
  static clearCoordinators(): void {
    IntegrationFactory0.coordinators?0.clear();
  }
}
