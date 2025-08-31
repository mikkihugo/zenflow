/**
 * @fileoverview Main types index - Re-exports all type definitions
 *
 * Centralized export for all TypeScript type definitions used throughout
 * the SAFe framework package.
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
// Core types
export type Logger = import(): void {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly businessValue: number;
  readonly priority: number;
  readonly status : 'analyzing| implementing| done' | ' backlog')javascript' | ' typescript'|' python' | ' java'|' csharp' | ' cpp'|' go' | ' ruby'|' swift' | ' kotlin')|' critical');
  readonly validationRules: ValidationRule[];
  readonly evidenceRequirements: EvidenceRequirement[];
}
export interface ValidationRule {
  id: string;
};
  readonly impact?:  {
    readonly confidentiality: string;
    readonly integrity: string;
    readonly availability: string;
    readonly businessImpact: string;
};
  readonly remediation?:string;
  readonly references?:string[];
  readonly toolId?:string;
  readonly discoveredDate?:Date;
  readonly lastSeenDate?:Date;
  readonly falsePositive?:boolean;
}
export interface SecurityTool {
  readonly id: string;
  readonly name: string;
  readonly type : 'static| dynamic| interactive' | ' manual')low' | ' medium'|' high' | ' critical');
  readonly version : 'javascript' | ' typescript'|' python' | ' java'|' csharp' | ' cpp'|' go' | ' ruby'|' swift' | ' kotlin')./epic-management')./integration-bridge'))export * from './product-management');