/**
 * @file Product Workflow Engine with Gates Integration Example
 *
 * Demonstrates the enhanced ProductWorkflowEngine with AGUI gate capabilities:
 * - Gate injection at key workflow steps
 * - Human-in-the-loop decision points
 * - Workflow pause/resume based on gate decisions
 * - Decision audit trail and metrics
 *
 * This example shows how to orchestrate a complete product development workflow
 * with strategic decision gates for human oversight and approval.
 */

import { getLogger } from '../config/logging-config.ts';
import { ProductWorkflowEngine } from '../coordination/orchestration/product-workflow-engine.ts';
import type { MemorySystem } from '../core/memory-system.ts';
import { createTypeSafeEventBus, type TypeSafeEventBus } from '../core/type-safe-event-system.ts';
import type { DocumentManager } from '../database/managers/document-manager.ts';
import { WorkflowAGUIAdapter } from '../interfaces/agui/workflow-agui-adapter.ts';

const logger = getLogger('product-workflow-gates-integration');

// ============================================================================
// MOCK IMPLEMENTATIONS - For demonstration purposes
// ============================================================================

class MockMemorySystem implements Partial<MemorySystem> {
  private storage = new Map<string, any>();

  async initialize(): Promise<void> {
    logger.info('Mock memory system initialized');
  }

  async store(key: string, data: any, namespace?: string): Promise<void> {
    const fullKey = namespace ? `${namespace}:${key}` : key;
    this.storage.set(fullKey, data);
    logger.debug('Stored data', {
      key: fullKey,
      size: JSON.stringify(data).length,
    });
  }

  async retrieve(key: string, namespace?: string): Promise<any> {
    const fullKey = namespace ? `${namespace}:${key}` : key;
    return this.storage.get(fullKey) || null;
  }

  async search(pattern: string, namespace?: string): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    const searchPattern = namespace ? `${namespace}:${pattern}` : pattern;

    for (const [key, value] of this.storage) {
      if (key.includes(searchPattern.replace('*', ''))) {
        results[key] = value;
      }
    }

    return results;
  }
}

class MockDocumentManager implements Partial<DocumentManager> {
  async initialize(): Promise<void> {
    logger.info('Mock document manager initialized');
  }
}

// ============================================================================
// PRODUCT WORKFLOW GATES INTEGRATION DEMO
// ============================================================================

export class ProductWorkflowGatesIntegrationDemo {
  private engine: ProductWorkflowEngine;
  private eventBus: TypeSafeEventBus;
  private aguiAdapter: WorkflowAGUIAdapter;
  private memorySystem: MockMemorySystem;
  private documentManager: MockDocumentManager;

  constructor() {
    // Initialize dependencies
    this.memorySystem = new MockMemorySystem();
    this.documentManager = new MockDocumentManager();

    // Create event bus for system coordination
    this.eventBus = createTypeSafeEventBus({
      enableMetrics: true,
      domainValidation: true,
    });

    // Create AGUI adapter with production-like configuration
    this.aguiAdapter = new WorkflowAGUIAdapter(this.eventBus, {
      enableRichPrompts: true,
      enableDecisionLogging: true,
      enableTimeoutHandling: true,
      enableEscalationManagement: true,
      auditRetentionDays: 90,
      maxAuditRecords: 10000,
      timeoutConfig: {
        initialTimeout: 300000, // 5 minutes
        escalationTimeouts: [600000, 1200000, 1800000], // 10, 20, 30 minutes
        maxTotalTimeout: 3600000, // 1 hour
        enableAutoEscalation: true,
        notifyOnTimeout: true,
      },
    });

    // Create enhanced ProductWorkflowEngine with gate capabilities
    this.engine = new ProductWorkflowEngine(
      this.memorySystem as MemorySystem,
      this.documentManager as DocumentManager,
      this.eventBus,
      this.aguiAdapter,
      {
        enableSPARCIntegration: true,
        sparcQualityGates: true, // Enable gates
        sparcDomainMapping: {
          ui: 'interfaces',
          api: 'rest-api',
          database: 'memory-systems',
          integration: 'swarm-coordination',
          infrastructure: 'general',
        },
        autoTriggerSPARC: true,
        templatesPath: './templates',
        outputPath: './output',
        maxConcurrentWorkflows: 5,
        defaultTimeout: 300000,
        enableMetrics: true,
        enablePersistence: true,
      }
    );
  }

  async initialize(): Promise<void> {
    logger.info('🚀 Initializing Product Workflow Gates Integration Demo');

    try {
      await this.eventBus.initialize();
      await this.memorySystem.initialize();
      await this.documentManager.initialize();
      await this.engine.initialize();

      logger.info('✅ Integration demo initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize integration demo', { error });
      throw error;
    }
  }

