/**
 * @fileoverview Claude SDK Types - Clean Type Definitions
 *
 * Extracted from oversized claude-sdk.ts for better maintainability.
 * Contains all Claude SDK type definitions without implementation logic.
 */

// =============================================================================
// Permission System Types
// =============================================================================

export type PermissionResult =
  | { allowed: true }
  | { allowed: false; reason: string };

export type CanUseTool = (
  toolName: string,
  params: Record<string, unknown>
) => Promise<PermissionResult>;

export type PermissionMode =
  || 'allow-all|deny-all'||interactive|custom'';

// =============================================================================
// MCP Server Configuration
// =============================================================================

export type McpServerConfig = {
  command: string;
  args: string[];
  env?: Record<string, string>;
};

// =============================================================================
// Claude SDK Configuration Types
// =============================================================================

export interface BaseClaudeCodeOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stream?: boolean;
  timeout?: number;
  workingDirectory?: string;
  cachePrompts?: boolean;
  systemPrompt?: string;
  contextWindow?: number;
  debug?: boolean;
}

export interface ClaudeSDKOptions extends BaseClaudeCodeOptions {
  permissionMode?: PermissionMode;
  customPermissionHandler?: CanUseTool;
  retries?: number;
  retryDelay?: number;
  enableCancellation?: boolean;
  mcpServers?: McpServerConfig[];
  logLevel?: 'debug|info|warn|error';
  outputFormat?: 'json|text|streaming';
  includeMetadata?: boolean;
  preserveHistory?: boolean;
  sessionId?: string;
  dangerouslySkipPermissions?: boolean;
}

// =============================================================================
// Claude Message Types
// =============================================================================

export interface ClaudeAssistantMessage {
  type: 'assistant';
  content: string;
  timestamp?: number;
  metadata?: {
    model?: string;
    tokens?: number;
    executionTime?: number;
    toolsUsed?: string[];
    sessionId?: string;
    messageId?: string;
  };
}

export interface ClaudeUserMessage {
  type: 'user';
  content: string;
  timestamp?: number;
  metadata?: {
    source?: string;
    priority?: 'low|medium|high';
    context?: Record<string, unknown>;
    attachments?: string[];
    sessionId?: string;
    messageId?: string;
  };
}

export interface ClaudeResultMessage {
  type: 'result';
  content: string;
  success: boolean;
  timestamp?: number;
  metadata?: {
    exitCode?: number;
    duration?: number;
    command?: string;
    output?: string;
    error?: string;
    sessionId?: string;
    messageId?: string;
  };
}

export interface ClaudeSystemMessage {
  type: 'system';
  content: string;
  timestamp?: number;
  metadata?: {
    level?: 'info|warn|error';
    source?: string;
    category?: string;
    sessionId?: string;
    messageId?: string;
  };
}

export type ClaudeMessage =|ClaudeAssistantMessage|ClaudeUserMessage|ClaudeResultMessage|ClaudeSystemMessage;

// =============================================================================
// Configuration Constants
// =============================================================================

export const DEFAULT_TIMEOUTS = {
  task: 1800000, // 30 minutes default for complex tasks
  stream: 1800000, // 30 minutes for streaming complex workflows
  retry: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
  },
} as const;

export const DEFAULT_SDK_OPTIONS: Omit<
  Required<ClaudeSDKOptions>,'customPermissionHandler'
> & { customPermissionHandler?: CanUseTool } = {
  model: 'claude-3-sonnet',
  maxTokens: 4096,
  temperature: 0.7,
  topP: 0.9,
  stream: false,
  timeout: DEFAULT_TIMEOUTS.task,
  workingDirectory: process.cwd(),
  cachePrompts: true,
  systemPrompt: '',
  contextWindow: 200000,
  debug: false,
  permissionMode: 'interactive',
  retries: DEFAULT_TIMEOUTS.retry.maxRetries,
  retryDelay: DEFAULT_TIMEOUTS.retry.baseDelay,
  enableCancellation: true,
  mcpServers: [],
  logLevel: 'info',
  outputFormat: 'text',
  includeMetadata: false,
  preserveHistory: true,
  sessionId: '',
  dangerouslySkipPermissions: false,
} as const;
