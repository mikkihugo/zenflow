/**
 * @file Advanced MCP Tools Infrastructure
 *
 * Provides the foundation for the 87 advanced MCP tools from claude-zen.
 * Extends the existing MCP infrastructure with enhanced capabilities.
 */

import type { MCPTool, MCPToolResult } from '../coordination/swarm/mcp/types';
import { MemoryCoordinator } from '../../memory/core/memory-coordinator';
import * as fs from 'fs';

// This is a placeholder for the actual memoryCoordinator instance.
// In a real application, this would be initialized and managed by the DI container.
let memoryCoordinator: MemoryCoordinator | null = null;

// Enhanced interfaces for advanced tools
export interface AdvancedMCPTool extends MCPTool {
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

export interface AdvancedMCPToolResult extends MCPToolResult {
  metadata?: {
    executionTime: number;
    cacheHit?: boolean;
    version: string;
    warnings?: string[];
  };
  metrics?: Record<string, number>;
}

// Base class for advanced tool handlers
export abstract class AdvancedToolHandler {
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
export class AdvancedToolRegistry {
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

class StoreDiscoveryPatternHandler extends AdvancedToolHandler {
  async execute(params: any): Promise<AdvancedMCPToolResult> {
    this.validateParams(params, memoryStoreDiscoveryPatternTool.inputSchema);
    try {
      // A real implementation would get this from the DI container
      if (!memoryCoordinator) {
        memoryCoordinator = new MemoryCoordinator({
            enabled: true,
            consensus: { quorum: 0.5, timeout: 5000, strategy: 'majority' },
            distributed: { replication: 1, consistency: 'strong', partitioning: 'hash' },
            optimization: { autoCompaction: true, cacheEviction: 'lru', memoryThreshold: 0.8 }
        });
      }

      const { pattern } = params;
      const { domainName } = pattern;

      const coordinationParams = {
        type: 'write' as const,
        sessionId: 'discovery_patterns', // Using a fixed session ID for now
        target: domainName,
        metadata: { data: pattern },
      };

      const decision = await memoryCoordinator.coordinate(coordinationParams);

      return this.createResult(true, {
        message: `Discovery pattern for domain '${domainName}' stored successfully.`,
        decision,
      });
    } catch (error) {
      return this.createResult(false, null, error.message);
    }
  }
}

export const memoryStoreDiscoveryPatternTool: AdvancedMCPTool = {
  name: 'memory_store_discovery_pattern',
  description: 'Store a discovery pattern in memory for future use.',
  category: 'memory-neural',
  version: '1.0.0',
  permissions: [
    { type: 'write', resource: 'memory:discovery_patterns' },
  ],
  priority: 'medium',
  inputSchema: {
    type: 'object',
    properties: {
      pattern: {
        type: 'object',
        properties: {
          domainName: { type: 'string' },
          files: { type: 'array', items: { type: 'string' } },
          dependencies: { type: 'array', items: { type: 'string' } },
          confidenceScore: { type: 'number' },
        },
        required: ['domainName', 'files', 'dependencies', 'confidenceScore'],
      },
    },
    required: ['pattern'],
  },
  handler: new StoreDiscoveryPatternHandler(),
  metadata: {
    author: 'Gemini',
    tags: ['memory', 'discovery', 'learning'],
    examples: [
      {
        description: 'Store a discovery pattern for a new domain.',
        params: {
          pattern: {
            domainName: 'my-new-domain',
            files: ['file1.ts', 'file2.ts'],
            dependencies: ['dependency1', 'dependency2'],
            confidenceScore: 0.8,
          },
        },
      },
    ],
    related: ['memory_retrieve_discovery_pattern'],
    since: '2025-08-10',
  },
};

advancedToolRegistry.registerTool(memoryStoreDiscoveryPatternTool);

class RetrieveDiscoveryPatternHandler extends AdvancedToolHandler {
  async execute(params: any): Promise<AdvancedMCPToolResult> {
    this.validateParams(params, memoryRetrieveDiscoveryPatternTool.inputSchema);
    try {
      if (!memoryCoordinator) {
        throw new Error('Memory coordinator not initialized. Run memory_init first.');
      }

      const { domainName } = params;

      const coordinationParams = {
        type: 'read' as const,
        sessionId: 'discovery_patterns', // Using a fixed session ID for now
        target: domainName,
      };

      const result = await memoryCoordinator.coordinate(coordinationParams);

      return this.createResult(true, {
        message: `Discovery pattern for domain '${domainName}' retrieved successfully.`,
        pattern: result,
      });
    } catch (error) {
      return this.createResult(false, null, error.message);
    }
  }
}

export const memoryRetrieveDiscoveryPatternTool: AdvancedMCPTool = {
  name: 'memory_retrieve_discovery_pattern',
  description: 'Retrieve a discovery pattern from memory.',
  category: 'memory-neural',
  version: '1.0.0',
  permissions: [
    { type: 'read', resource: 'memory:discovery_patterns' },
  ],
  priority: 'medium',
  inputSchema: {
    type: 'object',
    properties: {
      domainName: { type: 'string' },
    },
    required: ['domainName'],
  },
  handler: new RetrieveDiscoveryPatternHandler(),
  metadata: {
    author: 'Gemini',
    tags: ['memory', 'discovery', 'learning'],
    examples: [
      {
        description: 'Retrieve a discovery pattern for a domain.',
        params: {
          domainName: 'my-new-domain',
        },
      },
    ],
    related: ['memory_store_discovery_pattern'],
    since: '2025-08-10',
  },
};

advancedToolRegistry.registerTool(memoryRetrieveDiscoveryPatternTool);

class FindSimilarDiscoveryPatternsHandler extends AdvancedToolHandler {
  async execute(params: any): Promise<AdvancedMCPToolResult> {
    this.validateParams(params, memoryFindSimilarDiscoveryPatternsTool.inputSchema);
    try {
      if (!memoryCoordinator) {
        throw new Error('Memory coordinator not initialized. Run memory_init first.');
      }

      const { pattern, similarityThreshold } = params;

      // This is a placeholder for getting all patterns.
      // A real implementation would need a way to list all stored patterns.
      const allPatternsRaw = await memoryCoordinator.coordinate({
          type: 'read',
          sessionId: 'discovery_patterns',
          target: '*' // Assuming a wildcard to get all patterns
      });

      // Assuming allPatternsRaw.data is an array of patterns
      const allPatterns = allPatternsRaw.data || [];


      const similarPatterns = allPatterns.filter(p => {
        const jaccardIndex = this.calculateJaccardIndex(pattern.files, p.files);
        return jaccardIndex >= similarityThreshold;
      });

      return this.createResult(true, {
        message: `Found ${similarPatterns.length} similar discovery patterns.`,
        patterns: similarPatterns,
      });
    } catch (error) {
      return this.createResult(false, null, error.message);
    }
  }

