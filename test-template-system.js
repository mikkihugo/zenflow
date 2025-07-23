#!/usr/bin/env node

/**
 * Test script for template system functionality
 */

import { promises as fs } from 'fs';
import path from 'path';
import TemplateManager from './src/cli/template-manager.js';

async function testTemplateSystem() {
  console.log('🧪 Testing Claude Zen Template System');
  console.log('=' .repeat(50));

  const templateManager = new TemplateManager();

  try {
    // Test 1: Discover templates
    console.log('\n📦 Test 1: Template Discovery');
    const templates = await templateManager.discoverTemplates();
    console.log(`Found ${templates.size} templates:`);
    
    for (const [name, template] of templates) {
      console.log(`  • ${name} - ${template.manifest.description || 'No description'}`);
    }

    // Test 2: Get specific template
    console.log('\n🎯 Test 2: Get Template Info');
    const claudeZenTemplate = await templateManager.getTemplate('claude-zen');
    if (claudeZenTemplate) {
      console.log(`✅ claude-zen template found at: ${claudeZenTemplate.path}`);
      console.log(`   Features: ${claudeZenTemplate.manifest.features?.length || 0}`);
    } else {
      console.log('❌ claude-zen template not found');
    }

    // Test 3: List templates (formatted output)
    console.log('\n📋 Test 3: List Templates');
    await templateManager.listTemplates();

    // Test 4: Verify template files
    console.log('\n📁 Test 4: Template File Verification');
    const templatePath = path.join(process.cwd(), 'templates', 'claude-zen');
    
    try {
      const templateStats = await fs.stat(templatePath);
      if (templateStats.isDirectory()) {
        const templateFiles = await fs.readdir(templatePath);
        console.log(`✅ Template directory exists with ${templateFiles.length} files:`);
        templateFiles.forEach(file => {
          console.log(`  • ${file}`);
        });
      }
    } catch (error) {
      console.log(`❌ Template directory error: ${error.message}`);
    }

    // Test 5: Validate template.json
    console.log('\n📋 Test 5: Template Manifest Validation');
    try {
      const manifestPath = path.join(templatePath, 'template.json');
      const manifestContent = await fs.readFile(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestContent);
      
      console.log('✅ Template manifest validation:');
      console.log(`  • Name: ${manifest.name}`);
      console.log(`  • Version: ${manifest.version}`);
      console.log(`  • Features: ${manifest.features?.length || 0}`);
      console.log(`  • Files: ${Object.keys(manifest.files || {}).length}`);
    } catch (error) {
      console.log(`❌ Template manifest error: ${error.message}`);
    }

    console.log('\n✅ Template system tests completed!');
    
  } catch (error) {
    console.error('\n❌ Template system test failed:', error.message);
    process.exit(1);
  }
}

// Run tests
testTemplateSystem().catch(console.error);