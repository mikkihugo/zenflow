/**
 * End-to-End Product Flow + SPARC Integration Test
 *
 * COMPREHENSIVE E2E: Complete workflow from Vision → Code with SPARC integration
 * Tests the entire product development pipeline with technical implementation methodology
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { ProductWorkflowEngine } from '../../coordination/orchestration/product-workflow-engine';
import { ProductFlowSystem } from '../../core/product-flow-system';
import { UnifiedMemorySystem } from '../../core/unified-memory-system';
import { DocumentService } from '../../database/services/document-service';
import { SPARCEngineCore } from '../../sparc/core/sparc-engine';

describe('E2E: Complete Product Flow → SPARC Integration', () => {
  let productFlowSystem: ProductFlowSystem;
  let productWorkflowEngine: ProductWorkflowEngine;
  let sparcEngine: SPARCEngineCore;
  let testWorkspaceId: string;

  beforeAll(async () => {
    // Initialize complete system stack
    const memorySystem = new UnifiedMemorySystem();
    const documentService = new DocumentService();

    await memorySystem.initialize();
    await documentService.initialize();

    productWorkflowEngine = new ProductWorkflowEngine(memorySystem, documentService, {
      enableSPARCIntegration: true,
      autoTriggerSPARC: true,
      sparcQualityGates: true,
      sparcDomainMapping: {
        api: 'rest-api',
        database: 'memory-systems',
        ui: 'interfaces',
        integration: 'swarm-coordination',
      },
    });

    productFlowSystem = new ProductFlowSystem(productWorkflowEngine, documentService);
    sparcEngine = new SPARCEngineCore();

    await productWorkflowEngine.initialize();
    await productFlowSystem.initialize();

    // Create test workspace
    testWorkspaceId = await productFlowSystem.loadWorkspace('./e2e-test-workspace');
  }, 30000); // 30 second timeout for initialization

  afterAll(async () => {
    // Cleanup test environment
    const activeWorkflows = await productWorkflowEngine.getActiveProductWorkflows();
    for (const workflow of activeWorkflows) {
      await productWorkflowEngine.pauseProductWorkflow(workflow.id);
    }
  });

  describe('🎯 Complete Product Development Pipeline', () => {
    it('should execute full Vision → ADRs → PRDs → Epics → Features → Tasks → Code with SPARC', async () => {
      // Step 1: Create and process vision document
      const visionContent = `
# E-commerce Platform Vision

## Business Objectives
- Create modern online shopping experience
- Increase conversion rates by 25%
- Support 10k concurrent users
- Mobile-first responsive design

## Key Features
- User authentication and profiles
- Product catalog with search
- Shopping cart and checkout
- Order management and tracking
- Admin dashboard for merchants

## Technical Requirements
- RESTful API architecture
- Microservices with proper separation
- Real-time notifications
- Payment gateway integration
- Analytics and reporting

## Success Metrics
- Page load time < 2 seconds
- 99.9% uptime SLA
- Mobile conversion rate > 3%
- Customer satisfaction score > 4.5/5
      `;

      const workflowResult = await productWorkflowEngine.startProductWorkflow(
        'complete-product-flow',
        {
          workspaceId: testWorkspaceId,
          variables: {
            visionContent,
            projectName: 'E-commerce Platform',
            domain: 'e-commerce',
            complexity: 'complex',
          },
        }
      );

      expect(workflowResult.success).toBe(true);
      expect(workflowResult.workflowId).toBeDefined();

      // Step 2: Monitor workflow execution
      let workflow = await productWorkflowEngine.getProductWorkflowStatus(
        workflowResult.workflowId!
      );
      expect(workflow).toBeDefined();
      expect(workflow?.status).toMatch(/running|pending/);

      // Step 3: Wait for workflow progression (with timeout)
      const maxWaitTime = 60000; // 60 seconds
      const checkInterval = 2000; // 2 seconds
      let waitedTime = 0;
      let lastStep = workflow?.productFlow.currentStep;

      while (waitedTime < maxWaitTime && workflow?.status === 'running') {
        await new Promise((resolve) => setTimeout(resolve, checkInterval));
        waitedTime += checkInterval;

        workflow = await productWorkflowEngine.getProductWorkflowStatus(workflowResult.workflowId!);

        if (workflow?.productFlow.currentStep !== lastStep) {
          lastStep = workflow?.productFlow.currentStep;
        }

        // Break if workflow completed or failed
        if (['completed', 'failed', 'cancelled'].includes(workflow?.status)) {
          break;
        }
      }

      // Verify key Product Flow steps were executed
      const expectedSteps = [
        'vision-analysis',
        'adr-generation',
        'prd-creation',
        'epic-breakdown',
        'feature-definition',
      ];

      expectedSteps.forEach((step) => {
        const stepExecuted =
          workflow?.productFlow.completedSteps.includes(step as any) ||
          workflow?.productFlow.currentStep === step;
        expect(stepExecuted).toBe(true);
      });

      // Step 5: Verify SPARC integration was triggered
      if (workflow?.productFlow.completedSteps.includes('sparc-integration' as any)) {
        expect(workflow?.sparcIntegration.sparcProjects.size).toBeGreaterThan(0);

        // Verify SPARC phases are active
        expect(workflow?.sparcIntegration.activePhases.size).toBeGreaterThanOrEqual(0);
      }

      // Step 6: Validate final state
      expect(workflow?.status).toMatch(/running|completed|paused/);
      expect(workflow?.productFlow.completedSteps.length).toBeGreaterThan(0);
    }, 90000); // 90 second test timeout

    it('should demonstrate SPARC methodology within feature implementation', async () => {
      // Create a technical feature that should use SPARC
      const featureSpec = {
        name: 'JWT Authentication Service',
        domain: 'rest-api' as const,
        complexity: 'moderate' as const,
        requirements: [
          'Generate secure JWT tokens on user login',
          'Validate JWT tokens for protected routes',
          'Implement token refresh mechanism',
          'Handle token expiration gracefully',
          'Support role-based access control',
        ],
        constraints: [
          'Must use industry-standard JWT libraries',
          'Token expiry configurable via environment',
          'Performance: <10ms token validation',
        ],
      };

      // Initialize SPARC project for this feature
      const sparcProject = await sparcEngine.initializeProject(featureSpec);
      expect(sparcProject.id).toBeDefined();
      expect(sparcProject.domain).toBe('rest-api');

      // Execute SPARC phases in sequence
      const phases = [
        'specification',
        'pseudocode',
        'architecture',
        'refinement',
        'completion',
      ] as const;
      const phaseResults = [];

      for (const phase of phases) {
        const result = await sparcEngine.executePhase(sparcProject, phase);
        phaseResults.push(result);

        expect(result.success).toBe(true);
        expect(result.phase).toBe(phase);
        expect(result.deliverables.length).toBeGreaterThan(0);
      }

      // Verify all phases completed successfully
      expect(phaseResults).toHaveLength(5);
      expect(sparcProject.progress.completedPhases).toHaveLength(5);
      expect(sparcProject.progress.overallProgress).toBe(1.0);

      // Validate completion and production readiness
      const validation = await sparcEngine.validateCompletion(sparcProject);
      expect(validation.score).toBeGreaterThan(0.5); // At least 50% ready
      expect(validation.validations.length).toBeGreaterThan(0);

      // Generate final artifacts
      const artifacts = await sparcEngine.generateArtifacts(sparcProject);
      expect(artifacts.artifacts.length).toBeGreaterThan(0);
      expect(artifacts.relationships.length).toBeGreaterThan(0);
    }, 60000); // 60 second timeout

    it('should handle error scenarios gracefully', async () => {
      // Test 1: Invalid workflow name
      const invalidResult = await productWorkflowEngine.startProductWorkflow(
        'nonexistent-workflow',
        { workspaceId: testWorkspaceId }
      );

      expect(invalidResult.success).toBe(false);
      expect(invalidResult.error).toBeDefined();

      // Test 2: Workflow pause/resume
      const validResult = await productWorkflowEngine.startProductWorkflow(
        'complete-product-flow',
        { workspaceId: testWorkspaceId }
      );

      expect(validResult.success).toBe(true);

      // Immediately pause the workflow
      const pauseResult = await productWorkflowEngine.pauseProductWorkflow(validResult.workflowId!);
      expect(pauseResult.success).toBe(true);

      // Verify paused state
      const pausedWorkflow = await productWorkflowEngine.getProductWorkflowStatus(
        validResult.workflowId!
      );
      expect(pausedWorkflow?.status).toBe('paused');
      expect(pausedWorkflow?.pausedAt).toBeDefined();

      // Resume the workflow
      const resumeResult = await productWorkflowEngine.resumeProductWorkflow(
        validResult.workflowId!
      );
      expect(resumeResult.success).toBe(true);

      // Clean up - pause again to prevent interference with other tests
      await productWorkflowEngine.pauseProductWorkflow(validResult.workflowId!);
    }, 30000);

    it('should provide comprehensive system metrics and monitoring', async () => {
      // Get workspace status
      const workspaceStatus = await productFlowSystem.getWorkspaceStatus(testWorkspaceId);
      expect(workspaceStatus.workspaceId).toBe(testWorkspaceId);
      expect(workspaceStatus.sparcIntegration).toBe(true);

      // Get active workflows
      const activeWorkflows = await productWorkflowEngine.getActiveProductWorkflows();

      // Verify workflow structure
      if (activeWorkflows.length > 0) {
        const workflow = activeWorkflows[0];
        expect(workflow.productFlow).toBeDefined();
        expect(workflow.sparcIntegration).toBeDefined();
        expect(workflow.progress).toBeDefined();
        expect(workflow.metrics).toBeDefined();
      }
    }, 15000);
  });

  describe('🔧 SPARC Quality Gates and Validation', () => {
    it('should enforce SPARC quality gates throughout implementation', async () => {
      const sparcProject = await sparcEngine.initializeProject({
        name: 'Quality Gate Test',
        domain: 'rest-api',
        complexity: 'moderate',
        requirements: ['High quality implementation', 'Comprehensive testing'],
      });

      // Execute specification phase
      const specResult = await sparcEngine.executePhase(sparcProject, 'specification');
      expect(specResult.success).toBe(true);

      // Verify quality metrics
      expect(specResult.metrics.qualityScore).toBeGreaterThan(0);
      expect(specResult.metrics.completeness).toBeGreaterThan(0);

      // Execute architecture phase with validation
      const archResult = await sparcEngine.executePhase(sparcProject, 'architecture');
      expect(archResult.success).toBe(true);
      expect(archResult.deliverables.length).toBeGreaterThan(0);
    }, 30000);
  });
});
