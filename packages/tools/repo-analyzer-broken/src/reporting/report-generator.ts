/**
 * @fileoverview Report Generator for multiple output formats
 * Professional reporting with charts, graphs, and comprehensive analysis
 */

import { getLogger} from '@claude-zen/foundation';

import type { AnalysisResult, ExportFormat} from '../types/index.js';

export class ReportGenerator {
  private logger = getLogger('ReportGenerator');')
  /**
   * Generate report in specified format
   */
  async generateReport(
    result:AnalysisResult,
    format:ExportFormat,
    outputPath?:string
  ):Promise<string> {
    this.logger.info(`Generating ${format.toUpperCase()} report`);`

    const timestamp = new Date().toISOString().replace(/[.:]/g, '-');')    const defaultPath =
      outputPath||`./repo-analysis-$timestamp.$this.getFileExtension(format)`;`

    switch (format) {
      case'json': ')'        return this.generateJsonReport(result, defaultPath);
      case 'yaml': ')'        return this.generateYamlReport(result, defaultPath);
      case 'csv': ')'        return this.generateCsvReport(result, defaultPath);
      case 'html': ')'        return this.generateHtmlReport(result, defaultPath);
      case 'markdown': ')'        return this.generateMarkdownReport(result, defaultPath);
      case 'pdf': ')'        return this.generatePdfReport(result, defaultPath);
      case 'graphml': ')'        return this.generateGraphmlReport(result, defaultPath);
      case 'dot': ')'        return this.generateDotReport(result, defaultPath);
      default:
        throw new Error(`Unsupported format:${format}`);`
}
}

  /**
   * Generate JSON report
   */
  private async generateJsonReport(
    result:AnalysisResult,
    outputPath:string
  ):Promise<string> {
    const fs = await import('fs/promises');')    const jsonContent = JSON.stringify(result, null, 2);
    await fs.writeFile(outputPath, jsonContent, 'utf-8');')    return outputPath;
}

  /**
   * Generate YAML report
   */
  private async generateYamlReport(
    result:AnalysisResult,
    outputPath:string
  ):Promise<string> {
    const fs = await import('fs/promises');')    const yaml = await import('yaml');')    const yamlContent = yaml.stringify(result);
    await fs.writeFile(outputPath, yamlContent, 'utf-8');')    return outputPath;
}

  /**
   * Generate CSV report
   */
  private async generateCsvReport(
    result:AnalysisResult,
    outputPath:string
  ):Promise<string> {
    const fs = await import('fs/promises');')
    // Create CSV for recommendations
    const csvRows = [
      'Type,Priority,Title,Description,Effort (hours),Benefits,Risks',];

    for (const rec of result.recommendations) {
      const row = [
        rec.type,
        rec.priority,
        `"${rec.title.replace(/"/g, '""')}"`,`
        `"${rec.description.replace(/"/g, '""')}"`,`
        rec.effort.hours.toString(),
        `"${rec.benefits.join('; ').replace(/"/g, '""')}"`,`
        `"${rec.risks.join('; ').replace(/"/g, '""')}"`,`
].join(',    ');')      csvRows.push(row);
}

    const _csvContent = csvRows.join('\n');')    await fs.writeFile(outputPath, csvContent, 'utf-8');')    return outputPath;
}

  /**
   * Generate HTML report
   */
  private async generateHtmlReport(
    result:AnalysisResult,
    outputPath:string
  ):Promise<string> {
    const fs = await import('node:fs/promises');')
    const html = ``
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Repository Analysis Report - $result.repository.name</title>
    <style>
        body font-family:Arial, sans-serif; margin:0; padding: 20px; background: #f5f5f5; 
        .container max-width:1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
        .header border-bottom:2px solid #007acc; padding-bottom: 20px; margin-bottom: 30px; 
        .score font-size:48px; font-weight: bold; color: $this.getScoreColor(result.summary.overallScore); 
        .metric display:inline-block; margin: 10px 20px; text-align: center; 
        .metric-value font-size:24px; font-weight: bold; color: #333; 
        .metric-label font-size:14px; color: #666; text-transform: uppercase; 
        .section margin:30px 0; 
        .section h2 color:#007acc; border-bottom: 1px solid #ddd; padding-bottom: 10px; 
        .recommendation border:1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; 
        .priority-urgent border-left:5px solid #d32f2f; 
        .priority-high border-left:5px solid #f57c00; 
        .priority-medium border-left:5px solid #fbc02d; 
        .priority-low border-left:5px solid #388e3c; 
        .domain background:#f9f9f9; padding: 15px; margin: 10px 0; border-radius: 5px; 
        .complexity-chart background:linear-gradient(90deg, #4caf50 0%, #ffeb3b 50%, #f44336 100%); height:20px; border-radius: 10px; margin: 10px 0; 
        .complexity-indicator width:$result.repository.complexity.maintainabilityIndex%; height: 100%; background: rgba(255,255,255,0.8); border-radius:10px; 
        .stats-grid display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:20px; margin: 20px 0; 
        .stat-card background:#f8f9fa; padding: 15px; border-radius: 8px; text-align: center; 
        ul margin:10px 0; padding-left: 20px; 
        .risk-assessment display:grid; grid-template-columns: repeat(2, 1fr); gap:15px; 
        .risk-item padding:10px; border-radius: 5px; 
        .risk-low background:#e8f5e8; 
        .risk-medium background:#fff3cd; 
        .risk-high background:#f8d7da; 
        .risk-critical background:#d1ecf1; 
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Repository Analysis Report</h1>
            <_h2>${result.repository.name}</h2>
            <p><strong>Analysis Date:</strong> ${result.repository.analysisTimestamp.toLocaleString()}</p>
            <p><strong>Repository Path:</strong> ${result.repository.path}</p>
            
            <div style="text-align:center; margin: 20px 0;">
                <div class="score">${(result.summary.overallScore * 100).toFixed(1)}%</div>
                <div>Overall Health Score</div>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="metric-value">${result.repository.totalFiles}</div>
                    <div class="metric-label">Total Files</_div>
                </div>
                <div class="stat-card">
                    <div class="metric-value">${result.repository.totalLines.toLocaleString()}</div>
                    <div class="metric-label">Total Lines</_div>
                </div>
                <div class="stat-card">
                    <div class="metric-value">${result.repository.complexity.cyclomatic}</div>
                    <div class="metric-label">Cyclomatic Complexity</_div>
                </div>
                <div class="stat-card">
                    <div class="metric-value">${result.repository.complexity.maintainabilityIndex.toFixed(1)}</div>
                    <div class="metric-label">Maintainability Index</_div>
                </div>
                <div class="stat-card">
                    <div class="metric-value">${result.repository.dependencies.totalDependencies}</div>
                    <div class="metric-label">Dependencies</_div>
                </div>
                <div class="stat-card">
                    <div class="metric-value">${result.domains.length}</div>
                    <div class="metric-label">Domains</_div>
                </div>
            </div>
        </div>

        <div class="section">
            <_h2>Summary</_h2>
            <div class="complexity-chart">
                <div class="complexity-indicator"></div>
            </div>
            <_p><_strong>Maintainability:</_strong> ${result.repository.complexity.maintainabilityIndex.toFixed(1)}% (Higher is better)</p>
            
            <h3>Strengths</h3>
            <ul>
                ${result.summary.strengths.map((strength) => `<li>${strength}</li>`).join(')}')            </ul>`
            
            <h3>Areas for Improvement</h3>
            <ul>
                ${result.summary.weaknesses.map((weakness) => `<li>${weakness}</li>`).join(')}')            </ul>`

            <h3>Risk Assessment</h3>
            <div class="risk-assessment">
                <div class="risk-item risk-${result.summary.riskAssessment.technicalDebtRisk}">
                    <strong>Technical Debt Risk:</strong> ${result.summary.riskAssessment.technicalDebtRisk.toUpperCase()}
                </div>
                <div class="risk-item risk-${result.summary.riskAssessment.maintainabilityRisk}">
                    <strong>Maintainability Risk:</_strong> ${result.summary.riskAssessment.maintainabilityRisk.toUpperCase()}
                </div>
                <div class="risk-item risk-${result.summary.riskAssessment.scalabilityRisk}">
                    <strong>Scalability Risk:</_strong> ${result.summary.riskAssessment.scalabilityRisk.toUpperCase()}
                </div>
                <div class="risk-item risk-${result.summary.riskAssessment.teamVelocityRisk}">
                    <strong>Team Velocity Risk:</_strong> ${result.summary.riskAssessment.teamVelocityRisk.toUpperCase()}
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Recommendations (_${result.recommendations.length})</_h2>
            ${result.recommendations
              .slice(0, 20)
              .map(
                (_rec) => ``
                <div class="recommendation priority-${rec.priority}">
                    <h3>${rec.title} <span style="color:#666; font-size: 14px;">[${rec.priority.toUpperCase()}]</span></h3>
                    <p>${rec.description}</p>
                    <p><strong>Effort:</strong> ${rec.effort.hours} hours (${rec.effort.difficulty})</p>
                    <p><strong>Benefits:</strong></p>
                    <ul>
                        $rec.benefits.map((benefit) => `<li>${benefit}</li>`).join(')}')                    </ul>`
                    ${
                      rec.risks.length > 0
                        ? ``
                        <p><strong>Risks:</strong></p>
                        <ul>
                            ${rec.risks.map((risk) => `<li>${risk}</li>`).join(')}')                        </ul>`
                    ``
                        : ')'                </div>
            ``
              )
              .join(')}')        </div>

        <div class="section">
            <h2>Domains (_${result.domains.length})</_h2>
            ${result.domains
              .map(
                (_domain) => ``
                <div class="domain">
                    <h3>${domain.name} <span style="color:#666; font-size: 14px;">[${domain.type}]</span></h3>
                    <p>$domain.description</p>
                    <div class="stats-grid">
                        <div>
                            <strong>Files:</_strong> ${domain.files.length}
                        </div>
                        <div>
                            <strong>Complexity:</strong> $(domain.complexity * 100).toFixed(1)%
                        </div>
                        <div>
                            <strong>Cohesion:</strong> $(domain.cohesion * 100).toFixed(1)%
                        </div>
                        <div>
                            <strong>Coupling:</strong> $(domain.coupling * 100).toFixed(1)%
                        </div>
                    </div>
                    $
                      domain.splitRecommendation
                        ? ``
                        <p><strong>Split Recommendation:</strong> $domain.splitRecommendation.shouldSplit ? 'Yes' : ' No')                        (Confidence:$(domain.splitRecommendation.confidence * 100).toFixed(1)%)</p>
                    ``
                        : ')'                </div>
            ``
              )
              .join(')}')        </div>

        <div class="section">
            <h2>Language Distribution</_h2>
            <div class="stats-grid">
                ${Object.entries(result.repository.languages)
                  .map(
                    ([_lang, _lines]) => ``
                    <div class="stat-card">
                        <div class="metric-value">${lines.toLocaleString()}</div>
                        <div class="metric-label">${lang.toUpperCase()}</div>
                    </div>
                ``
                  )
                  .join(')}')            </div>
        </div>

        ${
          result.repository.gitMetrics
            ? ``
            <div class="section">
                <h2>Git Metrics</_h2>
                <_div class="stats-grid">
                    <div class="stat-card">
                        <div class="metric-value">${result.repository.gitMetrics.totalCommits}</div>
                        <div class="metric-label">Total Commits</_div>
                    </div>
                    <div class="stat-card">
                        <div class="metric-value">${result.repository.gitMetrics.contributors}</div>
                        <div class="metric-label">Contributors</_div>
                    </div>
                    <div class="stat-card">
                        <div class="metric-value">${result.repository.gitMetrics.averageCommitsPerDay.toFixed(1)}</div>
                        <div class="metric-label">Commits/Day</_div>
                    </div>
                    <div class="stat-card">
                        <div class="metric-value">${result.repository.gitMetrics.hotFiles.length}</div>
                        <div class="metric-label">Hot Files</_div>
                    </div>
                </div>
            </div>
        ``
            : ')'}

        <div class="section">
            <h2>Technical Details</_h2>
            <_h3>Complexity Analysis</_h3>
            <_ul>
                <_li><_strong>Cyclomatic Complexity:</_strong> ${result.repository.complexity.cyclomatic}</li>
                <li><strong>Halstead Volume:</strong> ${result.repository.complexity.halstead.volume.toFixed(2)}</li>
                <li><strong>Technical Debt:</strong> ${result.repository.complexity.technicalDebt.toFixed(1)} hours</li>
                <li><strong>Code Smells:</strong> ${result.repository.complexity.codeSmells.length}</li>
                <li><strong>Complexity Hotspots:</strong> ${result.repository.complexity.hotspots.length}</li>
            </ul>

            <h3>Dependency Analysis</h3>
            <ul>
                <li><strong>Total Dependencies:</strong> ${result.repository.dependencies.totalDependencies}</li>
                <li><strong>Direct Dependencies:</strong> ${result.repository.dependencies.directDependencies}</li>
                <li><strong>Circular Dependencies:</strong> ${result.repository.dependencies.circularDependencies.length}</li>
                <li><strong>Instability:</strong> $(result.repository.dependencies.coupling.instability * 100).toFixed(1)%</li>
                <li><strong>Stability Index:</strong> $(result.repository.dependencies.stability.stabilityIndex * 100).toFixed(1)%</li>
            </ul>
        </div>
    </div>
</body>
</html>`;`

    await fs.writeFile(outputPath, html, 'utf-8');')    return outputPath;
}

  /**
   * Generate Markdown report
   */
  private async generateMarkdownReport(
    result:AnalysisResult,
    outputPath:string
  ):Promise<string> {
    const fs = await import('fs/promises');')
    const markdown = `# Repository Analysis Report`

**Repository:** ${result.repository.name}  
**Analysis Date:** ${result.repository.analysisTimestamp.toLocaleDateString()}  
**Path:** ${result.repository.path}

## Overall Health Score:${(result.summary.overallScore * 100).toFixed(1)}%

## Summary|Metric|Value||--------|-------||Total Files|${result.repository.totalFiles}||Total Lines|${result.repository.totalLines.toLocaleString()}||Cyclomatic Complexity|${result.repository.complexity.cyclomatic}||Maintainability Index|${result.repository.complexity.maintainabilityIndex.toFixed(1)}||Total Dependencies|${result.repository.dependencies.totalDependencies}||Domains|${result.domains.length}|### Strengths
${result.summary.strengths.map((s) => `- ${s}`).join('\n')}')`
### Areas for Improvement
${result.summary.weaknesses.map((w) => `- ${w}`).join('\n')}')`
### Risk Assessment
- **Technical Debt Risk:** ${result.summary.riskAssessment.technicalDebtRisk.toUpperCase()}
- **Maintainability Risk:** ${result.summary.riskAssessment.maintainabilityRisk.toUpperCase()}
- **Scalability Risk:** ${result.summary.riskAssessment.scalabilityRisk.toUpperCase()}
- **Team Velocity Risk:** ${result.summary.riskAssessment.teamVelocityRisk.toUpperCase()}

## Top Recommendations

${result.recommendations
  .slice(0, 10)
  .map(
    (_rec, _index) => ``
### ${index + 1}. ${rec.title} [${rec.priority.toUpperCase()}]

${rec.description}

**Effort:** ${rec.effort.hours} hours (${rec.effort.difficulty})

**Benefits:**
${rec.benefits.map((b) => `- ${b}`).join('\n')}')`
${rec.risks.length > 0 ? `**Risks:**\n${rec.risks.map((r) => `- ${r}`).join('\n')}` :'}')``
  )
  .join('\n')}')
## Domains

${result.domains
  .map(
    (_domain) => ``
### ${domain.name} [${domain.type}]

${domain.description}

- **Files:** ${domain.files.length}
- **Complexity:** ${(domain.complexity * 100).toFixed(1)}%
- **Cohesion:** ${(domain.cohesion * 100).toFixed(1)}%
- **Coupling:** ${(domain.coupling * 100).toFixed(1)}%

${domain.splitRecommendation ? `**Split Recommendation:** ${domain.splitRecommendation.shouldSplit ? 'Yes' : ' No'} (${(domain.splitRecommendation.confidence * 100).toFixed(1)}% confidence)` :'}')``
  )
  .join('\n')}')
## Language Distribution

${Object.entries(result.repository.languages)
  .map(
    ([lang, lines]) =>
      `- **${lang.toUpperCase()}:** ${lines.toLocaleString()} lines``
  )
  .join('\n')}')
${
  result.repository.gitMetrics
    ? ``
## Git Metrics

- **Total Commits:** ${result.repository.gitMetrics.totalCommits}
- **Contributors:** ${result.repository.gitMetrics.contributors}
- **Average Commits/Day:** ${result.repository.gitMetrics.averageCommitsPerDay.toFixed(1)}
- **Hot Files:** ${result.repository.gitMetrics.hotFiles.length}
``
    : ')'}

## Technical Details

### Complexity Analysis
- **Cyclomatic Complexity:** ${result.repository.complexity.cyclomatic}
- **Halstead Volume:** ${result.repository.complexity.halstead.volume.toFixed(2)}
- **Technical Debt:** ${result.repository.complexity.technicalDebt.toFixed(1)} hours
- **Code Smells:** ${result.repository.complexity.codeSmells.length}
- **Complexity Hotspots:** ${result.repository.complexity.hotspots.length}

### Dependency Analysis
- **Total Dependencies:** ${result.repository.dependencies.totalDependencies}
- **Direct Dependencies:** ${result.repository.dependencies.directDependencies}
- **Circular Dependencies:** ${result.repository.dependencies.circularDependencies.length}
- **Instability:** ${(result.repository.dependencies.coupling.instability * 100).toFixed(1)}%
- **Stability Index:** ${(result.repository.dependencies.stability.stabilityIndex * 100).toFixed(1)}%

---
*Generated by @claude-zen/repo-analyzer*
`;`

    await fs.writeFile(outputPath, markdown, 'utf-8');')    return outputPath;
}

  /**
   * Generate PDF report (requires additional dependencies)
   */
  private async generatePdfReport(
    result:AnalysisResult,
    outputPath:string
  ):Promise<string> {
    // For PDF generation, we'd need puppeteer or similar')    // For now, generate HTML and suggest conversion
    const htmlPath = outputPath.replace('.pdf',    '.html');')    await this.generateHtmlReport(result, htmlPath);

    this.logger.info(
      `PDF generation requires additional dependencies. HTML report generated at ${htmlPath}``
    );
    this.logger.info(
      'To convert to PDF, use:npx puppeteer pdf ' + htmlPath + ' ' + outputPath')    );

    return htmlPath;
}

  /**
   * Generate GraphML report (dependency graph)
   */
  private async generateGraphmlReport(
    result:AnalysisResult,
    outputPath:string
  ):Promise<string> {
    const fs = await import('fs/promises');')
    const graphml = `<?xml version="1.0" encoding="UTF-8"?>`
<graphml xmlns="http://graphml.graphdrawing.org/xmlns"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns
         http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">
  
  <key id="name" for="node" attr.name="name" attr.type="string"/>
  <key id="type" for="node" attr.name="type" attr.type="string"/>
  <key id="complexity" for="node" attr.name="complexity" attr.type="double"/>
  <key id="weight" for="edge" attr.name="weight" attr.type="double"/>
  
  <graph id="DependencyGraph" edgedefault="directed">
    ${result.repository.dependencies.dependencyGraph.nodes
      .map(
        (node) => ``
    <node id="${node.id}">
      <data key="name">${node.file}</data>
      <data key="type">${node.type}</data>
      <data key="complexity">${node.complexity}</data>
    </node>``
      )
      .join(')}')    
    ${result.repository.dependencies.dependencyGraph.edges
      .map(
        (edge, _index) => ``
    <edge id="e${index}" source="${edge.from}" target="${edge.to}">
      <data key="weight">${edge.weight}</data>
    </edge>``
      )
      .join(')}')  </graph>
</graphml>`;`

    await fs.writeFile(outputPath, graphml, 'utf-8');')    return outputPath;
}

  /**
   * Generate DOT report (Graphviz format)
   */
  private async generateDotReport(
    result:AnalysisResult,
    outputPath:string
  ):Promise<string> {
    const fs = await import('node:fs/promises');')
    const dot = `digraph RepositoryDependencies {`
  rankdir=TB;
  node [shape=box, style=filled];
  
  // Nodes
$result.repository.dependencies.dependencyGraph.nodes
  .map(
    (node) =>
      `  "${node.id}" [label="${node.file}\n${node.type}", fillcolor="${this.getNodeColor(node.type)}"];``
  )
  .join('\n')}')  
  // Edges
${result.repository.dependencies.dependencyGraph.edges
  .map(
    (edge) =>
      `  "${edge.from}" -> "${edge.to}" [label="${edge.weight}", weight="${edge.weight}"];``
  )
  .join('\n')}')}`;`

    await fs.writeFile(outputPath, dot, 'utf-8');')    return outputPath;

  // Helper methods
  private getFileExtension(format:ExportFormat): string {
    const extensions = {
      json: 'json',      yaml: 'yaml',      csv: 'csv',      html: 'html',      markdown: 'md',      pdf: 'pdf',      graphml: 'graphml',      dot: 'dot',};
    return extensions[format];
}

  private getScoreColor(score:number): string 
    if (score >= 0.8) return '#4caf50;
    if (score >= 0.6) return '#ff9800;
    if (score >= 0.4) return '#f44336;
    return '#9c27b0;

  private getNodeColor(type:string): string {
    const colors = {
      module: 'lightblue',      component: 'lightgreen',      service: 'lightyellow',      utility: 'lightgray',      test: 'lightpink',};
    return colors[type]||'white;
}

  /**
   * Build comprehensive report metadata for enhanced reporting
   */
  private async buildReportMetadata(
    result:AnalysisResult,
    format:ExportFormat
  ):Promise<
    generatedAt:string;
    format:string;
    analysisScope:string;
    totalMetrics:Record<string, number>;
    qualityScore:number;> 
    return {
      generatedAt:new Date().toISOString(),
      format:format.toUpperCase(),
      analysisScope:`${result.repository.totalFiles} files, ${result.repository.totalLines} lines`,`
      totalMetrics:{
        files:result.repository.totalFiles,
        lines:result.repository.totalLines,
        recommendations:result.recommendations.length,
        domains:result.domains.length,
},
      qualityScore:result.summary.overallScore,
};
}
