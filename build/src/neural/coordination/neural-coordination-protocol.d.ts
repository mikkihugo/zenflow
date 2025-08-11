/**
 * @file Coordination system: neural-coordination-protocol.
 */
/**
 * Neural Coordination Protocol.
 * Enables sophisticated coordination between neural network agents.
 */
interface CoordinationStrategy {
    name: string;
    description: string;
    structure: string;
    characteristics: {
        leadershipType: string;
        decisionFlow: string;
        communicationPattern: string;
        consensusRequired: boolean;
        scalability: number;
        robustness: number;
    };
    parameters: Record<string, any>;
}
interface ConsensusProtocol {
    name: string;
    description: string;
    parameters: Record<string, any>;
    applicability: {
        trustRequired: number;
        performanceWeight: number;
        energyEfficiency: number;
    };
}
interface AgentInfo {
    id: string;
    agent: any;
    capabilities: AgentCapabilities;
    trustScore: number;
    performanceHistory: any[];
    communicationChannels: Set<string>;
    coordinationRole: string;
    lastHeartbeat: number;
    status: string;
}
interface AgentCapabilities {
    communicationBandwidth: number;
    processingPower: number;
    memoryCapacity: number;
    specializations: string[];
    reliability: number;
    latency: number;
    coordinationExperience: number;
}
interface CoordinationSession {
    id: string;
    agentIds: string[];
    strategy: CoordinationStrategy;
    consensusProtocol?: ConsensusProtocol;
    communicationGraph: Map<string, Set<string>>;
    coordinationState: string;
    startTime: number;
    messageQueue: Map<string, any[]>;
    consensusRounds: number;
    coordinationEvents: any[];
    knowledgeGraph?: Map<string, any>;
}
export declare class NeuralCoordinationProtocol {
    private activeSessions;
    private coordinationStrategies;
    private communicationChannels;
    private consensusProtocols;
    private coordinationResults;
    private coordinationMetrics;
    constructor();
    /**
     * Initialize coordination strategies.
     */
    private initializeCoordinationStrategies;
    /**
     * Initialize consensus protocols.
     */
    private initializeConsensusProtocols;
    /**
     * Register agent with coordination protocol.
     *
     * @param agentId
     * @param agent
     */
    registerAgent(agentId: string, agent: any): Promise<AgentInfo>;
    /**
     * Analyze agent capabilities for coordination.
     *
     * @param agent
     */
    private analyzeAgentCapabilities;
    /**
     * Initialize coordination session.
     *
     * @param session
     */
    initializeSession(session: Partial<CoordinationSession> & {
        id: string;
        agentIds: string[];
    }): Promise<CoordinationSession>;
    /**
     * Select optimal coordination strategy for session.
     *
     * @param session
     */
    private selectCoordinationStrategy;
    /**
     * Calculate scalability score for agent count.
     *
     * @param agentCount
     * @param strategyScalability
     */
    private calculateScalabilityScore;
    /**
     * Calculate session trust level.
     *
     * @param session
     * @param session.agentIds
     */
    private calculateSessionTrustLevel;
    /**
     * Estimate task complexity for session.
     *
     * @param session
     */
    private estimateTaskComplexity;
    /**
     * Check if session has heterogeneous agents.
     *
     * @param session
     * @param session.agentIds
     */
    private isHeterogeneousSession;
    /**
     * Select consensus protocol for strategy.
     *
     * @param session
     * @param session.agentIds
     * @param _strategy
     */
    private selectConsensusProtocol;
    /**
     * Build communication graph for session.
     *
     * @param agentIds
     * @param strategy
     */
    private buildCommunicationGraph;
    /**
     * Build star topology (one central node connected to all others).
     *
     * @param graph
     * @param agentIds.
     * @param agentIds
     */
    private buildStarTopology;
    /**
     * Build mesh topology (all nodes connected to all others).
     *
     * @param graph
     * @param agentIds.
     * @param agentIds
     */
    private buildMeshTopology;
    /**
     * Build ring topology (each node connected to neighbors in a ring).
     *
     * @param graph
     * @param agentIds.
     * @param agentIds
     */
    private buildRingTopology;
    /**
     * Build neighborhood topology (each node connected to nearby nodes).
     *
     * @param graph
     * @param agentIds
     * @param radius.
     * @param radius
     */
    private buildNeighborhoodTopology;
    /**
     * Initialize communication channels for session.
     *
     * @param session
     */
    private initializeCommunicationChannels;
    /**
     * Calculate communication latency between agents.
     *
     * @param _agentA
     * @param _agentB
     */
    private calculateChannelLatency;
    /**
     * Calculate communication bandwidth between agents.
     *
     * @param agentA
     * @param agentB
     */
    private calculateChannelBandwidth;
    /**
     * Calculate communication reliability between agents.
     *
     * @param agentA
     * @param agentB
     */
    private calculateChannelReliability;
    /**
     * Coordinate agents in session.
     *
     * @param session
     * @param session.id
     */
    coordinate(session: {
        id: string;
    }): Promise<any>;
    /**
     * Execute coordination strategy.
     *
     * @param session
     */
    private executeCoordinationStrategy;
    private executeHierarchicalCoordination;
    private executePeerToPeerCoordination;
    private executeSwarmCoordination;
    private executeMarketBasedCoordination;
    private executeContractNetCoordination;
    private executeBlackboardCoordination;
    private executeMARLCoordination;
    private executeByzantineCoordination;
    private executeConsensusProtocol;
    private selectLeader;
    private updateCoordinationMetrics;
    /**
     * Get coordination results for session.
     *
     * @param sessionId
     */
    getResults(sessionId: string): Promise<any>;
    /**
     * Get coordination statistics.
     */
    getStatistics(): any;
}
export {};
//# sourceMappingURL=neural-coordination-protocol.d.ts.map