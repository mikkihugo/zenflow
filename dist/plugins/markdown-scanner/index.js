/**
 * Markdown Scanner Plugin
 * Validates markdown files using markdownlint and checks for standard headers
 */

import { readFile } from 'fs/promises';
import { glob } from 'glob';
import { lint } from 'markdownlint/sync';
import matter from 'gray-matter';
import path from 'path';

export class MarkdownScannerPlugin {
  constructor(config = {}) {
    this.config = {
      filePatterns: ['**/*.md'],
      ignorePatterns: ['node_modules/**', '.git/**', '.hive-mind/**', 'dist/**'],
      requireFrontmatter: true,
      requiredFields: ['title'],
      optionalFields: ['author', 'date', 'description', 'tags'],
      lintConfig: {
        MD013: false, // Line length
        MD033: false, // Allow HTML
        MD041: false  // First line doesn't need to be h1
      },
      generateMissingHeaders: true,
      ...config
    };
    
    this.markdownRules = new Map();
  }

  async initialize() {
    console.log('📝 Markdown Scanner Plugin initialized');
    this.setupDefaultRules();
  }

  setupDefaultRules() {
    // Standard markdown rules
    this.markdownRules.set('frontmatter', {
      description: 'Check for required frontmatter fields',
      severity: 'medium',
      check: (content, frontmatter) => this.checkFrontmatter(frontmatter)
    });
    
    this.markdownRules.set('structure', {
      description: 'Check document structure and headers',
      severity: 'low',
      check: (content) => this.checkStructure(content)
    });
    
    this.markdownRules.set('links', {
      description: 'Validate internal and external links',
      severity: 'medium',
      check: (content) => this.checkLinks(content)
    });
  }

  /**
   * Scan markdown files for issues
   */
  async scanMarkdownFiles(options = {}) {
    const { validateLinks = true, checkStructure = true } = options;
    
    console.log('🔍 Scanning for markdown files...');
    const markdownFiles = await glob(this.config.filePatterns, {
      ignore: this.config.ignorePatterns
    });

    console.log(`📊 Found ${markdownFiles.length} markdown files`);
    
    const suggestions = [];
    const stats = {
      totalFiles: markdownFiles.length,
      lintIssues: 0,
      structureIssues: 0,
      linkIssues: 0
    };

    for (const file of markdownFiles) {
      try {
        const content = await readFile(file, 'utf8');
        const analysis = await this.analyzeMarkdownFile(content, file, {
          validateLinks,
          checkStructure
        });
        
        suggestions.push(...analysis.issues);
        this.updateStats(stats, analysis);
        
      } catch (error) {
        console.warn(`⚠️ Could not analyze ${file}: ${error.message}`);
        suggestions.push({
          id: `file-error-${file}`,
          type: 'file_error',
          severity: 'high',
          file,
          description: `Failed to read or parse file: ${error.message}`
        });
      }
    }

    return {
      ...stats,
      issues: suggestions.length,
      suggestions,
      summary: this.generateSummary(suggestions)
    };
  }

  /**
   * Analyze individual markdown file
   */
  async analyzeMarkdownFile(content, filepath, options) {
    const issues = [];
    const parsed = matter(content);
    
    // Run markdownlint
    const lintResults = await this.runMarkdownLint(content, filepath);
    issues.push(...lintResults);
    
    // Check frontmatter
    if (this.config.requireFrontmatter) {
      const frontmatterIssues = this.checkFrontmatter(parsed.data, filepath);
      issues.push(...frontmatterIssues);
    }
    
    // Check document structure
    if (options.checkStructure) {
      const structureIssues = this.checkStructure(parsed.content, filepath);
      issues.push(...structureIssues);
    }
    
    // Validate links
    if (options.validateLinks) {
      const linkIssues = await this.checkLinks(parsed.content, filepath);
      issues.push(...linkIssues);
    }

    return {
      issues,
      frontmatter: parsed.data,
      wordCount: this.countWords(parsed.content),
      headingCount: this.countHeadings(parsed.content)
    };
  }

  /**
   * Run markdownlint on content
   */
  async runMarkdownLint(content, filepath) {
    const issues = [];
    
    try {
      const results = lint({
        strings: { [filepath]: content },
        config: this.config.lintConfig
      });
      
      const fileResults = results[filepath] || [];
      
      for (const result of fileResults) {
        issues.push({
          id: `lint-${filepath}-${result.ruleNames[0]}-${result.lineNumber}`,
          type: 'lint_issue',
          severity: 'low',
          file: filepath,
          line: result.lineNumber,
          rule: result.ruleNames[0],
          description: result.ruleDescription,
          detail: result.errorDetail || '',
          context: result.errorContext || ''
        });
      }
    } catch (error) {
      console.warn(`Markdown lint failed for ${filepath}: ${error.message}`);
    }
    
    return issues;
  }

