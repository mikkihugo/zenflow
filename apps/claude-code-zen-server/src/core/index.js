/**
 * Core Module - Clean Architecture Exports.
 *
 * Central export point for core system functionality with clean, focused architecture.
 * Replaces bloated "Unified" systems with single-responsibility components.
 */
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
// export { MemoryCoordinator } from './memory-coordinator'; // Module not found - use BrainCoordinator
// ==================== SHARED UTILITIES ====================
// Orchestrator functionality provided by multi-level-orchestration and teamwork packages via facades
// External systems - fallback
class SafeArtifactIntelligence {
    static create() {
        return new SafeArtifactIntelligence();
    }
}
export { SafeArtifactIntelligence };
class ExportSystem {
    static create() {
        return new ExportSystem();
    }
}
class ExportUtils {
    static format(data) {
        return JSON.stringify(data);
    }
}
export { ExportSystem, ExportUtils };
// Error handling - only export what exists in foundation
export { ConfigurationError, NetworkError, ResourceError, TimeoutError, ValidationError, } from '@claude-zen/foundation';
// Core utilities
// EventBus is available through facade pattern - use getEventSystem
// export { EventBus } from "@claude-zen/intelligence";
// InterfaceModeDetector not available - using facade pattern
// export { InterfaceModeDetector } from "@claude-zen/interfaces";
export { Orchestrator } from './orchestrator';
import { getLogger } from '@claude-zen/foundation';
const logger = getLogger('core-index');
// Project coordination functions for project switcher
export const initializeClaudeZen = () => {
    logger.info('Initializing Claude Zen core systems');
    return Promise.resolve();
};
export const shutdownClaudeZen = () => {
    logger.info('Shutting down Claude Zen core systems');
    return Promise.resolve();
};
