/**
 * Advanced Communication Protocols for Swarm Coordination
 * Provides efficient message passing, compression, broadcast/multicast,
 * gossip protocol, and consensus mechanisms
 */
/**
 * @file Coordination system: communication-protocols
 */
import { EventEmitter } from 'node:events';
import type { ILogger } from '../../../core/interfaces/base-interfaces.ts';
import type { EventBusInterface as IEventBus } from '../../core/event-bus.ts';
export interface Message {
    id: string;
    type: MessageType;
    sender: string;
    recipients: string[];
    payload: MessagePayload;
    priority: MessagePriority;
    encryption: EncryptionConfig;
    compression: CompressionConfig;
    routing: RoutingConfig;
    qos: QualityOfService;
    timestamp: Date;
    ttl: number;
    checksum: string;
}
export type MessageType = 'broadcast' | 'multicast' | 'unicast' | 'gossip' | 'heartbeat' | 'consensus' | 'election' | 'coordination' | 'data' | 'control' | 'emergency';
export type MessagePriority = 'emergency' | 'high' | 'normal' | 'low' | 'background';
export interface MessagePayload {
    data: any;
    metadata: Record<string, unknown>;
    contentType: string;
    encoding: string;
    version: string;
}
export interface EncryptionConfig {
    enabled: boolean;
    algorithm?: 'aes-256-gcm' | 'chacha20-poly1305' | 'none';
    keyId?: string;
    nonce?: Buffer;
}
export interface CompressionConfig {
    enabled: boolean;
    algorithm: 'gzip' | 'lz4' | 'brotli' | 'none';
    level: number;
    threshold: number;
}
export interface RoutingConfig {
    strategy: 'direct' | 'relay' | 'multipath' | 'adaptive';
    maxHops: number;
    reliabilityMode: 'best-effort' | 'at-least-once' | 'exactly-once';
    acknowledgment: boolean;
    timeout: number;
}
export interface QualityOfService {
    bandwidth: number;
    latency: number;
    reliability: number;
    ordering: boolean;
    deduplication: boolean;
}
export interface CommunicationNode {
    id: string;
    address: string;
    port: number;
    status: 'online' | 'offline' | 'degraded';
    capabilities: CommunicationCapabilities;
    metrics: CommunicationMetrics;
    lastSeen: Date;
    version: string;
}
export interface CommunicationCapabilities {
    maxConnections: number;
    supportedProtocols: string[];
    encryptionSupport: string[];
    compressionSupport: string[];
    bandwidth: number;
    bufferSize: number;
}
export interface CommunicationMetrics {
    messagesSent: number;
    messagesReceived: number;
    bytesTransferred: number;
    averageLatency: number;
    errorRate: number;
    packetsLost: number;
    throughput: number;
    lastUpdated: Date;
}
export interface GossipState {
    version: number;
    data: Record<string, any>;
    timestamp: Date;
    checksum: string;
}
export interface ConsensusProposal {
    id: string;
    type: 'value' | 'leader' | 'configuration';
    proposer: string;
    value: any;
    round: number;
    timestamp: Date;
    signatures: Map<string, string>;
}
export interface ConsensusVote {
    proposalId: string;
    voter: string;
    decision: 'accept' | 'reject' | 'abstain';
    reasoning?: string;
    timestamp: Date;
    signature: string;
}
export interface BroadcastTree {
    root: string;
    children: Map<string, string[]>;
    depth: number;
    redundancy: number;
}
/**
 * Advanced Communication Protocol Manager.
 *
 * @example
 */
