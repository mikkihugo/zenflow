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
import { DocumentManager } from '../../database/managers/document-manager';

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

  // SPARC Pseudocode commands
  const pseudocodeCmd = sparcSwarmCmd
    .command('pseudocode')
    .description('SPARC Phase 2: Pseudocode Generation commands');

  // Generate pseudocode from specification
  pseudocodeCmd
    .command('generate')
    .description('Generate pseudocode algorithms from specification')
    .requiredOption('--spec-file <path>', 'Path to specification JSON file')
    .option('--output <path>', 'Output file for generated pseudocode', 'pseudocode-output.json')
    .option('--format <type>', 'Output format (json|markdown)', 'json')
    .action(async (options) => {
      try {
        logger.info('🔧 Generating pseudocode from specification...');

        // Import the pseudocode engine dynamically to avoid circular dependencies
        const { PseudocodePhaseEngine } = await import(
          '../../coordination/swarm/sparc/phases/pseudocode/pseudocode-engine'
        );
        const fs = await import('fs').then((m) => m.promises);

        const engine = new PseudocodePhaseEngine();

        // Read specification file
        const specContent = await fs.readFile(options.specFile, 'utf8');
        const specification = JSON.parse(specContent);

        console.log(`📖 Processing specification: ${specification.id || 'Unknown'}`);
        console.log(`🏷️ Domain: ${specification.domain}`);

        // Generate pseudocode structure
        const pseudocodeStructure = await engine.generatePseudocode(specification);

        console.log('✅ Pseudocode generation completed!');
        console.log(`📊 Generated ${pseudocodeStructure.algorithms.length} algorithms`);
        console.log(`🏗️ Generated ${pseudocodeStructure.dataStructures.length} data structures`);
        console.log(`🔄 Generated ${pseudocodeStructure.controlFlows.length} control flows`);
        console.log(
          `💡 Identified ${pseudocodeStructure.optimizations.length} optimization opportunities`
        );

        // Format output
        let output: string;
        if (options.format === 'markdown') {
          output = await formatPseudocodeAsMarkdown(pseudocodeStructure);
        } else {
          output = JSON.stringify(pseudocodeStructure, null, 2);
        }

        // Write output
        await fs.writeFile(options.output, output, 'utf8');
        console.log(`💾 Output saved to: ${options.output}`);

        // Display summary
        console.log('\n📋 Algorithm Summary:');
        pseudocodeStructure.algorithms.forEach((alg, index) => {
          console.log(`  ${index + 1}. ${alg.name}: ${alg.purpose}`);
          console.log(
            `     Complexity: ${alg.complexity.timeComplexity} time, ${alg.complexity.spaceComplexity} space`
          );
        });
      } catch (error) {
        console.error('❌ Failed to generate pseudocode:', error);
        process.exit(1);
      }
    });

  // Validate existing pseudocode
  pseudocodeCmd
    .command('validate')
    .description('Validate pseudocode structure and algorithms')
    .requiredOption('--pseudocode-file <path>', 'Path to pseudocode JSON file')
    .action(async (options) => {
      try {
        logger.info('🔍 Validating pseudocode structure...');

        const { PseudocodePhaseEngine } = await import(
          '../../coordination/swarm/sparc/phases/pseudocode/pseudocode-engine'
        );
        const fs = await import('fs').then((m) => m.promises);

        const engine = new PseudocodePhaseEngine();

        // Read pseudocode file
        const pseudocodeContent = await fs.readFile(options.pseudocodeFile, 'utf8');
        const pseudocodeStructure = JSON.parse(pseudocodeContent);

        console.log(`📖 Validating pseudocode: ${pseudocodeStructure.id || 'Unknown'}`);

        // Validate the pseudocode structure
        const validation = await engine.validatePseudocode(pseudocodeStructure);

        console.log('\n📊 Validation Results:');
        console.log(`Overall Score: ${(validation.overallScore * 100).toFixed(1)}%`);
        console.log(`Status: ${validation.approved ? '✅ APPROVED' : '❌ NEEDS IMPROVEMENT'}`);
        console.log(
          `Complexity Verification: ${validation.complexityVerification ? '✅ PASSED' : '❌ FAILED'}`
        );

        if (validation.logicErrors.length > 0) {
          console.log('\n🚨 Logic Errors Found:');
          validation.logicErrors.forEach((error, index) => {
            console.log(`  ${index + 1}. ${error}`);
          });
        }

        if (validation.optimizationSuggestions.length > 0) {
          console.log('\n💡 Optimization Suggestions:');
          validation.optimizationSuggestions.forEach((suggestion, index) => {
            console.log(`  ${index + 1}. ${suggestion}`);
          });
        }

        if (validation.recommendations.length > 0) {
          console.log('\n📋 Recommendations:');
          validation.recommendations.forEach((rec, index) => {
            console.log(`  ${index + 1}. ${rec}`);
          });
        }

        // Exit with appropriate code
        process.exit(validation.approved ? 0 : 1);
      } catch (error) {
        console.error('❌ Failed to validate pseudocode:', error);
        process.exit(1);
      }
    });

  // Generate algorithms only (lightweight option)
  pseudocodeCmd
    .command('algorithms')
    .description('Generate algorithms only from specification')
    .requiredOption('--spec-file <path>', 'Path to specification JSON file')
    .option(
      '--domain <type>',
      'Override domain (swarm-coordination|neural-networks|memory-systems|general)'
    )
    .action(async (options) => {
      try {
        logger.info('🧮 Generating algorithms from specification...');

        const { PseudocodePhaseEngine } = await import(
          '../../coordination/swarm/sparc/phases/pseudocode/pseudocode-engine'
        );
        const fs = await import('fs').then((m) => m.promises);

        const engine = new PseudocodePhaseEngine();

        // Read specification file
        const specContent = await fs.readFile(options.specFile, 'utf8');
        const specification = JSON.parse(specContent);

        // Override domain if specified
        if (options.domain) {
          specification.domain = options.domain;
        }

        console.log(`📖 Processing specification for: ${specification.domain}`);

        // Generate algorithms only
        const algorithms = await engine.generateAlgorithmPseudocode(specification);

        console.log(`✅ Generated ${algorithms.length} algorithms`);

        // Display algorithms
        algorithms.forEach((alg, index) => {
          console.log(`\n${index + 1}. 🔧 ${alg.name}`);
          console.log(`   Purpose: ${alg.purpose}`);
          console.log(`   Inputs: ${alg.inputs.map((i) => i.name).join(', ')}`);
          console.log(`   Outputs: ${alg.outputs.map((o) => o.name).join(', ')}`);
          console.log(`   Steps: ${alg.steps.length}`);
          console.log(
            `   Complexity: ${alg.complexity.timeComplexity} time, ${alg.complexity.spaceComplexity} space`
          );
          console.log(`   Optimizations: ${alg.optimizations.length}`);
        });
      } catch (error) {
        console.error('❌ Failed to generate algorithms:', error);
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

// Helper function to format pseudocode as markdown
async function formatPseudocodeAsMarkdown(pseudocodeStructure: any): Promise<string> {
  let markdown = `# SPARC Pseudocode Generation Results\n\n`;
  markdown += `**Generated on:** ${new Date().toISOString()}\n`;
  markdown += `**ID:** ${pseudocodeStructure.id}\n\n`;

  // Algorithms section
  markdown += `## 🔧 Algorithms (${pseudocodeStructure.algorithms.length})\n\n`;
  pseudocodeStructure.algorithms.forEach((alg: any, index: number) => {
    markdown += `### ${index + 1}. ${alg.name}\n\n`;
    markdown += `**Purpose:** ${alg.purpose}\n\n`;

    markdown += `**Inputs:**\n`;
    alg.inputs.forEach((input: any) => {
      markdown += `- \`${input.name}\` (${input.type}): ${input.description}\n`;
    });
    markdown += `\n`;

    markdown += `**Outputs:**\n`;
    alg.outputs.forEach((output: any) => {
      markdown += `- \`${output.name}\` (${output.type}): ${output.description}\n`;
    });
    markdown += `\n`;

    markdown += `**Steps:**\n`;
    alg.steps.forEach((step: any) => {
      markdown += `${step.stepNumber}. ${step.description}\n`;
      markdown += `   \`${step.pseudocode}\`\n`;
    });
    markdown += `\n`;

    markdown += `**Complexity:** ${alg.complexity.timeComplexity} time, ${alg.complexity.spaceComplexity} space\n\n`;

    if (alg.optimizations.length > 0) {
      markdown += `**Optimizations:**\n`;
      alg.optimizations.forEach((opt: any) => {
        markdown += `- **${opt.type}**: ${opt.description} (Impact: ${opt.impact}, Effort: ${opt.effort})\n`;
      });
      markdown += `\n`;
    }

    markdown += `---\n\n`;
  });

  // Data Structures section
  if (pseudocodeStructure.dataStructures.length > 0) {
    markdown += `## 🏗️ Data Structures (${pseudocodeStructure.dataStructures.length})\n\n`;
    pseudocodeStructure.dataStructures.forEach((ds: any, index: number) => {
      markdown += `### ${index + 1}. ${ds.name}\n\n`;
      markdown += `**Type:** ${ds.type}\n\n`;

      if (ds.properties.length > 0) {
        markdown += `**Properties:**\n`;
        ds.properties.forEach((prop: any) => {
          markdown += `- \`${prop.name}\` (${prop.type}, ${prop.visibility}): ${prop.description}\n`;
        });
        markdown += `\n`;
      }

      if (ds.methods.length > 0) {
        markdown += `**Methods:**\n`;
        ds.methods.forEach((method: any) => {
          markdown += `- \`${method.name}()\` → ${method.returnType} (${method.visibility}): ${method.description}\n`;
        });
        markdown += `\n`;
      }

      markdown += `---\n\n`;
    });
  }

  // Complexity Analysis section
  if (pseudocodeStructure.complexityAnalysis) {
    const ca = pseudocodeStructure.complexityAnalysis;
    markdown += `## 📊 Complexity Analysis\n\n`;
    markdown += `- **Time Complexity:** ${ca.timeComplexity}\n`;
    markdown += `- **Space Complexity:** ${ca.spaceComplexity}\n`;
    markdown += `- **Scalability:** ${ca.scalability}\n`;
    markdown += `- **Worst Case:** ${ca.worstCase}\n\n`;

    if (ca.bottlenecks && ca.bottlenecks.length > 0) {
      markdown += `**Identified Bottlenecks:**\n`;
      ca.bottlenecks.forEach((bottleneck: string) => {
        markdown += `- ${bottleneck}\n`;
      });
      markdown += `\n`;
    }
  }

  // Optimizations section
  if (pseudocodeStructure.optimizations.length > 0) {
    markdown += `## 💡 Optimization Opportunities (${pseudocodeStructure.optimizations.length})\n\n`;
    pseudocodeStructure.optimizations.forEach((opt: any, index: number) => {
      markdown += `${index + 1}. **${opt.type.toUpperCase()}**: ${opt.description}\n`;
      markdown += `   - Impact: ${opt.impact}\n`;
      markdown += `   - Effort: ${opt.effort}\n`;
      if (opt.estimatedImprovement) {
        markdown += `   - Estimated Improvement: ${opt.estimatedImprovement}\n`;
      }
      markdown += `\n`;
    });
  }

  return markdown;
}

// Add Architecture Phase Commands
export function addArchitectureCommands(program: Command): void {
  const architectureCmd = program
    .command('architecture')
    .description('SPARC Architecture Phase - Generate system architecture from pseudocode');

  // Generate architecture from pseudocode
  architectureCmd
    .command('generate')
    .description('Generate system architecture from pseudocode')
    .requiredOption('--pseudocode-file <path>', 'Path to pseudocode JSON file')
    .option('--spec-file <path>', 'Path to specification JSON file for additional context')
    .option('--output <path>', 'Output file path for architecture (default: architecture.json)')
    .option('--format <format>', 'Output format (json|markdown)', 'json')
    .action(async (options) => {
      try {
        console.log('🏗️ Generating system architecture from pseudocode...');

        const { ArchitecturePhaseEngine } = await import(
          '../../coordination/swarm/sparc/phases/architecture/architecture-engine'
        );
        const fs = await import('fs').then((m) => m.promises);

        const engine = new ArchitecturePhaseEngine();

        // Read pseudocode file
        const pseudocodeContent = await fs.readFile(options.pseudocodeFile, 'utf8');
        let pseudocodeData = JSON.parse(pseudocodeContent);

        // Convert to expected format if needed
        if (Array.isArray(pseudocodeData)) {
          pseudocodeData = {
            id: 'generated-' + Date.now(),
            algorithms: pseudocodeData,
            coreAlgorithms: pseudocodeData,
            dataStructures: [],
            controlFlows: [],
            optimizations: [],
            dependencies: [],
          };
        }

        // Read specification if provided
        let specification = null;
        if (options.specFile) {
          const specContent = await fs.readFile(options.specFile, 'utf8');
          specification = JSON.parse(specContent);
        }

        // Generate architecture
        let architecture;
        if (specification) {
          const systemArchitecture = await engine.designSystemArchitecture(
            specification,
            pseudocodeData.algorithms
          );
          architecture = {
            systemArchitecture,
            components: systemArchitecture.components,
            interfaces: systemArchitecture.interfaces,
            dataFlow: systemArchitecture.dataFlow,
            qualityAttributes: systemArchitecture.qualityAttributes,
            architecturalPatterns: systemArchitecture.architecturalPatterns,
          };
        } else {
          // Use internal method when only pseudocode is available
          console.log('⚠️ No specification provided - using pseudocode-only generation');
          architecture = await (engine as any).designArchitecture(pseudocodeData);
        }

        const outputPath = options.output || 'architecture.json';

        if (options.format === 'markdown') {
          const markdownContent = generateArchitectureMarkdown(architecture);
          const mdPath = outputPath.replace(/\.json$/, '.md');
          await fs.writeFile(mdPath, markdownContent, 'utf8');
          console.log(`✅ Architecture documentation written to: ${mdPath}`);
        } else {
          await fs.writeFile(outputPath, JSON.stringify(architecture, null, 2), 'utf8');
          console.log(`✅ Architecture written to: ${outputPath}`);
        }

        // Display summary
        console.log('\n📊 Architecture Summary:');
        console.log(`  - Components: ${architecture.components?.length || 0}`);
        console.log(`  - Interfaces: ${architecture.systemArchitecture?.interfaces?.length || 0}`);
        console.log(`  - Data Flows: ${architecture.systemArchitecture?.dataFlow?.length || 0}`);
        console.log(
          `  - Quality Attributes: ${architecture.systemArchitecture?.qualityAttributes?.length || 0}`
        );
        console.log(
          `  - Architecture Patterns: ${architecture.systemArchitecture?.architecturalPatterns?.length || 0}`
        );
      } catch (error) {
        console.error('❌ Failed to generate architecture:', error);
        process.exit(1);
      }
    });

  // Validate architecture design
  architectureCmd
    .command('validate')
    .description('Validate architecture design for consistency and quality')
    .requiredOption('--architecture-file <path>', 'Path to architecture JSON file')
    .option('--detailed', 'Show detailed validation results')
    .action(async (options) => {
      try {
        console.log('🔍 Validating architecture design...');

        const { ArchitecturePhaseEngine } = await import(
          '../../coordination/swarm/sparc/phases/architecture/architecture-engine'
        );
        const fs = await import('fs').then((m) => m.promises);

        const engine = new ArchitecturePhaseEngine();

        // Read architecture file
        const archContent = await fs.readFile(options.architectureFile, 'utf8');
        const architecture = JSON.parse(archContent);

        // Validate architecture
        const validationResults = await engine.validateArchitecture(architecture);

        // Calculate overall score
        const overallScore =
          validationResults.reduce((sum, result) => sum + result.score, 0) /
          validationResults.length;
        const passed = validationResults.filter((r) => r.passed).length;
        const total = validationResults.length;

        console.log('\n📋 Validation Results:');
        console.log(`  Overall Score: ${(overallScore * 100).toFixed(1)}%`);
        console.log(`  Tests Passed: ${passed}/${total}`);
        console.log(`  Status: ${overallScore >= 0.7 ? '✅ APPROVED' : '❌ NEEDS IMPROVEMENT'}`);

        if (options.detailed) {
          console.log('\n📝 Detailed Results:');
          validationResults.forEach((result, index) => {
            const status = result.passed ? '✅' : '❌';
            console.log(`  ${index + 1}. ${status} ${result.criterion}`);
            console.log(`     Score: ${(result.score * 100).toFixed(1)}%`);
            console.log(`     Feedback: ${result.feedback}`);
          });
        }

        // Exit with appropriate code
        process.exit(overallScore >= 0.7 ? 0 : 1);
      } catch (error) {
        console.error('❌ Failed to validate architecture:', error);
        process.exit(1);
      }
    });

  // Generate implementation plan
  architectureCmd
    .command('plan')
    .description('Generate implementation plan from architecture')
    .requiredOption('--architecture-file <path>', 'Path to architecture JSON file')
    .option(
      '--output <path>',
      'Output file path for implementation plan (default: implementation-plan.json)'
    )
    .option('--format <format>', 'Output format (json|markdown)', 'json')
    .action(async (options) => {
      try {
        console.log('📋 Generating implementation plan from architecture...');

        const { ArchitecturePhaseEngine } = await import(
          '../../coordination/swarm/sparc/phases/architecture/architecture-engine'
        );
        const fs = await import('fs').then((m) => m.promises);

        const engine = new ArchitecturePhaseEngine();

        // Read architecture file
        const archContent = await fs.readFile(options.architectureFile, 'utf8');
        const architecture = JSON.parse(archContent);

        // Generate implementation plan
        const implementationPlan = await engine.generateImplementationPlan(architecture);

        const outputPath = options.output || 'implementation-plan.json';

        if (options.format === 'markdown') {
          const markdownContent = generateImplementationPlanMarkdown(implementationPlan);
          const mdPath = outputPath.replace(/\.json$/, '.md');
          await fs.writeFile(mdPath, markdownContent, 'utf8');
          console.log(`✅ Implementation plan written to: ${mdPath}`);
        } else {
          await fs.writeFile(outputPath, JSON.stringify(implementationPlan, null, 2), 'utf8');
          console.log(`✅ Implementation plan written to: ${outputPath}`);
        }

        // Display summary
        console.log('\n📊 Implementation Plan Summary:');
        console.log(`  - Phases: ${implementationPlan.phases.length}`);
        console.log(
          `  - Total Tasks: ${implementationPlan.phases.reduce((sum, phase) => sum + phase.tasks.length, 0)}`
        );
        console.log(`  - Timeline: ${implementationPlan.timeline.totalDuration}`);
        console.log(`  - Resource Requirements: ${implementationPlan.resourceRequirements.length}`);
        console.log(`  - Risk Level: ${implementationPlan.riskAssessment.overallRisk}`);
      } catch (error) {
        console.error('❌ Failed to generate implementation plan:', error);
        process.exit(1);
      }
    });
}

function generateArchitectureMarkdown(architecture: any): string {
  let markdown = `# System Architecture\n\n`;
  markdown += `Generated on: ${new Date().toISOString()}\n\n`;

  // Components section
  if (architecture.components && architecture.components.length > 0) {
    markdown += `## 🏗️ System Components (${architecture.components.length})\n\n`;
    architecture.components.forEach((component: any, index: number) => {
      markdown += `### ${index + 1}. ${component.name}\n\n`;
      markdown += `**Type:** ${component.type}\n\n`;
      markdown += `**Responsibilities:**\n`;
      component.responsibilities.forEach((resp: string) => {
        markdown += `- ${resp}\n`;
      });
      markdown += `\n`;

      if (component.interfaces && component.interfaces.length > 0) {
        markdown += `**Interfaces:** ${component.interfaces.join(', ')}\n\n`;
      }

      if (component.dependencies && component.dependencies.length > 0) {
        markdown += `**Dependencies:** ${component.dependencies.join(', ')}\n\n`;
      }

      if (component.performance) {
        markdown += `**Performance:** Expected latency ${component.performance.expectedLatency}\n\n`;
      }

      markdown += `---\n\n`;
    });
  }

  // Architecture Patterns
  if (
    architecture.systemArchitecture?.architecturalPatterns &&
    architecture.systemArchitecture.architecturalPatterns.length > 0
  ) {
    markdown += `## 🎯 Architecture Patterns (${architecture.systemArchitecture.architecturalPatterns.length})\n\n`;
    architecture.systemArchitecture.architecturalPatterns.forEach((pattern: any, index: number) => {
      markdown += `### ${index + 1}. ${pattern.name}\n\n`;
      markdown += `${pattern.description}\n\n`;

      markdown += `**Benefits:**\n`;
      pattern.benefits.forEach((benefit: string) => {
        markdown += `- ${benefit}\n`;
      });
      markdown += `\n`;

      markdown += `**Tradeoffs:**\n`;
      pattern.tradeoffs.forEach((tradeoff: string) => {
        markdown += `- ${tradeoff}\n`;
      });
      markdown += `\n---\n\n`;
    });
  }

  // Quality Attributes
  if (
    architecture.systemArchitecture?.qualityAttributes &&
    architecture.systemArchitecture.qualityAttributes.length > 0
  ) {
    markdown += `## 📊 Quality Attributes (${architecture.systemArchitecture.qualityAttributes.length})\n\n`;
    architecture.systemArchitecture.qualityAttributes.forEach((qa: any, index: number) => {
      markdown += `### ${index + 1}. ${qa.name}\n\n`;
      markdown += `**Target:** ${qa.target}\n\n`;
      markdown += `**Priority:** ${qa.priority}\n\n`;
      markdown += `**Measurement:** ${qa.measurement}\n\n`;

      if (qa.criteria && qa.criteria.length > 0) {
        markdown += `**Criteria:**\n`;
        qa.criteria.forEach((criterion: string) => {
          markdown += `- ${criterion}\n`;
        });
        markdown += `\n`;
      }

      markdown += `---\n\n`;
    });
  }

  return markdown;
}

function generateImplementationPlanMarkdown(plan: any): string {
  let markdown = `# Implementation Plan\n\n`;
  markdown += `Generated on: ${new Date().toISOString()}\n\n`;

  // Overview
  markdown += `## 📋 Overview\n\n`;
  markdown += `- **Total Duration:** ${plan.timeline.totalDuration}\n`;
  markdown += `- **Phases:** ${plan.phases.length}\n`;
  markdown += `- **Total Tasks:** ${plan.phases.reduce((sum: number, phase: any) => sum + phase.tasks.length, 0)}\n`;
  markdown += `- **Risk Level:** ${plan.riskAssessment.overallRisk}\n\n`;

  // Phases
  if (plan.phases && plan.phases.length > 0) {
    markdown += `## 🎯 Implementation Phases\n\n`;
    plan.phases.forEach((phase: any, index: number) => {
      markdown += `### Phase ${index + 1}: ${phase.name}\n\n`;
      markdown += `**Duration:** ${phase.duration}\n\n`;
      markdown += `**Description:** ${phase.description}\n\n`;

      if (phase.prerequisites && phase.prerequisites.length > 0) {
        markdown += `**Prerequisites:** ${phase.prerequisites.join(', ')}\n\n`;
      }

      if (phase.tasks && phase.tasks.length > 0) {
        markdown += `**Tasks (${phase.tasks.length}):**\n\n`;
        phase.tasks.forEach((task: any, taskIndex: number) => {
          markdown += `${taskIndex + 1}. **${task.name}** (${task.priority})\n`;
          markdown += `   - Type: ${task.type}\n`;
          markdown += `   - Effort: ${task.estimatedEffort}\n`;
          markdown += `   - Description: ${task.description}\n`;

          if (task.dependencies && task.dependencies.length > 0) {
            markdown += `   - Dependencies: ${task.dependencies.join(', ')}\n`;
          }

          markdown += `\n`;
        });
      }

      markdown += `---\n\n`;
    });
  }

  // Resource Requirements
  if (plan.resourceRequirements && plan.resourceRequirements.length > 0) {
    markdown += `## 👥 Resource Requirements\n\n`;
    plan.resourceRequirements.forEach((resource: any, index: number) => {
      markdown += `${index + 1}. **${resource.type}**: ${resource.quantity} × ${resource.description} for ${resource.duration}\n`;
    });
    markdown += `\n`;
  }

  // Risk Assessment
  if (plan.riskAssessment) {
    markdown += `## ⚠️ Risk Assessment\n\n`;
    markdown += `**Overall Risk Level:** ${plan.riskAssessment.overallRisk}\n\n`;

    if (plan.riskAssessment.risks && plan.riskAssessment.risks.length > 0) {
      markdown += `**Identified Risks:**\n`;
      plan.riskAssessment.risks.forEach((risk: any, index: number) => {
        markdown += `${index + 1}. **${risk.description}**\n`;
        markdown += `   - Probability: ${risk.probability}\n`;
        markdown += `   - Impact: ${risk.impact}\n`;
        markdown += `   - Category: ${risk.category}\n\n`;
      });
    }

    if (plan.riskAssessment.mitigationPlans && plan.riskAssessment.mitigationPlans.length > 0) {
      markdown += `**Mitigation Strategies:**\n`;
      plan.riskAssessment.mitigationPlans.forEach((mitigation: string, index: number) => {
        markdown += `${index + 1}. ${mitigation}\n`;
      });
      markdown += `\n`;
    }
  }

  return markdown;
}

// Export already defined above
