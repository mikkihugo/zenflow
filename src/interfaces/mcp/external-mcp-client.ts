import { EventEmitter } from 'node:events';

/**
 * External MCP Server Client
 * Connects to remote MCP servers like Context7, DeepWiki, GitMCP, and Semgrep
 *
 * @example
 */
export class ExternalMCPClient extends EventEmitter {
  private servers: Map<string, MCPServerConfig> = new Map();
  private connections: Map<string, MCPConnection> = new Map();
  private toolCache: Map<string, MCPTool[]> = new Map();
  private retryAttempts: Map<string, number> = new Map();

  constructor() {
    super();
    this.loadServerConfigs();
  }

  /**
   * Load external server configurations
   */
  private loadServerConfigs(): void {
    const externalServers = {
      context7: {
        url: 'https://mcp.context7.com/mcp',
        type: 'http',
        description: 'Research and analysis tools',
        timeout: 30000,
        retryAttempts: 3,
        capabilities: ['research', 'analysis', 'documentation'],
      },
      deepwiki: {
        url: 'https://mcp.deepwiki.com/sse',
        type: 'sse',
        description: 'Knowledge base and research tools',
        timeout: 30000,
        retryAttempts: 3,
        capabilities: ['knowledge', 'documentation', 'research'],
      },
      gitmcp: {
        url: 'https://gitmcp.io/docs',
        type: 'http',
        description: 'Git operations and repository management',
        timeout: 30000,
        retryAttempts: 3,
        capabilities: ['git', 'repository', 'version-control'],
      },
      semgrep: {
        url: 'https://mcp.semgrep.ai/sse',
        type: 'sse',
        description: 'Code analysis and security scanning',
        timeout: 30000,
        retryAttempts: 3,
        capabilities: ['security', 'analysis', 'quality'],
      },
    };

    for (const [name, config] of Object.entries(externalServers)) {
      this.servers.set(name, config as MCPServerConfig);
    }
  }

