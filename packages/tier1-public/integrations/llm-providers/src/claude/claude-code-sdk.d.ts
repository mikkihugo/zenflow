/**
 * Type declarations for @anthropic-ai/claude-code/sdk.mjs
 *
 * This provides TypeScript type definitions for the Claude Code SDK
 * that's imported as a .mjs module.
 */

declare module '@anthropic-ai/claude-code/sdk.mjs' {
  export interface ClaudeCodeMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
  }

  export interface ClaudeCodeOptions {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    stream?: boolean;
    workingDirectory?: string;
    systemPrompt?: string;
    signal?: AbortSignal;
    canUseTool?: (
      toolName: string,
      params: Record<string, unknown>
    ) => Promise<{ allowed: boolean; reason?: string }>;
  }

  export interface ClaudeCodeResponse {
    message?: {
      content?: string;
    };
    result?: string;
  }

  export function query(
    messages: ClaudeCodeMessage[],
    options?: ClaudeCodeOptions
  ): Promise<ClaudeCodeResponse | ClaudeCodeResponse[]>;
}
