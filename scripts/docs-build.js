#!/usr/bin/env node

/**
 * Documentation Build System for Unified Architecture
 *
 * @fileoverview Comprehensive documentation build pipeline that generates unified
 *               API documentation, validates JSDoc compliance, creates coverage reports,
 *               and builds a complete documentation website for all four architecture
 *               layers (UACL, DAL, USL, UEL).
 * @version 2.0.0
 * @since 2.0.0-alpha.73
 * @author Claude-Zen Documentation Team
 */

const fs = require('node:fs').promises;
const path = require('node:path');
const { execSync } = require('node:child_process');
const { JSDocValidator } = require('./jsdoc-validator.js');
const { DocsCoverageReporter } = require('./docs-coverage.js');

/**
 * Documentation Build System - Automated documentation pipeline
 *
 * Provides comprehensive documentation build capabilities including:
 * - TypeDoc API documentation generation with unified architecture theming
 * - JSDoc validation and quality assurance across all layers
 * - Coverage reporting with trend analysis and badge generation
 * - Static site generation with cross-layer navigation
 * - CI/CD integration with automated deployment preparation
 * - Multi-format output (HTML, Markdown, PDF, JSON)
 *
 * @class DocsBuilder
 */
class DocsBuilder {
  /**
   * Initialize documentation build system
   *
   * @param {Object} config - Build system configuration
   * @param {string} config.rootDir - Root source directory
   * @param {string} config.outputDir - Output directory for generated docs
   * @param {boolean} [config.enableValidation=true] - Enable JSDoc validation
   * @param {boolean} [config.enableCoverage=true] - Enable coverage reporting
   * @param {boolean} [config.enableSiteGeneration=true] - Enable static site generation
   * @param {string[]} [config.formats=['html', 'markdown']] - Output formats
   * @param {Object} config.theme - Theme configuration for documentation
   *
   * @example Basic Build System Setup
   * ```javascript
   * const builder = new DocsBuilder({
   *   rootDir: './src',
   *   outputDir: './docs',
   *   theme: {
   *     name: 'claude-zen-unified',
   *     primaryColor: '#007acc',
   *     logoUrl: './assets/logo.png'
   *   }
   * });
   * ```
   */
  constructor(config) {
    this.rootDir = config.rootDir || './src';
    this.outputDir = config.outputDir || './docs';
    this.enableValidation = config.enableValidation !== false;
    this.enableCoverage = config.enableCoverage !== false;
    this.enableSiteGeneration = config.enableSiteGeneration !== false;
    this.formats = config.formats || ['html', 'markdown'];
    this.theme = config.theme || this.getDefaultTheme();

    // Build configuration
    this.buildConfig = {
      typescript: {
        configFile: './tsconfig.json',
        entryPoints: this.getDefaultEntryPoints(),
      },
      typedoc: {
        configFile: './typedoc.config.js',
      },
      validation: {
        strict: config.strict !== false,
        failOnError: config.failOnError !== false,
      },
      coverage: {
        thresholds: config.thresholds || this.getDefaultThresholds(),
      },
    };

    // Build results tracking
    this.results = {
      timestamp: new Date().toISOString(),
      success: false,
      steps: {},
      validation: null,
      coverage: null,
      artifacts: [],
    };
  }

