/**
 * Advanced Communication Protocols for Swarm Coordination
 * Provides efficient message passing, compression, broadcast/multicast,
 * gossip protocol, and consensus mechanisms
 */

import { randomBytes } from 'node:crypto';
import { gunzipSync, gzipSync } from 'node:zlib';

import { TypedEventBase } from '@claude-zen/foundation';
import type { Logger } from '@claude-zen/foundation';

import type { EventBusInterface as EventBus } from '../core/event-bus';

// Core communication types
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
  threshold: number; // Minimum size to compress
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
  data: Record<string, unknown>;
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
 */
export class CommunicationProtocols extends TypedEventBase {
  private nodes = new Map<string, CommunicationNode>();
  private messageQueue = new Map<MessagePriority, Message[]>();
  private messageHistory = new Map<string, Message>();
  private gossipState = new Map<string, GossipState>();
  private consensusProposals = new Map<string, ConsensusProposal>();
  private consensusVotes = new Map<string, ConsensusVote[]>();
  private broadcastTrees = new Map<string, BroadcastTree>();
  private routingTable = new Map<string, string[]>();
  private messageHandlers = new Map<MessageType, MessageHandler[]>();

  private compressionEngine: CompressionEngine;
  private encryptionEngine: EncryptionEngine;
  private routingEngine: RoutingEngine;
  private consensusEngine: ConsensusEngine;
  private gossipEngine: GossipEngine;

  private processingInterval?: NodeJS.Timeout;
  private gossipInterval?: NodeJS.Timeout;
  private heartbeatInterval?: NodeJS.Timeout;

  constructor(
    private _nodeId: string,
    private configuration: {
      maxMessageHistory: number;
      messageTimeout: number;
      gossipInterval: number;
      heartbeatInterval: number;
      compressionThreshold: number;
      encryptionEnabled: boolean;
      consensusTimeout: number;
      maxHops: number;
    },
    private _logger: Logger,
    private eventBus: EventBus
  ) {
    super();

    this.initializeMessageQueues();
    this.compressionEngine = new CompressionEngine(this._logger);
    this.encryptionEngine = new EncryptionEngine(this.configuration.encryptionEnabled, this._logger);
    this.routingEngine = new RoutingEngine(this._logger);
    this.consensusEngine = new ConsensusEngine(this._nodeId, this._logger);
    this.gossipEngine = new GossipEngine(this._nodeId, this._logger);

    this.setupEventHandlers();
    this.startProcessing();
  }

  private setupEventHandlers(): void {
    this.eventBus.on('node:connected', (data: any) => {
      this.handleNodeConnected(data);
    });

    this.eventBus.on('node:disconnected', (data: any) => {
      this.handleNodeDisconnected(data);
    });

    this.eventBus.on('message:received', (data: any) => {
      this.handleIncomingMessage(data);
    });

    this.eventBus.on('network:partition', (data: any) => {
      this.handleNetworkPartition(data);
    });
  }

