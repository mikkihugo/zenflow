/**
 * FACT Integration for Claude-Zen
 * Integrates the real FACT system (Fast Augmented Context Tools) for external knowledge gathering
 *
 * Based on: https://github.com/ruvnet/FACT
 * Architecture: MCP-based tool execution with intelligent caching
 */

import { type ChildProcess, spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';
import fs from 'node:fs/promises';
import path from 'node:path';

export interface FACTConfig {
  pythonPath?: string;
  factRepoPath: string;
  anthropicApiKey: string;
  cacheConfig?: {
    prefix: string;
    minTokens: number;
    maxSize: string;
    ttlSeconds: number;
  };
  databasePath?: string;
  enableCache?: boolean;
}

export interface FACTQuery {
  query: string;
  tools?: string[];
  useCache?: boolean;
  metadata?: Record<string, any>;
}

export interface FACTResult {
  response: string;
  queryId: string;
  executionTimeMs: number;
  cacheHit: boolean;
  toolsUsed: string[];
  cost?: number;
  metadata?: Record<string, any>;
}

// Aliases for knowledge client compatibility
export type KnowledgeClientConfig = FACTConfig;
export type KnowledgeResult = FACTResult;
export type KnowledgeClient = FACTIntegration;

interface FACTMetrics {
  totalQueries: number;
  cacheHitRate: number;
  averageLatency: number;
  costSavings: number;
  toolExecutions: number;
  errorRate: number;
}

/**
 * FACT Integration class that bridges to the Python FACT system
 * Provides external knowledge gathering through MCP tools and intelligent caching
 */
export class FACTIntegration extends EventEmitter {
  private config: FACTConfig;
  private factProcess: ChildProcess | null = null;
  private isInitialized = false;
  private queryCounter = 0;
  private pendingQueries = new Map<
    string,
    {
      resolve: (result: FACTResult) => void;
      reject: (error: Error) => void;
      timeout: NodeJS.Timeout;
    }
  >();

  constructor(config: FACTConfig) {
    super();
    this.config = {
      pythonPath: 'python3',
      enableCache: true,
      cacheConfig: {
        prefix: 'claude-zen-fact',
        minTokens: 500,
        maxSize: '100MB',
        ttlSeconds: 3600,
      },
      ...config,
    };
  }

  /**
   * Initialize the FACT system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Verify FACT repository exists
      await this.verifyFACTRepository();

      // Set up environment variables
      await this.setupEnvironment();

      // Initialize FACT system
      await this.initializeFACTSystem();

      this.isInitialized = true;
      this.emit('initialized');
    } catch (error) {
      console.error('❌ FACT initialization failed:', error);
      throw error;
    }
  }

  /**
   * Query external knowledge using FACT system
   */
  async query(factQuery: FACTQuery): Promise<FACTResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const queryId = `fact_${++this.queryCounter}_${Date.now()}`;
    const startTime = Date.now();

    try {
      // Execute FACT query through Python interface
      const result = await this.executeFACTQuery(queryId, factQuery);

      const executionTime = Date.now() - startTime;

      const factResult: FACTResult = {
        queryId,
        response: result.response,
        executionTimeMs: executionTime,
        cacheHit: result.cacheHit || false,
        toolsUsed: result.toolsUsed || [],
        cost: result.cost,
        metadata: {
          ...factQuery.metadata,
          factVersion: '1.0.0',
          timestamp: new Date().toISOString(),
        },
      };

      this.emit('queryCompleted', factResult);

      return factResult;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error(`❌ FACT Query failed [${queryId}]:`, error);

      this.emit('queryError', { queryId, error, executionTime });
      throw error;
    }
  }

  /**
   * Get real-time documentation for frameworks/libraries
   */
  async getDocumentation(framework: string, version?: string): Promise<FACTResult> {
    const queries = {
      react: `Get the latest React ${version || '19'} documentation including hooks, components, and best practices. Include code examples and migration notes.`,
      typescript: `Get TypeScript ${version || 'latest'} documentation covering type system, advanced features, and configuration options.`,
      node: `Get Node.js ${version || 'latest'} API documentation and usage patterns for core modules and latest features.`,
      next: `Get Next.js ${version || 'latest'} documentation including App Router, Server Components, and deployment guides.`,
      express: `Get Express.js ${version || 'latest'} documentation including middleware, routing, and security best practices.`,
    };

    const query =
      queries[framework.toLowerCase() as keyof typeof queries] ||
      `Get comprehensive documentation for ${framework} ${version ? `version ${version}` : '(latest version)'}`;

    return this.query({
      query,
      tools: ['web_scraper', 'documentation_parser'],
      metadata: { framework, version, type: 'documentation' },
    });
  }

  /**
   * Get specific API reference information
   */
  async getAPIReference(api: string, endpoint?: string): Promise<FACTResult> {
    const query = endpoint
      ? `Get detailed API reference for ${api} endpoint: ${endpoint}. Include parameters, response format, examples, and error codes.`
      : `Get comprehensive API reference documentation for ${api}. Include all endpoints, authentication, rate limits, and examples.`;

    return this.query({
      query,
      tools: ['api_documentation_scraper', 'openapi_parser'],
      metadata: { api, endpoint, type: 'api_reference' },
    });
  }

  /**
   * Get changelog and release information
   */
  async getChangelog(project: string, version?: string): Promise<FACTResult> {
    const query = version
      ? `Get changelog and release notes for ${project} version ${version}. Include breaking changes, new features, and migration guide.`
      : `Get the latest changelog and recent release notes for ${project}. Include breaking changes and new features from recent versions.`;

    return this.query({
      query,
      tools: ['changelog_scraper', 'github_releases'],
      metadata: { project, version, type: 'changelog' },
    });
  }

  /**
   * Search Stack Overflow and developer communities
   */
  async searchCommunityKnowledge(topic: string, tags?: string[]): Promise<FACTResult> {
    const tagStr = tags ? ` with tags: ${tags.join(', ')}` : '';
    const query = `Search Stack Overflow and developer communities for: ${topic}${tagStr}. Get top solutions, code examples, and best practices.`;

    return this.query({
      query,
      tools: ['stackoverflow_search', 'github_search', 'dev_community_search'],
      metadata: { topic, tags, type: 'community_knowledge' },
    });
  }

  /**
   * Get current metrics from FACT system
   */
  async getMetrics(): Promise<FACTMetrics> {
    try {
      const result = await this.executePythonCommand('get_metrics');
      return {
        totalQueries: result.total_queries || 0,
        cacheHitRate: result.cache_hit_rate || 0,
        averageLatency: result.average_latency || 0,
        costSavings: result.cost_savings || 0,
        toolExecutions: result.tool_executions || 0,
        errorRate: result.error_rate || 0,
      };
    } catch (error) {
      console.error('Failed to get FACT metrics:', error);
      return {
        totalQueries: 0,
        cacheHitRate: 0,
        averageLatency: 0,
        costSavings: 0,
        toolExecutions: 0,
        errorRate: 0,
      };
    }
  }

  /**
   * Shutdown the FACT system
   */
  async shutdown(): Promise<void> {
    if (this.factProcess) {
      this.factProcess.kill();
      this.factProcess = null;
    }

    // Reject any pending queries
    for (const [_queryId, pending] of this.pendingQueries) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('FACT system shutting down'));
    }
    this.pendingQueries.clear();

    this.isInitialized = false;
    this.emit('shutdown');
  }

  /**
   * Verify FACT repository exists and is properly set up
   */
  private async verifyFACTRepository(): Promise<void> {
    try {
      const factMainPath = path.join(this.config.factRepoPath, 'main.py');
      await fs.access(factMainPath);

      const srcPath = path.join(this.config.factRepoPath, 'src');
      await fs.access(srcPath);
    } catch (_error) {
      throw new Error(
        `FACT repository not found at ${this.config.factRepoPath}. Please clone it first: git clone https://github.com/ruvnet/FACT.git`
      );
    }
  }

  /**
   * Set up environment variables for FACT system
   */
  private async setupEnvironment(): Promise<void> {
    const envPath = path.join(this.config.factRepoPath, '.env');

    const envContent = [
      `ANTHROPIC_API_KEY=${this.config.anthropicApiKey}`,
      `CACHE_PREFIX=${this.config.cacheConfig?.prefix || 'claude-zen-fact'}`,
      `CACHE_MIN_TOKENS=${this.config.cacheConfig?.minTokens || 500}`,
      `CACHE_MAX_SIZE=${this.config.cacheConfig?.maxSize || '100MB'}`,
      `CACHE_TTL_SECONDS=${this.config.cacheConfig?.ttlSeconds || 3600}`,
      `DATABASE_PATH=${this.config.databasePath || './data/fact.db'}`,
      `ENABLE_CACHE=${this.config.enableCache ? 'true' : 'false'}`,
      `LOG_LEVEL=INFO`,
    ].join('\n');

    try {
      await fs.writeFile(envPath, envContent);
    } catch (error) {
      console.error('Failed to create FACT .env file:', error);
      throw error;
    }
  }

  /**
   * Initialize the FACT system (install dependencies, etc.)
   */
  private async initializeFACTSystem(): Promise<void> {
    try {
      // Install FACT dependencies
      await this.executePythonCommand('install_dependencies');

      // Initialize FACT driver
      await this.executePythonCommand('initialize');
    } catch (error) {
      console.error('FACT system initialization failed:', error);
      throw error;
    }
  }

  /**
   * Execute a FACT query through Python interface
   */
  private async executeFACTQuery(queryId: string, factQuery: FACTQuery): Promise<any> {
    const command = {
      action: 'query',
      query_id: queryId,
      query: factQuery.query,
      tools: factQuery.tools,
      use_cache: factQuery.useCache !== false,
      metadata: factQuery.metadata,
    };

    return this.executePythonCommand(JSON.stringify(command));
  }

  /**
   * Execute Python command in FACT repository
   */
  private async executePythonCommand(command: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const pythonArgs = [
        path.join(this.config.factRepoPath, 'main.py'),
        'api',
        '--command',
        command,
      ];

      const pythonProcess = spawn(this.config.pythonPath!, pythonArgs, {
        cwd: this.config.factRepoPath,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(stdout);
            resolve(result);
          } catch (_error) {
            // If not JSON, return raw stdout
            resolve({ response: stdout.trim() });
          }
        } else {
          reject(new Error(`FACT command failed (code ${code}): ${stderr}`));
        }
      });

      pythonProcess.on('error', (error) => {
        reject(new Error(`Failed to start FACT process: ${error.message}`));
      });

      // Set timeout
      setTimeout(() => {
        pythonProcess.kill();
        reject(new Error('FACT command timeout'));
      }, 30000); // 30 second timeout
    });
  }
}

