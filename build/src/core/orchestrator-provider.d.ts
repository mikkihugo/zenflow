/**
 * @file Orchestrator-provider implementation.
 */
import type { CoordinationProvider } from '../types/shared-types.ts';
import { Orchestrator } from './orchestrator.ts';
/**
 * Set the coordination provider (dependency injection)
 * This breaks the direct dependency on coordination module.
 *
 * @param provider
 * @example
 */
export declare function setCoordinationProvider(provider: CoordinationProvider): void;
/**
 * Factory function to create orchestrator with injected dependencies.
 *
 * @param customCoordinationProvider Optional coordination provider override.
 * @example
 */
export declare function createOrchestratorInstance(customCoordinationProvider?: CoordinationProvider): Orchestrator;
/**
 * Get or create orchestrator instance (singleton pattern).
 *
 * @deprecated Use createOrchestratorInstance for better dependency management.
 * @example
 */
export declare function getOrchestratorInstance(): Orchestrator;
export declare function setOrchestratorInstance(instance: Orchestrator): void;
//# sourceMappingURL=orchestrator-provider.d.ts.map