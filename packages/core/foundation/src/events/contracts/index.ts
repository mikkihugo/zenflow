// NOTE: Imports must appear before export * declarations to satisfy eslint import/first rule
import { BRAIN_COORDINATION_EVENT_CATALOG } from './brain-coordination.js';
import { DOCUMENT_IMPORT_COORDINATION_EVENT_CATALOG } from './document-intelligence-coordination.js';
import { BRAIN_DOCUMENT_IMPORT_EVENT_CATALOG } from './brain-document-intelligence.js';

// Re-export domain event contracts (after imports to comply with lint rules)
export * from './brain-coordination.js';
export * from './document-intelligence-coordination.js';
export * from './brain-document-intelligence.js';

export const UNIFIED_EVENT_CATALOG = {
  ...BRAIN_COORDINATION_EVENT_CATALOG,
  ...DOCUMENT_IMPORT_COORDINATION_EVENT_CATALOG,
  ...BRAIN_DOCUMENT_IMPORT_EVENT_CATALOG,
} as const;

export type UnifiedEventName = keyof typeof UNIFIED_EVENT_CATALOG;

export function isUnifiedEvent(eventName: string): eventName is UnifiedEventName {
  return eventName in UNIFIED_EVENT_CATALOG;
}

export function getUnifiedEventType(eventName: UnifiedEventName): string {
  return UNIFIED_EVENT_CATALOG[eventName];
}