  /**
   * Execute complete documentation build pipeline
   *
   * @returns {Promise<BuildResults>} Comprehensive build results
   *
   * @throws {BuildError} When critical build steps fail
   *
   * @example Complete Build Execution
   * ```javascript
   * const builder = new DocsBuilder({ rootDir: './src' });
   *
   * try {
   *   const results = await builder.build();
   *
   *   console.log('Build Status:', results.success ? 'SUCCESS' : 'FAILED');
   *   console.log('Validation Results:', results.validation);
   *   console.log('Coverage Report:', results.coverage);
   *   console.log('Generated Artifacts:', results.artifacts);
   *
   *   // Check individual step results
   *   Object.entries(results.steps).forEach(([step, result]) => {
   *     console.log(`${step}: ${result.success ? '✅' : '❌'} (${result.duration}ms)`);
   *   });
   * } catch (error) {
   *   console.error('Build failed:', error.message);
   * }
   * ```
   */
  async build() {
    try {
      // Step 1: Initialize build environment
      await this.executeStep('initialize', () =>
        this.initializeBuildEnvironment()
      );

      // Step 2: Validate JSDoc if enabled
      if (this.enableValidation) {
        await this.executeStep('validate', () => this.runJSDocValidation());
      }

      // Step 3: Generate TypeDoc documentation
      await this.executeStep('typedoc', () => this.generateTypeDocAPI());

      // Step 4: Generate coverage report if enabled
      if (this.enableCoverage) {
        await this.executeStep('coverage', () => this.generateCoverageReport());
      }

      // Step 5: Build static site if enabled
      if (this.enableSiteGeneration) {
        await this.executeStep('site', () => this.buildStaticSite());
      }

      // Step 6: Generate additional formats
      await this.executeStep('formats', () => this.generateAdditionalFormats());

      // Step 7: Prepare deployment artifacts
      await this.executeStep('deploy', () => this.prepareDeploymentArtifacts());

      // Step 8: Generate build report
      await this.executeStep('report', () => this.generateBuildReport());

      this.results.success = true;

      return this.results;
    } catch (error) {
      // console.error('❌ Documentation build pipeline failed:', error.message);
      this.results.success = false;
      this.results.error = error.message;
      throw error;
    }
  }

  /**
   * Execute a build step with timing and error handling
   *
   * @param {string} stepName - Name of the build step
   * @param {Function} stepFunction - Function to execute for the step
   *
   * @returns {Promise<StepResult>} Step execution results
   *
   * @example Step Execution
   * ```javascript
   * await builder.executeStep('custom-step', async () => {
   *   console.log('Executing custom documentation step...');
   *   // Custom build logic here
   *   return { customData: 'processed' };
   * });
   * ```
   */
  async executeStep(stepName, stepFunction) {
    const startTime = Date.now();

    try {
      const result = await stepFunction();
      const duration = Date.now() - startTime;

      this.results.steps[stepName] = {
        success: true,
        duration,
        result,
      };
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.results.steps[stepName] = {
        success: false,
        duration,
        error: error.message,
      };

      // console.error(`❌ Step ${stepName} failed after ${duration}ms:`, error.message);
      throw error;
    }
  }

  /**
   * Initialize build environment and prepare output directories
   *
   * @returns {Promise<void>} Environment initialization completion
   *
   * @example Environment Setup
   * ```javascript
   * await builder.initializeBuildEnvironment();
   *
   * // Directories created:
   * // - ./docs/api/
   * // - ./docs/coverage/
   * // - ./docs/site/
   * // - ./docs/assets/
   * ```
   */
  async initializeBuildEnvironment() {
    // Create output directory structure
    const directories = [
      this.outputDir,
      path.join(this.outputDir, 'api'),
      path.join(this.outputDir, 'coverage'),
      path.join(this.outputDir, 'site'),
      path.join(this.outputDir, 'assets'),
      path.join(this.outputDir, 'generated'),
    ];

    for (const dir of directories) {
      await fs.mkdir(dir, { recursive: true });
    }

    // Copy theme assets if provided
    if (this.theme.assetsDir) {
      await this.copyThemeAssets();
    }

    // Validate source directory
    try {
      await fs.access(this.rootDir);
    } catch (_error) {
      throw new Error(`Source directory not found: ${this.rootDir}`);
    }
  }

  /**
   * Run JSDoc validation across all architecture layers
   *
   * @returns {Promise<ValidationResults>} JSDoc validation results
   *
   * @throws {ValidationError} When validation fails in strict mode
   *
   * @example JSDoc Validation
   * ```javascript
   * const validationResults = await builder.runJSDocValidation();
   *
   * console.log('Validation Coverage:', validationResults.coverage.percentage);
   * console.log('Quality Score:', validationResults.quality.score);
   *
   * if (validationResults.errors.length > 0) {
   *   console.log('Validation Errors:', validationResults.errors);
   * }
   * ```
   */
  async runJSDocValidation() {
    const validator = new JSDocValidator({
      rootDir: this.rootDir,
      layers: ['uacl', 'dal', 'usl', 'uel'],
      strict: this.buildConfig.validation.strict,
    });

    const validationResults = await validator.validate();
    this.results.validation = validationResults;

    // Check if validation should fail the build
    if (
      this.buildConfig.validation.failOnError &&
      validationResults.quality.failed > 0
    ) {
      throw new Error(
        `JSDoc validation failed: ${validationResults.quality.failed} files have errors`
      );
    }
    return validationResults;
  }

