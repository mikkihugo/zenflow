/**
 * Git Tools for MCP Server
 * Provides comprehensive Git operations through MCP protocol
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

/**
 * Execute a git command safely
 */
async function executeGitCommand(command, cwd = process.cwd()) {
  try {
    const { stdout, stderr } = await execAsync(`git ${command}`, { 
      cwd,
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    });
    return { 
      success: true, 
      stdout: stdout.trim(), 
      stderr: stderr.trim() 
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message, 
      stderr: error.stderr?.trim() || '',
      code: error.code 
    };
  }
}

/**
 * Git tools configuration
 */
export const gitTools = {
  git_status: {
    name: 'git_status',
    description: 'Get current Git repository status',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Repository path (optional)' },
        short: { type: 'boolean', description: 'Short format output' },
        branch: { type: 'boolean', description: 'Show branch info' }
      }
    },
    async handler(args) {
      let cmd = 'status';
      if (args.short) cmd += ' -s';
      if (args.branch) cmd += ' -b';
      return await executeGitCommand(cmd, args.path);
    }
  },

  git_add: {
    name: 'git_add',
    description: 'Stage files for commit',
    inputSchema: {
      type: 'object',
      properties: {
        files: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'Files to stage (empty for all)' 
        },
        path: { type: 'string', description: 'Repository path (optional)' },
        all: { type: 'boolean', description: 'Stage all changes' },
        patch: { type: 'boolean', description: 'Interactive staging' }
      }
    },
    async handler(args) {
      let cmd = 'add';
      if (args.all) {
        cmd += ' -A';
      } else if (args.files?.length > 0) {
        cmd += ` ${args.files.join(' ')}`;
      } else {
        cmd += ' .';
      }
      if (args.patch) cmd += ' -p';
      return await executeGitCommand(cmd, args.path);
    }
  },

  git_commit: {
    name: 'git_commit',
    description: 'Create a commit with staged changes',
    inputSchema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Commit message' },
        path: { type: 'string', description: 'Repository path (optional)' },
        amend: { type: 'boolean', description: 'Amend previous commit' },
        noVerify: { type: 'boolean', description: 'Skip pre-commit hooks' }
      },
      required: ['message']
    },
    async handler(args) {
      let cmd = 'commit';
      if (args.amend) cmd += ' --amend';
      if (args.noVerify) cmd += ' --no-verify';
      cmd += ` -m "${args.message.replace(/"/g, '\\"')}"`;
      return await executeGitCommand(cmd, args.path);
    }
  },

  git_push: {
    name: 'git_push',
    description: 'Push commits to remote repository',
    inputSchema: {
      type: 'object',
      properties: {
        remote: { type: 'string', description: 'Remote name', default: 'origin' },
        branch: { type: 'string', description: 'Branch name' },
        path: { type: 'string', description: 'Repository path (optional)' },
        force: { type: 'boolean', description: 'Force push' },
        setUpstream: { type: 'boolean', description: 'Set upstream branch' }
      }
    },
    async handler(args) {
      let cmd = `push ${args.remote || 'origin'}`;
      if (args.branch) cmd += ` ${args.branch}`;
      if (args.force) cmd += ' --force';
      if (args.setUpstream) cmd += ' -u';
      return await executeGitCommand(cmd, args.path);
    }
  },

  git_pull: {
    name: 'git_pull',
    description: 'Pull changes from remote repository',
    inputSchema: {
      type: 'object',
      properties: {
        remote: { type: 'string', description: 'Remote name', default: 'origin' },
        branch: { type: 'string', description: 'Branch name' },
        path: { type: 'string', description: 'Repository path (optional)' },
        rebase: { type: 'boolean', description: 'Rebase instead of merge' }
      }
    },
    async handler(args) {
      let cmd = `pull ${args.remote || 'origin'}`;
      if (args.branch) cmd += ` ${args.branch}`;
      if (args.rebase) cmd += ' --rebase';
      return await executeGitCommand(cmd, args.path);
    }
  },

  git_branch: {
    name: 'git_branch',
    description: 'Manage Git branches',
    inputSchema: {
      type: 'object',
      properties: {
        action: { 
          type: 'string', 
          enum: ['list', 'create', 'delete', 'rename', 'checkout'],
          description: 'Branch operation' 
        },
        name: { type: 'string', description: 'Branch name' },
        newName: { type: 'string', description: 'New branch name (for rename)' },
        path: { type: 'string', description: 'Repository path (optional)' },
        remote: { type: 'boolean', description: 'Include remote branches' },
        all: { type: 'boolean', description: 'Show all branches' }
      }
    },
    async handler(args) {
      let cmd = '';
      switch (args.action) {
        case 'list':
          cmd = 'branch';
          if (args.all) cmd += ' -a';
          else if (args.remote) cmd += ' -r';
          break;
        case 'create':
          cmd = `checkout -b ${args.name}`;
          break;
        case 'delete':
          cmd = `branch -d ${args.name}`;
          break;
        case 'rename':
          cmd = `branch -m ${args.name} ${args.newName}`;
          break;
        case 'checkout':
          cmd = `checkout ${args.name}`;
          break;
        default:
          cmd = 'branch';
      }
      return await executeGitCommand(cmd, args.path);
    }
  },

  git_log: {
    name: 'git_log',
    description: 'View commit history',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Repository path (optional)' },
        limit: { type: 'number', description: 'Number of commits to show', default: 10 },
        oneline: { type: 'boolean', description: 'One line per commit' },
        graph: { type: 'boolean', description: 'Show branch graph' },
        author: { type: 'string', description: 'Filter by author' },
        since: { type: 'string', description: 'Show commits since date' }
      }
    },
    async handler(args) {
      let cmd = 'log';
      if (args.limit) cmd += ` -n ${args.limit}`;
      if (args.oneline) cmd += ' --oneline';
      if (args.graph) cmd += ' --graph';
      if (args.author) cmd += ` --author="${args.author}"`;
      if (args.since) cmd += ` --since="${args.since}"`;
      return await executeGitCommand(cmd, args.path);
    }
  },

  git_diff: {
    name: 'git_diff',
    description: 'Show changes between commits, working tree, etc',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Repository path (optional)' },
        staged: { type: 'boolean', description: 'Show staged changes' },
        files: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'Specific files to diff' 
        },
        nameOnly: { type: 'boolean', description: 'Show only file names' }
      }
    },
    async handler(args) {
      let cmd = 'diff';
      if (args.staged) cmd += ' --staged';
      if (args.nameOnly) cmd += ' --name-only';
      if (args.files?.length > 0) cmd += ` ${args.files.join(' ')}`;
      return await executeGitCommand(cmd, args.path);
    }
  },

  git_clone: {
    name: 'git_clone',
    description: 'Clone a repository',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Repository URL' },
        path: { type: 'string', description: 'Destination path' },
        branch: { type: 'string', description: 'Branch to clone' },
        depth: { type: 'number', description: 'Clone depth (shallow clone)' }
      },
      required: ['url']
    },
    async handler(args) {
      let cmd = `clone ${args.url}`;
      if (args.path) cmd += ` ${args.path}`;
      if (args.branch) cmd += ` -b ${args.branch}`;
      if (args.depth) cmd += ` --depth ${args.depth}`;
      return await executeGitCommand(cmd);
    }
  },

  git_stash: {
    name: 'git_stash',
    description: 'Stash changes in working directory',
    inputSchema: {
      type: 'object',
      properties: {
        action: { 
          type: 'string', 
          enum: ['save', 'list', 'apply', 'pop', 'drop', 'clear'],
          description: 'Stash operation',
          default: 'save'
        },
        message: { type: 'string', description: 'Stash message' },
        index: { type: 'number', description: 'Stash index' },
        path: { type: 'string', description: 'Repository path (optional)' }
      }
    },
    async handler(args) {
      let cmd = 'stash';
      switch (args.action) {
        case 'save':
          cmd += ' save';
          if (args.message) cmd += ` "${args.message}"`;
          break;
        case 'list':
          cmd += ' list';
          break;
        case 'apply':
          cmd += ' apply';
          if (args.index !== undefined) cmd += ` stash@{${args.index}}`;
          break;
        case 'pop':
          cmd += ' pop';
          if (args.index !== undefined) cmd += ` stash@{${args.index}}`;
          break;
        case 'drop':
          cmd += ' drop';
          if (args.index !== undefined) cmd += ` stash@{${args.index}}`;
          break;
        case 'clear':
          cmd += ' clear';
          break;
      }
      return await executeGitCommand(cmd, args.path);
    }
  },

  git_remote: {
    name: 'git_remote',
    description: 'Manage remote repositories',
    inputSchema: {
      type: 'object',
      properties: {
        action: { 
          type: 'string', 
          enum: ['list', 'add', 'remove', 'show', 'get-url'],
          description: 'Remote operation',
          default: 'list'
        },
        name: { type: 'string', description: 'Remote name' },
        url: { type: 'string', description: 'Remote URL' },
        path: { type: 'string', description: 'Repository path (optional)' },
        verbose: { type: 'boolean', description: 'Verbose output' }
      }
    },
    async handler(args) {
      let cmd = 'remote';
      switch (args.action) {
        case 'list':
          if (args.verbose) cmd += ' -v';
          break;
        case 'add':
          cmd += ` add ${args.name} ${args.url}`;
          break;
        case 'remove':
          cmd += ` remove ${args.name}`;
          break;
        case 'show':
          cmd += ` show ${args.name || 'origin'}`;
          break;
        case 'get-url':
          cmd += ` get-url ${args.name || 'origin'}`;
          break;
      }
      return await executeGitCommand(cmd, args.path);
    }
  },

  git_tag: {
    name: 'git_tag',
    description: 'Create, list, delete or verify tags',
    inputSchema: {
      type: 'object',
      properties: {
        action: { 
          type: 'string', 
          enum: ['list', 'create', 'delete', 'show'],
          description: 'Tag operation',
          default: 'list'
        },
        name: { type: 'string', description: 'Tag name' },
        message: { type: 'string', description: 'Tag message (annotated tag)' },
        commit: { type: 'string', description: 'Commit to tag' },
        path: { type: 'string', description: 'Repository path (optional)' }
      }
    },
    async handler(args) {
      let cmd = 'tag';
      switch (args.action) {
        case 'list':
          break;
        case 'create':
          if (args.message) {
            cmd += ` -a ${args.name} -m "${args.message}"`;
          } else {
            cmd += ` ${args.name}`;
          }
          if (args.commit) cmd += ` ${args.commit}`;
          break;
        case 'delete':
          cmd += ` -d ${args.name}`;
          break;
        case 'show':
          cmd += ` show ${args.name}`;
          break;
      }
      return await executeGitCommand(cmd, args.path);
    }
  }
};

/**
 * Register all Git tools
 */
export function registerGitTools(toolsRegistry) {
  Object.entries(gitTools).forEach(([key, tool]) => {
    toolsRegistry.registerTool(key, tool);
  });
}

export default gitTools;