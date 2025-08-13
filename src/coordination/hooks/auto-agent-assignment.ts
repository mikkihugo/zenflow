/**
 * Auto-Agent Assignment System.
 * Intelligently assigns optimal agents based on file types, operations, and agent capabilities.
 */
/**
 * @file Coordination system: auto-agent-assignment.
 */

import * as path from 'node:path';
import type { AgentType } from '../types.ts';
import type {
  AgentAssignment,
  AgentContext,
  AgentCoordinator,
  AgentInfo,
  ComplexityLevel,
  FileType,
  LearningData,
  Operation,
  OperationContext,
  PerformanceEstimate,
  PerformanceHistory,
  UrgencyLevel,
  WorkloadBalance,
  WorkloadRecommendation,
} from './hook-system-core.ts';

// Interface defined before class usage
interface AgentCapabilityProfile {
  skills: string[];
  specialties: string[];
  complexity: ComplexityLevel;
}

export class IntelligentAgentAssignor implements AgentCoordinator {
  private readonly agentCapabilityMap: Map<AgentType, AgentCapabilityProfile>;
  private readonly fileTypeAgentMap: Map<FileType, AgentType[]>;
  // Removed unused variable _agentPerformanceHistory - was not used anywhere in the class
  private readonly workloadTracker: Map<string, number>;

  constructor() {
    this.agentCapabilityMap = new Map();
    this.fileTypeAgentMap = new Map();
    this.workloadTracker = new Map();
    this.initializeCapabilityMappings();
    this.initializeFileTypeMappings();
  }

  async assignOptimalAgent(
    context: OperationContext
  ): Promise<AgentAssignment> {
    // 1. Analyze operation requirements
    const analysis = await this.analyzeOperation(context);

    // 2. Get candidate agents based on file type and operation
    const candidates = await this.getCandidateAgents(analysis);

    // 3. Score agents based on multiple criteria
    const scoredAgents = await this.scoreAgents(candidates, analysis);

    // 4. Select optimal agent
    const selectedAgent = scoredAgents.reduce((best, current) =>
      current?.score > best.score ? current : best
    );

    // 5. Estimate performance for the assignment
    const performanceEstimate = await this.estimatePerformance(
      selectedAgent?.agent,
      context
    );

    return {
      agent: selectedAgent?.agent,
      confidence: selectedAgent?.score,
      reasoning: selectedAgent?.reasoning,
      alternatives: scoredAgents.slice(1, 4).map((sa) => sa.agent),
      estimatedPerformance: performanceEstimate,
    };
  }

  async loadAgentContext(agent: AgentInfo): Promise<AgentContext> {
    return {
      memory: await this.loadAgentMemory(agent.id),
      preferences: await this.loadAgentPreferences(agent.id),
      learningData: await this.loadLearningData(agent.id),
      performanceHistory: await this.loadPerformanceHistory(agent.id),
    };
  }

  async updateAgentWorkload(
    agent: AgentInfo,
    operation: Operation
  ): Promise<void> {
    const currentWorkload = this.workloadTracker.get(agent.id) || 0;
    const estimatedDuration = await this.estimateOperationDuration(operation);

    this.workloadTracker.set(agent.id, currentWorkload + estimatedDuration);

    // Update agent's current workload
    await this.persistWorkloadUpdate(
      agent.id,
      currentWorkload + estimatedDuration
    );
  }

