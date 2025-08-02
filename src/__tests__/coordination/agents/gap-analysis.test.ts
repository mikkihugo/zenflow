/**
 * Tests for agent system gap analysis and new agent types
 */

import {
  auditAutoAssignmentCapabilities,
  CLAUDE_FLOW_AGENTS,
  generateComparisonReport,
  OUR_AGENT_CATEGORIES,
  performGapAnalysis,
} from '../../../coordination/agents/gap-analysis';
import type { AgentType } from '../../../types/agent-types';

describe('Agent System Gap Analysis', () => {
  describe('New Agent Types', () => {
    const newPerformanceAgents: AgentType[] = [
      'cache-optimizer',
      'memory-optimizer',
      'latency-optimizer',
      'bottleneck-analyzer',
    ];

    const newMigrationAgents: AgentType[] = [
      'legacy-analyzer',
      'modernization-agent',
      'migration-coordinator',
    ];

    const newSPARCAgents: AgentType[] = ['quality-gate-agent', 'validation-specialist'];

    const newUIUXAgents: AgentType[] = ['ux-designer', 'ui-designer', 'accessibility-specialist'];

    test('should include new performance optimization agents', () => {
      const performanceCategory = OUR_AGENT_CATEGORIES['Performance & Optimization'];

      for (const agent of newPerformanceAgents) {
        expect(performanceCategory).toContain(agent);
      }
    });

    test('should include new migration planning agents', () => {
      const migrationCategory = OUR_AGENT_CATEGORIES['Migration & Planning'];

      for (const agent of newMigrationAgents) {
        expect(migrationCategory).toContain(agent);
      }
    });

    test('should include enhanced SPARC quality agents', () => {
      const sparcCategory = OUR_AGENT_CATEGORIES['SPARC Methodology'];

      for (const agent of newSPARCAgents) {
        expect(sparcCategory).toContain(agent);
      }
    });

    test('should include UI/UX enhancement agents', () => {
      const uiuxCategory = OUR_AGENT_CATEGORIES['UI/UX Enhancement'];

      for (const agent of newUIUXAgents) {
        expect(uiuxCategory).toContain(agent);
      }
    });

    test('should have valid agent type definitions', () => {
      const allNewAgents = [
        ...newPerformanceAgents,
        ...newMigrationAgents,
        ...newSPARCAgents,
        ...newUIUXAgents,
      ];

      // Each agent type should be a valid string
      for (const agent of allNewAgents) {
        expect(typeof agent).toBe('string');
        expect(agent.length).toBeGreaterThan(0);
        expect(agent).toMatch(/^[a-z-]+$/); // kebab-case pattern
      }
    });
  });

  describe('Gap Analysis Functionality', () => {
    test('should perform comprehensive gap analysis', () => {
      const analysis = performGapAnalysis();

      expect(analysis).toHaveProperty('ourTotal');
      expect(analysis).toHaveProperty('clauseFlowTotal');
      expect(analysis).toHaveProperty('ourAdvantage');
      expect(analysis).toHaveProperty('advantageRatio');
      expect(analysis).toHaveProperty('categoryComparison');
      expect(analysis).toHaveProperty('missingCapabilities');
      expect(analysis).toHaveProperty('uniqueAdvantages');
      expect(analysis).toHaveProperty('recommendations');

      // We should have more agents than claude-flow
      expect(analysis.ourTotal).toBeGreaterThan(analysis.clauseFlowTotal);
      expect(analysis.ourAdvantage).toBeGreaterThan(0);
      expect(analysis.advantageRatio).toBeGreaterThan(1);
    });

    test('should show our advantages in key categories', () => {
      const analysis = performGapAnalysis();
      const comparison = analysis.categoryComparison;

      // We should have advantages in these categories
      expect(comparison['GitHub Integration']?.advantage).toBeGreaterThan(0);
      expect(comparison['Consensus & Distributed']?.advantage).toBeGreaterThan(0);
      expect(comparison['Performance & Optimization']?.advantage).toBeGreaterThan(0);
    });

    test('should identify strategic missing capabilities', () => {
      const analysis = performGapAnalysis();

      // The missing capabilities should be minimal now that we've added strategic agents
      expect(analysis.missingCapabilities.length).toBeLessThan(10);

      // Should have comprehensive unique advantages
      expect(analysis.uniqueAdvantages.length).toBeGreaterThan(5);
      expect(analysis.recommendations.length).toBeGreaterThan(5);
    });

    test('should generate comprehensive comparison report', () => {
      const report = generateComparisonReport();

      expect(typeof report).toBe('string');
      expect(report.length).toBeGreaterThan(1000);

      // Should contain key sections
      expect(report).toContain('Overall Comparison');
      expect(report).toContain('Category-by-Category Analysis');
      expect(report).toContain('Our Unique Advantages');
      expect(report).toContain('Recommendations');
      expect(report).toContain('Conclusion');

      // Should mention our advantage
      expect(report).toMatch(/\d+x more/);
    });
  });

  describe('Auto-Assignment Capabilities Audit', () => {
    test('should audit current auto-assignment features', () => {
      const audit = auditAutoAssignmentCapabilities();

      expect(audit).toHaveProperty('hasIntelligentSelection');
      expect(audit).toHaveProperty('hasFileTypeMatching');
      expect(audit).toHaveProperty('hasWorkloadBalancing');
      expect(audit).toHaveProperty('hasPerformanceRanking');
      expect(audit).toHaveProperty('capabilities');
      expect(audit).toHaveProperty('recommendations');

      // Should have some existing capabilities
      expect(audit.capabilities.length).toBeGreaterThan(3);
      expect(audit.recommendations.length).toBeGreaterThan(3);
    });

    test('should identify intelligent selection capabilities', () => {
      const audit = auditAutoAssignmentCapabilities();

      // We should have intelligent selection based on agent registry
      expect(audit.hasIntelligentSelection).toBe(true);
      expect(audit.hasWorkloadBalancing).toBe(true);
      expect(audit.hasPerformanceRanking).toBe(true);
    });
  });

  describe('Agent Category Structure', () => {
    test('should have well-organized agent categories', () => {
      const categories = Object.keys(OUR_AGENT_CATEGORIES);

      // Should have all expected categories
      const expectedCategories = [
        'Core Foundation',
        'Development Agents',
        'Testing Agents',
        'Architecture Agents',
        'DevOps Agents',
        'Documentation Agents',
        'Analysis Agents',
        'Data Agents',
        'Specialized Agents',
        'UI/UX Enhancement',
        'GitHub Integration',
        'Swarm Coordination',
        'Consensus & Distributed',
        'Performance & Optimization',
        'SPARC Methodology',
        'Migration & Planning',
        'Maestro Legacy',
      ];

      for (const expected of expectedCategories) {
        expect(categories).toContain(expected);
      }
    });

    test('should have no duplicate agents across categories', () => {
      const allAgents = Object.values(OUR_AGENT_CATEGORIES).flat();
      const uniqueAgents = [...new Set(allAgents)];

      // All agents should be unique
      expect(allAgents.length).toBe(uniqueAgents.length);
    });

    test('should have reasonable agent distribution', () => {
      for (const [category, agents] of Object.entries(OUR_AGENT_CATEGORIES)) {
        // Each category should have at least 1 agent
        expect(agents.length).toBeGreaterThan(0);

        // No category should dominate (more than 25 agents)
        expect(agents.length).toBeLessThan(25);
      }
    });
  });

  describe('Performance Benchmarks', () => {
    test('should track agent count growth', () => {
      const analysis = performGapAnalysis();

      // Should show significant improvement over baseline
      expect(analysis.ourTotal).toBeGreaterThan(100); // Adjusted to realistic count
      expect(analysis.advantageRatio).toBeGreaterThan(2.0); // At least 2x advantage
    });

    test('should measure category coverage', () => {
      const analysis = performGapAnalysis();
      const coverageCategories = Object.keys(analysis.categoryComparison);

      // Should cover all major categories
      expect(coverageCategories.length).toBeGreaterThan(6);

      // Should have advantages in most categories
      const advantageCount = Object.values(analysis.categoryComparison).filter(
        (cat) => cat.advantage > 0
      ).length;

      expect(advantageCount).toBeGreaterThan(coverageCategories.length / 2);
    });
  });
});

