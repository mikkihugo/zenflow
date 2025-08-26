/**
 * @fileoverview Teamwork Package - Production-Grade Multi-Agent Collaboration System
 *
 * **COMPREHENSIVE MULTI-AGENT TEAMWORK PLATFORM**
 *
 * Enterprise-grade multi-agent collaboration system inspired by Microsoft AutoGen and ag2.ai,
 * designed for sophisticated agent teamwork, structured conversations, and collaborative problem-solving.
 *
 * **COLLABORATION CAPABILITIES:**
 * - 🤝 **Multi-Agent Conversations**: Structured dialogue between specialized agents
 * - 🎯 **Role-Based Collaboration**: Agents with specific roles, permissions, and expertise
 * - 🔄 **Workflow Orchestration**: Automated coordination of complex multi-step processes
 * - 🧠 **Collective Intelligence**: Emergent intelligence through agent collaboration
 * - 📝 **Consensus Building**: Automated agreement and decision-making processes
 * - 🎨 **Creative Collaboration**: Brainstorming, ideation, and creative problem-solving
 * - 🔍 **Code Review Teams**: Specialized teams for code analysis and improvement
 * - 📊 **Planning & Strategy**: Collaborative planning and strategic decision-making
 *
 * **SUPPORTED COLLABORATION PATTERNS:**
 * - 🚀 **Debate & Discussion**: Multi-perspective analysis with structured argumentation
 * - 🔧 **Problem-Solving Teams**: Collaborative troubleshooting and solution development
 * - 🎯 **Specialized Task Forces**: Expert teams for domain-specific challenges
 * - 📈 **Iterative Refinement**: Continuous improvement through feedback loops
 * - 🏗️ **Architecture Reviews**: Collaborative system design and technical planning
 * - 🧪 **Research & Analysis**: Multi-agent research and knowledge synthesis
 * - 📋 **Project Management**: Agile planning, sprint coordination, and retrospectives
 * - 🎓 **Learning & Teaching**: Knowledge transfer and skill development teams
 *
 * **ARCHITECTURE PATTERNS:**
 * - **Observer Pattern**: Real-time conversation monitoring and analytics
 * - **Mediator Pattern**: Centralized conversation orchestration and coordination
 * - **Strategy Pattern**: Pluggable conversation patterns and workflows
 * - **Command Pattern**: Structured action coordination and execution
 * - **State Machine**: Conversation flow control and state management
 * - **Publish-Subscribe**: Event-driven collaboration and notifications
 *
 * **KEY PERFORMANCE CHARACTERISTICS:**
 * - **Conversation Scaling**: Support for 2-50+ agents in structured dialogue
 * - **Real-time Coordination**: <100ms message routing and response coordination
 * - **Memory Efficiency**: Persistent conversation context with intelligent compression
 * - **Consensus Speed**: Automated agreement reaching in complex scenarios
 * - **Pattern Recognition**: Learning from successful collaboration patterns
 * - **Quality Assurance**: Built-in conversation quality metrics and optimization
 *
 * **COLLABORATION DOMAINS:**
 *
 * 🤝 **Multi-Agent Conversations** - Structured team discussions
 * ```typescript`
 * import { ConversationOrchestrator, TeamworkSystem } from '@claude-zen/teamwork';
 * // USE FOR: Complex problem-solving, code reviews, architectural decisions
 * // FEATURES: Role assignment, moderation, consensus building
 * // PERFORMANCE: Real-time coordination, scalable team sizes
 * ````
 *
 * 🎯 **Specialized Task Forces** - Expert teams for domain challenges
 * ```typescript`
 * import { SpecializedTeam, ExpertCoordinator } from '@claude-zen/teamwork';
 * // USE FOR: Technical analysis, security reviews, performance optimization
 * // FEATURES: Expert role matching, domain-specific workflows
 * // PERFORMANCE: Optimized for expertise utilization and quality outcomes
 * ````
 *
 * 🔄 **Workflow Orchestration** - Automated process coordination
 * ```typescript`
 * import { WorkflowOrchestrator, ProcessCoordinator } from '@claude-zen/teamwork';
 * // USE FOR: Multi-step processes, dependency management, parallel execution
 * // FEATURES: Workflow templates, dependency tracking, error handling
 * // PERFORMANCE: Parallel processing, intelligent resource allocation
 * ````
 *
 * 🧠 **Collective Intelligence** - Emergent team capabilities
 * ```typescript`
 * import { CollectiveIntelligence, TeamLearning } from '@claude-zen/teamwork';
 * // USE FOR: Complex analysis, creative solutions, strategic planning
 * // FEATURES: Knowledge synthesis, perspective integration, emergent insights
 * // PERFORMANCE: Intelligence amplification, quality enhancement
 * ````
 *
 * 📝 **Consensus Building** - Automated decision-making
 * ```typescript`
 * import { ConsensusBuilder, DecisionOrchestrator } from '@claude-zen/teamwork';
 * // USE FOR: Group decisions, conflict resolution, agreement coordination
 * // FEATURES: Voting mechanisms, conflict detection, compromise generation
 * // PERFORMANCE: Fast consensus, quality decision outcomes
 * ````
 *
 * **INTEGRATION EXAMPLES:**
 *
 * @example Comprehensive Code Review Team
 * ```typescript`
 * import { TeamworkSystem, ConversationOrchestrator } from '@claude-zen/teamwork';
 *
 * // Create specialized code review team
 * const codeReviewTeam = await TeamworkSystem.create({
 *   pattern: 'code-review',
 *   context: {
 *     goal: 'Review pull request for security, performance, and maintainability',
 *     domain: 'software-engineering',
 *     complexity: 'high',
 *     codebase: 'typescript-backend''
 *   },
 *   participants: [
 *     {
 *       id: 'security-expert',
 *       type: 'security-analyst',
 *       role: 'lead-security-reviewer',
 *       expertise: ['security', 'penetration-testing', 'threat-modeling']'
 *     },
 *     {
 *       id: 'performance-expert',
 *       type: 'performance-engineer',
 *       role: 'performance-reviewer',
 *       expertise: ['optimization', 'profiling', 'scalability']'
 *     },
 *     {
 *       id: 'architecture-expert',
 *       type: 'solutions-architect',
 *       role: 'architecture-reviewer',
 *       expertise: ['system-design', 'patterns', 'best-practices']'
 *     },
 *     {
 *       id: 'senior-developer',
 *       type: 'senior-engineer',
 *       role: 'code-quality-reviewer',
 *       expertise: ['typescript', 'testing', 'maintainability']'
 *     }
 *   ],
 *   moderator: {
 *     id: 'review-coordinator',
 *     type: 'review-moderator',
 *     role: 'conversation-facilitator''
 *   }
 * });
 *
 * // Execute structured code review conversation
 * const reviewResult = await codeReviewTeam.orchestrator.startConversation({
 *   initialPrompt: 'Please review the attached pull request focusing on your areas of expertise',
 *   attachments: [
 *     { type: 'pull-request', url: 'https://github.com/repo/pull/123' },
 *     { type: 'diff', content: diffContent }'
 *   ],
 *   expectedOutcomes: [
 *     'security-assessment',
 *     'performance-analysis',
 *     'architecture-evaluation',
 *     'code-quality-review',
 *     'consensus-recommendation''
 *   ]
 * });
 *
 * console.log(`Review completed with ${reviewResult.consensus.approval} approval`);`
 * console.log(`Key concerns: ${reviewResult.consensus.concerns.join(', ')}`);`
 * ````
 *
 * @example Advanced Problem-Solving Task Force
 * ```typescript`
 * import {
 *   SpecializedTeam,
 *   ProblemSolvingOrchestrator,
 *   CollectiveIntelligence
 * } from '@claude-zen/teamwork';
 *
 * // Create multi-disciplinary problem-solving team
 * const problemSolvingTeam = new SpecializedTeam({
 *   mission: 'Solve complex system performance degradation',
 *   approach: 'collaborative-analysis',
 *   teamComposition: {
 *     'data-scientist': {'
 *       count: 1,
 *       expertise: ['statistics', 'machine-learning', 'data-analysis'],
 *       role: 'pattern-analyzer''
 *     },
 *     'infrastructure-engineer': {'
 *       count: 1,
 *       expertise: ['kubernetes', 'monitoring', 'scaling'],
 *       role: 'infrastructure-analyst''
 *     },
 *     'application-engineer': {'
 *       count: 2,
 *       expertise: ['backend-optimization', 'database-tuning', 'caching'],
 *       role: 'application-optimizer''
 *     },
 *     'devops-engineer': {'
 *       count: 1,
 *       expertise: ['ci-cd', 'deployment', 'observability'],
 *       role: 'deployment-specialist''
 *     }
 *   },
 *   collaborationRules: {
 *     'hypothesis-driven': true,
 *     'evidence-based': true,
 *     'iterative-analysis': true,
 *     'consensus-required': true'
 *   }
 * });
 *
 * // Execute collaborative problem-solving workflow
 * const solution = await problemSolvingTeam.solve({
 *   problem: {
 *     description: 'API response times increased 300% over last week',
 *     symptoms: ['high-latency', 'memory-leaks', 'database-timeouts'],
 *     impact: 'critical',
 *     environment: 'production''
 *   },
 *   investigationPhases: [
 *     'data-collection',
 *     'hypothesis-generation',
 *     'testing-validation',
 *     'root-cause-analysis',
 *     'solution-design',
 *     'implementation-planning''
 *   ],
 *   constraints: {
 *     timeline: '4 hours',
 *     resources: 'existing-infrastructure',
 *     riskTolerance: 'low''
 *   }
 * });
 *
 * console.log(`Root cause identified: ${solution.rootCause}`);`
 * console.log(`Recommended solution: ${solution.recommendedSolution}`);`
 * console.log(`Team confidence: ${solution.consensus.confidence}%`);`
 * ````
 *
 * @example Creative Brainstorming and Innovation Session
 * ```typescript`
 * import {
 *   CreativeCollaboration,
 *   BrainstormingOrchestrator,
 *   IdeationFramework
 * } from '@claude-zen/teamwork';
 *
 * // Create diverse creative team for innovation
 * const innovationTeam = new CreativeCollaboration({
 *   objective: 'Design next-generation AI collaboration features',
 *   creativityMode: 'divergent-thinking',
 *   teamDiversity: {
 *     'product-visionary': {'
 *       perspective: 'user-experience',
 *       strengths: ['user-research', 'product-strategy', 'market-analysis']'
 *     },
 *     'technical-innovator': {'
 *       perspective: 'technical-feasibility',
 *       strengths: ['emerging-tech', 'scalability', 'implementation']'
 *     },
 *     'design-thinker': {'
 *       perspective: 'human-centered-design',
 *       strengths: ['usability', 'accessibility', 'interaction-design']'
 *     },
 *     'business-strategist': {'
 *       perspective: 'commercial-viability',
 *       strengths: ['market-fit', 'monetization', 'competitive-analysis']'
 *     },
 *     'ethics-advisor': {'
 *       perspective: 'responsible-ai',
 *       strengths: ['ai-safety', 'bias-mitigation', 'transparency']'
 *     }
 *   },
 *   brainstormingRules: {
 *     'no-criticism-phase': true,
 *     'build-on-ideas': true,
 *     'wild-ideas-welcome': true,
 *     'defer-judgment': true,
 *     'quantity-over-quality': true'
 *   }
 * });
 *
 * // Execute structured innovation session
 * const innovationResults = await innovationTeam.ideate({
 *   challenge: 'How might we enable AI agents to collaborate more naturally and effectively?',
 *   constraints: ['current-technology', 'user-privacy', 'cost-effectiveness'],
 *   successMetrics: ['user-adoption', 'task-completion-rate', 'collaboration-quality'],
 *   timeboxed: {
 *     divergence: '30 minutes',
 *     convergence: '20 minutes',
 *     refinement: '15 minutes''
 *   },
 *   techniques: [
 *     'mind-mapping',
 *     'what-if-scenarios',
 *     'reverse-brainstorming',
 *     'analogical-thinking',
 *     'constraint-removal''
 *   ]
 * });
 *
 * console.log(`Generated ${innovationResults.ideas.length} innovative concepts`);`
 * console.log(`Top concepts: ${innovationResults.topIdeas.map(i => i.title).join(', ')}`);`
 * console.log(`Team alignment score: ${innovationResults.alignment.score}`);`
 * ````
 *
 * @example Enterprise Planning and Strategy Session
 * ```typescript`
 * import {
 *   StrategicPlanning,
 *   ExecutiveTeam,
 *   ConsensusBuilder
 * } from '@claude-zen/teamwork';
 *
 * // Create executive-level strategic planning team
 * const executiveTeam = new ExecutiveTeam({
 *   planningHorizon: 'quarterly',
 *   decisionAuthority: 'executive-level',
 *   stakeholderRepresentation: {
 *     'cto': {'
 *       domain: 'technology-strategy',
 *       priorities: ['technical-debt', 'innovation', 'scalability'],
 *       veto: true
 *     },
 *     'cpo': {'
 *       domain: 'product-strategy',
 *       priorities: ['user-experience', 'market-fit', 'feature-prioritization'],
 *       veto: true
 *     },
 *     'cfo': {'
 *       domain: 'financial-strategy',
 *       priorities: ['cost-optimization', 'revenue-growth', 'roi'],
 *       veto: true
 *     },
 *     'head-of-engineering': {'
 *       domain: 'engineering-execution',
 *       priorities: ['team-productivity', 'quality', 'delivery-speed'],
 *       veto: false
 *     },
 *     'head-of-data': {'
 *       domain: 'data-strategy',
 *       priorities: ['data-quality', 'analytics', 'ml-capabilities'],
 *       veto: false
 *     }
 *   }
 * });
 *
 * // Execute strategic planning session
 * const strategicPlan = await executiveTeam.plan({
 *   session: {
 *     type: 'quarterly-planning',
 *     duration: '4 hours',
 *     format: 'structured-discussion''
 *   },
 *   agenda: [
 *     'current-state-assessment',
 *     'market-opportunity-analysis',
 *     'resource-allocation-review',
 *     'initiative-prioritization',
 *     'risk-assessment',
 *     'success-metrics-definition''
 *   ],
 *   constraints: {
 *     budget: '$2M quarterly',
 *     engineering: '50 person-months',
 *     timeline: 'Q2 2024',
 *     dependencies: ['infrastructure-upgrade', 'compliance-certification']'
 *   },
 *   decisionCriteria: {
 *     'strategic-alignment': 30,
 *     'technical-feasibility': 25,
 *     'market-opportunity': 20,
 *     'resource-efficiency': 15,
 *     'risk-mitigation': 10'
 *   }
 * });
 *
 * console.log(`Strategic initiatives approved: ${strategicPlan.initiatives.length}`);`
 * console.log(`Total investment: $${strategicPlan.totalBudget.toLocaleString()}`);`
 * console.log(`Executive consensus: ${strategicPlan.consensus.unanimous ? 'Unanimous' : 'Majority'}`);`
 * ````
 *
 * @example Real-time Learning and Knowledge Transfer
 * ```typescript`
 * import {
 *   LearningTeam,
 *   KnowledgeTransfer,
 *   SkillDevelopment
 * } from '@claude-zen/teamwork';
 *
 * // Create mentorship and learning team
 * const learningTeam = new LearningTeam({
 *   learningObjective: 'Advanced TypeScript and System Architecture',
 *   pedagogicalApproach: 'collaborative-learning',
 *   teamStructure: {
 *     'senior-mentors': {'
 *       count: 2,
 *       role: 'knowledge-provider',
 *       expertise: ['typescript-advanced', 'system-architecture', 'best-practices'],
 *       teachingStyle: 'socratic-method''
 *     },
 *     'learning-participants': {'
 *       count: 4,
 *       role: 'knowledge-seeker',
 *       currentLevel: 'intermediate',
 *       learningGoals: ['advanced-patterns', 'scalable-architecture', 'performance-optimization']'
 *     },
 *     'peer-collaborators': {'
 *       count: 3,
 *       role: 'peer-learner',
 *       currentLevel: 'intermediate-advanced',
 *       contributionMode: 'mutual-learning''
 *     }
 *   },
 *   learningMethods: [
 *     'code-reviews',
 *     'pair-programming',
 *     'architecture-discussions',
 *     'problem-solving-sessions',
 *     'knowledge-sharing-presentations''
 *   ]
 * });
 *
 * // Execute collaborative learning session
 * const learningOutcome = await learningTeam.learn({
 *   topic: 'Implementing scalable microservices architecture with TypeScript',
 *   format: 'workshop-style',
 *   duration: '2 hours',
 *   activities: [
 *     {
 *       type: 'conceptual-discussion',
 *       duration: '30 minutes',
 *       focus: 'architecture-principles''
 *     },
 *     {
 *       type: 'hands-on-coding',
 *       duration: '60 minutes',
 *       focus: 'implementation-patterns''
 *     },
 *     {
 *       type: 'code-review-session',
 *       duration: '20 minutes',
 *       focus: 'best-practices-application''
 *     },
 *     {
 *       type: 'reflection-discussion',
 *       duration: '10 minutes',
 *       focus: 'learning-consolidation''
 *     }
 *   ],
 *   assessmentCriteria: [
 *     'conceptual-understanding',
 *     'practical-application',
 *     'code-quality-improvement',
 *     'collaborative-contribution''
 *   ]
 * });
 *
 * console.log(`Learning objectives achieved: ${learningOutcome.objectivesAchieved}%`);`
 * console.log(`Participant engagement: ${learningOutcome.engagement.average}`);`
 * console.log(`Knowledge transfer effectiveness: ${learningOutcome.transferEffectiveness}`);`
 * ````
 *
 * **CONVERSATION PATTERNS AND WORKFLOWS:**
 *
 * 1. **Code Review Conversations**
 *    - Multi-expert review with specialized focus areas
 *    - Structured feedback collection and consensus building
 *    - Quality gates and approval workflows
 *
 * 2. **Problem-Solving Sessions**
 *    - Collaborative troubleshooting and root cause analysis
 *    - Hypothesis-driven investigation and validation
 *    - Solution design and implementation planning
 *
 * 3. **Brainstorming and Innovation**
 *    - Creative ideation with diverse perspectives
 *    - Structured creativity techniques and facilitation
 *    - Idea evaluation and selection processes
 *
 * 4. **Strategic Planning**
 *    - Executive-level decision-making and prioritization
 *    - Resource allocation and constraint management
 *    - Risk assessment and mitigation planning
 *
 * 5. **Learning and Development**
 *    - Mentorship and knowledge transfer sessions
 *    - Collaborative skill development and practice
 *    - Peer learning and mutual support
 *
 * **FOUNDATION INTEGRATION BENEFITS:**
 * - Persistent conversation context and memory
 * - Integrated storage for conversation artifacts
 * - Professional telemetry and collaboration analytics
 * - Secure participant management and access control
 * - Cost optimization for large team conversations
 *
 * **ADVANCED FEATURES:**
 * - Intelligent conversation moderation and facilitation
 * - Automatic role assignment based on expertise
 * - Real-time consensus tracking and visualization
 * - Conversation quality metrics and optimization
 * - Learning from successful collaboration patterns
 * - Integration with external collaboration tools
 *
 * @author Claude Zen Team & Microsoft AutoGen Research Team
 * @version 2.0.0 (Production Multi-Agent Collaboration)
 * @license MIT
 * @see {@link https://ag2.ai} AutoGen Multi-Agent Framework
 */