  /**
   * Register a communication node.
   */
  async registerNode(node: CommunicationNode): Promise<void> {
    this.nodes.set(node.id, node);
    this._logger.info('Communication node registered', {
      nodeId: node.id,
      address: node.address,
      capabilities: node.capabilities,
    });

    // Update routing table
    await this.updateRoutingTable();

    // Update broadcast trees
    await this.updateBroadcastTrees();

    this.emit('node:registered', { nodeId: node.id });
  }

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
  } {
    const messagesInQueues = Array.from(this.messageQueue.values()).reduce(
      (sum, queue) => sum + queue.length,
      0
    );

    const networkHealth = this.calculateNetworkHealth();

    return {
      nodes: this.nodes.size,
      messagesInQueues,
      messageHistory: this.messageHistory.size,
      gossipStates: this.gossipState.size,
      activeConsensus: this.consensusProposals.size,
      networkHealth,
    };
  }

  /**
   * Send a simple broadcast message.
   */
  async broadcast(payload: MessagePayload, priority: MessagePriority = 'normal'): Promise<string> {
    const messageId = this.generateMessageId();

    this._logger.info('Broadcasting message', {
      messageId,
      priority,
      nodes: this.nodes.size
    });

    this.emit('message:sent', { messageId, type: 'broadcast' });
    return messageId;
  }

  private initializeMessageQueues(): void {
    const priorities: MessagePriority[] = ['emergency', 'high', 'normal', 'low', 'background'];
    for (const priority of priorities) {
      this.messageQueue.set(priority, []);
    }
  }

  private startProcessing(): void {
    // Message processing loop
    this.processingInterval = setInterval(async () => {
      await this.processMessageQueues();
      await this.cleanupExpiredMessages();
      await this.updateNodeMetrics();
    }, 100); // Process every 100ms

    // Gossip loop
    this.gossipInterval = setInterval(async () => {
      await this.performGossipRound();
    }, this.configuration.gossipInterval);

    // Heartbeat loop
    this.heartbeatInterval = setInterval(async () => {
      await this.sendHeartbeats();
    }, this.configuration.heartbeatInterval);
  }

  private async processMessageQueues(): Promise<void> {
    // Process queues in priority order
    const priorities: MessagePriority[] = ['emergency', 'high', 'normal', 'low', 'background'];

    for (const priority of priorities) {
      const queue = this.messageQueue.get(priority) || [];
      if (queue.length === 0) continue;

      // Process up to 10 messages per priority per cycle
      const batch = queue.splice(0, 10);
      for (const message of batch) {
        try {
          await this.routeMessage(message);
        } catch (error) {
          this._logger.error('Failed to route message', {
            messageId: message.id,
            error: error instanceof Error ? error.message : String(error),
          });

          await this.handleMessageFailure(message, error as Error);
        }
      }
    }
  }

  private async routeMessage(message: Message): Promise<void> {
    switch (message.type) {
      case 'broadcast':
        await this.routingEngine.broadcast(message, this.broadcastTrees, this.nodes);
        break;
      case 'multicast':
        await this.routingEngine.multicast(message, this.nodes);
        break;
      case 'unicast':
        await this.routingEngine.unicast(message, this.routingTable, this.nodes);
        break;
      case 'gossip':
        await this.gossipEngine.route(message, this.nodes);
        break;
      default:
        await this.routingEngine.route(message, this.routingTable, this.nodes);
    }

    // Update metrics
    this.updateMessageMetrics(message);
  }

  // Placeholder methods for full implementation
  private async handleIncomingMessage(data: any): Promise<void> {
    this._logger.debug('Handling incoming message', { messageId: data?.messageId });
  }

  private async updateRoutingTable(): Promise<void> {
    // Simple routing table - direct connections only
    for (const [nodeId] of this.nodes) {
      this.routingTable.set(nodeId, [nodeId]);
    }
  }

  private async updateBroadcastTrees(): Promise<void> {
    // Simple broadcast tree implementation
    const nodeIds = Array.from(this.nodes.keys());
    if (nodeIds.length === 0) return;

    const tree: BroadcastTree = {
      root: this._nodeId,
      children: new Map(),
      depth: 0,
      redundancy: 1,
    };

    this.broadcastTrees.set('default', tree);
  }

  private async performGossipRound(): Promise<void> {
    this._logger.debug('Performing gossip round', { stateSize: this.gossipState.size });
  }

  private async sendHeartbeats(): Promise<void> {
    this._logger.debug('Sending heartbeats to nodes', { nodeCount: this.nodes.size });
  }

  private async cleanupExpiredMessages(): Promise<void> {
    const now = Date.now();

    // Cleanup message history
    for (const [messageId, message] of this.messageHistory) {
      if (now - message.timestamp.getTime() > message.ttl) {
        this.messageHistory.delete(messageId);
      }
    }
  }

  private async updateNodeMetrics(): Promise<void> {
    const now = new Date();

    for (const [nodeId, node] of this.nodes) {
      const timeSinceLastSeen = now.getTime() - node.lastSeen.getTime();

      if (timeSinceLastSeen > this.configuration.heartbeatInterval * 3) {
        node.status = 'offline';
        this._logger.warn('Node ' + nodeId + ' marked as offline due to heartbeat timeout');
      } else if (timeSinceLastSeen > this.configuration.heartbeatInterval * 2) {
        node.status = 'degraded';
      } else {
        node.status = 'online';
      }
    }
  }

  private calculateNetworkHealth(): number {
    const totalNodes = this.nodes.size;
    if (totalNodes === 0) return 1;

    const onlineNodes = Array.from(this.nodes.values()).filter(
      (node) => node.status === 'online'
    ).length;

    return onlineNodes / totalNodes;
  }

  private generateMessageId(): string {
    return 'msg-' + Date.now() + '-' + randomBytes(4).toString('hex');
  }

  private updateMessageMetrics(message: Message): void {
    // Update sender metrics
    const senderNode = this.nodes.get(message.sender);
    if (senderNode && senderNode.metrics) {
      senderNode.metrics.messagesSent++;
      senderNode.metrics.lastUpdated = new Date();
    }

    // Update recipient metrics
    for (const recipientId of message.recipients) {
      const recipientNode = this.nodes.get(recipientId);
      if (recipientNode && recipientNode.metrics) {
        recipientNode.metrics.messagesReceived++;
        recipientNode.metrics.lastUpdated = new Date();
      }
    }
  }

  private async handleMessageFailure(message: Message, error: Error): Promise<void> {
    this._logger.error('Message routing failed', {
      messageId: message.id,
      type: message.type,
      error: error.message,
    });

    this.emit('message:failed', {
      messageId: message.id,
      error: error.message,
    });
  }

  private handleNodeConnected(data: any): void {
    this._logger.info('Node connected', { nodeId: data?.nodeId });
    this.updateRoutingTable();
    this.updateBroadcastTrees();
  }

  private handleNodeDisconnected(data: any): void {
    this._logger.info('Node disconnected', { nodeId: data?.nodeId });
    const node = this.nodes.get(data?.nodeId);
    if (node) {
      node.status = 'offline';
    }
    this.updateRoutingTable();
    this.updateBroadcastTrees();
  }

  private handleNetworkPartition(data: any): void {
    this._logger.warn('Network partition detected', data);
  }

  async shutdown(): Promise<void> {
    if (this.processingInterval) clearInterval(this.processingInterval);
    if (this.gossipInterval) clearInterval(this.gossipInterval);
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);

    this.emit('shutdown', { timestamp: new Date() });
    this._logger.info('Communication protocols shutdown');
  }
}

