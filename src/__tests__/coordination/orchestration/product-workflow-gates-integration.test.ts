/**
 * @file Product Workflow Engine Gates Integration Test
 *
 * Tests integration between ProductWorkflowEngine and gate system for
 * complete end-to-end workflow orchestration with human-in-the-loop validation.
 */

import { vi } from 'vitest';
import { getLogger } from '../../../config/logging-config.ts';
import { ProductWorkflowEngine } from '../../../coordination/orchestration/product-workflow-engine.ts';
import { WorkflowGatesManager } from '../../../coordination/orchestration/workflow-gates.ts';
import { TypeSafeEventBus } from '../../../core/type-safe-event-system.ts';
import { WorkflowEngine } from '../../../workflows/workflow-engine.ts';

const logger = getLogger('product-workflow-gates-integration');

describe('ProductWorkflowEngine Gates Integration', () => {
  let productEngine: ProductWorkflowEngine;
  let workflowEngine: WorkflowEngine;
  let gatesManager: WorkflowGatesManager;
  let eventBus: TypeSafeEventBus;

  beforeAll(async () => {
    eventBus = new TypeSafeEventBus();

    gatesManager = new WorkflowGatesManager(eventBus, {
      persistencePath: ':memory:',
      enableMetrics: true,
    });

    workflowEngine = new WorkflowEngine(
      {
        maxConcurrentWorkflows: 5,
        persistWorkflows: false,
      },
      undefined,
      undefined,
      gatesManager
    );

    // Create mock memory system
    const mockMemorySystem = {
      backend: 'memory',
      initialized: true,
      store: vi.fn().mockResolvedValue(undefined),
      retrieve: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue(true),
      clear: vi.fn().mockResolvedValue(undefined),
      search: vi.fn().mockResolvedValue({}),
      size: vi.fn().mockResolvedValue(0),
      health: vi.fn().mockResolvedValue(true),
      initialize: vi.fn().mockResolvedValue(undefined),
      shutdown: vi.fn().mockResolvedValue(undefined),
      getBackend: vi.fn().mockReturnValue('memory'),
      getMetrics: vi.fn().mockReturnValue({}),
      updateConfig: vi.fn().mockResolvedValue(undefined),
      validateConfig: vi.fn().mockReturnValue(true)
    };

    // Create mock document manager  
    const mockDocumentManager = {
      initialize: vi.fn().mockResolvedValue(undefined),
      shutdown: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue(true),
      findById: vi.fn().mockResolvedValue({}),
      findAll: vi.fn().mockResolvedValue([])
    };

    productEngine = new ProductWorkflowEngine(
      mockMemorySystem as any,
      mockDocumentManager as any,
      eventBus,
      undefined, // aguiAdapter
      {} // config
    );

    await gatesManager.initialize();
    await workflowEngine.initialize();
    await productEngine.initialize();

    logger.info('ProductWorkflowEngine gates integration test setup complete');
  });

  afterAll(async () => {
    await productEngine.shutdown();
    await workflowEngine.shutdown();
    await gatesManager.shutdown();
  });

  describe('Vision to PRD Workflow with Gates', () => {
    test('should execute vision analysis with approval gates', async () => {
      const visionContext = {
        vision: 'Build an AI-powered task management system',
        targetMarket: 'Enterprise teams',
        businessGoals: ['Increase productivity', 'Reduce task overhead'],
        constraints: ['Budget: $100k', 'Timeline: 6 months'],
      };

      const result = await productEngine.startProductWorkflow('complete-product-flow', visionContext, {
        enableGates: true,
        gateConfiguration: {
          visionAnalysis: {
            enabled: true,
            businessImpact: 'high',
            stakeholders: ['product-manager', 'business-stakeholder'],
            autoApproval: false,
          },
          marketAnalysis: {
            enabled: true,
            businessImpact: 'medium',
            stakeholders: ['market-analyst'],
            autoApproval: true,
          },
          prdCreation: {
            enabled: true,
            businessImpact: 'high',
            stakeholders: ['technical-lead', 'product-manager'],
            autoApproval: false,
          },
        },
      });

      expect(result.success).toBe(true);
      expect(result.workflowId).toBeDefined();

      if (!result.workflowId) {
        throw new Error('WorkflowId should be defined');
      }

      const workflowId = result.workflowId;

      // Monitor workflow execution
      let attempts = 0;
      let workflowStatus;

      while (attempts < 30) {
        // 3 seconds max
        await new Promise((resolve) => setTimeout(resolve, 100));
        workflowStatus = workflowEngine.getWorkflowStatus(workflowId);

        if (workflowStatus?.status === 'paused') {
          const gateStatus = workflowEngine.getWorkflowGateStatus(workflowId);
          if (gateStatus.pausedForGate) {
            logger.info('Approving gate:', gateStatus.pausedForGate.gateId);
            await workflowEngine.resumeWorkflowAfterGate(
              workflowId,
              gateStatus.pausedForGate.gateId,
              true
            );
          }
        } else if (['completed', 'failed'].includes(workflowStatus?.status || '')) {
          break;
        }

        attempts++;
      }

      const finalGateStatus = workflowEngine.getWorkflowGateStatus(workflowId);

      logger.info('Vision to PRD workflow with gates completed', {
        status: workflowStatus?.status,
        gateResults: finalGateStatus.gateResults.length,
        finalStep: workflowStatus?.currentStep,
      });

      // Should have processed gates
      expect(finalGateStatus.gateResults.length).toBeGreaterThan(0);
    });

    test('should handle gate rejection in vision workflow', async () => {
      const visionContext = {
        vision: 'Problematic product vision',
        targetMarket: 'Undefined market',
        businessGoals: ['Unclear goals'],
        constraints: ['No constraints defined'],
      };

      const result = await productEngine.startProductWorkflow('complete-product-flow', visionContext, {
        enableGates: true,
        gateConfiguration: {
          visionAnalysis: {
            enabled: true,
            businessImpact: 'critical',
            stakeholders: ['executive'],
            autoApproval: false,
          },
        },
      });

      expect(result.success).toBe(true);

      if (!result.workflowId) {
        throw new Error('WorkflowId should be defined');
      }

      const workflowId = result.workflowId;

      // Wait for gate to be reached
      await new Promise((resolve) => setTimeout(resolve, 200));

      const gateStatus = workflowEngine.getWorkflowGateStatus(workflowId);
      if (gateStatus.pausedForGate) {
        // Reject the gate
        await workflowEngine.resumeWorkflowAfterGate(
          workflowId,
          gateStatus.pausedForGate.gateId,
          false
        );

        await new Promise((resolve) => setTimeout(resolve, 100));

        const finalStatus = workflowEngine.getWorkflowStatus(workflowId);
        expect(finalStatus?.status).toBe('failed');
        expect(finalStatus?.error).toContain('Gate rejected');
      }

      logger.info('Gate rejection in vision workflow handled correctly');
    });
  });

  describe('Epic Creation Workflow with Quality Gates', () => {
    test('should execute epic creation with architectural approval gates', async () => {
      const epicContext = {
        prd: {
          title: 'AI Task Management Epic',
          objectives: ['Smart task prioritization', 'AI-powered scheduling'],
          requirements: ['Natural language input', 'Machine learning backend'],
          acceptance_criteria: ['95% accuracy', 'Sub-second response time'],
        },
        architecture: {
          system_type: 'microservices',
          primary_technologies: ['Node.js', 'Python', 'PostgreSQL'],
          scalability_requirements: ['1M+ users', '99.9% uptime'],
        },
      };

      const result = await productEngine.startProductWorkflow('complete-product-flow', epicContext, {
        enableGates: true,
        gateConfiguration: {
          architectureReview: {
            enabled: true,
            businessImpact: 'high',
            stakeholders: ['lead-architect', 'senior-engineer'],
            autoApproval: false,
          },
          technicalFeasibility: {
            enabled: true,
            businessImpact: 'high',
            stakeholders: ['technical-lead'],
            autoApproval: false,
          },
          epicValidation: {
            enabled: true,
            businessImpact: 'medium',
            stakeholders: ['product-manager'],
            autoApproval: true,
          },
        },
      });

      expect(result.success).toBe(true);

      if (!result.workflowId) {
        throw new Error('WorkflowId should be defined');
      }

      const workflowId = result.workflowId;

      // Process gates as they appear
      let attempts = 0;
      while (attempts < 25) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        
        const gateStatus = workflowEngine.getWorkflowGateStatus(workflowId);
        const workflowStatus = workflowEngine.getWorkflowStatus(workflowId);

        if (gateStatus.pausedForGate) {
          await workflowEngine.resumeWorkflowAfterGate(
            workflowId,
            gateStatus.pausedForGate.gateId,
            true
          );
        } else if (['completed', 'failed'].includes(workflowStatus?.status || '')) {
          break;
        }

        attempts++;
      }

      const finalGateStatus = workflowEngine.getWorkflowGateStatus(workflowId);

      logger.info('Epic creation with gates completed', {
        gateResults: finalGateStatus.gateResults.length,
        approvedGates: finalGateStatus.gateResults.filter((g) => g.approved).length,
      });

      expect(finalGateStatus.gateResults.length).toBeGreaterThan(0);
    });
  });

  describe('Complete Product Development Flow with Gates', () => {
    test('should execute full product flow with comprehensive gate coverage', async () => {
      const fullProductContext = {
        productVision: {
          name: 'Comprehensive Product',
          vision: 'Revolutionary productivity platform',
          marketSegment: 'Enterprise productivity',
          competitiveAdvantage: ['AI-driven insights', 'Seamless integration'],
        },
        technicalSpecs: {
          architecture: 'cloud-native',
          scalability: 'horizontal',
          compliance: ['SOC2', 'GDPR'],
          integrations: ['Slack', 'Microsoft Teams', 'Google Workspace'],
        },
        businessRequirements: {
          launchTimeline: '12 months',
          budget: '$500,000',
          targetUsers: '10,000 initial users',
          revenueTarget: '$1M ARR',
        },
      };

      const result = await productEngine.startProductWorkflow('complete-product-flow', fullProductContext, {
        enableGates: true,
        gateConfiguration: {
          // Strategic gates
          visionApproval: {
            enabled: true,
            businessImpact: 'critical',
            stakeholders: ['ceo', 'product-director'],
            autoApproval: false,
          },
          marketValidation: {
            enabled: true,
            businessImpact: 'high',
            stakeholders: ['market-analyst', 'sales-director'],
            autoApproval: false,
          },

          // Technical gates
          architectureApproval: {
            enabled: true,
            businessImpact: 'high',
            stakeholders: ['cto', 'lead-architect'],
            autoApproval: false,
          },
          securityReview: {
            enabled: true,
            businessImpact: 'critical',
            stakeholders: ['security-officer', 'compliance-lead'],
            autoApproval: false,
          },

          // Quality gates
          testStrategy: {
            enabled: true,
            businessImpact: 'medium',
            stakeholders: ['qa-director'],
            autoApproval: true,
          },
          performanceValidation: {
            enabled: true,
            businessImpact: 'high',
            stakeholders: ['performance-engineer'],
            autoApproval: false,
          },

          // Business gates
          budgetApproval: {
            enabled: true,
            businessImpact: 'critical',
            stakeholders: ['cfo', 'budget-manager'],
            autoApproval: false,
          },
          launchReadiness: {
            enabled: true,
            businessImpact: 'critical',
            stakeholders: ['product-director', 'engineering-director'],
            autoApproval: false,
          },
        },
      });

      expect(result.success).toBe(true);

      if (!result.workflowId) {
        throw new Error('WorkflowId should be defined');
      }

      const workflowId = result.workflowId;

      // Process comprehensive workflow with multiple gates
      let attempts = 0;
      let gateCount = 0;
      const maxAttempts = 50; // 5 seconds max

      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 100));

        const gateStatus = workflowEngine.getWorkflowGateStatus(workflowId);
        const workflowStatus = workflowEngine.getWorkflowStatus(workflowId);

        if (gateStatus.pausedForGate) {
          gateCount++;
          logger.info(`Processing gate ${gateCount}: ${gateStatus.pausedForGate.gateId}`);

          // Approve gates (simulate stakeholder approval)
          await workflowEngine.resumeWorkflowAfterGate(
            workflowId,
            gateStatus.pausedForGate.gateId,
            true
          );
        } else if (['completed', 'failed'].includes(workflowStatus?.status || '')) {
          logger.info('Workflow reached final status:', workflowStatus?.status);
          break;
        }

        attempts++;
      }

      const finalGateStatus = workflowEngine.getWorkflowGateStatus(workflowId);
      const finalWorkflowStatus = workflowEngine.getWorkflowStatus(workflowId);

      logger.info('Comprehensive product flow completed', {
        finalStatus: finalWorkflowStatus?.status,
        totalGates: finalGateStatus.gateResults.length,
        approvedGates: finalGateStatus.gateResults.filter((g) => g.approved).length,
        gatesProcessed: gateCount,
        attemptsUsed: attempts,
      });

      // Should have processed multiple gates
      expect(finalGateStatus.gateResults.length).toBeGreaterThan(0);

      // All processed gates should be approved
      const approvedGates = finalGateStatus.gateResults.filter((g) => g.approved);
      expect(approvedGates.length).toBe(finalGateStatus.gateResults.length);
    });
  });

  describe('Gate Performance in Product Workflows', () => {
    test('should maintain performance with complex gate-enabled workflows', async () => {
      const startTime = Date.now();

      const performanceContext = {
        productName: 'Performance Test Product',
        complexity: 'high',
        components: Array.from({ length: 5 }, (_, i) => `component-${i}`),
        integrations: Array.from({ length: 3 }, (_, i) => `integration-${i}`),
      };

      const result = await productEngine.startProductWorkflow('complete-product-flow', performanceContext, {
        enableGates: true,
        gateConfiguration: {
          performanceGate1: { enabled: true, businessImpact: 'medium', autoApproval: true },
          performanceGate2: { enabled: true, businessImpact: 'medium', autoApproval: true },
          performanceGate3: { enabled: true, businessImpact: 'low', autoApproval: true },
        },
      });

      expect(result.success).toBe(true);

      if (!result.workflowId) {
        throw new Error('WorkflowId should be defined');
      }

      const workflowId = result.workflowId;

      // Wait for workflow completion
      let finalStatus;
      let attempts = 0;

      while (attempts < 30) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        finalStatus = workflowEngine.getWorkflowStatus(workflowId);

        if (['completed', 'failed'].includes(finalStatus?.status || '')) {
          break;
        }
        attempts++;
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      const gateMetrics = await gatesManager.getMetrics({
        from: new Date(startTime),
        to: new Date(endTime),
      });

      logger.info('Gate performance in product workflow', {
        workflowDuration: duration,
        gateProcessingTime: gateMetrics.averageResolutionTime,
        totalGates: gateMetrics.totalGates,
      });

      // Performance should be acceptable
      expect(duration).toBeLessThan(3000); // Should complete within 3 seconds
    });
  });
});
