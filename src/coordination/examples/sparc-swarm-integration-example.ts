/**
 * SPARC-Swarm Integration Example
 *
 * Demonstrates the complete integration of SPARC methodology with swarm coordination
 * in the database-driven product flow system
 */

import { DatabaseDrivenSystem } from '../../core/database-driven-system';
import { createLogger } from '../../core/logger';
import { WorkflowEngine } from '../../core/workflow-engine';
import type {
  FeatureDocumentEntity,
  TaskDocumentEntity,
} from '../../database/entities/product-entities';
import { DocumentManager } from '../../database/managers/document-manager';
import { DatabaseSPARCBridge } from '../database-sparc-bridge';
import { SPARCSwarmCoordinator } from '../swarm/core/sparc-swarm-coordinator';
import { TaskCoordinator } from '../task-coordinator';

const logger = createLogger('SPARCSwarmIntegrationExample');

/**
 * Complete Integration Example
 *
 * Shows the flow:
 * 1. Database-driven product flow creates Features/Tasks
 * 2. Features/Tasks are assigned to SPARC swarm
 * 3. SPARC methodology is applied by coordinated agents
 * 4. Results are stored back in database
 */
export class SPARCSwarmIntegrationExample {
  private databaseSystem: DatabaseDrivenSystem;
  private sparcSwarm: SPARCSwarmCoordinator;
  private bridge: DatabaseSPARCBridge;
  private taskCoordinator: TaskCoordinator;

  constructor() {
    // Initialize core systems with required dependencies
    const mockCoordinator = {} as any; // Mock for database coordinator
    const documentService = new DocumentManager(mockCoordinator);
    const mockMemory = {} as any; // Mock for unified memory system
    const workflowEngine = new WorkflowEngine(mockMemory, documentService);

    this.databaseSystem = new DatabaseDrivenSystem(documentService, workflowEngine);
    this.sparcSwarm = new SPARCSwarmCoordinator();
    this.bridge = new DatabaseSPARCBridge(this.databaseSystem, documentService, this.sparcSwarm);
    this.taskCoordinator = TaskCoordinator.getInstance();
  }

  /**
   * Run complete integration demonstration
   */
  async runIntegrationDemo(): Promise<void> {
    logger.info('🚀 Starting SPARC-Swarm Integration Demonstration');

    try {
      // Step 1: Initialize all systems
      await this.initializeSystems();

      // Step 2: Create a database-driven workspace with product flow
      const workspaceId = await this.createDemoWorkspace();

      // Step 3: Generate a feature using database-driven system
      const feature = await this.createDemoFeature(workspaceId);

      // Step 4: Assign feature to SPARC swarm
      const assignmentId = await this.assignFeatureToSparc(feature);

      // Step 5: Demonstrate task coordination with SPARC
      await this.demonstrateTaskCoordination(feature);

      // Step 6: Monitor and report results
      await this.monitorResults(assignmentId);

      logger.info('✅ SPARC-Swarm Integration Demonstration completed successfully');
    } catch (error) {
      logger.error('❌ Integration demonstration failed:', error);
      throw error;
    }
  }

  /**
   * Step 1: Initialize all systems
   */
  private async initializeSystems(): Promise<void> {
    logger.info('🔧 Initializing systems...');

    // Initialize database-driven system
    await this.databaseSystem.initialize();
    logger.info('  ✅ Database-driven system initialized');

    // Initialize SPARC swarm
    await this.sparcSwarm.initialize();
    logger.info('  ✅ SPARC swarm coordinator initialized');

    // Initialize bridge
    await this.bridge.initialize();
    logger.info('  ✅ Database-SPARC bridge initialized');

    // Initialize task coordinator with SPARC integration
    await this.taskCoordinator.initializeSPARCIntegration(this.bridge, this.sparcSwarm);
    logger.info('  ✅ Task coordinator SPARC integration initialized');

    logger.info('🎯 All systems ready for integration demo');
  }

