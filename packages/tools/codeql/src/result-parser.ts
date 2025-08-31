/**
 * @fileoverview CodeQL Result Parser - Minimal Implementation
 */

export interface CodeQLResult {
  rule: string;
  message: string;
  location: {
    file: string;
    line: number;
    column: number;
  };
  severity: 'error' | 'warning' | 'info';
}

export class CodeQLResultParser {
  parse(rawResults: string): CodeQLResult[] {
    try {
      const parsed = JSON.parse(rawResults);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}

export default new CodeQLResultParser();
