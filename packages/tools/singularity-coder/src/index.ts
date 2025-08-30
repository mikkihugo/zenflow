/**
 * @fileoverview File-Aware AI Integration for claude-code-zen
 *
 * Combines CodeMesh's Rust/TypeScript hybrid architecture with claude-code-zen' s') * LLM routing system for enterprise-grade file-aware AI capabilities.
 */

export * from './core/codebase-analyzer';
/**
 * Direct access to core components
 */
export { CodebaseAnalyzer } from './core/codebase-analyzer';
export * from './core/file-aware-ai-engine';
export { FileAwareAIEngine } from './core/file-aware-ai-engine';
// Hardware detection types
export type {
  HardwareInfo,
  OptimizationStrategy,
} from './hardware/native-detector';
// Hardware detection exports
export * from './hardware/native-detector';
// Integration exports
export * from './integration/code-mesh-bridge';

/**
 * Main factory function for creating file-aware AI instances
 */
export {
  createCodeMeshBridge,
  createFileAwareAI,
} from './integration/code-mesh-bridge';
// Re-export from CodeMesh when available
export type {
  AnalyzedContext,
  FileAwareConfig,
  FileAwareRequest,
  FileAwareResponse,
  FileChange,
  FileDependency,
  FileInfo,
  SymbolReference,
} from './types/index';
// Core exports
export * from './types/index';

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
