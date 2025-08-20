# Package Integration Guide

**Comprehensive usage patterns for all public @claude-zen packages in SAFe-SPARC implementation**

## 📋 Overview

This guide provides detailed integration patterns for all public packages used in the SAFe-SPARC AI transformation. Each package serves specific roles in the overall architecture and provides specialized capabilities for AI agents.

## 🧠 @claude-zen/brain Package Integration

### Core Components
```typescript
import { 
  BrainCoordinator,
  EnhancedBaseAgent,
  CognitivePattern,
  NeuralCoordination,
  AutonomousOrchestrator,
  BehavioralIntelligence,
  AdaptiveLearning
} from '@claude-zen/brain';
```

### 1. BrainCoordinator Usage Patterns

**Strategic Decision Making**
```typescript
// Portfolio-level investment decisions
const brainCoordinator = new BrainCoordinator({
  autonomous: { 
    enabled: true, 
    learningRate: 0.1, 
    adaptationThreshold: 0.8,
    decisionConfidenceMinimum: 0.7
  },
  optimization: {
    strategies: ['neural-networks', 'behavioral-analysis', 'pattern-recognition'],
    autoSelection: true,
    performanceTracking: true
  }
});

await brainCoordinator.optimizeDecision({
  decisionType: 'portfolio-investment',
  context: {
    marketData: currentMarketAnalysis,
    portfolioState: portfolioMetrics,
    strategicObjectives: businessGoals,
    riskTolerance: organizationRiskProfile
  },
  constraints: {
    budgetLimit: 10000000,
    timeHorizon: '12-months',
    riskLevel: 'moderate'
  },
  priority: 'high',
  enableLearning: true
});
```

**Cognitive Pattern Recognition**
```typescript
// Epic complexity assessment
const complexityAnalysis = await brainCoordinator.recognizePatterns({
  inputData: {
    technicalSpecifications: epicTechSpecs,
    businessRequirements: epicBusinessCase,
    teamCapabilities: assignedTeamSkills,
    historicalData: previousEpicOutcomes
  },
  patternTypes: [
    'technical-complexity-indicators',
    'team-skill-gaps',
    'integration-complexity',
    'business-value-patterns'
  ],
  confidenceThreshold: 0.75
});
```

### 2. EnhancedBaseAgent Implementation

**SAFe Role Agent Base Class**
```typescript
export class ScrumMasterAgent extends EnhancedBaseAgent {
  constructor(config: ScrumMasterConfig) {
    super({
      agentId: `scrum-master-${config.teamId}`,
      cognitivePattern: {
        name: 'AgileFacilitation',
        type: 'process-optimization',
        capabilities: [
          'impediment-identification',
          'team-dynamics-analysis', 
          'process-improvement',
          'conflict-resolution',
          'performance-coaching'
        ],
        learningMechanisms: [
          'retrospective-analysis',
          'team-feedback-integration',
          'velocity-pattern-recognition',
          'impediment-resolution-success'
        ]
      },
      autonomyLevel: AutonomyLevel.COLLABORATIVE,
      humanOversight: HumanOversightLevel.PERIODIC
    });
  }
  
  // Specialized agent methods
  async facilitateStandupMeeting(): Promise<StandupOutcome> {
    const teamStatus = await this.analyzeTeamStatus();
    const impediments = await this.identifyImpediments();
    const recommendations = await this.generateProcessRecommendations();
    
    return {
      teamHealth: teamStatus.healthScore,
      impediments: impediments,
      actionItems: recommendations.actionItems,
      nextSteps: recommendations.nextSteps
    };
  }
}
```

### 3. Behavioral Intelligence Integration

**Team Dynamics Analysis**
```typescript
const behavioralIntelligence = new BehavioralIntelligence({
  analysisTypes: [
    'team-collaboration-patterns',
    'individual-performance-trends',
    'communication-effectiveness',
    'stress-level-indicators'
  ],
  learningFromHistory: true,
  predictiveModeling: true
});

const teamAnalysis = await behavioralIntelligence.analyzeTeamDynamics({
  teamData: {
    communicationPatterns: await this.getTeamCommunication(),
    velocityTrends: await this.getVelocityHistory(),
    impedimentHistory: await this.getImpedimentPatterns(),
    retroActionItems: await this.getRetrospectiveData()
  },
  timeWindow: '3-months',
  includeIndividualInsights: true
});
```

## 🏗️ @claude-zen/workflows Package Integration