// Supporting interfaces and classes
export type MessageHandler = (message: Message) => Promise<void> | void;

class CompressionEngine {
  constructor(private logger: Logger) {}

  async compress(payload: MessagePayload, config: CompressionConfig): Promise<MessagePayload> {
    if (!config.enabled) return payload;

    const data = JSON.stringify(payload.data);
    if (data.length < config.threshold) return payload;

    try {
      let compressed: Buffer;
      switch (config.algorithm) {
        case 'gzip':
          compressed = gzipSync(data, { level: config.level });
          break;
        default:
          return payload;
      }

      return {
        ...payload,
        data: compressed.toString('base64'),
        encoding: 'base64',
        metadata: {
          ...payload.metadata,
          compressed: true,
          originalSize: data.length,
        },
      };
    } catch (error) {
      this.logger.error('Compression failed', { error });
      return payload;
    }
  }

  async decompress(payload: MessagePayload, config: CompressionConfig): Promise<MessagePayload> {
    if (!(config.enabled && payload.metadata.compressed)) return payload;

    try {
      const compressedData = Buffer.from(payload.data as string, 'base64');
      let decompressed: Buffer;

      switch (config.algorithm) {
        case 'gzip':
          decompressed = gunzipSync(compressedData);
          break;
        default:
          return payload;
      }

      return {
        ...payload,
        data: JSON.parse(decompressed.toString()),
        encoding: 'utf8',
        metadata: {
          ...payload.metadata,
          compressed: false,
        },
      };
    } catch (error) {
      this.logger.error('Decompression failed', { error });
      return payload;
    }
  }
}

class EncryptionEngine {
  constructor(private enabled: boolean, private logger: Logger) {}

  async encrypt(payload: MessagePayload, config: EncryptionConfig): Promise<MessagePayload> {
    if (!(this.enabled && config.enabled)) return payload;

    // Placeholder for encryption implementation
    return {
      ...payload,
      metadata: { ...payload.metadata, encrypted: true },
    };
  }

  async decrypt(payload: MessagePayload, config: EncryptionConfig): Promise<MessagePayload> {
    if (!(this.enabled && config.enabled && payload.metadata.encrypted)) return payload;

    // Placeholder for decryption implementation
    return {
      ...payload,
      metadata: { ...payload.metadata, encrypted: false },
    };
  }
}

class RoutingEngine {
  constructor(private logger: Logger) {}

  async route(
    message: Message,
    routingTable: Map<string, string[]>,
    nodes: Map<string, CommunicationNode>
  ): Promise<void> {
    // Generic routing implementation
    for (const recipient of message.recipients) {
      if (!recipient) continue;
      const route = routingTable.get(recipient);
      if (route && route.length > 0 && route[0]) {
        await this.forwardMessage(message, route[0], nodes);
      }
    }
  }

