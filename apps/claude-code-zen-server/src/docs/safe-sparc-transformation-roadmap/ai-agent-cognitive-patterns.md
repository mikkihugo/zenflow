# AI Agent Cognitive Patterns Specification

**Detailed cognitive pattern specifications for all SAFe role AI agents**

## 📋 Overview

Each AI agent in the SAFe-SPARC transformation is designed with specialized cognitive patterns that define their decision-making processes, learning mechanisms, and behavioral characteristics. These patterns are implemented using @claude-zen/brain package capabilities and provide the foundation for autonomous operation with human oversight.

## 🧠 Cognitive Pattern Architecture

### Base Cognitive Pattern Structure

```typescript
interface CognitivePattern {
  name: string;
  type: CognitiveType;
  specialization: SpecializationArea;
  capabilities: string[];
  decisionFrameworks: DecisionFramework[];
  learningMechanisms: LearningMechanism[];
  collaborationPatterns: CollaborationPattern[];
  humanOversightTriggers: OversightTrigger[];
  performanceMetrics: PerformanceMetric[];
  adaptationStrategies: AdaptationStrategy[];
}

enum CognitiveType {
  STRATEGIC_FINANCIAL = 'strategic-financial',
  TACTICAL_OPERATIONAL = 'tactical-operational', 
  ANALYTICAL_INSIGHTS = 'analytical-insights',
  CREATIVE_INNOVATION = 'creative-innovation',
  FACILITATIVE_COACHING = 'facilitative-coaching',
  TECHNICAL_ARCHITECTURAL = 'technical-architectural',
  PROCESS_OPTIMIZATION = 'process-optimization'
}
```

## 1. Portfolio Level Cognitive Patterns

### 1.1 Lean Portfolio Manager Cognitive Pattern

```typescript
export const LeanPortfolioManagerCognitive: CognitivePattern = {
  name: 'StrategicPortfolioInvestment',
  type: CognitiveType.STRATEGIC_FINANCIAL,
  specialization: 'investment-strategy-optimization',
  
  capabilities: [
    'strategic-vision-synthesis',
    'market-opportunity-evaluation',
    'financial-modeling-and-analysis',
    'risk-assessment-and-mitigation',
    'value-stream-optimization',
    'competitive-intelligence-processing',
    'stakeholder-alignment-orchestration',
    'portfolio-performance-prediction',
    'regulatory-compliance-evaluation',
    'technology-investment-analysis'
  ],
  
  decisionFrameworks: [
    {
      name: 'PortfolioInvestmentMatrix',
      criteria: [
        { name: 'strategic-alignment', weight: 0.25, threshold: 0.8 },
        { name: 'market-potential', weight: 0.20, threshold: 0.7 },
        { name: 'financial-return', weight: 0.20, threshold: 0.6 },
        { name: 'technical-feasibility', weight: 0.15, threshold: 0.7 },
        { name: 'competitive-advantage', weight: 0.10, threshold: 0.6 },
        { name: 'risk-level', weight: 0.10, threshold: 'acceptable' }
      ],
      approvalThreshold: 0.75,
      humanOversightRequired: true
    },
    {
      name: 'LeanBudgetAllocation',
      principles: [
        'value-stream-funding-over-project-funding',
        'participatory-budgeting-with-guardrails', 
        'dynamic-reallocation-based-on-outcomes',
        'investment-theme-alignment-verification'
      ],
      allocationStrategies: [
        'portfolio-kanban-flow-based',
        'epic-hypothesis-driven',
        'market-feedback-responsive'
      ]
    }
  ],
  
  learningMechanisms: [
    {
      type: 'outcome-based-learning',
      sources: ['investment-performance', 'market-feedback', 'competitive-response'],
      adaptationRate: 0.1,
      confidenceThreshold: 0.8
    },
    {
      type: 'pattern-recognition',
      patterns: ['market-trend-correlation', 'investment-success-indicators', 'risk-realization-patterns'],
      historicalDataWeight: 0.3,
      recentDataWeight: 0.7
    },
    {
      type: 'collaborative-learning',
      sources: ['peer-portfolio-managers', 'market-analysts', 'customer-success-teams'],
      knowledgeSharing: true,
      consensusWeighting: true
    }
  ],
  
  collaborationPatterns: [
    {
      role: 'epic-owner',
      interaction: 'investment-approval-and-guidance',
      frequency: 'as-needed',
      decisionSupport: true
    },
    {
      role: 'solution-management',
      interaction: 'market-intelligence-sharing',
      frequency: 'weekly',
      informationExchange: true
    },
    {
      role: 'enterprise-architect',
      interaction: 'technology-strategy-alignment',
      frequency: 'monthly',
      strategicPlanning: true
    }
  ],
  
  humanOversightTriggers: [
    {
      trigger: 'investment-amount-threshold',
      threshold: 1000000, // $1M
      severity: 'mandatory',
      escalationTime: '24-hours'
    },
    {
      trigger: 'strategic-direction-change',
      threshold: 'any',
      severity: 'mandatory',
      escalationTime: 'immediate'
    },
    {
      trigger: 'risk-level-elevation',
      threshold: 'high',
      severity: 'recommended',
      escalationTime: '4-hours'
    }
  ],
  
  performanceMetrics: [
    'portfolio-roi-achievement',
    'strategic-theme-alignment-score',
    'investment-prediction-accuracy',
    'risk-mitigation-effectiveness',
    'stakeholder-satisfaction-rating',
    'time-to-market-improvement',
    'competitive-position-enhancement'
  ],
  
  adaptationStrategies: [
    {
      strategy: 'market-responsive-adjustment',
      triggers: ['market-condition-change', 'competitive-landscape-shift'],
      adaptationSpeed: 'fast',
      learningIntegration: true
    },
    {
      strategy: 'performance-based-optimization',
      triggers: ['kpi-underperformance', 'efficiency-opportunities'],
      adaptationSpeed: 'moderate',
      continuousImprovement: true
    }
  ]
};
```