  async balanceWorkload(agents: AgentInfo[]): Promise<WorkloadBalance> {
    const workloads = agents.map((agent) => ({
      agent,
      currentLoad: this.workloadTracker.get(agent.id) || 0,
      maxLoad: agent.maxWorkload,
      utilization:
        (this.workloadTracker.get(agent.id) || 0) / agent.maxWorkload,
    }));

    const averageUtilization =
      workloads.reduce((sum, wl) => sum + wl.utilization, 0) / workloads.length;
    const threshold = 0.2; // 20% deviation threshold

    const unbalanced = workloads.filter(
      (wl) => Math.abs(wl.utilization - averageUtilization) > threshold
    );

    const recommendations: WorkloadRecommendation[] = [];

    // Generate rebalancing recommendations
    for (const workload of unbalanced) {
      if (workload.utilization > averageUtilization + threshold) {
        recommendations.push({
          agentId: workload.agent.id,
          action: 'decrease',
          reason: `Agent is overloaded (${(workload.utilization * 100).toFixed(1)}% vs ${(averageUtilization * 100).toFixed(1)}% average)`,
          impact: workload.utilization - averageUtilization,
        });
      } else if (workload.utilization < averageUtilization - threshold) {
        recommendations.push({
          agentId: workload.agent.id,
          action: 'increase',
          reason: `Agent is underutilized (${(workload.utilization * 100).toFixed(1)}% vs ${(averageUtilization * 100).toFixed(1)}% average)`,
          impact: averageUtilization - workload.utilization,
        });
      }
    }

    return {
      balanced: unbalanced.length === 0,
      recommendations,
      projectedEfficiency: this.calculateProjectedEfficiency(
        workloads,
        recommendations
      ),
    };
  }

  private async analyzeOperation(
    context: OperationContext
  ): Promise<OperationAnalysis> {
    const fileType = context.filePath
      ? this.detectFileType(context.filePath)
      : 'unknown';
    const operationType = this.classifyOperation(context.operation);
    const complexity = await this.assessComplexity(context);

    return {
      fileType,
      operationType,
      complexity,
      requiredSkills: this.inferRequiredSkills(fileType, operationType),
      estimatedDuration: context.estimatedDuration,
      priority: context.priority,
      urgency: context.urgency,
      specialRequirements: this.identifySpecialRequirements(context),
    };
  }

  private detectFileType(filePath: string): FileType {
    const extension = path.extname(filePath).toLowerCase();
    const fileTypeMap: Record<string, FileType> = {
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.py': 'python',
      '.rs': 'rust',
      '.go': 'golang',
      '.java': 'java',
      '.cpp': 'cpp',
      '.cc': 'cpp',
      '.cxx': 'cpp',
      '.c': 'cpp',
      '.h': 'cpp',
      '.hpp': 'cpp',
      '.md': 'markdown',
      '.json': 'json',
      '.yaml': 'yaml',
      '.yml': 'yaml',
      '.sql': 'sql',
    };

    return fileTypeMap[extension] || 'unknown';
  }

  private classifyOperation(operation: Operation): OperationType {
    const type = operation.type.toLowerCase();

    if (type.includes('test')) return 'testing';
    if (type.includes('debug')) return 'debugging';
    if (type.includes('refactor')) return 'refactoring';
    if (type.includes('review')) return 'code-review';
    if (type.includes('document')) return 'documentation';
    if (type.includes('analyze')) return 'analysis';
    if (type.includes('optimize')) return 'optimization';
    if (type.includes('secure')) return 'security';
    if (type.includes('deploy')) return 'deployment';
    if (type.includes('config')) return 'configuration';
    if (type.includes('data')) return 'data-processing';
    if (type.includes('ui') || type.includes('frontend')) return 'frontend';
    if (type.includes('api') || type.includes('backend')) return 'backend';
    if (type.includes('ml') || type.includes('ai')) return 'machine-learning';

    return 'general';
  }

  private async assessComplexity(
    context: OperationContext
  ): Promise<ComplexityLevel> {
    let score = 0;

    // File type complexity
    const complexFileTypes = ['cpp', 'rust', 'java'];
    if (context.fileType && complexFileTypes.includes(context.fileType))
      score += 2;

    // Operation complexity
    if (context.operation.description.length > 200) score += 1;
    if (
      context.operation.parameters &&
      Object.keys(context.operation.parameters).length > 5
    )
      score += 1;

    // Dependencies and requirements
    if (context.requiredSkills.length > 3) score += 1;
    if (context.estimatedDuration > 3600) score += 2; // > 1 hour

    if (score >= 5) return 'expert';
    if (score >= 3) return 'complex';
    if (score >= 1) return 'moderate';
    return 'simple';
  }

