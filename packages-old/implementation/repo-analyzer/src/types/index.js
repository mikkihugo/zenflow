/**
 * @fileoverview Battle-hardened repository analysis types
 * Professional-grade types for comprehensive repository analysis
 */
    | 'large-class';
'
    | 'duplicate-code';
'
    | 'dead-code';
'
    | 'god-class';
'
    | 'feature-envy;;
severity: 'low' | 'medium' | 'high' | 'critical;;
file: string;
startLine: number;
endLine: number;
description: string;
suggestion: string;
    | 'performance';
'
    | 'complexity';
'
    | 'team-coordination';
'
    | 'technical;;
severity: 'low' | 'medium' | 'high' | 'critical;;
description: string;
mitigation: string;
probability: number; // 0-1 probability
impact: number; // 0-1 impact if occurs
    | 'merge-domains';
'
    | 'refactor-hotspot';
'
    | 'reduce-coupling';
'
    | 'improve-cohesion;;
priority: 'low' | 'medium' | 'high' | 'urgent;;
title: string;
description: string;
rationale: string;
effort: EffortEstimate;
benefits: string[];
risks: string[];
actionItems: ActionItem[];
    | 'architecture-change';
'
    | 'process-change';
'
    | 'tooling-change;;
estimatedHours: number;
dependencies: string[];
'
    | 'yaml';
'
    | 'csv';
'
    | 'html';
'
    | 'markdown';
'
    | 'pdf';
'
    | 'graphml';
'
    | 'dot;;
export {};
