#!/usr/bin/env node

/**
 * Documentation Coverage Reporter for Unified Architecture
 *
 * @fileoverview Advanced documentation coverage analysis tool that provides detailed
 *               metrics, trends, and quality assessments across all four unified
 *               architecture layers (UACL, DAL, USL, UEL). Integrates with CI/CD
 *               pipelines and generates comprehensive coverage reports.
 * @version 2.0.0
 * @since 2.0.0-alpha.73
 * @author Claude-Zen Documentation Team
 */

const fs = require('node:fs').promises;
const path = require('node:path');
const { execSync } = require('node:child_process');

/**
 * Documentation Coverage Reporter - Comprehensive coverage analysis and reporting
 *
 * Provides detailed analysis of documentation coverage including:
 * - Layer-specific coverage metrics (UACL, DAL, USL, UEL)
 * - Historical trend analysis and coverage drift detection
 * - Quality scoring with weighted metrics
 * - Integration with TypeDoc and ESLint for comprehensive analysis
 * - CI/CD pipeline integration with badge generation
 *
 * @class DocsCoverageReporter
 */
class DocsCoverageReporter {
  /**
   * Initialize documentation coverage reporter
   *
   * @param {Object} config - Reporter configuration
   * @param {string} config.rootDir - Root source directory
   * @param {string} config.outputDir - Output directory for reports
   * @param {Object} config.thresholds - Coverage thresholds by layer
   * @param {boolean} [config.generateBadges=true] - Generate coverage badges
   * @param {boolean} [config.trackHistory=true] - Enable historical tracking
   *
   * @example Basic Reporter Setup
   * ```javascript
   * const reporter = new DocsCoverageReporter({
   *   rootDir: './src',
   *   outputDir: './docs/coverage',
   *   thresholds: {
   *     uacl: { minimum: 85, target: 95 },
   *     dal: { minimum: 90, target: 98 },
   *     usl: { minimum: 85, target: 95 },
   *     uel: { minimum: 80, target: 90 }
   *   }
   * });
   * ```
   */
  constructor(config) {
    this.rootDir = config.rootDir || './src';
    this.outputDir = config.outputDir || './docs/coverage';
    this.generateBadges = config.generateBadges !== false;
    this.trackHistory = config.trackHistory !== false;

    // Coverage thresholds by layer
    this.thresholds = config.thresholds || {
      uacl: { minimum: 80, target: 90 },
      dal: { minimum: 85, target: 95 },
      usl: { minimum: 80, target: 90 },
      uel: { minimum: 75, target: 85 },
    };

    // Layer mappings
    this.layerMappings = {
      uacl: {
        path: 'interfaces/clients',
        name: 'Unified API Client Layer',
        weight: 1.2, // Higher weight for client interfaces
      },
      dal: {
        path: 'database',
        name: 'Data Access Layer',
        weight: 1.3, // Highest weight for data layer
      },
      usl: {
        path: 'interfaces/services',
        name: 'Unified Service Layer',
        weight: 1.1,
      },
      uel: {
        path: 'interfaces/events',
        name: 'Unified Event Layer',
        weight: 1.0,
      },
    };

    // Coverage analysis results
    this.coverage = {
      overall: { documented: 0, total: 0, percentage: 0, quality: 0 },
      layers: {},
      files: [],
      trends: {},
      badges: {},
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Generate comprehensive documentation coverage report
   *
   * @returns {Promise<CoverageResults>} Complete coverage analysis results
   *
   * @throws {CoverageError} When coverage analysis fails
   *
   * @example Generate Complete Coverage Report
   * ```javascript
   * const reporter = new DocsCoverageReporter({ rootDir: './src' });
   *
   * try {
   *   const results = await reporter.generateReport();
   *
   *   console.log('Overall Coverage:', results.overall.percentage);
   *   console.log('Quality Score:', results.overall.quality);
   *
   *   // Check layer performance
   *   Object.entries(results.layers).forEach(([layer, data]) => {
   *     console.log(`${layer}: ${data.percentage}% (${data.status})`);
   *   });
   *
   *   // Generate CI/CD badges
   *   if (results.badges.coverage) {
   *     console.log('Coverage Badge:', results.badges.coverage);
   *   }
   * } catch (error) {
   *   console.error('Coverage analysis failed:', error.message);
   * }
   * ```
   */
  async generateReport() {
    try {
      // Initialize output directory
      await this.ensureOutputDirectory();

      // Analyze coverage for each layer
      for (const [layerKey, layerConfig] of Object.entries(
        this.layerMappings,
      )) {
        await this.analyzeLayer(layerKey, layerConfig);
      }

      // Calculate overall metrics
      this.calculateOverallMetrics();

      // Load historical data if tracking is enabled
      if (this.trackHistory) {
        await this.loadHistoricalData();
        this.analyzeTrends();
      }

      // Generate badges if enabled
      if (this.generateBadges) {
        await this.generateCoverageBadges();
      }

      // Save results and generate reports
      await this.saveResults();
      await this.generateHTMLReport();
      await this.generateMarkdownReport();
      return this.coverage;
    } catch (error) {
      // console.error('❌ Coverage report generation failed:', error.message);
      throw error;
    }
  }

  /**
   * Analyze documentation coverage for a specific architecture layer
   *
   * @param {string} layerKey - Layer identifier (uacl, dal, usl, uel)
   * @param {Object} layerConfig - Layer configuration object
   *
   * @returns {Promise<LayerCoverage>} Layer coverage analysis results
   *
   * @example Layer Analysis
   * ```javascript
   * const dalResults = await reporter.analyzeLayer('dal', {
   *   path: 'database',
   *   name: 'Data Access Layer',
   *   weight: 1.3
   * });
   *
   * console.log('DAL Coverage:', dalResults.percentage);
   * console.log('DAL Quality:', dalResults.quality);
   * console.log('DAL Status:', dalResults.status);
   * ```
   */
  async analyzeLayer(layerKey, layerConfig) {
    const layerPath = path.join(this.rootDir, layerConfig.path);

    const layerCoverage = {
      name: layerConfig.name,
      path: layerConfig.path,
      weight: layerConfig.weight,
      files: [],
      documented: 0,
      total: 0,
      percentage: 0,
      quality: 0,
      status: 'unknown',
      issues: [],
    };

    try {
      // Check if layer directory exists
      await fs.access(layerPath);

      // Find and analyze TypeScript files
      const files = await this.findTypeScriptFiles(layerPath);

      for (const file of files) {
        const fileAnalysis = await this.analyzeFile(file, layerKey);
        layerCoverage.files.push(fileAnalysis);
        layerCoverage.documented += fileAnalysis.documented;
        layerCoverage.total += fileAnalysis.total;
      }

      // Calculate layer metrics
      layerCoverage.percentage =
        layerCoverage.total > 0
          ? (layerCoverage.documented / layerCoverage.total) * 100
          : 0;

      layerCoverage.quality = this.calculateQualityScore(layerCoverage.files);
      layerCoverage.status = this.determineLayerStatus(
        layerCoverage.percentage,
        layerKey,
      );

      // Identify issues
      layerCoverage.issues = this.identifyLayerIssues(layerCoverage, layerKey);

      this.coverage.layers[layerKey] = layerCoverage;
    } catch (error) {
      layerCoverage.status = 'error';
      layerCoverage.issues.push(`Analysis failed: ${error.message}`);
      this.coverage.layers[layerKey] = layerCoverage;
    }
  }

  /**
   * Analyze documentation coverage for a single file
   *
   * @param {string} filePath - Path to TypeScript file
   * @param {string} layer - Layer identifier
   *
   * @returns {Promise<FileCoverage>} File coverage analysis
   *
   * @example File Analysis
   * ```javascript
   * const fileResults = await reporter.analyzeFile(
   *   './src/database/factory.ts',
   *   'dal'
   * );
   *
   * console.log('File Coverage:', fileResults.percentage);
   * console.log('Constructs Found:', fileResults.constructs);
   * console.log('Documentation Issues:', fileResults.issues);
   * ```
   */
  async analyzeFile(filePath, layer) {
    const fileContent = await fs.readFile(filePath, 'utf8');
    const relativePath = path.relative(this.rootDir, filePath);

    const fileAnalysis = {
      path: relativePath,
      layer: layer,
      size: fileContent.length,
      documented: 0,
      total: 0,
      percentage: 0,
      constructs: {
        fileOverview: false,
        classes: 0,
        interfaces: 0,
        functions: 0,
        methods: 0,
        exports: 0,
      },
      documentation: {
        fileOverview: false,
        classes: 0,
        interfaces: 0,
        functions: 0,
        methods: 0,
      },
      quality: {
        hasExamples: false,
        hasDetailedParams: false,
        hasReturnDocs: false,
        hasErrorDocs: false,
      },
      issues: [],
    };

    try {
      // Analyze file structure and JSDoc
      this.analyzeFileStructure(fileContent, fileAnalysis);
      this.analyzeFileDocumentation(fileContent, fileAnalysis);
      this.calculateFileMetrics(fileAnalysis);
      this.identifyFileIssues(fileAnalysis, layer);
    } catch (error) {
      fileAnalysis.issues.push(`Analysis error: ${error.message}`);
    }

    return fileAnalysis;
  }

  /**
   * Analyze TypeScript file structure to identify documentable constructs
   *
   * @param {string} content - File content
   * @param {Object} analysis - File analysis object to update
   *
   * @example Structure Analysis
   * ```javascript
   * const analysis = { constructs: {}, total: 0 };
   * reporter.analyzeFileStructure(fileContent, analysis);
   *
   * console.log('Classes found:', analysis.constructs.classes);
   * console.log('Functions found:', analysis.constructs.functions);
   * ```
   */
  analyzeFileStructure(content, analysis) {
    // File-level documentation
    analysis.total += 1; // Count file itself

    // Count classes
    const classMatches = content.match(/export\s+class\s+\w+/g);
    analysis.constructs.classes = classMatches ? classMatches.length : 0;
    analysis.total += analysis.constructs.classes;

    // Count interfaces
    const interfaceMatches = content.match(/export\s+interface\s+\w+/g);
    analysis.constructs.interfaces = interfaceMatches
      ? interfaceMatches.length
      : 0;
    analysis.total += analysis.constructs.interfaces;

    // Count functions
    const functionMatches = content.match(
      /export\s+(?:async\s+)?function\s+\w+/g,
    );
    analysis.constructs.functions = functionMatches
      ? functionMatches.length
      : 0;
    analysis.total += analysis.constructs.functions;

    // Count methods (simplified - methods inside classes)
    const methodMatches = content.match(
      /(?:public|private|protected)?\s*(?:async\s+)?\w+\s*\([^)]*\)\s*[:{]/g,
    );
    analysis.constructs.methods = methodMatches
      ? Math.max(0, methodMatches.length - analysis.constructs.classes)
      : 0;
    analysis.total += analysis.constructs.methods;

    // Count exports
    const exportMatches = content.match(/export\s+(?:const|let|var)\s+\w+/g);
    analysis.constructs.exports = exportMatches ? exportMatches.length : 0;
    analysis.total += analysis.constructs.exports;
  }

  /**
   * Analyze JSDoc documentation quality and coverage
   *
   * @param {string} content - File content
   * @param {Object} analysis - File analysis object to update
   */
  analyzeFileDocumentation(content, analysis) {
    // File-level JSDoc
    if (content.includes('@fileoverview')) {
      analysis.constructs.fileOverview = true;
      analysis.documentation.fileOverview = true;
      analysis.documented += 1;
    }

    // JSDoc comments analysis
    const jsDocRegex = /\/\*\*([\s\S]*?)\*\//g;
    const jsDocComments = [...content.matchAll(jsDocRegex)];

    // Analyze JSDoc quality
    for (const comment of jsDocComments) {
      const jsDocContent = comment[1];

      if (jsDocContent.includes('@example')) {
        analysis.quality.hasExamples = true;
      }
      if (jsDocContent.includes('@param') && jsDocContent.includes(' - ')) {
        analysis.quality.hasDetailedParams = true;
      }
      if (jsDocContent.includes('@returns')) {
        analysis.quality.hasReturnDocs = true;
      }
      if (jsDocContent.includes('@throws')) {
        analysis.quality.hasErrorDocs = true;
      }
    }

    // Count documented constructs (simplified)
    // This is a basic implementation - could be enhanced with AST parsing
    const documentedClasses = this.countDocumentedConstructs(content, 'class');
    const documentedInterfaces = this.countDocumentedConstructs(
      content,
      'interface',
    );
    const documentedFunctions = this.countDocumentedConstructs(
      content,
      'function',
    );

    analysis.documentation.classes = documentedClasses;
    analysis.documentation.interfaces = documentedInterfaces;
    analysis.documentation.functions = documentedFunctions;

    analysis.documented +=
      documentedClasses + documentedInterfaces + documentedFunctions;
  }

  /**
   * Count documented constructs of a specific type
   *
   * @param {string} content - File content
   * @param {string} type - Construct type (class, interface, function)
   * @returns {number} Number of documented constructs
   */
  countDocumentedConstructs(content, type) {
    // Look for JSDoc comment followed by construct declaration
    const regex = new RegExp(
      `/\\*\\*[\\s\\S]*?\\*/\\s*export\\s+${type}\\s+\\w+`,
      'g',
    );
    const matches = content.match(regex);
    return matches ? matches.length : 0;
  }

  /**
   * Calculate file-level coverage metrics
   *
   * @param {Object} analysis - File analysis object
   */
  calculateFileMetrics(analysis) {
    analysis.percentage =
      analysis.total > 0 ? (analysis.documented / analysis.total) * 100 : 0;
  }

  /**
   * Identify documentation issues in a file
   *
   * @param {Object} analysis - File analysis object
   * @param {string} layer - Layer identifier
   */
  identifyFileIssues(analysis, layer) {
    // Layer-specific requirements
    const layerRequirements = {
      uacl: { requireExamples: true, requireReturns: true },
      dal: { requireExamples: true, requireThrows: true },
      usl: { requireExamples: true, requireReturns: true },
      uel: { requireExamples: true, requireReturns: true },
    };

    const requirements = layerRequirements[layer] || {};

    if (!analysis.constructs.fileOverview) {
      analysis.issues.push('Missing file-level @fileoverview documentation');
    }

    if (analysis.percentage < 50) {
      analysis.issues.push('Low documentation coverage (< 50%)');
    }

    if (requirements.requireExamples && !analysis.quality.hasExamples) {
      analysis.issues.push('Missing @example tags for layer requirements');
    }

    if (requirements.requireReturns && !analysis.quality.hasReturnDocs) {
      analysis.issues.push(
        'Missing @returns documentation for layer requirements',
      );
    }

    if (requirements.requireThrows && !analysis.quality.hasErrorDocs) {
      analysis.issues.push(
        'Missing @throws documentation for layer requirements',
      );
    }
  }

  /**
   * Calculate overall documentation metrics across all layers
   *
   * @example Overall Metrics Calculation
   * ```javascript
   * reporter.calculateOverallMetrics();
   *
   * console.log('Overall Coverage:', reporter.coverage.overall.percentage);
   * console.log('Weighted Quality:', reporter.coverage.overall.quality);
   * ```
   */
  calculateOverallMetrics() {
    let totalDocumented = 0;
    let totalConstructs = 0;
    let weightedQuality = 0;
    let totalWeight = 0;

    // Aggregate across all layers
    for (const [layerKey, layerData] of Object.entries(this.coverage.layers)) {
      totalDocumented += layerData.documented;
      totalConstructs += layerData.total;

      // Weight quality by layer importance
      const weight = this.layerMappings[layerKey].weight || 1;
      weightedQuality += layerData.quality * weight;
      totalWeight += weight;
    }

    // Calculate overall metrics
    this.coverage.overall.documented = totalDocumented;
    this.coverage.overall.total = totalConstructs;
    this.coverage.overall.percentage =
      totalConstructs > 0 ? (totalDocumented / totalConstructs) * 100 : 0;

    this.coverage.overall.quality =
      totalWeight > 0 ? weightedQuality / totalWeight : 0;

    // Determine overall status
    this.coverage.overall.status = this.determineOverallStatus();
  }

  /**
   * Calculate quality score for a set of files
   *
   * @param {Array} files - Array of file analysis objects
   * @returns {number} Quality score (0-100)
   */
  calculateQualityScore(files) {
    if (files.length === 0) return 0;

    let totalScore = 0;
    const totalFiles = files.length;

    for (const file of files) {
      let fileScore = 0;
      let maxScore = 0;

      // Coverage component (40% of score)
      fileScore += (file.percentage / 100) * 40;
      maxScore += 40;

      // Quality indicators (60% of score)
      if (file.quality.hasExamples) fileScore += 15;
      if (file.quality.hasDetailedParams) fileScore += 15;
      if (file.quality.hasReturnDocs) fileScore += 15;
      if (file.quality.hasErrorDocs) fileScore += 15;
      maxScore += 60;

      totalScore += (fileScore / maxScore) * 100;
    }

    return totalScore / totalFiles;
  }

  /**
   * Determine layer status based on coverage percentage and thresholds
   *
   * @param {number} percentage - Coverage percentage
   * @param {string} layerKey - Layer identifier
   * @returns {string} Status string (excellent, good, needs-improvement, poor)
   */
  determineLayerStatus(percentage, layerKey) {
    const thresholds = this.thresholds[layerKey];

    if (percentage >= thresholds.target) return 'excellent';
    if (percentage >= thresholds.minimum) return 'good';
    if (percentage >= thresholds.minimum * 0.7) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Determine overall documentation status
   *
   * @returns {string} Overall status assessment
   */
  determineOverallStatus() {
    const percentage = this.coverage.overall.percentage;

    if (percentage >= 90) return 'excellent';
    if (percentage >= 80) return 'good';
    if (percentage >= 60) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Identify layer-specific issues and recommendations
   *
   * @param {Object} layerCoverage - Layer coverage data
   * @param {string} layerKey - Layer identifier
   * @returns {Array} Array of issue descriptions
   */
  identifyLayerIssues(layerCoverage, layerKey) {
    const issues = [];
    const thresholds = this.thresholds[layerKey];

    if (layerCoverage.percentage < thresholds.minimum) {
      issues.push(`Coverage below minimum threshold (${thresholds.minimum}%)`);
    }

    if (layerCoverage.quality < 60) {
      issues.push('Documentation quality below acceptable level');
    }

    const filesWithIssues = layerCoverage.files.filter(
      (f) => f.issues.length > 0,
    );
    if (filesWithIssues.length > 0) {
      issues.push(`${filesWithIssues.length} files have documentation issues`);
    }

    return issues;
  }

  /**
   * Find all TypeScript files in a directory recursively
   *
   * @param {string} dir - Directory to search
   * @returns {Promise<string[]>} Array of TypeScript file paths
   */
  async findTypeScriptFiles(dir) {
    const files = [];

    async function traverse(currentDir) {
      try {
        const entries = await fs.readdir(currentDir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(currentDir, entry.name);

          if (entry.isDirectory()) {
            if (
              !entry.name.startsWith('.') &&
              entry.name !== 'node_modules' &&
              entry.name !== '__tests__' &&
              entry.name !== 'tests'
            ) {
              await traverse(fullPath);
            }
          } else if (
            entry.isFile() &&
            (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) &&
            !entry.name.endsWith('.test.ts') &&
            !entry.name.endsWith('.spec.ts') &&
            !entry.name.endsWith('.d.ts')
          ) {
            files.push(fullPath);
          }
        }
      } catch (_error) {
        // Skip directories that can't be read
      }
    }

    await traverse(dir);
    return files;
  }

  /**
   * Generate coverage badges for README and documentation
   *
   * @returns {Promise<void>} Badge generation completion
   *
   * @example Generate Badges
   * ```javascript
   * await reporter.generateCoverageBadges();
   *
   * console.log('Coverage Badge URL:', reporter.coverage.badges.coverage);
   * console.log('Quality Badge URL:', reporter.coverage.badges.quality);
   * ```
   */
  async generateCoverageBadges() {
    const percentage = Math.round(this.coverage.overall.percentage);
    const quality = Math.round(this.coverage.overall.quality);

    // Generate shields.io badge URLs
    this.coverage.badges = {
      coverage: `https://img.shields.io/badge/docs%20coverage-${percentage}%25-${this.getBadgeColor(percentage)}`,
      quality: `https://img.shields.io/badge/docs%20quality-${quality}%25-${this.getBadgeColor(quality)}`,
      status: `https://img.shields.io/badge/docs%20status-${this.coverage.overall.status}-${this.getStatusColor(this.coverage.overall.status)}`,
    };

    // Generate layer-specific badges
    for (const [layerKey, layerData] of Object.entries(this.coverage.layers)) {
      const layerPercentage = Math.round(layerData.percentage);
      this.coverage.badges[layerKey] =
        `https://img.shields.io/badge/${layerKey}-${layerPercentage}%25-${this.getBadgeColor(layerPercentage)}`;
    }
  }

  /**
   * Get badge color based on percentage
   *
   * @param {number} percentage - Coverage/quality percentage
   * @returns {string} Color code for badge
   */
  getBadgeColor(percentage) {
    if (percentage >= 90) return 'brightgreen';
    if (percentage >= 80) return 'green';
    if (percentage >= 70) return 'yellowgreen';
    if (percentage >= 60) return 'yellow';
    if (percentage >= 40) return 'orange';
    return 'red';
  }

  /**
   * Get badge color based on status
   *
   * @param {string} status - Status string
   * @returns {string} Color code for badge
   */
  getStatusColor(status) {
    const colors = {
      excellent: 'brightgreen',
      good: 'green',
      'needs-improvement': 'yellow',
      poor: 'red',
      error: 'critical',
    };
    return colors[status] || 'lightgrey';
  }

  /**
   * Load historical coverage data for trend analysis
   *
   * @returns {Promise<void>} Historical data loading completion
   */
  async loadHistoricalData() {
    const historyFile = path.join(this.outputDir, 'coverage-history.json');

    try {
      const historyContent = await fs.readFile(historyFile, 'utf8');
      this.coverage.history = JSON.parse(historyContent);
    } catch (_error) {
      // No history file exists yet
      this.coverage.history = [];
    }
  }

  /**
   * Analyze coverage trends over time
   */
  analyzeTrends() {
    if (!this.coverage.history || this.coverage.history.length === 0) {
      return;
    }

    const recent = this.coverage.history.slice(-5); // Last 5 reports

    if (recent.length >= 2) {
      const latest = recent[recent.length - 1];
      const previous = recent[recent.length - 2];

      this.coverage.trends = {
        coverage: latest.overall.percentage - previous.overall.percentage,
        quality: latest.overall.quality - previous.overall.quality,
        direction:
          latest.overall.percentage > previous.overall.percentage
            ? 'up'
            : latest.overall.percentage < previous.overall.percentage
              ? 'down'
              : 'stable',
      };
    }
  }

  /**
   * Ensure output directory exists
   *
   * @returns {Promise<void>} Directory creation completion
   */
  async ensureOutputDirectory() {
    await fs.mkdir(this.outputDir, { recursive: true });
  }

  /**
   * Save coverage results to JSON file
   *
   * @returns {Promise<void>} Results saving completion
   */
  async saveResults() {
    const resultsPath = path.join(this.outputDir, 'coverage-results.json');
    await fs.writeFile(resultsPath, JSON.stringify(this.coverage, null, 2));

    // Update history if tracking is enabled
    if (this.trackHistory) {
      const historyPath = path.join(this.outputDir, 'coverage-history.json');

      // Load existing history
      let history = [];
      try {
        const historyContent = await fs.readFile(historyPath, 'utf8');
        history = JSON.parse(historyContent);
      } catch (_error) {
        // No history file exists
      }

      // Add current results to history
      history.push({
        timestamp: this.coverage.timestamp,
        overall: this.coverage.overall,
        layers: Object.fromEntries(
          Object.entries(this.coverage.layers).map(([key, data]) => [
            key,
            {
              percentage: data.percentage,
              quality: data.quality,
              status: data.status,
            },
          ]),
        ),
      });

      // Keep last 30 entries
      if (history.length > 30) {
        history = history.slice(-30);
      }

      await fs.writeFile(historyPath, JSON.stringify(history, null, 2));
    }
  }

  /**
   * Generate HTML coverage report
   *
   * @returns {Promise<void>} HTML report generation completion
   */
  async generateHTMLReport() {
    const htmlContent = this.buildHTMLReport();
    const htmlPath = path.join(this.outputDir, 'coverage-report.html');
    await fs.writeFile(htmlPath, htmlContent);
  }

  /**
   * Generate Markdown coverage report
   *
   * @returns {Promise<void>} Markdown report generation completion
   */
  async generateMarkdownReport() {
    const markdownContent = this.buildMarkdownReport();
    const markdownPath = path.join(this.outputDir, 'coverage-report.md');
    await fs.writeFile(markdownPath, markdownContent);
  }

  /**
   * Build HTML coverage report
   *
   * @returns {string} HTML report content
   */
  buildHTMLReport() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documentation Coverage Report - Claude-Zen</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; line-height: 1.6; }
        .header { border-bottom: 3px solid #007acc; padding-bottom: 20px; margin-bottom: 30px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .metric-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #007acc; }
        .metric-value { font-size: 2em; font-weight: bold; color: #007acc; }
        .layer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 30px 0; }
        .layer-card { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; }
        .layer-header { font-size: 1.2em; font-weight: bold; margin-bottom: 15px; }
        .status-excellent { color: #28a745; }
        .status-good { color: #17a2b8; }
        .status-needs-improvement { color: #ffc107; }
        .status-poor { color: #dc3545; }
        .progress-bar { width: 100%; height: 10px; background: #e9ecef; border-radius: 5px; overflow: hidden; }
        .progress-fill { height: 100%; background: #007acc; transition: width 0.3s ease; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { text-align: left; padding: 12px; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; font-weight: 600; }
        .trend-up { color: #28a745; }
        .trend-down { color: #dc3545; }
        .trend-stable { color: #6c757d; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Documentation Coverage Report</h1>
        <p><strong>Claude-Zen Unified Architecture</strong> | Generated: ${new Date(this.coverage.timestamp).toLocaleString()}</p>
    </div>

    <div class="metrics">
        <div class="metric-card">
            <div class="metric-value">${this.coverage.overall.percentage.toFixed(1)}%</div>
            <div>Overall Coverage</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${this.coverage.overall.quality.toFixed(1)}%</div>
            <div>Quality Score</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${this.coverage.overall.documented}</div>
            <div>Documented Items</div>
        </div>
        <div class="metric-card">
            <div class="metric-value status-${this.coverage.overall.status}">${this.coverage.overall.status.toUpperCase()}</div>
            <div>Overall Status</div>
        </div>
    </div>

    <h2>Layer Breakdown</h2>
    <div class="layer-grid">
        ${Object.entries(this.coverage.layers)
          .map(
            ([_key, layer]) => `
        <div class="layer-card">
            <div class="layer-header">${layer.name}</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${layer.percentage}%"></div>
            </div>
            <p><strong>Coverage:</strong> ${layer.percentage.toFixed(1)}% (${layer.documented}/${layer.total})</p>
            <p><strong>Quality:</strong> ${layer.quality.toFixed(1)}%</p>
            <p><strong>Status:</strong> <span class="status-${layer.status}">${layer.status}</span></p>
            <p><strong>Files:</strong> ${layer.files.length}</p>
            ${layer.issues.length > 0 ? `<p><strong>Issues:</strong> ${layer.issues.length}</p>` : ''}
        </div>
        `,
          )
          .join('')}
    </div>

    ${
      this.coverage.trends
        ? `
    <h2>Trends</h2>
    <div class="metrics">
        <div class="metric-card">
            <div class="metric-value trend-${this.coverage.trends.direction}">
                ${this.coverage.trends.coverage > 0 ? '+' : ''}${this.coverage.trends.coverage.toFixed(1)}%
            </div>
            <div>Coverage Change</div>
        </div>
        <div class="metric-card">
            <div class="metric-value trend-${this.coverage.trends.quality > 0 ? 'up' : this.coverage.trends.quality < 0 ? 'down' : 'stable'}">
                ${this.coverage.trends.quality > 0 ? '+' : ''}${this.coverage.trends.quality.toFixed(1)}%
            </div>
            <div>Quality Change</div>
        </div>
    </div>
    `
        : ''
    }

    <h2>File Details</h2>
    <table>
        <thead>
            <tr>
                <th>File</th>
                <th>Layer</th>
                <th>Coverage</th>
                <th>Quality</th>
                <th>Issues</th>
            </tr>
        </thead>
        <tbody>
            ${this.coverage.files
              .map(
                (file) => `
            <tr>
                <td>${file.path}</td>
                <td>${file.layer.toUpperCase()}</td>
                <td>${file.percentage.toFixed(1)}%</td>
                <td>${file.quality.hasExamples ? '📝' : ''} ${file.quality.hasDetailedParams ? '📋' : ''} ${file.quality.hasReturnDocs ? '↩️' : ''} ${file.quality.hasErrorDocs ? '⚠️' : ''}</td>
                <td>${file.issues.length}</td>
            </tr>
            `,
              )
              .join('')}
        </tbody>
    </table>

    <footer style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; color: #6c757d;">
        <p><em>Generated by Claude-Zen Documentation Coverage Reporter v2.0.0</em></p>
    </footer>
</body>
</html>`;
  }

  /**
   * Build Markdown coverage report
   *
   * @returns {string} Markdown report content
   */
  buildMarkdownReport() {
    return `# 📊 Documentation Coverage Report - Claude-Zen Unified Architecture

**Generated:** ${new Date(this.coverage.timestamp).toLocaleString()}

## Executive Summary

![Coverage Badge](${this.coverage.badges?.coverage || ''})
![Quality Badge](${this.coverage.badges?.quality || ''})
![Status Badge](${this.coverage.badges?.status || ''})

- **Overall Coverage:** ${this.coverage.overall.percentage.toFixed(1)}% (${this.coverage.overall.documented}/${this.coverage.overall.total})
- **Quality Score:** ${this.coverage.overall.quality.toFixed(1)}%
- **Status:** ${this.coverage.overall.status.toUpperCase()}

## Layer Performance

${Object.entries(this.coverage.layers)
  .map(
    ([key, layer]) => `
### ${layer.name} (${key.toUpperCase()})

![${key} Badge](${this.coverage.badges?.[key] || ''})

- **Coverage:** ${layer.percentage.toFixed(1)}% (${layer.documented}/${layer.total})
- **Quality:** ${layer.quality.toFixed(1)}%
- **Status:** ${layer.status}
- **Files:** ${layer.files.length}
- **Issues:** ${layer.issues.length}

${
  layer.issues.length > 0
    ? `**Issues Found:**
${layer.issues.map((issue) => `- ❌ ${issue}`).join('\n')}`
    : '✅ No issues found'
}
`,
  )
  .join('')}

${
  this.coverage.trends
    ? `## Trends

- **Coverage Change:** ${this.coverage.trends.coverage > 0 ? '📈' : this.coverage.trends.coverage < 0 ? '📉' : '➡️'} ${this.coverage.trends.coverage > 0 ? '+' : ''}${this.coverage.trends.coverage.toFixed(1)}%
- **Quality Change:** ${this.coverage.trends.quality > 0 ? '📈' : this.coverage.trends.quality < 0 ? '📉' : '➡️'} ${this.coverage.trends.quality > 0 ? '+' : ''}${this.coverage.trends.quality.toFixed(1)}%
- **Direction:** ${this.coverage.trends.direction === 'up' ? '⬆️ Improving' : this.coverage.trends.direction === 'down' ? '⬇️ Declining' : '➡️ Stable'}
`
    : ''
}

## Detailed File Analysis

| File | Layer | Coverage | Documented | Total | Issues |
|------|-------|----------|------------|-------|--------|
${this.coverage.files
  .map(
    (file) =>
      `| ${file.path} | ${file.layer.toUpperCase()} | ${file.percentage.toFixed(1)}% | ${file.documented} | ${file.total} | ${file.issues.length} |`,
  )
  .join('\n')}

## Recommendations

${this.generateRecommendations()}

---
*Generated by Claude-Zen Documentation Coverage Reporter v2.0.0*
`;
  }

  /**
   * Generate improvement recommendations based on coverage analysis
   *
   * @returns {string} Markdown formatted recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    // Overall recommendations
    if (this.coverage.overall.percentage < 80) {
      recommendations.push(
        '📈 **Increase Overall Coverage**: Current coverage is below 80%. Focus on adding documentation to undocumented constructs.',
      );
    }

    if (this.coverage.overall.quality < 70) {
      recommendations.push(
        '🎯 **Improve Documentation Quality**: Add more examples, detailed parameter descriptions, and return value documentation.',
      );
    }

    // Layer-specific recommendations
    for (const [layerKey, layerData] of Object.entries(this.coverage.layers)) {
      const threshold = this.thresholds[layerKey];

      if (layerData.percentage < threshold.minimum) {
        recommendations.push(
          `🔧 **${layerData.name}**: Coverage (${layerData.percentage.toFixed(1)}%) is below minimum threshold (${threshold.minimum}%). Priority focus area.`,
        );
      }

      if (layerData.quality < 60) {
        recommendations.push(
          `📝 **${layerData.name}**: Quality score is low. Add more comprehensive JSDoc comments with examples and detailed descriptions.`,
        );
      }

      if (layerData.issues.length > 0) {
        recommendations.push(
          `⚠️ **${layerData.name}**: ${layerData.issues.length} issues need attention. Review layer-specific documentation requirements.`,
        );
      }
    }

    // Trending recommendations
    if (this.coverage.trends?.direction === 'down') {
      recommendations.push(
        '📉 **Declining Trend**: Coverage has decreased recently. Review recent changes and ensure new code is properly documented.',
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        '✅ **Excellent Documentation**: All metrics are within acceptable ranges. Maintain current documentation standards.',
      );
    }

    return recommendations.join('\n\n');
  }
}

/**
 * Command-line interface for documentation coverage reporter
 *
 * @example CLI Usage
 * ```bash
 * # Generate complete coverage report
 * node scripts/docs-coverage.js
 *
 * # Custom output directory
 * node scripts/docs-coverage.js --output ./custom/coverage
 *
 * # Disable badge generation
 * node scripts/docs-coverage.js --no-badges
 *
 * # Set custom thresholds
 * node scripts/docs-coverage.js --threshold dal:90 --threshold uacl:85
 * ```
 */
async function main() {
  const args = process.argv.slice(2);
  const config = {
    rootDir: './src',
    outputDir: './docs/coverage',
    generateBadges: !args.includes('--no-badges'),
    trackHistory: !args.includes('--no-history'),
  };

  // Parse command line arguments
  const outputIndex = args.indexOf('--output');
  if (outputIndex !== -1 && args[outputIndex + 1]) {
    config.outputDir = args[outputIndex + 1];
  }

  const rootIndex = args.indexOf('--root');
  if (rootIndex !== -1 && args[rootIndex + 1]) {
    config.rootDir = args[rootIndex + 1];
  }

  try {
    const reporter = new DocsCoverageReporter(config);
    const results = await reporter.generateReport();

    if (results.badges?.coverage) {
    }

    // Exit with error if coverage is critically low
    const exitCode = results.overall.percentage < 50 ? 1 : 0;
    process.exit(exitCode);
  } catch (error) {
    // console.error('💥 Coverage report generation failed:', error.message);
    process.exit(1);
  }
}

// Run CLI if this script is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { DocsCoverageReporter };
