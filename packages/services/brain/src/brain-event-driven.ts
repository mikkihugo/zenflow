import { EventEmitter, getLogger } from '@claude-zen/foundation';

const logger = getLogger('brain-event-driven');

export interface BrainEventDrivenConfig {
  enableLogging?: boolean;
  enableTelemetry?: boolean;
}

export class BrainEventDriven extends EventEmitter {
  private initialized = false;
  private config: BrainEventDrivenConfig;

  constructor(config: BrainEventDrivenConfig = {}) {
    super();
    this.config = {
      enableLogging: true,
      enableTelemetry: false,
      ...config
    };
    
    if (this.config.enableLogging) {
      logger.info('BrainEventDriven initialized');
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    logger.info('Initializing BrainEventDriven...');
    this.initialized = true;
    this.emit('brain:initialized', { timestamp: Date.now() });
    logger.info('BrainEventDriven initialization complete');
  }

  async processEvent(eventType: string, eventData: unknown): Promise<void> {
    if (!this.initialized) await this.initialize();

    logger.info('Processing brain event', { eventType, eventData });
    
    // Emit processed event
    this.emit('brain:event:processed', {
      eventType,
      eventData,
      timestamp: Date.now(),
      status: 'success'
    });
  }

  async shutdown(): Promise<void> {
    logger.info('Shutting down BrainEventDriven...');
    this.emit('brain:shutdown', { timestamp: Date.now() });
    this.removeAllListeners();
    this.initialized = false;
    logger.info('BrainEventDriven shutdown complete');
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getConfig(): BrainEventDrivenConfig {
    return { ...this.config };
  }
}

export default BrainEventDriven;