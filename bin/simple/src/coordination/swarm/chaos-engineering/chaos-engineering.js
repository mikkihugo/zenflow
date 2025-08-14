import { EventEmitter } from 'node:events';
import { getLogger } from '../../../config/logging-config.ts';
import { SystemError } from '../../../core/errors.ts';
import { ConfigurationError, ValidationError } from '../core/errors.ts';
import { generateId } from '../core/utils.ts';
export class ChaosEngineering extends EventEmitter {
    options;
    logger;
    experiments;
    activeExperiments;
    experimentHistory;
    failureInjectors;
    safetyChecks;
    emergencyStop;
    resourceUsage;
    stats;
    healthMonitor;
    recoveryWorkflows;
    connectionManager;
    constructor(options = {}) {
        super();
        this.options = {
            enableChaos: options.enableChaos === true,
            safetyEnabled: options?.safetyEnabled !== false,
            maxConcurrentExperiments: options?.maxConcurrentExperiments || 3,
            experimentTimeout: options?.experimentTimeout || 300000,
            recoveryTimeout: options?.recoveryTimeout || 600000,
            blastRadiusLimit: options?.blastRadiusLimit || 0.3,
        };
        this.logger = getLogger('ChaosEngineering');
        this.experiments = new Map();
        this.activeExperiments = new Map();
        this.experimentHistory = new Map();
        this.failureInjectors = new Map();
        this.safetyChecks = new Map();
        this.emergencyStop = false;
        this.resourceUsage = {
            memory: 0,
            cpu: 0,
            connections: 0,
        };
        this.stats = {
            totalExperiments: 0,
            successfulExperiments: 0,
            failedExperiments: 0,
            averageRecoveryTime: 0,
            totalRecoveryTime: 0,
        };
        this.healthMonitor = null;
        this.recoveryWorkflows = null;
        this.connectionManager = null;
        this.initialize();
    }
    async initialize() {
        if (!this.options.enableChaos) {
            this.logger.warn('Chaos Engineering is DISABLED - Enable with enableChaos: true');
            return;
        }
        try {
            this.logger.info('Initializing Chaos Engineering Framework');
            this.registerBuiltInInjectors();
            this.setupSafetyChecks();
            this.registerBuiltInExperiments();
            this.logger.info('Chaos Engineering Framework initialized successfully');
            this.emit('chaos:initialized');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const chaosError = new SystemError(`Failed to initialize chaos engineering: ${errorMessage}`, 'CHAOS_INIT_FAILED', 'critical', {
                component: 'chaos-engineering',
                metadata: { originalError: errorMessage },
            });
            this.logger.error('Chaos Engineering initialization failed', chaosError);
            throw chaosError;
        }
    }
    registerExperiment(name, experimentDefinition) {
        const experiment = {
            id: generateId('experiment'),
            name,
            description: experimentDefinition.description || '',
            type: experimentDefinition.type || 'custom',
            category: experimentDefinition.category || 'custom',
            failureType: experimentDefinition.failureType || '',
            parameters: experimentDefinition.parameters || {},
            expectedRecovery: experimentDefinition.expectedRecovery || [],
            blastRadius: experimentDefinition.blastRadius || 0.1,
            duration: experimentDefinition.duration || 60000,
            cooldown: experimentDefinition.cooldown || 120000,
            safetyChecks: experimentDefinition.safetyChecks || [],
            enabled: experimentDefinition.enabled !== false,
            metadata: experimentDefinition.metadata || {},
            createdAt: new Date(),
        };
        if (experiment.blastRadius > (this.options?.blastRadiusLimit || 0.5)) {
            throw new ValidationError(`Experiment blast radius (${experiment.blastRadius}) exceeds limit (${this.options?.blastRadiusLimit || 0.5})`, 'blastRadius', this.options.blastRadiusLimit, String(experiment.blastRadius));
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
    async runExperiment(experimentName, overrideParams = {}) {
        if (!this.options.enableChaos) {
            throw new ConfigurationError('Chaos Engineering is disabled', 'enableChaos', false);
        }
        if (this.emergencyStop) {
            throw new SystemError('Emergency stop is active - chaos experiments blocked', 'EMERGENCY_STOP', 'critical');
        }
        const experiment = this.experiments.get(experimentName);
        if (!experiment) {
            throw new ValidationError(`Experiment '${experimentName}' not found`, 'experimentName', 'valid experiment name', experimentName);
        }
        if (!experiment.enabled) {
            throw new ValidationError(`Experiment '${experimentName}' is disabled`, 'enabled', 'expected enabled to be true', String(false));
        }
        if (this.activeExperiments.size >= this.options.maxConcurrentExperiments) {
            throw new SystemError(`Maximum concurrent experiments reached (${this.options.maxConcurrentExperiments})`, 'MAX_CONCURRENT_EXPERIMENTS', 'high');
        }
        const executionId = generateId('execution');
        const startTime = Date.now();
        const execution = {
            id: executionId,
            experimentName,
            experimentId: experiment.id,
            status: 'running',
            startTime: new Date(startTime),
            endTime: null,
            duration: 0,
            error: null,
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
            await this.runExperimentPhase(execution, 'safety_check', async () => {
                await this.performSafetyChecks(experiment);
            });
            await this.runExperimentPhase(execution, 'failure_injection', async () => {
                await this.injectFailure(experiment, execution);
                execution.failureInjected = true;
            });
            await this.runExperimentPhase(execution, 'impact_monitoring', async () => {
                await this.monitorFailureImpact(execution, experiment.duration);
            });
            if (experiment.expectedRecovery.includes('manual')) {
                await this.runExperimentPhase(execution, 'recovery_trigger', async () => {
                    await this.triggerRecovery(execution);
                    execution.recoveryTriggered = true;
                });
            }
            await this.runExperimentPhase(execution, 'recovery_monitoring', async () => {
                await this.monitorRecovery(execution);
                execution.recoveryCompleted = true;
            });
            await this.runExperimentPhase(execution, 'cleanup', async () => {
                await this.cleanupExperiment(execution);
            });
            execution.status = 'completed';
            execution.endTime = new Date();
            execution.duration = Date.now() - startTime;
            this.stats.successfulExperiments++;
            this.stats.totalRecoveryTime += execution.duration;
            this.stats.averageRecoveryTime =
                this.stats.totalRecoveryTime / this.stats.totalExperiments;
            this.logger.info(`Chaos experiment completed: ${experimentName}`, {
                executionId,
                duration: execution.duration,
                phaseCount: execution.phases.length,
            });
            this.emit('experiment:completed', { executionId, execution });
        }
        catch (error) {
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
            try {
                await this.cleanupExperiment(execution);
            }
            catch (cleanupError) {
                this.logger.error('Cleanup failed after experiment failure', {
                    executionId,
                    error: cleanupError instanceof Error
                        ? cleanupError.message
                        : String(cleanupError),
                });
            }
            this.emit('experiment:failed', { executionId, execution, error });
        }
        finally {
            const history = this.experimentHistory.get(experimentName);
            if (history) {
                history.push({
                    ...execution,
                    completedAt: new Date(),
                });
                if (history.length > 50) {
                    history.splice(0, history.length - 50);
                }
            }
            this.activeExperiments.delete(executionId);
        }
        return execution;
    }
    async runExperimentPhase(execution, phaseName, phaseFunction) {
        const phaseStartTime = Date.now();
        execution.currentPhase = phaseName;
        const phase = {
            name: phaseName,
            status: 'running',
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
        }
        catch (error) {
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
    async performSafetyChecks(experiment) {
        if (!this.options.safetyEnabled) {
            this.logger.warn('Safety checks are DISABLED');
            return;
        }
        if (this.healthMonitor) {
            const healthStatus = this.healthMonitor.currentHealth;
            if (healthStatus && healthStatus.status === 'critical') {
                throw new Error('System health is degraded - experiment blocked');
            }
        }
        const resourceUsage = await this.checkResourceUsage();
        if (resourceUsage.memory > 0.8 || resourceUsage.cpu > 0.8) {
            throw new Error('High resource usage detected - experiment blocked');
        }
        if (this.activeExperiments.size >= this.options.maxConcurrentExperiments) {
            throw new Error('Too many concurrent experiments - experiment blocked');
        }
        for (const checkName of experiment.safetyChecks) {
            const safetyCheck = this.safetyChecks.get(checkName);
            if (safetyCheck) {
                const result = await safetyCheck(experiment);
                if (!result?.safe) {
                    throw new Error(`Safety check failed: ${checkName} - ${result?.reason}`);
                }
            }
        }
        this.logger.debug('All safety checks passed', {
            experimentName: experiment.name,
        });
    }
    async injectFailure(experiment, execution) {
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
    async monitorFailureImpact(execution, duration) {
        const monitoringStartTime = Date.now();
        const monitoringEndTime = monitoringStartTime + duration;
        const impactMetrics = {
            startTime: new Date(monitoringStartTime),
            endTime: null,
            metrics: [],
            alerts: [],
            recoveryAttempts: [],
        };
        this.logger.info(`Monitoring failure impact for ${duration}ms`, {
            executionId: execution.id,
        });
        const monitoringInterval = 5000;
        const startInterval = setInterval(async () => {
            try {
                const now = Date.now();
                if (now >= monitoringEndTime) {
                    clearInterval(startInterval);
                    return;
                }
                const metrics = await this.collectImpactMetrics();
                impactMetrics.metrics.push({
                    timestamp: new Date(now),
                    ...metrics,
                });
                if (this.healthMonitor) {
                    const healthStatus = this.healthMonitor.currentHealth;
                    if (healthStatus.status !== 'healthy') {
                        impactMetrics.alerts.push({
                            timestamp: new Date(now),
                            status: healthStatus.overallStatus,
                            details: healthStatus,
                        });
                    }
                }
                if (this.recoveryWorkflows) {
                    const activeRecoveries = this.recoveryWorkflows.getRecoveryStatus();
                    if (activeRecoveries.length > 0) {
                        impactMetrics.recoveryAttempts.push({
                            timestamp: new Date(now),
                            recoveries: activeRecoveries,
                        });
                    }
                }
            }
            catch (error) {
                this.logger.error('Error during impact monitoring', {
                    executionId: execution.id,
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }, monitoringInterval);
        await new Promise((resolve) => {
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
    async triggerRecovery(execution) {
        if (!this.recoveryWorkflows) {
            throw new Error('Recovery Workflows not available');
        }
        this.logger.info('Triggering manual recovery', {
            executionId: execution.id,
        });
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
    async monitorRecovery(execution) {
        if (!execution.recoveryTriggered) {
            this.logger.info('Waiting for automatic recovery', {
                executionId: execution.id,
            });
        }
        const recoveryStartTime = Date.now();
        const maxRecoveryTime = this.options.recoveryTimeout;
        const recoveryPromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Recovery timeout exceeded'));
            }, maxRecoveryTime);
            const checkRecovery = async () => {
                try {
                    const isRecovered = await this.checkSystemRecovery(execution);
                    if (isRecovered) {
                        clearTimeout(timeout);
                        clearInterval(recoveryInterval);
                        resolve();
                    }
                }
                catch (error) {
                    clearTimeout(timeout);
                    clearInterval(recoveryInterval);
                    reject(error);
                }
            };
            const recoveryInterval = setInterval(checkRecovery, 5000);
            checkRecovery();
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
    async cleanupExperiment(execution) {
        this.logger.info('Cleaning up experiment', {
            executionId: execution.id,
        });
        if (execution.failureInjected && execution.injectionResult) {
            const experiment = this.experiments.get(execution.experimentName);
            const injector = this.failureInjectors.get(experiment?.failureType || '');
            if (injector?.cleanup) {
                try {
                    await injector.cleanup(execution.injectionResult);
                }
                catch (error) {
                    this.logger.error('Error during injector cleanup', {
                        executionId: execution.id,
                        error: error instanceof Error ? error.message : String(error),
                    });
                }
            }
        }
        const experiment = this.experiments.get(execution.experimentName);
        if (experiment && experiment.cooldown && experiment.cooldown > 0) {
            this.logger.debug(`Waiting for cooldown period: ${experiment.cooldown}ms`, {
                executionId: execution.id,
            });
            await new Promise((resolve) => setTimeout(resolve, experiment.cooldown));
        }
    }
    async checkSystemRecovery(_execution) {
        if (this.healthMonitor) {
            const healthStatus = this.healthMonitor.getCurrentHealth();
            if (healthStatus.status !== 'healthy') {
                return false;
            }
        }
        if (this.recoveryWorkflows) {
            const activeRecoveries = this.recoveryWorkflows.getRecoveryStatus();
            if (activeRecoveries.length > 0) {
                return false;
            }
        }
        if (this.connectionManager) {
            const connectionStatus = this.connectionManager.getConnectionStatus();
            if (!(connectionStatus && connectionStatus.connections))
                return false;
            const failedConnections = Object.values(connectionStatus.connections).filter((conn) => conn && conn.status === 'failed').length;
            if (failedConnections > 0) {
                return false;
            }
        }
        return true;
    }
    registerBuiltInInjectors() {
        this.registerFailureInjector('memory_pressure', {
            inject: async (params) => {
                const size = params.size || 100 * 1024 * 1024;
                const duration = params?.duration || 60000;
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
                        arrays.length = 0;
                    }, duration),
                };
            },
            cleanup: async (injectionResult) => {
                if (injectionResult?.cleanupTimer) {
                    clearTimeout(injectionResult?.cleanupTimer);
                }
                if (injectionResult?.arrays) {
                    injectionResult.arrays.length = 0;
                }
            },
        });
        this.registerFailureInjector('cpu_stress', {
            inject: async (params) => {
                const duration = params?.duration || 60000;
                const intensity = params?.intensity || 0.5;
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
                if (injectionResult?.cleanupTimer) {
                    clearTimeout(injectionResult?.cleanupTimer);
                }
                if (injectionResult?.workers) {
                    injectionResult?.workers.forEach((worker) => {
                        try {
                            worker.terminate();
                        }
                        catch (_error) {
                        }
                    });
                }
            },
        });
        this.registerFailureInjector('network_failure', {
            inject: async (params) => {
                const targetConnections = params?.connections || 'all';
                const failureType = params?.failureType || 'disconnect';
                const affectedConnections = [];
                if (this.connectionManager) {
                    const connections = this.connectionManager.getConnectionStatus();
                    if (!(connections && connections.connections))
                        return {
                            type: 'network_failure',
                            failureType,
                            affectedConnections,
                            duration: params?.duration || 0,
                        };
                    for (const [id, _connection] of Object.entries(connections.connections)) {
                        if (targetConnections === 'all' ||
                            targetConnections?.includes(id)) {
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
                    duration: params?.duration || 0,
                };
            },
            cleanup: async (_injectionResult) => {
            },
        });
        this.registerFailureInjector('process_crash', {
            inject: async (params) => {
                const crashType = params?.crashType || 'graceful';
                if (crashType === 'oom') {
                    const memoryInjector = this.failureInjectors.get('memory_pressure');
                    if (!memoryInjector) {
                        throw new Error('Memory pressure injector not found');
                    }
                    return await memoryInjector.inject({
                        size: 1024 * 1024 * 1024,
                        duration: params?.duration || 30000,
                    });
                }
                return {
                    type: 'process_crash',
                    crashType,
                    simulated: true,
                    duration: params?.duration || 0,
                };
            },
        });
        this.logger.info('Built-in failure injectors registered', {
            injectorCount: this.failureInjectors.size,
        });
    }
    registerBuiltInExperiments() {
        this.registerExperiment('memory_pressure_recovery', {
            description: 'Test recovery from memory pressure conditions',
            category: 'system',
            failureType: 'memory_pressure',
            parameters: {
                size: 200 * 1024 * 1024,
                duration: 60000,
            },
            expectedRecovery: ['automatic'],
            blastRadius: 0.2,
            duration: 90000,
            safetyChecks: ['memory_available', 'no_critical_processes'],
        });
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
            duration: 120000,
            safetyChecks: ['connection_backup_available'],
        });
        this.registerExperiment('cpu_stress_recovery', {
            description: 'Test recovery from high CPU usage',
            category: 'system',
            failureType: 'cpu_stress',
            parameters: {
                intensity: 0.8,
                duration: 45000,
            },
            expectedRecovery: ['automatic'],
            blastRadius: 0.15,
            duration: 75000,
            safetyChecks: ['cpu_available'],
        });
        this.logger.info('Built-in experiments registered', {
            experimentCount: this.experiments.size,
        });
    }
    registerFailureInjector(name, injector) {
        this.failureInjectors.set(name, injector);
        this.logger.debug(`Registered failure injector: ${name}`);
    }
    setupSafetyChecks() {
        this.safetyChecks.set('memory_available', async () => {
            const usage = process.memoryUsage();
            const totalMemory = require('node:os').totalmem();
            const memoryUsagePercent = (usage.heapUsed / totalMemory) * 100;
            if (memoryUsagePercent > 70) {
                return {
                    safe: false,
                    reason: `High memory usage: ${memoryUsagePercent.toFixed(2)}%`,
                };
            }
            return { safe: true };
        });
        this.safetyChecks.set('cpu_available', async () => {
            const loadAvg = require('node:os').loadavg()[0];
            const cpuCount = require('node:os').cpus().length;
            const cpuUsagePercent = (loadAvg / cpuCount) * 100;
            if (cpuUsagePercent > 70) {
                return {
                    safe: false,
                    reason: `High CPU usage: ${cpuUsagePercent.toFixed(2)}%`,
                };
            }
            return { safe: true };
        });
        this.safetyChecks.set('connection_backup_available', async () => {
            return { safe: true };
        });
        this.safetyChecks.set('no_critical_processes', async () => {
            return { safe: true };
        });
    }
    createCPUWorker() {
        const start = Date.now();
        const worker = {
            terminate: () => {
                worker.terminated = true;
                const workTime = Date.now() - start;
                this.logger.debug('CPU worker terminated', { workTime });
            },
            terminated: false,
            startTime: start,
        };
        const work = () => {
            if (worker.terminated)
                return;
            let result = 0;
            for (let i = 0; i < 1000000; i++) {
                result += Math.random();
            }
            if (Date.now() - start > 5000 && (Date.now() - start) % 10000 < 100) {
                this.logger.debug('CPU worker active', {
                    workTime: Date.now() - start,
                    computationResult: result?.toFixed(2),
                });
            }
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
        this.resourceUsage = {
            memory: (totalMem - freeMem) / totalMem,
            cpu: loadAvg[0] / cpuCount,
            connections: this.connectionManager
                ? this.connectionManager.getConnectionStats().activeConnections
                : 0,
        };
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
                loadAverage: loadAvg[0]?.toFixed(2),
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
            connections: this.connectionManager
                ? this.connectionManager.getConnectionStats()
                : null,
            health: this.healthMonitor
                ? this.healthMonitor.currentHealth
                : null,
        };
    }
    getRecoveryTrigger(failureType) {
        const triggerMap = {
            memory_pressure: 'system.memory',
            cpu_stress: 'system.cpu',
            network_failure: 'mcp.connection.failed',
            process_crash: 'system.process.crashed',
        };
        return ((failureType && triggerMap[failureType]) || 'chaos.experiment.failure');
    }
    async emergencyStopExperiments(reason = 'Manual emergency stop') {
        this.logger.warn('EMERGENCY STOP ACTIVATED', { reason });
        this.emergencyStop = true;
        const cancelPromises = Array.from(this.activeExperiments.keys()).map((executionId) => this.cancelExperiment(executionId, 'Emergency stop'));
        await Promise.allSettled(cancelPromises);
        this.emit('emergency:stop', {
            reason,
            cancelledExperiments: cancelPromises.length,
        });
    }
    async cancelExperiment(executionId, reason = 'Manual cancellation') {
        const execution = this.activeExperiments.get(executionId);
        if (!execution) {
            throw new ValidationError(`Experiment execution ${executionId} not found`, 'executionId', 'valid execution ID', executionId);
        }
        execution.status = 'cancelled';
        execution.cancellationReason = reason;
        execution.endTime = new Date();
        this.logger.info(`Chaos experiment cancelled: ${execution.experimentName}`, {
            executionId,
            reason,
        });
        try {
            await this.cleanupExperiment(execution);
        }
        catch (error) {
            this.logger.error('Error during experiment cleanup', {
                executionId,
                error: error instanceof Error ? error.message : String(error),
            });
        }
        this.emit('experiment:cancelled', { executionId, execution, reason });
    }
    clearEmergencyStop() {
        this.emergencyStop = false;
        this.logger.info('Emergency stop cleared');
        this.emit('emergency:cleared');
    }
    getExperimentStatus(executionId = null) {
        if (executionId) {
            const execution = this.activeExperiments.get(executionId);
            if (!execution) {
                for (const history of this.experimentHistory.values()) {
                    const historicalExecution = history.find((e) => e.id === executionId);
                    if (historicalExecution)
                        return historicalExecution;
                }
                return null;
            }
            return execution;
        }
        return Array.from(this.activeExperiments.values());
    }
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
        void mcpTools;
        this.logger.info('MCP Tools integration configured');
    }
    exportChaosData() {
        return {
            timestamp: new Date(),
            stats: this.getChaosStats(),
            experiments: Array.from(this.experiments.entries()).map(([experimentName, experiment]) => ({
                ...experiment,
                experimentName,
                history: this.experimentHistory.get(experimentName) || [],
            })),
            activeExperiments: Array.from(this.activeExperiments.values()),
            failureInjectors: Array.from(this.failureInjectors.keys()),
            safetyChecks: Array.from(this.safetyChecks.keys()),
        };
    }
    async shutdown() {
        this.logger.info('Shutting down Chaos Engineering Framework');
        const cancelPromises = Array.from(this.activeExperiments.keys()).map((executionId) => this.cancelExperiment(executionId, 'System shutdown').catch((error) => this.logger.warn(`Error cancelling experiment ${executionId}`, {
            error: error.message,
        })));
        await Promise.allSettled(cancelPromises);
        this.experiments.clear();
        this.activeExperiments.clear();
        this.experimentHistory.clear();
        this.failureInjectors.clear();
        this.safetyChecks.clear();
        this.emit('chaos:shutdown');
    }
}
export default ChaosEngineering;
//# sourceMappingURL=chaos-engineering.js.map