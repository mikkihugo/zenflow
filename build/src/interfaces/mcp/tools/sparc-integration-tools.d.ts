/**
 * SPARC Integration Tools for HTTP MCP Server.
 *
 * Integrates SPARC methodology into existing HTTP MCP interface.
 * Provides database-driven SPARC operations instead of isolated system.
 */
/**
 * @file Interface implementation: sparc-integration-tools.
 */
import type { DocumentService } from '../services/document-service';
import type { MCPTool } from '../types.ts';
export declare function createSPARCIntegrationTools(_documentService: DocumentService): MCPTool[];
export default createSPARCIntegrationTools;
//# sourceMappingURL=sparc-integration-tools.d.ts.map