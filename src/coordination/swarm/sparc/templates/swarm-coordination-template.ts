/**
 * SPARC Template: Swarm Coordination System.
 *
 * Comprehensive template for developing swarm coordination systems using SPARC methodology.
 * Includes pre-defined requirements, architecture patterns, and implementation strategies.
 */
/**
 * @file Coordination system: swarm-coordination-template.
 */

import { nanoid } from 'nanoid';
import type {
  ArchitectureDesign,
  DetailedSpecification,
  ProjectSpecification,
  PseudocodeStructure,
  SPARCTemplate,
  TemplateMetadata,
} from '../types/sparc-types.ts';

export const SWARM_COORDINATION_TEMPLATE: SPARCTemplate = {
  id: 'swarm-coordination-template',
  name: 'Swarm Coordination System',
  domain: 'swarm-coordination',
  description:
    'Comprehensive template for swarm coordination and multi-agent orchestration systems',
  version: '1.0.0',
  metadata: {
    author: 'SPARC Swarm Coordination Template Generator',
    createdAt: new Date(),
    tags: ['swarm', 'coordination', 'multi-agent', 'orchestration'],
    complexity: 'high',
    estimatedDevelopmentTime: '8-12 weeks',
    targetPerformance: 'Sub-5ms agent coordination, 1000+ concurrent agents',
  } as TemplateMetadata,

  specification: {
    id: nanoid(),
    domain: 'swarm-coordination',
    functionalRequirements: [
      {
        id: nanoid(),
        title: 'Agent Registration and Discovery',
        description:
          'Dynamic agent registration with capability discovery and health monitoring',
        type: 'core',
        priority: 'HIGH',
        testCriteria: [
          'Agents can register with unique ID and capabilities within 100ms',
          'System maintains real-time agent registry with automatic updates',
          'Failed agents are automatically deregistered within 30 seconds',
        ],
      },
      {
        id: nanoid(),
        title: 'Intelligent Task Distribution',
        description:
          'Distribute tasks based on agent capabilities, load, and performance history',
        type: 'core',
        priority: 'HIGH',
        testCriteria: [
          'Tasks routed to most suitable agent within 100ms',
          'Load balancing maintains <20% variance in agent utilization',
          'System handles agent failures with automatic task redistribution',
        ],
      },
      {
        id: nanoid(),
        title: 'Swarm Health Monitoring',
        description:
          'Comprehensive monitoring of swarm health and coordination efficiency',
        type: 'monitoring',
        priority: 'HIGH',
        testCriteria: [
          'Real-time monitoring of all active agents',
          'Detection of performance degradation within 5 seconds',
          'Automatic scaling based on load patterns',
        ],
      },
    ],
    nonFunctionalRequirements: [
      {
        id: nanoid(),
        title: 'Coordination Performance',
        description: 'Ultra-fast agent coordination and task distribution',
        metrics: {
          'coordination-latency': '<5ms',
          'task-distribution-time': '<100ms',
          'agent-registration-time': '<100ms',
        },
        priority: 'HIGH',
      },
      {
        id: nanoid(),
        title: 'Scalability',
        description: 'Support for large-scale swarms',
        metrics: {
          'max-agents': '1000+',
          'concurrent-tasks': '10000+',
          throughput: '1000 tasks/second',
        },
        priority: 'HIGH',
      },
    ],
    constraints: [
      {
        id: nanoid(),
        type: 'performance',
        description: 'Coordination latency must be under 5ms',
        impact: 'high',
      },
      {
        id: nanoid(),
        type: 'performance',
        description: 'System must scale to 1000+ concurrent agents',
        impact: 'high',
      },
    ],
    assumptions: [
      {
        id: nanoid(),
        description: 'Network latency between agents is stable',
        confidence: 'medium',
        riskIfIncorrect: 'MEDIUM',
      },
    ],
    dependencies: [
      {
        id: nanoid(),
        name: 'Agent Communication Protocol',
        type: 'service',
        critical: true,
      },
    ],
    acceptanceCriteria: [
      {
        id: nanoid(),
        requirement: 'agent-registration',
        criteria: [
          'Registration completes within 100ms',
          'Capabilities properly indexed',
        ],
        testMethod: 'automated',
      },
    ],
    riskAssessment: {
      risks: [
        {
          id: nanoid(),
          description: 'Network partitions affecting coordination',
          probability: 'medium',
          impact: 'high',
          category: 'technical',
        },
      ],
      mitigationStrategies: [
        {
          riskId: 'network-partition',
          strategy:
            'Implement Byzantine fault tolerance and partition tolerance',
          priority: 'HIGH',
          effort: 'high',
        },
      ],
      overallRisk: 'MEDIUM',
    },
    successMetrics: [
      {
        id: nanoid(),
        name: 'Coordination Efficiency',
        description: 'Measure of overall swarm coordination effectiveness',
        target: '>95% task completion rate',
        measurement: 'Automated monitoring',
      },
    ],
  },

  pseudocode: {
    id: nanoid(),
    algorithms: [
      {
        name: 'AgentRegistration',
        purpose: 'Register new agent with swarm coordination system',
        inputs: [
          {
            name: 'agentId',
            type: 'string',
            description: 'Unique agent identifier',
          },
          {
            name: 'capabilities',
            type: 'Capability[]',
            description: 'Agent capabilities',
          },
        ],
        outputs: [
          {
            name: 'registrationResult',
            type: 'RegistrationResult',
            description: 'Registration outcome',
          },
        ],
        steps: [
          {
            stepNumber: 1,
            description: 'Validate agent ID uniqueness',
            pseudocode: 'IF registry.contains(agentId) THEN RETURN ERROR',
          },
          {
            stepNumber: 2,
            description: 'Store agent capabilities',
            pseudocode: 'registry.store(agentId, capabilities)',
          },
          {
            stepNumber: 3,
            description: 'Initialize health monitoring',
            pseudocode: 'healthMonitor.start(agentId)',
          },
        ],
        complexity: {
          timeComplexity: 'O(1)',
          spaceComplexity: 'O(1)',
          scalability: 'Constant time registration',
          worstCase: 'O(log n)',
        },
        optimizations: [],
      },
    ],
    coreAlgorithms: [], // Backward compatibility
    dataStructures: [
      {
        name: 'AgentRegistry',
        type: 'class',
        properties: [
          {
            name: 'agents',
            type: 'Map<string, AgentInfo>',
            visibility: 'private',
            description: 'Map of agent IDs to agent information',
          },
        ],
        methods: [
          {
            name: 'register',
            parameters: [
              {
                name: 'agentId',
                type: 'string',
                description: 'Unique agent identifier',
              },
              {
                name: 'info',
                type: 'AgentInfo',
                description: 'Agent information',
              },
            ],
            returnType: 'boolean',
            visibility: 'public',
            description: 'Register new agent',
          },
        ],
        relationships: [],
      },
    ],
    controlFlows: [],
    optimizations: [
      {
        type: 'caching',
        description: 'Cache agent capabilities for faster task matching',
        impact: 'high',
        effort: 'medium',
      },
    ],
    dependencies: [],
    complexityAnalysis: {
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      scalability: 'Linear scaling with agent count',
      worstCase: 'O(n log n)',
      bottlenecks: ['Network communication', 'Consensus protocols'],
    },
  },

  architecture: {
    id: nanoid(),
    components: [
      {
        name: 'SwarmCoordinator',
        type: 'service',
        responsibilities: [
          'Agent registration',
          'Task distribution',
          'Health monitoring',
        ],
        interfaces: ['ISwarmCoordinator'],
        dependencies: ['AgentRegistry', 'TaskQueue'],
        qualityAttributes: {
          performance: 'Sub-5ms coordination',
          scalability: '1000+ agents',
        },
        performance: {
          expectedLatency: '<5ms',
          optimizations: ['Connection pooling', 'Async processing'],
        },
      },
    ],
    securityRequirements: [
      {
        id: nanoid(),
        type: 'authentication',
        description: 'Agent authentication and authorization',
        implementation: 'JWT tokens with capability-based access',
        priority: 'HIGH',
      },
    ],
    scalabilityRequirements: [
      {
        id: nanoid(),
        type: 'horizontal',
        description: 'Scale coordination nodes horizontally',
        target: 'Linear scaling up to 1000 agents',
        implementation: 'Consistent hashing and load balancing',
        priority: 'HIGH',
      },
    ],
    qualityAttributes: [
      {
        name: 'High Performance',
        type: 'performance',
        criteria: ['Coordination latency < 5ms', 'Task distribution < 100ms'],
        measurement: 'Automated performance monitoring',
        priority: 'HIGH',
        target: 'Sub-5ms coordination latency',
      },
    ],
    systemArchitecture: {
      components: [],
      interfaces: [],
      dataFlow: [],
      deploymentUnits: [],
      qualityAttributes: [],
      architecturalPatterns: [],
      technologyStack: [],
    },
    componentDiagrams: [],
    dataFlow: [],
    deploymentPlan: [],
    validationResults: {
      overall: true,
      score: 100,
      results: [],
      recommendations: [],
    },
    relationships: [],
    patterns: [],
  },

  async applyTo(projectSpec: ProjectSpecification) {
    return {
      specification: this.customizeSpecification(projectSpec),
      pseudocode: this.customizePseudocode(projectSpec),
      architecture: this.customizeArchitecture(projectSpec),
    };
  },

  customizeSpecification(
    projectSpec: ProjectSpecification,
  ): DetailedSpecification {
    const customized = { ...this.specification };
    customized.domain = projectSpec.domain;

    // Add project-specific requirements
    if (projectSpec.requirements) {
      for (const requirement of projectSpec.requirements) {
        customized.functionalRequirements.push({
          id: nanoid(),
          title: requirement,
          description: `Project-specific requirement: ${requirement}`,
          type: 'custom',
          priority: 'MEDIUM',
          testCriteria: [`Implements ${requirement} successfully`],
        });
      }
    }

    return customized;
  },

  customizePseudocode(projectSpec: ProjectSpecification): PseudocodeStructure {
    const customized = { ...this.pseudocode };

    // Adjust complexity based on project requirements
    if (projectSpec.complexity === 'simple') {
      customized.algorithms = customized.algorithms.slice(0, 2); // Simplify for simple projects
    }

    return customized;
  },

  customizeArchitecture(projectSpec: ProjectSpecification): ArchitectureDesign {
    const customized = { ...this.architecture };

    // Adjust components based on complexity
    if (projectSpec.complexity === 'enterprise') {
      customized.components.push({
        name: 'EnterpriseSecurityManager',
        type: 'service',
        responsibilities: ['Enterprise security compliance', 'Audit logging'],
        interfaces: ['ISecurityManager'],
        dependencies: ['AuditLogger'],
        qualityAttributes: {
          security: 'Enterprise-grade',
          compliance: 'SOC2, GDPR',
        },
        performance: {
          expectedLatency: '<10ms',
        },
      });
    }

    return customized;
  },

  validateCompatibility(projectSpec: ProjectSpecification): {
    compatible: boolean;
    warnings: string[];
    recommendations: string[];
  } {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    if (projectSpec.domain !== 'swarm-coordination') {
      warnings.push('Project domain does not match template domain');
      recommendations.push(
        'Consider using a swarm-coordination specific template',
      );
    }

    if (
      projectSpec.complexity === 'simple' &&
      this.metadata.complexity === 'high'
    ) {
      warnings.push('Template complexity may be higher than needed');
      recommendations.push('Consider simplifying the architecture');
    }

    return {
      compatible: warnings.length === 0,
      warnings,
      recommendations,
    };
  },
};