  private inferRequiredSkills(
    fileType: FileType,
    operationType: OperationType
  ): string[] {
    const skills: Set<string> = new Set();

    // File type skills
    const fileTypeSkills: Record<FileType, string[]> = {
      typescript: ['typescript', 'javascript', 'nodejs', 'web-development'],
      javascript: ['javascript', 'nodejs', 'web-development'],
      python: ['python', 'data-science', 'automation'],
      rust: ['rust', 'systems-programming', 'performance'],
      golang: ['golang', 'concurrent-programming', 'microservices'],
      java: ['java', 'enterprise-development', 'spring'],
      cpp: ['cpp', 'systems-programming', 'performance'],
      markdown: ['documentation', 'technical-writing'],
      json: ['configuration', 'data-structure'],
      yaml: ['configuration', 'devops'],
      sql: ['database', 'data-analysis'],
      unknown: [],
    };

    fileTypeSkills[fileType]?.forEach((skill) => skills.add(skill));

    // Operation type skills
    const operationSkills: Record<OperationType, string[]> = {
      testing: ['testing', 'quality-assurance', 'tdd'],
      debugging: ['debugging', 'problem-solving', 'troubleshooting'],
      refactoring: ['refactoring', 'code-quality', 'design-patterns'],
      'code-review': ['code-review', 'quality-assurance', 'mentoring'],
      documentation: ['technical-writing', 'documentation'],
      analysis: ['analysis', 'problem-solving', 'research'],
      optimization: ['performance-optimization', 'profiling'],
      security: ['security', 'vulnerability-assessment'],
      deployment: ['devops', 'deployment', 'automation'],
      configuration: ['configuration', 'devops'],
      'data-processing': ['data-processing', 'etl', 'analytics'],
      frontend: ['frontend', 'ui-ux', 'web-development'],
      backend: ['backend', 'api-development', 'microservices'],
      'machine-learning': ['machine-learning', 'data-science', 'ai'],
      general: ['general-programming'],
    };

    operationSkills[operationType]?.forEach((skill) => skills.add(skill));

    return Array.from(skills);
  }

  private identifySpecialRequirements(context: OperationContext): string[] {
    const requirements: string[] = [];

    if (context.urgency === 'critical') requirements.push('high-availability');
    if (context.complexity === 'expert') requirements.push('senior-level');
    if (context.estimatedDuration > 7200) requirements.push('long-running');
    if (context.operation.description.includes('secure'))
      requirements.push('security-clearance');
    if (context.operation.description.includes('performance'))
      requirements.push('performance-expertise');

    return requirements;
  }

  private async getCandidateAgents(
    analysis: OperationAnalysis
  ): Promise<AgentInfo[]> {
    const candidates: AgentInfo[] = [];

    // Get agents based on file type
    const fileTypeAgents = this.fileTypeAgentMap.get(analysis.fileType) || [];

    // Get agents based on operation type
    const operationAgents = this.getAgentsByOperationType(
      analysis.operationType
    );

    // Combine and deduplicate
    const allAgentTypes = [...new Set([...fileTypeAgents, ...operationAgents])];

    // Convert to AgentInfo (mock implementation - would integrate with actual agent registry)
    for (const agentType of allAgentTypes) {
      const agent = await this.createAgentInfo(agentType);
      if (this.meetsRequirements(agent, analysis)) {
        candidates.push(agent);
      }
    }

    return candidates;
  }

