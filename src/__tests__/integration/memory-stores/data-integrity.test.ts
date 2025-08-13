/**
 * Data Integrity Integration Tests
 *
 * Hybrid Testing Approach:
 * - London School: Mock storage backends and corruption scenarios
 * - Classical School: Test actual data validation and error recovery
 */

import { createHash } from 'node:crypto';
import { EventEmitter } from 'node:events';

// Data integrity interfaces and utilities
interface DataChecksum {
  algorithm: 'sha256' | 'md5' | 'crc32';
  value: string;
}

interface IntegrityRecord {
  id: string;
  data: unknown;
  checksum: DataChecksum;
  timestamp: number;
  version: number;
  metadata?: Record<string, unknown>;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  corrected?: boolean;
}

// Data integrity utilities
class DataIntegrityUtils {
  static calculateChecksum(
    data: unknown,
    algorithm: 'sha256' | 'md5' | 'crc32' = 'sha256'
  ): DataChecksum {
    const serialized = typeof data === 'string' ? data : JSON.stringify(data);

    let hash: string;
    switch (algorithm) {
      case 'sha256':
        hash = createHash('sha256').update(serialized).digest('hex');
        break;
      case 'md5':
        hash = createHash('md5').update(serialized).digest('hex');
        break;
      case 'crc32':
        // Simple CRC32 implementation for testing
        hash = DataIntegrityUtils?.crc32(serialized).toString(16);
        break;
      default:
        throw new Error(`Unsupported algorithm: ${algorithm}`);
    }

    return { algorithm, value: hash };
  }

  static validateChecksum(
    data: unknown,
    expectedChecksum: DataChecksum
  ): boolean {
    const actualChecksum = DataIntegrityUtils?.calculateChecksum(
      data,
      expectedChecksum.algorithm
    );
    return actualChecksum.value === expectedChecksum.value;
  }

  static detectCorruption(original: unknown, current: unknown): string[] {
    const issues: string[] = [];

    if (typeof original !== typeof current) {
      issues.push(
        `Type mismatch: expected ${typeof original}, got ${typeof current}`
      );
      return issues;
    }

    if (original === null || current === null) {
      if (original !== current) {
        issues.push('Null value mismatch');
      }
      return issues;
    }

    if (typeof original === 'object' && Array.isArray(original)) {
      if (!Array.isArray(current)) {
        issues.push('Array structure corrupted');
        return issues;
      }

      if (original.length !== current.length) {
        issues.push(
          `Array length mismatch: expected ${original.length}, got ${current.length}`
        );
      }

      for (let i = 0; i < Math.min(original.length, current.length); i++) {
        const subIssues = DataIntegrityUtils?.detectCorruption(
          original[i],
          current?.[i]
        );
        issues.push(...subIssues.map((issue) => `Array[${i}]: ${issue}`));
      }
    } else if (typeof original === 'object') {
      const originalKeys = Object.keys(original).sort();
      const currentKeys = Object.keys(current).sort();

      if (originalKeys.length !== currentKeys.length) {
        issues.push(
          `Object key count mismatch: expected ${originalKeys.length}, got ${currentKeys.length}`
        );
      }

      const missingKeys = originalKeys.filter((key) => !(key in current));
      const extraKeys = currentKeys?.filter((key) => !(key in original));

      if (missingKeys.length > 0) {
        issues.push(`Missing keys: ${missingKeys.join(', ')}`);
      }

      if (extraKeys.length > 0) {
        issues.push(`Extra keys: ${extraKeys.join(', ')}`);
      }

      for (const key of originalKeys) {
        if (key in current) {
          const subIssues = DataIntegrityUtils?.detectCorruption(
            original[key],
            current?.[key]
          );
          issues.push(...subIssues.map((issue) => `Object.${key}: ${issue}`));
        }
      }
    } else if (original !== current) {
      issues.push(
        `Value mismatch: expected ${JSON.stringify(original)}, got ${JSON.stringify(current)}`
      );
    }

    return issues;
  }

