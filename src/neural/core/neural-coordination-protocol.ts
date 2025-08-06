/**
 * Neural Coordination Protocol
 * Protocol for coordinating neural networks across distributed agents
 */

export class NeuralCoordinationProtocol {
  public nodes: Map<string, any>;
  public messages: any[];
  public options: {
    syncInterval: number;
    maxMessages: number;
    compressionEnabled: boolean;
    [key: string]: any;
  };

  constructor(options = {}) {
    this.nodes = new Map();
    this.messages = [];
    this.options = {
      syncInterval: 1000,
      maxMessages: 1000,
      compressionEnabled: true,
      ...options,
    };
  }

  /**
   * Register a neural node
   *
   * @param nodeId
   * @param nodeInfo
   */
  registerNode(nodeId, nodeInfo) {
    this.nodes.set(nodeId, {
      ...nodeInfo,
      lastSync: new Date(),
      messageCount: 0,
      status: 'active',
    });
  }

  /**
   * Send coordination message
   *
   * @param fromNode
   * @param toNode
   * @param messageType
   * @param payload
   */
  async sendMessage(fromNode, toNode, messageType, payload) {
    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      from: fromNode,
      to: toNode,
      type: messageType,
      payload,
      timestamp: new Date(),
    };

    this.messages.push(message);

    // Update node stats
    const node = this.nodes.get(fromNode);
    if (node) {
      node.messageCount++;
      node.lastSync = new Date();
    }

    // Cleanup old messages
    if (this.messages.length > this.options.maxMessages) {
      this.messages = this.messages.slice(-this.options.maxMessages);
    }

    return message;
  }

  /**
   * Synchronize neural states
   *
   * @param nodeId
   * @param neuralState
   */
  async synchronize(nodeId, neuralState) {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not registered`);
    }

    // Mock synchronization
    node.lastSync = new Date();
    node.status = 'synced';

    // Broadcast sync to other nodes
    const syncMessage = {
      type: 'neural_sync',
      nodeId,
      state: neuralState,
      timestamp: new Date(),
    };

    for (const [otherId] of this.nodes) {
      if (otherId !== nodeId) {
        await this.sendMessage(nodeId, otherId, 'sync', syncMessage);
      }
    }

    return { success: true, syncedNodes: this.nodes.size - 1 };
  }

  /**
   * Get protocol metrics
   */
  getMetrics() {
    const nodes = Array.from(this.nodes.values());
    return {
      totalNodes: nodes.length,
      activeNodes: nodes.filter((n) => n.status === 'active').length,
      totalMessages: this.messages.length,
      avgMessagesPerNode:
        nodes.length > 0 ? nodes.reduce((sum, n) => sum + n.messageCount, 0) / nodes.length : 0,
      lastActivity:
        this.messages.length > 0 ? this.messages[this.messages.length - 1].timestamp : null,
    };
  }

  /**
   * Get recent messages
   *
   * @param limit
   */
  getRecentMessages(limit = 10) {
    return this.messages
      .slice(-limit)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

export default NeuralCoordinationProtocol;
