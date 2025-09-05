/* 
  Tests for Foundation JSON Schema Validation integration.

  Framework:
  - Primary: Jest (ts-jest) conventions
  - Also compatible with Vitest: mock factory auto-detects vi.fn when available

  Scope:
  - SchemaValidationError
  - JsonSchemaManager (loading, registration, modes, validation paths, defaults, stats, async schema loading)
  - Zod helpers: validateInput, createValidator
*/

/* eslint-disable @typescript-eslint/no-explicit-any */

declare const vi: any;     // Allow running under Vitest without adding deps
declare const jest: any;   // Allow running under Jest

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  JsonSchemaManager,
  SchemaValidationError,
  validateInput,
  createValidator,
  z,
} from './schema.validator';

// ---- Test utilities ---------------------------------------------------------

const mkMock = (): any => {
  const g: any = globalThis as any;
  if (g.vi && typeof g.vi.fn === 'function') return g.vi.fn();
  if (g.jest && typeof g.jest.fn === 'function') return g.jest.fn();
  // Minimal fallback mock function
  const f: any = (..._args: any[]) => {};
  f.mock = { calls: [] };
  return f;
};

const writeJSON = (filePath: string, data: any) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

const baseObjectSchema = (modes?: Array<'kanban' | 'agile' | 'safe'>) => {
  const schema: any = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      id: { type: "string" },
      title: { type: "string", default: "Untitled" },
      status: { type: "string", default: "new" },
      points: { type: "integer" }
    },
    required: ["id"],
    additionalProperties: true
  };
  if (modes) {
    schema.metadata = { supportedModes: modes };
  }
  return schema;
};

const createTempSchemasDir = (): string => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'json-schema-manager-'));
  const files: Record<string, any> = {
    'business-epic.json': baseObjectSchema(['kanban', 'agile']),
    'architecture-runway.json': baseObjectSchema(['safe']),
    'program-epic.json': baseObjectSchema(['kanban']),
    'feature.json': baseObjectSchema(), // defaults to all modes
    'story.json': baseObjectSchema(['agile']),
  };
  Object.entries(files).forEach(([name, schema]) => {
    writeJSON(path.join(tmpDir, name), schema);
  });
  return tmpDir;
};

// ---- Tests ------------------------------------------------------------------

describe('SchemaValidationError', () => {
  test('captures message, documentType, and validationErrors', () => {
    const err = new SchemaValidationError('Validation failed', 'user-document', ['name is required']);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('SchemaValidationError');
    expect(err.message).toContain('Validation failed');
    expect((err as any).documentType).toBe('user-document');
    expect((err as any).validationErrors).toEqual(['name is required']);
  });
});

