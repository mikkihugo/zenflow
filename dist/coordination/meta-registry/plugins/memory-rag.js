/**
 * Memory & RAG (Retrieval Augmented Generation) Plugin
 * Provides intelligent memory and retrieval capabilities for meta registries
 */

import { EventEmitter } from 'events';
import { nanoid } from 'nanoid';
import fs from 'fs-extra';
import path from 'path';

export class MemoryRAGPlugin extends EventEmitter {
  static metadata = {
    name: 'memory-rag',
    version: '1.0.0',
    description: 'Intelligent memory and retrieval augmented generation for registries',
    dependencies: [],
    capabilities: ['memory-storage', 'pattern-recognition', 'intelligent-retrieval', 'context-enhancement', 'learning']
  };

  constructor() {
    super();
    this.registry = null;
    this.memoryBank = new Map();
    this.knowledgeGraph = new Map();
    this.patterns = new Map();
    this.contexts = new Map();
    this.learningHistory = [];
    this.vectorStore = new Map(); // Simplified vector storage
    this.semanticCache = new Map();
  }

  async initialize(registry, options = {}) {
    this.registry = registry;
    this.options = {
      memoryPath: options.memoryPath || './.swarm/memory',
      maxMemorySize: options.maxMemorySize || 10000,
      patternMatchThreshold: options.patternMatchThreshold || 0.8,
      contextWindowSize: options.contextWindowSize || 50,
      enableLearning: options.enableLearning !== false,
      vectorDimensions: options.vectorDimensions || 384,
      ...options
    };

    // Initialize memory storage
    await this.initializeMemoryStorage();

    // Load existing knowledge
    await this.loadKnowledgeBase();

    // Register hooks for intelligent enhancement
    registry.pluginSystem.registerHook('beforeRegister', this.enhanceRegistration.bind(this));
    registry.pluginSystem.registerHook('afterRegister', this.learnFromRegistration.bind(this));
    registry.pluginSystem.registerHook('beforeDiscover', this.enhanceDiscovery.bind(this));
    registry.pluginSystem.registerHook('afterDiscover', this.learnFromDiscovery.bind(this));

    // Register plugin services
    await this.registerPluginServices();

    // Start background learning process
    if (this.options.enableLearning) {
      this.startLearningProcess();
    }
  }

  async initializeMemoryStorage() {
    await fs.ensureDir(this.options.memoryPath);
    this.memoryFile = path.join(this.options.memoryPath, 'memory-bank.json');
    this.knowledgeFile = path.join(this.options.memoryPath, 'knowledge-graph.json');
    this.patternsFile = path.join(this.options.memoryPath, 'patterns.json');
  }

  async registerPluginServices() {
    await this.registry.register('service:memory-rag', {
      plugin: 'memory-rag',
      version: MemoryRAGPlugin.metadata.version,
      capabilities: MemoryRAGPlugin.metadata.capabilities,
      stats: {
        memoryEntries: this.memoryBank.size,
        knowledgeNodes: this.knowledgeGraph.size,
        patterns: this.patterns.size,
        contexts: this.contexts.size
      }
    }, {
      tags: ['service', 'plugin', 'memory-rag', 'intelligence'],
      ttl: 3600
    });
  }

  // Hook handlers with intelligent enhancement
  async enhanceRegistration(data) {
    const { key, value, options } = data;

    // Enhance with historical context
    const context = await this.getRelevantContext(key, value);
    if (context.length > 0) {
      value._context = context;
      options.tags = [...(options.tags || []), 'context-enhanced'];
    }

    // Suggest additional tags based on patterns
    const suggestedTags = await this.suggestTags(key, value);
    if (suggestedTags.length > 0) {
      options.tags = [...(options.tags || []), ...suggestedTags];
      value._suggestedTags = suggestedTags;
    }

    // Add semantic embedding
    const embedding = await this.generateEmbedding(key, value);
    value._embedding = embedding;

    return data;
  }

