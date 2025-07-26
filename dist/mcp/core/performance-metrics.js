/**
 * @fileoverview Performance metrics tracking for MCP server
 * Provides detailed monitoring and logging of server performance
 * @module PerformanceMetrics
 */

/**
 * Performance metrics collector and analyzer
 */
export class PerformanceMetrics {
  /**
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.enableLogging = options.enableLogging !== false;
    this.logInterval = options.logInterval || 30000; // 30 seconds
    this.metricsWindow = options.metricsWindow || 60000; // 1 minute window
    this.maxHistoryLength = options.maxHistoryLength || 1000;
    
    // Metrics storage
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        rate: 0,
        avgLatency: 0,
        p95Latency: 0,
        p99Latency: 0
      },
      batches: {
        total: 0,
        avgSize: 0,
        maxSize: 0,
        avgProcessingTime: 0
      },
      errors: {
        total: 0,
        rate: 0,
        byType: new Map(),
        recent: []
      },
      connection: {
        isHealthy: true,
        reconnects: 0,
        uptime: 0,
        lastHealthCheck: null
      },
      memory: {
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
        bufferSize: 0
      },
      throughput: {
        messagesPerSecond: 0,
        bytesPerSecond: 0,
        peakThroughput: 0
      }
    };
    
    // Historical data for trend analysis
    this.history = {
      latencies: [],
      throughput: [],
      errors: [],
      timestamps: []
    };
    
    // Internal tracking
    this.requestTimings = new Map();
    this.startTime = Date.now();
    this.lastLogTime = Date.now();
    this.lastThroughputCheck = Date.now();
    this.throughputCounter = 0;
    
    if (this.enableLogging) {
      this.startPeriodicLogging();
    }
  }

  /**
   * Record the start of a request
   * @param {string} requestId - Unique request identifier
   * @param {Object} context - Request context
   */
  recordRequestStart(requestId, context = {}) {
    this.requestTimings.set(requestId, {
      startTime: Date.now(),
      context
    });
  }

  /**
   * Record the completion of a request
   * @param {string} requestId - Unique request identifier
   * @param {boolean} success - Whether the request succeeded
   * @param {Object} result - Request result or error
   */
  recordRequestEnd(requestId, success, result = {}) {
    const timing = this.requestTimings.get(requestId);
    if (!timing) {
      console.warn(`[${new Date().toISOString()}] WARN [Metrics] No timing data for request: ${requestId}`);
      return;
    }
    
    const latency = Date.now() - timing.startTime;
    this.requestTimings.delete(requestId);
    
    // Update request metrics
    this.metrics.requests.total++;
    if (success) {
      this.metrics.requests.successful++;
    } else {
      this.metrics.requests.failed++;
      this.recordError(result.error || new Error('Unknown error'), timing.context);
    }
    
    // Update latency metrics
    this.updateLatencyMetrics(latency);
    
    // Update throughput
    this.throughputCounter++;
    this.updateThroughputMetrics();
    
    // Store in history for trend analysis
    this.addToHistory('latencies', latency);
  }

  /**
   * Record batch processing metrics
   * @param {number} batchSize - Size of the processed batch
   * @param {number} processingTime - Time taken to process the batch
   */
  recordBatchMetrics(batchSize, processingTime) {
    this.metrics.batches.total++;
    
    // Update average batch size
    this.metrics.batches.avgSize = 
      (this.metrics.batches.avgSize * (this.metrics.batches.total - 1) + batchSize) / 
      this.metrics.batches.total;
    
    // Update max batch size
    this.metrics.batches.maxSize = Math.max(this.metrics.batches.maxSize, batchSize);
    
    // Update average processing time
    this.metrics.batches.avgProcessingTime = 
      (this.metrics.batches.avgProcessingTime * (this.metrics.batches.total - 1) + processingTime) / 
      this.metrics.batches.total;
  }

  /**
   * Record error occurrence
   * @param {Error} error - The error that occurred
   * @param {Object} context - Error context
   */
  recordError(error, context = {}) {
    this.metrics.errors.total++;
    
    const errorType = error.constructor.name;
    const count = this.metrics.errors.byType.get(errorType) || 0;
    this.metrics.errors.byType.set(errorType, count + 1);
    
    // Add to recent errors
    this.metrics.errors.recent.push({
      type: errorType,
      message: error.message,
      timestamp: Date.now(),
      context
    });
    
    // Limit recent errors
    if (this.metrics.errors.recent.length > 50) {
      this.metrics.errors.recent = this.metrics.errors.recent.slice(-25);
    }
    
    // Add to history
    this.addToHistory('errors', {
      type: errorType,
      timestamp: Date.now()
    });
  }

