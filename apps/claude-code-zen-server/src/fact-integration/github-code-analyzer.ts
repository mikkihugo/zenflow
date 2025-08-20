/**
 * GitHub Repository Code Analyzer for FACT System
 *
 * Analyzes GitHub repositories to extract snippets, examples, and patterns
 * for the FACT knowledge database. Supports BEAM ecosystem and general projects.
 */

import { basename, extname } from 'node:path';

import { Octokit } from '@octokit/rest';

export interface GitHubRepoInfo {
  owner: string;
  repo: string;
  branch?: string;
  path?: string;
}

export interface CodeSnippet {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  filePath: string;
  repoUrl: string;
  tags: string[];
  category: 'example' | 'config' | 'pattern' | 'test' | 'documentation';
  complexity: 'basic' | 'intermediate' | 'advanced';
  dependencies?: string[];
  metadata?: {
    lines: number;
    author?: string;
    lastModified?: string;
    stars?: number;
    license?: string;
  };
}

export interface ProjectPattern {
  name: string;
  description: string;
  files: Array<{
    path: string;
    purpose: string;
    content: string;
  }>;
  setup: string[];
  usage: string[];
  ecosystem: 'beam' | 'nodejs' | 'rust' | 'python' | 'general';
}

/**
 * Analyzes GitHub repositories for code snippets and patterns
 */
export class GitHubCodeAnalyzer {
  private octokit: Octokit;
  private rateLimitRemaining = 5000;
  private rateLimitResetTime = 0;

  constructor(token?: string) {
    this.octokit = new Octokit({
      auth: token || process.env.GITHUB_TOKEN,
    });
  }

