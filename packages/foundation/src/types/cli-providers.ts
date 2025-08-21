/**
 * @fileoverview CLI Provider Types
 * 
 * Generic interfaces for integrating with various CLI tools (Claude Code, Gemini CLI, etc.)
 */

import type { LiteralUnion, SetOptional, Merge } from 'type-fest';

export interface CLIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CLIRequest {
  messages: CLIMessage[];
  model?: LiteralUnion<'claude-3-5-sonnet' | 'gpt-4' | 'gemini-pro', string>;
  temperature?: number;
  maxTokens?: number;
  metadata?: Record<string, unknown>;
}

export interface CLIResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost?: number;
  };
  metadata?: Record<string, unknown>;
}

// Specialized CLI roles for swarm agents
export interface SwarmAgentRole {
  role: LiteralUnion<'assistant' | 'coder' | 'analyst' | 'researcher' | 'coordinator' | 'tester' | 'architect', string>;
  systemPrompt: string;
  capabilities: string[];
}

export interface CLIProviderCapabilities {
  models: string[];
  defaultModel: string;
  maxContextTokens: number;
  maxOutputTokens: number;
  features: {
    structuredOutput: boolean;
    fileOperations: boolean;
    codebaseAware: boolean;
    streaming: boolean;
    systemPrompts: boolean;
    toolCalling: boolean;
  };
  routing: {
    priority: number;
    useForSmallContext: boolean;
    useForLargeContext: boolean;
    fallbackOrder: number;
  };
}

// Generic CLI provider interface
export interface CLIProvider {
  readonly id: string;
  readonly name: string;
  
  getCapabilities(): CLIProviderCapabilities;
  execute(request: CLIRequest): Promise<CLIResponse>;
  
  // Role management
  setRole(roleName: string): void;
  getRole(): SwarmAgentRole | undefined;
  
  // Helper methods
  complete(prompt: string, options?: Partial<CLIRequest>): Promise<string>;
  executeTask(prompt: string, options?: any): Promise<any>;
  getUsageStats(): { requestCount: number; lastRequestTime: number; currentRole?: string };
}

// CLI Provider Registry
export interface CLIProviderRegistry {
  register(provider: CLIProvider): void;
  unregister(providerId: string): void;
  get(providerId: string): CLIProvider | undefined;
  list(): CLIProvider[];
  getByCapability(capability: keyof CLIProviderCapabilities['features']): CLIProvider[];
}

// CLI Provider Factory
export interface CLIProviderFactory {
  createProvider(type: LiteralUnion<'claude-code' | 'gemini-cli' | 'cursor-cli', string>, options?: any): CLIProvider;
  getSupportedTypes(): string[];
}

// Type utilities for CLI providers
export type OptionalCLIRequest = SetOptional<CLIRequest, 'model' | 'temperature' | 'maxTokens' | 'metadata'>;
export type MinimalCLIProvider = SetOptional<CLIProvider, 'setRole' | 'getRole'>;
export type CLIProviderWithDefaults = Merge<CLIProvider, { getCapabilities(): Required<CLIProviderCapabilities> }>;