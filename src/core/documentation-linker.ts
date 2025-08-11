/**
 * Unified Documentation Linker - Direct Integration.
 *
 * Links code references to documentation and generates cross-references.
 * Integrated directly into core without plugin architecture.
 */
/**
 * @file Documentation-linker implementation.
 */

import { EventEmitter } from 'node:events';
import { existsSync } from 'node:fs';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { getLogger } from '../config/logging-config.ts';

const logger = getLogger('UnifiedDocLinker');

export interface DocumentationIndex {
  id: string;
  title: string;
  path: string;
  type:
    | 'vision'
    | 'adr'
    | 'prd'
    | 'epic'
    | 'feature'
    | 'task'
    | 'spec'
    | 'readme'
    | 'api'
    | 'guide';
  keywords: string[];
  sections: Array<{
    title: string;
    level: number;
    content: string;
  }>;
  metadata: {
    created: Date;
    modified: Date;
    size: number;
    language?: string;
  };
  links: Array<{
    type: 'internal' | 'external' | 'code';
    target: string;
    text: string;
  }>;
}

export interface CodeReference {
  file: string;
  line: number;
  column?: number;
  type: 'todo' | 'comment' | 'function' | 'class' | 'method' | 'import';
  text: string;
  context: string;
  suggestedLinks: Array<{
    documentId: string;
    title: string;
    relevance: number;
    reason: string;
  }>;
  confidence: number;
}

export interface CrossReference {
  sourceDocument: string;
  targetDocument: string;
  linkType:
    | 'references'
    | 'implements'
    | 'extends'
    | 'validates'
    | 'supersedes';
  confidence: number;
  context: string;
}

export interface LinkSuggestion {
  type: 'missing_doc' | 'broken_link' | 'enhancement' | 'cross_reference';
  source: string;
  target?: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  autoFixable: boolean;
}

export class DocumentationLinker extends EventEmitter {
  private documentationIndex = new Map<string, DocumentationIndex>();
  private codeReferences: CodeReference[] = [];
  private crossReferences: CrossReference[] = [];
  private config: {
    documentationPaths: string[];
    codePaths: string[];
    supportedExtensions: string[];
    excludePatterns: string[];
    keywordThreshold: number;
    confidenceThreshold: number;
  };

  constructor(config: Record<string, unknown> = {}) {
    super();
    this.config = {
      documentationPaths: [
        './docs',
        './adrs',
        './prds',
        './epics',
        './features',
        './tasks',
        './specs',
      ],
      codePaths: ['./src', './lib'],
      supportedExtensions: ['.md', '.txt', '.rst', '.adoc'],
      excludePatterns: ['node_modules', '.git', 'dist', 'build'],
      keywordThreshold: 0.6,
      confidenceThreshold: 0.7,
      ...(config as Record<string, string[] | number>),
    };
  }

  async initialize(): Promise<void> {
    logger.info('Initializing unified documentation linker');

    try {
      // Index all documentation
      await this.indexDocumentation();

      // Analyze code references
      await this.analyzeCodeReferences();

      // Generate cross-references
      await this.generateCrossReferences();

      this.emit('initialized', {
        documentsIndexed: this.documentationIndex.size,
        codeReferences: this.codeReferences.length,
        crossReferences: this.crossReferences.length,
      });

      logger.info('Documentation linker ready');
    } catch (error) {
      logger.error('Failed to initialize documentation linker:', error);
      throw error;
    }
  }

  /**
   * Index all documentation files.
   */
  private async indexDocumentation(): Promise<void> {
    for (const docPath of this.config.documentationPaths) {
      if (existsSync(docPath)) {
        await this.indexDirectory(docPath);
      }
    }

    logger.info(`Indexed ${this.documentationIndex.size} documentation files`);
  }

  private async indexDirectory(directoryPath: string): Promise<void> {
    try {
      const entries = await readdir(directoryPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(directoryPath, entry.name);

        // Skip excluded patterns
        if (
          this.config.excludePatterns.some((pattern) =>
            fullPath.includes(pattern),
          )
        ) {
          continue;
        }

        if (entry.isDirectory()) {
          await this.indexDirectory(fullPath);
        } else if (entry.isFile() && this.isSupportedDocumentFile(entry.name)) {
          await this.indexDocument(fullPath);
        }
      }
    } catch (error) {
      logger.warn(`Failed to index directory ${directoryPath}:`, error);
    }
  }

