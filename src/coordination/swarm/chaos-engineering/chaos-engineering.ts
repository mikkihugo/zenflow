/**
 * Chaos Engineering Test Framework for ZenSwarm
 *
 * Provides comprehensive chaos engineering capabilities for testing
 * recovery workflows and system resilience under failure conditions.
 *
 * Features:
 * - Controlled failure injection (memory, network, process, etc.)
 * - Automated recovery testing scenarios
 * - Blast radius management and safety controls
 * - Test result analysis and reporting
 * - Integration with recovery workflows validation
 * - Reproducible failure scenarios
 */

import { EventEmitter } from 'node:events';
import { ConfigurationError, SystemError, ValidationError } from '../../../core/errors';
import { createLogger } from '../../../core/logger';
import { generateId } from '../core/utils';
import { HealthMonitor } from '../../diagnostics/health-monitor';
import { RecoveryWorkflows } from '../core/recovery-workflows';
import { ConnectionStateManager as ConnectionManager } from '../connection-management/connection-state-manager';
// import { MCPToolsManager } from '../../../interfaces/mcp/tool-registry'; // xxx NEEDS_HUMAN: Unused import - verify if needed for future integration

// Type definitions for chaos engineering
interface ExperimentPhase {
  name: string;
  status: 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime: Date | null;
  duration: number;
  error: string | null;
}

interface InjectionResult {
  type: string;
  arrays?: Array<unknown[]>;
  workers?: Array<{ terminate: () => void }>;
  size?: number;
  duration: number;
  cleanupTimer?: NodeJS.Timeout;
  affectedConnections?: Array<{ id: string; action: string }>;
}

interface ImpactMetrics {
  memoryUsage?: number;
  cpuUsage?: number;
  connectionStatus?: Record<string, unknown>;
  errorRate?: number;
  responseTime?: number;
}

interface DetailedImpactMetrics {
  startTime: Date;
  endTime: Date | null;
  metrics: Array<ImpactMetrics & { timestamp: Date }>;
  alerts: Array<{ timestamp: Date; status: string; details: unknown }>;
  recoveryAttempts: Array<{ timestamp: Date; recoveries: unknown }>;
}

interface RecoveryExecution {
  workflowId: string;
  startTime: Date;
  endTime: Date;
  status: 'running' | 'completed' | 'failed';
  steps: Array<{ name: string; status: string }>;
}

interface ExperimentParameters {
  size?: number;
  duration?: number;
  intensity?: number;
  connections?: string | string[];
  failureType?: string;
  [key: string]: unknown;
}

interface ExperimentExecution {
  id: string;
  experimentName: string;
  experimentId: string;
  status: 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime: Date | null;
  duration: number;
  error: string | null;
  parameters: ExperimentParameters;
  phases: ExperimentPhase[];
  currentPhase: string;
  failureInjected: boolean;
  recoveryTriggered: boolean;
  recoveryCompleted: boolean;
  blastRadius: number;
  metadata: Record<string, unknown>;
  injectionResult?: InjectionResult;
  cancellationReason?: string;
  completedAt?: Date;
  impactMetrics?: DetailedImpactMetrics;
  recoveryExecution?: RecoveryExecution;
  recoveryTime?: number;
}

interface ChaosExperiment {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  failureType?: string | undefined;
  parameters: ExperimentParameters;
  duration: number;
  cooldown?: number | undefined;
  blastRadius: number;
  safetyChecks: string[];
  metadata: Record<string, unknown>;
  enabled: boolean;
  expectedRecovery: string[];
  createdAt: Date;
}

interface ChaosEngineeringOptions {
  enableChaos?: boolean;
  safetyEnabled?: boolean;
  maxConcurrentExperiments?: number;
  experimentTimeout?: number;
  recoveryTimeout?: number;
  blastRadiusLimit?: number;
}

interface ResourceUsage {
  memory: number;
  cpu: number;
  connections: number;
}

interface ChaosStats {
  totalExperiments: number;
  successfulExperiments: number;
  failedExperiments: number;
  averageRecoveryTime: number;
  totalRecoveryTime: number;
}

interface FailureInjectorCallbacks {
  inject: (params: ExperimentParameters) => Promise<InjectionResult>;
  cleanup?: (injectionResult: InjectionResult) => Promise<void>;
}

type FailureInjector = FailureInjectorCallbacks;
type SafetyCheck = (experiment: ChaosExperiment) => Promise<{ safe: boolean; reason?: string }> | { safe: boolean; reason?: string };

