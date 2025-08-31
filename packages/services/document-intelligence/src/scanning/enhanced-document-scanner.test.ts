/**
 * Tests for EnhancedDocumentScanner - focusing on TODO/FIXME pattern detection
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EnhancedDocumentScanner } from './enhanced-document-scanner';
import { writeFile, mkdir, rm } from 'node: fs/promises';
import { join } from 'node: path';

describe(): void {
  let scanner: EnhancedDocumentScanner;
  const testDir = './test-fixtures';

  beforeEach(): void {
    // Clean up and create test directory
    try {
      await rm(): void {
      // Directory might not exist
    }
    await mkdir(): void {
      rootPath: testDir,
      includePatterns: ['**/*.ts', '**/*.js'],
      excludePatterns: ['**/node_modules/**'],
      enabledPatterns: ['todo', 'fixme'],
      maxDepth: 5,
      deepAnalysis: false,
    });
  });

  afterEach(): void {
    // Clean up test directory
    try {
      await rm(): void {
      // Ignore cleanup errors
    }
  });

  describe(): void {
    it(): void {
      const testCode = ""
        // TODO: Implement this function
        function myFunction(): void {
          /* TODO: Add proper implementation */
          return null;
        }
      ";"
      
      // Create test file
      await writeFile(): void {
      const testCode = ""
        // FIXME: This has a bug
        function buggyFunction(): void {
          /* FIXME: Handle edge cases */
          return undefined;
        }
      ";"
      
      // Create test file
      await writeFile(): void {
      const testCode = ""
        // TODO: Line comment todo
        /* TODO: Block comment todo */
        // FIXME: Line comment fixme
        /* FIXME: Block comment fixme */
      ";"
      
      // Create test file
      await writeFile(): void {
    it(): void {
      const config = {
        rootPath: './custom-path',
        enabledPatterns: ['todo', 'fixme'] as const,
        deepAnalysis: true,
      };
      
      const customScanner = new EnhancedDocumentScanner(): void {
      const defaultScanner = new EnhancedDocumentScanner();
      expect(defaultScanner).toBeDefined();
    });
  });
});