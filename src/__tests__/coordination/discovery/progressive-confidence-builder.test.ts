import { describe, it, expect, beforeEach, afterEach, vi, type Mocked } from 'vitest'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { ProgressiveConfidenceBuilder } from '../../../coordination/discovery/progressive-confidence-builder.ts';
import type { DomainDiscoveryBridge, DiscoveredDomain } from '../../../coordination/discovery/domain-discovery-bridge.ts';
import type { SessionMemoryStore } from '../../../memory/memory.ts';
import type { AGUIInterface } from '../../../interfaces/agui/agui-adapter.ts';

// Mock HiveFACT
vi.mock('../../../coordination/hive-fact-integration.ts', () => ({
  getHiveFACT: vi.fn(),
}));

import { getHiveFACT } from '../../../coordination/hive-fact-integration.ts';

// Helper function to create valid DiscoveredDomain test objects
const createTestDomain = (overrides: Partial<DiscoveredDomain> = {}): DiscoveredDomain => ({
  id: `domain-${Date.now()}`,
  name: 'test-domain',
  description: 'Test domain for unit testing',
  confidence: 0.5,
  documents: [],
  codeFiles: ['test.ts'],
  concepts: ['testing'],
  category: 'test',
  suggestedTopology: 'mesh',
  relatedDomains: [],
  suggestedAgents: [],
  ...overrides,
});