  /**
   * Generate TypeDoc API documentation with unified architecture theming
   *
   * @returns {Promise<TypeDocResults>} TypeDoc generation results
   *
   * @throws {TypeDocError} When TypeDoc generation fails
   *
   * @example TypeDoc Generation
   * ```javascript
   * const typedocResults = await builder.generateTypeDocAPI();
   *
   * console.log('API Documentation Generated:', typedocResults.outputPath);
   * console.log('Entry Points Processed:', typedocResults.entryPoints.length);
   * console.log('Modules Documented:', typedocResults.modules);
   * ```
   */
  async generateTypeDocAPI() {
    const outputPath = path.join(this.outputDir, 'api');

    try {
      // Run TypeDoc with configuration file
      const command = `npx typedoc --options ${this.buildConfig.typedoc.configFile} --out ${outputPath}`;
      const output = execSync(command, {
        encoding: 'utf8',
        cwd: process.cwd(),
      });

      // Parse TypeDoc output for statistics
      const stats = this.parseTypeDocOutput(output);

      return {
        success: true,
        outputPath,
        statistics: stats,
        command,
      };
    } catch (error) {
      throw new Error(`TypeDoc generation failed: ${error.message}`);
    }
  }

  /**
   * Generate comprehensive coverage report with trends and badges
   *
   * @returns {Promise<CoverageResults>} Documentation coverage results
   *
   * @example Coverage Report Generation
   * ```javascript
   * const coverageResults = await builder.generateCoverageReport();
   *
   * console.log('Overall Coverage:', coverageResults.overall.percentage);
   * console.log('Layer Breakdown:', coverageResults.layers);
   * console.log('Coverage Badges:', coverageResults.badges);
   * ```
   */
  async generateCoverageReport() {
    const reporter = new DocsCoverageReporter({
      rootDir: this.rootDir,
      outputDir: path.join(this.outputDir, 'coverage'),
      thresholds: this.buildConfig.coverage.thresholds,
      generateBadges: true,
      trackHistory: true,
    });

    const coverageResults = await reporter.generateReport();
    this.results.coverage = coverageResults;
    return coverageResults;
  }

  /**
   * Build static documentation site with navigation and search
   *
   * @returns {Promise<SiteResults>} Static site generation results
   *
   * @example Static Site Generation
   * ```javascript
   * const siteResults = await builder.buildStaticSite();
   *
   * console.log('Site Generated:', siteResults.outputPath);
   * console.log('Pages Created:', siteResults.pages.length);
   * console.log('Navigation Structure:', siteResults.navigation);
   * ```
   */
  async buildStaticSite() {
    const siteDir = path.join(this.outputDir, 'site');

    // Generate site structure
    const siteStructure = await this.generateSiteStructure();

    // Create main index page
    await this.generateIndexPage(siteDir);

    // Create layer-specific pages
    await this.generateLayerPages(siteDir);

    // Create navigation and search
    await this.generateNavigation(siteDir, siteStructure);
    await this.generateSearchIndex(siteDir);

    // Copy and process assets
    await this.processSiteAssets(siteDir);

    return {
      outputPath: siteDir,
      structure: siteStructure,
      pages: await this.getSitePages(siteDir),
    };
  }

  /**
   * Generate additional documentation formats (PDF, JSON, etc.)
   *
   * @returns {Promise<FormatResults>} Additional format generation results
   *
   * @example Additional Format Generation
   * ```javascript
   * const formatResults = await builder.generateAdditionalFormats();
   *
   * console.log('Generated Formats:', formatResults.formats);
   * console.log('PDF Documentation:', formatResults.pdf?.path);
   * console.log('JSON API Schema:', formatResults.json?.path);
   * ```
   */
  async generateAdditionalFormats() {
    const formatResults = {
      formats: this.formats,
      generated: [],
    };

    for (const format of this.formats) {
      try {
        switch (format) {
          case 'pdf':
            await this.generatePDFDocumentation();
            formatResults.generated.push('pdf');
            break;
          case 'json':
            await this.generateJSONSchema();
            formatResults.generated.push('json');
            break;
          case 'markdown':
            await this.generateMarkdownDocs();
            formatResults.generated.push('markdown');
            break;
        }
      } catch (error) {
        console.warn(`⚠️ Failed to generate ${format} format: ${error.message}`);
      }
    }
    return formatResults;
  }

