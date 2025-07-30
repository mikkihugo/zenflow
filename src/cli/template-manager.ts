/**
 * Template Manager for Claude Zen
 * Handles template discovery, validation, and installation
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { printWarning } from './utils.js';

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

    for(const templatePath of this.templatePaths) {
      try {
        const exists = await fs.access(templatePath).then(() => true).catch(() => false);
        if (!exists) continue;

        const _entries = await fs.readdir(templatePath, {withFileTypes = path.join(templatePath, entry.name);
            const manifestPath = path.join(templateDir, 'template.json');
            
            try {
              const manifestContent = await fs.readFile(manifestPath, 'utf8');
              const _manifest = JSON.parse(manifestContent);
              
              templates.set(entry.name, {name = await this.discoverTemplates();
    return templates.get(templateName);
  }

  /**
   * List all available templates
   */
  async listTemplates() {
    const templates = await this.discoverTemplates();
    const templateList = Array.from(templates.values());

    if(templateList.length === 0) {
      printWarning('No templates found');
      return [];
    }

    console.warn('\\n📦 AvailableTemplates = '.repeat(50));

    templateList.forEach(template => {
      const { manifest } = template;
      console.warn(`\\n🎯 ${manifest.name}`);
      console.warn(`Description = '.repeat(50));
    return templateList;
  }

  /**
   * Install template to target directory
   */
  async installTemplate(templateName, targetPath, options = {}): any {
    const template = await this.getTemplate(templateName);
    
    if(!template) {
      throw new Error(`Template '${templateName}' not found. Run 'claude-zen templates list' to see available templates.`);
    }

    const { force = false, minimal = false, variant = 'enhanced', addPlugins = true } = options;
    const absoluteTargetPath = path.resolve(targetPath);

    // Check if target directory exists and is not empty
    try {
      const targetStats = await fs.stat(absoluteTargetPath);
      if (targetStats.isDirectory()) {
        const entries = await fs.readdir(absoluteTargetPath);
        if(entries.length > 0 && !force) {
          throw new Error(`Directory '${targetPath}' is not empty. Use --force to overwrite.`);
        }
      }
    } catch(error) {
      if(error.code !== 'ENOENT') {
        throw error;
      }
    }

    // Create target directory
    await fs.mkdir(absoluteTargetPath, { recursive = {}): any {
    const { minimal = false } = options;
    
    try {
      const entries = await fs.readdir(sourcePath, {withFileTypes = path.join(sourcePath, entry.name);
        const targetFile = path.join(targetPath, entry.name);

        // Skip template.json and cache directories
        if(entry.name === 'template.json' || entry.name === 'cache' || entry.name === '.swarm') {
          continue;
        }

        // Skip optional files in minimal mode
        if(minimal && manifest.files && manifest.files[entry.name] && !manifest.files[entry.name].required) {
          continue;
        }

        if (entry.isDirectory()) {
          await fs.mkdir(targetFile, {recursive = value;
      }
    }

    // Note => {
      console.warn(`   ${command}`);
    });
  }

  /**
   * Install settings variant
   */
  async installSettingsVariant(templatePath, targetPath, variant): any {
    const variantFile = variant === 'enhanced' ? 'settings.json' : `settings-${variant}.json`;
    const sourcePath = path.join(templatePath, variantFile);
    const targetSettingsPath = path.join(targetPath, '.claude', 'settings.json');
    
    try {
      // Ensure .claude directory exists
      await fs.mkdir(path.join(targetPath, '.claude'), {recursive = path.join(templatePath, 'settings.json');
        await fs.copyFile(defaultSettingsPath, targetSettingsPath);
        console.warn(`📝 Installed default settings (${variant} variant not found)`);
      } catch(fallbackError) {
        console.warn(`⚠️ Could not install settingsvariant = 'enhanced'): any 
    console.warn('\\n🚀 NextSteps = '.repeat(30));
    
    if(manifest.setup?.postInstall) {
      console.warn('1. Run the setup commands shown above');
      console.warn(`2. Your ${variant} settings variant is configured in .claude/settings.json`);
    } else {
      console.warn(`1. Your ${variant} settings variant is configured in .claude/settings.json`);
    }
    
    // Show variant-specific next steps
    if(variant === 'optimized') {
      console.warn('3. Performance features are enabled - check cache and neural settings');
    } else if(variant === 'basic') {
      console.warn('3. Basic configuration - you can upgrade by changing the variant later');
    }
    
    if(manifest.documentation) {
      console.warn('3. Read the documentation = {}): any {
    const { description = '', version = '1.0.0', category = 'custom' } = options;
    const sourcePath = process.cwd();
    const targetPath = path.join(sourcePath, 'templates', templateName);

    // Create template directory
    await fs.mkdir(targetPath, {recursive = path.join(sourcePath, '.claude');
    try {
      await fs.access(claudePath);
      const templateClaudePath = path.join(targetPath, 'claude');
      await this.copyDirectory(claudePath, templateClaudePath);
    } catch(_error) {
      printWarning('No .claude directory found to include in template');
    }

    // Create template manifest
    const _manifest = {name = await fs.readdir(source, {withFileTypes = path.join(source, entry.name);
      const targetFile = path.join(target, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(sourceFile, targetFile);
      } else {
        await fs.copyFile(sourceFile, targetFile);
      }
    }
}

export default TemplateManager;