  /**
   * Analyze a GitHub repository for code snippets and examples
   */
  async analyzeRepository(repoInfo: GitHubRepoInfo): Promise<{
    snippets: CodeSnippet[];
    patterns: ProjectPattern[];
    repoMetadata: {
      name: string;
      description: string;
      language: string;
      stars: number;
      license: string;
      topics: string[];
      lastUpdate: string;
    };
  }> {
    try {
      // Get repository metadata
      const { data: repo } = await this.octokit.repos.get({
        owner: repoInfo.owner,
        repo: repoInfo.repo,
      });

      const repoMetadata = {
        name: repo.full_name,
        description: repo.description || '',
        language: repo.language || 'unknown',
        stars: repo.stargazers_count,
        license: repo.license?.name || 'unknown',
        topics: repo.topics || [],
        lastUpdate: repo.updated_at,
      };

      // Get repository tree
      const { data: tree } = await this.octokit.git.getTree({
        owner: repoInfo.owner,
        repo: repoInfo.repo,
        tree_sha: repoInfo.branch || repo.default_branch,
        recursive: 'true',
      });

      // Filter interesting files
      const interestingFiles = tree.tree.filter(
        (item) =>
          item.type === 'blob' && this.isInterestingFile(item.path || '')
      );

      const snippets: CodeSnippet[] = [];
      const patterns: ProjectPattern[] = [];

      // Analyze files in batches to respect rate limits
      const batchSize = 10;
      for (let i = 0; i < interestingFiles.length; i += batchSize) {
        const batch = interestingFiles.slice(i, i + batchSize);
        const batchResults = await Promise.allSettled(
          batch.map((file) => this.analyzeFile(repoInfo, file, repoMetadata))
        );

        for (const result of batchResults) {
          if (result.status === 'fulfilled' && result.value) {
            snippets.push(...result.value.snippets);
            if (result.value.pattern) {
              patterns.push(result.value.pattern);
            }
          }
        }

        // Rate limit check
        await this.checkRateLimit();
      }

      // Detect common project patterns
      const detectedPatterns = await this.detectProjectPatterns(
        repoInfo,
        tree.tree,
        repoMetadata
      );
      patterns.push(...detectedPatterns);

      return {
        snippets: this.deduplicateSnippets(snippets),
        patterns: this.deduplicatePatterns(patterns),
        repoMetadata,
      };
    } catch (error) {
      console.error(
        `Failed to analyze repository ${repoInfo.owner}/${repoInfo.repo}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Analyze repositories for specific BEAM packages from Hex
   */
  async analyzeHexPackageRepos(
    packageName: string,
    version: string
  ): Promise<{
    officialRepo?: CodeSnippet[];
    exampleRepos: CodeSnippet[];
    tutorialRepos: CodeSnippet[];
    patterns: ProjectPattern[];
  }> {
    // Search for repositories related to the Hex package
    const searchQueries = [
      `${packageName} language:elixir`,
      `${packageName} phoenix example`,
      `${packageName} tutorial elixir`,
      `"${packageName}" in:readme language:elixir`,
    ];

    const allSnippets: CodeSnippet[] = [];
    const allPatterns: ProjectPattern[] = [];
    let officialRepo: CodeSnippet[] | undefined;

    for (const query of searchQueries) {
      try {
        const { data: searchResults } = await this.octokit.search.repos({
          q: query,
          sort: 'stars',
          order: 'desc',
          per_page: 10,
        });

        for (const repo of searchResults.items) {
          const repoInfo = {
            owner: repo.owner.login,
            repo: repo.name,
          };

          try {
            const analysis = await this.analyzeRepository(repoInfo);

            // Check if this is the official repository
            if (
              repo.full_name
                .toLowerCase()
                .includes(packageName.toLowerCase()) ||
              repo.description?.toLowerCase().includes('official')
            ) {
              officialRepo = analysis.snippets;
            }

            allSnippets.push(...analysis.snippets);
            allPatterns.push(...analysis.patterns);

            await this.checkRateLimit();
          } catch (error) {
            console.warn(`Failed to analyze ${repo.full_name}:`, error);
          }
        }
      } catch (error) {
        console.warn(`Search failed for query "${query}":`, error);
      }
    }

    return {
      officialRepo,
      exampleRepos: this.filterSnippetsByCategory(allSnippets, 'example'),
      tutorialRepos: this.filterSnippetsByCategory(
        allSnippets,
        'documentation'
      ),
      patterns: this.deduplicatePatterns(allPatterns),
    };
  }

  /**
   * Extract GitHub dependencies from project files
   */
  extractGitHubDependencies(
    content: string,
    fileType: 'mix.exs' | 'package.json' | 'Cargo.toml'
  ): Array<{
    name: string;
    repo: string;
    ref?: string;
    subdir?: string;
  }> {
    const githubDeps: Array<{
      name: string;
      repo: string;
      ref?: string;
      subdir?: string;
    }> = [];

    switch (fileType) {
      case 'mix.exs': {
        // Pattern: {:package, github: "owner/repo", ref: "branch", subdir: "path"}
        const elixirGitPattern =
          /{:(\w+),\s*github:\s*["']([\w-]+\/([\w-]+))["']\s*(?:,\s*ref:\s*["']([^"']+)["'])?\s*(?:,\s*subdir:\s*["']([^"']+)["'])?\s*}/g;
        let elixirMatch;
        while ((elixirMatch = elixirGitPattern.exec(content)) !== null) {
          githubDeps.push({
            name: elixirMatch[1],
            repo: elixirMatch[2],
            ref: elixirMatch[4],
            subdir: elixirMatch[5],
          });
        }
        break;
      }

      case 'package.json':
        try {
          const packageJson = JSON.parse(content);
          const deps = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies,
          };

          for (const [name, version] of Object.entries(deps)) {
            if (typeof version === 'string' && version.includes('github:')) {
              const githubUrl = version.replace('github:', '');
              githubDeps.push({ name, repo: githubUrl });
            }
          }
        } catch {
          // Not valid JSON, skip
        }
        break;

      case 'Cargo.toml': {
        // Pattern: package = { git = "https://github.com/owner/repo", branch = "main" }
        const cargoGitPattern =
          /(\w+)\s*=\s*{\s*git\s*=\s*["'](https:\/\/github\.com\/([\w-]+\/([\w-]+)))["']\s*(?:,\s*branch\s*=\s*["']([^"']+)["'])?\s*}/g;
        let cargoMatch;
        while ((cargoMatch = cargoGitPattern.exec(content)) !== null) {
          githubDeps.push({
            name: cargoMatch[1],
            repo: cargoMatch[4],
            ref: cargoMatch[5],
          });
        }
        break;
      }
    }

    return githubDeps;
  }

  /**
   * Generate FACT-compatible knowledge entries from analyzed repositories
   */
  generateFACTEntries(
    toolName: string,
    version: string,
    analysis: Awaited<ReturnType<typeof this.analyzeHexPackageRepos>>
  ): {
    documentation: string;
    snippets: Array<{ title: string; code: string; description: string }>;
    examples: Array<{ title: string; code: string; explanation: string }>;
    bestPractices: Array<{ practice: string; rationale: string }>;
    troubleshooting: Array<{ issue: string; solution: string }>;
  } {
    const snippets = analysis.officialRepo || analysis.exampleRepos;

    return {
      documentation: `GitHub-sourced documentation and examples for ${toolName}@${version}`,
      snippets: snippets
        .filter((s) => s.category === 'example')
        .map((s) => ({
          title: s.title,
          code: s.code,
          description: s.description,
        })),
      examples: snippets
        .filter((s) => s.category === 'pattern')
        .map((s) => ({
          title: s.title,
          code: s.code,
          explanation: s.description,
        })),
      bestPractices: analysis.patterns.map((p) => ({
        practice: p.name,
        rationale: p.description,
      })),
      troubleshooting: snippets
        .filter((s) => s.tags.includes('troubleshooting'))
        .map((s) => ({
          issue: s.title,
          solution: s.code,
        })),
    };
  }

  // Private helper methods

  private isInterestingFile(path: string): boolean {
    const interestingExtensions = [
      '.ex',
      '.exs', // Elixir
      '.erl',
      '.hrl', // Erlang
      '.gleam', // Gleam
      '.rs', // Rust
      '',
      '', // JavaScript/TypeScript
      '.py', // Python
      '.md', // Documentation
      '.yml',
      '.yaml', // Config
      '.toml',
      '.json', // Config
    ];

    const interestingPaths = [
      'examples/',
      'example/',
      'demo/',
      'samples/',
      'tutorials/',
      'guides/',
      'docs/',
      'lib/',
      'src/',
      'priv/',
      'config/',
      'test/',
      'spec/',
    ];

    const ext = extname(path);
    const pathLower = path.toLowerCase();

    return (
      interestingExtensions.includes(ext) &&
      (interestingPaths.some((p) => pathLower.includes(p)) ||
        pathLower.includes('readme') ||
        pathLower.includes('example') ||
        pathLower.includes('tutorial'))
    );
  }

  private async analyzeFile(
    repoInfo: GitHubRepoInfo,
    file: unknown,
    repoMetadata: unknown
  ): Promise<{
    snippets: CodeSnippet[];
    pattern?: ProjectPattern;
  } | null> {
    try {
      const { data: fileData } = await this.octokit.repos.getContent({
        owner: repoInfo.owner,
        repo: repoInfo.repo,
        path: file.path,
      });

      if ('content' in fileData) {
        const content = Buffer.from(fileData.content, 'base64').toString(
          'utf-8'
        );
        const language = this.detectLanguage(file.path);

        if (content.length > 50000) {
          // Skip very large files
          return null;
        }

        const snippets = this.extractSnippetsFromFile(
          content,
          file.path,
          language,
          repoMetadata
        );

        return { snippets };
      }
    } catch (error) {
      // File too large or other error
      return null;
    }

    return null;
  }

  private extractSnippetsFromFile(
    content: string,
    filePath: string,
    language: string,
    repoMetadata: unknown
  ): CodeSnippet[] {
    const snippets: CodeSnippet[] = [];
    const fileName = basename(filePath);

    // Extract different types of snippets based on file type
    if (filePath.includes('example') || filePath.includes('demo')) {
      // Full file as example
      snippets.push({
        id: `${repoMetadata.name}:${filePath}`,
        title: `${fileName} - ${repoMetadata.name}`,
        description: `Example from ${repoMetadata.description}`,
        code: content,
        language,
        filePath,
        repoUrl: `https://github.com/${repoMetadata.name}`,
        tags: ['example', 'github', language],
        category: 'example',
        complexity: this.estimateComplexity(content),
        metadata: {
          lines: content.split('\n').length,
          stars: repoMetadata.stars,
          license: repoMetadata.license,
        },
      });
    }

