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
import type {
  NPMFactResult,
  GitHubFactResult,
  HexFactResult,
  SecurityFactResult,
  APIDocumentationFactResult,
} from '../types';
/**
 * Processed documentation result with markdown content
 */
export interface ProcessedDocumentation {
  /** Original data source */
  source: string;
  /** Clean markdown content optimized for LLM consumption */
  markdown: string;
  /** Structured metadata */
  metadata: Record<string, any>;
  /** Processing confidence score */
  confidence: number;
  /** Content length metrics */
  metrics: {
    originalLength: number;
    processedLength: number;
    compressionRatio: number;
  };
}
/**
 * Documentation processor that converts various fact types to clean markdown
 */
export declare class DocumentationProcessor {
  /**
   * Process NPM package data into structured markdown
   */
  processNPMPackage(npmData: NPMFactResult): ProcessedDocumentation;
  /**
   * Process GitHub repository data into structured markdown
   */
  processGitHubRepository(githubData: GitHubFactResult): ProcessedDocumentation;
  /**
   * Process Hex package data into structured markdown
   */
  processHexPackage(hexData: HexFactResult): ProcessedDocumentation;
  /**
   * Process security advisory into structured markdown
   */
  processSecurityAdvisory(
    securityData: SecurityFactResult
  ): ProcessedDocumentation;
  /**
   * Process API documentation into structured markdown
   */
  processAPIDocumentation(
    apiData: APIDocumentationFactResult
  ): ProcessedDocumentation;
  /**
   * Generate clean NPM package markdown (context7 style)
   */
  private generateNPMMarkdown;
  /**
   * Generate clean GitHub repository markdown (context7 style)
   */
  private generateGitHubMarkdown;
  /**
   * Generate clean Hex package markdown (context7 style)
   */
  private generateHexMarkdown;
  /**
   * Generate clean security advisory markdown (context7 style)
   */
  private generateSecurityMarkdown;
  /**
   * Generate clean API documentation markdown (context7 style)
   */
  private generateAPIMarkdown;
  /**
   * Calculate content processing metrics
   */
  private calculateMetrics;
  /**
   * Convert HTML content to clean markdown (for web scraping scenarios)
   */
  convertHTMLToMarkdown(html: string): string;
  /**
   * Extract clean text from API responses for better processing
   */
  extractCleanContent(rawContent: any): string;
}
/**
 * Export singleton instance for use across the application
 */
export declare const documentationProcessor: DocumentationProcessor;
//# sourceMappingURL=documentation-processor.d.ts.map
