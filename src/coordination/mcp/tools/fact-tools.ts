/**
 * @fileoverview FACT System MCP Tools
 * Comprehensive MCP tools for coordinating the FACT (Fast Augmented Context Tools) swarm system
 *
 * FACT System handles external knowledge gathering via swarms and caches results
 * in SQLite/memory storage (completely independent from RAG/vector systems)
 */

import { createLogger } from '@core/logger';
import type {
  FACTKnowledgeEntry,
  FACTSearchQuery,
  FACTStorageBackend,
  FACTStorageConfig,
  FACTStorageStats,
} from '@knowledge/storage-interface';
import type { MCPTool, MCPToolResult } from '../types/mcp-types';
import { FACTStorageSystem, KnowledgeSwarm, ProjectContextAnalyzer } from './fact-placeholders';

const logger = createLogger({ prefix: 'MCP-FACT' });

// Global FACT system instances
let factStorage: FACTStorageSystem | null = null;
let knowledgeSwarm: KnowledgeSwarm | null = null;
let contextAnalyzer: ProjectContextAnalyzer | null = null;

export interface FACTInitParams {
  backend?: 'sqlite' | 'memory' | 'file';
  maxCacheSize?: number;
  defaultTTL?: number; // milliseconds
  projectPath?: string;
}

export interface FACTAnalyzeProjectParams {
  projectPath: string;
  depth?: 'surface' | 'medium' | 'deep';
  includeTests?: boolean;
  includeDocs?: boolean;
}

export interface FACTGatherParams {
  query: string;
  sources?: ('web' | 'docs' | 'github' | 'api')[];
  priority?: 'low' | 'medium' | 'high' | 'critical';
  maxResults?: number;
  freshness?: 'any' | 'recent' | 'latest'; // any: cached OK, recent: prefer fresh, latest: force fresh
}

export interface FACTQueryParams {
  query: string;
  type?: string;
  domains?: string[];
  limit?: number;
  sortBy?: 'relevance' | 'timestamp' | 'access_count';
}

export interface FACTSwarmSpawnParams {
  type: 'researcher' | 'analyzer' | 'gatherer' | 'coordinator' | 'specialist';
  name: string;
  specialization?: string;
  sources?: string[];
}

export interface FACTSwarmMissionParams {
  mission: string;
  agents?: string[];
  strategy?: 'parallel' | 'sequential' | 'adaptive';
  timeLimit?: number; // seconds
  qualityThreshold?: number; // 0-1
}

/**
 * Initialize FACT knowledge system
 */
