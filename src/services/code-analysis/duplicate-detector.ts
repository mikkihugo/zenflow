/**
 * Duplicate Code Detector
 * Uses jscpd to detect duplicate code patterns across the codebase
 */

import { exec } from 'node:child_process';
import { createHash } from 'node:crypto';
import { promisify } from 'node:util';

// Import glob using dynamic import to avoid ESM issues
let _glob;

try {
  const globModule = await import('glob');
  _glob = globModule.glob || globModule.default;
} catch (_e) {
  console.warn('Glob not available, using fallback file discovery');
  _glob = null;
}

const execAsync = promisify(exec);

// Check if jscpd is available
let _jscpdAvailable = false;

try {
  await execAsync('which jscpd', {timeout = true;
} catch (_e) {
  console.warn('jscpd not available, using fallback duplicate detection');
  _jscpdAvailable = false;
}

export class DuplicateCodeDetector {
  constructor(config = {}): any {
    this.config = {minTokens = '.'): any {
    console.warn(`🔍 Detecting duplicate codein = await this.runJSCPD(targetPath);
      
      // Process and enhance results
      const duplicates = await this.processDuplicates(jscpdResults);
      
      // Generate summary metrics
      const _metrics = this.calculateDuplicateMetrics(duplicates);
      
      console.warn(`✅ Duplicate detectioncomplete = await this.createJSCPDConfig();
    
    try {
      const command = `npx jscpd ${targetPath} --config ${configPath}`;
      const { stdout, stderr } = await execAsync(command, {maxBuffer = path.join(this.config.outputDir, 'jscpd-report.json');
      try {
        const reportContent = await readFile(outputFile, 'utf8');
        return JSON.parse(reportContent);
      } catch(error) {
        // Fallback = {minTokens = path.join(this.config.outputDir, '.jscpd.json');
    await writeFile(configPath, JSON.stringify(config, null, 2));
    
    return configPath;
  }

  /**
   * Parse jscpd stdout output
   */
  parseJSCPDOutput(output): any {
    // Simple parser for jscpd output - this is a fallback
    const lines = output.split('\n');
    const duplicates = [];

    for(const line of lines) {
      if (line.includes('Found') && line.includes('clones')) {
        // Parse clone information
        const match = line.match(/Found (\d+) clones/);
        if(match) {
          console.warn(`📊 Found ${match1} duplicates in output`);
        }
      }
    }
    
    return { duplicates,statistics = glob ? 
      await glob(this.config.filePatterns, {cwd = [];
    const codeBlocks = new Map();
    
    for(const file of files) {
      try {
        const content = await readFile(file, 'utf8');
        const blocks = this.extractCodeBlocks(content, file);
        
        for(const block of blocks) {
          const hash = this.generateBlockHash(block.code);
          
          if (codeBlocks.has(hash)) {
            const existing = codeBlocks.get(hash);
            duplicates.push({id = content.split('\n');
    const blocks = [];
    const minLines = this.config.minLines;
    
    for(let i = 0; i <= lines.length - minLines; i++) {
      const block = lines.slice(i, i + minLines).join('\n');
      
      // Skip blocks that are mostly whitespace or comments
      if (this.isSignificantBlock(block)) {
        blocks.push({start = code.split('\n');
    const significantLines = 0;
    
    for(const line of lines) {
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
  async processDuplicates(jscpdResults): any {
    const duplicates = [];
    
    if(jscpdResults.duplicates) {
      for(const duplicate of jscpdResults.duplicates) {
        const processed = await this.enhanceDuplicate(duplicate);
        duplicates.push(processed);
      }
    }
    
    return duplicates;
  }

  /**
   * Enhance duplicate information
   */
  async enhanceDuplicate(duplicate): any {
    const enhanced = {id = 0; i < duplicate.files.length; i++) {
        const file = duplicate.files[i];
        const occurrence = {file = == 0
        };
        
        enhanced.occurrences.push(occurrence);
        
        if(i === 0) {
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
  calculateDuplicateMetrics(duplicates): any {
    const metrics = {total_duplicates = 0;
    let largestSize = 0;
    
    for(const duplicate of duplicates) {
      metrics.total_duplicate_lines += duplicate.line_count * duplicate.occurrences.length;
      metrics.total_duplicate_tokens += duplicate.token_count * duplicate.occurrences.length;
      
      // Track affected files
      for(const occurrence of duplicate.occurrences) {
        metrics.files_affected.add(occurrence.file);
      }
      
      // Severity breakdown
      const severity = this.calculateDuplicateSeverity(duplicate);
      metrics.severity_breakdown[severity]++;
      
      // Average similarity
      totalSimilarity += duplicate.similarity_score;
      
      // Largest duplicate
      if(duplicate.token_count > largestSize) {
        largestSize = duplicate.token_count;
        metrics.largest_duplicate = duplicate;
      }
    }
    
    metrics.files_affected = metrics.files_affected.size;
    metrics.average_similarity = duplicates.length > 0 ? 
      Math.round((totalSimilarity / duplicates.length) * 100) /100 = duplicate.line_count;
    const tokens = duplicate.token_count;
    const occurrences = duplicate.occurrences.length;
    
    //Critical = 0;
    
    // Base score from size
    score += Math.min(duplicate.line_count, 50);
    score += Math.min(duplicate.token_count / 10, 20);
    
    // Penalty for multiple occurrences
    score += (duplicate.occurrences.length - 1) * 5;
    
    // Bonus for high similarity
    if(duplicate.similarity_score > 90) {
      score += 10;
    }
    
    return Math.min(score, 100);
  }

  /**
   * Assess maintainability impact
   */
  assessMaintainabilityImpact(duplicate): any {
    const severity = this.calculateDuplicateSeverity(duplicate);
    const occurrences = duplicate.occurrences.length;
    
    if(severity === 'critical' || occurrences > 5) {
      return 'high';
    } else if(severity === 'high' || occurrences > 3) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Generate relationships for Kuzu graph
   */
  generateGraphRelationships(duplicates): any {
    const relationships = [];
    
    for(const duplicate of duplicates) {
      for(const occurrence of duplicate.occurrences) {
        relationships.push({id = > b.complexity_score - a.complexity_score)
        .slice(0, 10)
        .map(d => ({id = > o.file)
        })),recommendations = [];
    
    if(metrics.severity_breakdown.critical > 0) {
      recommendations.push({priority = > token.length > 0)
      .length;
  }

  /**
   * Generate block hash
   */
  generateBlockHash(code): any {
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
  generateDuplicateId(duplicate, existing = null): any {
    const base = duplicate.hash || 
                 (existing ? `${existing.file}:${existing.start}` : '') ||
                 Math.random().toString(36).substring(7);
    
    return createHash('md5').update(base).digest('hex').substring(0, 16);
  }

  /**
   * Generate file ID
   */
  generateFileId(filePath): any {
    return createHash('sha256').update(filePath).digest('hex').substring(0, 16);
  }

  /**
   * Create fallback duplicate analysis when JSCPD isn't available
   */
  async createFallbackDuplicateAnalysis(targetPath): any {
    console.warn('Using fallback duplicate detection with basic hashing');
    
    const { readFile, readdir, stat } = await import('node:fs/promises');
    const { join } = await import('node:path');
    
    const files = await this.getAllJSFiles(targetPath);
    
    const _duplicates = [];
    const fileHashes = new Map();
    const lineHashes = new Map();
    
    // Analyze each file
    for(const filePath of files) {
      try {
        const content = await readFile(filePath, 'utf8');
        const lines = content.split('\n');
        
        // Hash each significant line
        for(let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.length < 20 || line.startsWith('//') || line.startsWith('/*')) {
            continue; // Skip short lines and comments
          }
          
          const lineHash = createHash('md5').update(line).digest('hex');
          
          if (!lineHashes.has(lineHash)) {
            lineHashes.set(lineHash, []);
          }
          
          lineHashes.get(lineHash).push({file = 0; i < lines.length - this.config.minLines; i++) {
          const block = lines.slice(i, i + this.config.minLines).join('\n');
          const blockHash = createHash('md5').update(block).digest('hex');
          
          if (!fileHashes.has(blockHash)) {
            fileHashes.set(blockHash, []);
          }
          
          fileHashes.get(blockHash).push({
            file = {id = > ({file = await import('node:fs/promises');
    const { join } = await import('node:path');
    
    const files = [];
    const extensions = ['.js', '.jsx', '.ts', '.tsx'];
    
    async function walk(currentPath = await readdir(currentPath);
        
        for(const entry of entries) {
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
      } catch(error) 
        console.warn(`Skipping directory $currentPath: $error.message`);
    }
    
    await walk(dirPath);
    return files;
  }
}

export default DuplicateCodeDetector;
