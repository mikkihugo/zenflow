/**
 * UACL Instance - Separate from main index to avoid circular dependencies.
 *
 * This file provides access to the UACL singleton instance and helpers
 * without importing the full index.ts that also imports validation.ts
 */

import { getLogger } from '../../config/logging-config';
import { ClientManager, type ClientManagerConfig } from './manager';

const logger = getLogger('interfaces-clients-instance');

/**
 * UACL (Unified Adaptive Client Layer) Main Class.
 *
 * Core functionality for managing multiple client types with unified interface.
 */
class UACL extends ClientManager {
  private static instance: UACL;
  private initialized = false;

  private constructor(config?: ClientManagerConfig) {
    super(config);
    logger.debug('UACL instance created');
  }

  /**
   * Get singleton instance of UACL.
   */
  public static getInstance(config?: ClientManagerConfig): UACL {
    if (!UACL.instance) {
      UACL.instance = new UACL(config);
    }
    return UACL.instance;
  }

  /**
   * Initialize UACL system.
   */
  public async initialize(config?: ClientManagerConfig): Promise<void> {
    if (this.initialized) {
      logger.debug('UACL already initialized');
      return;
    }

    logger.info('Initializing UACL system...');

    // Initialize the parent ClientManager
    await super.initialize();

    this.initialized = true;
    logger.info('✅ UACL system initialized successfully');
  }

  /**
   * Check if UACL is initialized.
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get system metrics.
   */
  public getMetrics(): Record<string, unknown> {
    return {
      initialized: this.initialized,
      clientCount: this.getAllClients().length,
      activeTypes: Object.keys(this.getClientsByType('http')).length,
      timestamp: Date.now(),
    };
  }

  /**
   * Get health status.
   */
  public getHealthStatus(): Record<string, unknown> {
    return {
      status: this.initialized ? 'healthy' : 'not_initialized',
      initialized: this.initialized,
      clientsActive: this.getAllClients().length > 0,
      timestamp: Date.now(),
    };
  }
}

/**
 * UACL singleton instance - available without circular dependency.
 */
export const uacl = UACL.getInstance();

/**
 * Helper functions for UACL operations.
 */
export const UACLHelpers = {
  /**
   * Get quick status overview.
   */
  getQuickStatus(): {
    status: string;
    initialized: boolean;
    clientCount: number;
  } {
    const metrics = uacl.getMetrics();
    return {
      status: uacl.isInitialized() ? 'ready' : 'not_ready',
      initialized: metrics.initialized,
      clientCount: metrics.clientCount,
    };
  },

  /**
   * Perform comprehensive health check.
   */
  async performHealthCheck(): Promise<
    Array<{ component: string; status: string; details?: unknown }>
  > {
    const results: Array<{
      component: string;
      status: string;
      details?: unknown;
    }> = [];

    // Check UACL initialization
    results.push({
      component: 'UACL_Core',
      status: uacl.isInitialized() ? 'healthy' : 'unhealthy',
      details: uacl.getHealthStatus(),
    });

    // Check client registry
    const allClients = uacl.getAllClients();
    results.push({
      component: 'Client_Registry',
      status: allClients.length > 0 ? 'healthy' : 'warning',
      details: { clientCount: allClients.length },
    });

    // Test client creation capability
    try {
      const testConfig = { baseURL: 'https://httpbin.org', timeout: 5000 };
      const testClient = await uacl.createHTTPClient(
        'health_test',
        testConfig.baseURL,
        testConfig
      );
      results.push({
        component: 'Client_Creation',
        status: 'healthy',
        details: { testClientId: testClient.id },
      });

      // Clean up test client
      uacl.removeClient('health_test');
    } catch (error) {
      results.push({
        component: 'Client_Creation',
        status: 'unhealthy',
        details: { error: (error as Error).message },
      });
    }

    return results;
  },

  /**
   * Initialize UACL with default configuration.
   */
  async initialize(config?: ClientManagerConfig): Promise<void> {
    return uacl.initialize(config);
  },
};

/**
 * Initialize UACL with default configuration.
 */
export async function initializeUACL(
  config?: ClientManagerConfig
): Promise<void> {
  return uacl.initialize(config);
}

export { UACL };
export type { ClientManagerConfig };
