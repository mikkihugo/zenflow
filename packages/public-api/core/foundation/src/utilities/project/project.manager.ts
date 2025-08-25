/**
 * @fileoverview Project Management System for Claude-Zen
 *
 * Manages user projects with individual databases stored in a configurable location.
 * Projects are stored in a projects.json file with metadata, and each project
 * gets its own database directory for storing project-specific data.
 *
 * Storage locations:
 * - Project root: .claude-zen/projects.json
 * - User home: ~/.claude-zen/projects.json (when ZEN_STORE_CONFIG_IN_USER_HOME=true)
 *
 * Project structure:
 * .claude-zen/
 * ├── projects.json          # Main project registry
 * ├── projects/              # Individual project databases
 * │   ├── proj-abc123/       # Project with ID abc123
 * │   │   ├── workspace.db   # Project workspace database
 * │   │   ├── memory/        # Project memory storage
 * │   │   └── cache/         # Project cache
 * │   └── proj-def456/       # Another project
 * └── .gitignore             # Auto-generated gitignore
 */

import * as fs from 'fs';
import { promises as fsAsync } from 'fs';
import * as os from 'os';
import * as path from 'path';

import { getConfig, type Config } from '../../core/config';
import { getLogger } from '../../core/logging';
import type { UnknownRecord } from '../../types/primitives';

const logger = getLogger('project-manager');

// Constants
const PACKAGE_JSON_FILENAME = 'package.json';

/**
 * Project type classification for different kinds of development projects.
 * Helps categorize projects for better organization and tooling.
 *
 * @type ProjectType
 */
type ProjectType = 'service' | 'domain' | 'app' | 'lib' | 'package' | 'tool' | 'example' | 'test' | 'benchmark' | 'crate' | 'doc';
// Note: WorkspaceType and BuildSystem types removed as unused

/**
 * Complete project information including metadata and workspace structure.
 * Contains all necessary data for project management and organization.
 *
 * @interface ProjectInfo
 *
 * @example
 * ```typescript
 * const project: ProjectInfo = {
 *   id: 'proj-123',
 *   name: 'my-awesome-project',
 *   path: '/home/user/projects/my-project',
 *   description: 'An awesome TypeScript project',
 *   createdAt: '2025-01-01T00:00:00.000Z',
 *   lastAccessedAt: '2025-01-15T12:00:00.000Z',
 *   framework: 'Next.js',
 *   language: 'TypeScript'
 * };
 * ```
 */
export interface ProjectInfo {
  id: string;
  name: string;
  path: string;
  description?: string;
  createdAt: string;
  lastAccessedAt: string;
  gitRemote?: string;
  framework?: string;
  language?: string;
  workspace?: {
    type: 'monorepo' | 'single' | 'multi' | 'bazel' | 'complex';
    workspaceFile?: string; // pnpm-workspace.yaml, lerna.json, WORKSPACE, etc.
    monorepoRoot?: string; // Path to monorepo root (only for type: 'multi')
    buildSystem?: 'pnpm' | 'lerna' | 'nx' | 'rush' | 'bazel' | 'gradle' | 'maven' | 'custom';
    structure?: {
      hasServices?: boolean; // services/ directory
      hasDomains?: boolean; // domains/ directory
      hasMonolib?: boolean; // shared libraries
      hasApps?: boolean; // apps/ directory
      hasPackages?: boolean; // packages/ directory
      hasLibs?: boolean; // libs/ directory
      customDirs?: string[]; // other significant directories
    };
    subProjects?: Array<{
      path: string;
      name: string;
      type: 'service' | 'domain' | 'app' | 'lib' | 'package' | 'tool' | 'example' | 'test' | 'benchmark' | 'crate' | 'doc';
    }>;
  };
  metadata?: UnknownRecord;
}

/**
 * Project registry containing all managed projects.
 * Central index for project discovery and management.
 *
 * @interface ProjectRegistry
 */
export interface ProjectRegistry {
  version: string;
  projects: Record<string, ProjectInfo>;
  lastUpdated: string;
}

/**
 * Project Manager for Claude-Zen development environment.
 *
 * Provides centralized management of development projects with:
 * - Project registry and metadata storage
 * - Individual project database management
 * - Automatic directory structure creation
 * - Git integration and .gitignore management
 * - Workspace detection and analysis
 *
 * @class ProjectManager
 * @singleton
 *
 * @example Basic Usage
 * ```typescript
 * const manager = ProjectManager.getInstance();
 *
 * // Create a new project
 * const project = await manager.createProject({
 *   name: 'my-project',
 *   path: '/path/to/project',
 *   description: 'My awesome project'
 * });
 *
 * // List all projects
 * const projects = await manager.listProjects();
 * ```
 *
 * @example Advanced Workspace Detection
 * ```typescript
 * const manager = ProjectManager.getInstance();
 *
 * // Add project with workspace analysis
 * const project = await manager.addProject('/path/to/monorepo');
 * console.log('Workspace type:', project.workspace?.type);
 * console.log('Build system:', project.workspace?.buildSystem);
 * ```
 */
export class ProjectManager {
  private static instance: ProjectManager;
  
  /**
   * Root configuration directory path following Claude Zen storage architecture.
   * 
   * @description Absolute path to the Claude Zen configuration directory, resolved
   * based on the `storeInUserHome` configuration setting. This path serves as the
   * root for all project management storage operations.
   * 
   * **Possible Values**:
   * - User-global: `/home/user/.claude-zen/` or `C:\Users\user\.claude-zen\`
   * - Project-local: `/path/to/project/.claude-zen/`
   * 
   * @see {@link constructor} for initialization logic
   */
  private configDir: string;
  
