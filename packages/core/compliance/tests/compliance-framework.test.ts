import { describe, it, expect, beforeEach } from 'vitest';
import { ComplianceFramework, createTestComplianceConfig, AIRiskCategory } from '../src/index.js';

describe('ComplianceFramework', () => {
  let compliance: ComplianceFramework;

  beforeEach(() => {
    compliance = new ComplianceFramework(createTestComplianceConfig());
  });

  describe('System Registration', () => {
    it('should register an AI system successfully', async () => {
      const systemId = 'test-system-1';
      const purpose = {
        primary: 'Multi-agent task coordination',
        useCases: ['task allocation', 'resource optimization'],
        targetUsers: ['enterprise users'],
        context: 'enterprise platform'
      };

      const result = await compliance.registerSystem(systemId, purpose);

      expect(result.registrationId).toBeDefined();
      expect(result.riskCategory).toBeDefined();
      expect(result.complianceRequirements).toBeInstanceOf(Array);
    });

    it('should classify multi-agent systems as high-risk', async () => {
      const systemId = 'multi-agent-system';
      const purpose = {
        primary: 'Autonomous multi-agent coordination and decision making',
        useCases: ['agent orchestration', 'automated workflow', 'resource allocation'],
        targetUsers: ['enterprise users'],
        context: 'critical business operations'
      };

      const result = await compliance.registerSystem(systemId, purpose);

      expect(result.riskCategory).toBe(AIRiskCategory.HIGH);
      expect(result.complianceRequirements).toContain('Human oversight implementation');
    });

    it('should classify simple chatbots as limited risk', async () => {
      const systemId = 'simple-chatbot';
      const purpose = {
        primary: 'User interaction and information retrieval',
        useCases: ['customer support', 'FAQ responses'],
        targetUsers: ['website visitors'],
        context: 'customer service'
      };

      const result = await compliance.registerSystem(systemId, purpose);

      expect(result.riskCategory).toBe(AIRiskCategory.LIMITED);
      expect(result.complianceRequirements).toContain('Transparency obligations');
    });
  });

  describe('Decision Monitoring', () => {
    beforeEach(async () => {
      const purpose = {
        primary: 'Multi-agent task coordination',
        useCases: ['task allocation'],
        targetUsers: ['enterprise users'],
        context: 'enterprise platform'
      };
      await compliance.registerSystem('test-system', purpose);
    });

    it('should monitor AI decisions and record audit trail', async () => {
      const decision = {
        id: 'decision-123',
        type: 'task_allocation',
        details: { assignedAgent: 'worker-001' },
        confidence: 0.85,
        reasoning: 'Best capability match',
        inputData: { task: 'data_analysis' }
      };

      const result = await compliance.monitorDecision('test-system', decision);

      expect(result.complianceChecks.auditRecorded).toBe(true);
      expect(result.recommendations).toBeInstanceOf(Array);
    });

    it('should require human oversight for high-risk decisions', async () => {
      // Register with oversight enabled
      const oversightConfig = {
        ...createTestComplianceConfig(),
        humanOversightConfig: {
          enabled: true,
          requiredForHighRisk: true,
          maxReviewTimeHours: 24
        }
      };
      const complianceWithOversight = new ComplianceFramework(oversightConfig);
      
      const purpose = {
        primary: 'Critical autonomous decision making',
        useCases: ['autonomous decisions', 'critical infrastructure'],
        targetUsers: ['enterprise users'],
        context: 'critical business operations'
      };
      await complianceWithOversight.registerSystem('critical-system', purpose);

      const decision = {
        id: 'critical-decision-456',
        type: 'critical_allocation',
        details: { impact: 'high' },
        confidence: 0.6, // Low confidence triggers oversight
        reasoning: 'Uncertain decision',
        inputData: { riskLevel: 'high' }
      };

      const result = await complianceWithOversight.monitorDecision('critical-system', decision);

      expect(result.complianceChecks.humanOversightRequired).toBe(true);
      expect(result.oversightRequestId).toBeDefined();
    });
  });

  describe('Compliance Status', () => {
    it('should return overall compliance status', async () => {
      const status = await compliance.getOverallComplianceStatus();

      expect(status.overallScore).toBeGreaterThanOrEqual(0);
      expect(status.overallScore).toBeLessThanOrEqual(100);
      expect(status.euAiAct).toBeDefined();
      expect(status.gdpr).toBeDefined();
      expect(status.riskAssessment).toBeDefined();
      expect(status.humanOversight).toBeDefined();
      expect(status.auditTrail).toBeDefined();
    });

    it('should return system-specific compliance status', async () => {
      const systemId = 'test-system-status';
      const purpose = {
        primary: 'Test system for status checking',
        useCases: ['testing'],
        targetUsers: ['testers'],
        context: 'test environment'
      };

      await compliance.registerSystem(systemId, purpose);
      const status = await compliance.getSystemComplianceStatus(systemId);

      expect(status.overallScore).toBeGreaterThanOrEqual(0);
      expect(status.riskAssessment.completed).toBe(true);
      expect(status.riskAssessment.category).toBeDefined();
    });

    it('should return non-compliant status for unregistered systems', async () => {
      const status = await compliance.getSystemComplianceStatus('unregistered-system');

      expect(status.overallScore).toBe(0);
      expect(status.riskAssessment.completed).toBe(false);
      expect(status.euAiAct.compliant).toBe(false);
    });
  });

  describe('Compliance Reporting', () => {
    beforeEach(async () => {
      const purpose = {
        primary: 'Test system for reporting',
        useCases: ['testing'],
        targetUsers: ['testers'],
        context: 'test environment'
      };
      await compliance.registerSystem('report-test-system', purpose);
    });

    it('should generate compliance report', async () => {
      const report = await compliance.generateComplianceReport('report-test-system');

      expect(report.reportId).toBeDefined();
      expect(report.generatedAt).toBeInstanceOf(Date);
      expect(report.scope).toContain('report-test-system');
      expect(report.overallStatus).toBeDefined();
      expect(report.recommendations).toBeInstanceOf(Array);
    });

    it('should export compliance data', async () => {
      const exportData = await compliance.exportComplianceData('report-test-system', 'json');

      expect(typeof exportData).toBe('string');
      expect(() => JSON.parse(exportData)).not.toThrow();
    });
  });

  describe('Risk Assessment', () => {
    it('should identify prohibited practices', async () => {
      const purpose = {
        primary: 'Subliminal manipulation of user behavior',
        useCases: ['subliminal manipulation', 'cognitive vulnerability exploitation'],
        targetUsers: ['vulnerable users'],
        context: 'manipulation system'
      };

      const result = await compliance.registerSystem('prohibited-system', purpose);

      expect(result.riskCategory).toBe(AIRiskCategory.UNACCEPTABLE);
      expect(result.complianceRequirements).toContain('System prohibition');
    });

    it('should handle minimal risk systems', async () => {
      const purpose = {
        primary: 'Simple data processing',
        useCases: ['data formatting', 'basic calculations'],
        targetUsers: ['internal users'],
        context: 'internal tool'
      };

      const result = await compliance.registerSystem('minimal-risk-system', purpose);

      expect(result.riskCategory).toBe(AIRiskCategory.MINIMAL);
      expect(result.complianceRequirements).toContain('Voluntary compliance');
    });
  });
});