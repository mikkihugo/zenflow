/**
 * Documentation Linker Plugin
 * Links code references to documentation and generates cross-references
 */

import { BasePlugin } from '../base-plugin.js';
import type { PluginManifest, PluginConfig, PluginContext } from '../types.js';

export class DocumentationLinkerPlugin extends BasePlugin {
  private linkMap = new Map();
  private documentationCache = new Map();

  constructor(manifest: PluginManifest, config: PluginConfig, context: PluginContext) {
    super(manifest, config, context);
  }

  async onInitialize(): Promise<void> {
    this.context.logger.info('Documentation Linker Plugin initialized');
    await this.loadDocumentationIndex();
  }

  async onStart(): Promise<void> {
    this.context.logger.info('Documentation Linker Plugin started');
  }

  async onStop(): Promise<void> {
    this.context.logger.info('Documentation Linker Plugin stopped');
  }

  async onDestroy(): Promise<void> {
    await this.cleanup();
  }

  private async loadDocumentationIndex(): Promise<void> {
    // Load documentation index from configured sources
    const sources = this.config.settings?.documentationSources || ['./docs', './README.md'];
    
    for (const source of sources as string[]) {
      try {
        await this.indexDocumentationSource(source);
      } catch (error) {
        this.context.logger.warn(`Failed to index documentation source: ${source}`, error);
      }
    }

    this.context.logger.info(`Indexed ${this.documentationCache.size} documentation entries`);
  }

  private async indexDocumentationSource(source: string): Promise<void> {
    // Mock implementation - would scan actual documentation files
    this.documentationCache.set('getting-started', {
      title: 'Getting Started',
      path: './docs/getting-started.md',
      keywords: ['setup', 'installation', 'quickstart'],
      sections: ['Prerequisites', 'Installation', 'Configuration']
    });

    this.documentationCache.set('api-reference', {
      title: 'API Reference',
      path: './docs/api.md',
      keywords: ['api', 'methods', 'functions', 'classes'],
      sections: ['Core API', 'Plugin API', 'Utilities']
    });
  }

  /**
   * Generate links between code and documentation
   */
  async generateLinks(codeFiles: string[]): Promise<any> {
    const links: any[] = [];

    for (const file of codeFiles) {
      try {
        const fileLinks = await this.analyzeFileForLinks(file);
        links.push(...fileLinks);
      } catch (error) {
        this.context.logger.warn(`Failed to analyze file for links: ${file}`, error);
      }
    }

    return {
      totalFiles: codeFiles.length,
      totalLinks: links.length,
      links,
      linksByType: this.groupLinksByType(links)
    };
  }

  private async analyzeFileForLinks(file: string): Promise<any[]> {
    const links: any[] = [];
    
    // Mock file content analysis
    const content = await this.readFile(file);
    
    // Find TODO comments that could link to documentation
    const todoMatches = content.matchAll(/\/\/ TODO: (.*)/g);
    for (const match of todoMatches) {
      const todoText = match[1];
      const relatedDocs = this.findRelatedDocumentation(todoText);
      
      if (relatedDocs.length > 0) {
        links.push({
          type: 'todo-to-docs',
          file,
          line: this.getLineNumber(content, match.index!),
          text: todoText,
          suggestedLinks: relatedDocs,
          confidence: this.calculateLinkConfidence(todoText, relatedDocs)
        });
      }
    }

    // Find function/class comments that could be enhanced
    const commentMatches = content.matchAll(/\/\*\*(.*?)\*\//gs);
    for (const match of commentMatches) {
      const comment = match[1];
      const relatedDocs = this.findRelatedDocumentation(comment);
      
      if (relatedDocs.length > 0) {
        links.push({
          type: 'comment-enhancement',
          file,
          line: this.getLineNumber(content, match.index!),
          existingComment: comment.trim(),
          suggestedLinks: relatedDocs,
          confidence: this.calculateLinkConfidence(comment, relatedDocs)
        });
      }
    }

    return links;
  }

  private async readFile(file: string): Promise<string> {
    // Mock implementation
    return `/**
 * Main application class
 * TODO: Add link to getting started guide
 */
class App {
  // TODO: Document the configuration options
  constructor(config) {
    this.config = config;
  }
}`;
  }

  private findRelatedDocumentation(text: string): any[] {
    const related: any[] = [];
    const lowerText = text.toLowerCase();

    for (const [key, doc] of this.documentationCache) {
      let score = 0;

      // Check keywords
      for (const keyword of (doc as any).keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          score += 2;
        }
      }

      // Check title similarity
      if (lowerText.includes((doc as any).title.toLowerCase())) {
        score += 3;
      }

      // Check section matches
      for (const section of (doc as any).sections) {
        if (lowerText.includes(section.toLowerCase())) {
          score += 1;
        }
      }

      if (score > 0) {
        related.push({
          key,
          title: (doc as any).title,
          path: (doc as any).path,
          score,
          relevantSections: (doc as any).sections.filter((s: string) => 
            lowerText.includes(s.toLowerCase())
          )
        });
      }
    }

    return related.sort((a, b) => b.score - a.score);
  }

  private calculateLinkConfidence(text: string, relatedDocs: any[]): number {
    if (relatedDocs.length === 0) return 0;
    
    const maxScore = Math.max(...relatedDocs.map(d => d.score));
    const textLength = text.length;
    
    // Higher confidence for shorter, more specific text with high-scoring matches
    let confidence = Math.min(maxScore / 5, 1) * 100;
    
    // Adjust for text specificity
    if (textLength < 50) confidence *= 1.2;
    else if (textLength > 200) confidence *= 0.8;
    
    return Math.round(Math.min(confidence, 100));
  }

  private getLineNumber(content: string, position: number): number {
    return content.substring(0, position).split('\n').length;
  }

  private groupLinksByType(links: any[]): any {
    return links.reduce((acc, link) => {
      acc[link.type] = (acc[link.type] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Generate cross-reference documentation
   */
  async generateCrossReferences(): Promise<string> {
    const links = Array.from(this.linkMap.values()).flat();
    
    let crossRef = '# Cross-Reference Documentation\n\n';
    
    // Group by documentation source
    const bySource = new Map();
    for (const link of links) {
      for (const doc of link.suggestedLinks) {
        if (!bySource.has(doc.path)) {
          bySource.set(doc.path, []);
        }
        bySource.get(doc.path).push({
          file: link.file,
          line: link.line,
          type: link.type,
          text: link.text || link.existingComment
        });
      }
    }

    for (const [docPath, references] of bySource) {
      crossRef += `## ${docPath}\n\n`;
      crossRef += 'Referenced by:\n\n';
      
      for (const ref of references) {
        crossRef += `- **${ref.file}:${ref.line}** (${ref.type})\n`;
        crossRef += `  _${ref.text.substring(0, 100)}${ref.text.length > 100 ? '...' : ''}_\n\n`;
      }
    }

    return crossRef;
  }

  /**
   * Get linking capabilities
   */
  getCapabilities(): any {
    return {
      linkTypes: ['todo-to-docs', 'comment-enhancement', 'api-reference'],
      documentationFormats: ['markdown', 'html', 'rst'],
      features: [
        'automatic-link-detection',
        'confidence-scoring',
        'cross-reference-generation',
        'keyword-matching'
      ]
    };
  }

  async cleanup(): Promise<void> {
    this.linkMap.clear();
    this.documentationCache.clear();
    this.context.logger.info('Documentation Linker Plugin cleaned up');
  }
}

export default DocumentationLinkerPlugin;