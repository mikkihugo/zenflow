"use strict";
/**
 * Hive Mind Communication Protocol
 * Defines how agents communicate, vote, and share knowledge
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HiveCommunicationProtocol = void 0;
const events_1 = require("events");
const helpers_js_1 = require("../utils/helpers.js");
class HiveCommunicationProtocol extends events_1.EventEmitter {
    constructor(options = {}) {
        super();
        this.channels = new Map();
        this.messageQueue = new Map();
        this.knowledgeBase = new Map();
        this.consensusThreshold = options.consensusThreshold || 0.6;
        this.initializeChannels();
    }
    /**
     * Initialize default communication channels
     */
    initializeChannels() {
        // Broadcast channel for all agents
        this.createChannel('broadcast', 'broadcast', 'General announcements and updates');
        // Consensus channel for voting
        this.createChannel('consensus', 'consensus', 'Voting and decision making');
        // Coordination channel for task management
        this.createChannel('coordination', 'coordination', 'Task assignment and progress');
        // Knowledge channel for sharing insights
        this.createChannel('knowledge', 'knowledge', 'Knowledge sharing and learning');
    }
    /**
     * Create a new communication channel
     */
    createChannel(name, type, description) {
        const channel = {
            id: (0, helpers_js_1.generateId)('channel'),
            name,
            type,
            members: new Set(),
            messages: []
        };
        this.channels.set(channel.id, channel);
        this.emit('channel:created', { channel, description });
        return channel;
    }
    /**
     * Join an agent to a channel
     */
    joinChannel(channelId, agentId) {
        const channel = this.channels.get(channelId);
        if (!channel)
            throw new Error(`Channel ${channelId} not found`);
        channel.members.add(agentId);
        this.emit('channel:joined', { channelId, agentId });
    }
    /**
     * Send a message through the protocol
     */
    sendMessage(message) {
        const fullMessage = {
            ...message,
            id: (0, helpers_js_1.generateId)('msg'),
            timestamp: Date.now()
        };
        // Route message based on type
        this.routeMessage(fullMessage);
        // Store in appropriate channel
        const channelType = this.getChannelTypeForMessage(fullMessage.type);
        const channel = Array.from(this.channels.values()).find(c => c.type === channelType);
        if (channel) {
            channel.messages.push(fullMessage);
        }
        // Queue for recipient(s)
        if (fullMessage.to === 'broadcast') {
            // Queue for all agents
            for (const channel of this.channels.values()) {
                for (const member of channel.members) {
                    this.queueMessage(member, fullMessage);
                }
            }
        }
        else {
            // Queue for specific recipient
            this.queueMessage(fullMessage.to, fullMessage);
        }
        this.emit('message:sent', fullMessage);
        return fullMessage;
    }
    /**
     * Route message based on type
     */
    routeMessage(message) {
        switch (message.type) {
            case 'vote_request':
                this.handleVoteRequest(message);
                break;
            case 'knowledge_share':
                this.handleKnowledgeShare(message);
                break;
            case 'consensus_check':
                this.handleConsensusCheck(message);
                break;
            case 'quality_report':
                this.handleQualityReport(message);
                break;
        }
    }
    /**
     * Get channel type for message type
     */
    getChannelTypeForMessage(messageType) {
        switch (messageType) {
            case 'vote_request':
            case 'vote_response':
            case 'consensus_check':
                return 'consensus';
            case 'task_proposal':
            case 'status_update':
            case 'coordination_sync':
                return 'coordination';
            case 'knowledge_share':
                return 'knowledge';
            default:
                return 'broadcast';
        }
    }
    /**
     * Queue message for agent
     */
    queueMessage(agentId, message) {
        if (!this.messageQueue.has(agentId)) {
            this.messageQueue.set(agentId, []);
        }
        this.messageQueue.get(agentId).push(message);
    }
    /**
     * Retrieve messages for agent
     */
    getMessages(agentId) {
        const messages = this.messageQueue.get(agentId) || [];
        this.messageQueue.set(agentId, []); // Clear after retrieval
        return messages;
    }
    /**
     * Handle vote request
     */
    handleVoteRequest(message) {
        const { proposal, deadline } = message.payload;
        this.emit('vote:requested', {
            messageId: message.id,
            proposal,
            deadline,
            from: message.from
        });
        // Set timeout for vote collection
        if (deadline) {
            setTimeout(() => {
                this.collectVotes(message.id);
            }, deadline - Date.now());
        }
    }
    /**
     * Submit a vote response
     */
    submitVote(requestId, agentId, vote, confidence = 1.0) {
        const voteMessage = this.sendMessage({
            from: agentId,
            to: 'consensus',
            type: 'vote_response',
            payload: {
                requestId,
                vote,
                confidence,
                reasoning: this.generateVoteReasoning(vote, confidence)
            },
            priority: 'high'
        });
        this.emit('vote:submitted', {
            requestId,
            agentId,
            vote,
            confidence
        });
        return voteMessage;
    }
    /**
     * Generate reasoning for vote
     */
    generateVoteReasoning(vote, confidence) {
        if (vote && confidence > 0.8) {
            return 'Strong alignment with objectives and capabilities';
        }
        else if (vote && confidence > 0.5) {
            return 'Moderate alignment, some concerns but manageable';
        }
        else if (!vote && confidence > 0.8) {
            return 'Significant concerns or misalignment detected';
        }
        else {
            return 'Insufficient information or capability mismatch';
        }
    }
    /**
     * Collect and evaluate votes
     */
    collectVotes(requestId) {
        const votes = new Map();
        // Collect all vote responses for this request
        for (const channel of this.channels.values()) {
            for (const message of channel.messages) {
                if (message.type === 'vote_response' &&
                    message.payload.requestId === requestId) {
                    votes.set(message.from, {
                        vote: message.payload.vote,
                        confidence: message.payload.confidence
                    });
                }
            }
        }
        // Calculate consensus
        const consensus = this.calculateConsensus(votes);
        this.emit('consensus:reached', {
            requestId,
            consensus,
            votes: Array.from(votes.entries())
        });
    }
    /**
     * Calculate consensus from votes
     */
    calculateConsensus(votes) {
        if (votes.size === 0) {
            return { approved: false, confidence: 0 };
        }
        let totalWeight = 0;
        let approvalWeight = 0;
        for (const [_, { vote, confidence }] of votes) {
            totalWeight += confidence;
            if (vote) {
                approvalWeight += confidence;
            }
        }
        const approvalRate = approvalWeight / totalWeight;
        const approved = approvalRate >= this.consensusThreshold;
        return { approved, confidence: approvalRate };
    }
    /**
     * Handle knowledge sharing
     */
    handleKnowledgeShare(message) {
        const { key, value, metadata } = message.payload;
        // Store in knowledge base
        this.knowledgeBase.set(key, {
            value,
            metadata,
            contributor: message.from,
            timestamp: message.timestamp
        });
        this.emit('knowledge:shared', {
            key,
            contributor: message.from,
            timestamp: message.timestamp
        });
    }
    /**
     * Query knowledge base
     */
    queryKnowledge(pattern) {
        const results = [];
        for (const [key, data] of this.knowledgeBase) {
            if (key.includes(pattern)) {
                results.push({ key, ...data });
            }
        }
        return results;
    }
    /**
     * Handle consensus check
     */
    handleConsensusCheck(message) {
        const { topic, options } = message.payload;
        // Initiate voting round
        const voteRequest = this.sendMessage({
            from: 'consensus-system',
            to: 'broadcast',
            type: 'vote_request',
            payload: {
                topic,
                options,
                deadline: Date.now() + 30000 // 30 second deadline
            },
            priority: 'urgent',
            requiresResponse: true
        });
        this.emit('consensus:initiated', {
            topic,
            options,
            requestId: voteRequest.id
        });
    }
    /**
     * Handle quality report
     */
    handleQualityReport(message) {
        const { taskId, metrics, issues } = message.payload;
        // Store quality metrics
        this.knowledgeBase.set(`quality/${taskId}`, {
            metrics,
            issues,
            reporter: message.from,
            timestamp: message.timestamp
        });
        // Check if quality threshold breached
        if (metrics.score < 0.7) {
            this.emit('quality:alert', {
                taskId,
                score: metrics.score,
                issues,
                reporter: message.from
            });
        }
    }
    /**
     * Get communication statistics
     */
    getStatistics() {
        const stats = {
            totalMessages: 0,
            messagesByType: new Map(),
            messagesByPriority: new Map(),
            activeChannels: this.channels.size,
            knowledgeEntries: this.knowledgeBase.size,
            avgResponseTime: 0
        };
        // Aggregate message statistics
        for (const channel of this.channels.values()) {
            stats.totalMessages += channel.messages.length;
            for (const message of channel.messages) {
                const typeCount = stats.messagesByType.get(message.type) || 0;
                stats.messagesByType.set(message.type, typeCount + 1);
                const priorityCount = stats.messagesByPriority.get(message.priority) || 0;
                stats.messagesByPriority.set(message.priority, priorityCount + 1);
            }
        }
        return stats;
    }
    /**
     * Export communication log
     */
    exportLog() {
        const log = {
            channels: Array.from(this.channels.values()).map(channel => ({
                id: channel.id,
                name: channel.name,
                type: channel.type,
                memberCount: channel.members.size,
                messageCount: channel.messages.length
            })),
            messages: [],
            knowledge: Array.from(this.knowledgeBase.entries()).map(([key, value]) => ({
                key,
                ...value
            }))
        };
        // Collect all messages
        for (const channel of this.channels.values()) {
            log.messages.push(...channel.messages);
        }
        // Sort by timestamp
        log.messages.sort((a, b) => a.timestamp - b.timestamp);
        return log;
    }
}
exports.HiveCommunicationProtocol = HiveCommunicationProtocol;
