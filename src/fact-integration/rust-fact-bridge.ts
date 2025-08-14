/**
 * Bridge to integrate Rust FACT core with TypeScript workspace system
 *
 * This replaces the TypeScript FACT implementation with the high-performance
 * Rust FACT core via Node.js bindings or CLI interface.
 */

import { ChildProcess, spawn } from 'child_process';
import { EventEmitter } from 'events';
import { join } from 'path';

export interface RustFactConfig {
  /** Path to the Rust FACT binary */
  binaryPath?: string;
  /** Cache size in bytes */
  cacheSize?: number;
  /** Processing timeout in milliseconds */
  timeout?: number;
  /** Enable performance monitoring */
  monitoring?: boolean;
}

export interface FactProcessingRequest {
  /** Template ID to use */
  templateId: string;
  /** Context data to process */
  context: Record<string, unknown>;
  /** Processing options */
  options?: {
    timeout?: number;
    priority?: 'low' | 'normal' | 'high' | 'critical';
    noCache?: boolean;
  };
}

export interface FactProcessingResult {
  templateId: string;
  templateName: string;
  result: unknown;
  metadata: {
    processedAt: string;
    priority: string;
    processingTimeMs: number;
    cacheHit: boolean;
  };
}

export interface FactCacheStats {
  entries: number;
  hits: number;
  misses: number;
  hitRate: number;
  memoryUsage: number;
}

/**
 * Bridge to high-performance Rust FACT core
 */
export class RustFactBridge extends EventEmitter {
  private config: RustFactConfig;
  private binaryPath: string;
  private isInitialized = false;

  constructor(config: RustFactConfig = {}) {
    super();
    this.config = {
      binaryPath: join(__dirname, '../../fact-core/target/release/fact-core'),
      cacheSize: 100 * 1024 * 1024, // 100MB
      timeout: 30000, // 30 seconds
      monitoring: true,
      ...config,
    };
    this.binaryPath = this.config.binaryPath!;
  }

  /**
   * Initialize the Rust FACT system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // Verify binary exists and is executable
    try {
      const testResult = await this.executeCommand('--version');
      console.log(`Rust FACT initialized: ${testResult.stdout.trim()}`);
      this.isInitialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize Rust FACT: ${error}`);
    }
  }

  /**
   * Process data using a Rust FACT template
   */
  async process(request: FactProcessingRequest): Promise<FactProcessingResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const command = 'process';
    const args = [
      '--template',
      request.templateId,
      '--context',
      JSON.stringify(request.context),
    ];

    // Add optional parameters
    if (request.options?.timeout) {
      args.push('--timeout', request.options.timeout.toString());
    }
    if (request.options?.priority) {
      args.push('--priority', request.options.priority);
    }
    if (request.options?.noCache) {
      args.push('--no-cache');
    }

