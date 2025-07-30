/**
 * GitHub Integration Plugin (TypeScript)
 * Advanced repository management, analysis, and automation with type safety
 */

import { BasePlugin } from '../base-plugin.js';
import {
  PluginManifest,
  PluginConfig,
  PluginContext,
  JSONObject
} from '../../types/plugin.js';
import { performance } from 'perf_hooks';

// GitHub API types
interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: GitHubUser;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  clone_url: string;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  license: GitHubLicense | null;
  default_branch: string;
}

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  html_url: string;
  type: 'User' | 'Organization';
  company: string | null;
  location: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

interface GitHubLicense {
  key: string;
  name: string;
  spdx_id: string;
  url: string | null;
}

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  user: GitHubUser;
  assignees: GitHubUser[];
  labels: GitHubLabel[];
  milestone: GitHubMilestone | null;
  pull_request?: {
    url: string;
    html_url: string;
    diff_url: string;
    patch_url: string;
  };
}

interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  user: GitHubUser;
  assignees: GitHubUser[];
  requested_reviewers: GitHubUser[];
  labels: GitHubLabel[];
  milestone: GitHubMilestone | null;
  head: GitHubBranch;
  base: GitHubBranch;
  draft: boolean;
  mergeable: boolean | null;
  additions: number;
  deletions: number;
  changed_files: number;
}

interface GitHubLabel {
  id: number;
  name: string;
  color: string;
  description: string | null;
}

interface GitHubMilestone {
  id: number;
  number: number;
  title: string;
  description: string | null;
  state: 'open' | 'closed';
  due_on: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

interface GitHubBranch {
  ref: string;
  sha: string;
  repo: GitHubRepository;
  user: GitHubUser;
}

interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
    tree: {
      sha: string;
    };
  };
  author: GitHubUser | null;
  committer: GitHubUser | null;
  parents: Array<{ sha: string; url: string }>;
  stats?: {
    total: number;
    additions: number;
    deletions: number;
  };
  files?: Array<{
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    changes: number;
    patch?: string;
  }>;
}

interface GitHubContent {
  type: 'file' | 'dir';
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  content?: string;
  encoding?: string;
}

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}

// Analysis result types
interface RepositoryAnalysis {
  repository: GitHubRepository;
  timestamp: string;
  analysis_depth: 'basic' | 'standard' | 'deep';
  metrics: {
    basic: BasicMetrics;
  };
  technology?: TechnologyStack;
  issues?: IssueAnalysis;
  pullRequests?: PullRequestAnalysis;
  commits?: CommitAnalysis;
  contributors?: ContributorAnalysis;
  health?: HealthScore;
}

interface BasicMetrics {
  stars: number;
  forks: number;
  watchers: number;
  open_issues: number;
  size_kb: number;
  primary_language: string | null;
  created: string;
  updated: string;
  archived: boolean;
  private: boolean;
}

interface TechnologyStack {
  languages: Record<string, string>;
  primary_language: string;
  detected_frameworks: string[];
  build_tools: string[];
  package_managers: string[];
  config_files: string[];
}

interface IssueAnalysis {
  total: number;
  open: number;
  closed: number;
  average_close_time_days: number;
  labels_usage: Record<string, number>;
  recent_activity: Array<{
    date: string;
    opened: number;
    closed: number;
  }>;
}

interface PullRequestAnalysis {
  total: number;
  open: number;
  closed: number;
  merged: number;
  average_merge_time_days: number;
  average_size: {
    additions: number;
    deletions: number;
    files: number;
  };
  recent_activity: Array<{
    date: string;
    opened: number;
    merged: number;
    closed: number;
  }>;
}

interface CommitAnalysis {
  total_commits: number;
  recent_commits: number;
  commit_frequency: Record<string, number>;
  top_contributors: Array<{
    author: string;
    commits: number;
    additions: number;
    deletions: number;
  }>;
  activity_timeline: Array<{
    date: string;
    commits: number;
    additions: number;
    deletions: number;
  }>;
}

interface ContributorAnalysis {
  total_contributors: number;
  active_contributors: number;
  top_contributors: Array<{
    login: string;
    name: string | null;
    contributions: number;
    avatar_url: string;
  }>;
  contributor_distribution: {
    core_contributors: number; // >20% of commits
    regular_contributors: number; // 5-20% of commits
    occasional_contributors: number; // <5% of commits
  };
}

