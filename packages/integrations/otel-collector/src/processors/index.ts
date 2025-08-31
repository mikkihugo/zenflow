/**
 * @fileoverview Processor Management System
 *
 * Manages telemetry data processors that transform, filter, and enrich
 * telemetry data before it's sent to exporters.
 */

import type { Logger} from '@claude-zen/foundation';
import { getLogger, TypedEventBase} from '@claude-zen/foundation';

import type { ProcessorConfig, TelemetryData} from '../types.js';

/**
 * Base processor interface
 */
export interface BaseProcessor {
  /**
   * Initialize the processor
   */
  initialize():Promise<void>;

  /**
   * Process telemetry data
   */
  process(data:TelemetryData): Promise<TelemetryData  |  null>;

  /**
   * Process batch of telemetry data
   */
  processBatch(dataItems:TelemetryData[]): Promise<TelemetryData[]>;

  /**
   * Shutdown the processor
   */
  shutdown():Promise<void>;

  /**
   * Get processor health status
   */
  getHealthStatus():Promise<{
    status:'healthy' | 'degraded' | 'unhealthy';
    lastProcessed?:number;
    lastError?:string;
}>;
}

/**
 * Processor manager for handling data transformations
 */
export class ProcessorManager extends TypedEventBase {
  private logger:Logger;
  private processors:Map<string, BaseProcessor> = new Map();
  private initialized = false;
  private isShuttingDown = false;
  private processedCount = 0;
  private lastProcessedTime = 0;
  private lastError:string  |  null = null;

  constructor() {
    super();
    this.logger = getLogger('ProcessorManager');
}

  /**
   * Initialize processor manager
   */
  async initialize(configs:ProcessorConfig[]): Promise<void> {
    if (this.initialized) return;

    try {
      for (const config of configs) {
        await this.addProcessor(config);
}

      this.initialized = true;
      this.logger.info('Processor manager initialized', {
        processorCount:this.processors.size,
});

      this.emit('initialized', { processorCount:this.processors.size});
} catch (error) {
      this.logger.error('Failed to initialize processor manager', error);
      throw error;
}
}

  /**
   * Add a processor
   */
  async addProcessor(config:ProcessorConfig): Promise<void> {
    if (this.processors.has(config.name)) {
      throw new Error(`Processor ${config.name} already exists`);
}

    const processor = await this.createProcessor(config);
    await processor.initialize();

    this.processors.set(config.name, processor);
    this.logger.info(`Added processor:${config.name}`);

    this.emit('processorAdded', { name:config.name, type:config.type});
}

  /**
   * Process telemetry data through all processors
   */
  async process(data:TelemetryData): Promise<TelemetryData  |  null> {
    if (!this.initialized  ||  this.isShuttingDown) {
      return data;
}

    let processedData:TelemetryData  |  null = data;

    try {
      // Process through each processor in order
      for (const [name, processor] of this.processors) {
        if (processedData === null) break;

        processedData = await processor.process(processedData);

        if (processedData === null) {
          this.logger.debug(`Data filtered out by processor:${name}`);
          break;
}
}

      this.processedCount++;
      this.lastProcessedTime = Date.now();
      this.lastError = null;

      return processedData;
} catch (error) {
      const errorMessage = String(error);
      this.lastError = errorMessage;
      this.logger.error('Processing failed', error);

      this.emit('processingError', { error:errorMessage, data});
      return data; // Return original data on error
}
}

  /**
   * Process batch of telemetry data
   */
  async processBatch(dataItems:TelemetryData[]): Promise<TelemetryData[]> {
    if (!this.initialized  ||  this.isShuttingDown) {
      return dataItems;
}

    let processedItems:TelemetryData[] = dataItems;

    try {
      // Process through each processor in order
      for (const [name, processor] of this.processors) {
        if (processedItems.length === 0) break;

        processedItems = await processor.processBatch(processedItems);

        if (processedItems.length === 0) {
          this.logger.debug(`All data filtered out by processor:${name}`);
          break;
}
}

      this.processedCount += processedItems.length;
      this.lastProcessedTime = Date.now();
      this.lastError = null;

      return processedItems;
} catch (error) {
      const errorMessage = String(error);
      this.lastError = errorMessage;
      this.logger.error('Batch processing failed', error);

      this.emit('processingError', { error:errorMessage, batch:dataItems});
      return dataItems; // Return original data on error
}
}

