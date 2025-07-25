/**
 * Template Manager for Claude Zen
 * Handles template discovery, validation, and installation
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { printSuccess, printError, printWarning } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class TemplateManager {
  constructor() {
    this.templatePaths = [
      path.join(process.cwd(), 'templates'),
      path.join(__dirname, '../../templates'),
      path.join(process.env.HOME || process.env.USERPROFILE, '.claude-zen/templates')
    ];
  }

  /**
   * Discover available templates
   */
  async discoverTemplates() {
    const templates = new Map();

    for (const templatePath of this.templatePaths) {
      try {
        const exists = await fs.access(templatePath).then(() => true).catch(() => false);
        if (!exists) continue;

        const entries = await fs.readdir(templatePath, { withFileTypes: true });
        
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const templateDir = path.join(templatePath, entry.name);
            const manifestPath = path.join(templateDir, 'template.json');
            
            try {
              const manifestContent = await fs.readFile(manifestPath, 'utf8');
              const manifest = JSON.parse(manifestContent);
              
              templates.set(entry.name, {
                name: entry.name,
                path: templateDir,
                manifest,
                source: templatePath
              });
            } catch (error) {
              // Template without manifest - create basic info
              templates.set(entry.name, {
                name: entry.name,
                path: templateDir,
                manifest: {
                  name: entry.name,
                  description: 'Template without manifest',
                  version: '1.0.0'
                },
                source: templatePath
              });
            }
          }
        }
      } catch (error) {
        // Skip inaccessible template paths
        continue;
      }
    }

    return templates;
  }

  /**
   * Get template by name
   */
  async getTemplate(templateName) {
    const templates = await this.discoverTemplates();
    return templates.get(templateName);
  }

  /**
   * List all available templates
   */
  async listTemplates() {
    const templates = await this.discoverTemplates();
    const templateList = Array.from(templates.values());

    if (templateList.length === 0) {
      printWarning('No templates found');
      return [];
    }

    console.log('\\n📦 Available Templates:');
    console.log('='.repeat(50));

    templateList.forEach(template => {
      const { manifest } = template;
      console.log(`\\n🎯 ${manifest.name}`);
      console.log(`   Description: ${manifest.description || 'No description'}`);
      console.log(`   Version: ${manifest.version || '1.0.0'}`);
      console.log(`   Category: ${manifest.category || 'general'}`);
      
      if (manifest.features && manifest.features.length > 0) {
        console.log(`   Features: ${manifest.features.slice(0, 3).join(', ')}${manifest.features.length > 3 ? '...' : ''}`);
      }
      
      console.log(`   Source: ${template.source}`);
    });

    console.log('\\n' + '='.repeat(50));
    return templateList;
  }

  /**
   * Install template to target directory
   */
  async installTemplate(templateName, targetPath, options = {}) {
    const template = await this.getTemplate(templateName);
    
    if (!template) {
      throw new Error(`Template '${templateName}' not found. Run 'claude-zen templates list' to see available templates.`);
    }

    const { force = false, minimal = false, variant = 'enhanced', addPlugins = true } = options;
    const absoluteTargetPath = path.resolve(targetPath);

    // Check if target directory exists and is not empty
    try {
      const targetStats = await fs.stat(absoluteTargetPath);
      if (targetStats.isDirectory()) {
        const entries = await fs.readdir(absoluteTargetPath);
        if (entries.length > 0 && !force) {
          throw new Error(`Directory '${targetPath}' is not empty. Use --force to overwrite.`);
        }
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }

    // Create target directory
    await fs.mkdir(absoluteTargetPath, { recursive: true });

    // Copy template files
    await this.copyTemplateFiles(template.path, absoluteTargetPath, template.manifest, { minimal, variant, addPlugins });

    // Install settings variant
    await this.installSettingsVariant(template.path, absoluteTargetPath, variant);

    // Run post-install setup
    await this.runPostInstall(template.manifest, absoluteTargetPath);

    printSuccess(`✅ Template '${templateName}' installed successfully to ${targetPath}`);
    printSuccess(`🎯 Settings variant '${variant}' configured`);
    
    // Display next steps
    this.displayNextSteps(template.manifest, variant);

    return template;
  }

  /**
   * Copy template files to target directory
   */
  async copyTemplateFiles(sourcePath, targetPath, manifest, options = {}) {
    const { minimal = false } = options;
    
    try {
      const entries = await fs.readdir(sourcePath, { withFileTypes: true });
      
      for (const entry of entries) {
        const sourceFile = path.join(sourcePath, entry.name);
        const targetFile = path.join(targetPath, entry.name);

        // Skip template.json and cache directories
        if (entry.name === 'template.json' || entry.name === 'cache' || entry.name === '.swarm') {
          continue;
        }

        // Skip optional files in minimal mode
        if (minimal && manifest.files && manifest.files[entry.name] && !manifest.files[entry.name].required) {
          continue;
        }

        if (entry.isDirectory()) {
          await fs.mkdir(targetFile, { recursive: true });
          await this.copyTemplateFiles(sourceFile, targetFile, manifest, options);
        } else {
          await fs.copyFile(sourceFile, targetFile);
        }
      }
    } catch (error) {
      throw new Error(`Failed to copy template files: ${error.message}`);
    }
  }

  /**
   * Run post-install setup commands
   */
  async runPostInstall(manifest, targetPath) {
    if (!manifest.setup || !manifest.setup.postInstall) {
      return;
    }

    console.log('\\n🔧 Running post-install setup...');
    
    // Set environment variables
    if (manifest.setup.environment) {
      for (const [key, value] of Object.entries(manifest.setup.environment)) {
        process.env[key] = value;
      }
    }

    // Note: In a real implementation, you might want to actually execute these commands
    // For now, we'll just display them as recommendations
    console.log('\\n📋 Recommended setup commands:');
    manifest.setup.postInstall.forEach(command => {
      console.log(`   ${command}`);
    });
  }

  /**
   * Install settings variant
   */
  async installSettingsVariant(templatePath, targetPath, variant) {
    const variantFile = variant === 'enhanced' ? 'settings.json' : `settings-${variant}.json`;
    const sourcePath = path.join(templatePath, variantFile);
    const targetSettingsPath = path.join(targetPath, '.claude', 'settings.json');
    
    try {
      // Ensure .claude directory exists
      await fs.mkdir(path.join(targetPath, '.claude'), { recursive: true });
      
      // Copy variant settings file
      await fs.copyFile(sourcePath, targetSettingsPath);
      console.log(`📝 Installed ${variant} settings variant`);
    } catch (error) {
      // Fallback to default settings.json if variant doesn't exist
      try {
        const defaultSettingsPath = path.join(templatePath, 'settings.json');
        await fs.copyFile(defaultSettingsPath, targetSettingsPath);
        console.log(`📝 Installed default settings (${variant} variant not found)`);
      } catch (fallbackError) {
        console.warn(`⚠️ Could not install settings variant: ${error.message}`);
      }
    }
  }

  /**
   * Display next steps after template installation
   */
  displayNextSteps(manifest, variant = 'enhanced') {
    console.log('\\n🚀 Next Steps:');
    console.log('='.repeat(30));
    
    if (manifest.setup && manifest.setup.postInstall) {
      console.log('1. Run the setup commands shown above');
      console.log(`2. Your ${variant} settings variant is configured in .claude/settings.json`);
    } else {
      console.log(`1. Your ${variant} settings variant is configured in .claude/settings.json`);
    }
    
    // Show variant-specific next steps
    if (variant === 'optimized') {
      console.log('3. Performance features are enabled - check cache and neural settings');
    } else if (variant === 'basic') {
      console.log('3. Basic configuration - you can upgrade by changing the variant later');
    }
    
    if (manifest.documentation) {
      console.log('3. Read the documentation:');
      if (manifest.documentation.readme) {
        console.log(`   - README: ${manifest.documentation.readme}`);
      }
      if (manifest.documentation.guide) {
        console.log(`   - Guide: ${manifest.documentation.guide}`);
      }
    }
    
    console.log('4. Start developing with: claude-zen --help');
  }

  /**
   * Create a new template from current directory
   */
  async createTemplate(templateName, options = {}) {
    const { description = '', version = '1.0.0', category = 'custom' } = options;
    const sourcePath = process.cwd();
    const targetPath = path.join(sourcePath, 'templates', templateName);

    // Create template directory
    await fs.mkdir(targetPath, { recursive: true });

    // Copy .claude directory if it exists
    const claudePath = path.join(sourcePath, '.claude');
    try {
      await fs.access(claudePath);
      const templateClaudePath = path.join(targetPath, 'claude');
      await this.copyDirectory(claudePath, templateClaudePath);
    } catch (error) {
      printWarning('No .claude directory found to include in template');
    }

    // Create template manifest
    const manifest = {
      name: templateName,
      version,
      description,
      category,
      created: new Date().toISOString(),
      features: [],
      files: {
        'settings.json': {
          description: 'Claude configuration',
          required: true
        }
      }
    };

    await fs.writeFile(
      path.join(targetPath, 'template.json'),
      JSON.stringify(manifest, null, 2)
    );

    printSuccess(`✅ Template '${templateName}' created at ${targetPath}`);
  }

  /**
   * Copy directory recursively
   */
  async copyDirectory(source, target) {
    await fs.mkdir(target, { recursive: true });
    const entries = await fs.readdir(source, { withFileTypes: true });

    for (const entry of entries) {
      const sourceFile = path.join(source, entry.name);
      const targetFile = path.join(target, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(sourceFile, targetFile);
      } else {
        await fs.copyFile(sourceFile, targetFile);
      }
    }
  }
}

export default TemplateManager;