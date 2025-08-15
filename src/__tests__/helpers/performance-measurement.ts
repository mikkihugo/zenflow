/**
 * Performance Measurement Stub
 * Compatibility stub for performance tests
 */

export class PerformanceMeasurement {
  private measurements: Map<string, { start: number; end?: number }> = new Map();

  start(label: string): void {
    this.measurements.set(label, { start: Date.now() });
  }

  end(label: string): void {
    const measurement = this.measurements.get(label);
    if (measurement) {
      measurement.end = Date.now();
    }
  }

  getDuration(label: string): number {
    const measurement = this.measurements.get(label);
    if (measurement && measurement.end) {
      return measurement.end - measurement.start;
    }
    return 0;
  }

  clear(): void {
    this.measurements.clear();
  }

  getAllMeasurements(): Array<{ label: string; duration: number }> {
    const results: Array<{ label: string; duration: number }> = [];
    
    for (const [label, measurement] of this.measurements) {
      if (measurement.end) {
        results.push({
          label,
          duration: measurement.end - measurement.start,
        });
      }
    }
    
    return results;
  }

  // TODO: investigate - test may need real implementation in src/
  static benchmarkComparison(functions: Array<{ name: string; fn: () => void }>, iterations: number = 1000) {
    const results = functions.map(({ name, fn }) => {
      const start = Date.now();
      for (let i = 0; i < iterations; i++) {
        fn();
      }
      const end = Date.now();
      return {
        name,
        duration: end - start,
        iterations,
        ranking: 0, // TODO: investigate - test may need real ranking implementation
        metrics: { executionTime: end - start }, // TODO: investigate - test may need real metrics
      };
    });
    
    return results;
  }

  // TODO: investigate - test may need real implementation in src/
  static detectMemoryLeaks(testFunction: () => void, iterations: number = 100) {
    const memoryUsages: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      if (global.gc) {
        global.gc();
      }
      
      const memBefore = process.memoryUsage().heapUsed;
      testFunction();
      
      if (global.gc) {
        global.gc();
      }
      
      const memAfter = process.memoryUsage().heapUsed;
      memoryUsages.push(memAfter - memBefore);
    }
    
    const avgMemoryIncrease = memoryUsages.reduce((sum, usage) => sum + usage, 0) / memoryUsages.length;
    
    return {
      iterations,
      avgMemoryIncrease,
      memoryUsages,
      hasMemoryLeak: avgMemoryIncrease > 10 * 1024 * 1024, // 10MB threshold
      memoryGrowth: avgMemoryIncrease, // TODO: investigate - test may need real memoryGrowth calculation
    };
  }
}