  private getAgentsByOperationType(operationType: OperationType): AgentType[] {
    const operationAgentMap: Record<OperationType, AgentType[]> = {
      testing: [
        'unit-tester',
        'integration-tester',
        'e2e-tester',
        'tdd-london-swarm',
      ],
      debugging: ['debug', 'analyst', 'specialist'],
      refactoring: ['refactoring-analyzer', 'reviewer'],
      'code-review': ['code-review-swarm', 'reviewer', 'quality-gate-agent'],
      documentation: ['documenter', 'technical-writer', 'readme-writer'],
      analysis: ['analyst', 'analyze-code-quality', 'performance-analyzer'],
      optimization: ['optimizer', 'performance-analyzer', 'cache-optimizer'],
      security: ['security-analyzer', 'security-architect', 'security-manager'],
      deployment: ['deployment-ops', 'ops-cicd-github', 'infrastructure-ops'],
      configuration: ['infrastructure-ops', 'monitoring-ops'],
      'data-processing': [
        'data-ml-model',
        'etl-specialist',
        'analytics-specialist',
      ],
      frontend: ['frontend-dev', 'ui-designer', 'ux-designer'],
      backend: ['dev-backend-api', 'api-dev', 'database-architect'],
      'machine-learning': ['ai-ml-specialist', 'data-ml-model'],
      general: ['coder', 'developer', 'specialist'],
    };

    return operationAgentMap[operationType] || ['coder'];
  }

  private async scoreAgents(
    candidates: AgentInfo[],
    analysis: OperationAnalysis
  ): Promise<ScoredAgent[]> {
    const scoredAgents: ScoredAgent[] = [];

    for (const agent of candidates) {
      const score = await this.calculateAgentScore(agent, analysis);
      const reasoning = this.generateReasoning(agent, analysis, score);

      scoredAgents.push({
        agent,
        score: score.total,
        reasoning,
        scoreBreakdown: score.breakdown,
      });
    }

    return scoredAgents.sort((a, b) => b.score - a.score);
  }

  private async calculateAgentScore(
    agent: AgentInfo,
    analysis: OperationAnalysis
  ): Promise<AgentScore> {
    const breakdown: ScoreBreakdown = {
      skillMatch: 0,
      performance: 0,
      availability: 0,
      workload: 0,
      specialization: 0,
      historical: 0,
    };

    // Skill matching (40% weight)
    const skillMatchRatio = this.calculateSkillMatch(
      agent.capabilities,
      analysis.requiredSkills
    );
    breakdown.skillMatch = skillMatchRatio * 40;

    // Performance history (25% weight)
    breakdown.performance = agent.performance.successRate * 0.25 * 25;

    // Availability (15% weight)
    breakdown.availability = agent.availability ? 15 : 0;

    // Workload factor (10% weight)
    const workloadFactor = 1 - agent.currentWorkload / agent.maxWorkload;
    breakdown.workload = workloadFactor * 10;

    // Specialization bonus (5% weight)
    const specializationMatch = agent.specialties.some((specialty) =>
      analysis.requiredSkills.includes(specialty)
    );
    breakdown.specialization = specializationMatch ? 5 : 0;

    // Historical performance on similar tasks (5% weight)
    breakdown.historical =
      (await this.getHistoricalPerformanceScore(agent.id, analysis)) * 5;

    const total = Object.values(breakdown).reduce(
      (sum, score) => sum + score,
      0
    );

    return { total, breakdown };
  }

  private calculateSkillMatch(
    agentCapabilities: string[],
    requiredSkills: string[]
  ): number {
    if (requiredSkills.length === 0) return 1;

    const matches = requiredSkills.filter((skill) =>
      agentCapabilities.some((cap) =>
        cap.toLowerCase().includes(skill.toLowerCase())
      )
    );

    return matches.length / requiredSkills.length;
  }

