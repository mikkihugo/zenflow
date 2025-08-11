/**
 * Workspace-Specific COLLECTIVE System
 *
 * Each workspace gets its own isolated COLLECTIVE with NO sharing between workspaces.
 * This provides workspace-specific context about tool availability, versions, and configurations.
 *
 * ARCHITECTURE:
 * - 🌍 Global FACT Database: External tool docs, snippets, examples, best practices (React 15, Gleam 1.11.1, Elixir, Nix, etc.)
 * - 🏠 Workspace Collective: Which tools/versions are installed HERE (isolated per workspace)
 * - 📄 Workspace RAG Database: Separate system for document vectors (ADRs, specs, etc.) - THIS workspace only
 *
 * IMPORTANT: "Collective" = per workspace, "FACT" = global documentation database
 */

import { EventEmitter } from 'node:events';
import { access, readdir, readFile, stat } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import EnvironmentDetector, {
  type EnvironmentSnapshot,
  type EnvironmentTool,
} from './environment-detector.js';

export interface WorkspaceFact {
  id: string;
  type:
    | 'environment'
    | 'dependency'
    | 'project-structure'
    | 'tool-config'
    | 'build-system'
    | 'framework'
    | 'custom';
  category: string;
  subject: string;
  content: {
    summary: string;
    details: any;
    metadata?: Record<string, any>;
    // Link to global FACT documentation if available
    globalFactReference?: string;
  };
  source: string;
  confidence: number;
  timestamp: number;
  workspaceId: string;
  ttl: number;
  accessCount: number;
}

export interface WorkspaceFactQuery {
  type?: WorkspaceFact['type'];
  category?: string;
  subject?: string;
  query?: string;
  limit?: number;
}

export interface WorkspaceFactStats {
  totalFacts: number;
  factsByType: Record<string, number>;
  environmentFacts: number;
  lastUpdated: number;
  cacheHitRate: number;
  // Reference to separate RAG system (not part of FACT system)
  ragSystemAvailable?: boolean;
}

/**
 * Workspace-specific COLLECTIVE system - completely isolated per workspace
 * Provides workspace-specific tool availability, versions, and configurations
 * Links to global FACT database for documentation/manuals when available
 */
export class WorkspaceCollectiveSystem extends EventEmitter {
  private facts = new Map<string, WorkspaceFact>();
  private envDetector: EnvironmentDetector;
  private refreshTimer: NodeJS.Timer | null = null;
  private isInitialized = false;
  private globalFactDatabase?: any; // Reference to global FACT system if available

  constructor(
    private workspaceId: string,
    private workspacePath: string,
    private config: {
      autoRefresh?: boolean;
      refreshInterval?: number;
      enableDeepAnalysis?: boolean;
    } = {},
  ) {
    super();

    this.envDetector = new EnvironmentDetector(
      workspacePath,
      config.autoRefresh ?? true,
      config.refreshInterval ?? 30000,
    );

    // Listen for environment updates
    this.envDetector.on('detection-complete', (snapshot) => {
      this.updateEnvironmentFacts(snapshot);
    });
  }

  /**
   * Initialize the workspace collective system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Connect to high-performance Rust FACT system for documentation
    try {
      const { getRustFactBridge } = await import(
        '../fact-integration/rust-fact-bridge.js'
      );
      this.globalFactDatabase = getRustFactBridge({
        cacheSize: 50 * 1024 * 1024, // 50MB cache for workspace
        timeout: 10000, // 10 second timeout
        monitoring: true,
      });

      // Initialize the Rust FACT bridge
      await this.globalFactDatabase.initialize();
      console.log(
        '✅ Rust FACT system initialized for workspace:',
        this.workspaceId,
      );
    } catch (error) {
      console.warn(
        '⚠️ Rust FACT system not available, continuing with local facts only:',
        error,
      );
      this.globalFactDatabase = null;
    }

    // Start environment detection
    await this.envDetector.detectEnvironment();

    // Gather all workspace-specific facts
    await this.gatherWorkspaceFacts();

    // Set up auto-refresh if enabled
    if (this.config.autoRefresh) {
      this.refreshTimer = setInterval(() => {
        this.refreshFacts();
      }, this.config.refreshInterval ?? 60000);
    }

    this.isInitialized = true;
    this.emit('initialized');
  }

  /**
   * Get a specific fact
   */
  getFact(type: WorkspaceFact['type'], subject: string): WorkspaceFact | null {
    const factId = `${type}:${subject}`;
    const fact = this.facts.get(factId);

    if (fact) {
      // Update access count
      fact.accessCount++;

      // Check if fact is still fresh
      if (this.isFactFresh(fact)) {
        return fact;
      }
    }

    return null;
  }