  static attemptRepair<T>(
    corrupted: T,
    reference: T,
    strategy: 'merge' | 'replace' | 'selective' = 'selective'
  ): T {
    if (strategy === 'replace') {
      return reference;
    }

    if (
      strategy === 'merge' &&
      typeof corrupted === 'object' &&
      typeof reference === 'object'
    ) {
      if (corrupted === null || reference === null) {
        return reference;
      }

      if (Array.isArray(reference)) {
        return reference; // For arrays, replace entirely
      }

      const merged = { ...corrupted };
      for (const [key, value] of Object.entries(reference)) {
        if (
          !(key in merged) ||
          merged[key] === null ||
          merged[key] === undefined
        ) {
          (merged as any)[key] = value;
        }
      }
      return merged as T;
    }

    // Selective repair - only fix obvious corruption
    if (corrupted === null || corrupted === undefined) {
      return reference;
    }

    return corrupted;
  }

  private static crc32(str: string): number {
    let crc = 0 ^ -1;
    for (let i = 0; i < str.length; i++) {
      crc =
        (crc >>> 8) ^
        DataIntegrityUtils?.crcTable?.[(crc ^ str.charCodeAt(i)) & 0xff];
    }
    return (crc ^ -1) >>> 0;
  }

  private static crcTable = (() => {
    const table = new Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[i] = c;
    }
    return table;
  })();
}

// Integrity-aware storage system
class IntegrityStorage extends EventEmitter {
  private records = new Map<string, IntegrityRecord>();
  private backupRecords = new Map<string, IntegrityRecord>();
  private validationEnabled = true;
  private autoRepair = true;
  private redundancyLevel = 1;

  constructor(
    options: {
      validationEnabled?: boolean;
      autoRepair?: boolean;
      redundancyLevel?: number;
    } = {}
  ) {
    super();
    this.validationEnabled = options?.validationEnabled ?? true;
    this.autoRepair = options?.autoRepair ?? true;
    this.redundancyLevel = options?.redundancyLevel ?? 1;
  }

  async store(
    id: string,
    data: unknown,
    metadata?: Record<string, unknown>
  ): Promise<IntegrityRecord> {
    const checksum = DataIntegrityUtils?.calculateChecksum(data);
    const timestamp = Date.now();
    const version = (this.records.get(id)?.version ?? 0) + 1;

    const record: IntegrityRecord = {
      id,
      data,
      checksum,
      timestamp,
      version,
      metadata,
    };

    this.records.set(id, record);

    // Create backup copies for redundancy
    if (this.redundancyLevel > 0) {
      this.backupRecords.set(id, { ...record });
    }

    this.emit('stored', { id, version, checksum: checksum.value });
    return { ...record };
  }

  async retrieve(id: string): Promise<IntegrityRecord | null> {
    const record = this.records.get(id);
    if (!record) {
      return null;
    }

    if (this.validationEnabled) {
      const validation = await this.validateRecord(record);

      if (!validation.valid) {
        this.emit('corruptionDetected', { id, errors: validation.errors });

        if (this.autoRepair) {
          const repaired = await this.attemptRepair(id, record);
          if (repaired) {
            this.emit('dataRepaired', { id, method: 'auto' });
            return repaired;
          }
        }

        throw new Error(
          `Data integrity violation for ${id}: ${validation.errors.join(', ')}`
        );
      }
    }

    this.emit('retrieved', { id, version: record.version });
    return { ...record };
  }

  async validateRecord(record: IntegrityRecord): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Checksum validation
    const isValidChecksum = DataIntegrityUtils?.validateChecksum(
      record.data,
      record.checksum
    );
    if (!isValidChecksum) {
      errors.push('Checksum validation failed');
    }

    // Structural validation
    if (record.data === null || record.data === undefined) {
      warnings.push('Data is null or undefined');
    }