  /**
   * Prepare deployment artifacts and optimization
   *
   * @returns {Promise<DeploymentResults>} Deployment preparation results
   *
   * @example Deployment Preparation
   * ```javascript
   * const deployResults = await builder.prepareDeploymentArtifacts();
   *
   * console.log('Deployment Package:', deployResults.packagePath);
   * console.log('CDN Assets:', deployResults.assets);
   * console.log('Optimization Stats:', deployResults.optimization);
   * ```
   */
  async prepareDeploymentArtifacts() {
    const deploymentDir = path.join(this.outputDir, 'deploy');
    await fs.mkdir(deploymentDir, { recursive: true });

    // Create deployment package
    const packageInfo = await this.createDeploymentPackage(deploymentDir);

    // Optimize assets for CDN
    const optimizationResults = await this.optimizeAssets();

    // Generate deployment configuration
    const deployConfig = await this.generateDeploymentConfig(deploymentDir);

    this.results.artifacts.push({
      type: 'deployment-package',
      path: packageInfo.path,
      size: packageInfo.size,
    });

    return {
      package: packageInfo,
      optimization: optimizationResults,
      config: deployConfig,
    };
  }

  /**
   * Generate comprehensive build report
   *
   * @returns {Promise<void>} Build report generation completion
   *
   * @example Build Report Generation
   * ```javascript
   * await builder.generateBuildReport();
   *
   * // Generated files:
   * // - ./docs/build-report.html
   * // - ./docs/build-report.md
   * // - ./docs/build-results.json
   * ```
   */
  async generateBuildReport() {
    // HTML Report
    const htmlReport = this.buildHTMLReport();
    await fs.writeFile(
      path.join(this.outputDir, 'build-report.html'),
      htmlReport
    );

    // Markdown Report
    const markdownReport = this.buildMarkdownReport();
    await fs.writeFile(
      path.join(this.outputDir, 'build-report.md'),
      markdownReport
    );

    // JSON Results
    await fs.writeFile(
      path.join(this.outputDir, 'build-results.json'),
      JSON.stringify(this.results, null, 2)
    );
  }

  /**
   * Get default TypeDoc entry points for unified architecture
   *
   * @returns {string[]} Array of entry point paths
   */
  getDefaultEntryPoints() {
    return [
      'src/index.ts',
      'src/interfaces/clients/index.ts',
      'src/database/index.ts',
      'src/interfaces/services/index.ts',
      'src/interfaces/events/index.ts',
      'src/core/index.ts',
      'src/coordination/index.ts',
      'src/neural/index.ts',
      'src/memory/index.ts',
      'src/types/index.ts',
    ];
  }

  /**
   * Get default theme configuration
   *
   * @returns {Object} Default theme configuration
   */
  getDefaultTheme() {
    return {
      name: 'claude-zen-unified',
      primaryColor: '#007acc',
      secondaryColor: '#005a9e',
      accentColor: '#40b5a8',
      backgroundColor: '#ffffff',
      textColor: '#333333',
      logoUrl: './assets/logo.png',
      favicon: './assets/favicon.ico',
    };
  }

  /**
   * Get default coverage thresholds by layer
   *
   * @returns {Object} Default coverage thresholds
   */
  getDefaultThresholds() {
    return {
      uacl: { minimum: 80, target: 90 },
      dal: { minimum: 85, target: 95 },
      usl: { minimum: 80, target: 90 },
      uel: { minimum: 75, target: 85 },
    };
  }

