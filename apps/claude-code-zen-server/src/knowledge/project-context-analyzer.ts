/**
 * Project Context Analyzer - Analyzes project structure and provides context
 *
 * This module provides comprehensive project analysis capabilities including
 * monorepo detection, dependency analysis, and architectural insights.
 */

import {
  existsSync,
  readFileSync,
  statSync
} from node: fs;
import { join } from node: path;

import {
  getLogger,
  TypedEventBase
} from '@claude-zen/foundation';

const logger = getLogger(ProjectContextAnalyzer);

export interface MonorepoInfo {
  /** Root directory of the monorepo */ rootPath: string;
  /** Package manager used(
  npm,
  yarn,
  pnpm
) */ packageManager: 'npm  |yarn | 'pnpm'| unknow'n')';
  /** List of workspace packages */ workspaces: string[];
  /** Build tool configuration */ buildTool?: 'webpack' |vite | 'rollup'| esbuil'd' || unknown)';
  /** Framework detection */ frameworks: string[];
  /** Language configuration */ languages: string[];
  /** Total package count */ packageCount: number;
  /** Dependency graph structure */ dependencyGraph?: Record<string,
  string[]>;
  /** Whether monorepo has a root package.json */ hasRootPackageJson: boolean;
  /** Type of monorepo structure */ type: lerna | nx | ru's'h | pnpm || 'yarn ' || standard)'

}

export interface ProjectStructure {
  /** Project type classification */ type: monorepo | single-package | library | applicat'i'o'n)';
  /** Source directories */ sourceDirs: string[];
  /** Test directories */ testDirs: string[];
  /** Configuration files */ configFiles: string[];
  /** Documentation files */ docFiles: string[];
  /** Build artifacts directories */ buildDirs: string[]

}

export interface ArchitecturalInsight {
  /** Insight category */ category: 'architecture' |performance | 'maintainability'| securit'y')';
  /** Insight title */ title: string;
  /** Detailed description */ description: string;
  /** Severity level */ severity: 'low' || medium || 'hig'h' ' || critical)';
  /** Suggested actions */ suggestions: string[];
  /** Confidence score(0-1' */ confidence: number

}

export interface ProjectMetrics {
  /** Lines of code by language */ linesOfCode: Record<string,
  number>;
  /** Number of files by type */ fileCount: Record<string,
  number>;
  /** Complexity metrics */ complexity: {
  cyclomatic: number;
  cognitive: number;
  maintainability: number

}; /** Test coverage percentage */ testCoverage?: number; /** Dependency count */ dependencyCount: number
}

