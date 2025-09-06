/**
 * Extended Event Catalog
 * Merges the static core EVENT_CATALOG with UNIFIED_EVENT_CATALOG (domain contracts)
 * so editors (VSCode) can offer autocomplete for the full set of event names.
 *
 * This avoids introducing a circular dependency by keeping the merge in a separate file
 * (contracts import BaseEvent from event-catalog; event-catalog itself stays isolated).
 */
import { EVENT_CATALOG } from './event-catalog.js';
import { UNIFIED_EVENT_CATALOG } from './contracts/index.js';

export const EXTENDED_EVENT_CATALOG = {
  ...EVENT_CATALOG,
  ...UNIFIED_EVENT_CATALOG,
} as const;

export type ExtendedEventName = keyof typeof EXTENDED_EVENT_CATALOG;

export function isExtendedEventName(name: string): name is ExtendedEventName {
  return name in EXTENDED_EVENT_CATALOG;
}

export function getExtendedEventType(name: ExtendedEventName): string {
  return EXTENDED_EVENT_CATALOG[name];
}
