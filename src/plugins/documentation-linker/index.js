/**
 * Documentation Linker Plugin
 * Cross-reference validation, broken link detection, and intelligent linking suggestions
 */

import { readFile, writeFile, mkdir, access } from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { safeRegexExec } from '../../utils/security.js';

export class DocumentationLinkerPlugin {
  constructor(config = {}) {
    this.config = {
      documentPaths: ['**/*.md', 'docs/**/*', 'README*'],
      ignorePaths: ['node_modules/**', '.git/**', '.hive-mind/**', 'dist/**'],
      linkCheckTimeout: 5000,
      similarityThreshold: 0.7,
      keywordMinLength: 3,
      maxKeywords: 20,
      linkSuggestionThreshold: 2,
      outputDir: '.hive-mind/documentation',
      ...config
    };
    
    this.documents = new Map();
    this.linkMap = new Map();
    this.brokenLinks = [];
    this.suggestions = [];
    this.stats = {
      documentsProcessed: 0,
      linksFound: 0,
      brokenLinksFound: 0,
      suggestionsGenerated: 0,
      crossReferencesCreated: 0
    };
  }

  async initialize() {
    console.log('📚 Documentation Linker Plugin initialized');
    
    // Ensure output directory exists
    await mkdir(this.config.outputDir, { recursive: true });
    
    // Discover and analyze documents
    await this.discoverDocuments();
    
    // Build link map
    await this.buildLinkMap();
    
    // Validate links
    await this.validateLinks();
    
    // Generate intelligent suggestions
    await this.generateLinkSuggestions();
  }

  async discoverDocuments() {
    console.log('🔍 Discovering documentation files...');
    
    const { glob } = await import('glob');
    const documentFiles = [];
    
    // Find all documentation files
    for (const pattern of this.config.documentPaths) {
      try {
        const matches = await glob(pattern, {
          ignore: this.config.ignorePaths,
          nodir: true
        });
        documentFiles.push(...matches);
      } catch (error) {
        console.warn(`⚠️ Pattern ${pattern} failed: ${error.message}`);
      }
    }
    
    // Remove duplicates and process each file
    const uniqueFiles = [...new Set(documentFiles)];
    
    for (const filePath of uniqueFiles) {
      await this.processDocument(filePath);
    }
    
    this.stats.documentsProcessed = this.documents.size;
    console.log(`📄 Processed ${this.stats.documentsProcessed} documents`);
  }

  async processDocument(filePath) {
    try {
      const content = await readFile(filePath, 'utf8');
      const ext = path.extname(filePath).toLowerCase();
      
      let document = {
        filePath: filePath,
        fileName: path.basename(filePath),
        directory: path.dirname(filePath),
        extension: ext,
        title: null,
        content: content,
        frontMatter: {},
        links: [],
        images: [],
        anchors: [],
        keywords: [],
        wordCount: 0,
        lastModified: new Date(),
        processed: new Date()
      };
      
      // Parse based on file type
      if (ext === '.md' || ext === '.mdx') {
        document = await this.parseMarkdown(document);
      } else if (ext === '.rst') {
        document = await this.parseRestructuredText(document);
      } else if (ext === '.adoc' || ext === '.asciidoc') {
        document = await this.parseAsciidoc(document);
      } else {
        document = await this.parseGenericText(document);
      }
      
      // Extract keywords
      document.keywords = this.extractKeywords(document.content);
      document.wordCount = this.countWords(document.content);
      
      this.documents.set(filePath, document);
      
    } catch (error) {
      console.warn(`⚠️ Failed to process ${filePath}: ${error.message}`);
    }
  }

  async parseMarkdown(document) {
    try {
      const parsed = matter(document.content);
      
      document.frontMatter = parsed.data;
      document.content = parsed.content;
      document.title = parsed.data.title || 
                     this.extractMarkdownTitle(parsed.content) || 
                     path.basename(document.filePath, '.md');
      
      // Extract links
      document.links = this.extractMarkdownLinks(parsed.content);
      
      // Extract images
      document.images = this.extractMarkdownImages(parsed.content);
      
      // Extract anchors/headings
      document.anchors = this.extractMarkdownAnchors(parsed.content);
      
    } catch (error) {
      console.warn(`⚠️ Failed to parse markdown ${document.filePath}: ${error.message}`);
    }
    
    return document;
  }

  async parseRestructuredText(document) {
    // Basic RST parsing - can be enhanced
    document.title = this.extractRstTitle(document.content) || 
                    path.basename(document.filePath, '.rst');
    document.links = this.extractRstLinks(document.content);
    document.anchors = this.extractRstAnchors(document.content);
    
    return document;
  }

