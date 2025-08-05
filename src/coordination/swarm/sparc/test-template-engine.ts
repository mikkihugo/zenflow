#!/usr/bin/env node
/**
 * Simple test script for SPARC Template Engine
 * Tests template integration functionality
 */

import { TemplateEngine } from './core/template-engine';
import type { ProjectSpecification } from './types/sparc-types';

async function testTemplateEngine() {
  console.log('🧪 Testing SPARC Template Engine...\n');

  const templateEngine = new TemplateEngine();

  // Test 1: List available templates
  console.log('📋 Available Templates:');
  const templates = templateEngine.getAllTemplates();
  templates.forEach(template => {
    console.log(`  • ${template.name} (${template.domain}) - ${template.description}`);
  });
  console.log('');

  // Test 2: Create a test project specification
  const testProject: ProjectSpecification = {
    name: 'Test Memory System',
    domain: 'memory-systems',
    complexity: 'moderate',
    requirements: [
      'Fast data retrieval',
      'Caching support',
      'Backup functionality',
    ],
    constraints: [
      'Must use TypeScript',
      'Memory usage under 1GB',
    ],
  };

  console.log(`🔧 Testing project: ${testProject.name}`);
  console.log(`   Domain: ${testProject.domain}`);
  console.log(`   Complexity: ${testProject.complexity}`);
  console.log(`   Requirements: ${testProject.requirements.length}`);

  // Test 3: Find best template
  console.log('\n🎯 Finding best template...');
  const bestMatch = templateEngine.findBestTemplate(testProject);
  
  if (bestMatch) {
    console.log(`✅ Best match: ${bestMatch.template.name}`);
    console.log(`   Compatibility: ${(bestMatch.compatibility.score * 100).toFixed(1)}%`);
    console.log(`   Warnings: ${bestMatch.compatibility.warnings.length}`);
    
    if (bestMatch.compatibility.warnings.length > 0) {
      bestMatch.compatibility.warnings.forEach(warning => {
        console.log(`   ⚠️ ${warning}`);
      });
    }

    // Test 4: Apply template
    console.log('\n🔧 Applying template...');
    try {
      const result = await templateEngine.applyTemplate(bestMatch.template, testProject);
      
      console.log('✅ Template applied successfully!');
      console.log(`   Functional Requirements: ${result.specification.functionalRequirements.length}`);
      console.log(`   Non-Functional Requirements: ${result.specification.nonFunctionalRequirements.length}`);
      console.log(`   Constraints: ${result.specification.constraints?.length || 0}`);
      console.log(`   Customizations: ${result.customizations.length}`);
      
      if (result.customizations.length > 0) {
        console.log('   📝 Customizations:');
        result.customizations.forEach(customization => {
          console.log(`     • ${customization}`);
        });
      }

      // Test 5: Template stats
      console.log('\n📊 Template Engine Stats:');
      const stats = templateEngine.getTemplateStats();
      console.log(`   Total templates: ${stats.totalTemplates}`);
      console.log(`   Domain coverage:`, stats.domainCoverage);
      console.log(`   Most used: ${stats.mostUsed.join(', ') || 'None yet'}`);

      console.log('\n🎉 All tests passed!');

    } catch (error) {
      console.error('❌ Failed to apply template:', error);
    }
  } else {
    console.log('❌ No suitable template found');
  }
}

// Run the test if this is the main module
if (process.argv[1] === new URL(import.meta.url).pathname) {
  testTemplateEngine().catch(console.error);
}