  /**
   * Get processor by name
   */
  getProcessor(name:string): BaseProcessor  |  undefined {
    return this.processors.get(name);
}

  /**
   * List all processors
   */
  listProcessors():string[] {
    return Array.from(this.processors.keys());
}

  /**
   * Remove a processor
   */
  async removeProcessor(name:string): Promise<boolean> {
    const processor = this.processors.get(name);
    if (!processor) return false;

    try {
      await processor.shutdown();
      this.processors.delete(name);
      this.logger.info(`Removed processor:${name}`);

      this.emit('processorRemoved', { name});
      return true;
} catch (error) {
      this.logger.error(`Failed to remove processor ${name}`, error);
      return false;
}
}

  /**
   * Get processor manager health status
   */
  async getHealthStatus():Promise<{
    status:'healthy' | ' degraded' | ' unhealthy';
    processorCount:number;
    lastProcessed?:number;
    lastError?:string;
    processors:Array<{
      name:string;
      status:'healthy' | ' degraded' | ' unhealthy';
}>;
}> {
    const processorStatuses = [];
    let overallStatus:'healthy' | ' degraded' | ' unhealthy' = ' healthy';

    // Check each processor
    for (const [name, processor] of this.processors) {
      try {
        const health = await processor.getHealthStatus();
        processorStatuses.push({ name, status:health.status});

        if (health.status === 'unhealthy') {
          overallStatus = 'unhealthy';
        } else if (
          health.status === 'degraded' && 
          overallStatus === 'healthy'
        ) {
          overallStatus = 'degraded';
        }
} catch (_error) {
        processorStatuses.push({ name, status: 'unhealthy'});
        overallStatus = 'unhealthy';
}
}

    // Check if there are any recent errors
    if (this.lastError) {
      overallStatus = overallStatus === 'healthy' ? ' degraded' :overallStatus;
}

    return {
      status:overallStatus,
      processorCount:this.processors.size,
      lastProcessed:this.lastProcessedTime  ||  undefined,
      lastError:this.lastError  ||  undefined,
      processors:processorStatuses,
};
}

  /**
   * Shutdown all processors
   */
  async shutdown():Promise<void> {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    const shutdownPromises = Array.from(this.processors.entries()).map(
      async ([name, processor]) => {
        try {
          await processor.shutdown();
          this.logger.debug(`Shut down processor:${name}`);
} catch (error) {
          this.logger.error(`Error shutting down processor ${name}`, error);
}
}
    );

    await Promise.allSettled(shutdownPromises);

    this.processors.clear();
    this.initialized = false;

    this.logger.info('Processor manager shut down', {
      totalProcessed:this.processedCount,
});

    this.emit('shutdown', { totalProcessed:this.processedCount});
}

  /**
   * Create processor instance based on config
   */
  private async createProcessor(
    config:ProcessorConfig
  ):Promise<BaseProcessor> {
    switch (config.type) {
      case 'batch':{
        const { BatchProcessor} = await import('./batch-processor.js');
        return new BatchProcessor(config);
}

      case 'filter':{
        const { FilterProcessor} = await import('./filter-processor.js');
        return new FilterProcessor(config);
}

      case 'transform':{
        const { TransformProcessor} = await import('./transform-processor.js');
        return new TransformProcessor(config);
}

      case 'sampler':{
        const { SamplerProcessor} = await import('./sampler-processor.js');
        return new SamplerProcessor(config);
}

      default:
        throw new Error(`Unknown processor type:${config.type}`);
}
}
}