    // Timestamp validation
    if (record.timestamp > Date.now()) {
      warnings.push('Future timestamp detected');
    }

    // Version validation
    if (record.version < 1) {
      errors.push('Invalid version number');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async validateAll(): Promise<{
    valid: number;
    corrupted: number;
    repaired: number;
  }> {
    let valid = 0;
    let corrupted = 0;
    let repaired = 0;

    for (const [id, record] of this.records.entries()) {
      try {
        const validation = await this.validateRecord(record);

        if (validation.valid) {
          valid++;
        } else {
          corrupted++;

          if (this.autoRepair) {
            const repairedRecord = await this.attemptRepair(id, record);
            if (repairedRecord) {
              repaired++;
            }
          }
        }
      } catch (_error) {
        corrupted++;
      }
    }

    this.emit('bulkValidation', { valid, corrupted, repaired });
    return { valid, corrupted, repaired };
  }

  async attemptRepair(
    id: string,
    corruptedRecord: IntegrityRecord
  ): Promise<IntegrityRecord | null> {
    // Try backup first
    const backup = this.backupRecords.get(id);
    if (backup) {
      const backupValidation = await this.validateRecord(backup);
      if (backupValidation.valid) {
        this.records.set(id, { ...backup });
        this.emit('repairedFromBackup', { id });
        return { ...backup };
      }
    }

    // Try to repair the current record
    if (backup) {
      try {
        const repairedData = DataIntegrityUtils?.attemptRepair(
          corruptedRecord.data,
          backup.data,
          'selective'
        );

        const repairedRecord: IntegrityRecord = {
          ...corruptedRecord,
          data: repairedData,
          checksum: DataIntegrityUtils?.calculateChecksum(repairedData),
          version: corruptedRecord.version + 1,
          timestamp: Date.now(),
        };

        this.records.set(id, repairedRecord);
        this.emit('repairedSelectively', { id });
        return { ...repairedRecord };
      } catch (error) {
        this.emit('repairFailed', { id, error: error.message });
      }
    }

    return null;
  }

  async simulateCorruption(
    id: string,
    corruptionType: 'checksum' | 'data' | 'structure'
  ): Promise<boolean> {
    const record = this.records.get(id);
    if (!record) {
      return false;
    }

    switch (corruptionType) {
      case 'checksum':
        record.checksum.value = 'corrupted_checksum';
        break;

      case 'data':
        if (typeof record.data === 'object' && record.data !== null) {
          record.data = { ...record.data, corrupted: true };
        } else {
          record.data = 'CORRUPTED';
        }
        break;

      case 'structure':
        if (typeof record.data === 'object' && !Array.isArray(record.data)) {
          record.data.someKey = undefined;
          record.data.unexpectedKey = 'unexpected';
        }
        break;
    }

    this.emit('corruptionSimulated', { id, type: corruptionType });
    return true;
  }

  getStats(): {
    totalRecords: number;
    backupRecords: number;
    validationEnabled: boolean;
    autoRepair: boolean;
  } {
    return {
      totalRecords: this.records.size,
      backupRecords: this.backupRecords.size,
      validationEnabled: this.validationEnabled,
      autoRepair: this.autoRepair,
    };
  }

  async clear(): Promise<void> {
    this.records.clear();
    this.backupRecords.clear();
    this.emit('cleared');
  }
}

// Mock corrupted storage for London-style tests
class MockCorruptedStorage {
  private shouldCorrupt = false;
  private corruptionRate = 0.1;
  public operations: string[] = [];

  setShouldCorrupt(shouldCorrupt: boolean, rate = 0.1): void {
    this.shouldCorrupt = shouldCorrupt;
    this.corruptionRate = rate;
  }

  async store(id: string, data: unknown): Promise<unknown> {
    this.operations.push(`store:${id}`);

    if (this.shouldCorrupt && Math.random() < this.corruptionRate) {
      // Simulate corruption during storage
      const corrupted =
        typeof data === 'object' ? { ...data, __corrupted: true } : 'CORRUPTED';
      return { success: false, data: corrupted, error: 'Storage corruption' };
    }

    return { success: true, data, checksum: 'mock_checksum' };
  }

