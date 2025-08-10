export interface Domain {
  name: string;
  files: string[];
  dependencies: string[];
  confidenceScore: number;
}

export interface DependencyGraph {
  [sourceDomain: string]: {
    [targetDomain: string]: number;
  };
}

export interface DomainRelationshipMap {
  relationships: {
    source: number;
    target: number;
    strength: number;
  }[];
  cohesionScores?: {
    domainName: string;
    score: number;
  }[];
  crossDomainDependencies?: {
    sourceDomain: string;
    targetDomain: string;
    count: number;
  }[];
}
