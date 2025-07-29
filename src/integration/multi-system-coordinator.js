/**
 * Multi-System Coordinator - Advanced Integration Layer
 * ORCHESTRATES LANCEDB, KUZU, AND VISIONARY SOFTWARE INTELLIGENCE SYSTEMS
 * Provides unified interface and cross-system intelligence
 */

import LanceDBInterface from '../database/lancedb-interface.js';
import KuzuAdvancedInterface from '../database/kuzu-advanced-interface.js';
import { VisionarySoftwareIntelligenceProcessor } from '../visionary/software-intelligence-processor.js';
import { EventEmitter } from 'events';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import defaultConfig from '../../config/default.js';

export class MultiSystemCoordinator extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      // System configurations from external config
      lancedb: {
        dbPath: config.lancedbPath || defaultConfig.hiveMind.lanceConfig.persistDirectory,
        vectorDim: config.vectorDim || 1536,
        ...config.lancedb
      },
      kuzu: {
        dbPath: config.kuzuPath || defaultConfig.hiveMind.kuzuConfig.persistDirectory,
        dbName: config.kuzuName || 'claude-flow-graph',
        enableAnalytics: true,
        ...config.kuzu
      },
      vision: {
        outputDir: config.visionOutputDir || './data/generated-code',
        enableAnalytics: true,
        ...config.vision
      },
      
      // Coordination settings
      enableCrossSystemAnalytics: config.enableCrossSystemAnalytics !== false,
      enableMemorySharing: config.enableMemorySharing !== false,
      enableIntelligentRouting: config.enableIntelligentRouting !== false,
      
      // Performance settings
      batchSize: config.batchSize || 1000,
      maxConcurrency: config.maxConcurrency || 10,
      cacheSize: config.cacheSize || 10000,
      
      ...config
    };
    
    // Initialize systems
    this.lancedb = null;
    this.kuzu = null;
    this.vision = null;
    
    // Coordination state
    this.isInitialized = false;
    this.activeOperations = new Map();
    this.crossSystemCache = new Map();
    this.sharedMemory = new Map();
    
    // Analytics and metrics
    this.analytics = {
      totalOperations: 0,
      systemUsage: {
        lancedb: { queries: 0, inserts: 0, avgTime: 0 },
        kuzu: { queries: 0, inserts: 0, avgTime: 0 },
        vision: { processes: 0, avgTime: 0, successRate: 0 }
      },
      crossSystemOperations: 0,
      cacheHitRate: 0,
      startTime: Date.now()
    };
    
    // Integration patterns
    this.integrationPatterns = new Map();
    this.setupIntegrationPatterns();
  }

  /**
   * Initialize all three systems with coordination
   */
  async initialize() {
    console.log('🚀 Initializing Multi-System Coordinator...');
    
    try {
      // Initialize systems in parallel
      await Promise.all([
        this.initializeLanceDB(),
        this.initializeKuzu(),
        this.initializeVision()
      ]);
      
      // Setup cross-system integrations
      await this.setupCrossSystemIntegrations();
      
      // Initialize shared memory
      await this.initializeSharedMemory();
      
      // Setup analytics
      await this.initializeAnalytics();
      
      this.isInitialized = true;
      console.log('✅ Multi-System Coordinator initialized successfully');
      
      this.emit('initialized', {
        systems: ['lancedb', 'kuzu', 'vision'],
        features: ['cross-system-analytics', 'memory-sharing', 'intelligent-routing']
      });
      
      return {
        success: true,
        systems: {
          lancedb: !!this.lancedb,
          kuzu: !!this.kuzu,
          vision: !!this.vision
        },
        features: {
          crossSystemAnalytics: this.config.enableCrossSystemAnalytics,
          memorySharing: this.config.enableMemorySharing,
          intelligentRouting: this.config.enableIntelligentRouting
        }
      };
      
    } catch (error) {
      console.error('❌ Multi-System Coordinator initialization failed:', error.message);
      throw error;
    }
  }

  /**
   * Initialize LanceDB system
   */
  async initializeLanceDB() {
    console.log('🔹 Initializing LanceDB...');
    
    // Ensure database directory exists
    if (!existsSync(this.config.lancedb.dbPath)) {
      await mkdir(this.config.lancedb.dbPath, { recursive: true });
      console.log(`📁 Created LanceDB directory: ${this.config.lancedb.dbPath}`);
    }
    
    this.lancedb = new LanceDBInterface(this.config.lancedb);
    await this.lancedb.initialize();
    
    console.log('✅ LanceDB initialized');
  }

  /**
   * Initialize Kuzu system
   */
  async initializeKuzu() {
    console.log('🔹 Initializing Kuzu Advanced Interface...');
    
    // Ensure database directory exists
    if (!existsSync(this.config.kuzu.dbPath)) {
      await mkdir(this.config.kuzu.dbPath, { recursive: true });
      console.log(`📁 Created Kuzu directory: ${this.config.kuzu.dbPath}`);
    }
    
    this.kuzu = new KuzuAdvancedInterface(this.config.kuzu);
    await this.kuzu.initializeAdvanced();
    
    console.log('✅ Kuzu Advanced Interface initialized');
  }

  /**
   * Initialize Vision system
   */
  async initializeVision() {
    console.log('🔹 Initializing Visionary Software Intelligence...');
    
    // Ensure output directory exists
    if (!existsSync(this.config.vision.outputDir)) {
      await mkdir(this.config.vision.outputDir, { recursive: true });
      console.log(`📁 Created Vision output directory: ${this.config.vision.outputDir}`);
    }
    
    this.vision = new VisionarySoftwareIntelligenceProcessor(this.config.vision);
    await this.vision.initialize();
    
    console.log('✅ Visionary Software Intelligence initialized');
  }

  /**
   * Setup cross-system integrations
   */
  async setupCrossSystemIntegrations() {
    console.log('🔗 Setting up cross-system integrations...');
    
    // LanceDB ↔ Kuzu integration
    await this.setupVectorGraphIntegration();
    
    // Vision ↔ LanceDB integration
    await this.setupVisionVectorIntegration();
    
    // Vision ↔ Kuzu integration
    await this.setupVisionGraphIntegration();
    
    // Three-way integration patterns
    await this.setupTripleSystemIntegration();
    
    console.log('✅ Cross-system integrations configured');
  }

  /**
   * Setup Vector-Graph integration patterns
   */
  async setupVectorGraphIntegration() {
    // Pattern: Store graph queries as vectors for similarity search
    this.integrationPatterns.set('graph-to-vector', async (graphQuery, result) => {
      if (!this.lancedb || !this.kuzu) return;
      
      try {
        // Convert graph query to embedding
        const queryEmbedding = await this.textToEmbedding(graphQuery);
        
        // Store query pattern with results
        await this.lancedb.insertDocuments([{
          id: `graph_query_${Date.now()}`,
          content: graphQuery,
          title: 'Graph Query',
          source: 'kuzu',
          embedding: queryEmbedding,
          metadata: {
            resultCount: result.data?.length || 0,
            executionTime: result.execution_time || 0,
            success: result.success
          }
        }]);
        
        console.log('📊 Graph query stored as vector');
      } catch (error) {
        console.warn('⚠️ Graph-to-vector integration warning:', error.message);
      }
    });
    
    // Pattern: Find similar graph queries using vector search
    this.integrationPatterns.set('find-similar-queries', async (query) => {
      if (!this.lancedb) return null;
      
      try {
        const queryEmbedding = await this.textToEmbedding(query);
        const similar = await this.lancedb.semanticSearch(queryEmbedding, {
          table: 'documents',
          filter: "source = 'kuzu'",
          limit: 5,
          threshold: 0.8
        });
        
        return similar.results;
      } catch (error) {
        console.warn('⚠️ Similar query search warning:', error.message);
        return null;
      }
    });
  }

  /**
   * Setup Vision-Vector integration patterns
   */
  async setupVisionVectorIntegration() {
    // Pattern: Store generated code components as vectors
    this.integrationPatterns.set('code-to-vector', async (generatedCode, metadata) => {
      if (!this.lancedb) return;
      
      try {
        // Extract components for vectorization
        const components = Object.entries(generatedCode.files || {});
        
        for (const [fileName, fileContent] of components) {
          const codeEmbedding = await this.textToEmbedding(fileContent);
          
          await this.lancedb.insertCodeSnippets([{
            id: `generated_${fileName}_${Date.now()}`,
            code: fileContent,
            language: this.detectLanguage(fileName),
            file_path: fileName,
            function_name: metadata.outputName || 'Generated',
            embedding: codeEmbedding,
            metadata: {
              framework: metadata.framework,
              qualityScore: metadata.qualityScore,
              generatedFrom: 'vision-processor'
            }
          }]);
        }
        
        console.log('💻 Generated code stored as vectors');
      } catch (error) {
        console.warn('⚠️ Code-to-vector integration warning:', error.message);
      }
    });
    
    // Pattern: Find similar code patterns
    this.integrationPatterns.set('find-similar-code', async (codeSnippet) => {
      if (!this.lancedb) return null;
      
      try {
        const codeEmbedding = await this.textToEmbedding(codeSnippet);
        const similar = await this.lancedb.semanticSearch(codeEmbedding, {
          table: 'code_snippets',
          limit: 10,
          threshold: 0.7
        });
        
        return similar.results;
      } catch (error) {
        console.warn('⚠️ Similar code search warning:', error.message);
        return null;
      }
    });
  }

  /**
   * Setup Vision-Graph integration patterns
   */
  async setupVisionGraphIntegration() {
    // Pattern: Model component relationships in graph
    this.integrationPatterns.set('components-to-graph', async (components, metadata) => {
      if (!this.kuzu) return;
      
      try {
        // Insert components as nodes
        const componentNodes = components.map(comp => ({
          id: comp.id || `comp_${Date.now()}`,
          name: comp.name || comp.type,
          type: comp.type,
          framework: metadata.framework,
          properties: JSON.stringify(comp.properties || {}),
          created_at: new Date().toISOString()
        }));
        
        await this.kuzu.insertNodes('Component', componentNodes);
        
        // Create relationships between components
        const relationships = this.analyzeComponentRelationships(components);
        await this.kuzu.insertRelationships(relationships);
        
        console.log('🔗 Components modeled in graph');
      } catch (error) {
        console.warn('⚠️ Components-to-graph integration warning:', error.message);
      }
    });
  }

  /**
   * Setup triple-system integration patterns
   */
  async setupTripleSystemIntegration() {
    // Pattern: Comprehensive code analysis using all three systems
    this.integrationPatterns.set('comprehensive-analysis', async (input) => {
      const analysis = {
        vision: null,
        vectors: null,
        graph: null,
        insights: []
      };
      
      try {
        // Vision analysis (if image input)
        if (input.type === 'image') {
          analysis.vision = await this.vision.processImage(input.path, {
            framework: 'react',
            includeTests: false,
            optimizeCode: false
          });
        }
        
        // Vector similarity analysis
        if (input.text || input.code) {
          const searchText = input.text || input.code;
          analysis.vectors = await this.lancedb.semanticSearch(searchText, {
            table: 'documents',
            limit: 5
          });
        }
        
        // Graph relationship analysis
        if (input.entityName) {
          analysis.graph = await this.kuzu.findServiceDependencies(input.entityName);
        }
        
        // Generate cross-system insights
        analysis.insights = await this.generateCrossSystemInsights(analysis);
        
        return analysis;
      } catch (error) {
        console.warn('⚠️ Comprehensive analysis warning:', error.message);
        return analysis;
      }
    });
  }

  /**
   * Intelligent operation routing based on input type and requirements
   */
  async intelligentRoute(operation, input, options = {}) {
    if (!this.config.enableIntelligentRouting) {
      throw new Error('Intelligent routing is disabled');
    }
    
    const startTime = Date.now();
    const operationId = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      console.log(`🧠 Routing operation: ${operation} (${operationId})`);
      
      // Store active operation
      this.activeOperations.set(operationId, {
        operation,
        startTime,
        input: this.sanitizeForLogging(input),
        options,
        status: 'routing'
      });
      
      let result;
      
      // Route based on operation type and input characteristics
      switch (operation) {
        case 'semantic-search':
          result = await this.routeSemanticSearch(input, options);
          break;
        case 'code-generation':
          result = await this.routeCodeGeneration(input, options);
          break;
        case 'graph-analysis':
          result = await this.routeGraphAnalysis(input, options);
          break;
        case 'similarity-analysis':
          result = await this.routeSimilarityAnalysis(input, options);
          break;
        case 'comprehensive-analysis':
          result = await this.routeComprehensiveAnalysis(input, options);
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
      
      // Update operation status
      const executionTime = Date.now() - startTime;
      this.activeOperations.set(operationId, {
        ...this.activeOperations.get(operationId),
        status: 'completed',
        result: this.sanitizeForLogging(result),
        executionTime
      });
      
      // Update analytics
      this.updateAnalytics(operation, executionTime, true);
      
      console.log(`✅ Operation completed: ${operationId} (${executionTime}ms)`);
      
      return {
        success: true,
        operationId,
        result,
        executionTime,
        systemsUsed: result.systemsUsed || []
      };
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      // Update operation status
      this.activeOperations.set(operationId, {
        ...this.activeOperations.get(operationId),
        status: 'failed',
        error: error.message,
        executionTime
      });
      
      // Update analytics
      this.updateAnalytics(operation, executionTime, false);
      
      console.error(`❌ Operation failed: ${operationId}`, error.message);
      
      return {
        success: false,
        operationId,
        error: error.message,
        executionTime
      };
    }
  }

  /**
   * Route semantic search operations
   */
  async routeSemanticSearch(input, options) {
    const { query, type = 'auto', limit = 10 } = input;
    const results = { systemsUsed: ['lancedb'] };
    
    // Determine search type
    let searchType = type;
    if (searchType === 'auto') {
      searchType = this.detectSearchType(query);
    }
    
    // Route to appropriate table/system
    switch (searchType) {
      case 'code':
        results.data = await this.lancedb.semanticSearch(query, {
          table: 'code_snippets',
          limit,
          ...options
        });
        break;
      case 'graph-query':
        // First check for similar queries in LanceDB
        results.data = await this.lancedb.semanticSearch(query, {
          table: 'documents',
          filter: "source = 'kuzu'",
          limit,
          ...options
        });
        results.systemsUsed.push('kuzu');
        break;
      case 'decision':
        results.data = await this.lancedb.semanticSearch(query, {
          table: 'queen_decisions',
          limit,
          ...options
        });
        break;
      default:
        results.data = await this.lancedb.semanticSearch(query, {
          table: 'documents',
          limit,
          ...options
        });
    }
    
    return results;
  }

  /**
   * Route code generation operations
   */
  async routeCodeGeneration(input, options) {
    const results = { systemsUsed: ['vision'] };
    
    if (input.imagePath) {
      // Vision-based code generation
      results.data = await this.vision.processImage(input.imagePath, {
        framework: options.framework || 'react',
        outputName: options.outputName || 'GeneratedComponent',
        includeTests: options.includeTests !== false,
        optimizeCode: options.optimizeCode !== false
      });
      
      // Store in vector database for future similarity search
      if (results.data.success && this.config.enableMemorySharing) {
        await this.runIntegrationPattern('code-to-vector', results.data, {
          framework: options.framework,
          qualityScore: results.data.qualityScore,
          outputName: options.outputName
        });
        results.systemsUsed.push('lancedb');
      }
      
      // Model components in graph
      if (results.data.success && results.data.components && this.config.enableMemorySharing) {
        await this.runIntegrationPattern('components-to-graph', results.data.components, {
          framework: options.framework
        });
        results.systemsUsed.push('kuzu');
      }
    } else {
      throw new Error('Code generation requires image input');
    }
    
    return results;
  }

  /**
   * Route graph analysis operations
   */
  async routeGraphAnalysis(input, options) {
    const results = { systemsUsed: ['kuzu'] };
    
    // Check for similar queries first
    if (this.config.enableIntelligentRouting) {
      const similarQueries = await this.runIntegrationPattern('find-similar-queries', input.query);
      if (similarQueries && similarQueries.length > 0) {
        results.similarQueries = similarQueries;
        results.systemsUsed.push('lancedb');
      }
    }
    
    // Execute graph analysis
    switch (input.analysisType) {
      case 'traversal':
        results.data = await this.kuzu.advancedTraversal({
          startNode: input.startNode,
          algorithm: input.algorithm || 'dfs',
          maxDepth: input.maxDepth || 10,
          ...options
        });
        break;
      case 'centrality':
        results.data = await this.kuzu.computeCentrality({
          algorithm: input.algorithm || 'degree',
          nodeType: input.nodeType || 'Service',
          ...options
        });
        break;
      case 'communities':
        results.data = await this.kuzu.detectCommunities({
          algorithm: input.algorithm || 'louvain',
          nodeType: input.nodeType || 'Service',
          ...options
        });
        break;
      case 'patterns':
        results.data = await this.kuzu.patternMatching(input.pattern, options);
        break;
      default:
        results.data = await this.kuzu.executeQuery(input.query, options);
    }
    
    // Store query pattern for future similarity search
    if (this.config.enableMemorySharing && results.data) {
      await this.runIntegrationPattern('graph-to-vector', input.query, results.data);
      results.systemsUsed.push('lancedb');
    }
    
    return results;
  }

  /**
   * Route comprehensive analysis operations
   */
  async routeComprehensiveAnalysis(input, options) {
    const results = { systemsUsed: ['lancedb', 'kuzu', 'vision'] };
    
    // Use the comprehensive analysis integration pattern
    results.data = await this.runIntegrationPattern('comprehensive-analysis', input);
    
    return results;
  }

  /**
   * Cross-system analytics and insights
   */
  async generateCrossSystemAnalytics() {
    if (!this.config.enableCrossSystemAnalytics) {
      return { error: 'Cross-system analytics disabled' };
    }
    
    const analytics = {
      systems: {},
      integration: {},
      performance: {},
      insights: [],
      generated_at: new Date().toISOString()
    };
    
    try {
      // Get individual system stats
      analytics.systems.lancedb = await this.lancedb?.getStats();
      analytics.systems.kuzu = await this.kuzu?.getAdvancedStats();
      analytics.systems.vision = await this.vision?.getAnalytics();
      
      // Integration analytics
      analytics.integration = {
        patterns_executed: this.integrationPatterns.size,
        cross_system_operations: this.analytics.crossSystemOperations,
        shared_memory_size: this.sharedMemory.size,
        cache_hit_rate: this.analytics.cacheHitRate
      };
      
      // Performance analytics
      analytics.performance = {
        total_operations: this.analytics.totalOperations,
        uptime: Date.now() - this.analytics.startTime,
        active_operations: this.activeOperations.size,
        system_usage: this.analytics.systemUsage
      };
      
      // Generate insights
      analytics.insights = await this.generateSystemInsights(analytics);
      
      return analytics;
      
    } catch (error) {
      console.error('❌ Cross-system analytics error:', error.message);
      return { error: error.message };
    }
  }

  /**
   * Generate insights from cross-system data
   */
  async generateSystemInsights(analytics) {
    const insights = [];
    
    // Performance insights
    if (analytics.performance?.total_operations > 100) {
      const avgTime = Object.values(analytics.performance.system_usage)
        .reduce((sum, system) => sum + system.avgTime, 0) / 3;
      
      if (avgTime > 1000) {
        insights.push({
          type: 'performance',
          severity: 'medium',
          message: 'Average operation time is high. Consider optimization.',
          recommendation: 'Enable caching and optimize query patterns.'
        });
      }
    }
    
    // Integration efficiency insights
    if (analytics.integration?.cross_system_operations > 0) {
      const efficiency = analytics.integration.cache_hit_rate;
      if (efficiency < 0.5) {
        insights.push({
          type: 'integration',
          severity: 'low',
          message: 'Low cache hit rate indicates room for optimization.',
          recommendation: 'Increase cache size or improve query patterns.'
        });
      }
    }
    
    // System balance insights
    const systemUsages = Object.values(analytics.performance?.system_usage || {});
    if (systemUsages.length > 0) {
      const maxUsage = Math.max(...systemUsages.map(s => s.queries + s.inserts + s.processes));
      const minUsage = Math.min(...systemUsages.map(s => s.queries + s.inserts + s.processes));
      
      if (maxUsage > minUsage * 3) {
        insights.push({
          type: 'balance',
          severity: 'low',
          message: 'Uneven system usage detected.',
          recommendation: 'Consider load balancing or system-specific optimizations.'
        });
      }
    }
    
    return insights;
  }

  /**
   * Memory management and sharing
   */
  async initializeSharedMemory() {
    if (!this.config.enableMemorySharing) return;
    
    // Setup shared memory categories
    this.sharedMemory.set('queries', new Map());
    this.sharedMemory.set('patterns', new Map());
    this.sharedMemory.set('insights', new Map());
    this.sharedMemory.set('performance', new Map());
    
    console.log('💾 Shared memory initialized');
  }

  /**
   * Cache management
   */
  manageCrossSystemCache() {
    // Implement LRU cache eviction
    if (this.crossSystemCache.size > this.config.cacheSize) {
      const entries = Array.from(this.crossSystemCache.entries());
      const toRemove = entries.slice(0, Math.floor(this.config.cacheSize * 0.2));
      
      toRemove.forEach(([key]) => {
        this.crossSystemCache.delete(key);
      });
      
      console.log(`🧹 Cache cleaned: removed ${toRemove.length} entries`);
    }
  }

  // Helper methods

  setupIntegrationPatterns() {
    // Initialize with empty patterns map
    // Patterns will be added during system initialization
  }

  async runIntegrationPattern(patternName, ...args) {
    const pattern = this.integrationPatterns.get(patternName);
    if (!pattern) {
      console.warn(`⚠️ Integration pattern not found: ${patternName}`);
      return null;
    }
    
    try {
      const result = await pattern(...args);
      this.analytics.crossSystemOperations++;
      return result;
    } catch (error) {
      console.warn(`⚠️ Integration pattern error (${patternName}):`, error.message);
      return null;
    }
  }

  async textToEmbedding(text) {
    // Simplified embedding generation (in production, use actual embedding model)
    const hash = this.simpleHash(text);
    return Array(this.config.lancedb.vectorDim).fill(0).map((_, i) => 
      Math.sin(hash + i) * Math.cos(hash * i)
    );
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

  detectLanguage(fileName) {
    const ext = path.extname(fileName).toLowerCase();
    const langMap = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.java': 'java',
      '.cpp': 'cpp',
      '.c': 'c',
      '.go': 'go',
      '.rs': 'rust',
      '.php': 'php',
      '.rb': 'ruby',
      '.cs': 'csharp',
      '.html': 'html',
      '.css': 'css',
      '.scss': 'scss',
      '.vue': 'vue'
    };
    return langMap[ext] || 'unknown';
  }

  detectSearchType(query) {
    if (/function|class|import|export|const|let|var/.test(query)) {
      return 'code';
    }
    if (/MATCH|RETURN|WHERE|CREATE|DELETE/.test(query.toUpperCase())) {
      return 'graph-query';
    }
    if (/decision|choose|recommend|suggest/.test(query.toLowerCase())) {
      return 'decision';
    }
    return 'document';
  }

  analyzeComponentRelationships(components) {
    // Simplified relationship analysis
    const relationships = [];
    
    for (let i = 0; i < components.length; i++) {
      for (let j = i + 1; j < components.length; j++) {
        const comp1 = components[i];
        const comp2 = components[j];
        
        // Check for containment relationship
        if (this.isContained(comp1.bounds, comp2.bounds)) {
          relationships.push({
            from: comp1.id,
            to: comp2.id,
            type: 'CONTAINS',
            strength: 'strong'
          });
        }
        
        // Check for adjacency relationship
        if (this.areAdjacent(comp1.bounds, comp2.bounds)) {
          relationships.push({
            from: comp1.id,
            to: comp2.id,
            type: 'ADJACENT_TO',
            strength: 'medium'
          });
        }
      }
    }
    
    return relationships;
  }

  isContained(bounds1, bounds2) {
    return bounds1.x >= bounds2.x &&
           bounds1.y >= bounds2.y &&
           (bounds1.x + bounds1.width) <= (bounds2.x + bounds2.width) &&
           (bounds1.y + bounds1.height) <= (bounds2.y + bounds2.height);
  }

  areAdjacent(bounds1, bounds2) {
    const threshold = 10; // pixels
    
    // Check horizontal adjacency
    const horizontallyAligned = Math.abs(bounds1.y - bounds2.y) < threshold;
    const horizontallyAdjacent = 
      Math.abs((bounds1.x + bounds1.width) - bounds2.x) < threshold ||
      Math.abs((bounds2.x + bounds2.width) - bounds1.x) < threshold;
    
    // Check vertical adjacency
    const verticallyAligned = Math.abs(bounds1.x - bounds2.x) < threshold;
    const verticallyAdjacent = 
      Math.abs((bounds1.y + bounds1.height) - bounds2.y) < threshold ||
      Math.abs((bounds2.y + bounds2.height) - bounds1.y) < threshold;
    
    return (horizontallyAligned && horizontallyAdjacent) ||
           (verticallyAligned && verticallyAdjacent);
  }

  updateAnalytics(operation, executionTime, success) {
    this.analytics.totalOperations++;
    
    // Update system-specific analytics
    if (operation.includes('lancedb') || operation.includes('vector')) {
      this.analytics.systemUsage.lancedb.queries++;
      this.analytics.systemUsage.lancedb.avgTime = 
        (this.analytics.systemUsage.lancedb.avgTime + executionTime) / 2;
    }
    
    if (operation.includes('kuzu') || operation.includes('graph')) {
      this.analytics.systemUsage.kuzu.queries++;
      this.analytics.systemUsage.kuzu.avgTime = 
        (this.analytics.systemUsage.kuzu.avgTime + executionTime) / 2;
    }
    
    if (operation.includes('vision') || operation.includes('code-generation')) {
      this.analytics.systemUsage.vision.processes++;
      this.analytics.systemUsage.vision.avgTime = 
        (this.analytics.systemUsage.vision.avgTime + executionTime) / 2;
      if (success) {
        this.analytics.systemUsage.vision.successRate = 
          (this.analytics.systemUsage.vision.successRate + 1) / 2;
      }
    }
  }

  sanitizeForLogging(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const sanitized = {};
    Object.keys(obj).forEach(key => {
      if (key.toLowerCase().includes('buffer') || key.toLowerCase().includes('embedding')) {
        sanitized[key] = '[BINARY_DATA]';
      } else if (typeof obj[key] === 'string' && obj[key].length > 200) {
        sanitized[key] = obj[key].substring(0, 200) + '...';
      } else {
        sanitized[key] = obj[key];
      }
    });
    
    return sanitized;
  }

  async initializeAnalytics() {
    if (!this.config.enableCrossSystemAnalytics) return;
    
    // Set up periodic analytics collection
    setInterval(async () => {
      try {
        const analytics = await this.generateCrossSystemAnalytics();
        // In production, this would be sent to monitoring system
        console.log('📊 Cross-system analytics updated');
      } catch (error) {
        console.warn('⚠️ Analytics update failed:', error.message);
      }
    }, 60000); // Every minute
    
    // Set up cache management
    setInterval(() => {
      this.manageCrossSystemCache();
    }, 300000); // Every 5 minutes
    
    console.log('📊 Analytics system initialized');
  }

  /**
   * Get comprehensive system status
   */
  async getSystemStatus() {
    return {
      coordinator: {
        initialized: this.isInitialized,
        activeOperations: this.activeOperations.size,
        cacheSize: this.crossSystemCache.size,
        sharedMemorySize: this.sharedMemory.size
      },
      systems: {
        lancedb: this.lancedb ? await this.lancedb.getStats() : null,
        kuzu: this.kuzu ? await this.kuzu.getAdvancedStats() : null,
        vision: this.vision ? await this.vision.getAnalytics() : null
      },
      analytics: this.analytics,
      integrationPatterns: Array.from(this.integrationPatterns.keys())
    };
  }

  /**
   * Cleanup and shutdown
   */
  async close() {
    console.log('💾 Closing Multi-System Coordinator...');
    
    try {
      // Close all systems in parallel
      await Promise.all([
        this.lancedb?.close(),
        this.kuzu?.close(),
        this.vision?.close()
      ]);
      
      // Clear caches and memory
      this.crossSystemCache.clear();
      this.sharedMemory.clear();
      this.activeOperations.clear();
      
      console.log('✅ Multi-System Coordinator closed');
      
    } catch (error) {
      console.error(`❌ Error closing coordinator: ${error.message}`);
      throw error;
    }
  }
}

export default MultiSystemCoordinator;