export class ChaosEngineering extends EventEmitter {
  private options: ChaosEngineeringOptions;
  private logger: ReturnType<typeof createLogger>;
  private experiments: Map<string, ChaosExperiment>;
  private activeExperiments: Map<string, ExperimentExecution>;
  private experimentHistory: Map<string, ExperimentExecution[]>;
  private failureInjectors: Map<string, FailureInjector>;
  private safetyChecks: Map<string, SafetyCheck>;
  private emergencyStop: boolean;
  private resourceUsage: ResourceUsage;
  private stats: ChaosStats;
  private healthMonitor: HealthMonitor | null;
  private recoveryWorkflows: RecoveryWorkflows | null;
  private connectionManager: ConnectionManager | null;
  // private mcpTools: MCPToolsManager | null; // xxx NEEDS_HUMAN: Unused but may be for future integration

  constructor(options: ChaosEngineeringOptions = {}) {
    super();

    this.options = {
      enableChaos: options.enableChaos === true,
      safetyEnabled: options.safetyEnabled !== false,
      maxConcurrentExperiments: options.maxConcurrentExperiments || 3,
      experimentTimeout: options.experimentTimeout || 300000, // 5 minutes
      recoveryTimeout: options.recoveryTimeout || 600000, // 10 minutes
      blastRadiusLimit: options.blastRadiusLimit || 0.3, // 30% of resources
    };

    this.logger = createLogger({ prefix: 'ChaosEngineering' });

    // Experiment state
    this.experiments = new Map();
    this.activeExperiments = new Map();
    this.experimentHistory = new Map();
    this.failureInjectors = new Map();

    // Safety controls
    this.safetyChecks = new Map();
    this.emergencyStop = false;
    this.resourceUsage = {
      memory: 0,
      cpu: 0,
      connections: 0,
    };

    // Statistics
    this.stats = {
      totalExperiments: 0,
      successfulExperiments: 0,
      failedExperiments: 0,
      averageRecoveryTime: 0,
      totalRecoveryTime: 0,
    };

    // Integration points
    this.healthMonitor = null;
    this.recoveryWorkflows = null;
    this.connectionManager = null;
    // this.mcpTools = null; // xxx NEEDS_HUMAN: Unused but may be for future integration

    this.initialize();
  }

  /**
   * Initialize chaos engineering framework
   */
  async initialize() {
    if (!this.options.enableChaos) {
      this.logger.warn('Chaos Engineering is DISABLED - Enable with enableChaos: true');
      return;
    }

    try {
      this.logger.info('Initializing Chaos Engineering Framework');

      // Register built-in failure injectors
      this.registerBuiltInInjectors();

      // Set up safety checks
      this.setupSafetyChecks();

      // Register pre-defined experiments
      this.registerBuiltInExperiments();

      this.logger.info('Chaos Engineering Framework initialized successfully');
      this.emit('chaos:initialized');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const chaosError = new SystemError(
        `Failed to initialize chaos engineering: ${errorMessage}`,
        'CHAOS_INIT_FAILED',
        'critical',
        {
          component: 'chaos-engineering',
          metadata: { originalError: errorMessage },
        }
      );
      this.logger.error('Chaos Engineering initialization failed', chaosError);
      throw chaosError;
    }
  }

  /**
   * Register a chaos experiment
   *
   * @param name
   * @param experimentDefinition
   */
  registerExperiment(name: string, experimentDefinition: Partial<ChaosExperiment>) {
    const experiment: ChaosExperiment = {
      id: generateId('experiment'),
      name,
      description: experimentDefinition.description || '',
      type: experimentDefinition.type || 'custom',
      category: experimentDefinition.category || 'custom',
      failureType: experimentDefinition.failureType || '',
      parameters: experimentDefinition.parameters || {},
      expectedRecovery: experimentDefinition.expectedRecovery || [],
      blastRadius: experimentDefinition.blastRadius || 0.1, // 10% default
      duration: experimentDefinition.duration || 60000, // 1 minute
      cooldown: experimentDefinition.cooldown || 120000, // 2 minutes
      safetyChecks: experimentDefinition.safetyChecks || [],
      enabled: experimentDefinition.enabled !== false,
      metadata: experimentDefinition.metadata || {},
      createdAt: new Date(),
    };

    // Validate blast radius
    if (experiment.blastRadius > this.options.blastRadiusLimit) {
      throw new ValidationError(
        `Experiment blast radius (${experiment.blastRadius}) exceeds limit (${this.options.blastRadiusLimit})`,
        'blastRadius',
        this.options.blastRadiusLimit,
        experiment.blastRadius
      );
    }

    this.experiments.set(name, experiment);
    this.experimentHistory.set(name, []);

    this.logger.info(`Registered chaos experiment: ${name}`, {
      category: experiment.category,
      failureType: experiment.failureType,
      blastRadius: experiment.blastRadius,
    });

    return experiment.id;
  }

