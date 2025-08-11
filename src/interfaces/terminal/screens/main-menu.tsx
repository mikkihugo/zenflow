/**
 * Main Menu Screen.
 *
 * Interactive menu system for TUI mode navigation.
 * Consolidates menu functionality from command execution interface.
 */
/**
 * @file Interface implementation: main-menu.
 */

import { access, readdir, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import BeamLanguageParser from '../../../parsers/beam-language-parser.js';
import EnvironmentDetector, {
  type EnvironmentSnapshot,
} from '../../../utils/environment-detector.js';
import {
  Header,
  InteractiveFooter,
  StatusBadge,
  type SwarmStatus,
} from '../components/index/index.js';
import { getVersion } from '../utils/version-utils.js';

export interface MenuItem {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

export interface ProjectOverview {
  name: string;
  path: string;
  status: 'active' | 'idle' | 'error';
  totalFiles: number;
  codeFiles: number;
  lastModified: Date;
  size: number;
}

export interface MenuProps {
  title?: string;
  items?: MenuItem[];
  swarmStatus?: SwarmStatus;
  onSelect: (value: string) => void;
  onExit: () => void;
  showHeader?: boolean;
  showFooter?: boolean;
}

/**
 * Main Menu Screen Component.
 *
 * Provides interactive navigation for TUI mode.
 *
 * @param root0
 * @param root0.title
 * @param root0.items
 * @param root0.swarmStatus
 * @param root0.onSelect
 * @param root0.onExit
 * @param root0.showHeader
 * @param root0.showFooter
 */
export const Menu: React.FC<MenuProps> = ({
  title = 'Claude Code Zen',
  items,
  swarmStatus,
  onSelect,
  onExit,
  showHeader = true,
  showFooter = true,
}) => {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [projects, setProjects] = useState<ProjectOverview[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [environmentSnapshot, setEnvironmentSnapshot] =
    useState<EnvironmentSnapshot | null>(null);
  const [envDetector] = useState(() => new EnvironmentDetector());

  // Default menu items if none provided
  const defaultItems: MenuItem[] = [
    {
      label: '⚡ Command Palette',
      value: 'command-palette',
      description:
        'Quick access to all features with fuzzy search (like VS Code Ctrl+Shift+P)',
    },
    {
      label: '🔍 Live Logs Viewer',
      value: 'logs-viewer',
      description: 'Real-time streaming logs with filtering and search',
    },
    {
      label: '📈 Performance Monitor',
      value: 'performance-monitor',
      description: 'Real-time system metrics, CPU, memory, and resource usage',
    },
    {
      label: '📁 File Browser',
      value: 'file-browser',
      description: 'Navigate and manage project files with tree view',
    },
    {
      label: '🛠️ MCP Tool Tester',
      value: 'mcp-tester',
      description: 'Interactive testing of MCP tools with parameter forms',
    },
    {
      label: '🐝 Swarm Dashboard',
      value: 'swarm',
      description: 'Real-time swarm monitoring and agent management',
    },
    {
      label: '📊 System Status',
      value: 'status',
      description: 'View system health and component status',
    },
    {
      label: '🔗 MCP Servers',
      value: 'mcp',
      description: 'Manage Model Context Protocol servers',
    },
    {
      label: '📚 Workspace',
      value: 'workspace',
      description: 'Document-driven development workflow',
    },
    {
      label: '📝 Document AI',
      value: 'document-ai',
      description:
        'AI-powered document analysis, rewriting, and organization suggestions',
    },
    {
      label: '🏗️ ADR Generator',
      value: 'adr-generator',
      description: 'Generate Architecture Decision Records from code knowledge',
    },
    {
      label: '⚙️ Settings',
      value: 'settings',
      description: 'Configure system settings and preferences',
    },
    {
      label: '📖 Help',
      value: 'help',
      description: 'View documentation and help information',
    },
    {
      label: '❄️ Nix Manager',
      value: 'nix-manager',
      description:
        'Manage Nix environment and packages for BEAM language development',
    },
    {
      label: '🚪 Exit',
      value: 'exit',
      description: 'Exit the application',
    },
  ];

  const menuItems = items || defaultItems;

  // Load .gitignore patterns for proper file filtering
  const loadGitignorePatterns = useCallback(
    async (projectPath: string): Promise<string[]> => {
      try {
        const { readFile } = await import('node:fs/promises');
        const gitignorePath = join(projectPath, '.gitignore');
        const content = await readFile(gitignorePath, 'utf8');

        return content
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line && !line.startsWith('#'))
          .concat([
            '.git',
            'node_modules',
            '.DS_Store',
            '*.log',
            '_build',
            'deps',
            'target',
            'dist',
            'build',
          ]);
      } catch {
        // Default ignore patterns if no .gitignore
        return [
          '.git',
          'node_modules',
          '.DS_Store',
          '*.log',
          '_build',
          'deps',
          'target',
          'dist',
          'build',
        ];
      }
    },
    [],
  );

  // Check if path should be ignored
  const shouldIgnore = useCallback(
    (filePath: string, patterns: string[]): boolean => {
      const fileName = filePath.split('/').pop() || '';
      const relativePath = filePath;

      for (const pattern of patterns) {
        if (pattern.endsWith('*')) {
          if (fileName.startsWith(pattern.slice(0, -1))) return true;
        } else if (pattern.startsWith('*.')) {
          if (fileName.endsWith(pattern.slice(1))) return true;
        } else if (
          fileName === pattern ||
          relativePath.includes('/' + pattern + '/') ||
          relativePath.endsWith('/' + pattern)
        ) {
          return true;
        }
      }
      return false;
    },
    [],
  );

  // Load real project data for main screen
  const loadProjects = useCallback(async (): Promise<ProjectOverview[]> => {
    const projectPaths = [
      { name: 'claude-code-zen', path: '/home/mhugo/code/claude-code-zen' },
      {
        name: 'singularity-engine',
        path: '/home/mhugo/code/singularity-engine',
      },
      { name: 'architecturemcp', path: '/home/mhugo/code/architecturemcp' },
    ];

    const results: ProjectOverview[] = [];

    for (const { name, path } of projectPaths) {
      try {
        await access(path);

        // Load .gitignore patterns for this project
        const ignorePatterns = await loadGitignorePatterns(path);

        let totalFiles = 0;
        let codeFiles = 0;
        let size = 0;
        let lastModified = new Date(0);

        // Comprehensive scan of directory - no depth limit, respects .gitignore
        const scanDir = async (dirPath: string): Promise<void> => {
          // No depth limit - scan everything not ignored

          try {
            const entries = await readdir(dirPath, { withFileTypes: true });

            for (const entry of entries) {
              const fullPath = join(dirPath, entry.name);

              // Check .gitignore patterns
              if (shouldIgnore(fullPath, ignorePatterns)) continue;

              try {
                const fileStat = await stat(fullPath);

                if (entry.isDirectory()) {
                  await scanDir(fullPath);
                } else {
                  totalFiles++;
                  size += fileStat.size;

                  if (fileStat.mtime > lastModified) {
                    lastModified = fileStat.mtime;
                  }

                  const ext = extname(entry.name).toLowerCase();
                  // Comprehensive language support including BEAM languages
                  if (
                    [
                      '.ts',
                      '.tsx',
                      '.js',
                      '.jsx',
                      '.py',
                      '.rs',
                      '.go',
                      '.java',
                      '.ex',
                      '.exs',
                      '.erl',
                      '.hrl',
                      '.gleam',
                      '.c',
                      '.cpp',
                      '.h',
                      '.cs',
                      '.php',
                      '.rb',
                      '.swift',
                      '.kt',
                      '.scala',
                      '.clj',
                      '.zig',
                      '.nim',
                      '.cr',
                      '.jl',
                      '.ml',
                      '.fs',
                      '.elm',
                    ].includes(ext)
                  ) {
                    codeFiles++;
                  }
                }
              } catch {}
            }
          } catch {
            return;
          }
        };

        await scanDir(path);

        // Determine status
        const hoursAgo =
          (Date.now() - lastModified.getTime()) / (1000 * 60 * 60);
        const status: 'active' | 'idle' | 'error' =
          hoursAgo < 24 ? 'active' : totalFiles > 0 ? 'idle' : 'error';

        results.push({
          name,
          path,
          status,
          totalFiles,
          codeFiles,
          lastModified,
          size,
        });
      } catch {
        // Project not accessible
        results.push({
          name,
          path,
          status: 'error',
          totalFiles: 0,
          codeFiles: 0,
          lastModified: new Date(0),
          size: 0,
        });
      }
    }

    return results;
  }, []);

  // Load projects and environment on mount
  useEffect(() => {
    const initProjects = async () => {
      setIsLoadingProjects(true);
      const projectData = await loadProjects();
      setProjects(projectData);
      setIsLoadingProjects(false);
    };

    const initEnvironment = async () => {
      try {
        const snapshot = await envDetector.detectEnvironment();
        setEnvironmentSnapshot(snapshot);
      } catch (error) {
        console.error('Failed to detect environment:', error);
      }
    };

    initProjects();
    initEnvironment();

    // Listen for environment updates
    envDetector.on('detection-complete', (snapshot) => {
      setEnvironmentSnapshot(snapshot);
    });

    return () => {
      envDetector.removeAllListeners();
      envDetector.stopAutoDetection();
    };
  }, [loadProjects]);

  // Handle keyboard input
  useInput((input, key) => {
    if (key.escape || input === 'q' || input === 'Q') {
      onExit();
    }
  });

  const handleSelect = (item: MenuItem) => {
    if (item?.disabled) return;

    if (item?.value === 'exit') {
      onExit();
    } else {
      onSelect(item?.value);
    }
  };

  const getSystemStatusBadge = () => {
    if (swarmStatus) {
      return (
        <StatusBadge
          status={swarmStatus.status}
          variant="minimal"
        />
      );
    }
    return (
      <StatusBadge
        status="active"
        text="System Ready"
        variant="minimal"
      />
    );
  };

  const getProjectStatusBadge = (status: 'active' | 'idle' | 'error') => {
    const statusMap = {
      active: { status: 'active', text: 'Active' },
      idle: { status: 'idle', text: 'Idle' },
      error: { status: 'error', text: 'Error' },
    };

    const { status: badgeStatus, text } = statusMap[status];
    return (
      <StatusBadge
        status={badgeStatus as any}
        text={text}
        variant="minimal"
      />
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
  };

  const formatLastModified = (date: Date): string => {
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <Box flexDirection="column" height="100%">
      {/* Compact Header */}
      {showHeader && (
        <Header
          title={title}
          version={getVersion()}
          swarmStatus={swarmStatus}
          mode={swarmStatus ? 'swarm' : 'standard'}
          showBorder={true}
          centerAlign={false}
        />
      )}

      {/* Compact Menu */}
      <Box paddingX={1}>
        <SelectInput
          items={menuItems}
          onSelect={handleSelect}
          onHighlight={(item) => setSelectedItem(item)}
          itemComponent={({ isSelected, label }) => (
            <Text color={isSelected ? 'cyan' : 'white'} bold={isSelected}>
              {isSelected ? '▶ ' : '  '}{label}
            </Text>
          )}
        />
        
        {/* Compact description */}
        {selectedItem?.description && (
          <Text dimColor>{selectedItem.description}</Text>
        )}
      </Box>

      {/* Compact footer */}
      {showFooter && (
        <Text color="gray">Use ↑↓ to navigate, Enter to select, Q to exit</Text>
      )}
    </Box>
  );
};
