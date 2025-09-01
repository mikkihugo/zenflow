/**
 * Core Module - Clean Architecture Exports.
 *
 * Central export point for core system functionality with clean, focused architecture.
 * Replaces bloated "Unified" systems with single-responsibility components.
 */

// ==================== CLEAN ARCHITECTURE SYSTEMS ====================
/**
 * @file Core mo"ule exports.
 */

// Fallback types for missing foundation exports
export interface ExporterDefinition {
  id: string;
  name: string;
}
export interface ExportOptions {
  format: string;
}
export interface ExportResult {
  success: boolean;
}
export interface InterfaceManagerConfig {
  mode: string;
}
export type InterfaceMode = 'auto' | ' cli' | ' web';
export interface InterfaceStats {
  connections: number;
}
// Document types not available in intelligence facade
// getDocumentProcessor not available in enterprise facade
// DocumentationManagerConfig, DocumentationStats moved from foundation
// Fallback management systems
export class DocumentationManager {
  static create() {
    return new DocumentationManager();
  }
}
export class ExportManager {
  static create() {
    return new ExportManager();
  }
}
export class InterfaceManager {
  static create() {
    return new InterfaceManager();
  }
}
// WorkflowDefinition, WorkflowEngineConfig, WorkflowState not available in intelligence facade
export type {
  SystemConfig as CoreSystemConfig,
  SystemStatus,
} from './core-system';
// Main system coordinator
export { System as CoreSystem } from './core-system';
// Memory types now available via @claude-zen/foundation package
// Memory functionality now available via @claude-zen/foundation Storage and getDatabaseAccess
// Core processing engines
// WorkflowEngine not available in enterprise facade

// ==================== LEGACY COMPATIBILITY ====================

export { ApplicationCoordinator } from './application-coordinator'; // Legacy - use CoreSystem

// Keep these for backward compatibility during transition
// DocumentDrivenSystem package not available // Moved to package - legacy compatibility
// export { MemoryCoordinator} from './memory-coordinator'; // Module not found - use BrainCoordinator

// ==================== SHARED UTILITIES ====================

// Orchestrator functionality provided by multi-level-orchestration and teamwork packages via facades
// External systems - fallback
class SafeArtifactIntelligence {
  static create() {
    return new SafeArtifactIntelligence();
  }
}
export { SafeArtifactIntelligence };
// ExportManager already exported above as UnifiedExportSystem
// Export utilities (legacy) - fallbacks
export interface ExportConfig {
  format: string;
}
export interface LegacyExportResult {
  success: boolean;
}
export interface LogMeta {
  timestamp: string;
}
class ExportSystem {
  static create() {
    return new ExportSystem();
  }
}
class ExportUtils {
  static format(_data: unknown) {
    return JSON.stringify(data);
  }
}
export { ExportSystem, ExportUtils };
// Types (re-export for convenience) - removed wildcard export to avoid conflicts
// Documentation utilities (legacy)
// CrossReference, DocumentationIndex not available in intelligence facade
// Legacy unified systems (still exported but deprecated)
// DocumentationIndex not available in intelligence facade
// Foundation exports (centralized imports)
export type { Logger } from '@claude-zen/foundation';
// Error handling - only export what exists in foundation
export {
  ConfigurationError,
  NetworkError,
  ResourceError,
  TimeoutError,
  ValidationError,
} from '@claude-zen/foundation';
// Core utilities
// EventBus is available through facade pattern - use getEventSystem
// export { EventBus} from "@claude-zen/intelligence";
// InterfaceModeDetector not available - using facade pattern
// export { InterfaceModeDetector} from "@claude-zen/interfaces";
export { Orchestrator } from './orchestrator';

import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('core-index');

// Project coordination functions for project switcher
export const initializeClaudeZen = (): Promise<void> => {
  logger.info('Initializing Claude Zen core systems');
  return Promise.resolve();
};

export const shutdownClaudeZen = (): Promise<void> => {
  logger.info('Shutting down Claude Zen core systems');
  return Promise.resolve();
};
