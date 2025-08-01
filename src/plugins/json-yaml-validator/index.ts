/**
 * JSON/YAML Validator Plugin
 * Validates and formats JSON and YAML files
 */

import { BasePlugin } from '../base-plugin.js';
import type { PluginManifest, PluginConfig, PluginContext } from '../types.js';

export class JsonYamlValidatorPlugin extends BasePlugin {
  constructor(manifest: PluginManifest, config: PluginConfig, context: PluginContext) {
    super(manifest, config, context);
  }

  async onInitialize(): Promise<void> {
    this.context.logger.info('JSON/YAML Validator Plugin initialized');
  }

  async onStart(): Promise<void> {
    this.context.logger.info('JSON/YAML Validator Plugin started');
  }

  async onStop(): Promise<void> {
    this.context.logger.info('JSON/YAML Validator Plugin stopped');
  }

  async onDestroy(): Promise<void> {
    this.context.logger.info('JSON/YAML Validator Plugin cleaned up');
  }

  async validateJSON(content: string): Promise<any> {
    try {
      const parsed = JSON.parse(content);
      return { valid: true, parsed, errors: [] };
    } catch (error) {
      return { valid: false, errors: [error instanceof Error ? error.message : 'Invalid JSON'] };
    }
  }

  async validateYAML(content: string): Promise<any> {
    // Simple YAML validation
    const errors: string[] = [];
    if (content.includes('\t')) {
      errors.push('YAML should not contain tabs');
    }
    return { valid: errors.length === 0, errors };
  }
}

export default JsonYamlValidatorPlugin;