    // Extract function/module snippets for BEAM languages
    if (language === 'elixir') {
      const functions = this.extractElixirFunctions(content);
      for (const func of functions) {
        snippets.push({
          id: `${repoMetadata.name}:${filePath}:${func.name}`,
          title: `${func.name} - Elixir Function`,
          description:
            func.doc || `Function ${func.name} from ${repoMetadata.name}`,
          code: func.code,
          language: 'elixir',
          filePath,
          repoUrl: `https://github.com/${repoMetadata.name}`,
          tags: ['function', 'elixir', 'github'],
          category: 'pattern',
          complexity: this.estimateComplexity(func.code),
          metadata: {
            lines: func.code.split('\n').length,
            stars: repoMetadata.stars,
            license: repoMetadata.license,
          },
        });
      }
    }

    return snippets;
  }

  private extractElixirFunctions(content: string): Array<{
    name: string;
    code: string;
    doc?: string;
  }> {
    const functions: Array<{ name: string; code: string; doc?: string }> = [];

    // Pattern for Elixir functions with optional documentation
    const funcPattern =
      /(?:@doc\s+["']([^"']+)["']\s+)?def\s+(\w+)(?:\([^)]*\))?\s+do\s*(.*?)\s+end/gms;

    let match;
    while ((match = funcPattern.exec(content)) !== null) {
      functions.push({
        name: match[2],
        code: match[0],
        doc: match[1],
      });
    }

    return functions;
  }

  private detectLanguage(filePath: string): string {
    const ext = extname(filePath);
    const langMap: Record<string, string> = {
      '.ex': 'elixir',
      '.exs': 'elixir',
      '.erl': 'erlang',
      '.hrl': 'erlang',
      '.gleam': 'gleam',
      '.rs': 'rust',
      '': 'javascript',
      '': 'typescript',
      '.py': 'python',
      '.md': 'markdown',
    };
    return langMap[ext] || 'text';
  }

  private estimateComplexity(
    code: string
  ): 'basic' | 'intermediate' | 'advanced' {
    const lines = code.split('\n').length;
    const complexPatterns = [
      /GenServer/,
      /Supervisor/,
      /Task\./,
      /Agent\./, // Elixir OTP
      /async/,
      /await/,
      /Task\./,
      /Stream\./, // Async patterns
      /Ecto\./,
      /Phoenix\./,
      /Plug\./, // Framework usage
    ];

    const complexityScore = complexPatterns.filter((pattern) =>
      pattern.test(code)
    ).length;

    if (lines < 20 && complexityScore === 0) return 'basic';
    if (lines < 100 && complexityScore < 3) return 'intermediate';
    return 'advanced';
  }

  private async detectProjectPatterns(
    repoInfo: GitHubRepoInfo,
    tree: unknown[],
    repoMetadata: unknown
  ): Promise<ProjectPattern[]> {
    const patterns: ProjectPattern[] = [];

    // Detect Phoenix project pattern
    if (
      tree.some((file) => file.path === 'mix.exs') &&
      tree.some((file) => file.path?.includes('phoenix'))
    ) {
      patterns.push({
        name: 'Phoenix Web Application',
        description: 'Standard Phoenix web application structure',
        files: tree
          .filter((f) => f.path?.match(/\.(ex|exs|eex)$/))
          .map((f) => ({
            path: f.path,
            purpose: this.inferFilePurpose(f.path),
            content: '', // Would need separate API calls to get content
          })),
        setup: ['mix deps.get', 'mix ecto.setup', 'mix phx.server'],
        usage: [
          'Visit http://localhost:4000',
          'Start with lib/my_app_web/router.ex for routing',
          'Add controllers in lib/my_app_web/controllers/',
        ],
        ecosystem: 'beam',
      });
    }

    return patterns;
  }

  private inferFilePurpose(filePath: string): string {
    if (filePath.includes('controller')) return 'HTTP request handling';
    if (filePath.includes('model') || filePath.includes('schema'))
      return 'Data modeling';
    if (filePath.includes('view')) return 'View rendering';
    if (filePath.includes('router')) return 'URL routing';
    if (filePath.includes('test')) return 'Testing';
    if (filePath.includes('config')) return 'Configuration';
    return 'Application logic';
  }

  private async checkRateLimit(): Promise<void> {
    try {
      const { data: rateLimit } = await this.octokit.rateLimit.get();
      this.rateLimitRemaining = rateLimit.rate.remaining;
      this.rateLimitResetTime = rateLimit.rate.reset * 1000;

      if (this.rateLimitRemaining < 10) {
        const waitTime = this.rateLimitResetTime - Date.now();
        if (waitTime > 0) {
          console.log(
            `Rate limit low (${this.rateLimitRemaining}), waiting ${waitTime}ms`
          );
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }
    } catch (error) {
      // Rate limit check failed, add small delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  private deduplicateSnippets(snippets: CodeSnippet[]): CodeSnippet[] {
    const seen = new Set<string>();
    return snippets.filter((snippet) => {
      const key = `${snippet.title}:${snippet.code.slice(0, 100)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private deduplicatePatterns(patterns: ProjectPattern[]): ProjectPattern[] {
    const seen = new Set<string>();
    return patterns.filter((pattern) => {
      if (seen.has(pattern.name)) return false;
      seen.add(pattern.name);
      return true;
    });
  }

  private filterSnippetsByCategory(
    snippets: CodeSnippet[],
    category: CodeSnippet['category']
  ): CodeSnippet[] {
    return snippets.filter((s) => s.category === category);
  }
}

export default GitHubCodeAnalyzer;
