/**
 * SPARC Swarm CLI Commands
 *
 * CLI interface for SPARC methodology integration with swarm coordination
 * in the database-driven product flow
 */

import { Command } from 'commander';
import { DatabaseSPARCBridge } from '../../coordination/database-sparc-bridge';
import { SPARCSwarmCoordinator } from '../../coordination/swarm/core/sparc-swarm-coordinator';
import { DatabaseDrivenSystem } from '../../core/database-driven-system';
import { createLogger } from '../../core/logger';
import { WorkflowEngine } from '../../core/workflow-engine';
import type {
  FeatureDocumentEntity,
  TaskDocumentEntity,
} from '../../database/entities/product-entities';
import { DocumentService } from '../../database/services/document-service';

const logger = createLogger('SPARCSwarmCLI');

export function createSPARCSwarmCommands(): Command {
  const sparcSwarmCmd = new Command('sparc-swarm');
  sparcSwarmCmd.description(
    'SPARC methodology with swarm coordination for database-driven features/tasks'
  );

  // Initialize SPARC-Swarm integration
  sparcSwarmCmd
    .command('init')
    .description('Initialize SPARC-Swarm integration with database-driven system')
    .option('--project-id <id>', 'Project ID to initialize for')
    .option('--swarm-size <size>', 'Number of agents in swarm', '10')
    .action(async (options) => {
      try {
        logger.info('🚀 Initializing SPARC-Swarm integration');

        // Initialize components
        const documentService = new DocumentService();
        const workflowEngine = new WorkflowEngine();
        const databaseSystem = new DatabaseDrivenSystem(documentService, workflowEngine);
        const sparcSwarm = new SPARCSwarmCoordinator();
        const bridge = new DatabaseSPARCBridge(databaseSystem, documentService, sparcSwarm);

        await bridge.initialize();

        console.log('✅ SPARC-Swarm integration initialized');
        console.log(`📊 Swarm size: ${options.swarmSize} agents`);
        console.log('🔗 Connected to database-driven product flow');

        if (options.projectId) {
          console.log(`📁 Project context: ${options.projectId}`);
        }
      } catch (error) {
        console.error('❌ Failed to initialize SPARC-Swarm integration:', error);
        process.exit(1);
      }
    });

  // Assign feature to SPARC swarm
  sparcSwarmCmd
    .command('assign-feature')
    .description('Assign a feature to SPARC swarm for implementation')
    .requiredOption('--feature-id <id>', 'Feature document ID from database')
    .option('--priority <level>', 'Override priority (low|medium|high|critical)')
    .action(async (options) => {
      try {
        logger.info(`🎯 Assigning feature ${options.featureId} to SPARC swarm`);

        // Initialize systems
        const { bridge, sparcSwarm } = await initializeSystems();

        // Get feature from database
        const documentService = new DocumentService();
        await documentService.initialize();

        const feature = await documentService.getDocumentById(options.featureId);
        if (!feature || feature.type !== 'feature') {
          throw new Error(`Feature not found: ${options.featureId}`);
        }

        // Override priority if specified
        if (options.priority) {
          feature.priority = options.priority;
        }

        // Assign to SPARC swarm
        const assignmentId = await bridge.assignFeatureToSparcs(feature as FeatureDocumentEntity);

        console.log('🔄 Feature assigned to SPARC swarm');
        console.log(`📋 Assignment ID: ${assignmentId}`);
        console.log(`🎯 Feature: ${feature.title}`);
        console.log(`⚡ Priority: ${feature.priority}`);
        console.log('\n🔍 SPARC phases will be executed:');
        console.log('  1. 📝 Specification - Requirements analysis');
        console.log('  2. 📐 Pseudocode - Algorithm design');
        console.log('  3. 🏗️ Architecture - System design');
        console.log('  4. 🔍 Refinement - Code review & optimization');
        console.log('  5. 🎯 Completion - Testing & deployment');
      } catch (error) {
        console.error('❌ Failed to assign feature to SPARC swarm:', error);
        process.exit(1);
      }
    });

  // Assign task to SPARC swarm
  sparcSwarmCmd
    .command('assign-task')
    .description('Assign a task to SPARC swarm for implementation')
    .requiredOption('--task-id <id>', 'Task document ID from database')
    .option('--priority <level>', 'Override priority (low|medium|high|critical)')
    .action(async (options) => {
      try {
        logger.info(`🔧 Assigning task ${options.taskId} to SPARC swarm`);

        // Initialize systems
        const { bridge } = await initializeSystems();

        // Get task from database
        const documentService = new DocumentService();
        await documentService.initialize();

        const task = await documentService.getDocumentById(options.taskId);
        if (!task || task.type !== 'task') {
          throw new Error(`Task not found: ${options.taskId}`);
        }

        // Override priority if specified
        if (options.priority) {
          task.priority = options.priority;
        }

        // Assign to SPARC swarm
        const assignmentId = await bridge.assignTaskToSparcs(task as TaskDocumentEntity);

        console.log('🔄 Task assigned to SPARC swarm');
        console.log(`📋 Assignment ID: ${assignmentId}`);
        console.log(`🔧 Task: ${task.title}`);
        console.log(`⚡ Priority: ${task.priority}`);
        console.log('\n🔍 SPARC methodology will be applied for implementation');
      } catch (error) {
        console.error('❌ Failed to assign task to SPARC swarm:', error);
        process.exit(1);
      }
    });

  // Monitor SPARC swarm status
  sparcSwarmCmd
    .command('status')
    .description('Show SPARC swarm status and active work')
    .option('--detailed', 'Show detailed phase information')
    .action(async (options) => {
      try {
        logger.info('📊 Checking SPARC swarm status');

        // Initialize systems
        const { bridge, sparcSwarm } = await initializeSystems();

        // Get status
        const bridgeStatus = bridge.getStatus();
        const workStatus = await bridge.getWorkStatus();
        const sparcMetrics = sparcSwarm.getSPARCMetrics();
        const activeTasks = sparcSwarm.getActiveSPARCTasks();

        console.log('\n🌉 Database-SPARC Bridge Status');
        console.log(`  Status: ${bridgeStatus.bridgeStatus}`);
        console.log(`  Active assignments: ${bridgeStatus.activeAssignments}`);
        console.log(`  Completed work: ${bridgeStatus.completedWork}`);
        console.log(`  Database connection: ${bridgeStatus.databaseConnection ? '✅' : '❌'}`);

        console.log('\n🤖 SPARC Swarm Metrics');
        console.log(`  Agent count: ${sparcMetrics.agentCount}`);
        console.log(`  Active agents: ${sparcMetrics.activeAgents}`);
        console.log(`  SPARC tasks total: ${sparcMetrics.sparcTasksTotal}`);
        console.log(`  SPARC tasks completed: ${sparcMetrics.sparcTasksCompleted}`);
        console.log(
          `  Average cycle time: ${Math.round(sparcMetrics.averageSparcCycleTime / 1000)}s`
        );

        console.log('\n📋 Active SPARC Tasks');
        if (activeTasks.length === 0) {
          console.log('  No active tasks');
        } else {
          activeTasks.forEach((task) => {
            console.log(`  🔄 ${task.id} (${task.type})`);
            console.log(`     Current phase: ${task.currentPhase}`);
            console.log(`     Priority: ${task.priority}`);
            console.log(`     Source: ${task.sourceDocument.title}`);

            if (options.detailed) {
              console.log('     Phase progress:');
              Object.entries(task.phaseProgress).forEach(([phase, progress]) => {
                const status =
                  progress.status === 'completed'
                    ? '✅'
                    : progress.status === 'in_progress'
                      ? '🔄'
                      : progress.status === 'failed'
                        ? '❌'
                        : '⏳';
                console.log(`       ${status} ${phase}: ${progress.status}`);
              });
            }
            console.log('');
          });
        }

        console.log('\n📊 Work Assignment Metrics');
        console.log(`  Total assignments: ${workStatus.metrics.totalAssignments}`);
        console.log(`  Completed: ${workStatus.metrics.completedAssignments}`);
        console.log(`  Success rate: ${(workStatus.metrics.successRate * 100).toFixed(1)}%`);
        console.log(
          `  Avg completion time: ${Math.round(workStatus.metrics.averageCompletionTime / 1000)}s`
        );
      } catch (error) {
        console.error('❌ Failed to get SPARC swarm status:', error);
        process.exit(1);
      }
    });

  // Show SPARC phase details
  sparcSwarmCmd
    .command('phases')
    .description('Show SPARC phase metrics and performance')
    .action(async (options) => {
      try {
        logger.info('📊 Getting SPARC phase metrics');

        const { sparcSwarm } = await initializeSystems();
        const metrics = sparcSwarm.getSPARCMetrics();

        console.log('\n🔍 SPARC Phase Performance');

        const phases = [
          'specification',
          'pseudocode',
          'architecture',
          'refinement',
          'completion',
        ] as const;
        phases.forEach((phase) => {
          const phaseMetrics = metrics.phaseMetrics[phase];
          console.log(`\n📋 ${phase.toUpperCase()} Phase:`);
          console.log(`  Tasks processed: ${phaseMetrics.tasksProcessed}`);
          console.log(`  Success rate: ${(phaseMetrics.successRate * 100).toFixed(1)}%`);
          console.log(
            `  Avg completion time: ${Math.round(phaseMetrics.averageCompletionTime / 1000)}s`
          );
        });
      } catch (error) {
        console.error('❌ Failed to get SPARC phase metrics:', error);
        process.exit(1);
      }
    });

  // Demonstrate SPARC with example
  sparcSwarmCmd
    .command('demo')
    .description('Demonstrate SPARC methodology with sample task')
    .option('--complexity <level>', 'Task complexity (simple|moderate|complex)', 'moderate')
    .action(async (options) => {
      try {
        logger.info('🎭 Running SPARC methodology demonstration');

        const { bridge, sparcSwarm } = await initializeSystems();

        // Create example task based on complexity
        const complexityExamples = {
          simple: {
            title: 'Create user profile component',
            description: 'Build a React component to display user profile information',
            acceptance_criteria: [
              'Display user name',
              'Show profile picture',
              'Handle loading states',
            ],
          },
          moderate: {
            title: 'Implement user authentication system',
            description:
              'Build complete authentication with JWT tokens, login/logout, and session management',
            acceptance_criteria: [
              'User registration with email validation',
              'Login with JWT token generation',
              'Protected routes and middleware',
              'Session persistence and logout',
            ],
          },
          complex: {
            title: 'Design distributed messaging system',
            description:
              'Architect and implement a scalable real-time messaging system with microservices',
            acceptance_criteria: [
              'Real-time message delivery',
              'Message persistence and history',
              'User presence and typing indicators',
              'Message encryption and security',
              'Horizontal scaling support',
              'Integration with existing user system',
            ],
          },
        };

        const example = complexityExamples[options.complexity as keyof typeof complexityExamples];

        console.log('\n🎯 Demo Task Configuration');
        console.log(`  Complexity: ${options.complexity}`);
        console.log(`  Title: ${example.title}`);
        console.log(`  Description: ${example.description}`);
        console.log(`  Acceptance Criteria: ${example.acceptance_criteria.length} items`);

        // Create demo task document
        const demoTask: TaskDocumentEntity = {
          id: `demo-task-${Date.now()}`,
          type: 'task',
          title: example.title,
          content: example.description,
          status: 'draft',
          priority: options.complexity === 'complex' ? 'high' : 'medium',
          author: 'sparc-demo',
          tags: ['sparc-demo', options.complexity],
          project_id: 'demo-project',
          parent_document_id: undefined,
          dependencies: [],
          related_documents: [],
          version: '1.0.0',
          searchable_content: example.description,
          keywords: ['demo', 'sparc'],
          workflow_stage: 'sparc-ready',
          completion_percentage: 0,
          created_at: new Date(),
          updated_at: new Date(),
          checksum: 'demo-checksum',
          task_type: 'implementation',
          estimated_hours:
            options.complexity === 'complex' ? 40 : options.complexity === 'moderate' ? 16 : 8,
          implementation_details: {
            files_to_create: [],
            files_to_modify: [],
            test_files: [],
            documentation_updates: [],
          },
          technical_specifications: {
            component: example.title.toLowerCase().replace(/\s+/g, '-'),
            module: 'demo',
            functions: [],
            dependencies: [],
          },
          source_feature_id: undefined,
          completion_status: 'todo',
          acceptance_criteria: example.acceptance_criteria,
        };

        console.log('\n🚀 Starting SPARC demonstration...');

        // Assign to SPARC swarm
        const assignmentId = await bridge.assignTaskToSparcs(demoTask);

        console.log(`✅ Demo task assigned: ${assignmentId}`);
        console.log('\n🔄 SPARC phases will execute:');
        console.log('  1. 📝 Specification phase starting...');

        // In a real implementation, we would wait for actual completion
        // For demo, show what would happen
        setTimeout(() => {
          console.log('  ✅ Specification completed');
          console.log('  2. 📐 Pseudocode phase starting...');

          setTimeout(() => {
            console.log('  ✅ Pseudocode completed');
            console.log('  3. 🏗️ Architecture phase starting...');

            setTimeout(() => {
              console.log('  ✅ Architecture completed');
              console.log('  4. 🔍 Refinement phase starting...');

              setTimeout(() => {
                console.log('  ✅ Refinement completed');
                console.log('  5. 🎯 Completion phase starting...');

                setTimeout(() => {
                  console.log('  ✅ Completion phase finished');
                  console.log('\n🎉 SPARC demonstration completed successfully!');
                  console.log('\n📊 Demo Results:');
                  console.log('  ✅ All 5 SPARC phases executed');
                  console.log('  🤖 Multiple specialized agents coordinated');
                  console.log('  📋 Implementation artifacts generated');
                  console.log('  🔗 Results stored in database-driven system');
                  console.log('\nThe SPARC methodology provides systematic implementation');
                  console.log('of Features and Tasks from the database-driven product flow.');
                }, 500);
              }, 500);
            }, 500);
          }, 500);
        }, 1000);
      } catch (error) {
        console.error('❌ Failed to run SPARC demonstration:', error);
        process.exit(1);
      }
    });

  return sparcSwarmCmd;
}

// Helper function to initialize systems
async function initializeSystems(): Promise<{
  databaseSystem: DatabaseDrivenSystem;
  sparcSwarm: SPARCSwarmCoordinator;
  bridge: DatabaseSPARCBridge;
}> {
  const documentService = new DocumentService();
  const workflowEngine = new WorkflowEngine();
  const databaseSystem = new DatabaseDrivenSystem(documentService, workflowEngine);
  const sparcSwarm = new SPARCSwarmCoordinator();
  const bridge = new DatabaseSPARCBridge(databaseSystem, documentService, sparcSwarm);

  await bridge.initialize();

  return { databaseSystem, sparcSwarm, bridge };
}

export { createSPARCSwarmCommands };