  async learnFromRegistration(data) {
    const { key, value, options, result } = data;

    // Store in memory bank
    await this.storeMemory({
      type: 'registration',
      key,
      value,
      options,
      result,
      timestamp: new Date(),
      context: await this.getCurrentContext()
    });

    // Update knowledge graph
    await this.updateKnowledgeGraph(key, value, 'register');

    // Learn patterns
    await this.learnPatterns('registration', { key, value, options });

    return data;
  }

  async enhanceDiscovery(data) {
    const { query, options } = data;

    // Expand query with semantic understanding
    const expandedQuery = await this.expandQuery(query);
    Object.assign(data.query, expandedQuery);

    // Add context to options
    const context = await this.getRelevantContext('discovery', query);
    if (context.length > 0) {
      data.options.context = context;
    }

    return data;
  }

  async learnFromDiscovery(data) {
    const { query, options, result } = data;

    // Store discovery pattern
    await this.storeMemory({
      type: 'discovery',
      query,
      options,
      result,
      resultCount: result.length,
      timestamp: new Date(),
      context: await this.getCurrentContext()
    });

    // Learn from successful discovery patterns
    if (result.length > 0) {
      await this.learnPatterns('discovery', { query, result });
    }

    return data;
  }

  // Memory storage and retrieval
  async storeMemory(memoryData) {
    const memoryId = nanoid();
    const memory = {
      id: memoryId,
      ...memoryData,
      stored: new Date()
    };

    this.memoryBank.set(memoryId, memory);

    // Maintain memory size limit
    if (this.memoryBank.size > this.options.maxMemorySize) {
      await this.pruneMemories();
    }

    // Persist to disk
    await this.persistMemory();

    this.emit('memoryStored', { memoryId, memory });
    return memoryId;
  }

  async retrieveMemory(query, options = {}) {
    const memories = Array.from(this.memoryBank.values());
    const relevantMemories = [];

    for (const memory of memories) {
      const relevance = await this.calculateRelevance(memory, query);
      if (relevance > (options.threshold || 0.5)) {
        relevantMemories.push({
          memory,
          relevance,
          age: Date.now() - memory.stored.getTime()
        });
      }
    }

    // Sort by relevance and recency
    relevantMemories.sort((a, b) => {
      const scoreA = a.relevance - (a.age / 1000000); // Slight recency bias
      const scoreB = b.relevance - (b.age / 1000000);
      return scoreB - scoreA;
    });

    return relevantMemories.slice(0, options.limit || 10);
  }

  // Knowledge graph management
  async updateKnowledgeGraph(entityKey, entityValue, operation) {
    let node = this.knowledgeGraph.get(entityKey);

    if (!node) {
      node = {
        key: entityKey,
        value: entityValue,
        connections: new Set(),
        operations: [],
        metadata: {
          created: new Date(),
          accessCount: 0
        }
      };
      this.knowledgeGraph.set(entityKey, node);
    }

    // Update node
    node.operations.push({
      operation,
      timestamp: new Date(),
      value: entityValue
    });
    node.metadata.accessCount++;
    node.metadata.lastAccess = new Date();

    // Find and create connections
    await this.findConnections(entityKey, entityValue);

    // Persist knowledge graph
    await this.persistKnowledgeGraph();
  }

  async findConnections(entityKey, entityValue) {
    const connections = [];

    // Find similar entities
    for (const [key, node] of this.knowledgeGraph.entries()) {
      if (key !== entityKey) {
        const similarity = await this.calculateSimilarity(entityValue, node.value);
        if (similarity > this.options.patternMatchThreshold) {
          connections.push({ key, similarity });
          
          // Create bidirectional connection
          node.connections.add(entityKey);
          const currentNode = this.knowledgeGraph.get(entityKey);
          if (currentNode) {
            currentNode.connections.add(key);
          }
        }
      }
    }

    return connections;
  }