interface HealthScore {
  overall_score: number;
  factors: {
    activity: number;
    community: number;
    maintenance: number;
    documentation: number;
    testing: number;
  };
  recommendations: string[];
}

interface GitHubPluginConfig {
  token?: string;
  baseUrl: string;
  requestTimeout: number;
  cacheTTL: number;
  maxConcurrentRequests: number;
  analysisDepth: 'basic' | 'standard' | 'deep';
  enableWebhooks: boolean;
  webhook: {
    secret?: string;
    events: string[];
  };
}

export class GitHubIntegrationPlugin extends BasePlugin {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private rateLimitInfo: RateLimitInfo | null = null;
  private requestQueue: Array<() => void> = [];
  private activeRequests: number = 0;

  constructor(manifest: PluginManifest, config: PluginConfig, context: PluginContext) {
    super(manifest, config, context);
  }

  protected async onInitialize(): Promise<void> {
    this.context.apis.logger.info('GitHub Integration Plugin initializing');

    const pluginConfig: GitHubPluginConfig = {
      token: this.config.settings.token || process.env.GITHUB_TOKEN,
      baseUrl: this.config.settings.baseUrl || 'https://api.github.com',
      requestTimeout: this.config.settings.requestTimeout || 30000,
      cacheTTL: this.config.settings.cacheTTL || 300000, // 5 minutes
      maxConcurrentRequests: this.config.settings.maxConcurrentRequests || 10,
      analysisDepth: this.config.settings.analysisDepth || 'standard',
      enableWebhooks: this.config.settings.enableWebhooks || false,
      webhook: {
        secret: this.config.settings.webhook?.secret || process.env.GITHUB_WEBHOOK_SECRET,
        events: this.config.settings.webhook?.events || ['push', 'pull_request', 'issues', 'release']
      }
    };

    // Store config back
    Object.assign(this.config.settings, pluginConfig);

    if (!pluginConfig.token) {
      this.context.apis.logger.warn('No GitHub token provided. Some features will be limited.');
      return;
    }

    // Test authentication
    try {
      const user = await this.makeRequest<GitHubUser>('/user');
      this.context.apis.logger.info('GitHub authenticated', { 
        user: user.login, 
        name: user.name 
      });

      // Get rate limit info
      await this.updateRateLimitInfo();

    } catch (error: any) {
      this.context.apis.logger.error('GitHub authentication failed', error);
      throw new Error(`GitHub authentication failed: ${error.message}`);
    }
  }

  protected async onStart(): Promise<void> {
    // Register APIs
    await this.registerAPI('github-integration', {
      name: 'github-integration',
      version: this.manifest.version,
      description: 'GitHub repository management, analysis, and automation',
      methods: [
        {
          name: 'analyzeRepository',
          description: 'Perform comprehensive repository analysis',
          parameters: [
            { name: 'owner', type: 'string', required: true, description: 'Repository owner' },
            { name: 'repo', type: 'string', required: true, description: 'Repository name' },
            { name: 'options', type: 'object', required: false, description: 'Analysis options' }
          ],
          returns: { type: 'object', description: 'Repository analysis results' },
          async: true,
          permissions: ['github:read'],
          public: true,
          authenticated: true,
          timeout: 60000,
          caching: true,
          cacheTTL: 300,
          examples: [{
            name: 'Analyze repository',
            description: 'Analyze a GitHub repository',
            request: { owner: 'octocat', repo: 'Hello-World' },
            response: { analysis: 'Repository analysis results...' }
          }]
        },
        {
          name: 'getRepository',
          description: 'Get repository information',
          parameters: [
            { name: 'owner', type: 'string', required: true, description: 'Repository owner' },
            { name: 'repo', type: 'string', required: true, description: 'Repository name' }
          ],
          returns: { type: 'object', description: 'Repository information' },
          async: true,
          permissions: ['github:read'],
          public: true,
          authenticated: true,
          timeout: 10000,
          caching: true,
          cacheTTL: 300,
          examples: []
        },
        {
          name: 'searchRepositories',
          description: 'Search for repositories',
          parameters: [
            { name: 'query', type: 'string', required: true, description: 'Search query' },
            { name: 'options', type: 'object', required: false, description: 'Search options' }
          ],
          returns: { type: 'object', description: 'Search results' },
          async: true,
          permissions: ['github:read'],
          public: true,
          authenticated: false,
          timeout: 15000,
          caching: true,
          cacheTTL: 600,
          examples: []
        }
      ]
    });

    // Register hooks
    await this.registerHook('pre-task', async (context) => {
      // Could enhance tasks with GitHub integration
      return {
        success: true,
        continue: true,
        stop: false,
        skip: false,
        executionTime: 0,
        resourcesUsed: await this.getResourceUsage()
      };
    });
  }