  /**
   * Record connection event
   * @param {string} event - Event type (reconnect, disconnect, etc.)
   * @param {Object} details - Event details
   */
  recordConnectionEvent(event, details = {}) {
    switch (event) {
      case 'reconnect':
        this.metrics.connection.reconnects++;
        this.metrics.connection.isHealthy = true;
        break;
      case 'disconnect':
        this.metrics.connection.isHealthy = false;
        break;
      case 'healthcheck':
        this.metrics.connection.lastHealthCheck = Date.now();
        this.metrics.connection.isHealthy = details.healthy !== false;
        break;
    }
    
    this.metrics.connection.uptime = Date.now() - this.startTime;
  }

  /**
   * Update memory metrics
   * @param {number} bufferSize - Current buffer size
   */
  updateMemoryMetrics(bufferSize = 0) {
    const memUsage = process.memoryUsage();
    this.metrics.memory = {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      bufferSize
    };
  }

  /**
   * Update latency metrics including percentiles
   * @param {number} latency - Request latency in ms
   */
  updateLatencyMetrics(latency) {
    // Update average latency
    const total = this.metrics.requests.total;
    this.metrics.requests.avgLatency = 
      (this.metrics.requests.avgLatency * (total - 1) + latency) / total;
    
    // Calculate percentiles from recent latencies
    if (this.history.latencies.length > 0) {
      const sortedLatencies = [...this.history.latencies].sort((a, b) => a - b);
      const length = sortedLatencies.length;
      
      this.metrics.requests.p95Latency = sortedLatencies[Math.floor(length * 0.95)] || 0;
      this.metrics.requests.p99Latency = sortedLatencies[Math.floor(length * 0.99)] || 0;
    }
  }

  /**
   * Update throughput metrics
   */
  updateThroughputMetrics() {
    const now = Date.now();
    const elapsed = now - this.lastThroughputCheck;
    
    if (elapsed >= 1000) { // Update every second
      const messagesPerSecond = (this.throughputCounter * 1000) / elapsed;
      this.metrics.throughput.messagesPerSecond = messagesPerSecond;
      this.metrics.throughput.peakThroughput = Math.max(
        this.metrics.throughput.peakThroughput,
        messagesPerSecond
      );
      
      // Add to throughput history
      this.addToHistory('throughput', messagesPerSecond);
      
      // Reset counters
      this.throughputCounter = 0;
      this.lastThroughputCheck = now;
    }
    
    // Update rates
    const totalTime = (now - this.startTime) / 1000; // in seconds
    this.metrics.requests.rate = this.metrics.requests.total / totalTime;
    this.metrics.errors.rate = this.metrics.errors.total / totalTime;
  }

  /**
   * Add data point to history
   * @param {string} type - History type
   * @param {any} value - Value to add
   */
  addToHistory(type, value) {
    if (!this.history[type]) {
      this.history[type] = [];
    }
    
    this.history[type].push(value);
    this.history.timestamps.push(Date.now());
    
    // Limit history size
    if (this.history[type].length > this.maxHistoryLength) {
      this.history[type] = this.history[type].slice(-this.maxHistoryLength / 2);
      this.history.timestamps = this.history.timestamps.slice(-this.maxHistoryLength / 2);
    }
  }

  /**
   * Get current metrics snapshot
   * @returns {Object} Current metrics
   */
  getMetrics() {
    this.updateMemoryMetrics();
    this.updateThroughputMetrics();
    
    return {
      ...this.metrics,
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime
    };
  }

  /**
   * Get performance summary
   * @returns {Object} Performance summary
   */
  getPerformanceSummary() {
    const metrics = this.getMetrics();
    const uptime = Date.now() - this.startTime;
    
    return {
      overview: {
        uptime: uptime,
        totalRequests: metrics.requests.total,
        successRate: (metrics.requests.successful / metrics.requests.total) || 0,
        errorRate: metrics.errors.rate,
        avgLatency: metrics.requests.avgLatency,
        throughput: metrics.throughput.messagesPerSecond
      },
      performance: {
        p95Latency: metrics.requests.p95Latency,
        p99Latency: metrics.requests.p99Latency,
        peakThroughput: metrics.throughput.peakThroughput,
        avgBatchSize: metrics.batches.avgSize,
        avgBatchProcessingTime: metrics.batches.avgProcessingTime
      },
      health: {
        connectionHealthy: metrics.connection.isHealthy,
        memoryUsage: metrics.memory.heapUsed,
        errorRate: metrics.errors.rate,
        reconnects: metrics.connection.reconnects
      }
    };
  }