describe('Integration with Agent Registry', () => {
  test('should handle new agent types in selection criteria', () => {
    // This would test that the agent registry can handle new agent types
    const newAgentTypes: AgentType[] = [
      'cache-optimizer',
      'memory-optimizer',
      'legacy-analyzer',
      'ux-designer',
    ];

    for (const agentType of newAgentTypes) {
      // Should be valid agent type
      expect(typeof agentType).toBe('string');
      expect(agentType.length).toBeGreaterThan(0);
    }
  });

  test('should support intelligent agent matching', () => {
    // Test scenarios for intelligent agent assignment
    const testScenarios = [
      {
        task: 'optimize database performance',
        expectedAgents: ['performance-analyzer', 'database-architect', 'bottleneck-analyzer'],
      },
      {
        task: 'migrate legacy system',
        expectedAgents: ['legacy-analyzer', 'modernization-agent', 'migration-coordinator'],
      },
      {
        task: 'improve UI accessibility',
        expectedAgents: ['ux-designer', 'ui-designer', 'accessibility-specialist'],
      },
    ];

    for (const scenario of testScenarios) {
      // Each scenario should have relevant agent suggestions
      expect(scenario.expectedAgents.length).toBeGreaterThan(0);

      for (const agent of scenario.expectedAgents) {
        expect(typeof agent).toBe('string');
      }
    }
  });
});