  protected async onStop(): Promise<void> {
    // Clear request queue
    this.requestQueue = [];
    
    // Persist cache if needed
    // Implementation would persist important cache data
  }

  protected async onDestroy(): Promise<void> {
    // Clear all state
    this.cache.clear();
    this.requestQueue = [];
    this.rateLimitInfo = null;
  }

  // Public API Methods

  /**
   * Repository Analysis - Deep repository insights
   */
  async analyzeRepository(owner: string, repo: string, options: Partial<{
    includeIssues: boolean;
    includePRs: boolean;
    includeCommits: boolean;
    includeContributors: boolean;
    includeTechnology: boolean;
    includeHealth: boolean;
    timeRange: number;
  }> = {}): Promise<RepositoryAnalysis> {
    const analysisOptions = {
      includeIssues: true,
      includePRs: true,
      includeCommits: true,
      includeContributors: true,
      includeTechnology: true,
      includeHealth: true,
      timeRange: 90, // days
      ...options
    };

    this.context.apis.logger.info('Analyzing repository', { owner, repo });

    const analysis: RepositoryAnalysis = {
      repository: await this.getRepository(owner, repo),
      timestamp: new Date().toISOString(),
      analysis_depth: this.config.settings.analysisDepth as 'basic' | 'standard' | 'deep',
      metrics: {
        basic: {} as BasicMetrics
      }
    };

    // Basic repository information
    const repoData = analysis.repository;
    analysis.metrics.basic = {
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      watchers: repoData.watchers_count,
      open_issues: repoData.open_issues_count,
      size_kb: repoData.size,
      primary_language: repoData.language,
      created: repoData.created_at,
      updated: repoData.updated_at,
      archived: repoData.archived,
      private: repoData.private
    };

    // Technology stack analysis
    if (analysisOptions.includeTechnology) {
      analysis.technology = await this.analyzeTechnologyStack(owner, repo);
    }

    // Issue analysis
    if (analysisOptions.includeIssues) {
      analysis.issues = await this.analyzeIssues(owner, repo, analysisOptions.timeRange);
    }

    // Pull request analysis
    if (analysisOptions.includePRs) {
      analysis.pullRequests = await this.analyzePullRequests(owner, repo, analysisOptions.timeRange);
    }

    // Commit activity analysis
    if (analysisOptions.includeCommits) {
      analysis.commits = await this.analyzeCommitActivity(owner, repo, analysisOptions.timeRange);
    }

    // Contributor analysis
    if (analysisOptions.includeContributors) {
      analysis.contributors = await this.analyzeContributors(owner, repo);
    }

    // Repository health score
    if (analysisOptions.includeHealth) {
      analysis.health = this.calculateHealthScore(analysis);
    }

    return analysis;
  }