  /**
   * Run a chaos experiment
   *
   * @param experimentName
   * @param overrideParams
   */
  async runExperiment(experimentName: string, overrideParams: Record<string, any> = {}) {
    if (!this.options.enableChaos) {
      throw new ConfigurationError('Chaos Engineering is disabled', 'enableChaos', false);
    }

    if (this.emergencyStop) {
      throw new SystemError(
        'Emergency stop is active - chaos experiments blocked',
        'EMERGENCY_STOP',
        'critical'
      );
    }

    const experiment = this.experiments.get(experimentName);
    if (!experiment) {
      throw new ValidationError(
        `Experiment '${experimentName}' not found`,
        'experimentName',
        'valid experiment name',
        experimentName
      );
    }

    if (!experiment.enabled) {
      throw new ValidationError(
        `Experiment '${experimentName}' is disabled`,
        'enabled',
        true,
        false
      );
    }

    // Check concurrent experiment limit
    if (this.activeExperiments.size >= this.options.maxConcurrentExperiments) {
      throw new SystemError(
        `Maximum concurrent experiments reached (${this.options.maxConcurrentExperiments})`,
        'MAX_CONCURRENT_EXPERIMENTS',
        'high'
      );
    }

    const executionId = generateId('execution');
    const startTime = Date.now();

    const execution: ExperimentExecution = {
      id: executionId,
      experimentName,
      experimentId: experiment.id,
      status: 'running',
      startTime: new Date(startTime),
      endTime: null as Date | null,
      duration: 0,
      error: null as string | null,
      parameters: { ...experiment.parameters, ...overrideParams },
      phases: [],
      currentPhase: 'preparation',
      failureInjected: false,
      recoveryTriggered: false,
      recoveryCompleted: false,
      blastRadius: experiment.blastRadius,
      metadata: experiment.metadata,
    };

    this.activeExperiments.set(executionId, execution);
    this.stats.totalExperiments++;

    try {
      this.logger.info(`Starting chaos experiment: ${experimentName}`, {
        executionId,
        duration: experiment.duration,
        blastRadius: experiment.blastRadius,
      });

      this.emit('experiment:started', { executionId, experiment, execution });

      // Phase 1: Pre-experiment safety checks
      await this.runExperimentPhase(execution, 'safety_check', async () => {
        await this.performSafetyChecks(experiment);
      });

      // Phase 2: Inject failure
      await this.runExperimentPhase(execution, 'failure_injection', async () => {
        await this.injectFailure(experiment, execution);
        execution.failureInjected = true;
      });

      // Phase 3: Monitor failure impact
      await this.runExperimentPhase(execution, 'impact_monitoring', async () => {
        await this.monitorFailureImpact(execution, experiment.duration);
      });

      // Phase 4: Trigger recovery (if not automatic)
      if (experiment.expectedRecovery.includes('manual')) {
        await this.runExperimentPhase(execution, 'recovery_trigger', async () => {
          await this.triggerRecovery(execution);
          execution.recoveryTriggered = true;
        });
      }

      // Phase 5: Monitor recovery
      await this.runExperimentPhase(execution, 'recovery_monitoring', async () => {
        await this.monitorRecovery(execution);
        execution.recoveryCompleted = true;
      });

      // Phase 6: Cleanup and validation
      await this.runExperimentPhase(execution, 'cleanup', async () => {
        await this.cleanupExperiment(execution);
      });

      // Experiment completed successfully
      execution.status = 'completed';
      execution.endTime = new Date();
      execution.duration = Date.now() - startTime;

      this.stats.successfulExperiments++;
      this.stats.totalRecoveryTime += execution.duration;
      this.stats.averageRecoveryTime = this.stats.totalRecoveryTime / this.stats.totalExperiments;

      this.logger.info(`Chaos experiment completed: ${experimentName}`, {
        executionId,
        duration: execution.duration,
        phaseCount: execution.phases.length,
      });

      this.emit('experiment:completed', { executionId, execution });
    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.duration = Date.now() - startTime;
      execution.error = error instanceof Error ? error.message : String(error);

      this.stats.failedExperiments++;

      this.logger.error(`Chaos experiment failed: ${experimentName}`, {
        executionId,
        error: error instanceof Error ? error.message : String(error),
        phase: execution.currentPhase,
      });

      // Attempt cleanup even on failure
      try {
        await this.cleanupExperiment(execution);
      } catch (cleanupError) {
        this.logger.error('Cleanup failed after experiment failure', {
          executionId,
          error: cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
        });
      }

      this.emit('experiment:failed', { executionId, execution, error });
    } finally {
      // Record execution in history
      const history = this.experimentHistory.get(experimentName);
      if (history) {
        history.push({
        ...execution,
        completedAt: new Date(),
        });

        // Keep only last 50 executions per experiment
        if (history.length > 50) {
          history.splice(0, history.length - 50);
        }
      }

      this.activeExperiments.delete(executionId);
    }

    return execution;
  }

