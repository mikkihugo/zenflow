/**
 * Performance Monitor Plugin
 * Real-time performance monitoring, metrics collection, and analysis
 */

import { EventEmitter } from 'events';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import os from 'os';
import v8 from 'v8';

export class PerformanceMonitorPlugin extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      metricsInterval: 1000, // Collect metrics every second
      historyLimit: 3600, // Keep 1 hour of history
      alertThresholds: {
        cpuUsage: 80,
        memoryUsage: 85,
        eventLoopDelay: 100,
        gcFrequency: 10,
        errorRate: 5
      },
      persistence: {
        enabled: true,
        path: path.join(process.cwd(), '.hive-mind', 'performance'),
        interval: 60000 // Save every minute
      },
      aggregation: {
        enabled: true,
        intervals: ['1m', '5m', '15m', '1h']
      },
      ...config
    };
    
    this.metrics = {
      system: [],
      process: [],
      custom: new Map()
    };
    
    this.aggregated = new Map();
    this.alerts = [];
    this.collectors = new Map();
    this.timers = new Map();
    this.counters = new Map();
    this.gauges = new Map();
    this.histograms = new Map();
    
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.persistenceInterval = null;
    
    // Performance observer for async operations
    this.performanceObserver = null;
  }

  async initialize() {
    console.log('📊 Performance Monitor Plugin initialized');
    
    // Create persistence directory
    if (this.config.persistence.enabled) {
      await mkdir(this.config.persistence.path, { recursive: true });
    }
    
    // Initialize collectors
    await this.initializeCollectors();
    
    // Load historical data
    await this.loadHistoricalData();
    
    // Start monitoring
    await this.startMonitoring();
    
    // Set up performance observer
    this.setupPerformanceObserver();
  }

  async initializeCollectors() {
    // System metrics collector
    this.collectors.set('system', async () => {
      const cpus = os.cpus();
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const loadAverage = os.loadavg();
      
      // Calculate CPU usage
      const cpuUsage = this.calculateCPUUsage(cpus);
      
      return {
        timestamp: Date.now(),
        cpu: {
          usage: cpuUsage,
          count: cpus.length,
          model: cpus[0]?.model,
          speed: cpus[0]?.speed
        },
        memory: {
          total: totalMemory,
          free: freeMemory,
          used: totalMemory - freeMemory,
          percentage: ((totalMemory - freeMemory) / totalMemory) * 100
        },
        loadAverage: {
          '1m': loadAverage[0],
          '5m': loadAverage[1],
          '15m': loadAverage[2]
        },
        uptime: os.uptime()
      };
    });

    // Process metrics collector
    this.collectors.set('process', async () => {
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      const resourceUsage = process.resourceUsage ? process.resourceUsage() : {};
      
      // V8 heap statistics
      const heapStats = v8.getHeapStatistics();
      const heapSpaceStats = v8.getHeapSpaceStatistics();
      
      return {
        timestamp: Date.now(),
        memory: {
          rss: memoryUsage.rss,
          heapTotal: memoryUsage.heapTotal,
          heapUsed: memoryUsage.heapUsed,
          external: memoryUsage.external,
          arrayBuffers: memoryUsage.arrayBuffers || 0
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system
        },
        heap: {
          totalHeapSize: heapStats.total_heap_size,
          usedHeapSize: heapStats.used_heap_size,
          heapSizeLimit: heapStats.heap_size_limit,
          mallocedMemory: heapStats.malloced_memory,
          peakMallocedMemory: heapStats.peak_malloced_memory,
          spaces: heapSpaceStats.map(space => ({
            name: space.space_name,
            size: space.space_size,
            used: space.space_used_size,
            available: space.space_available_size
          }))
        },
        resourceUsage: {
          userCPUTime: resourceUsage.userCPUTime || 0,
          systemCPUTime: resourceUsage.systemCPUTime || 0,
          maxRSS: resourceUsage.maxRSS || 0,
          sharedMemorySize: resourceUsage.sharedMemorySize || 0
        },
        eventLoop: await this.measureEventLoopDelay()
      };
    });

    // Event loop delay collector
    this.collectors.set('eventLoop', async () => {
      const delay = await this.measureEventLoopDelay();
      return {
        timestamp: Date.now(),
        delay: delay,
        blocked: delay > this.config.alertThresholds.eventLoopDelay
      };
    });

    // Garbage collection collector
    this.collectors.set('gc', () => {
      // This requires --expose-gc flag
      if (global.gc) {
        const before = process.memoryUsage();
        global.gc();
        const after = process.memoryUsage();
        
        return {
          timestamp: Date.now(),
          freed: {
            rss: before.rss - after.rss,
            heapTotal: before.heapTotal - after.heapTotal,
            heapUsed: before.heapUsed - after.heapUsed
          }
        };
      }
      return null;
    });

    console.log(`✅ Initialized ${this.collectors.size} metric collectors`);
  }

  calculateCPUUsage(cpus) {
    if (!this.lastCPUInfo) {
      this.lastCPUInfo = cpus.map(cpu => ({
        idle: cpu.times.idle,
        total: Object.values(cpu.times).reduce((acc, time) => acc + time, 0)
      }));
      return 0;
    }

    let totalUsage = 0;
    cpus.forEach((cpu, i) => {
      const total = Object.values(cpu.times).reduce((acc, time) => acc + time, 0);
      const idle = cpu.times.idle;
      
      const totalDiff = total - this.lastCPUInfo[i].total;
      const idleDiff = idle - this.lastCPUInfo[i].idle;
      
      const usage = totalDiff > 0 ? 100 - (100 * idleDiff / totalDiff) : 0;
      totalUsage += usage;
      
      this.lastCPUInfo[i] = { idle, total };
    });

    return totalUsage / cpus.length;
  }

  async measureEventLoopDelay() {
    const start = process.hrtime.bigint();
    await new Promise(setImmediate);
    const end = process.hrtime.bigint();
    return Number(end - start) / 1e6; // Convert to milliseconds
  }

  setupPerformanceObserver() {
    try {
      const { PerformanceObserver } = require('perf_hooks');
      
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          // Track performance marks and measures
          if (entry.entryType === 'measure') {
            this.recordMeasure(entry.name, entry.duration);
          }
        });
      });
      
      this.performanceObserver.observe({ 
        entryTypes: ['measure', 'mark', 'function', 'gc'] 
      });
    } catch (error) {
      console.warn('⚠️ Performance observer not available:', error.message);
    }
  }

  async startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    // Start metric collection
    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics();
    }, this.config.metricsInterval);
    
    // Start persistence
    if (this.config.persistence.enabled) {
      this.persistenceInterval = setInterval(async () => {
        await this.persistMetrics();
      }, this.config.persistence.interval);
    }
    
    // Start aggregation
    if (this.config.aggregation.enabled) {
      this.startAggregation();
    }
    
    console.log('📊 Monitoring started');
  }

  async collectMetrics() {
    try {
      // Collect system metrics
      const systemMetrics = await this.collectors.get('system')();
      this.metrics.system.push(systemMetrics);
      
      // Collect process metrics
      const processMetrics = await this.collectors.get('process')();
      this.metrics.process.push(processMetrics);
      
      // Collect custom metrics
      for (const [name, collector] of this.collectors) {
        if (name !== 'system' && name !== 'process') {
          const metrics = await collector();
          if (metrics) {
            if (!this.metrics.custom.has(name)) {
              this.metrics.custom.set(name, []);
            }
            this.metrics.custom.get(name).push(metrics);
          }
        }
      }
      
      // Trim history
      this.trimHistory();
      
      // Check alerts
      await this.checkAlerts(systemMetrics, processMetrics);
      
      // Emit metrics event
      this.emit('metrics', {
        system: systemMetrics,
        process: processMetrics,
        custom: Object.fromEntries(this.metrics.custom)
      });
      
    } catch (error) {
      console.error('Error collecting metrics:', error);
    }
  }

  trimHistory() {
    if (this.metrics.system.length > this.config.historyLimit) {
      this.metrics.system = this.metrics.system.slice(-this.config.historyLimit);
    }
    
    if (this.metrics.process.length > this.config.historyLimit) {
      this.metrics.process = this.metrics.process.slice(-this.config.historyLimit);
    }
    
    for (const [name, metrics] of this.metrics.custom) {
      if (metrics.length > this.config.historyLimit) {
        this.metrics.custom.set(name, metrics.slice(-this.config.historyLimit));
      }
    }
  }

  async checkAlerts(systemMetrics, processMetrics) {
    const newAlerts = [];
    
    // CPU usage alert
    if (systemMetrics.cpu.usage > this.config.alertThresholds.cpuUsage) {
      newAlerts.push({
        type: 'cpu_high',
        severity: 'warning',
        message: `CPU usage is ${systemMetrics.cpu.usage.toFixed(1)}%`,
        value: systemMetrics.cpu.usage,
        threshold: this.config.alertThresholds.cpuUsage,
        timestamp: Date.now()
      });
    }
    
    // Memory usage alert
    if (systemMetrics.memory.percentage > this.config.alertThresholds.memoryUsage) {
      newAlerts.push({
        type: 'memory_high',
        severity: 'warning',
        message: `Memory usage is ${systemMetrics.memory.percentage.toFixed(1)}%`,
        value: systemMetrics.memory.percentage,
        threshold: this.config.alertThresholds.memoryUsage,
        timestamp: Date.now()
      });
    }
    
    // Event loop delay alert
    if (processMetrics.eventLoop > this.config.alertThresholds.eventLoopDelay) {
      newAlerts.push({
        type: 'event_loop_blocked',
        severity: 'critical',
        message: `Event loop delay is ${processMetrics.eventLoop.toFixed(2)}ms`,
        value: processMetrics.eventLoop,
        threshold: this.config.alertThresholds.eventLoopDelay,
        timestamp: Date.now()
      });
    }
    
    // Process heap usage alert
    const heapUsagePercent = (processMetrics.heap.usedHeapSize / processMetrics.heap.heapSizeLimit) * 100;
    if (heapUsagePercent > 90) {
      newAlerts.push({
        type: 'heap_high',
        severity: 'critical',
        message: `Heap usage is ${heapUsagePercent.toFixed(1)}% of limit`,
        value: heapUsagePercent,
        threshold: 90,
        timestamp: Date.now()
      });
    }
    
    // Emit alerts
    for (const alert of newAlerts) {
      this.alerts.push(alert);
      this.emit('alert', alert);
    }
    
    // Trim alert history
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }

  startAggregation() {
    // Aggregate metrics at different intervals
    this.config.aggregation.intervals.forEach(interval => {
      const ms = this.parseInterval(interval);
      
      setInterval(() => {
        this.aggregateMetrics(interval);
      }, ms);
    });
  }

  parseInterval(interval) {
    const units = {
      's': 1000,
      'm': 60000,
      'h': 3600000
    };
    
    const match = interval.match(/^(\d+)([smh])$/);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      return value * units[unit];
    }
    
    return 60000; // Default to 1 minute
  }

  aggregateMetrics(interval) {
    const now = Date.now();
    const windowSize = this.parseInterval(interval);
    const cutoff = now - windowSize;
    
    // Aggregate system metrics
    const systemMetrics = this.metrics.system.filter(m => m.timestamp >= cutoff);
    const processMetrics = this.metrics.process.filter(m => m.timestamp >= cutoff);
    
    if (systemMetrics.length === 0 || processMetrics.length === 0) return;
    
    const aggregated = {
      interval,
      timestamp: now,
      samples: systemMetrics.length,
      system: {
        cpu: {
          avg: this.average(systemMetrics.map(m => m.cpu.usage)),
          min: Math.min(...systemMetrics.map(m => m.cpu.usage)),
          max: Math.max(...systemMetrics.map(m => m.cpu.usage)),
          p95: this.percentile(systemMetrics.map(m => m.cpu.usage), 0.95)
        },
        memory: {
          avg: this.average(systemMetrics.map(m => m.memory.percentage)),
          min: Math.min(...systemMetrics.map(m => m.memory.percentage)),
          max: Math.max(...systemMetrics.map(m => m.memory.percentage)),
          p95: this.percentile(systemMetrics.map(m => m.memory.percentage), 0.95)
        }
      },
      process: {
        heapUsed: {
          avg: this.average(processMetrics.map(m => m.memory.heapUsed)),
          min: Math.min(...processMetrics.map(m => m.memory.heapUsed)),
          max: Math.max(...processMetrics.map(m => m.memory.heapUsed)),
          p95: this.percentile(processMetrics.map(m => m.memory.heapUsed), 0.95)
        },
        eventLoop: {
          avg: this.average(processMetrics.map(m => m.eventLoop)),
          min: Math.min(...processMetrics.map(m => m.eventLoop)),
          max: Math.max(...processMetrics.map(m => m.eventLoop)),
          p95: this.percentile(processMetrics.map(m => m.eventLoop), 0.95)
        }
      }
    };
    
    if (!this.aggregated.has(interval)) {
      this.aggregated.set(interval, []);
    }
    
    this.aggregated.get(interval).push(aggregated);
    
    // Keep only last 100 aggregations per interval
    if (this.aggregated.get(interval).length > 100) {
      this.aggregated.set(interval, this.aggregated.get(interval).slice(-100));
    }
  }

  average(values) {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  percentile(values, p) {
    const sorted = values.slice().sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[index];
  }

  // Custom metric methods
  startTimer(name, labels = {}) {
    const key = this.getMetricKey(name, labels);
    this.timers.set(key, {
      name,
      labels,
      start: process.hrtime.bigint()
    });
    return key;
  }

  endTimer(key) {
    const timer = this.timers.get(key);
    if (!timer) return null;
    
    const end = process.hrtime.bigint();
    const duration = Number(end - timer.start) / 1e6; // Convert to milliseconds
    
    this.recordMeasure(timer.name, duration, timer.labels);
    this.timers.delete(key);
    
    return duration;
  }

  incrementCounter(name, value = 1, labels = {}) {
    const key = this.getMetricKey(name, labels);
    const current = this.counters.get(key) || { name, labels, value: 0 };
    current.value += value;
    this.counters.set(key, current);
    
    this.emit('counter', { name, value: current.value, labels });
  }

  setGauge(name, value, labels = {}) {
    const key = this.getMetricKey(name, labels);
    this.gauges.set(key, { name, labels, value, timestamp: Date.now() });
    
    this.emit('gauge', { name, value, labels });
  }

  recordHistogram(name, value, labels = {}) {
    const key = this.getMetricKey(name, labels);
    
    if (!this.histograms.has(key)) {
      this.histograms.set(key, {
        name,
        labels,
        values: [],
        sum: 0,
        count: 0
      });
    }
    
    const histogram = this.histograms.get(key);
    histogram.values.push(value);
    histogram.sum += value;
    histogram.count++;
    
    // Keep only last 1000 values
    if (histogram.values.length > 1000) {
      histogram.values = histogram.values.slice(-1000);
    }
    
    this.emit('histogram', { name, value, labels });
  }

  recordMeasure(name, duration, labels = {}) {
    this.recordHistogram(`${name}_duration`, duration, labels);
  }

  getMetricKey(name, labels) {
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(',');
    return `${name}{${labelStr}}`;
  }

  // Get current metrics
  getCurrentMetrics() {
    const latest = {
      system: this.metrics.system[this.metrics.system.length - 1] || null,
      process: this.metrics.process[this.metrics.process.length - 1] || null,
      custom: {}
    };
    
    for (const [name, metrics] of this.metrics.custom) {
      latest.custom[name] = metrics[metrics.length - 1] || null;
    }
    
    return latest;
  }

  getMetricsSummary(duration = '5m') {
    const windowSize = this.parseInterval(duration);
    const cutoff = Date.now() - windowSize;
    
    const systemMetrics = this.metrics.system.filter(m => m.timestamp >= cutoff);
    const processMetrics = this.metrics.process.filter(m => m.timestamp >= cutoff);
    
    if (systemMetrics.length === 0 || processMetrics.length === 0) {
      return null;
    }
    
    return {
      duration,
      samples: systemMetrics.length,
      system: {
        cpu: {
          current: systemMetrics[systemMetrics.length - 1]?.cpu.usage || 0,
          average: this.average(systemMetrics.map(m => m.cpu.usage)),
          max: Math.max(...systemMetrics.map(m => m.cpu.usage))
        },
        memory: {
          current: systemMetrics[systemMetrics.length - 1]?.memory.percentage || 0,
          average: this.average(systemMetrics.map(m => m.memory.percentage)),
          max: Math.max(...systemMetrics.map(m => m.memory.percentage))
        }
      },
      process: {
        heap: {
          current: processMetrics[processMetrics.length - 1]?.memory.heapUsed || 0,
          average: this.average(processMetrics.map(m => m.memory.heapUsed)),
          max: Math.max(...processMetrics.map(m => m.memory.heapUsed))
        },
        eventLoop: {
          current: processMetrics[processMetrics.length - 1]?.eventLoop || 0,
          average: this.average(processMetrics.map(m => m.eventLoop)),
          max: Math.max(...processMetrics.map(m => m.eventLoop))
        }
      },
      alerts: this.alerts.filter(a => a.timestamp >= cutoff)
    };
  }

  getCustomMetrics() {
    const metrics = {
      counters: {},
      gauges: {},
      histograms: {}
    };
    
    // Export counters
    for (const [key, counter] of this.counters) {
      metrics.counters[key] = counter.value;
    }
    
    // Export gauges
    for (const [key, gauge] of this.gauges) {
      metrics.gauges[key] = gauge.value;
    }
    
    // Export histogram summaries
    for (const [key, histogram] of this.histograms) {
      const sorted = histogram.values.slice().sort((a, b) => a - b);
      metrics.histograms[key] = {
        count: histogram.count,
        sum: histogram.sum,
        avg: histogram.sum / histogram.count,
        min: Math.min(...histogram.values),
        max: Math.max(...histogram.values),
        p50: this.percentile(sorted, 0.5),
        p90: this.percentile(sorted, 0.9),
        p95: this.percentile(sorted, 0.95),
        p99: this.percentile(sorted, 0.99)
      };
    }
    
    return metrics;
  }

  async persistMetrics() {
    if (!this.config.persistence.enabled) return;
    
    try {
      const timestamp = new Date().toISOString();
      const data = {
        timestamp,
        metrics: {
          system: this.metrics.system.slice(-100), // Keep last 100
          process: this.metrics.process.slice(-100),
          custom: Object.fromEntries(
            Array.from(this.metrics.custom.entries())
              .map(([key, values]) => [key, values.slice(-100)])
          )
        },
        aggregated: Object.fromEntries(this.aggregated),
        customMetrics: this.getCustomMetrics(),
        alerts: this.alerts.slice(-50) // Keep last 50 alerts
      };
      
      const filename = `metrics-${timestamp.split('T')[0]}.json`;
      const filepath = path.join(this.config.persistence.path, filename);
      
      await writeFile(filepath, JSON.stringify(data, null, 2));
      
    } catch (error) {
      console.error('Error persisting metrics:', error);
    }
  }

  async loadHistoricalData() {
    if (!this.config.persistence.enabled) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const filename = `metrics-${today}.json`;
      const filepath = path.join(this.config.persistence.path, filename);
      
      const data = JSON.parse(await readFile(filepath, 'utf8'));
      
      // Load recent metrics
      if (data.metrics) {
        this.metrics.system = data.metrics.system || [];
        this.metrics.process = data.metrics.process || [];
        
        if (data.metrics.custom) {
          this.metrics.custom = new Map(Object.entries(data.metrics.custom));
        }
      }
      
      // Load aggregated data
      if (data.aggregated) {
        this.aggregated = new Map(Object.entries(data.aggregated));
      }
      
      // Load alerts
      if (data.alerts) {
        this.alerts = data.alerts;
      }
      
      console.log('📊 Loaded historical performance data');
      
    } catch (error) {
      // No historical data, that's OK
      console.log('📊 No historical data found, starting fresh');
    }
  }

  // Export metrics in Prometheus format
  exportPrometheus() {
    const lines = [];
    const timestamp = Date.now();
    
    // System metrics
    const systemMetric = this.metrics.system[this.metrics.system.length - 1];
    if (systemMetric) {
      lines.push(`# HELP system_cpu_usage CPU usage percentage`);
      lines.push(`# TYPE system_cpu_usage gauge`);
      lines.push(`system_cpu_usage ${systemMetric.cpu.usage} ${timestamp}`);
      
      lines.push(`# HELP system_memory_usage Memory usage percentage`);
      lines.push(`# TYPE system_memory_usage gauge`);
      lines.push(`system_memory_usage ${systemMetric.memory.percentage} ${timestamp}`);
    }
    
    // Process metrics
    const processMetric = this.metrics.process[this.metrics.process.length - 1];
    if (processMetric) {
      lines.push(`# HELP process_heap_used Process heap memory used`);
      lines.push(`# TYPE process_heap_used gauge`);
      lines.push(`process_heap_used ${processMetric.memory.heapUsed} ${timestamp}`);
      
      lines.push(`# HELP process_event_loop_delay Event loop delay in ms`);
      lines.push(`# TYPE process_event_loop_delay gauge`);
      lines.push(`process_event_loop_delay ${processMetric.eventLoop} ${timestamp}`);
    }
    
    // Custom counters
    for (const [key, counter] of this.counters) {
      const safeName = counter.name.replace(/[^a-zA-Z0-9_]/g, '_');
      lines.push(`# HELP ${safeName} Counter ${counter.name}`);
      lines.push(`# TYPE ${safeName} counter`);
      lines.push(`${safeName}${this.formatLabels(counter.labels)} ${counter.value} ${timestamp}`);
    }
    
    // Custom gauges
    for (const [key, gauge] of this.gauges) {
      const safeName = gauge.name.replace(/[^a-zA-Z0-9_]/g, '_');
      lines.push(`# HELP ${safeName} Gauge ${gauge.name}`);
      lines.push(`# TYPE ${safeName} gauge`);
      lines.push(`${safeName}${this.formatLabels(gauge.labels)} ${gauge.value} ${timestamp}`);
    }
    
    // Custom histograms
    for (const [key, histogram] of this.histograms) {
      const safeName = histogram.name.replace(/[^a-zA-Z0-9_]/g, '_');
      const sorted = histogram.values.slice().sort((a, b) => a - b);
      
      lines.push(`# HELP ${safeName} Histogram ${histogram.name}`);
      lines.push(`# TYPE ${safeName} histogram`);
      
      const labels = this.formatLabels(histogram.labels);
      lines.push(`${safeName}_count${labels} ${histogram.count} ${timestamp}`);
      lines.push(`${safeName}_sum${labels} ${histogram.sum} ${timestamp}`);
      
      // Buckets
      const buckets = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];
      for (const bucket of buckets) {
        const count = sorted.filter(v => v <= bucket * 1000).length;
        lines.push(`${safeName}_bucket{le="${bucket}"${labels ? ',' + labels.slice(1, -1) : ''}} ${count} ${timestamp}`);
      }
      lines.push(`${safeName}_bucket{le="+Inf"${labels ? ',' + labels.slice(1, -1) : ''}} ${histogram.count} ${timestamp}`);
    }
    
    return lines.join('\n');
  }

  formatLabels(labels) {
    const pairs = Object.entries(labels);
    if (pairs.length === 0) return '';
    
    const formatted = pairs
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    
    return `{${formatted}}`;
  }

  async getHealthReport() {
    const current = this.getCurrentMetrics();
    const summary = this.getMetricsSummary('5m');
    
    const health = {
      status: 'healthy',
      checks: {
        cpu: {
          status: 'pass',
          value: current.system?.cpu.usage || 0,
          threshold: this.config.alertThresholds.cpuUsage
        },
        memory: {
          status: 'pass',
          value: current.system?.memory.percentage || 0,
          threshold: this.config.alertThresholds.memoryUsage
        },
        eventLoop: {
          status: 'pass',
          value: current.process?.eventLoop || 0,
          threshold: this.config.alertThresholds.eventLoopDelay
        },
        heap: {
          status: 'pass',
          value: current.process?.heap.usedHeapSize || 0,
          limit: current.process?.heap.heapSizeLimit || 0
        }
      },
      alerts: this.alerts.slice(-10),
      uptime: process.uptime(),
      timestamp: Date.now()
    };
    
    // Update status based on thresholds
    if (health.checks.cpu.value > health.checks.cpu.threshold) {
      health.checks.cpu.status = 'fail';
      health.status = 'degraded';
    }
    
    if (health.checks.memory.value > health.checks.memory.threshold) {
      health.checks.memory.status = 'fail';
      health.status = 'degraded';
    }
    
    if (health.checks.eventLoop.value > health.checks.eventLoop.threshold) {
      health.checks.eventLoop.status = 'fail';
      health.status = 'unhealthy';
    }
    
    const heapPercent = (health.checks.heap.value / health.checks.heap.limit) * 100;
    if (heapPercent > 90) {
      health.checks.heap.status = 'fail';
      health.status = 'unhealthy';
    }
    
    return health;
  }

  async stopMonitoring() {
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    if (this.persistenceInterval) {
      clearInterval(this.persistenceInterval);
      this.persistenceInterval = null;
    }
    
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
    
    // Final persistence
    await this.persistMetrics();
    
    console.log('📊 Monitoring stopped');
  }

  async cleanup() {
    await this.stopMonitoring();
    
    this.metrics.system = [];
    this.metrics.process = [];
    this.metrics.custom.clear();
    this.aggregated.clear();
    this.alerts = [];
    this.collectors.clear();
    this.timers.clear();
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
    
    console.log('📊 Performance Monitor Plugin cleaned up');
  }
}

export default PerformanceMonitorPlugin;