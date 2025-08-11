/**
 * Core Module - Clean Architecture Exports.
 *
 * Central export point for core system functionality with clean, focused architecture.
 * Replaces bloated "Unified" systems with single-responsibility components.
 */
/**
 * @file Core module exports.
 */
export type { WorkflowDefinition, WorkflowEngineConfig, WorkflowState, } from '../types/workflow-types.ts';
export type { SystemConfig as CoreSystemConfig, SystemStatus, } from './core-system.ts';
export { System as CoreSystem } from './core-system.ts';
export type { Document, DocumentMetadata, DocumentProcessorConfig, DocumentStats, DocumentType, DocumentWorkspace, } from './document-processor.ts';
export { DocumentProcessor } from './document-processor.ts';
export type { DocumentationManagerConfig, DocumentationStats, } from './documentation-manager.ts';
export { DocumentationManager } from './documentation-manager.ts';
export type { ExporterDefinition, ExportOptions, ExportResult, } from './export-manager.ts';
export { ExportSystem as ExportManager } from './export-manager.ts';
export type { InterfaceManagerConfig, InterfaceMode, InterfaceStats, } from './interface-manager.ts';
export { InterfaceManager } from './interface-manager.ts';
export type { BackendStats, BackendType, JSONValue, MemoryConfig, StorageResult, } from './memory-system.ts';
export { MemorySystem } from './memory-system.ts';
export { WorkflowEngine } from './workflow-engine.ts';
export { ApplicationCoordinator } from './application-coordinator.ts';
export { DocumentDrivenSystem } from './document-driven-system.ts';
export type { CrossReference as DocumentLink, DocumentationIndex as DocumentIndex, } from './documentation-linker.ts';
export { DocumentationIndex as DocumentationLinker } from './documentation-linker.ts';
export { BaseClaudeZenError, type ErrorContext, FACTError, NetworkError, RAGError, SwarmError, SystemError, WASMError, } from './errors.ts';
export { EventBus } from './event-bus.ts';
export type { ExportConfig, ExportResult as LegacyExportResult, } from './exporters.ts';
export { ExportSystem, ExportUtils } from './exporters.ts';
export * from './helpers.ts';
export { InterfaceModeDetector } from './interface-mode-detector.ts';
export type { ILogger, LoggerConfig, LogLevel } from './logger.ts';
export { createLogger, Logger } from './logger.ts';
export type { LogMeta } from './logger-old';
export { Orchestrator } from './orchestrator.ts';
export * from './orchestrator-provider.ts';
export { ProductFlowSystem } from './product-flow-system.ts';
export * from './type-guards.ts';
export * from './types.ts';
//# sourceMappingURL=index.d.ts.map