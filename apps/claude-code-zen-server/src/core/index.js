/**
 * Core Module - Clean Architecture Exports.
 *
 * Central export point for core system functionality with clean, focused architecture.
 * Replaces bloated "Unified" systems with single-responsibility components.
 */
// Main system coordinator
export { System as CoreSystem } from './core-system';
export { DocumentProcessor } from './document-processor';
export { DocumentationManager } from './documentation-manager';
// Management systems
export { ExportSystem as ExportManager } from './export-manager';
export { InterfaceManager } from './interface-manager';
export { MemorySystem } from './memory-system';
// Core processing engines
export { WorkflowEngine } from '../workflows/workflow-engine';
// ==================== LEGACY COMPATIBILITY ====================
export { ApplicationCoordinator } from './application-coordinator'; // Legacy - use CoreSystem
// Keep these for backward compatibility during transition
export { DocumentDrivenSystem } from './document-driven-system'; // Legacy - use DocumentProcessor
// Error handling
export { BaseClaudeZenError, FACTError, NetworkError, RAGError, SwarmError, SystemError, WASMError, } from './errors';
// Core utilities
export { EventBus } from './event-bus';
export { ExportSystem, ExportUtils } from './exporters';
export * from './helpers';
export { InterfaceModeDetector } from './interface-mode-detector';
// Logging system
export { createLogger, Logger } from './logger';
export { Orchestrator } from './orchestrator';
export * from './orchestrator-provider';
// External systems
export { ProductFlowSystem } from './product-flow-system';
export * from './type-guards';
export * from './types';
//# sourceMappingURL=index.js.map