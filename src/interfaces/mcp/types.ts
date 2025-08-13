/**
 * @file MCP Types.
 *
 * Common types used by MCP tools and registry to avoid circular dependencies.
 */

/**
 * MCP Tool interface.
 *
 * @example
 */
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: unknown;
  handler: (params: unknown) => Promise<unknown>;
  category: string;
  version: string;
  priority: number;
  metadata: {
    tags: string[];
    examples: unknown[];
  };
  permissions: Array<{ type: string; resource: string }>;
}