### 1.2 Epic Owner Cognitive Pattern

```typescript
export const EpicOwnerCognitive: CognitivePattern = {
  name: 'EpicStrategyExecution',
  type: CognitiveType.TACTICAL_OPERATIONAL,
  specialization: 'epic-value-delivery-optimization',
  
  capabilities: [
    'business-case-development-and-validation',
    'market-timing-analysis-and-optimization',
    'feature-prioritization-using-value-metrics',
    'stakeholder-alignment-and-communication',
    'value-hypothesis-creation-and-testing',
    'competitive-positioning-strategy',
    'technical-feasibility-assessment',
    'resource-optimization-and-allocation',
    'timeline-management-and-optimization',
    'cross-epic-dependency-coordination'
  ],
  
  decisionFrameworks: [
    {
      name: 'EpicValuePrioritization',
      methodology: 'weighted-shortest-job-first',
      factors: [
        { name: 'business-value', weight: 0.3 },
        { name: 'time-criticality', weight: 0.25 },
        { name: 'risk-reduction-opportunity', weight: 0.25 },
        { name: 'job-size-estimate', weight: 0.2 }
      ],
      recalculationFrequency: 'bi-weekly'
    },
    {
      name: 'FeatureSequencingOptimization',
      principles: [
        'minimum-viable-product-first',
        'customer-feedback-integration-loops',
        'technical-dependency-minimization',
        'early-value-delivery-maximization'
      ],
      constraints: [
        'team-capacity-limits',
        'technical-architecture-dependencies',
        'market-timing-windows'
      ]
    }
  ],
  
  learningMechanisms: [
    {
      type: 'customer-feedback-integration',
      sources: ['user-analytics', 'customer-interviews', 'market-research'],
      adaptationRate: 0.15,
      validationThreshold: 0.7
    },
    {
      type: 'feature-performance-analysis',
      metrics: ['adoption-rates', 'user-engagement', 'business-impact'],
      historicalComparison: true,
      trendAnalysis: true
    },
    {
      type: 'cross-epic-learning',
      knowledgeSharing: 'epic-owner-community',
      bestPracticeExtraction: true,
      antiPatternIdentification: true
    }
  ],
  
  collaborationPatterns: [
    {
      role: 'product-owner',
      interaction: 'feature-definition-and-prioritization',
      frequency: 'daily',
      realTimeCoordination: true
    },
    {
      role: 'system-architect',
      interaction: 'technical-architecture-alignment',
      frequency: 'weekly',
      technicalGuidance: true
    },
    {
      role: 'scrum-master',
      interaction: 'impediment-resolution-and-team-support',
      frequency: 'as-needed',
      processOptimization: true
    }
  ],
  
  humanOversightTriggers: [
    {
      trigger: 'epic-scope-change-significant',
      threshold: '25%',
      severity: 'recommended',
      escalationTime: '48-hours'
    },
    {
      trigger: 'business-case-invalidation',
      threshold: 'any-invalidation',
      severity: 'mandatory',
      escalationTime: 'immediate'
    },
    {
      trigger: 'customer-feedback-negative-trend',
      threshold: 'satisfaction-below-3.0',
      severity: 'recommended',
      escalationTime: '24-hours'
    }
  ]
};
```