  async parseAsciidoc(document) {
    // Basic AsciiDoc parsing - can be enhanced
    document.title = this.extractAsciidocTitle(document.content) || 
                    path.basename(document.filePath, path.extname(document.filePath));
    document.links = this.extractAsciidocLinks(document.content);
    document.anchors = this.extractAsciidocAnchors(document.content);
    
    return document;
  }

  async parseGenericText(document) {
    // Generic text processing
    document.title = path.basename(document.filePath, path.extname(document.filePath));
    document.links = this.extractGenericLinks(document.content);
    
    return document;
  }

  extractMarkdownTitle(content) {
    const titleMatch = content.match(/^#\s+(.+)$/m);
    return titleMatch ? titleMatch[1].trim() : null;
  }

  extractMarkdownLinks(content) {
    const links = [];
    
    // Markdown links: [text](url) - using safe regex execution
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/;
    const linkMatches = safeRegexExec(linkRegex, content, 500);
    
    for (const match of linkMatches) {
      links.push({
        type: 'markdown',
        text: match[1],
        url: match[2],
        line: this.getLineNumber(content, match.index),
        internal: !match[2].startsWith('http') && !match[2].startsWith('//'),
        anchor: match[2].includes('#')
      });
    }
    
    // Reference links: [text][ref] - using safe regex execution
    const refLinkRegex = /\[([^\]]+)\]\[([^\]]+)\]/;
    const refLinkMatches = safeRegexExec(refLinkRegex, content, 500);
    
    for (const match of refLinkMatches) {
      links.push({
        type: 'reference',
        text: match[1],
        ref: match[2],
        line: this.getLineNumber(content, match.index),
        internal: true
      });
    }
    
    // Auto links: <url> - using safe regex execution
    const autoLinkRegex = /<(https?:\/\/[^>]+)>/;
    const autoLinkMatches = safeRegexExec(autoLinkRegex, content, 500);
    
    for (const match of autoLinkMatches) {
      links.push({
        type: 'auto',
        text: match[1],
        url: match[1],
        line: this.getLineNumber(content, match.index),
        internal: false
      });
    }
    
