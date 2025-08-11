/**
 * Workspace Screen.
 *
 * Document-driven development workflow management interface.
 * Handles project initialization, processing, and generation.
 */

import { access, readdir, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  WorkspaceCollectiveSystem,
  type WorkspaceFact,
  type WorkspaceFactStats,
} from '../../../utils/workspace-fact-system.js';
import {
  Header,
  InteractiveFooter,
  LoadingSpinner,
  StatusBadge,
  type SwarmStatus,
} from '../components/index/index.js';

export interface ProjectVision {
  missionStatement: string;
  strategicGoals: string[];
  businessValue: number; // 0-1 score
  technicalImpact: number; // 0-1 score
  marketPosition: string;
  targetOutcome: string;
  keyMetrics: string[];
  stakeholders: string[];
  timeline: string;
  risks: string[];
}

export interface WorkflowGateStatus {
  totalGates: number;
  pendingGates: number;
  approvedGates: number;
  blockedGates: number;
  lastGateActivity: Date | null;
  criticalGates: string[];
}

export interface WorkspaceProject {
  name: string;
  path: string;
  status: 'active' | 'idle' | 'processing' | 'error';
  lastModified: Date;
  documents: number;
  completionRate: number;
  totalFiles: number;
  codeFiles: number;
  configFiles: number;
  testFiles: number;
  size: number;
  projectVision: ProjectVision;
  workflowGates: WorkflowGateStatus;
  workspaceFacts?: WorkspaceFactStats;
  environmentSummary?: {
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
  };
}

export interface WorkspaceProps {
  swarmStatus?: SwarmStatus;
  onBack: () => void;
  onExit: () => void;
}

