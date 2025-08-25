/**
 * @fileoverview Compatibility Layer Exports
 *
 * Re-exports compatibility utilities for backward compatibility
 * and migration helpers.
 */

// Export compatibility from main compatibility file
export * from '../compatibility';

// Add missing exports for index.ts compatibility
export class CompatibilityLayer {
  constructor(public version: string = '1.0.0') {}

  async migrate(from: string, to: string): Promise<void> {
    console.log(`Migrating from ${from} to ${to}`);
  }
}

export class MigrationHelper {
  static async migrateEvents(events: any[]): Promise<any[]> {
    return events.map((event) => ({ ...event, migrated: true }));
  }
}

export class LegacyEventAdapter {
  constructor(public adapterId: string) {}

  adapt(legacyEvent: any): any {
    return {
      ...legacyEvent,
      adapted: true,
      timestamp: new Date(),
    };
  }
}
