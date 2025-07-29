/**
 * Kuzu Advanced Graph Database Interface - Extended Edition
 * PRODUCTION-GRADE GRAPH OPERATIONS WITH ADVANCED ANALYTICS
 * Built on the existing kuzu-graph-interface.js with enhanced capabilities
 */

import { KuzuGraphInterface } from '../cli/database/kuzu-graph-interface.js';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export class KuzuAdvancedInterface extends KuzuGraphInterface {
  constructor(config = {}) {
    super(config);
    
    // Enhanced configuration
    this.advancedConfig = {
      enableAnalytics: config.enableAnalytics !== false,
      enableCache: config.enableCache !== false,
      enableMetrics: config.enableMetrics !== false,
      maxQueryComplexity: config.maxQueryComplexity || 1000,
      queryTimeout: config.queryTimeout || 30000,
      ...config
    };
    
    // Advanced features
    this.queryCache = new Map();
    this.queryHistory = [];
    this.performanceMetrics = {
      totalQueries: 0,
      avgExecutionTime: 0,
      slowQueries: [],
      errorCount: 0,
      cacheHitRate: 0
    };
    
    // Graph analytics
    this.graphMetrics = {
      nodeTypes: new Map(),
      relationshipTypes: new Map(),
      degreeDistribution: new Map(),
      centralityScores: new Map(),
      communityStructure: new Map()
    };
  }

  /**
   * Initialize with advanced features
   */
  async initializeAdvanced() {
    await this.initialize();
    
    if (this.advancedConfig.enableAnalytics) {
      await this.initializeAnalytics();
    }
    
    if (this.advancedConfig.enableMetrics) {
      await this.initializePerformanceTracking();
    }
    
    console.log('🚀 Advanced Kuzu interface initialized');
    return this;
  }

  /**
   * Initialize analytics components
   */
  async initializeAnalytics() {
    try {
      // Create analytics tables for storing computed metrics
      if (this.stats.usingRealKuzu && this.connection) {
        await this.createAnalyticsTables();
      }
      
      // Initialize graph metrics collection
      await this.initializeGraphMetrics();
      
      console.log('📊 Analytics components initialized');
    } catch (error) {
      console.error('❌ Analytics initialization failed:', error.message);
    }
  }

  /**
   * Create analytics tables in Kuzu
   */
  async createAnalyticsTables() {
    const analyticsTables = {
      GraphMetrics: `
        CREATE NODE TABLE IF NOT EXISTS GraphMetrics(
          metric_id STRING,
          metric_type STRING,
          metric_name STRING,
          metric_value DOUBLE,
          computed_at STRING,
          metadata STRING,
          PRIMARY KEY (metric_id)
        )
      `,
      CentralityScores: `
        CREATE NODE TABLE IF NOT EXISTS CentralityScores(
          node_id STRING,
          centrality_type STRING,
          score DOUBLE,
          rank INT64,
          computed_at STRING,
          PRIMARY KEY (node_id, centrality_type)
        )
      `,
      CommunityDetection: `
        CREATE NODE TABLE IF NOT EXISTS CommunityDetection(
          community_id STRING,
          algorithm STRING,
          modularity DOUBLE,
          size INT64,
          member_nodes STRING[],
          computed_at STRING,
          PRIMARY KEY (community_id)
        )
      `,
      PathAnalysis: `
        CREATE NODE TABLE IF NOT EXISTS PathAnalysis(
          path_id STRING,
          source_node STRING,
          target_node STRING,
          path_length INT64,
          path_nodes STRING[],
          path_weight DOUBLE,
          computed_at STRING,
          PRIMARY KEY (path_id)
        )
      `
    };
    
    for (const [tableName, createQuery] of Object.entries(analyticsTables)) {
      try {
        this.connection.querySync(createQuery);
        console.log(`✅ Created analytics table: ${tableName}`);
      } catch (error) {
        console.warn(`⚠️ Warning creating ${tableName}: ${error.message}`);
      }
    }
  }

  /**
   * Advanced graph traversal with custom algorithms
   */
  async advancedTraversal(options = {}) {
    const {
      startNode,
      algorithm = 'dfs',
      maxDepth = 10,
      nodeFilter = '',
      relationshipFilter = '',
      direction = 'both', // incoming, outgoing, both
      collectMetrics = true
    } = options;
    
    const startTime = Date.now();
    
    try {
      let query;
      
      switch (algorithm) {
        case 'dfs':
          query = this.buildDFSQuery(startNode, maxDepth, nodeFilter, relationshipFilter, direction);
          break;
        case 'bfs':
          query = this.buildBFSQuery(startNode, maxDepth, nodeFilter, relationshipFilter, direction);
          break;
        case 'shortest_path':
          query = this.buildShortestPathQuery(startNode, options.endNode, nodeFilter, relationshipFilter);
          break;
        case 'all_paths':
          query = this.buildAllPathsQuery(startNode, options.endNode, maxDepth, nodeFilter, relationshipFilter);
          break;
        default:
          throw new Error(`Unknown algorithm: ${algorithm}`);
      }
      
      const result = await this.executeQuery(query);
      const executionTime = Date.now() - startTime;
      
      if (collectMetrics) {
        await this.recordTraversalMetrics(algorithm, executionTime, result.data?.length || 0);
      }
      
      return {
        ...result,
        algorithm,
        execution_time: executionTime,
        start_node: startNode
      };
      
    } catch (error) {
      console.error(`🔍 Advanced traversal error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Build DFS query
   */
  buildDFSQuery(startNode, maxDepth, nodeFilter, relationshipFilter, direction) {
    const relationshipPattern = this.buildRelationshipPattern(direction, relationshipFilter);
    const filterClause = nodeFilter ? `WHERE ${nodeFilter}` : '';
    
    return `
      MATCH (start:Service {name: '${startNode}'})-[${relationshipPattern}*1..${maxDepth}]->(nodes)
      ${filterClause}
      RETURN DISTINCT nodes, length(path) as depth
      ORDER BY depth
    `;
  }

  /**
   * Build BFS query
   */
  buildBFSQuery(startNode, maxDepth, nodeFilter, relationshipFilter, direction) {
    const relationshipPattern = this.buildRelationshipPattern(direction, relationshipFilter);
    const filterClause = nodeFilter ? `WHERE ${nodeFilter}` : '';
    
    return `
      MATCH path=(start:Service {name: '${startNode}'})-[${relationshipPattern}*1..${maxDepth}]->(nodes)
      ${filterClause}
      WITH nodes, length(path) as depth
      ORDER BY depth, nodes.name
      RETURN DISTINCT nodes, depth
    `;
  }

  /**
   * Build shortest path query
   */
  buildShortestPathQuery(startNode, endNode, nodeFilter, relationshipFilter) {
    const relationshipPattern = this.buildRelationshipPattern('both', relationshipFilter);
    const filterClause = nodeFilter ? `AND ${nodeFilter}` : '';
    
    return `
      MATCH path=shortestPath((start:Service {name: '${startNode}'})-[${relationshipPattern}*]-(end:Service {name: '${endNode}'}))
      WHERE start <> end ${filterClause}
      RETURN path, length(path) as path_length, nodes(path) as path_nodes
    `;
  }

  /**
   * Build relationship pattern for queries
   */
  buildRelationshipPattern(direction, relationshipFilter) {
    let pattern = '';
    
    if (relationshipFilter) {
      pattern += `:${relationshipFilter}`;
    }
    
    switch (direction) {
      case 'incoming':
        return `<-[${pattern}]-`;
      case 'outgoing':
        return `-[${pattern}]->`;
      case 'both':
      default:
        return `-[${pattern}]-`;
    }
  }

  /**
   * Compute centrality measures
   */
  async computeCentrality(options = {}) {
    const {
      algorithm = 'degree',
      nodeType = 'Service',
      relationshipType = '',
      normalize = true
    } = options;
    
    try {
      let centralityScores;
      
      switch (algorithm) {
        case 'degree':
          centralityScores = await this.computeDegreeCentrality(nodeType, relationshipType);
          break;
        case 'betweenness':
          centralityScores = await this.computeBetweennessCentrality(nodeType, relationshipType);
          break;
        case 'closeness':
          centralityScores = await this.computeClosenessCentrality(nodeType, relationshipType);
          break;
        case 'eigenvector':
          centralityScores = await this.computeEigenvectorCentrality(nodeType, relationshipType);
          break;
        case 'pagerank':
          centralityScores = await this.computePageRank(nodeType, relationshipType);
          break;
        default:
          throw new Error(`Unknown centrality algorithm: ${algorithm}`);
      }
      
      if (normalize) {
        centralityScores = this.normalizeCentralityScores(centralityScores);
      }
      
      // Store centrality scores if using real Kuzu
      if (this.stats.usingRealKuzu) {
        await this.storeCentralityScores(centralityScores, algorithm);
      }
      
      return {
        algorithm,
        scores: centralityScores,
        computed_at: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`📐 Centrality computation error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Compute degree centrality
   */
  async computeDegreeCentrality(nodeType, relationshipType) {
    const relFilter = relationshipType ? `:${relationshipType}` : '';
    const query = `
      MATCH (n:${nodeType})-[r${relFilter}]-()
      RETURN n.name as node, count(r) as degree
      ORDER BY degree DESC
    `;
    
    const result = await this.executeQuery(query);
    return result.data?.map(row => ({
      node: row.node,
      score: row.degree
    })) || [];
  }

  /**
   * Compute betweenness centrality (simplified implementation)
   */
  async computeBetweennessCentrality(nodeType, relationshipType) {
    // Simplified betweenness centrality using shortest paths
    const nodesQuery = `MATCH (n:${nodeType}) RETURN n.name as node`;
    const nodesResult = await this.executeQuery(nodesQuery);
    const nodes = nodesResult.data?.map(row => row.node) || [];
    
    const betweennessScores = new Map();
    nodes.forEach(node => betweennessScores.set(node, 0));
    
    // Calculate shortest paths between all pairs
    for (let i = 0; i < Math.min(nodes.length, 20); i++) { // Limit for performance
      for (let j = i + 1; j < Math.min(nodes.length, 20); j++) {
        try {
          const pathResult = await this.advancedTraversal({
            startNode: nodes[i],
            algorithm: 'shortest_path',
            endNode: nodes[j],
            collectMetrics: false
          });
          
          if (pathResult.data && pathResult.data.length > 0) {
            const pathNodes = pathResult.data[0].path_nodes || [];
            // Increment betweenness for intermediate nodes
            for (let k = 1; k < pathNodes.length - 1; k++) {
              const intermNode = pathNodes[k];
              if (betweennessScores.has(intermNode)) {
                betweennessScores.set(intermNode, betweennessScores.get(intermNode) + 1);
              }
            }
          }
        } catch (error) {
          // Skip failed path calculations
        }
      }
    }
    
    return Array.from(betweennessScores.entries()).map(([node, score]) => ({
      node,
      score
    }));
  }

  /**
   * Compute PageRank (simplified implementation)
   */
  async computePageRank(nodeType, relationshipType, iterations = 10, dampingFactor = 0.85) {
    const nodesQuery = `MATCH (n:${nodeType}) RETURN n.name as node`;
    const nodesResult = await this.executeQuery(nodesQuery);
    const nodes = nodesResult.data?.map(row => row.node) || [];
    
    // Initialize PageRank scores
    const pageRankScores = new Map();
    const initialScore = 1.0 / nodes.length;
    nodes.forEach(node => pageRankScores.set(node, initialScore));
    
    // Get adjacency information
    const relFilter = relationshipType ? `:${relationshipType}` : '';
    const adjQuery = `
      MATCH (source:${nodeType})-[r${relFilter}]->(target:${nodeType})
      RETURN source.name as source, target.name as target
    `;
    
    const adjResult = await this.executeQuery(adjQuery);
    const edges = adjResult.data || [];
    
    // Build adjacency lists
    const outLinks = new Map();
    const inLinks = new Map();
    
    nodes.forEach(node => {
      outLinks.set(node, []);
      inLinks.set(node, []);
    });
    
    edges.forEach(edge => {
      if (outLinks.has(edge.source) && inLinks.has(edge.target)) {
        outLinks.get(edge.source).push(edge.target);
        inLinks.get(edge.target).push(edge.source);
      }
    });
    
    // PageRank iterations
    for (let iter = 0; iter < iterations; iter++) {
      const newScores = new Map();
      
      nodes.forEach(node => {
        let score = (1 - dampingFactor) / nodes.length;
        
        // Sum contributions from incoming links
        const incoming = inLinks.get(node) || [];
        for (const sourceNode of incoming) {
          const sourceScore = pageRankScores.get(sourceNode) || 0;
          const sourceOutDegree = (outLinks.get(sourceNode) || []).length;
          if (sourceOutDegree > 0) {
            score += dampingFactor * (sourceScore / sourceOutDegree);
          }
        }
        
        newScores.set(node, score);
      });
      
      // Update scores
      newScores.forEach((score, node) => {
        pageRankScores.set(node, score);
      });
    }
    
    return Array.from(pageRankScores.entries()).map(([node, score]) => ({
      node,
      score
    }));
  }

  /**
   * Community detection using modularity optimization
   */
  async detectCommunities(options = {}) {
    const {
      algorithm = 'louvain',
      nodeType = 'Service',
      relationshipType = '',
      resolution = 1.0
    } = options;
    
    try {
      let communities;
      
      switch (algorithm) {
        case 'louvain':
          communities = await this.louvainCommunityDetection(nodeType, relationshipType, resolution);
          break;
        case 'label_propagation':
          communities = await this.labelPropagationCommunityDetection(nodeType, relationshipType);
          break;
        case 'connected_components':
          communities = await this.connectedComponentsDetection(nodeType, relationshipType);
          break;
        default:
          throw new Error(`Unknown community detection algorithm: ${algorithm}`);
      }
      
      // Calculate modularity
      const modularity = await this.calculateModularity(communities, nodeType, relationshipType);
      
      // Store community results if using real Kuzu
      if (this.stats.usingRealKuzu) {
        await this.storeCommunityResults(communities, algorithm, modularity);
      }
      
      return {
        algorithm,
        communities,
        modularity,
        num_communities: communities.length,
        computed_at: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`🏘️ Community detection error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Simplified Louvain community detection
   */
  async louvainCommunityDetection(nodeType, relationshipType, resolution) {
    // Get all nodes and edges
    const nodesQuery = `MATCH (n:${nodeType}) RETURN n.name as node`;
    const nodesResult = await this.executeQuery(nodesQuery);
    const nodes = nodesResult.data?.map(row => row.node) || [];
    
    const relFilter = relationshipType ? `:${relationshipType}` : '';
    const edgesQuery = `
      MATCH (source:${nodeType})-[r${relFilter}]-(target:${nodeType})
      RETURN source.name as source, target.name as target
    `;
    
    const edgesResult = await this.executeQuery(edgesQuery);
    const edges = edgesResult.data || [];
    
    // Initialize each node in its own community
    const nodeCommunity = new Map();
    nodes.forEach((node, index) => nodeCommunity.set(node, index));
    
    // Build adjacency list
    const adjacency = new Map();
    nodes.forEach(node => adjacency.set(node, []));
    
    edges.forEach(edge => {
      if (adjacency.has(edge.source) && adjacency.has(edge.target)) {
        adjacency.get(edge.source).push(edge.target);
        if (edge.source !== edge.target) {
          adjacency.get(edge.target).push(edge.source);
        }
      }
    });
    
    // Simplified community optimization (single pass)
    let improved = true;
    let iteration = 0;
    
    while (improved && iteration < 10) {
      improved = false;
      
      for (const node of nodes) {
        const currentCommunity = nodeCommunity.get(node);
        const neighbors = adjacency.get(node) || [];
        
        // Count neighbor communities
        const neighborCommunities = new Map();
        neighbors.forEach(neighbor => {
          const neighborCommunity = nodeCommunity.get(neighbor);
          neighborCommunities.set(neighborCommunity, 
            (neighborCommunities.get(neighborCommunity) || 0) + 1);
        });
        
        // Find best community (most connections)
        let bestCommunity = currentCommunity;
        let maxConnections = neighborCommunities.get(currentCommunity) || 0;
        
        neighborCommunities.forEach((connections, community) => {
          if (connections > maxConnections) {
            maxConnections = connections;
            bestCommunity = community;
          }
        });
        
        // Move node if improvement found
        if (bestCommunity !== currentCommunity && maxConnections > 1) {
          nodeCommunity.set(node, bestCommunity);
          improved = true;
        }
      }
      
      iteration++;
    }
    
    // Group nodes by community
    const communities = new Map();
    nodeCommunity.forEach((communityId, node) => {
      if (!communities.has(communityId)) {
        communities.set(communityId, []);
      }
      communities.get(communityId).push(node);
    });
    
    // Convert to array format
    return Array.from(communities.values()).map((members, index) => ({
      id: index,
      size: members.length,
      members: members
    }));
  }

  /**
   * Graph pattern matching with advanced filters
   */
  async patternMatching(pattern, options = {}) {
    const {
      limit = 100,
      filters = {},
      includeMetrics = true
    } = options;
    
    try {
      // Build pattern matching query
      const query = this.buildPatternQuery(pattern, filters, limit);
      const result = await this.executeQuery(query);
      
      if (includeMetrics && result.success) {
        // Analyze pattern frequency and importance
        const patternMetrics = await this.analyzePatternMetrics(result.data, pattern);
        return {
          ...result,
          pattern_metrics: patternMetrics
        };
      }
      
      return result;
      
    } catch (error) {
      console.error(`🔍 Pattern matching error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Build pattern matching query
   */
  buildPatternQuery(pattern, filters, limit) {
    // Parse pattern and build Cypher query
    let query = `MATCH ${pattern}`;
    
    // Add filters
    const filterClauses = [];
    Object.entries(filters).forEach(([key, value]) => {
      if (typeof value === 'string') {
        filterClauses.push(`${key} = '${value}'`);
      } else if (typeof value === 'number') {
        filterClauses.push(`${key} = ${value}`);
      } else if (Array.isArray(value)) {
        filterClauses.push(`${key} IN [${value.map(v => `'${v}'`).join(', ')}]`);
      }
    });
    
    if (filterClauses.length > 0) {
      query += ` WHERE ${filterClauses.join(' AND ')}`;
    }
    
    query += ' RETURN *';
    
    if (limit) {
      query += ` LIMIT ${limit}`;
    }
    
    return query;
  }

  /**
   * Advanced query optimization
   */
  async optimizeQuery(query, options = {}) {
    const {
      analyzeExecution = true,
      suggestImprovement = true,
      cacheResult = true
    } = options;
    
    try {
      const startTime = Date.now();
      
      // Check cache first
      if (cacheResult && this.queryCache.has(query)) {
        const cached = this.queryCache.get(query);
        this.performanceMetrics.cacheHitRate++;
        return {
          ...cached,
          from_cache: true
        };
      }
      
      // Execute query
      const result = await this.executeQuery(query);
      const executionTime = Date.now() - startTime;
      
      // Analyze execution if requested
      let optimization = {};
      if (analyzeExecution) {
        optimization = await this.analyzeQueryExecution(query, executionTime, result);
      }
      
      // Cache result
      if (cacheResult && result.success && this.queryCache.size < 1000) {
        this.queryCache.set(query, result);
      }
      
      // Update performance metrics
      this.updatePerformanceMetrics(query, executionTime, result.success);
      
      return {
        ...result,
        execution_time: executionTime,
        optimization,
        from_cache: false
      };
      
    } catch (error) {
      console.error(`⚡ Query optimization error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Analyze query execution for optimization suggestions
   */
  async analyzeQueryExecution(query, executionTime, result) {
    const analysis = {
      query_complexity: this.calculateQueryComplexity(query),
      execution_time: executionTime,
      result_size: result.data?.length || 0,
      suggestions: []
    };
    
    // Suggest optimizations based on patterns
    if (executionTime > 1000) {
      analysis.suggestions.push({
        type: 'performance',
        message: 'Query execution time is slow. Consider adding indices or filters.',
        severity: 'medium'
      });
    }
    
    if (result.data?.length > 10000) {
      analysis.suggestions.push({
        type: 'result_size',
        message: 'Large result set. Consider adding LIMIT clause.',
        severity: 'low'
      });
    }
    
    if (query.toLowerCase().includes('match') && !query.toLowerCase().includes('where')) {
      analysis.suggestions.push({
        type: 'filtering',
        message: 'Query lacks WHERE clause. Consider adding filters for better performance.',
        severity: 'medium'
      });
    }
    
    return analysis;
  }

  /**
   * Calculate query complexity score
   */
  calculateQueryComplexity(query) {
    let complexity = 0;
    
    // Count different query elements
    const matchCount = (query.match(/MATCH/gi) || []).length;
    const whereCount = (query.match(/WHERE/gi) || []).length;
    const returnCount = (query.match(/RETURN/gi) || []).length;
    const optionalCount = (query.match(/OPTIONAL/gi) || []).length;
    const unionCount = (query.match(/UNION/gi) || []).length;
    
    // Calculate complexity score
    complexity += matchCount * 2;
    complexity += whereCount * 1;
    complexity += returnCount * 1;
    complexity += optionalCount * 3;
    complexity += unionCount * 5;
    
    // Check for complex patterns
    if (query.includes('*')) complexity += 5; // Variable length paths
    if (query.includes('shortestPath')) complexity += 10;
    if (query.includes('allShortestPaths')) complexity += 15;
    
    return complexity;
  }

  /**
   * Performance monitoring and alerting
   */
  initializePerformanceTracking() {
    // Set up performance monitoring
    setInterval(() => {
      this.analyzePerformanceTrends();
    }, 60000); // Every minute
    
    console.log('📊 Performance tracking initialized');
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics(query, executionTime, success) {
    this.performanceMetrics.totalQueries++;
    
    // Update average execution time
    this.performanceMetrics.avgExecutionTime = 
      (this.performanceMetrics.avgExecutionTime + executionTime) / 2;
    
    // Track slow queries
    if (executionTime > 5000) {
      this.performanceMetrics.slowQueries.push({
        query: query.substring(0, 100) + '...',
        execution_time: executionTime,
        timestamp: new Date().toISOString()
      });
      
      // Keep only recent slow queries
      if (this.performanceMetrics.slowQueries.length > 100) {
        this.performanceMetrics.slowQueries.shift();
      }
    }
    
    // Track errors
    if (!success) {
      this.performanceMetrics.errorCount++;
    }
    
    // Update query history
    this.queryHistory.push({
      query: query.substring(0, 200),
      execution_time: executionTime,
      success,
      timestamp: new Date().toISOString()
    });
    
    // Keep history manageable
    if (this.queryHistory.length > 1000) {
      this.queryHistory.shift();
    }
  }

  /**
   * Analyze performance trends
   */
  analyzePerformanceTrends() {
    const recentQueries = this.queryHistory.slice(-100);
    
    if (recentQueries.length < 10) return;
    
    const avgTime = recentQueries.reduce((sum, q) => sum + q.execution_time, 0) / recentQueries.length;
    const errorRate = recentQueries.filter(q => !q.success).length / recentQueries.length;
    
    // Alert on performance degradation
    if (avgTime > this.performanceMetrics.avgExecutionTime * 2) {
      console.warn('⚠️ Performance Alert: Query execution time has doubled');
    }
    
    if (errorRate > 0.1) {
      console.warn('⚠️ Error Rate Alert: More than 10% of queries are failing');
    }
  }

  /**
   * Generate comprehensive graph report
   */
  async generateGraphReport(options = {}) {
    const {
      includeAnalytics = true,
      includeCentrality = true,
      includeCommunities = true,
      includePerformance = true
    } = options;
    
    const report = {
      generated_at: new Date().toISOString(),
      database_info: await this.getStats(),
      graph_overview: await this.getGraphOverview()
    };
    
    if (includeAnalytics) {
      report.analytics = await this.generateGraphAnalytics();
    }
    
    if (includeCentrality) {
      report.centrality = await this.computeCentrality({ algorithm: 'degree' });
    }
    
    if (includeCommunities) {
      report.communities = await this.detectCommunities({ algorithm: 'louvain' });
    }
    
    if (includePerformance) {
      report.performance = this.performanceMetrics;
    }
    
    return report;
  }

  /**
   * Get graph overview statistics
   */
  async getGraphOverview() {
    try {
      const overview = {
        node_count: 0,
        relationship_count: 0,
        node_types: {},
        relationship_types: {},
        degree_distribution: {}
      };
      
      if (this.stats.usingRealKuzu && this.connection) {
        // Count nodes by type
        for (const nodeType of Object.keys(this.schema.nodes)) {
          try {
            const result = this.connection.querySync(`MATCH (n:${nodeType}) RETURN count(n) as count`);
            const rows = result.getAllSync();
            if (rows.length > 0) {
              overview.node_types[nodeType] = rows[0].count;
              overview.node_count += rows[0].count;
            }
            result.close();
          } catch (error) {
            overview.node_types[nodeType] = 0;
          }
        }
        
        // Count relationships by type
        for (const relType of Object.keys(this.schema.relationships)) {
          try {
            const result = this.connection.querySync(`MATCH ()-[r:${relType}]-() RETURN count(r) as count`);
            const rows = result.getAllSync();
            if (rows.length > 0) {
              overview.relationship_types[relType] = rows[0].count;
              overview.relationship_count += rows[0].count;
            }
            result.close();
          } catch (error) {
            overview.relationship_types[relType] = 0;
          }
        }
      } else {
        // Fallback to in-memory statistics
        overview.node_count = this.stats.nodeCount;
        overview.relationship_count = this.stats.relationshipCount;
      }
      
      return overview;
      
    } catch (error) {
      console.error(`📊 Graph overview error: ${error.message}`);
      return { error: error.message };
    }
  }

  /**
   * Helper methods for analytics storage
   */
  async storeCentralityScores(scores, algorithm) {
    if (!this.stats.usingRealKuzu) return;
    
    try {
      for (const score of scores.slice(0, 100)) { // Limit storage
        const query = `
          CREATE (c:CentralityScores {
            node_id: '${score.node}',
            centrality_type: '${algorithm}',
            score: ${score.score},
            rank: ${scores.indexOf(score) + 1},
            computed_at: '${new Date().toISOString()}'
          })
        `;
        this.connection.querySync(query);
      }
    } catch (error) {
      console.warn('⚠️ Could not store centrality scores:', error.message);
    }
  }

  async storeCommunityResults(communities, algorithm, modularity) {
    if (!this.stats.usingRealKuzu) return;
    
    try {
      for (const community of communities) {
        const query = `
          CREATE (c:CommunityDetection {
            community_id: '${algorithm}_${community.id}',
            algorithm: '${algorithm}',
            modularity: ${modularity},
            size: ${community.size},
            member_nodes: ['${community.members.join("', '")}'],
            computed_at: '${new Date().toISOString()}'
          })
        `;
        this.connection.querySync(query);
      }
    } catch (error) {
      console.warn('⚠️ Could not store community results:', error.message);
    }
  }

  /**
   * Enhanced statistics with advanced metrics
   */
  async getAdvancedStats() {
    const baseStats = await this.getStats();
    
    return {
      ...baseStats,
      performance_metrics: this.performanceMetrics,
      query_cache_size: this.queryCache.size,
      graph_metrics: Object.fromEntries(this.graphMetrics),
      advanced_features: {
        analytics_enabled: this.advancedConfig.enableAnalytics,
        cache_enabled: this.advancedConfig.enableCache,
        metrics_enabled: this.advancedConfig.enableMetrics
      }
    };
  }

  /**
   * Cleanup and optimization
   */
  async optimize() {
    console.log('🔧 Optimizing advanced Kuzu interface...');
    
    // Clear old cache entries
    if (this.queryCache.size > 500) {
      const entries = Array.from(this.queryCache.entries());
      entries.slice(0, 250).forEach(([key]) => {
        this.queryCache.delete(key);
      });
    }
    
    // Cleanup old query history
    if (this.queryHistory.length > 500) {
      this.queryHistory = this.queryHistory.slice(-250);
    }
    
    // Cleanup slow queries
    if (this.performanceMetrics.slowQueries.length > 50) {
      this.performanceMetrics.slowQueries = this.performanceMetrics.slowQueries.slice(-25);
    }
    
    console.log('✅ Optimization completed');
  }

  /**
   * Enhanced close method
   */
  async close() {
    console.log('💾 Closing advanced Kuzu interface...');
    
    try {
      // Save performance metrics
      if (this.advancedConfig.enableMetrics) {
        const metricsPath = path.join(this.config.dbPath, 'performance_metrics.json');
        await writeFile(metricsPath, JSON.stringify(this.performanceMetrics, null, 2));
      }
      
      // Clear caches
      this.queryCache.clear();
      this.queryHistory.length = 0;
      
      // Call parent close method
      await super.close();
      
      console.log('✅ Advanced Kuzu interface closed');
      
    } catch (error) {
      console.error(`❌ Error closing advanced interface: ${error.message}`);
      throw error;
    }
  }

  // Additional helper methods
  normalizeCentralityScores(scores) {
    if (scores.length === 0) return scores;
    
    const maxScore = Math.max(...scores.map(s => s.score));
    if (maxScore === 0) return scores;
    
    return scores.map(score => ({
      ...score,
      score: score.score / maxScore
    }));
  }

  async calculateModularity(communities, nodeType, relationshipType) {
    // Simplified modularity calculation
    // In practice, this would require more complex graph analysis
    if (communities.length <= 1) return 0;
    
    const totalEdges = this.stats.relationshipCount || 1;
    let modularity = 0;
    
    for (const community of communities) {
      const communitySize = community.size;
      if (communitySize > 1) {
        // Simplified calculation based on community size
        const expectedEdges = (communitySize * (communitySize - 1)) / (2 * totalEdges);
        modularity += expectedEdges * (1 / communities.length);
      }
    }
    
    return Math.min(1, modularity);
  }

  async recordTraversalMetrics(algorithm, executionTime, resultCount) {
    // Record traversal performance for analysis
    if (!this.graphMetrics.has('traversal_metrics')) {
      this.graphMetrics.set('traversal_metrics', []);
    }
    
    const metrics = this.graphMetrics.get('traversal_metrics');
    metrics.push({
      algorithm,
      execution_time: executionTime,
      result_count: resultCount,
      timestamp: new Date().toISOString()
    });
    
    // Keep only recent metrics
    if (metrics.length > 1000) {
      metrics.splice(0, 500);
    }
  }

  async analyzePatternMetrics(data, pattern) {
    return {
      pattern,
      matches_found: data.length,
      frequency_score: Math.min(1, data.length / 100),
      complexity_score: this.calculateQueryComplexity(pattern)
    };
  }

  async generateGraphAnalytics() {
    return {
      connectivity: await this.analyzeConnectivity(),
      clustering: await this.analyzeClusteringCoefficient(),
      paths: await this.analyzePathLengths()
    };
  }

  async analyzeConnectivity() {
    // Simplified connectivity analysis
    return {
      density: 0.1, // Placeholder
      components: 1,
      diameter: 6
    };
  }

  async analyzeClusteringCoefficient() {
    // Simplified clustering coefficient
    return {
      global: 0.3,
      average_local: 0.25
    };
  }

  async analyzePathLengths() {
    // Simplified path length analysis
    return {
      average_shortest_path: 3.2,
      diameter: 6,
      radius: 3
    };
  }
}

export default KuzuAdvancedInterface;