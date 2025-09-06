import { describe, it, expect } from 'vitest';
import { EXTENDED_EVENT_CATALOG, isExtendedEventName, getExtendedEventType } from '../../src/events/extended-event-catalog';
import { UNIFIED_EVENT_CATALOG } from '../../src/events/contracts';
import { EVENT_CATALOG } from '../../src/events/event-catalog';

// Basic regression test to ensure extended catalog merges core + unified domain events.
describe('EXTENDED_EVENT_CATALOG', () => {
  it('includes all core EVENT_CATALOG entries', () => {
    for (const name of Object.keys(EVENT_CATALOG)) {
      expect(EXTENDED_EVENT_CATALOG).toHaveProperty(name);
    }
  });

  it('includes all UNIFIED_EVENT_CATALOG entries', () => {
    for (const name of Object.keys(UNIFIED_EVENT_CATALOG)) {
      expect(EXTENDED_EVENT_CATALOG).toHaveProperty(name);
    }
  });

  it('type guard works for known events and rejects unknown', () => {
    const sample = Object.keys(EXTENDED_EVENT_CATALOG)[0];
    expect(isExtendedEventName(sample)).toBe(true);
    expect(isExtendedEventName('__not_an_event__')).toBe(false);
  });

  it('returns correct type string', () => {
    const sample = Object.keys(UNIFIED_EVENT_CATALOG)[0];
    if (!isExtendedEventName(sample)) throw new Error('sample should be valid');
    expect(getExtendedEventType(sample)).toBe(EXTENDED_EVENT_CATALOG[sample]);
  });
});