  /**
   * Get trending data for analysis
   * @param {number} windowMs - Time window in milliseconds
   * @returns {Object} Trending data
   */
  getTrends(windowMs = this.metricsWindow) {
    const cutoff = Date.now() - windowMs;
    const cutoffIndex = this.history.timestamps.findIndex(ts => ts >= cutoff);
    
    if (cutoffIndex === -1) {
      return { latencies: [], throughput: [], errors: [] };
    }
    
    return {
      latencies: this.history.latencies.slice(cutoffIndex),
      throughput: this.history.throughput.slice(cutoffIndex),
      errors: this.history.errors.slice(cutoffIndex),
      timestamps: this.history.timestamps.slice(cutoffIndex)
    };
  }

  /**
   * Start periodic performance logging
   */
  startPeriodicLogging() {
    setInterval(() => {
      const metrics = this.getMetrics();
      const summary = this.getPerformanceSummary();
      
      console.error(`[${new Date().toISOString()}] METRICS [Performance] Summary:`, {
        requests: `${summary.overview.totalRequests} total, ${(summary.overview.successRate * 100).toFixed(1)}% success`,
        latency: `${summary.overview.avgLatency.toFixed(1)}ms avg, ${summary.performance.p95Latency.toFixed(1)}ms p95`,
        throughput: `${summary.overview.throughput.toFixed(1)} msg/s (peak: ${summary.performance.peakThroughput.toFixed(1)})`,
        errors: `${summary.overview.errorRate.toFixed(2)} errors/s`,
        memory: `${(summary.health.memoryUsage / 1024 / 1024).toFixed(1)}MB heap`,
        uptime: `${(summary.overview.uptime / 1000 / 60).toFixed(1)}min`
      });
      
      // Log warning if performance is degraded
      if (summary.overview.errorRate > 1 || summary.overview.avgLatency > 1000) {
        console.error(`[${new Date().toISOString()}] WARN [Performance] Performance degradation detected`);
      }
      
    }, this.logInterval);
  }

  /**
   * Generate performance report
   * @returns {Object} Detailed performance report
   */
  generateReport() {
    const metrics = this.getMetrics();
    const summary = this.getPerformanceSummary();
    const trends = this.getTrends();
    
    return {
      timestamp: new Date().toISOString(),
      summary,
      detailed: metrics,
      trends: {
        averageLatencyTrend: this.calculateTrend(trends.latencies),
        throughputTrend: this.calculateTrend(trends.throughput),
        errorTrend: trends.errors.length
      },
      recommendations: this.generateRecommendations(summary)
    };
  }

  /**
   * Calculate trend direction
   * @param {Array} values - Values to analyze
   * @returns {string} Trend direction
   */
  calculateTrend(values) {
    if (values.length < 2) return 'insufficient_data';
    
    const recent = values.slice(-10);
    const older = values.slice(-20, -10);
    
    if (older.length === 0) return 'insufficient_data';
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    const change = (recentAvg - olderAvg) / olderAvg;
    
    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  /**
   * Generate performance recommendations
   * @param {Object} summary - Performance summary
   * @returns {Array} Recommendations
   */
  generateRecommendations(summary) {
    const recommendations = [];
    
    if (summary.overview.errorRate > 0.1) {
      recommendations.push({
        type: 'error_rate',
        severity: 'high',
        message: 'Error rate is elevated, investigate error causes'
      });
    }
    
    if (summary.overview.avgLatency > 500) {
      recommendations.push({
        type: 'latency',
        severity: 'medium',
        message: 'Average latency is high, consider optimizing message processing'
      });
    }
    
    if (summary.health.memoryUsage > 100 * 1024 * 1024) { // 100MB
      recommendations.push({
        type: 'memory',
        severity: 'medium',
        message: 'Memory usage is high, consider implementing memory cleanup'
      });
    }
    
    if (summary.performance.avgBatchSize < 5) {
      recommendations.push({
        type: 'batching',
        severity: 'low',
        message: 'Batch size is small, consider increasing batch size or timeout'
      });
    }
    
    return recommendations;
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metrics = {
      requests: { total: 0, successful: 0, failed: 0, rate: 0, avgLatency: 0, p95Latency: 0, p99Latency: 0 },
      batches: { total: 0, avgSize: 0, maxSize: 0, avgProcessingTime: 0 },
      errors: { total: 0, rate: 0, byType: new Map(), recent: [] },
      connection: { isHealthy: true, reconnects: 0, uptime: 0, lastHealthCheck: null },
      memory: { heapUsed: 0, heapTotal: 0, external: 0, bufferSize: 0 },
      throughput: { messagesPerSecond: 0, bytesPerSecond: 0, peakThroughput: 0 }
    };
    
    this.history = { latencies: [], throughput: [], errors: [], timestamps: [] };
    this.requestTimings.clear();
    this.startTime = Date.now();
    this.throughputCounter = 0;
    
    console.error(`[${new Date().toISOString()}] INFO [Metrics] Performance metrics reset`);
  }
}