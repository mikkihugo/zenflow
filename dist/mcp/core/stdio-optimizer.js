/**
 * @fileoverview Optimized stdio communication for MCP server
 * Implements message batching, retry logic, and performance monitoring
 * @module StdioOptimizer
 */

import { EventEmitter } from 'events';

/**
 * Optimized stdio communication handler for MCP protocol
 * Provides batching, retry logic, and performance metrics
 */
export class StdioOptimizer extends EventEmitter {
  /**
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    super();
    
    // Configuration
    this.batchSize = options.batchSize || 10;
    this.batchTimeout = options.batchTimeout || 50; // ms
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 1000; // ms
    this.maxBufferSize = options.maxBufferSize || 1024 * 1024; // 1MB
    
    // State
    this.messageBuffer = '';
    this.pendingMessages = [];
    this.batchTimer = null;
    this.isConnected = true;
    this.retryCount = 0;
    
    // Performance metrics
    this.metrics = {
      messagesProcessed: 0,
      batchesProcessed: 0,
      averageLatency: 0,
      errorCount: 0,
      lastProcessTime: 0,
      totalProcessTime: 0,
      bufferOverflows: 0,
      retryAttempts: 0
    };
    
    this.setupStdioHandlers();
  }

  /**
   * Setup stdin/stdout handlers with optimization
   */
  setupStdioHandlers() {
    try {
      // Handle stdin data with buffering
      if (process.stdin && process.stdin.readable) {
        process.stdin.on('data', this.handleIncomingData.bind(this));
        process.stdin.on('error', this.handleConnectionError.bind(this));
        process.stdin.on('close', this.handleConnectionClose.bind(this));
      }
  
      // Handle connection errors
      if (process.stdout && process.stdout.writable) {
        process.stdout.on('error', this.handleConnectionError.bind(this));
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ERROR [StdioOptimizer] Failed to setup stdio handlers:`, error);
      this.isConnected = false;
    }
    
    console.error(`[${new Date().toISOString()}] INFO [StdioOptimizer] Initialized with batch size: ${this.batchSize}, timeout: ${this.batchTimeout}ms`);
  }

  /**
   * Handle incoming data with buffering and parsing
   * @param {Buffer} data - Incoming data
   */
  handleIncomingData(data) {
    const startTime = Date.now();
    
    try {
      // Add to buffer
      this.messageBuffer += data.toString();
      
      // Check buffer size
      if (this.messageBuffer.length > this.maxBufferSize) {
        this.metrics.bufferOverflows++;
        console.error(`[${new Date().toISOString()}] WARN [StdioOptimizer] Buffer overflow, truncating`);
        this.messageBuffer = this.messageBuffer.slice(-this.maxBufferSize / 2);
      }
      
      // Parse complete messages
      const messages = this.parseMessages();
      
      if (messages.length > 0) {
        this.queueMessages(messages);
      }
      
      // Update metrics
      const processingTime = Date.now() - startTime;
      this.updateMetrics(processingTime, messages.length);
      
    } catch (error) {
      this.handleParsingError(error);
    }
  }

  /**
   * Parse complete messages from buffer
   * @returns {Array} Array of parsed messages
   */
  parseMessages() {
    const messages = [];
    const lines = this.messageBuffer.split('\n');
    
    // Keep the last incomplete line in buffer
    this.messageBuffer = lines.pop() || '';
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      try {
        const message = JSON.parse(trimmedLine);
        messages.push({
          message,
          receivedAt: Date.now(),
          raw: trimmedLine
        });
      } catch (error) {
        console.error(`[${new Date().toISOString()}] WARN [StdioOptimizer] Invalid JSON message: ${trimmedLine.slice(0, 100)}...`);
        this.metrics.errorCount++;
      }
    }
    
    return messages;
  }

  /**
   * Queue messages for batch processing
   * @param {Array} messages - Messages to queue
   */
  queueMessages(messages) {
    this.pendingMessages.push(...messages);
    
    // Process immediately if batch size reached
    if (this.pendingMessages.length >= this.batchSize) {
      this.processBatch();
    } else if (!this.batchTimer) {
      // Set timer for batch timeout
      this.batchTimer = setTimeout(() => {
        this.processBatch();
      }, this.batchTimeout);
    }
  }

  /**
   * Process queued messages as a batch
   */
  async processBatch() {
    if (this.pendingMessages.length === 0) return;
    
    const batch = this.pendingMessages.splice(0, this.batchSize);
    this.clearBatchTimer();
    
    const batchStartTime = Date.now();
    
    try {
      console.error(`[${new Date().toISOString()}] DEBUG [StdioOptimizer] Processing batch of ${batch.length} messages`);
      
      // Emit batch for processing
      this.emit('batch', batch);
      
      // Update batch metrics
      this.metrics.batchesProcessed++;
      const batchTime = Date.now() - batchStartTime;
      this.metrics.totalProcessTime += batchTime;
      
      // Reset retry count on successful batch
      this.retryCount = 0;
      
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ERROR [StdioOptimizer] Batch processing failed:`, error);
      await this.handleBatchError(batch, error);
    }
    
    // Continue processing if more messages pending
    if (this.pendingMessages.length > 0) {
      this.queueMessages([]);
    }
  }

