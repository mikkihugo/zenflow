// Enhanced interfaces for advanced tools
export interface MCPTool extends MCPTool {
  readonly category: MCPToolCategory;
  readonly version: string;
  readonly permissions: Permission[];
  readonly rateLimit?: RateLimit;
  readonly caching?: CachingPolicy;
  readonly priority: 'low' | 'medium' | 'high' | 'critical';
  readonly metadata: ToolMetadata;
}

export type MCPToolCategory =
  | 'coordination'
  | 'monitoring'
  | 'memory-neural'
  | 'github-integration'
  | 'system'
  | 'orchestration';

export interface Permission {
  type: 'read' | 'write' | 'execute' | 'admin';
  resource: string;
  conditions?: Record<string, any>;
}

export interface RateLimit {
  maxCalls: number;
  windowMs: number;
  burst?: number;
}

export interface CachingPolicy {
  enabled: boolean;
  ttlMs: number;
  strategy: 'memory' | 'redis' | 'file';
}

export interface ToolMetadata {
  author: string;
  tags: string[];
  examples: ToolExample[];
  related: string[];
  documentation?: string;
  since: string;
}

export interface ToolExample {
  description: string;
  params: Record<string, any>;
  expectedResult?: any;
}

export interface MCPToolResult extends MCPToolResult {
  metadata?: {
    executionTime: number;
    cacheHit?: boolean;
    version: string;
    warnings?: string[];
  };
  metrics?: Record<string, number>;
}

// Base class for advanced tool handlers
export abstract class ToolHandler {
  abstract execute(params: any): Promise<AdvancedMCPToolResult>;

  protected validateParams(params: any, schema: any): void {
    // Basic parameter validation
    if (schema.required) {
      for (const required of schema.required) {
        if (!(required in (params || {}))) {
          throw new Error(`Missing required parameter: ${required}`);
        }
      }
    }
  }

  protected createResult(
    success: boolean,
    content: any,
    error?: string,
    metadata?: any
  ): AdvancedMCPToolResult {
    return {
      success,
      content: Array.isArray(content)
        ? content
        : [{ type: 'text', text: JSON.stringify(content, null, 2) }],
      error,
      metadata: {
        executionTime: Date.now(),
        version: '2.0.0',
        ...metadata,
      },
    };
  }
}

// Registry for advanced tools
export class ToolRegistry {
  private tools = new Map<string, AdvancedMCPTool>();
  private categoryIndex = new Map<MCPToolCategory, string[]>();
  private tagIndex = new Map<string, string[]>();

  registerTool(tool: AdvancedMCPTool): void {
    // Add to main registry
    this.tools.set(tool.name, tool);

    // Update category index
    if (!this.categoryIndex.has(tool.category)) {
      this.categoryIndex.set(tool.category, []);
    }
    this.categoryIndex.get(tool.category)?.push(tool.name);

    // Update tag index
    for (const tag of tool.metadata.tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, []);
      }
      this.tagIndex.get(tag)?.push(tool.name);
    }
  }

  getTool(name: string): AdvancedMCPTool | undefined {
    return this.tools.get(name);
  }

  getToolsByCategory(category: MCPToolCategory): AdvancedMCPTool[] {
    const toolNames = this.categoryIndex.get(category) || [];
    return toolNames.map((name) => this.tools.get(name)!).filter(Boolean);
  }

  getToolsByTag(tag: string): AdvancedMCPTool[] {
    const toolNames = this.tagIndex.get(tag) || [];
    return toolNames.map((name) => this.tools.get(name)!).filter(Boolean);
  }

  getAllTools(): AdvancedMCPTool[] {
    return Array.from(this.tools.values());
  }

  getToolCount(): number {
    return this.tools.size;
  }

  getCategorySummary(): Record<MCPToolCategory, number> {
    const summary: Record<string, number> = {};
    for (const [category, tools] of this.categoryIndex.entries()) {
      summary[category] = tools.length;
    }
    return summary as Record<MCPToolCategory, number>;
  }
}

// Global registry instance
export const advancedToolRegistry = new AdvancedToolRegistry();

export default advancedToolRegistry;