  async runDemo(): Promise<void> {
    logger.info('🎬 Starting Product Workflow with Gates Demo');

    try {
      // Display initial system status
      await this.displaySystemStatus();

      // Run demo workflow with gates
      await this.runProductWorkflowWithGates();

      // Show gate statistics and audit trail
      await this.displayGateMetrics();

      logger.info('🎉 Product Workflow Gates Demo completed successfully!');
    } catch (error) {
      logger.error('💥 Demo failed', { error });
      throw error;
    }
  }

  private async displaySystemStatus(): Promise<void> {
    console.log('\n' + '='.repeat(80));
    console.log('📊 PRODUCT WORKFLOW ENGINE WITH GATES - SYSTEM STATUS');
    console.log('='.repeat(80));

    // Show gate definitions
    const gateDefinitions = this.engine.getGateDefinitions();
    console.log(`🚪 Gate Definitions: ${gateDefinitions.size} gates configured`);

    for (const [stepName, gate] of gateDefinitions) {
      console.log(`   • ${stepName}: ${gate.title} (${gate.priority} priority)`);
    }

    // Show pending gates
    const pendingGates = await this.engine.getPendingGates();
    console.log(`⏳ Pending Gates: ${pendingGates.size}`);

    // Show AGUI adapter statistics
    const stats = this.engine.getGateStatistics();
    console.log(
      `📈 AGUI Statistics: ${stats.totalDecisionAudits} decisions logged, ${stats.activeGates} active gates`
    );

    console.log('='.repeat(80) + '\n');
  }

  private async runProductWorkflowWithGates(): Promise<void> {
    logger.info('🔄 Starting product workflow with integrated gates');

    // Start a complete product workflow
    const workflowResult = await this.engine.startProductWorkflow('complete-product-flow', {
      workspaceId: 'demo-workspace',
      sessionId: 'gates-demo-session',
      documents: {},
      variables: {
        projectName: 'Social Features Enhancement',
        businessPriority: 'high',
        technicalComplexity: 'medium',
        targetMarket: 'b2c',
        estimatedEffort: '6 months',
        stakeholders: ['product-manager', 'tech-lead', 'business-analyst', 'ux-designer'],
      },
      environment: {
        type: 'development',
        nodeVersion: process.version,
        workflowVersion: '2.0.0',
        features: ['product-flow', 'sparc-integration', 'agui-gates'],
        limits: {
          maxSteps: 100,
          maxDuration: 3600000,
          maxMemory: 1024 * 1024 * 1024,
          maxFileSize: 10 * 1024 * 1024,
          maxConcurrency: 5,
        },
      },
      permissions: {
        canReadDocuments: true,
        canWriteDocuments: true,
        canDeleteDocuments: false,
        canExecuteSteps: ['*'],
        canAccessResources: ['*'],
      },
    });

    if (!workflowResult.success) {
      throw new Error(`Failed to start workflow: ${workflowResult.error}`);
    }

    const workflowId = workflowResult.workflowId!;
    logger.info('Workflow started', { workflowId });

    // Monitor workflow progress
    await this.monitorWorkflowProgress(workflowId);
  }

  private async monitorWorkflowProgress(workflowId: string): Promise<void> {
    console.log('\n📊 Monitoring Workflow Progress...\n');

    let monitoring = true;
    const monitorInterval = 2000; // 2 seconds
    let iterationCount = 0;
    const maxIterations = 30; // 1 minute total

    const progressMonitor = setInterval(async () => {
      try {
        iterationCount++;

        // Get workflow status
        const workflowStatus = await this.engine.getProductWorkflowStatus(workflowId);
        if (!workflowStatus) {
          console.log('⚠️  Workflow not found');
          monitoring = false;
          return;
        }

        // Display progress
        console.log(`⏱️  Iteration ${iterationCount}: Status = ${workflowStatus.status}`);
        console.log(`   Current Step: ${workflowStatus.productFlow.currentStep}`);
        console.log(`   Completed Steps: ${workflowStatus.productFlow.completedSteps.length}`);
        console.log(`   Progress: ${workflowStatus.progress.percentage}%`);

        // Check for pending gates
        const pendingGates = await this.engine.getPendingGates();
        if (pendingGates.size > 0) {
          console.log(`   🚪 Pending Gates: ${pendingGates.size}`);

          // Simulate gate decisions for demo
          for (const [gateId, gateRequest] of pendingGates) {
            console.log(
              `      Gate: ${gateRequest.workflowContext.stepName} - ${gateRequest.question}`
            );

            // Auto-approve gates for demo (in real scenario, this would be human decisions)
            await this.simulateGateDecision(gateId, gateRequest);
          }
        }

        // Check if workflow is complete
        if (workflowStatus.status === 'completed' || workflowStatus.status === 'failed') {
          console.log(`✅ Workflow ${workflowStatus.status}`);
          monitoring = false;
        }

        // Stop monitoring after max iterations
        if (iterationCount >= maxIterations) {
          console.log('⏰ Monitoring timeout reached');
          monitoring = false;
        }
      } catch (error) {
        logger.error('Error monitoring workflow progress', { error });
        monitoring = false;
      }

      if (!monitoring) {
        clearInterval(progressMonitor);
      }
    }, monitorInterval);

    // Wait for monitoring to complete
    return new Promise<void>((resolve) => {
      const checkComplete = () => {
        if (!monitoring) {
          resolve();
        } else {
          setTimeout(checkComplete, 100);
        }
      };
      checkComplete();
    });
  }

