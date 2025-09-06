/**
 * @fileoverview Event Module Factory (Foundation)
 *
 * Factory functions for creating standardized domain-specific event modules.
 */

import { EventBus, ok, err, Result } from '../../index.js';
import { BaseEventModule, type BaseEventModuleConfig, type IEventModule, validateEventModuleConfig } from './base-event-module.js';

export type { IEventModule };

export interface BrainModuleConfig extends Omit<BaseEventModuleConfig, 'supportedEvents'> {
  customEventPatterns?: string[];
  enableSafeWorkflows?: boolean;
  enableSparcIntegration?: boolean;
  enableDocumentIntelligence?: boolean;
  enableSagaWorkflows?: boolean;
}

export interface CoordinationModuleConfig extends Omit<BaseEventModuleConfig, 'supportedEvents'> {
  customEventPatterns?: string[];
  maxConcurrentTasks?: number;
  defaultOperationTimeout?: number;
  enableTaskMasterIntegration?: boolean;
  enableResourceAllocation?: boolean;
  enablePIPlanningCoordination?: boolean;
}

export interface CustomDomainModuleConfig extends BaseEventModuleConfig {
  domainName: string;
  customInitializer?: () => Promise<Result<void, Error>>;
  customShutdown?: () => Promise<Result<void, Error>>;
  customEventSetup?: (module: IEventModule) => void;
}

class BrainEventModule extends BaseEventModule {
  constructor(config: BrainModuleConfig, eventBus?: EventBus) {
    const fullConfig: BaseEventModuleConfig = {
      ...config,
      supportedEvents: [
        'brain:coordination:*',
        'brain:document-intelligence:*',
        'coordination:brain:*',
        'document-intelligence:brain:*',
        'brain:saga:*',
        'saga:brain:*',
        ...(config.customEventPatterns || []),
      ],
    };
  super(fullConfig, eventBus);
  }
  protected async initializeDomainModule(): Promise<Result<void, Error>> {
    try {
      return ok();
    } catch (error) {
      return err(new Error(`Brain domain initialization failed: ${error}`));
    }
  }
  protected async shutdownDomainModule(): Promise<Result<void, Error>> { return ok(); }
  protected setupEventForwarding(): void { /* no forwarding needed in brain module baseline */ }
}

class CoordinationEventModule extends BaseEventModule {
  constructor(config: CoordinationModuleConfig, eventBus?: EventBus) {
    const fullConfig: BaseEventModuleConfig = {
      ...config,
      supportedEvents: [
        'coordination:brain:*',
        'coordination:document-intelligence:*',
        'coordination:taskmaster:*',
        'coordination:resource:*',
        'coordination:safe:*',
        'coordination:sparc:*',
        'brain:coordination:*',
        'document-intelligence:coordination:*',
        'taskmaster:coordination:*',
        ...(config.customEventPatterns || []),
      ],
    };
  super(fullConfig, eventBus);
  }
  protected async initializeDomainModule(): Promise<Result<void, Error>> { return ok(); }
  protected async shutdownDomainModule(): Promise<Result<void, Error>> { return ok(); }
  protected setupEventForwarding(): void { /* no forwarding logic for coordination baseline */ }
}

class CustomDomainEventModule extends BaseEventModule {
  private readonly customConfig: CustomDomainModuleConfig;
  constructor(config: CustomDomainModuleConfig, eventBus?: EventBus) { super(config, eventBus); this.customConfig = config; }
  protected async initializeDomainModule(): Promise<Result<void, Error>> { return this.customConfig.customInitializer ? await this.customConfig.customInitializer() : ok(); }
  protected async shutdownDomainModule(): Promise<Result<void, Error>> { return this.customConfig.customShutdown ? await this.customConfig.customShutdown() : ok(); }
  protected setupEventForwarding(): void { if (this.customConfig.customEventSetup) { this.customConfig.customEventSetup(this); } }
}

export class EventModuleFactory {
  static createBrainModule(config: BrainModuleConfig, eventBus?: EventBus): Result<IEventModule, Error> {
    try {
      const validationResult = validateEventModuleConfig({ ...config, supportedEvents: ['brain:*'] });
      if (validationResult.isErr()) return err(validationResult.error);
      const module = new BrainEventModule(config, eventBus);
      return ok(module);
    } catch (error) { return err(new Error(`Failed to create Brain module: ${error}`)); }
  }
  static createCoordinationModule(config: CoordinationModuleConfig, eventBus?: EventBus): Result<IEventModule, Error> {
    try {
      const validationResult = validateEventModuleConfig({ ...config, supportedEvents: ['coordination:*'] });
      if (validationResult.isErr()) return err(validationResult.error);
      const module = new CoordinationEventModule(config, eventBus);
      return ok(module);
    } catch (error) { return err(new Error(`Failed to create Coordination module: ${error}`)); }
  }
  static createCustomModule(config: CustomDomainModuleConfig, eventBus?: EventBus): Result<IEventModule, Error> {
    try {
      const validationResult = validateEventModuleConfig(config);
      if (validationResult.isErr()) return err(validationResult.error);
      const module = new CustomDomainEventModule(config, eventBus);
      return ok(module);
    } catch (error) { return err(new Error(`Failed to create custom domain module: ${error}`)); }
  }
}

export function createBrainEventModule(config: BrainModuleConfig, eventBus?: EventBus): Result<IEventModule, Error> {
  return EventModuleFactory.createBrainModule(config, eventBus);
}
export function createCoordinationEventModule(config: CoordinationModuleConfig, eventBus?: EventBus): Result<IEventModule, Error> {
  return EventModuleFactory.createCoordinationModule(config, eventBus);
}

// Convenience helpers to mirror older API signatures in services
export function createDocumentIntelligenceEventModule(moduleId: string, version = '1.0.0'): IEventModule {
  const result = EventModuleFactory.createCustomModule({
    moduleId,
    moduleName: `Document Intelligence Service ${moduleId}`,
    version,
    supportedEvents: [
      'brain:document-intelligence:*',
      'document-intelligence:brain:*',
      'coordination:document-intelligence:*',
      'document-intelligence:coordination:*'
    ],
    domainName: 'document-intelligence'
  });
  if (result.isErr()) {
    // Fallback to a minimal module to avoid crashing callers
    throw result.error;
  }
  return result.value;
}

export { validateEventModuleConfig };