  private generateReasoning(
    agent: AgentInfo,
    analysis: OperationAnalysis,
    score: AgentScore
  ): string {
    const reasons: string[] = [];

    if (score.breakdown.skillMatch > 20) {
      reasons.push(
        `Strong skill match for ${analysis.fileType} and ${analysis.operationType}`
      );
    }

    if (score.breakdown.performance > 20) {
      reasons.push(
        `Excellent performance history (${(agent.performance.successRate * 100).toFixed(1)}% success rate)`
      );
    }

    if (score.breakdown.workload > 7) {
      reasons.push('Good availability with manageable workload');
    }

    if (score.breakdown.specialization > 0) {
      reasons.push('Specialized experience in required domain');
    }

    if (reasons.length === 0) {
      reasons.push('Basic capability match for the operation');
    }

    return reasons.join('; ');
  }

  private async getHistoricalPerformanceScore(
    agentId: string,
    analysis: OperationAnalysis
  ): Promise<number> {
    // Mock implementation - would query actual performance database
    const historicalData = await this.loadPerformanceHistory(agentId);

    const relevantHistory = historicalData?.filter(
      (record) =>
        record.context['fileType'] === analysis['fileType'] ||
        record.context['operationType'] === analysis['operationType']
    );

    if (relevantHistory.length === 0) return 0.5; // Neutral score

    const successRate =
      relevantHistory.filter((record) => record.success).length /
      relevantHistory.length;
    return successRate;
  }

  private async estimatePerformance(
    agent: AgentInfo,
    context: OperationContext
  ): Promise<PerformanceEstimate> {
    // Base estimate on historical performance
    const baseTime = context.estimatedDuration;
    const performanceMultiplier = 2 - agent.performance.successRate; // Better agents are faster

    return {
      executionTime: baseTime * performanceMultiplier,
      memoryUsage: 100, // MB - mock value
      cpuUsage: 25, // % - mock value
      confidence: agent.performance.reliability,
      factors: [
        {
          name: 'Agent Experience',
          impact: agent.performance.successRate,
          description: 'Based on historical success rate',
        },
        {
          name: 'Current Workload',
          impact: 1 - agent.currentWorkload / agent.maxWorkload,
          description: 'Current availability and load',
        },
      ],
    };
  }

  private meetsRequirements(
    agent: AgentInfo,
    analysis: OperationAnalysis
  ): boolean {
    // Check if agent can handle the complexity
    if (
      analysis.complexity === 'expert' &&
      agent.performance.qualityScore < 0.8
    ) {
      return false;
    }

    // Check availability
    if (!agent.availability) {
      return false;
    }

    // Check workload capacity
    if (agent.currentWorkload >= agent.maxWorkload) {
      return false;
    }

    return true;
  }

  private calculateProjectedEfficiency(
    workloads: unknown[],
    recommendations: WorkloadRecommendation[]
  ): number {
    // Mock implementation - would calculate efficiency improvement
    const currentEfficiency =
      workloads.reduce((sum, wl) => sum + Math.min(wl.utilization, 1), 0) /
      workloads.length;
    const improvementPotential =
      recommendations.reduce((sum, rec) => sum + Math.abs(rec.impact), 0) /
      recommendations.length;

    return Math.min(currentEfficiency + improvementPotential * 0.1, 1);
  }

  // Mock implementations for data persistence (would integrate with actual storage)
  private async loadAgentMemory(
    _agentId: string
  ): Promise<Record<string, unknown>> {
    return {}; // Mock implementation
  }

  private async loadAgentPreferences(
    _agentId: string
  ): Promise<Record<string, unknown>> {
    return {}; // Mock implementation
  }

  private async loadLearningData(_agentId: string): Promise<LearningData[]> {
    return []; // Mock implementation
  }

  private async loadPerformanceHistory(
    _agentId: string
  ): Promise<PerformanceHistory[]> {
    return []; // Mock implementation
  }

  private async estimateOperationDuration(
    _operation: Operation
  ): Promise<number> {
    // Mock implementation - would use ML models for estimation
    return 300; // 5 minutes default
  }

  private async persistWorkloadUpdate(
    _agentId: string,
    _newWorkload: number
  ): Promise<void> {
    // Mock implementation
  }

