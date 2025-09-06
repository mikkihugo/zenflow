/**
 * @fileoverview Unified Event Contracts
 * 
 * Central export for all event contracts in the claude-code-zen system
 * Focus: Web interface primary creation, document intelligence for imports
 * Integrates with @claude-zen/foundation event registry
 */

// Brain ↔ Coordination contracts
export * from './brain-coordination.js';
export type {
  BrainCoordinationEventName,
  BrainCoordinationEventMap
} from './brain-coordination.js';

// Document Intelligence ↔ Coordination contracts (Import Focus)
export * from './document-intelligence-coordination.js';
export type {
  DocumentImportCoordinationEventName,
  DocumentImportCoordinationEventMap
} from './document-intelligence-coordination.js';

// Brain ↔ Document Intelligence contracts (Import Focus)
export * from './brain-document-intelligence.js';
export type {
  BrainDocumentImportEventName,
  BrainDocumentImportEventMap
} from './brain-document-intelligence.js';

// =============================================================================
// UNIFIED EVENT CATALOG
// =============================================================================

import { 
  BRAIN_COORDINATION_EVENT_CATALOG,
  type BrainCoordinationEventName,
  type BrainCoordinationEventMap
} from './brain-coordination.js';

import {
  DOCUMENT_IMPORT_COORDINATION_EVENT_CATALOG,
  type DocumentImportCoordinationEventName,
  type DocumentImportCoordinationEventMap
} from './document-intelligence-coordination.js';

import {
  BRAIN_DOCUMENT_IMPORT_EVENT_CATALOG,
  type BrainDocumentImportEventName,
  type BrainDocumentImportEventMap
} from './brain-document-intelligence.js';

/**
 * Unified event catalog combining all package event contracts
 * Focus: Web creation primary, document intelligence for imports
 * Extends foundation's EVENT_CATALOG
 */
export const UNIFIED_EVENT_CATALOG = {
  ...BRAIN_COORDINATION_EVENT_CATALOG,
  ...DOCUMENT_IMPORT_COORDINATION_EVENT_CATALOG,
  ...BRAIN_DOCUMENT_IMPORT_EVENT_CATALOG,
} as const;

/**
 * Union type of all unified event names
 */
export type UnifiedEventName = 
  | BrainCoordinationEventName
  | DocumentImportCoordinationEventName  
  | BrainDocumentImportEventName;

/**
 * Complete event map for type-safe handling across all packages
 */
export interface UnifiedEventMap extends
  BrainCoordinationEventMap,
  DocumentImportCoordinationEventMap,
  BrainDocumentImportEventMap {}

/**
 * Type guard for all unified events
 */
export function isUnifiedEvent(eventName: string): eventName is UnifiedEventName {
  return eventName in UNIFIED_EVENT_CATALOG;
}

/**
 * Get event type name from unified catalog
 */
export function getUnifiedEventType(eventName: UnifiedEventName): string {
  return UNIFIED_EVENT_CATALOG[eventName];
}