  /**
   * Run experiment phase
   *
   * @param execution
   * @param phaseName
   * @param phaseFunction
   */
  async runExperimentPhase(execution: ExperimentExecution, phaseName: string, phaseFunction: () => Promise<void>) {
    const phaseStartTime = Date.now();
    execution.currentPhase = phaseName;

    const phase: ExperimentPhase = {
      name: phaseName,
      status: 'running' as 'running' | 'completed' | 'failed',
      startTime: new Date(phaseStartTime),
      endTime: null,
      duration: 0,
      error: null,
    };

    try {
      this.logger.debug(`Starting experiment phase: ${phaseName}`, {
        executionId: execution.id,
      });

      await phaseFunction();

      phase.status = 'completed';
      phase.endTime = new Date();
      phase.duration = Date.now() - phaseStartTime;

      this.logger.debug(`Experiment phase completed: ${phaseName}`, {
        executionId: execution.id,
        duration: phase.duration,
      });
    } catch (error) {
      phase.status = 'failed';
      phase.error = error instanceof Error ? error.message : String(error);
      phase.endTime = new Date();
      phase.duration = Date.now() - phaseStartTime;

      this.logger.error(`Experiment phase failed: ${phaseName}`, {
        executionId: execution.id,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }

    execution.phases.push(phase);
  }

  /**
   * Perform safety checks before experiment
   *
   * @param experiment
   */
  async performSafetyChecks(experiment: ChaosExperiment) {
    if (!this.options.safetyEnabled) {
      this.logger.warn('Safety checks are DISABLED');
      return;
    }

    // Check system health
    if (this.healthMonitor) {
      // xxx NEEDS_HUMAN: getHealthStatus method doesn't exist on HealthMonitor, needs implementation
      const healthStatus = (this.healthMonitor as any).currentHealth;
      if (healthStatus && healthStatus.status === 'critical') {
        throw new Error('System health is degraded - experiment blocked');
      }
    }

    // Check resource usage
    const resourceUsage = await this.checkResourceUsage();
    if (resourceUsage.memory > 0.8 || resourceUsage.cpu > 0.8) {
      throw new Error('High resource usage detected - experiment blocked');
    }

    // Check concurrent experiments
    if (this.activeExperiments.size >= this.options.maxConcurrentExperiments) {
      throw new Error('Too many concurrent experiments - experiment blocked');
    }

    // Run experiment-specific safety checks
    for (const checkName of experiment.safetyChecks) {
      const safetyCheck = this.safetyChecks.get(checkName);
      if (safetyCheck) {
        const result = await safetyCheck(experiment);
        if (!result.safe) {
          throw new Error(`Safety check failed: ${checkName} - ${result.reason}`);
        }
      }
    }

    this.logger.debug('All safety checks passed', {
      experimentName: experiment.name,
    });
  }

  /**
   * Inject failure based on experiment configuration
   *
   * @param experiment
   * @param execution
   */
  async injectFailure(experiment: ChaosExperiment, execution: ExperimentExecution) {
    const injector = this.failureInjectors.get(experiment.failureType || '');
    if (!injector) {
      throw new Error(`Failure injector not found: ${experiment.failureType || 'unknown'}`);
    }

    this.logger.info(`Injecting failure: ${experiment.failureType}`, {
      executionId: execution.id,
      parameters: execution.parameters,
    });

    const injectionResult = await injector.inject(execution.parameters);

    execution.injectionResult = injectionResult;
    execution.failureInjected = true;

    this.emit('failure:injected', {
      executionId: execution.id,
      failureType: experiment.failureType,
      result: injectionResult,
    });
  }

  /**
   * Monitor failure impact
   *
   * @param execution
   * @param duration
   */
  async monitorFailureImpact(execution: ExperimentExecution, duration: number) {
    const monitoringStartTime = Date.now();
    const monitoringEndTime = monitoringStartTime + duration;

    const impactMetrics = {
      startTime: new Date(monitoringStartTime),
      endTime: null as Date | null,
      metrics: [],
      alerts: [],
      recoveryAttempts: [],
    };

    this.logger.info(`Monitoring failure impact for ${duration}ms`, {
      executionId: execution.id,
    });

    // Monitor at 5-second intervals
    const monitoringInterval = 5000;
    const startInterval = setInterval(async () => {
      try {
        const now = Date.now();
        if (now >= monitoringEndTime) {
          clearInterval(startInterval);
          return;
        }

        // Collect metrics
        const metrics = await this.collectImpactMetrics();
        (impactMetrics.metrics as any[]).push({
          timestamp: new Date(now),
          ...metrics,
        });

        // Check for alerts
        if (this.healthMonitor) {
          const healthStatus = (this.healthMonitor as any).currentHealth;
          if (healthStatus.status !== 'healthy') {
            (impactMetrics.alerts as any[]).push({
              timestamp: new Date(now),
              status: healthStatus.overallStatus,
              details: healthStatus,
            });
          }
        }

        // Check for recovery attempts
        if (this.recoveryWorkflows) {
          const activeRecoveries = this.recoveryWorkflows.getRecoveryStatus();
          if (activeRecoveries.length > 0) {
            (impactMetrics.recoveryAttempts as any[]).push({
              timestamp: new Date(now),
              recoveries: activeRecoveries,
            });
          }
        }
      } catch (error) {
        this.logger.error('Error during impact monitoring', {
          executionId: execution.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }, monitoringInterval);

    // Wait for monitoring duration to complete
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        clearInterval(startInterval);
        resolve();
      }, duration);
    });

    impactMetrics.endTime = new Date();
    execution.impactMetrics = impactMetrics;

    this.logger.info('Failure impact monitoring completed', {
      executionId: execution.id,
      metricsCount: impactMetrics.metrics.length,
      alertsCount: impactMetrics.alerts.length,
      recoveryAttemptsCount: impactMetrics.recoveryAttempts.length,
    });
  }

  /**
   * Trigger recovery manually if needed
   *
   * @param execution
   */
  async triggerRecovery(execution: ExperimentExecution) {
    if (!this.recoveryWorkflows) {
      throw new Error('Recovery Workflows not available');
    }

    this.logger.info('Triggering manual recovery', {
      executionId: execution.id,
    });

    // Determine appropriate recovery trigger based on failure type
    const experiment = this.experiments.get(execution.experimentName);
    if (!experiment) {
      throw new Error(`Experiment ${execution.experimentName} not found`);
    }
    const recoveryTrigger = this.getRecoveryTrigger(experiment.failureType);

    const recoveryExecution = await this.recoveryWorkflows.triggerRecovery(recoveryTrigger, {
      chaosExperiment: execution.id,
      failureType: experiment.failureType,
      injectionResult: execution.injectionResult,
    });

    execution.recoveryExecution = recoveryExecution;
    execution.recoveryTriggered = true;

    this.emit('recovery:triggered', {
      executionId: execution.id,
      recoveryExecution,
    });
  }

  /**
   * Monitor recovery process
   *
   * @param execution
   */
  async monitorRecovery(execution) {
    if (!execution.recoveryTriggered) {
      // Wait for automatic recovery
      this.logger.info('Waiting for automatic recovery', {
        executionId: execution.id,
      });
    }

    const recoveryStartTime = Date.now();
    const maxRecoveryTime = this.options.recoveryTimeout;

    // Monitor recovery with timeout
    const recoveryPromise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Recovery timeout exceeded'));
      }, maxRecoveryTime);

