/**
 * @fileoverview CLI Provider Types
 *
 * Generic interfaces for integrating with various CLI tools (Claude Code, Gemini CLI, etc.)
 * Refactored to use foundation's Result pattern and proper error handling.
 */

import type { Result} from '@claude-zen/foundation';
import type {
  LiteralUnion,
  Merge,
  SetOptional,
} from '@claude-zen/foundation';

export interface CLIMessage {
  role: 'system' | 'user' | 'assistant';
  content:string;
}

export interface CLIRequest {
  messages:CLIMessage[];
  model?:LiteralUnion<'claude-3-5-sonnet' | ' gpt-4' | ' gemini-pro', string>;
  temperature?:number;
  maxTokens?:number;
  metadata?:Record<string, unknown>;
}

// Modern Result-based response using foundation's Result pattern
export interface CLIResponse {
  content:string;
  metadata?:Record<string, unknown>;
}

export interface CLIError {
  code:string;
  message:string;
  details?:Record<string, unknown>;
  cause?:Error;
}

// Type-safe Result pattern for CLI operations
export type CLIResult = Result<CLIResponse, CLIError>;

// Specialized CLI roles for swarm agents
export interface SwarmAgentRole {
  role:LiteralUnion<
    | 'assistant' | 'coder' | 'analyst' | 'researcher' | 'coordinator' | 'tester' | 'architect',
    string
  >;
  systemPrompt:string;
  capabilities:string[];
}

export interface CLIProviderCapabilities {
  models:string[];
  maxTokens:number;
  contextWindow:number;
  features:{
    fileOperations:boolean;
    webAccess:boolean;
    codeExecution:boolean;
    imageGeneration:boolean;
    multimodal:boolean;
    streaming:boolean;
    customTools:boolean;
    contextWindow:boolean;
    reasoning:boolean;
    coding:boolean;
    planning:boolean;
};
  pricing?:{
    inputTokens:number;
    outputTokens:number;
    currency:string;
};
}

// Configuration options using foundation's validated configuration
export interface CLIProviderConfig {
  timeout?:number;
  retries?:number;
  retryDelay?:number;
  maxTokens?:number;
  temperature?:number;
  metadata?:Record<string, unknown>;
}

// Generic CLI provider interface with Result pattern
export interface CLIProvider {
  readonly id:string;
  readonly name:string;

  getCapabilities():CLIProviderCapabilities;
  execute(request:CLIRequest): Promise<CLIResult>;

  // Role management with Result pattern
  setRole(roleName:string): Result<void, CLIError>;
  getRole():SwarmAgentRole | undefined;

  // Helper methods with Result pattern
  complete(
    prompt:string,
    options?:Partial<CLIRequest>
  ):Promise<Result<string, CLIError>>;
  executeTask(
    prompt:string,
    options?:Record<string, unknown>
  ):Promise<Result<unknown, CLIError>>;
  getUsageStats():{
    requestCount:number;
    lastRequestTime:number;
    currentRole?:string;
};
}

// CLI Provider Registry
export interface CLIProviderRegistry {
  register(provider:CLIProvider): void;
  unregister(providerId:string): void;
  get(providerId:string): CLIProvider | undefined;
  list():CLIProvider[];
  getByCapability(
    capability:keyof CLIProviderCapabilities['features']
  ):CLIProvider[];
}

// CLI Provider Factory
export interface CLIProviderFactory {
  createProvider(
    type:LiteralUnion<'claude-code' | ' gemini-cli' | ' cursor-cli', string>,
    options?:Record<string, unknown>
  ):CLIProvider;
  getSupportedTypes():string[];
}

// Type utilities for CLI providers with Result pattern support
export type OptionalCLIRequest = SetOptional<
  CLIRequest,
  'model' | 'temperature' | 'maxTokens' | 'metadata'
>;
export type MinimalCLIProvider = SetOptional<
  CLIProvider,
  'setRole' | 'getRole'
>;
export type CLIProviderWithDefaults = Merge<
  CLIProvider,
  { getCapabilities():Required<CLIProviderCapabilities>}
>;

// Validation schemas using foundation's Zod integration
export interface CLIValidationSchema {
  request:(request: unknown) => Result<CLIRequest, CLIError>;
  config:(config: unknown) => Result<CLIProviderConfig, CLIError>;
  role:(role: unknown) => Result<string, CLIError>;
}

// Error types for different CLI operations
export const CLI_ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',  TIMEOUT_ERROR: 'TIMEOUT_ERROR',  NETWORK_ERROR: 'NETWORK_ERROR',  AUTH_ERROR: 'AUTH_ERROR',  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',  MODEL_ERROR: 'MODEL_ERROR',  ROLE_ERROR: 'ROLE_ERROR',  UNKNOWN_ERROR: 'UNKNOWN_ERROR',} as const;

export type CLIErrorCode =
  (typeof CLI_ERROR_CODES)[keyof typeof CLI_ERROR_CODES];