describe('JsonSchemaManager', () => {
  let tmpDir: string;
  let logger: any;
  let manager: JsonSchemaManager;

  beforeAll(() => {
    tmpDir = createTempSchemasDir();
    logger = {
      info: mkMock(),
      error: mkMock(),
    };
    manager = new JsonSchemaManager(logger, tmpDir);
  });

  afterAll(() => {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup issues
    }
  });

  test('loads and registers schemas from directory', () => {
    const types = manager.getAvailableTypes().sort();
    // Filenames mapped: hyphen -> underscore, no extension
    expect(types).toEqual(['architecture_runway', 'business_epic', 'feature', 'program_epic', 'story'].sort());
  });

  test('extracts supported modes from schema metadata or defaults to all', () => {
    // architecture_runway: safe only
    expect(manager.isAvailableInMode('architecture_runway', 'safe')).toBe(true);
    expect(manager.isAvailableInMode('architecture_runway', 'kanban')).toBe(false);
    // feature: defaults to all modes
    expect(manager.isAvailableInMode('feature', 'kanban')).toBe(true);
    expect(manager.isAvailableInMode('feature', 'agile')).toBe(true);
    expect(manager.isAvailableInMode('feature', 'safe')).toBe(true);

    // Private method access (TS private is compile-time): sanity check
    const modes = (manager as any).extractSupportedModes({ metadata: { supportedModes: ['agile'] } });
    expect(modes).toEqual(['agile']);
    const modesDefault = (manager as any).extractSupportedModes({});
    expect(modesDefault.sort()).toEqual(['kanban', 'agile', 'safe'].sort());
  });

  test('validate returns unknown document type error', () => {
    const res = manager.validate('nonexistent', { id: 'x' });
    expect(res.isValid).toBe(false);
    expect(res.errors?.[0]).toContain('Unknown document type');
  });

  test('validate rejects when type not available in mode', () => {
    const res = manager.validate('architecture_runway', { id: 'a1' }, 'agile');
    expect(res.isValid).toBe(false);
    expect(res.errors?.[0]).toContain('not available in agile mode');
  });

  test('validate succeeds for valid data', () => {
    const res = manager.validate('feature', { id: 'F-1', title: 'Feature 1' });
    expect(res.isValid).toBe(true);
    expect(res.data).toEqual({ id: 'F-1', title: 'Feature 1' });
  });

  test('validate fails for invalid data and maps AJV errors', () => {
    const res = manager.validate('feature', {} as any);
    expect(res.isValid).toBe(false);
    expect(res.errors && res.errors.length).toBeGreaterThan(0);
    // AJV message commonly contains "must have required property 'id'"
    expect(res.errors?.join(' ')).toMatch(/required property/i);
  });

  test('validateWithErrors throws SchemaValidationError on failure', () => {
    expect(() => manager.validateWithErrors('feature', {} as any)).toThrow(SchemaValidationError);
  });

  test('validateWithErrors returns data on success', () => {
    const data = { id: 'X-1' };
    const out = manager.validateWithErrors('feature', data);
    expect(out).toEqual(data);
  });

  test('validateWithErrors throws if validation returns no data (defensive path)', () => {
    const spy = ((globalThis as any).vi?.spyOn || (globalThis as any).jest?.spyOn);
    if (typeof spy !== 'function') {
      // If no spy available (unlikely), skip this specific test
      return;
    }
    const s = spy(manager as any, 'validate').mockReturnValue({ isValid: true, data: undefined });
    try {
      expect(() => manager.validateWithErrors('feature', { id: '1' })).toThrow('Validation succeeded but no data returned');
    } finally {
      s.mockRestore();
    }
  });

  test('getSchema returns the registered JSON Schema object or throws', () => {
    const schema = manager.getSchema('feature');
    expect(schema).toBeTruthy();
    expect(() => manager.getSchema('nope')).toThrow(SchemaValidationError);
  });

  test('createDocument applies defaults and augments metadata, then validates', () => {
    const out = manager.createDocument('business_epic', { id: 'BE-1' }, 'agile');
    expect(out).toMatchObject({
      id: 'BE-1',
      status: 'new',               // default from schema
      schema_version: '2.0.0',     // agile
      schema_mode: 'agile',
    });
  });

  test('applyDefaults is a no-op for non-objects and fills defaults for objects', () => {
    const schema = { properties: { foo: { type: 'string', default: 'bar' } } } as any;
    const value1 = (manager as any).applyDefaults(schema, 42);
    const value2 = (manager as any).applyDefaults(schema, ['x']);
    const value3 = (manager as any).applyDefaults(schema, null);
    expect(value1).toBe(42);
    expect(value2).toEqual(['x']);
    expect(value3).toBeNull();

    const value4 = (manager as any).applyDefaults(schema, {});
    expect(value4).toEqual({ foo: 'bar' });
  });

  test('getSchemaVersion returns expected versions per mode', () => {
    expect((manager as any).getSchemaVersion('feature', 'kanban')).toBe('1.0.0');
    expect((manager as any).getSchemaVersion('feature', 'agile')).toBe('2.0.0');
    expect((manager as any).getSchemaVersion('feature', 'safe')).toBe('3.0.0');
  });

  test('getValidationStats aggregates total and per-mode counts', () => {
    const stats = manager.getValidationStats();
    expect(stats.totalSchemas).toBe(5);
    // Based on our fixtures:
    // kanban: business-epic, program-epic, feature => 3
    // agile: business-epic, feature, story => 3
    // safe:  architecture-runway, feature => 2
    expect(stats.schemasByMode.kanban).toBe(3);
    expect(stats.schemasByMode.agile).toBe(3);
    expect(stats.schemasByMode.safe).toBe(2);
    expect(typeof stats.averageValidationTime).toBe('number');
  });

  describe('loadSchemaAsync (external and local)', () => {
    let originalFetch: any;

    beforeAll(() => {
      originalFetch = (globalThis as any).fetch;
    });

    afterAll(() => {
      (globalThis as any).fetch = originalFetch;
    });

    test('loads schema via HTTP(S)', async () => {
      (globalThis as any).fetch = mkMock();
      (globalThis as any).fetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ type: 'object', properties: {} }),
      });

      const result = await (manager as any).loadSchemaAsync('https://example.com/schema.json');
      expect(result).toMatchObject({ type: 'object' });
      expect(logger.info).toHaveBeenCalled();
    });

    test('throws on HTTP error status', async () => {
      (globalThis as any).fetch = mkMock();
      (globalThis as any).fetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({}),
      });

      await expect((manager as any).loadSchemaAsync('https://example.com/missing.json'))
        .rejects.toThrow(/Schema loading failed:HTTP 404/i);
      expect(logger.error).toHaveBeenCalled();
    });

    test('loads schema from file path (file:// and bare path)', async () => {
      const extraPath = path.join(tmpDir, 'extra.json');
      writeJSON(extraPath, { type: 'object', properties: { a: { type: 'string' } } });

      const viaFileScheme = await (manager as any).loadSchemaAsync('file://' + extraPath);
      expect(viaFileScheme).toHaveProperty('properties.a.type', 'string');

      const viaBarePath = await (manager as any).loadSchemaAsync(extraPath);
      expect(viaBarePath).toHaveProperty('properties.a.type', 'string');
    });

    test('rejects unsupported URI schemes', async () => {
      await expect((manager as any).loadSchemaAsync('ftp://example.com/schema.json'))
        .rejects.toThrow(/Schema loading failed:Unsupported URI scheme/i);
      expect(logger.error).toHaveBeenCalled();
    });
  });
});

