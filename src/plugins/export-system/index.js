/**
 * Export System Plugin
 * Generate reports and exports in multiple formats (PDF, HTML, JSON, CSV)
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

export class ExportSystemPlugin {
  constructor(config = {}) {
    this.config = {
      outputDir: path.join(process.cwd(), 'exports'),
      templatesDir: path.join(process.cwd(), '.hive-mind', 'templates'),
      formats: ['pdf', 'html', 'json', 'csv', 'markdown'],
      defaultFormat: 'pdf',
      timestamp: true,
      compress: false,
      ...config
    };
    
    this.exporters = new Map();
    this.templates = new Map();
  }

  async initialize() {
    console.log('📊 Export System Plugin initialized');
    
    // Create output directory
    await mkdir(this.config.outputDir, { recursive: true });
    await mkdir(this.config.templatesDir, { recursive: true });
    
    // Initialize exporters
    await this.initializeExporters();
    
    // Load templates
    await this.loadTemplates();
  }

  async initializeExporters() {
    // PDF Exporter
    this.exporters.set('pdf', {
      type: 'pdf',
      async export(data, template, options = {}) {
        try {
          const puppeteer = await import('puppeteer');
          
          const browser = await puppeteer.default.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
          });
          
          const page = await browser.newPage();
          
          // Generate HTML content
          const htmlContent = await this.renderTemplate(template, data, 'html');
          await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
          
          // Generate PDF
          const pdfBuffer = await page.pdf({
            format: options.format || 'A4',
            printBackground: true,
            margin: options.margin || {
              top: '20mm',
              right: '15mm', 
              bottom: '20mm',
              left: '15mm'
            }
          });
          
          await browser.close();
          return pdfBuffer;
        } catch (error) {
          console.warn('PDF export requires puppeteer. Falling back to HTML.');
          return this.renderTemplate(template, data, 'html');
        }
      }
    });

    // HTML Exporter
    this.exporters.set('html', {
      type: 'html',
      async export(data, template, options = {}) {
        return this.renderTemplate(template, data, 'html');
      }
    });

    // JSON Exporter  
    this.exporters.set('json', {
      type: 'json',
      async export(data, template, options = {}) {
        const formatted = {
          timestamp: new Date().toISOString(),
          data: data,
          metadata: {
            export_type: 'json',
            template: template.name,
            options: options
          }
        };
        
        return JSON.stringify(formatted, null, options.indent || 2);
      }
    });

    // CSV Exporter
    this.exporters.set('csv', {
      type: 'csv',
      async export(data, template, options = {}) {
        // Convert data to CSV format
        if (Array.isArray(data)) {
          return this.arrayToCSV(data, options);
        } else {
          // Convert object to array of key-value pairs
          const array = Object.entries(data).map(([key, value]) => ({
            key,
            value: typeof value === 'object' ? JSON.stringify(value) : value
          }));
          return this.arrayToCSV(array, options);
        }
      }
    });

    // Markdown Exporter
    this.exporters.set('markdown', {
      type: 'markdown',
      async export(data, template, options = {}) {
        return this.renderTemplate(template, data, 'markdown');
      }
    });

    console.log(`✅ Initialized ${this.exporters.size} export formats`);
  }

  async loadTemplates() {
    // Create default templates if they don't exist
    await this.createDefaultTemplates();
    
    // Load custom templates from templates directory
    try {
      const templateFiles = await this.glob(`${this.config.templatesDir}/*.{html,md,json}`);
      
      for (const file of templateFiles) {
        const name = path.basename(file, path.extname(file));
        const content = await readFile(file, 'utf8');
        const format = path.extname(file).slice(1);
        
        if (!this.templates.has(name)) {
          this.templates.set(name, {});
        }
        
        this.templates.get(name)[format] = content;
      }
      
      console.log(`📄 Loaded ${this.templates.size} templates`);
    } catch (error) {
      console.warn('Failed to load custom templates:', error.message);
    }
  }

  async createDefaultTemplates() {
    const defaultTemplates = {
      'swarm-report': {
        html: `
<!DOCTYPE html>
<html>
<head>
    <title>Swarm Report - {{swarm.name}}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { border-bottom: 2px solid #333; padding-bottom: 20px; }
        .section { margin: 30px 0; }
        .agent { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .metric { display: inline-block; margin: 10px 20px 10px 0; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🐝 Swarm Report: {{swarm.name}}</h1>
        <p><strong>Generated:</strong> {{timestamp}}</p>
        <p><strong>Topology:</strong> {{swarm.topology}} | <strong>Status:</strong> {{swarm.status}}</p>
    </div>
    
    <div class="section">
        <h2>📊 Overview</h2>
        <div class="metric"><strong>Total Agents:</strong> {{agents.total}}</div>
        <div class="metric"><strong>Active Tasks:</strong> {{tasks.active}}</div>
        <div class="metric"><strong>Completed Tasks:</strong> {{tasks.completed}}</div>
        <div class="metric"><strong>Success Rate:</strong> {{performance.successRate}}%</div>
    </div>
    
    <div class="section">
        <h2>🤖 Agents</h2>
        {{#each agents.list}}
        <div class="agent">
            <h3>{{name}} ({{type}})</h3>
            <p><strong>Status:</strong> {{status}} | <strong>Tasks:</strong> {{tasksCompleted}}</p>
            <p><strong>Capabilities:</strong> {{capabilities}}</p>
        </div>
        {{/each}}
    </div>
    
    <div class="section">
        <h2>📈 Performance Metrics</h2>
        <table>
            <tr><th>Metric</th><th>Value</th></tr>
            <tr><td>Total Execution Time</td><td>{{performance.totalTime}}</td></tr>
            <tr><td>Average Task Duration</td><td>{{performance.avgTaskTime}}</td></tr>
            <tr><td>Memory Usage</td><td>{{performance.memoryUsage}}</td></tr>
            <tr><td>Success Rate</td><td>{{performance.successRate}}%</td></tr>
        </table>
    </div>
</body>
</html>`,
        
        markdown: `# 🐝 Swarm Report: {{swarm.name}}

**Generated:** {{timestamp}}  
**Topology:** {{swarm.topology}} | **Status:** {{swarm.status}}

## 📊 Overview

- **Total Agents:** {{agents.total}}
- **Active Tasks:** {{tasks.active}}  
- **Completed Tasks:** {{tasks.completed}}
- **Success Rate:** {{performance.successRate}}%

## 🤖 Agents

{{#each agents.list}}
### {{name}} ({{type}})
- **Status:** {{status}}
- **Tasks Completed:** {{tasksCompleted}}
- **Capabilities:** {{capabilities}}

{{/each}}

## 📈 Performance Metrics

| Metric | Value |
|--------|-------|
| Total Execution Time | {{performance.totalTime}} |
| Average Task Duration | {{performance.avgTaskTime}} |
| Memory Usage | {{performance.memoryUsage}} |
| Success Rate | {{performance.successRate}}% |
`
      },

      'task-summary': {
        html: `
<!DOCTYPE html>
<html>
<head>
    <title>Task Summary</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .task { border: 1px solid #ddd; margin: 20px 0; padding: 20px; border-radius: 5px; }
        .success { border-left: 5px solid #4CAF50; }
        .failed { border-left: 5px solid #f44336; }
        .pending { border-left: 5px solid #ff9800; }
    </style>
</head>
<body>
    <h1>📋 Task Summary</h1>
    <p><strong>Generated:</strong> {{timestamp}}</p>
    
    {{#each tasks}}
    <div class="task {{status}}">
        <h3>{{name}}</h3>
        <p><strong>Status:</strong> {{status}} | <strong>Duration:</strong> {{duration}}</p>
        <p><strong>Description:</strong> {{description}}</p>
        {{#if error}}
        <p><strong>Error:</strong> {{error}}</p>
        {{/if}}
    </div>
    {{/each}}
</body>
</html>`,
        
        markdown: `# 📋 Task Summary

**Generated:** {{timestamp}}

{{#each tasks}}
## {{name}}

- **Status:** {{status}}
- **Duration:** {{duration}}
- **Description:** {{description}}
{{#if error}}
- **Error:** {{error}}
{{/if}}

{{/each}}`
      },

      'system-health': {
        html: `
<!DOCTYPE html>
<html>
<head>
    <title>System Health Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .healthy { color: #4CAF50; }
        .warning { color: #ff9800; }
        .critical { color: #f44336; }
        .service { margin: 15px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>🏥 System Health Report</h1>
    <p><strong>Generated:</strong> {{timestamp}}</p>
    <p><strong>Overall Status:</strong> <span class="{{system.status}}">{{system.status}}</span></p>
    
    <h2>Services</h2>
    {{#each services}}
    <div class="service">
        <h3>{{name}} <span class="{{status}}">{{status}}</span></h3>
        <p><strong>Uptime:</strong> {{uptime}} | <strong>Memory:</strong> {{memory}}</p>
        {{#if issues}}
        <p><strong>Issues:</strong> {{issues}}</p>
        {{/if}}
    </div>
    {{/each}}
</body>
</html>`,
        
        markdown: `# 🏥 System Health Report

**Generated:** {{timestamp}}  
**Overall Status:** {{system.status}}

## Services

{{#each services}}
### {{name}} - {{status}}

- **Uptime:** {{uptime}}
- **Memory:** {{memory}}
{{#if issues}}
- **Issues:** {{issues}}
{{/if}}

{{/each}}`
      }
    };

    // Write default templates to disk
    for (const [name, formats] of Object.entries(defaultTemplates)) {
      for (const [format, content] of Object.entries(formats)) {
        const filename = path.join(this.config.templatesDir, `${name}.${format}`);
        try {
          await writeFile(filename, content.trim());
        } catch (error) {
          // File might already exist, that's OK
        }
      }
      
      this.templates.set(name, formats);
    }
  }

  async export(data, options = {}) {
    const {
      format = this.config.defaultFormat,
      template = 'default',
      filename,
      timestamp = this.config.timestamp
    } = options;

    if (!this.exporters.has(format)) {
      throw new Error(`Export format '${format}' not supported`);
    }

    // Get template
    const templateData = this.templates.get(template) || this.templates.get('default');
    if (!templateData) {
      throw new Error(`Template '${template}' not found`);
    }

    // Add timestamp to data
    const exportData = {
      timestamp: new Date().toISOString(),
      ...data
    };

    // Export using appropriate exporter
    const exporter = this.exporters.get(format);
    const content = await exporter.export(exportData, { name: template, ...templateData }, options);

    // Generate filename
    const outputFilename = filename || this.generateFilename(template, format, timestamp);
    const outputPath = path.join(this.config.outputDir, outputFilename);

    // Write to file
    if (format === 'pdf' && Buffer.isBuffer(content)) {
      await writeFile(outputPath, content);
    } else {
      await writeFile(outputPath, content, 'utf8');
    }

    console.log(`📊 Export generated: ${outputPath}`);
    
    return {
      filename: outputFilename,
      path: outputPath,
      format: format,
      size: content.length || content.byteLength,
      template: template
    };
  }

  generateFilename(template, format, includeTimestamp) {
    const timestamp = includeTimestamp ? 
      `_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)}` : '';
    return `${template}${timestamp}.${format}`;
  }

  renderTemplate(template, data, format) {
    const templateContent = template[format] || template.html || template.markdown || '';
    
    // Simple template rendering (replace {{variable}} with data)
    return templateContent.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const value = this.getNestedValue(data, path.trim());
      return value !== undefined ? String(value) : match;
    });
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  arrayToCSV(array, options = {}) {
    if (!array.length) return '';
    
    const separator = options.separator || ',';
    const headers = Object.keys(array[0]);
    
    const csvContent = [
      headers.join(separator),
      ...array.map(row => 
        headers.map(header => {
          const value = row[header];
          const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
          // Escape quotes and wrap in quotes if contains separator
          return stringValue.includes(separator) || stringValue.includes('"') ?
            `"${stringValue.replace(/"/g, '""')}"` : stringValue;
        }).join(separator)
      )
    ].join('\n');
    
    return csvContent;
  }

  // Convenience methods for common exports
  async exportSwarmReport(swarmData, format = 'pdf') {
    return this.export(swarmData, {
      format,
      template: 'swarm-report',
      filename: `swarm-report-${swarmData.swarm?.name || 'default'}.${format}`
    });
  }

  async exportTaskSummary(taskData, format = 'html') {
    return this.export(taskData, {
      format,
      template: 'task-summary',
      filename: `task-summary.${format}`
    });
  }

  async exportSystemHealth(healthData, format = 'html') {
    return this.export(healthData, {
      format,
      template: 'system-health',
      filename: `system-health.${format}`
    });
  }

  async exportCustomData(data, template, format = 'json') {
    return this.export(data, {
      format,
      template,
      filename: `custom-${template}.${format}`
    });
  }

  // Template management
  async addTemplate(name, templates) {
    this.templates.set(name, templates);
    
    // Save templates to disk
    for (const [format, content] of Object.entries(templates)) {
      const filename = path.join(this.config.templatesDir, `${name}.${format}`);
      await writeFile(filename, content);
    }
    
    console.log(`📄 Template '${name}' added`);
  }

  async removeTemplate(name) {
    if (this.templates.has(name)) {
      this.templates.delete(name);
      
      // Remove template files
      for (const format of ['html', 'md', 'json']) {
        const filename = path.join(this.config.templatesDir, `${name}.${format}`);
        try {
          await unlink(filename);
        } catch (error) {
          // File might not exist, that's OK
        }
      }
      
      console.log(`🗑️ Template '${name}' removed`);
    }
  }

  getAvailableTemplates() {
    return Array.from(this.templates.keys());
  }

  getAvailableFormats() {
    return Array.from(this.exporters.keys());
  }

  async getStats() {
    return {
      templates: this.templates.size,
      formats: this.exporters.size,
      outputDir: this.config.outputDir,
      templatesDir: this.config.templatesDir,
      availableTemplates: this.getAvailableTemplates(),
      availableFormats: this.getAvailableFormats()
    };
  }

  // Utility method for glob pattern matching (simple implementation)
  async glob(pattern) {
    const { glob } = await import('glob');
    return glob.sync(pattern);
  }

  async cleanup() {
    // Clear templates and exporters
    this.templates.clear();
    this.exporters.clear();
    
    console.log('📊 Export System Plugin cleaned up');
  }
}

export default ExportSystemPlugin;