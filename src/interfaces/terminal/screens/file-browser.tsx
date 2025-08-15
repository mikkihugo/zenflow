/**
 * File Browser Screen.
 *
 * Navigate and manage project files within TUI.
 * Core development workflow - browse, edit, create files with tree view.
 */

import { readdir, stat } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { Box, Text, useInput } from 'ink';
import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  Header,
  InteractiveFooter,
  StatusBadge,
  type SwarmStatus,
} from '../components/index/index.js';

export interface FileSystemItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modified?: Date;
  isExpanded?: boolean;
  children?: FileSystemItem[];
  depth: number;
  isGitIgnored?: boolean;
  gitIgnoreReason?: string; // Which pattern caused it to be ignored
}

export interface FileBrowserProps {
  swarmStatus?: SwarmStatus;
  onBack: () => void;
  onExit: () => void;
  initialPath?: string;
}

/**
 * File Browser Component.
 *
 * Provides file system navigation with tree view and file operations.
 */
export const FileBrowser: React.FC<FileBrowserProps> = ({
  swarmStatus,
  onBack,
  onExit,
  initialPath = process.cwd(),
}) => {
  const [currentPath, setCurrentPath] = useState<string>(initialPath);
  const [items, setItems] = useState<FileSystemItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [showHidden, setShowHidden] = useState<boolean>(false);
  const [showGitIgnored, setShowGitIgnored] = useState<boolean>(true); // Show ignored files by default (greyed out)
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'size' | 'modified'>(
    'name'
  );
  const [gitIgnorePatterns, setGitIgnorePatterns] = useState<Set<string>>(
    new Set()
  );

  // Load .gitignore patterns for file filtering
  const loadGitignorePatterns = useCallback(
    async (projectPath: string): Promise<Set<string>> => {
      try {
        const { readFile } = await import('node:fs/promises');
        const { join } = await import('node:path');

        const patterns = new Set<string>();

        // Add default ignore patterns
        const defaultPatterns = [
          '.git',
          'node_modules',
          '.DS_Store',
          '*.log',
          'dist',
          'build',
          'coverage',
          '.next',
          '.cache',
          '.nyc_output',
          'target',
          'vendor',
        ];
        defaultPatterns.forEach((pattern) => patterns.add(pattern));

        // Load .gitignore file if it exists
        try {
          const gitignorePath = join(projectPath, '.gitignore');
          const gitignoreContent = await readFile(gitignorePath, 'utf8');

          gitignoreContent
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line && !line.startsWith('#'))
            .forEach((pattern) => patterns.add(pattern));
        } catch {
          // .gitignore doesn't exist, use defaults only
        }

        return patterns;
      } catch (error) {
        console.warn('Error loading .gitignore patterns:', error);
        return new Set(['.git', 'node_modules', '.DS_Store', '*.log']);
      }
    },
    []
  );

  // Check if a file should be ignored and return the matching pattern
  const checkGitIgnore = useCallback(
    (
      filePath: string,
      patterns: Set<string>,
      projectRoot: string
    ): { ignored: boolean; reason?: string } => {
      try {
        const { relative } = require('node:path');
        const relativePath = relative(projectRoot, filePath);

        for (const pattern of patterns) {
          // Simple pattern matching
          if (pattern.endsWith('*')) {
            const prefix = pattern.slice(0, -1);
            if (relativePath.startsWith(prefix)) {
              return { ignored: true, reason: pattern };
            }
          } else if (pattern.startsWith('*.')) {
            const extension = pattern.slice(1);
            if (filePath.endsWith(extension)) {
              return { ignored: true, reason: pattern };
            }
          } else if (pattern.endsWith('/')) {
            // Directory pattern
            const dirPattern = pattern.slice(0, -1);
            if (
              relativePath.startsWith(dirPattern + '/') ||
              relativePath === dirPattern
            ) {
              return { ignored: true, reason: pattern };
            }
          } else if (
            relativePath === pattern ||
            relativePath.startsWith(pattern + '/')
          ) {
            return { ignored: true, reason: pattern };
          }
        }

        return { ignored: false };
      } catch {
        return { ignored: false };
      }
    },
    []
  );

  // Find project root (directory containing .git)
  const findProjectRoot = useCallback(
    async (startPath: string): Promise<string> => {
      const { access } = await import('node:fs/promises');
      const { join, dirname } = await import('node:path');

      let currentPath = startPath;
      while (currentPath !== dirname(currentPath)) {
        try {
          await access(join(currentPath, '.git'));
          return currentPath;
        } catch {
          currentPath = dirname(currentPath);
        }
      }
      return startPath; // Fallback to start path if no .git found
    },
    []
  );

  // Load directory contents
  const loadDirectory = useCallback(
    async (path: string): Promise<FileSystemItem[]> => {
      try {
        const entries = await readdir(path, { withFileTypes: true });
        const items: FileSystemItem[] = [];

        // Load gitignore patterns for current path
        const projectRoot = await findProjectRoot(path);
        const patterns = await loadGitignorePatterns(projectRoot);

        for (const entry of entries) {
          const fullPath = join(path, entry.name);

          // Check gitignore status
          const gitIgnoreResult = checkGitIgnore(
            fullPath,
            patterns,
            projectRoot
          );

          // Skip hidden files unless showHidden is true (but check gitignore first)
          if (!showHidden && entry.name.startsWith('.')) {
            continue;
          }

          // Skip gitignored files unless showGitIgnored is true
          if (!showGitIgnored && gitIgnoreResult.ignored) {
            continue;
          }

          try {
            const stats = await stat(fullPath);

            items.push({
              name: entry.name,
              path: fullPath,
              type: entry.isDirectory() ? 'directory' : 'file',
              size: stats.size,
              modified: stats.mtime,
              depth: 0,
              isExpanded: expandedDirs.has(fullPath),
              isGitIgnored: gitIgnoreResult.ignored,
              gitIgnoreReason: gitIgnoreResult.reason,
            });
          } catch (statError) {}
        }

        // Sort items
        items.sort((a, b) => {
          // Always show directories first
          if (a.type !== b.type) {
            return a.type === 'directory' ? -1 : 1;
          }

          switch (sortBy) {
            case 'size':
              return (b.size || 0) - (a.size || 0);
            case 'modified':
              return (
                (b.modified?.getTime() || 0) - (a.modified?.getTime() || 0)
              );
            case 'type':
              return a.name.localeCompare(b.name);
            case 'name':
            default:
              return a.name.localeCompare(b.name);
          }
        });

        return items;
      } catch (error) {
        throw new Error(`Failed to read directory: ${error.message}`);
      }
    },
    [
      showHidden,
      showGitIgnored,
      sortBy,
      expandedDirs,
      loadGitignorePatterns,
      checkGitIgnore,
      findProjectRoot,
    ]
  );

  // Load current directory
  useEffect(() => {
    const loadCurrentDirectory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const directoryItems = await loadDirectory(currentPath);
        setItems(directoryItems);
        setSelectedIndex(0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentDirectory();
  }, [currentPath, loadDirectory]);

  // Handle keyboard input
  useInput((input, key) => {
    if (key.escape || input === 'q' || input === 'Q') {
      onBack();
    }

    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(items.length - 1, prev + 1));
    } else if (key.return) {
      handleItemSelection();
    }

    switch (input) {
      case 'h':
      case 'H':
        setShowHidden(!showHidden);
        break;
      case 'g':
      case 'G':
        setShowGitIgnored(!showGitIgnored);
        break;
      case 's':
      case 'S':
        setSortBy((prev) => {
          const sorts: (typeof sortBy)[] = ['name', 'type', 'size', 'modified'];
          const currentIndex = sorts.indexOf(prev);
          return sorts[(currentIndex + 1) % sorts.length];
        });
        break;
      case 'u':
      case 'U':
        navigateUp();
        break;
      case 'r':
      case 'R':
        // Refresh current directory
        setCurrentPath(currentPath);
        break;
    }
  });

  const handleItemSelection = useCallback(() => {
    const selectedItem = items[selectedIndex];
    if (!selectedItem) return;

    if (selectedItem.type === 'directory') {
      setCurrentPath(selectedItem.path);
    } else {
      // For files, we could implement file viewing/editing
      // For now, just show file info
    }
  }, [items, selectedIndex]);

  const navigateUp = useCallback(() => {
    const parentPath = dirname(currentPath);
    if (parentPath !== currentPath) {
      setCurrentPath(parentPath);
    }
  }, [currentPath]);

  // Utility functions
  const formatFileSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (date: Date): string => {
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  };

  const getFileIcon = (item: FileSystemItem): string => {
    if (item.type === 'directory') {
      return item.isExpanded ? '📂' : '📁';
    }

    const ext = item.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return '📄';
      case 'json':
        return '📋';
      case 'md':
        return '📝';
      case 'css':
      case 'scss':
        return '🎨';
      case 'html':
        return '🌐';
      case 'png':
      case 'jpg':
      case 'gif':
      case 'svg':
        return '🖼️';
      case 'pdf':
        return '📕';
      case 'zip':
      case 'tar':
      case 'gz':
        return '🗜️';
      default:
        return '📄';
    }
  };

  const getTypeColor = (item: FileSystemItem): string => {
    // If file is gitignored, use dimmed gray
    if (item.isGitIgnored) {
      return 'gray';
    }

    if (item.type === 'directory') {
      return 'cyan';
    }

    const ext = item.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return 'yellow';
      case 'json':
        return 'green';
      case 'md':
        return 'blue';
      case 'css':
      case 'scss':
        return 'magenta';
      case 'html':
        return 'red';
      default:
        return 'white';
    }
  };

  return (
    <Box flexDirection="column" height="100%">
      {/* Header */}
      <Header
        title="File Browser"
        subtitle={`${basename(currentPath)} | Sort: ${sortBy} | Hidden: ${showHidden ? 'shown' : 'hidden'} | Git: ${showGitIgnored ? 'shown' : 'hidden'}`}
        swarmStatus={swarmStatus}
        mode="standard"
        showBorder={true}
      />

      {/* Path and Stats */}
      <Box paddingX={2} paddingY={1} borderStyle="single" borderColor="gray">
        <Box flexDirection="column" width="100%">
          <Box flexDirection="row" justifyContent="space-between">
            <Box flexDirection="row">
              <Text color="cyan">📍 Path: </Text>
              <Text color="white" wrap="truncate">
                {currentPath}
              </Text>
            </Box>
            <Box flexDirection="row">
              <StatusBadge
                status={isLoading ? 'initializing' : error ? 'error' : 'active'}
                text={isLoading ? 'LOADING' : error ? 'ERROR' : 'READY'}
                variant="minimal"
              />
            </Box>
          </Box>
          <Box marginTop={1}>
            <Text color="gray">
              📊 {items.filter((i) => i.type === 'file').length} files,{' '}
              {items.filter((i) => i.type === 'directory').length} directories
              {items.some((i) => i.isGitIgnored) && (
                <Text color="gray" dimColor>
                  {' '}
                  • {items.filter((i) => i.isGitIgnored).length} ignored
                </Text>
              )}
            </Text>
          </Box>
        </Box>
      </Box>

      {/* File List */}
      <Box flexGrow={1} paddingX={2} paddingY={1}>
        <Box flexDirection="column" width="100%">
          {isLoading ? (
            <Box justifyContent="center" alignItems="center" height={10}>
              <Text color="cyan">Loading directory...</Text>
            </Box>
          ) : error ? (
            <Box justifyContent="center" alignItems="center" height={10}>
              <Box flexDirection="column" alignItems="center">
                <Text color="red">❌ {error}</Text>
                <Text color="gray">Press 'R' to retry or 'U' to go up</Text>
              </Box>
            </Box>
          ) : items.length === 0 ? (
            <Box justifyContent="center" alignItems="center" height={10}>
              <Text color="gray">Empty directory</Text>
            </Box>
          ) : (
            <>
              {/* Parent directory entry */}
              <Box
                flexDirection="row"
                backgroundColor={selectedIndex === -1 ? 'blue' : undefined}
                paddingX={selectedIndex === -1 ? 1 : 0}
              >
                <Text color="gray">📁 ..</Text>
              </Box>

              {/* File entries */}
              {items.map((item, index) => {
                const isSelected = selectedIndex === index;

                return (
                  <Box
                    key={item.path}
                    flexDirection="row"
                    backgroundColor={isSelected ? 'blue' : undefined}
                    paddingX={isSelected ? 1 : 0}
                  >
                    <Box width="60%">
                      <Text
                        color={getTypeColor(item)}
                        dimColor={item.isGitIgnored}
                      >
                        {getFileIcon(item)} {item.name}
                        {item.isGitIgnored && (
                          <Text color="gray" dimColor>
                            {' '}
                            (ignored)
                          </Text>
                        )}
                      </Text>
                    </Box>

                    <Box width="15%">
                      <Text
                        color={item.isGitIgnored ? 'gray' : 'gray'}
                        dimColor
                      >
                        {item.type === 'file'
                          ? formatFileSize(item.size || 0)
                          : 'DIR'}
                      </Text>
                    </Box>

                    <Box width="25%">
                      <Text
                        color={item.isGitIgnored ? 'gray' : 'gray'}
                        dimColor
                      >
                        {item.modified ? formatDate(item.modified) : ''}
                      </Text>
                    </Box>
                  </Box>
                );
              })}
            </>
          )}
        </Box>
      </Box>

      {/* File Details */}
      {items[selectedIndex] && (
        <Box paddingX={2} paddingY={1} borderStyle="single" borderColor="cyan">
          <Box flexDirection="column">
            <Text color="cyan" bold>
              📋 Selected Item:
            </Text>
            <Box marginTop={1} flexDirection="row">
              <Box width="70%">
                <Text>
                  {getFileIcon(items[selectedIndex])}{' '}
                  <Text
                    color={getTypeColor(items[selectedIndex])}
                    dimColor={items[selectedIndex].isGitIgnored}
                  >
                    {items[selectedIndex].name}
                  </Text>
                  {items[selectedIndex].isGitIgnored && (
                    <Text color="gray" dimColor>
                      {' '}
                      (ignored by {items[selectedIndex].gitIgnoreReason})
                    </Text>
                  )}
                </Text>
                <Text color="gray" dimColor>
                  {items[selectedIndex].path}
                </Text>
              </Box>
              <Box width="30%">
                <Text>Type: {items[selectedIndex].type}</Text>
                {items[selectedIndex].type === 'file' && (
                  <Text>
                    Size: {formatFileSize(items[selectedIndex].size || 0)}
                  </Text>
                )}
                {items[selectedIndex].modified && (
                  <Text color="gray" dimColor>
                    Modified: {formatDate(items[selectedIndex].modified)}
                  </Text>
                )}
                {items[selectedIndex].isGitIgnored && (
                  <Text color="yellow" dimColor>
                    🚫 Git Ignored
                  </Text>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Footer */}
      <Box paddingY={1} paddingX={2}>
        <InteractiveFooter
          currentScreen="File Browser"
          availableScreens={[
            { key: '↑↓', name: 'Navigate' },
            { key: 'Enter', name: 'Open/Enter' },
            { key: 'U', name: 'Up Dir' },
            { key: 'S', name: 'Sort' },
            { key: 'H', name: 'Hidden' },
            { key: 'G', name: 'Git Ignored' },
            { key: 'R', name: 'Refresh' },
            { key: 'Q/Esc', name: 'Back' },
          ]}
          status={`${items.length} items | ${sortBy} sort | ${showHidden ? 'all' : 'visible'} files | ${showGitIgnored ? 'ignored shown' : 'ignored hidden'}`}
        />
      </Box>
    </Box>
  );
};

export default FileBrowser;