### Core Components
```typescript
import {
  WorkflowEngine,
  ProcessOrchestrator,
  WorkflowDefinition,
  ProcessAutomation,
  WorkflowGates,
  WorkflowScheduler
} from '@claude-zen/workflows';
```

### 1. SAFe Ceremony Automation

**PI Planning Workflow**
```typescript
const piPlanningWorkflow: WorkflowDefinition = {
  id: 'pi-planning-process',
  name: 'Program Increment Planning',
  version: '2.0',
  steps: [
    {
      id: 'business-context-presentation',
      type: 'presentation',
      duration: 45,
      participants: ['product-management', 'business-stakeholders'],
      deliverables: ['business-context', 'vision-briefing']
    },
    {
      id: 'architecture-vision-briefing', 
      type: 'technical-presentation',
      duration: 30,
      participants: ['system-architect', 'technical-leads'],
      deliverables: ['architecture-vision', 'enabler-epics']
    },
    {
      id: 'team-planning-sessions',
      type: 'parallel-team-planning',
      duration: 240,
      parallelExecution: true,
      teamSessions: await this.generateTeamPlannings(),
      dependencies: ['business-context', 'architecture-vision']
    },
    {
      id: 'draft-plan-review',
      type: 'cross-team-review',
      duration: 60,
      participants: 'all-teams',
      gates: [
        { type: 'dependency-validation', threshold: 0.9 },
        { type: 'capacity-validation', threshold: 0.8 },
        { type: 'risk-assessment', threshold: 'acceptable' }
      ]
    },
    {
      id: 'management-review-approval',
      type: 'approval-gate',
      duration: 30,
      requiredApprovers: ['release-train-engineer', 'product-management'],
      approvalCriteria: this.getApprovalCriteria(),
      escalationRules: this.getEscalationRules()
    }
  ],
  gates: this.getPIGates(),
  rollbackProcedures: this.getRollbackProcedures()
};

const piPlanningEngine = new WorkflowEngine({
  workflowDefinition: piPlanningWorkflow,
  executionContext: {
    piNumber: currentPI.number,
    teams: artTeams,
    capacity: teamCapacities,
    objectives: businessObjectives
  }
});

const piPlanningResult = await piPlanningEngine.execute();
```

### 2. Continuous Process Orchestration

**Sprint Planning Automation**
```typescript
const sprintPlanningOrchestrator = new ProcessOrchestrator({
  processType: 'sprint-planning',
  frequency: 'bi-weekly',
  automation: {
    backlogRefinement: true,
    velocityCalculation: true,
    capacityPlanning: true,
    sprintGoalGeneration: true
  }
});

await sprintPlanningOrchestrator.scheduleRecurring({
  trigger: 'sprint-boundary',
  preparation: [
    'backlog-refinement-validation',
    'team-capacity-assessment',
    'dependency-analysis',
    'sprint-goal-preparation'
  ],
  execution: 'automated-with-human-oversight',
  followUp: [
    'sprint-plan-distribution',
    'dependency-notification',
    'capacity-booking',
    'goal-alignment-verification'
  ]
});
```

## 🏛️ @claude-zen/safe-framework Package Integration

### Core Components
```typescript
import {
  SafePortfolioManager,
  ProgramIncrement,
  AgileReleaseTrainManager,
  ValueStreamManager,
  LeanPortfolioKanban,
  SafeCeremonies,
  SafeRoles,
  SafeArtifacts
} from '@claude-zen/safe-framework';
```

### 1. Portfolio Management Integration

**Lean Portfolio Management**
```typescript
const leanPortfolio = new SafePortfolioManager({
  investmentThemes: await this.getStrategicThemes(),
  budgetGuardrails: this.getBudgetConstraints(),
  valueStreams: await this.getPortfolioValueStreams(),
  governanceFramework: this.getGovernanceRules()
});

// Portfolio Kanban management
const portfolioKanban = await leanPortfolio.createPortfolioKanban({
  columns: ['Funnel', 'Analyzing', 'Portfolio Backlog', 'Implementing', 'Done'],
  wipLimits: { analyzing: 5, implementing: 8 },
  policies: {
    entryToAnalyzing: this.getAnalysisEntryPolicies(),
    exitFromBacklog: this.getBacklogExitPolicies(),
    implementationApproval: this.getImplementationPolicies()
  }
});

// Epic investment decisions
const epicInvestmentDecision = await leanPortfolio.evaluateEpicInvestment({
  epic: candidateEpic,
  businessCase: epicBusinessCase,
  marketAnalysis: marketIntelligence,
  technicalFeasibility: architecturalAssessment,
  resourceRequirements: resourceEstimates
});
```

