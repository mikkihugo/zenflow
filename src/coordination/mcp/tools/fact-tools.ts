/**
 * @fileoverview FACT System MCP Tools
 * Comprehensive MCP tools for coordinating the FACT (Fast Augmented Context Tools) swarm system
 *
 * FACT System handles external knowledge gathering via HiveFACT centralized system
 * All facts are universal and accessible by all swarms - not swarm-specific
 */

import { createLogger } from '@core/logger';
import type { MCPTool, MCPToolResult } from '../types/mcp-types';
import { getHiveFACT, HiveFACTHelpers, type HiveFACTSystem } from '../../hive-fact-integration';
import { ProjectContextAnalyzer } from './fact-placeholders';

const logger = createLogger({ prefix: 'MCP-FACT' });

// Global instances
let hiveFact: HiveFACTSystem | null = null;
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

      // Get or initialize HiveFACT system
      hiveFact = getHiveFACT();
      if (!hiveFact) {
        // Initialize through hive coordination (would normally be done by HiveSwarmCoordinator)
        const { initializeHiveFACT } = await import('../../hive-fact-integration');
        hiveFact = await initializeHiveFACT({
          enableCache: true,
          cacheSize: params.maxCacheSize || 1000,
          autoRefreshInterval: params.defaultTTL || 3600000,
          knowledgeSources: ['context7', 'deepwiki', 'gitmcp', 'semgrep']
        });
      }

      // Initialize project context analyzer if project path provided
      if (params.projectPath) {
        contextAnalyzer = new ProjectContextAnalyzer(params.projectPath);
        await contextAnalyzer.initialize();
      }

      const stats = hiveFact.getStats();

      logger.info('FACT system initialized successfully');

      return {
        success: true,
        content: [
          {
            type: 'text',
            text: `🧠 FACT System Initialized Successfully!

🏗️ Configuration:
  System: Hive-Level Centralized FACT
  Cache Size: ${params.maxCacheSize || 1000} entries
  External Sources: Context7, DeepWiki, GitMCP, Semgrep
  Project Path: ${params.projectPath || 'Not specified'}

📊 Hive FACT Status:
  Universal Facts: ${stats.memoryEntries}
  Cache Hit Rate: ${(stats.cacheHitRate * 100).toFixed(1)}%
  Storage Health: ${stats.storageHealth}
  Active Sources: ${stats.topDomains.join(', ')}

🌍 Knowledge Sources:
  • Context7: API documentation and best practices
  • DeepWiki: Technical knowledge aggregation
  • GitMCP: Repository pattern analysis
  • Semgrep: Security and quality scanning

🐝 System Architecture: All swarms access the same universal facts
${contextAnalyzer ? '🔍 Project Context: Analyzer ready' : '⚠️  Project Context: Not configured'}

Ready for universal knowledge gathering!`,
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

      if (!hiveFact) {
        throw new Error('FACT system not initialized. Use fact_init first.');
      }

      const startTime = Date.now();
      const results: any[] = [];
      const errors: string[] = [];

      // Map source types to fact types and gather knowledge
      if (params.sources?.includes('web') || params.sources?.includes('docs')) {
        try {
          // General knowledge gathering
          const searchResult = await hiveFact.searchFacts({
            query: params.query,
            limit: params.maxResults || 10
          });
          results.push(...searchResult);
        } catch (error) {
          errors.push(`Web/Docs search: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (params.sources?.includes('github')) {
        try {
          // Extract GitHub repo from query if possible
          const repoMatch = params.query.match(/github\.com\/([^\/]+)\/([^\/\s]+)/);
          if (repoMatch) {
            const fact = await hiveFact.getGitHubRepoFacts(repoMatch[1], repoMatch[2]);
            results.push(fact);
          }
        } catch (error) {
          errors.push(`GitHub search: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (params.sources?.includes('api')) {
        try {
          // Try to get API documentation
          const fact = await hiveFact.getAPIDocsFacts(params.query);
          results.push(fact);
        } catch (error) {
          errors.push(`API search: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Get current cache stats
      const stats = hiveFact.getStats();
      const executionTime = Date.now() - startTime;

      const summary = results
        .slice(0, 3)
        .map((fact) => {
          const content = typeof fact.content === 'string' ? fact.content : JSON.stringify(fact.content);
          return `• ${fact.subject} (${fact.type}): ${content.substring(0, 100)}...`;
        })
        .join('\n');

      return {
        success: true,
        content: [
          {
            type: 'text',
            text: `🎯 Knowledge Gathering Mission Complete

🔍 Query: "${params.query}"
📊 Mission Results:
  Facts Gathered: ${results.length}
  Sources Used: ${params.sources?.join(', ') || 'all available'}
  Execution Time: ${executionTime}ms
  Errors: ${errors.length > 0 ? errors.join('; ') : 'None'}

📚 Knowledge Summary:
${summary || 'No relevant facts found.'}

🌍 Universal Facts:
  Total Facts: ${stats.memoryEntries}
  Cache Hit Rate: ${(stats.cacheHitRate * 100).toFixed(1)}%
  External Sources: ${stats.topDomains.join(', ')}

💡 Note: All facts are universal and accessible by any swarm in the system.

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

      if (!hiveFact) {
        throw new Error('FACT system not initialized. Use fact_init first.');
      }

      const searchQuery = {
        query: params.query,
        type: params.type,
        domains: params.domains,
        limit: params.limit || 10,
        sortBy: params.sortBy || 'relevance',
      };

      const results = await hiveFact.searchFacts(searchQuery);

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
          (result, index) => {
            const content = typeof result.content === 'string' ? result.content : JSON.stringify(result.content);
            return `${index + 1}. ${result.subject} (${result.type})
   Source: ${result.metadata.source}
   Age: ${Math.floor((Date.now() - result.metadata.timestamp) / 1000 / 60)} minutes
   Access Count: ${result.accessCount}
   Swarms Using: ${result.swarmAccess.size}
   Content: ${content.substring(0, 150)}...`;
          }
        )
        .join('\n\n');

      return {
        success: true,
        content: [
          {
            type: 'text',
            text: `🔍 FACT Knowledge Query Results

Query: "${params.query}"
Found: ${results.length} universal facts (sorted by ${params.sortBy || 'relevance'})

📚 Results:
${resultSummary}

🎯 Query Statistics:
  Types: ${[...new Set(results.map((r) => r.type))].join(', ')}
  Sources: ${[...new Set(results.map((r) => r.metadata.source))].join(', ')}
  Average Age: ${Math.floor(results.reduce((sum, r) => sum + (Date.now() - r.metadata.timestamp), 0) / results.length / 1000 / 60)} minutes
  Total Swarms Using: ${new Set(results.flatMap(r => Array.from(r.swarmAccess))).size}

🌍 Note: These are universal facts accessible by all swarms in the system.`,
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
      if (!hiveFact) {
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

      const stats = hiveFact.getStats();

      const healthIcon = {
        excellent: '🟢',
        good: '🟡',
        fair: '🟠',
        poor: '🔴',
      }[stats.storageHealth];

      // Calculate swarm usage summary
      const swarmUsageSummary = Object.entries(stats.swarmUsage || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([swarmId, count]) => `  ${swarmId}: ${count} facts`)
        .join('\n');

      return {
        success: true,
        content: [
          {
            type: 'text',
            text: `🧠 FACT System Status Report

${healthIcon} Overall Health: ${stats.storageHealth.toUpperCase()}

🌍 Centralized Universal Facts:
  Total Facts: ${stats.memoryEntries}
  Cache Hit Rate: ${(stats.cacheHitRate * 100).toFixed(1)}%
  Total Memory Size: ${(stats.totalMemorySize / 1024).toFixed(1)} KB
  External Sources: ${stats.topDomains.join(', ')}

📈 Performance Metrics:
  Oldest Entry: ${Math.floor((Date.now() - stats.oldestEntry) / 1000 / 60 / 60)} hours ago
  Newest Entry: ${Math.floor((Date.now() - stats.newestEntry) / 1000 / 60)} minutes ago

🐝 Swarm Usage (Top 5):
${swarmUsageSummary || '  No swarms have accessed facts yet'}

🔗 External MCP Integration:
  • Context7: API documentation
  • DeepWiki: Knowledge aggregation  
  • GitMCP: Repository patterns
  • Semgrep: Security scanning

🔍 Context Analysis:
${contextAnalyzer ? '  Project Analyzer: Active' : '  Project Analyzer: Not configured'}

💡 System Architecture:
  • All facts are universal (npm packages, repos, APIs)
  • Centralized at Hive level for all swarms
  • WASM-powered processing engine
  • External MCP orchestration

System Recommendations:
${stats.cacheHitRate < 0.5 ? '  • Consider pre-loading common facts' : ''}
${stats.storageHealth === 'poor' ? '  • System performance is poor - consider cleanup or optimization' : ''}
${stats.memoryEntries === 0 ? '  • Use fact_gather to start collecting universal knowledge' : ''}`,
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
