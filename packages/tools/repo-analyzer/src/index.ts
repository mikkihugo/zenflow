import { DomainBoundaryValidator } from './domain/domain-boundary-validator.js';

export { DomainBoundaryValidator } from './domain/domain-boundary-validator.js';

// Simple EventEmitter for RepoAnalyzer
class EventEmitter {
  private events: Map<string, Function[]> = new Map();

  on(event: string, listener: Function) {
    const listeners = this.events.get(event) || [];
    listeners.push(listener);
    this.events.set(event, listeners);
    return this;
  }

  emit(event: string, ...args: any[]) {
    const listeners = this.events.get(event) || [];
    for (const listener of listeners) listener(...args);
    return listeners.length > 0;
  }

  off(event: string, listener?: Function) {
    if (!listener) {
      this.events.delete(event);
      return this;
    }
    const listeners = this.events.get(event) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
      this.events.set(event, listeners);
    }
    return this;
  }
}

export interface RepoAnalyzerConfig {
  rootPath: string;
  includePatterns?: string[];
  excludePatterns?: string[];
}

export class RepoAnalyzer extends EventEmitter {
  constructor(private config: RepoAnalyzerConfig) {
    super();
    this.emit('analyzer:initialized', { rootPath: config.rootPath, timestamp: new Date() });
  }

  async analyzeDomainBoundaries() {
    this.emit('analysis:domain:started', { rootPath: this.config.rootPath, timestamp: new Date() });
    
    try {
      const validator = new DomainBoundaryValidator();
      
      // Forward validator events
      validator.on('repository:validation:started', (data: any) => 
        this.emit('repository:validation:started', data));
      validator.on('repository:validation:completed', (data: any) => 
        this.emit('repository:validation:completed', data));
      validator.on('repository:validation:failed', (data: any) => 
        this.emit('repository:validation:failed', data));
      
      const result = await validator.validateRepository(this.config.rootPath);
      
      this.emit('analysis:domain:completed', { 
        rootPath: this.config.rootPath, 
        result, 
        timestamp: new Date() 
      });
      
      return result;
    } catch (error) {
      this.emit('analysis:domain:failed', { 
        rootPath: this.config.rootPath, 
        error, 
        timestamp: new Date() 
      });
      throw error;
    }
  }
}

export default RepoAnalyzer;