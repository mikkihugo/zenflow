/**
 * Domain Splitter Stub
 * Compatibility stub for domain splitter tests
 */

import { Domain, DomainSplitOptions } from '../types/domain-types';

export interface SplitterResult {
  domains: Domain[];
  confidence: number;
  metadata: Record<string, any>;
}

export abstract class DomainSplitter {
  abstract name: string;
  
  abstract split(domain: Domain, options?: DomainSplitOptions): Promise<SplitterResult>;
  
  async canSplit(domain: Domain): Promise<boolean> {
    return domain.complexity > 0.7;
  }
}

export class BalancedDomainSplitter extends DomainSplitter {
  name = 'balanced';
  
  async split(domain: Domain, options?: DomainSplitOptions): Promise<SplitterResult> {
    return {
      domains: [domain],
      confidence: 0.8,
      metadata: { strategy: 'balanced' }
    };
  }
}