    try {
      const result = await this.executeCommand(command, args);
      const output = JSON.parse(result.stdout);

      this.emit('processed', {
        templateId: request.templateId,
        success: true,
        processingTime: output.metadata?.processingTimeMs || 0,
      });

      return output as FactProcessingResult;
    } catch (error) {
      this.emit('error', {
        templateId: request.templateId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Process version-specific tool knowledge with GitHub integration
   */
  async processToolKnowledge(
    toolName: string,
    version: string,
    knowledgeType: 'docs' | 'snippets' | 'examples' | 'best-practices' = 'docs'
  ): Promise<{
    tool: string;
    version: string;
    knowledgeType: string;
    documentation?: string;
    snippets?: Array<{ title: string; code: string; description: string }>;
    examples?: Array<{ title: string; code: string; explanation: string }>;
    bestPractices?: Array<{ practice: string; rationale: string }>;
    troubleshooting?: Array<{ issue: string; solution: string }>;
    githubSources?: Array<{ repo: string; stars: number; lastUpdate: string }>;
  }> {
    // First try to get knowledge from Rust FACT templates
    const factResult = await this.process({
      templateId: 'tool-knowledge-extraction',
      context: {
        tool: toolName,
        version,
        knowledgeType,
        versionedSubject: `${toolName}@${version}`,
      },
    });

    // If FACT result is empty or limited, enhance with GitHub analysis
    if (this.shouldEnhanceWithGitHub(factResult, knowledgeType)) {
      try {
        const githubAnalysis = await this.enhanceWithGitHubKnowledge(
          toolName,
          version,
          knowledgeType
        );
        return this.mergeFACTAndGitHubKnowledge(factResult, githubAnalysis);
      } catch (error) {
        console.warn(
          `GitHub enhancement failed for ${toolName}@${version}:`,
          error
        );
        return factResult;
      }
    }

    return factResult;
  }

  /**
   * Enhance tool knowledge with GitHub repository analysis
   */
  private async enhanceWithGitHubKnowledge(
    toolName: string,
    version: string,
    knowledgeType: string
  ): Promise<unknown> {
    // Use GitHub analyzer to get real code examples
    const { GitHubCodeAnalyzer } = await import('./github-code-analyzer.js');
    const analyzer = new GitHubCodeAnalyzer();

    // For BEAM ecosystem tools, analyze Hex package repositories
    if (this.isBeamEcosystemTool(toolName)) {
      const hexAnalysis = await analyzer.analyzeHexPackageRepos(
        toolName,
        version
      );
      return analyzer.generateFACTEntries(toolName, version, hexAnalysis);
    }

    // For other tools, search general repositories
    return this.analyzeGeneralToolRepos(
      analyzer,
      toolName,
      version,
      knowledgeType
    );
  }

  private async analyzeGeneralToolRepos(
    analyzer: unknown,
    toolName: string,
    version: string,
    knowledgeType: string
  ) {
    // Search for repositories with tool examples
    const searchQueries = [
      `${toolName} example`,
      `${toolName} tutorial`,
      `"${toolName}" usage`,
      `${toolName} getting started`,
    ];

    const allSnippets: unknown[] = [];
    const allPatterns: unknown[] = [];
    const sources: unknown[] = [];

    // This would need GitHub search implementation
    // For now, return structured format
    return {
      documentation: `GitHub-sourced examples and documentation for ${toolName}@${version}`,
      snippets: allSnippets.slice(0, 10), // Limit to top 10 snippets
      examples: allPatterns.slice(0, 5), // Limit to top 5 patterns
      bestPractices: [],
      troubleshooting: [],
      githubSources: sources,
    };
  }

  private shouldEnhanceWithGitHub(
    factResult: unknown,
    knowledgeType: string
  ): boolean {
    // Enhance with GitHub if:
    // 1. No snippets/examples found in FACT
    // 2. User specifically requested snippets or examples
    // 3. Limited documentation available
    return (
      !(factResult.snippets?.length && factResult.examples?.length) ||
      knowledgeType === 'snippets' ||
      knowledgeType === 'examples'
    );
  }

  private isBeamEcosystemTool(toolName: string): boolean {
    const beamTools = [
      'phoenix',
      'ecto',
      'plug',
      'cowboy',
      'jason',
      'tesla',
      'broadway',
      'oban',
      'libcluster',
      'distillery',
      'guardian',
      'absinthe',
      'nerves',
      'scenic',
      'liveview',
      'live_view',
    ];
    return beamTools.includes(toolName.toLowerCase());
  }

  private mergeFACTAndGitHubKnowledge(
    factResult: unknown,
    githubResult: unknown
  ): unknown {
    return {
      ...factResult,
      snippets: [
        ...(factResult.snippets || []),
        ...(githubResult.snippets || []),
      ].slice(0, 15), // Limit total snippets
      examples: [
        ...(factResult.examples || []),
        ...(githubResult.examples || []),
      ].slice(0, 10), // Limit total examples
      bestPractices: [
        ...(factResult.bestPractices || []),
        ...(githubResult.bestPractices || []),
      ].slice(0, 8), // Limit best practices
      githubSources: githubResult.githubSources || [],
    };
  }

  /**
   * Process project environment analysis
   */
  async analyzeEnvironment(environmentData: {
    tools: Array<{ name: string; version?: string; available: boolean }>;
    dependencies: Array<{ name: string; version: string; source: string }>;
    projectType: string;
    buildSystems: string[];
    languages: string[];
  }): Promise<{
    toolCompatibility: Record<
      string,
      'compatible' | 'warning' | 'incompatible'
    >;
    suggestedVersions: Record<string, string>;
    environmentHealth: number; // 0-1 score
    recommendations: Array<{
      type: 'upgrade' | 'install' | 'configure' | 'warning';
      tool: string;
      message: string;
      priority: 'low' | 'medium' | 'high';
    }>;
  }> {
    return this.process({
      templateId: 'environment-analysis',
      context: environmentData,
    });
  }

  /**
   * Get cache statistics from Rust FACT
   */
  async getCacheStats(): Promise<FactCacheStats> {
    const result = await this.executeCommand('cache-stats');
    return JSON.parse(result.stdout);
  }

  /**
   * Clear the cache
   */
  async clearCache(): Promise<void> {
    await this.executeCommand('clear-cache');
    this.emit('cache-cleared');
  }

  /**
   * List available templates
   */
  async listTemplates(): Promise<
    Array<{
      id: string;
      name: string;
      description: string;
      tags: string[];
      performance: {
        avgExecutionTimeMs: number;
        memoryUsageBytes: number;
        complexity: number;
      };
    }>
  > {
    const result = await this.executeCommand('list-templates');
    return JSON.parse(result.stdout);
  }

  /**
   * Search templates by tags
   */
  async searchTemplates(tags: string[]): Promise<
    Array<{
      id: string;
      name: string;
      description: string;
      relevanceScore: number;
    }>
  > {
    const result = await this.executeCommand('search-templates', [
      '--tags',
      tags.join(','),
    ]);
    return JSON.parse(result.stdout);
  }

  /**
   * Execute a command with the Rust FACT binary
   */
  private executeCommand(
    command: string,
    args: string[] = []
  ): Promise<{
    stdout: string;
    stderr: string;
    code: number;
  }> {
    return new Promise((resolve, reject) => {
      const fullArgs = [command, ...args];
      const child = spawn(this.binaryPath, fullArgs, {
        stdio: 'pipe',
        timeout: this.config.timeout,
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr, code: code || 0 });
        } else {
          reject(
            new Error(`Rust FACT process exited with code ${code}: ${stderr}`)
          );
        }
      });

      child.on('error', (error) => {
        reject(
          new Error(`Failed to spawn Rust FACT process: ${error.message}`)
        );
      });
    });
  }

  /**
   * Shutdown the bridge
   */
  async shutdown(): Promise<void> {
    // Cleanup if needed
    this.emit('shutdown');
  }
}

/**
 * Singleton instance for global access
 */
let globalRustFactBridge: RustFactBridge | null = null;

export function getRustFactBridge(config?: RustFactConfig): RustFactBridge {
  if (!globalRustFactBridge) {
    globalRustFactBridge = new RustFactBridge(config);
  }
  return globalRustFactBridge;
}

export default RustFactBridge;
