/**
 * Integration Test for Code Analysis Tools
 * Tests the basic functionality of the code analysis integration
 */

import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Code Analysis Integration', () => {
  let testDir;
  let CodeAnalysisService;

  beforeAll(async () => {
    // Import dynamically to avoid module resolution issues
    const module = await import('../../src/services/code-analysis/index.js');
    CodeAnalysisService = module.default;

    testDir = path.join(__dirname, 'test-data');
    await mkdir(testDir, { recursive: true });
    await createTestFiles();
  });

  afterAll(async () => {
    // Cleanup test directory
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Cleanup warning:', error.message);
    }
  });

  test('should initialize analysis service', async () => {
    const service = new CodeAnalysisService({
      projectPath: testDir,
      outputDir: path.join(testDir, 'reports'),
    });

    const result = await service.initialize();
    expect(result.status).toBe('initialized');
    expect(result.analyzers).toContain('ast-parser');
    expect(result.analyzers).toContain('dependency-analyzer');
    expect(result.analyzers).toContain('duplicate-detector');

    await service.cleanup();
  });

  test('should parse AST from test files', async () => {
    const service = new CodeAnalysisService({
      projectPath: testDir,
      outputDir: path.join(testDir, 'reports'),
    });

    await service.initialize();

    const files = [path.join(testDir, 'sample.js'), path.join(testDir, 'class.js')];

    const results = await service.analyzeFiles(files, { updateGraph: false });

    expect(results.files).toHaveLength(2);
    expect(results.functions.length).toBeGreaterThan(0);
    expect(results.classes.length).toBeGreaterThan(0);

    // Check for specific function
    const processFunction = results.functions.find((f) => f.name === 'processData');
    expect(processFunction).toBeDefined();
    expect(processFunction.cyclomatic_complexity).toBeGreaterThan(10);

    await service.cleanup();
  });

  test('should analyze dependencies', async () => {
    const service = new CodeAnalysisService({
      projectPath: testDir,
      outputDir: path.join(testDir, 'reports'),
    });

    await service.initialize();

    const results = await service.analyzeCodebase({
      includeDependencies: true,
      includeDuplicates: false,
      storeInGraph: false,
    });

    expect(results.dependencies).toBeDefined();
    expect(results.dependencies.dependencies.length).toBeGreaterThan(0);

    await service.cleanup();
  });

  test('should detect duplicate code', async () => {
    const service = new CodeAnalysisService({
      projectPath: testDir,
      outputDir: path.join(testDir, 'reports'),
    });

    await service.initialize();

    const results = await service.analyzeCodebase({
      includeDependencies: false,
      includeDuplicates: true,
      storeInGraph: false,
    });

    expect(results.duplicates).toBeDefined();
    expect(results.duplicates.metrics).toBeDefined();

    await service.cleanup();
  });

  test('should generate analysis summary', async () => {
    const service = new CodeAnalysisService({
      projectPath: testDir,
      outputDir: path.join(testDir, 'reports'),
    });

    await service.initialize();

    const results = await service.analyzeCodebase();

    expect(results.summary).toBeDefined();
    expect(results.summary.overview).toBeDefined();
    expect(results.summary.overview.total_files).toBeGreaterThan(0);
    expect(results.summary.overview.total_functions).toBeGreaterThan(0);

    expect(results.summary.quality_metrics).toBeDefined();
    expect(typeof results.summary.quality_metrics.high_complexity_functions).toBe('number');

    await service.cleanup();
  });

  async function createTestFiles() {
    // Sample JavaScript file with complex function
    const sampleJs = `
// Complex function for testing
function processData(data, options = {}) {
  if (!data) {
    return null;
  }
  
  if (options.validate) {
    if (typeof data !== 'object') {
      throw new Error('Invalid data');
    }
    
    if (Array.isArray(data)) {
      for (const i = 0; i < data.length; i++) {
        if (!data[i].id) {
          throw new Error('Missing id');
        }
        
        if (data[i].type === 'user') {
          if (!data[i].email) {
            throw new Error('Missing email');
          }
        } else if (data[i].type === 'admin') {
          if (!data[i].permissions) {
            throw new Error('Missing permissions');
          }
        }
      }
    }
  }
  
  const result = [];
  for (const item of data) {
    if (options.transform) {
      if (item.status === 'active') {
        result.push({ ...item, processed: true });
      } else if (item.status === 'pending') {
        result.push({ ...item, pending: true });
      }
    } else {
      result.push(item);
    }
  }
  
  return result;
}

function simpleFunction(x, y) {
  return x + y;
}

export { processData, simpleFunction };
`;

    // Class file with imports
    const classJs = `
import { processData } from './sample.js';

class DataManager {
  constructor(config = {}) {
    this.config = config;
    this.cache = new Map();
  }
  
  async process(data) {
    const key = this.getKey(data);
    
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    
    const result = processData(data, this.config);
    this.cache.set(key, result);
    return result;
  }
  
  getKey(data) {
    return JSON.stringify(data);
  }
  
  clear() {
    this.cache.clear();
  }
}

export default DataManager;
`;

    // File with duplicate code patterns
    const duplicateJs = `
function transformData(data) {
  return { ...data, processed: true };
}

function processInfo(info) {
  return { ...info, processed: true };
}

export { transformData, processInfo };
`;

    await writeFile(path.join(testDir, 'sample.js'), sampleJs);
    await writeFile(path.join(testDir, 'class.js'), classJs);
    await writeFile(path.join(testDir, 'duplicate.js'), duplicateJs);
  }
});