### 2. Program Increment Management

**PI Planning and Execution**
```typescript
const programIncrement = new ProgramIncrement({
  piNumber: 24,
  duration: 10, // weeks
  artTeams: releaseTrainTeams,
  objectives: piBusinessObjectives
});

// PI Planning process
const piPlanning = await programIncrement.planProgramIncrement({
  businessContext: await this.getBusinessContext(),
  architecturalVision: await this.getArchitecturalVision(),
  teamCapacities: await this.getTeamCapacities(),
  dependencies: await this.identifyDependencies()
});

// PI Execution tracking
const piExecution = await programIncrement.executeProgramIncrement({
  piPlan: piPlanning.approvedPlan,
  monitoringFrequency: 'daily',
  reportingFrequency: 'weekly',
  riskAssessmentFrequency: 'weekly'
});
```

## 🔧 @claude-zen/foundation Package Integration

### Core Components
```typescript
import {
  Logger,
  TelemetryManager,
  PerformanceTracker,
  ConfigurationManager,
  ErrorHandling,
  ValidationFramework,
  SecurityUtils,
  NetworkingUtils
} from '@claude-zen/foundation';
```

### 1. Observability and Monitoring

**Comprehensive Telemetry Setup**
```typescript
const telemetryManager = new TelemetryManager({
  serviceName: 'safe-sparc-transformation',
  enableTracing: true,
  enableMetrics: true,
  enableLogging: true,
  customMetrics: [
    'ai-agent-decision-accuracy',
    'human-oversight-frequency',
    'process-automation-efficiency',
    'safe-ceremony-effectiveness'
  ]
});

// AI Agent performance tracking
await telemetryManager.trackAgentPerformance({
  agentId: 'scrum-master-team-alpha',
  metrics: {
    decisionAccuracy: 0.94,
    responseTime: 150, // ms
    stakeholderSatisfaction: 4.2, // 1-5 scale
    processImprovementSuggestions: 8
  },
  context: {
    sprintNumber: 15,
    teamSize: 9,
    sprintGoalAchievement: 0.96
  }
});

// SAFe process metrics
await telemetryManager.recordSafeMetrics({
  piNumber: 24,
  artHealth: 0.89,
  velocityTrend: 'increasing',
  qualityTrend: 'stable',
  customerSatisfaction: 4.1,
  employeeEngagement: 4.3
});
```

### 2. Configuration Management

**Dynamic Configuration System**
```typescript
const configManager = new ConfigurationManager({
  configSources: [
    'environment-variables',
    'configuration-files',
    'database-configuration',
    'remote-configuration-service'
  ],
  enableHotReload: true,
  encryptSensitiveValues: true
});

// SAFe-SPARC specific configurations
const safeConfig = await configManager.getConfiguration('safe-framework');
const sparcConfig = await configManager.getConfiguration('sparc-methodology');
const aiAgentConfig = await configManager.getConfiguration('ai-agents');

// Dynamic configuration updates
await configManager.updateConfiguration('ai-agents.learning-rates', {
  portfolioAgents: 0.1,
  programAgents: 0.15,
  teamAgents: 0.2
});
```

## 🎨 @claude-zen/agui Package Integration

### Core Components
```typescript
import {
  AGUIDecisionPoint,
  ApprovalWorkflow,
  HumanOversightInterface,
  ContextualInformationDisplay,
  DecisionSupportSystem,
  FeedbackCollectionSystem,
  CollaborativeWorkspace
} from '@claude-zen/agui';
```

### 1. Human Decision Points

**Strategic Decision Approval Interface**
```typescript
const portfolioDecisionPoint = new AGUIDecisionPoint({
  decisionType: 'portfolio-investment',
  context: {
    epicTitle: 'Customer Analytics Platform',
    investmentAmount: 2500000,
    timeframe: '18-months',
    expectedROI: '250%',
    strategicAlignment: 0.95
  },
  aiRecommendation: {
    recommendation: 'APPROVE',
    confidence: 0.87,
    reasoning: [
      'Strong market demand validation',
      'Clear competitive advantage opportunity', 
      'Aligned with strategic themes',
      'Acceptable risk profile'
    ],
    alternativeOptions: [
      'Defer to next PI for more market validation',
      'Reduce scope to minimize initial investment',
      'Partner with external vendor for faster delivery'
    ]
  },
  approvalWorkflow: {
    requiredApprovers: ['portfolio-manager', 'cfo'],
    timeoutMinutes: 1440, // 24 hours
    escalationRules: this.getEscalationRules()
  },
  informationDisplay: {
    dashboardWidgets: [
      'market-analysis-summary',
      'financial-projections',
      'risk-assessment',
      'competitive-landscape'
    ],
    detailViews: [
      'full-business-case',
      'technical-architecture-plan',
      'resource-allocation-plan',
      'timeline-and-milestones'
    ]
  }
});

const decisionOutcome = await portfolioDecisionPoint.presentForApproval();
```

