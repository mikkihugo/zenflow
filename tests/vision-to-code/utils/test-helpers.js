import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Test helper utilities for Vision-to-Code tests
 */
class TestHelpers {
  /**
   * Generate a random test ID
   */
  static generateTestId(prefix = 'test') {
    return `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Create a mock image file for testing
   */
  static async createMockImage(options = {}) {
    const {
      width = 800,
      height = 600,
      format = 'png',
      size = 'medium'
    } = options;

    // Mock image buffer based on size
    const sizeMap = {
      small: 1024 * 100,    // 100KB
      medium: 1024 * 500,   // 500KB
      large: 1024 * 1024 * 2 // 2MB
    };

    const buffer = Buffer.alloc(sizeMap[size] || sizeMap.medium);
    
    // Add mock image headers
    if (format === 'png') {
      // PNG header
      buffer.write('\x89PNG\r\n\x1a\n', 0);
    } else if (format === 'jpg' || format === 'jpeg') {
      // JPEG header
      buffer.write('\xFF\xD8\xFF', 0);
    }

    return {
      buffer,
      metadata: {
        width,
        height,
        format,
        size: buffer.length,
        mimeType: `image/${format}`
      }
    };
  }

  /**
   * Create mock vision analysis result
   */
  static createMockVisionResult(options = {}) {
    const {
      components = ['header', 'navigation', 'content', 'footer'],
      layout = 'grid',
      colors = ['#000000', '#FFFFFF', '#FF0000'],
      confidence = 0.95
    } = options;

    return {
      id: this.generateTestId('vision'),
      timestamp: new Date().toISOString(),
      analysis: {
        components: components.map(name => ({
          type: name,
          bounds: {
            x: Math.random() * 100,
            y: Math.random() * 100,
            width: Math.random() * 200 + 100,
            height: Math.random() * 100 + 50
          },
          confidence: confidence + (Math.random() * 0.05 - 0.025)
        })),
        layout: {
          type: layout,
          columns: layout === 'grid' ? 3 : 1,
          spacing: 16
        },
        colors: {
          primary: colors[0],
          secondary: colors[1],
          accent: colors[2],
          palette: colors
        },
        text: {
          detected: true,
          blocks: []
        }
      },
      metadata: {
        processingTime: Math.random() * 100 + 50,
        modelVersion: '1.0.0',
        confidence
      }
    };
  }

  /**
   * Create mock code generation result
   */
  static createMockCodeResult(options = {}) {
    const {
      framework = 'react',
      language = 'javascript',
      components = ['App', 'Header', 'Content']
    } = options;

    const codeTemplates = {
      react: (name) => `import React from 'react';\n\nexport const ${name} = () => {\n  return <div>${name} Component</div>;\n};`,
      vue: (name) => `<template>\n  <div>${name} Component</div>\n</template>\n\n<script>\nexport default {\n  name: '${name}'\n};\n</script>`,
      angular: (name) => `import { Component } from '@angular/core';\n\n@Component({\n  selector: 'app-${name.toLowerCase()}',\n  template: '<div>${name} Component</div>'\n})\nexport class ${name}Component {}`
    };

    return {
      id: this.generateTestId('code'),
      timestamp: new Date().toISOString(),
      framework,
      language,
      files: components.map(name => ({
        name: `${name}.${language === 'typescript' ? 'tsx' : 'jsx'}`,
        path: `src/components/${name}.${language === 'typescript' ? 'tsx' : 'jsx'}`,
        content: codeTemplates[framework](name),
        size: codeTemplates[framework](name).length
      })),
      metadata: {
        generationTime: Math.random() * 200 + 100,
        linesOfCode: components.length * 10,
        dependencies: {
          [framework]: '^latest'
        }
      }
    };
  }

  /**
   * Wait for a condition to be true
   */
  static async waitForCondition(conditionFn, options = {}) {
    const {
      timeout = 5000,
      interval = 100,
      errorMessage = 'Condition not met within timeout'
    } = options;

    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (await conditionFn()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }

    throw new Error(errorMessage);
  }

  /**
   * Measure async function execution time
   */
  static async measureExecutionTime(fn, label = 'Operation') {
    const start = process.hrtime.bigint();
    const result = await fn();
    const end = process.hrtime.bigint();
    
    const duration = Number(end - start) / 1e6; // Convert to milliseconds
    
    return {
      result,
      duration,
      label,
      pass: duration < 100 // Default threshold
    };
  }

  /**
   * Create a mock HTTP request
   */
  static createMockRequest(options = {}) {
    return {
      method: options.method || 'GET',
      url: options.url || '/',
      headers: options.headers || {},
      body: options.body || {},
      query: options.query || {},
      params: options.params || {},
      user: options.user || null,
      file: options.file || null,
      files: options.files || []
    };
  }

  /**
   * Create a mock HTTP response
   */
  static createMockResponse() {
    const res = {
      statusCode: 200,
      headers: {},
      body: null,
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.headers['Content-Type'] = 'application/json';
        this.body = data;
        return this;
      },
      send: function(data) {
        this.body = data;
        return this;
      },
      setHeader: function(name, value) {
        this.headers[name] = value;
        return this;
      }
    };
    
    return res;
  }

  /**
   * Clean up test files
   */
  static async cleanupTestFiles(directory) {
    try {
      const files = await fs.readdir(directory);
      for (const file of files) {
        if (file.startsWith('test_')) {
          await fs.unlink(path.join(directory, file));
        }
      }
    } catch (error) {
      // Directory might not exist
    }
  }

  /**
   * Generate test data in batches
   */
  static async *generateTestDataBatch(generator, batchSize = 100) {
    let batch = [];
    let count = 0;

    for await (const item of generator) {
      batch.push(item);
      count++;

      if (batch.length >= batchSize) {
        yield batch;
        batch = [];
      }
    }

    if (batch.length > 0) {
      yield batch;
    }
  }

  /**
   * Mock AI service responses
   */
  static mockAIResponse(service, response) {
    const mocks = {
      gemini: () => {
        const gemini = require('@google/generative-ai');
        gemini.GoogleGenerativeAI.mockImplementation(() => ({
          getGenerativeModel: jest.fn(() => ({
            generateContent: jest.fn().mockResolvedValue(response)
          }))
        }));
      },
      openai: () => {
        // Mock OpenAI if needed
      }
    };

    if (mocks[service]) {
      mocks[service]();
    }
  }

  /**
   * Create performance metrics collector
   */
  static createMetricsCollector() {
    const metrics = {
      requests: [],
      errors: [],
      durations: []
    };

    return {
      recordRequest: (endpoint, duration, status) => {
        metrics.requests.push({ endpoint, duration, status, timestamp: Date.now() });
        metrics.durations.push(duration);
      },
      recordError: (error, endpoint) => {
        metrics.errors.push({ error: error.message, endpoint, timestamp: Date.now() });
      },
      getStats: () => {
        const durations = metrics.durations.sort((a, b) => a - b);
        return {
          totalRequests: metrics.requests.length,
          totalErrors: metrics.errors.length,
          averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length || 0,
          p50: durations[Math.floor(durations.length * 0.5)] || 0,
          p95: durations[Math.floor(durations.length * 0.95)] || 0,
          p99: durations[Math.floor(durations.length * 0.99)] || 0
        };
      },
      reset: () => {
        metrics.requests = [];
        metrics.errors = [];
        metrics.durations = [];
      }
    };
  }
}

export default TestHelpers;