// =============================================================================
// PRIMARY ENTRY POINT - Main teamwork system
// =============================================================================
// ConversationFramework is defined in this file, exported at the bottom


// Brain intelligence types
export type {
  BrainMeetingConfig,
  BrainMeetingOutcome,
  BrainMeetingParticipant,
  MeetingIssue,
} from './src/brain';
// =============================================================================
// BRAIN INTELLIGENCE - Brain-enhanced meeting intelligence
// =============================================================================
export {
  BrainMeetingIntelligence,
  createBrainMeetingIntelligence,
  enhanceTeamworkWithBrain,
} from './src/brain';
// =============================================================================
// ORCHESTRATION - Conversation orchestration and coordination
// =============================================================================
export { ConversationOrchestratorImpl as ConversationOrchestrator, ConversationOrchestratorImpl as TeamCoordinator } from './src/main';
// =============================================================================
// STORAGE - Conversation storage and persistence
// =============================================================================
export { conversationStorage, getConversationStorage } from './src/storage';
// =============================================================================
// TYPE DEFINITIONS - Interfaces and types (tree-shakable)
// =============================================================================
export type {
  ConversationConfig,
  ConversationConfig as TeamConfig,
  ConversationContext,
  ConversationContext as TeamContext,
  ConversationMessage,
  ConversationMessage as TeamMessage,
  ConversationMetrics,
  ConversationMetrics as TeamMetrics,
  ConversationOrchestrator as IConversationOrchestrator,
  ConversationOrchestrator as ITeamCoordinator,
  ConversationOutcome,
  ConversationOutcome as TeamOutcome,
  ConversationParticipant,
  ConversationParticipant as TeamMember,
  ConversationPattern,
  ConversationPattern as TeamPattern,
  ConversationRole,
  ConversationRole as TeamRole,
  DialoguePattern,
  TeamworkConfig,
} from './src/types';

