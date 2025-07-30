/**
 * @fileoverview MCP Tools Registry
 * Claude Zen CLI command tools for MCP protocol
 * @module MCPToolsRegistry
 */

import type { JSONSchema, ToolResult } from '../../types/mcp.js';

// =============================================================================
// TOOL HANDLER TYPES
// =============================================================================

/**
 * Tool handler function type
 */
export type ToolHandler = (args = > Promise<ToolResult | any>;

/**
 * Enhanced tool definition with handler
 */
export interface EnhancedTool {name = Record<string
, EnhancedTool>

/**
 * Tool category information
 */
export interface ToolCategory {name = ============================================================================
// CLAUDE ZEN CORE TOOLS
// =============================================================================

/**
 * Initialize Claude Zen core command tools
 * @returns Claude Zen command tool definitions
 */
export function initializeClaudeZenTools(): ToolRegistry {
  return {claude_zen_init = ============================================================================
// PRODUCT MANAGEMENT TOOLS
// =============================================================================

/**
 * Initialize Product Management tools for planning with queens
 * @returns Product management tool definitions
 */
export function initializeProductTools(): ToolRegistry {
  return {prd_create = ============================================================================
// NEURAL NETWORK TOOLS
// =============================================================================

/**
 * Neural inference result
 */
export interface NeuralInferenceResult {
  result => {
        if (!server?.neuralEngine) {
          return { status => {
        if (!server?.neuralEngine) {
          return {result = ============================================================================
// MEMORY MANAGEMENT TOOLS
// =============================================================================

/**
 * Initialize memory management tools
 * @returns Memory management tool definitions
 */
export function initializeMemoryTools(): ToolRegistry {
  return {memory_usage = ============================================================================
// AGENT MANAGEMENT TOOLS
// =============================================================================

/**
 * Initialize agent management tools
 * @returns Agent management tool definitions
 */
export function initializeAgentTools(): ToolRegistry {
  return {agent_list = ============================================================================
// TASK MANAGEMENT TOOLS
// =============================================================================

/**
 * Initialize task management tools
 * @returns Task management tool definitions
 */
export function initializeTaskTools(): ToolRegistry {
  return {task_status = ============================================================================
// SYSTEM TOOLS
// =============================================================================

/**
 * Initialize system tools
 * @returns System tool definitions
 */
export function initializeSystemTools(): ToolRegistry {
  return {features_detect = ============================================================================
// GIT TOOLS
// =============================================================================

/**
 * Initialize Git tools
 * @returns Git tool definitions
 */
export function initializeGitTools(): ToolRegistry {
  return gitTools;
}

// =============================================================================
// TOOL REGISTRY FUNCTIONS
// =============================================================================

/**
 * Combine all tool definitions into a single registry
 * @returns Complete tools registry
 */
export function initializeAllTools(): ToolRegistry {
  return {
    ...initializeClaudeZenTools(),
    ...initializeProductTools(),
    ...initializeNeuralTools(),
    ...initializeMemoryTools(),
    ...initializeAgentTools(),
    ...initializeTaskTools(),
    ...initializeSystemTools(),
    ...initializeGitTools(),
  };
}

/**
 * Get tool schema by name
 * @param toolName - Name of the tool
 * @returns Tool schema or null if not found
 */
export function getToolSchema(toolName = initializeAllTools();
return allTools[toolName] || null;
}

/**
 * Validate tool arguments against schema
 * @param toolName - Name of the tool
 * @param args - Arguments to validate
 * @returns Validation result
 */
export function validateToolArgs(toolName = getToolSchema(toolName);

if (!schema) {
  return {valid = schema.inputSchema.required || [];
  const properties = schema.inputSchema.properties || {};

  for (const field of required) {
    if (!(field in args)) {
      return {valid = properties[key] as JSONSchema;

      if (prop.enum && !prop.enum.includes(value)) {
        return {valid = === 'number' && typeof value !== 'number') {
        return {valid = === 'string' && typeof value !== 'string') {
        return {
          valid: false,
          error: `Invalid type for ${key}: expected string, got ${typeof value}`
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Get tool categories
 * @returns Array of tool categories
 */
export function getToolCategories(): ToolCategory[] {
  return [
    {
      name: 'claude-zen',
      description: 'Core Claude Zen operations',
      count: Object.keys(initializeClaudeZenTools()).length,
    },
    {
      name: 'product',
      description: 'Product management tools',
      count: Object.keys(initializeProductTools()).length,
    },
    {
      name: 'neural',
      description: 'Neural network operations',
      count: Object.keys(initializeNeuralTools()).length,
    },
    {
      name: 'memory',
      description: 'Memory management operations',
      count: Object.keys(initializeMemoryTools()).length,
    },
    {
      name: 'agent',
      description: 'Agent lifecycle management',
      count: Object.keys(initializeAgentTools()).length,
    },
    {
      name: 'task',
      description: 'Task orchestration and monitoring',
      count: Object.keys(initializeTaskTools()).length,
    },
    {
      name: 'system',
      description: 'System utilities and features',
      count: Object.keys(initializeSystemTools()).length,
    },
    {
      name: 'git',
      description: 'Git version control operations',
      count: Object.keys(initializeGitTools()).length,
    },
  ];
}
