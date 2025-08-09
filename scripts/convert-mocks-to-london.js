#!/usr/bin/env node

/**
 * Convert Basic Object Mocks to TDD London Pattern
 * 
 * Scans files for basic mock patterns and suggests TDD London conversions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

class MockToLondonConverter {
  constructor() {
    this.conversionsFound = [];
    this.filesProcessed = 0;
  }

  /**
   * Scan a file for basic mock patterns that need conversion
   */
  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      let conversions = [];
      
      lines.forEach((line, index) => {
        // Pattern 1: const mockXxx = { method: jest.fn() }
        const basicMockMatch = line.match(/const\s+(mock\w+)\s*=\s*\{/);
        if (basicMockMatch) {
          conversions.push({
            type: 'basic-object-mock',
            line: index + 1,
            mockName: basicMockMatch[1],
            suggestion: `Convert to TDD London Mock Class: ${basicMockMatch[1].replace('mock', 'Mock')}Service`
          });
        }

        // Pattern 2: jest.fn().mockResolvedValue/mockReturnValue in object
        if (line.includes('jest.fn().mockResolvedValue') || line.includes('jest.fn().mockReturnValue')) {
          if (line.includes(':')) { // It's a property in an object
            conversions.push({
              type: 'inline-mock-method',
              line: index + 1,
              suggestion: 'Move to mock class with proper typing and helper methods'
            });
          }
        }

        // Pattern 3: Missing expectation helpers
        if (line.includes('expect(') && line.includes('.toHaveBeenCalledWith') && !line.includes('expect')) {
          conversions.push({
            type: 'manual-expectation',
            line: index + 1,
            suggestion: 'Use expectXxxCalled() helper method from TDD London mock'
          });
        }
      });

      if (conversions.length > 0) {
        this.conversionsFound.push({
          file: path.relative(REPO_ROOT, filePath),
          conversions
        });
      }
      
      this.filesProcessed++;
    } catch (error) {
      console.warn(`Failed to scan ${filePath}: ${error.message}`);
    }
  }

  /**
   * Generate TDD London mock class from detected patterns
   */
  generateMockClass(mockName, methods) {
    const className = mockName.replace('mock', 'Mock') + 'Service';
    
    let classCode = `/**
 * TDD London Mock - Tests INTERACTIONS, not state
 */
export class ${className} {
`;

    // Add typed jest.fn() properties
    methods.forEach(method => {
      classCode += `  ${method}: jest.MockedFunction<any> = jest.fn();\n`;
    });

    classCode += `
  constructor() {
    // Configure default return values
`;

    // Add default mock configurations
    methods.forEach(method => {
      classCode += `    this.${method}.mockResolvedValue({ success: true });\n`;
    });

    classCode += `  }

  // TDD London Helper Methods
`;

    // Add expectation helpers
    methods.forEach(method => {
      const expectMethodName = `expect${method.charAt(0).toUpperCase() + method.slice(1)}Called`;
      classCode += `  ${expectMethodName}(...args: any[]) {
    expect(this.${method}).toHaveBeenCalledWith(...args);
    return this;
  }

`;
    });

    classCode += `  clearAllMocks() {
    jest.clearAllMocks();
    return this;
  }
}`;

    return classCode;
  }

  /**
   * Scan directory recursively for test files
   */
  scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        this.scanDirectory(fullPath);
      } else if (item.endsWith('.test.js') || item.endsWith('.test.ts') || item.endsWith('.spec.js') || item.endsWith('.spec.ts')) {
        this.scanFile(fullPath);
      }
    });
  }

  /**
   * Generate conversion report
   */
  generateReport() {
    console.log('🔍 Mock to TDD London Conversion Report');
    console.log('=' .repeat(50));
    console.log(`Files scanned: ${this.filesProcessed}`);
    console.log(`Files needing conversion: ${this.conversionsFound.length}`);
    console.log();

    if (this.conversionsFound.length === 0) {
      console.log('✅ No conversions needed - all mocks follow TDD London patterns!');
      return;
    }

    console.log('📋 Files needing TDD London conversion:');
    console.log();

    this.conversionsFound.forEach(({ file, conversions }) => {
      console.log(`📁 ${file}`);
      conversions.forEach(conversion => {
        console.log(`  Line ${conversion.line}: ${conversion.type}`);
        console.log(`  💡 ${conversion.suggestion}`);
        console.log();
      });
    });

    console.log('🔧 Recommended Actions:');
    console.log('1. Use /src/__tests__/helpers/tdd-london-mock-coordination.ts as reference');
    console.log('2. Convert basic object mocks to Mock classes with Jest.MockedFunction');
    console.log('3. Add expectXxxCalled() helper methods for interaction testing');
    console.log('4. Use setupXxxScenario() methods for test data preparation');
    console.log('5. Add clearAllMocks() calls in afterEach() hooks');
    
    console.log();
    console.log('📊 Summary by Pattern Type:');
    const typeCounts = {};
    this.conversionsFound.forEach(({ conversions }) => {
      conversions.forEach(({ type }) => {
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
    });
    
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`  • ${type}: ${count} occurrences`);
    });
  }

  /**
   * Main conversion process
   */
  run() {
    console.log('🔍 Scanning for mock patterns that need TDD London conversion...');
    
    // Scan test directories
    const testDirs = [
      path.join(REPO_ROOT, 'src/__tests__'),
      path.join(REPO_ROOT, 'tests'),
    ];
    
    testDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        console.log(`Scanning ${dir}...`);
        this.scanDirectory(dir);
      }
    });
    
    this.generateReport();
  }
}

// Run the converter
const converter = new MockToLondonConverter();
converter.run();