## 2. Program Level Cognitive Patterns

### 2.1 Release Train Engineer Cognitive Pattern

```typescript
export const ReleaseTrainEngineerCognitive: CognitivePattern = {
  name: 'AgileProgramCoordination',
  type: CognitiveType.PROCESS_OPTIMIZATION,
  specialization: 'agile-release-train-optimization',
  
  capabilities: [
    'pi-planning-orchestration-and-optimization',
    'cross-team-dependency-resolution',
    'agile-process-coaching-and-improvement',
    'impediment-identification-and-escalation',
    'flow-metrics-analysis-and-optimization',
    'team-performance-coaching',
    'safe-practice-implementation-and-evolution',
    'stakeholder-communication-and-alignment',
    'risk-identification-and-mitigation-planning',
    'continuous-improvement-facilitation'
  ],
  
  decisionFrameworks: [
    {
      name: 'PIObjectiveOptimization',
      approach: 'team-capacity-and-dependency-balanced',
      optimizationCriteria: [
        { name: 'team-capacity-utilization', target: 0.8, tolerance: 0.1 },
        { name: 'cross-team-dependency-minimization', target: 'minimal', priority: 'high' },
        { name: 'business-value-maximization', weighting: 'wsjf-based' },
        { name: 'risk-distribution', strategy: 'spread-across-teams' }
      ]
    },
    {
      name: 'ImpedimentResolutionPrioritization',
      escalationMatrix: [
        { level: 'team-level', timeThreshold: '24-hours', autoEscalation: false },
        { level: 'program-level', timeThreshold: '48-hours', autoEscalation: true },
        { level: 'portfolio-level', timeThreshold: '72-hours', autoEscalation: true }
      ],
      impactAssessment: 'velocity-and-quality-impact-analysis'
    }
  ],
  
  learningMechanisms: [
    {
      type: 'retrospective-pattern-analysis',
      sources: ['team-retrospectives', 'program-retrospectives', 'inspect-and-adapt'],
      patternRecognition: true,
      improvementSuggestionGeneration: true
    },
    {
      type: 'flow-metrics-optimization',
      metrics: ['lead-time', 'cycle-time', 'throughput', 'flow-efficiency'],
      bottleneckIdentification: true,
      optimizationRecommendations: true
    },
    {
      type: 'coaching-effectiveness-learning',
      feedbackSources: ['team-members', 'product-owners', 'scrum-masters'],
      coachingStyleAdaptation: true,
      individualizedApproaches: true
    }
  ],
  
  humanOversightTriggers: [
    {
      trigger: 'program-level-impediment-unresolved',
      threshold: '72-hours',
      severity: 'mandatory',
      escalationTime: 'immediate'
    },
    {
      trigger: 'team-velocity-significant-decline',
      threshold: '20%-decline-over-2-sprints',
      severity: 'recommended',
      escalationTime: '24-hours'
    }
  ]
};
```

### 2.2 Product Manager Cognitive Pattern

```typescript
export const ProductManagerCognitive: CognitivePattern = {
  name: 'ProductStrategyAndExecution',
  type: CognitiveType.ANALYTICAL_INSIGHTS,
  specialization: 'product-market-optimization',
  
  capabilities: [
    'market-research-and-competitive-analysis',
    'customer-need-identification-and-validation',
    'product-roadmap-creation-and-optimization',
    'feature-prioritization-using-data-insights',
    'user-experience-design-collaboration',
    'go-to-market-strategy-development',
    'product-performance-analytics-and-optimization',
    'customer-feedback-integration-and-response',
    'pricing-strategy-development-and-testing',
    'product-lifecycle-management-and-evolution'
  ],
  
  decisionFrameworks: [
    {
      name: 'ProductFeaturePrioritization',
      methodology: 'rice-scoring-enhanced',
      factors: [
        { name: 'reach', weight: 0.25, dataSource: 'user-analytics' },
        { name: 'impact', weight: 0.25, dataSource: 'customer-interviews' },
        { name: 'confidence', weight: 0.25, dataSource: 'market-research' },
        { name: 'effort', weight: 0.25, dataSource: 'development-estimates' }
      ],
      additionalFactors: [
        'strategic-alignment-score',
        'technical-debt-impact',
        'competitive-pressure-urgency'
      ]
    },
    {
      name: 'ProductMarketFitAssessment',
      indicators: [
        'net-promoter-score-trend',
        'customer-acquisition-cost-efficiency',
        'user-retention-and-engagement-patterns',
        'revenue-per-user-growth',
        'market-share-progression'
      ],
      thresholds: {
        nps: 50,
        retention: 0.7,
        engagement: 'increasing-trend'
      }
    }
  ],
  
  learningMechanisms: [
    {
      type: 'customer-behavior-analysis',
      dataSources: ['product-analytics', 'user-research', 'support-tickets'],
      behaviorPrediction: true,
      segmentationOptimization: true
    },
    {
      type: 'market-trend-prediction',
      sources: ['industry-reports', 'competitive-intelligence', 'technology-trends'],
      trendIdentification: true,
      opportunitySpotting: true
    },
    {
      type: 'product-performance-learning',
      metrics: ['feature-adoption', 'user-satisfaction', 'business-impact'],
      a-b-testing-integration: true,
      experimentationFramework: true
    }
  ],
  
  humanOversightTriggers: [
    {
      trigger: 'product-market-fit-indicators-declining',
      threshold: 'multiple-metrics-negative-trend',
      severity: 'recommended',
      escalationTime: '48-hours'
    },
    {
      trigger: 'major-pivot-recommendation',
      threshold: 'any-significant-direction-change',
      severity: 'mandatory',
      escalationTime: 'immediate'
    }
  ]
};
```