  private calculateJaccardIndex(set1: string[], set2: string[]): number {
    const intersection = new Set(set1.filter(x => new Set(set2).has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  }
}

export const memoryFindSimilarDiscoveryPatternsTool: AdvancedMCPTool = {
  name: 'memory_find_similar_discovery_patterns',
  description: 'Find similar discovery patterns in memory.',
  category: 'memory-neural',
  version: '1.0.0',
  permissions: [
    { type: 'read', resource: 'memory:discovery_patterns' },
  ],
  priority: 'medium',
  inputSchema: {
    type: 'object',
    properties: {
      pattern: {
        type: 'object',
        properties: {
          domainName: { type: 'string' },
          files: { type: 'array', items: { type: 'string' } },
          dependencies: { type: 'array', items: { type: 'string' } },
          confidenceScore: { type: 'number' },
        },
        required: ['domainName', 'files', 'dependencies', 'confidenceScore'],
      },
      similarityThreshold: { type: 'number', minimum: 0, maximum: 1, default: 0.5 },
    },
    required: ['pattern'],
  },
  handler: new FindSimilarDiscoveryPatternsHandler(),
  metadata: {
    author: 'Gemini',
    tags: ['memory', 'discovery', 'learning', 'pattern-matching'],
    examples: [
      {
        description: 'Find similar discovery patterns for a new domain.',
        params: {
          pattern: {
            domainName: 'my-new-domain',
            files: ['file1.ts', 'file2.ts'],
            dependencies: ['dependency1', 'dependency2'],
            confidenceScore: 0.8,
          },
          similarityThreshold: 0.7,
        },
      },
    ],
    related: ['memory_store_discovery_pattern', 'memory_retrieve_discovery_pattern'],
    since: '2025-08-10',
  },
};

advancedToolRegistry.registerTool(memoryFindSimilarDiscoveryPatternsTool);

class LogSwarmOperationHandler extends AdvancedToolHandler {
  async execute(params: any): Promise<AdvancedMCPToolResult> {
    this.validateParams(params, memoryLogSwarmOperationTool.inputSchema);
    try {
      if (!memoryCoordinator) {
        throw new Error('Memory coordinator not initialized. Run memory_init first.');
      }

      const { operation } = params;

      const coordinationParams = {
        type: 'write' as const,
        sessionId: 'swarm_operations', // Using a fixed session ID for now
        target: `${operation.domainName}-${Date.now()}`,
        metadata: { data: operation },
      };

      const decision = await memoryCoordinator.coordinate(coordinationParams);

      return this.createResult(true, {
        message: 'Swarm operation logged successfully.',
        decision,
      });
    } catch (error) {
      return this.createResult(false, null, error.message);
    }
  }
}

export const memoryLogSwarmOperationTool: AdvancedMCPTool = {
  name: 'memory_log_swarm_operation',
  description: 'Log a swarm operation for continuous learning.',
  category: 'memory-neural',
  version: '1.0.0',
  permissions: [
    { type: 'write', resource: 'memory:swarm_operations' },
  ],
  priority: 'medium',
  inputSchema: {
    type: 'object',
    properties: {
      operation: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['bugfix', 'feature', 'refactor'] },
          domainName: { type: 'string' },
          filesModified: { type: 'array', items: { type: 'string' } },
          outcome: { type: 'string', enum: ['success', 'failure'] },
        },
        required: ['type', 'domainName', 'filesModified', 'outcome'],
      },
    },
    required: ['operation'],
  },
  handler: new LogSwarmOperationHandler(),
  metadata: {
    author: 'Gemini',
    tags: ['memory', 'swarm', 'learning', 'logging'],
    examples: [
      {
        description: 'Log a successful bugfix operation.',
        params: {
          operation: {
            type: 'bugfix',
            domainName: 'my-new-domain',
            filesModified: ['file1.ts'],
            outcome: 'success',
          },
        },
      },
    ],
    related: ['memory_update_discovery_pattern_from_swarm_operation'],
    since: '2025-08-10',
  },
};

advancedToolRegistry.registerTool(memoryLogSwarmOperationTool);

class UpdateDiscoveryPatternFromSwarmOperationHandler extends AdvancedToolHandler {
  async execute(params: any): Promise<AdvancedMCPToolResult> {
    this.validateParams(
      params,
      memoryUpdateDiscoveryPatternFromSwarmOperationTool.inputSchema
    );
    try {
      if (!memoryCoordinator) {
        throw new Error('Memory coordinator not initialized. Run memory_init first.');
      }

      const { operation } = params;
      const { domainName, filesModified, outcome } = operation;

      // Retrieve the existing discovery pattern
      const existingPatternRaw = await memoryCoordinator.coordinate({
        type: 'read',
        sessionId: 'discovery_patterns',
        target: domainName,
      });

      const existingPattern = existingPatternRaw.data;

      if (!existingPattern) {
        throw new Error(`Discovery pattern for domain '${domainName}' not found.`);
      }

      // Update the discovery pattern based on the swarm operation
      if (outcome === 'success') {
        existingPattern.confidenceScore = Math.min(
          1,
          existingPattern.confidenceScore + 0.1
        );
        existingPattern.files = [
          ...new Set([...existingPattern.files, ...filesModified]),
        ];
      } else {
        existingPattern.confidenceScore = Math.max(
          0,
          existingPattern.confidenceScore - 0.1
        );
      }

      // Store the updated discovery pattern
      const coordinationParams = {
        type: 'write' as const,
        sessionId: 'discovery_patterns',
        target: domainName,
        metadata: { data: existingPattern },
      };

      const decision = await memoryCoordinator.coordinate(coordinationParams);

      return this.createResult(true, {
        message: `Discovery pattern for domain '${domainName}' updated successfully.`,
        decision,
      });
    } catch (error) {
      return this.createResult(false, null, error.message);
    }
  }
}

export const memoryUpdateDiscoveryPatternFromSwarmOperationTool: AdvancedMCPTool = {
  name: 'memory_update_discovery_pattern_from_swarm_operation',
  description: 'Update a discovery pattern based on a swarm operation.',
  category: 'memory-neural',
  version: '1.0.0',
  permissions: [
    { type: 'write', resource: 'memory:discovery_patterns' },
  ],
  priority: 'medium',
  inputSchema: {
    type: 'object',
    properties: {
      operation: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['bugfix', 'feature', 'refactor'] },
          domainName: { type: 'string' },
          filesModified: { type: 'array', items: { type: 'string' } },
          outcome: { type: 'string', enum: ['success', 'failure'] },
        },
        required: ['type', 'domainName', 'filesModified', 'outcome'],
      },
    },
    required: ['operation'],
  },
  handler: new UpdateDiscoveryPatternFromSwarmOperationHandler(),
  metadata: {
    author: 'Gemini',
    tags: ['memory', 'swarm', 'learning', 'update'],
    examples: [
      {
        description: 'Update a discovery pattern after a successful bugfix.',
        params: {
          operation: {
            type: 'bugfix',
            domainName: 'my-new-domain',
            filesModified: ['file1.ts'],
            outcome: 'success',
          },
        },
      },
    ],
    related: ['memory_log_swarm_operation'],
    since: '2025-08-10',
  },
};

