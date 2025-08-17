/**
 * Core Module - Clean Architecture Exports.
 *
 * Central export point for core system functionality with clean, focused architecture.
 * Replaces bloated "Unified" systems with single-responsibility components.
 */
/**
 * @file Core module exports.
 */
export type { WorkflowDefinition, WorkflowEngineConfig, WorkflowState, } from '../types/workflow-types';
export type { SystemConfig as CoreSystemConfig, SystemStatus, } from './core-system';
export { System as CoreSystem } from './core-system';
export type { Document, DocumentMetadata, DocumentProcessorConfig, DocumentStats, DocumentType, DocumentWorkspace, } from './document-processor';
export { DocumentProcessor } from './document-processor';
export type { DocumentationManagerConfig, DocumentationStats, } from './documentation-manager';
export { DocumentationManager } from './documentation-manager';
export type { ExporterDefinition, ExportOptions, ExportResult, } from './export-manager';
export { ExportSystem as ExportManager } from './export-manager';
export type { InterfaceManagerConfig, InterfaceMode, InterfaceStats, } from './interface-manager';
export { InterfaceManager } from './interface-manager';
export type { BackendStats, BackendType, JSONValue, MemoryConfig, StorageResult, } from './memory-system';
export { MemorySystem } from './memory-system';
export { WorkflowEngine } from '../workflows/workflow-engine';
export { ApplicationCoordinator } from './application-coordinator';
export { DocumentDrivenSystem } from './document-driven-system';
export type { CrossReference as DocumentLink, DocumentationIndex as DocumentIndex, } from './documentation-linker';
export { DocumentationIndex as DocumentationLinker } from './documentation-linker';
export { BaseClaudeZenError, type ErrorContext, FACTError, NetworkError, RAGError, SwarmError, SystemError, WASMError, } from './errors';
export { EventBus } from './event-bus';
export type { ExportConfig, ExportResult as LegacyExportResult, } from './exporters';
export { ExportSystem, ExportUtils } from './exporters';
export * from './helpers';
export { InterfaceModeDetector } from './interface-mode-detector';
export type { Logger, LoggerConfig, LogLevel } from './logger';
export { createLogger, Logger } from './logger';
export type { LogMeta } from './logger-old';
export { Orchestrator } from './orchestrator';
export * from './orchestrator-provider';
export { ProductFlowSystem } from './product-flow-system';
export * from './type-guards';
export * from './types';
//# sourceMappingURL=index.d.ts.map