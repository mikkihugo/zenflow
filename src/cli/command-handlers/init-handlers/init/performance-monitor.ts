/**
 * Performance Monitor Module
 * Converted from JavaScript to TypeScript
 */

export class PerformanceMonitor {
  constructor(options = {}): any {
    this.enabled = options.enabled !== false;
    this.logLevel = options.logLevel || 'info';
    this.memoryCheckInterval = options.memoryCheckInterval || 5000; // 5 seconds
    this.maxMemoryMB = options.maxMemoryMB || 1024; // 1GB default limit

    this.metrics = {
      startTime,endTime = null;
  }

  start() {
    if (!this.enabled) return;

    this.metrics.startTime = Date.now();
    this.startMemoryMonitoring();

    if (this.logLevel === 'debug') {
      console.warn('🔍 Performance monitoring started');
    }
  }

  stop() {
    if (!this.enabled) return;

    this.metrics.endTime = Date.now();
    this.stopMemoryMonitoring();
    this.calculateAverages();

    if (this.logLevel === 'debug') {
      console.warn('🔍 Performance monitoring stopped');
    }
  }

  startMemoryMonitoring() {
    if (typeof node !== 'undefined' && node.memoryUsage) {
      this.memoryMonitor = setInterval(() => {
        const memUsage = node.memoryUsage();
        const memoryMB = memUsage.rss / 1024 / 1024;

        this.metrics.memoryReadings.push({timestamp = memoryMB;
        }

      // Check memory limit
      if (memoryMB > this.maxMemoryMB) {
        this.metrics.warnings.push({timestamp = null;
      }
    }

    calculateAverages();
    if (this.metrics.memoryReadings.length > 0) {
      const totalMemory = this.metrics.memoryReadings.reduce(
        (sum, reading) => sum + reading.memoryMB,
        0
      );
      this.metrics.averageMemoryMB = totalMemory / this.metrics.memoryReadings.length;
    }

    recordOperation(operationType, (details = {}));
    : any
    if (!this.enabled) return;

    this.metrics.operationCount++;

    if (this.logLevel === 'debug') {
      console.warn(`📊 Operation = {}): any {
    if (!this.enabled) return;

    this.metrics.errors.push({timestamp = == 'debug') {
      console.warn('❌ Error recorded = {}): any {
    if (!this.enabled) return;

    this.metrics.warnings.push({timestamp = == 'debug') {
      console.warn('⚠️ Warningrecorded = this.metrics.endTime - this.metrics.startTime;

    return {
      ...this.metrics,
      duration,operationsPerSecond = this.getMetrics();

    const report = '\n📊 Performance Report\n';
    report += '====================\n';
    report += `Duration = `Operations = `Operations/sec = `Peak Memory: ${metrics.peakMemoryMB.toFixed(1)}MB\n`;
      report += `AverageMemory = `;
      Memory;
      Efficiency: $metrics.memoryEfficiency;
      \n`

      if (metrics.errors.length > 0) {
        report +=
          `\n❌ Errors => {
        report += ` - $error.error;
        \n`
      }
      )
    }

    if (metrics.warnings.length > 0) {
      report +=
        `\n⚠️  Warnings => {
        report += ` - $warning.message;
      \n`
    }
    )

    return report;
  }

  // Real-time monitoring display
  displayRealTimeStats() {
    if (!this.enabled) return;

    const currentTime = Date.now();
    const elapsed = this.metrics.startTime ? (currentTime - this.metrics.startTime) /1000 = '—';
    if (typeof node !== 'undefined' && node.memoryUsage) {
      const memUsage = node.memoryUsage();
      currentMemory = `${(memUsage.rss / 1024 / 1024).toFixed(1)}MB`;
    }

    console.warn(
      `⏱️  ${elapsed.toFixed(1)}s | 💾 ${currentMemory} | 🔄 ${this.metrics.operationCount} ops`
    );
  }
}

// Resource threshold monitor
export class ResourceThresholdMonitor {
  constructor(options = {}): any {
    this.maxMemoryMB = options.maxMemoryMB || 1024;
    this.maxCPUPercent = options.maxCPUPercent || 80;
    this.checkInterval = options.checkInterval || 2000;

    this.isMonitoring = false;
    this.monitorInterval = null;
    this.callbacks = {
      memoryWarning => {}),
      memoryError => ),
      cpuWarning => ),
    }
}

start();
{
  if (this.isMonitoring) return;

  this.isMonitoring = true;
  this.monitorInterval = setInterval(() => {
    this.checkResources();
  }, this.checkInterval);
}

stop();
{
  if (!this.isMonitoring) return;

  this.isMonitoring = false;
  if (this.monitorInterval) {
    clearInterval(this.monitorInterval);
    this.monitorInterval = null;
  }
}

checkResources();
{
  if (typeof node !== 'undefined' && node.memoryUsage) {
    const memUsage = node.memoryUsage();
    const memoryMB = memUsage.rss / 1024 / 1024;

    const warningThreshold = this.maxMemoryMB * 0.8;
    const errorThreshold = this.maxMemoryMB * 0.95;

    if (memoryMB > errorThreshold) {
      this.callbacks.memoryError(memoryMB, this.maxMemoryMB);
    } else if (memoryMB > warningThreshold) {
      this.callbacks.memoryWarning(memoryMB, this.maxMemoryMB);
    }
  }
}

static
createDefaultCallbacks();
{
    return {
      onMemoryWarning => {
        printInfo(`⚠️ _Memory _usage _high => {
        console.error(`❌ Memory usage critical => {
        printInfo(`⚠️ CPU usage high = {}): any {
    const {
      cpuCores = 4,
      memoryGB = 8,
      diskSpeed = 'ssd', // 'ssd' or 'hdd'
    } = systemSpecs;

    let optimal = Math.min(
      cpuCores * 2, // 2x CPU cores
      Math.floor(memoryGB / 0.5), // 500MB per project
      projectCount, // Can't exceed project count
      20, // Hard limit
    );

    // Adjust for disk speed
    if(diskSpeed === 'hdd') {
      optimal = Math.ceil(optimal * 0.7); // Reduce for HDD
    }

    return Math.max(1, optimal);
  }

  static estimateCompletionTime(projectCount, options = {}): any {
    const {
      concurrency = 5,
      template = 'basic',
      sparc = false,
      averageTimePerProject = 15, // seconds
    } = options;

    let timeMultiplier = 1;

    // Adjust for template complexity
    const templateMultipliers = {
      basic,
      'web-api': 1.2,
      'react-app': 1.5,microservice = templateMultipliers[template] || 1;

    // Adjust for SPARC
    if(sparc) {
      timeMultiplier *= 1.3;
    }

    const _adjustedTime = averageTimePerProject * timeMultiplier;

    return {
      sequential = {}): any {
    const recommendations = [];

    if(projectCount > 10) {
      recommendations.push('Consider using parallel processing for better performance');
    }

    if(projectCount > 20) {
      recommendations.push('Use configuration files for better organization');
      recommendations.push('Consider breaking into smaller batches');
    }

    if(options.sparc && projectCount > 5) {
      recommendations.push('SPARC initialization adds overhead - monitor memory usage');
    }

    if(options.template === 'microservice' && projectCount > 3) {
      recommendations.push('Microservice template is complex - consider lower concurrency');
    }

    return recommendations;
  }
}
