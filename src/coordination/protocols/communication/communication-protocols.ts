/**
 * Advanced Communication Protocols for Swarm Coordination
 * Provides efficient message passing, compression, broadcast/multicast,
 * gossip protocol, and consensus mechanisms
 */

import { createHash, randomBytes } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { gunzipSync, gzipSync } from 'node:zlib';
import type { IEventBus } from '@core/event-bus';
import type { ILogger } from '@core/logger';

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

export type MessageType =
  | 'broadcast'
  | 'multicast'
  | 'unicast'
  | 'gossip'
  | 'heartbeat'
  | 'consensus'
  | 'election'
  | 'coordination'
  | 'data'
  | 'control'
  | 'emergency';

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
 * Advanced Communication Protocol Manager
 *
 * @example
 */
export class CommunicationProtocols extends EventEmitter {
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
    private config: {
      maxMessageHistory: number;
      messageTimeout: number;
      gossipInterval: number;
      heartbeatInterval: number;
      compressionThreshold: number;
      encryptionEnabled: boolean;
      consensusTimeout: number;
      maxHops: number;
    },
    private _logger: ILogger,
    private eventBus: IEventBus
  ) {
    super();

    this.initializeMessageQueues();
    this.compressionEngine = new CompressionEngine(this._logger);
    this.encryptionEngine = new EncryptionEngine(this.config.encryptionEnabled, this._logger);
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
   * Register a communication node
   *
   * @param node
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
   * Send a message using various protocols
   *
   * @param message
   */
  async sendMessage(message: Partial<Message>): Promise<string> {
    const fullMessage: Message = {
      id: message.id || this.generateMessageId(),
      type: message.type || 'unicast',
      sender: message.sender || this._nodeId,
      recipients: message.recipients || [],
      payload: message.payload || {
        data: null,
        metadata: {},
        contentType: 'application/json',
        encoding: 'utf8',
        version: '1.0',
      },
      priority: message.priority || 'normal',
      encryption: message.encryption || { enabled: this.config.encryptionEnabled },
      compression: message.compression || {
        enabled: true,
        algorithm: 'gzip',
        level: 6,
        threshold: this.config.compressionThreshold,
      },
      routing: message.routing || {
        strategy: 'adaptive',
        maxHops: this.config.maxHops,
        reliabilityMode: 'at-least-once',
        acknowledgment: true,
        timeout: this.config.messageTimeout,
      },
      qos: message.qos || {
        bandwidth: 0,
        latency: 0,
        reliability: 0.95,
        ordering: false,
        deduplication: true,
      },
      timestamp: new Date(),
      ttl: message.ttl || this.config.messageTimeout,
      checksum: '',
    };

    // Calculate checksum
    fullMessage.checksum = this.calculateChecksum(fullMessage);

    // Store in history
    this.messageHistory.set(fullMessage.id, fullMessage);
    this.cleanupMessageHistory();

    // Process message based on type
    await this.processOutgoingMessage(fullMessage);

    this.emit('message:sent', { messageId: fullMessage.id, type: fullMessage.type });
    return fullMessage.id;
  }

  /**
   * Broadcast message to all nodes
   *
   * @param payload
   * @param priority
   */
  async broadcast(payload: MessagePayload, priority: MessagePriority = 'normal'): Promise<string> {
    const allNodes = Array.from(this.nodes.keys()).filter((id) => id !== this._nodeId);

    return await this.sendMessage({
      type: 'broadcast',
      recipients: allNodes,
      payload,
      priority,
      routing: {
        strategy: 'multipath',
        maxHops: 3,
        reliabilityMode: 'at-least-once',
        acknowledgment: false,
        timeout: this.config.messageTimeout,
      },
    });
  }

  /**
   * Multicast message to specific group
   *
   * @param recipients
   * @param payload
   * @param priority
   */
  async multicast(
    recipients: string[],
    payload: MessagePayload,
    priority: MessagePriority = 'normal'
  ): Promise<string> {
    return await this.sendMessage({
      type: 'multicast',
      recipients,
      payload,
      priority,
      routing: {
        strategy: 'direct',
        maxHops: 2,
        reliabilityMode: 'at-least-once',
        acknowledgment: true,
        timeout: this.config.messageTimeout,
      },
    });
  }

  /**
   * Send unicast message
   *
   * @param recipient
   * @param payload
   * @param priority
   */
  async unicast(
    recipient: string,
    payload: MessagePayload,
    priority: MessagePriority = 'normal'
  ): Promise<string> {
    return await this.sendMessage({
      type: 'unicast',
      recipients: [recipient],
      payload,
      priority,
      routing: {
        strategy: 'direct',
        maxHops: 1,
        reliabilityMode: 'exactly-once',
        acknowledgment: true,
        timeout: this.config.messageTimeout,
      },
    });
  }

  /**
   * Start gossip protocol for state synchronization
   *
   * @param key
   * @param data
   */
  async startGossip(key: string, data: any): Promise<void> {
    const state: GossipState = {
      version: Date.now(),
      data,
      timestamp: new Date(),
      checksum: this.calculateDataChecksum(data),
    };

    this.gossipState.set(key, state);

    await this.gossipEngine.propagate(key, state, this.nodes);

    this.emit('gossip:started', { key, version: state.version });
  }

  /**
   * Initiate consensus on a proposal
   *
   * @param type
   * @param value
   * @param participants
   */
  async initiateConsensus(
    type: ConsensusProposal['type'],
    value: any,
    participants?: string[]
  ): Promise<string> {
    const proposal: ConsensusProposal = {
      id: this.generateProposalId(),
      type,
      proposer: this._nodeId,
      value,
      round: 1,
      timestamp: new Date(),
      signatures: new Map(),
    };

    this.consensusProposals.set(proposal.id, proposal);
    this.consensusVotes.set(proposal.id, []);

    // Initialize consensus in the engine
    await this.consensusEngine.initiateConsensus(proposal.id, proposal);

    const targetNodes =
      participants || Array.from(this.nodes.keys()).filter((id) => id !== this._nodeId);

    await this.multicast(
      targetNodes,
      {
        data: { type: 'consensus_proposal', proposal },
        metadata: { consensusRound: 1 },
        contentType: 'application/json',
        encoding: 'utf8',
        version: '1.0',
      },
      'high'
    );

    this.emit('consensus:initiated', { proposalId: proposal.id, type, participants: targetNodes });
    return proposal.id;
  }

  /**
   * Vote on a consensus proposal
   *
   * @param proposalId
   * @param decision
   * @param reasoning
   */
  async vote(
    proposalId: string,
    decision: ConsensusVote['decision'],
    reasoning?: string
  ): Promise<void> {
    const proposal = this.consensusProposals.get(proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }

    const vote: ConsensusVote = {
      proposalId,
      voter: this._nodeId,
      decision,
      ...(reasoning && { reasoning }),
      timestamp: new Date(),
      signature: this.signVote(proposalId, decision),
    };

    const votes = this.consensusVotes.get(proposalId) || [];
    votes.push(vote);
    this.consensusVotes.set(proposalId, votes);

    // Send vote to proposer
    await this.unicast(
      proposal.proposer,
      {
        data: { type: 'consensus_vote', vote },
        metadata: { consensusRound: proposal.round },
        contentType: 'application/json',
        encoding: 'utf8',
        version: '1.0',
      },
      'high'
    );

    this.emit('vote:cast', { proposalId, decision, voter: this._nodeId });
  }

  /**
   * Register message handler for specific message type
   *
   * @param messageType
   * @param handler
   */
  registerHandler(messageType: MessageType, handler: MessageHandler): void {
    const handlers = this.messageHandlers.get(messageType) || [];
    handlers.push(handler);
    this.messageHandlers.set(messageType, handlers);
  }

  /**
   * Get communication metrics
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
   * Get node status
   *
   * @param nodeId
   */
  getNodeStatus(nodeId: string): CommunicationNode | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Get routing information
   */
  getRoutingInfo(): {
    routingTable: Record<string, string[]>;
    broadcastTrees: Record<string, any>;
    networkTopology: any;
  } {
    const routingTable: Record<string, string[]> = {};
    for (const [key, value] of this.routingTable) {
      routingTable[key] = value;
    }

    const broadcastTrees: Record<string, any> = {};
    for (const [key, value] of this.broadcastTrees) {
      broadcastTrees[key] = {
        root: value.root,
        children: Object.fromEntries(value.children),
        depth: value.depth,
        redundancy: value.redundancy,
      };
    }

    return {
      routingTable,
      broadcastTrees,
      networkTopology: this.buildNetworkTopology(),
    };
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
    }, this.config.gossipInterval);

    // Heartbeat loop
    this.heartbeatInterval = setInterval(async () => {
      await this.sendHeartbeats();
    }, this.config.heartbeatInterval);
  }

  private async processOutgoingMessage(message: Message): Promise<void> {
    // Apply compression if enabled
    if (message.compression.enabled) {
      message.payload = await this.compressionEngine.compress(message.payload, message.compression);
    }

    // Apply encryption if enabled
    if (message.encryption.enabled) {
      message.payload = await this.encryptionEngine.encrypt(message.payload, message.encryption);
    }

    // Add to appropriate queue based on priority
    const queue = this.messageQueue.get(message.priority) || [];
    queue.push(message);
    this.messageQueue.set(message.priority, queue);

    this._logger.debug('Message queued for processing', {
      messageId: message.id,
      type: message.type,
      priority: message.priority,
      recipients: message.recipients.length,
    });
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

          // Retry logic could go here
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

  private async handleIncomingMessage(data: any): Promise<void> {
    try {
      const message: Message = data.message;

      // Verify checksum
      if (!this.verifyChecksum(message)) {
        this._logger.warn('Message checksum verification failed', { messageId: message.id });
        return;
      }

      // Check TTL
      if (this.isMessageExpired(message)) {
        this._logger.debug('Expired message received', { messageId: message.id });
        return;
      }

      // Decrypt if needed
      if (message.encryption.enabled) {
        message.payload = await this.encryptionEngine.decrypt(message.payload, message.encryption);
      }

      // Decompress if needed
      if (message.compression.enabled) {
        message.payload = await this.compressionEngine.decompress(
          message.payload,
          message.compression
        );
      }

      // Handle based on message type
      await this.handleMessageByType(message);

      this.emit('message:received', {
        messageId: message.id,
        type: message.type,
        sender: message.sender,
      });
    } catch (error) {
      this._logger.error('Failed to handle incoming message', { error });
    }
  }

  private async handleMessageByType(message: Message): Promise<void> {
    const handlers = this.messageHandlers.get(message.type) || [];

    // Execute all registered handlers
    const handlerPromises = handlers.map((handler) => handler(message));
    await Promise.allSettled(handlerPromises);

    // Built-in message type handling
    switch (message.type) {
      case 'heartbeat':
        await this.handleHeartbeat(message);
        break;
      case 'gossip':
        await this.handleGossipMessage(message);
        break;
      case 'consensus':
        await this.handleConsensusMessage(message);
        break;
      case 'election':
        await this.handleElectionMessage(message);
        break;
    }
  }

  private async handleHeartbeat(message: Message): Promise<void> {
    const node = this.nodes.get(message.sender);
    if (node) {
      node.lastSeen = new Date();
      node.status = 'online';
    }
  }

  private async handleGossipMessage(message: Message): Promise<void> {
    const gossipData = message.payload.data;
    if (gossipData.type === 'state_update') {
      await this.gossipEngine.handleStateUpdate(gossipData, this.gossipState);
    }
  }

  private async handleConsensusMessage(message: Message): Promise<void> {
    const consensusData = message.payload.data;

    if (consensusData.type === 'consensus_proposal') {
      await this.handleConsensusProposal(consensusData.proposal);
    } else if (consensusData.type === 'consensus_vote') {
      await this.handleConsensusVote(consensusData.vote);
    }
  }

  private async handleConsensusProposal(proposal: ConsensusProposal): Promise<void> {
    this.consensusProposals.set(proposal.id, proposal);

    // Delegate to consensus engine for processing
    await this.consensusEngine.processProposal(proposal);

    // Auto-vote based on some criteria (this would be more sophisticated)
    const decision = await this.evaluateProposal(proposal);
    await this.vote(proposal.id, decision);
  }

  private async handleConsensusVote(vote: ConsensusVote): Promise<void> {
    const votes = this.consensusVotes.get(vote.proposalId) || [];
    votes.push(vote);
    this.consensusVotes.set(vote.proposalId, votes);

    // Check if consensus is reached
    await this.checkConsensusResult(vote.proposalId);
  }

  private async checkConsensusResult(proposalId: string): Promise<void> {
    const proposal = this.consensusProposals.get(proposalId);
    const votes = this.consensusVotes.get(proposalId) || [];

    if (!proposal) return;

    const totalNodes = this.nodes.size;
    const requiredVotes = Math.floor(totalNodes * 0.67); // 2/3 majority

    if (votes.length >= requiredVotes) {
      const acceptVotes = votes.filter((v) => v.decision === 'accept').length;
      const result = acceptVotes >= requiredVotes ? 'accepted' : 'rejected';

      this.emit('consensus:reached', { proposalId, result, votes: votes.length });

      // Cleanup
      this.consensusProposals.delete(proposalId);
      this.consensusVotes.delete(proposalId);
    }
  }

  private async handleElectionMessage(message: Message): Promise<void> {
    // Leader election logic would be implemented here
    this._logger.debug('Election message received', { sender: message.sender });
  }

  private async updateRoutingTable(): Promise<void> {
    // Simple routing table - direct connections only
    for (const [nodeId] of this.nodes) {
      this.routingTable.set(nodeId, [nodeId]);
    }

    // More sophisticated routing algorithms would be implemented here
    // (e.g., shortest path, load-based routing, etc.)
  }

  private async updateBroadcastTrees(): Promise<void> {
    const nodeIds = Array.from(this.nodes.keys());

    if (nodeIds.length === 0) return;

    // Create spanning tree for efficient broadcast
    const tree: BroadcastTree = {
      root: this._nodeId,
      children: new Map(),
      depth: 0,
      redundancy: 1,
    };

    // Simple binary tree construction
    for (let i = 0; i < nodeIds.length; i++) {
      const parentIndex = Math.floor((i - 1) / 2);
      const parentId = i === 0 ? this._nodeId : nodeIds[parentIndex];
      const nodeId = nodeIds[i];
      
      if (parentId && nodeId) {
        const children = tree.children.get(parentId) || [];
        children.push(nodeId);
        tree.children.set(parentId, children);
      }
    }

    this.broadcastTrees.set('default', tree);
  }

  private async performGossipRound(): Promise<void> {
    if (this.gossipState.size === 0 || this.nodes.size === 0) return;

    // Select random subset of nodes for gossip
    const nodeIds = Array.from(this.nodes.keys()).filter((id) => id !== this._nodeId);
    const gossipTargets = this.selectRandomNodes(nodeIds, Math.min(3, nodeIds.length));

    for (const [key, state] of this.gossipState) {
      for (const targetId of gossipTargets) {
        await this.unicast(
          targetId,
          {
            data: { type: 'state_update', key, state },
            metadata: { gossipRound: Date.now() },
            contentType: 'application/json',
            encoding: 'utf8',
            version: '1.0',
          },
          'background'
        );
      }
    }
  }

  private async sendHeartbeats(): Promise<void> {
    const heartbeatPayload: MessagePayload = {
      data: { timestamp: Date.now(), nodeId: this._nodeId },
      metadata: { type: 'heartbeat' },
      contentType: 'application/json',
      encoding: 'utf8',
      version: '1.0',
    };

    await this.broadcast(heartbeatPayload, 'background');
  }

  private async cleanupExpiredMessages(): Promise<void> {
    const now = Date.now();

    // Cleanup message history
    for (const [messageId, message] of this.messageHistory) {
      if (now - message.timestamp.getTime() > message.ttl) {
        this.messageHistory.delete(messageId);
      }
    }

    // Cleanup expired consensus proposals
    for (const [proposalId, proposal] of this.consensusProposals) {
      if (now - proposal.timestamp.getTime() > this.config.consensusTimeout) {
        this.consensusProposals.delete(proposalId);
        this.consensusVotes.delete(proposalId);
      }
    }
  }

  private cleanupMessageHistory(): void {
    if (this.messageHistory.size > this.config.maxMessageHistory) {
      const sortedMessages = Array.from(this.messageHistory.entries()).sort(
        ([, a], [, b]) => a.timestamp.getTime() - b.timestamp.getTime()
      );

      const toDelete = sortedMessages.slice(
        0,
        sortedMessages.length - this.config.maxMessageHistory
      );
      for (const [messageId] of toDelete) {
        this.messageHistory.delete(messageId);
      }
    }
  }

  private async updateNodeMetrics(): Promise<void> {
    const now = new Date();

    for (const [nodeId, node] of this.nodes) {
      const timeSinceLastSeen = now.getTime() - node.lastSeen.getTime();

      if (timeSinceLastSeen > this.config.heartbeatInterval * 3) {
        node.status = 'offline';
        this._logger.warn(`Node ${nodeId} marked as offline due to heartbeat timeout`);
      } else if (timeSinceLastSeen > this.config.heartbeatInterval * 2) {
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

  private buildNetworkTopology(): any {
    const topology = {
      nodes: Array.from(this.nodes.entries()).map(([id, node]) => ({
        id,
        status: node.status,
        address: node.address,
        lastSeen: node.lastSeen,
      })),
      connections: Array.from(this.routingTable.entries()).map(([source, targets]) => ({
        source,
        targets,
      })),
    };

    return topology;
  }

  private selectRandomNodes(nodes: string[], count: number): string[] {
    const shuffled = [...nodes].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  private generateMessageId(): string {
    return `msg-${Date.now()}-${randomBytes(4).toString('hex')}`;
  }

  private generateProposalId(): string {
    return `prop-${Date.now()}-${randomBytes(4).toString('hex')}`;
  }

  private calculateChecksum(message: Message): string {
    const data = JSON.stringify({
      sender: message.sender,
      recipients: message.recipients,
      payload: message.payload,
      timestamp: message.timestamp,
    });

    return createHash('sha256').update(data).digest('hex');
  }

  private calculateDataChecksum(data: any): string {
    return createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }

  private verifyChecksum(message: Message): boolean {
    const expectedChecksum = this.calculateChecksum(message);
    return message.checksum === expectedChecksum;
  }

  private isMessageExpired(message: Message): boolean {
    return Date.now() - message.timestamp.getTime() > message.ttl;
  }

  private signVote(proposalId: string, decision: ConsensusVote['decision']): string {
    const data = `${proposalId}:${decision}:${this._nodeId}:${Date.now()}`;
    return createHash('sha256').update(data).digest('hex');
  }

  private async evaluateProposal(_proposal: ConsensusProposal): Promise<ConsensusVote['decision']> {
    // Simplified evaluation logic
    // In practice, this would involve complex decision-making algorithms
    return Math.random() > 0.3 ? 'accept' : 'reject';
  }

  private updateMessageMetrics(message: Message): void {
    // Update sender metrics
    const senderNode = this.nodes.get(message.sender);
    if (senderNode) {
      senderNode.metrics.messagesSent++;
      senderNode.metrics.lastUpdated = new Date();
    }

    // Update recipient metrics
    for (const recipientId of message.recipients) {
      const recipientNode = this.nodes.get(recipientId);
      if (recipientNode) {
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

    // Implement retry logic, dead letter queue, etc.
    this.emit('message:failed', { messageId: message.id, error: error.message });
  }

  private handleNodeConnected(data: any): void {
    this._logger.info('Node connected', { nodeId: data.nodeId });
    this.updateRoutingTable();
    this.updateBroadcastTrees();
  }

  private handleNodeDisconnected(data: any): void {
    this._logger.info('Node disconnected', { nodeId: data.nodeId });
    const node = this.nodes.get(data.nodeId);
    if (node) {
      node.status = 'offline';
    }
    this.updateRoutingTable();
    this.updateBroadcastTrees();
  }

  private handleNetworkPartition(data: any): void {
    this._logger.warn('Network partition detected', data);
    // Implement partition handling logic
  }

  private initializeMessageQueues(): void {
    const priorities: MessagePriority[] = ['emergency', 'high', 'normal', 'low', 'background'];
    for (const priority of priorities) {
      this.messageQueue.set(priority, []);
    }
  }

  async shutdown(): Promise<void> {
    if (this.processingInterval) clearInterval(this.processingInterval);
    if (this.gossipInterval) clearInterval(this.gossipInterval);
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);

    this.emit('shutdown');
    this._logger.info('Communication protocols shutdown');
  }
}

// Supporting interfaces and classes
export type MessageHandler = (message: Message) => Promise<void> | void;

class CompressionEngine {
  constructor(private logger: ILogger) {}

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
        metadata: { ...payload.metadata, compressed: true, originalSize: data.length },
      };
    } catch (error) {
      this.logger.error('Compression failed', { error });
      return payload;
    }
  }

  async decompress(payload: MessagePayload, config: CompressionConfig): Promise<MessagePayload> {
    if (!config.enabled || !payload.metadata['compressed']) return payload;

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
        metadata: { ...payload.metadata, compressed: false },
      };
    } catch (error) {
      this.logger.error('Decompression failed', { error });
      return payload;
    }
  }
}

