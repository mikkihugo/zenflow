/**
 * Duplicate Code Detector
 * Uses jscpd to detect duplicate code patterns across the codebase
 */

import { readFile, writeFile } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createHash } from 'crypto';
import path from 'path';

const execAsync = promisify(exec);

// Check if jscpd is available
let jscpdAvailable = false;

try {
  await execAsync('which jscpd', { timeout: 5000 });
  jscpdAvailable = true;
} catch (e) {
  console.warn('jscpd not available, using fallback duplicate detection');
  jscpdAvailable = false;
}

export class DuplicateCodeDetector {
  constructor(config = {}) {
    this.config = {
      minTokens: 50,
      minLines: 5,
      maxSize: '500kb',
      threshold: 70, // percentage similarity
      filePatterns: ['**/*.{js,jsx,ts,tsx}'],
      ignorePatterns: [
        'node_modules/**',
        '.git/**',
        'dist/**',
        'build/**',
        '**/*.min.js',
        '**/*.test.{js,ts}',
        '**/*.spec.{js,ts}'
      ],
      formats: ['json'],
      outputDir: './analysis-reports',
      ...config
    };
  }

  /**
   * Detect duplicate code across the codebase
   */
  async detectDuplicates(targetPath = '.') {
    console.log(`🔍 Detecting duplicate code in: ${targetPath}`);
    
    try {
      // Run jscpd analysis
      const jscpdResults = await this.runJSCPD(targetPath);
      
      // Process and enhance results
      const duplicates = await this.processDuplicates(jscpdResults);
      
      // Generate summary metrics
      const metrics = this.calculateDuplicateMetrics(duplicates);
      
      console.log(`✅ Duplicate detection complete: ${duplicates.length} duplicate blocks found`);
      
      return {
        duplicates,
        metrics,
        summary: this.generateSummary(duplicates, metrics)
      };
      
    } catch (error) {
      console.error(`❌ Duplicate detection failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Run jscpd analysis
   */
  async runJSCPD(targetPath) {
    if (!jscpdAvailable) {
      console.warn('JSCPD not available, using fallback duplicate detection');
      return await this.createFallbackDuplicateAnalysis(targetPath);
    }

    const configPath = await this.createJSCPDConfig();
    
    try {
      const command = `npx jscpd ${targetPath} --config ${configPath}`;
      const { stdout, stderr } = await execAsync(command, {
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      });
      
      if (stderr && !stderr.includes('warning')) {
        console.warn(`⚠️ JSCPD warnings: ${stderr}`);
      }
      
      // Parse JSON output
      const outputFile = path.join(this.config.outputDir, 'jscpd-report.json');
      try {
        const reportContent = await readFile(outputFile, 'utf8');
        return JSON.parse(reportContent);
      } catch (error) {
        // Fallback: parse stdout if file doesn't exist
        console.warn('⚠️ Could not read jscpd report file, parsing stdout');
        return this.parseJSCPDOutput(stdout);
      }
      
    } catch (error) {
      console.warn(`⚠️ JSCPD execution failed: ${error.message}`);
      // Fallback to manual detection
      return await this.manualDuplicateDetection(targetPath);
    }
  }

  /**
   * Create jscpd configuration
   */
  async createJSCPDConfig() {
    const config = {
      minTokens: this.config.minTokens,
      minLines: this.config.minLines,
      maxSize: this.config.maxSize,
      threshold: this.config.threshold,
      ignore: this.config.ignorePatterns,
      formats: this.config.formats,
      output: this.config.outputDir,
      silent: true,
      blame: true,
      gitignore: true
    };
    
    const configPath = path.join(this.config.outputDir, '.jscpd.json');
    await writeFile(configPath, JSON.stringify(config, null, 2));
    
    return configPath;
  }

  /**
   * Parse jscpd stdout output
   */
  parseJSCPDOutput(output) {
    // Simple parser for jscpd output - this is a fallback
    const lines = output.split('\n');
    const duplicates = [];
    
    let currentDuplicate = null;
    for (const line of lines) {
      if (line.includes('Found') && line.includes('clones')) {
        // Parse clone information
        const match = line.match(/Found (\d+) clones/);
        if (match) {
          console.log(`📊 Found ${match[1]} duplicates in output`);
        }
      }
    }
    
    return { duplicates, statistics: { total: duplicates.length } };
  }

  /**
   * Manual duplicate detection (fallback)
   */
  async manualDuplicateDetection(targetPath) {
    console.log('🔧 Running manual duplicate detection...');
    
    const files = await glob(this.config.filePatterns, {
      cwd: targetPath,
      ignore: this.config.ignorePatterns,
      absolute: true
    });
    
    const duplicates = [];
    const codeBlocks = new Map();
    
    for (const file of files) {
      try {
        const content = await readFile(file, 'utf8');
        const blocks = this.extractCodeBlocks(content, file);
        
        for (const block of blocks) {
          const hash = this.generateBlockHash(block.code);
          
          if (codeBlocks.has(hash)) {
            const existing = codeBlocks.get(hash);
            duplicates.push({
              id: this.generateDuplicateId(block, existing),
              hash,
              lines: block.lines,
              tokens: this.countTokens(block.code),
              files: [
                {
                  name: existing.file,
                  start: existing.start,
                  end: existing.end
                },
                {
                  name: file,
                  start: block.start,
                  end: block.end
                }
              ]
            });
          } else {
            codeBlocks.set(hash, {
              file,
              start: block.start,
              end: block.end,
              code: block.code
            });
          }
        }
      } catch (error) {
        console.warn(`⚠️ Could not process ${file}: ${error.message}`);
      }
    }
    
    return { duplicates, statistics: { total: duplicates.length } };
  }

  /**
   * Extract code blocks from file content
   */
  extractCodeBlocks(content, file) {
    const lines = content.split('\n');
    const blocks = [];
    const minLines = this.config.minLines;
    
    for (let i = 0; i <= lines.length - minLines; i++) {
      const block = lines.slice(i, i + minLines).join('\n');
      
      // Skip blocks that are mostly whitespace or comments
      if (this.isSignificantBlock(block)) {
        blocks.push({
          start: i + 1,
          end: i + minLines,
          lines: minLines,
          code: block
        });
      }
    }
    
    return blocks;
  }

  /**
   * Check if code block is significant (not just whitespace/comments)
   */
  isSignificantBlock(code) {
    const lines = code.split('\n');
    let significantLines = 0;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && 
          !trimmed.startsWith('//') && 
          !trimmed.startsWith('/*') && 
          !trimmed.startsWith('*') &&
          trimmed !== '{' &&
          trimmed !== '}') {
        significantLines++;
      }
    }
    
    return significantLines >= Math.floor(lines.length * 0.7);
  }

  /**
   * Process and enhance duplicate results
   */
  async processDuplicates(jscpdResults) {
    const duplicates = [];
    
    if (jscpdResults.duplicates) {
      for (const duplicate of jscpdResults.duplicates) {
        const processed = await this.enhanceDuplicate(duplicate);
        duplicates.push(processed);
      }
    }
    
    return duplicates;
  }

  /**
   * Enhance duplicate information
   */
  async enhanceDuplicate(duplicate) {
    const enhanced = {
      id: duplicate.id || this.generateDuplicateId(duplicate),
      hash: duplicate.hash || this.generateBlockHash(duplicate.fragment || ''),
      token_count: duplicate.tokens || this.countTokens(duplicate.fragment || ''),
      line_count: duplicate.lines || 0,
      similarity_score: duplicate.percentage || 100,
      first_occurrence_file: null,
      first_occurrence_line: null,
      occurrences: [],
      complexity_score: 0,
      maintainability_impact: 'medium'
    };
    
    // Process file occurrences
    if (duplicate.files) {
      for (let i = 0; i < duplicate.files.length; i++) {
        const file = duplicate.files[i];
        const occurrence = {
          file: file.name,
          start_line: file.start,
          end_line: file.end,
          is_first: i === 0
        };
        
        enhanced.occurrences.push(occurrence);
        
        if (i === 0) {
          enhanced.first_occurrence_file = file.name;
          enhanced.first_occurrence_line = file.start;
        }
      }
    }
    
    // Calculate complexity score
    enhanced.complexity_score = this.calculateDuplicateComplexity(enhanced);
    enhanced.maintainability_impact = this.assessMaintainabilityImpact(enhanced);
    
    return enhanced;
  }

  /**
   * Calculate duplicate metrics
   */
  calculateDuplicateMetrics(duplicates) {
    const metrics = {
      total_duplicates: duplicates.length,
      total_duplicate_lines: 0,
      total_duplicate_tokens: 0,
      files_affected: new Set(),
      severity_breakdown: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      },
      average_similarity: 0,
      largest_duplicate: null
    };
    
    let totalSimilarity = 0;
    let largestSize = 0;
    
    for (const duplicate of duplicates) {
      metrics.total_duplicate_lines += duplicate.line_count * duplicate.occurrences.length;
      metrics.total_duplicate_tokens += duplicate.token_count * duplicate.occurrences.length;
      
      // Track affected files
      for (const occurrence of duplicate.occurrences) {
        metrics.files_affected.add(occurrence.file);
      }
      
      // Severity breakdown
      const severity = this.calculateDuplicateSeverity(duplicate);
      metrics.severity_breakdown[severity]++;
      
      // Average similarity
      totalSimilarity += duplicate.similarity_score;
      
      // Largest duplicate
      if (duplicate.token_count > largestSize) {
        largestSize = duplicate.token_count;
        metrics.largest_duplicate = duplicate;
      }
    }
    
    metrics.files_affected = metrics.files_affected.size;
    metrics.average_similarity = duplicates.length > 0 ? 
      Math.round((totalSimilarity / duplicates.length) * 100) / 100 : 0;
    
    return metrics;
  }

  /**
   * Calculate duplicate severity
   */
  calculateDuplicateSeverity(duplicate) {
    const lines = duplicate.line_count;
    const tokens = duplicate.token_count;
    const occurrences = duplicate.occurrences.length;
    
    // Critical: Large duplicates with many occurrences
    if ((lines > 50 && occurrences > 3) || tokens > 200) {
      return 'critical';
    }
    
    // High: Medium size with multiple occurrences
    if ((lines > 20 && occurrences > 2) || tokens > 100) {
      return 'high';
    }
    
    // Medium: Smaller duplicates or fewer occurrences
    if (lines > 10 || tokens > 50) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Calculate duplicate complexity score
   */
  calculateDuplicateComplexity(duplicate) {
    let score = 0;
    
    // Base score from size
    score += Math.min(duplicate.line_count, 50);
    score += Math.min(duplicate.token_count / 10, 20);
    
    // Penalty for multiple occurrences
    score += (duplicate.occurrences.length - 1) * 5;
    
    // Bonus for high similarity
    if (duplicate.similarity_score > 90) {
      score += 10;
    }
    
    return Math.min(score, 100);
  }

  /**
   * Assess maintainability impact
   */
  assessMaintainabilityImpact(duplicate) {
    const severity = this.calculateDuplicateSeverity(duplicate);
    const occurrences = duplicate.occurrences.length;
    
    if (severity === 'critical' || occurrences > 5) {
      return 'high';
    } else if (severity === 'high' || occurrences > 3) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Generate relationships for Kuzu graph
   */
  generateGraphRelationships(duplicates) {
    const relationships = [];
    
    for (const duplicate of duplicates) {
      for (const occurrence of duplicate.occurrences) {
        relationships.push({
          id: `dup:${duplicate.id}:${this.generateFileId(occurrence.file)}`,
          type: 'DUPLICATES',
          from: `duplicate:${duplicate.id}`,
          to: `file:${this.generateFileId(occurrence.file)}`,
          properties: {
            start_line: occurrence.start_line,
            end_line: occurrence.end_line,
            is_first_occurrence: occurrence.is_first,
            similarity_score: duplicate.similarity_score,
            created_at: new Date().toISOString()
          }
        });
      }
    }
    
    return relationships;
  }

  /**
   * Generate summary report
   */
  generateSummary(duplicates, metrics) {
    return {
      overview: {
        total_duplicates: metrics.total_duplicates,
        files_affected: metrics.files_affected,
        total_duplicate_lines: metrics.total_duplicate_lines,
        average_similarity: metrics.average_similarity
      },
      severity_distribution: metrics.severity_breakdown,
      top_duplicates: duplicates
        .sort((a, b) => b.complexity_score - a.complexity_score)
        .slice(0, 10)
        .map(d => ({
          id: d.id,
          lines: d.line_count,
          tokens: d.token_count,
          occurrences: d.occurrences.length,
          complexity: d.complexity_score,
          files: d.occurrences.map(o => o.file)
        })),
      recommendations: this.generateRecommendations(duplicates, metrics)
    };
  }

  /**
   * Generate refactoring recommendations
   */
  generateRecommendations(duplicates, metrics) {
    const recommendations = [];
    
    if (metrics.severity_breakdown.critical > 0) {
      recommendations.push({
        priority: 'high',
        type: 'extract_function',
        description: `Extract ${metrics.severity_breakdown.critical} critical duplicates into reusable functions`,
        estimated_effort: 'high'
      });
    }
    
    if (metrics.severity_breakdown.high > 5) {
      recommendations.push({
        priority: 'medium',
        type: 'consolidate_modules',
        description: 'Consider consolidating duplicated logic into shared modules',
        estimated_effort: 'medium'
      });
    }
    
    if (metrics.files_affected > 20) {
      recommendations.push({
        priority: 'medium',
        type: 'architectural_review',
        description: 'Review architecture to reduce cross-cutting duplication',
        estimated_effort: 'high'
      });
    }
    
    return recommendations;
  }

  /**
   * Count tokens in code (simplified)
   */
  countTokens(code) {
    if (!code) return 0;
    
    // Simple token counting - split by common delimiters
    return code
      .split(/[\s\n\r\t\{\}\(\)\[\]\;\,\.]+/)
      .filter(token => token.length > 0)
      .length;
  }

  /**
   * Generate block hash
   */
  generateBlockHash(code) {
    // Normalize code for hashing (remove whitespace variations)
    const normalized = code
      .replace(/\s+/g, ' ')
      .replace(/;\s*}/g, ';}')
      .trim();
    
    return createHash('md5').update(normalized).digest('hex');
  }

  /**
   * Generate duplicate ID
   */
  generateDuplicateId(duplicate, existing = null) {
    const base = duplicate.hash || 
                 (existing ? `${existing.file}:${existing.start}` : '') ||
                 Math.random().toString(36).substring(7);
    
    return createHash('md5').update(base).digest('hex').substring(0, 16);
  }

  /**
   * Generate file ID
   */
  generateFileId(filePath) {
    return createHash('sha256').update(filePath).digest('hex').substring(0, 16);
  }

  /**
   * Create fallback duplicate analysis when JSCPD isn't available
   */
  async createFallbackDuplicateAnalysis(targetPath) {
    console.log('Using fallback duplicate detection with basic hashing');
    
    const { readFile, readdir, stat } = await import('fs/promises');
    const { join } = await import('path');
    
    const files = await this.getAllJSFiles(targetPath);
    
    const duplicates = [];
    const fileHashes = new Map();
    const lineHashes = new Map();
    
    // Analyze each file
    for (const filePath of files) {
      try {
        const content = await readFile(filePath, 'utf8');
        const lines = content.split('\n');
        
        // Hash each significant line
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.length < 20 || line.startsWith('//') || line.startsWith('/*')) {
            continue; // Skip short lines and comments
          }
          
          const lineHash = createHash('md5').update(line).digest('hex');
          
          if (!lineHashes.has(lineHash)) {
            lineHashes.set(lineHash, []);
          }
          
          lineHashes.get(lineHash).push({
            file: filePath,
            line: i + 1,
            content: line
          });
        }
        
        // Hash blocks of lines
        for (let i = 0; i < lines.length - this.config.minLines; i++) {
          const block = lines.slice(i, i + this.config.minLines).join('\n');
          const blockHash = createHash('md5').update(block).digest('hex');
          
          if (!fileHashes.has(blockHash)) {
            fileHashes.set(blockHash, []);
          }
          
          fileHashes.get(blockHash).push({
            file: filePath,
            startLine: i + 1,
            endLine: i + this.config.minLines,
            content: block
          });
        }
      } catch (error) {
        console.warn(`Failed to analyze ${filePath}: ${error.message}`);
      }
    }
    
    // Find duplicates
    for (const [hash, occurrences] of fileHashes) {
      if (occurrences.length > 1) {
        const duplicateGroup = {
          id: `dup:${duplicates.length}`,
          hash,
          occurrences: occurrences.length,
          similarity: 100, // Exact match in fallback
          lines: this.config.minLines,
          files: occurrences.map(occ => ({
            file: occ.file,
            start_line: occ.startLine,
            end_line: occ.endLine
          }))
        };
        
        duplicates.push(duplicateGroup);
      }
    }
    
    return {
      duplicates,
      statistics: {
        total: {
          files: files.length,
          duplicates: duplicates.length
        },
        formats: {}
      }
    };
  }

  /**
   * Get all JS/TS files recursively
   */
  async getAllJSFiles(dirPath) {
    const { readdir, stat } = await import('fs/promises');
    const { join } = await import('path');
    
    const files = [];
    const extensions = ['.js', '.jsx', '.ts', '.tsx'];
    
    async function walk(currentPath) {
      try {
        const entries = await readdir(currentPath);
        
        for (const entry of entries) {
          const fullPath = join(currentPath, entry);
          const stats = await stat(fullPath);
          
          if (stats.isDirectory()) {
            // Skip common ignored directories
            if (!['node_modules', '.git', 'dist', 'build'].includes(entry)) {
              await walk(fullPath);
            }
          } else if (extensions.some(ext => entry.endsWith(ext))) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        console.warn(`Skipping directory ${currentPath}: ${error.message}`);
      }
    }
    
    await walk(dirPath);
    return files;
  }
}

export default DuplicateCodeDetector;