      const checkRecovery = async () => {
        try {
          // Check if system has recovered
          const isRecovered = await this.checkSystemRecovery(execution);

          if (isRecovered) {
            clearTimeout(timeout);
            clearInterval(recoveryInterval);
            resolve();
          }
        } catch (error) {
          clearTimeout(timeout);
          clearInterval(recoveryInterval);
          reject(error);
        }
      };

      // Check recovery every 5 seconds
      const recoveryInterval = setInterval(checkRecovery, 5000);
      checkRecovery(); // Initial check
    });

    await recoveryPromise;

    const recoveryTime = Date.now() - recoveryStartTime;
    execution.recoveryTime = recoveryTime;
    execution.recoveryCompleted = true;

    this.logger.info('Recovery monitoring completed', {
      executionId: execution.id,
      recoveryTime,
    });
  }

  /**
   * Cleanup after experiment
   *
   * @param execution
   */
  async cleanupExperiment(execution) {
    this.logger.info('Cleaning up experiment', {
      executionId: execution.id,
    });

    // Remove failure injection
    if (execution.failureInjected && execution.injectionResult) {
      const experiment = this.experiments.get(execution.experimentName);
      const injector = this.failureInjectors.get(experiment.failureType);

      if (injector?.cleanup) {
        try {
          await injector.cleanup(execution.injectionResult);
        } catch (error) {
          this.logger.error('Error during injector cleanup', {
            executionId: execution.id,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }

    // Wait for cooldown period
    const experiment = this.experiments.get(execution.experimentName);
    if (experiment.cooldown > 0) {
      this.logger.debug(`Waiting for cooldown period: ${experiment.cooldown}ms`, {
        executionId: execution.id,
      });
      await new Promise<void>((resolve) => setTimeout(resolve, experiment.cooldown));
    }
  }

  /**
   * Check if system has recovered
   *
   * @param _execution
   */
  async checkSystemRecovery(_execution) {
    // Check health monitor status
    if (this.healthMonitor) {
      const healthStatus = this.healthMonitor.getCurrentHealth();
      if (healthStatus.status !== 'healthy') {
        return false;
      }
    }

    // Check if any recoveries are still active
    if (this.recoveryWorkflows) {
      const activeRecoveries = this.recoveryWorkflows.getRecoveryStatus();
      if (activeRecoveries.length > 0) {
        return false;
      }
    }

    // Check connections if relevant
    if (this.connectionManager) {
      const connectionStatus = this.connectionManager.getConnectionStatus();
      const failedConnections = Object.values(connectionStatus.connections).filter(
        (conn: any) => conn && conn.status === 'failed'
      ).length;

      if (failedConnections > 0) {
        return false;
      }
    }

    return true;
  }

  /**
   * Register built-in failure injectors
   */
  registerBuiltInInjectors() {
    // Memory pressure injector
    this.registerFailureInjector('memory_pressure', {
      inject: async (params) => {
        const size = params.size || 100 * 1024 * 1024; // 100MB default
        const duration = params.duration || 60000; // 1 minute

        const arrays = [];
        for (let i = 0; i < 10; i++) {
          arrays.push(new Array(size / 10).fill(Math.random()));
        }

        return {
          type: 'memory_pressure',
          arrays,
          size,
          duration,
          cleanupTimer: setTimeout(() => {
            arrays.length = 0; // Release memory
          }, duration),
        };
      },
      cleanup: async (injectionResult) => {
        if (injectionResult.cleanupTimer) {
          clearTimeout(injectionResult.cleanupTimer);
        }
        if (injectionResult.arrays) {
          injectionResult.arrays.length = 0;
        }
      },
    });

    // CPU stress injector
    this.registerFailureInjector('cpu_stress', {
      inject: async (params) => {
        const duration = params.duration || 60000; // 1 minute
        const intensity = params.intensity || 0.5; // 50% CPU usage

        const workers = [];
        const cpuCount = require('node:os').cpus().length;
        const targetWorkers = Math.ceil(cpuCount * intensity);

        for (let i = 0; i < targetWorkers; i++) {
          const worker = this.createCPUWorker();
          workers.push(worker);
        }

        return {
          type: 'cpu_stress',
          workers,
          duration,
          cleanupTimer: setTimeout(() => {
            workers.forEach((worker) => worker.terminate());
          }, duration),
        };
      },
      cleanup: async (injectionResult) => {
        if (injectionResult.cleanupTimer) {
          clearTimeout(injectionResult.cleanupTimer);
        }
        if (injectionResult.workers) {
          injectionResult.workers.forEach((worker) => {
            try {
              worker.terminate();
            } catch (_error) {
              // Worker may already be terminated
            }
          });
        }
      },
    });

    // Network failure injector
    this.registerFailureInjector('network_failure', {
      inject: async (params) => {
        const targetConnections = params.connections || 'all';
        const failureType = params.failureType || 'disconnect'; // disconnect, slow, drop

        const affectedConnections = [];

        if (this.connectionManager) {
          const connections = this.connectionManager.getConnectionStatus();

          for (const [id, _connection] of Object.entries(connections.connections)) {
            if (targetConnections === 'all' || targetConnections.includes(id)) {
              if (failureType === 'disconnect') {
                await this.connectionManager.disconnectConnection(id, 'Chaos experiment');
                affectedConnections.push({ id, action: 'disconnected' });
              }
            }
          }
        }

        return {
          type: 'network_failure',
          failureType,
          affectedConnections,
        };
      },
      cleanup: async (_injectionResult) => {
        // Network failures are typically handled by recovery workflows
        // Cleanup may involve re-establishing connections
      },
    });

    // Process crash injector
    this.registerFailureInjector('process_crash', {
      inject: async (params) => {
        const crashType = params.crashType || 'graceful'; // graceful, force, oom

        if (crashType === 'oom') {
          // Trigger out-of-memory condition
          return await this.failureInjectors.get('memory_pressure').inject({
            size: 1024 * 1024 * 1024, // 1GB
            duration: params.duration || 30000,
          });
        }

        return {
          type: 'process_crash',
          crashType,
          simulated: true, // Don't actually crash in testing
        };
      },
    });

    this.logger.info('Built-in failure injectors registered', {
      injectorCount: this.failureInjectors.size,
    });
  }

  /**
   * Register built-in experiments
   */
  registerBuiltInExperiments() {
    // Memory pressure recovery test
    this.registerExperiment('memory_pressure_recovery', {
      description: 'Test recovery from memory pressure conditions',
      category: 'system',
      failureType: 'memory_pressure',
      parameters: {
        size: 200 * 1024 * 1024, // 200MB
        duration: 60000, // 1 minute
      },
      expectedRecovery: ['automatic'],
      blastRadius: 0.2,
      duration: 90000, // 1.5 minutes
      safetyChecks: ['memory_available', 'no_critical_processes'],
    });

    // Connection failure recovery test
    this.registerExperiment('connection_failure_recovery', {
      description: 'Test recovery from MCP connection failures',
      category: 'network',
      failureType: 'network_failure',
      parameters: {
        connections: 'all',
        failureType: 'disconnect',
      },
      expectedRecovery: ['automatic'],
      blastRadius: 0.3,
      duration: 120000, // 2 minutes
      safetyChecks: ['connection_backup_available'],
    });

    // CPU stress recovery test
    this.registerExperiment('cpu_stress_recovery', {
      description: 'Test recovery from high CPU usage',
      category: 'system',
      failureType: 'cpu_stress',
      parameters: {
        intensity: 0.8, // 80% CPU
        duration: 45000, // 45 seconds
      },
      expectedRecovery: ['automatic'],
      blastRadius: 0.15,
      duration: 75000, // 1.25 minutes
      safetyChecks: ['cpu_available'],
    });

    this.logger.info('Built-in experiments registered', {
      experimentCount: this.experiments.size,
    });
  }

  /**
   * Register failure injector
   *
   * @param name
   * @param injector
   */
  registerFailureInjector(name, injector) {
    this.failureInjectors.set(name, injector);
    this.logger.debug(`Registered failure injector: ${name}`);
  }

  /**
   * Set up safety checks
   */
  setupSafetyChecks() {
    // Memory availability check
    this.safetyChecks.set('memory_available', async () => {
      const usage = process.memoryUsage();
      const totalMemory = require('node:os').totalmem();
      const memoryUsagePercent = (usage.heapUsed / totalMemory) * 100;

      if (memoryUsagePercent > 70) {
        return { safe: false, reason: `High memory usage: ${memoryUsagePercent.toFixed(2)}%` };
      }

      return { safe: true };
    });

    // CPU availability check
    this.safetyChecks.set('cpu_available', async () => {
      const loadAvg = require('node:os').loadavg()[0];
      const cpuCount = require('node:os').cpus().length;
      const cpuUsagePercent = (loadAvg / cpuCount) * 100;

      if (cpuUsagePercent > 70) {
        return { safe: false, reason: `High CPU usage: ${cpuUsagePercent.toFixed(2)}%` };
      }

      return { safe: true };
    });

    // Connection backup availability check
    this.safetyChecks.set('connection_backup_available', async () => {
      // This would check if backup connections are available
      return { safe: true }; // Simplified for demo
    });

    // No critical processes check
    this.safetyChecks.set('no_critical_processes', async () => {
      // This would check for critical processes that shouldn't be disrupted
      return { safe: true }; // Simplified for demo
    });
  }

  /**
   * Helper methods
   */

  createCPUWorker() {
    // Simulate CPU-intensive work
    const start = Date.now();
    const worker = {
      terminate: () => {
        worker.terminated = true;
        // Record worker lifetime for chaos engineering metrics
        const workTime = Date.now() - start;
        this.logger.debug('CPU worker terminated', { workTime });
      },
      terminated: false,
      startTime: start,
    };

    const work = () => {
      if (worker.terminated) return;

      // Do some CPU-intensive work
      let result = 0;
      for (let i = 0; i < 1000000; i++) {
        result += Math.random();
      }

      // Log periodic work progress for monitoring
      if (Date.now() - start > 5000 && (Date.now() - start) % 10000 < 100) {
        this.logger.debug('CPU worker active', {
          workTime: Date.now() - start,
          computationResult: result.toFixed(2),
        });
      }

      // Continue working
      setImmediate(work);
    };

    work();
    return worker;
  }

  async checkResourceUsage() {
    const memUsage = process.memoryUsage();
    const totalMem = require('node:os').totalmem();
    const freeMem = require('node:os').freemem();
    const loadAvg = require('node:os').loadavg();
    const cpuCount = require('node:os').cpus().length;

    // Store current resource usage for chaos engineering analysis
    this.resourceUsage = {
      memory: (totalMem - freeMem) / totalMem,
      cpu: loadAvg[0] / cpuCount,
      connections: this.connectionManager
        ? this.connectionManager.getConnectionStats().activeConnections
        : 0,
    };

    // Log detailed memory breakdown for monitoring
    this.logger.debug('Resource usage check', {
      memoryBreakdown: {
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      },
      systemMemory: {
        total: `${Math.round(totalMem / 1024 / 1024 / 1024)}GB`,
        free: `${Math.round(freeMem / 1024 / 1024 / 1024)}GB`,
        usage: `${(((totalMem - freeMem) / totalMem) * 100).toFixed(1)}%`,
      },
      cpu: {
        loadAverage: loadAvg[0].toFixed(2),
        utilization: `${((loadAvg[0] / cpuCount) * 100).toFixed(1)}%`,
        cores: cpuCount,
      },
    });

    return this.resourceUsage;
  }

  async collectImpactMetrics() {
    return {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      connections: this.connectionManager ? this.connectionManager.getConnectionStats() : null,
      health: this.healthMonitor ? (this.healthMonitor as any).currentHealth : null,
    };
  }

  getRecoveryTrigger(failureType) {
    const triggerMap = {
      memory_pressure: 'system.memory',
      cpu_stress: 'system.cpu',
      network_failure: 'mcp.connection.failed',
      process_crash: 'system.process.crashed',
    };

    return triggerMap[failureType] || 'chaos.experiment.failure';
  }

  /**
   * Emergency stop all experiments
   *
   * @param reason
   */
  async emergencyStopExperiments(reason = 'Manual emergency stop') {
    this.logger.warn('EMERGENCY STOP ACTIVATED', { reason });
    this.emergencyStop = true;

    // Cancel all active experiments
    const cancelPromises = Array.from(this.activeExperiments.keys()).map((executionId) =>
      this.cancelExperiment(executionId, 'Emergency stop')
    );

    await Promise.allSettled(cancelPromises);

    this.emit('emergency:stop', { reason, cancelledExperiments: cancelPromises.length });
  }

  /**
   * Cancel an active experiment
   *
   * @param executionId
   * @param reason
   */
  async cancelExperiment(executionId, reason = 'Manual cancellation') {
    const execution = this.activeExperiments.get(executionId);
    if (!execution) {
      throw new ValidationError(
        `Experiment execution ${executionId} not found`,
        'executionId',
        'valid execution ID',
        executionId
      );
    }

    (execution as any).status = 'cancelled';
    (execution as any).cancellationReason = reason;
    execution.endTime = new Date();

    this.logger.info(`Chaos experiment cancelled: ${execution.experimentName}`, {
      executionId,
      reason,
    });

    // Cleanup
    try {
      await this.cleanupExperiment(execution);
    } catch (error) {
      this.logger.error('Error during experiment cleanup', {
        executionId,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    this.emit('experiment:cancelled', { executionId, execution, reason });
  }

  /**
   * Clear emergency stop
   */
  clearEmergencyStop() {
    this.emergencyStop = false;
    this.logger.info('Emergency stop cleared');
    this.emit('emergency:cleared');
  }

  /**
   * Get experiment status
   *
   * @param executionId
   */
  getExperimentStatus(executionId = null) {
    if (executionId) {
      const execution = this.activeExperiments.get(executionId);
      if (!execution) {
        // Check history
        for (const history of this.experimentHistory.values()) {
          const historicalExecution = history.find((e) => e.id === executionId);
          if (historicalExecution) return historicalExecution;
        }
        return null;
      }
      return execution;
    }

    // Return all active experiments
    return Array.from(this.activeExperiments.values());
  }

  /**
   * Get chaos statistics
   */
  getChaosStats() {
    return {
      ...this.stats,
      activeExperiments: this.activeExperiments.size,
      registeredExperiments: this.experiments.size,
      enabledExperiments: Array.from(this.experiments.values()).filter((e) => e.enabled).length,
      failureInjectors: this.failureInjectors.size,
      emergencyStop: this.emergencyStop,
    };
  }

  /**
   * Set integration points
   *
   * @param healthMonitor
   */
  setHealthMonitor(healthMonitor) {
    this.healthMonitor = healthMonitor;
    this.logger.info('Health Monitor integration configured');
  }

  setRecoveryWorkflows(recoveryWorkflows) {
    this.recoveryWorkflows = recoveryWorkflows;
    this.logger.info('Recovery Workflows integration configured');
  }

  setConnectionManager(connectionManager) {
    this.connectionManager = connectionManager;
    this.logger.info('Connection Manager integration configured');
  }

  setMCPTools(mcpTools) {
    this.mcpTools = mcpTools;
    this.logger.info('MCP Tools integration configured');
  }

  /**
   * Export chaos data for analysis
   */
  exportChaosData() {
    return {
      timestamp: new Date(),
      stats: this.getChaosStats(),
      experiments: Array.from(this.experiments.entries()).map(([name, experiment]) => ({
        name,
        ...experiment,
        history: this.experimentHistory.get(name) || [],
      })),
      activeExperiments: Array.from(this.activeExperiments.values()),
      failureInjectors: Array.from(this.failureInjectors.keys()),
      safetyChecks: Array.from(this.safetyChecks.keys()),
    };
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown() {
    this.logger.info('Shutting down Chaos Engineering Framework');

    // Cancel all active experiments
    const cancelPromises = Array.from(this.activeExperiments.keys()).map((executionId) =>
      this.cancelExperiment(executionId, 'System shutdown').catch((error) =>
        this.logger.warn(`Error cancelling experiment ${executionId}`, { error: error.message })
      )
    );

    await Promise.allSettled(cancelPromises);

    // Clear all data
    this.experiments.clear();
    this.activeExperiments.clear();
    this.experimentHistory.clear();
    this.failureInjectors.clear();
    this.safetyChecks.clear();

    this.emit('chaos:shutdown');
  }
}

export default ChaosEngineering;