  // Pattern learning and recognition
  async learnPatterns(patternType, data) {
    const patternKey = `${patternType}-${this.generatePatternSignature(data)}`;
    
    let pattern = this.patterns.get(patternKey);
    if (!pattern) {
      pattern = {
        type: patternType,
        signature: this.generatePatternSignature(data),
        occurrences: 0,
        examples: [],
        confidence: 0,
        created: new Date()
      };
      this.patterns.set(patternKey, pattern);
    }

    // Update pattern
    pattern.occurrences++;
    pattern.examples.push({
      data,
      timestamp: new Date()
    });

    // Keep only recent examples
    if (pattern.examples.length > 10) {
      pattern.examples = pattern.examples.slice(-10);
    }

    // Calculate confidence
    pattern.confidence = Math.min(pattern.occurrences / 10, 1);
    pattern.lastSeen = new Date();

    // Persist patterns
    await this.persistPatterns();

    this.emit('patternLearned', { patternKey, pattern });
  }

  generatePatternSignature(data) {
    // Generate a signature for pattern matching
    const signature = {
      dataType: typeof data,
      hasKey: !!data.key,
      hasValue: !!data.value,
      valueType: data.value ? typeof data.value : null,
      keyPattern: data.key ? this.extractKeyPattern(data.key) : null,
      valueStructure: data.value ? this.extractValueStructure(data.value) : null
    };

    return Buffer.from(JSON.stringify(signature)).toString('base64').slice(0, 16);
  }

  extractKeyPattern(key) {
    // Extract pattern from key (e.g., service:*, agent:*, etc.)
    return key.replace(/[0-9a-f-]/g, '*').replace(/\*+/g, '*');
  }

  extractValueStructure(value) {
    if (typeof value !== 'object') return typeof value;
    
    const structure = {};
    for (const [key, val] of Object.entries(value)) {
      structure[key] = typeof val;
    }
    return structure;
  }

  // Context management
  async getCurrentContext() {
    const contextWindow = this.learningHistory.slice(-this.options.contextWindowSize);
    
    return {
      recentOperations: contextWindow.map(entry => ({
        operation: entry.operation,
        timestamp: entry.timestamp,
        success: entry.success
      })),
      activeServices: await this.getActiveServices(),
      systemState: await this.getSystemState()
    };
  }

  async getRelevantContext(entityKey, entityValue) {
    const contextEntries = [];

    // Get from memory bank
    const memories = await this.retrieveMemory({
      entityKey,
      entityValue
    }, { limit: 5 });

    for (const memory of memories) {
      contextEntries.push({
        type: 'memory',
        relevance: memory.relevance,
        data: memory.memory,
        source: 'memory-bank'
      });
    }

    // Get from knowledge graph
    const node = this.knowledgeGraph.get(entityKey);
    if (node && node.connections.size > 0) {
      for (const connectionKey of node.connections) {
        const connectedNode = this.knowledgeGraph.get(connectionKey);
        if (connectedNode) {
          contextEntries.push({
            type: 'connection',
            data: connectedNode,
            source: 'knowledge-graph'
          });
        }
      }
    }

    return contextEntries;
  }

  // Intelligent query expansion and tag suggestion
  async expandQuery(originalQuery) {
    const expandedQuery = { ...originalQuery };

    // Add semantic expansion based on learned patterns
    const relatedPatterns = await this.findRelatedPatterns(originalQuery);
    if (relatedPatterns.length > 0) {
      expandedQuery._semanticExpansion = relatedPatterns;
    }

    // Add context-based expansion
    if (originalQuery.tags) {
      const relatedTags = await this.findRelatedTags(originalQuery.tags);
      if (relatedTags.length > 0) {
        expandedQuery.tags = [...originalQuery.tags, ...relatedTags];
        expandedQuery._expandedTags = relatedTags;
      }
    }

    return expandedQuery;
  }

  async suggestTags(entityKey, entityValue) {
    const suggestedTags = [];

    // Pattern-based suggestions
    const relevantPatterns = await this.findRelevantPatterns({ key: entityKey, value: entityValue });
    for (const pattern of relevantPatterns) {
      if (pattern.confidence > 0.7) {
        // Extract common tags from pattern examples
        const commonTags = this.extractCommonTags(pattern.examples);
        suggestedTags.push(...commonTags);
      }
    }

    // Knowledge graph suggestions
    const connections = await this.findConnections(entityKey, entityValue);
    for (const connection of connections) {
      const connectedNode = this.knowledgeGraph.get(connection.key);
      if (connectedNode && connectedNode.value.tags) {
        suggestedTags.push(...connectedNode.value.tags);
      }
    }

    // Remove duplicates and return top suggestions
    return [...new Set(suggestedTags)].slice(0, 5);
  }

