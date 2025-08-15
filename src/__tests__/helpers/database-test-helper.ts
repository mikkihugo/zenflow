/**
 * Database Test Helper Stub
 * Compatibility stub for database performance tests
 */

export class DatabaseTestHelper {
  async initializeTestDatabase(path: string): Promise<void> {
    // Stub implementation
  }

  async clearTestData(): Promise<void> {
    // Stub implementation
  }

  async cleanup(): Promise<void> {
    // Stub implementation
  }

  generateRandomVector(dimension: number): number[] {
    return Array.from({ length: dimension }, () => Math.random());
  }

  addNoiseToVector(vector: number[], noiseLevel: number): number[] {
    return vector.map(v => v + (Math.random() - 0.5) * noiseLevel * 2);
  }

  calculateDistance(v1: number[], v2: number[]): number {
    let sum = 0;
    for (let i = 0; i < v1.length; i++) {
      sum += Math.pow(v1[i] - v2[i], 2);
    }
    return Math.sqrt(sum);
  }
}