  private async indexDocument(filePath: string): Promise<void> {
    try {
      const content = await readFile(filePath, 'utf8');
      const stats = await stat(filePath);

      const documentIndex: DocumentationIndex = {
        id: this.generateDocumentId(filePath),
        title: this.extractTitle(content, filePath),
        path: filePath,
        type: this.determineDocumentType(filePath, content),
        keywords: this.extractKeywords(content),
        sections: this.extractSections(content),
        metadata: {
          created: stats.birthtime,
          modified: stats.mtime,
          size: stats.size,
        },
        links: this.extractLinks(content),
      };

      this.documentationIndex.set(documentIndex.id, documentIndex);
      this.emit('document:indexed', documentIndex);
    } catch (error) {
      logger.warn(`Failed to index document ${filePath}:`, error);
    }
  }

  /**
   * Analyze code files for documentation references.
   */
  private async analyzeCodeReferences(): Promise<void> {
    for (const codePath of this.config.codePaths) {
      if (existsSync(codePath)) {
        await this.analyzeCodeDirectory(codePath);
      }
    }

    logger.info(`Found ${this.codeReferences.length} code references`);
  }

  private async analyzeCodeDirectory(directoryPath: string): Promise<void> {
    try {
      const entries = await readdir(directoryPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(directoryPath, entry.name);

        // Skip excluded patterns
        if (
          this.config.excludePatterns.some((pattern) =>
            fullPath.includes(pattern),
          )
        ) {
          continue;
        }

        if (entry.isDirectory()) {
          await this.analyzeCodeDirectory(fullPath);
        } else if (entry.isFile() && this.isCodeFile(entry.name)) {
          await this.analyzeCodeFile(fullPath);
        }
      }
    } catch (error) {
      logger.warn(`Failed to analyze code directory ${directoryPath}:`, error);
    }
  }