class EncryptionEngine {
  constructor(
    private enabled: boolean,
    private logger: ILogger
  ) {
    void this.logger; // Mark as intentionally unused for now
  }

  async encrypt(payload: MessagePayload, config: EncryptionConfig): Promise<MessagePayload> {
    if (!this.enabled || !config.enabled) return payload;

    // Placeholder for encryption implementation
    // Would use actual encryption algorithms like AES-GCM
    return {
      ...payload,
      metadata: { ...payload.metadata, encrypted: true },
    };
  }

  async decrypt(payload: MessagePayload, config: EncryptionConfig): Promise<MessagePayload> {
    if (!this.enabled || !config.enabled || !payload.metadata['encrypted']) return payload;

    // Placeholder for decryption implementation
    return {
      ...payload,
      metadata: { ...payload.metadata, encrypted: false },
    };
  }
}

class RoutingEngine {
  constructor(private logger: ILogger) {
    void this.logger; // Mark as intentionally unused for now
  }

  async route(
    message: Message,
    routingTable: Map<string, string[]>,
    nodes: Map<string, CommunicationNode>
  ): Promise<void> {
    // Generic routing implementation
    for (const recipient of message.recipients) {
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

  async multicast(message: Message, nodes: Map<string, CommunicationNode>): Promise<void> {
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
      throw new Error(`Target node ${targetId} is unreachable`);
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

  constructor(
    private nodeId: string,
    private logger: ILogger
  ) {}

  /**
   * Initiate consensus process for a proposal
   *
   * @param proposalId
   * @param proposal
   */
  async initiateConsensus(proposalId: string, proposal: ConsensusProposal): Promise<void> {
    this.activeProposals.set(proposalId, proposal);
    this.logger.debug('Consensus initiated', { proposalId, type: proposal.type, nodeId: this.nodeId });
  }

  /**
   * Process an incoming consensus proposal
   *
   * @param proposal
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
   * Get active proposals for monitoring
   */
  getActiveProposals(): ConsensusProposal[] {
    return Array.from(this.activeProposals.values());
  }
}

class GossipEngine {
  constructor(
    private nodeId: string,
    private logger: ILogger
  ) {}

  async propagate(
    key: string,
    state: GossipState,
    _nodes: Map<string, CommunicationNode>
  ): Promise<void> {
    // Gossip propagation logic
    this.logger.debug('Gossip state propagated', { key, version: state.version, nodeId: this.nodeId });
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
      this.logger.debug('Gossip state updated', { key, version: state.version, nodeId: this.nodeId });
    }
  }
}

export default CommunicationProtocols;

// Alias for backward compatibility
export { CommunicationProtocols as AgentCommunicationProtocol };
