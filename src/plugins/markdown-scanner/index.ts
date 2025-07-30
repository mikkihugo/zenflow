/**
 * Markdown Scanner Plugin
 * Validates markdown files using markdownlint and checks for standard headers
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { lint } from 'markdownlint/sync';

export class MarkdownScannerPlugin {
  constructor(_config = {}): any {
    this.config = {filePatterns = new Map();
  }

  async initialize() {
    console.warn('📝 Markdown Scanner Plugin initialized');
    this.setupDefaultRules();
  }

  setupDefaultRules() {
    // Standard markdown rules
    this.markdownRules.set('frontmatter', {description = > this.checkFrontmatter(frontmatter)
    });
    
    this.markdownRules.set('structure', {description = > this.checkStructure(content)
    });
    
    this.markdownRules.set('links', {description = > this.checkLinks(content)
    });
  }

  /**
   * Scan markdown files for issues
   */
  async scanMarkdownFiles(options = {}): any {
    const { validateLinks = true, checkStructure = true } = options;
    
    console.warn('🔍 Scanning for markdown files...');

    const stats = {totalFiles = await readFile(file, 'utf8');
        const analysis = await this.analyzeMarkdownFile(content, file, {
          validateLinks,
          checkStructure
        });
        
        suggestions.push(...analysis.issues);
        this.updateStats(stats, analysis);
        
      } catch(error) {
        console.warn(`⚠️ Could not analyze ${file}: ${error.message}`);
        suggestions.push({id = [];
    const parsed = matter(content);
    
    // Run markdownlint
    const lintResults = await this.runMarkdownLint(content, filepath);
    issues.push(...lintResults);
    
    // Check frontmatter
    if(this.config.requireFrontmatter) {
      const frontmatterIssues = this.checkFrontmatter(parsed.data, filepath);
      issues.push(...frontmatterIssues);
    }
    
    // Check document structure
    if(options.checkStructure) {
      const structureIssues = this.checkStructure(parsed.content, filepath);
      issues.push(...structureIssues);
    }
    
    // Validate links
    if(options.validateLinks) {
      const linkIssues = await this.checkLinks(parsed.content, filepath);
      issues.push(...linkIssues);
    }

    return {
      issues,frontmatter = [];
    
    try {
      const results = lint({strings = results[filepath] || [];
      
      for(const _result of fileResults) {
        issues.push({id = [];
    
    if (!frontmatter || Object.keys(frontmatter).length === 0) {
      if(this.config.requireFrontmatter) {
        issues.push({id = [];
    const lines = content.split('\n');
    
    // Check for H1 heading
    const hasH1 = lines.some(line => line.startsWith('# '));
    if(!hasH1) {
      issues.push({id = this.extractHeadings(content);
    const hierarchyIssues = this.validateHeadingHierarchy(headings, filepath);
    issues.push(...hierarchyIssues);
    
    return issues;
  }

  /**
   * Extract headings from markdown content
   */
  extractHeadings(content): any {
    const headings = [];
    const lines = content.split('\n');
    
    lines.forEach((line, _index) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if(match) {
        headings.push({level = [];
    
    for(let i = 1; i < headings.length; i++) {
      const current = headings[i];
      const previous = headings[i - 1];
      
      // Check for heading level jumps (e.g., H1 to H3)
      if(current.level > previous.level + 1) {
        issues.push({id = [];
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    
    while ((match = linkRegex.exec(content)) !== null) {

      const linkUrl = match[2];
      
      // Skip external links for now (would need HTTP requests)
      if (linkUrl.startsWith('http')) {
        continue;
      }
      
      // Check internal links
      if (linkUrl.startsWith('./') || linkUrl.startsWith('../') || !linkUrl.includes('://')) {
        const fullPath = path.resolve(path.dirname(filepath), linkUrl);
        
        try {
          await readFile(fullPath);
        } catch(_error) {
          issues.push({id = path.basename(filepath, '.md');

  }

  /**
   * Count headings in content
   */
  countHeadings(content): any 
    return (content.match(/^#{1,6}\s+/gm) || []).length;

  /**
   * Update statistics
   */
  updateStats(stats, analysis): any 
    stats.lintIssues += analysis.issues.filter(i => i.type === 'lint_issue').length;
    stats.structureIssues += analysis.issues.filter(i => i.type === 'structure_issue').length;
    stats.linkIssues += analysis.issues.filter(i => i.type === 'broken_link').length;

  /**
   * Generate summary of analysis
   */
  generateSummary(suggestions): any 

      return acc;, );

      return acc;
    }, );

    return {totalIssues = > b - a)[0]?.[0]
    };
  }

  /**
   * Get scanning capabilities
   */
  getCapabilities() 
    return {
      fileTypes: ['.md', '.markdown'],
      validationTypes: ['frontmatter', 'structure', 'links', 'lint'],
      features: [
        'markdownlint-integration',
        'frontmatter-validation',
        'heading-hierarchy-check',
        'link-validation',
        'structure-analysis'
      ]
    };

  async cleanup() 
    this.markdownRules.clear();
    console.warn('📝 Markdown Scanner Plugin cleaned up');
}

export default MarkdownScannerPlugin;
