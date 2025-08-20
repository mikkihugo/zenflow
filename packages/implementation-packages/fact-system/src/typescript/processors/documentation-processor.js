/**
 * @fileoverview Documentation Processor for FACT System
 *
 * Converts raw API responses and documentation to clean, structured markdown
 * for optimal LLM consumption. Provides context7-quality documentation processing.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import { getLogger } from '@claude-zen/foundation';
const logger = getLogger('DocumentationProcessor');
/**
 * Documentation processor that converts various fact types to clean markdown
 */
export class DocumentationProcessor {
    /**
     * Process NPM package data into structured markdown
     */
    processNPMPackage(npmData) {
        const markdown = this.generateNPMMarkdown(npmData);
        return {
            source: 'npm',
            markdown,
            metadata: {
                packageName: npmData.name,
                version: npmData.version,
                license: npmData.license,
                maintainers: npmData.maintainers,
                keywords: npmData.keywords
            },
            confidence: npmData.confidence,
            metrics: this.calculateMetrics(JSON.stringify(npmData), markdown)
        };
    }
    /**
     * Process GitHub repository data into structured markdown
     */
    processGitHubRepository(githubData) {
        const markdown = this.generateGitHubMarkdown(githubData);
        return {
            source: 'github',
            markdown,
            metadata: {
                fullName: githubData.fullName,
                language: githubData.language,
                stars: githubData.stars,
                license: githubData.license,
                topics: githubData.topics
            },
            confidence: githubData.confidence,
            metrics: this.calculateMetrics(JSON.stringify(githubData), markdown)
        };
    }
    /**
     * Process Hex package data into structured markdown
     */
    processHexPackage(hexData) {
        const markdown = this.generateHexMarkdown(hexData);
        return {
            source: 'hex',
            markdown,
            metadata: {
                packageName: hexData.name,
                version: hexData.version,
                elixirVersion: hexData.elixirVersion,
                otpVersion: hexData.otpVersion,
                owner: hexData.owner
            },
            confidence: hexData.confidence,
            metrics: this.calculateMetrics(JSON.stringify(hexData), markdown)
        };
    }
    /**
     * Process security advisory into structured markdown
     */
    processSecurityAdvisory(securityData) {
        const markdown = this.generateSecurityMarkdown(securityData);
        return {
            source: 'security',
            markdown,
            metadata: {
                cveId: securityData.id,
                severity: securityData.severity,
                score: securityData.score,
                affectedProducts: securityData.affectedProducts
            },
            confidence: securityData.confidence,
            metrics: this.calculateMetrics(JSON.stringify(securityData), markdown)
        };
    }
    /**
     * Process API documentation into structured markdown
     */
    processAPIDocumentation(apiData) {
        const markdown = this.generateAPIMarkdown(apiData);
        return {
            source: 'api-docs',
            markdown,
            metadata: {
                apiName: apiData.name,
                baseUrl: apiData.baseUrl,
                authentication: apiData.authentication,
                endpointCount: apiData.endpoints?.length || 0
            },
            confidence: apiData.confidence,
            metrics: this.calculateMetrics(JSON.stringify(apiData), markdown)
        };
    }
    /**
     * Generate clean NPM package markdown (context7 style)
     */
    generateNPMMarkdown(data) {
        return `# ${data.name}

## Package Information
- **Version**: ${data.version}
- **Description**: ${data.description}
- **License**: ${data.license || 'Not specified'}
- **Repository**: ${data.repository || 'Not specified'}
- **Homepage**: ${data.homepage || 'Not specified'}

## Maintainers
${data.maintainers.map(m => `- ${m}`).join('\n')}

## Dependencies
${data.dependencies.length > 0 ? data.dependencies.map(dep => `- ${dep}`).join('\n') : '*No dependencies*'}

## Development Dependencies
${data.devDependencies.length > 0 ? data.devDependencies.map(dep => `- ${dep}`).join('\n') : '*No development dependencies*'}

## Download Statistics
- **Weekly**: ${data.downloads?.weekly?.toLocaleString() || 'N/A'}
- **Monthly**: ${data.downloads?.monthly?.toLocaleString() || 'N/A'}
- **Yearly**: ${data.downloads?.yearly?.toLocaleString() || 'N/A'}

## Keywords
${data.keywords.length > 0 ? data.keywords.map(k => `\`${k}\``).join(', ') : '*No keywords*'}

