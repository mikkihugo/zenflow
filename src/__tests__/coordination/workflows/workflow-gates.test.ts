/**
 * @file Workflow Gates System Unit Tests
 * 
 * Comprehensive unit tests for the workflow gates system including:
 * - Gate creation and management
 * - Trigger system and condition evaluation
 * - Queue management and processing
 * - Gate persistence and state management
 * - Metrics and tracking functionality
 * - AGUI integration
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import { join } from 'path';
import {
  WorkflowGatesManager,
  GatePersistenceManager,
  WorkflowHumanGateType,
  WorkflowHumanGateStatus,
  WorkflowGatePriority,
  GateTriggerUrgency,
  StrategicGateFactory,
  ArchitecturalGateFactory,
  QualityGateFactory,
  BusinessGateFactory,
  EthicalGateFactory,
  type WorkflowHumanGate,
  type WorkflowGateContext,
  type WorkflowGateData,
  type GateTrigger,
  type CreateGateOptions,
  type ImpactAssessment,
  type ComplianceImpact,
  type ResourceImpact
} from '../../../coordination/orchestration/workflow-gates';
import {
  TypeSafeEventBus,
  createTypeSafeEventBus
} from '../../../core/type-safe-event-system';

// Mock better-sqlite3
const mockDatabase = {
  exec: jest.fn(),
  prepare: jest.fn(),
  close: jest.fn()
};

const mockStatement = {
  run: jest.fn(),
  get: jest.fn(),
  all: jest.fn()
};

jest.mock('better-sqlite3', () => {
  return jest.fn(() => mockDatabase);
});

// Test data factories
const createMockWorkflowContext = (): WorkflowGateContext => ({
  gateWorkflowId: 'test-workflow-001',
  phaseName: 'design-phase',
  businessDomain: 'product',
  technicalDomain: 'backend',
  stakeholderGroups: ['product-manager', 'lead-architect'],
  impactAssessment: createMockImpactAssessment(),
  historicalContext: {
    previousDecisions: [],
    successPatterns: [],
    failurePatterns: [],
    lessonsLearned: []
  }
});

const createMockImpactAssessment = (): ImpactAssessment => ({
  businessImpact: 0.8,
  technicalImpact: 0.7,
  riskImpact: 0.6,
  resourceImpact: createMockResourceImpact(),
  complianceImpact: createMockComplianceImpact(),
  userExperienceImpact: 0.5
});

const createMockResourceImpact = (): ResourceImpact => ({
  timeHours: 40,
  costImpact: 10000,
  teamSize: 3,
  criticality: 'high'
});

const createMockComplianceImpact = (): ComplianceImpact => ({
  regulations: ['GDPR', 'SOX'],
  riskLevel: 'medium',
  requiredReviews: ['legal', 'privacy'],
  deadlines: [new Date(Date.now() + 86400000 * 30)] // 30 days from now
});

const createMockGateData = (): WorkflowGateData => ({
  payload: {
    testData: 'mock-data'
  },
  structured: {
    type: 'strategic',
    prdData: {
      prdId: 'prd-001',
      title: 'Test PRD',
      businessObjectives: ['Increase user engagement'],
      userStories: ['As a user, I want to...'],
      acceptanceCriteria: ['Given when then...'],
      estimatedEffort: 40,
      riskFactors: ['Technical complexity']
    }
  },
  attachments: [],
  externalReferences: []
});

const createMockTrigger = (): GateTrigger => ({
  id: 'test-trigger-001',
  event: 'prd-generated',
  condition: async () => true,
  urgency: GateTriggerUrgency.IMMEDIATE,
  metadata: {
    name: 'Test trigger',
    description: 'Test trigger description',
    phases: ['design'],
    stakeholders: ['product-manager'],
    category: 'strategic',
    properties: {}
  }
});

describe('WorkflowGatesManager', () => {
  let gatesManager: WorkflowGatesManager;
  let eventBus: TypeSafeEventBus;
  let testDbPath: string;

  beforeEach(async () => {
    // Setup test database path
    testDbPath = join(__dirname, '..', '..', '..', '..', 'test-data', 'workflow-gates-test.db');
    
    // Create test directory
    await fs.mkdir(join(testDbPath, '..'), { recursive: true }).catch(() => {});

    // Setup event bus
    eventBus = createTypeSafeEventBus({
      enableMetrics: false,
      domainValidation: false
    });
    await eventBus.initialize();

    // Setup mocks
    mockDatabase.exec.mockClear();
    mockDatabase.prepare.mockReturnValue(mockStatement);
    mockStatement.run.mockClear();
    mockStatement.get.mockClear();
    mockStatement.all.mockClear();

    // Create gates manager
    gatesManager = new WorkflowGatesManager(eventBus, {
      persistencePath: testDbPath,
      queueProcessingInterval: 100, // Fast processing for tests
      maxConcurrentGates: 10,
      enableMetrics: true
    });
  });

  afterEach(async () => {
    await gatesManager.shutdown();
    await eventBus.shutdown();
    
    // Clean up test database
    try {
      await fs.unlink(testDbPath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      await expect(gatesManager.initialize()).resolves.not.toThrow();
    });

    it('should emit initialized event', async () => {
      const initPromise = new Promise<void>(resolve => {
        gatesManager.once('initialized', resolve);
      });

      await gatesManager.initialize();
      await initPromise;
    });

    it('should handle multiple initialization calls', async () => {
      await gatesManager.initialize();
      await expect(gatesManager.initialize()).resolves.not.toThrow();
    });
  });

  describe('Gate Creation', () => {
    beforeEach(async () => {
      await gatesManager.initialize();
    });

    it('should create a strategic gate', async () => {
      const context = createMockWorkflowContext();
      const data = createMockGateData();
      
      const gate = await gatesManager.createGate(
        WorkflowHumanGateType.STRATEGIC,
        'prd-approval',
        context,
        data
      );

      expect(gate).toBeDefined();
      expect(gate.type).toBe(WorkflowHumanGateType.STRATEGIC);
      expect(gate.subtype).toBe('prd-approval');
      expect(gate.status).toBe(WorkflowHumanGateStatus.PENDING);
      expect(gate.workflowContext).toEqual(context);
      expect(gate.gateData).toEqual(data);
    });

    it('should create an architectural gate', async () => {
      const context = createMockWorkflowContext();
      const data = createMockGateData();
      
      const gate = await gatesManager.createGate(
        WorkflowHumanGateType.ARCHITECTURAL,
        'system-design-review',
        context,
        data
      );

      expect(gate.type).toBe(WorkflowHumanGateType.ARCHITECTURAL);
      expect(gate.subtype).toBe('system-design-review');
    });

    it('should create a quality gate', async () => {
      const context = createMockWorkflowContext();
      const data = createMockGateData();
      
      const gate = await gatesManager.createGate(
        WorkflowHumanGateType.QUALITY,
        'security-review',
        context,
        data
      );

      expect(gate.type).toBe(WorkflowHumanGateType.QUALITY);
      expect(gate.subtype).toBe('security-review');
    });

    it('should create a business gate', async () => {
      const context = createMockWorkflowContext();
      const data = createMockGateData();
      
      const gate = await gatesManager.createGate(
        WorkflowHumanGateType.BUSINESS,
        'feature-validation',
        context,
        data
      );

      expect(gate.type).toBe(WorkflowHumanGateType.BUSINESS);
      expect(gate.subtype).toBe('feature-validation');
    });

    it('should create an ethical gate', async () => {
      const context = createMockWorkflowContext();
      const data = createMockGateData();
      
      const gate = await gatesManager.createGate(
        WorkflowHumanGateType.ETHICAL,
        'ai-behavior-review',
        context,
        data
      );

      expect(gate.type).toBe(WorkflowHumanGateType.ETHICAL);
      expect(gate.subtype).toBe('ai-behavior-review');
    });

    it('should emit gate-created event', async () => {
      const context = createMockWorkflowContext();
      const data = createMockGateData();
      
      const eventPromise = new Promise<WorkflowHumanGate>(resolve => {
        gatesManager.once('gate-created', resolve);
      });

      const gate = await gatesManager.createGate(
        WorkflowHumanGateType.STRATEGIC,
        'test-gate',
        context,
        data
      );

      const emittedGate = await eventPromise;
      expect(emittedGate.id).toBe(gate.id);
    });

    it('should create gate with custom options', async () => {
      const context = createMockWorkflowContext();
      const data = createMockGateData();
      
      const options: CreateGateOptions = {
        title: 'Custom Gate Title',
        description: 'Custom gate description',
        priority: WorkflowGatePriority.CRITICAL,
        approvers: ['custom-approver'],
        triggers: [createMockTrigger()]
      };

      const gate = await gatesManager.createGate(
        WorkflowHumanGateType.STRATEGIC,
        'custom-gate',
        context,
        data,
        options
      );

      expect(gate.title).toBe(options.title);
      expect(gate.description).toBe(options.description);
      expect(gate.priority).toBe(options.priority);
      expect(gate.approvalConfig.approvers).toEqual(options.approvers);
      expect(gate.triggers).toEqual(options.triggers);
    });

    it('should throw error for unsupported gate type', async () => {
      const context = createMockWorkflowContext();
      const data = createMockGateData();
      
      // Create a manager with no factories registered
      const emptyManager = new WorkflowGatesManager(eventBus, {
        persistencePath: testDbPath + '-empty'
      });
      
      await expect(
        emptyManager.createGate(
          'unsupported' as WorkflowHumanGateType,
          'test',
          context,
          data
        )
      ).rejects.toThrow();
      
      await emptyManager.shutdown();
    });
  });

  describe('Gate Management', () => {
    let gate: WorkflowHumanGate;

    beforeEach(async () => {
      await gatesManager.initialize();
      
      const context = createMockWorkflowContext();
      const data = createMockGateData();
      
      gate = await gatesManager.createGate(
        WorkflowHumanGateType.STRATEGIC,
        'test-gate',
        context,
        data
      );
    });

    it('should update gate', async () => {
      const updates = {
        title: 'Updated Title',
        description: 'Updated description'
      };

      const eventPromise = new Promise<WorkflowHumanGate>(resolve => {
        gatesManager.once('gate-updated', resolve);
      });

      await gatesManager.updateGate(gate.id, updates);
      
      const updatedGate = await eventPromise;
      expect(updatedGate.title).toBe(updates.title);
      expect(updatedGate.description).toBe(updates.description);
    });

    it('should resolve gate with approval', async () => {
      const eventPromise = new Promise<any>(resolve => {
        gatesManager.once('gate-resolved', resolve);
      });

      await gatesManager.resolveGate(
        gate.id,
        'approved',
        'test-user',
        'Test resolution rationale'
      );

      const resolvedEvent = await eventPromise;
      expect(resolvedEvent.gateId).toBe(gate.id);
      expect(resolvedEvent.decision).toBe('approved');
      expect(resolvedEvent.resolvedBy).toBe('test-user');
    });

    it('should resolve gate with rejection', async () => {
      const eventPromise = new Promise<any>(resolve => {
        gatesManager.once('gate-resolved', resolve);
      });

      await gatesManager.resolveGate(
        gate.id,
        'rejected',
        'test-user',
        'Test rejection rationale'
      );

      const resolvedEvent = await eventPromise;
      expect(resolvedEvent.decision).toBe('rejected');
    });

    it('should cancel gate', async () => {
      const eventPromise = new Promise<any>(resolve => {
        gatesManager.once('gate-cancelled', resolve);
      });

      await gatesManager.cancelGate(gate.id, 'Test cancellation', 'test-user');

      const cancelledEvent = await eventPromise;
      expect(cancelledEvent.gateId).toBe(gate.id);
      expect(cancelledEvent.reason).toBe('Test cancellation');
      expect(cancelledEvent.cancelledBy).toBe('test-user');
    });

    it('should throw error when updating non-existent gate', async () => {
      await expect(
        gatesManager.updateGate('non-existent-gate', { title: 'Test' })
      ).rejects.toThrow('Gate not found');
    });

    it('should throw error when resolving non-existent gate', async () => {
      await expect(
        gatesManager.resolveGate('non-existent-gate', 'approved', 'test-user')
      ).rejects.toThrow('Gate not found');
    });
  });

  describe('Trigger System', () => {
    beforeEach(async () => {
      await gatesManager.initialize();
    });

    it('should process triggers on gate creation', async () => {
      const context = createMockWorkflowContext();
      const data = createMockGateData();
      
      const trigger: GateTrigger = {
        id: 'immediate-trigger',
        event: 'prd-generated',
        condition: async () => true,
        urgency: GateTriggerUrgency.IMMEDIATE,
        metadata: {
          name: 'Immediate trigger',
          description: 'Test immediate trigger',
          phases: ['design'],
          stakeholders: ['product-manager'],
          category: 'strategic',
          properties: {}
        }
      };

      const eventPromise = new Promise<any>(resolve => {
        gatesManager.once('gate-triggered', resolve);
      });

      await gatesManager.createGate(
        WorkflowHumanGateType.STRATEGIC,
        'trigger-test',
        context,
        data,
        { triggers: [trigger] }
      );

      const triggeredEvent = await eventPromise;
      expect(triggeredEvent.trigger.id).toBe(trigger.id);
    });

    it('should not trigger gates when conditions are not met', async () => {
      const context = createMockWorkflowContext();
      const data = createMockGateData();
      
      const trigger: GateTrigger = {
        id: 'never-trigger',
        event: 'prd-generated',
        condition: async () => false, // Never trigger
        urgency: GateTriggerUrgency.IMMEDIATE,
        metadata: {
          name: 'Never trigger',
          description: 'Test trigger that never fires',
          phases: ['design'],
          stakeholders: ['product-manager'],
          category: 'strategic',
          properties: {}
        }
      };

      let triggered = false;
      gatesManager.once('gate-triggered', () => {
        triggered = true;
      });

      await gatesManager.createGate(
        WorkflowHumanGateType.STRATEGIC,
        'no-trigger-test',
        context,
        data,
        { triggers: [trigger] }
      );

      // Wait a bit to ensure trigger processing is complete
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(triggered).toBe(false);
    });

    it('should handle trigger condition errors gracefully', async () => {
      const context = createMockWorkflowContext();
      const data = createMockGateData();
      
      const trigger: GateTrigger = {
        id: 'error-trigger',
        event: 'prd-generated',
        condition: async () => {
          throw new Error('Trigger condition error');
        },
        urgency: GateTriggerUrgency.IMMEDIATE,
        metadata: {
          name: 'Error trigger',
          description: 'Test trigger that throws errors',
          phases: ['design'],
          stakeholders: ['product-manager'],
          category: 'strategic',
          properties: {}
        }
      };

      await expect(
        gatesManager.createGate(
          WorkflowHumanGateType.STRATEGIC,
          'error-trigger-test',
          context,
          data,
          { triggers: [trigger] }
        )
      ).resolves.toBeDefined(); // Should not throw, error handled gracefully
    });
  });

  describe('Queue Management', () => {
    beforeEach(async () => {
      await gatesManager.initialize();
    });

    it('should add gate to queue', async () => {
      const context = createMockWorkflowContext();
      const data = createMockGateData();
      
      const gate = await gatesManager.createGate(
        WorkflowHumanGateType.STRATEGIC,
        'queue-test',
        context,
        data
      );

      await gatesManager.addToQueue(
        gate.id,
        1,
        GateTriggerUrgency.WITHIN_HOUR,
        new Date()
      );

      const queuedGates = await gatesManager.getQueuedGates();
      expect(queuedGates.length).toBeGreaterThan(0);
      expect(queuedGates.find(item => item.gate.id === gate.id)).toBeDefined();
    });

    it('should process queue on interval', async () => {
      const context = createMockWorkflowContext();
      const data = createMockGateData();
      
      const trigger: GateTrigger = {
        id: 'queue-trigger',
        event: 'prd-generated',
        condition: async () => true,
        urgency: GateTriggerUrgency.WITHIN_HOUR, // Non-immediate to test queue processing
        metadata: {
          name: 'Queue trigger',
          description: 'Test queue processing',
          phases: ['design'],
          stakeholders: ['product-manager'],
          category: 'strategic',
          properties: {}
        }
      };

      const readyPromise = new Promise<any>(resolve => {
        gatesManager.once('gate-ready-for-review', resolve);
      });

      await gatesManager.createGate(
        WorkflowHumanGateType.STRATEGIC,
        'queue-process-test',
        context,
        data,
        { triggers: [trigger] }
      );

      // Wait for queue processing
      const readyEvent = await readyPromise;
      expect(readyEvent.gate).toBeDefined();
      expect(readyEvent.queueItem).toBeDefined();
    });
  });

  describe('Query Methods', () => {
    let gates: WorkflowHumanGate[];

    beforeEach(async () => {
      await gatesManager.initialize();
      
      const context = createMockWorkflowContext();
      const data = createMockGateData();
      
      gates = [];
      
      // Create gates of different types and statuses
      gates.push(await gatesManager.createGate(
        WorkflowHumanGateType.STRATEGIC,
        'strategic-1',
        context,
        data
      ));
      
      gates.push(await gatesManager.createGate(
        WorkflowHumanGateType.ARCHITECTURAL,
        'arch-1',
        context,
        data
      ));
      
      gates.push(await gatesManager.createGate(
        WorkflowHumanGateType.QUALITY,
        'quality-1',
        context,
        data
      ));
      
      // Resolve one gate
      await gatesManager.resolveGate(gates[0]!.id, 'approved', 'test-user');
    });

    it('should get gate by ID', async () => {
      const gate = await gatesManager.getGate(gates[0]!.id);
      expect(gate).toBeDefined();
      expect(gate?.id).toBe(gates[0]!.id);
    });

    it('should return null for non-existent gate', async () => {
      const gate = await gatesManager.getGate('non-existent-id');
      expect(gate).toBeNull();
    });

    it('should get gates by status', async () => {
      // Mock the persistence layer return
      mockStatement.all.mockReturnValue([]);
      
      const pendingGates = await gatesManager.getGatesByStatus([
        WorkflowHumanGateStatus.PENDING
      ]);
      
      expect(Array.isArray(pendingGates)).toBe(true);
    });

    it('should get gates by type', async () => {
      // Mock the persistence layer return
      mockStatement.all.mockReturnValue([]);
      
      const strategicGates = await gatesManager.getGatesByType(
        WorkflowHumanGateType.STRATEGIC
      );
      
      expect(Array.isArray(strategicGates)).toBe(true);
    });

    it('should get pending gates', async () => {
      // Mock the persistence layer return
      mockStatement.all.mockReturnValue([]);
      
      const pendingGates = await gatesManager.getPendingGates();
      expect(Array.isArray(pendingGates)).toBe(true);
    });

    it('should get gate history', async () => {
      // Mock the persistence layer return
      mockStatement.all.mockReturnValue([]);
      
      const history = await gatesManager.getGateHistory(gates[0]!.id);
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe('Metrics and Analytics', () => {
    beforeEach(async () => {
      await gatesManager.initialize();
    });

    it('should get metrics without time range', async () => {
      // Mock persistence metrics
      mockStatement.get.mockReturnValue({ count: 5 });
      mockStatement.all.mockReturnValue([
        { status: 'pending', count: 2 },
        { status: 'approved', count: 3 }
      ]);

      const metrics = await gatesManager.getMetrics();
      
      expect(metrics).toBeDefined();
      expect(typeof metrics.totalGates).toBe('number');
      expect(typeof metrics.queuedGatesCount).toBe('number');
      expect(typeof metrics.activeGatesCount).toBe('number');
      expect(typeof metrics.completedGatesCount).toBe('number');
    });

    it('should get metrics with time range', async () => {
      const timeRange = {
        from: new Date(Date.now() - 86400000),
        to: new Date()
      };
      
      // Mock persistence metrics
      mockStatement.get.mockReturnValue({ count: 3 });
      mockStatement.all.mockReturnValue([]);

      const metrics = await gatesManager.getMetrics(timeRange);
      
      expect(metrics).toBeDefined();
      expect(metrics.timeRange).toEqual(timeRange);
    });
  });
});

describe('GatePersistenceManager', () => {
  let persistenceManager: GatePersistenceManager;
  let testDbPath: string;

  beforeEach(async () => {
    testDbPath = join(__dirname, '..', '..', '..', '..', 'test-data', 'persistence-test.db');
    
    await fs.mkdir(join(testDbPath, '..'), { recursive: true }).catch(() => {});
    
    // Setup mocks
    mockDatabase.exec.mockClear();
    mockDatabase.prepare.mockReturnValue(mockStatement);
    mockStatement.run.mockClear();
    mockStatement.get.mockClear();
    mockStatement.all.mockClear();

    persistenceManager = new GatePersistenceManager(testDbPath);
  });

  afterEach(async () => {
    await persistenceManager.shutdown();
    
    try {
      await fs.unlink(testDbPath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      await expect(persistenceManager.initialize()).resolves.not.toThrow();
      expect(mockDatabase.exec).toHaveBeenCalled();
    });

    it('should create database tables', async () => {
      await persistenceManager.initialize();
      
      // Check that table creation SQL was executed
      const execCalls = mockDatabase.exec.mock.calls;
      expect(execCalls.some((call: any) => 
        call[0].includes('CREATE TABLE IF NOT EXISTS workflow_gates')
      )).toBe(true);
    });
  });

  describe('Gate Persistence', () => {
    beforeEach(async () => {
      await persistenceManager.initialize();
    });

    it('should save gate to database', async () => {
      const gate: WorkflowHumanGate = {
        id: 'test-gate-001',
        type: WorkflowHumanGateType.STRATEGIC,
        subtype: 'test-subtype',
        title: 'Test Gate',
        description: 'Test gate description',
        status: WorkflowHumanGateStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        workflowContext: createMockWorkflowContext(),
        gateData: createMockGateData(),
        triggers: [createMockTrigger()],
        priority: WorkflowGatePriority.HIGH,
        approvalConfig: {
          approvers: ['test-approver'],
          requiredApprovals: 1
        },
        metrics: {
          createdAt: new Date(),
          escalationCount: 0,
          modificationCount: 0,
          stakeholderInteractions: [],
          performance: {
            avgProcessingTime: 0,
            successRate: 0,
            escalationRate: 0,
            timeoutRate: 0,
            resourceUtilization: 0
          },
          quality: {
            decisionAccuracy: 0,
            stakeholderSatisfaction: 0,
            processEfficiency: 0,
            outcomeQuality: 0,
            complianceScore: 0
          }
        }
      };

      await persistenceManager.saveGate(gate);
      
      expect(mockStatement.run).toHaveBeenCalled();
    });

    it('should get gate from database', async () => {
      const mockGateRow = {
        id: 'test-gate-001',
        type: 'strategic',
        subtype: 'test-subtype',
        title: 'Test Gate',
        description: 'Test description',
        status: 'pending',
        created_at: Date.now(),
        updated_at: Date.now(),
        workflow_context: JSON.stringify(createMockWorkflowContext()),
        gate_data: JSON.stringify(createMockGateData()),
        triggers: JSON.stringify([createMockTrigger()]),
        priority: 'high',
        approval_config: JSON.stringify({
          approvers: ['test-approver'],
          requiredApprovals: 1
        }),
        timeout_config: null,
        resolution: null,
        metrics: JSON.stringify({
          createdAt: Date.now(),
          escalationCount: 0,
          modificationCount: 0,
          stakeholderInteractions: [],
          performance: {
            avgProcessingTime: 0,
            successRate: 0,
            escalationRate: 0,
            timeoutRate: 0,
            resourceUtilization: 0
          },
          quality: {
            decisionAccuracy: 0,
            stakeholderSatisfaction: 0,
            processEfficiency: 0,
            outcomeQuality: 0,
            complianceScore: 0
          }
        }),
        workflow_gate_request: null
      };

      mockStatement.get.mockReturnValue(mockGateRow);

      const gate = await persistenceManager.getGate('test-gate-001');
      
      expect(gate).toBeDefined();
      expect(gate?.id).toBe('test-gate-001');
      expect(gate?.type).toBe(WorkflowHumanGateType.STRATEGIC);
    });

    it('should return null for non-existent gate', async () => {
      mockStatement.get.mockReturnValue(undefined);

      const gate = await persistenceManager.getGate('non-existent');
      
      expect(gate).toBeNull();
    });

    it('should update gate status', async () => {
      const resolution = {
        resolvedAt: new Date(),
        decision: 'approved' as const,
        resolvedBy: 'test-user'
      };

      await persistenceManager.updateGateStatus(
        'test-gate-001',
        WorkflowHumanGateStatus.APPROVED,
        resolution
      );
      
      expect(mockStatement.run).toHaveBeenCalledWith(
        WorkflowHumanGateStatus.APPROVED,
        expect.any(Number),
        JSON.stringify(resolution),
        'test-gate-001'
      );
    });
  });

  describe('Queue Management', () => {
    beforeEach(async () => {
      await persistenceManager.initialize();
    });

    it('should add gate to queue', async () => {
      const gateId = 'test-gate-001';
      const priority = 1;
      const urgency = GateTriggerUrgency.IMMEDIATE;
      const scheduledAt = new Date();

      await persistenceManager.addToQueue(gateId, priority, urgency, scheduledAt);
      
      expect(mockStatement.run).toHaveBeenCalledWith(
        gateId,
        priority,
        urgency,
        scheduledAt.getTime(),
        expect.any(Number)
      );
    });

    it('should get queued gates', async () => {
      const mockQueueRows = [
        {
          id: 'test-gate-001',
          type: 'strategic',
          subtype: 'test',
          title: 'Test Gate',
          description: 'Test',
          status: 'triggered',
          created_at: Date.now(),
          updated_at: Date.now(),
          workflow_context: JSON.stringify(createMockWorkflowContext()),
          gate_data: JSON.stringify(createMockGateData()),
          triggers: JSON.stringify([]),
          priority: 'high',
          approval_config: JSON.stringify({ approvers: [], requiredApprovals: 1 }),
          metrics: JSON.stringify({
            createdAt: Date.now(),
            escalationCount: 0,
            modificationCount: 0,
            stakeholderInteractions: [],
            performance: {
              avgProcessingTime: 0,
              successRate: 0,
              escalationRate: 0,
              timeoutRate: 0,
              resourceUtilization: 0
            },
            quality: {
              decisionAccuracy: 0,
              stakeholderSatisfaction: 0,
              processEfficiency: 0,
              outcomeQuality: 0,
              complianceScore: 0
            }
          }),
          queue_id: 1,
          queue_priority: 1,
          queue_urgency: 'immediate',
          queue_scheduled_at: Date.now()
        }
      ];

      mockStatement.all.mockReturnValue(mockQueueRows);

      const queuedGates = await persistenceManager.getQueuedGates();
      
      expect(queuedGates).toHaveLength(1);
      expect(queuedGates[0]?.gate.id).toBe('test-gate-001');
      expect(queuedGates[0]?.queueItem.id).toBe(1);
    });

    it('should mark queue item as processed', async () => {
      await persistenceManager.markQueueItemProcessed(1);
      
      expect(mockStatement.run).toHaveBeenCalledWith(1);
    });
  });

  describe('History Tracking', () => {
    beforeEach(async () => {
      await persistenceManager.initialize();
    });

    it('should add history entry', async () => {
      const gateId = 'test-gate-001';
      const action = 'created';
      const actor = 'test-user';
      const data = { test: 'data' };

      await persistenceManager.addHistoryEntry(gateId, action, actor, data);
      
      expect(mockStatement.run).toHaveBeenCalledWith(
        gateId,
        action,
        actor,
        expect.any(Number),
        JSON.stringify(data)
      );
    });

    it('should get gate history', async () => {
      const mockHistoryRows = [
        {
          id: 1,
          gate_id: 'test-gate-001',
          action: 'created',
          actor: 'test-user',
          timestamp: Date.now(),
          data: JSON.stringify({ test: 'data' })
        }
      ];

      mockStatement.all.mockReturnValue(mockHistoryRows);

      const history = await persistenceManager.getGateHistory('test-gate-001');
      
      expect(history).toHaveLength(1);
      expect(history[0]?.action).toBe('created');
      expect(history[0]?.actor).toBe('test-user');
    });
  });

  describe('Metrics', () => {
    beforeEach(async () => {
      await persistenceManager.initialize();
    });

    it('should get metrics without time range', async () => {
      mockStatement.get
        .mockReturnValueOnce({ count: 10 }) // total gates
        .mockReturnValueOnce({ avg_time: 3600000 }); // avg resolution time
      
      mockStatement.all
        .mockReturnValueOnce([ // gates by status
          { status: 'pending', count: 3 },
          { status: 'approved', count: 7 }
        ])
        .mockReturnValueOnce([ // gates by type
          { type: 'strategic', count: 5 },
          { type: 'quality', count: 5 }
        ]);

      const metrics = await persistenceManager.getMetrics();
      
      expect(metrics.totalGates).toBe(10);
      expect(metrics.averageResolutionTime).toBe(3600000);
      expect(metrics.gatesByStatus).toEqual({
        pending: 3,
        approved: 7
      });
      expect(metrics.gatesByType).toEqual({
        strategic: 5,
        quality: 5
      });
    });

    it('should get metrics with time range', async () => {
      const timeRange = {
        from: new Date(Date.now() - 86400000),
        to: new Date()
      };

      mockStatement.get.mockReturnValue({ count: 5 });
      mockStatement.all.mockReturnValue([]);

      const metrics = await persistenceManager.getMetrics(timeRange);
      
      expect(metrics.timeRange).toEqual(timeRange);
    });
  });
});

describe('Gate Factories', () => {
  const context = createMockWorkflowContext();
  const data = createMockGateData();
  const options: CreateGateOptions = {
    title: 'Test Gate',
    description: 'Test description',
    priority: WorkflowGatePriority.HIGH
  };

  describe('StrategicGateFactory', () => {
    it('should create strategic gate', () => {
      const factory = new StrategicGateFactory();
      const gate = factory.createGate('test-strategic', context, data, options);
      
      expect(gate.type).toBe(WorkflowHumanGateType.STRATEGIC);
      expect(gate.subtype).toBe('test-strategic');
      expect(gate.title).toBe(options.title);
      expect(gate.description).toBe(options.description);
      expect(gate.priority).toBe(options.priority);
    });
  });

  describe('ArchitecturalGateFactory', () => {
    it('should create architectural gate', () => {
      const factory = new ArchitecturalGateFactory();
      const gate = factory.createGate('test-arch', context, data, options);
      
      expect(gate.type).toBe(WorkflowHumanGateType.ARCHITECTURAL);
      expect(gate.subtype).toBe('test-arch');
      expect(gate.approvalConfig.approvers).toContain('lead-architect');
    });
  });

  describe('QualityGateFactory', () => {
    it('should create quality gate', () => {
      const factory = new QualityGateFactory();
      const gate = factory.createGate('test-quality', context, data, options);
      
      expect(gate.type).toBe(WorkflowHumanGateType.QUALITY);
      expect(gate.subtype).toBe('test-quality');
      expect(gate.approvalConfig.approvers).toContain('qa-lead');
    });
  });

  describe('BusinessGateFactory', () => {
    it('should create business gate', () => {
      const factory = new BusinessGateFactory();
      const gate = factory.createGate('test-business', context, data, options);
      
      expect(gate.type).toBe(WorkflowHumanGateType.BUSINESS);
      expect(gate.subtype).toBe('test-business');
      expect(gate.approvalConfig.approvers).toContain('product-manager');
    });
  });

  describe('EthicalGateFactory', () => {
    it('should create ethical gate', () => {
      const factory = new EthicalGateFactory();
      const gate = factory.createGate('test-ethical', context, data, options);
      
      expect(gate.type).toBe(WorkflowHumanGateType.ETHICAL);
      expect(gate.subtype).toBe('test-ethical');
      expect(gate.approvalConfig.approvers).toContain('ethics-officer');
    });
  });
});