## 3. Team Level Cognitive Patterns

### 3.1 Scrum Master Cognitive Pattern

```typescript
export const ScrumMasterCognitive: CognitivePattern = {
  name: 'AgileFacilitationAndCoaching',
  type: CognitiveType.FACILITATIVE_COACHING,
  specialization: 'team-performance-optimization',
  
  capabilities: [
    'impediment-identification-and-resolution',
    'team-dynamics-analysis-and-improvement',
    'agile-process-coaching-and-mentoring',
    'conflict-resolution-and-mediation',
    'performance-coaching-and-development',
    'ceremony-facilitation-and-optimization',
    'metrics-analysis-and-insights-generation',
    'change-management-and-adoption-support',
    'cross-team-collaboration-facilitation',
    'continuous-improvement-culture-building'
  ],
  
  decisionFrameworks: [
    {
      name: 'ImpedimentPrioritizationMatrix',
      factors: [
        { name: 'team-velocity-impact', weight: 0.3 },
        { name: 'quality-impact', weight: 0.25 },
        { name: 'team-morale-impact', weight: 0.25 },
        { name: 'resolution-effort', weight: 0.2 }
      ],
      resolutionStrategies: [
        'team-level-resolution',
        'program-level-escalation',
        'organizational-level-escalation'
      ]
    },
    {
      name: 'TeamDevelopmentApproach',
      assessmentDimensions: [
        'technical-skills-maturity',
        'collaboration-effectiveness',
        'agile-practice-adoption',
        'self-organization-level'
      ],
      coachingStrategies: [
        'individual-mentoring',
        'team-workshops',
        'peer-learning-facilitation',
        'external-training-coordination'
      ]
    }
  ],
  
  learningMechanisms: [
    {
      type: 'team-feedback-integration',
      sources: ['retrospectives', '1-on-1-meetings', 'team-health-checks'],
      adaptationSpeed: 'fast',
      personalizationLevel: 'individual-team-member'
    },
    {
      type: 'coaching-effectiveness-measurement',
      metrics: ['team-velocity-improvement', 'quality-trends', 'team-satisfaction'],
      coachingStyleOptimization: true,
      individualizedApproaches: true
    }
  ],
  
  humanOversightTriggers: [
    {
      trigger: 'team-dysfunction-indicators',
      threshold: 'multiple-negative-metrics',
      severity: 'recommended',
      escalationTime: '24-hours'
    },
    {
      trigger: 'cross-team-conflict-escalation',
      threshold: 'unresolved-for-48-hours',
      severity: 'mandatory',
      escalationTime: 'immediate'
    }
  ]
};
```

### 3.2 Product Owner Cognitive Pattern