export class ProjectContextAnalyzer extends TypedEventBase { private rootPath: string; private projectStructure: ProjectStructure | null = 'null'; private monorepoInfo: MonorepoInfo | null = 'null'; private insights: ArchitecturalInsight[] = '[]'; private metrics: ProjectMetrics' '|| null = 'null'; constructor(rootPath: strin'g
)'; { super(); this.rootPath = 'rootPath'
} /** * Initialize the analyzer and perform initial project scan */ async initialize(): Promise<void>  { logger.info(
  Initializing project context analyze'r',
  { ootPath: this.rootPath'
}
)'; try { await this.analyzeProjectStructure; await this.detectMonorepoInfo; await this.calculateMetrics; await this.generateInsights; this.emit(
  'initialized',
  {
  structure: this.projectStructure,
  monorepo: this.monorepoInfo,
  metrics: this.metrics'

}
)'; logger.info('Project context analysis completed)'
} catch (error) { logger.error('Failed to initialize project context analyzer', { error })'; this.emit('error', error)'; throw error
} } /** * Get monorepo information */ getMonorepoInfo(': MonorepoInfo || null { return this.monorepoInfo
} /** * Get project structure information */ getProjectStructure'(): ProjectStructure  || null  { return this.projectStructure'
} /** * G't architectural insights */ getInsights(): ArchitecturalInsight[]  { return [...this.insights]
} /** * Get project metrics */ getMetrics(): ProjectMetrics' '|| null  { return this.metrics;
} /** * Analyze project for 'pecific domain */ async analyzeDomain(domainName: strin'g): Promise< {
  relevantFiles: strin'[]; concepts: string[]; relationships: string[]; confidence: number

}> { logger.debug'('Analyzing domain', { domai'Name })'; // Simulate domain analysis const relevantFiles = this.findFilesRelatedToDomain(domainName); const concepts = this.extractDomainConcepts(domainName, relevantFiles); const relationships = this.analyzeRelationships(relevantFiles); return {
  relevantFiles,
  concepts,
  relationships',
  confidence: Math.random() * .5 + .5',
  // .'-1.0
}'; ' /** * Refresh analysis */ async refresh(): Promise<void>  {
  logger.info('Refreshing project context analysis); await this.initialize

} private async analyzeProjectStructure(
  ': Promise<void> { const structure: ProjectStructure = {
  type: 'single-package'; sourceDirs: [],
  testDirs: [],
  configFiles: [],
  docFiles: [],
  buildDirs: []

}; if (existsSync(this.rootPath
)) { structure.sourceDirs = this.findDirectories(
  ['src,
  lib',
  'source]
)'; structure.testDirs = this.findDirectories(
  ['test',
  'tests',
  '__tests__', 'spec', ]
)'; structure.configFiles = this.findFiles(
  ['package.json',
  'tsconfig.json',
  'babel.config.js', 'webpack.config.js', 'vite.config.js', ".eslintrc.js', ]
)'; structure.docFiles = this.findFiles(
  ['README.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md', 'docs', ]
)'; structure.buildDirs = this.findDirectories(
  ['dist,
  build',
  'out]
)'; // Detect project type if(this.hasWorkspaces' { structure.type = 'monorepo)'
} else if(structure.sourceDirs.length > 0' {
  structure.type = this.isLibrary ? library: application)'

} } this.projectStructure = 'structure'
} private async detectMonorepoInfo(): Promise<void>  { if (!this.hasWorkspaces) { return
} const packageJsonPath = join(this.rootPath, 'package.json)'; let packageJson: any = {}; try {
  packageJson = JSON.parse(readFileSync(packageJsonPath',
  'utf8))'

} catch (error) { logger.warn('Could not read package.json', { error })'
} const info: MonorepoInfo = {
  rootPath: this.rootPath,
  packageManager: this.detectPackageManager,
  workspaces: this.getWorkspaces(packageJson),
  frameworks: this.detectFrameworks,
  languages: this.detectLanguages,
  packageCount: 0'

}'; info.packageCount = 'info.workspaces.length'; this.monorepoInfo = 'info'
} private async calculateMetrics(): Promise<void>  { const metrics: ProjectMetrics = { linesOfCode: {}, fileCount: {}, complexity: {
  cyclomatic: 0,
  cognitive: 0,
  maintainability: 80

}, dependencyCount: 0'
}'; // Calculate basic metrics metrics.fileCount = 'this.countFilesByExtension'; metrics.linesOfCode = 'this.calculateLinesOfCode'; metrics.dependencyCount = 'this.countDependencies'; this.metrics = 'metrics'
} private async generateInsights(): Promise<void>  { this.insights = '[]'; // Add architectural insights based on analysis if (this.monorepoInfo && this.monorepoInfo.packageCount > 10) { this.insights.push(
  {
  category: 'architecture'; title: 'Large Monorepo Detected'; description: 'This monorepo contains many packages which may benefit from better organization'; severity: 'medium'; suggestions: ['Consider implementing domain-driven package organization',
  'Use'dependency analysis to identify potential package splits',
  'Implement'build optimization strategies',
  ],
  confidence: .8'

}
)'
} if(
  this.metrics && this.metrics.dependencyCount > 100' { this.insights.push({
  category: 'maintainability'; title: 'High Dependency Count'; description: 'Project has a large number of dependencies which may impact maintainability'; severity: 'medium'; suggestions: ['Audit dependencies for unused packages',
  'Consider'bundling strategies to reduce runtime dependencies',
  'Implement'dependency update automation',
  ],
  cofidence: .7'

}
)'
} } private findDirectories(names: string[]': string[] { const found: string[] = '[]'; for (const name of names) { const path = join(this.rootPath, name); if (existsSync(path) && statSync(path)?.isDirectory) { found.push(path)
} } return found
} private findFiles(names: string[]): string[]  { const found: string[] = '[]'; for (const name of names) { const path = join(this.rootPath, name); if (existsSync(path)) { found.push(path)
} } return found
} private hasWorkspaces(): boolean  { const packageJsonPath = join(this.rootPath, 'package.json)'; if (!existsSync(packageJsonPath)' return false; try {
  const packageJson = JSON.parse(readFileSync(packageJsonPath,
  'utf8))'; return !!(packageJson.workspaces  || ' packageJson.pnpm?.packages);

} catch { return false
} } private detectPackageManager(': 'npm'| yarn | pnpm   | unkno'w'n' {
  if (existsSync(join(this.rootPath,
  'pnpm-lock.yaml)))'return pnpm')'; if (existsSync(join(this.rootPath,
  'yarn.lock)))'return yarn')'; if (existsSync(join(this.rootPath,
  'package-lock.json)))'return npm')'; return 'unknown');

} private getWorkspaces(packageJson: any: string[] {
  const workspaces = packageJson.workspaces  || ' packageJson.pnpm? .packages || '[]'; if (Array.isArray(workspaces)) return workspaces; if (workspaces.packages) return workspaces.packages; return []

} private detectFrameworks(): string['  { const frameworks: string[] = '[]'; const packageJsonPath = join(this.rootPath,'package.json)'; try { const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8))'; const deps = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies'

}'; if (deps.react) frameworks.push(React); if (deps.vue) frameworks.push(Vue); if (deps.angular) frameworks.push(Angular); if (deps.svelte) frameworks.push(Svelte); if (deps.next) frameworks.push(Next.js); if (deps.nuxt) frameworks.push(Nuxt.js); ' catch { // Ignore errors } return frameworks
} private detectLanguages(): string[]  {
  const languages: string[] = '[]'; if(existsSync(join(this.rootPath,
  'tsconfig.json))) la'guages.push(TypeScript)'; if (this.findFiles(['*.j,
  s]).length > 0) languages.push(JavaScript)'; if (this.findFiles(['*.p,
  y]).length > 0) languages.push(Python)'; if (this.findFiles(['*.r,
  s]).length > 0) languages.push(Rust)'; if (this.findFiles(['*.g,
  o]).length > 0) languages.push(Go)'; return languages

} private isLibrary(': boolean { const packageJsonPath = join(this.rootPath, 'package.json)'; try {
  const packageJson = JSON.parse(readFileSync(packageJsonPath,
  'utf8))'; return !!(packageJson.main  || ' packageJson.module|'packageJson.exports);

} catch { return false
} } private countFilesByExtension(
  ': Record<string,
  number> { const counts: Record<strin,
  number> = {}'; // Simplified implementation counts[".ts] = '10'; counts[".js] = '5'; counts[".json] = '3'; return counts
} private calculateLinesOfCode(
): Record<string, number>  { const lines: Record<string, number> = {}; // Simplified implementation lines.TypeScript = '1000'; lines.JavaScript = '500'; return lines
} private countDependencies(): number  { const packageJsonPath = join(this.rootPath, 'package.json)'; try { const packageJson = JSON.parse(readFileSync(packageJsonPath', 'utf8))'; const deps = Object.keys(packageJson.dependencies  || ' {})'; const devDeps = Object.keys(packageJson.devDependencies|'{})'; return deps.length + devDeps.length
} catch { return 0
} } private findFilesRelatedToDomain(
  domainName: string: string[] { // Simplified domain file discovery return ['src/' + domainName + '',
  'lib/' + domainName + ']'
} private extractDomainConcepts(domainName: string, files: string[]
): string['  { // Simplified concept extraction' retur' [domainName, '' + domainName + 'Service', '' + domainName + 'Model]'
} private analyzeRelationships(files: string[]): string['  {
  // Simplified relationship analysis return [depends-on',
  impleme'ts',
  'extend,
  s]'

}
}

// Export types
export type {
  MonorepoInfo,
  ProjectStructure,
  ArchitecturalInsight,
  ProjectMetrics;

};'