/**
 * @fileoverview Performance metrics tracking for MCP server;
 * Provides detailed monitoring and logging of server performance;
 * @module PerformanceMetrics
 */
/**
 * Performance metrics collector and analyzer
 */
export class PerformanceMetrics {
  /**
   * @param {Object} options - Configuration options
   */;
  constructor(options = {}) {
    this.enableLogging = options.enableLogging !== false;
    this.logInterval = options.logInterval  ?? 30000; // 30 seconds
    this.metricsWindow = options.metricsWindow  ?? 60000; // 1 minute window
    this.maxHistoryLength = options.maxHistoryLength  ?? 1000;

    // Metrics storage
    this.metrics = {
      requests = {latencies = new Map();
    this.startTime = Date.now();
    this.lastLogTime = Date.now();
    this.lastThroughputCheck = Date.now();
    this.throughputCounter = 0;

    if(this.enableLogging) {
      this.startPeriodicLogging();
    //     }
  //   }


  /**
   * Record the start of a request;
   * @param {string} requestId - Unique request identifier;
   * @param {Object} context - Request context
   */;
  recordRequestStart(requestId, _context = {}) {
    this.requestTimings.set(requestId, {
      startTime = {}) {
    const _timing = this.requestTimings.get(requestId);
    if(!timing) {
      console.warn(`[${new Date().toISOString()}] WARN [Metrics] No timing data forrequest = Date.now() - timing.startTime;
    this.requestTimings.delete(requestId);

    // Update request metrics
    this.metrics.requests.total++;
    if(success) {
      this.metrics.requests.successful++;
    } else {
      this.metrics.requests.failed++;
      this.recordError(result.error  ?? new Error('Unknown error'), timing.context);
    //     }


    // Update latency metrics
    this.updateLatencyMetrics(latency);

    // Update throughput
    this.throughputCounter++;
    this.updateThroughputMetrics();

    // Store in history for trend analysis
    this.addToHistory('latencies', latency);
  //   }


  /**
   * Record batch processing metrics;
   * @param {number} batchSize - Size of the processed batch;
   * @param {number} processingTime - Time taken to process the batch
   */;
  recordBatchMetrics(batchSize, processingTime) {
    this.metrics.batches.total++;

    // Update average batch size
    this.metrics.batches.avgSize = ;
      (this.metrics.batches.avgSize * (this.metrics.batches.total - 1) + batchSize) / ;
      this.metrics.batches.total;

    // Update max batch size
    this.metrics.batches.maxSize = Math.max(this.metrics.batches.maxSize, batchSize);

    // Update average processing time
    this.metrics.batches.avgProcessingTime = ;
      (this.metrics.batches.avgProcessingTime * (this.metrics.batches.total - 1) + processingTime) / ;
      this.metrics.batches.total;
  //   }


  /**
   * Record error occurrence;
   * @param {Error} error - The error that occurred;
   * @param {Object} context - Error context
   */;
  recordError(error, context = {}) {
    this.metrics.errors.total++;

    const _errorType = error.constructor.name;
    const _count = this.metrics.errors.byType.get(errorType)  ?? 0;
    this.metrics.errors.byType.set(errorType, count + 1);

    // Add to recent errors
    this.metrics.errors.recent.push({type = this.metrics.errors.recent.slice(-25);
    //     }


    // Add to history
    this.addToHistory('errors', {
      type = {}) {
    switch(event) {
      case 'reconnect':;
        this.metrics.connection.reconnects++;
        this.metrics.connection.isHealthy = true;
        break;
      case 'disconnect':;
        this.metrics.connection.isHealthy = false;
        break;
      case 'healthcheck':;
        this.metrics.connection.lastHealthCheck = Date.now();
        this.metrics.connection.isHealthy = details.healthy !== false;
        break;
    //     }


    this.metrics.connection.uptime = Date.now() - this.startTime;
  //   }


  /**
   * Update memory metrics;
   * @param {number} bufferSize - Current buffer size
   */;
  updateMemoryMetrics(bufferSize = 0) {

    this.metrics.memory = {heapUsed = this.metrics.requests.total;
    this.metrics.requests.avgLatency = ;
      (this.metrics.requests.avgLatency * (total - 1) + latency) / total;

    // Calculate percentiles from recent latencies
    if(this.history.latencies.length > 0) {
      const _sortedLatencies = [...this.history.latencies].sort((a, b) => a - b);
      const _length = sortedLatencies.length;

      this.metrics.requests.p95Latency = sortedLatencies[Math.floor(length * 0.95)]  ?? 0;
      this.metrics.requests.p99Latency = sortedLatencies[Math.floor(length * 0.99)]  ?? 0;
    //     }
  //   }


  /**
   * Update throughput metrics
   */;
  updateThroughputMetrics() {
    const _now = Date.now();
    const _elapsed = now - this.lastThroughputCheck;

    if(elapsed >= 1000) { // Update every second
      const _messagesPerSecond = (this.throughputCounter * 1000) / elapsed;
      this.metrics.throughput.messagesPerSecond = messagesPerSecond;
      this.metrics.throughput.peakThroughput = Math.max(;
        this.metrics.throughput.peakThroughput,
        messagesPerSecond;
      );

      // Add to throughput history
      this.addToHistory('throughput', messagesPerSecond);

      // Reset counters
      this.throughputCounter = 0;
      this.lastThroughputCheck = now;
    //     }


    // Update rates
    const _totalTime = (now - this.startTime) / 1000; // in seconds
    this.metrics.requests.rate = this.metrics.requests.total / totalTime;
    this.metrics.errors.rate = this.metrics.errors.total / totalTime;
  //   }


  /**
   * Add data point to history;
   * @param {string} type - History type;
   * @param {any} value - Value to add
   */;
  addToHistory(type, value) {
    if(!this.history[type]) {
      this.history[type] = [];
    //     }


    this.history[type].push(value);
    this.history.timestamps.push(Date.now());

    // Limit history size
    if(this.history[type].length > this.maxHistoryLength) {
      this.history[type] = this.history[type].slice(-this.maxHistoryLength / 2);
      this.history.timestamps = this.history.timestamps.slice(-this.maxHistoryLength / 2);
    //     }
  //   }


  /**
   * Get current metrics snapshot;
   * @returns {Object} Current metrics;
    // */; // LINT: unreachable code removed
  getMetrics() {
    this.updateMemoryMetrics();
    this.updateThroughputMetrics();

    return {
..this.metrics,timestamp = this.getMetrics();
    // const _uptime = Date.now() - this.startTime; // LINT: unreachable code removed

    return {overview = this.metricsWindow) {
    const _cutoff = Date.now() - windowMs;
    // const _cutoffIndex = this.history.timestamps.findIndex(ts => ts >= cutoff); // LINT: unreachable code removed

    if(cutoffIndex === -1) {
      return { latencies => {
      const _metrics = this.getMetrics();
    // const _summary = this.getPerformanceSummary(); // LINT: unreachable code removed

      console.error(`[${new Date().toISOString()}] METRICS [Performance]Summary = this.getMetrics();
    const __summary = this.getPerformanceSummary();

    return {timestamp = values.slice(-10);
    // const _older = values.slice(-20, -10); // LINT: unreachable code removed

    if (older.length === 0) return 'insufficient_data';
    // ; // LINT: unreachable code removed
    const _recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const _olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    const _change = (recentAvg - olderAvg) / olderAvg;

    if (change > 0.1) return 'increasing';
    // if (change < -0.1) return 'decreasing'; // LINT: unreachable code removed
    return 'stable';
    //   // LINT: unreachable code removed}

  /**
   * Generate performance recommendations;
   * @param {Object} summary - Performance summary;
   * @returns {Array} Recommendations;
    // */; // LINT: unreachable code removed
  generateRecommendations(summary) {
    const _recommendations = [];

    if(summary.overview.errorRate > 0.1) {
      recommendations.push({
        type = {requests = {latencies = Date.now();
    this.throughputCounter = 0;

    console.error(`[${new Date().toISOString()}] INFO [Metrics] Performance metrics reset`);
  //   }
// }

