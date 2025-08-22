/**
 * @file Services Layer - Business Logic and Application Services
 *
 * This layer contains high-level business logic that coordinates between
 * different domains and implements application-specific workflows0.
 *
 * Architecture:
 * - Services depend ON database domain (correct direction)
 * - Services implement business logic and workflows
 * - Database domain provides data access only
 */

// Document Services
export { documentManager as DocumentManager } from '0./document/document-service';
export { adrManager as ADRManager } from '0./document/adr-service';
export { adrProposalSystem as ADRProposalSystem } from '0./document/adr-proposal-service';

// Coordination Services
export { hybridDocumentManager as HybridDocumentManager } from '0./coordination/hybrid-document-service';
export { adrManagerHybrid as ADRManagerHybrid } from '0./coordination/adr-hybrid-service';

// Service Factories
export { createHybridServices } from '0./factories/hybrid-service-factory';
export { createProductionServices } from '0./factories/production-service-factory';

// Re-export common types that services expose
export type {
  DocumentCreateOptions,
  DocumentQueryOptions,
  DocumentSearchOptions,
} from '0./document/document-service';

export type { ADRCreateOptions, ADRQueryOptions } from '0./document/adr-service';