## Published
**Date**: ${new Date(data.publishedAt).toLocaleDateString()}

---
*Source: ${data.source} | Confidence: ${Math.round(data.confidence * 100)}%*`;
    }
    /**
     * Generate clean GitHub repository markdown (context7 style)
     */
    generateGitHubMarkdown(data) {
        const languageBreakdown = Object.entries(data.languages)
            .map(([lang, percent]) => `- **${lang}**: ${percent}%`)
            .join('\n');
        return `# ${data.fullName}

## Repository Information
- **Owner**: ${data.owner}
- **Name**: ${data.repo}
- **Description**: ${data.description}
- **URL**: ${data.url}
- **License**: ${data.license || 'Not specified'}

## Statistics
- **Stars**: ${data.stars.toLocaleString()}
- **Forks**: ${data.forks.toLocaleString()}
- **Open Issues**: ${data.openIssues.toLocaleString()}
- **Default Branch**: ${data.defaultBranch}

## Languages
${languageBreakdown}

## Repository Status
- **Archived**: ${data.archived ? 'Yes' : 'No'}
- **Private**: ${data.private ? 'Yes' : 'No'}

## Timeline
- **Created**: ${new Date(data.createdAt).toLocaleDateString()}
- **Last Updated**: ${new Date(data.updatedAt).toLocaleDateString()}
- **Last Pushed**: ${new Date(data.pushedAt).toLocaleDateString()}

## Topics
${data.topics.length > 0 ? data.topics.map(t => `\`${t}\``).join(', ') : '*No topics*'}

${data.releases.length > 0 ? `## Recent Releases
${data.releases.slice(0, 5).map(release => `- **${release.name}** (${release.tagName}) - ${new Date(release.publishedAt).toLocaleDateString()}${release.prerelease ? ' *[prerelease]*' : ''}`).join('\n')}` : ''}

---
*Source: ${data.source} | Confidence: ${Math.round(data.confidence * 100)}%*`;
    }
    /**
     * Generate clean Hex package markdown (context7 style)
     */
    generateHexMarkdown(data) {
        const dependencyList = data.dependencies
            .map(dep => `- **${dep.name}**: ${dep.requirement}${dep.optional ? ' *(optional)*' : ''}`)
            .join('\n');
        return `# ${data.name}

## Elixir Package Information
- **Version**: ${data.version}
- **Description**: ${data.description}
- **Owner**: ${data.owner}
- **License**: ${data.license || 'Not specified'}
- **Repository**: ${data.repository || 'Not specified'}
- **Homepage**: ${data.homepage || 'Not specified'}

## Requirements
- **Elixir Version**: ${data.elixirVersion || 'Not specified'}
- **OTP Version**: ${data.otpVersion || 'Not specified'}

## Maintainers
${data.maintainers.map(m => `- ${m}`).join('\n')}

## Dependencies
${data.dependencies.length > 0 ? dependencyList : '*No dependencies*'}

## Download Statistics
- **Total Downloads**: ${data.downloads?.total?.toLocaleString() || 'N/A'}
- **Recent Downloads**: ${data.downloads?.recent?.toLocaleString() || 'N/A'}
- **Daily Downloads**: ${data.downloads?.day?.toLocaleString() || 'N/A'}
- **Weekly Downloads**: ${data.downloads?.week?.toLocaleString() || 'N/A'}

## Documentation
${data.documentation ? `[View Documentation](${data.documentation})` : '*No documentation link available*'}

## Configuration
${data.config ? Object.entries(data.config)
            .map(([key, value]) => `- **${key}**: ${value}`)
            .join('\n') : '*No configuration specified*'}

## Timeline
- **Published**: ${new Date(data.publishedAt).toLocaleDateString()}
- **Last Updated**: ${new Date(data.updatedAt).toLocaleDateString()}