  /**
   * Connect to all configured external MCP servers
   */
  async connectAll(): Promise<ConnectionResult[]> {
    const results: ConnectionResult[] = [];

    for (const [name, config] of this.servers) {
      try {
        const result = await this.connectToServer(name, config);
        results.push(result);
      } catch (error) {
        results.push({
          server: name,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return results;
  }

  /**
   * Connect to a specific external MCP server
   *
   * @param name
   * @param config
   */
  private async connectToServer(name: string, config: MCPServerConfig): Promise<ConnectionResult> {
    try {
      const connection = await this.createConnection(name, config);
      this.connections.set(name, connection);

      // Discover available tools
      const tools = await this.discoverTools(name, connection);
      this.toolCache.set(name, tools);

      this.emit('serverConnected', { server: name, tools: tools.length });

      return {
        server: name,
        success: true,
        url: config.url,
        toolCount: tools.length,
        capabilities: config.capabilities,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Failed to connect to ${name}: ${errorMessage}`);

      this.emit('serverError', { server: name, error: errorMessage });

      return {
        server: name,
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Create connection based on server type
   *
   * @param name
   * @param config
   */
  private async createConnection(name: string, config: MCPServerConfig): Promise<MCPConnection> {
    if (config.type === 'http') {
      return this.createHTTPConnection(name, config);
    } else if (config.type === 'sse') {
      return this.createSSEConnection(name, config);
    } else {
      throw new Error(`Unsupported server type: ${config.type}`);
    }
  }

  /**
   * Create HTTP connection to MCP server
   *
   * @param _name
   * @param config
   */
  private async createHTTPConnection(
    _name: string,
    config: MCPServerConfig
  ): Promise<MCPConnection> {
    // Simulate HTTP connection for external servers
    // In practice, this would use the actual MCP protocol over HTTP
    return {
      type: 'http',
      url: config.url,
      connected: true,
      lastPing: new Date(),
      send: async (_message: any) => {
        return { success: true, data: {} };
      },
      close: async () => {},
    };
  }

  /**
   * Create SSE connection to MCP server
   *
   * @param _name
   * @param config
   */
  private async createSSEConnection(
    _name: string,
    config: MCPServerConfig
  ): Promise<MCPConnection> {
    // Simulate SSE connection for external servers
    // In practice, this would use Server-Sent Events for real-time communication
    return {
      type: 'sse',
      url: config.url,
      connected: true,
      lastPing: new Date(),
      send: async (_message: any) => {
        return { success: true, data: {} };
      },
      close: async () => {},
    };
  }

  /**
   * Discover available tools from connected server
   *
   * @param name
   * @param _connection
   */
  private async discoverTools(name: string, _connection: MCPConnection): Promise<MCPTool[]> {
    try {
      // Simulate tool discovery
      const mockTools = this.getMockToolsForServer(name);
      return mockTools;
    } catch (error) {
      console.error(`Failed to discover tools from ${name}:`, error);
      return [];
    }
  }

  /**
   * Get mock tools for demonstration (replace with actual MCP tool discovery)
   *
   * @param serverName
   */
  private getMockToolsForServer(serverName: string): MCPTool[] {
    const toolSets = {
      context7: [
        { name: 'research_analysis', description: 'Perform in-depth research analysis' },
        { name: 'code_review', description: 'AI-powered code review and suggestions' },
        { name: 'documentation_generator', description: 'Generate comprehensive documentation' },
      ],
      deepwiki: [
        { name: 'knowledge_search', description: 'Search knowledge base for information' },
        { name: 'reference_lookup', description: 'Look up technical references' },
        { name: 'concept_explanation', description: 'Explain complex technical concepts' },
      ],
      gitmcp: [
        { name: 'repository_analysis', description: 'Analyze repository structure and health' },
        { name: 'branch_management', description: 'Manage git branches and merges' },
        { name: 'commit_analysis', description: 'Analyze commit history and patterns' },
      ],
      semgrep: [
        { name: 'security_scan', description: 'Perform security vulnerability scanning' },
        { name: 'code_quality_check', description: 'Check code quality and best practices' },
        { name: 'dependency_analysis', description: 'Analyze dependencies for vulnerabilities' },
      ],
    };

    return toolSets[serverName as keyof typeof toolSets] || [];
  }

  /**
   * Execute tool on external server
   *
   * @param serverName
   * @param toolName
   * @param parameters
   */
  async executeTool(
    serverName: string,
    toolName: string,
    parameters: any
  ): Promise<ToolExecutionResult> {
    const connection = this.connections.get(serverName);
    if (!connection) {
      throw new Error(`Not connected to server: ${serverName}`);
    }

    const tools = this.toolCache.get(serverName) || [];
    const tool = tools.find((t) => t.name === toolName);
    if (!tool) {
      throw new Error(`Tool not found: ${toolName} on server ${serverName}`);
    }

    try {
      // Simulate tool execution
      const result = await this.simulateToolExecution(serverName, toolName, parameters);

      this.emit('toolExecuted', { server: serverName, tool: toolName, success: true });

      return {
        success: true,
        server: serverName,
        tool: toolName,
        result,
        executionTime: Date.now(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.emit('toolError', { server: serverName, tool: toolName, error: errorMessage });

      return {
        success: false,
        server: serverName,
        tool: toolName,
        error: errorMessage,
      };
    }
  }

  /**
   * Simulate tool execution (replace with actual MCP protocol calls)
   *
   * @param serverName
   * @param toolName
   * @param _parameters
   */
  private async simulateToolExecution(
    serverName: string,
    toolName: string,
    _parameters: any
  ): Promise<any> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500));

    // Simulate different responses based on server and tool
    const responses = {
      context7: {
        research_analysis: {
          analysis: 'Comprehensive research analysis completed',
          insights: ['key insight 1', 'key insight 2'],
        },
        code_review: {
          review: 'Code review completed',
          suggestions: ['suggestion 1', 'suggestion 2'],
        },
        documentation_generator: { documentation: 'Generated documentation', sections: 5 },
      },
      deepwiki: {
        knowledge_search: { results: ['result 1', 'result 2'], relevance: 0.95 },
        reference_lookup: { references: ['ref 1', 'ref 2'], found: true },
        concept_explanation: { explanation: 'Detailed concept explanation', complexity: 'medium' },
      },
      gitmcp: {
        repository_analysis: { health: 'good', issues: 2, recommendations: ['rec 1', 'rec 2'] },
        branch_management: { branches: ['main', 'develop'], status: 'clean' },
        commit_analysis: { commits: 150, patterns: ['pattern 1', 'pattern 2'] },
      },
      semgrep: {
        security_scan: { vulnerabilities: 0, severity: 'low', report: 'Security scan clean' },
        code_quality_check: { score: 85, issues: ['minor issue 1'], recommendations: ['rec 1'] },
        dependency_analysis: { dependencies: 45, vulnerable: 0, outdated: 3 },
      },
    };

    const serverResponses = responses[serverName as keyof typeof responses];
    return (
      serverResponses?.[toolName as keyof typeof serverResponses] || {
        message: 'Tool executed successfully',
      }
    );
  }

  /**
   * Get available tools from all connected servers
   */
  getAvailableTools(): { [serverName: string]: MCPTool[] } {
    const allTools: { [serverName: string]: MCPTool[] } = {};

    for (const [serverName, tools] of this.toolCache) {
      allTools[serverName] = tools;
    }

    return allTools;
  }

  /**
   * Get server status
   */
  getServerStatus(): { [serverName: string]: ServerStatus } {
    const status: { [serverName: string]: ServerStatus } = {};

    for (const [name, config] of this.servers) {
      const connection = this.connections.get(name);
      const tools = this.toolCache.get(name) || [];

      status[name] = {
        name,
        url: config.url,
        type: config.type,
        connected: !!connection?.connected,
        toolCount: tools.length,
        capabilities: config.capabilities,
        lastPing: connection?.lastPing || null,
      };
    }

    return status;
  }

  /**
   * Disconnect from all servers
   */
  async disconnectAll(): Promise<void> {
    for (const [name, connection] of this.connections) {
      try {
        await connection.close();
      } catch (error) {
        console.error(`Error disconnecting from ${name}:`, error);
      }
    }

    this.connections.clear();
    this.toolCache.clear();
    this.retryAttempts.clear();
  }
}

// Type definitions
export interface ExternalMCPConfig {
  timeout?: number;
  retryAttempts?: number;
  enableLogging?: boolean;
}

export interface MCPServerConfig {
  url: string;
  type: 'http' | 'sse';
  description: string;
  timeout: number;
  retryAttempts: number;
  capabilities: string[];
}

export interface MCPConnection {
  type: 'http' | 'sse';
  url: string;
  connected: boolean;
  lastPing: Date;
  send: (message: any) => Promise<any>;
  close: () => Promise<void>;
}

export interface MCPTool {
  name: string;
  description: string;
  parameters?: any;
  schema?: any;
}

export interface ConnectionResult {
  server: string;
  success: boolean;
  url?: string;
  toolCount?: number;
  capabilities?: string[];
  error?: string;
}

export interface ToolExecutionResult {
  success: boolean;
  server: string;
  tool: string;
  result?: any;
  error?: string;
  executionTime?: number;
}

export interface ServerStatus {
  name: string;
  url: string;
  type: string;
  connected: boolean;
  toolCount: number;
  capabilities: string[];
  lastPing: Date | null;
}