export const factInitTool: MCPTool = {
  name: 'fact_init',
  description:
    'Initialize FACT (Fast Augmented Context Tools) knowledge system for external knowledge gathering',
  inputSchema: {
    type: 'object',
    properties: {
      backend: {
        type: 'string',
        enum: ['sqlite', 'memory', 'file'],
        description: 'Storage backend for knowledge cache',
        default: 'sqlite',
      },
      maxCacheSize: {
        type: 'number',
        description: 'Maximum memory cache size (entries)',
        minimum: 100,
        maximum: 10000,
        default: 1000,
      },
      defaultTTL: {
        type: 'number',
        description: 'Default time-to-live for cached knowledge (milliseconds)',
        minimum: 300000, // 5 minutes
        maximum: 604800000, // 7 days
        default: 86400000, // 24 hours
      },
      projectPath: {
        type: 'string',
        description: 'Project path for context analysis',
        optional: true,
      },
    },
  },
  handler: async (params: FACTInitParams): Promise<MCPToolResult> => {
    try {
      logger.info('Initializing FACT system:', params);

      // Initialize storage system
      factStorage = new FACTStorageSystem({
        backend: params.backend || 'sqlite',
        maxMemoryCacheSize: params.maxCacheSize || 1000,
        defaultTTL: params.defaultTTL || 86400000,
      });

      await factStorage.initialize();

      // Initialize knowledge swarm
      knowledgeSwarm = new KnowledgeSwarm(factStorage);
      await knowledgeSwarm.initialize();

      // Initialize project context analyzer if project path provided
      if (params.projectPath) {
        contextAnalyzer = new ProjectContextAnalyzer(params.projectPath);
        await contextAnalyzer.initialize();
      }

      const stats = await factStorage.getStorageStats();

      logger.info('FACT system initialized successfully');

      return {
        success: true,
        content: [
          {
            type: 'text',
            text: `🧠 FACT System Initialized Successfully!

🏗️ Configuration:
  Backend: ${params.backend || 'sqlite'}
  Cache Size: ${params.maxCacheSize || 1000} entries
  Default TTL: ${((params.defaultTTL || 86400000) / 1000 / 60).toFixed(0)} minutes
  Project Path: ${params.projectPath || 'Not specified'}

📊 Storage Status:
  Memory Entries: ${stats.memoryEntries}
  Persistent Entries: ${stats.persistentEntries}
  Cache Hit Rate: ${(stats.cacheHitRate * 100).toFixed(1)}%
  Storage Health: ${stats.storageHealth}

🐝 Swarm Status: Initialized and ready
${contextAnalyzer ? '🔍 Project Context: Analyzer ready' : '⚠️  Project Context: Not configured'}

Ready for knowledge gathering missions!`,
          },
        ],
      };
    } catch (error) {
      logger.error('FACT system initialization failed:', error);
      return {
        success: false,
        content: [
          {
            type: 'text',
            text: `❌ FACT System initialization failed: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  },
};

/**
 * Analyze project for knowledge needs
 */
export const factAnalyzeProjectTool: MCPTool = {
  name: 'fact_analyze_project',
  description: 'Analyze project structure and codebase to identify knowledge gathering needs',
  inputSchema: {
    type: 'object',
    properties: {
      projectPath: {
        type: 'string',
        description: 'Path to project directory',
      },
      depth: {
        type: 'string',
        enum: ['surface', 'medium', 'deep'],
        description: 'Analysis depth level',
        default: 'medium',
      },
      includeTests: {
        type: 'boolean',
        description: 'Include test files in analysis',
        default: true,
      },
      includeDocs: {
        type: 'boolean',
        description: 'Include documentation files in analysis',
        default: true,
      },
    },
    required: ['projectPath'],
  },
  handler: async (params: FACTAnalyzeProjectParams): Promise<MCPToolResult> => {
    try {
      logger.info('Analyzing project for knowledge needs:', params);

      if (!contextAnalyzer || contextAnalyzer.projectPath !== params.projectPath) {
        contextAnalyzer = new ProjectContextAnalyzer(params.projectPath);
        await contextAnalyzer.initialize();
      }

      const analysis = await contextAnalyzer.analyzeProject({
        depth: params.depth || 'medium',
        includeTests: params.includeTests !== false,
        includeDocs: params.includeDocs !== false,
      });

      const knowledgeGaps = analysis.knowledgeNeeds
        .map((need) => `• ${need.category}: ${need.description} (Priority: ${need.priority})`)
        .join('\n');

      const technologies = analysis.technologies.slice(0, 10).join(', ');
      const patterns = analysis.patterns.slice(0, 5).join(', ');

      return {
        success: true,
        content: [
          {
            type: 'text',
            text: `🔍 Project Analysis Complete

📁 Project: ${params.projectPath}
📏 Analysis Depth: ${params.depth || 'medium'}

🏗️ Project Overview:
  Files Analyzed: ${analysis.fileCount}
  Lines of Code: ${analysis.totalLines}
  Main Language: ${analysis.primaryLanguage}
  Technologies: ${technologies}
  Patterns: ${patterns}

🧠 Knowledge Needs Identified (${analysis.knowledgeNeeds.length}):
${knowledgeGaps}

💡 Recommendations:
${analysis.recommendations.map((rec) => `• ${rec}`).join('\n')}

🎯 Suggested Next Steps:
  1. Use fact_gather to collect knowledge for high-priority needs
  2. Use fact_swarm_spawn to create specialized research agents
  3. Use fact_swarm_mission to execute comprehensive knowledge gathering

Analysis stored for future reference.`,
          },
        ],
      };
    } catch (error) {
      logger.error('Project analysis failed:', error);
      return {
        success: false,
        content: [
          {
            type: 'text',
            text: `❌ Project analysis failed: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  },
};

/**
 * Execute knowledge gathering mission
 */
export const factGatherTool: MCPTool = {
  name: 'fact_gather',
  description: 'Execute knowledge gathering mission using FACT swarm coordination',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Knowledge query or topic to research',
      },
      sources: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['web', 'docs', 'github', 'api'],
        },
        description: 'Knowledge sources to search',
        default: ['web', 'docs'],
      },
      priority: {
        type: 'string',
        enum: ['low', 'medium', 'high', 'critical'],
        description: 'Mission priority level',
        default: 'medium',
      },
      maxResults: {
        type: 'number',
        description: 'Maximum number of results to gather',
        minimum: 1,
        maximum: 100,
        default: 10,
      },
      freshness: {
        type: 'string',
        enum: ['any', 'recent', 'latest'],
        description:
          'Freshness requirement (any: cached OK, recent: prefer fresh, latest: force fresh)',
        default: 'recent',
      },
    },
    required: ['query'],
  },
  handler: async (params: FACTGatherParams): Promise<MCPToolResult> => {
    try {
      logger.info('Executing knowledge gathering mission:', params);

      if (!knowledgeSwarm) {
        throw new Error('FACT system not initialized. Use fact_init first.');
      }

      const missionConfig = {
        query: params.query,
        sources: params.sources || ['web', 'docs'],
        priority: params.priority || 'medium',
        maxResults: params.maxResults || 10,
        freshness: params.freshness || 'recent',
        timeLimit: 300, // 5 minutes default
      };

      const missionId = await knowledgeSwarm.startGatheringMission(missionConfig);

      // Wait for mission completion or timeout
      const result = await knowledgeSwarm.waitForMissionCompletion(missionId, 300000); // 5 minutes

      const summary = result.knowledge
        .slice(0, 3)
        .map((k) => `• ${k.title} (${k.metadata.type}): ${k.content.substring(0, 100)}...`)
        .join('\n');

      return {
        success: true,
        content: [
          {
            type: 'text',
            text: `🎯 Knowledge Gathering Mission Complete

🔍 Query: "${params.query}"
📊 Mission Results:
  Mission ID: ${missionId}
  Knowledge Entries: ${result.knowledge.length}
  Sources Used: ${params.sources?.join(', ') || 'web, docs'}
  Execution Time: ${result.executionTime}ms
  Success Rate: ${result.successRate}%

📚 Knowledge Summary:
${summary}

🎯 Quality Metrics:
  Relevance Score: ${result.relevanceScore}/10
  Freshness Score: ${result.freshnessScore}/10
  Completeness: ${result.completeness}%

💾 Storage Status:
  Cached Entries: ${result.knowledge.length}
  Cache Hit Rate: ${result.cacheHitRate}%

Use fact_query to search gathered knowledge or fact_status for system overview.`,
          },
        ],
      };
    } catch (error) {
      logger.error('Knowledge gathering mission failed:', error);
      return {
        success: false,
        content: [
          {
            type: 'text',
            text: `❌ Knowledge gathering mission failed: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  },
};

/**
 * Query gathered knowledge
 */
export const factQueryTool: MCPTool = {
  name: 'fact_query',
  description: 'Query cached knowledge from FACT storage system',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query for knowledge',
      },
      type: {
        type: 'string',
        description: 'Filter by knowledge type',
        optional: true,
      },
      domains: {
        type: 'array',
        items: { type: 'string' },
        description: 'Filter by source domains',
        optional: true,
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results',
        minimum: 1,
        maximum: 50,
        default: 10,
      },
      sortBy: {
        type: 'string',
        enum: ['relevance', 'timestamp', 'access_count'],
        description: 'Sort results by',
        default: 'relevance',
      },
    },
    required: ['query'],
  },
  handler: async (params: FACTQueryParams): Promise<MCPToolResult> => {
    try {
      logger.info('Querying FACT knowledge:', params);

      if (!factStorage) {
        throw new Error('FACT system not initialized. Use fact_init first.');
      }

      const searchQuery = {
        query: params.query,
        type: params.type,
        domains: params.domains,
        limit: params.limit || 10,
        sortBy: params.sortBy || 'relevance',
      };

      const results = await factStorage.searchKnowledge(searchQuery);

      if (results.length === 0) {
        return {
          success: true,
          content: [
            {
              type: 'text',
              text: `🔍 No knowledge found for query: "${params.query}"

💡 Suggestions:
  1. Use fact_gather to collect knowledge on this topic
  2. Try broader search terms
  3. Check fact_status to see available knowledge domains`,
            },
          ],
        };
      }

      const resultSummary = results
        .map(
          (result, index) =>
            `${index + 1}. ${result.title} (${result.metadata.type})
   Source: ${result.metadata.source}
   Age: ${Math.floor((Date.now() - result.timestamp) / 1000 / 60)} minutes
   Access Count: ${result.accessCount}
   Content: ${result.content.substring(0, 150)}...`
        )
        .join('\n');

      return {
        success: true,
        content: [
          {
            type: 'text',
            text: `🔍 FACT Knowledge Query Results

Query: "${params.query}"
Found: ${results.length} results (sorted by ${params.sortBy || 'relevance'})

📚 Results:
${resultSummary}

🎯 Query Statistics:
  Types: ${[...new Set(results.map((r) => r.metadata.type))].join(', ')}
  Sources: ${[...new Set(results.map((r) => r.metadata.source))].join(', ')}
  Average Age: ${Math.floor(results.reduce((sum, r) => sum + (Date.now() - r.timestamp), 0) / results.length / 1000 / 60)} minutes`,
          },
        ],
      };
    } catch (error) {
      logger.error('FACT knowledge query failed:', error);
      return {
        success: false,
        content: [
          {
            type: 'text',
            text: `❌ FACT knowledge query failed: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  },
};

/**
 * Get FACT system status
 */
export const factStatusTool: MCPTool = {
  name: 'fact_status',
  description: 'Get comprehensive FACT system status and performance metrics',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  handler: async (): Promise<MCPToolResult> => {
    try {
      if (!factStorage) {
        return {
          success: true,
          content: [
            {
              type: 'text',
              text: `⚠️  FACT System Status: NOT INITIALIZED

Use fact_init to initialize the FACT knowledge system.`,
            },
          ],
        };
      }

      const storageStats = await factStorage.getStorageStats();
      const swarmStatus = knowledgeSwarm ? await knowledgeSwarm.getStatus() : null;

      const healthIcon = {
        excellent: '🟢',
        good: '🟡',
        fair: '🟠',
        poor: '🔴',
      }[storageStats.storageHealth];

      return {
        success: true,
        content: [
          {
            type: 'text',
            text: `🧠 FACT System Status Report

${healthIcon} Overall Health: ${storageStats.storageHealth.toUpperCase()}

📊 Storage Statistics:
  Memory Entries: ${storageStats.memoryEntries}
  Persistent Entries: ${storageStats.persistentEntries}
  Total Memory Size: ${(storageStats.totalMemorySize / 1024).toFixed(1)} KB
  Cache Hit Rate: ${(storageStats.cacheHitRate * 100).toFixed(1)}%

📈 Performance Metrics:
  Oldest Entry: ${Math.floor((Date.now() - storageStats.oldestEntry) / 1000 / 60 / 60)} hours ago
  Newest Entry: ${Math.floor((Date.now() - storageStats.newestEntry) / 1000 / 60)} minutes ago
  Top Domains: ${storageStats.topDomains.slice(0, 5).join(', ')}

🐝 Swarm Status:
${
  swarmStatus
    ? `  Active Missions: ${swarmStatus.activeMissions}
  Total Agents: ${swarmStatus.totalAgents}
  Success Rate: ${swarmStatus.successRate}%
  Avg Mission Time: ${swarmStatus.avgMissionTime}ms`
    : '  Status: Not active'
}

🔍 Context Analysis:
${contextAnalyzer ? '  Project Analyzer: Active' : '  Project Analyzer: Not configured'}

💡 System Recommendations:
${storageStats.cacheHitRate < 0.5 ? '  • Consider increasing cache size or freshness requirements' : ''}
${storageStats.storageHealth === 'poor' ? '  • System performance is poor - consider cleanup or optimization' : ''}
${!swarmStatus ? '  • Consider using fact_gather to start collecting knowledge' : ''}`,
          },
        ],
      };
    } catch (error) {
      logger.error('FACT status check failed:', error);
      return {
        success: false,
        content: [
          {
            type: 'text',
            text: `❌ FACT status check failed: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  },
};

// Export all core FACT tools
export const factCoreTools = {
  fact_init: factInitTool,
  fact_analyze_project: factAnalyzeProjectTool,
  fact_gather: factGatherTool,
  fact_query: factQueryTool,
  fact_status: factStatusTool,
};