```typescript
export const ProductOwnerCognitive: CognitivePattern = {
  name: 'ProductValueMaximization',
  type: CognitiveType.ANALYTICAL_INSIGHTS,
  specialization: 'backlog-optimization-and-stakeholder-alignment',
  
  capabilities: [
    'user-story-creation-and-refinement',
    'acceptance-criteria-definition-and-validation',
    'backlog-prioritization-using-value-metrics',
    'stakeholder-requirement-translation',
    'user-experience-design-collaboration',
    'sprint-goal-definition-and-tracking',
    'feature-performance-measurement-and-analysis',
    'customer-feedback-integration-and-response',
    'business-value-definition-and-measurement',
    'cross-team-coordination-and-alignment'
  ],
  
  decisionFrameworks: [
    {
      name: 'BacklogPrioritizationOptimization',
      methodology: 'multi-criteria-decision-analysis',
      criteria: [
        { name: 'business-value', weight: 0.3, dataSource: 'stakeholder-input' },
        { name: 'user-impact', weight: 0.25, dataSource: 'user-research' },
        { name: 'implementation-effort', weight: 0.2, dataSource: 'team-estimates' },
        { name: 'technical-debt-reduction', weight: 0.15, dataSource: 'technical-analysis' },
        { name: 'risk-mitigation', weight: 0.1, dataSource: 'risk-assessment' }
      ]
    }
  ],
  
  learningMechanisms: [
    {
      type: 'user-story-outcome-learning',
      sources: ['feature-usage-analytics', 'user-feedback', 'a-b-testing-results'],
      storyWritingImprovement: true,
      acceptanceCriteriaOptimization: true
    }
  ],
  
  humanOversightTriggers: [
    {
      trigger: 'stakeholder-alignment-conflict',
      threshold: 'unresolved-disagreement-on-priorities',
      severity: 'recommended',
      escalationTime: '24-hours'
    }
  ]
};
```

## 4. Specialized Cognitive Patterns

### 4.1 System Architect Cognitive Pattern

```typescript
export const SystemArchitectCognitive: CognitivePattern = {
  name: 'ArchitecturalIntelligenceAndDesign',
  type: CognitiveType.TECHNICAL_ARCHITECTURAL,
  specialization: 'system-architecture-optimization',
  
  capabilities: [
    'system-architecture-design-and-optimization',
    'technology-stack-evaluation-and-selection',
    'performance-and-scalability-analysis',
    'security-architecture-design-and-validation',
    'integration-pattern-design-and-implementation',
    'quality-attribute-requirement-translation',
    'technical-debt-assessment-and-prioritization',
    'architectural-decision-documentation-and-communication',
    'cross-system-dependency-analysis-and-optimization',
    'emerging-technology-evaluation-and-adoption-planning'
  ],
  
  decisionFrameworks: [
    {
      name: 'ArchitecturalDecisionMatrix',
      qualityAttributes: [
        { name: 'performance', weight: 0.2, measurementMethod: 'benchmarking' },
        { name: 'scalability', weight: 0.2, measurementMethod: 'load-testing' },
        { name: 'maintainability', weight: 0.15, measurementMethod: 'code-analysis' },
        { name: 'security', weight: 0.15, measurementMethod: 'threat-modeling' },
        { name: 'cost-effectiveness', weight: 0.15, measurementMethod: 'tco-analysis' },
        { name: 'interoperability', weight: 0.15, measurementMethod: 'integration-testing' }
      ],
      tradeoffAnalysis: true,
      stakeholderImpactAssessment: true
    }
  ],
  
  learningMechanisms: [
    {
      type: 'architectural-outcome-analysis',
      sources: ['system-performance-metrics', 'maintenance-effort', 'security-incidents'],
      architecturalPatternOptimization: true,
      decisionQualityImprovement: true
    }
  ]
};
```

## 5. Cognitive Pattern Orchestration

### Cross-Agent Learning and Coordination

```typescript
export class CognitivePatternOrchestrator {
  private patterns: Map<string, CognitivePattern>;
  private learningCoordinator: CrossAgentLearningCoordinator;
  private collaborationEngine: AgentCollaborationEngine;
  
  async orchestrateDecision(
    primaryAgent: string,
    decisionContext: DecisionContext,
    collaboratingAgents: string[]
  ): Promise<OrchestrationResult> {
    
    // Get primary agent's cognitive pattern
    const primaryPattern = this.patterns.get(primaryAgent);
    
    // Identify required collaboration patterns
    const collaborationNeeds = await this.identifyCollaborationNeeds(
      primaryPattern,
      decisionContext,
      collaboratingAgents
    );
    
    // Execute coordinated decision process
    const coordinatedDecision = await this.collaborationEngine.executeCoordinatedDecision({
      primaryAgent,
      collaboratingAgents,
      decisionContext,
      collaborationNeeds,
      humanOversightRequired: this.assessOversightRequirement(primaryPattern, decisionContext)
    });
    
    // Learn from the coordination outcome
    await this.learningCoordinator.learnFromCoordination({
      agents: [primaryAgent, ...collaboratingAgents],
      decisionOutcome: coordinatedDecision,
      effectivenessMetrics: await this.measureCoordinationEffectiveness(coordinatedDecision)
    });
    
    return coordinatedDecision;
  }
}
```

This comprehensive cognitive pattern specification provides the foundation for implementing thousands of detailed AI agent behaviors across all phases of the SAFe-SPARC transformation, ensuring consistent and intelligent decision-making throughout the system.