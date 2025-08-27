/**
 * @fileoverview SAFe-SPARC Integration Bridge Types
 *
 * **CORE INTEGRATION FRAMEWORK TYPES**
 *
 * These are the foundational types for integrating SAFe Framework (business coordination)
 * with SPARC Methodology (technical implementation). These types are designed to be:
 * - Framework-agnostic and reusable across organizations
 * - Extensible for application-specific business logic
 * - Testable in isolation from application dependencies
 *
 * **EXTENSION PATTERN:**
 * Applications should extend these base types for custom business logic:
 * ```typescript`
 * // In application: claude-code-zen-server/src/types/safe-sparc-integration.ts
 * import type { IntegratedAgentProfile } from '@claude-zen/safe-framework';
 *
 * interface ClaudeZenAgentProfile extends IntegratedAgentProfile {
 *   claudeSpecificCapabilities: string[];
 *   customWorkflows: CustomWorkflow[];
 * }
 * ````
 */
 || business - analyst | compliance - officer;
javascript;
' | ';
typescript;
' | ';
python;
' | ';
java;
' | ';
csharp;
' | ';
cpp;
' | ';
go;
' | ';
ruby;
' | ';
swift;
' | ';
kotlin;
'||quality-validator|technical-writer';
javascript;
' | ';
typescript;
' | ';
python;
' | ';
java;
' | ';
csharp;
' | ';
cpp;
' | ';
go;
' | ';
ruby;
' | ';
swift;
' | ';
kotlin;
'||cross-framework-reporting|intelligent-escalation;;
javascript;
' | ';
typescript;
' | ';
python;
' | ';
java;
' | ';
csharp;
' | ';
cpp;
' | ';
go;
' | ';
ruby;
' | ';
swift;
' | ';
kotlin;
';;
timeoutTolerance: number; // milliseconds
retryPolicy: RetryPolicy;
export {};