  private async createAgentInfo(agentType: AgentType): Promise<AgentInfo> {
    // Mock implementation - would query actual agent registry
    const capabilities = this.agentCapabilityMap.get(agentType);

    return {
      id: `${agentType}-${Date.now()}`,
      type: agentType,
      name: `${agentType.charAt(0).toUpperCase() + agentType.slice(1).replace(/-/g, ' ')} Agent`,
      capabilities: capabilities?.skills || ['general'],
      currentWorkload: Math.random() * 50, // Mock workload
      maxWorkload: 100,
      performance: {
        successRate: 0.8 + Math.random() * 0.2,
        averageExecutionTime: 300 + Math.random() * 600,
        qualityScore: 0.7 + Math.random() * 0.3,
        userSatisfaction: 0.8 + Math.random() * 0.2,
        reliability: 0.85 + Math.random() * 0.15,
      },
      availability: Math.random() > 0.1, // 90% availability
      specialties: capabilities?.specialties || [],
    };
  }

  private initializeCapabilityMappings(): void {
    // Initialize agent capability profiles
    const capabilityProfiles: Array<[AgentType, AgentCapabilityProfile]> = [
      [
        'frontend-dev',
        {
          skills: ['typescript', 'javascript', 'nodejs'],
          specialties: ['web-development', 'frontend'],
          complexity: 'complex',
        },
      ],
      [
        'ai-ml-specialist',
        {
          skills: ['python', 'data-science'],
          specialties: ['automation', 'ml'],
          complexity: 'moderate',
        },
      ],
      [
        'specialist',
        {
          skills: ['rust', 'systems-programming'],
          specialties: ['performance', 'memory-safety'],
          complexity: 'expert',
        },
      ],
      // Add more mappings...
    ];

    capabilityProfiles.forEach(([agentType, profile]) => {
      this.agentCapabilityMap.set(agentType, profile);
    });
  }

  private initializeFileTypeMappings(): void {
    // Initialize file type to agent mappings
    this.fileTypeAgentMap.set('typescript', [
      'frontend-dev',
      'fullstack-dev',
      'developer',
    ]);
    this.fileTypeAgentMap.set('javascript', [
      'frontend-dev',
      'fullstack-dev',
      'developer',
    ]);
    this.fileTypeAgentMap.set('python', [
      'ai-ml-specialist',
      'data-ml-model',
      'developer',
    ]);
    this.fileTypeAgentMap.set('rust', ['specialist', 'performance-analyzer']);
    this.fileTypeAgentMap.set('golang', [
      'dev-backend-api',
      'api-dev',
      'developer',
    ]);
    this.fileTypeAgentMap.set('java', ['developer', 'specialist']);
    this.fileTypeAgentMap.set('cpp', ['specialist', 'performance-analyzer']);
    this.fileTypeAgentMap.set('markdown', ['documenter', 'technical-writer']);
    this.fileTypeAgentMap.set('sql', [
      'database-architect',
      'analytics-specialist',
    ]);
  }
}

// Supporting interfaces and types
interface OperationAnalysis {
  fileType: FileType;
  operationType: OperationType;
  complexity: ComplexityLevel;
  requiredSkills: string[];
  estimatedDuration: number;
  priority: number;
  urgency: UrgencyLevel;
  specialRequirements: string[];
}

type OperationType =
  | 'testing'
  | 'debugging'
  | 'refactoring'
  | 'code-review'
  | 'documentation'
  | 'analysis'
  | 'optimization'
  | 'security'
  | 'deployment'
  | 'configuration'
  | 'data-processing'
  | 'frontend'
  | 'backend'
  | 'machine-learning'
  | 'general';

interface ScoredAgent {
  agent: AgentInfo;
  score: number;
  reasoning: string;
  scoreBreakdown: ScoreBreakdown;
}

interface AgentScore {
  total: number;
  breakdown: ScoreBreakdown;
}

interface ScoreBreakdown {
  skillMatch: number;
  performance: number;
  availability: number;
  workload: number;
  specialization: number;
  historical: number;
}
