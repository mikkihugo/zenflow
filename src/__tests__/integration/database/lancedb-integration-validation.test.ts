/**
 * LanceDB Integration Validation Test
 * Validates that our implementation is correctly integrated
 */

import { describe, expect, it } from 'vitest';

describe('LanceDB Integration Validation', () => {
  it('should have LanceDB dependency available', async () => {
    // Test that we can import LanceDB
    const lancedb = await import('@lancedb/lancedb');
    expect(lancedb).toBeDefined();
    expect(lancedb.connect).toBeDefined();
  });

  it('should have LanceDBAdapter available', async () => {
    // Test that our LanceDBAdapter exists and has required methods
    const { LanceDBAdapter } = await import(
      '../../../database/adapters/lancedb-adapter'
    );
    expect(LanceDBAdapter).toBeDefined();

    const instance = new LanceDBAdapter({
      dbPath: './test-path',
      vectorDim: 128,
    });

    expect(instance['initialize']).toBeDefined();
    expect(instance['searchSimilar']).toBeDefined();
    expect(instance['insertVectors']).toBeDefined();
    expect(instance['getStats']).toBeDefined();
  });

  it('should have LanceDBAdapter available with vector operations', async () => {
    // Test that our adapter has the required vector methods
    const { LanceDBAdapter } = await import(
      '../../../database/providers/database-providers.ts'
    );
    expect(LanceDBAdapter).toBeDefined();

    const mockLogger = {
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
      configure: async () => {},
    };

    const config = {
      type: 'lancedb' as const,
      database: './test.lance',
      options: { vectorSize: 128 },
    };

    const adapter = new LanceDBAdapter(config, mockLogger);

    // Check vector-specific methods exist
    expect(adapter.vectorSearch).toBeDefined();
    expect(adapter.addVectors).toBeDefined();
    expect(adapter.createIndex).toBeDefined();
    expect(adapter.connect).toBeDefined();
    expect(adapter.disconnect).toBeDefined();
    expect(adapter.health).toBeDefined();
    expect(adapter.getSchema).toBeDefined();
  });

  it('should have database controller with vector endpoints', async () => {
    // Test that the controller has vector methods
    const { DatabaseController } = await import(
      '../../../database/controllers/database-controller.ts'
    );
    expect(DatabaseController).toBeDefined();

    // Check that vector methods exist on the prototype
    expect(DatabaseController?.prototype?.vectorSearch).toBeDefined();
    expect(DatabaseController?.prototype?.addVectors).toBeDefined();
    expect(DatabaseController?.prototype?.getVectorStats).toBeDefined();
    expect(DatabaseController?.prototype?.createVectorIndex).toBeDefined();
  });

  it('should have proper vector interfaces defined', async () => {
    // Test that vector interfaces are properly exported
    const module = await import(
      '../../../database/providers/database-providers.ts'
    );

    // These should be available as types, but we can test the class implements them
    expect(module['LanceDBAdapter']).toBeDefined();

    const mockLogger = {
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
      configure: async () => {},
    };

    const adapter = new module['LanceDBAdapter'](
      { type: 'lancedb', database: './test.lance' },
      mockLogger
    );

    // Test that it implements VectorDatabaseAdapter interface
    expect(typeof adapter.vectorSearch).toBe('function');
    expect(typeof adapter.addVectors).toBe('function');
    expect(typeof adapter.createIndex).toBe('function');
  });
});