### 2. Collaborative Decision Making

**Cross-Functional Team Coordination**
```typescript
const collaborativeWorkspace = new CollaborativeWorkspace({
  workspaceType: 'pi-planning-session',
  participants: [
    { role: 'product-owner', team: 'customer-experience' },
    { role: 'scrum-master', team: 'customer-experience' },
    { role: 'tech-lead', team: 'customer-experience' },
    { role: 'release-train-engineer', team: 'art-retail' },
    { role: 'system-architect', team: 'platform' }
  ],
  aiSupport: {
    realTimeInsights: true,
    decisionSupport: true,
    conflictResolution: true,
    documentationGeneration: true
  }
});

await collaborativeWorkspace.facilitateSession({
  agenda: piPlanningAgenda,
  objectives: piObjectives,
  constraints: resourceConstraints,
  decisionPoints: criticalDecisions,
  aiModerator: {
    enabled: true,
    interventionTriggers: [
      'discussion-going-off-track',
      'unresolved-conflict-detected',
      'time-management-needed',
      'decision-point-reached'
    ]
  }
});
```

## 🔗 Package Integration Patterns

### 1. Cross-Package Event Coordination

```typescript
// Event-driven coordination across all packages
import { TypeSafeEventBus } from '@claude-zen/event-system';

const eventBus = new TypeSafeEventBus();

// Brain package decision events
eventBus.on('brain-decision-made', async (event) => {
  // Update workflows
  await workflowEngine.handleDecisionEvent(event);
  
  // Update SAFe artifacts
  await safeFramework.updateArtifacts(event);
  
  // Present to human if required
  if (event.requiresHumanOversight) {
    await aguiInterface.presentDecision(event);
  }
  
  // Record telemetry
  await telemetryManager.recordDecisionEvent(event);
});

// Workflow completion events
eventBus.on('workflow-completed', async (event) => {
  // Update brain learning models
  await brainCoordinator.learnFromOutcome(event);
  
  // Update SAFe metrics
  await safeFramework.updateCompletionMetrics(event);
  
  // Notify human stakeholders
  await aguiInterface.notifyCompletion(event);
});
```

### 2. Unified Configuration Management

```typescript
// Centralized configuration for all packages
const unifiedConfig = {
  brain: {
    learningRates: { portfolio: 0.1, program: 0.15, team: 0.2 },
    autonomyLevels: { strategic: 'collaborative', tactical: 'autonomous' },
    oversightThresholds: { financial: 1000000, strategic: 'always' }
  },
  workflows: {
    parallelExecution: true,
    timeoutDefaults: { short: 300, medium: 1800, long: 7200 },
    retryPolicies: { network: 3, computation: 2, approval: 1 }
  },
  safeFramework: {
    piLengthWeeks: 10,
    inspectAndAdaptFrequency: 'per-pi',
    innovationAndPlanningPercent: 20
  },
  agui: {
    responseTimeouts: { urgent: 60, normal: 1440, strategic: 4320 },
    escalationChains: this.getEscalationChains(),
    accessControlRules: this.getAccessRules()
  },
  foundation: {
    loggingLevel: 'info',
    metricsRetention: 90, // days
    encryptionKeys: this.getEncryptionConfig()
  }
};
```

### 3. Error Handling and Recovery

```typescript
// Unified error handling across all packages
const errorHandler = new UnifiedErrorHandler({
  packages: ['brain', 'workflows', 'safe-framework', 'agui', 'foundation'],
  recoveryStrategies: {
    'brain-decision-timeout': 'escalate-to-human',
    'workflow-execution-failure': 'retry-with-fallback',
    'safe-ceremony-disruption': 'reschedule-and-notify',
    'agui-approval-timeout': 'escalate-to-supervisor',
    'foundation-service-unavailable': 'circuit-breaker-pattern'
  },
  notificationChannels: ['email', 'slack', 'dashboard-alerts']
});
```

This comprehensive integration guide provides the foundation for implementing thousands of detailed steps across all phases of the SAFe-SPARC transformation, ensuring consistent usage of public packages throughout the implementation.