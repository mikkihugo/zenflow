/**
 * Documentation Linker Plugin;
 * Cross-reference validation, broken link detection, and intelligent linking suggestions;
 */

import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { safeRegexExec } from '../../utils/security.js';

export class DocumentationLinkerPlugin {
  constructor(_config = {}): unknown {
    this.config = {documentPaths = new Map();
    this.linkMap = new Map();
    this.brokenLinks = [];
    this.suggestions = [];
    this.stats = {
      documentsProcessed,linksFound = await import('glob');
    const __documentFiles = [];
;
    // Find all documentation files
    for(const _pattern of this.config.documentPaths) {
      try {
;
    for(const filePath of uniqueFiles) {
      await this.processDocument(filePath);
    }
;
    this.stats.documentsProcessed = this.documents.size;
    console.warn(`📄 Processed ${this.stats.documentsProcessed} documents`);
  }
;
  async processDocument(filePath): unknown ;
    try {
      const __content = await readFile(filePath, 'utf8');
      const _ext = path.extname(filePath).toLowerCase();
;
      const _document = {filePath = === '.md'  ?? ext === '.mdx') {
        document = await this.parseMarkdown(document);
      } else if(ext === '.rst') {
        document = await this.parseRestructuredText(document);
      } else if(ext === '.adoc'  ?? ext === '.asciidoc') {
        document = await this.parseAsciidoc(document);
      } else {
        document = await this.parseGenericText(document);
      }
;
      // Extract keywords
      document.keywords = this.extractKeywords(document.content);
      document.wordCount = this.countWords(document.content);
;
      this.documents.set(filePath, document);catch(error) ;
      console.warn(`⚠️ Failed to process $filePath: $error.message`);
  }
;
  async parseMarkdown(document): unknown ;
    try {
      const _parsed = matter(document.content);
;
      document.frontMatter = parsed.data;
      document.content = parsed.content;
      document.title = parsed.data.title  ?? this.extractMarkdownTitle(parsed.content)  ?? path.basename(document.filePath, '.md');
;
      // Extract links
      document.links = this.extractMarkdownLinks(parsed.content);
;
      // Extract images
      document.images = this.extractMarkdownImages(parsed.content);
;
      // Extract anchors/headings
      document.anchors = this.extractMarkdownAnchors(parsed.content);
;
    } catch (/* _error */) {
      console.warn(`⚠️ Failed to parse markdown $document.filePath: $error.message`);
    }
;
    return document;
    // ; // LINT: unreachable code removed
  async parseRestructuredText(document): unknown ;
    // Basic RST parsing - can be enhanced
    document.title = this.extractRstTitle(document.content)  ?? path.basename(document.filePath, '.rst');
    document.links = this.extractRstLinks(document.content);
    document.anchors = this.extractRstAnchors(document.content);
;
    return document;
    // ; // LINT: unreachable code removed
  async parseAsciidoc(document): unknown ;
    // Basic AsciiDoc parsing - can be enhanced
    document.title = this.extractAsciidocTitle(document.content)  ?? path.basename(document.filePath, path.extname(document.filePath));
    document.links = this.extractAsciidocLinks(document.content);
    document.anchors = this.extractAsciidocAnchors(document.content);
;
    return document;
    // ; // LINT: unreachable code removed
  async parseGenericText(document): unknown ;
    // Generic text processing
    document.title = path.basename(document.filePath, path.extname(document.filePath));
    document.links = this.extractGenericLinks(document.content);
;
    return document;
    // ; // LINT: unreachable code removed
  extractMarkdownTitle(content): unknown {
    const _titleMatch = content.match(/^#\s+(.+)$/m);
    return titleMatch ? titleMatch[1].trim() : null;
    //   // LINT: unreachable code removed}
;
  extractMarkdownLinks(content): unknown {
    const _links = [];
;
    // Markdownlinks = /\[([^\]]+)\]\(([^)]+)\)/;
    const _linkMatches = safeRegexExec(linkRegex, content, 500);
;
    for(const _match of linkMatches) {
      links.push({type = /\[([^\]]+)\]\[([^\]]+)\]/;
    const _refLinkMatches = safeRegexExec(refLinkRegex, content, 500);
;
    for(const _match of refLinkMatches) {
      links.push({type = /<(https?:\/\/[^>]+)>/;
    const _autoLinkMatches = safeRegexExec(autoLinkRegex, content, 500);
;
    for(const _match of autoLinkMatches) {
      links.push({type = [];
    const _imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/;
    const _imageMatches = safeRegexExec(imageRegex, content, 500);
;
    for(const _match of imageMatches) {
      images.push({alt = [];
    const _headingRegex = /^(#{1,6})\s+(.+)$/m;
    const _headingMatches = safeRegexExec(headingRegex, content, 200);
;
    for(const match of headingMatches) {
      const _level = match[1].length;
      const _text = match[2].trim();
      const __slug = this.createSlug(text);
;
      anchors.push({level = [];
;
    // RST externallinks = /`([^`]+)\s+<([^>]+)>`_/;
    const _externalLinkMatches = safeRegexExec(externalLinkRegex, content, 500);
;
    for(const _match of externalLinkMatches) ;
      links.push({type = content.split('\n');
    for(let i = 0; i < lines.length - 1; i++) {
      const _line = lines[i].trim();
      const _nextLine = lines[i + 1];
;
      if (line && nextLine && nextLine.match(/^[=\-~`#"^]+$/)) {
        return line;
    //   // LINT: unreachable code removed}
    }
    return null;
    // ; // LINT: unreachable code removed
  extractRstAnchors(content): unknown {
    const _anchors = [];
    const _lines = content.split('\n');
;
    for(let i = 0; i < lines.length - 1; i++) {
      const _line = lines[i].trim();
      const _nextLine = lines[i + 1];
;
      if (line && nextLine && nextLine.match(/^[=\-~`#"^]+$/)) {
        const _level = this.getRstHeadingLevel(nextLine[0]);
        anchors.push({level = [];
;
    // AsciiDoclinks = /link:([^\[]+)\[([^\]]*)\]/;
    const _linkMatches = safeRegexExec(linkRegex, content, 500);
;
    for(const _match of linkMatches) {
      links.push({type = content.match(/^=\s+(.+)$/m);
    return titleMatch ? titleMatch[1].trim() : null;
    //   // LINT: unreachable code removed}
;
  extractAsciidocAnchors(content): unknown {
    const _anchors = [];
    const _headingRegex = /^(={1,6})\s+(.+)$/m;
    const _headingMatches = safeRegexExec(headingRegex, content, 200);
;
    for(const match of headingMatches) {
      const _level = match[1].length;
      const _text = match[2].trim();
;
      anchors.push({level = [];
    const _urlRegex = /(https?:\/\/[^\s]+)/;
    const _urlMatches = safeRegexExec(urlRegex, content, 500);
;
    for(const _match of urlMatches) {
      links.push({type = content;
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // Images
      .replace(/\[[^\]]*\]\([^)]*\)/g, '') // Links
      .replace(/<[^>]*>/g, '') // HTML tags
      .replace(/[#*`_~]/g, '') // Markdown syntax
      .replace(/[^\w\s]/g, ' ') // Special characters
      .toLowerCase();
;
    // Split into words and filter
    const _words = cleanContent;
      .split(/\s+/);
      .filter(word => ;
        word.length >= this.config.keywordMinLength &&;
        !this.isStopWord(word) &&;
        !/^\d+$/.test(word) // Not just numbers
      );
;
    // Count word frequency
    const _wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word]  ?? 0) + 1;
    });
;
    // Sort by frequency and take top keywords
    const _keywords = Object.entries(wordCount);
      .sort(([,a], [,b]) => b - a);
      .slice(0, this.config.maxKeywords);
      .map(([word, count]) => (word, count ));
;
    return keywords;
    //   // LINT: unreachable code removed}
;
  isStopWord(word): unknown {
    const _stopWords = new Set([;
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',;
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',;
      'before', 'after', 'above', 'below', 'between', 'among', 'this', 'that',;
      'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been', 'being',;
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',;
      'should', 'may', 'might', 'must', 'can', 'shall', 'you', 'your', 'yours',;
      'he', 'him', 'his', 'she', 'her', 'hers', 'it', 'its', 'we', 'us', 'our',;
      'ours', 'they', 'them', 'their', 'theirs';
    ]);
;
    return stopWords.has(word);
    //   // LINT: unreachable code removed}
;
  countWords(content): unknown ;
    return content;
    // .replace(/[^\w\s]/g, ' '); // LINT: unreachable code removed
      .split(/\s+/);
      .filter(word => word.length > 0);
      .length;
;
  getLineNumber(content, index): unknown ;
    return content.substring(0, index).split('\n').length;
    // ; // LINT: unreachable code removed
  createSlug(text): unknown ;
    return text;
    // .toLowerCase(); // LINT: unreachable code removed
      .replace(/[^\w\s-]/g, '');
      .replace(/\s+/g, '-');
      .replace(/-+/g, '-');
      .trim();
;
  getRstHeadingLevel(char): unknown {
    const _levels = { '=', '-': 2, '~': 3, '`': 4, '#': 5, '"': 6, '^': 7 };
    return levels[char]  ?? 1;
    //   // LINT: unreachable code removed}
;
  async buildLinkMap() ;
    console.warn('🔗 Building link map...');
;
    for(const [filePath, document] of this.documents) {
      for(const link of document.links) {
        if(link.internal) {
          const _resolvedPath = this.resolveLinkPath(filePath, link.url);
;
          if (!this.linkMap.has(resolvedPath)) {
            this.linkMap.set(resolvedPath, {targetPath = path.dirname(sourcePath);
;
    // Guard against undefined linkUrl
    if(!linkUrl  ?? typeof linkUrl !== 'string') {
      console.warn(`⚠️ InvalidlinkUrl = linkUrl.split('#');
;
    // Resolve relative path
    const _resolvedPath = path.resolve(sourceDir, pathPart);
;
    return anchor ? `${resolvedPath}#${anchor}` : resolvedPath;
    //   // LINT: unreachable code removed}
;
  async validateLinks() {
    console.warn('✅ Validating links...');
;
    for(const [targetPath, linkInfo] of this.linkMap) {
      // Guard against undefined targetPath
      if(!targetPath  ?? typeof targetPath !== 'string') {
        console.warn(`⚠️ InvalidtargetPath = targetPath.split('#');
;
      try {
        // Check if file exists
        await access(filePath);
        linkInfo.exists = true;
;
        // Check anchor if present
        if(anchor) {
          const _document = this.documents.get(filePath);
          if(document) {
            const _anchorExists = document.anchors.some(a => a.slug === anchor);
            if(!anchorExists) {
              this.brokenLinks.push({type = false;
        this.brokenLinks.push({type = Array.from(this.documents.values());
;
    // Generate suggestions based on keyword similarity
    for(let i = 0; i < documents.length; i++) {
      for(let j = i + 1; j < documents.length; j++) {
        const _doc1 = documents[i];
        const _doc2 = documents[j];
;
        const _similarity = this.calculateSimilarity(doc1, doc2);
;
        if(similarity >= this.config.similarityThreshold) {
          this.suggestions.push({id = new Map(doc1.keywords.map(k => [k.word, k.count]));
    const _keywords2 = new Map(doc2.keywords.map(k => [k.word, k.count]));
;
    const _allKeywords = new Set([...keywords1.keys(), ...keywords2.keys()]);
;
    const _dotProduct = 0;
    const _norm1 = 0;
    const _norm2 = 0;
;
    for(const keyword of allKeywords) {
      const _count1 = keywords1.get(keyword)  ?? 0;
      const _count2 = keywords2.get(keyword)  ?? 0;
;
      dotProduct += count1 * count2;
      norm1 += count1 * count1;
      norm2 += count2 * count2;
    }
;
    if (norm1 === 0  ?? norm2 === 0) return 0;
    // ; // LINT: unreachable code removed
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    //   // LINT: unreachable code removed}
;
  findCommonKeywords(doc1, doc2): unknown {
    const _keywords1 = new Set(doc1.keywords.map(k => k.word));
    const _keywords2 = new Set(doc2.keywords.map(k => k.word));
;
    return Array.from(keywords1).filter(k => keywords2.has(k));
    //   // LINT: unreachable code removed}
;
  generateOrphanSuggestions() {
    // Find documents with no incoming links
    const _referencedFiles = new Set();
    for (const linkInfo of this.linkMap.values()) {
      for(const ref of linkInfo.references) {
        referencedFiles.add(ref.sourcePath);
      }
    }
;
    for(const [filePath, document] of this.documents) {
      if (!referencedFiles.has(filePath) && !filePath.includes('README')) {
        this.suggestions.push({id = ['.js', '.ts', '.py', '.go', '.java', '.rs'];
    // Implementation would scan for code files and suggest documentation
  }
;
  // API Methods
  async scan(rootPath = process.cwd(), options = {}) {
    console.warn(`📚 Scanning documentation in ${rootPath}`);
;
    // Re-run analysis if needed
    if(this.documents.size === 0) {
      await this.discoverDocuments();
      await this.buildLinkMap();
      await this.validateLinks();
      await this.generateLinkSuggestions();
    }
;
    // Convert to suggestions format for integration
    const _suggestions = [];
;
    // Add broken link suggestions
    for(const _brokenLink of this.brokenLinks) {
      suggestions.push({
        id = {timestamp = doc.extension;
      report.documentAnalysis.documentTypes[ext] = ;
        (report.documentAnalysis.documentTypes[ext]  ?? 0) + 1;
      report.documentAnalysis.totalWordCount += doc.wordCount;
    }
;
    report.documentAnalysis.averageWordCount = ;
      Math.round(report.documentAnalysis.totalWordCount / this.documents.size);
;
    // Save report
    const _reportPath = path.join(this.config.outputDir, 'documentation-report.json');
    await writeFile(reportPath, JSON.stringify(report, null, 2));
;
    console.warn(`📊 Documentation report saved to ${reportPath}`);
    return report;
    //   // LINT: unreachable code removed}
;
  async exportLinkMap() {
    const _linkMapData = {timestamp = path.join(this.config.outputDir, 'link-map.json');
    await writeFile(exportPath, JSON.stringify(linkMapData, null, 2));
    
    console.warn(`🔗 Link map exported to ${exportPath}`);
    return linkMapData;
    //   // LINT: unreachable code removed}
;
  getDocumentById(filePath): unknown ;
    return this.documents.get(filePath);
    // ; // LINT: unreachable code removed
  getDocumentsByKeyword(keyword): unknown ;
    return Array.from(this.documents.values());
    // .filter(doc => doc.keywords.some(k => k.word === keyword.toLowerCase())); // LINT: unreachable code removed
;
  getSimilarDocuments(filePath, threshold = this.config.similarityThreshold): unknown {
    const _targetDoc = this.documents.get(filePath);
    if (!targetDoc) return [];
    // ; // LINT: unreachable code removed
    const _similarities = [];
;
    for(const [path, doc] of this.documents) {
      if(path !== filePath) {
        const _similarity = this.calculateSimilarity(targetDoc, doc);
        if(similarity >= threshold) {
          similarities.push({document = > b.similarity - a.similarity);
  }
;
  async getStats() ;
    return {
      ...this.stats,documents = [];
    // this.suggestions = []; // LINT: unreachable code removed
;
    console.warn('📚 Documentation Linker Plugin cleaned up');
}
;
export default DocumentationLinkerPlugin;
