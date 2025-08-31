/**
 * @fileoverview CodeQL Types - Minimal Implementation
 */

export interface CodeQLDatabase {
  name: string;
  path: string;
  language: string;
}

export interface CodeQLQuery {
  name: string;
  path: string;
  language: string;
}

export interface CodeQLResult {
  rule: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export type CodeQLLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'cpp' | 'go';
