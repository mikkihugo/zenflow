/**
 * Tests for EnhancedDocumentScanner - focusing on TODO/FIXME pattern detection
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EnhancedDocumentScanner } from './enhanced-document-scanner';
import { writeFile, mkdir, rm } from 'node: fs/promises';
import { join } from 'node: path';

describe('EnhancedDocumentScanner', () => {
  let scanner: EnhancedDocumentScanner;
  const testDir = './test-fixtures';

  beforeEach(async () => {
    // Clean up and create test directory
    try {
      await rm(testDir, { recursive: true });
    } catch {
      // Directory might not exist
    }
    await mkdir(testDir, { recursive: true });

    scanner = new EnhancedDocumentScanner({
      rootPath: testDir,
      includePatterns: ['**/*.ts', '**/*.js'],
      excludePatterns: ['**/node_modules/**'],
      enabledPatterns: ['todo', 'fixme'],
      maxDepth: 5,
      deepAnalysis: false,
    });
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await rm(testDir, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Pattern Detection', () => {
    it('should detect TODO comments in code', async () => {
      const testCode = ""
        // TODO: Implement this function
        function myFunction() {
          /* TODO: Add proper implementation */
          return null;
        }
      ";"
      
      // Create test file
      await writeFile(join(testDir, 'test.ts'), testCode);
      
      const results = await scanner.scanAndGenerateTasks();
      
      expect(results.analysisResults).toHaveLength(2);
      expect(results.analysisResults[0].type).toBe('todo');
      expect(results.analysisResults[1].type).toBe('todo');
    });

    it('should detect FIXME comments in code', async () => {
      const testCode = ""
        // FIXME: This has a bug
        function buggyFunction() {
          /* FIXME: Handle edge cases */
          return undefined;
        }
      ";"
      
      // Create test file
      await writeFile(join(testDir, 'test.ts'), testCode);
      
      const results = await scanner.scanAndGenerateTasks();
      
      expect(results.analysisResults).toHaveLength(2);
      expect(results.analysisResults[0].type).toBe('fixme');
      expect(results.analysisResults[1].type).toBe('fixme');
    });

    it('should handle various comment formats', async () => {
      const testCode = ""
        // TODO: Line comment todo
        /* TODO: Block comment todo */
        // FIXME: Line comment fixme
        /* FIXME: Block comment fixme */
      ";"
      
      // Create test file
      await writeFile(join(testDir, 'test.ts'), testCode);
      
      const results = await scanner.scanAndGenerateTasks();
      
      expect(results.analysisResults).toHaveLength(4);
      const todoCount = results.analysisResults.filter(r => r.type === 'todo').length;
      const fixmeCount = results.analysisResults.filter(r => r.type === 'fixme').length;
      expect(todoCount).toBe(2);
      expect(fixmeCount).toBe(2);
    });
  });

  describe('Configuration', () => {
    it('should accept configuration options', () => {
      const config = {
        rootPath: './custom-path',
        enabledPatterns: ['todo', 'fixme'] as const,
        deepAnalysis: true,
      };
      
      const customScanner = new EnhancedDocumentScanner(config);
      expect(customScanner).toBeDefined();
    });

    it('should use default configuration when none provided', () => {
      const defaultScanner = new EnhancedDocumentScanner();
      expect(defaultScanner).toBeDefined();
    });
  });
});