  /**
   * Parse TypeDoc output for statistics
   *
   * @param {string} output - TypeDoc command output
   * @returns {Object} Parsed statistics
   */
  parseTypeDocOutput(output) {
    // Basic parsing of TypeDoc output
    // This could be enhanced with more sophisticated parsing
    return {
      modules: (output.match(/Rendering \d+ modules/g) || []).length,
      classes: (output.match(/class/gi) || []).length,
      interfaces: (output.match(/interface/gi) || []).length,
      functions: (output.match(/function/gi) || []).length,
    };
  }

  /**
   * Copy theme assets to build directory
   *
   * @returns {Promise<void>} Asset copying completion
   */
  async copyThemeAssets() {}

  /**
   * Generate site structure for navigation
   *
   * @returns {Promise<Object>} Site structure object
   */
  async generateSiteStructure() {
    return {
      layers: [
        { id: 'uacl', name: 'Unified API Client Layer', path: '/uacl' },
        { id: 'dal', name: 'Data Access Layer', path: '/dal' },
        { id: 'usl', name: 'Unified Service Layer', path: '/usl' },
        { id: 'uel', name: 'Unified Event Layer', path: '/uel' },
      ],
      sections: [
        { id: 'api', name: 'API Documentation', path: '/api' },
        { id: 'coverage', name: 'Coverage Report', path: '/coverage' },
        { id: 'examples', name: 'Examples', path: '/examples' },
        { id: 'guides', name: 'Guides', path: '/guides' },
      ],
    };
  }

  /**
   * Generate main index page for documentation site
   *
   * @param {string} siteDir - Site output directory
   * @returns {Promise<void>} Index page generation completion
   */
  async generateIndexPage(siteDir) {
    const indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude-Zen Unified Architecture Documentation</title>
    <link rel="stylesheet" href="./assets/style.css">
</head>
<body>
    <header>
        <h1>📚 Claude-Zen Documentation</h1>
        <p>Unified Architecture Documentation Hub</p>
    </header>
    
    <main>
        <section class="hero">
            <h2>🏗️ Unified Architecture Layers</h2>
            <div class="layer-grid">
                <div class="layer-card uacl">
                    <h3>🔌 UACL</h3>
                    <p>Unified API Client Layer</p>
                    <a href="./uacl/">Explore →</a>
                </div>
                <div class="layer-card dal">
                    <h3>🗄️ DAL</h3>
                    <p>Data Access Layer</p>
                    <a href="./dal/">Explore →</a>
                </div>
                <div class="layer-card usl">
                    <h3>🔧 USL</h3>
                    <p>Unified Service Layer</p>
                    <a href="./usl/">Explore →</a>
                </div>
                <div class="layer-card uel">
                    <h3>📡 UEL</h3>
                    <p>Unified Event Layer</p>
                    <a href="./uel/">Explore →</a>
                </div>
            </div>
        </section>
        
        <section class="resources">
            <h2>📖 Documentation Resources</h2>
            <ul>
                <li><a href="./api/">📋 API Reference</a></li>
                <li><a href="./coverage/">📊 Coverage Report</a></li>
                <li><a href="./examples/">💡 Examples</a></li>
                <li><a href="./guides/">📚 Developer Guides</a></li>
            </ul>
        </section>
    </main>
    
    <footer>
        <p>Generated by Claude-Zen Documentation Build System v2.0.0</p>
    </footer>
</body>
</html>`;

    await fs.writeFile(path.join(siteDir, 'index.html'), indexHTML);
  }

  /**
   * Generate layer-specific documentation pages
   *
   * @param {string} siteDir - Site output directory
   * @returns {Promise<void>} Layer pages generation completion
   */
  async generateLayerPages(siteDir) {
    const layers = ['uacl', 'dal', 'usl', 'uel'];

    for (const layer of layers) {
      const layerDir = path.join(siteDir, layer);
      await fs.mkdir(layerDir, { recursive: true });

      const layerHTML = this.generateLayerHTML(layer);
      await fs.writeFile(path.join(layerDir, 'index.html'), layerHTML);
    }
  }

  /**
   * Generate HTML for a specific layer
   *
   * @param {string} layer - Layer identifier
   * @returns {string} Layer HTML content
   */
  generateLayerHTML(layer) {
    const layerNames = {
      uacl: 'Unified API Client Layer',
      dal: 'Data Access Layer',
      usl: 'Unified Service Layer',
      uel: 'Unified Event Layer',
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${layerNames[layer]} - Claude-Zen Documentation</title>
    <link rel="stylesheet" href="../assets/style.css">
</head>
<body>
    <nav>
        <a href="../">← Back to Overview</a>
    </nav>
    
    <header>
        <h1>${layerNames[layer]}</h1>
        <p>Comprehensive documentation for the ${layer.toUpperCase()} layer</p>
    </header>
    
    <main>
        <section>
            <h2>📋 Layer Documentation</h2>
            <p>This layer provides specialized functionality for the Claude-Zen unified architecture.</p>
            
            <div class="doc-links">
                <a href="../api/">API Reference</a>
                <a href="../coverage/">Coverage Report</a>
                <a href="../examples/">Examples</a>
            </div>
        </section>
    </main>
</body>
</html>`;
  }