describe('ProgressiveConfidenceBuilder', () => {
  let builder: ProgressiveConfidenceBuilder;
  let mockDiscoveryBridge: Mocked<DomainDiscoveryBridge>;
  let mockMemoryStore: Mocked<SessionMemoryStore>;
  let mockAgui: Mocked<AGUIInterface>;
  let mockHiveFact: any;

  beforeEach(() => {
    // Create mocks
    mockDiscoveryBridge = {
      discoverDomains: vi.fn(),
      on: vi.fn(),
      emit: vi.fn(),
    } as any;

    mockMemoryStore = {
      store: vi.fn(),
      retrieve: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      search: vi.fn(),
    } as any;

    mockAgui = {
      askQuestion: vi.fn(),
      askBatchQuestions: vi.fn(),
      showProgress: vi.fn(),
      showMessage: vi.fn(),
    } as any;

    mockHiveFact = {
      searchFacts: vi.fn().mockResolvedValue([]),
    };

    (getHiveFACT as any).mockReturnValue(mockHiveFact);

    // Create builder instance
    builder = new ProgressiveConfidenceBuilder(mockDiscoveryBridge, mockMemoryStore, mockAgui, {
      targetConfidence: 0.8,
      maxIterations: 3,
      researchThreshold: 0.6,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('buildConfidence', () => {
    it('should build confidence through iterations', async () => {
      const context = {
        projectPath: '/test/project',
        existingDomains: [
          createTestDomain({
            name: 'auth',
            description: 'Authentication domain handling user login and JWT tokens',
            codeFiles: ['auth.ts', 'login.ts'],
            concepts: ['authentication', 'jwt'],
            category: 'security',
            suggestedTopology: 'hierarchical',
          }),
        ],
      };

      // Mock user responses
      mockAgui.askQuestion
        .mockResolvedValueOnce('skip') // Skip document import
        .mockResolvedValueOnce('Yes') // Validate domain boundary
        .mockResolvedValueOnce('1'); // Final approval

      mockAgui.askBatchQuestions.mockResolvedValue(['Yes']);

      // Mock research results
      mockHiveFact.searchFacts.mockResolvedValue([
        {
          id: 'fact1',
          type: 'npm-package',
          subject: 'jwt',
          content: { description: 'JSON Web Token implementation' },
          metadata: { source: 'npm', timestamp: Date.now(), confidence: 0.9 },
          accessCount: 10,
          swarmAccess: new Set(),
        },
      ]);

      const result = await builder.buildConfidence(context);

      expect(result?.domains.size).toBe(1);
      expect(result?.domains?.has('auth')).toBe(true);
      expect(result?.confidence?.overall).toBeGreaterThan(0);
      expect(result?.learningHistory.length).toBeGreaterThan(0);
    });

    it('should emit progress events during iterations', async () => {
      const progressEvents: any[] = [];
      builder.on('progress', (event) => progressEvents.push(event));

      const context = {
        projectPath: '/test/project',
      };

      mockAgui.askQuestion.mockResolvedValue('skip');
      mockAgui.askBatchQuestions.mockResolvedValue([]);

      await builder.buildConfidence(context);

      expect(progressEvents.length).toBeGreaterThan(0);
      expect(progressEvents[0]).toHaveProperty('iteration');
      expect(progressEvents[0]).toHaveProperty('confidence');
      expect(progressEvents[0]).toHaveProperty('metrics');
    });

    it('should perform online research when confidence is low', async () => {
      const context = {
        projectPath: '/test/project',
        existingDomains: [
          createTestDomain({
            name: 'payment',
            confidence: 0.3, // Low confidence
            codeFiles: ['payment.ts'],
            concepts: ['stripe', 'payment processing'],
            category: 'business',
          }),
        ],
      };

      mockAgui.askQuestion.mockResolvedValue('skip');
      mockAgui.askBatchQuestions.mockResolvedValue([]);

      await builder.buildConfidence(context);

      expect(mockHiveFact.searchFacts).toHaveBeenCalled();
      expect(mockHiveFact.searchFacts).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.stringContaining('payment'),
        })
      );
    });

    it('should persist learning to memory store', async () => {
      const context = {
        projectPath: '/test/project',
      };

      mockAgui.askQuestion.mockResolvedValue('skip');
      mockAgui.askBatchQuestions.mockResolvedValue([]);

      await builder.buildConfidence(context);

      expect(mockMemoryStore.store).toHaveBeenCalledWith(
        expect.stringContaining('learning-history'),
        'progressive-confidence',
        expect.objectContaining({
          history: expect.any(Array),
          iteration: expect.any(Number),
          confidence: expect.any(Number),
          metrics: expect.any(Object),
        })
      );
    });

    it('should handle errors gracefully', async () => {
      const context = {
        projectPath: '/test/project',
      };

      // Make askQuestion throw an error
      mockAgui.askQuestion.mockRejectedValueOnce(new Error('User cancelled'));
      mockAgui.askQuestion.mockResolvedValue('skip'); // Subsequent calls succeed

      const result = await builder.buildConfidence(context);

      // Should still return a result despite error
      expect(result).toBeDefined();
      expect(result?.confidence?.overall).toBeLessThan(0.8); // Confidence reduced due to error
    });
  });

  describe('validation handling', () => {
    it('should generate appropriate validation questions', async () => {
      const context = {
        projectPath: '/test/project',
        existingDomains: [
          createTestDomain({
            name: 'unclear-domain',
            codeFiles: ['file1.ts', 'file2.ts'],
            confidence: 0.4,
            concepts: ['concept1', 'concept2'],
            relatedDomains: [],
          }),
        ],
      };

      mockAgui.askQuestion.mockResolvedValue('skip');

      // Capture the questions asked
      const askedQuestions: any[] = [];
      mockAgui.askBatchQuestions.mockImplementation(async (questions) => {
        askedQuestions.push(...questions);
        return questions.map(() => 'Yes');
      });

      await builder.buildConfidence(context);

      expect(askedQuestions.length).toBeGreaterThan(0);
      expect(askedQuestions[0]).toHaveProperty('type');
      expect(askedQuestions[0]).toHaveProperty('question');
      expect(askedQuestions[0]?.question).toContain('unclear-domain');
    });

    it('should update confidence based on validation responses', async () => {
      const context = {
        projectPath: '/test/project',
        existingDomains: [
          createTestDomain({
            name: 'test-domain',
            codeFiles: ['test.ts'],
            confidence: 0.5,
            concepts: ['testing'],
            relatedDomains: [],
          }),
        ],
      };

      mockAgui.askQuestion.mockResolvedValue('skip');

      // First response negative, then positive
      mockAgui.askBatchQuestions
        .mockResolvedValueOnce(['No - needs adjustment'])
        .mockResolvedValueOnce(['Yes']);

      const result = await builder.buildConfidence(context);

      // Check that validations were recorded
      const domain = result?.domains?.get('test-domain');
      expect(domain?.validations.length).toBeGreaterThan(0);
    });
  });

  describe('research integration', () => {
    it('should generate relevant research queries', async () => {
      const context = {
        projectPath: '/test/project',
        existingDomains: [
          createTestDomain({
            name: 'graphql-api',
            codeFiles: ['schema.graphql', 'resolvers.ts'],
            confidence: 0.4,
            concepts: ['graphql', 'api', 'schema'],
            relatedDomains: [],
          }),
        ],
      };

      mockAgui.askQuestion.mockResolvedValue('skip');
      mockAgui.askBatchQuestions.mockResolvedValue([]);

      const searchQueries: string[] = [];
      mockHiveFact.searchFacts.mockImplementation(async ({ query }: { query: string }) => {
        searchQueries.push(query);
        return [];
      });

      await builder.buildConfidence(context);

      expect(searchQueries.length).toBeGreaterThan(0);
      expect(searchQueries.some((q) => q.includes('graphql'))).toBe(true);
      expect(searchQueries.some((q) => q.includes('best practices'))).toBe(true);
    });

    it('should extract insights from research results', async () => {
      const context = {
        projectPath: '/test/project',
        existingDomains: [
          createTestDomain({
            name: 'security',
            codeFiles: ['auth.ts'],
            confidence: 0.3,
            concepts: ['authentication', 'security'],
            relatedDomains: [],
          }),
        ],
      };

      mockAgui.askQuestion.mockResolvedValue('skip');
      mockAgui.askBatchQuestions.mockResolvedValue([]);

      mockHiveFact.searchFacts.mockResolvedValue([
        {
          id: 'fact1',
          type: 'security-advisory',
          subject: 'jwt-security',
          content: 'Always validate JWT signatures and check expiration',
          metadata: { source: 'security-db', timestamp: Date.now(), confidence: 0.95 },
          accessCount: 100,
          swarmAccess: new Set(),
        },
      ]);

      const result = await builder.buildConfidence(context);

      const securityDomain = result?.domains?.get('security');
      expect(securityDomain?.research.length).toBeGreaterThan(0);
      expect(securityDomain?.research[0]?.insights?.length).toBeGreaterThan(0);
    });
  });

  describe('confidence metrics', () => {
    it('should calculate comprehensive confidence metrics', async () => {
      const context = {
        projectPath: '/test/project',
        existingDomains: [
          createTestDomain({
            name: 'domain1',
            codeFiles: ['file1.ts'],
            confidence: 0.6,
            concepts: ['concept1'],
            relatedDomains: [],
          }),
        ],
      };

      mockAgui.askQuestion.mockResolvedValue('skip');
      mockAgui.askBatchQuestions.mockResolvedValue(['Yes', 'Yes']);

      const result = await builder.buildConfidence(context);

      expect(result?.confidence).toHaveProperty('overall');
      expect(result?.confidence).toHaveProperty('documentCoverage');
      expect(result?.confidence).toHaveProperty('humanValidations');
      expect(result?.confidence).toHaveProperty('researchDepth');
      expect(result?.confidence).toHaveProperty('domainClarity');
      expect(result?.confidence).toHaveProperty('consistency');

      // All metrics should be between 0 and 1
      Object.values(result?.confidence).forEach((metric) => {
        expect(metric).toBeGreaterThanOrEqual(0);
        expect(metric).toBeLessThanOrEqual(1);
      });
    });

    it('should improve confidence through iterations', async () => {
      const context = {
        projectPath: '/test/project',
        existingDomains: [
          createTestDomain({
            name: 'improving-domain',
            codeFiles: ['file1.ts'],
            confidence: 0.2,
            concepts: ['concept1'],
            relatedDomains: [],
          }),
        ],
      };

      const progressEvents: any[] = [];
      builder.on('progress', (event) => progressEvents.push(event));

      mockAgui.askQuestion.mockResolvedValue('skip');
      mockAgui.askBatchQuestions.mockResolvedValue(['Yes']);
      mockHiveFact.searchFacts.mockResolvedValue([
        {
          id: 'fact1',
          type: 'general',
          subject: 'concept1',
          content: 'Useful information',
          metadata: { source: 'test', timestamp: Date.now(), confidence: 0.8 },
          accessCount: 5,
          swarmAccess: new Set(),
        },
      ]);

      await builder.buildConfidence(context);

      // Check that confidence improved over iterations
      if (progressEvents.length >= 2) {
        expect(progressEvents[progressEvents.length - 1]?.confidence).toBeGreaterThan(
          progressEvents[0]?.confidence
        );
      }
    });
  });

  describe('domain relationships', () => {
    it('should detect relationships between domains', async () => {
      const context = {
        projectPath: '/test/project',
        existingDomains: [
          createTestDomain({
            name: 'frontend',
            codeFiles: ['app.tsx'],
            confidence: 0.6,
            concepts: ['react', 'ui', 'api-client'],
            relatedDomains: [],
          }),
          createTestDomain({
            name: 'backend',
            codeFiles: ['server.ts'],
            confidence: 0.6,
            concepts: ['express', 'api', 'api-client'],
            relatedDomains: [],
          }),
        ],
      };

      mockAgui.askQuestion.mockResolvedValue('skip');
      mockAgui.askBatchQuestions.mockResolvedValue([]);

      const result = await builder.buildConfidence(context);

      expect(result?.relationships.length).toBeGreaterThan(0);
      expect(result?.relationships?.[0]).toHaveProperty('sourceDomain');
      expect(result?.relationships?.[0]).toHaveProperty('targetDomain');
      expect(result?.relationships?.[0]).toHaveProperty('type');
      expect(result?.relationships?.[0]?.evidence).toContain('api-client');
    });
  });

  describe('validation checkpoints', () => {
    it('should trigger checkpoint validations at configured thresholds', async () => {
      const checkpointQuestions: any[] = [];

      const builder = new ProgressiveConfidenceBuilder(
        mockDiscoveryBridge,
        mockMemoryStore,
        mockAgui,
        {
          targetConfidence: 0.8,
          maxIterations: 5,
          validationCheckpoints: [0.3, 0.5, 0.7],
          requireHumanApprovalAt: [0.5],
        }
      );

      const context = {
        projectPath: '/test/project',
        validatorId: 'test-validator',
        sessionId: 'test-session',
      };

      mockAgui.askQuestion.mockImplementation(async (question) => {
        if (question.type === 'checkpoint') {
          checkpointQuestions.push(question);
          return 'Continue';
        }
        return 'skip';
      });

      mockAgui.askBatchQuestions.mockResolvedValue(['Yes']);

      await builder.buildConfidence(context);

      // Should have triggered checkpoint questions
      expect(checkpointQuestions.length).toBeGreaterThan(0);
      expect(checkpointQuestions.some((q) => q.priority === 'critical')).toBe(true);
    });

    it('should allow domain review at checkpoints', async () => {
      let reviewTriggered = false;

      const context = {
        projectPath: '/test/project',
        existingDomains: [
          createTestDomain({
            name: 'test-domain',
            codeFiles: ['test.ts'],
            confidence: 0.3,
            concepts: ['testing'],
            relatedDomains: [],
          }),
        ],
      };

      mockAgui.askQuestion.mockImplementation(async (question) => {
        if (question.type === 'checkpoint' && !reviewTriggered) {
          reviewTriggered = true;
          return 'Review domains';
        }
        return 'Continue';
      });

      mockAgui.askBatchQuestions.mockResolvedValue([]);
      mockAgui.showMessage.mockResolvedValue(undefined);

      await builder.buildConfidence(context);

      // Should have shown domain review
      expect(mockAgui.showMessage).toHaveBeenCalledWith(
        expect.stringContaining('Domain Review'),
        'info'
      );
    });
  });

  describe('validation audit trail', () => {
    it('should track validation history with detailed metadata', async () => {
      const context = {
        projectPath: '/test/project',
        validatorId: 'test-validator-123',
        sessionId: 'session-456',
        existingDomains: [
          createTestDomain({
            name: 'audit-test',
            codeFiles: ['audit.ts'],
            confidence: 0.4,
            concepts: ['auditing'],
            relatedDomains: [],
          }),
        ],
      };

      mockAgui.askQuestion.mockResolvedValue('skip');
      mockAgui.askBatchQuestions.mockResolvedValue(['Yes', 'Correct']);

      const result = await builder.buildConfidence(context);

      // Check that validations include new metadata
      const domain = result?.domains?.get('audit-test');
      expect(domain?.validations.length).toBeGreaterThan(0);

      const validation = domain?.validations[0];
      expect(validation).toHaveProperty('validationType');
      expect(validation).toHaveProperty('confidenceBefore');
      expect(validation).toHaveProperty('confidenceAfter');
    });

    it('should persist audit trail to memory store', async () => {
      const builder = new ProgressiveConfidenceBuilder(
        mockDiscoveryBridge,
        mockMemoryStore,
        mockAgui,
        {
          targetConfidence: 0.8,
          enableDetailedAuditTrail: true,
        }
      );

      const context = {
        projectPath: '/test/project',
        validatorId: 'auditor-1',
      };

      mockAgui.askQuestion.mockResolvedValue('skip');
      mockAgui.askBatchQuestions.mockResolvedValue([]);

      await builder.buildConfidence(context);

      // Should have stored audit trail
      expect(mockMemoryStore.store).toHaveBeenCalledWith(
        expect.stringContaining('audit-trail'),
        'validation-audit',
        expect.objectContaining({
          sessionId: expect.any(String),
          auditTrail: expect.any(Array),
        })
      );
    });
  });

  describe('minimum validation requirements', () => {
    it('should ensure minimum validations per domain', async () => {
      const additionalQuestions: any[] = [];

      const builder = new ProgressiveConfidenceBuilder(
        mockDiscoveryBridge,
        mockMemoryStore,
        mockAgui,
        {
          targetConfidence: 0.8,
          minimumValidationsPerDomain: 3,
          maxIterations: 2,
        }
      );

      const context = {
        projectPath: '/test/project',
        existingDomains: [
          createTestDomain({
            name: 'under-validated',
            codeFiles: ['under.ts'],
            confidence: 0.5,
            concepts: ['validation'],
            relatedDomains: [],
          }),
        ],
      };

      mockAgui.askQuestion.mockImplementation(async (question) => {
        if (
          question.type === 'review' &&
          question.validationReason === 'Minimum validation requirement'
        ) {
          additionalQuestions.push(question);
          return "Yes, it's correct";
        }
        return 'skip';
      });

      mockAgui.askBatchQuestions.mockResolvedValue(['Yes']);

      await builder.buildConfidence(context);

      // Should have asked additional questions for under-validated domains
      expect(additionalQuestions.length).toBeGreaterThan(0);
      expect(additionalQuestions[0]?.priority).toBe('high');
    });
  });

  describe('confidence impact calculation', () => {
    it('should calculate different impacts based on question type and response', async () => {
      const context = {
        projectPath: '/test/project',
        existingDomains: [
          createTestDomain({
            name: 'impact-test',
            codeFiles: ['impact.ts'],
            confidence: 0.5,
            concepts: ['testing'],
            relatedDomains: [],
          }),
        ],
      };

      const progressEvents: any[] = [];
      builder.on('progress', (event) => progressEvents.push(event));

      mockAgui.askQuestion.mockResolvedValue('skip');

      // Test different response types
      mockAgui.askBatchQuestions
        .mockResolvedValueOnce(['Yes']) // Positive response
        .mockResolvedValueOnce(['No, incorrect']) // Negative response
        .mockResolvedValueOnce(['Maybe']); // Neutral response

      await builder.buildConfidence(context);

      // Check that confidence changed based on responses
      const confidenceChanges = progressEvents.map((e) => e.confidence);
      expect(confidenceChanges.some((c, i) => i > 0 && c !== confidenceChanges[i - 1])).toBe(true);
    });
  });

  describe('final validation', () => {
    it('should perform final validation when target confidence is reached', async () => {
      const context = {
        projectPath: '/test/project',
        existingDomains: [
          createTestDomain({
            name: 'high-confidence',
            codeFiles: ['file1.ts'],
            confidence: 0.9,
            concepts: ['concept1'],
            relatedDomains: [],
          }),
        ],
      };

      // Set initial confidence high to trigger final validation
      (builder as any).confidence = 0.85;

      const finalQuestions: any[] = [];
      mockAgui.askQuestion.mockImplementation(async (question) => {
        if (question.id === 'final_validation') {
          finalQuestions.push(question);
          return '1'; // Approve
        }
        return 'skip';
      });

      await builder.buildConfidence(context);

      expect(finalQuestions.length).toBe(1);
      expect(finalQuestions[0]?.question).toContain('Approve and proceed');
    });

    it('should allow continuing iterations if requested', async () => {
      const context = {
        projectPath: '/test/project',
        existingDomains: [
          createTestDomain({
            name: 'test',
            codeFiles: ['test.ts'],
            confidence: 0.8,
            concepts: ['testing'],
            relatedDomains: [],
          }),
        ],
      };

      (builder as any).confidence = 0.81;

      let iterationCount = 0;
      mockAgui.askQuestion.mockImplementation(async (question) => {
        if (question.id === 'final_validation' && iterationCount === 0) {
          iterationCount++;
          return '2'; // Request more iterations
        }
        return 'skip';
      });

      mockAgui.askBatchQuestions.mockResolvedValue([]);

      await builder.buildConfidence(context);

      // Should have continued beyond initial max iterations
      expect((builder as any).iteration).toBeGreaterThan(1);
    });
  });
});