  /**
   * Path to the main project registry file.
   * 
   * @description Absolute path to `projects.json` file that contains the registry
   * of all managed projects. Located within the configDir following the standard
   * Claude Zen storage structure.
   * 
   * **Example Paths**:
   * - User-global: `~/.claude-zen/projects.json`
   * - Project-local: `./.claude-zen/projects.json`
   */
  private projectsFile: string;
  
  /**
   * Path to the projects storage directory.
   * 
   * @description Absolute path to the `projects/` directory containing individual
   * project databases and storage. Each project gets its own subdirectory with
   * isolated storage following the `proj-{id}/` naming pattern.
   * 
   * **Example Paths**:
   * - User-global: `~/.claude-zen/projects/`
   * - Project-local: `./.claude-zen/projects/`
   * 
   * **Directory Structure**:
   * ```
   * projects/
   * ├── proj-abc123/
   * │   ├── workspace.db
   * │   ├── memory/
   * │   └── cache/
   * └── proj-def456/
   *     ├── workspace.db
   *     └── data/
   * ```
   */
  private projectsDir: string;
  
  private registry: ProjectRegistry|null = null;

  private constructor() {
    const config = getConfig();

    /**
     * Initialize Claude Zen configuration directory path based on storage preference.
     * 
     * **Storage Resolution Logic**:
     * 1. Check `config.project.storeInUserHome` setting
     * 2. If `true` → Use user home directory (`~/.claude-zen/`)
     * 3. If `false` → Use project directory (`./.claude-zen/`)
     * 4. Resolve to absolute path for consistent access
     * 
     * **Use Cases**:
     * - **User Home**: Personal development, cross-project settings, single-user
     * - **Project Local**: Team development, CI/CD, containerized environments
     */
    this.configDir = config.project.storeInUserHome
      ? // User home mode: Multi-repo support with central project registry
      path.resolve(path.join(os.homedir(), config.project.configDir))
      : // Project root mode: Single repo mode, store in current project root
      path.resolve(config.project.configDir);

    // Initialize storage paths within the resolved configuration directory
    this.projectsFile = path.join(this.configDir,'projects.json');
    this.projectsDir = path.join(this.configDir, 'projects');

    this.ensureDirectoriesExist();
    this.ensureGitignore();
  }

  /**
   * Gets the singleton instance of the ProjectManager.
   *
   * @returns The ProjectManager singleton instance
   */
  static getInstance(): ProjectManager {
    if (!ProjectManager.instance) {
      ProjectManager.instance = new ProjectManager();
    }
    return ProjectManager.instance;
  }

  /**
   * Gets the singleton instance with full async initialization.
   * Ensures all directories and configuration are properly set up.
   *
   * @returns Promise resolving to the fully initialized ProjectManager instance
   */
  static async getInstanceAsync(): Promise<ProjectManager> {
    if (!ProjectManager.instance) {
      ProjectManager.instance = new ProjectManager();
      await ProjectManager.instance.initializeAsync();
    }
    return ProjectManager.instance;
  }

  /**
   * Performs full async initialization of the project manager.
   * Creates necessary directories, sets up gitignore, and loads the project registry.
   *
   * @returns Promise that resolves when initialization is complete
   */
  async initializeAsync(): Promise<void> {
    await this.ensureDirectoriesExistAsync();
    await this.ensureGitignoreAsync();
    await this.loadRegistryAsync();
  }

