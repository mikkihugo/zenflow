/**
 * @fileoverview Chaos Engineering System Interface Delegation
 *
 * Provides interface delegation to @claude-zen/chaos-engineering package following
 * the same architectural pattern as database and monitoring delegation.
 *
 * Runtime imports prevent circular dependencies while providing unified access
 * to chaos engineering, system resilience testing, and failure simulation through operations package.
 *
 * Delegates to:
 * - @claude-zen/chaos-engineering: System resilience testing, failure simulation, chaos experiments
 *
 * @author Claude Code Zen Team
 * @since 2.1.0 (Strategic Architecture v2.0.0)
 * @version 1.0.0
 */

import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('operations-chaos-engineering');

/**
 * Custom error types for chaos engineering operations
 */
export class ChaosEngineeringSystemError extends Error {
  public override cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'ChaosEngineeringSystemError';
    if (cause) {
      this.cause = cause;
    }
  }
}

export class ChaosEngineeringSystemConnectionError extends ChaosEngineeringSystemError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'ChaosEngineeringSystemConnectionError';
  }
}

/**
 * Chaos engineering module interface for accessing real chaos engineering backends.
 * @internal
 */
interface ChaosEngineeringSystemModule {
  ChaosEngine: any;
  ResilienceTestSuite: any;
  FailureSimulator: any;
  ExperimentRunner: any;
  createChaosEngine: (...args: any[]) => any;
  createResilienceTestSuite: (...args: any[]) => any;
  createFailureSimulator: (...args: any[]) => any;
}

/**
 * Chaos engineering access interface
 */
interface ChaosEngineeringSystemAccess {
  /**
   * Create a new chaos engine
   */
  createChaosEngine(config?: any): Promise<any>;

  /**
   * Create a new resilience test suite
   */
  createResilienceTestSuite(config?: any): Promise<any>;

  /**
   * Create a new failure simulator
   */
  createFailureSimulator(config?: any): Promise<any>;

  /**
   * Create an experiment runner
   */
  createExperimentRunner(config?: any): Promise<any>;
}

/**
 * Chaos engineering configuration interface
 */
interface ChaosEngineeringSystemConfig {
  enableChaosExperiments?: boolean;
  enableResilienceTesting?: boolean;
  enableFailureSimulation?: boolean;
  experimentDuration?: number;
  failureRate?: number;
  recoveryTime?: number;
  safetyChecks?: boolean;
}

/**
 * Implementation of chaos engineering access via runtime delegation
 */
class ChaosEngineeringSystemAccessImpl implements ChaosEngineeringSystemAccess {
  private chaosEngineeringModule: ChaosEngineeringSystemModule|null = null;

  private async getChaosEngineeringModule(): Promise<ChaosEngineeringSystemModule> {
    if (!this.chaosEngineeringModule) {
      try {
        // Import the chaos-engineering package at runtime (matches database pattern)
        // Use dynamic import with string to avoid TypeScript compile-time checking
        const packageName ='@claude-zen/chaos-engineering';
        this.chaosEngineeringModule = (await import(
          packageName
        )) as ChaosEngineeringSystemModule;
        logger.debug('Chaos engineering module loaded successfully');
      } catch (error) {
        throw new ChaosEngineeringSystemConnectionError(
          'Chaos engineering package not available. Operations requires @claude-zen/chaos-engineering for chaos operations.',
          error instanceof Error ? error : undefined
        );
      }
    }
    return this.chaosEngineeringModule;
  }

  async createChaosEngine(config?: any): Promise<any> {
    const module = await this.getChaosEngineeringModule();
    logger.debug('Creating chaos engine via operations delegation', { config });
    return module.createChaosEngine
      ? module.createChaosEngine(config)
      : new module.ChaosEngine(config);
  }

  async createResilienceTestSuite(config?: any): Promise<any> {
    const module = await this.getChaosEngineeringModule();
    logger.debug('Creating resilience test suite via operations delegation', {
      config,
    });
    return module.createResilienceTestSuite
      ? module.createResilienceTestSuite(config)
      : new module.ResilienceTestSuite(config);
  }

  async createFailureSimulator(config?: any): Promise<any> {
    const module = await this.getChaosEngineeringModule();
    logger.debug('Creating failure simulator via operations delegation', {
      config,
    });
    return module.createFailureSimulator
      ? module.createFailureSimulator(config)
      : new module.FailureSimulator(config);
  }

  async createExperimentRunner(config?: any): Promise<any> {
    const module = await this.getChaosEngineeringModule();
    logger.debug('Creating experiment runner via operations delegation', {
      config,
    });
    return new module.ExperimentRunner(config);
  }
}

// Global singleton instance
let globalChaosEngineeringSystemAccess: ChaosEngineeringSystemAccess|null =
  null;

/**
 * Get chaos engineering access interface (singleton pattern)
 */
export function getChaosEngineeringSystemAccess(): ChaosEngineeringSystemAccess {
  if (!globalChaosEngineeringSystemAccess) {
    globalChaosEngineeringSystemAccess = new ChaosEngineeringSystemAccessImpl();
    logger.info('Initialized global chaos engineering access');
  }
  return globalChaosEngineeringSystemAccess;
}

/**
 * Create a chaos engine through operations delegation
 * @param config - Chaos engine configuration
 */
export async function getChaosEngine(
  config?: ChaosEngineeringSystemConfig
): Promise<any> {
  const chaosSystem = getChaosEngineeringSystemAccess();
  return await Promise.resolve(chaosSystem.createChaosEngine(config));
}

/**
 * Create a resilience test suite through operations delegation
 * @param config - Resilience test suite configuration
 */
export async function getResilienceTestSuite(
  config?: ChaosEngineeringSystemConfig
): Promise<any> {
  const chaosSystem = getChaosEngineeringSystemAccess();
  return await Promise.resolve(chaosSystem.createResilienceTestSuite(config));
}

/**
 * Create a failure simulator through operations delegation
 * @param config - Failure simulator configuration
 */
export async function getFailureSimulator(
  config?: ChaosEngineeringSystemConfig
): Promise<any> {
  const chaosSystem = getChaosEngineeringSystemAccess();
  return await Promise.resolve(chaosSystem.createFailureSimulator(config));
}

/**
 * Create an experiment runner through operations delegation
 * @param config - Experiment runner configuration
 */
export async function getExperimentRunner(
  config?: ChaosEngineeringSystemConfig
): Promise<any> {
  const chaosSystem = getChaosEngineeringSystemAccess();
  return await Promise.resolve(chaosSystem.createExperimentRunner(config));
}

// Professional chaos engineering object with proper naming (matches Storage/Telemetry patterns)
export const chaosEngineeringSystem = {
  getAccess: getChaosEngineeringSystemAccess,
  getEngine: getChaosEngine,
  getTestSuite: getResilienceTestSuite,
  getSimulator: getFailureSimulator,
  getExperimentRunner: getExperimentRunner,
};

// Type exports for external consumers
export type { ChaosEngineeringSystemAccess, ChaosEngineeringSystemConfig };