  /**
   * Get repository information
   */
  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    return await this.makeRequest<GitHubRepository>(`/repos/${owner}/${repo}`);
  }

  /**
   * Search repositories
   */
  async searchRepositories(query: string, options: Partial<{
    sort: 'stars' | 'forks' | 'help-wanted-issues' | 'updated';
    order: 'asc' | 'desc';
    per_page: number;
    page: number;
  }> = {}): Promise<{
    total_count: number;
    incomplete_results: boolean;
    items: GitHubRepository[];
  }> {
    const searchOptions = {
      sort: 'stars',
      order: 'desc',
      per_page: 30,
      page: 1,
      ...options
    };

    const params = new URLSearchParams({
      q: query,
      sort: searchOptions.sort,
      order: searchOptions.order,
      per_page: searchOptions.per_page.toString(),
      page: searchOptions.page.toString()
    });

    return await this.makeRequest<{
      total_count: number;
      incomplete_results: boolean;
      items: GitHubRepository[];
    }>(`/search/repositories?${params}`);
  }

  /**
   * Get repository issues
   */
  async getIssues(owner: string, repo: string, options: Partial<{
    state: 'open' | 'closed' | 'all';
    labels: string;
    sort: 'created' | 'updated' | 'comments';
    direction: 'asc' | 'desc';
    since: string;
    per_page: number;
    page: number;
  }> = {}): Promise<GitHubIssue[]> {
    const issueOptions = {
      state: 'open',
      sort: 'created',
      direction: 'desc',
      per_page: 100,
      page: 1,
      ...options
    };

    const params = new URLSearchParams(
      Object.entries(issueOptions).map(([key, value]) => [key, value.toString()])
    );

    return await this.makeRequest<GitHubIssue[]>(`/repos/${owner}/${repo}/issues?${params}`);
  }

  // Private helper methods

  /**
   * Technology Stack Analysis
   */
  private async analyzeTechnologyStack(owner: string, repo: string): Promise<TechnologyStack> {
    try {
      // Get languages
      const languages = await this.makeRequest<Record<string, number>>(`/repos/${owner}/${repo}/languages`);
      const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);

      const languagePercentages: Record<string, string> = {};
      for (const [lang, bytes] of Object.entries(languages)) {
        languagePercentages[lang] = ((bytes / totalBytes) * 100).toFixed(2);
      }

      // Get repository contents to analyze tech stack
      const contents = await this.getContents(owner, repo, '');
      const techStack = this.detectTechnologyStack(contents);

      return {
        languages: languagePercentages,
        primary_language: Object.keys(languagePercentages)[0] || 'Unknown',
        detected_frameworks: techStack.frameworks,
        build_tools: techStack.buildTools,
        package_managers: techStack.packageManagers,
        config_files: techStack.configFiles
      };
    } catch (error: any) {
      this.context.apis.logger.warn('Failed to analyze technology stack', { error: error.message });
      return {
        languages: {},
        primary_language: 'Unknown',
        detected_frameworks: [],
        build_tools: [],
        package_managers: [],
        config_files: []
      };
    }
  }

  /**
   * Detect technology stack from repository contents
   */
  private detectTechnologyStack(contents: GitHubContent[]): {
    frameworks: string[];
    buildTools: string[];
    packageManagers: string[];
    configFiles: string[];
  } {
    const frameworks: string[] = [];
    const buildTools: string[] = [];
    const packageManagers: string[] = [];
    const configFiles: string[] = [];

    const detectionRules: Record<string, () => void> = {
      'package.json': () => packageManagers.push('npm'),
      'yarn.lock': () => packageManagers.push('yarn'),
      'pnpm-lock.yaml': () => packageManagers.push('pnpm'),
      'Cargo.toml': () => packageManagers.push('cargo'),
      'requirements.txt': () => packageManagers.push('pip'),
      'Pipfile': () => packageManagers.push('pipenv'),
      'poetry.lock': () => packageManagers.push('poetry'),
      'go.mod': () => packageManagers.push('go modules'),
      'composer.json': () => packageManagers.push('composer'),
      'Dockerfile': () => buildTools.push('Docker'),
      'docker-compose.yml': () => buildTools.push('Docker Compose'),
      'Makefile': () => buildTools.push('Make'),
      'webpack.config.js': () => buildTools.push('Webpack'),
      'vite.config.js': () => buildTools.push('Vite'),
      'rollup.config.js': () => buildTools.push('Rollup'),
      'next.config.js': () => frameworks.push('Next.js'),
      'nuxt.config.js': () => frameworks.push('Nuxt.js'),
      'gatsby-config.js': () => frameworks.push('Gatsby'),
      'svelte.config.js': () => frameworks.push('Svelte'),
      '.eslintrc': () => configFiles.push('ESLint'),
      'tsconfig.json': () => configFiles.push('TypeScript'),
      'tailwind.config.js': () => frameworks.push('Tailwind CSS'),
      '.github': () => configFiles.push('GitHub Actions'),
      'ci.yml': () => configFiles.push('CI/CD')
    };

    for (const file of contents) {
      const fileName = file.name.toLowerCase();
      const rule = detectionRules[fileName] || detectionRules[file.name];
      if (rule) {
        rule();
      }
    }

    return { frameworks, buildTools, packageManagers, configFiles };
  }

  /**
   * Analyze repository issues
   */
  private async analyzeIssues(owner: string, repo: string, timeRangeDays: number): Promise<IssueAnalysis> {
    try {
      // Get issues from the specified time range
      const since = new Date(Date.now() - timeRangeDays * 24 * 60 * 60 * 1000).toISOString();
      const allIssues = await this.getIssues(owner, repo, { state: 'all', since, per_page: 100 });

      const openIssues = allIssues.filter(issue => issue.state === 'open');
      const closedIssues = allIssues.filter(issue => issue.state === 'closed');

      // Calculate average close time
      const closeTimes = closedIssues
        .filter(issue => issue.closed_at)
        .map(issue => {
          const created = new Date(issue.created_at).getTime();
          const closed = new Date(issue.closed_at!).getTime();
          return (closed - created) / (1000 * 60 * 60 * 24); // days
        });

      const averageCloseTime = closeTimes.length > 0 
        ? closeTimes.reduce((sum, time) => sum + time, 0) / closeTimes.length 
        : 0;

      // Label usage analysis
      const labelsUsage: Record<string, number> = {};
      for (const issue of allIssues) {
        for (const label of issue.labels) {
          labelsUsage[label.name] = (labelsUsage[label.name] || 0) + 1;
        }
      }

      // Recent activity analysis (last 30 days, weekly)
      const recentActivity: Array<{ date: string; opened: number; closed: number }> = [];
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      
      for (let i = 0; i < 4; i++) {
        const weekStart = new Date(thirtyDaysAgo + i * 7 * 24 * 60 * 60 * 1000);
        const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const weekOpened = allIssues.filter(issue => {
          const created = new Date(issue.created_at).getTime();
          return created >= weekStart.getTime() && created < weekEnd.getTime();
        }).length;
        
        const weekClosed = closedIssues.filter(issue => {
          const closed = issue.closed_at ? new Date(issue.closed_at).getTime() : 0;
          return closed >= weekStart.getTime() && closed < weekEnd.getTime();
        }).length;
        
        recentActivity.push({
          date: weekStart.toISOString().split('T')[0],
          opened: weekOpened,
          closed: weekClosed
        });
      }

      return {
        total: allIssues.length,
        open: openIssues.length,
        closed: closedIssues.length,
        average_close_time_days: Math.round(averageCloseTime * 100) / 100,
        labels_usage: labelsUsage,
        recent_activity: recentActivity
      };
    } catch (error: any) {
      this.context.apis.logger.warn('Failed to analyze issues', { error: error.message });
      return {
        total: 0,
        open: 0,
        closed: 0,
        average_close_time_days: 0,
        labels_usage: {},
        recent_activity: []
      };
    }
  }

  /**
   * Analyze pull requests
   */
  private async analyzePullRequests(owner: string, repo: string, timeRangeDays: number): Promise<PullRequestAnalysis> {
    try {
      const since = new Date(Date.now() - timeRangeDays * 24 * 60 * 60 * 1000).toISOString();
      const allPRs = await this.makeRequest<GitHubPullRequest[]>(
        `/repos/${owner}/${repo}/pulls?state=all&since=${since}&per_page=100`
      );

      const openPRs = allPRs.filter(pr => pr.state === 'open');
      const closedPRs = allPRs.filter(pr => pr.state === 'closed');
      const mergedPRs = closedPRs.filter(pr => pr.merged_at);

      // Calculate average merge time
      const mergeTimes = mergedPRs
        .map(pr => {
          const created = new Date(pr.created_at).getTime();
          const merged = new Date(pr.merged_at!).getTime();
          return (merged - created) / (1000 * 60 * 60 * 24); // days
        });

      const averageMergeTime = mergeTimes.length > 0 
        ? mergeTimes.reduce((sum, time) => sum + time, 0) / mergeTimes.length 
        : 0;

      // Average PR size
      const prSizes = allPRs.map(pr => ({
        additions: pr.additions,
        deletions: pr.deletions,
        files: pr.changed_files
      }));

      const averageSize = prSizes.length > 0 ? {
        additions: Math.round(prSizes.reduce((sum, size) => sum + size.additions, 0) / prSizes.length),
        deletions: Math.round(prSizes.reduce((sum, size) => sum + size.deletions, 0) / prSizes.length),
        files: Math.round(prSizes.reduce((sum, size) => sum + size.files, 0) / prSizes.length)
      } : { additions: 0, deletions: 0, files: 0 };

      // Recent activity analysis
      const recentActivity: Array<{ date: string; opened: number; merged: number; closed: number }> = [];
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      
      for (let i = 0; i < 4; i++) {
        const weekStart = new Date(thirtyDaysAgo + i * 7 * 24 * 60 * 60 * 1000);
        const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const weekOpened = allPRs.filter(pr => {
          const created = new Date(pr.created_at).getTime();
          return created >= weekStart.getTime() && created < weekEnd.getTime();
        }).length;
        
        const weekMerged = mergedPRs.filter(pr => {
          const merged = new Date(pr.merged_at!).getTime();
          return merged >= weekStart.getTime() && merged < weekEnd.getTime();
        }).length;
        
        const weekClosed = closedPRs.filter(pr => {
          const closed = pr.closed_at ? new Date(pr.closed_at).getTime() : 0;
          return closed >= weekStart.getTime() && closed < weekEnd.getTime() && !pr.merged_at;
        }).length;
        
        recentActivity.push({
          date: weekStart.toISOString().split('T')[0],
          opened: weekOpened,
          merged: weekMerged,
          closed: weekClosed
        });
      }

      return {
        total: allPRs.length,
        open: openPRs.length,
        closed: closedPRs.length,
        merged: mergedPRs.length,
        average_merge_time_days: Math.round(averageMergeTime * 100) / 100,
        average_size: averageSize,
        recent_activity: recentActivity
      };
    } catch (error: any) {
      this.context.apis.logger.warn('Failed to analyze pull requests', { error: error.message });
      return {
        total: 0,
        open: 0,
        closed: 0,
        merged: 0,
        average_merge_time_days: 0,
        average_size: { additions: 0, deletions: 0, files: 0 },
        recent_activity: []
      };
    }
  }

  /**
   * Analyze commit activity
   */
  private async analyzeCommitActivity(owner: string, repo: string, timeRangeDays: number): Promise<CommitAnalysis> {
    try {
      const since = new Date(Date.now() - timeRangeDays * 24 * 60 * 60 * 1000).toISOString();
      const commits = await this.makeRequest<GitHubCommit[]>(
        `/repos/${owner}/${repo}/commits?since=${since}&per_page=100`
      );

      // Commit frequency by day of week
      const commitFrequency: Record<string, number> = {
        'Sunday': 0, 'Monday': 0, 'Tuesday': 0, 'Wednesday': 0,
        'Thursday': 0, 'Friday': 0, 'Saturday': 0
      };

      // Top contributors
      const contributorStats: Record<string, { commits: number; additions: number; deletions: number }> = {};

      // Activity timeline (weekly)
      const activityTimeline: Array<{ date: string; commits: number; additions: number; deletions: number }> = [];

      for (const commit of commits) {
        const date = new Date(commit.commit.author.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        commitFrequency[dayName]++;

        const author = commit.commit.author.name;
        if (!contributorStats[author]) {
          contributorStats[author] = { commits: 0, additions: 0, deletions: 0 };
        }
        contributorStats[author].commits++;
        
        if (commit.stats) {
          contributorStats[author].additions += commit.stats.additions;
          contributorStats[author].deletions += commit.stats.deletions;
        }
      }

      // Sort contributors by commits
      const topContributors = Object.entries(contributorStats)
        .map(([author, stats]) => ({ author, ...stats }))
        .sort((a, b) => b.commits - a.commits)
        .slice(0, 10);

      // Generate weekly timeline for the last 4 weeks
      const fourWeeksAgo = Date.now() - 28 * 24 * 60 * 60 * 1000;
      for (let i = 0; i < 4; i++) {
        const weekStart = new Date(fourWeeksAgo + i * 7 * 24 * 60 * 60 * 1000);
        const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const weekCommits = commits.filter(commit => {
          const commitDate = new Date(commit.commit.author.date).getTime();
          return commitDate >= weekStart.getTime() && commitDate < weekEnd.getTime();
        });
        
        const weekAdditions = weekCommits.reduce((sum, c) => sum + (c.stats?.additions || 0), 0);
        const weekDeletions = weekCommits.reduce((sum, c) => sum + (c.stats?.deletions || 0), 0);
        
        activityTimeline.push({
          date: weekStart.toISOString().split('T')[0],
          commits: weekCommits.length,
          additions: weekAdditions,
          deletions: weekDeletions
        });
      }

      return {
        total_commits: commits.length,
        recent_commits: commits.length,
        commit_frequency: commitFrequency,
        top_contributors: topContributors,
        activity_timeline: activityTimeline
      };
    } catch (error: any) {
      this.context.apis.logger.warn('Failed to analyze commit activity', { error: error.message });
      return {
        total_commits: 0,
        recent_commits: 0,
        commit_frequency: {},
        top_contributors: [],
        activity_timeline: []
      };
    }
  }

  /**
   * Analyze contributors
   */
  private async analyzeContributors(owner: string, repo: string): Promise<ContributorAnalysis> {
    try {
      const contributors = await this.makeRequest<Array<{
        login: string;
        id: number;
        avatar_url: string;
        contributions: number;
        type: string;
      }>>(`/repos/${owner}/${repo}/contributors?per_page=100`);

      const totalContributions = contributors.reduce((sum, c) => sum + c.contributions, 0);
      
      // Classify contributors
      let coreContributors = 0;
      let regularContributors = 0;
      let occasionalContributors = 0;

      for (const contributor of contributors) {
        const percentage = (contributor.contributions / totalContributions) * 100;
        if (percentage > 20) {
          coreContributors++;
        } else if (percentage >= 5) {
          regularContributors++;
        } else {
          occasionalContributors++;
        }
      }

      // Get detailed info for top contributors
      const topContributors: Array<{
        login: string;
        name: string | null;
        contributions: number;
        avatar_url: string;
      }> = [];

      for (const contributor of contributors.slice(0, 10)) {
        try {
          const userInfo = await this.makeRequest<GitHubUser>(`/users/${contributor.login}`);
          topContributors.push({
            login: contributor.login,
            name: userInfo.name,
            contributions: contributor.contributions,
            avatar_url: contributor.avatar_url
          });
        } catch (error) {
          topContributors.push({
            login: contributor.login,
            name: null,
            contributions: contributor.contributions,
            avatar_url: contributor.avatar_url
          });
        }
      }

      // Active contributors (contributed in last 90 days)
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      const recentCommits = await this.makeRequest<GitHubCommit[]>(
        `/repos/${owner}/${repo}/commits?since=${ninetyDaysAgo}&per_page=100`
      );
      
      const activeContributors = new Set(
        recentCommits.map(commit => commit.commit.author.name)
      ).size;

      return {
        total_contributors: contributors.length,
        active_contributors: activeContributors,
        top_contributors: topContributors,
        contributor_distribution: {
          core_contributors: coreContributors,
          regular_contributors: regularContributors,
          occasional_contributors: occasionalContributors
        }
      };
    } catch (error: any) {
      this.context.apis.logger.warn('Failed to analyze contributors', { error: error.message });
      return {
        total_contributors: 0,
        active_contributors: 0,
        top_contributors: [],
        contributor_distribution: {
          core_contributors: 0,
          regular_contributors: 0,
          occasional_contributors: 0
        }
      };
    }
  }

  /**
   * Calculate repository health score
   */
  private calculateHealthScore(analysis: RepositoryAnalysis): HealthScore {
    const factors = {
      activity: 0,
      community: 0,
      maintenance: 0,
      documentation: 0,
      testing: 0
    };

    const recommendations: string[] = [];

    // Activity score (based on recent commits and issues)
    if (analysis.commits) {
      const recentActivity = analysis.commits.recent_commits;
      factors.activity = Math.min(100, (recentActivity / 30) * 100); // 30 commits = 100%
      if (factors.activity < 50) {
        recommendations.push('Increase commit frequency to show active development');
      }
    }

    // Community score (based on stars, forks, contributors)
    const stars = analysis.metrics.basic.stars;
    const forks = analysis.metrics.basic.forks;
    const contributors = analysis.contributors?.total_contributors || 0;
    
    factors.community = Math.min(100, 
      (Math.log10(stars + 1) * 20) + 
      (Math.log10(forks + 1) * 15) + 
      (contributors * 2)
    );
    
    if (factors.community < 30) {
      recommendations.push('Promote repository to increase community engagement');
    }

    // Maintenance score (based on issue resolution and PR merge rate)
    if (analysis.issues && analysis.pullRequests) {
      const issueRatio = analysis.issues.closed / (analysis.issues.total || 1);
      const prMergeRatio = analysis.pullRequests.merged / (analysis.pullRequests.total || 1);
      factors.maintenance = (issueRatio * 50) + (prMergeRatio * 50);
      
      if (factors.maintenance < 60) {
        recommendations.push('Improve issue resolution and PR merge rates');
      }
    }

    // Documentation score (basic check for README, etc.)
    factors.documentation = 60; // Base score, would check for actual documentation
    if (analysis.technology?.config_files.length === 0) {
      factors.documentation -= 20;
      recommendations.push('Add configuration files and documentation');
    }

    // Testing score (would analyze for test files and CI)
    factors.testing = 50; // Base score, would check for actual tests
    if (analysis.technology?.config_files.includes('CI/CD')) {
      factors.testing += 25;
    } else {
      recommendations.push('Set up continuous integration and testing');
    }

    // Overall score (weighted average)
    const overallScore = Math.round(
      (factors.activity * 0.25) +
      (factors.community * 0.20) +
      (factors.maintenance * 0.25) +
      (factors.documentation * 0.15) +
      (factors.testing * 0.15)
    );

    return {
      overall_score: overallScore,
      factors,
      recommendations
    };
  }

  /**
   * Get repository contents
   */
  private async getContents(owner: string, repo: string, path: string): Promise<GitHubContent[]> {
    try {
      const contents = await this.makeRequest<GitHubContent | GitHubContent[]>(
        `/repos/${owner}/${repo}/contents/${path}`
      );
      return Array.isArray(contents) ? contents : [contents];
    } catch (error: any) {
      this.context.apis.logger.warn('Failed to get repository contents', { error: error.message });
      return [];
    }
  }

  /**
   * Update rate limit information
   */
  private async updateRateLimitInfo(): Promise<void> {
    try {
      const rateLimit = await this.makeRequest<{
        rate: RateLimitInfo;
        search: RateLimitInfo;
        graphql: RateLimitInfo;
        integration_manifest: RateLimitInfo;
        source_import: RateLimitInfo;
        code_scanning_upload: RateLimitInfo;
        actions_runner_registration: RateLimitInfo;
        scim: RateLimitInfo;
      }>('/rate_limit');
      
      this.rateLimitInfo = rateLimit.rate;
      
      this.context.apis.logger.info('Rate limit updated', {
        remaining: this.rateLimitInfo.remaining,
        limit: this.rateLimitInfo.limit,
        resetTime: new Date(this.rateLimitInfo.reset * 1000).toISOString()
      });
    } catch (error: any) {
      this.context.apis.logger.warn('Failed to update rate limit info', { error: error.message });
    }
  }

  /**
   * Make authenticated request to GitHub API
   */
  private async makeRequest<T = any>(endpoint: string): Promise<T> {
    const cacheKey = `github:${endpoint}`;
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.config.settings.cacheTTL) {
      return cached.data;
    }

    // Rate limiting
    await this.checkRateLimit();

    const startTime = performance.now();
    
    try {
      const response = await fetch(`${this.config.settings.baseUrl}${endpoint}`, {
        headers: {
          'Authorization': `token ${this.config.settings.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Claude-Code-Flow-GitHub-Plugin'
        },
        signal: AbortSignal.timeout(this.config.settings.requestTimeout)
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const executionTime = performance.now() - startTime;

      // Update rate limit info from headers
      if (response.headers.get('x-ratelimit-remaining')) {
        this.rateLimitInfo = {
          limit: parseInt(response.headers.get('x-ratelimit-limit') || '5000'),
          remaining: parseInt(response.headers.get('x-ratelimit-remaining') || '5000'),
          reset: parseInt(response.headers.get('x-ratelimit-reset') || '0'),
          used: parseInt(response.headers.get('x-ratelimit-used') || '0')
        };
      }

      // Cache response
      this.cache.set(cacheKey, { data, timestamp: Date.now() });

      // Emit metrics
      this.emit('api-called', this.manifest.name, 'github-api', executionTime);

      this.releaseRequest();
      return data;

    } catch (error: any) {
      const executionTime = performance.now() - startTime;
      this.emit('api-failed', this.manifest.name, 'github-api', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date()
      });
      
      this.releaseRequest();
      throw error;
    }
  }

  private async checkRateLimit(): Promise<void> {
    // Wait if we're at rate limit
    if (this.rateLimitInfo && this.rateLimitInfo.remaining <= 10) {
      const resetTime = this.rateLimitInfo.reset * 1000;
      const waitTime = Math.max(0, resetTime - Date.now()) + 1000; // Add 1s buffer
      
      this.context.apis.logger.info(`Rate limit reached, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      await this.updateRateLimitInfo();
    }

    // Concurrent request limiting
    if (this.activeRequests >= this.config.settings.maxConcurrentRequests) {
      await new Promise<void>(resolve => {
        this.requestQueue.push(resolve);
      });
    }

    this.activeRequests++;
  }

  private releaseRequest(): void {
    this.activeRequests--;
    if (this.requestQueue.length > 0) {
      const resolve = this.requestQueue.shift();
      resolve?.();
    }
  }
}

export default GitHubIntegrationPlugin;