  // Utility methods
  async calculateRelevance(memory, query) {
    let relevance = 0;

    // Type match
    if (memory.type === query.type) {
      relevance += 0.3;
    }

    // Key similarity
    if (memory.key && query.key) {
      relevance += this.calculateStringSimilarity(memory.key, query.key) * 0.3;
    }

    // Value similarity
    if (memory.value && query.value) {
      relevance += await this.calculateSimilarity(memory.value, query.value) * 0.4;
    }

    return Math.min(relevance, 1);
  }

  async calculateSimilarity(value1, value2) {
    // Simplified similarity calculation
    const str1 = JSON.stringify(value1).toLowerCase();
    const str2 = JSON.stringify(value2).toLowerCase();
    return this.calculateStringSimilarity(str1, str2);
  }

  calculateStringSimilarity(str1, str2) {
    // Levenshtein distance-based similarity
    const maxLen = Math.max(str1.length, str2.length);
    if (maxLen === 0) return 1;
    
    const distance = this.levenshteinDistance(str1, str2);
    return 1 - (distance / maxLen);
  }

  levenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  // Simplified embedding generation
  async generateEmbedding(key, value) {
    // In a real implementation, this would use a proper embedding model
    const text = `${key} ${JSON.stringify(value)}`.toLowerCase();
    const embedding = new Array(this.options.vectorDimensions).fill(0);
    
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      embedding[i % this.options.vectorDimensions] += charCode;
    }

    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? embedding.map(val => val / magnitude) : embedding;
  }

  // Learning process
  startLearningProcess() {
    this.learningInterval = setInterval(() => {
      this.performLearningCycle();
    }, 60000); // Learn every minute
  }

  async performLearningCycle() {
    try {
      // Analyze recent patterns
      await this.analyzeRecentPatterns();
      
      // Optimize knowledge graph
      await this.optimizeKnowledgeGraph();
      
      // Update pattern confidences
      await this.updatePatternConfidences();
      
      this.emit('learningCycleCompleted');
    } catch (error) {
      this.emit('learningError', error);
    }
  }

  async analyzeRecentPatterns() {
    const recentMemories = Array.from(this.memoryBank.values())
      .filter(memory => Date.now() - memory.stored.getTime() < 3600000) // Last hour
      .slice(-20);

    for (const memory of recentMemories) {
      await this.learnPatterns(memory.type, memory);
    }
  }

  async optimizeKnowledgeGraph() {
    // Remove weak connections
    for (const [key, node] of this.knowledgeGraph.entries()) {
      const weakConnections = [];
      for (const connectionKey of node.connections) {
        const connectedNode = this.knowledgeGraph.get(connectionKey);
        if (connectedNode) {
          const similarity = await this.calculateSimilarity(node.value, connectedNode.value);
          if (similarity < 0.3) {
            weakConnections.push(connectionKey);
          }
        }
      }
      
      // Remove weak connections
      for (const weakConnection of weakConnections) {
        node.connections.delete(weakConnection);
      }
    }
  }

  async updatePatternConfidences() {
    const now = Date.now();
    
    for (const [key, pattern] of this.patterns.entries()) {
      const age = now - pattern.created.getTime();
      const lastSeenAge = now - (pattern.lastSeen?.getTime() || pattern.created.getTime());
      
      // Decay confidence over time if not seen recently
      if (lastSeenAge > 86400000) { // 24 hours
        pattern.confidence *= 0.9;
      }
      
      // Remove very old, low-confidence patterns
      if (age > 7 * 86400000 && pattern.confidence < 0.1) { // 7 days
        this.patterns.delete(key);
      }
    }
  }

  // Persistence methods
  async persistMemory() {
    if (this.memoryBank.size === 0) return;
    
    const memoryData = Array.from(this.memoryBank.entries());
    await fs.writeJson(this.memoryFile, memoryData, { spaces: 2 });
  }

  async persistKnowledgeGraph() {
    if (this.knowledgeGraph.size === 0) return;
    
    const graphData = Array.from(this.knowledgeGraph.entries()).map(([key, node]) => [
      key,
      {
        ...node,
        connections: Array.from(node.connections)
      }
    ]);
    
    await fs.writeJson(this.knowledgeFile, graphData, { spaces: 2 });
  }

  async persistPatterns() {
    if (this.patterns.size === 0) return;
    
    const patternsData = Array.from(this.patterns.entries());
    await fs.writeJson(this.patternsFile, patternsData, { spaces: 2 });
  }

  async loadKnowledgeBase() {
    try {
      // Load memory bank
      if (await fs.pathExists(this.memoryFile)) {
        const memoryData = await fs.readJson(this.memoryFile);
        this.memoryBank = new Map(memoryData);
      }

      // Load knowledge graph
      if (await fs.pathExists(this.knowledgeFile)) {
        const graphData = await fs.readJson(this.knowledgeFile);
        this.knowledgeGraph = new Map(graphData.map(([key, node]) => [
          key,
          {
            ...node,
            connections: new Set(node.connections)
          }
        ]));
      }

      // Load patterns
      if (await fs.pathExists(this.patternsFile)) {
        const patternsData = await fs.readJson(this.patternsFile);
        this.patterns = new Map(patternsData);
      }

      this.emit('knowledgeLoaded', {
        memoryEntries: this.memoryBank.size,
        knowledgeNodes: this.knowledgeGraph.size,
        patterns: this.patterns.size
      });
    } catch (error) {
      this.emit('loadError', error);
    }
  }

  // Helper methods
  async findRelatedPatterns(query) {
    const relatedPatterns = [];
    
    for (const [key, pattern] of this.patterns.entries()) {
      if (pattern.confidence > 0.5) {
        // Check if pattern is relevant to query
        const relevance = await this.calculatePatternRelevance(pattern, query);
        if (relevance > 0.6) {
          relatedPatterns.push({ pattern, relevance });
        }
      }
    }
    
    return relatedPatterns.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
  }

  async calculatePatternRelevance(pattern, query) {
    // Simplified pattern relevance calculation
    let relevance = 0;
    
    if (pattern.type === query.type) {
      relevance += 0.4;
    }
    
    // Check examples for similarity
    for (const example of pattern.examples.slice(-3)) {
      const similarity = await this.calculateSimilarity(example.data, query);
      relevance += similarity * 0.2;
    }
    
    return Math.min(relevance, 1);
  }

  async findRelatedTags(originalTags) {
    const relatedTags = new Set();
    
    // Find tags that often appear with the original tags
    for (const memory of this.memoryBank.values()) {
      if (memory.options?.tags) {
        const memoryTags = memory.options.tags;
        const hasOriginalTag = originalTags.some(tag => memoryTags.includes(tag));
        
        if (hasOriginalTag) {
          memoryTags.forEach(tag => {
            if (!originalTags.includes(tag)) {
              relatedTags.add(tag);
            }
          });
        }
      }
    }
    
    return Array.from(relatedTags).slice(0, 3);
  }

  async findRelevantPatterns(data) {
    const relevantPatterns = [];
    
    for (const [key, pattern] of this.patterns.entries()) {
      const relevance = await this.calculatePatternRelevance(pattern, data);
      if (relevance > 0.5) {
        relevantPatterns.push({ ...pattern, relevance });
      }
    }
    
    return relevantPatterns.sort((a, b) => b.relevance - a.relevance);
  }

  extractCommonTags(examples) {
    const tagCounts = new Map();
    
    for (const example of examples) {
      const tags = example.data?.options?.tags || [];
      for (const tag of tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }
    
    // Return tags that appear in at least 50% of examples
    const threshold = Math.ceil(examples.length * 0.5);
    return Array.from(tagCounts.entries())
      .filter(([tag, count]) => count >= threshold)
      .map(([tag]) => tag);
  }

  async getActiveServices() {
    try {
      const services = await this.registry.discover({
        tags: ['service']
      });
      return services.map(service => ({
        key: service.key,
        type: service.value.type || 'unknown',
        status: service.value.status || 'unknown'
      }));
    } catch (error) {
      return [];
    }
  }

  async getSystemState() {
    try {
      const status = await this.registry.status();
      return {
        state: status.state,
        plugins: status.plugins?.length || 0,
        swarms: status.swarms?.length || 0
      };
    } catch (error) {
      return { state: 'unknown' };
    }
  }

  async pruneMemories() {
    // Remove oldest memories when limit is reached
    const memories = Array.from(this.memoryBank.entries())
      .sort(([, a], [, b]) => a.stored - b.stored);
    
    const toRemove = memories.slice(0, Math.floor(this.options.maxMemorySize * 0.1));
    for (const [memoryId] of toRemove) {
      this.memoryBank.delete(memoryId);
    }
  }

  // Public API methods
  async query(question, context = {}) {
    // RAG-style query interface
    const relevantMemories = await this.retrieveMemory(question, { limit: 5 });
    const relevantKnowledge = await this.getRelevantContext(question, context);
    
    return {
      question,
      context: {
        memories: relevantMemories,
        knowledge: relevantKnowledge,
        patterns: await this.findRelatedPatterns({ type: 'query', value: question })
      },
      suggestions: await this.generateSuggestions(question, context)
    };
  }

  async generateSuggestions(question, context) {
    // Generate intelligent suggestions based on memory and patterns
    const suggestions = [];
    
    // Pattern-based suggestions
    const patterns = await this.findRelatedPatterns({ type: 'query', value: question });
    for (const patternData of patterns) {
      suggestions.push({
        type: 'pattern',
        suggestion: `Based on similar queries, consider: ${JSON.stringify(patternData.pattern.examples[0]?.data)}`,
        confidence: patternData.relevance
      });
    }
    
    // Memory-based suggestions
    const memories = await this.retrieveMemory(question, { limit: 3 });
    for (const memory of memories) {
      suggestions.push({
        type: 'memory',
        suggestion: `Previous similar operation: ${memory.memory.type}`,
        confidence: memory.relevance
      });
    }
    
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  // Cleanup
  async cleanup() {
    if (this.learningInterval) {
      clearInterval(this.learningInterval);
    }

    // Final persistence
    await Promise.all([
      this.persistMemory(),
      this.persistKnowledgeGraph(),
      this.persistPatterns()
    ]);

    // Clear memory
    this.memoryBank.clear();
    this.knowledgeGraph.clear();
    this.patterns.clear();
    this.contexts.clear();
  }

  // Statistics and introspection
  getStats() {
    return {
      memory: {
        entries: this.memoryBank.size,
        maxSize: this.options.maxMemorySize,
        utilizationPercent: (this.memoryBank.size / this.options.maxMemorySize) * 100
      },
      knowledge: {
        nodes: this.knowledgeGraph.size,
        totalConnections: Array.from(this.knowledgeGraph.values())
          .reduce((sum, node) => sum + node.connections.size, 0),
        averageConnections: this.knowledgeGraph.size > 0 ? 
          Array.from(this.knowledgeGraph.values())
            .reduce((sum, node) => sum + node.connections.size, 0) / this.knowledgeGraph.size : 0
      },
      patterns: {
        total: this.patterns.size,
        highConfidence: Array.from(this.patterns.values()).filter(p => p.confidence > 0.8).length,
        averageConfidence: this.patterns.size > 0 ?
          Array.from(this.patterns.values()).reduce((sum, p) => sum + p.confidence, 0) / this.patterns.size : 0
      },
      learning: {
        historySize: this.learningHistory.length,
        enabled: this.options.enableLearning
      }
    };
  }
}

export default MemoryRAGPlugin;