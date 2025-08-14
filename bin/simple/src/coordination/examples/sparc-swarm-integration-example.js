import { getLogger } from '../../config/logging-config.ts';
import { DatabaseDrivenSystem } from '../../core/database-driven-system.ts';
import { WorkflowEngine } from '../../core/workflow-engine.ts';
import { DocumentManager } from '../../database/managers/document-manager.ts';
import { DatabaseSPARCBridge } from '../database-sparc-bridge.ts';
import { SPARCSwarmCoordinator } from '../swarm/core/sparc-swarm-coordinator.ts';
import { TaskCoordinator } from '../task-coordinator.ts';
const logger = getLogger('SPARCSwarmIntegrationExample');
export class SPARCSwarmIntegrationExample {
    databaseSystem;
    sparcSwarm;
    bridge;
    taskCoordinator;
    constructor() {
        const mockCoordinator = {};
        const documentService = new DocumentManager(mockCoordinator);
        const workflowEngine = new WorkflowEngine();
        this.databaseSystem = new DatabaseDrivenSystem(documentService, workflowEngine);
        this.sparcSwarm = new SPARCSwarmCoordinator();
        this.bridge = new DatabaseSPARCBridge(this.databaseSystem, documentService, this.sparcSwarm);
        this.taskCoordinator = TaskCoordinator.getInstance();
    }
    async runIntegrationDemo() {
        logger.info('🚀 Starting SPARC-Swarm Integration Demonstration');
        try {
            await this.initializeSystems();
            const workspaceId = await this.createDemoWorkspace();
            const feature = await this.createDemoFeature(workspaceId);
            const assignmentId = await this.assignFeatureToSparc(feature);
            await this.demonstrateTaskCoordination(feature);
            await this.monitorResults(assignmentId);
            logger.info('✅ SPARC-Swarm Integration Demonstration completed successfully');
        }
        catch (error) {
            logger.error('❌ Integration demonstration failed:', error);
            throw error;
        }
    }
    async initializeSystems() {
        logger.info('🔧 Initializing systems...');
        await this.databaseSystem.initialize();
        logger.info('  ✅ Database-driven system initialized');
        await this.sparcSwarm.initialize();
        logger.info('  ✅ SPARC swarm coordinator initialized');
        await this.bridge.initialize();
        logger.info('  ✅ Database-SPARC bridge initialized');
        await this.taskCoordinator.initializeSPARCIntegration(this.bridge, this.sparcSwarm);
        logger.info('  ✅ Task coordinator SPARC integration initialized');
        logger.info('🎯 All systems ready for integration demo');
    }
    async createDemoWorkspace() {
        logger.info('📁 Creating demo workspace with database-driven product flow...');
        const workspaceId = await this.databaseSystem.createProjectWorkspace({
            name: 'SPARC Integration Demo',
            domain: 'swarm-coordination',
            description: 'Demonstration of SPARC methodology integration with swarm coordination',
            complexity: 'moderate',
            author: 'sparc-integration-demo',
        });
        logger.info(`  ✅ Workspace created: ${workspaceId}`);
        return workspaceId;
    }
    async createDemoFeature(workspaceId) {
        logger.info('🎯 Creating demo feature in database-driven system...');
        const feature = await this.databaseSystem.createVisionDocument(workspaceId, {
            title: 'SPARC-Enhanced Task Processing System',
            businessObjectives: [
                'Implement systematic task processing using SPARC methodology',
                'Coordinate multiple agents for complex implementation tasks',
                'Provide traceability from requirements to completion',
                'Enable quality validation at each SPARC phase',
            ],
            successCriteria: [
                'SPARC phases execute systematically',
                'Agent coordination is efficient and trackable',
                'Implementation artifacts are generated and stored',
                'Quality metrics meet established thresholds',
            ],
            stakeholders: [
                'Development Team',
                'Product Manager',
                'Quality Assurance',
            ],
            timeline: {
                start_date: new Date(),
                target_completion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                milestones: [
                    {
                        name: 'SPARC Integration Complete',
                        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        description: 'SPARC methodology fully integrated with swarm coordination',
                    },
                    {
                        name: 'Quality Validation System',
                        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                        description: 'Quality validation system operational',
                    },
                    {
                        name: 'Production Deployment',
                        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                        description: 'System deployed and operational in production',
                    },
                ],
            },
        });
        const generatedFeatures = await this.databaseSystem.generateDocumentsFromSource(workspaceId, feature.id, 'feature');
        if (generatedFeatures.length === 0) {
            throw new Error('No features generated from vision document');
        }
        const demoFeature = generatedFeatures[0];
        logger.info(`  ✅ Demo feature created: ${demoFeature.title}`);
        return demoFeature;
    }
    async assignFeatureToSparc(feature) {
        logger.info('🤖 Assigning feature to SPARC swarm...');
        const assignmentId = await this.bridge.assignFeatureToSparcs(feature);
        logger.info(`  ✅ Feature assigned to SPARC swarm: ${assignmentId}`);
        logger.info('  🔄 SPARC methodology phases will execute:');
        logger.info('    1. 📝 Specification - Requirements analysis and acceptance criteria');
        logger.info('    2. 📐 Pseudocode - Algorithm design and logic structure');
        logger.info('    3. 🏗️ Architecture - System design and component architecture');
        logger.info('    4. 🔍 Refinement - Code review, optimization, and quality assurance');
        logger.info('    5. 🎯 Completion - Testing, deployment, and final validation');
        return assignmentId;
    }
    async demonstrateTaskCoordination(feature) {
        logger.info('🔧 Demonstrating task coordination with SPARC methodology...');
        const taskResult = await this.taskCoordinator.executeTask({
            description: 'Implement real-time agent coordination system with SPARC phases',
            prompt: `
        Design and implement a real-time agent coordination system that:
        1. Manages agent registration and discovery
        2. Distributes tasks based on agent capabilities
        3. Monitors task progress and agent performance
        4. Handles agent failures and task redistribution
        5. Provides real-time status updates and metrics
        
        The system should be scalable, fault-tolerant, and provide comprehensive monitoring.
      `,
            subagent_type: 'system-architect',
            use_sparc_methodology: true,
            priority: 'high',
            source_document: feature,
            domain_context: 'swarm-coordination',
            tools_required: ['design-tools', 'code-generation', 'testing-framework'],
        });
        logger.info('  📊 Task coordination results:');
        logger.info(`    Success: ${taskResult?.success ? '✅' : '❌'}`);
        logger.info(`    Methodology: ${taskResult?.methodology_applied}`);
        logger.info(`    Agent used: ${taskResult?.agent_used}`);
        logger.info(`    Execution time: ${taskResult?.execution_time_ms}ms`);
        if (taskResult?.sparc_task_id) {
            logger.info(`    SPARC task ID: ${taskResult?.sparc_task_id}`);
            logger.info(`    Artifacts generated: ${taskResult?.implementation_artifacts?.length || 0}`);
        }
    }
    async monitorResults(_assignmentId) {
        logger.info('📊 Monitoring SPARC-Swarm integration results...');
        const bridgeStatus = this.bridge.getStatus();
        logger.info('  🌉 Bridge Status:');
        logger.info(`    Status: ${bridgeStatus.bridgeStatus}`);
        logger.info(`    Active assignments: ${bridgeStatus.activeAssignments}`);
        logger.info(`    Completed work: ${bridgeStatus.completedWork}`);
        const workStatus = await this.bridge.getWorkStatus();
        logger.info('  📋 Work Status:');
        logger.info(`    Total assignments: ${workStatus.metrics.totalAssignments}`);
        logger.info(`    Completed assignments: ${workStatus.metrics.completedAssignments}`);
        logger.info(`    Success rate: ${(workStatus.metrics.successRate * 100).toFixed(1)}%`);
        logger.info(`    Avg completion time: ${Math.round(workStatus.metrics.averageCompletionTime / 1000)}s`);
        const sparcMetrics = this.sparcSwarm.getSPARCMetrics();
        logger.info('  🤖 SPARC Swarm Metrics:');
        logger.info(`    SPARC tasks total: ${sparcMetrics.sparcTasksTotal}`);
        logger.info(`    SPARC tasks completed: ${sparcMetrics.sparcTasksCompleted}`);
        logger.info(`    Average cycle time: ${Math.round(sparcMetrics.averageSparcCycleTime / 1000)}s`);
        const activeTasks = this.sparcSwarm.getActiveSPARCTasks();
        logger.info(`  🔄 Active SPARC tasks: ${activeTasks.length}`);
        activeTasks.forEach((task) => {
            logger.info(`    Task: ${task.id} (${task.type})`);
            logger.info(`      Current phase: ${task.currentPhase}`);
            logger.info(`      Status: ${task.status}`);
            logger.info(`      Priority: ${task.priority}`);
        });
        logger.info('✅ Integration monitoring complete');
    }
    async getIntegrationStatus() {
        return {
            databaseSystem: !!this.databaseSystem,
            sparcSwarm: this.sparcSwarm.getState() === 'active',
            bridge: this.bridge.getStatus().bridgeStatus === 'active',
            taskCoordination: true,
        };
    }
}
export async function runSPARCSwarmIntegrationExample() {
    const integration = new SPARCSwarmIntegrationExample();
    await integration.runIntegrationDemo();
}
//# sourceMappingURL=sparc-swarm-integration-example.js.map