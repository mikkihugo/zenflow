/**
 * Markdown Scanner Plugin
 * Scans and analyzes markdown files
 */

import { BasePlugin } from '../base-plugin.js';
import type { PluginConfig, PluginContext, PluginManifest } from '../types.js';

export class MarkdownScannerPlugin extends BasePlugin {
  constructor(manifest: PluginManifest, config: PluginConfig, context: PluginContext) {
    super(manifest, config, context);
  }

  async onInitialize(): Promise<void> {
    this.context.logger.info('Markdown Scanner Plugin initialized');
  }

  async onStart(): Promise<void> {
    this.context.logger.info('Markdown Scanner Plugin started');
  }

  async onStop(): Promise<void> {
    this.context.logger.info('Markdown Scanner Plugin stopped');
  }

  async onDestroy(): Promise<void> {
    this.context.logger.info('Markdown Scanner Plugin cleaned up');
  }

  async scanMarkdown(content: string): Promise<any> {
    const lines = content.split('\n');
    const headers: string[] = [];
    const links: string[] = [];

    for (const line of lines) {
      if (line.startsWith('#')) {
        headers.push(line);
      }
      const linkMatches = line.match(/\[([^\]]+)\]\(([^)]+)\)/g);
      if (linkMatches) {
        links.push(...linkMatches);
      }
    }

    return { headers, links, lineCount: lines.length };
  }
}

export default MarkdownScannerPlugin;