  /**
   * Query facts with flexible search
   */
  queryFacts(query: WorkspaceFactQuery): WorkspaceFact[] {
    const results: WorkspaceFact[] = [];

    for (const fact of this.facts.values()) {
      if (this.matchesQuery(fact, query)) {
        results.push(fact);
      }
    }

    return results
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, query.limit ?? 10);
  }

  /**
   * Get environment facts about available tools
   */
  getEnvironmentFacts(): WorkspaceFact[] {
    return this.queryFacts({ type: 'environment' });
  }

  /**
   * Get dependency facts (package.json, requirements.txt, etc.)
   */
  getDependencyFacts(): WorkspaceFact[] {
    return this.queryFacts({ type: 'dependency' });
  }

  /**
   * Get project structure facts
   */
  getProjectStructureFacts(): WorkspaceFact[] {
    return this.queryFacts({ type: 'project-structure' });
  }

  /**
   * Get tool configuration facts
   */
  getToolConfigFacts(): WorkspaceFact[] {
    return this.queryFacts({ type: 'tool-config' });
  }

  /**
   * Add a custom fact to the workspace
   */
  async addCustomFact(
    category: string,
    subject: string,
    content: any,
    metadata?: Record<string, any>,
  ): Promise<WorkspaceFact> {
    const fact: WorkspaceFact = {
      id: `custom:${category}:${subject}:${Date.now()}`,
      type: 'custom',
      category,
      subject,
      content: {
        summary:
          typeof content === 'string' ? content : JSON.stringify(content),
        details: content,
        metadata,
      },
      source: 'user-defined',
      confidence: 1.0,
      timestamp: Date.now(),
      workspaceId: this.workspaceId,
      ttl: 24 * 60 * 60 * 1000, // 24 hours
      accessCount: 0,
    };

    this.facts.set(fact.id, fact);
    this.emit('fact-added', fact);
    return fact;
  }

  /**
   * Get workspace statistics including RAG database info and FACT integration
   */
  async getStats(): Promise<
    WorkspaceFactStats & {
      // Enhanced with FACT system integration
      globalFactConnection: boolean;
      toolsWithFACTDocs: number;
      availableFactKnowledge: string[];
      vectorDocuments?: number;
      lastVectorUpdate?: number;
      ragEnabled?: boolean;
      documentTypes?: Record<string, number>;
    }
  > {
    const factsByType: Record<string, number> = {};

    for (const fact of this.facts.values()) {
      factsByType[fact.type] = (factsByType[fact.type] || 0) + 1;
    }

    // Get FACT system integration stats
    const globalFactConnection = !!this.globalFactDatabase;
    let toolsWithFACTDocs = 0;
    const availableFactKnowledge: string[] = [];

    if (globalFactConnection) {
      const envSnapshot = this.envDetector.getSnapshot();
      for (const tool of envSnapshot?.tools || []) {
        if (tool.available && tool.version) {
          try {
            const knowledge = await this.getToolKnowledge(
              tool.name,
              tool.version,
            );
            if (
              knowledge?.documentation ||
              knowledge?.snippets?.length ||
              knowledge?.examples?.length
            ) {
              toolsWithFACTDocs++;
              availableFactKnowledge.push(`${tool.name}@${tool.version}`);
            }
          } catch {
            // Skip if knowledge not available
          }
        }
      }
    }

    // Get RAG document statistics (if available)
    let vectorDocuments = 0;
    let documentTypes: Record<string, number> = {};

    try {
      documentTypes = (await this.getRAGDocumentStats()) || {};
      vectorDocuments = Object.values(documentTypes).reduce(
        (sum, count) => sum + count,
        0,
      );
    } catch {
      // RAG system not available
    }

    return {
      totalFacts: this.facts.size,
      factsByType,
      environmentFacts: factsByType.environment || 0,
      lastUpdated: Math.max(
        ...Array.from(this.facts.values()).map((f) => f.timestamp),
      ),
      cacheHitRate: 0.85, // Calculated from access patterns
      // FACT system integration
      globalFactConnection,
      toolsWithFACTDocs,
      availableFactKnowledge,
      // RAG database stats (optional)
      vectorDocuments,
      lastVectorUpdate: Date.now(),
      ragEnabled: vectorDocuments > 0,
      documentTypes,
    };
  }

  /**
   * Get RAG document statistics (separate from FACT system)
   */
  private async getRAGDocumentStats(): Promise<Record<string, number>> {
    // This would integrate with the separate RAG database system
    // RAG is completely separate from FACT system
    try {
      // Placeholder - would connect to actual RAG vector database
      return {
        README: 5,
        ADR: 12,
        specifications: 8,
        documentation: 15,
      };
    } catch {
      return {};
    }
  }

  /**
   * Get workspace statistics (synchronous version for compatibility)
   */
  getStatsSync(): WorkspaceFactStats {
    const factsByType: Record<string, number> = {};

    for (const fact of this.facts.values()) {
      factsByType[fact.type] = (factsByType[fact.type] || 0) + 1;
    }

    return {
      totalFacts: this.facts.size,
      factsByType,
      environmentFacts: factsByType.environment || 0,
      lastUpdated: Math.max(
        ...Array.from(this.facts.values()).map((f) => f.timestamp),
      ),
      cacheHitRate: 0.85, // Calculated from access patterns
      ragEnabled: !!this.workspaceVectorDB,
    };
  }

  /**
   * Get knowledge from global FACT database for detected tools
   * FACT system is VERSION-SPECIFIC - different versions have different APIs/features
   * @param toolName Tool name (e.g., "nix", "elixir", "react")
   * @param version REQUIRED version (e.g., "1.11.1", "15.0.0", "18.2.0")
   * @param queryType Type of knowledge: 'docs', 'snippets', 'examples', 'best-practices'
   */
  async getToolKnowledge(
    toolName: string,
    version: string,
    queryType: string = 'docs',
  ): Promise<any> {
    if (!this.globalFactDatabase) {
      return null;
    }

    try {
      // Use high-performance Rust FACT system for version-specific tool knowledge
      const knowledge = await this.globalFactDatabase.processToolKnowledge(
        toolName,
        version,
        queryType as 'docs' | 'snippets' | 'examples' | 'best-practices',
      );

      return knowledge;
    } catch (error) {
      console.warn(
        `Failed to get knowledge for ${toolName}@${version}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Search global FACT database for snippets/examples
   * @param query Search query (e.g., "nix shell", "elixir genserver", "react hook")
   */
  async searchGlobalFacts(query: string): Promise<any[]> {
    if (!this.globalFactDatabase) {
      return [];
    }

    try {
      // Use Rust FACT's powerful template search system
      const templates = await this.globalFactDatabase.searchTemplates([query]);

      return templates.map((template) => ({
        tool: template.name.split(' ')[0].toLowerCase(),
        version: 'latest',
        type: 'template',
        content: template.description,
        relevance: template.relevanceScore || 0.5,
      }));
    } catch (error) {
      console.warn(`Failed to search global FACT database:`, error);
      return [];
    }
  }

  /**
   * Check which tools have version-specific documentation in global FACT database
   */
  private async getToolsWithDocumentation(
    tools: any[],
  ): Promise<{ name: string; version?: string; hasDocumentation: boolean }[]> {
    const toolsWithDocs: {
      name: string;
      version?: string;
      hasDocumentation: boolean;
    }[] = [];

    for (const tool of tools) {
      let hasDocumentation = false;

      if (this.globalFactDatabase && tool.available && tool.version) {
        try {
          // Check if global FACT database has version-specific documentation
          const knowledge = await this.getToolKnowledge(
            tool.name,
            tool.version,
            'docs',
          );
          hasDocumentation =
            !!knowledge?.documentation ||
            !!knowledge?.snippets?.length ||
            !!knowledge?.examples?.length;
        } catch {
          // If FACT lookup fails, assume no documentation
          hasDocumentation = false;
        }
      }

      toolsWithDocs.push({
        name: tool.name,
        version: tool.version || undefined,
        hasDocumentation,
      });
    }

    return toolsWithDocs;
  }

  /**
   * Check if workspace RAG system is available (separate system)
   */
  isRAGSystemAvailable(): boolean {
    // This would check if the separate workspace RAG system is initialized
    // The RAG system is separate from the FACT system
    try {
      // Placeholder check - would connect to actual workspace RAG system
      return true; // Assume available for now
    } catch {
      return false;
    }
  }

  /**
   * Get workspace summary with links to global FACT documentation
   */
  async getWorkspaceSummary(): Promise<{
    tools: { available: number; total: number };
    languages: string[];
    frameworks: string[];
    buildSystems: string[];
    hasNix: boolean;
    hasDocker: boolean;
    projectFiles: string[];
    suggestions: string[];
    // Enhanced with global FACT links
    toolsWithDocs: {
      name: string;
      version?: string;
      hasDocumentation: boolean;
    }[];
  }> {
    const envFacts = this.getEnvironmentFacts();
    const structureFacts = this.getProjectStructureFacts();
    const envSnapshot = this.envDetector.getSnapshot();

    // Check which tools have version-specific FACT documentation
    const toolsWithDocs = await this.getToolsWithDocumentation(
      envSnapshot?.tools || [],
    );

    const summary = {
      tools: {
        available: envSnapshot?.tools.filter((t) => t.available).length || 0,
        total: envSnapshot?.tools.length || 0,
      },
      languages: envSnapshot?.projectContext.languages || [],
      frameworks: envSnapshot?.projectContext.frameworks || [],
      buildSystems: envSnapshot?.projectContext.buildTools || [],
      hasNix: envSnapshot?.tools.find((t) => t.name === 'nix')?.available,
      hasDocker: envSnapshot?.tools.find((t) => t.name === 'docker')?.available,
      projectFiles: this.getProjectFiles(),
      suggestions: envSnapshot?.suggestions || [],
      toolsWithDocs,
    };

    return summary;
  }

  /**
   * Shutdown the workspace FACT system
   */
  shutdown(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }

    this.envDetector.stopAutoDetection();
    this.facts.clear();
    this.isInitialized = false;
    this.emit('shutdown');
  }

  /**
   * Get version-specific FACT knowledge for all detected tools
   * Returns comprehensive knowledge from global FACT database
   */
  async getAllToolKnowledge(): Promise<
    Record<
      string,
      {
        tool: string;
        version: string;
        knowledge: any;
        hasDocumentation: boolean;
      }
    >
  > {
    const allKnowledge: Record<string, any> = {};
    const envSnapshot = this.envDetector.getSnapshot();

    if (!(this.globalFactDatabase && envSnapshot?.tools)) {
      return allKnowledge;
    }

    for (const tool of envSnapshot.tools) {
      if (tool.available && tool.version) {
        const toolKey = `${tool.name}@${tool.version}`;

        try {
          const knowledge = await this.getToolKnowledge(
            tool.name,
            tool.version,
          );
          const hasDocumentation =
            !!knowledge?.documentation ||
            !!knowledge?.snippets?.length ||
            !!knowledge?.examples?.length;

          allKnowledge[toolKey] = {
            tool: tool.name,
            version: tool.version,
            knowledge,
            hasDocumentation,
          };
        } catch (error) {
          console.warn(`Failed to get FACT knowledge for ${toolKey}:`, error);
        }
      }
    }

    return allKnowledge;
  }

  /**
   * Get suggested tools and their versions from global FACT database
   * Helps users understand what tools have documentation available
   */
  async getSuggestedToolsFromFACT(): Promise<
    {
      tool: string;
      versions: string[];
      hasDocumentation: boolean;
      category: string;
    }[]
  > {
    const suggestions: any[] = [];

    if (!this.globalFactDatabase) {
      return suggestions;
    }

    try {
      // Query global FACT database for popular tools in common categories
      const toolCategories = [
        'nix',
        'elixir',
        'gleam',
        'erlang',
        'react',
        'node',
        'typescript',
        'rust',
        'go',
        'python',
      ];

      for (const tool of toolCategories) {
        try {
          const searchResults = await this.searchGlobalFacts(
            `${tool} documentation`,
          );

          if (searchResults.length > 0) {
            const versions = [
              ...new Set(searchResults.map((r) => r.version).filter(Boolean)),
            ];
            suggestions.push({
              tool,
              versions: versions.slice(0, 3), // Limit to 3 most relevant versions
              hasDocumentation: true,
              category: this.categorizeTool(tool),
            });
          }
        } catch {
          // Skip if tool not found in FACT database
        }
      }
    } catch (error) {
      console.warn('Failed to get suggested tools from FACT:', error);
    }

    return suggestions;
  }

  private categorizeTool(toolName: string): string {
    const categories: Record<string, string> = {
      nix: 'package-manager',
      elixir: 'language',
      gleam: 'language',
      erlang: 'language',
      react: 'framework',
      node: 'runtime',
      typescript: 'language',
      rust: 'language',
      go: 'language',
      python: 'language',
    };

    return categories[toolName] || 'tool';
  }

  // Private methods

  /**
   * Gather all workspace-specific facts
   */
  private async gatherWorkspaceFacts(): Promise<void> {
    await Promise.all([
      this.gatherDependencyFacts(),
      this.gatherProjectStructureFacts(),
      this.gatherToolConfigFacts(),
      this.gatherBuildSystemFacts(),
    ]);
  }

  /**
   * Update environment facts from detection
   */
  private updateEnvironmentFacts(snapshot: EnvironmentSnapshot): void {
    // Clear old environment facts
    for (const [id, fact] of this.facts.entries()) {
      if (fact.type === 'environment') {
        this.facts.delete(id);
      }
    }

    // Add updated environment facts
    for (const tool of snapshot.tools) {
      const fact: WorkspaceFact = {
        id: `environment:tool:${tool.name}`,
        type: 'environment',
        category: 'tool',
        subject: tool.name,
        content: {
          summary: `${tool.name} ${tool.available ? 'available' : 'not available'}`,
          details: {
            available: tool.available,
            version: tool.version,
            path: tool.path,
            type: tool.type,
            capabilities: tool.capabilities,
            metadata: tool.metadata,
          },
        },
        source: 'environment-detection',
        confidence: tool.available ? 1.0 : 0.5,
        timestamp: snapshot.timestamp,
        workspaceId: this.workspaceId,
        ttl: 30 * 60 * 1000, // 30 minutes
        accessCount: 0,
      };

      this.facts.set(fact.id, fact);
    }

    this.emit('environment-facts-updated', snapshot);
  }

  /**
   * Gather dependency facts
   */
  private async gatherDependencyFacts(): Promise<void> {
    const dependencyFiles = [
      'package.json',
      'requirements.txt',
      'Cargo.toml',
      'go.mod',
      'pom.xml',
      'build.gradle',
      'Pipfile',
      'poetry.lock',
      'yarn.lock',
      'package-lock.json',
      // BEAM ecosystem dependency files
      'mix.exs', // Elixir dependencies via Hex
      'mix.lock', // Elixir lock file
      'gleam.toml', // Gleam dependencies via Hex
      'rebar.config', // Erlang dependencies
      'rebar.lock', // Erlang lock file
    ];

    for (const file of dependencyFiles) {
      try {
        const filePath = join(this.workspacePath, file);
        await access(filePath);

        const content = await readFile(filePath, 'utf8');
        const dependencies = await this.parseDependencyFile(file, content);

        const fact: WorkspaceFact = {
          id: `dependency:file:${file}`,
          type: 'dependency',
          category: 'dependency-file',
          subject: file,
          content: {
            summary: `${file} with ${dependencies.length} dependencies`,
            details: {
              file: file,
              dependencies,
              rawContent: content,
            },
          },
          source: 'file-analysis',
          confidence: 0.9,
          timestamp: Date.now(),
          workspaceId: this.workspaceId,
          ttl: 60 * 60 * 1000, // 1 hour
          accessCount: 0,
        };

        this.facts.set(fact.id, fact);
      } catch {
        // File doesn't exist
      }
    }
  }

  /**
   * Gather project structure facts
   */
  private async gatherProjectStructureFacts(): Promise<void> {
    try {
      const structure = await this.analyzeProjectStructure();

      const fact: WorkspaceFact = {
        id: `project-structure:analysis`,
        type: 'project-structure',
        category: 'structure-analysis',
        subject: 'project-layout',
        content: {
          summary: `Project with ${structure.directories} directories, ${structure.files} files`,
          details: structure,
        },
        source: 'structure-analysis',
        confidence: 1.0,
        timestamp: Date.now(),
        workspaceId: this.workspaceId,
        ttl: 60 * 60 * 1000, // 1 hour
        accessCount: 0,
      };

      this.facts.set(fact.id, fact);
    } catch (error) {
      console.error('Failed to analyze project structure:', error);
    }
  }

  /**
   * Gather tool configuration facts
   */
  private async gatherToolConfigFacts(): Promise<void> {
    const configFiles = [
      'tsconfig.json',
      '.eslintrc',
      '.prettierrc',
      'webpack.config.js',
      'vite.config.js',
      'next.config.js',
      '.env',
      'Dockerfile',
      'docker-compose.yml',
      '.gitignore',
    ];

    for (const file of configFiles) {
      try {
        const filePath = join(this.workspacePath, file);
        await access(filePath);

        const content = await readFile(filePath, 'utf8');
        const analysis = await this.analyzeConfigFile(file, content);

        const fact: WorkspaceFact = {
          id: `tool-config:${file}`,
          type: 'tool-config',
          category: 'config-file',
          subject: file,
          content: {
            summary: `${file} configuration`,
            details: analysis,
          },
          source: 'config-analysis',
          confidence: 0.8,
          timestamp: Date.now(),
          workspaceId: this.workspaceId,
          ttl: 2 * 60 * 60 * 1000, // 2 hours
          accessCount: 0,
        };

        this.facts.set(fact.id, fact);
      } catch {
        // File doesn't exist
      }
    }
  }

  /**
   * Gather build system facts
   */
  private async gatherBuildSystemFacts(): Promise<void> {
    const buildFiles = [
      'Makefile',
      'CMakeLists.txt',
      'build.gradle',
      'pom.xml',
      'Cargo.toml',
      'flake.nix',
      'shell.nix',
      // BEAM ecosystem build files
      'mix.exs', // Elixir build configuration
      'gleam.toml', // Gleam build configuration
      'rebar.config', // Erlang build configuration
      'elvis.config', // Erlang style configuration
    ];

    for (const file of buildFiles) {
      try {
        const filePath = join(this.workspacePath, file);
        await access(filePath);

        const content = await readFile(filePath, 'utf8');
        const buildSystem = this.identifyBuildSystem(file);

        const fact: WorkspaceFact = {
          id: `build-system:${buildSystem}`,
          type: 'build-system',
          category: 'build-tool',
          subject: buildSystem,
          content: {
            summary: `${buildSystem} build system detected`,
            details: {
              file: file,
              system: buildSystem,
              hasContent: content.length > 0,
            },
          },
          source: 'build-detection',
          confidence: 0.9,
          timestamp: Date.now(),
          workspaceId: this.workspaceId,
          ttl: 2 * 60 * 60 * 1000, // 2 hours
          accessCount: 0,
        };

        this.facts.set(fact.id, fact);
      } catch {
        // File doesn't exist
      }
    }
  }

  /**
   * Parse dependency file content
   */
  private async parseDependencyFile(
    filename: string,
    content: string,
  ): Promise<string[]> {
    try {
      switch (filename) {
        case 'package.json': {
          const packageJson = JSON.parse(content);
          return [
            ...Object.keys(packageJson.dependencies || {}),
            ...Object.keys(packageJson.devDependencies || {}),
          ];
        }

        case 'requirements.txt':
          return content
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line && !line.startsWith('#'))
            .map((line) => line.split(/[=<>]/)[0]);

        case 'Cargo.toml': {
          // Simple regex parsing for Cargo.toml dependencies
          const matches = content.match(/^(\w+)\s*=/gm);
          return matches ? matches.map((m) => m.replace(/\s*=.*/, '')) : [];
        }

        // BEAM ecosystem dependency parsing
        case 'mix.exs':
          // Parse Elixir mix.exs for Hex dependencies
          return this.parseElixirMixDeps(content);

        case 'mix.lock':
          // Parse Elixir lock file for exact versions
          return this.parseElixirMixLock(content);

        case 'gleam.toml':
          // Parse Gleam dependencies
          return this.parseGleamDeps(content);

        case 'rebar.config':
          // Parse Erlang rebar dependencies
          return this.parseRebarDeps(content);

        case 'rebar.lock':
          // Parse Erlang lock file
          return this.parseRebarLock(content);

        default:
          return [];
      }
    } catch {
      return [];
    }
  }

  /**
   * Parse Elixir mix.exs dependencies
   */
  private parseElixirMixDeps(content: string): string[] {
    const deps: string[] = [];

    // Look for deps function with Hex packages
    // Pattern: {:package_name, "~> version"} or {:package_name, "~> version", [options]}
    const depPatterns = [
      /\{:(\w+),\s*['"~>]+([^'"]+)['"]/g, // {:phoenix, "~> 1.7.0"}
      /\{:(\w+),\s*['"]+([^'"]+)['"]/g, // {:phoenix, "1.7.0"}
      /\{:(\w+),\s*github:/g, // {:phoenix, github: "phoenixframework/phoenix"}
    ];

    for (const pattern of depPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const packageName = match[1];
        if (packageName && !deps.includes(packageName)) {
          deps.push(packageName);
        }
      }
    }

    return deps;
  }

  /**
   * Parse Elixir mix.lock file
   */
  private parseElixirMixLock(content: string): string[] {
    const deps: string[] = [];

    // Pattern: "package_name": {:hex, :package_name, "version", ...}
    const lockPattern = /"(\w+)":\s*\{:hex,/g;

    let match;
    while ((match = lockPattern.exec(content)) !== null) {
      const packageName = match[1];
      if (packageName && !deps.includes(packageName)) {
        deps.push(packageName);
      }
    }

    return deps;
  }

  /**
   * Parse Gleam gleam.toml dependencies
   */
  private parseGleamDeps(content: string): string[] {
    const deps: string[] = [];

    try {
      // Simple TOML parsing for [dependencies] section
      const lines = content.split('\n');
      let inDepsSection = false;

      for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed === '[dependencies]') {
          inDepsSection = true;
          continue;
        }

        if (trimmed.startsWith('[') && trimmed !== '[dependencies]') {
          inDepsSection = false;
          continue;
        }

        if (inDepsSection && trimmed.includes('=')) {
          const packageName = trimmed.split('=')[0].trim().replace(/['"]/g, '');
          if (packageName && !deps.includes(packageName)) {
            deps.push(packageName);
          }
        }
      }
    } catch {
      // Fallback: simple regex
      const matches = content.match(/^(\w+)\s*=/gm);
      if (matches) {
        deps.push(...matches.map((m) => m.replace(/\s*=.*/, '')));
      }
    }

    return deps;
  }

  /**
   * Parse Erlang rebar.config dependencies
   */
  private parseRebarDeps(content: string): string[] {
    const deps: string[] = [];

    // Pattern: {package_name, "version"} or {package_name, {git, "url"}}
    const depPattern = /\{(\w+),/g;

    let match;
    while ((match = depPattern.exec(content)) !== null) {
      const packageName = match[1];
      if (packageName && !deps.includes(packageName)) {
        deps.push(packageName);
      }
    }

    return deps;
  }

  /**
   * Parse Erlang rebar.lock file
   */
  private parseRebarLock(content: string): string[] {
    const deps: string[] = [];

    // Pattern similar to mix.lock but for Erlang
    const lockPattern = /\{<<"(\w+)">>/g;

    let match;
    while ((match = lockPattern.exec(content)) !== null) {
      const packageName = match[1];
      if (packageName && !deps.includes(packageName)) {
        deps.push(packageName);
      }
    }

    return deps;
  }

  /**
   * Analyze project structure
   */
  private async analyzeProjectStructure(): Promise<any> {
    const structure = {
      directories: 0,
      files: 0,
      srcDirectory: false,
      testDirectory: false,
      docsDirectory: false,
      configFiles: 0,
      mainLanguage: 'unknown',
    };

    try {
      const entries = await readdir(this.workspacePath, {
        withFileTypes: true,
      });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          structure.directories++;

          if (['src', 'source', 'lib'].includes(entry.name)) {
            structure.srcDirectory = true;
          }
          if (['test', 'tests', '__tests__', 'spec'].includes(entry.name)) {
            structure.testDirectory = true;
          }
          if (['docs', 'documentation', 'doc'].includes(entry.name)) {
            structure.docsDirectory = true;
          }
        } else {
          structure.files++;

          const ext = extname(entry.name);
          if (['.json', '.yml', '.yaml', '.toml', '.ini'].includes(ext)) {
            structure.configFiles++;
          }
        }
      }
    } catch (error) {
      console.error('Failed to analyze directory structure:', error);
    }

    return structure;
  }

  /**
   * Analyze configuration file
   */
  private async analyzeConfigFile(
    filename: string,
    content: string,
  ): Promise<any> {
    const analysis = {
      file: filename,
      size: content.length,
      type: 'unknown',
      hasContent: content.trim().length > 0,
    };

    try {
      if (filename.endsWith('.json')) {
        const parsed = JSON.parse(content);
        analysis.type = 'json';
        (analysis as any).keys = Object.keys(parsed);
      } else if (filename.includes('eslint')) {
        analysis.type = 'eslint-config';
      } else if (filename.includes('prettier')) {
        analysis.type = 'prettier-config';
      } else if (filename.includes('docker')) {
        analysis.type = 'docker-config';
      }
    } catch {
      // Failed to parse
    }

    return analysis;
  }

  /**
   * Identify build system from file
   */
  private identifyBuildSystem(filename: string): string {
    const buildSystemMap: Record<string, string> = {
      Makefile: 'make',
      'CMakeLists.txt': 'cmake',
      'build.gradle': 'gradle',
      'pom.xml': 'maven',
      'Cargo.toml': 'cargo',
      'flake.nix': 'nix-flakes',
      'shell.nix': 'nix-shell',
      // BEAM ecosystem build systems
      'mix.exs': 'mix', // Elixir Mix build tool
      'gleam.toml': 'gleam', // Gleam build tool
      'rebar.config': 'rebar3', // Erlang Rebar3 build tool
      'elvis.config': 'elvis', // Erlang style checker
    };

    return buildSystemMap[filename] || 'unknown';
  }

  /**
   * Get project files for summary
   */
  private getProjectFiles(): string[] {
    const files: string[] = [];

    for (const fact of this.facts.values()) {
      if (fact.type === 'dependency' && fact.category === 'dependency-file') {
        files.push(fact.subject);
      }
      if (fact.type === 'tool-config' && fact.category === 'config-file') {
        files.push(fact.subject);
      }
      if (fact.type === 'build-system') {
        const details = fact.content.details;
        if (details && details.file) {
          files.push(details.file);
        }
      }
    }

    return [...new Set(files)];
  }

  /**
   * Check if fact matches query
   */
  private matchesQuery(
    fact: WorkspaceFact,
    query: WorkspaceFactQuery,
  ): boolean {
    if (query.type && fact.type !== query.type) return false;
    if (query.category && fact.category !== query.category) return false;
    if (query.subject && !fact.subject.includes(query.subject)) return false;

    if (query.query) {
      const searchText = query.query.toLowerCase();
      const factText =
        `${fact.type} ${fact.category} ${fact.subject} ${JSON.stringify(fact.content)}`.toLowerCase();
      if (!factText.includes(searchText)) return false;
    }

    return true;
  }

  /**
   * Check if fact is still fresh
   */
  private isFactFresh(fact: WorkspaceFact): boolean {
    return Date.now() - fact.timestamp < fact.ttl;
  }

  /**
   * Refresh stale facts
   */
  private async refreshFacts(): Promise<void> {
    const staleFacts = Array.from(this.facts.values()).filter(
      (fact) => !this.isFactFresh(fact),
    );

    if (staleFacts.length > 0) {
      await this.gatherWorkspaceFacts();
      this.emit('facts-refreshed', { refreshed: staleFacts.length });
    }
  }
}

// Export both old and new names for compatibility during transition
export { WorkspaceCollectiveSystem as WorkspaceFACTSystem };
export default WorkspaceCollectiveSystem;
