/**
 * @fileoverview System Integrations Exports
 * 
 * Re-exports system integration utilities and helpers.
 */

// Export system integrations from main file
export * from '../system-integrations';

// Add missing exports for index.ts compatibility
export class SystemIntegration {
  constructor(public name: string) {}
  
  async initialize(): Promise<void> {
    // Implementation placeholder
  }
}

export function createSystemIntegration(name: string): SystemIntegration {
  return new SystemIntegration(name);
}

export class EventAdapter {
  constructor(public adapterType: string) {}
  
  adapt(event: any): any {
    return event;
  }
}

export class AdapterFactory {
  static create(type: string): EventAdapter {
    return new EventAdapter(type);
  }
}