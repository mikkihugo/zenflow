/**
 * Core Module - Clean Architecture Exports.
 *
 * Central export point for core system functionality with clean, focused architecture.
 * Replaces bloated "Unified" systems with single-responsibility components.
 */
// Main system coordinator
export { System as CoreSystem } from './core-system.ts';
export { DocumentProcessor } from './document-processor.ts';
export { DocumentationManager } from './documentation-manager.ts';
// Management systems
export { ExportSystem as ExportManager } from './export-manager.ts';
export { InterfaceManager } from './interface-manager.ts';
export { MemorySystem } from './memory-system.ts';
// Core processing engines
export { WorkflowEngine } from './workflow-engine.ts';
// ==================== LEGACY COMPATIBILITY ====================
export { ApplicationCoordinator } from './application-coordinator.ts'; // Legacy - use CoreSystem
// Keep these for backward compatibility during transition
export { DocumentDrivenSystem } from './document-driven-system.ts'; // Legacy - use DocumentProcessor
// Error handling
export { BaseClaudeZenError, FACTError, NetworkError, RAGError, SwarmError, SystemError, WASMError, } from './errors.ts';
// Core utilities
export { EventBus } from './event-bus.ts';
export { ExportSystem, ExportUtils } from './exporters.ts';
export * from './helpers.ts';
export { InterfaceModeDetector } from './interface-mode-detector.ts';
// Logging system
export { createLogger, Logger } from './logger.ts';
export { Orchestrator } from './orchestrator.ts';
export * from './orchestrator-provider.ts';
// External systems
export { ProductFlowSystem } from './product-flow-system.ts';
export * from './type-guards.ts';
export * from './types.ts';