---
*Source: ${data.source} | Confidence: ${Math.round(data.confidence * 100)}%*`;
    }
    /**
     * Generate clean security advisory markdown (context7 style)
     */
    generateSecurityMarkdown(data) {
        return `# Security Advisory: ${data.id}

## Vulnerability Overview
**Description**: ${data.description}

## Risk Assessment
- **Severity**: ${data.severity.toUpperCase()}
- **CVSS Score**: ${data.score}/10.0
- **CVSS Vector**: \`${data.vector}\`

## Timeline
- **Published**: ${new Date(data.published).toLocaleDateString()}
- **Last Modified**: ${new Date(data.lastModified).toLocaleDateString()}

## Affected Products
${data.affectedProducts.map(product => `- ${product}`).join('\n')}

## Mitigation
${data.mitigation || '*No mitigation advice available*'}

## References
${data.references.map(ref => `- [${ref}](${ref})`).join('\n')}

---
*Source: ${data.source} | Confidence: ${Math.round(data.confidence * 100)}%*`;
    }
    /**
     * Generate clean API documentation markdown (context7 style)
     */
    generateAPIMarkdown(data) {
        const endpointsList = data.endpoints
            .map(endpoint => `- **${endpoint.method} ${endpoint.path}**: ${endpoint.description}`)
            .join('\n');
        return `# ${data.name}

## API Information
- **Base URL**: ${data.baseUrl}
- **Authentication**: ${data.authentication}
- **Rate Limiting**: ${data.rateLimit || 'Not specified'}

${data.endpoint ? `## Specific Endpoint
**${data.endpoint}**` : ''}

## Available Endpoints
${data.endpoints.length > 0 ? endpointsList : '*No endpoints documented*'}

${data.documentation ? `## Documentation
[View Full Documentation](${data.documentation})` : ''}

${data.sdks && data.sdks.length > 0 ? `## Available SDKs
${data.sdks.map(sdk => `- ${sdk}`).join('\n')}` : ''}

---
*Source: ${data.source} | Confidence: ${Math.round(data.confidence * 100)}%*`;
    }
    /**
     * Calculate content processing metrics
     */
    calculateMetrics(original, processed) {
        const originalLength = original.length;
        const processedLength = processed.length;
        return {
            originalLength,
            processedLength,
            compressionRatio: processedLength / originalLength
        };
    }
    /**
     * Convert HTML content to clean markdown (for web scraping scenarios)
     */
    convertHTMLToMarkdown(html) {
        // Basic HTML to Markdown conversion
        // In production, this would use a proper HTML-to-markdown library
        return html
            .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
            .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
            .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
            .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n')
            .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
            .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
            .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
            .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
            .replace(/<pre[^>]*>(.*?)<\/pre>/gi, '```\n$1\n```')
            .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
            .replace(/<ul[^>]*>(.*?)<\/ul>/gs, (match, content) => {
            const items = content.match(/<li[^>]*>(.*?)<\/li>/gi);
            return items ? items.map((item) => `- ${item.replace(/<li[^>]*>(.*?)<\/li>/gi, '$1')}`).join('\n') + '\n' : '';
        })
            .replace(/<[^>]*>/g, '') // Remove remaining HTML tags
            .replace(/\n\s*\n\s*\n/g, '\n\n') // Clean up excessive newlines
            .trim();
    }
    /**
     * Extract clean text from API responses for better processing
     */
    extractCleanContent(rawContent) {
        if (typeof rawContent === 'string') {
            return this.convertHTMLToMarkdown(rawContent);
        }
        if (typeof rawContent === 'object') {
            // Extract readable content from structured data
            const textFields = ['description', 'content', 'body', 'text', 'summary'];
            for (const field of textFields) {
                if (rawContent[field] && typeof rawContent[field] === 'string') {
                    return this.convertHTMLToMarkdown(rawContent[field]);
                }
            }
            // Fallback to JSON stringification with formatting
            return JSON.stringify(rawContent, null, 2);
        }
        return String(rawContent);
    }
}
/**
 * Export singleton instance for use across the application
 */
export const documentationProcessor = new DocumentationProcessor();
