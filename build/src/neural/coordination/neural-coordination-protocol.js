/**
 * @file Coordination system: neural-coordination-protocol.
 */
import { getLogger } from '../config/logging-config';
const logger = getLogger('neural-coordination-neural-coordination-protocol');
export class NeuralCoordinationProtocol {
    activeSessions = new Map();
    coordinationStrategies = new Map();
    communicationChannels = new Map();
    consensusProtocols = new Map();
    coordinationResults = new Map();
    coordinationMetrics = new Map();
    constructor() {
        // Initialize coordination strategies
        this.initializeCoordinationStrategies();
        // Initialize consensus protocols
        this.initializeConsensusProtocols();
    }
    /**
     * Initialize coordination strategies.
     */
    initializeCoordinationStrategies() {
        // Hierarchical Coordination
        this.coordinationStrategies.set('hierarchical', {
            name: 'Hierarchical Coordination',
            description: 'Leader-follower structure with centralized decision making',
            structure: 'tree',
            characteristics: {
                leadershipType: 'single_leader',
                decisionFlow: 'top_down',
                communicationPattern: 'star',
                consensusRequired: false,
                scalability: 0.7,
                robustness: 0.6,
            },
            parameters: {
                leaderSelectionCriteria: 'performance',
                maxHierarchyDepth: 3,
                commandPropagationDelay: 100,
                leaderRotationInterval: 3600000, // 1 hour
            },
        });
        // Peer-to-Peer Coordination
        this.coordinationStrategies.set('peer_to_peer', {
            name: 'Peer-to-Peer Coordination',
            description: 'Decentralized coordination with equal agent status',
            structure: 'mesh',
            characteristics: {
                leadershipType: 'distributed',
                decisionFlow: 'lateral',
                communicationPattern: 'mesh',
                consensusRequired: true,
                scalability: 0.8,
                robustness: 0.9,
            },
            parameters: {
                consensusThreshold: 0.66,
                communicationTimeout: 5000,
                maxNegotiationRounds: 10,
                conflictResolutionMethod: 'voting',
            },
        });
        // Swarm Coordination
        this.coordinationStrategies.set('swarm', {
            name: 'Swarm Coordination',
            description: 'Emergent coordination through local interactions',
            structure: 'dynamic',
            characteristics: {
                leadershipType: 'emergent',
                decisionFlow: 'emergent',
                communicationPattern: 'local_neighborhood',
                consensusRequired: false,
                scalability: 0.9,
                robustness: 0.8,
            },
            parameters: {
                neighborhoodRadius: 3,
                influenceDecayRate: 0.9,
                emergenceThreshold: 0.75,
                adaptationRate: 0.1,
            },
        });
        // Market-Based Coordination
        this.coordinationStrategies.set('market_based', {
            name: 'Market-Based Coordination',
            description: 'Economic auction-based task allocation',
            structure: 'auction',
            characteristics: {
                leadershipType: 'auctioneer',
                decisionFlow: 'bidding',
                communicationPattern: 'broadcast_bidding',
                consensusRequired: false,
                scalability: 0.8,
                robustness: 0.7,
            },
            parameters: {
                auctionType: 'first_price_sealed_bid',
                biddingTimeout: 3000,
                reservePrice: 0.1,
                profitSharingRatio: 0.8,
            },
        });
        // Contract Net Coordination
        this.coordinationStrategies.set('contract_net', {
            name: 'Contract Net Protocol',
            description: 'Task announcement and bidding system',
            structure: 'contract',
            characteristics: {
                leadershipType: 'task_specific',
                decisionFlow: 'contract_based',
                communicationPattern: 'announcement_bidding',
                consensusRequired: false,
                scalability: 0.75,
                robustness: 0.8,
            },
            parameters: {
                taskAnnouncementDelay: 1000,
                biddingPeriod: 5000,
                contractDuration: 300000, // 5 minutes
                performanceEvaluationInterval: 60000,
            },
        });
        // Blackboard Coordination
        this.coordinationStrategies.set('blackboard', {
            name: 'Blackboard System',
            description: 'Shared knowledge space for coordination',
            structure: 'shared_memory',
            characteristics: {
                leadershipType: 'knowledge_driven',
                decisionFlow: 'opportunistic',
                communicationPattern: 'publish_subscribe',
                consensusRequired: false,
                scalability: 0.6,
                robustness: 0.7,
            },
            parameters: {
                blackboardSize: 1000,
                knowledgeExpirationTime: 600000, // 10 minutes
                priorityQueueSize: 100,
                triggerThreshold: 0.7,
            },
        });
        // Multi-Agent Reinforcement Learning Coordination
        this.coordinationStrategies.set('marl', {
            name: 'Multi-Agent Reinforcement Learning',
            description: 'Learning-based coordination through shared rewards',
            structure: 'learning',
            characteristics: {
                leadershipType: 'learned',
                decisionFlow: 'policy_based',
                communicationPattern: 'learned_communication',
                consensusRequired: false,
                scalability: 0.8,
                robustness: 0.8,
            },
            parameters: {
                learningRate: 0.001,
                explorationRate: 0.1,
                rewardSharingRatio: 0.5,
                communicationBandwidth: 64,
            },
        });
        // Byzantine Fault Tolerant Coordination
        this.coordinationStrategies.set('byzantine_ft', {
            name: 'Byzantine Fault Tolerant',
            description: 'Coordination robust to malicious or faulty agents',
            structure: 'fault_tolerant',
            characteristics: {
                leadershipType: 'rotating_committee',
                decisionFlow: 'byzantine_consensus',
                communicationPattern: 'authenticated_broadcast',
                consensusRequired: true,
                scalability: 0.5,
                robustness: 0.95,
            },
            parameters: {
                faultTolerance: 0.33, // Can tolerate up to 1/3 faulty agents
                viewChangeTimeout: 10000,
                messageAuthenticationRequired: true,
                committeeSize: 7,
            },
        });
    }
    /**
     * Initialize consensus protocols.
     */
    initializeConsensusProtocols() {
        // Proof of Stake Consensus
        this.consensusProtocols.set('proof_of_stake', {
            name: 'Proof of Stake',
            description: 'Consensus based on agent performance stake',
            parameters: {
                stakingPeriod: 3600000, // 1 hour
                minimumStake: 0.1,
                slashingPenalty: 0.05,
                rewardDistribution: 'proportional',
            },
            applicability: {
                trustRequired: 0.7,
                performanceWeight: 0.9,
                energyEfficiency: 0.9,
            },
        });
        // Practical Byzantine Fault Tolerance
        this.consensusProtocols.set('pbft', {
            name: 'Practical Byzantine Fault Tolerance',
            description: 'Byzantine consensus for unreliable environments',
            parameters: {
                phaseTimeout: 5000,
                viewChangeTimeout: 10000,
                checkpointInterval: 100,
                maxFaultyNodes: 0.33,
            },
            applicability: {
                trustRequired: 0.3,
                performanceWeight: 0.6,
                energyEfficiency: 0.4,
            },
        });
        // Raft Consensus
        this.consensusProtocols.set('raft', {
            name: 'Raft Consensus',
            description: 'Leader-based consensus for crash-fault tolerance',
            parameters: {
                electionTimeout: 5000,
                heartbeatInterval: 1000,
                logReplicationBatchSize: 10,
                leaderElectionBackoff: 1.5,
            },
            applicability: {
                trustRequired: 0.8,
                performanceWeight: 0.8,
                energyEfficiency: 0.7,
            },
        });
        // Gossip Protocol
        this.consensusProtocols.set('gossip', {
            name: 'Gossip Protocol',
            description: 'Probabilistic information dissemination',
            parameters: {
                gossipRounds: 10,
                gossipFanout: 3,
                gossipInterval: 1000,
                convergenceThreshold: 0.95,
            },
            applicability: {
                trustRequired: 0.9,
                performanceWeight: 0.5,
                energyEfficiency: 0.8,
            },
        });
    }
    /**
     * Register agent with coordination protocol.
     *
     * @param agentId
     * @param agent
     */
    async registerAgent(agentId, agent) {
        const agentInfo = {
            id: agentId,
            agent,
            capabilities: this.analyzeAgentCapabilities(agent),
            trustScore: 1.0,
            performanceHistory: [],
            communicationChannels: new Set(),
            coordinationRole: 'peer',
            lastHeartbeat: Date.now(),
            status: 'active',
        };
        // Initialize communication channels for this agent
        if (!this.communicationChannels.has(agentId)) {
            this.communicationChannels.set(agentId, new Map());
        }
        // Initialize coordination metrics
        this.coordinationMetrics.set(agentId, {
            messagesExchanged: 0,
            consensusParticipation: 0,
            coordinationSuccessRate: 1.0,
            averageResponseTime: 0,
            lastUpdate: Date.now(),
        });
        return agentInfo;
    }
    /**
     * Analyze agent capabilities for coordination.
     *
     * @param agent
     */
    analyzeAgentCapabilities(agent) {
        const capabilities = {
            communicationBandwidth: 1000, // Default bandwidth
            processingPower: 1.0,
            memoryCapacity: 1.0,
            specializations: [],
            reliability: 1.0,
            latency: 100, // Default latency in ms
            coordinationExperience: 0,
        };
        // Analyze based on agent type and configuration
        if (agent.modelType) {
            switch (agent.modelType) {
                case 'transformer':
                case 'lstm':
                case 'gru':
                    capabilities.specializations.push('sequence_processing', 'language_understanding');
                    capabilities.processingPower = 0.9;
                    break;
                case 'cnn':
                case 'resnet':
                    capabilities.specializations.push('image_processing', 'pattern_recognition');
                    capabilities.processingPower = 0.8;
                    break;
                case 'gnn':
                case 'gat':
                    capabilities.specializations.push('graph_analysis', 'relationship_modeling');
                    capabilities.processingPower = 0.7;
                    break;
                case 'diffusion_model':
                case 'vae':
                    capabilities.specializations.push('generation', 'creativity');
                    capabilities.processingPower = 0.6;
                    break;
            }
        }
        // Estimate performance based on metrics
        if (agent.getMetrics) {
            const metrics = agent.getMetrics();
            capabilities.reliability = Math.min(1, metrics.accuracy || 0.8);
            capabilities.coordinationExperience = metrics.epochsTrained / 100 || 0;
        }
        return capabilities;
    }
    /**
     * Initialize coordination session.
     *
     * @param session
     */
    async initializeSession(session) {
        const sessionId = session.id;
        // Select optimal coordination strategy
        const strategy = this.selectCoordinationStrategy(session);
        // Select consensus protocol if needed
        const consensusProtocol = strategy.characteristics.consensusRequired
            ? this.selectConsensusProtocol(session, strategy)
            : undefined;
        const coordinationSession = {
            ...session,
            strategy,
            consensusProtocol,
            communicationGraph: this.buildCommunicationGraph(session.agentIds, strategy),
            coordinationState: 'initializing',
            startTime: Date.now(),
            messageQueue: new Map(),
            consensusRounds: 0,
            coordinationEvents: [],
        };
        this.activeSessions.set(sessionId, coordinationSession);
        // Initialize communication channels for session
        await this.initializeCommunicationChannels(coordinationSession);
        return coordinationSession;
    }
    /**
     * Select optimal coordination strategy for session.
     *
     * @param session
     */
    selectCoordinationStrategy(session) {
        const agentCount = session.agentIds.length;
        const trustLevel = this.calculateSessionTrustLevel(session);
        const taskComplexity = this.estimateTaskComplexity(session);
        let bestStrategy = null;
        let bestScore = 0;
        for (const [, strategy] of this.coordinationStrategies.entries()) {
            let score = 0;
            // Score based on agent count and scalability
            const scalabilityScore = this.calculateScalabilityScore(agentCount, strategy.characteristics.scalability);
            score += scalabilityScore * 0.3;
            // Score based on trust level and robustness requirements
            if (trustLevel < 0.7 && strategy.characteristics.robustness > 0.8) {
                score += 0.2;
            }
            // Score based on task complexity
            if (taskComplexity > 0.7) {
                if (strategy.characteristics.decisionFlow === 'lateral' ||
                    strategy.characteristics.decisionFlow === 'emergent') {
                    score += 0.2;
                }
            }
            else {
                if (strategy.characteristics.decisionFlow === 'top_down') {
                    score += 0.15;
                }
            }
            // Prefer consensus-based strategies for heterogeneous agents
            if (this.isHeterogeneousSession(session) && strategy.characteristics.consensusRequired) {
                score += 0.1;
            }
            // Performance-based preferences
            if (session.strategy === 'parallel' &&
                strategy.characteristics.communicationPattern === 'mesh') {
                score += 0.15;
            }
            if (score > bestScore) {
                bestScore = score;
                bestStrategy = strategy;
            }
        }
        return bestStrategy || this.coordinationStrategies.get('peer_to_peer');
    }
    /**
     * Calculate scalability score for agent count.
     *
     * @param agentCount
     * @param strategyScalability
     */
    calculateScalabilityScore(agentCount, strategyScalability) {
        const optimalRange = strategyScalability * 10; // Optimal agent count for strategy
        const deviation = Math.abs(agentCount - optimalRange) / optimalRange;
        return Math.max(0, 1 - deviation);
    }
    /**
     * Calculate session trust level.
     *
     * @param session
     * @param session.agentIds
     */
    calculateSessionTrustLevel(session) {
        if (!session.agentIds || session.agentIds.length === 0) {
            return 1.0;
        }
        let totalTrust = 0;
        let agentCount = 0;
        for (const agentId of session.agentIds) {
            const metrics = this.coordinationMetrics.get(agentId);
            if (metrics) {
                totalTrust += metrics.coordinationSuccessRate;
                agentCount++;
            }
        }
        return agentCount > 0 ? totalTrust / agentCount : 1.0;
    }
    /**
     * Estimate task complexity for session.
     *
     * @param session
     */
    estimateTaskComplexity(session) {
        let complexity = 0.5; // Base complexity
        // Increase complexity based on agent count
        complexity += Math.min(0.3, session.agentIds.length / 20);
        // Increase complexity for parallel strategy
        if (session.strategy === 'parallel') {
            complexity += 0.2;
        }
        // Increase complexity if collaboration is enabled
        if (session.knowledgeGraph && session.knowledgeGraph.size > 0) {
            complexity += 0.1;
        }
        return Math.min(1, complexity);
    }
    /**
     * Check if session has heterogeneous agents.
     *
     * @param session
     * @param session.agentIds
     */
    isHeterogeneousSession(session) {
        const agentTypes = new Set();
        for (const agentId of session.agentIds) {
            const metrics = this.coordinationMetrics.get(agentId);
            if (metrics?.agentType) {
                agentTypes.add(metrics.agentType);
            }
        }
        return agentTypes.size > 1;
    }
    /**
     * Select consensus protocol for strategy.
     *
     * @param session
     * @param session.agentIds
     * @param _strategy
     */
    selectConsensusProtocol(session, _strategy) {
        const trustLevel = this.calculateSessionTrustLevel(session);
        const agentCount = session.agentIds.length;
        // Select based on trust level and agent count
        if (trustLevel < 0.5 || agentCount > 20) {
            return this.consensusProtocols.get('pbft');
        }
        else if (trustLevel > 0.8 && agentCount <= 10) {
            return this.consensusProtocols.get('raft');
        }
        else if (agentCount > 10) {
            return this.consensusProtocols.get('gossip');
        }
        return this.consensusProtocols.get('proof_of_stake');
    }
    /**
     * Build communication graph for session.
     *
     * @param agentIds
     * @param strategy
     */
    buildCommunicationGraph(agentIds, strategy) {
        const graph = new Map();
        // Initialize nodes
        for (const agentId of agentIds) {
            graph.set(agentId, new Set());
        }
        // Build connections based on strategy
        switch (strategy.characteristics.communicationPattern) {
            case 'star':
                this.buildStarTopology(graph, agentIds);
                break;
            case 'mesh':
                this.buildMeshTopology(graph, agentIds);
                break;
            case 'ring':
                this.buildRingTopology(graph, agentIds);
                break;
            case 'local_neighborhood':
                this.buildNeighborhoodTopology(graph, agentIds, strategy.parameters.neighborhoodRadius);
                break;
            default:
                this.buildMeshTopology(graph, agentIds); // Default to mesh
        }
        return graph;
    }
    /**
     * Build star topology (one central node connected to all others).
     *
     * @param graph
     * @param agentIds.
     * @param agentIds
     */
    buildStarTopology(graph, agentIds) {
        if (agentIds.length === 0) {
            return;
        }
        const centerAgent = agentIds[0]; // Select first agent as center
        for (let i = 1; i < agentIds.length; i++) {
            const agentId = agentIds[i];
            graph.get(centerAgent)?.add(agentId);
            graph.get(agentId)?.add(centerAgent);
        }
    }
    /**
     * Build mesh topology (all nodes connected to all others).
     *
     * @param graph
     * @param agentIds.
     * @param agentIds
     */
    buildMeshTopology(graph, agentIds) {
        for (let i = 0; i < agentIds.length; i++) {
            for (let j = i + 1; j < agentIds.length; j++) {
                const agentA = agentIds[i];
                const agentB = agentIds[j];
                graph.get(agentA)?.add(agentB);
                graph.get(agentB)?.add(agentA);
            }
        }
    }
    /**
     * Build ring topology (each node connected to neighbors in a ring).
     *
     * @param graph
     * @param agentIds.
     * @param agentIds
     */
    buildRingTopology(graph, agentIds) {
        for (let i = 0; i < agentIds.length; i++) {
            const current = agentIds[i];
            const next = agentIds[(i + 1) % agentIds.length];
            const prev = agentIds[(i - 1 + agentIds.length) % agentIds.length];
            graph.get(current)?.add(next);
            graph.get(current)?.add(prev);
        }
    }
    /**
     * Build neighborhood topology (each node connected to nearby nodes).
     *
     * @param graph
     * @param agentIds
     * @param radius.
     * @param radius
     */
    buildNeighborhoodTopology(graph, agentIds, radius = 2) {
        for (let i = 0; i < agentIds.length; i++) {
            const current = agentIds[i];
            for (let j = 1; j <= radius; j++) {
                // Connect to agents within radius in both directions
                const next = agentIds[(i + j) % agentIds.length];
                const prev = agentIds[(i - j + agentIds.length) % agentIds.length];
                if (next !== current) {
                    graph.get(current)?.add(next);
                }
                if (prev !== current) {
                    graph.get(current)?.add(prev);
                }
            }
        }
    }
    /**
     * Initialize communication channels for session.
     *
     * @param session
     */
    async initializeCommunicationChannels(session) {
        const { communicationGraph, agentIds } = session;
        // Create message queues for each agent
        for (const agentId of agentIds) {
            if (!session.messageQueue.has(agentId)) {
                session.messageQueue.set(agentId, []);
            }
        }
        // Establish bidirectional channels based on communication graph
        for (const [agentId, connections] of communicationGraph.entries()) {
            const agentChannels = this.communicationChannels.get(agentId);
            for (const connectedAgentId of connections) {
                if (!agentChannels.has(connectedAgentId)) {
                    agentChannels.set(connectedAgentId, {
                        sessionId: session.id,
                        latency: this.calculateChannelLatency(agentId, connectedAgentId),
                        bandwidth: this.calculateChannelBandwidth(agentId, connectedAgentId),
                        reliability: this.calculateChannelReliability(agentId, connectedAgentId),
                        messageHistory: [],
                    });
                }
            }
        }
    }
    /**
     * Calculate communication latency between agents.
     *
     * @param _agentA
     * @param _agentB
     */
    calculateChannelLatency(_agentA, _agentB) {
        // Simplified latency calculation (in practice, would consider network topology)
        const baseLatency = 50; // Base latency in milliseconds
        const randomVariation = Math.random() * 50; // Random variation
        return baseLatency + randomVariation;
    }
    /**
     * Calculate communication bandwidth between agents.
     *
     * @param agentA
     * @param agentB
     */
    calculateChannelBandwidth(agentA, agentB) {
        // Simplified bandwidth calculation (in practice, would consider agent capabilities)
        const baseBandwidth = 1000; // Base bandwidth
        const agentAMetrics = this.coordinationMetrics.get(agentA);
        const agentBMetrics = this.coordinationMetrics.get(agentB);
        // Bandwidth limited by slower agent
        const agentABandwidth = agentAMetrics?.communicationBandwidth || baseBandwidth;
        const agentBBandwidth = agentBMetrics?.communicationBandwidth || baseBandwidth;
        return Math.min(agentABandwidth, agentBBandwidth);
    }
    /**
     * Calculate communication reliability between agents.
     *
     * @param agentA
     * @param agentB
     */
    calculateChannelReliability(agentA, agentB) {
        const agentAMetrics = this.coordinationMetrics.get(agentA);
        const agentBMetrics = this.coordinationMetrics.get(agentB);
        const agentAReliability = agentAMetrics?.coordinationSuccessRate || 1.0;
        const agentBReliability = agentBMetrics?.coordinationSuccessRate || 1.0;
        // Channel reliability is product of agent reliabilities
        return agentAReliability * agentBReliability;
    }
    /**
     * Coordinate agents in session.
     *
     * @param session
     * @param session.id
     */
    async coordinate(session) {
        const coordinationSession = this.activeSessions.get(session.id);
        if (!coordinationSession) {
            throw new Error(`Session ${session.id} not found`);
        }
        coordinationSession.coordinationState = 'coordinating';
        try {
            // Execute coordination based on strategy
            const coordinationResult = await this.executeCoordinationStrategy(coordinationSession);
            // Apply consensus if required
            if (coordinationSession.consensusProtocol) {
                const consensusResult = await this.executeConsensusProtocol(coordinationSession, coordinationResult);
                coordinationResult?.consensus = consensusResult;
            }
            // Store coordination results
            this.coordinationResults.set(session.id, coordinationResult);
            // Update coordination metrics
            this.updateCoordinationMetrics(coordinationSession, coordinationResult);
            coordinationSession.coordinationState = 'completed';
            return coordinationResult;
        }
        catch (error) {
            coordinationSession.coordinationState = 'error';
            logger.error(`Coordination failed for session ${session.id}:`, error);
            throw error;
        }
    }
    /**
     * Execute coordination strategy.
     *
     * @param session
     */
    async executeCoordinationStrategy(session) {
        const { strategy } = session;
        switch (strategy.name) {
            case 'Hierarchical Coordination':
                return this.executeHierarchicalCoordination(session);
            case 'Peer-to-Peer Coordination':
                return this.executePeerToPeerCoordination(session);
            case 'Swarm Coordination':
                return this.executeSwarmCoordination(session);
            case 'Market-Based Coordination':
                return this.executeMarketBasedCoordination(session);
            case 'Contract Net Protocol':
                return this.executeContractNetCoordination(session);
            case 'Blackboard System':
                return this.executeBlackboardCoordination(session);
            case 'Multi-Agent Reinforcement Learning':
                return this.executeMARLCoordination(session);
            case 'Byzantine Fault Tolerant':
                return this.executeByzantineCoordination(session);
            default:
                return this.executePeerToPeerCoordination(session); // Default
        }
    }
    // Strategy execution methods - simplified implementations
    async executeHierarchicalCoordination(session) {
        const leader = this.selectLeader(session);
        return {
            strategy: 'hierarchical',
            leader,
            success: true,
            timestamp: Date.now(),
        };
    }
    async executePeerToPeerCoordination(_session) {
        return {
            strategy: 'peer_to_peer',
            success: true,
            timestamp: Date.now(),
        };
    }
    async executeSwarmCoordination(_session) {
        return {
            strategy: 'swarm',
            success: true,
            timestamp: Date.now(),
        };
    }
    async executeMarketBasedCoordination(_session) {
        return {
            strategy: 'market_based',
            success: true,
            timestamp: Date.now(),
        };
    }
    async executeContractNetCoordination(_session) {
        return {
            strategy: 'contract_net',
            success: true,
            timestamp: Date.now(),
        };
    }
    async executeBlackboardCoordination(_session) {
        return {
            strategy: 'blackboard',
            success: true,
            timestamp: Date.now(),
        };
    }
    async executeMARLCoordination(_session) {
        return {
            strategy: 'marl',
            success: true,
            timestamp: Date.now(),
        };
    }
    async executeByzantineCoordination(_session) {
        return {
            strategy: 'byzantine_ft',
            success: true,
            timestamp: Date.now(),
        };
    }
    async executeConsensusProtocol(session, _coordinationResult) {
        const { consensusProtocol } = session;
        if (!consensusProtocol)
            return null;
        return {
            protocol: consensusProtocol.name,
            result: 'consensus_reached',
            timestamp: Date.now(),
        };
    }
    selectLeader(session) {
        let bestAgent = session.agentIds[0];
        let bestScore = 0;
        for (const agentId of session.agentIds) {
            const metrics = this.coordinationMetrics.get(agentId);
            if (metrics && metrics.coordinationSuccessRate > bestScore) {
                bestScore = metrics.coordinationSuccessRate;
                bestAgent = agentId;
            }
        }
        return bestAgent;
    }
    updateCoordinationMetrics(session, result) {
        for (const agentId of session.agentIds) {
            const metrics = this.coordinationMetrics.get(agentId);
            if (metrics) {
                metrics.consensusParticipation++;
                if (result?.success) {
                    const currentSuccess = metrics.coordinationSuccessRate * metrics.consensusParticipation;
                    metrics.coordinationSuccessRate =
                        (currentSuccess + 1) / (metrics.consensusParticipation + 1);
                }
                else {
                    const currentSuccess = metrics.coordinationSuccessRate * metrics.consensusParticipation;
                    metrics.coordinationSuccessRate = currentSuccess / (metrics.consensusParticipation + 1);
                }
                metrics.lastUpdate = Date.now();
            }
        }
    }
    /**
     * Get coordination results for session.
     *
     * @param sessionId
     */
    async getResults(sessionId) {
        return this.coordinationResults.get(sessionId) || null;
    }
    /**
     * Get coordination statistics.
     */
    getStatistics() {
        const activeSessions = this.activeSessions.size;
        const totalAgents = this.coordinationMetrics.size;
        let avgSuccessRate = 0;
        let totalMessages = 0;
        for (const [, metrics] of this.coordinationMetrics.entries()) {
            avgSuccessRate += metrics.coordinationSuccessRate;
            totalMessages += metrics.messagesExchanged;
        }
        return {
            activeSessions,
            totalAgents,
            avgSuccessRate: totalAgents > 0 ? avgSuccessRate / totalAgents : 0,
            totalMessages,
            availableStrategies: this.coordinationStrategies.size,
            availableConsensusProtocols: this.consensusProtocols.size,
        };
    }
}