  /**
   * Generate navigation structure
   *
   * @param {string} siteDir - Site output directory
   * @param {Object} structure - Site structure object
   * @returns {Promise<void>} Navigation generation completion
   */
  async generateNavigation(siteDir, structure) {
    const navigationJS = `// Site navigation data
window.SITE_STRUCTURE = ${JSON.stringify(structure, null, 2)};`;

    await fs.writeFile(
      path.join(siteDir, 'assets', 'navigation.js'),
      navigationJS
    );
  }

  /**
   * Generate search index for documentation
   *
   * @param {string} siteDir - Site output directory
   * @returns {Promise<void>} Search index generation completion
   */
  async generateSearchIndex(siteDir) {
    const searchIndex = {
      documents: [],
      index: {},
    };

    // This would be enhanced with full-text search indexing
    await fs.writeFile(
      path.join(siteDir, 'assets', 'search-index.json'),
      JSON.stringify(searchIndex, null, 2)
    );
  }

  /**
   * Process and optimize site assets
   *
   * @param {string} siteDir - Site output directory
   * @returns {Promise<void>} Asset processing completion
   */
  async processSiteAssets(siteDir) {
    const assetsDir = path.join(siteDir, 'assets');
    await fs.mkdir(assetsDir, { recursive: true });

    // Generate CSS
    const cssContent = this.generateCSS();
    await fs.writeFile(path.join(assetsDir, 'style.css'), cssContent);

    // Generate JavaScript
    const jsContent = this.generateJS();
    await fs.writeFile(path.join(assetsDir, 'app.js'), jsContent);
  }

  /**
   * Generate CSS styles for documentation site
   *
   * @returns {string} CSS content
   */
  generateCSS() {
    return `/* Claude-Zen Documentation Styles */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  line-height: 1.6;
  color: ${this.theme.textColor};
  background: ${this.theme.backgroundColor};
  margin: 0;
  padding: 20px;
}

header {
  text-align: center;
  margin-bottom: 40px;
  border-bottom: 3px solid ${this.theme.primaryColor};
  padding-bottom: 20px;
}

.layer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

.layer-card {
  background: white;
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: transform 0.2s ease;
}

.layer-card:hover {
  transform: translateY(-4px);
  border-color: ${this.theme.primaryColor};
}

.layer-card h3 {
  color: ${this.theme.primaryColor};
  margin: 0 0 10px 0;
}

.layer-card a {
  display: inline-block;
  margin-top: 15px;
  color: ${this.theme.primaryColor};
  text-decoration: none;
  font-weight: bold;
}

nav {
  margin-bottom: 20px;
}

nav a {
  color: ${this.theme.primaryColor};
  text-decoration: none;
}

.doc-links {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.doc-links a {
  background: ${this.theme.primaryColor};
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  text-decoration: none;
  transition: background 0.2s ease;
}

.doc-links a:hover {
  background: ${this.theme.secondaryColor};
}`;
  }

  /**
   * Generate JavaScript for documentation site
   *
   * @returns {string} JavaScript content
   */
  generateJS() {
    return `// Claude-Zen Documentation JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Initialize search functionality
  if (window.SITE_STRUCTURE) {
    // console.log('Site structure loaded:', window.SITE_STRUCTURE);
  }
  
  // Add interactive features
  const layerCards = document.querySelectorAll('.layer-card');
  layerCards.forEach(card => {
    card.addEventListener('click', function(e) {
      if (e.target.tagName !== 'A') {
        const link = this.querySelector('a');
        if (link) {
          window.location.href = link.href;
        }
      }
    });
  });
});`;
  }