interface MenuItem {
  label: string;
  value: string;
  description?: string;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  swarmStatus,
  onBack,
  onExit,
}) => {
  const [projects, setProjects] = useState<WorkspaceProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [workspaceCollectiveSystems] = useState<
    Map<string, WorkspaceCollectiveSystem>
  >(new Map());

  // Load .gitignore patterns for proper file filtering
  const loadGitignorePatterns = useCallback(
    async (projectPath: string): Promise<Set<string>> => {
      try {
        const { readFile } = await import('node:fs/promises');
        const { join } = await import('node:path');

        const gitignorePatterns = new Set<string>();

        // Add default ignore patterns
        gitignorePatterns.add('.git');
        gitignorePatterns.add('node_modules');
        gitignorePatterns.add('.DS_Store');
        gitignorePatterns.add('*.log');

        // Load .gitignore file if it exists
        try {
          const gitignorePath = join(projectPath, '.gitignore');
          const gitignoreContent = await readFile(gitignorePath, 'utf8');

          gitignoreContent
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line && !line.startsWith('#'))
            .forEach((pattern) => {
              gitignorePatterns.add(pattern);
            });
        } catch {
          // .gitignore doesn't exist, use defaults
        }

        return gitignorePatterns;
      } catch (error) {
        console.warn('Error loading .gitignore patterns:', error);
        return new Set(['.git', 'node_modules', '.DS_Store', '*.log']);
      }
    },
    [],
  );

  // Check if path should be ignored based on .gitignore patterns
  const shouldIgnorePath = useCallback(
    (filePath: string, patterns: Set<string>, projectPath: string): boolean => {
      const { relative } = require('node:path');
      const relativePath = relative(projectPath, filePath);

      for (const pattern of patterns) {
        // Simple pattern matching (could be enhanced with proper glob matching)
        if (pattern.endsWith('*')) {
          const prefix = pattern.slice(0, -1);
          if (relativePath.startsWith(prefix)) return true;
        } else if (pattern.startsWith('*.')) {
          const extension = pattern.slice(1);
          if (filePath.endsWith(extension)) return true;
        } else if (
          relativePath === pattern ||
          relativePath.startsWith(pattern + '/')
        ) {
          return true;
        }
      }

      return false;
    },
    [],
  );

  // Get or create workspace-specific COLLECTIVE system (isolated per workspace)
  const getWorkspaceCollective = useCallback(
    async (
      workspaceId: string,
      workspacePath: string,
    ): Promise<WorkspaceCollectiveSystem> => {
      if (!workspaceCollectiveSystems.has(workspaceId)) {
        const collectiveSystem = new WorkspaceCollectiveSystem(
          workspaceId,
          workspacePath,
          {
            autoRefresh: true,
            refreshInterval: 60000, // 1 minute
            enableDeepAnalysis: true,
          },
        );

        await collectiveSystem.initialize();
        workspaceCollectiveSystems.set(workspaceId, collectiveSystem);
      }

      return workspaceCollectiveSystems.get(workspaceId)!;
    },
    [workspaceCollectiveSystems],
  );

  // Analyze directory to get project statistics
  const analyzeProject = useCallback(
    async (
      projectPath: string,
      projectName: string,
    ): Promise<WorkspaceProject | null> => {
      try {
        // Check if directory exists
        await access(projectPath);

        // Load .gitignore patterns
        const ignorePatterns = await loadGitignorePatterns(projectPath);

        const stats = {
          totalFiles: 0,
          documents: 0,
          codeFiles: 0,
          configFiles: 0,
          testFiles: 0,
          size: 0,
          lastModified: new Date(0),
        };

        // Helper function to analyze directory recursively with .gitignore support (no depth limits)
        const scanDirectory = async (
          dirPath: string,
          depth = 0,
        ): Promise<void> => {
          // No depth limit - scan everything that's not ignored

          try {
            const entries = await readdir(dirPath, { withFileTypes: true });

            for (const entry of entries) {
              const fullPath = join(dirPath, entry.name);

              // Check if path should be ignored based on .gitignore patterns
              if (shouldIgnorePath(fullPath, ignorePatterns, projectPath)) {
                continue;
              }

              // Additional hardcoded skips for performance (common patterns not in .gitignore)
              if (
                entry.isDirectory() &&
                [
                  '.next',
                  'dist',
                  'build',
                  'target',
                  'vendor',
                  'coverage',
                  '.nyc_output',
                  '.cache',
                ].includes(entry.name)
              ) {
                continue;
              }

              try {
                const fileStat = await stat(fullPath);

                if (entry.isDirectory()) {
                  await scanDirectory(fullPath, depth + 1);
                } else {
                  stats.totalFiles++;
                  stats.size += fileStat.size;

                  // Update last modified
                  if (fileStat.mtime > stats.lastModified) {
                    stats.lastModified = fileStat.mtime;
                  }

                  // Categorize files by extension
                  const ext = extname(entry.name).toLowerCase();
                  const filename = entry.name.toLowerCase();

                  // Document files
                  if (['.md', '.txt', '.rst', '.adoc', '.org'].includes(ext)) {
                    stats.documents++;
                  }

                  // Code files
                  else if (
                    [
                      '.ts',
                      '.tsx',
                      '.js',
                      '.jsx',
                      '.py',
                      '.rs',
                      '.go',
                      '.java',
                      '.c',
                      '.cpp',
                      '.h',
                      '.hpp',
                      '.cs',
                      '.php',
                      '.rb',
                      '.swift',
                      '.kt',
                      '.scala',
                      '.clj',
                      '.hs',
                      '.elm',
                      '.ex',
                      '.exs',
                      '.erl',
                      '.ml',
                      '.mli',
                      '.fs',
                      '.fsx',
                    ].includes(ext)
                  ) {
                    stats.codeFiles++;
                  }

                  // Test files
                  else if (
                    filename.includes('test') ||
                    filename.includes('spec') ||
                    entry.name.includes('.test.') ||
                    entry.name.includes('.spec.') ||
                    fullPath.includes('/test/') ||
                    fullPath.includes('/__tests__/')
                  ) {
                    stats.testFiles++;
                  }

                  // Config files
                  else if (
                    [
                      '.json',
                      '.yaml',
                      '.yml',
                      '.toml',
                      '.ini',
                      '.cfg',
                      '.config',
                      '.conf',
                    ].includes(ext) ||
                    [
                      'package.json',
                      'tsconfig.json',
                      'webpack.config.js',
                      'vite.config.js',
                      'next.config.js',
                      'tailwind.config.js',
                      'eslint.config.js',
                      '.eslintrc',
                      '.prettierrc',
                      'Dockerfile',
                      'docker-compose.yml',
                      'Cargo.toml',
                      'pyproject.toml',
                      'setup.py',
                      'requirements.txt',
                      'Gemfile',
                      'pom.xml',
                      'build.gradle',
                      'CMakeLists.txt',
                      'Makefile',
                    ].includes(entry.name)
                  ) {
                    stats.configFiles++;
                  }
                }
              } catch (statError) {}
            }
          } catch (readError) {
            // Skip directories we can't read
            return;
          }
        };

        await scanDirectory(projectPath);

        // Determine project status based on activity and file types
        const getProjectStatus = ():
          | 'active'
          | 'idle'
          | 'processing'
          | 'error' => {
          const hoursAgo =
            (Date.now() - stats.lastModified.getTime()) / (1000 * 60 * 60);

          // Check for common indicators of active development
          const hasRecentActivity = hoursAgo < 24;
          const hasGoodStructure = stats.documents > 0 && stats.codeFiles > 0;
          const hasTests = stats.testFiles > 0;

          if (hasRecentActivity && hasGoodStructure) {
            return 'active';
          }
          if (hasGoodStructure && hasTests) {
            return 'idle';
          }
          if (stats.totalFiles > 0) {
            return 'processing';
          }
          return 'error';
        };

        // Calculate completion rate based on various factors
        const calculateCompletionRate = (): number => {
          let score = 0;
          let maxScore = 0;

          // Documentation score (0-30 points)
          maxScore += 30;
          if (stats.documents > 0) score += Math.min(30, stats.documents * 5);

          // Code structure score (0-40 points)
          maxScore += 40;
          if (stats.codeFiles > 0) score += Math.min(40, stats.codeFiles * 2);

          // Configuration score (0-15 points)
          maxScore += 15;
          if (stats.configFiles > 0)
            score += Math.min(15, stats.configFiles * 3);

          // Testing score (0-15 points)
          maxScore += 15;
          if (stats.testFiles > 0) score += Math.min(15, stats.testFiles * 5);

          return Math.round((score / maxScore) * 100);
        };

        // Use the strategic vision service for comprehensive analysis
        let projectVision: ProjectVision;
        try {
          const visionService = await import(
            '../../../coordination/services/strategic-vision-service.js'
          ).catch(() => null);
          if (visionService?.StrategicVisionService) {
            const service = new visionService.StrategicVisionService();

            // Try to get vision from database first
            const visionAnalysis =
              await service.getVisionForWorkspace(projectName);
            projectVision = {
              missionStatement: visionAnalysis.missionStatement,
              strategicGoals: visionAnalysis.strategicGoals,
              businessValue: visionAnalysis.businessValue,
              technicalImpact: visionAnalysis.technicalImpact,
              marketPosition: visionAnalysis.marketPosition,
              targetOutcome: visionAnalysis.targetOutcome,
              keyMetrics: visionAnalysis.keyMetrics,
              stakeholders: visionAnalysis.stakeholders,
              timeline: visionAnalysis.timeline,
              risks: visionAnalysis.risks,
            };

            // If no documents in database, try to import them
            if (visionAnalysis.confidenceScore < 0.3) {
              const importResults = await service.importStrategicDocuments({
                projectId: projectName,
                projectPath,
                importFromFiles: true,
                skipExistingDocuments: true,
              });

              if (importResults.imported > 0) {
                // Re-analyze after import
                const updatedAnalysis =
                  await service.analyzeProjectVision(projectName);
                projectVision = {
                  missionStatement: updatedAnalysis.missionStatement,
                  strategicGoals: updatedAnalysis.strategicGoals,
                  businessValue: updatedAnalysis.businessValue,
                  technicalImpact: updatedAnalysis.technicalImpact,
                  marketPosition: updatedAnalysis.marketPosition,
                  targetOutcome: updatedAnalysis.targetOutcome,
                  keyMetrics: updatedAnalysis.keyMetrics,
                  stakeholders: updatedAnalysis.stakeholders,
                  timeline: updatedAnalysis.timeline,
                  risks: updatedAnalysis.risks,
                };
              }
            }
          } else {
            // Fallback to basic analysis
            projectVision = await analyzeProjectVision(
              projectPath,
              stats.documents,
            );
          }
        } catch (visionError) {
          console.warn(
            'Could not use StrategicVisionService, falling back to basic analysis:',
            visionError,
          );
          projectVision = await analyzeProjectVision(
            projectPath,
            stats.documents,
          );
        }

        // Get workflow gates status
        const workflowGates = await getWorkflowGatesStatus(projectName);

        // Initialize workspace-specific COLLECTIVE (isolated, not shared between workspaces)
        let workspaceFacts: WorkspaceFactStats | undefined;
        let environmentSummary:
          | WorkspaceProject['environmentSummary']
          | undefined;

        try {
          const workspaceCollective = await getWorkspaceCollective(
            projectName,
            projectPath,
          );
          workspaceFacts = await workspaceCollective.getStats();
          environmentSummary = await workspaceCollective.getWorkspaceSummary();

          // Add custom fact about project analysis to THIS workspace's collective
          await workspaceCollective.addCustomFact(
            'project-analysis',
            'file-stats',
            {
              totalFiles: stats.totalFiles,
              codeFiles: stats.codeFiles,
              documents: stats.documents,
              testFiles: stats.testFiles,
              configFiles: stats.configFiles,
              lastAnalyzed: new Date().toISOString(),
            },
            { source: 'workspace-analyzer', confidence: 1.0 },
          );
        } catch (factError) {
          console.warn(
            `Failed to initialize workspace collective for ${projectName}:`,
            factError,
          );
        }

        return {
          name: projectName,
          path: projectPath,
          status: getProjectStatus(),
          lastModified: stats.lastModified,
          documents: stats.documents,
          completionRate: calculateCompletionRate(),
          totalFiles: stats.totalFiles,
          codeFiles: stats.codeFiles,
          configFiles: stats.configFiles,
          testFiles: stats.testFiles,
          size: stats.size,
          projectVision,
          workflowGates,
          workspaceFacts,
          environmentSummary,
        };
      } catch (error) {
        console.error(`Error analyzing project ${projectName}:`, error);
        return null;
      }
    },
    [],
  );

  // Analyze project vision from documentation using domain discovery and document systems
  const analyzeProjectVision = useCallback(
    async (
      projectPath: string,
      documentCount: number,
    ): Promise<ProjectVision> => {
      try {
        // Default/fallback vision data
        const defaultVision: ProjectVision = {
          missionStatement: 'Project mission not yet defined',
          strategicGoals: [],
          businessValue: 0.5,
          technicalImpact: 0.5,
          marketPosition: 'Not analyzed',
          targetOutcome: 'Outcome not specified',
          keyMetrics: [],
          stakeholders: [],
          timeline: 'Timeline not established',
          risks: [],
        };

        if (documentCount === 0) {
          return defaultVision;
        }

        // Try to connect to the domain discovery bridge for sophisticated analysis
        const domainDiscoveryModule = await import(
          '../../../coordination/discovery/domain-discovery-bridge.js'
        ).catch(() => null);
        const documentManagerModule = await import(
          '../../../database/managers/document-manager.js'
        ).catch(() => null);

        let advancedVision: ProjectVision | null = null;

        if (
          domainDiscoveryModule?.DomainDiscoveryBridge &&
          documentManagerModule?.DocumentManager
        ) {
          try {
            // Use the sophisticated domain discovery system for vision analysis
            const projectName = projectPath.split('/').pop() || 'unknown';

            // Try to get structured vision from document manager
            const docManager = new documentManagerModule.DocumentManager();
            const visionDocs = await docManager
              .searchDocuments({
                searchType: 'keyword',
                query: 'vision mission strategy goals',
                documentTypes: ['vision', 'prd', 'epic'],
                projectId: projectName,
              })
              .catch(() => null);

            if (visionDocs?.data?.documents?.length > 0) {
              const visionDoc = visionDocs.data.documents[0];
              advancedVision = {
                missionStatement:
                  visionDoc.summary ||
                  visionDoc.title ||
                  defaultVision.missionStatement,
                strategicGoals: visionDoc.keywords || [],
                businessValue: 0.8, // High confidence from structured document
                technicalImpact: 0.8,
                marketPosition:
                  visionDoc.metadata?.market_position || 'Document-defined',
                targetOutcome:
                  visionDoc.metadata?.target_outcome ||
                  'Document-specified outcome',
                keyMetrics: visionDoc.metadata?.key_metrics || [
                  'Quality',
                  'Performance',
                  'User satisfaction',
                ],
                stakeholders: visionDoc.metadata?.stakeholders || [
                  'Development team',
                  'Product team',
                ],
                timeline:
                  visionDoc.metadata?.timeline || 'Defined in documentation',
                risks: visionDoc.metadata?.risks || [
                  'Technical complexity',
                  'Resource constraints',
                ],
              };
            }
          } catch (domainError) {
            console.warn('Could not use domain discovery system:', domainError);
          }
        }

        // If we got advanced vision from the document system, use it
        if (advancedVision) {
          return advancedVision;
        }

        // Fallback to enhanced file-based analysis with TODO scanning
        const { access, readFile, readdir } = await import('node:fs/promises');
        const { join, extname } = await import('node:path');

        // Comprehensive document scanning including TODO files and code comments
        const visionFiles = [
          'README.md',
          'VISION.md',
          'STRATEGY.md',
          'PROJECT.md',
          'ARCHITECTURE.md',
          'TODO.md',
          'ROADMAP.md',
        ];
        let visionContent = '';
        let todoContent = '';

        // Scan for vision documents
        for (const file of visionFiles) {
          try {
            const filePath = join(projectPath, file);
            await access(filePath);
            const content = await readFile(filePath, 'utf8');
            visionContent += content + '\n';

            if (file === 'TODO.md' || file === 'ROADMAP.md') {
              todoContent += content + '\n';
            }
          } catch {
            // File doesn't exist, continue to next
          }
        }

        // Scan code files for TODO comments and strategic annotations
        try {
          const srcPath = join(projectPath, 'src');
          await access(srcPath);
          const codeFiles = await readdir(srcPath, { recursive: true });

          for (const file of codeFiles.slice(0, 50)) {
            // Limit to first 50 files for performance
            if (
              typeof file === 'string' &&
              ['.ts', '.tsx', '.js', '.jsx'].includes(extname(file))
            ) {
              try {
                const filePath = join(srcPath, file);
                const content = await readFile(filePath, 'utf8');

                // Extract TODO comments and strategic annotations
                const todoMatches =
                  content.match(
                    /\/\/\s*TODO[:\s]*(.*)|\/\*\s*TODO[:\s]*(.*?)\*\//gi,
                  ) || [];
                const strategyMatches =
                  content.match(
                    /\/\/\s*STRATEGY[:\s]*(.*)|\/\*\s*STRATEGY[:\s]*(.*?)\*\//gi,
                  ) || [];
                const visionMatches =
                  content.match(
                    /\/\/\s*VISION[:\s]*(.*)|\/\*\s*VISION[:\s]*(.*?)\*\//gi,
                  ) || [];

                todoContent += todoMatches.join('\n') + '\n';
                visionContent +=
                  strategyMatches.join('\n') +
                  '\n' +
                  visionMatches.join('\n') +
                  '\n';
              } catch {
                // Skip files we can't read
              }
            }
          }
        } catch {
          // Src directory doesn't exist or can't be read
        }

        if (visionContent.length === 0) {
          return defaultVision;
        }

        // Enhanced text analysis with TODO integration
        const lowerContent = visionContent.toLowerCase();

        // Extract strategic goals from headings, bullet points, and TODO items
        const goalMatches =
          visionContent.match(
            /(?:goal|objective|target|todo)[s]?:?\s*(.+)/gi,
          ) || [];
        const strategicGoals = goalMatches
          .slice(0, 8)
          .map((match) =>
            match
              .replace(/(?:goal|objective|target|todo)[s]?:?\s*/i, '')
              .trim(),
          );

        // Enhanced business value calculation with domain-specific keywords
        const businessKeywords = [
          'revenue',
          'profit',
          'customer',
          'market',
          'business',
          'commercial',
          'roi',
          'user',
          'growth',
          'value',
        ];
        const businessScore = Math.min(
          1.0,
          businessKeywords.filter((kw) => lowerContent.includes(kw)).length /
            businessKeywords.length,
        );

        // Enhanced technical impact calculation
        const techKeywords = [
          'scalability',
          'performance',
          'architecture',
          'innovation',
          'technology',
          'framework',
          'optimization',
          'reliability',
        ];
        const techScore = Math.min(
          1.0,
          techKeywords.filter((kw) => lowerContent.includes(kw)).length /
            techKeywords.length,
        );

        // Extract stakeholders with enhanced patterns
        const stakeholderMatches =
          visionContent.match(
            /(?:stakeholder|user|client|customer|team|developer)[s]?:?\s*(.+)/gi,
          ) || [];
        const stakeholders = stakeholderMatches
          .slice(0, 5)
          .map((match) =>
            match
              .replace(
                /(?:stakeholder|user|client|customer|team|developer)[s]?:?\s*/i,
                '',
              )
              .trim(),
          );

        // Extract risks and challenges from TODO items and documentation
        const riskMatches =
          (visionContent + todoContent).match(
            /(?:risk|challenge|concern|issue|problem|blocker)[s]?:?\s*(.+)/gi,
          ) || [];
        const risks = riskMatches
          .slice(0, 5)
          .map((match) =>
            match
              .replace(
                /(?:risk|challenge|concern|issue|problem|blocker)[s]?:?\s*/i,
                '',
              )
              .trim(),
          );

        // Extract key metrics from content
        const metricMatches =
          visionContent.match(
            /(?:metric|kpi|measure|target|benchmark)[s]?:?\s*(.+)/gi,
          ) || [];
        const keyMetrics =
          metricMatches.length > 0
            ? metricMatches
                .slice(0, 4)
                .map((match) =>
                  match
                    .replace(
                      /(?:metric|kpi|measure|target|benchmark)[s]?:?\s*/i,
                      '',
                    )
                    .trim(),
                )
            : [
                'Performance',
                'Quality',
                'User satisfaction',
                'Development velocity',
              ];

        return {
          missionStatement:
            visionContent
              .split('\n')
              .find((line) => line.length > 20 && line.length < 200)
              ?.substring(0, 200) || defaultVision.missionStatement,
          strategicGoals:
            strategicGoals.length > 0
              ? strategicGoals
              : [
                  'Improve system reliability',
                  'Enhance user experience',
                  'Increase development efficiency',
                ],
          businessValue: businessScore,
          technicalImpact: techScore,
          marketPosition:
            businessScore > 0.6
              ? 'Market-focused'
              : techScore > 0.6
                ? 'Technology-focused'
                : 'Balanced approach',
          targetOutcome:
            strategicGoals[0] ||
            'Successful project delivery and user satisfaction',
          keyMetrics,
          stakeholders:
            stakeholders.length > 0
              ? stakeholders
              : ['Development team', 'End users', 'Product team'],
          timeline:
            lowerContent.includes('timeline') ||
            lowerContent.includes('deadline') ||
            lowerContent.includes('roadmap')
              ? 'Timeline specified'
              : 'Timeline TBD',
          risks:
            risks.length > 0
              ? risks
              : [
                  'Technical complexity',
                  'Resource constraints',
                  'Timeline pressure',
                ],
        };
      } catch (error) {
        console.error('Error analyzing project vision:', error);
        return {
          missionStatement: 'Analysis failed - check system logs',
          strategicGoals: [],
          businessValue: 0,
          technicalImpact: 0,
          marketPosition: 'Unknown',
          targetOutcome: 'Unknown',
          keyMetrics: [],
          stakeholders: [],
          timeline: 'Unknown',
          risks: ['Analysis error', 'System integration issues'],
        };
      }
    },
    [],
  );

  // Get workflow gates status from the existing gate system
  const getWorkflowGatesStatus = useCallback(
    async (projectName: string): Promise<WorkflowGateStatus> => {
      try {
        // Try to connect to the existing WorkflowGateRequest system
        const workflowGateModule = await import(
          '../../../coordination/workflows/workflow-gate-request.js'
        ).catch(() => null);

        if (workflowGateModule?.WorkflowGateRequest) {
          // Get actual gate data from the sophisticated gate system
          const gateData =
            await workflowGateModule.WorkflowGateRequest.getProjectGates?.(
              projectName,
            ).catch(() => null);

          if (gateData) {
            return {
              totalGates: gateData.total || 0,
              pendingGates: gateData.pending || 0,
              approvedGates: gateData.approved || 0,
              blockedGates: gateData.blocked || 0,
              lastGateActivity: gateData.lastActivity
                ? new Date(gateData.lastActivity)
                : null,
              criticalGates: gateData.critical || [],
            };
          }
        }

        // Fallback: analyze project structure to infer gate status
        const { access, readdir } = await import('node:fs/promises');
        const { join } = await import('node:path');

        let totalGates = 0;
        let pendingGates = 0;
        let approvedGates = 0;

        // Check for common workflow indicators
        const workflowPaths = [
          '.github/workflows',
          'docs/decisions',
          'docs/adr',
        ];

        for (const workflowPath of workflowPaths) {
          try {
            const fullPath = join(
              '/home/mhugo/code/claude-code-zen',
              workflowPath,
            );
            await access(fullPath);
            const files = await readdir(fullPath);
            totalGates += files.length;
            // Simple heuristic: newer files are pending, older ones approved
            approvedGates += Math.floor(files.length * 0.7);
            pendingGates += Math.ceil(files.length * 0.3);
          } catch {
            // Path doesn't exist
          }
        }

        return {
          totalGates,
          pendingGates,
          approvedGates,
          blockedGates: 0,
          lastGateActivity: new Date(),
          criticalGates: pendingGates > 5 ? ['High pending gate count'] : [],
        };
      } catch (error) {
        console.error('Error getting workflow gates status:', error);
        return {
          totalGates: 0,
          pendingGates: 0,
          approvedGates: 0,
          blockedGates: 0,
          lastGateActivity: null,
          criticalGates: [],
        };
      }
    },
    [],
  );

  // Load real workspace projects data
  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);

      const projectPaths = [
        { name: 'claude-code-zen', path: '/home/mhugo/code/claude-code-zen' },
        {
          name: 'singularity-engine',
          path: '/home/mhugo/code/singularity-engine',
        },
        { name: 'architecturemcp', path: '/home/mhugo/code/architecturemcp' },
      ];

      const projectPromises = projectPaths.map(({ name, path }) =>
        analyzeProject(path, name),
      );

      const results = await Promise.all(projectPromises);
      const validProjects = results.filter(
        (project): project is WorkspaceProject => project !== null,
      );

      setProjects(validProjects);
      setIsLoading(false);
    };

    loadProjects();
  }, [analyzeProject, getWorkspaceCollective]);

  // Refresh projects data
  const refreshProjects = useCallback(async () => {
    setIsLoading(true);

    const projectPaths = [
      { name: 'claude-code-zen', path: '/home/mhugo/code/claude-code-zen' },
      {
        name: 'singularity-engine',
        path: '/home/mhugo/code/singularity-engine',
      },
      { name: 'architecturemcp', path: '/home/mhugo/code/architecturemcp' },
    ];

    const projectPromises = projectPaths.map(({ name, path }) =>
      analyzeProject(path, name),
    );

    const results = await Promise.all(projectPromises);
    const validProjects = results.filter(
      (project): project is WorkspaceProject => project !== null,
    );

    setProjects(validProjects);
    setIsLoading(false);
  }, [analyzeProject, getWorkspaceCollective]);

  // Cleanup workspace collective systems on unmount
  useEffect(() => {
    return () => {
      // Shutdown all workspace collective systems when component unmounts
      // Each workspace has its own isolated collective - no sharing between workspaces
      for (const [
        workspaceId,
        collectiveSystem,
      ] of workspaceCollectiveSystems.entries()) {
        collectiveSystem.shutdown();
      }
      workspaceCollectiveSystems.clear();
    };
  }, [workspaceCollectiveSystems]);

  // Handle keyboard input
  useInput((input, key) => {
    if (key.escape || input === 'q' || input === 'Q') {
      onBack();
    } else if (input === 'r' || input === 'R') {
      refreshProjects();
    }
  });

  const menuItems: MenuItem[] = [
    {
      label: '📂 Open Project',
      value: 'open',
      description: 'Open and activate an existing workspace project',
    },
    {
      label: '🎯 Strategic Dashboard',
      value: 'dashboard',
      description: 'View integrated vision-document-task dashboard',
    },
    {
      label: '🧠 Workspace Collective',
      value: 'workspace-collective',
      description:
        "View this workspace's collective facts (Nix, BEAM languages, tools) - isolated per workspace",
    },
    {
      label: '✅ Generate Strategic Tasks',
      value: 'generate-tasks',
      description: 'Auto-generate tasks from strategic vision and documents',
    },
    {
      label: '🆕 Initialize New Workspace',
      value: 'init',
      description: 'Create a new document-driven development workspace',
    },
    {
      label: '⚙️ Process Documents',
      value: 'process',
      description: 'Process workspace documents and generate artifacts',
    },
    {
      label: '📊 Project Status',
      value: 'status',
      description: 'View detailed status of workspace projects',
    },
    {
      label: '🔄 Sync & Generate',
      value: 'generate',
      description: 'Synchronize documents and generate code/documentation',
    },
    {
      label: '📝 Template Management',
      value: 'templates',
      description: 'Manage project templates and scaffolding',
    },
    {
      label: '🔙 Back to Main Menu',
      value: 'back',
      description: 'Return to the main menu',
    },
  ];

  const handleSelect = (item: MenuItem) => {
    setSelectedAction(item.value);

    switch (item.value) {
      case 'back':
        onBack();
        break;
      case 'open':
      case 'init':
      case 'process':
      case 'status':
      case 'generate':
      case 'templates':
        // Handle other actions
        break;
      default:
        break;
    }
  };

  const getProjectStatusBadge = (project: WorkspaceProject) => {
    const statusMap = {
      active: { status: 'active', text: 'Active' },
      idle: { status: 'idle', text: 'Idle' },
      processing: { status: 'loading', text: 'Processing' },
      error: { status: 'error', text: 'Error' },
    };

    const { status, text } = statusMap[project.status];
    return (
      <StatusBadge
        status={status as any}
        text={text}
        variant="minimal"
      />
    );
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
  };

  const formatLastModified = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) {
      return 'Just now';
    }
    if (diffHours < 24) {
      return `${Math.floor(diffHours)} hours ago`;
    }
    if (diffDays < 7) {
      return `${Math.floor(diffDays)} days ago`;
    }
    return date.toLocaleDateString();
  };

  const renderProjectsTable = () => (
    <Box
      flexDirection="column"
      marginBottom={2}
    >
      <Text bold>📋 Workspace Projects:</Text>
      <Box marginBottom={1} />

      {projects.map((project) => (
        <Box
          key={project.name}
          flexDirection="column"
          marginBottom={2}
          borderStyle="single"
          borderColor="gray"
          padding={1}
        >
          <Box
            justifyContent="space-between"
            marginBottom={1}
          >
            <Box
              flexDirection="column"
              width="60%"
            >
              <Text
                bold
                color="cyan"
              >
                {project.name}
              </Text>
              <Text dimColor>{project.path}</Text>
              <Text dimColor>
                Last modified: {formatLastModified(project.lastModified)}
              </Text>
            </Box>
            <Box alignItems="center">{getProjectStatusBadge(project)}</Box>
          </Box>

          <Box
            flexDirection="row"
            justifyContent="space-between"
            marginTop={1}
          >
            <Box
              flexDirection="column"
              width="20%"
            >
              <Text color="yellow">📄 Total Files:</Text>
              <Text bold>{project.totalFiles}</Text>
            </Box>
            <Box
              flexDirection="column"
              width="20%"
            >
              <Text color="blue">🔧 Code Files:</Text>
              <Text bold>{project.codeFiles}</Text>
            </Box>
            <Box
              flexDirection="column"
              width="20%"
            >
              <Text color="green">📝 Documents:</Text>
              <Text bold>{project.documents}</Text>
            </Box>
            <Box
              flexDirection="column"
              width="20%"
            >
              <Text color="red">🧪 Tests:</Text>
              <Text bold>{project.testFiles}</Text>
            </Box>
            <Box
              flexDirection="column"
              width="20%"
            >
              <Text color="cyan">📊 Progress:</Text>
              <Text bold>{project.completionRate}%</Text>
            </Box>
          </Box>

          <Box
            marginTop={1}
            flexDirection="column"
          >
            <Text color="gray">
              💾 Size: {formatFileSize(project.size)} • ⚙️ Config:{' '}
              {project.configFiles} files
            </Text>

            {/* Strategic Vision Data */}
            <Box
              flexDirection="row"
              marginTop={1}
            >
              <Box width="50%">
                <Text
                  color="magenta"
                  bold
                >
                  🎯 Vision:
                </Text>
                <Text
                  color="white"
                  wrap="wrap"
                >
                  {project.projectVision.missionStatement.substring(0, 60)}
                  {project.projectVision.missionStatement.length > 60
                    ? '...'
                    : ''}
                </Text>
                <Text color="yellow">
                  💼 Business Value:{' '}
                  {Math.round(project.projectVision.businessValue * 100)}% • 🔧
                  Tech Impact:{' '}
                  {Math.round(project.projectVision.technicalImpact * 100)}%
                </Text>
              </Box>

              <Box
                width="50%"
                marginLeft={2}
              >
                <Text
                  color="cyan"
                  bold
                >
                  🚪 Workflow Gates:
                </Text>
                <Text color="green">
                  ✅ {project.workflowGates.approvedGates} approved • 🕒{' '}
                  {project.workflowGates.pendingGates} pending
                </Text>
                {project.workflowGates.criticalGates.length > 0 && (
                  <Text color="red">
                    🚨 {project.workflowGates.criticalGates.length} critical
                    issues
                  </Text>
                )}
              </Box>
            </Box>

            {/* Strategic Goals with Task Integration */}
            {project.projectVision.strategicGoals.length > 0 && (
              <Box
                marginTop={1}
                flexDirection="column"
              >
                <Text
                  color="blue"
                  bold
                >
                  📋 Goals:{' '}
                </Text>
                <Text color="white">
                  {project.projectVision.strategicGoals.slice(0, 2).join(' • ')}
                  {project.projectVision.strategicGoals.length > 2
                    ? ' • ...'
                    : ''}
                </Text>
                <Box
                  flexDirection="row"
                  marginTop={1}
                >
                  <Text color="gray">
                    📄 {project.documents} docs • 🔧 {project.codeFiles} code
                    files • ✅ Tasks: Auto-generated from strategic goals
                  </Text>
                </Box>
              </Box>
            )}

            {/* Workspace-Specific Collective Facts (No sharing between workspaces) */}
            {project.environmentSummary && (
              <Box
                marginTop={1}
                flexDirection="column"
                borderStyle="single"
                borderColor="cyan"
                padding={1}
              >
                <Text
                  color="cyan"
                  bold
                >
                  🧠 Collective Facts (This Workspace Only):
                </Text>
                <Box
                  flexDirection="row"
                  justifyContent="space-between"
                  marginTop={1}
                >
                  <Box width="20%">
                    <Text color="green">🧰 Tools:</Text>
                    <Text bold>
                      {project.environmentSummary.tools.available}/
                      {project.environmentSummary.tools.total}
                    </Text>
                  </Box>
                  <Box width="20%">
                    <Text color="blue">❄️ Nix:</Text>
                    <Text
                      bold
                      color={
                        project.environmentSummary.hasNix ? 'green' : 'red'
                      }
                    >
                      {project.environmentSummary.hasNix ? '✓' : '✗'}
                    </Text>
                  </Box>
                  <Box width="20%">
                    <Text color="purple">🐳 Docker:</Text>
                    <Text
                      bold
                      color={
                        project.environmentSummary.hasDocker ? 'green' : 'red'
                      }
                    >
                      {project.environmentSummary.hasDocker ? '✓' : '✗'}
                    </Text>
                  </Box>
                  <Box width="20%">
                    <Text color="yellow">📋 Languages:</Text>
                    <Text bold>
                      {project.environmentSummary.languages.length}
                    </Text>
                  </Box>
                  <Box width="20%">
                    <Text color="magenta">🔧 Frameworks:</Text>
                    <Text bold>
                      {project.environmentSummary.frameworks.length}
                    </Text>
                  </Box>
                </Box>

                {project.environmentSummary.suggestions.length > 0 && (
                  <Box marginTop={1}>
                    <Text color="yellow">
                      💡 Suggestions:{' '}
                      {project.environmentSummary.suggestions.length} available
                    </Text>
                  </Box>
                )}

                {/* Version-specific FACT integration */}
                {project.environmentSummary.toolsWithDocs && (
                  <Box
                    marginTop={1}
                    flexDirection="column"
                  >
                    <Text color="cyan">📚 FACT Documentation Available:</Text>
                    <Box
                      flexDirection="row"
                      flexWrap="wrap"
                      marginTop={1}
                    >
                      {project.environmentSummary.toolsWithDocs
                        .filter((tool) => tool.hasDocumentation)
                        .slice(0, 6) // Limit display to first 6 tools with docs
                        .map((tool, index) => (
                          <Box
                            key={index}
                            marginRight={2}
                            marginBottom={1}
                          >
                            <Text color="green">
                              ✓ {tool.name}
                              {tool.version ? `@${tool.version}` : ''}
                            </Text>
                          </Box>
                        ))}
                    </Box>
                    <Text
                      color="gray"
                      dimColor
                      marginTop={1}
                    >
                      {
                        project.environmentSummary.toolsWithDocs.filter(
                          (t) => t.hasDocumentation,
                        ).length
                      }{' '}
                      tools with version-specific docs,{' '}
                      {
                        project.environmentSummary.toolsWithDocs.filter(
                          (t) => !t.hasDocumentation,
                        ).length
                      }{' '}
                      without
                    </Text>
                  </Box>
                )}

                {project.workspaceFacts && (
                  <Box
                    marginTop={1}
                    flexDirection="row"
                    justifyContent="space-between"
                  >
                    <Text color="gray">
                      🧠 Collective Stats: {project.workspaceFacts.totalFacts}{' '}
                      facts • 🌍 Env: {project.workspaceFacts.environmentFacts}{' '}
                      • 💾 Cache:{' '}
                      {Math.round(project.workspaceFacts.cacheHitRate * 100)}%
                    </Text>
                    <Text
                      color="gray"
                      dimColor
                    >
                      Updated:{' '}
                      {new Date(
                        project.workspaceFacts.lastUpdated,
                      ).toLocaleTimeString()}
                    </Text>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );

  const renderWorkspaceStats = () => (
    <Box
      flexDirection="column"
      marginBottom={2}
    >
      <Text bold>📊 Workspace Statistics:</Text>
      <Box marginBottom={1} />

      <Box
        flexDirection="row"
        justifyContent="space-between"
        marginBottom={1}
      >
        <Box
          flexDirection="column"
          width="20%"
        >
          <Text color="cyan">Total Projects:</Text>
          <Text bold>{projects.length}</Text>
        </Box>
        <Box
          flexDirection="column"
          width="20%"
        >
          <Text color="green">Active Projects:</Text>
          <Text bold>
            {projects.filter((p) => p.status === 'active').length}
          </Text>
        </Box>
        <Box
          flexDirection="column"
          width="20%"
        >
          <Text color="yellow">Total Files:</Text>
          <Text bold>{projects.reduce((sum, p) => sum + p.totalFiles, 0)}</Text>
        </Box>
        <Box
          flexDirection="column"
          width="20%"
        >
          <Text color="blue">Code Files:</Text>
          <Text bold>{projects.reduce((sum, p) => sum + p.codeFiles, 0)}</Text>
        </Box>
        <Box
          flexDirection="column"
          width="20%"
        >
          <Text color="purple">Total Size:</Text>
          <Text bold>
            {formatFileSize(projects.reduce((sum, p) => sum + p.size, 0))}
          </Text>
        </Box>
      </Box>

      <Box
        flexDirection="row"
        justifyContent="space-between"
      >
        <Box
          flexDirection="column"
          width="20%"
        >
          <Text color="green">Documents:</Text>
          <Text bold>{projects.reduce((sum, p) => sum + p.documents, 0)}</Text>
        </Box>
        <Box
          flexDirection="column"
          width="20%"
        >
          <Text color="red">Test Files:</Text>
          <Text bold>{projects.reduce((sum, p) => sum + p.testFiles, 0)}</Text>
        </Box>
        <Box
          flexDirection="column"
          width="20%"
        >
          <Text color="orange">Config Files:</Text>
          <Text bold>
            {projects.reduce((sum, p) => sum + p.configFiles, 0)}
          </Text>
        </Box>
        <Box
          flexDirection="column"
          width="20%"
        >
          <Text color="cyan">Avg Progress:</Text>
          <Text bold>
            {Math.round(
              projects.reduce((sum, p) => sum + p.completionRate, 0) /
                projects.length,
            )}
            %
          </Text>
        </Box>
        <Box
          flexDirection="column"
          width="20%"
        >
          <Text color="magenta">Avg Vision:</Text>
          <Text bold>
            {Math.round(
              projects.reduce(
                (sum, p) =>
                  sum +
                  (p.projectVision.businessValue +
                    p.projectVision.technicalImpact) *
                    50,
                0,
              ) / projects.length,
            )}
            %
          </Text>
        </Box>
      </Box>

      {/* Strategic Vision Summary */}
      <Box
        flexDirection="row"
        justifyContent="space-between"
        marginTop={2}
        borderStyle="single"
        borderColor="magenta"
        padding={1}
      >
        <Box
          flexDirection="column"
          width="25%"
        >
          <Text
            color="magenta"
            bold
          >
            🎯 Strategic Vision:
          </Text>
          <Text color="yellow">
            Total Gates:{' '}
            {projects.reduce((sum, p) => sum + p.workflowGates.totalGates, 0)}
          </Text>
        </Box>
        <Box
          flexDirection="column"
          width="25%"
        >
          <Text color="green">✅ Approved Gates:</Text>
          <Text bold>
            {projects.reduce(
              (sum, p) => sum + p.workflowGates.approvedGates,
              0,
            )}
          </Text>
        </Box>
        <Box
          flexDirection="column"
          width="25%"
        >
          <Text color="yellow">🕒 Pending Gates:</Text>
          <Text bold>
            {projects.reduce((sum, p) => sum + p.workflowGates.pendingGates, 0)}
          </Text>
        </Box>
        <Box
          flexDirection="column"
          width="25%"
        >
          <Text color="red">🚨 Critical Issues:</Text>
          <Text bold>
            {projects.reduce(
              (sum, p) => sum + p.workflowGates.criticalGates.length,
              0,
            )}
          </Text>
        </Box>
      </Box>
    </Box>
  );

  if (isLoading) {
    return (
      <Box
        flexDirection="column"
        height="100%"
      >
        <Header
          title="Workspace"
          swarmStatus={swarmStatus}
          showBorder={true}
        />
        <Box
          flexGrow={1}
          justifyContent="center"
          alignItems="center"
        >
          <LoadingSpinner text="Loading workspace projects..." />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      flexDirection="column"
      height="100%"
    >
      <Header
        title="Document-Driven Development Workspace"
        swarmStatus={swarmStatus}
        showBorder={true}
      />

      <Box
        flexGrow={1}
        paddingX={2}
      >
        <Box
          flexDirection="column"
          width="100%"
        >
          {renderWorkspaceStats()}
          {renderProjectsTable()}

          <Text bold>Select an action:</Text>
          <Box marginBottom={1} />

          <SelectInput
            items={menuItems}
            onSelect={handleSelect}
            itemComponent={({ isSelected, label }) => (
              <Text color={isSelected ? 'cyan' : 'white'}>
                {isSelected ? '▶ ' : '  '}
                {label}
              </Text>
            )}
          />
        </Box>
      </Box>

      <InteractiveFooter
        currentScreen="Workspace"
        availableScreens={[
          { key: '↑↓', name: 'Navigate' },
          { key: 'Enter', name: 'Select' },
          { key: 'R', name: 'Refresh' },
          { key: 'Esc/Q', name: 'Back' },
        ]}
        status={`${projects.filter((p) => p.status === 'active').length}/${projects.length} active • ${projects.reduce((sum, p) => sum + p.totalFiles, 0)} total files`}
      />
    </Box>
  );
};

export default Workspace;