/**
 * Global FACT integration instance for the Claude-Zen system
 */
let globalFACTInstance: FACTIntegration | null = null;

/**
 * Initialize global FACT integration
 */
export async function initializeFACT(config: FACTConfig): Promise<FACTIntegration> {
  if (globalFACTInstance) {
    return globalFACTInstance;
  }

  globalFACTInstance = new FACTIntegration(config);
  await globalFACTInstance.initialize();

  return globalFACTInstance;
}

/**
 * Get the global FACT integration instance
 */
export function getFACT(): FACTIntegration | null {
  return globalFACTInstance;
}

/**
 * Shutdown global FACT integration
 */
export async function shutdownFACT(): Promise<void> {
  if (globalFACTInstance) {
    await globalFACTInstance.shutdown();
    globalFACTInstance = null;
  }
}

/**
 * Quick helper functions for common FACT operations
 */
export const FACTHelpers = {
  /**
   * Get React documentation
   */
  async getReactDocs(version?: string): Promise<string> {
    const fact = getFACT();
    if (!fact) throw new Error('FACT not initialized');

    const result = await fact.getDocumentation('react', version);
    return result.response;
  },

  /**
   * Get TypeScript documentation
   */
  async getTypeScriptDocs(version?: string): Promise<string> {
    const fact = getFACT();
    if (!fact) throw new Error('FACT not initialized');

    const result = await fact.getDocumentation('typescript', version);
    return result.response;
  },

  /**
   * Search for solutions to coding problems
   */
  async searchSolutions(problem: string, tags?: string[]): Promise<string> {
    const fact = getFACT();
    if (!fact) throw new Error('FACT not initialized');

    const result = await fact.searchCommunityKnowledge(problem, tags);
    return result.response;
  },

  /**
   * Get API documentation
   */
  async getAPIDocs(api: string, endpoint?: string): Promise<string> {
    const fact = getFACT();
    if (!fact) throw new Error('FACT not initialized');

    const result = await fact.getAPIReference(api, endpoint);
    return result.response;
  },
};

export default FACTIntegration;
