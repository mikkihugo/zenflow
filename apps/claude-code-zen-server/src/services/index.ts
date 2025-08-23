/**
 * @file Services Layer - Business Logic and Application Services
 *
 * This layer contains high-level business logic that coordinates between
 * different domains and implements application-specific workflows.
 *
 * Architecture:
 * - Services depend ON database domain (correct direction)
 * - Services implement business logic and workflows
 * - Database domain provides data access only
 */

// Document Services
export { documentManager as DocumentManager } from './document/document-service';
export { adrManager as ADRManager } from './document/adr-service';
export { adrProposalSystem as ADRProposalSystem } from './document/adr-proposal-service';

// Coordination Services
export { hybridDocumentManager as HybridDocumentManager } from './coordination/hybrid-document-service';
export { adrManagerHybrid as ADRManagerHybrid } from './coordination/adr-hybrid-service';

// Service Factories
export { createHybridServices } from './factories/hybrid-service-factory';
export { createProductionServices } from './factories/production-service-factory';

// Re-export common types that services expose
export type {
  DocumentCreateOptions,
  DocumentQueryOptions,
  DocumentSearchOptions'

} from './document/document-service';

export type {
  ADRCreateOptions,
  ADRQueryOptions
} from './document/adr-service';
