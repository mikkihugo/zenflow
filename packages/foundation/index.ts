/**
 * @fileoverview Shared Library Index
 * 
 * Exports shared utilities for all zen-ai standalone libraries
 */

// Central logging system - foundation for entire ecosystem
export * from './logging';
export { getLogger, updateLoggingConfig, getLoggingConfig, validateLoggingEnvironment, LoggingLevel } from './logging';
export type { Logger, LoggingConfig } from './logging';

// Shared configuration system - ZEN environment variables
export * from './config';
export { 
  getSharedConfig, 
  getZenEnv, 
  isDebugMode, 
  areMetricsEnabled, 
  getStorageConfig, 
  getNeuralConfig,
  reloadSharedConfig,
  validateSharedConfig,
  configHelpers,
  ZEN_ENV_MAPPINGS
} from './config';
export type { SharedConfig, ZenConfigKey, ZenConfigValue } from './config';

// LLM provider with Claude Code SDK integration
export * from './llm-provider';
export { LLMProvider, getGlobalLLM, setGlobalLLM, SWARM_AGENT_ROLES } from './llm-provider';
export type { LLMMessage, LLMRequest, LLMResponse, SwarmAgentRole } from './llm-provider';

// Claude SDK integration - Centralized SDK access
export { 
  executeClaudeTask, 
  executeSwarmCoordinationTask,
  ClaudeTaskManager,
  getGlobalClaudeTaskManager,
  streamClaudeTask,
  executeParallelClaudeTasks,
  filterMessagesForClaudeCode
} from './claude-sdk';
export type { 
  ClaudeSDKOptions, 
  ClaudeMessage, 
  ClaudeAssistantMessage,
  ClaudeUserMessage,
  ClaudeResultMessage,
  ClaudeSystemMessage,
  PermissionResult,
  CanUseTool
} from './claude-sdk';

// Storage interfaces - Database wrapper for libs
export * from './storage';
export { 
  getDatabaseAccess, 
  getKVStore, 
  storage,
  StorageError,
  DatabaseConnectionError
} from './storage';
export type { 
  KeyValueStore, 
  DatabaseAccess,
  KeyValueStorage,
  AllStorageTypes,
  HybridStorage
} from './storage';

// Dependency Injection system - Foundation DI container
export * from './di/index';
export { DIContainer } from './di/container/di-container';
export { injectable, inject } from './di/decorators/injectable';
export { CORE_TOKENS, DATABASE_TOKENS, MEMORY_TOKENS, SWARM_TOKENS } from './di/tokens/core-tokens';
export type { 
  Constructor, 
  Provider,
  DIScope as Scope,
  DIToken as InjectionToken
} from './di/types/di-types';