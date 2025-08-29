/**
 * GitHub Integration Service - Import TODOs and Roadmaps to Project Boards
 *
 * This service provides functionality to:
 * 1. Parse markdown files for TODO items and roadmap tasks
 * 2. Create GitHub issues from parsed items
 * 3. Add issues to GitHub project boards
 * 4. Handle both individual files and batch imports
 *
 * @file GitHub integration for project management
 */

import { readFile } from 'node:fs/promises';
import { Octokit } from '@octokit/rest';
import MarkdownIt from 'markdown-it';
// Using simple console logging for now to avoid complex dependencies
const createLogger = (name: string) => ({
  info: (msg: string, ...args: any[]) => console.log(`[${name}] ${msg}`, ...args),
  warn: (msg: string, ...args: any[]) => console.warn(`[${name}] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[${name}] ${msg}`, ...args),
});

const logger = createLogger('GitHubIntegration');

export interface ParsedTodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  filePath: string;
  lineNumber?: number;
  labels?: string[];
}

export interface ParsedRoadmapItem {
  id: string;
  title: string;
  description?: string;
  phase: string;
  status: 'todo' | 'in-progress' | 'complete';
  duration?: string;
  dependencies?: string[];
  filePath: string;
  labels?: string[];
}

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  projectNumber?: number;
}

export interface ImportOptions {
  createIssues: boolean;
  addToProject: boolean;
  onlyIncomplete: boolean;
  labelPrefix?: string;
  dryRun: boolean;
}

export class GitHubProjectImporter {
  private octokit: Octokit;
  private md: MarkdownIt;

  constructor(private config: GitHubConfig) {
    this.octokit = new Octokit({
      auth: config.token,
    });
    this.md = new MarkdownIt();
  }