describe('Zod helpers', () => {
  test('validateInput returns typed data on success', () => {
    const schema = z.object({ id: z.string(), age: z.number().int().min(0).optional() });
    const out = validateInput(schema, { id: 'abc', age: 3 });
    expect(out).toEqual({ id: 'abc', age: 3 });
  });

  test('validateInput throws aggregated error message on failure', () => {
    const schema = z.object({ id: z.string(), age: z.number().int().min(0) });
    expect(() => validateInput(schema, { age: -1 } as any)).toThrow(/Validation failed:/i);
  });

  test('createValidator returns success result shape', () => {
    const schema = z.object({ id: z.string().min(1) });
    const validate = createValidator(schema);
    const result = validate({ id: 'ok' });
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.data).toEqual({ id: 'ok' });
  });

  test('createValidator maps Zod errors with path, message, and code', () => {
    const schema = z.object({ id: z.string().min(2) });
    const validate = createValidator(schema);
    const result = validate({ id: 'x' });
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    // First error should refer to "id"
    expect(result.errors[0].path).toBe('id');
    expect(typeof result.errors[0].message).toBe('string');
    expect(typeof result.errors[0].code).toBe('string');
  });

  test('createValidator handles non-Zod errors gracefully', () => {
    const fakeSchema: any = { parse: () => { throw new Error('boom'); } };
    const validate = createValidator(fakeSchema);
    const result = validate({ anything: true });
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toEqual({ path: '', message: 'Unknown validation error', code: 'unknown' });
    expect(result.data).toBeUndefined();
  });
});