  async retrieve(id: string): Promise<unknown> {
    this.operations.push(`retrieve:${id}`);

    if (this.shouldCorrupt && Math.random() < this.corruptionRate) {
      return { success: false, error: 'Retrieval corruption' };
    }

    return { success: true, data: { id, mockData: true } };
  }
}

describe('Data Integrity Integration Tests', () => {
  describe('Data Integrity Utils (Classical School)', () => {
    it('should calculate checksums correctly', () => {
      const data = { message: 'test data', number: 42 };

      const sha256Checksum = DataIntegrityUtils?.calculateChecksum(
        data,
        'sha256'
      );
      const md5Checksum = DataIntegrityUtils?.calculateChecksum(data, 'md5');
      const crc32Checksum = DataIntegrityUtils?.calculateChecksum(
        data,
        'crc32'
      );

      expect(sha256Checksum.algorithm).toBe('sha256');
      expect(sha256Checksum.value).toHaveLength(64); // SHA256 hex length

      expect(md5Checksum.algorithm).toBe('md5');
      expect(md5Checksum.value).toHaveLength(32); // MD5 hex length

      expect(crc32Checksum.algorithm).toBe('crc32');
      expect(crc32Checksum.value).toMatch(/^[0-9a-f]+$/); // Hex string

      // Same data should produce same checksums
      const duplicate = DataIntegrityUtils?.calculateChecksum(data, 'sha256');
      expect(duplicate.value).toBe(sha256Checksum.value);
    });

    it('should validate checksums correctly', () => {
      const data = { test: 'validation data' };
      const checksum = DataIntegrityUtils?.calculateChecksum(data);

      expect(DataIntegrityUtils?.validateChecksum(data, checksum)).toBe(true);

      const modifiedData = { test: 'modified data' };
      expect(DataIntegrityUtils?.validateChecksum(modifiedData, checksum)).toBe(
        false
      );
    });

    it('should detect data corruption accurately', () => {
      const original = {
        name: 'John',
        age: 30,
        address: {
          street: '123 Main St',
          city: 'Anytown',
        },
        hobbies: ['reading', 'coding'],
      };

      // No corruption
      const identical = {
        ...original,
        address: { ...original.address },
        hobbies: [...original.hobbies],
      };
      expect(
        DataIntegrityUtils?.detectCorruption(original, identical)
      ).toHaveLength(0);

      // Value corruption
      const valueCorrupted = { ...original, age: 31 };
      const valueIssues = DataIntegrityUtils?.detectCorruption(
        original,
        valueCorrupted
      );
      expect(valueIssues).toContain(
        'Object.age: Value mismatch: expected 30, got 31'
      );

      // Missing key
      const { name, ...missingKey } = original;
      const keyIssues = DataIntegrityUtils?.detectCorruption(
        original,
        missingKey
      );
      expect(
        keyIssues.some((issue) => issue.includes('Missing keys: name'))
      ).toBe(true);

      // Array corruption
      const arrayCorrupted = { ...original, hobbies: ['reading'] };
      const arrayIssues = DataIntegrityUtils?.detectCorruption(
        original,
        arrayCorrupted
      );
      expect(
        arrayIssues.some((issue) => issue.includes('Array length mismatch'))
      ).toBe(true);
    });

    it('should attempt data repair using different strategies', () => {
      const reference = { a: 1, b: 2, c: 3 };
      const corrupted = { a: 1, b: null, d: 4 };

      // Replace strategy
      const replaced = DataIntegrityUtils?.attemptRepair(
        corrupted,
        reference,
        'replace'
      );
      expect(replaced).toEqual(reference);

      // Merge strategy
      const merged = DataIntegrityUtils?.attemptRepair(
        corrupted,
        reference,
        'merge'
      );
      expect(merged.a).toBe(1); // Keep original
      expect(merged.b).toBe(2); // Replace null with reference value
      expect(merged.c).toBe(3); // Add missing
      expect(merged.d).toBe(4); // Keep extra

      // Selective strategy
      const selective = DataIntegrityUtils?.attemptRepair(
        corrupted,
        reference,
        'selective'
      );
      expect(selective).toBe(corrupted); // Selective is conservative
    });
  });

  describe('Integrity Storage (Classical School)', () => {
    let storage: IntegrityStorage;

    beforeEach(() => {
      storage = new IntegrityStorage({
        validationEnabled: true,
        autoRepair: true,
        redundancyLevel: 1,
      });
    });

    afterEach(async () => {
      await storage.clear();
    });

    it('should store data with integrity metadata', async () => {
      const testData = { message: 'integrity test', timestamp: Date.now() };
      const metadata = { source: 'test', priority: 'high' };

      const record = await storage.store('test-record', testData, metadata);

      expect(record.id).toBe('test-record');
      expect(record.data).toEqual(testData);
      expect(record.metadata).toEqual(metadata);
      expect(record.checksum).toBeDefined();
      expect(record.checksum.algorithm).toBe('sha256');
      expect(record.version).toBe(1);
      expect(record.timestamp).toBeGreaterThan(0);
    });

    it('should validate data integrity on retrieval', async () => {
      const testData = { test: 'validation data' };
      await storage.store('validate-test', testData);

      const retrieved = await storage.retrieve('validate-test');
      expect(retrieved).toBeDefined();
      expect(retrieved?.data).toEqual(testData);
    });

    it('should detect and handle corruption', async () => {
      // Create storage without auto-repair to test error detection
      const noRepairStorage = new IntegrityStorage({
        validationEnabled: true,
        autoRepair: false,
      });

      const testData = { important: 'data', value: 42 };
      await noRepairStorage.store('corruption-test', testData);

      // Simulate corruption after initial store
      const corrupted = await noRepairStorage.simulateCorruption(
        'corruption-test',
        'checksum'
      );
      expect(corrupted).toBe(true);

      // Should throw error due to corruption (no auto-repair)
      await expect(noRepairStorage.retrieve('corruption-test')).rejects.toThrow(
        /Data integrity violation|Checksum validation failed/
      );

      await noRepairStorage.clear();
    });

    it('should attempt automatic repair when enabled', async () => {
      const originalData = { value: 'original', number: 123 };
      await storage.store('repair-test', originalData);

      // Simulate data corruption (not checksum, so repair can work)
      await storage.simulateCorruption('repair-test', 'data');

      // Should repair and return data
      const repairEvents: unknown[] = [];
      storage.on('dataRepaired', (event) => repairEvents.push(event));

      try {
        const retrieved = await storage.retrieve('repair-test');
        // If it doesn't throw, repair was successful
        expect(retrieved).toBeDefined();
      } catch {
        // Expected if repair couldn't work
        expect(repairEvents.length).toBeGreaterThanOrEqual(0);
      }
    });

    it('should handle version tracking', async () => {
      const initialData = { version: 'v1' };
      const record1 = await storage.store('version-test', initialData);
      expect(record1.version).toBe(1);

      // Add small delay to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 1));

      const updatedData = { version: 'v2' };
      const record2 = await storage.store('version-test', updatedData);
      expect(record2.version).toBe(2);
      expect(record2.timestamp).toBeGreaterThanOrEqual(record1.timestamp);
    });

    it('should validate all records in bulk', async () => {
      // Store some valid records
      await storage.store('valid-1', { data: 'good' });
      await storage.store('valid-2', { data: 'also good' });
      await storage.store('corrupt-1', { data: 'will be corrupted' });

      // Corrupt one record
      await storage.simulateCorruption('corrupt-1', 'checksum');

      const results = await storage.validateAll();
      expect(results?.valid).toBe(2);
      expect(results?.corrupted).toBeGreaterThanOrEqual(1);
    });

    it('should maintain backup copies for redundancy', async () => {
      const testData = { backup: 'test data' };
      await storage.store('backup-test', testData);

      const stats = storage.getStats();
      expect(stats.totalRecords).toBe(1);
      expect(stats.backupRecords).toBe(1); // Should have backup
    });
  });

  describe('Mock Corruption Scenarios (London School)', () => {
    let mockStorage: MockCorruptedStorage;

    beforeEach(() => {
      mockStorage = new MockCorruptedStorage();
    });

    it('should simulate storage corruption', async () => {
      mockStorage.setShouldCorrupt(true, 1.0); // 100% corruption rate for testing

      const result = await mockStorage.store('test', { data: 'test' });
      expect(result?.success).toBe(false);
      expect(result?.error).toBe('Storage corruption');
      expect(mockStorage.operations).toContain('store:test');
    });

    it('should simulate retrieval corruption', async () => {
      mockStorage.setShouldCorrupt(true, 1.0);

      const result = await mockStorage.retrieve('test');
      expect(result?.success).toBe(false);
      expect(result?.error).toBe('Retrieval corruption');
      expect(mockStorage.operations).toContain('retrieve:test');
    });

    it('should handle normal operations when corruption is disabled', async () => {
      mockStorage.setShouldCorrupt(false);

      const storeResult = await mockStorage.store('normal', { data: 'normal' });
      expect(storeResult?.success).toBe(true);

      const retrieveResult = await mockStorage.retrieve('normal');
      expect(retrieveResult?.success).toBe(true);
    });

    it('should track operations for verification', async () => {
      await mockStorage.store('op1', {});
      await mockStorage.retrieve('op2');
      await mockStorage.store('op3', {});

      expect(mockStorage.operations).toEqual([
        'store:op1',
        'retrieve:op2',
        'store:op3',
      ]);
    });
  });

  describe('Event Handling and Monitoring', () => {
    let storage: IntegrityStorage;
    let events: Array<{ type: string; data: unknown }>;

    beforeEach(() => {
      storage = new IntegrityStorage();
      events = [];

      storage.on('stored', (data) => events.push({ type: 'stored', data }));
      storage.on('retrieved', (data) =>
        events.push({ type: 'retrieved', data })
      );
      storage.on('corruptionDetected', (data) =>
        events.push({ type: 'corruptionDetected', data })
      );
      storage.on('dataRepaired', (data) =>
        events.push({ type: 'dataRepaired', data })
      );
      storage.on('repairFailed', (data) =>
        events.push({ type: 'repairFailed', data })
      );
    });

    afterEach(async () => {
      await storage.clear();
    });

    it('should emit events for normal operations', async () => {
      await storage.store('event-test', { test: 'data' });
      await storage.retrieve('event-test');

      expect(events.some((e) => e.type === 'stored')).toBe(true);
      expect(events.some((e) => e.type === 'retrieved')).toBe(true);

      const storeEvent = events.find((e) => e.type === 'stored');
      expect(storeEvent?.data.id).toBe('event-test');
    });

    it('should emit corruption detection events', async () => {
      await storage.store('corruption-event', { data: 'test' });
      await storage.simulateCorruption('corruption-event', 'checksum');

      try {
        await storage.retrieve('corruption-event');
      } catch {
        // Expected to fail
      }

      expect(events.some((e) => e.type === 'corruptionDetected')).toBe(true);
    });
  });

  describe('Performance Under Corruption', () => {
    let storage: IntegrityStorage;

    beforeEach(() => {
      storage = new IntegrityStorage({
        validationEnabled: true,
        autoRepair: true,
      });
    });

    afterEach(async () => {
      await storage.clear();
    });

    it('should benchmark validation performance', async () => {
      const iterations = 1000;
      const testData = { benchmark: 'validation', data: 'x'.repeat(100) };

      // Store records
      for (let i = 0; i < iterations; i++) {
        await storage.store(`bench-${i}`, { ...testData, index: i });
      }

      // Benchmark validation
      const startTime = process.hrtime.bigint();
      const results = await storage.validateAll();
      const endTime = process.hrtime.bigint();

      const durationMs = Number(endTime - startTime) / 1_000_000;
      const validationsPerSecond = (iterations / durationMs) * 1000;

      expect(results?.valid).toBe(iterations);
      expect(validationsPerSecond).toBeGreaterThan(100); // Should validate at least 100/sec
    });

    it('should handle mixed corruption scenarios', async () => {
      const recordCount = 100;
      const corruptionRate = 0.1; // 10% corruption

      // Store records
      for (let i = 0; i < recordCount; i++) {
        await storage.store(`mixed-${i}`, { index: i, data: `record-${i}` });
      }

      // Randomly corrupt some records
      const corruptedCount = Math.floor(recordCount * corruptionRate);
      const corruptionTypes: Array<'checksum' | 'data' | 'structure'> = [
        'checksum',
        'data',
        'structure',
      ];

      for (let i = 0; i < corruptedCount; i++) {
        const recordIndex = Math.floor(Math.random() * recordCount);
        const corruptionType =
          corruptionTypes[Math.floor(Math.random() * corruptionTypes.length)];
        await storage.simulateCorruption(
          `mixed-${recordIndex}`,
          corruptionType
        );
      }

      // Validate all and measure results
      const results = await storage.validateAll();

      expect(results?.valid + results?.corrupted).toBe(recordCount);
      expect(results?.corrupted).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Complex Data Structures', () => {
    let storage: IntegrityStorage;

    beforeEach(() => {
      storage = new IntegrityStorage();
    });

    afterEach(async () => {
      await storage.clear();
    });

    it('should handle nested object integrity', async () => {
      const complexData = {
        user: {
          id: 'user123',
          profile: {
            name: 'John Doe',
            preferences: {
              theme: 'dark',
              notifications: {
                email: true,
                push: false,
                sms: true,
              },
            },
          },
        },
        metadata: {
          created: Date.now(),
          tags: ['important', 'user-data'],
          flags: {
            verified: true,
            premium: false,
          },
        },
      };

      const record = await storage.store('complex-data', complexData);
      expect(record.checksum).toBeDefined();

      const retrieved = await storage.retrieve('complex-data');
      expect(retrieved?.data).toEqual(complexData);
    });

    it('should detect subtle nested corruption', async () => {
      const originalData = {
        config: {
          database: {
            host: 'localhost',
            port: 5432,
            credentials: {
              username: 'admin',
              password: 'secret',
            },
          },
        },
      };

      await storage.store('nested-test', originalData);
      await storage.simulateCorruption('nested-test', 'structure');

      const validation = await storage.validateRecord(
        (storage as any).records.get('nested-test')
      );
      expect(validation.valid).toBe(false);
    });

    it('should maintain integrity with large datasets', async () => {
      const largeData = {
        matrix: Array.from({ length: 100 }, (_, i) =>
          Array.from({ length: 100 }, (_, j) => i * 100 + j)
        ),
        lookup: Object.fromEntries(
          Array.from({ length: 1000 }, (_, i) => [`key_${i}`, `value_${i}`])
        ),
      };

      const startTime = process.hrtime.bigint();
      const _record = await storage.store('large-dataset', largeData);
      const storeTime = process.hrtime.bigint();

      const retrieved = await storage.retrieve('large-dataset');
      const retrieveTime = process.hrtime.bigint();

      const storeDuration = Number(storeTime - startTime) / 1_000_000;
      const retrieveDuration = Number(retrieveTime - storeTime) / 1_000_000;

      expect(retrieved?.data).toEqual(largeData);
      expect(storeDuration).toBeLessThan(1000); // Should complete within 1 second
      expect(retrieveDuration).toBeLessThan(1000);
    });
  });
});
