#!/usr/bin/env node
/**
 * @file Test-template processing engine.
 */

import { getLogger } from '../../../config/logging-config.ts';

const logger = getLogger('coordination-swarm-sparc-test-template-engine');

/**
 * Simple test script for SPARC Template Engine.
 * Tests template integration functionality.
 */

import { TemplateEngine } from './core/template-engine.ts';
import type { ProjectSpecification } from './types/sparc-types.ts';

async function testTemplateEngine() {
  const templateEngine = new TemplateEngine();
  const templates = templateEngine.getAllTemplates();
  templates.forEach((_template) => {});

  // Test 2: Create a test project specification
  const testProject: ProjectSpecification = {
    name: 'Test Memory System',
    domain: 'memory-systems',
    complexity: 'moderate',
    requirements: ['Fast data retrieval', 'Caching support', 'Backup functionality'],
    constraints: ['Must use TypeScript', 'Memory usage under 1GB'],
  };
  const bestMatch = templateEngine.findBestTemplate(testProject);

  if (bestMatch) {
    if (bestMatch?.compatibility?.warnings.length > 0) {
      bestMatch?.compatibility?.warnings?.forEach((_warning) => {});
    }
    try {
      const result = await templateEngine.applyTemplate(bestMatch?.template, testProject);

      if (result?.customizations.length > 0) {
        result?.customizations?.forEach((_customization) => {});
      }
      const _stats = templateEngine.getTemplateStats();
    } catch (error) {
      logger.error('❌ Failed to apply template:', error);
    }
  } else {
  }
}

// Run the test if this is the main module
if (process.argv[1] === new URL(import.meta.url).pathname) {
  testTemplateEngine().catch(console.error);
}