  /**
   * Parse a markdown file for TODO items
   */
  async parseTodoFile(filePath: string): Promise<ParsedTodoItem[]> {
    try {
      const content = await readFile(filePath, 'utf-8');
      const items: ParsedTodoItem[] = [];
      
      const lines = content.split('\n');
      let currentCategory = '';
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNumber = i + 1;
        
        // Detect category headers
        if (line.match(/^#{1,6}\s+(.+)/)) {
          currentCategory = line.replace(/^#+\s+/, '').trim();
          continue;
        }
        
        // Parse checkbox items
        const todoMatch = line.match(/^[\s-]*\[([ x])\]\s*(.+)/);
        if (todoMatch) {
          const [, checkStatus, todoText] = todoMatch;
          const completed = checkStatus.toLowerCase() === 'x';
          
          // Extract priority from text (HIGH, MEDIUM, LOW)
          const priorityMatch = todoText.match(/\*\*(HIGH|MEDIUM|LOW|CRITICAL)\*\*/i);
          const priority = priorityMatch ? priorityMatch[1].toLowerCase() as ParsedTodoItem['priority'] : undefined;
          
          // Clean up the title
          const title = todoText
            .replace(/\*\*(HIGH|MEDIUM|LOW|CRITICAL)\*\*/gi, '')
            .replace(/^\*\*([^*]+)\*\*/, '$1')
            .trim();
          
          if (title) {
            items.push({
              id: `todo-${items.length + 1}`,
              title,
              completed,
              priority,
              category: currentCategory,
              filePath,
              lineNumber,
              labels: this.generateLabels('todo', currentCategory, priority),
            });
          }
        }
      }
      
      logger.info(`Parsed ${items.length} TODO items from ${filePath}`);
      return items;
    } catch (error) {
      logger.error(`Failed to parse TODO file ${filePath}:`, error);
      return [];
    }
  }

  /**
   * Parse a markdown file for roadmap items
   */
  async parseRoadmapFile(filePath: string): Promise<ParsedRoadmapItem[]> {
    try {
      const content = await readFile(filePath, 'utf-8');
      const items: ParsedRoadmapItem[] = [];
      
      const lines = content.split('\n');
      let currentPhase = '';
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Detect phase headers
        const phaseMatch = line.match(/^#{1,6}\s+.*(?:Phase|PHASE|Roadmap|ROADMAP).*?(\d+|[A-Z])/i);
        if (phaseMatch) {
          currentPhase = line.replace(/^#+\s+/, '').trim();
          continue;
        }
        
        // Parse table rows with status
        const tableMatch = line.match(/^\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|/);
        if (tableMatch && !line.includes('---')) {
          const [, phase, duration, status] = tableMatch;
          
          // Skip header rows
          if (phase.toLowerCase().includes('phase') || phase.toLowerCase().includes('duration')) {
            continue;
          }
          
          let parsedStatus: ParsedRoadmapItem['status'] = 'todo';
          if (status.includes('✅') || status.includes('COMPLETE')) {
            parsedStatus = 'complete';
          } else if (status.includes('🔄') || status.includes('PROGRESS')) {
            parsedStatus = 'in-progress';
          }
          
          items.push({
            id: `roadmap-${items.length + 1}`,
            title: phase.trim(),
            phase: currentPhase || 'Unknown Phase',
            duration: duration?.trim(),
            status: parsedStatus,
            filePath,
            labels: this.generateLabels('roadmap', currentPhase, undefined),
          });
        }
        
        // Parse checkbox-style roadmap items
        const checkboxMatch = line.match(/^[\s-]*\[([ x])\]\s*(.+)/);
        if (checkboxMatch && currentPhase) {
          const [, checkStatus, itemText] = checkboxMatch;
          const completed = checkStatus.toLowerCase() === 'x';
          
          items.push({
            id: `roadmap-${items.length + 1}`,
            title: itemText.trim(),
            phase: currentPhase,
            status: completed ? 'complete' : 'todo',
            filePath,
            labels: this.generateLabels('roadmap', currentPhase, undefined),
          });
        }
      }
      
      logger.info(`Parsed ${items.length} roadmap items from ${filePath}`);
      return items;
    } catch (error) {
      logger.error(`Failed to parse roadmap file ${filePath}:`, error);
      return [];
    }
  }

  /**
   * Create GitHub issues from parsed items
   */
  async createIssuesFromItems(
    items: (ParsedTodoItem | ParsedRoadmapItem)[],
    options: ImportOptions
  ): Promise<Array<{ item: ParsedTodoItem | ParsedRoadmapItem; issueUrl?: string; error?: string }>> {
    const results: Array<{ item: ParsedTodoItem | ParsedRoadmapItem; issueUrl?: string; error?: string }> = [];
    
    for (const item of items) {
      // Skip completed items if onlyIncomplete is true
      if (options.onlyIncomplete && this.isCompleted(item)) {
        continue;
      }
      
      try {
        if (options.dryRun) {
          logger.info(`[DRY RUN] Would create issue: ${item.title}`);
          results.push({ item, issueUrl: '[DRY RUN] Issue would be created' });
          continue;
        }
        
        const issueData = {
          title: item.title,
          body: this.generateIssueBody(item),
          labels: item.labels || [],
        };
        
        if (options.createIssues) {
          const response = await this.octokit.rest.issues.create({
            owner: this.config.owner,
            repo: this.config.repo,
            ...issueData,
          });
          
          logger.info(`Created issue #${response.data.number}: ${item.title}`);
          results.push({ item, issueUrl: response.data.html_url });
          
          // Add to project if specified
          if (options.addToProject && this.config.projectNumber) {
            await this.addIssueToProject(response.data.number);
          }
        } else {
          results.push({ item });
        }
      } catch (error) {
        logger.error(`Failed to create issue for ${item.title}:`, error);
        results.push({ item, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }
    
    return results;
  }

  /**
   * Import TODOs and roadmaps from multiple files
   */
  async importFromFiles(
    todoFiles: string[],
    roadmapFiles: string[],
    options: ImportOptions
  ): Promise<{
    todoResults: Array<{ item: ParsedTodoItem; issueUrl?: string; error?: string }>;
    roadmapResults: Array<{ item: ParsedRoadmapItem; issueUrl?: string; error?: string }>;
  }> {
    const allTodoItems: ParsedTodoItem[] = [];
    const allRoadmapItems: ParsedRoadmapItem[] = [];
    
    // Parse all TODO files
    for (const file of todoFiles) {
      const items = await this.parseTodoFile(file);
      allTodoItems.push(...items);
    }
    
    // Parse all roadmap files
    for (const file of roadmapFiles) {
      const items = await this.parseRoadmapFile(file);
      allRoadmapItems.push(...items);
    }
    
    // Create issues
    const todoResults = await this.createIssuesFromItems(allTodoItems, options) as Array<{ item: ParsedTodoItem; issueUrl?: string; error?: string }>;
    const roadmapResults = await this.createIssuesFromItems(allRoadmapItems, options) as Array<{ item: ParsedRoadmapItem; issueUrl?: string; error?: string }>;
    
    return { todoResults, roadmapResults };
  }

  /**
   * Add an issue to the project board
   * Note: This is simplified for classic projects. GitHub Projects v2 requires GraphQL API.
   */
  private async addIssueToProject(issueNumber: number): Promise<void> {
    if (!this.config.projectNumber) {
      return;
    }
    
    try {
      // For Projects v2, we would need to use GraphQL API
      // This is a placeholder for classic project boards
      logger.info(`Would add issue #${issueNumber} to project #${this.config.projectNumber}`);
      logger.info('Note: Adding to Projects v2 requires GraphQL API implementation');
    } catch (error) {
      logger.error(`Failed to add issue to project:`, error);
    }
  }

  /**
   * Generate appropriate labels for an item
   */
  private generateLabels(type: 'todo' | 'roadmap', category?: string, priority?: string): string[] {
    const labels: string[] = [type];
    
    if (category) {
      labels.push(`category:${category.toLowerCase().replace(/\s+/g, '-')}`);
    }
    
    if (priority) {
      labels.push(`priority:${priority}`);
    }
    
    return labels;
  }

  /**
   * Generate issue body from parsed item
   */
  private generateIssueBody(item: ParsedTodoItem | ParsedRoadmapItem): string {
    let body = `**Source:** ${item.filePath}\n\n`;
    
    if ('description' in item && item.description) {
      body += `${item.description}\n\n`;
    }
    
    if ('category' in item && item.category) {
      body += `**Category:** ${item.category}\n`;
    }
    
    if ('phase' in item) {
      body += `**Phase:** ${item.phase}\n`;
      if (item.duration) {
        body += `**Duration:** ${item.duration}\n`;
      }
      if (item.dependencies) {
        body += `**Dependencies:** ${item.dependencies.join(', ')}\n`;
      }
    }
    
    if ('priority' in item && item.priority) {
      body += `**Priority:** ${item.priority}\n`;
    }
    
    body += `\n---\n*Auto-imported from ${item.filePath}*`;
    
    return body;
  }

  /**
   * Check if an item is completed
   */
  private isCompleted(item: ParsedTodoItem | ParsedRoadmapItem): boolean {
    if ('completed' in item) {
      return item.completed;
    }
    if ('status' in item) {
      return item.status === 'complete';
    }
    return false;
  }
}

export default GitHubProjectImporter;