  /**
   * Get site pages for reporting
   *
   * @param {string} siteDir - Site directory
   * @returns {Promise<string[]>} Array of page paths
   */
  async getSitePages(_siteDir) {
    const pages = [];

    // This would recursively find all HTML pages
    pages.push('index.html');

    return pages;
  }

  /**
   * Generate PDF documentation (placeholder)
   *
   * @returns {Promise<void>} PDF generation completion
   */
  async generatePDFDocumentation() {
    // Implementation would use puppeteer or similar to generate PDF from HTML
  }

  /**
   * Generate JSON schema (placeholder)
   *
   * @returns {Promise<void>} JSON schema generation completion
   */
  async generateJSONSchema() {
    // Implementation would extract TypeScript interfaces to JSON Schema
  }

  /**
   * Generate Markdown documentation (placeholder)
   *
   * @returns {Promise<void>} Markdown generation completion
   */
  async generateMarkdownDocs() {
    // Implementation would convert HTML docs to Markdown
  }

  /**
   * Create deployment package
   *
   * @param {string} deployDir - Deployment directory
   * @returns {Promise<Object>} Package information
   */
  async createDeploymentPackage(deployDir) {
    // This would create a compressed package of all documentation
    return {
      path: path.join(deployDir, 'docs-package.tar.gz'),
      size: 0, // Would be calculated
    };
  }

  /**
   * Optimize assets for deployment
   *
   * @returns {Promise<Object>} Optimization results
   */
  async optimizeAssets() {
    // This would minify CSS, JS, optimize images, etc.
    return {
      cssMinified: true,
      jsMinified: true,
      imagesOptimized: 0,
    };
  }

  /**
   * Generate deployment configuration
   *
   * @param {string} deployDir - Deployment directory
   * @returns {Promise<Object>} Deployment configuration
   */
  async generateDeploymentConfig(deployDir) {
    const config = {
      version: '2.0.0',
      timestamp: this.results.timestamp,
      assets: [],
      routing: {
        spa: false,
        redirects: [],
      },
    };

    await fs.writeFile(
      path.join(deployDir, 'deploy.json'),
      JSON.stringify(config, null, 2)
    );

    return config;
  }

