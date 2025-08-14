import { getLogger } from '../../../config/logging-config.ts';
const logger = getLogger('coordination-swarm-core-session-example');
import { SessionEnabledSwarm, SessionRecoveryService, } from './session-integration.ts';
import { SessionManager } from './session-manager.ts';
import { SessionStats, SessionValidator } from './session-utils.ts';
async function basicSessionExample() {
    const swarm = new SessionEnabledSwarm({
        topology: 'hierarchical',
        maxAgents: 8,
        connectionDensity: 0.7,
        syncInterval: 2000,
    }, {
        autoCheckpoint: true,
        checkpointInterval: 60000,
        maxCheckpoints: 10,
    });
    try {
        await swarm.initialize();
        const sessionId = await swarm.createSession('ML Training Pipeline');
        const dataAgent = await swarm.addAgent({
            id: 'data-processor',
            type: 'analyst',
            capabilities: ['data-preprocessing', 'feature-extraction'],
        });
        const modelAgent = await swarm.addAgent({
            id: 'model-trainer',
            type: 'researcher',
            capabilities: ['neural-networks', 'optimization'],
        });
        const evaluatorAgent = await swarm.addAgent({
            id: 'model-evaluator',
            type: 'tester',
            capabilities: ['validation', 'metrics-calculation'],
        });
        const dataTask = await swarm.submitTask({
            description: 'Preprocess training dataset',
            priority: 'high',
            assignedAgents: [dataAgent],
            dependencies: [],
            swarmId: 'default',
            strategy: 'balanced',
            progress: 0,
            requireConsensus: false,
            maxAgents: 5,
            requiredCapabilities: [],
            createdAt: new Date(),
            metadata: {},
        });
        const trainingTask = await swarm.submitTask({
            description: 'Train neural network model',
            priority: 'high',
            dependencies: [dataTask],
            assignedAgents: [modelAgent],
            swarmId: 'default',
            strategy: 'balanced',
            progress: 0,
            requireConsensus: false,
            maxAgents: 5,
            requiredCapabilities: [],
            createdAt: new Date(),
            metadata: {},
        });
        const _evaluationTask = await swarm.submitTask({
            description: 'Evaluate model performance',
            priority: 'medium',
            dependencies: [trainingTask],
            assignedAgents: [evaluatorAgent],
            swarmId: 'default',
            strategy: 'balanced',
            progress: 0,
            requireConsensus: false,
            maxAgents: 5,
            requiredCapabilities: [],
            createdAt: new Date(),
            metadata: {},
        });
        const _checkpointId = await swarm.createCheckpoint('Initial pipeline setup');
        const _stats = await swarm.getSessionStats();
        await swarm.saveSession();
        return sessionId;
    }
    finally {
        await swarm.destroy();
    }
}
async function sessionRecoveryExample(existingSessionId) {
    const swarm = new SessionEnabledSwarm({
        topology: 'mesh',
        maxAgents: 10,
    });
    try {
        await swarm.initialize();
        await swarm.loadSession(existingSessionId);
        const currentSession = await swarm.getCurrentSession();
        if (currentSession) {
            const optimizerAgent = await swarm.addAgent({
                id: 'hyperparameter-optimizer',
                type: 'optimizer',
                capabilities: ['grid-search', 'bayesian-optimization'],
            });
            const _optimizationTask = await swarm.submitTask({
                description: 'Optimize hyperparameters',
                priority: 'medium',
                assignedAgents: [optimizerAgent],
                dependencies: [],
                swarmId: 'default',
                strategy: 'balanced',
                progress: 0,
                requireConsensus: false,
                maxAgents: 5,
                requiredCapabilities: [],
                createdAt: new Date(),
                metadata: {},
            });
            await swarm.createCheckpoint('Added hyperparameter optimization');
            if (currentSession?.checkpoints.length > 0) {
                const firstCheckpoint = currentSession?.checkpoints?.[0];
                await swarm.restoreFromCheckpoint(firstCheckpoint.id);
            }
        }
    }
    finally {
        await swarm.destroy();
    }
}
async function sessionLifecycleExample() {
    const persistence = {
        query: async (_sql, _params) => [],
        execute: async (_sql, _params) => ({ affectedRows: 1 }),
        initialize: async () => { },
        close: async () => { },
    };
    await persistence.initialize();
    const sessionManager = new SessionManager(persistence, {
        autoCheckpoint: true,
        checkpointInterval: 30000,
        maxCheckpoints: 5,
        compressionEnabled: true,
        encryptionEnabled: false,
    });
    try {
        await sessionManager.initialize();
        const sessionId = await sessionManager.createSession('Long Running Analysis', {
            topology: 'distributed',
            maxAgents: 15,
        });
        await sessionManager.saveSession(sessionId, {
            agents: new Map([
                ['analyst-1', { id: 'analyst-1', type: 'analyst' }],
                ['researcher-1', { id: 'researcher-1', type: 'researcher' }],
            ]),
            tasks: new Map([
                ['task-1', { id: 'task-1', description: 'Analyze data' }],
            ]),
            topology: 'distributed',
            connections: [],
            metrics: {
                totalTasks: 1,
                completedTasks: 0,
                failedTasks: 0,
                averageCompletionTime: 0,
                agentUtilization: new Map(),
                throughput: 0,
            },
        });
        const _checkpoint1 = await sessionManager.createCheckpoint(sessionId, 'Work started');
        await sessionManager.pauseSession(sessionId);
        await sessionManager.resumeSession(sessionId);
        const _stats = await sessionManager.getSessionStats(sessionId);
        const _allSessions = await sessionManager.listSessions();
        await sessionManager.hibernateSession(sessionId);
        const _hibernatedSession = await sessionManager.loadSession(sessionId);
        return sessionId;
    }
    finally {
        await sessionManager.shutdown();
        await persistence.close();
    }
}
async function sessionHealthExample() {
    const persistence = {
        query: async (_sql, _params) => [],
        execute: async (_sql, _params) => ({ affectedRows: 1 }),
        initialize: async () => { },
        close: async () => { },
    };
    await persistence.initialize();
    const sessionManager = new SessionManager(persistence);
    await sessionManager.initialize();
    const recoveryService = new SessionRecoveryService(sessionManager);
    try {
        const session1 = await sessionManager.createSession('Healthy Session', {
            topology: 'mesh',
        });
        const session2 = await sessionManager.createSession('Test Session', {
            topology: 'hierarchical',
        });
        await sessionManager.createCheckpoint(session1, 'Healthy checkpoint');
        await sessionManager.createCheckpoint(session2, 'Test checkpoint');
        const healthReport = await recoveryService.runHealthCheck();
        for (const sessionId of [session1, session2]) {
            const session = await sessionManager.loadSession(sessionId);
            const _healthScore = SessionStats.calculateHealthScore(session);
            const _summary = SessionStats.generateSummary(session);
        }
        if (healthReport['needsRecovery'] &&
            healthReport['needsRecovery'].length > 0) {
            await recoveryService.scheduleAutoRecovery();
        }
    }
    finally {
        await sessionManager.shutdown();
        await persistence.close();
    }
}
async function advancedSessionExample() {
    const swarm = new SessionEnabledSwarm({
        topology: 'hybrid',
        maxAgents: 20,
        connectionDensity: 0.8,
    }, {
        autoCheckpoint: true,
        checkpointInterval: 45000,
        maxCheckpoints: 8,
        compressionEnabled: true,
    });
    try {
        await swarm.initialize();
        swarm.on('session:created', (_data) => { });
        swarm.on('session:checkpoint_created', (_data) => { });
        swarm.on('session:error', (data) => {
            logger.error(`Session error: ${data?.error} during ${data?.operation}`);
        });
        const _sessionId = await swarm.createSession('Advanced ML Pipeline');
        const agents = [
            {
                id: 'data-collector',
                type: 'researcher',
                capabilities: ['web-scraping', 'api-integration'],
            },
            {
                id: 'data-cleaner',
                type: 'analyst',
                capabilities: ['data-validation', 'outlier-detection'],
            },
            {
                id: 'feature-engineer',
                type: 'architect',
                capabilities: ['feature-selection', 'dimensionality-reduction'],
            },
            {
                id: 'model-builder',
                type: 'coder',
                capabilities: ['deep-learning', 'ensemble-methods'],
            },
            {
                id: 'model-validator',
                type: 'reviewer',
                capabilities: ['cross-validation', 'performance-metrics'],
            },
            {
                id: 'deployment-manager',
                type: 'architect',
                capabilities: ['containerization', 'monitoring'],
            },
        ];
        const agentIds = [];
        for (const agent of agents) {
            const agentId = await swarm.addAgent(agent);
            agentIds.push(agentId);
        }
        const tasks = [
            {
                description: 'Collect training data from multiple sources',
                priority: 'critical',
                assignedAgents: [agentIds[0]],
                dependencies: [],
                swarmId: 'advanced-pipeline',
                strategy: 'balanced',
                progress: 0,
                requireConsensus: false,
                maxAgents: 5,
                requiredCapabilities: [],
                createdAt: new Date(),
                metadata: {},
            },
            {
                description: 'Clean and validate collected data',
                priority: 'high',
                assignedAgents: [agentIds[1]],
                dependencies: [],
                swarmId: 'advanced-pipeline',
                strategy: 'balanced',
                progress: 0,
                requireConsensus: false,
                maxAgents: 5,
                requiredCapabilities: [],
                createdAt: new Date(),
                metadata: {},
            },
            {
                description: 'Engineer features from cleaned data',
                priority: 'high',
                assignedAgents: [agentIds[2]],
                dependencies: [],
                swarmId: 'advanced-pipeline',
                strategy: 'balanced',
                progress: 0,
                requireConsensus: false,
                maxAgents: 5,
                requiredCapabilities: [],
                createdAt: new Date(),
                metadata: {},
            },
            {
                description: 'Build and train multiple models',
                priority: 'high',
                assignedAgents: [agentIds[3]],
                dependencies: [],
                swarmId: 'advanced-pipeline',
                strategy: 'balanced',
                progress: 0,
                requireConsensus: false,
                maxAgents: 5,
                requiredCapabilities: [],
                createdAt: new Date(),
                metadata: {},
            },
            {
                description: 'Validate model performance',
                priority: 'medium',
                assignedAgents: [agentIds[4]],
                dependencies: [],
                swarmId: 'advanced-pipeline',
                strategy: 'balanced',
                progress: 0,
                requireConsensus: false,
                maxAgents: 5,
                requiredCapabilities: [],
                createdAt: new Date(),
                metadata: {},
            },
            {
                description: 'Deploy best performing model',
                priority: 'medium',
                assignedAgents: [agentIds[5]],
                dependencies: [],
                swarmId: 'advanced-pipeline',
                strategy: 'balanced',
                progress: 0,
                requireConsensus: false,
                maxAgents: 5,
                requiredCapabilities: [],
                createdAt: new Date(),
                metadata: {},
            },
        ];
        const taskIds = [];
        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            if (i > 0) {
                const previousTaskId = taskIds[i - 1];
                if (previousTaskId) {
                    task.dependencies = [previousTaskId];
                }
            }
            const taskId = await swarm.submitTask(task);
            taskIds.push(taskId);
        }
        await swarm.createCheckpoint('Pipeline setup complete');
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await swarm.createCheckpoint('Data collection phase');
        const session = await swarm.getCurrentSession();
        if (session) {
            const validation = SessionValidator.validateSessionState(session);
            if (!validation.valid) {
            }
            const _healthScore = SessionStats.calculateHealthScore(session);
            const _summary = SessionStats.generateSummary(session);
        }
        if (session) {
            const _exportedData = await swarm.exportSession();
        }
    }
    finally {
        await swarm.destroy();
    }
}
async function runAllExamples() {
    try {
        const sessionId = await basicSessionExample();
        await sessionRecoveryExample(sessionId);
        const _lifecycleSessionId = await sessionLifecycleExample();
        await sessionHealthExample();
        await advancedSessionExample();
    }
    catch (error) {
        logger.error('❌ Error running examples:', error);
        process.exit(1);
    }
}
if (typeof module !== 'undefined' && module.exports) {
    const { SessionEnabledSwarm } = require('./session-integration.js');
    const { SessionSerializer } = require('./session-utils.js');
    SessionEnabledSwarm.prototype.exportSession =
        async function () {
            const session = await this.getCurrentSession();
            if (!session) {
                throw new Error('No active session to export');
            }
            return SessionSerializer.exportSession(session);
        };
}
if (require.main === module) {
    runAllExamples().catch(console.error);
}
export { basicSessionExample, sessionRecoveryExample, sessionLifecycleExample, sessionHealthExample, advancedSessionExample, runAllExamples, };
//# sourceMappingURL=session-example.js.map