/**
 * @file Advanced MCP Tools Infrastructure.
 *
 * Provides the foundation for the 87 advanced MCP tools from claude-zen.
 * Extends the existing MCP infrastructure with enhanced capabilities.
 */
import type { MCPToolResult } from '../../coordination/swarm/mcp/types.ts';
export interface AdvancedMCPTool {
    readonly name: string;
    readonly description: string;
    readonly inputSchema: any;
    readonly handler: any;
    readonly category: MCPToolCategory;
    readonly version: string;
    readonly permissions: Permission[];
    readonly rateLimit?: RateLimit;
    readonly caching?: CachingPolicy;
    readonly priority: 'low' | 'medium' | 'high' | 'critical';
    readonly metadata: ToolMetadata;
}
export type MCPToolCategory = 'coordination' | 'monitoring' | 'memory-neural' | 'github-integration' | 'system' | 'orchestration';
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
    success: boolean;
    metadata?: {
        executionTime: number;
        cacheHit?: boolean;
        version: string;
        warnings?: string[];
    };
    metrics?: Record<string, number>;
}
export declare abstract class AdvancedToolHandler {
    abstract execute(params: any): Promise<AdvancedMCPToolResult>;
    protected validateParams(params: any, schema: any): void;
    protected createResult(success: boolean, content: any, error?: string, metadata?: any): AdvancedMCPToolResult;
}
export declare class AdvancedToolRegistry {
    private tools;
    private categoryIndex;
    private tagIndex;
    registerTool(tool: AdvancedMCPTool): void;
    getTool(name: string): AdvancedMCPTool | undefined;
    getToolsByCategory(category: MCPToolCategory): AdvancedMCPTool[];
    getToolsByTag(tag: string): AdvancedMCPTool[];
    getAllTools(): AdvancedMCPTool[];
    getToolCount(): number;
    getCategorySummary(): Record<MCPToolCategory, number>;
}
export declare const advancedToolRegistry: AdvancedToolRegistry;
export declare const memoryStoreDiscoveryPatternTool: AdvancedMCPTool;
export declare const memoryRetrieveDiscoveryPatternTool: AdvancedMCPTool;
export declare const memoryFindSimilarDiscoveryPatternsTool: AdvancedMCPTool;
export declare const memoryLogSwarmOperationTool: AdvancedMCPTool;
export declare const memoryUpdateDiscoveryPatternFromSwarmOperationTool: AdvancedMCPTool;
export declare const memoryExportDiscoveryPatternsTool: AdvancedMCPTool;
export default advancedToolRegistry;
//# sourceMappingURL=mcp-tools.d.ts.map