  /**
   * Ensures all necessary directories exist synchronously.
   * Creates config and projects directories if they don't exist.
   *
   * @private
   */
  private ensureDirectoriesExist(): void {
    const directories = [this.configDir, this.projectsDir];

    for (const dir of directories) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logger.info(`Created directory: ${dir}`);
      }
    }
  }

  /**
   * Ensures all necessary directories exist asynchronously.
   * Creates config and projects directories if they don't exist.
   *
   * @private
   * @returns Promise that resolves when directories are created
   */
  private async ensureDirectoriesExistAsync(): Promise<void> {
    const directories = [this.configDir, this.projectsDir];

    for (const dir of directories) {
      try {
        await fsAsync.access(dir);
      } catch {
        await fsAsync.mkdir(dir, { recursive: true });
        logger.info(`Created directory: ${dir}`);
      }
    }
  }

  /**
   * Ensure .gitignore exists to ignore claude-zen directory
   * This creates a .gitignore file regardless of existing .gitignore
   */
  /**
   * Ensures comprehensive .gitignore protection within .claude-zen directory.
   * 
   * @description Creates a complete .gitignore file inside the .claude-zen directory
   * to ensure that NOTHING within this directory ever gets committed to version control.
   * This provides defense-in-depth protection against accidental commits of sensitive
   * data, databases, authentication tokens, and cache files.
   * 
   * **Protection Coverage**:
   * - All database files (SQLite, KuzuDB, LanceDB)
   * - Authentication tokens and credentials
   * - Memory storage and cache directories
   * - Project-specific configuration and data
   * - Logs, temporary files, and system artifacts
   * - IDE and OS generated files
   * 
   * @private
   * @see {@link ensureGitignoreAsync} for async version
   */
  private ensureGitignore(): void {
    const gitignorePath = path.join(this.configDir, '.gitignore');

    if (!fs.existsSync(gitignorePath)) {
      const gitignoreContent = `# ============================================================================
# CLAUDE ZEN STORAGE PROTECTION - IGNORE EVERYTHING
# ============================================================================
#
# This .gitignore ensures that NOTHING in the .claude-zen directory is ever
# committed to version control. This directory contains sensitive data that
# should remain local to each user/environment.
#
# Protected content includes:
# - Database files (SQLite, KuzuDB, LanceDB, etc.)
# - Authentication tokens and API keys  
# - Memory storage and cache data
# - Project-specific configuration
# - User preferences and session data
# - Logs and temporary processing files
#

# =============================================================================
# IGNORE EVERYTHING BY DEFAULT - MAXIMUM PROTECTION
# =============================================================================

# Ignore all files and directories
*
*/

# Ignore all file types
*.*

# =============================================================================
# DATABASE STORAGE PROTECTION
# =============================================================================

# Core database files
*.db
*.sqlite
*.sqlite3
*.kuzu
*.lancedb

# Database directories
data/
databases/
storage/

# Specific database files from Claude Zen architecture
coordination.db
kuzu-graph.db
lancedb-vectors.db

# =============================================================================
# MEMORY AND CACHE PROTECTION  
# =============================================================================

# Memory storage
memory/
sessions/
vectors/
cache/
.tmp/
temp/

# Memory-specific files
debug.json
memory.json
cache.json

# =============================================================================
# AUTHENTICATION AND SECURITY PROTECTION
# =============================================================================

# Authentication tokens
*.json
copilot-token.json
auth-token.json
api-keys.json
credentials.json
config.json

# Security-related files
*.key
*.pem
*.p12
*.pfx
*.crt
*.cert

# =============================================================================
# PROJECT AND WORKSPACE PROTECTION
# =============================================================================

# Project directories
projects/
workspaces/
proj-*/

# Project-specific files
workspace.db
project.json
workspace.json
settings.json

# =============================================================================
# LOGS AND DEVELOPMENT ARTIFACTS
# =============================================================================

# Log files
*.log
*.out
*.err
logs/

# Development artifacts
*.bak
*.backup
*.tmp
*.temp
*.cache
*.swap
*.swp
*.swo

# =============================================================================
# SYSTEM AND OS FILES
# =============================================================================

# macOS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes

# Windows  
Thumbs.db
Thumbs.db:encryptable
ehthumbs.db
Desktop.ini

# Linux
.directory

# =============================================================================
# IDE AND EDITOR FILES
# =============================================================================

# Visual Studio Code
.vscode/

# JetBrains IDEs
.idea/
*.iml
*.iws

# Vim
*.swp
*.swo
*~

# Emacs
*~
#*#
/.emacs.desktop
/.emacs.desktop.lock
*.elc

# Sublime Text
*.sublime-workspace
*.sublime-project

# =============================================================================
# DEVELOPMENT AND BUILD ARTIFACTS
# =============================================================================

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Python
__pycache__/
*.pyc
*.pyo
*.egg-info/

# Rust
target/

# =============================================================================
# END OF CLAUDE ZEN PROTECTION
# =============================================================================
#
# This comprehensive .gitignore ensures maximum protection against accidental
# commits of sensitive Claude Zen data. If you need to commit something from
# this directory (which should be rare), you'll need to explicitly force it
# with 'git add -f filename' after careful consideration.
#
`;

      fs.writeFileSync(gitignorePath, gitignoreContent, 'utf8');
      logger.info(`Created comprehensive .gitignore protection: ${gitignorePath}`);
    }
  }

  /**
   * Ensures comprehensive .gitignore protection within .claude-zen directory (async version).
   * 
   * @description Asynchronous version of {@link ensureGitignore}. Creates a complete 
   * .gitignore file inside the .claude-zen directory to ensure that NOTHING within 
   * this directory ever gets committed to version control.
   * 
   * @private
   * @returns Promise that resolves when .gitignore is created or verified to exist
   * @see {@link ensureGitignore} for sync version and detailed documentation
   */
  private async ensureGitignoreAsync(): Promise<void> {
    const gitignorePath = path.join(this.configDir, '.gitignore');

    try {
      await fsAsync.access(gitignorePath);
    } catch {
      // Reuse the same comprehensive content from the sync version
      const gitignoreContent = `# ============================================================================
# CLAUDE ZEN STORAGE PROTECTION - IGNORE EVERYTHING
# ============================================================================
#
# This .gitignore ensures that NOTHING in the .claude-zen directory is ever
# committed to version control. This directory contains sensitive data that
# should remain local to each user/environment.
#
# Protected content includes:
# - Database files (SQLite, KuzuDB, LanceDB, etc.)
# - Authentication tokens and API keys  
# - Memory storage and cache data
# - Project-specific configuration
# - User preferences and session data
# - Logs and temporary processing files
#

# =============================================================================
# IGNORE EVERYTHING BY DEFAULT - MAXIMUM PROTECTION
# =============================================================================

# Ignore all files and directories
*
*/

# Ignore all file types
*.*

# =============================================================================
# DATABASE STORAGE PROTECTION
# =============================================================================

# Core database files
*.db
*.sqlite
*.sqlite3
*.kuzu
*.lancedb

# Database directories
data/
databases/
storage/

# Specific database files from Claude Zen architecture
coordination.db
kuzu-graph.db
lancedb-vectors.db

# =============================================================================
# MEMORY AND CACHE PROTECTION  
# =============================================================================

# Memory storage
memory/
sessions/
vectors/
cache/
.tmp/
temp/

# Memory-specific files
debug.json
memory.json
cache.json

# =============================================================================
# AUTHENTICATION AND SECURITY PROTECTION
# =============================================================================

# Authentication tokens
*.json
copilot-token.json
auth-token.json
api-keys.json
credentials.json
config.json

# Security-related files
*.key
*.pem
*.p12
*.pfx
*.crt
*.cert

# =============================================================================
# PROJECT AND WORKSPACE PROTECTION
# =============================================================================

# Project directories
projects/
workspaces/
proj-*/

# Project-specific files
workspace.db
project.json
workspace.json
settings.json

# =============================================================================
# LOGS AND DEVELOPMENT ARTIFACTS
# =============================================================================

# Log files
*.log
*.out
*.err
logs/

# Development artifacts
*.bak
*.backup
*.tmp
*.temp
*.cache
*.swap
*.swp
*.swo

# =============================================================================
# SYSTEM AND OS FILES
# =============================================================================

# macOS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes

# Windows  
Thumbs.db
Thumbs.db:encryptable
ehthumbs.db
Desktop.ini

# Linux
.directory

# =============================================================================
# IDE AND EDITOR FILES
# =============================================================================

# Visual Studio Code
.vscode/

# JetBrains IDEs
.idea/
*.iml
*.iws

# Vim
*.swp
*.swo
*~

# Emacs
*~
#*#
/.emacs.desktop
/.emacs.desktop.lock
*.elc

# Sublime Text
*.sublime-workspace
*.sublime-project

# =============================================================================
# DEVELOPMENT AND BUILD ARTIFACTS
# =============================================================================

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Python
__pycache__/
*.pyc
*.pyo
*.egg-info/

# Rust
target/

# =============================================================================
# END OF CLAUDE ZEN PROTECTION
# =============================================================================
#
# This comprehensive .gitignore ensures maximum protection against accidental
# commits of sensitive Claude Zen data. If you need to commit something from
# this directory (which should be rare), you'll need to explicitly force it
# with 'git add -f filename' after careful consideration.
#
`;

      await fsAsync.writeFile(gitignorePath, gitignoreContent, 'utf8');
      logger.info(`Created comprehensive .gitignore protection: ${gitignorePath}`);
    }
  }

  /**
   * Load project registry from disk
   */
  private loadRegistry(): ProjectRegistry {
    if (this.registry) {
      return this.registry;
    }

    if (!fs.existsSync(this.projectsFile)) {
      this.registry = {
        version: '1.0.0',
        projects: {},
        lastUpdated: new Date().toISOString(),
      };
      this.saveRegistry();
    } else {
      try {
        const content = fs.readFileSync(this.projectsFile, 'utf8');
        this.registry = JSON.parse(content);
        logger.debug(
          `Loaded project registry with ${this.registry ? Object.keys(this.registry.projects).length : 0} projects`,
        );
      } catch (error) {
        logger.error(
          'Failed to load project registry, creating new one:',
          error,
        );
        this.registry = {
          version: '1.0.0',
          projects: {},
          lastUpdated: new Date().toISOString(),
        };
      }
    }

    if (!this.registry) {
      throw new Error('Registry not initialized');
    }
    return this.registry;
  }

  /**
   * Load project registry from disk (async version)
   */
  private async loadRegistryAsync(): Promise<ProjectRegistry> {
    if (this.registry) {
      return this.registry;
    }

    try {
      await fsAsync.access(this.projectsFile);
      try {
        const content = await fsAsync.readFile(this.projectsFile, 'utf8');
        this.registry = JSON.parse(content);
        logger.debug(
          `Loaded project registry with ${this.registry ? Object.keys(this.registry.projects).length : 0} projects`,
        );
      } catch (error) {
        logger.error(
          'Failed to load project registry, creating new one:',
          error,
        );
        this.registry = {
          version: '1.0.0',
          projects: {},
          lastUpdated: new Date().toISOString(),
        };
      }
    } catch {
      this.registry = {
        version: '1.0.0',
        projects: {},
        lastUpdated: new Date().toISOString(),
      };
      await this.saveRegistryAsync();
    }

    if (!this.registry) {
      throw new Error('Registry not initialized');
    }
    return this.registry;
  }

  /**
   * Save project registry to disk
   */
  private saveRegistry(): void {
    if (!this.registry) {
      return;
    }

    this.registry.lastUpdated = new Date().toISOString();

    try {
      fs.writeFileSync(
        this.projectsFile,
        JSON.stringify(this.registry, null, 2),
        'utf8',
      );
      logger.debug('Saved project registry');
    } catch (error) {
      logger.error('Failed to save project registry:', error);
      throw error;
    }
  }

  /**
   * Save project registry to disk (async version)
   */
  private async saveRegistryAsync(): Promise<void> {
    if (!this.registry) {
      return;
    }

    this.registry.lastUpdated = new Date().toISOString();

    try {
      await fsAsync.writeFile(
        this.projectsFile,
        JSON.stringify(this.registry, null, 2),
        'utf8',
      );
      logger.debug('Saved project registry');
    } catch (error) {
      logger.error('Failed to save project registry:', error);
      throw error;
    }
  }

  /**
   * Generate unique project ID
   */
  private generateProjectId(): string {
    return `proj-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Register a new project (synchronous version for immediate use)
   */
  registerProjectSync(
    projectPath: string,
    options: {
      name?: string;
      description?: string;
      framework?: string;
      language?: string;
      metadata?: UnknownRecord;
    } = {},
  ): string {
    const registry = this.loadRegistry();
    const resolvedPath = path.resolve(projectPath);

    // Check if project already exists
    const existingProject = Object.values(registry.projects).find(
      (p) => p.path === resolvedPath,
    );
    if (existingProject) {
      logger.info(
        `Project already registered: ${existingProject.name} (${existingProject.id})`,
      );
      return existingProject.id;
    }

    const projectId = this.generateProjectId();
    const projectInfo: ProjectInfo = {
      id: projectId,
      name: options.name||path.basename(resolvedPath),
      path: resolvedPath,
      description: options.description,
      createdAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
      framework: options.framework,
      language: options.language,
      metadata: options.metadata,
    };

    // Detect workspace information
    projectInfo.workspace = this.detectWorkspaceInfo(resolvedPath);

    // Detect git remote
    projectInfo.gitRemote = this.detectGitRemote(resolvedPath);

    registry.projects[projectId] = projectInfo;
    this.saveRegistry();

    // Create project database directory
    this.createProjectDirectories(projectId);

    logger.info(
      `Registered new project: ${projectInfo.name} (${projectId}) at ${resolvedPath}`,
    );
    return projectId;
  }

  /**
   * Register a new project (async version)
   */
  async registerProject(
    projectPath: string,
    options: {
      name?: string;
      description?: string;
      framework?: string;
      language?: string;
      metadata?: UnknownRecord;
    } = {},
  ): Promise<string> {
    // Delegate to sync version for consistency and to avoid code duplication
    return await Promise.resolve(this.registerProjectSync(projectPath, options));
  }

  /**
   * Get project by ID or path
   */
  getProject(idOrPath: string): ProjectInfo|null {
    const registry = this.loadRegistry();

    // Try by ID first
    if (registry.projects[idOrPath]) {
      const project = registry.projects[idOrPath];
      project.lastAccessedAt = new Date().toISOString();
      this.saveRegistry();
      return project;
    }

    // Try by path
    const resolvedPath = path.resolve(idOrPath);
    const project = Object.values(registry.projects).find(
      (p) => p.path === resolvedPath,
    );
    if (project) {
      project.lastAccessedAt = new Date().toISOString();
      this.saveRegistry();
      return project;
    }

    return null;
  }

  /**
   * Get all projects
   */
  getAllProjects(): ProjectInfo[] {
    const registry = this.loadRegistry();
    return Object.values(registry.projects);
  }

  /**
   * Get project database path
   */
  getProjectDatabasePath(projectId: string): string {
    return path.join(this.projectsDir, projectId,'workspace.db');
  }

  /**
   * Get project memory directory
   */
  getProjectMemoryDir(projectId: string): string {
    return path.join(this.projectsDir, projectId, 'memory');
  }

  /**
   * Get project cache directory
   */
  getProjectCacheDir(projectId: string): string {
    return path.join(this.projectsDir, projectId, 'cache');
  }

  /**
   * Create project-specific directories
   */
  private createProjectDirectories(projectId: string): void {
    const projectDir = path.join(this.projectsDir, projectId);
    const memoryDir = path.join(projectDir, 'memory');
    const cacheDir = path.join(projectDir, 'cache');

    const directories = [projectDir, memoryDir, cacheDir];

    for (const dir of directories) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    logger.debug(`Created project directories for ${projectId}`);
  }

  /**
   * Detect workspace information from project directory
   * Supports advanced monorepo patterns including Bazel, complex structures, services/domains
   */
  private detectWorkspaceInfo(projectPath: string): ProjectInfo['workspace'] {
    // Extended workspace file detection including Bazel and other build systems
    const workspaceFiles = [
      {
        file: 'pnpm-workspace.yaml',
        type: 'monorepo' as const,
        buildSystem: 'pnpm' as const,
      },
      {
        file: 'lerna.json',
        type: 'monorepo' as const,
        buildSystem: 'lerna' as const,
      },
      {
        file: 'rush.json',
        type: 'monorepo' as const,
        buildSystem: 'rush' as const,
      },
      {
        file: 'nx.json',
        type: 'monorepo' as const,
        buildSystem: 'nx' as const,
      },
      {
        file: 'workspace.json',
        type: 'monorepo' as const,
        buildSystem: 'nx' as const,
      },
      {
        file: 'WORKSPACE',
        type: 'bazel' as const,
        buildSystem: 'bazel' as const,
      },
      {
        file: 'WORKSPACE.bazel',
        type: 'bazel' as const,
        buildSystem: 'bazel' as const,
      },
      {
        file: 'MODULE.bazel',
        type: 'bazel' as const,
        buildSystem: 'bazel' as const,
      },
      {
        file: 'build.gradle',
        type: 'monorepo' as const,
        buildSystem: 'gradle' as const,
      },
      {
        file: 'pom.xml',
        type: 'monorepo' as const,
        buildSystem: 'maven'as const,
      },
    ];

    // Check for workspace files
    for (const { file, type, buildSystem } of workspaceFiles) {
      const filePath = path.join(projectPath, file);
      if (fs.existsSync(filePath)) {
        const structure = this.analyzeProjectStructure(projectPath);
        const subProjects = this.detectSubProjects(projectPath, buildSystem);

        // Determine if this is a complex monorepo based on structure
        const isComplex =
          structure?.hasServices||structure?.hasDomains||(subProjects && subProjects.length > 10)||buildSystem ==='bazel';

        return {
          type: isComplex ? 'complex' : type,
          workspaceFile: file,
          buildSystem,
          structure,
          subProjects,
        };
      }
    }

    // Check for package.json with workspaces at current level
    const packageJsonPath = path.join(projectPath, PACKAGE_JSON_FILENAME);
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, 'utf8'),
        );
        if (packageJson.workspaces) {
          const structure = this.analyzeProjectStructure(projectPath);
          const subProjects = this.detectSubProjects(projectPath, 'pnpm');

          return {
            type:
              structure?.hasServices||structure?.hasDomains
                ?'complex'
                : 'monorepo',
            workspaceFile: PACKAGE_JSON_FILENAME,
            buildSystem: 'pnpm',
            structure,
            subProjects,
          };
        }
      } catch (error) {
        logger.warn('Failed to parse package.json:', error);
      }
    }

    // Check if this is part of a larger monorepo by walking up
    const monorepoRoot = this.findMonorepoRoot(projectPath);
    if (monorepoRoot && monorepoRoot !== projectPath) {
      // This is a package within a monorepo
      const rootWorkspaceInfo = this.detectWorkspaceInfo(monorepoRoot);
      return {
        type: 'multi',
        workspaceFile: rootWorkspaceInfo?.workspaceFile,
        buildSystem: rootWorkspaceInfo?.buildSystem,
        monorepoRoot,
        structure: rootWorkspaceInfo?.structure,
        subProjects: rootWorkspaceInfo?.subProjects,
      };
    }

    return { type: 'single' };
  }

  /**
   * Analyze project structure to detect services/domains/apps/packages
   */
  private analyzeProjectStructure(
    projectPath: string,
  ): NonNullable<ProjectInfo['workspace']>['structure'] {
    const structure = {
      hasServices: false,
      hasDomains: false,
      hasMonolib: false,
      hasApps: false,
      hasPackages: false,
      hasLibs: false,
      customDirs: [] as string[],
    };

    const commonDirs = [
      'services',
      'domains',
      'monolib',
      'apps',
      'packages',
      'libs',
      'tools',
      'shared',
      'common',
    ];

    for (const dir of commonDirs) {
      const dirPath = path.join(projectPath, dir);
      if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        switch (dir) {
        case 'services':
          structure.hasServices = true;
          break;
        case 'domains':
          structure.hasDomains = true;
          break;
        case 'monolib':
        case 'shared':
        case 'common':
          structure.hasMonolib = true;
          break;
        case 'apps':
          structure.hasApps = true;
          break;
        case 'packages':
          structure.hasPackages = true;
          break;
        case 'libs':
          structure.hasLibs = true;
          break;
        default:
          structure.customDirs?.push(dir);
        }
      }
    }

    return structure;
  }

  /**
   * Detect sub-projects within a monorepo based on build system
   */
  private detectSubProjects(
    projectPath: string,
    buildSystem: NonNullable<ProjectInfo['workspace']>['buildSystem'],
  ): NonNullable<ProjectInfo['workspace']>['subProjects'] {
    const subProjects: NonNullable<ProjectInfo['workspace']>['subProjects'] =
      [];

    try {
      if (buildSystem === 'bazel') {
        // For Bazel, scan for BUILD files
        this.scanBazelTargets(projectPath, subProjects);
      } else if (buildSystem === 'nx') {
        // For NX, check project.json files
        this.scanNxProjects(projectPath, subProjects);
      } else {
        // For other systems, scan standard directories
        this.scanStandardProjects(projectPath, subProjects);
      }
    } catch (error) {
      logger.warn('Failed to detect sub-projects:', error);
    }

    return subProjects;
  }

  /**
   * Scan for Bazel targets and packages
   */
  private scanBazelTargets(
    projectPath: string,
    subProjects: NonNullable<ProjectInfo['workspace']>['subProjects'],
  ): void {
    const dirs = ['services', 'domains', 'apps', 'libs', 'tools'];

    for (const dir of dirs) {
      const dirPath = path.join(projectPath, dir);
      if (fs.existsSync(dirPath)) {
        this.walkDirectory(dirPath, (filePath) => {
          if (
            path.basename(filePath) === 'BUILD'||path.basename(filePath) ==='BUILD.bazel'
          ) {
            const relativePath = path.relative(
              projectPath,
              path.dirname(filePath),
            );
            const name = path.basename(path.dirname(filePath));
            subProjects?.push({
              path: relativePath,
              name,
              type: this.inferProjectType(relativePath, dir),
            });
          }
        });
      }
    }
  }

  /**
   * Scan for NX projects
   */
  private scanNxProjects(
    projectPath: string,
    subProjects: NonNullable<ProjectInfo['workspace']>['subProjects'],
  ): void {
    const dirs = ['apps', 'libs', 'packages'];

    for (const dir of dirs) {
      const dirPath = path.join(projectPath, dir);
      if (fs.existsSync(dirPath)) {
        this.walkDirectory(dirPath, (filePath) => {
          if (path.basename(filePath) === 'project.json') {
            const relativePath = path.relative(
              projectPath,
              path.dirname(filePath),
            );
            const name = path.basename(path.dirname(filePath));
            subProjects?.push({
              path: relativePath,
              name,
              type: this.inferProjectType(relativePath, dir),
            });
          }
        });
      }
    }
  }

  /**
   * Scan for standard projects (package.json based)
   */
  private scanStandardProjects(
    projectPath: string,
    subProjects: NonNullable<ProjectInfo['workspace']>['subProjects'],
  ): void {
    const dirs = [
      'apps',
      'packages',
      'libs',
      'services',
      'domains',
      'tools',
      'examples',
      'test',
      'tests',
      'bench',
      'benchmark',
      'benchmarks',
      'crates',
      'docs',
      'documentation',
      'demo',
      'demos',
      'sample',
      'samples',
    ];

    // Define project indicator files for different languages/ecosystems
    const projectFiles = [
      PACKAGE_JSON_FILENAME, // Node.js/TypeScript/React Native
      'Cargo.toml', // Rust
      'go.mod', // Go
      'build.gradle', // Android
      'build.gradle.kts', // Android (Kotlin DSL)
      'app.json', // React Native/Expo
      'expo.json', // Expo
      'Podfile', // iOS (CocoaPods)
      'project.pbxproj', // iOS (Xcode)
    ];

    for (const dir of dirs) {
      const dirPath = path.join(projectPath, dir);
      if (fs.existsSync(dirPath)) {
        this.walkDirectory(
          dirPath,
          (filePath) => {
            const fileName = path.basename(filePath);
            if (projectFiles.includes(fileName)) {
              const relativePath = path.relative(
                projectPath,
                path.dirname(filePath),
              );
              const name = path.basename(path.dirname(filePath));
              subProjects?.push({
                path: relativePath,
                name,
                type: this.inferProjectType(relativePath, dir),
              });
            }
          },
          2,
        ); // Limit depth to avoid going too deep
      }
    }
  }

  /**
   * Walk directory recursively with optional depth limit
   */
  private walkDirectory(
    dirPath: string,
    callback: (filePath: string) => void,
    maxDepth = 3,
    currentDepth = 0,
  ): void {
    if (currentDepth >= maxDepth) {
      return;
    }

    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isFile()) {
          callback(fullPath);
        } else if (
          entry.isDirectory() &&
          !entry.name.startsWith('.') &&
          entry.name !== 'node_modules'
        ) {
          this.walkDirectory(fullPath, callback, maxDepth, currentDepth + 1);
        }
      }
    } catch {
      // Silently skip directories we can't read
    }
  }

  /**
   * Infer project type from path and parent directory
   * Supports patterns like *-service, *-domain, etc.
   */
  private inferProjectType(
    relativePath: string,
    parentDir: string,
  ): ProjectType {
    // Direct parent directory mapping using Map for reduced complexity
    const parentDirMap = new Map<string, ProjectType>([
      ['services', 'service'],
      ['domains', 'domain'],
      ['apps', 'app'],
      ['libs', 'lib'],
      ['packages', 'package'],
      ['tools', 'tool'],
      ['examples', 'example'],
      ['test', 'test'],
      ['tests', 'test'],
      ['bench', 'benchmark'],
      ['benchmark', 'benchmark'],
      ['benchmarks', 'benchmark'],
      ['crates', 'crate'],
      ['docs', 'doc'],
      ['documentation', 'doc'],
      ['demo', 'example'],
      ['demos', 'example'],
      ['sample', 'example'],
      ['samples', 'example'],
    ] as const);

    // Check parent directory mapping first
    const typeFromParent = parentDirMap.get(parentDir);
    if (typeFromParent) {
      return typeFromParent;
    }

    // Pattern-based detection using helper function
    const packageName = path.basename(relativePath);
    return this.inferTypeFromPackageName(packageName, relativePath);
  }

  private inferTypeFromPackageName(
    packageName: string,
    relativePath: string,
  ): ProjectType {
    // Check package name patterns
    const typePatterns = [
      { type: 'service' as const, patterns: ['-service', 'service'] },
      { type: 'domain' as const, patterns: ['-domain', 'domain'] },
      { type: 'app' as const, patterns: ['-app', 'app'] },
      { type: 'lib' as const, patterns: ['-lib', 'lib'] },
      { type: 'tool' as const, patterns: ['-tool', 'tool'] },
    ];

    for (const { type, patterns } of typePatterns) {
      if (patterns.some(pattern =>
        packageName.endsWith(pattern)||packageName.includes(pattern)||relativePath.includes(pattern),
      )) {
        return type;
      }
    }

    return 'package';
  }

  /**
   * Find the monorepo root by walking up from a given path
   * Enhanced to support Bazel and other build systems
   */
  private findMonorepoRoot(startPath: string): string|null {
    let currentPath = path.resolve(startPath);

    while (currentPath !== path.dirname(currentPath)) {
      const workspaceFiles = ['pnpm-workspace.yaml',
        'lerna.json',
        'rush.json',
        'nx.json',
        'workspace.json',
        'WORKSPACE',
        'WORKSPACE.bazel',
        'MODULE.bazel',
        'build.gradle',
        'pom.xml',
      ];

      // Check for workspace files
      for (const file of workspaceFiles) {
        if (fs.existsSync(path.join(currentPath, file))) {
          return currentPath;
        }
      }

      // Check for package.json with workspaces
      const packageJsonPath = path.join(currentPath, PACKAGE_JSON_FILENAME);
      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(
            fs.readFileSync(packageJsonPath, 'utf8'),
          );
          if (packageJson.workspaces) {
            return currentPath;
          }
        } catch {
          // Continue searching if package.json is malformed
        }
      }

      currentPath = path.dirname(currentPath);
    }

    return null;
  }

  /**
   * Detect git remote URL
   */
  private detectGitRemote(projectPath: string): string|undefined {
    try {
      const gitConfigPath = path.join(projectPath,'.git', 'config');
      if (fs.existsSync(gitConfigPath)) {
        const gitConfig = fs.readFileSync(gitConfigPath, 'utf8');
        const remoteMatch = gitConfig.match(/\[remote "origin"]\s*url = (.+)/);
        if (remoteMatch && remoteMatch[1]) {
          return remoteMatch[1].trim();
        }
      }
    } catch (error) {
      logger.debug('Could not detect git remote:', error);
    }
    return undefined;
  }

  /**
   * Find project root for current working directory with intelligent monorepo detection
   */
  findProjectRoot(
    startPath: string = process.cwd(),
  ): { projectId: string; projectPath: string; configPath: string }|null {
    // First check if we have a registered project for this path or any parent path
    let currentPath = path.resolve(startPath);

    while (currentPath !== path.dirname(currentPath)) {
      const project = this.getProject(currentPath);
      if (project) {
        return {
          projectId: project.id,
          projectPath: project.path,
          configPath: this.configDir,
        };
      }
      currentPath = path.dirname(currentPath);
    }

    // Smart project discovery with monorepo awareness
    return this.smartProjectDiscovery(startPath);
  }

  /**
   * Smart project discovery that handles both monorepo and package-level projects
   */
  private smartProjectDiscovery(
    startPath: string,
  ): { projectId: string; projectPath: string; configPath: string }|null {
    const resolvedStartPath = path.resolve(startPath);

    // Step 1: Find if we're in a monorepo
    const monorepoRoot = this.findMonorepoRoot(resolvedStartPath);

    if (monorepoRoot) {
      // We're in a monorepo - check if monorepo is already registered
      const monorepoProject = this.getProject(monorepoRoot);
      if (monorepoProject) {
        logger.debug(
          `Found existing monorepo project: ${monorepoProject.name} (${monorepoProject.id})`,
        );
        return {
          projectId: monorepoProject.id,
          projectPath: monorepoProject.path,
          configPath: this.configDir,
        };
      }

      // Step 2: Decide what to register based on working directory
      if (resolvedStartPath === monorepoRoot) {
        // Working from monorepo root - register the entire monorepo
        return this.registerMonorepoProject(monorepoRoot);
      } else {
        // Working from a package - check if it's a meaningful package
        const isSignificantPackage =
          this.isSignificantPackage(resolvedStartPath);

        if (isSignificantPackage) {
          // Register the monorepo root but return the package context
          const monorepoProjectResult =
            this.registerMonorepoProject(monorepoRoot);
          if (monorepoProjectResult) {
            logger.info(
              `Registered monorepo root, but working in package: ${path.relative(monorepoRoot, resolvedStartPath)}`,
            );
            return monorepoProjectResult;
          }
        } else {
          // Just register the monorepo
          return this.registerMonorepoProject(monorepoRoot);
        }
      }
    }

    // Step 3: Fallback to traditional single project detection
    return this.traditionalProjectDiscovery(resolvedStartPath);
  }

  /**
   * Register a monorepo project
   */
  private registerMonorepoProject(
    monorepoRoot: string,
  ): { projectId: string; projectPath: string; configPath: string }|null {
    try {
      // Use synchronous registration for immediate return
      const projectId = this.registerProjectSync(monorepoRoot, {
        name: path.basename(monorepoRoot),
        description: `Monorepo project at ${monorepoRoot}`,
      });

      logger.info(
        `Registered monorepo project: ${path.basename(monorepoRoot)} (${projectId})`,
      );

      return {
        projectId,
        projectPath: monorepoRoot,
        configPath: this.configDir,
      };
    } catch (error) {
      logger.error('Failed to register monorepo project:', error);
      return null;
    }
  }

  /**
   * Check if a directory represents a significant package worth individual attention
   */
  private isSignificantPackage(packagePath: string): boolean {
    const packageJsonPath = path.join(packagePath, PACKAGE_JSON_FILENAME);
    if (!fs.existsSync(packageJsonPath)) {
      return false;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      // Consider significant if:
      // 1. Has build scripts
      // 2. Has test scripts
      // 3. Has dependencies
      // 4. Is a published package
      const hasSignificantScripts =
        packageJson.scripts &&
        (packageJson.scripts.build||packageJson.scripts.test||packageJson.scripts.dev||packageJson.scripts.start);

      const hasDependencies =
        packageJson.dependencies||packageJson.devDependencies;
      const isPublishable = !packageJson.private||packageJson.publishConfig;

      return !!(hasSignificantScripts||hasDependencies||isPublishable);
    } catch {
      return false;
    }
  }

  /**
   * Traditional project discovery for non-monorepo projects
   */
  private traditionalProjectDiscovery(
    startPath: string,
  ): { projectId: string; projectPath: string; configPath: string }|null {
    let currentPath = startPath;

    while (currentPath !== path.dirname(currentPath)) {
      const indicators = ['.git',
        PACKAGE_JSON_FILENAME, // Node.js/TypeScript/React Native
        'CLAUDE.md',
        '.claude',
        'Cargo.toml', // Rust
        'go.mod', // Go
        'build.gradle', // Android
        'build.gradle.kts', // Android (Kotlin DSL)
        'app.json', // React Native/Expo
        'expo.json', // Expo
        'Podfile', // iOS (CocoaPods)
        'project.pbxproj', // iOS (Xcode)
      ];

      const hasIndicator = indicators.some((indicator) =>
        fs.existsSync(path.join(currentPath, indicator)),
      );

      if (hasIndicator) {
        try {
          const projectId = this.registerProjectSync(currentPath, {
            name: path.basename(currentPath),
            description: `Auto-discovered project at ${currentPath}`,
          });

          return {
            projectId,
            projectPath: currentPath,
            configPath: this.configDir,
          };
        } catch (error) {
          logger.warn('Failed to auto-register project:', error);
        }
      }

      currentPath = path.dirname(currentPath);
    }

    return null;
  }

  /**
   * Remove project from registry
   */
  async removeProject(
    idOrPath: string,
    options: { deleteDatabase?: boolean } = {},
  ): Promise<boolean> {
    const registry = this.loadRegistry();
    const project = this.getProject(idOrPath);

    if (!project) {
      return false;
    }

    delete registry.projects[project.id];
    this.saveRegistry();

    if (options.deleteDatabase) {
      const projectDir = path.join(this.projectsDir, project.id);
      try {
        await fsAsync.access(projectDir);
        await fsAsync.rm(projectDir, { recursive: true, force: true });
        logger.info(`Deleted project database directory: ${projectDir}`);
      } catch {
        // Directory doesn't exist or can't be deleted, that's okay
        logger.debug(`Project directory not found or couldn't be deleted: ${projectDir}`);
      }
    }

    logger.info(`Removed project: ${project.name} (${project.id})`);
    return true;
  }

  /**
   * Update project information
   */
  async updateProject(
    idOrPath: string,
    updates: Partial<Omit<ProjectInfo, 'id' | 'createdAt'>>,
  ): Promise<boolean> {
    const registry = this.loadRegistry();
    const project = this.getProject(idOrPath);

    if (!project) {
      return false;
    }

    // Apply updates
    const existingProject = registry.projects[project.id];
    if (!existingProject) {
      throw new Error(`Project ${project.id} not found in registry`);
    }
    Object.assign(existingProject, updates);
    existingProject.lastAccessedAt = new Date().toISOString();

    this.saveRegistry();

    logger.info(`Updated project: ${project.name} (${project.id})`);
    return await Promise.resolve(true);
  }
}

// Convenience functions
export function getProjectManager(): ProjectManager {
  return ProjectManager.getInstance();
}

export async function getProjectManagerAsync(): Promise<ProjectManager> {
  return await ProjectManager.getInstanceAsync();
}

export function getProjectConfig(): Config['project'] {
  return getConfig().project;
}

export async function findProjectRoot(startPath?: string): Promise<{
  projectId: string;
  projectPath: string;
  configPath: string;
} | null> {
  return await Promise.resolve(getProjectManager().findProjectRoot(startPath));
}

export async function registerCurrentProject(options?: {
  name?: string;
  description?: string;
  framework?: string;
  language?: string;
  metadata?: UnknownRecord;
}): Promise<string> {
  return await getProjectManager().registerProject(process.cwd(), options);
}

export default ProjectManager;