/**
 * Conversation framework with shared storage.
 *
 * @example
 * ```typescript`
 * const system = await ConversationSystem.create();
 * ````
 */
export interface ConversationSystem {
  orchestrator: import('./src/types').ConversationOrchestrator;'
}

/**
 * Conversation Framework.
 *
 * ag2.ai-inspired conversations with @claude-zen/foundation storage.
 *
 * @example
 * ```typescript`
 * const system = await ConversationFramework.create();
 * const patterns = ConversationFramework.getAvailablePatterns();
 * ````
 */
class ConversationFramework {
  /**
   * Create a conversation system with persistent storage.
   */
  static async create(): Promise<ConversationSystem> {
    const { ConversationOrchestratorImpl } = await import('./src/main');'
    const orchestrator = new ConversationOrchestratorImpl();

    return {
      orchestrator,
    };
  }

  /**
   * Get available conversation patterns.
   */
  static getAvailablePatterns(): string[] {
    return [
      'code-review',
      'problem-solving',
      'brainstorming',
      'planning',
      'debugging',
      'architecture-review',
      'sprint-planning',
      'retrospective',
    ];
  }

  /**
   * Get conversation framework capabilities.
   */
  static getCapabilities(): string[] {
    return [
      'multi-agent-conversations',
      'structured-dialogue-patterns',
      'conversation-memory',
      'outcome-tracking',
      'consensus-building',
      'role-based-participation',
      'workflow-orchestration',
      'moderation-support',
      'learning-from-conversations',
    ];
  }