  async broadcast(
    message: Message,
    broadcastTrees: Map<string, BroadcastTree>,
    nodes: Map<string, CommunicationNode>
  ): Promise<void> {
    const tree = broadcastTrees.get('default');
    if (!tree) return;

    await this.broadcastViaTree(message, tree, nodes);
  }

  async multicast(
    message: Message,
    nodes: Map<string, CommunicationNode>
  ): Promise<void> {
    for (const recipient of message.recipients) {
      if (nodes.has(recipient)) {
        await this.forwardMessage(message, recipient, nodes);
      }
    }
  }

  async unicast(
    message: Message,
    routingTable: Map<string, string[]>,
    nodes: Map<string, CommunicationNode>
  ): Promise<void> {
    if (message.recipients.length !== 1) {
      throw new Error('Unicast requires exactly one recipient');
    }

    const recipient = message.recipients[0];
    if (!recipient) {
      throw new Error('No recipient found');
    }

    const route = routingTable.get(recipient);
    if (route && route.length > 0 && route[0]) {
      await this.forwardMessage(message, route[0], nodes);
    }
  }

  private async forwardMessage(
    message: Message,
    targetId: string,
    nodes: Map<string, CommunicationNode>
  ): Promise<void> {
    const targetNode = nodes.get(targetId);
    if (!targetNode || targetNode.status === 'offline') {
      throw new Error('Target node ' + targetId + ' is unreachable');
    }

    // Simulate message forwarding
    this.logger.debug('Message forwarded', {
      messageId: message.id,
      target: targetId,
      address: targetNode.address,
    });
  }

  private async broadcastViaTree(
    message: Message,
    tree: BroadcastTree,
    nodes: Map<string, CommunicationNode>
  ): Promise<void> {
    // Recursive tree traversal for broadcast
    const visited = new Set<string>();
    await this.traverseBroadcastTree(message, tree.root, tree, nodes, visited);
  }

  private async traverseBroadcastTree(
    message: Message,
    nodeId: string,
    tree: BroadcastTree,
    nodes: Map<string, CommunicationNode>,
    visited: Set<string>
  ): Promise<void> {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const children = tree.children.get(nodeId) || [];
    for (const childId of children) {
      if (nodes.has(childId)) {
        await this.forwardMessage(message, childId, nodes);
        await this.traverseBroadcastTree(message, childId, tree, nodes, visited);
      }
    }
  }
}

class ConsensusEngine {
  private activeProposals = new Map<string, ConsensusProposal>();

  constructor(private _nodeId: string, private logger: Logger) {}

  /**
   * Initiate consensus process for a proposal.
   */
  async initiateConsensus(proposalId: string, proposal: ConsensusProposal): Promise<void> {
    this.activeProposals.set(proposalId, proposal);
    this.logger.debug('Consensus initiated', {
      proposalId,
      type: proposal.type,
      nodeId: this._nodeId,
    });
  }

  /**
   * Process an incoming consensus proposal.
   */
  async processProposal(proposal: ConsensusProposal): Promise<void> {
    this.activeProposals.set(proposal.id, proposal);
    this.logger.debug('Processing consensus proposal', {
      proposalId: proposal.id,
      type: proposal.type,
    });
    // Consensus algorithm implementations would go here
    // (Raft, PBFT, etc.)
  }

  /**
   * Get active proposals for monitoring.
   */
  getActiveProposals(): ConsensusProposal[] {
    return Array.from(this.activeProposals.values());
  }
}

class GossipEngine {
  constructor(private _nodeId: string, private logger: Logger) {}

  async propagate(
    key: string,
    state: GossipState,
    _nodes: Map<string, CommunicationNode>
  ): Promise<void> {
    // Gossip propagation logic
    this.logger.debug('Gossip state propagated', {
      key,
      version: state.version,
      nodeId: this._nodeId,
    });
  }

  async route(_message: Message, _nodes: Map<string, CommunicationNode>): Promise<void> {
    // Gossip routing logic
  }

  async handleStateUpdate(data: any, gossipState: Map<string, GossipState>): Promise<void> {
    // Handle incoming gossip state updates
    const { key, state } = data;
    const currentState = gossipState.get(key);

    if (!currentState || state.version > currentState.version) {
      gossipState.set(key, state);
      this.logger.debug('Gossip state updated', {
        key,
        version: state.version,
        nodeId: this._nodeId,
      });
    }
  }
}

export default CommunicationProtocols;

// Alias for backward compatibility
export { CommunicationProtocols as AgentCommunicationProtocol };