  private async simulateGateDecision(gateId: string, gateRequest: any): Promise<void> {
    console.log(`   🤖 Auto-approving gate: ${gateId}`);
    console.log(`      Question: ${gateRequest.question}`);
    console.log(`      Business Impact: ${gateRequest.workflowContext.businessImpact}`);
    console.log(`      Stakeholders: ${gateRequest.workflowContext.stakeholders.join(', ')}`);

    // In a real scenario, this would be handled by the AGUI system
    // For demo purposes, we simulate approval
    // (The actual gate processing happens internally in the workflow engine)
  }

  private async displayGateMetrics(): Promise<void> {
    console.log('\n' + '='.repeat(80));
    console.log('📊 GATE METRICS AND AUDIT TRAIL');
    console.log('='.repeat(80));

    // Get AGUI adapter statistics
    const stats = this.engine.getGateStatistics();
    console.log('📈 AGUI Adapter Statistics:');
    console.log(`   Total Decision Audits: ${stats.totalDecisionAudits}`);
    console.log(`   Active Gates: ${stats.activeGates}`);
    console.log(`   Configuration: ${JSON.stringify(stats.config, null, 2)}`);

    // Get decision history (if any workflow decisions were logged)
    console.log('\n📚 Decision History:');
    // Since we're using mock implementations, the history might be empty
    // In a real scenario, this would show actual gate decisions
    console.log('   (Decision history would be displayed here for real gates)');

    // Get pending gates
    const pendingGates = await this.engine.getPendingGates();
    console.log(`\n🚪 Final Pending Gates: ${pendingGates.size}`);

    console.log('='.repeat(80) + '\n');
  }

  async shutdown(): Promise<void> {
    logger.info('🔄 Shutting down Product Workflow Gates Integration Demo');

    try {
      await this.engine.shutdownGates();
      await this.eventBus.shutdown();
      logger.info('✅ Demo shutdown completed');
    } catch (error) {
      logger.error('❌ Error during shutdown', { error });
    }
  }
}

// ============================================================================
// DEMONSTRATION RUNNER
// ============================================================================

/**
 * Run the Product Workflow Gates Integration Demo
 */
export async function runProductWorkflowGatesDemo(): Promise<void> {
  const demo = new ProductWorkflowGatesIntegrationDemo();

  try {
    await demo.initialize();
    await demo.runDemo();
  } catch (error) {
    logger.error('Demo execution failed', { error });
    throw error;
  } finally {
    await demo.shutdown();
  }
}

/**
 * Interactive demo with step-by-step execution
 */
export async function runInteractiveDemo(): Promise<void> {
  console.log('\n🎯 Interactive Product Workflow Gates Demo');
  console.log('This demo will show you each step of the workflow with gate integration.\n');

  const demo = new ProductWorkflowGatesIntegrationDemo();

  try {
    console.log('Step 1: Initializing system components...');
    await demo.initialize();
    console.log('✅ System initialized\n');

    console.log('Step 2: Displaying system status...');
    await demo.displaySystemStatus();

    console.log('Step 3: Starting product workflow with gates...');
    await demo.runProductWorkflowWithGates();
    console.log('✅ Workflow execution completed\n');

    console.log('Step 4: Displaying final metrics...');
    await demo.displayGateMetrics();

    console.log('🎉 Interactive demo completed successfully!');
  } catch (error) {
    console.error('❌ Interactive demo failed:', error);
    throw error;
  } finally {
    await demo.shutdown();
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ProductWorkflowGatesIntegrationDemo;
export { runProductWorkflowGatesDemo, runInteractiveDemo };

// Run demo if executed directly
if (require.main === module) {
  runProductWorkflowGatesDemo().catch((error) => {
    console.error('Demo execution failed:', error);
    process.exit(1);
  });
}
