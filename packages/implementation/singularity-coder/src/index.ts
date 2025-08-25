/**
 * @fileoverview File-Aware AI Integration for claude-code-zen
 *
 * Combines CodeMesh's Rust/TypeScript hybrid architecture with claude-code-zen's'
 * LLM routing system for enterprise-grade file-aware AI capabilities.
 */

// Core exports
export * from './types/index';
export * from './core/codebase-analyzer';
export * from './core/file-aware-ai-engine';

// Integration exports
export * from './integration/code-mesh-bridge';

// Hardware detection exports
export * from './hardware/native-detector';

// Hardware detection types
export type {
  HardwareInfo,
  OptimizationStrategy,
} from './hardware/native-detector';

// Re-export from CodeMesh when available
export type {
  FileAwareRequest,
  FileAwareResponse,
  FileChange,
  FileInfo,
  SymbolReference,
  FileDependency,
  AnalyzedContext,
  FileAwareConfig,
} from './types/index';

/**
 * Main factory function for creating file-aware AI instances
 */
export {
  createFileAwareAI,
  createCodeMeshBridge,
} from './integration/code-mesh-bridge';

/**
 * Direct access to core components
 */
export { CodebaseAnalyzer } from './core/codebase-analyzer';
export { FileAwareAIEngine } from './core/file-aware-ai-engine';

/**
 * Version information
 */
export const VERSION = '1.0.0';

/**
 * Feature detection
 */
export const FEATURES = {
  RUST_CORE: true,
  TYPESCRIPT_CORE: true,
  WASM_SUPPORT: true,
  CODE_MESH_INTEGRATION: true,
  LLM_ROUTING_INTEGRATION: true,
  NATIVE_HARDWARE_DETECTION: true,
} as const;
