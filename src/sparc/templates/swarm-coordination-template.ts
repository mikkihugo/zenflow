/**
 * SPARC Template: Swarm Coordination System
 *
 * Comprehensive template for developing swarm coordination systems using SPARC methodology.
 * Includes pre-defined requirements, architecture patterns, and implementation strategies.
 */

import type {
  AlgorithmPseudocode,
  Component,
  DetailedSpecification,
  FunctionalRequirement,
  ImplementationArtifacts,
  InterfaceDefinition,
  NonFunctionalRequirement,
  ProjectRisk,
  RefinementStrategy,
  SystemArchitecture,
  SystemConstraint,
} from '../types/sparc-types';

export const SWARM_COORDINATION_TEMPLATE = {
  name: 'Swarm Coordination System',
  domain: 'swarm-coordination' as const,
  description:
    'Template for building intelligent swarm coordination and multi-agent orchestration systems',

  /**
   * Pre-defined specification template for swarm coordination
   */
  specificationTemplate: {
    functionalRequirements: [
      {
        id: 'FR-SWM-001',
        title: 'Agent Registration and Discovery',
        description:
          'System must support dynamic agent registration with capability discovery and health monitoring',
        priority: 'HIGH' as const,
        testCriteria: [
          'Agents can register with unique ID and capabilities within 100ms',
          'System maintains real-time agent registry with automatic updates',
          'Failed agents are automatically deregistered within 30 seconds',
          'Agent capabilities are discoverable via registry API',
          'Registration supports capability-based filtering and search',
        ],
        dependencies: ['swarm-infrastructure', 'agent-communication'],
      },
      {
        id: 'FR-SWM-002',
        title: 'Intelligent Task Distribution',
        description:
          'System must distribute tasks based on agent capabilities, current load, and performance history',
        priority: 'HIGH' as const,
        testCriteria: [
          'Tasks routed to most suitable agent within 100ms',
          'Load balancing maintains <20% variance in agent utilization',
          'System handles agent failures with automatic task redistribution',
          'Task assignment considers agent performance history',
          'Complex tasks can be decomposed and distributed to multiple agents',
        ],
        dependencies: ['agent-registry', 'load-balancer', 'task-queue'],
      },
      {
        id: 'FR-SWM-003',
        title: 'Swarm Health Monitoring',
        description:
          'Comprehensive monitoring of swarm health, performance, and coordination efficiency',
        priority: 'HIGH' as const,
        testCriteria: [
          'Real-time monitoring of all active agents',
          'Detection of performance degradation within 5 seconds',
          'Automatic scaling based on load patterns',
          'Health metrics accessible via dashboard and API',
          'Proactive alerting for critical swarm issues',
        ],
      },
      {
        id: 'FR-SWM-004',
        title: 'Consensus and Coordination',
        description: 'Distributed consensus protocols for coordinated decision making',
        priority: 'MEDIUM' as const,
        testCriteria: [
          'Consensus achieved in <500ms for critical decisions',
          'Byzantine fault tolerance for up to 33% malicious agents',
          'Coordination protocols scale to 1000+ agents',
          'Conflict resolution for competing task assignments',
          'Distributed state synchronization across swarm',
        ],
      },
      {
        id: 'FR-SWM-005',
        title: 'Adaptive Learning',
        description: 'Swarm learning from coordination patterns to optimize future decisions',
        priority: 'MEDIUM' as const,
        testCriteria: [
          'Performance patterns identified and utilized',
          'Agent collaboration efficiency improves over time',
          'Task distribution strategies adapt based on outcomes',
          'Learning models updated with minimal performance impact',
          'Swarm intelligence emerges from individual agent behaviors',
        ],
      },
    ] as FunctionalRequirement[],

    nonFunctionalRequirements: [
      {
        id: 'NFR-SWM-001',
        title: 'Coordination Performance',
        description: 'High-performance coordination with minimal overhead',
        metrics: {
          'coordination-latency': '<5ms for agent-to-agent communication',
          'task-assignment-time': '<100ms for task distribution',
          throughput: '10,000+ tasks/second coordination capacity',
          'concurrent-agents': 'Support 1,000+ simultaneous agents',
          'consensus-time': '<500ms for distributed decisions',
        },
        priority: 'HIGH' as const,
      },
      {
        id: 'NFR-SWM-002',
        title: 'Fault Tolerance',
        description: 'Resilient coordination under failures and network partitions',
        metrics: {
          availability: '99.9% uptime under normal conditions',
          'recovery-time': '<30 seconds after coordinator failure',
          'partition-tolerance': 'Continue operation during network splits',
          'failure-detection': '<5 seconds to detect agent failures',
          'graceful-degradation': 'Maintain core functionality with 50% agent loss',
        },
        priority: 'HIGH' as const,
      },
      {
        id: 'NFR-SWM-003',
        title: 'Scalability',
        description: 'Linear scalability with swarm size and task complexity',
        metrics: {
          'horizontal-scaling': 'Linear performance with coordinator instances',
          'agent-scaling': 'Support up to 10,000 agents per coordinator',
          'task-complexity': 'Handle complex multi-agent workflows',
          'memory-efficiency': '<100MB base memory per 1000 agents',
          'network-efficiency': 'Minimal bandwidth overhead for coordination',
        },
        priority: 'HIGH' as const,
      },
    ] as NonFunctionalRequirement[],

    constraints: [
      {
        id: 'SC-SWM-001',
        type: 'technical' as const,
        description: 'Must integrate with existing Claude-Zen coordination infrastructure',
        impact: 'high' as const,
      },
      {
        id: 'SC-SWM-002',
        type: 'performance' as const,
        description: 'Sub-5ms coordination latency requirement for real-time applications',
        impact: 'high' as const,
      },
      {
        id: 'SC-SWM-003',
        type: 'technical' as const,
        description: 'TypeScript implementation with strict type safety',
        impact: 'medium' as const,
      },
    ] as SystemConstraint[],
  },

  /**
   * Core algorithm pseudocode for swarm coordination
   */
  algorithmTemplates: [
    {
      name: 'IntelligentLoadBalancer',
      purpose:
        'Distribute tasks optimally across swarm agents based on capabilities, load, and performance history',
      inputs: [
        {
          name: 'task',
          type: 'SwarmTask',
          description: 'Task to be assigned with requirements and priority',
        },
        {
          name: 'availableAgents',
          type: 'SwarmAgent[]',
          description: 'Currently active and capable agents',
        },
        {
          name: 'performanceHistory',
          type: 'PerformanceMetrics[]',
          description: 'Historical performance data',
        },
      ],
      outputs: [
        {
          name: 'assignment',
          type: 'AgentAssignment',
          description: 'Selected agent with confidence score and reasoning',
        },
      ],
      steps: [
        {
          stepNumber: 1,
          description: 'Filter agents by task capability requirements',
          pseudocode: `
            compatibleAgents = []
            FOR each agent in availableAgents:
              IF agent.capabilities.containsAll(task.requiredCapabilities):
                IF agent.currentLoad < agent.maxCapacity * 0.8:
                  compatibleAgents.add(agent)
            
            IF compatibleAgents.isEmpty():
              RETURN InsufficientCapabilityError(task.requiredCapabilities)
          `,
          complexity: 'O(n * m)', // n = agents, m = capabilities
        },
        {
          stepNumber: 2,
          description: 'Calculate multi-criteria scoring for each compatible agent',
          pseudocode: `
            agentScores = []
            FOR each agent in compatibleAgents:
              loadScore = calculateLoadScore(agent.currentTasks, agent.maxCapacity)
              performanceScore = calculatePerformanceScore(agent, performanceHistory)
              capabilityScore = calculateCapabilityMatch(agent.capabilities, task.requirements)
              affinityScore = calculateTaskAffinity(agent, task)
              
              // Weighted scoring with domain-specific weights
              totalScore = (
                loadScore * 0.3 +           // Load balancing
                performanceScore * 0.4 +    // Historical performance
                capabilityScore * 0.2 +     // Capability match
                affinityScore * 0.1         // Task affinity
              )
              
              agentScores.add({
                agent: agent,
                score: totalScore,
                reasoning: createScoringReasoning(loadScore, performanceScore, capabilityScore, affinityScore)
              })
          `,
          complexity: 'O(n * h)', // n = compatible agents, h = history size
        },
        {
          stepNumber: 3,
          description:
            'Select optimal agent using multi-criteria decision making with confidence calculation',
          pseudocode: `
            sortedAgents = agentScores.sortByScore(descending=true)
            
            IF sortedAgents.length == 0:
              RETURN NoSuitableAgentError()
            
            selectedAgent = sortedAgents[0]
            
            // Calculate confidence based on score distribution
            confidenceScore = calculateConfidence(
              selectedAgent.score,
              sortedAgents.length > 1 ? sortedAgents[1].score : 0,
              scoreVariance(sortedAgents)
            )
            
            // Validate assignment before committing
            IF confidenceScore < 0.7 AND task.priority != "CRITICAL":
              RETURN LowConfidenceWarning(selectedAgent, confidenceScore)
            
            RETURN AgentAssignment(
              agent: selectedAgent.agent,
              confidence: confidenceScore,
              reasoning: selectedAgent.reasoning,
              timestamp: getCurrentTime(),
              expectedCompletion: estimateCompletionTime(selectedAgent.agent, task)
            )
          `,
          complexity: 'O(n log n)', // sorting agents by score
        },
      ],
      complexity: {
        timeComplexity: 'O(n * m + n * h + n log n)',
        spaceComplexity: 'O(n)',
        scalability:
          'Linear with agent count, suitable for 1000+ agents with performance history optimization',
      },
      optimizations: [
        {
          type: 'performance',
          description: 'Cache agent capability matrices for faster filtering',
          impact: 'high',
          effort: 'medium',
        },
        {
          type: 'performance',
          description: 'Use rolling performance metrics to limit history size',
          impact: 'medium',
          effort: 'low',
        },
        {
          type: 'memory',
          description: 'Implement agent scoring result caching for repeated similar tasks',
          impact: 'medium',
          effort: 'medium',
        },
      ],
    },
    {
      name: 'SwarmConsensusProtocol',
      purpose:
        'Achieve distributed consensus for critical swarm decisions with Byzantine fault tolerance',
      inputs: [
        {
          name: 'proposal',
          type: 'ConsensusProposal',
          description: 'Proposal requiring consensus decision',
        },
        {
          name: 'participants',
          type: 'SwarmAgent[]',
          description: 'Participating agents in consensus',
        },
        {
          name: 'quorumSize',
          type: 'number',
          description: 'Minimum participants required for valid consensus',
        },
      ],
      outputs: [
        {
          name: 'decision',
          type: 'ConsensusDecision',
          description: 'Final consensus decision with proof',
        },
      ],
      steps: [
        {
          stepNumber: 1,
          description: 'Initialize consensus round with proposal broadcasting',
          pseudocode: `
            consensusRound = createConsensusRound(proposal)
            
            // Broadcast proposal to all participants
            FOR each participant in participants:
              sendProposal(participant, proposal, consensusRound.id)
            
            votes = []
            startTime = getCurrentTime()
            timeout = startTime + CONSENSUS_TIMEOUT
          `,
        },
        {
          stepNumber: 2,
          description: 'Collect and validate votes with Byzantine fault detection',
          pseudocode: `
            WHILE getCurrentTime() < timeout AND votes.length < participants.length:
              vote = receiveVote(timeout - getCurrentTime())
              
              IF vote != null:
                // Validate vote authenticity and participant eligibility
                IF validateVote(vote, participants) AND !isDuplicateVote(vote, votes):
                  votes.add(vote)
                ELSE:
                  markPotentialByzantineAgent(vote.sender)
            
            // Check if we have sufficient votes for consensus
            IF votes.length < quorumSize:
              RETURN ConsensusFailure("Insufficient votes", votes.length, quorumSize)
          `,
        },
        {
          stepNumber: 3,
          description: 'Apply consensus algorithm with Byzantine fault tolerance',
          pseudocode: `
            // Use modified PBFT (Practical Byzantine Fault Tolerance)
            acceptVotes = votes.filter(vote => vote.decision == "ACCEPT")
            rejectVotes = votes.filter(vote => vote.decision == "REJECT")
            
            // Byzantine fault tolerance: need 2/3 + 1 majority
            requiredMajority = Math.floor(votes.length * 2/3) + 1
            
            consensusDecision = null
            
            IF acceptVotes.length >= requiredMajority:
              consensusDecision = "ACCEPT"
            ELSE IF rejectVotes.length >= requiredMajority:
              consensusDecision = "REJECT"
            ELSE:
              consensusDecision = "NO_CONSENSUS"
            
            // Create consensus proof
            proof = createConsensusProof(votes, consensusDecision, consensusRound)
            
            RETURN ConsensusDecision(
              decision: consensusDecision,
              proof: proof,
              participantCount: votes.length,
              byzantineFaults: detectByzantineFaults(votes),
              timestamp: getCurrentTime()
            )
          `,
        },
      ],
      complexity: {
        timeComplexity: 'O(n) for n participants',
        spaceComplexity: 'O(n) for vote storage',
        scalability:
          'Suitable for up to 100 participants in consensus, scales with network latency',
      },
    },
  ] as AlgorithmPseudocode[],

  /**
   * System architecture template for swarm coordination
   */
  architectureTemplate: {
    components: [
      {
        name: 'SwarmCoordinator',
        type: 'service' as const,
        responsibilities: [
          'Central coordination of swarm activities',
          'Agent lifecycle management',
          'Task distribution orchestration',
          'System health monitoring and alerting',
        ],
        interfaces: ['ISwarmCoordinator', 'IHealthMonitor', 'ITaskOrchestrator'],
        dependencies: ['AgentRegistry', 'LoadBalancer', 'ConsensusEngine', 'MessageBroker'],
        qualityAttributes: {
          availability: 0.999,
          scalability: 'horizontal',
          performance: '<5ms coordination overhead',
        },
      },
      {
        name: 'AgentRegistry',
        type: 'service' as const,
        responsibilities: [
          'Agent registration and deregistration',
          'Capability discovery and indexing',
          'Agent health status tracking',
          'Dynamic capability updates',
        ],
        interfaces: ['IAgentRegistry', 'ICapabilityIndex'],
        dependencies: ['MemoryStore', 'EventBus'],
        qualityAttributes: {
          consistency: 'eventual',
          performance: '<10ms registry operations',
          capacity: '10,000+ registered agents',
        },
      },
      {
        name: 'IntelligentLoadBalancer',
        type: 'service' as const,
        responsibilities: [
          'Optimal task-agent assignment',
          'Load monitoring and balancing',
          'Performance prediction and optimization',
          'Historical performance analysis',
        ],
        interfaces: ['ILoadBalancer', 'IPerformancePredictor'],
        dependencies: ['AgentRegistry', 'TaskQueue', 'PerformanceAnalyzer'],
        qualityAttributes: {
          latency: '<100ms task assignment',
          accuracy: '>95% optimal assignments',
          throughput: '10,000+ assignments/second',
        },
      },
      {
        name: 'ConsensusEngine',
        type: 'service' as const,
        responsibilities: [
          'Distributed consensus protocols',
          'Byzantine fault detection',
          'Consensus proof generation',
          'Conflict resolution coordination',
        ],
        interfaces: ['IConsensusEngine', 'IByzantineDetector'],
        dependencies: ['MessageBroker', 'CryptographicServices'],
        qualityAttributes: {
          consensus_time: '<500ms',
          fault_tolerance: '33% Byzantine nodes',
          security: 'cryptographic proof validation',
        },
      },
      {
        name: 'MessageBroker',
        type: 'service' as const,
        responsibilities: [
          'High-performance message routing',
          'Event-driven communication',
          'Message persistence and replay',
          'Network partition tolerance',
        ],
        interfaces: ['IMessageBroker', 'IEventPublisher'],
        dependencies: ['NetworkLayer', 'PersistentStorage'],
        qualityAttributes: {
          latency: '<2ms message delivery',
          throughput: '1M+ messages/second',
          reliability: 'guaranteed delivery',
        },
      },
    ] as Component[],

    interfaces: [
      {
        name: 'ISwarmCoordinator',
        methods: [
          {
            name: 'registerAgent',
            signature: 'registerAgent(agent: SwarmAgent): Promise<RegistrationResult>',
            description: 'Register new agent with the swarm',
            contracts: [
              'Agent registration must complete within 100ms',
              'Duplicate agent IDs are rejected',
              'Agent capabilities are validated before registration',
            ],
          },
          {
            name: 'distributeTask',
            signature: 'distributeTask(task: SwarmTask): Promise<TaskAssignment>',
            description: 'Distribute task to optimal agent',
            contracts: [
              'Task distribution must complete within 100ms',
              'Agent capability requirements are enforced',
              'Load balancing is considered in assignment',
            ],
          },
          {
            name: 'monitorSwarmHealth',
            signature: 'monitorSwarmHealth(): Promise<HealthStatus>',
            description: 'Monitor overall swarm health and performance',
            contracts: [
              'Health check must complete within 50ms',
              'Critical issues are immediately flagged',
              'Performance trends are tracked over time',
            ],
          },
        ],
        contracts: [
          'All operations are idempotent where applicable',
          'Failures are handled gracefully with proper error codes',
          'Operations support concurrent access',
        ],
      },
    ] as InterfaceDefinition[],
  },

  /**
   * Refinement strategies specific to swarm coordination
   */
  refinementStrategies: [
    {
      type: 'performance' as const,
      priority: 'HIGH' as const,
      changes: [
        {
          component: 'IntelligentLoadBalancer',
          modification: 'Implement ML-based predictive task assignment',
          rationale: 'Current rule-based system shows 15% suboptimal assignments under high load',
          expectedImprovement:
            '25% reduction in task completion time and improved agent utilization',
          effort: 'high' as const,
          risk: 'MEDIUM' as const,
        },
        {
          component: 'MessageBroker',
          modification: 'Add message batching and compression for coordination traffic',
          rationale: 'Network overhead is 12% of total coordination time',
          expectedImprovement: '40% reduction in network traffic and latency',
          effort: 'medium' as const,
          risk: 'LOW' as const,
        },
      ],
      expectedImpact: {
        performanceGain: 0.35,
        resourceReduction: 0.2,
        scalabilityIncrease: 2.0,
        maintainabilityImprovement: 0.15,
      },
      riskAssessment: 'MEDIUM' as const,
      implementationPlan: [
        {
          id: 'perf-step-1',
          description: 'Implement message batching in MessageBroker',
          duration: 40,
          dependencies: [],
          risks: ['Potential message ordering issues'],
        },
        {
          id: 'perf-step-2',
          description: 'Add ML prediction model to LoadBalancer',
          duration: 80,
          dependencies: ['perf-step-1'],
          risks: ['Model training data requirements', 'Prediction accuracy validation'],
        },
      ],
    },
    {
      type: 'scalability' as const,
      priority: 'HIGH' as const,
      changes: [
        {
          component: 'AgentRegistry',
          modification: 'Implement sharded registry with consistent hashing',
          rationale: 'Current centralized registry becomes bottleneck above 5,000 agents',
          expectedImprovement: 'Linear scalability to 50,000+ agents',
          effort: 'high' as const,
          risk: 'HIGH' as const,
        },
      ],
      expectedImpact: {
        performanceGain: 0.15,
        resourceReduction: 0.1,
        scalabilityIncrease: 10.0,
        maintainabilityImprovement: 0.05,
      },
      riskAssessment: 'HIGH' as const,
      implementationPlan: [
        {
          id: 'scale-step-1',
          description: 'Design sharding strategy and data migration plan',
          duration: 60,
          dependencies: [],
          risks: ['Data consistency during migration', 'Backward compatibility'],
        },
      ],
    },
  ] as RefinementStrategy[],
};

export default SWARM_COORDINATION_TEMPLATE;
