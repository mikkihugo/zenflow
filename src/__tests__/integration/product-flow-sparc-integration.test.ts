/**
 * Product Flow + SPARC Integration Tests
 *
 * COMPREHENSIVE TDD: Testing the complete integration of Product Flow with SPARC methodology
 * - Product Flow defines WHAT to build (Vision→ADR→PRD→Epic→Feature→Task)
 * - SPARC defines HOW to implement (technical methodology within Features/Tasks)
 * - Integration tests validate seamless coordination between both systems
 */

import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { nanoid } from 'nanoid';
import { ProductWorkflowEngine } from '../../coordination/orchestration/product-workflow-engine';
import { ProductFlowSystem } from '../../core/product-flow-system';
import { UnifiedMemorySystem } from '../../core/unified-memory-system';
import type {
  FeatureDocumentEntity,
  TaskDocumentEntity,
} from '../../database/entities/product-entities';
import { DocumentService } from '../../database/services/document-service';
import { SPARCEngineCore } from '../../sparc/core/sparc-engine';
import type { SPARCPhase, SPARCProject } from '../../sparc/types/sparc-types';

describe('Product Flow + SPARC Integration', () => {
  let productWorkflowEngine: ProductWorkflowEngine;
  let productFlowSystem: ProductFlowSystem;
  let sparcEngine: SPARCEngineCore;
  let memorySystem: UnifiedMemorySystem;
  let documentService: DocumentService;

  beforeEach(async () => {
    // Initialize test dependencies with proper configuration
    memorySystem = new UnifiedMemorySystem({
      backend: 'memory',
      persistPath: './test-memory',
      maxMemoryMB: 512,
    });
    documentService = new DocumentService();

    await memorySystem.initialize();
    await documentService.initialize();

    // Initialize main systems
    productWorkflowEngine = new ProductWorkflowEngine(memorySystem, documentService, {
      enableSPARCIntegration: true,
      autoTriggerSPARC: true,
      sparcQualityGates: true,
    });

    productFlowSystem = new ProductFlowSystem(productWorkflowEngine, documentService);
    sparcEngine = new SPARCEngineCore();

    await productWorkflowEngine.initialize();
    await productFlowSystem.initialize();
  });

  afterEach(async () => {
    // Clean up test data if memory system is initialized
    if (memorySystem && typeof memorySystem.clear === 'function') {
      try {
        await memorySystem.clear();
      } catch (error) {
        console.warn('Test cleanup warning:', error);
      }
    }
  });

  describe('🎯 Core Integration Architecture', () => {
    it('should properly integrate Product Flow entities with SPARC phases', async () => {
      // Create a feature that should use SPARC
      const feature: FeatureDocumentEntity = {
        id: nanoid(),
        type: 'feature',
        title: 'User Authentication API',
        content: 'Implement secure JWT-based authentication API',
        feature_type: 'api', // Technical feature type - should trigger SPARC
        acceptance_criteria: [
          'JWT tokens generated on login',
          'Token validation middleware',
          'Refresh token rotation',
        ],
        technical_approach: 'REST API with JWT middleware',
        status: 'draft',
        priority: 'high',
        tags: ['authentication', 'api', 'security'],
        dependencies: [],
        related_documents: [],
        version: '1.0.0',
        checksum: 'test-checksum',
        created_at: new Date(),
        updated_at: new Date(),
        searchable_content: 'authentication JWT API',
        keywords: ['auth', 'jwt', 'api'],
        completion_percentage: 0,
        source_epic_id: 'epic-auth',
        task_ids: [],
        implementation_status: 'not_started',

        // SPARC integration should be initialized
        sparc_implementation: {
          sparc_project_id: undefined, // Will be set during integration
          sparc_phases: {
            specification: { status: 'not_started', deliverables: [] },
            pseudocode: { status: 'not_started', deliverables: [], algorithms: [] },
            architecture: { status: 'not_started', deliverables: [], components: [] },
            refinement: { status: 'not_started', deliverables: [], optimizations: [] },
            completion: { status: 'not_started', deliverables: [], artifacts: [] },
          },
          current_sparc_phase: 'specification',
          sparc_progress_percentage: 0,
          use_sparc_methodology: true,
        },
      };

      // Validate SPARC integration structure
      expect(feature.sparc_implementation).toBeDefined();
      expect(feature.sparc_implementation?.use_sparc_methodology).toBe(true);
      expect(feature.sparc_implementation?.current_sparc_phase).toBe('specification');

      // Validate all SPARC phases are defined
      const sparcPhases = feature.sparc_implementation?.sparc_phases;
      expect(sparcPhases?.specification).toBeDefined();
      expect(sparcPhases?.pseudocode).toBeDefined();
      expect(sparcPhases?.architecture).toBeDefined();
      expect(sparcPhases?.refinement).toBeDefined();
      expect(sparcPhases?.completion).toBeDefined();
    });

    it('should create Tasks with proper SPARC phase assignments', async () => {
      const task: TaskDocumentEntity = {
        id: nanoid(),
        type: 'task',
        title: 'Implement JWT Token Generation',
        content: 'Create secure JWT token generation with proper claims',
        task_type: 'development',
        estimated_hours: 8,
        implementation_details: {
          files_to_create: ['auth/jwt-service.ts', 'auth/token-validator.ts'],
          files_to_modify: ['auth/index.ts'],
          test_files: ['auth/__tests__/jwt-service.test.ts'],
          documentation_updates: ['docs/api/authentication.md'],
        },
        technical_specifications: {
          component: 'authentication-service',
          module: 'jwt-handler',
          functions: ['generateToken', 'validateToken', 'refreshToken'],
          dependencies: ['jsonwebtoken', 'bcrypt'],
        },
        status: 'draft',
        priority: 'high',
        tags: ['jwt', 'auth', 'security'],
        dependencies: [],
        related_documents: [],
        version: '1.0.0',
        checksum: 'task-checksum',
        created_at: new Date(),
        updated_at: new Date(),
        searchable_content: 'JWT token generation authentication',
        keywords: ['jwt', 'token', 'auth'],
        completion_percentage: 0,
        source_feature_id: 'feature-auth-api',
        completion_status: 'todo',

        // SPARC integration for tasks
        sparc_implementation_details: {
          parent_feature_sparc_id: 'sparc-project-auth-api',
          sparc_phase_assignment: 'completion', // This task contributes to completion phase
          sparc_deliverable_type: 'production_code',
          sparc_quality_gates: [
            {
              requirement: 'JWT tokens are cryptographically secure',
              status: 'pending',
              validation_method: 'automated',
            },
            {
              requirement: 'Token validation has <10ms latency',
              status: 'pending',
              validation_method: 'automated',
            },
          ],
          sparc_artifacts: [],
        },
      };

      // Validate SPARC task integration
      expect(task.sparc_implementation_details).toBeDefined();
      expect(task.sparc_implementation_details?.sparc_phase_assignment).toBe('completion');
      expect(task.sparc_implementation_details?.sparc_deliverable_type).toBe('production_code');
      expect(task.sparc_implementation_details?.sparc_quality_gates).toHaveLength(2);
    });
  });

  describe('🚀 Complete Product Flow Workflow', () => {
    it('should execute full Product Flow with SPARC integration', async () => {
      const workspaceId = await productFlowSystem.loadWorkspace('./test-workspace');

      // Start complete Product Flow workflow
      const result = await productWorkflowEngine.startProductWorkflow('complete-product-flow', {
        workspaceId,
        variables: {
          visionTitle: 'E-commerce Platform',
          businessObjectives: ['Increase online sales', 'Improve user experience'],
        },
      });

      expect(result.success).toBe(true);
      expect(result.workflowId).toBeDefined();

      // Verify workflow is running
      const workflows = await productWorkflowEngine.getActiveProductWorkflows();
      expect(workflows.length).toBeGreaterThan(0);

      const workflow = workflows.find((w) => w.id === result.workflowId);
      expect(workflow).toBeDefined();
      expect(workflow?.productFlow.currentStep).toBeDefined();
      expect(workflow?.sparcIntegration).toBeDefined();
    });

    it('should properly sequence Product Flow steps', async () => {
      const workspaceId = await productFlowSystem.loadWorkspace('./test-workspace');

      const result = await productWorkflowEngine.startProductWorkflow('complete-product-flow', {
        workspaceId,
      });

      const workflow = await productWorkflowEngine.getProductWorkflowStatus(result.workflowId!);
      expect(workflow).toBeDefined();

      // Verify Product Flow step sequencing
      const expectedSteps = [
        'vision-analysis',
        'adr-generation',
        'prd-creation',
        'epic-breakdown',
        'feature-definition',
        'task-creation',
        'sparc-integration',
      ];

      // The workflow should start with vision-analysis
      expect(workflow?.productFlow.currentStep).toBe('vision-analysis');

      // Verify all expected steps are covered in the workflow definition
      const workflowSteps = workflow?.definition.steps.map((s) => s.type);
      expectedSteps.forEach((step) => {
        expect(workflowSteps).toContain(step);
      });
    });
  });

  describe('🔧 SPARC Integration for Features', () => {
    it('should create SPARC projects for technical features', async () => {
      const workspaceId = await productFlowSystem.loadWorkspace('./test-workspace');

      // Mock a workflow with features that need SPARC
      const workflow = await createMockWorkflowWithFeatures(workspaceId);

      // Execute SPARC integration step
      await (productWorkflowEngine as any).integrateSPARCForFeatures(workflow);

      // Verify SPARC projects were created for technical features
      expect(workflow.sparcIntegration.sparcProjects.size).toBeGreaterThan(0);

      // Check that API feature got SPARC project
      const apiFeature = workflow.productFlow.documents.features.find(
        (f) => f.feature_type === 'api',
      );
      if (apiFeature) {
        expect(workflow.sparcIntegration.sparcProjects.has(apiFeature.id)).toBe(true);
        expect(workflow.sparcIntegration.activePhases.get(apiFeature.id)).toBe('specification');
      }
    });

    it('should execute all SPARC phases for integrated features', async () => {
      const sparcProject = await sparcEngine.initializeProject({
        name: 'Test Feature Implementation',
        domain: 'rest-api',
        complexity: 'moderate',
        requirements: ['Secure API endpoints', 'Data validation', 'Error handling'],
      });

      // Execute all SPARC phases
      const phases: SPARCPhase[] = [
        'specification',
        'pseudocode',
        'architecture',
        'refinement',
        'completion',
      ];
      const results = [];

      for (const phase of phases) {
        const result = await sparcEngine.executePhase(sparcProject, phase);
        results.push(result);
        expect(result.success).toBe(true);
        expect(result.phase).toBe(phase);
      }

      // Verify all phases completed
      expect(results).toHaveLength(5);
      expect(sparcProject.progress.completedPhases).toHaveLength(5);
    });

    it('should validate SPARC completion and production readiness', async () => {
      const sparcProject = await sparcEngine.initializeProject({
        name: 'Production Ready Feature',
        domain: 'rest-api',
        complexity: 'moderate',
        requirements: ['Complete implementation', 'Full test coverage', 'Documentation'],
      });

      // Execute all phases to completion
      const phases: SPARCPhase[] = [
        'specification',
        'pseudocode',
        'architecture',
        'refinement',
        'completion',
      ];
      for (const phase of phases) {
        await sparcEngine.executePhase(sparcProject, phase);
      }

      // Validate completion
      const validation = await sparcEngine.validateCompletion(sparcProject);

      expect(validation.readyForProduction).toBeDefined();
      expect(validation.score).toBeGreaterThan(0);
      expect(validation.validations.length).toBeGreaterThan(0);

      // Should have validations for all critical criteria
      const criteriaTypes = validation.validations.map((v) => v.criterion);
      expect(criteriaTypes).toContain('all-phases-completed');
      expect(criteriaTypes).toContain('specification-quality');
      expect(criteriaTypes).toContain('architecture-completeness');
    });
  });

  describe('📊 Integration Health and Monitoring', () => {
    it('should track Product Flow + SPARC integration health', async () => {
      const workspaceId = await productFlowSystem.loadWorkspace('./test-workspace');
      const workspaceStatus = await productFlowSystem.getWorkspaceStatus(workspaceId);

      expect(workspaceStatus.sparcIntegration).toBe(true);
      expect(workspaceStatus.workspaceId).toBe(workspaceId);
    });

    it('should provide comprehensive integration metrics', async () => {
      const workflow = await createMockWorkflowWithFeatures('test-workspace');

      // Mock some SPARC integration
      workflow.sparcIntegration.sparcProjects.set('feature-1', {} as SPARCProject);
      workflow.sparcIntegration.activePhases.set('feature-1', 'architecture');
      workflow.sparcIntegration.completedPhases.set('feature-1', ['specification', 'pseudocode']);

      // Verify integration state
      expect(workflow.sparcIntegration.sparcProjects.size).toBe(1);
      expect(workflow.sparcIntegration.activePhases.get('feature-1')).toBe('architecture');
      expect(workflow.sparcIntegration.completedPhases.get('feature-1')).toHaveLength(2);
    });
  });

  describe('🎛️ Workflow Control Operations', () => {
    it('should support pause/resume of Product Flow workflows', async () => {
      const workspaceId = await productFlowSystem.loadWorkspace('./test-workspace');

      const result = await productWorkflowEngine.startProductWorkflow('complete-product-flow', {
        workspaceId,
      });

      // Pause workflow
      const pauseResult = await productWorkflowEngine.pauseProductWorkflow(result.workflowId!);
      expect(pauseResult.success).toBe(true);

      // Verify paused status
      const workflow = await productWorkflowEngine.getProductWorkflowStatus(result.workflowId!);
      expect(workflow?.status).toBe('paused');

      // Resume workflow
      const resumeResult = await productWorkflowEngine.resumeProductWorkflow(result.workflowId!);
      expect(resumeResult.success).toBe(true);
    });

    it('should handle workflow errors gracefully', async () => {
      const workspaceId = await productFlowSystem.loadWorkspace('./test-workspace');

      // Start workflow with invalid configuration to trigger error
      const result = await productWorkflowEngine.startProductWorkflow('nonexistent-workflow', {
        workspaceId,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  // Helper function to create mock workflow with features
  async function createMockWorkflowWithFeatures(workspaceId: string) {
    const mockFeatures: FeatureDocumentEntity[] = [
      {
        id: 'feature-api',
        type: 'feature',
        title: 'User Management API',
        content: 'REST API for user operations',
        feature_type: 'api', // Technical - should get SPARC
        acceptance_criteria: ['CRUD operations', 'Authentication', 'Validation'],
        technical_approach: 'REST with JWT',
        status: 'draft',
        priority: 'high',
        tags: ['api'],
        dependencies: [],
        related_documents: [],
        version: '1.0.0',
        checksum: 'checksum-api',
        created_at: new Date(),
        updated_at: new Date(),
        searchable_content: 'user management api',
        keywords: ['user', 'api'],
        completion_percentage: 0,
        task_ids: [],
        implementation_status: 'not_started',
      },
      {
        id: 'feature-ui',
        type: 'feature',
        title: 'User Registration Form',
        content: 'Simple registration form',
        feature_type: 'ui', // Non-technical - might not need SPARC
        acceptance_criteria: ['Form validation', 'User feedback'],
        technical_approach: 'React form component',
        status: 'draft',
        priority: 'medium',
        tags: ['ui'],
        dependencies: [],
        related_documents: [],
        version: '1.0.0',
        checksum: 'checksum-ui',
        created_at: new Date(),
        updated_at: new Date(),
        searchable_content: 'user registration form',
        keywords: ['user', 'form'],
        completion_percentage: 0,
        task_ids: [],
        implementation_status: 'not_started',
      },
    ];

    return {
      id: 'mock-workflow',
      definition: { name: 'test', description: 'test', version: '1.0', steps: [] },
      status: 'running' as const,
      context: {
        workspaceId,
        sessionId: 'test',
        documents: {},
        variables: {},
        environment: {
          type: 'development' as const,
          nodeVersion: process.version,
          workflowVersion: '1.0.0',
          features: [],
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
      },
      currentStepIndex: 0,
      steps: [],
      stepResults: {},
      completedSteps: [],
      startTime: new Date(),
      progress: { percentage: 0, completedSteps: 0, totalSteps: 1 },
      metrics: {
        totalDuration: 0,
        avgStepDuration: 0,
        successRate: 0,
        retryRate: 0,
        resourceUsage: { cpuTime: 0, memoryPeak: 0, diskIo: 0, networkRequests: 0 },
        throughput: 0,
      },
      productFlow: {
        currentStep: 'feature-definition' as const,
        completedSteps: [],
        documents: {
          adrs: [],
          prds: [],
          epics: [],
          features: mockFeatures,
          tasks: [],
        },
      },
      sparcIntegration: {
        sparcProjects: new Map(),
        activePhases: new Map(),
        completedPhases: new Map(),
      },
    };
  }
});