    return links;
  }

  extractMarkdownImages(content) {
    const images = [];
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/;
    const imageMatches = safeRegexExec(imageRegex, content, 500);
    
    for (const match of imageMatches) {
      images.push({
        alt: match[1],
        src: match[2],
        line: this.getLineNumber(content, match.index),
        internal: !match[2].startsWith('http') && !match[2].startsWith('//')
      });
    }
    
    return images;
  }

  extractMarkdownAnchors(content) {
    const anchors = [];
    const headingRegex = /^(#{1,6})\s+(.+)$/m;
    const headingMatches = safeRegexExec(headingRegex, content, 200);
    
    for (const match of headingMatches) {
      const level = match[1].length;
      const text = match[2].trim();
      const slug = this.createSlug(text);
      
      anchors.push({
        level: level,
        text: text,
        slug: slug,
        line: this.getLineNumber(content, match.index)
      });
    }
    
    return anchors;
  }

  extractRstLinks(content) {
    const links = [];
    
    // RST external links: `text <url>`_ - using safe regex execution
    const externalLinkRegex = /`([^`]+)\s+<([^>]+)>`_/;
    const externalLinkMatches = safeRegexExec(externalLinkRegex, content, 500);
    
    for (const match of externalLinkMatches) {
      links.push({
        type: 'rst_external',
        text: match[1],
        url: match[2],
        line: this.getLineNumber(content, match.index),
        internal: !match[2].startsWith('http')
      });
    }
    
    return links;
  }

  extractRstTitle(content) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i].trim();
      const nextLine = lines[i + 1];
      
      if (line && nextLine && nextLine.match(/^[=\-~`#"^]+$/)) {
        return line;
      }
    }
    return null;
  }

  extractRstAnchors(content) {
    const anchors = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i].trim();
      const nextLine = lines[i + 1];
      
      if (line && nextLine && nextLine.match(/^[=\-~`#"^]+$/)) {
        const level = this.getRstHeadingLevel(nextLine[0]);
        anchors.push({
          level: level,
          text: line,
          slug: this.createSlug(line),
          line: i + 1
        });
      }
    }
    
    return anchors;
  }

  extractAsciidocLinks(content) {
    const links = [];
    
    // AsciiDoc links: link:url[text] - using safe regex execution
    const linkRegex = /link:([^\[]+)\[([^\]]*)\]/;
    const linkMatches = safeRegexExec(linkRegex, content, 500);
    
    for (const match of linkMatches) {
      links.push({
        type: 'asciidoc',
        text: match[2] || match[1],
        url: match[1],
        line: this.getLineNumber(content, match.index),
        internal: !match[1].startsWith('http')
      });
    }
    
    return links;
  }

  extractAsciidocTitle(content) {
    const titleMatch = content.match(/^=\s+(.+)$/m);
    return titleMatch ? titleMatch[1].trim() : null;
  }

  extractAsciidocAnchors(content) {
    const anchors = [];
    const headingRegex = /^(={1,6})\s+(.+)$/m;
    const headingMatches = safeRegexExec(headingRegex, content, 200);
    
    for (const match of headingMatches) {
      const level = match[1].length;
      const text = match[2].trim();
      
      anchors.push({
        level: level,
        text: text,
        slug: this.createSlug(text),
        line: this.getLineNumber(content, match.index)
      });
    }
    
    return anchors;
  }

  extractGenericLinks(content) {
    const links = [];
    const urlRegex = /(https?:\/\/[^\s]+)/;
    const urlMatches = safeRegexExec(urlRegex, content, 500);
    
    for (const match of urlMatches) {
      links.push({
        type: 'url',
        text: match[1],
        url: match[1],
        line: this.getLineNumber(content, match.index),
        internal: false
      });
    }
    
    return links;
  }

  extractKeywords(content) {
    // Remove markdown syntax, HTML tags, and special characters
    const cleanContent = content
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // Images
      .replace(/\[[^\]]*\]\([^)]*\)/g, '') // Links
      .replace(/<[^>]*>/g, '') // HTML tags
      .replace(/[#*`_~]/g, '') // Markdown syntax
      .replace(/[^\w\s]/g, ' ') // Special characters
      .toLowerCase();
    
    // Split into words and filter
    const words = cleanContent
      .split(/\s+/)
      .filter(word => 
        word.length >= this.config.keywordMinLength &&
        !this.isStopWord(word) &&
        !/^\d+$/.test(word) // Not just numbers
      );
    
    // Count word frequency
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    // Sort by frequency and take top keywords
    const keywords = Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, this.config.maxKeywords)
      .map(([word, count]) => ({ word, count }));
    
    return keywords;
  }

  isStopWord(word) {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'between', 'among', 'this', 'that',
      'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'can', 'shall', 'you', 'your', 'yours',
      'he', 'him', 'his', 'she', 'her', 'hers', 'it', 'its', 'we', 'us', 'our',
      'ours', 'they', 'them', 'their', 'theirs'
    ]);
    
    return stopWords.has(word);
  }

  countWords(content) {
    return content
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0)
      .length;
  }

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  createSlug(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  getRstHeadingLevel(char) {
    const levels = { '=': 1, '-': 2, '~': 3, '`': 4, '#': 5, '"': 6, '^': 7 };
    return levels[char] || 1;
  }

  async buildLinkMap() {
    console.log('🔗 Building link map...');
    
    for (const [filePath, document] of this.documents) {
      for (const link of document.links) {
        if (link.internal) {
          const resolvedPath = this.resolveLinkPath(filePath, link.url);
          
          if (!this.linkMap.has(resolvedPath)) {
            this.linkMap.set(resolvedPath, {
              targetPath: resolvedPath,
              references: [],
              exists: false,
              anchor: null
            });
          }
          
          this.linkMap.get(resolvedPath).references.push({
            sourcePath: filePath,
            sourceDocument: document.title,
            linkText: link.text,
            line: link.line
          });
          
          this.stats.linksFound++;
        }
      }
    }
    
    console.log(`🔗 Built link map with ${this.linkMap.size} unique targets`);
  }

  resolveLinkPath(sourcePath, linkUrl) {
    const sourceDir = path.dirname(sourcePath);
    
    // Guard against undefined linkUrl
    if (!linkUrl || typeof linkUrl !== 'string') {
      console.warn(`⚠️ Invalid linkUrl: ${linkUrl} in ${sourcePath}`);
      return '';
    }
    
    // Remove anchor if present
    const [pathPart, anchor] = linkUrl.split('#');
    
    // Resolve relative path
    const resolvedPath = path.resolve(sourceDir, pathPart);
    
    return anchor ? `${resolvedPath}#${anchor}` : resolvedPath;
  }

  async validateLinks() {
    console.log('✅ Validating links...');
    
    for (const [targetPath, linkInfo] of this.linkMap) {
      // Guard against undefined targetPath
      if (!targetPath || typeof targetPath !== 'string') {
        console.warn(`⚠️ Invalid targetPath: ${targetPath}`);
        continue;
      }
      
      const [filePath, anchor] = targetPath.split('#');
      
      try {
        // Check if file exists
        await access(filePath);
        linkInfo.exists = true;
        
        // Check anchor if present
        if (anchor) {
          const document = this.documents.get(filePath);
          if (document) {
            const anchorExists = document.anchors.some(a => a.slug === anchor);
            if (!anchorExists) {
              this.brokenLinks.push({
                type: 'missing_anchor',
                targetPath: targetPath,
                anchor: anchor,
                references: linkInfo.references,
                message: `Anchor #${anchor} not found in ${filePath}`
              });
              this.stats.brokenLinksFound++;
            }
          }
        }
        
      } catch (error) {
        // File doesn't exist
        linkInfo.exists = false;
        this.brokenLinks.push({
          type: 'missing_file',
          targetPath: targetPath,
          references: linkInfo.references,
          message: `File not found: ${filePath}`
        });
        this.stats.brokenLinksFound++;
      }
    }
    
    console.log(`🔍 Found ${this.stats.brokenLinksFound} broken links`);
  }

  async generateLinkSuggestions() {
    console.log('💡 Generating intelligent link suggestions...');
    
    const documents = Array.from(this.documents.values());
    
    // Generate suggestions based on keyword similarity
    for (let i = 0; i < documents.length; i++) {
      for (let j = i + 1; j < documents.length; j++) {
        const doc1 = documents[i];
        const doc2 = documents[j];
        
        const similarity = this.calculateSimilarity(doc1, doc2);
        
        if (similarity >= this.config.similarityThreshold) {
          this.suggestions.push({
            id: `similarity-${doc1.filePath}-${doc2.filePath}`,
            type: 'similarity_link',
            description: `Documents "${doc1.title}" and "${doc2.title}" share similar content (${(similarity * 100).toFixed(1)}% similarity)`,
            action: 'add_cross_reference',
            documents: [
              { path: doc1.filePath, title: doc1.title },
              { path: doc2.filePath, title: doc2.title }
            ],
            similarity: similarity,
            commonKeywords: this.findCommonKeywords(doc1, doc2),
            severity: 'medium'
          });
          
          this.stats.suggestionsGenerated++;
        }
      }
    }
    
    // Generate suggestions for orphaned documents
    this.generateOrphanSuggestions();
    
    // Generate suggestions for missing documentation
    this.generateMissingDocSuggestions();
    
    console.log(`💡 Generated ${this.stats.suggestionsGenerated} link suggestions`);
  }

  calculateSimilarity(doc1, doc2) {
    const keywords1 = new Map(doc1.keywords.map(k => [k.word, k.count]));
    const keywords2 = new Map(doc2.keywords.map(k => [k.word, k.count]));
    
    const allKeywords = new Set([...keywords1.keys(), ...keywords2.keys()]);
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (const keyword of allKeywords) {
      const count1 = keywords1.get(keyword) || 0;
      const count2 = keywords2.get(keyword) || 0;
      
      dotProduct += count1 * count2;
      norm1 += count1 * count1;
      norm2 += count2 * count2;
    }
    
    if (norm1 === 0 || norm2 === 0) return 0;
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  findCommonKeywords(doc1, doc2) {
    const keywords1 = new Set(doc1.keywords.map(k => k.word));
    const keywords2 = new Set(doc2.keywords.map(k => k.word));
    
    return Array.from(keywords1).filter(k => keywords2.has(k));
  }

  generateOrphanSuggestions() {
    // Find documents with no incoming links
    const referencedFiles = new Set();
    for (const linkInfo of this.linkMap.values()) {
      for (const ref of linkInfo.references) {
        referencedFiles.add(ref.sourcePath);
      }
    }
    
    for (const [filePath, document] of this.documents) {
      if (!referencedFiles.has(filePath) && !filePath.includes('README')) {
        this.suggestions.push({
          id: `orphan-${filePath}`,
          type: 'orphaned_document',
          description: `Document "${document.title}" (${filePath}) has no incoming links and may be hard to discover`,
          action: 'add_references',
          document: { path: filePath, title: document.title },
          severity: 'low'
        });
        
        this.stats.suggestionsGenerated++;
      }
    }
  }

  generateMissingDocSuggestions() {
    // Look for code files that might need documentation
    // This is a simplified implementation
    const codeExtensions = ['.js', '.ts', '.py', '.go', '.java', '.rs'];
    // Implementation would scan for code files and suggest documentation
  }

  // API Methods
  async scan(rootPath = process.cwd(), options = {}) {
    console.log(`📚 Scanning documentation in ${rootPath}`);
    
    // Re-run analysis if needed
    if (this.documents.size === 0) {
      await this.discoverDocuments();
      await this.buildLinkMap();
      await this.validateLinks();
      await this.generateLinkSuggestions();
    }
    
    // Convert to suggestions format for integration
    const suggestions = [];
    
    // Add broken link suggestions
    for (const brokenLink of this.brokenLinks) {
      suggestions.push({
        id: `broken-link-${brokenLink.targetPath}`,
        description: brokenLink.message,
        action: 'fix_broken_link',
        brokenLink: brokenLink,
        severity: 'high'
      });
    }
    
    // Add intelligent link suggestions
    suggestions.push(...this.suggestions);
    
    return {
      summary: {
        documentsProcessed: this.stats.documentsProcessed,
        linksFound: this.stats.linksFound,
        brokenLinksFound: this.stats.brokenLinksFound,
        suggestionsGenerated: this.stats.suggestionsGenerated,
        crossReferencesCreated: this.stats.crossReferencesCreated
      },
      documents: Array.from(this.documents.values()),
      linkMap: Object.fromEntries(this.linkMap),
      brokenLinks: this.brokenLinks,
      suggestions: suggestions
    };
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: { ...this.stats },
      documentAnalysis: {
        totalDocuments: this.documents.size,
        documentTypes: {},
        averageWordCount: 0,
        totalWordCount: 0
      },
      linkAnalysis: {
        totalLinks: this.stats.linksFound,
        internalLinks: 0,
        externalLinks: 0,
        brokenLinks: this.stats.brokenLinksFound,
        linkDensity: 0
      },
      contentAnalysis: {
        topKeywords: [],
        documentClusters: [],
        orphanedDocuments: []
      },
      recommendations: this.suggestions
    };
    
    // Calculate document type distribution
    for (const doc of this.documents.values()) {
      const ext = doc.extension;
      report.documentAnalysis.documentTypes[ext] = 
        (report.documentAnalysis.documentTypes[ext] || 0) + 1;
      report.documentAnalysis.totalWordCount += doc.wordCount;
    }
    
    report.documentAnalysis.averageWordCount = 
      Math.round(report.documentAnalysis.totalWordCount / this.documents.size);
    
    // Save report
    const reportPath = path.join(this.config.outputDir, 'documentation-report.json');
    await writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📊 Documentation report saved to ${reportPath}`);
    return report;
  }

  async exportLinkMap() {
    const linkMapData = {
      timestamp: new Date().toISOString(),
      links: Object.fromEntries(this.linkMap),
      statistics: {
        totalLinks: this.linkMap.size,
        brokenLinks: this.brokenLinks.length,
        validLinks: this.linkMap.size - this.brokenLinks.length
      }
    };
    
    const exportPath = path.join(this.config.outputDir, 'link-map.json');
    await writeFile(exportPath, JSON.stringify(linkMapData, null, 2));
    
    console.log(`🔗 Link map exported to ${exportPath}`);
    return linkMapData;
  }

  getDocumentById(filePath) {
    return this.documents.get(filePath);
  }

  getDocumentsByKeyword(keyword) {
    return Array.from(this.documents.values())
      .filter(doc => doc.keywords.some(k => k.word === keyword.toLowerCase()));
  }

  getSimilarDocuments(filePath, threshold = this.config.similarityThreshold) {
    const targetDoc = this.documents.get(filePath);
    if (!targetDoc) return [];
    
    const similarities = [];
    
    for (const [path, doc] of this.documents) {
      if (path !== filePath) {
        const similarity = this.calculateSimilarity(targetDoc, doc);
        if (similarity >= threshold) {
          similarities.push({ document: doc, similarity });
        }
      }
    }
    
    return similarities.sort((a, b) => b.similarity - a.similarity);
  }

  async getStats() {
    return {
      ...this.stats,
      documents: this.documents.size,
      linkMap: this.linkMap.size,
      brokenLinks: this.brokenLinks.length,
      suggestions: this.suggestions.length,
      lastScan: new Date().toISOString()
    };
  }

  async cleanup() {
    this.documents.clear();
    this.linkMap.clear();
    this.brokenLinks = [];
    this.suggestions = [];
    
    console.log('📚 Documentation Linker Plugin cleaned up');
  }
}

export default DocumentationLinkerPlugin;