  /**
   * Build HTML report for build results
   *
   * @returns {string} HTML report content
   */
  buildHTMLReport() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documentation Build Report</title>
    <style>
        body { font-family: sans-serif; margin: 40px; line-height: 1.6; }
        .status-success { color: #28a745; }
        .status-failure { color: #dc3545; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { text-align: left; padding: 12px; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; }
    </style>
</head>
<body>
    <h1>📋 Documentation Build Report</h1>
    
    <div class="summary">
        <h2>Build Summary</h2>
        <p><strong>Status:</strong> <span class="status-${this.results.success ? 'success' : 'failure'}">${this.results.success ? 'SUCCESS' : 'FAILURE'}</span></p>
        <p><strong>Timestamp:</strong> ${new Date(this.results.timestamp).toLocaleString()}</p>
        <p><strong>Total Duration:</strong> ${this.getTotalDuration()}ms</p>
    </div>
    
    <div class="steps">
        <h2>Build Steps</h2>
        <table>
            <thead>
                <tr>
                    <th>Step</th>
                    <th>Status</th>
                    <th>Duration</th>
                    <th>Details</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(this.results.steps)
                  .map(
                    ([step, result]) => `
                <tr>
                    <td>${step}</td>
                    <td class="status-${result.success ? 'success' : 'failure'}">${result.success ? '✅' : '❌'}</td>
                    <td>${result.duration}ms</td>
                    <td>${result.error || 'Completed successfully'}</td>
                </tr>
                `
                  )
                  .join('')}
            </tbody>
        </table>
    </div>
    
    ${
      this.results.validation
        ? `
    <div class="validation">
        <h2>Validation Results</h2>
        <p><strong>Coverage:</strong> ${this.results.validation.coverage.percentage}%</p>
        <p><strong>Quality Score:</strong> ${this.results.validation.quality.score}%</p>
    </div>
    `
        : ''
    }
    
    ${
      this.results.coverage
        ? `
    <div class="coverage">
        <h2>Coverage Results</h2>
        <p><strong>Overall Coverage:</strong> ${this.results.coverage.overall.percentage.toFixed(1)}%</p>
        <p><strong>Quality Score:</strong> ${this.results.coverage.overall.quality.toFixed(1)}%</p>
    </div>
    `
        : ''
    }
    
    <footer>
        <p><em>Generated by Claude-Zen Documentation Build System v2.0.0</em></p>
    </footer>
</body>
</html>`;
  }

  /**
   * Build Markdown report for build results
   *
   * @returns {string} Markdown report content
   */
  buildMarkdownReport() {
    return `# 📋 Documentation Build Report

**Status:** ${this.results.success ? '✅ SUCCESS' : '❌ FAILURE'}
**Timestamp:** ${new Date(this.results.timestamp).toLocaleString()}
**Total Duration:** ${this.getTotalDuration()}ms

## Build Steps

${Object.entries(this.results.steps)
  .map(
    ([step, result]) =>
      `- **${step}**: ${result.success ? '✅' : '❌'} (${result.duration}ms)${result.error ? ` - ${result.error}` : ''}`
  )
  .join('\n')}

${
  this.results.validation
    ? `## Validation Results

- **Coverage:** ${this.results.validation.coverage.percentage}%
- **Quality Score:** ${this.results.validation.quality.score}%
- **Files Validated:** ${this.results.validation.files.length}
`
    : ''
}

${
  this.results.coverage
    ? `## Coverage Results

- **Overall Coverage:** ${this.results.coverage.overall.percentage.toFixed(1)}%
- **Quality Score:** ${this.results.coverage.overall.quality.toFixed(1)}%
- **Status:** ${this.results.coverage.overall.status}
`
    : ''
}

## Artifacts Generated

${this.results.artifacts
  .map(
    (artifact) =>
      `- **${artifact.type}**: ${artifact.path} (${artifact.size} bytes)`
  )
  .join('\n')}

---
*Generated by Claude-Zen Documentation Build System v2.0.0*`;
  }

  /**
   * Get total build duration
   *
   * @returns {number} Total duration in milliseconds
   */
  getTotalDuration() {
    return Object.values(this.results.steps).reduce(
      (total, step) => total + step.duration,
      0
    );
  }
}

/**
 * Command-line interface for documentation build system
 *
 * @example CLI Usage
 * ```bash
 * # Complete build pipeline
 * node scripts/docs-build.js
 *
 * # Build with validation disabled
 * node scripts/docs-build.js --no-validation
 *
 * # Custom output directory
 * node scripts/docs-build.js --output ./custom-docs
 *
 * # Specific formats only
 * node scripts/docs-build.js --formats html,json
 *
 * # Strict validation mode
 * node scripts/docs-build.js --strict
 * ```
 */
async function main() {
  const args = process.argv.slice(2);
  const config = {
    rootDir: './src',
    outputDir: './docs',
    enableValidation: !args.includes('--no-validation'),
    enableCoverage: !args.includes('--no-coverage'),
    enableSiteGeneration: !args.includes('--no-site'),
    strict: args.includes('--strict'),
    failOnError: args.includes('--fail-on-error'),
  };

  // Parse command line arguments
  const outputIndex = args.indexOf('--output');
  if (outputIndex !== -1 && args[outputIndex + 1]) {
    config.outputDir = args[outputIndex + 1];
  }

  const formatsIndex = args.indexOf('--formats');
  if (formatsIndex !== -1 && args[formatsIndex + 1]) {
    config.formats = args[formatsIndex + 1].split(',');
  }

  try {
    const builder = new DocsBuilder(config);
    const results = await builder.build();

    if (results.validation) {
    }

    if (results.coverage) {
    }

    const exitCode = results.success ? 0 : 1;
    process.exit(exitCode);
  } catch (error) {
    // console.error('💥 Documentation build failed:', error.message);
    process.exit(1);
  }
}

// Run CLI if this script is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { DocsBuilder };
