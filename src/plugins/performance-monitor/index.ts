/**
 * Performance Monitor Plugin
 * Real-time performance monitoring, metrics collection, and analysis
 */

import { EventEmitter } from 'node:events';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export class PerformanceMonitorPlugin extends EventEmitter {
  constructor(_config = {}): any {
    super();
    this.config = {metricsInterval = {system = new Map();
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
    console.warn('📊 Performance Monitor Plugin initialized');

    // Create persistence directory
    if (this.config.persistence.enabled) {
      await mkdir(this.config.persistence.path, { recursive => {
      const cpus = os.cpus();

      // Calculate CPU usage
      const _cpuUsage = this.calculateCPUUsage(cpus);

      return {
        timestamp => {
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      const _resourceUsage = process.resourceUsage ? process.resourceUsage() : {};

      // V8 heap statistics

      return {timestamp = > ({
            name => {
      const delay = await this.measureEventLoopDelay();
      return {
        timestamp => {
      // This requires --expose-gc flag
      if(global._gc) {

        global.gc();

        return {timestamp = cpus.map(_cpu => ({idle = > acc + time, 0)
      }));
      return 0;
    }

    const totalUsage = 0;
      cpus.forEach((cpu, i) => {
        const total = Object.values(cpu.times).reduce((acc, time) => acc + time, 0);
        const idle = cpu.times.idle;

        const totalDiff = total - this.lastCPUInfo[i].total;
        const idleDiff = idle - this.lastCPUInfo[i].idle;

        const usage = totalDiff > 0 ? 100 - (100 * idleDiff) / totalDiff : 0;
        totalUsage += usage;

        this.lastCPUInfo[i] = { idle, total };
      });

      return totalUsage / cpus.length;
    }

    async;
    measureEventLoopDelay();
    {
      const start = process.hrtime.bigint();
      await new Promise(setImmediate);
      const end = process.hrtime.bigint();
      return Number(end - start) / 1e6; // Convert to milliseconds
    }

    setupPerformanceObserver();
    try {
      const { PerformanceObserver } = require('node:perf_hooks');
      
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          // Track performance marks and measures
          if(entry.entryType === 'measure') {
            this.recordMeasure(entry.name, entry.duration);
          }
        });
      });
      
      this.performanceObserver.observe({entryTypes = true;
    
    // Start metric collection
    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics();
    }, this.config.metricsInterval);
    
    // Start persistence
    if(this.config.persistence.enabled) {
      this.persistenceInterval = setInterval(async () => {
        await this.persistMetrics();
      }, this.config.persistence.interval);
    }
    
    // Start aggregation
    if(this.config.aggregation.enabled) {
      this.startAggregation();
    }
    
    console.warn('📊 Monitoring started');
  }

    async;
    collectMetrics();
    try {
      // Collect system metrics
      const systemMetrics = await this.collectors.get('system')();
      this.metrics.system.push(systemMetrics);
      
      // Collect process metrics
      const processMetrics = await this.collectors.get('process')();
      this.metrics.process.push(processMetrics);
      
      // Collect custom metrics
      for(const [name, collector] of this.collectors) {
        if(name !== 'system' && name !== 'process') {
          const metrics = await collector();
          if(metrics) {
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
      this.emit('metrics', {system = this.metrics.system.slice(-this.config.historyLimit);
    }

    if (this.metrics.process.length > this.config.historyLimit) {
      this.metrics.process = this.metrics.process.slice(-this.config.historyLimit);
    }

    for (const [name, metrics] of this.metrics.custom) {
      if (metrics.length > this.config.historyLimit) {
        this.metrics.custom.set(name, metrics.slice(-this.config.historyLimit));
      }
    }

    async;
    checkAlerts(systemMetrics, processMetrics);
    : any
    {
      const newAlerts = [];

      // CPU usage alert
      if (systemMetrics.cpu.usage > this.config.alertThresholds.cpuUsage) {
        newAlerts.push({type = (processMetrics.heap.usedHeapSize / processMetrics.heap.heapSizeLimit) * 100;
        if (heapUsagePercent > 90) {
          newAlerts.push({type = this.alerts.slice(-100);
        }
      }

      startAggregation();
      // Aggregate metrics at different intervals
      this.config.aggregation.intervals.forEach((interval) => {
        const ms = this.parseInterval(interval);

        setInterval(() => {
          this.aggregateMetrics(interval);
        }, ms);
      });

      parseInterval(interval);
      : any
      {
        const units = {
      's',
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

      aggregateMetrics(interval);
      : any
      {
        const now = Date.now();
        const windowSize = this.parseInterval(interval);
        const cutoff = now - windowSize;

        // Aggregate system metrics
        const systemMetrics = this.metrics.system.filter((m) => m.timestamp >= cutoff);
        const processMetrics = this.metrics.process.filter((m) => m.timestamp >= cutoff);

        if (systemMetrics.length === 0 || processMetrics.length === 0) return;

        const _aggregated = {
      interval,timestamp = > m.cpu.usage)),min = > m.cpu.usage)),max = > m.cpu.usage)),p95 = > m.cpu.usage), 0.95)
        },_memory = > m.memory.percentage
        )),min = > m.memory.percentage)),max = > m.memory.percentage)),p95 = > m.memory.percentage), 0.95)
      }
    }
    ,process = > m.memory.heapUsed)),min = > m.memory.heapUsed)),max = > m.memory.heapUsed)),p95 = > m.memory.heapUsed), 0.95),eventLoop = > m.eventLoop)),min = > m.eventLoop)),max = > m.eventLoop)),p95 = > m.eventLoop), 0.95)
  }
}
}

