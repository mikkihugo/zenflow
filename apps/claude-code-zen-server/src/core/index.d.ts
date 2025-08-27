/**
 * Core Module - Clean Architecture Exports.
 *
 * Central export point for core system functionality with clean, focused architecture.
 * Replaces bloated "Unified" systems with single-responsibility components.
 */
/**
 * @file Core mo"ule exports.
 */
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
export type InterfaceMode = 'auto' | 'cli' | 'web';
export interface InterfaceStats {
    connections: number;
}
export declare class DocumentationManager {
    static create(): DocumentationManager;
}
export declare class ExportManager {
    static create(): ExportManager;
}
export declare class InterfaceManager {
    static create(): InterfaceManager;
}
export type { SystemConfig as CoreSystemConfig, SystemStatus, } from './core-system';
export { System as CoreSystem } from './core-system';
export { ApplicationCoordinator } from './application-coordinator';
declare class SafeArtifactIntelligence {
    static create(): SafeArtifactIntelligence;
}
export { SafeArtifactIntelligence };
export interface ExportConfig {
    format: string;
}
export interface LegacyExportResult {
    success: boolean;
}
export interface LogMeta {
    timestamp: string;
}
declare class ExportSystem {
    static create(): ExportSystem;
}
declare class ExportUtils {
    static format(data: unknown): string;
}
export { ExportSystem, ExportUtils };
export type { Logger } from '@claude-zen/foundation';
export { ConfigurationError, NetworkError, ResourceError, TimeoutError, ValidationError, } from '@claude-zen/foundation';
export { Orchestrator } from './orchestrator';
export declare const initializeClaudeZen: () => Promise<void>;
export declare const shutdownClaudeZen: () => Promise<void>;
//# sourceMappingURL=index.d.ts.map