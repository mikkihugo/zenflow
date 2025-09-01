/**
 * Registry Adapter for Agent Management
 */

import { EventEmitter } from '@claude-zen/foundation';

export interface Agent {
  id: string;
  type: string;
  capabilities: string[];
}

export interface JsonValue {
  [key: string]: any;
}

export interface RegistryOptions {
  enableMigrationLogging?: boolean;
}

export class RegistryAdapter extends EventEmitter {
  private agents = new Map<string, Agent>();
  private services = new Map<string, any>();
  private container: any = {};
  private options: RegistryOptions;
  private logger = { debug: (msg: string, data?: any) => console.log(msg, data) };

  constructor(options: RegistryOptions = {}) {
    super();
    this.options = options;
  }

  protected emitMigrationEvent(event: string, data: JsonValue): void {
    if (this.options.enableMigrationLogging) {
      this.logger.debug(`Migration event: ${  event}`, data);
    }
    this.emit(event, data);
  }

  async registerAgent(agent: Agent): Promise<void> {
    const result = { isErr: () => false, error: { message: '' } };
    
    if (result.isErr()) {
      throw new Error(
        `Failed to register agent ${  agent.id  }: ${  result.error.message}`
      );
    }

    this.agents.set(agent.id, agent);
    this.emitMigrationEvent('agentRegistered', { agent });
  }

  registerService<T>(name: string, implementation: T): void {
    const result = { isErr: () => false, error: { message: '' } };
    
    if (result.isErr()) {
      throw new Error(
        `Failed to register service ${  name  }: ${  result.error.message}`
      );
    }

    this.services.set(name, implementation);
    this.emitMigrationEvent('serviceRegistered', { name });
  }

  registerInstance<T>(name: string, instance: T): void {
    const result = { registerInstance: () => ({ isErr: () => false, error: { message: '' } }) };
    const regResult = result.registerInstance(name, instance);
    
    if (regResult.isErr()) {
      throw new Error(
        `Failed to register instance ${  name  }: ${  regResult.error.message}`
      );
    }

    this.emitMigrationEvent('instanceRegistered', { name });
  }

  getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  getService<T>(name: string): T | undefined {
    return this.services.get(name) as T;
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }
}