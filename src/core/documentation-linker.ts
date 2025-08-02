/**
 * Documentation Linker
 * Links and manages documentation across the system
 * Migrated from plugins to utils domain
 */

import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import * as path from 'node:path';

export interface DocumentLink {
  id: string;
  title: string;
  path: string;
  type: 'markdown' | 'text' | 'code' | 'api' | 'spec';
  category?: string;
  tags?: string[];
  lastModified: Date;
  dependencies?: string[];
  backlinks?: string[];
}

export interface DocumentIndex {
  documents: DocumentLink[];
  categories: Record<string, string[]>;
  tags: Record<string, string[]>;
  graph: Record<string, string[]>;
}

export class DocumentationLinker {
  private documents = new Map<string, DocumentLink>();
  private index: DocumentIndex = {
    documents: [],
    categories: {},
    tags: {},
    graph: {},
  };

  constructor(private basePath: string = './docs') {}

  /**
   * Scan directory for documentation files
   */
  async scanDocuments(): Promise<void> {
    try {
      await this.scanDirectory(this.basePath);
      this.buildIndex();
      console.log(`[DocumentationLinker] Scanned ${this.documents.size} documents`);
    } catch (error) {
      console.error('[DocumentationLinker] Failed to scan documents:', error);
    }
  }

  private async scanDirectory(dirPath: string): Promise<void> {
    try {
      const entries = await readdir(dirPath);

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry);
        const stats = await stat(fullPath);

        if (stats.isDirectory()) {
          await this.scanDirectory(fullPath);
        } else if (this.isDocumentFile(entry)) {
          await this.processDocument(fullPath);
        }
      }
    } catch (error) {
      // Directory might not exist or be accessible
    }
  }

  private isDocumentFile(filename: string): boolean {
    const extensions = ['.md', '.txt', '.rst', '.adoc', '.html'];
    return extensions.some((ext) => filename.toLowerCase().endsWith(ext));
  }

  private async processDocument(filePath: string): Promise<void> {
    try {
      const content = await readFile(filePath, 'utf8');
      const stats = await stat(filePath);

      const doc: DocumentLink = {
        id: this.generateDocumentId(filePath),
        title: this.extractTitle(content, filePath),
        path: filePath,
        type: this.determineDocumentType(filePath, content),
        lastModified: stats.mtime,
        dependencies: this.extractDependencies(content),
        backlinks: [],
      };

      // Extract metadata from frontmatter or comments
      const metadata = this.extractMetadata(content);
      if (metadata.category) doc.category = metadata.category;
      if (metadata.tags) doc.tags = metadata.tags;

      this.documents.set(doc.id, doc);
    } catch (error) {
      console.error(`[DocumentationLinker] Failed to process ${filePath}:`, error);
    }
  }

  private generateDocumentId(filePath: string): string {
    return path
      .relative(this.basePath, filePath)
      .replace(/[/\\]/g, '-')
      .replace(/\.[^.]+$/, '');
  }

  private extractTitle(content: string, filePath: string): string {
    // Try to extract title from first heading
    const headingMatch = content.match(/^#\s+(.+)$/m);
    if (headingMatch) {
      return headingMatch[1].trim();
    }

    // Try to extract from HTML title
    const htmlTitleMatch = content.match(/<title>([^<]+)<\/title>/i);
    if (htmlTitleMatch) {
      return htmlTitleMatch[1].trim();
    }

    // Fall back to filename
    return path.basename(filePath, path.extname(filePath));
  }

  private determineDocumentType(filePath: string, content: string): DocumentLink['type'] {
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.md') {
      if (content.includes('## API') || content.includes('### Endpoints')) {
        return 'api';
      }
      if (content.includes('## Specification') || content.includes('### Requirements')) {
        return 'spec';
      }
      return 'markdown';
    }

    if (['.js', '.ts', '.py', '.rs', '.go'].includes(ext)) {
      return 'code';
    }

    return 'text';
  }

  private extractDependencies(content: string): string[] {
    const dependencies: string[] = [];

    // Extract markdown links
    const markdownLinks = content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
    markdownLinks.forEach((link) => {
      const match = link.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if ((match && match[2].startsWith('./')) || match[2].startsWith('../')) {
        dependencies.push(match[2]);
      }
    });

    // Extract relative imports/requires
    const importMatches =
      content.match(/(?:import|require|include)\s+['"](\.\.?\/[^'"]+)['"]/g) || [];
    importMatches.forEach((imp) => {
      const match = imp.match(/['"](\.\.?\/[^'"]+)['"]/);
      if (match) dependencies.push(match[1]);
    });

    return [...new Set(dependencies)];
  }

  private extractMetadata(content: string): any {
    const metadata: any = {};

    // YAML frontmatter
    const yamlMatch = content.match(/^---\\n([\\s\\S]*?)\\n---/);
    if (yamlMatch) {
      const yamlContent = yamlMatch[1];
      const lines = yamlContent.split('\n');

      for (const line of lines) {
        const match = line.match(/^(\w+):\s*(.+)$/);
        if (match) {
          const key = match[1];
          let value: any = match[2].trim();

          // Parse arrays
          if (value.startsWith('[') && value.endsWith(']')) {
            value = value
              .slice(1, -1)
              .split(',')
              .map((s) => s.trim().replace(/['"]/g, ''));
          }

          metadata[key] = value;
        }
      }
    }

    // HTML meta tags
    const metaTags = content.match(/<meta\s+name="([^"]+)"\s+content="([^"]+)"/g) || [];
    metaTags.forEach((tag) => {
      const match = tag.match(/<meta\s+name="([^"]+)"\s+content="([^"]+)"/);
      if (match) {
        metadata[match[1]] = match[2];
      }
    });

    return metadata;
  }

  private buildIndex(): void {
    this.index.documents = Array.from(this.documents.values());
    this.index.categories = {};
    this.index.tags = {};
    this.index.graph = {};

    // Build categories and tags indices
    for (const doc of this.index.documents) {
      if (doc.category) {
        if (!this.index.categories[doc.category]) {
          this.index.categories[doc.category] = [];
        }
        this.index.categories[doc.category].push(doc.id);
      }

      if (doc.tags) {
        for (const tag of doc.tags) {
          if (!this.index.tags[tag]) {
            this.index.tags[tag] = [];
          }
          this.index.tags[tag].push(doc.id);
        }
      }

      // Build dependency graph
      if (doc.dependencies) {
        this.index.graph[doc.id] = doc.dependencies
          .map((dep) => this.resolveDocumentId(dep, doc.path))
          .filter((id) => id && this.documents.has(id));
      }
    }

    // Build backlinks
    for (const [docId, dependencies] of Object.entries(this.index.graph)) {
      for (const depId of dependencies) {
        const depDoc = this.documents.get(depId);
        if (depDoc) {
          if (!depDoc.backlinks) depDoc.backlinks = [];
          if (!depDoc.backlinks.includes(docId)) {
            depDoc.backlinks.push(docId);
          }
        }
      }
    }
  }

  private resolveDocumentId(relativePath: string, fromPath: string): string | null {
    try {
      const resolvedPath = path.resolve(path.dirname(fromPath), relativePath);
      const relativeToBase = path.relative(this.basePath, resolvedPath);
      return relativeToBase.replace(/[/\\]/g, '-').replace(/\.[^.]+$/, '');
    } catch {
      return null;
    }
  }

  /**
   * Get document by ID
   */
  getDocument(id: string): DocumentLink | undefined {
    return this.documents.get(id);
  }

  /**
   * Search documents by text
   */
  searchDocuments(query: string): DocumentLink[] {
    const lowerQuery = query.toLowerCase();
    return this.index.documents.filter(
      (doc) =>
        doc.title.toLowerCase().includes(lowerQuery) ||
        doc.id.toLowerCase().includes(lowerQuery) ||
        doc.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
        doc.category?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get documents by category
   */
  getDocumentsByCategory(category: string): DocumentLink[] {
    const docIds = this.index.categories[category] || [];
    return docIds.map((id) => this.documents.get(id)!).filter(Boolean);
  }

  /**
   * Get documents by tag
   */
  getDocumentsByTag(tag: string): DocumentLink[] {
    const docIds = this.index.tags[tag] || [];
    return docIds.map((id) => this.documents.get(id)!).filter(Boolean);
  }

  /**
   * Get document dependencies
   */
  getDependencies(docId: string): DocumentLink[] {
    const dependencies = this.index.graph[docId] || [];
    return dependencies.map((id) => this.documents.get(id)!).filter(Boolean);
  }

  /**
   * Get documents that depend on this one
   */
  getBacklinks(docId: string): DocumentLink[] {
    const doc = this.documents.get(docId);
    if (!doc || !doc.backlinks) return [];

    return doc.backlinks.map((id) => this.documents.get(id)!).filter(Boolean);
  }

  /**
   * Generate documentation site map
   */
  generateSiteMap(): any {
    const siteMap = {
      totalDocuments: this.index.documents.length,
      categories: Object.keys(this.index.categories).map((cat) => ({
        name: cat,
        count: this.index.categories[cat].length,
        documents: this.index.categories[cat],
      })),
      tags: Object.keys(this.index.tags).map((tag) => ({
        name: tag,
        count: this.index.tags[tag].length,
        documents: this.index.tags[tag],
      })),
      orphanedDocuments: this.index.documents
        .filter((doc) => !doc.category && (!doc.tags || doc.tags.length === 0))
        .map((doc) => doc.id),
      brokenLinks: this.findBrokenLinks(),
    };

    return siteMap;
  }

  private findBrokenLinks(): Array<{ document: string; brokenLink: string }> {
    const broken: Array<{ document: string; brokenLink: string }> = [];

    for (const [docId, dependencies] of Object.entries(this.index.graph)) {
      for (const dep of dependencies) {
        if (!this.documents.has(dep)) {
          broken.push({ document: docId, brokenLink: dep });
        }
      }
    }

    return broken;
  }

  /**
   * Export documentation index
   */
  async exportIndex(outputPath: string): Promise<void> {
    const exportData = {
      ...this.index,
      generatedAt: new Date().toISOString(),
      basePath: this.basePath,
    };

    await writeFile(outputPath, JSON.stringify(exportData, null, 2));
    console.log(`[DocumentationLinker] Index exported to ${outputPath}`);
  }

  /**
   * Get full index
   */
  getIndex(): DocumentIndex {
    return { ...this.index };
  }
}

export default DocumentationLinker;