  /**
   * Send response with retry logic
   * @param {Object} response - Response to send
   * @returns {Promise<boolean>} Success status
   */
  async sendResponse(response) {
    const responseStr = JSON.stringify(response) + '\n';
    
    for (let attempt = 0; attempt <= this.retryAttempts; attempt++) {
      try {
        await this.writeToStdout(responseStr);
        return true;
        
      } catch (error) {
        this.metrics.retryAttempts++;
        
        if (attempt === this.retryAttempts) {
          console.error(`[${new Date().toISOString()}] ERROR [StdioOptimizer] Failed to send response after ${this.retryAttempts} attempts:`, error);
          return false;
        }
        
        console.error(`[${new Date().toISOString()}] WARN [StdioOptimizer] Send attempt ${attempt + 1} failed, retrying in ${this.retryDelay}ms...`);
        await this.delay(this.retryDelay * Math.pow(2, attempt)); // Exponential backoff
      }
    }
    
    return false;
  }

  /**
   * Write to stdout with error handling
   * @param {string} data - Data to write
   * @returns {Promise<void>}
   */
  writeToStdout(data) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('Connection not available'));
        return;
      }
      
      const success = process.stdout.write(data, (error) => {
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
    });
  }

  /**
   * Handle batch processing errors with retry
   * @param {Array} batch - Failed batch
   * @param {Error} error - Error that occurred
   */
  async handleBatchError(batch, error) {
    this.retryCount++;
    this.metrics.errorCount++;
    
    if (this.retryCount <= this.retryAttempts) {
      console.error(`[${new Date().toISOString()}] WARN [StdioOptimizer] Retrying batch (attempt ${this.retryCount}/${this.retryAttempts})`);
      
      // Re-queue batch for retry with delay
      await this.delay(this.retryDelay * this.retryCount);
      this.pendingMessages.unshift(...batch);
      this.queueMessages([]);
      
    } else {
      console.error(`[${new Date().toISOString()}] ERROR [StdioOptimizer] Batch failed permanently after ${this.retryAttempts} attempts`);
      
      // Emit error for each message in failed batch
      for (const item of batch) {
        this.emit('error', error, item.message);
      }
    }
  }

  /**
   * Handle connection errors
   * @param {Error} error - Connection error
   */
  handleConnectionError(error) {
    console.error(`[${new Date().toISOString()}] ERROR [StdioOptimizer] Connection error:`, error);
    this.isConnected = false;
    this.metrics.errorCount++;
    
    // Attempt to reconnect
    this.attemptReconnect();
  }

  /**
   * Handle connection close
   */
  handleConnectionClose() {
    console.error(`[${new Date().toISOString()}] WARN [StdioOptimizer] Connection closed`);
    this.isConnected = false;
    
    // Process remaining messages before shutdown
    if (this.pendingMessages.length > 0) {
      console.error(`[${new Date().toISOString()}] INFO [StdioOptimizer] Processing ${this.pendingMessages.length} remaining messages`);
      this.processBatch();
    }
  }

  /**
   * Attempt to reconnect stdio
   */
  async attemptReconnect() {
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      console.error(`[${new Date().toISOString()}] INFO [StdioOptimizer] Reconnection attempt ${attempt}/${this.retryAttempts}`);
      
      await this.delay(this.retryDelay * attempt);
      
      try {
        // Test connection
        if (process.stdout.writable && process.stdin.readable) {
          this.isConnected = true;
          this.retryCount = 0;
          console.error(`[${new Date().toISOString()}] INFO [StdioOptimizer] Connection restored`);
          return;
        }
      } catch (error) {
        console.error(`[${new Date().toISOString()}] WARN [StdioOptimizer] Reconnection attempt ${attempt} failed:`, error);
      }
    }
    
    console.error(`[${new Date().toISOString()}] ERROR [StdioOptimizer] Failed to restore connection after ${this.retryAttempts} attempts`);
    this.emit('connectionLost');
  }

  /**
   * Handle parsing errors
   * @param {Error} error - Parsing error
   */
  handleParsingError(error) {
    console.error(`[${new Date().toISOString()}] ERROR [StdioOptimizer] Message parsing failed:`, error);
    this.metrics.errorCount++;
    
    // Clear corrupted buffer if error persists
    if (this.metrics.errorCount % 10 === 0) {
      console.error(`[${new Date().toISOString()}] WARN [StdioOptimizer] Clearing potentially corrupted buffer after ${this.metrics.errorCount} errors`);
      this.messageBuffer = '';
    }
  }

  /**
   * Update performance metrics
   * @param {number} processingTime - Processing time in ms
   * @param {number} messageCount - Number of messages processed
   */
  updateMetrics(processingTime, messageCount) {
    this.metrics.messagesProcessed += messageCount;
    this.metrics.lastProcessTime = processingTime;
    
    // Update average latency
    if (this.metrics.messagesProcessed > 0) {
      this.metrics.averageLatency = 
        (this.metrics.averageLatency * (this.metrics.messagesProcessed - messageCount) + 
         processingTime * messageCount) / this.metrics.messagesProcessed;
    }
  }

  /**
   * Get performance metrics
   * @returns {Object} Current metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      queueLength: this.pendingMessages.length,
      bufferSize: this.messageBuffer.length,
      isConnected: this.isConnected,
      retryCount: this.retryCount,
      uptime: process.uptime()
    };
  }

  /**
   * Clear batch timer
   */
  clearBatchTimer() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
  }

  /**
   * Utility delay function
   * @param {number} ms - Delay in milliseconds
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.error(`[${new Date().toISOString()}] INFO [StdioOptimizer] Shutting down...`);
    
    // Process remaining messages
    this.clearBatchTimer();
    if (this.pendingMessages.length > 0) {
      await this.processBatch();
    }
    
    // Log final metrics
    console.error(`[${new Date().toISOString()}] INFO [StdioOptimizer] Final metrics:`, this.getMetrics());
  }
}