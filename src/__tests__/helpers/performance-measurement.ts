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
}