export declare class CommunicationProtocols extends EventEmitter {
    private _nodeId;
    private config;
    private _logger;
    private eventBus;
    private nodes;
    private messageQueue;
    private messageHistory;
    private gossipState;
    private consensusProposals;
    private consensusVotes;
    private broadcastTrees;
    private routingTable;
    private messageHandlers;
    private compressionEngine;
    private encryptionEngine;
    private routingEngine;
    private consensusEngine;
    private gossipEngine;
    private processingInterval?;
    private gossipInterval?;
    private heartbeatInterval?;
    constructor(_nodeId: string, config: {
        maxMessageHistory: number;
        messageTimeout: number;
        gossipInterval: number;
        heartbeatInterval: number;
        compressionThreshold: number;
        encryptionEnabled: boolean;
        consensusTimeout: number;
        maxHops: number;
    }, _logger: ILogger, eventBus: IEventBus);
    private setupEventHandlers;
    /**
     * Register a communication node.
     *
     * @param node
     */
    registerNode(node: CommunicationNode): Promise<void>;
    /**
     * Send a message using various protocols.
     *
     * @param message
     */
    sendMessage(message: Partial<Message>): Promise<string>;
    /**
     * Broadcast message to all nodes.
     *
     * @param payload
     * @param priority
     */
    broadcast(payload: MessagePayload, priority?: MessagePriority): Promise<string>;
    /**
     * Multicast message to specific group.
     *
     * @param recipients
     * @param payload
     * @param priority
     */
    multicast(recipients: string[], payload: MessagePayload, priority?: MessagePriority): Promise<string>;
    /**
     * Send unicast message.
     *
     * @param recipient
     * @param payload
     * @param priority
     */
    unicast(recipient: string, payload: MessagePayload, priority?: MessagePriority): Promise<string>;
    /**
     * Start gossip protocol for state synchronization.
     *
     * @param key
     * @param data
     */
    startGossip(key: string, data: any): Promise<void>;
    /**
     * Initiate consensus on a proposal.
     *
     * @param type
     * @param value
     * @param participants
     */
    initiateConsensus(type: ConsensusProposal['type'], value: any, participants?: string[]): Promise<string>;
    /**
     * Vote on a consensus proposal.
     *
     * @param proposalId
     * @param decision
     * @param reasoning
     */
    vote(proposalId: string, decision: ConsensusVote['decision'], reasoning?: string): Promise<void>;
    /**
     * Register message handler for specific message type.
     *
     * @param messageType
     * @param handler
     */
    registerHandler(messageType: MessageType, handler: MessageHandler): void;
    /**
     * Get communication metrics.
     */
    getMetrics(): {
        nodes: number;
        messagesInQueues: number;
        messageHistory: number;
        gossipStates: number;
        activeConsensus: number;
        networkHealth: number;
    };
    /**
     * Get node status.
     *
     * @param nodeId
     */
    getNodeStatus(nodeId: string): CommunicationNode | undefined;
    /**
     * Get routing information.
     */
    getRoutingInfo(): {
        routingTable: Record<string, string[]>;
        broadcastTrees: Record<string, any>;
        networkTopology: any;
    };
    private startProcessing;
    private processOutgoingMessage;
    private processMessageQueues;
    private routeMessage;
    private handleIncomingMessage;
    private handleMessageByType;
    private handleHeartbeat;
    private handleGossipMessage;
    private handleConsensusMessage;
    private handleConsensusProposal;
    private handleConsensusVote;
    private checkConsensusResult;
    private handleElectionMessage;
    private updateRoutingTable;
    private updateBroadcastTrees;
    private performGossipRound;
    private sendHeartbeats;
    private cleanupExpiredMessages;
    private cleanupMessageHistory;
    private updateNodeMetrics;
    private calculateNetworkHealth;
    private buildNetworkTopology;
    private selectRandomNodes;
    private generateMessageId;
    private generateProposalId;
    private calculateChecksum;
    private calculateDataChecksum;
    private verifyChecksum;
    private isMessageExpired;
    private signVote;
    private evaluateProposal;
    private updateMessageMetrics;
    private handleMessageFailure;
    private handleNodeConnected;
    private handleNodeDisconnected;
    private handleNetworkPartition;
    private initializeMessageQueues;
    shutdown(): Promise<void>;
}
export type MessageHandler = (message: Message) => Promise<void> | void;
export default CommunicationProtocols;
export { CommunicationProtocols as AgentCommunicationProtocol };
//# sourceMappingURL=communication-protocols.d.ts.map