  /**
   * Step 2: Create demo workspace with product flow
   */
  private async createDemoWorkspace(): Promise<string> {
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

  /**
   * Step 3: Create demo feature using database-driven system
   */
  private async createDemoFeature(workspaceId: string): Promise<FeatureDocumentEntity> {
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
      stakeholders: ['Development Team', 'Product Manager', 'Quality Assurance'],
      timeline: {
        startDate: new Date(),
        targetCompletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
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

    // Generate features from vision (database-driven workflow)
    const generatedFeatures = await this.databaseSystem.generateDocumentsFromSource(
      workspaceId,
      feature.id,
      'feature'
    );

    if (generatedFeatures.length === 0) {
      throw new Error('No features generated from vision document');
    }

    const demoFeature = generatedFeatures[0] as FeatureDocumentEntity;
    logger.info(`  ✅ Demo feature created: ${demoFeature.title}`);

    return demoFeature;
  }

  /**
   * Step 4: Assign feature to SPARC swarm
   */
  private async assignFeatureToSparc(feature: FeatureDocumentEntity): Promise<string> {
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

  /**
   * Step 5: Demonstrate task coordination with SPARC
   */
  private async demonstrateTaskCoordination(feature: FeatureDocumentEntity): Promise<void> {
    logger.info('🔧 Demonstrating task coordination with SPARC methodology...');

    // Example: Create a complex task that benefits from SPARC methodology
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
    logger.info(`    Success: ${taskResult.success ? '✅' : '❌'}`);
    logger.info(`    Methodology: ${taskResult.methodology_applied}`);
    logger.info(`    Agent used: ${taskResult.agent_used}`);
    logger.info(`    Execution time: ${taskResult.execution_time_ms}ms`);

    if (taskResult.sparc_task_id) {
      logger.info(`    SPARC task ID: ${taskResult.sparc_task_id}`);
      logger.info(`    Artifacts generated: ${taskResult.implementation_artifacts?.length || 0}`);
    }
  }

  /**
   * Step 6: Monitor and report results
   */
  private async monitorResults(assignmentId: string): Promise<void> {
    logger.info('📊 Monitoring SPARC-Swarm integration results...');

    // Get bridge status
    const bridgeStatus = this.bridge.getStatus();
    logger.info('  🌉 Bridge Status:');
    logger.info(`    Status: ${bridgeStatus.bridgeStatus}`);
    logger.info(`    Active assignments: ${bridgeStatus.activeAssignments}`);
    logger.info(`    Completed work: ${bridgeStatus.completedWork}`);

    // Get work status
    const workStatus = await this.bridge.getWorkStatus();
    logger.info('  📋 Work Status:');
    logger.info(`    Total assignments: ${workStatus.metrics.totalAssignments}`);
    logger.info(`    Completed assignments: ${workStatus.metrics.completedAssignments}`);
    logger.info(`    Success rate: ${(workStatus.metrics.successRate * 100).toFixed(1)}%`);
    logger.info(
      `    Avg completion time: ${Math.round(workStatus.metrics.averageCompletionTime / 1000)}s`
    );

    // Get SPARC metrics
    const sparcMetrics = this.sparcSwarm.getSPARCMetrics();
    logger.info('  🤖 SPARC Swarm Metrics:');
    logger.info(`    SPARC tasks total: ${sparcMetrics.sparcTasksTotal}`);
    logger.info(`    SPARC tasks completed: ${sparcMetrics.sparcTasksCompleted}`);
    logger.info(
      `    Average cycle time: ${Math.round(sparcMetrics.averageSparcCycleTime / 1000)}s`
    );

    // Get active SPARC tasks
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

  /**
   * Get integration status summary
   */
  async getIntegrationStatus(): Promise<{
    databaseSystem: boolean;
    sparcSwarm: boolean;
    bridge: boolean;
    taskCoordination: boolean;
  }> {
    return {
      databaseSystem: this.databaseSystem ? true : false,
      sparcSwarm: this.sparcSwarm.getState() === 'active',
      bridge: this.bridge.getStatus().bridgeStatus === 'active',
      taskCoordination: true, // TaskCoordinator is singleton, always available
    };
  }
}

/**
 * Run the integration example
 */
export async function runSPARCSwarmIntegrationExample(): Promise<void> {
  const integration = new SPARCSwarmIntegrationExample();
  await integration.runIntegrationDemo();
}

// Export for CLI usage
// SPARCSwarmIntegrationExample is already exported above at line 31
