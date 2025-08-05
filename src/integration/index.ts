/**
 * Integration Module - Barrel Export
 *
 * Central export point for multi-system integration functionality
 */

// Core integration components
export * from './multi-system-coordinator';
export { MultiSystemCoordinator as default } from './multi-system-coordinator';

// Integration utilities
export const IntegrationUtils = {
  /**
   * Validate system compatibility
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
        (pair[0] === systemA && pair[1] === systemB) || (pair[1] === systemA && pair[0] === systemB)
    );
  },

  /**
   * Get integration requirements
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
   * Check system health
   */
  checkSystemHealth: async (system: string): Promise<boolean> => {
    try {
      switch (system) {
        case 'neural': {
          const neural = await import('../neural/index');
          return Boolean(neural);
        }
        case 'database': {
          const database = await import('../database/index');
          return Boolean(database);
        }
        case 'coordination': {
          const coordination = await import('../coordination/index');
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
   * Create or get integration coordinator
   */
  static async getCoordinator(systems: string[], instanceKey = 'default'): Promise<any> {
    const key = `${systems.sort().join('-')}:${instanceKey}`;

    if (!IntegrationFactory.coordinators.has(key)) {
      const { MultiSystemCoordinator } = await import('./multi-system-coordinator');
      const coordinator = new MultiSystemCoordinator(systems);
      IntegrationFactory.coordinators.set(key, coordinator);
    }

    return IntegrationFactory.coordinators.get(key);
  }

  /**
   * Clear all coordinators
   */
  static clearCoordinators(): void {
    IntegrationFactory.coordinators.clear();
  }
}