advancedToolRegistry.registerTool(
  memoryUpdateDiscoveryPatternFromSwarmOperationTool
);

class ExportDiscoveryPatternsHandler extends AdvancedToolHandler {
  async execute(params: any): Promise<AdvancedMCPToolResult> {
    this.validateParams(params, memoryExportDiscoveryPatternsTool.inputSchema);
    try {
      if (!memoryCoordinator) {
        throw new Error('Memory coordinator not initialized. Run memory_init first.');
      }

      const { filePath } = params;

      // This is a placeholder for getting all patterns.
      // A real implementation would need a way to list all stored patterns.
      const allPatternsRaw = await memoryCoordinator.coordinate({
          type: 'read',
          sessionId: 'discovery_patterns',
          target: '*' // Assuming a wildcard to get all patterns
      });

      const allPatterns = allPatternsRaw.data || [];

      fs.writeFileSync(filePath, JSON.stringify(allPatterns, null, 2));

      return this.createResult(true, {
        message: `Successfully exported ${allPatterns.length} discovery patterns to ${filePath}.`,
      });
    } catch (error) {
      return this.createResult(false, null, error.message);
    }
  }
}

export const memoryExportDiscoveryPatternsTool: AdvancedMCPTool = {
  name: 'memory_export_discovery_patterns',
  description: 'Export all discovery patterns to a file.',
  category: 'memory-neural',
  version: '1.0.0',
  permissions: [
    { type: 'read', resource: 'memory:discovery_patterns' },
    { type: 'write', resource: 'filesystem' },
  ],
  priority: 'medium',
  inputSchema: {
    type: 'object',
    properties: {
      filePath: { type: 'string' },
    },
    required: ['filePath'],
  },
  handler: new ExportDiscoveryPatternsHandler(),
  metadata: {
    author: 'Gemini',
    tags: ['memory', 'discovery', 'learning', 'export'],
    examples: [
      {
        description: 'Export all discovery patterns to a JSON file.',
        params: {
          filePath: 'discovery-patterns.json',
        },
      },
    ],
    related: ['memory_store_discovery_pattern'],
    since: '2025-08-10',
  },
};

advancedToolRegistry.registerTool(memoryExportDiscoveryPatternsTool);

export default advancedToolRegistry;
