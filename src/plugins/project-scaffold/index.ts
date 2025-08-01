/**
 * Project Scaffold Plugin
 * Creates project templates and scaffolding
 */

import { BasePlugin } from '../base-plugin.js';
import type { PluginManifest, PluginConfig, PluginContext } from '../types.js';

export class ProjectScaffoldPlugin extends BasePlugin {
  private templates = new Map();

  constructor(manifest: PluginManifest, config: PluginConfig, context: PluginContext) {
    super(manifest, config, context);
  }

  async onInitialize(): Promise<void> {
    this.context.logger.info('Project Scaffold Plugin initialized');
    this.loadDefaultTemplates();
  }

  async onStart(): Promise<void> {
    this.context.logger.info('Project Scaffold Plugin started');
  }

  async onStop(): Promise<void> {
    this.context.logger.info('Project Scaffold Plugin stopped');
  }

  async onDestroy(): Promise<void> {
    this.templates.clear();
    this.context.logger.info('Project Scaffold Plugin cleaned up');
  }

  private loadDefaultTemplates(): void {
    this.templates.set('node', {
      name: 'Node.js Project',
      files: [
        { path: 'package.json', content: '{"name": "new-project", "version": "1.0.0"}' },
        { path: 'index.js', content: 'console.log("Hello World");' },
        { path: 'README.md', content: '# New Project\n\nDescription here.' }
      ]
    });

    this.templates.set('typescript', {
      name: 'TypeScript Project',
      files: [
        { path: 'package.json', content: '{"name": "new-project", "version": "1.0.0", "scripts": {"build": "tsc"}}' },
        { path: 'tsconfig.json', content: '{"compilerOptions": {"target": "ES2020", "module": "commonjs"}}' },
        { path: 'src/index.ts', content: 'console.log("Hello TypeScript");' },
        { path: 'README.md', content: '# TypeScript Project\n\nDescription here.' }
      ]
    });
  }

  async createProject(templateName: string, projectName: string, outputPath: string): Promise<any> {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    const createdFiles: string[] = [];
    
    for (const file of template.files) {
      const filePath = `${outputPath}/${file.path}`;
      // In real implementation, would write to file system
      createdFiles.push(filePath);
      this.context.logger.info(`Created file: ${filePath}`);
    }

    return {
      template: templateName,
      projectName,
      outputPath,
      filesCreated: createdFiles
    };
  }

  getAvailableTemplates(): string[] {
    return Array.from(this.templates.keys());
  }

  addTemplate(name: string, template: any): void {
    this.templates.set(name, template);
    this.context.logger.info(`Template '${name}' added`);
  }
}

export default ProjectScaffoldPlugin;