if (!this.aggregated.has(interval)) {
  this.aggregated.set(interval, []);
}

this.aggregated.get(interval).push(aggregated);

// Keep only last 100 aggregations per interval
if (this.aggregated.get(interval).length > 100) {
  this.aggregated.set(interval, this.aggregated.get(interval).slice(-100));
}
}

  average(values): any
{
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

percentile(values, p);
: any
{
  const sorted = values.slice().sort((a, b) => a - b);
  const index = Math.ceil(sorted.length * p) - 1;
  return sorted[index];
}

// Custom metric methods
startTimer(name, (labels = {}));
: any
{
  const key = this.getMetricKey(name, labels);
  this.timers.set(key, {
      name,
      labels,start = this.timers.get(key);
  if (!timer) return null;

  const end = process.hrtime.bigint();
  const duration = Number(end - timer.start) / 1e6; // Convert to milliseconds

  this.recordMeasure(timer.name, duration, timer.labels);
  this.timers.delete(key);

  return duration;
}

incrementCounter(name, (value = 1), (labels = {}));
: any
{
  let key = this.getMetricKey(name, labels);
  const current = this.counters.get(key) || { name, labels,value = value;
  this.counters.set(key, current);

  this.emit('counter', { name, value = {}): any {
    const key = this.getMetricKey(name, labels);
  this.gauges.set(key, { name, labels, value, timestamp = {}): any {
    const key = this.getMetricKey(name, labels);

  if (!this.histograms.has(key)) {
    this.histograms.set(key, {
        name,
        labels,values = this.histograms.get(key);
    histogram.values.push(value);
    histogram.sum += value;
    histogram.count++;

    // Keep only last 1000 values
    if (histogram.values.length > 1000) {
      histogram.values = histogram.values.slice(-1000);
    }

    this.emit('histogram', { name, value, labels });
  }

  recordMeasure(name, duration, (labels = {}));
  : any 
    this.recordHistogram(`$
    name
  _duration`, duration, labels)

  getMetricKey(name, labels);
  : any
  {
    const _labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(
        ([_k, _v]) => `;
  $;
  k;
  =$
    v
  `
      )
      .join(',');
    return `;
  $;
  name;
  $;
  labelStr;
  `;
  }

  // Get current metrics
  getCurrentMetrics();
  {
    const _latest = {system = metrics[metrics.length - 1] || null;
  }

  return latest;
}

getMetricsSummary((duration = '5m'));
: any
{
  const windowSize = this.parseInterval(duration);
  const cutoff = Date.now() - windowSize;

  const systemMetrics = this.metrics.system.filter((m) => m.timestamp >= cutoff);
  const processMetrics = this.metrics.process.filter((m) => m.timestamp >= cutoff);

  if (systemMetrics.length === 0 || processMetrics.length === 0) {
    return null;
  }

  return {
      duration,samples = > m.cpu.usage)),max = > m.cpu.usage))
        },memory = > m.memory.percentage
  )),max = > m.memory.percentage))
}
},process = > m.memory.heapUsed)),max = > m.memory.heapUsed))
        },eventLoop = > m.eventLoop)),max = > m.eventLoop))
        }
      },alerts = > a.timestamp >= cutoff)
    }
}

  getCustomMetrics()
{
  const _metrics = {counters = counter.value;
}

// Export gauges
for (const [key, gauge] of this.gauges) {
  metrics.gauges[key] = gauge.value;
}

// Export histogram summaries
for (const [key, histogram] of this.histograms) {
  const _sorted = histogram.values.slice().sort((a, b) => a - b);
  metrics.histograms[key] = {count = new Date().toISOString();
  const _data = {
        timestamp,metrics = > [key, values.slice(-100)])
  )
}
,aggregated = `
metrics - $;
timestamp.split('T')[0];
.json`
const filepath = path.join(this.config.persistence.path, filename);

await writeFile(filepath, JSON.stringify(data, null, 2));
}
catch(error)
{
  console.error('Error persistingmetrics = new Date().toISOString().split('T')[0];
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

  console.warn('📊 Loaded historical performance data');
}
catch(error)
{
  // No historical data, that's OK
  console.warn('📊 No historical data found, starting fresh');
}
}

  // Export metrics in Prometheus format
  exportPrometheus()
{
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
  for (const [_key, counter] of this.counters) {
    const safeName = counter.name.replace(/[^a-zA-Z0-9_]/g, '_');
    lines.push(`# HELP ${safeName} Counter ${counter.name}`);
    lines.push(`# TYPE ${safeName} counter`);
    lines.push(`${safeName}${this.formatLabels(counter.labels)} ${counter.value} ${timestamp}`);
  }

  // Custom gauges
  for (const [_key, gauge] of this.gauges) {
    const safeName = gauge.name.replace(/[^a-zA-Z0-9_]/g, '_');
    lines.push(`# HELP ${safeName} Gauge ${gauge.name}`);
    lines.push(`# TYPE ${safeName} gauge`);
    lines.push(`${safeName}${this.formatLabels(gauge.labels)} ${gauge.value} ${timestamp}`);
  }

  // Custom histograms
  for (const [_key, histogram] of this.histograms) {
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
      const count = sorted.filter((v) => v <= bucket * 1000).length;
      lines.push(
        `${safeName}_bucket{le="${bucket}"${labels ? `,${labels.slice(1, -1)}` : ''}} ${count} ${timestamp}`
      );
    }
    lines.push(
      `${safeName}_bucket{le="+Inf"${labels ? `,${labels.slice(1, -1)}` : ''}} ${histogram.count} ${timestamp}`
    );
  }

  return lines.join('\n');
}

formatLabels(labels);
: any
{
  const pairs = Object.entries(labels);
  if (pairs.length === 0) return '';

  const formatted = pairs.map(([k, v]) => `${k}="${v}"`).join(',');

  return `{${formatted}}`;
}

async;
getHealthReport();
{
  const _current = this.getCurrentMetrics();

  const health = {status = 'fail';
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

  async stopMonitoring()
{
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

  console.warn('📊 Monitoring stopped');
}

async;
cleanup();
{
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

  console.warn('📊 Performance Monitor Plugin cleaned up');
}
}

export default PerformanceMonitorPlugin;
