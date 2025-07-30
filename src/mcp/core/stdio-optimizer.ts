/**
 * @fileoverview Optimized stdio communication for MCP server;
 * Implements message batching, retry logic, and performance monitoring;
 * @module StdioOptimizer
 */

import { EventEmitter } from 'node:events';
/**
 * Optimized stdio communication handler for MCP protocol;
 * Provides batching, retry logic, and performance metrics
 */
export class StdioOptimizer extends EventEmitter {
  /**
   * @param {Object} options - Configuration options
   */
  constructor(options = {}): unknown {
    super();

    // Configuration
    this.batchSize = options.batchSize  ?? 10;
    this.batchTimeout = options.batchTimeout  ?? 50; // ms
    this.retryAttempts = options.retryAttempts  ?? 3;
    this.retryDelay = options.retryDelay  ?? 1000; // ms
    this.maxBufferSize = options.maxBufferSize  ?? 1024 * 1024; // 1MB
    
    // State
    this.messageBuffer = '';
    this.pendingMessages = [];
    this.batchTimer = null;
    this.isConnected = true;
    this.retryCount = 0;

    // Performance metrics
    this.metrics = {
      messagesProcessed,batchesProcessed = false;
    }
  console;
  .
  error(`[${new Date();
  .
  toISOString();
}
] INFO [StdioOptimizer] Initialized
with batchsize = Date.now();
try {
  // Add to buffer
  this.messageBuffer += data.toString();

  // Check buffer size
  if (this.messageBuffer.length > this.maxBufferSize) {
    this.metrics.bufferOverflows++;
    console.error(;
      `[${new Date().toISOString()}] WARN [StdioOptimizer] Buffer overflow, truncating`;
    );
    this.messageBuffer = this.messageBuffer.slice(-this.maxBufferSize / 2);
  }

  // Parse complete messages
  const _messages = this.parseMessages();

  if (messages.length > 0) {
    this.queueMessages(messages);
  }

  // Update metrics
  const _processingTime = Date.now() - startTime;
  this.updateMetrics(processingTime, messages.length);
} catch () {
  this.handleParsingError(error);
}
}
/**
   * Parse complete messages from buffer;
   * @returns {Array} Array of parsed messages;
    // */ // LINT: unreachable code removed
parseMessages()
{
  const _messages = [];
  const _lines = this.messageBuffer.split('\n');

  // Keep the last incomplete line in buffer
  this.messageBuffer = lines.pop()  ?? '';

  for (const line of lines) {
    const _trimmedLine = line.trim();
    if (!trimmedLine) continue;

    try {
        const _message = JSON.parse(trimmedLine);
        messages.push({
          message,receivedAt = this.batchSize) {
      this.processBatch();
    }
    else;
    if (!this.batchTimer) {
      // Set timer for batch timeout
      this.batchTimer = setTimeout(() => {
        this.processBatch();
      }, this.batchTimeout);
    }
  }

  /**
   * Process queued messages as a batch
   */;
  async;
  processBatch();
  {
    if (this.pendingMessages.length === 0) return;
    // ; // LINT: unreachable code removed
    const _batch = this.pendingMessages.splice(0, this.batchSize);
    this.clearBatchTimer();

    const _batchStartTime = Date.now();

    try {
      console.error(;
        `[${new Date().toISOString()}] DEBUG [StdioOptimizer] Processing batch of ${batch.length} messages`;
      );

      // Emit batch for processing
      this.emit('batch', batch);

      // Update batch metrics
      this.metrics.batchesProcessed++;
      const _batchTime = Date.now() - batchStartTime;
      this.metrics.totalProcessTime += batchTime;

      // Reset retry count on successful batch
      this.retryCount = 0;
    } catch () {
      console.error(`[${new Date().toISOString()}] ERROR [StdioOptimizer] Batch processingfailed = JSON.stringify(response) + '\n';

    for(let attempt = 0; attempt <= this.retryAttempts; attempt++) {
      try {
        await this.writeToStdout(responseStr);
        return true;
    // ; // LINT: unreachable code removed
      } catch () {
        this.metrics.retryAttempts++;

        if(attempt === this.retryAttempts) {
          console.error(`[${new Date().toISOString()}
      ] ERROR [StdioOptimizer] Failed to send response after $this.retryAttemptsattempts =>;
        if (!this.isConnected) {
          reject(new Error('Connection not available'));
          return;
    //   // LINT: unreachable code removed}

        const _success = process.stdout.write(data, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });

        if (!success) {
          // Wait for drain event
          process.stdout.once('drain', resolve);
        }
      }
      );

    /**
     * Handle batch processing errors with retry;
     * @param {Array} batch - Failed batch;
     * @param {Error} error - Error that occurred
     */;
    async;
    handleBatchError(batch, error);
    : unknown ;
    this.retryCount++;
    this.metrics.errorCount++

    if (this.retryCount <= this.retryAttempts) {
      console.error(;
        `[${new Date().toISOString()}] WARN [StdioOptimizer] Retrying batch (attempt ${this.retryCount}/${this.retryAttempts})`;
      );

      // Re-queue batch for retry with delay
      await this.delay(this.retryDelay * this.retryCount);
      this.pendingMessages.unshift(...batch);
      this.queueMessages([]);
    } else {
      console.error(;
        `[${new Date().toISOString()}] ERROR [StdioOptimizer] Batch failed permanently after ${this.retryAttempts} attempts`;
      );

      // Emit error for each message in failed batch
      for (const item of batch) {
        this.emit('error', error, item.message);
      }
    }

    /**
     * Handle connection errors;
     * @param {Error} error - Connection error
     */;
    handleConnectionError(error);
    : unknown ;
    console.error(`[$;
      new Date().toISOString();
    ] ERROR [StdioOptimizer] Connectionerror = false;
    this.metrics.errorCount++

    // Attempt to reconnect
    this.attemptReconnect();
  }

  /**
   * Handle connection close
   */;
  handleConnectionClose();
  console.error(`[${new Date().toISOString()}] WARN [StdioOptimizer] Connection closed`);
  this.isConnected = false;

  // Process remaining messages before shutdown
  if (this.pendingMessages.length > 0) {
    console.error(;
      `[${new Date().toISOString()}] INFO [StdioOptimizer] Processing ${this.pendingMessages.length} remaining messages`;
    );
    this.processBatch();
  }

  /**
   * Attempt to reconnect stdio
   */;
  async;
  attemptReconnect();
  for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
    console.error(;
      `[${new Date().toISOString()}] INFO [StdioOptimizer] Reconnection attempt ${attempt}/${this.retryAttempts}`;
    );

    await this.delay(this.retryDelay * attempt);

    try {
      // Test connection
      if (process.stdout.writable && process.stdin.readable) {
        this.isConnected = true;
        this.retryCount = 0;
        console.error(`[${new Date().toISOString()}] INFO [StdioOptimizer] Connection restored`);
        return;
    //   // LINT: unreachable code removed}
    } catch () 
      console.error(`[$new Date().toISOString()] WARN [StdioOptimizer] Reconnection attempt $attemptfailed = === 0) 
      console.error(`[$new Date().toISOString()
      ] WARN [StdioOptimizer] Clearing potentially corrupted buffer after $this.metrics.errorCounterrors`);
        this.messageBuffer = '';

  /**
   * Update performance metrics;
   * @param {number} processingTime - Processing time in ms;
   * @param {number} messageCount - Number of messages processed
   */;
  updateMetrics(processingTime, messageCount);
  : unknown;
      this.metrics.messagesProcessed += messageCount;
  this.metrics.lastProcessTime = processingTime

  // Update average latency
  if (this.metrics.messagesProcessed > 0) {
    this.metrics.averageLatency =;
      (this.metrics.averageLatency * (this.metrics.messagesProcessed - messageCount) +;
        processingTime * messageCount) /;
      this.metrics.messagesProcessed;
  }

  /**
   * Get performance metrics;
   * @returns {Object} Current metrics;
    // */; // LINT: unreachable code removed
  getMetrics();
  return {
      ...this.metrics,queueLength = null;
    // ; // LINT: unreachable code removed
  /**
   * Utility delay function;
   * @param {number} ms - Delay in milliseconds;
   * @returns {Promise<void>}
   */;
    // delay(ms); // LINT: unreachable code removed
  : unknown;
  return new Promise(resolve => setTimeout(resolve, ms));
    // ; // LINT: unreachable code removed
  /**
   * Graceful shutdown
   */;
  async;
  shutdown();
  console.error(`[$new Date().toISOString()] INFO [StdioOptimizer] Shutting down...`);

  // Process remaining messages
  this.clearBatchTimer();
  if (this.pendingMessages.length > 0) {
    await this.processBatch();
  }

  // Log final metrics
  console.error(;
    `[${new Date().toISOString()}] INFO [StdioOptimizer] Final metrics:`,
    this.getMetrics();
  );
}
