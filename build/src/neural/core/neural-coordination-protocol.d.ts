/**
 * Neural Coordination Protocol.
 * Protocol for coordinating neural networks across distributed agents.
 */
/**
 * @file Neural network: neural-coordination-protocol
 */
export declare class NeuralCoordinationProtocol {
    nodes: Map<string, any>;
    messages: any[];
    private sessions?;
    private coordinationResults?;
    options: {
        syncInterval: number;
        maxMessages: number;
        compressionEnabled: boolean;
        [key: string]: any;
    };
    constructor(options?: {});
    /**
     * Register a neural node.
     *
     * @param nodeId
     * @param nodeInfo
     */
    registerNode(nodeId: any, nodeInfo: any): void;
    /**
     * Send coordination message.
     *
     * @param fromNode
     * @param toNode
     * @param messageType
     * @param payload
     */
    sendMessage(fromNode: any, toNode: any, messageType: any, payload: any): Promise<{
        id: string;
        from: any;
        to: any;
        type: any;
        payload: any;
        timestamp: Date;
    }>;
    /**
     * Synchronize neural states.
     *
     * @param nodeId
     * @param neuralState
     */
    synchronize(nodeId: any, neuralState: any): Promise<{
        success: boolean;
        syncedNodes: number;
    }>;
    /**
     * Get protocol metrics.
     */
    getMetrics(): {
        totalNodes: number;
        activeNodes: number;
        totalMessages: number;
        avgMessagesPerNode: number;
        lastActivity: any;
    };
    /**
     * Get recent messages.
     *
     * @param limit
     */
    getRecentMessages(limit?: number): any[];
    /**
     * Register an agent with the coordination protocol.
     *
     * @param agentId
     * @param agent
     */
    registerAgent(agentId: string, agent: any): Promise<{
        success: boolean;
        registeredNodes: number;
    }>;
    /**
     * Initialize a coordination session.
     *
     * @param session
     */
    initializeSession(session: any): Promise<{
        success: boolean;
        session: {
            id: any;
            agentIds: any;
            strategy: any;
            startTime: Date;
            status: string;
        };
    }>;
    /**
     * Coordinate agents in a session.
     *
     * @param session
     */
    coordinate(session: any): Promise<{
        success: boolean;
        coordinated: number;
    }>;
    /**
     * Get coordination results for a session.
     *
     * @param sessionId
     */
    getResults(sessionId: string): Promise<any>;
    /**
     * Get coordination statistics.
     */
    getStatistics(): {
        totalNodes: number;
        totalMessages: number;
        activeSessions: number;
        averageMessageCount: number;
    };
    private generateWeightAdjustments;
    private generatePatternUpdates;
    private calculateAverageMessageCount;
}
export default NeuralCoordinationProtocol;
//# sourceMappingURL=neural-coordination-protocol.d.ts.map