  /**
   * Check frontmatter for required fields
   */
  checkFrontmatter(frontmatter, filepath) {
    const issues = [];
    
    if (!frontmatter || Object.keys(frontmatter).length === 0) {
      if (this.config.requireFrontmatter) {
        issues.push({
          id: `missing-frontmatter-${filepath}`,
          type: 'missing_frontmatter',
          severity: 'medium',
          file: filepath,
          description: 'Missing frontmatter section',
          suggestion: this.generateFrontmatterSuggestion(filepath),
          action: 'add_frontmatter'
        });
      }
      return issues;
    }
    
    // Check required fields
    for (const field of this.config.requiredFields) {
      if (!frontmatter[field]) {
        issues.push({
          id: `missing-field-${filepath}-${field}`,
          type: 'missing_field',
          severity: 'medium',
          file: filepath,
          field,
          description: `Missing required frontmatter field: ${field}`,
          action: 'add_field'
        });
      }
    }
    
    return issues;
  }

  /**
   * Check document structure
   */
  checkStructure(content, filepath) {
    const issues = [];
    const lines = content.split('\n');
    
    // Check for H1 heading
    const hasH1 = lines.some(line => line.startsWith('# '));
    if (!hasH1) {
      issues.push({
        id: `missing-h1-${filepath}`,
        type: 'structure_issue',
        severity: 'low',
        file: filepath,
        description: 'Document should have at least one H1 heading',
        action: 'add_h1'
      });
    }
    
    // Check heading hierarchy
    const headings = this.extractHeadings(content);
    const hierarchyIssues = this.validateHeadingHierarchy(headings, filepath);
    issues.push(...hierarchyIssues);
    
    return issues;
  }

  /**
   * Extract headings from markdown content
   */
  extractHeadings(content) {
    const headings = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        headings.push({
          level: match[1].length,
          text: match[2],
          line: index + 1
        });
      }
    });
    
    return headings;
  }

  /**
   * Validate heading hierarchy
   */
  validateHeadingHierarchy(headings, filepath) {
    const issues = [];
    
    for (let i = 1; i < headings.length; i++) {
      const current = headings[i];
      const previous = headings[i - 1];
      
      // Check for heading level jumps (e.g., H1 to H3)
      if (current.level > previous.level + 1) {
        issues.push({
          id: `heading-jump-${filepath}-${current.line}`,
          type: 'structure_issue',
          severity: 'low',
          file: filepath,
          line: current.line,
          description: `Heading level jumps from H${previous.level} to H${current.level}`,
          action: 'fix_heading_hierarchy'
        });
      }
    }
    
    return issues;
  }

  /**
   * Check and validate links
   */
  async checkLinks(content, filepath) {
    const issues = [];
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    
    while ((match = linkRegex.exec(content)) !== null) {
      const linkText = match[1];
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
        } catch (error) {
          issues.push({
            id: `broken-link-${filepath}-${Buffer.from(linkUrl).toString('base64').substring(0, 8)}`,
            type: 'broken_link',
            severity: 'medium',
            file: filepath,
            linkText,
            linkUrl,
            description: `Broken internal link: ${linkUrl}`,
            action: 'fix_link'
          });
        }
      }
    }
    
    return issues;
  }

  /**
   * Generate frontmatter suggestion
   */
  generateFrontmatterSuggestion(filepath) {
    const filename = path.basename(filepath, '.md');
    const today = new Date().toISOString().split('T')[0];
    
    const fields = [`title: "${filename}"`];
    
    if (this.config.optionalFields.includes('author')) {
      fields.push('author: "Claude Zen"');
    }
    
    if (this.config.optionalFields.includes('date')) {
      fields.push(`date: "${today}"`);
    }
    
    return `---\n${fields.join('\n')}\n---\n\n`;
  }

  /**
   * Count words in content
   */
  countWords(content) {
    return content.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Count headings in content
   */
  countHeadings(content) {
    return (content.match(/^#{1,6}\s+/gm) || []).length;
  }

  /**
   * Update statistics
   */
  updateStats(stats, analysis) {
    stats.lintIssues += analysis.issues.filter(i => i.type === 'lint_issue').length;
    stats.structureIssues += analysis.issues.filter(i => i.type === 'structure_issue').length;
    stats.linkIssues += analysis.issues.filter(i => i.type === 'broken_link').length;
  }

  /**
   * Generate summary of analysis
   */
  generateSummary(suggestions) {
    const typeCounts = suggestions.reduce((acc, s) => {
      acc[s.type] = (acc[s.type] || 0) + 1;
      return acc;
    }, {});

    const severityCounts = suggestions.reduce((acc, s) => {
      acc[s.severity] = (acc[s.severity] || 0) + 1;
      return acc;
    }, {});

    return {
      totalIssues: suggestions.length,
      issueTypeBreakdown: typeCounts,
      severityBreakdown: severityCounts,
      mostCommonIssue: Object.entries(typeCounts).sort(([,a], [,b]) => b - a)[0]?.[0]
    };
  }

  /**
   * Get scanning capabilities
   */
  getCapabilities() {
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
  }

  async cleanup() {
    this.markdownRules.clear();
    console.log('📝 Markdown Scanner Plugin cleaned up');
  }
}

export default MarkdownScannerPlugin;