  /**
   * Validate conversation configuration.
   *
   * @param config
   */
  static validateConfig(config: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config?.title''||''''||''typeof config.title !=='string') '
      errors.push('Title is required and must be a string');'

    if (!config?.pattern''||''''||''typeof config.pattern !=='string') '
      errors.push('Pattern is required and must be a string');'

    if (!config?.context?.goal''||''''||''typeof config.context.goal !=='string') '
      errors.push('Goal is required and must be a string');'

    if (!config?.context?.domain''||''''||''typeof config.context.domain !=='string') '
      errors.push('Domain is required and must be a string');'

    if (
      !Array.isArray(config?.initialParticipants)''||''''||''config.initialParticipants.length === 0'
    ) 
      errors.push('At least one participant is required');'

    if (config?.initialParticipants) {
      config.initialParticipants.forEach((participant: any, index: number) => {
        if (!(participant?.id && participant?.type && participant?.swarmId)) {
          errors.push(
            `Participant ${index} missing required fields (id, type, swarmId)``
          );
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// =============================================================================
// EXPORT CONVERSATION FRAMEWORK
// =============================================================================
export { ConversationFramework };

// Add the primary entry point exports at the end - STANDARDIZED NAMES
export { ConversationFramework as TeamworkSystem };
export { ConversationFramework as TeamFramework };
export { ConversationFramework as default };

/**
 * Ag2.ai Integration Summary.
 *
 * This conversation framework brings ag2.ai's key concepts to claude-code-zen:'
 *
 * 1. **Multi-Agent Conversations**: Structured dialogue between specialized agents
 * 2. **Conversation Patterns**: Predefined workflows for common scenarios
 * 3. **Role-Based Participation**: Agents have specific roles and permissions
 * 4. **Teachable Interactions**: Agents learn from conversation outcomes
 * 5. **Group Chat Coordination**: Support for multi-participant discussions
 * 6. **Conversation Memory**: Persistent context and history
 *
 * Key differences from ag2.ai:
 * - Uses claude-code-zen's existing 147+ agent types'
 * - Integrates with existing memory and coordination systems
 * - Supports domain-driven conversation patterns
 * - Built for the claude-code-zen architecture and requirements.
 */