  private async analyzeCodeFile(filePath: string): Promise<void> {
    try {
      const content = await readFile(filePath, 'utf8');
      const lines = content.split('\n');

      for (let i = 0 as number; i < lines.length; i++) {
        const line = lines[i];
        const lineNumber = i + 1;

        // Find TODO comments
        if (line) {
          const todoMatch =
            line.match(/\/\/\s*TODO:?\s*(.+)/i) ||
            line.match(/#\s*TODO:?\s*(.+)/i);
          if (todoMatch && todoMatch?.[1]) {
            await this.addCodeReference({
              file: filePath,
              line: lineNumber,
              type: 'todo',
              text: todoMatch?.[1]?.trim(),
              context: this.getContextLines(lines, i, 2),
            });
          }
        }

        // Find documentation comments
        if (line) {
          const docCommentMatch =
            line.match(/\/\*\*\s*(.+?)\s*\*\//s) || line.match(/\*\s*(.+)/);
          if (
            docCommentMatch &&
            docCommentMatch?.[1] &&
            !line.includes('TODO')
          ) {
            await this.addCodeReference({
              file: filePath,
              line: lineNumber,
              type: 'comment',
              text: docCommentMatch?.[1]?.trim(),
              context: this.getContextLines(lines, i, 1),
            });
          }
        }

        // Find function/class definitions that might need documentation
        if (line) {
          const functionMatch = line.match(
            /(?:function|class|interface|type)\s+(\w+)/,
          );
          if (functionMatch) {
            const precedingComment =
              i > 0 && lines[i - 1] ? lines[i - 1]?.trim() : '';
            if (
              precedingComment &&
              !precedingComment.startsWith('//') &&
              !precedingComment.startsWith('*')
            ) {
              await this.addCodeReference({
                file: filePath,
                line: lineNumber,
                type: functionMatch?.[0]?.includes('class')
                  ? 'class'
                  : 'function',
                text: `${functionMatch?.[0]} needs documentation`,
                context: this.getContextLines(lines, i, 3),
              });
            }
          }
        }
      }
    } catch (error) {
      logger.warn(`Failed to analyze code file ${filePath}:`, error);
    }
  }

  private async addCodeReference(
    reference: Omit<CodeReference, 'suggestedLinks' | 'confidence'>,
  ): Promise<void> {
    const suggestedLinks = this.findRelatedDocumentation(reference.text);
    const confidence = this.calculateLinkConfidence(
      reference.text,
      suggestedLinks,
    );

    if (
      confidence >= this.config.confidenceThreshold ||
      suggestedLinks.length > 0
    ) {
      this.codeReferences.push({
        ...reference,
        suggestedLinks,
        confidence,
      });

      this.emit('code:reference:found', {
        ...reference,
        suggestedLinks,
        confidence,
      });
    }
  }

  /**
   * Generate cross-references between documents.
   */
  private async generateCrossReferences(): Promise<void> {
    const documents = Array.from(this.documentationIndex.values());

    for (let i = 0 as number; i < documents.length; i++) {
      for (let j = i + 1; j < documents.length; j++) {
        const doc1 = documents[i];
        const doc2 = documents[j];

        const relationship =
          doc1 && doc2 ? this.analyzeDocumentRelationship(doc1, doc2) : null;
        if (relationship) {
          this.crossReferences.push(relationship);
        }
      }
    }

    logger.info(`Generated ${this.crossReferences.length} cross-references`);
  }

  /**
   * Generate documentation enhancement suggestions.
   */
  async generateLinkSuggestions(): Promise<LinkSuggestion[]> {
    const suggestions: LinkSuggestion[] = [];

    // Missing documentation suggestions
    for (const codeRef of this.codeReferences) {
      if (codeRef.suggestedLinks.length === 0 && codeRef.type === 'todo') {
        suggestions.push({
          type: 'missing_doc',
          source: `${codeRef.file}:${codeRef.line}`,
          description: `Consider creating documentation for: ${codeRef.text}`,
          priority: 'medium',
          autoFixable: false,
        });
      }
    }

    // Enhancement suggestions for existing documentation
    for (const [docId, doc] of this.documentationIndex) {
      const relatedCode = this.codeReferences.filter((ref) =>
        ref.suggestedLinks.some((link) => link.documentId === docId),
      );

      if (relatedCode.length > 0) {
        suggestions.push({
          type: 'enhancement',
          source: doc.path,
          description: `Add links to ${relatedCode.length} related code references`,
          priority: 'low',
          autoFixable: true,
        });
      }
    }

    // Cross-reference suggestions
    for (const crossRef of this.crossReferences) {
      if (crossRef.confidence > 0.8) {
        suggestions.push({
          type: 'cross_reference',
          source: crossRef.sourceDocument,
          target: crossRef.targetDocument,
          description: `Strong relationship detected: ${crossRef.linkType}`,
          priority: 'high',
          autoFixable: true,
        });
      }
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Generate comprehensive documentation report.
   */
  async generateDocumentationReport(): Promise<string> {
    const report: string[] = [];

    report.push('# Documentation Linker Report');
    report.push(`Generated: ${new Date().toISOString()}`);
    report.push('');

    // Summary
    report.push('## Summary');
    report.push(`- **Documents Indexed**: ${this.documentationIndex.size}`);
    report.push(`- **Code References**: ${this.codeReferences.length}`);
    report.push(`- **Cross References**: ${this.crossReferences.length}`);
    report.push('');

    // Document Types
    const typeBreakdown = new Map<string, number>();
    for (const doc of this.documentationIndex.values()) {
      typeBreakdown.set(doc.type, (typeBreakdown.get(doc.type) || 0) + 1);
    }

    report.push('## Document Types');
    for (const [type, count] of typeBreakdown) {
      report.push(`- **${type}**: ${count}`);
    }
    report.push('');

    // High-confidence code references
    const highConfidenceRefs = this.codeReferences.filter(
      (ref) => ref.confidence > 0.8,
    );
    if (highConfidenceRefs.length > 0) {
      report.push('## High-Confidence Code References');
      for (const ref of highConfidenceRefs.slice(0, 10)) {
        report.push(`### ${relative(process.cwd(), ref.file)}:${ref.line}`);
        report.push(`**Type**: ${ref.type}`);
        report.push(`**Text**: ${ref.text}`);
        report.push(`**Confidence**: ${Math.round(ref.confidence * 100)}%`);
        if (ref.suggestedLinks.length > 0) {
          report.push('**Suggested Links**:');
          for (const link of ref.suggestedLinks.slice(0, 3)) {
            report.push(
              `- ${link.title} (${Math.round(link.relevance * 100)}%)`,
            );
          }
        }
        report.push('');
      }
    }

    // Cross-references
    if (this.crossReferences.length > 0) {
      report.push('## Document Cross-References');
      const sortedCrossRefs = this.crossReferences
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 10);

      for (const crossRef of sortedCrossRefs) {
        const sourceDoc = this.documentationIndex.get(crossRef.sourceDocument);
        const targetDoc = this.documentationIndex.get(crossRef.targetDocument);

        if (sourceDoc && targetDoc) {
          report.push(`### ${sourceDoc.title} → ${targetDoc?.title}`);
          report.push(`**Relationship**: ${crossRef.linkType}`);
          report.push(
            `**Confidence**: ${Math.round(crossRef.confidence * 100)}%`,
          );
          report.push(`**Context**: ${crossRef.context}`);
          report.push('');
        }
      }
    }

    // Suggestions
    const suggestions = await this.generateLinkSuggestions();
    if (suggestions.length > 0) {
      report.push('## Improvement Suggestions');
      for (const suggestion of suggestions.slice(0, 15)) {
        report.push(`### ${suggestion.type.replace('_', ' ').toUpperCase()}`);
        report.push(`**Source**: ${suggestion.source}`);
        if (suggestion.target) report.push(`**Target**: ${suggestion.target}`);
        report.push(`**Description**: ${suggestion.description}`);
        report.push(`**Priority**: ${suggestion.priority}`);
        report.push(
          `**Auto-fixable**: ${suggestion.autoFixable ? 'Yes' : 'No'}`,
        );
        report.push('');
      }
    }

    return report.join('\n');
  }

  /**
   * Utility methods.
   *
   * @param text
   */
  private findRelatedDocumentation(text: string): Array<{
    documentId: string;
    title: string;
    relevance: number;
    reason: string;
  }> {
    const related: Array<{
      documentId: string;
      title: string;
      relevance: number;
      reason: string;
    }> = [];

    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/).filter((word) => word.length > 3);

    for (const [docId, doc] of this.documentationIndex) {
      let score = 0 as number;
      const reasons: string[] = [];

      // Check keywords
      for (const keyword of doc.keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          score += 3;
          reasons.push(`keyword: ${keyword}`);
        }
      }

      // Check title similarity
      const titleWords = doc.title.toLowerCase().split(/\s+/);
      for (const word of words) {
        if (
          titleWords.some(
            (titleWord) => titleWord.includes(word) || word.includes(titleWord),
          )
        ) {
          score += 2;
          reasons.push(`title similarity: ${word}`);
        }
      }

      // Check section titles
      for (const section of doc.sections) {
        const sectionTitle = section.title.toLowerCase();
        for (const word of words) {
          if (sectionTitle.includes(word)) {
            score += 1;
            reasons.push(`section: ${section.title}`);
          }
        }
      }

      if (score > 0) {
        const relevance = Math.min(score / 10, 1); // Normalize to 0-1
        related.push({
          documentId: docId,
          title: doc.title,
          relevance,
          reason: reasons.slice(0, 3).join(', '),
        });
      }
    }

    return related.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
  }

  private calculateLinkConfidence(
    text: string,
    suggestedLinks: unknown[],
  ): number {
    if (suggestedLinks.length === 0) return 0;

    const maxRelevance = Math.max(
      ...suggestedLinks.map(
        (link) => (link as { relevance: number }).relevance,
      ),
    );
    const textSpecificity = Math.min(text.length / 100, 1); // Longer text is more specific
    const linkCount = Math.min(suggestedLinks.length / 3, 1); // More links indicate higher relevance

    return maxRelevance * 0.6 + textSpecificity * 0.2 + linkCount * 0.2;
  }

  private analyzeDocumentRelationship(
    doc1: DocumentationIndex,
    doc2: DocumentationIndex,
  ): CrossReference | null {
    // Simple relationship analysis
    const commonKeywords = doc1.keywords.filter((k) =>
      doc2.keywords.includes(k),
    );

    if (commonKeywords.length > 0) {
      let linkType: CrossReference['linkType'] = 'references';
      const confidence =
        commonKeywords.length /
        Math.max(doc1.keywords.length, doc2.keywords.length);

      // Determine relationship type based on document types
      if (doc1.type === 'vision' && doc2.type === 'prd')
        linkType = 'implements';
      else if (doc1.type === 'prd' && doc2.type === 'epic')
        linkType = 'extends';
      else if (doc1.type === 'epic' && doc2.type === 'feature')
        linkType = 'extends';
      else if (doc1.type === 'feature' && doc2.type === 'task')
        linkType = 'extends';

      if (confidence > 0.3) {
        return {
          sourceDocument: doc1.id,
          targetDocument: doc2.id,
          linkType,
          confidence,
          context: `Common keywords: ${commonKeywords.join(', ')}`,
        };
      }
    }

    return null;
  }

  private isSupportedDocumentFile(filename: string): boolean {
    return this.config.supportedExtensions.includes(extname(filename));
  }

  private isCodeFile(filename: string): boolean {
    const codeExtensions = [
      '.js',
      '.ts',
      '.jsx',
      '.tsx',
      '.py',
      '.java',
      '.go',
      '.rs',
      '.cpp',
      '.c',
      '.h',
    ];
    return codeExtensions.includes(extname(filename));
  }

  private generateDocumentId(filePath: string): string {
    return Buffer.from(filePath)
      .toString('base64')
      .replace(/[+/=]/g, '')
      .substring(0, 16);
  }

  private extractTitle(content: string, filePath: string): string {
    // Try to extract title from first heading
    const headingMatch = content.match(/^#\s+(.+)$/m);
    if (headingMatch && headingMatch?.[1]) return headingMatch?.[1]?.trim();

    // Try to extract from filename
    const filename = relative(process.cwd(), filePath).replace(
      extname(filePath),
      '',
    );
    return filename.split('/').pop()?.replace(/[-_]/g, ' ') || 'Untitled';
  }

  private determineDocumentType(
    filePath: string,
    content: string,
  ): DocumentationIndex['type'] {
    const path = filePath.toLowerCase();

    if (path.includes('/vision/')) return 'vision';
    if (path.includes('/adr')) return 'adr';
    if (path.includes('/prd')) return 'prd';
    if (path.includes('/epic')) return 'epic';
    if (path.includes('/feature')) return 'feature';
    if (path.includes('/task')) return 'task';
    if (path.includes('/spec')) return 'spec';
    if (path.includes('readme')) return 'readme';
    if (content.includes('API') || content.includes('api')) return 'api';

    return 'guide';
  }

  private extractKeywords(content: string): string[] {
    const keywords = new Set<string>();

    // Extract from headings
    const headings = content.match(/^#+\s+(.+)$/gm) || [];
    for (const heading of headings) {
      const words = heading
        .replace(/^#+\s+/, '')
        .toLowerCase()
        .split(/\s+/);
      words.forEach((word) => {
        if (word.length > 3) keywords.add(word);
      });
    }

    // Extract important terms (simple approach)
    const importantTerms = content.match(/\*\*([^*]+)\*\*/g) || [];
    for (const term of importantTerms) {
      const word = term.replace(/\*\*/g, '').toLowerCase();
      if (word.length > 3) keywords.add(word);
    }

    return Array.from(keywords).slice(0, 20); // Limit to top 20
  }

  private extractSections(
    content: string,
  ): Array<{ title: string; level: number; content: string }> {
    const sections: Array<{ title: string; level: number; content: string }> =
      [];
    const lines = content.split('\n');

    let currentSection: {
      title: string;
      level: number;
      content: string;
    } | null = null;

    for (const line of lines) {
      const headingMatch = line.match(/^(#+)\s+(.+)$/);

      if (headingMatch) {
        // Save previous section
        if (currentSection) {
          sections.push(currentSection);
        }

        // Start new section
        if (headingMatch?.[1] && headingMatch?.[2]) {
          currentSection = {
            title: headingMatch?.[2]?.trim(),
            level: headingMatch?.[1].length,
            content: '',
          };
        }
      } else if (currentSection) {
        if (currentSection) {
          currentSection.content += `${line}\n`;
        }
      }
    }

    // Save last section
    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }

  private extractLinks(content: string): Array<{
    type: 'internal' | 'external' | 'code';
    target: string;
    text: string;
  }> {
    const links: Array<{
      type: 'internal' | 'external' | 'code';
      target: string;
      text: string;
    }> = [];

    // Markdown links
    const markdownLinks = content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
    for (const link of markdownLinks) {
      const match = link.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match && match?.[1] && match?.[2]) {
        const text = match?.[1];
        const target = match?.[2];
        const type = target.startsWith('http') ? 'external' : 'internal';
        links.push({ type, target, text });
      }
    }

    return links;
  }

  private getContextLines(
    lines: string[],
    lineIndex: number,
    contextSize: number,
  ): string {
    const start = Math.max(0, lineIndex - contextSize);
    const end = Math.min(lines.length, lineIndex + contextSize + 1);
    return lines.slice(start, end).join('\n');
  }

  /**
   * Public API methods.
   */
  getDocumentationIndex(): Map<string, DocumentationIndex> {
    return new Map(this.documentationIndex);
  }

  getCodeReferences(): CodeReference[] {
    return [...this.codeReferences];
  }

  getCrossReferences(): CrossReference[] {
    return [...this.crossReferences];
  }

  async saveReportToFile(outputPath: string): Promise<void> {
    const report = await this.generateDocumentationReport();
    await writeFile(outputPath, report, 'utf8');
    logger.info(`Documentation report saved to: ${outputPath}`);
  }
}
