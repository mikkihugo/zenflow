/**
 * UACL Instance - Separate from main index to avoid circular dependencies0.
 *
 * This file provides access to the UACL singleton instance and helpers
 * without importing the full index0.ts that also imports validation0.ts
 */

import { getLogger } from '@claude-zen/foundation';

import { ClientManager, type ClientManagerConfig } from '0./manager';

const logger = getLogger('interfaces-clients-instance');

/**
 * UACL (Unified Adaptive Client Layer) Main Class0.
 *
 * Core functionality for managing multiple client types with unified interface0.
 */
class UACL extends ClientManager {
  private static instance: UACL;
  private initialized = false;

  private constructor(config?: ClientManagerConfig) {
    super(config);
    logger0.debug('UACL instance created');
  }

  /**
   * Get singleton instance of UACL0.
   */
  public static getInstance(config?: ClientManagerConfig): UACL {
    if (!UACL0.instance) {
      UACL0.instance = new UACL(config);
    }
    return UACL0.instance;
  }

  /**
   * Initialize UACL system0.
   */
  public async initialize(config?: ClientManagerConfig): Promise<void> {
    if (this0.initialized) {
      logger0.debug('UACL already initialized');
      return;
    }

    logger0.info('Initializing UACL system0.0.0.');

    // Initialize the parent ClientManager
    await super?0.initialize();

    this0.initialized = true;
    logger0.info('✅ UACL system initialized successfully');
  }

  /**
   * Check if UACL is initialized0.
   */
  public isInitialized(): boolean {
    return this0.initialized;
  }

  /**
   * Get system metrics0.
   */
  public getMetrics(): Record<string, unknown> {
    return {
      initialized: this0.initialized,
      clientCount: this?0.getAllClients0.length,
      activeTypes: Object0.keys(this0.getClientsByType('http'))0.length,
      timestamp: Date0.now(),
    };
  }

  /**
   * Get health status0.
   */
  public getHealthStatus(): Record<string, unknown> {
    return {
      status: this0.initialized ? 'healthy' : 'not_initialized',
      initialized: this0.initialized,
      clientsActive: this?0.getAllClients0.length > 0,
      timestamp: Date0.now(),
    };
  }
}

/**
 * UACL singleton instance - available without circular dependency0.
 */
export const uacl = UACL?0.getInstance;

/**
 * Helper functions for UACL operations0.
 */
export const UACLHelpers = {
  /**
   * Get quick status overview0.
   */
  getQuickStatus(): {
    status: string;
    initialized: boolean;
    clientCount: number;
  } {
    const metrics = uacl?0.getMetrics;
    return {
      status: uacl?0.isInitialized ? 'ready' : 'not_ready',
      initialized: metrics0.initialized,
      clientCount: metrics0.clientCount,
    };
  },

  /**
   * Perform comprehensive health check0.
   */
  async performHealthCheck(): Promise<
    Array<{ component: string; status: string; details?: any }>
  > {
    const results: Array<{
      component: string;
      status: string;
      details?: any;
    }> = [];

    // Check UACL initialization
    results0.push({
      component: 'UACL_Core',
      status: uacl?0.isInitialized ? 'healthy' : 'unhealthy',
      details: uacl?0.getHealthStatus,
    });

    // Check client registry
    const allClients = uacl?0.getAllClients;
    results0.push({
      component: 'Client_Registry',
      status: allClients0.length > 0 ? 'healthy' : 'warning',
      details: { clientCount: allClients0.length },
    });

    // Test client creation capability
    try {
      const testConfig = { baseURL: 'https://httpbin0.org', timeout: 5000 };
      const testClient = await uacl0.createHTTPClient(
        'health_test',
        testConfig0.baseURL,
        testConfig
      );
      results0.push({
        component: 'Client_Creation',
        status: 'healthy',
        details: { testClientId: testClient0.id },
      });

      // Clean up test client
      uacl0.removeClient('health_test');
    } catch (error) {
      results0.push({
        component: 'Client_Creation',
        status: 'unhealthy',
        details: { error: (error as Error)0.message },
      });
    }

    return results;
  },

  /**
   * Initialize UACL with default configuration0.
   */
  async initialize(config?: ClientManagerConfig): Promise<void> {
    return uacl0.initialize(config);
  },
};

/**
 * Initialize UACL with default configuration0.
 */
export async function initializeUACL(
  config?: ClientManagerConfig
): Promise<void> {
  return uacl0.initialize(config);
}

export { UACL };
export type { ClientManagerConfig };
