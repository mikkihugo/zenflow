/**
 * Init Command Implementation
 * 
 * Initializes a new claude-flow project with templates and configuration
 */

import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { BaseCommand } from '../../core/base-command';
import type { CommandContext, CommandResult, CommandValidationResult } from '../../types/index';

export class InitCommand extends BaseCommand {
  constructor() {
    super({
      name: 'init',
      description: 'Initialize a new claude-flow project',
      usage: 'claude-flow init [project-name]',
      category: 'core',
      minArgs: 0,
      maxArgs: 1,
      examples: [
        'claude-flow init',
        'claude-flow init my-project',
        'claude-flow init --template typescript'
      ],
      flags: {
        template: {
          type: 'string',
          description: 'Project template to use',
          default: 'basic'
        },
        force: {
          type: 'boolean',
          description: 'Overwrite existing files',
          default: false
        },
        'skip-install': {
          type: 'boolean',
          description: 'Skip npm package installation',
          default: false
        },
        'skip-git': {
          type: 'boolean',
          description: 'Skip git repository initialization',
          default: false
        }
      }
    });
  }

  protected async validate(context: CommandContext): Promise<CommandValidationResult | null> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const projectName = context.args[0];
    if (projectName) {
      // Validate project name
      if (!/^[a-z0-9-_]+$/i.test(projectName)) {
        errors.push('Project name can only contain letters, numbers, hyphens, and underscores');
      }

      // Check if directory already exists
      const projectPath = path.resolve(context.cwd, projectName);
      if (existsSync(projectPath) && !context.flags.force) {
        warnings.push(`Directory '${projectName}' already exists. Use --force to overwrite.`);
      }
    }

    // Validate template
    const template = context.flags.template as string;
    const validTemplates = ['basic', 'typescript', 'javascript', 'node', 'browser'];
    if (!validTemplates.includes(template)) {
      errors.push(`Invalid template '${template}'. Valid templates: ${validTemplates.join(', ')}`);
    }

    return errors.length > 0 || warnings.length > 0 ? { valid: errors.length === 0, errors, warnings } : null;
  }

  protected async run(context: CommandContext): Promise<CommandResult> {
    try {
      const projectName = context.args[0] || 'claude-flow-project';
      const template = context.flags.template as string || 'basic';
      const force = context.flags.force as boolean || false;
      const skipInstall = context.flags['skip-install'] as boolean || false;
      const skipGit = context.flags['skip-git'] as boolean || false;

      const projectPath = path.resolve(context.cwd, projectName);

      // Create project directory
      if (existsSync(projectPath) && !force) {
        return {
          success: false,
          error: `Directory '${projectName}' already exists. Use --force to overwrite.`,
          exitCode: 1
        };
      }

      await fs.mkdir(projectPath, { recursive: true });

      // Copy template files
      await this.copyTemplate(template, projectPath, projectName);

      // Initialize git repository
      if (!skipGit) {
        await this.initGitRepository(projectPath);
      }

      // Install dependencies
      if (!skipInstall) {
        await this.installDependencies(projectPath);
      }

      return {
        success: true,
        exitCode: 0,
        message: `Successfully initialized claude-flow project '${projectName}'`,
        data: {
          projectName,
          projectPath,
          template,
          gitInitialized: !skipGit,
          dependenciesInstalled: !skipInstall
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to initialize project: ${error instanceof Error ? error.message : String(error)}`,
        exitCode: 1
      };
    }
  }

  private async copyTemplate(template: string, projectPath: string, projectName: string): Promise<void> {
    // Create basic project structure
    const directories = [
      'src',
      'config',
      'docs',
      'tests',
      'templates'
    ];

    for (const dir of directories) {
      await fs.mkdir(path.join(projectPath, dir), { recursive: true });
    }

    // Create package.json
    const packageJson = {
      name: projectName,
      version: '1.0.0',
      description: 'A claude-flow project',
      main: template === 'typescript' ? 'dist/index.js' : 'src/index.js',
      scripts: {
        'start': 'claude-flow swarm start',
        'dev': 'claude-flow swarm start --dev',
        'test': 'npm test',
        'build': template === 'typescript' ? 'tsc' : 'echo "No build step needed"'
      },
      dependencies: {
        'claude-flow': '^2.0.0'
      },
      devDependencies: template === 'typescript' ? {
        'typescript': '^5.0.0',
        '@types/node': '^20.0.0'
      } : {}
    };

    await fs.writeFile(
      path.join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // Create claude-flow configuration
    const config = {
      swarm: {
        topology: 'mesh',
        maxAgents: 5,
        strategy: 'balanced'
      },
      memory: {
        provider: 'sqlite',
        persistent: true
      },
      neural: {
        enabled: true,
        models: ['claude-3-haiku', 'claude-3-sonnet']
      }
    };

    await fs.writeFile(
      path.join(projectPath, 'config', 'claude-flow.json'),
      JSON.stringify(config, null, 2)
    );

    // Create main entry file
    const mainContent = template === 'typescript' 
      ? this.getTypescriptMainContent()
      : this.getJavascriptMainContent();

    const mainFile = template === 'typescript' ? 'index.ts' : 'index.js';
    await fs.writeFile(path.join(projectPath, 'src', mainFile), mainContent);

    // Create TypeScript config if needed
    if (template === 'typescript') {
      const tsConfig = {
        compilerOptions: {
          target: 'ES2022',
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          outDir: './dist',
          rootDir: './src',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true
        },
        include: ['src/**/*'],
        exclude: ['node_modules', 'dist']
      };

      await fs.writeFile(
        path.join(projectPath, 'tsconfig.json'),
        JSON.stringify(tsConfig, null, 2)
      );
    }

    // Create README
    const readme = this.getReadmeContent(projectName, template);
    await fs.writeFile(path.join(projectPath, 'README.md'), readme);

    // Create .gitignore
    const gitignore = [
      'node_modules/',
      'dist/',
      '.env',
      '*.log',
      '.DS_Store',
      'claude-flow-data.db'
    ].join('\n');

    await fs.writeFile(path.join(projectPath, '.gitignore'), gitignore);
  }

  private async initGitRepository(projectPath: string): Promise<void> {
    try {
      const { spawn } = await import('child_process');
      
      return new Promise((resolve, reject) => {
        const git = spawn('git', ['init'], { cwd: projectPath });
        
        git.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Git init failed with code ${code}`));
          }
        });

        git.on('error', reject);
      });
    } catch (error) {
      throw new Error(`Failed to initialize git repository: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async installDependencies(projectPath: string): Promise<void> {
    try {
      const { spawn } = await import('child_process');
      
      return new Promise((resolve, reject) => {
        const npm = spawn('npm', ['install'], { cwd: projectPath });
        
        npm.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`npm install failed with code ${code}`));
          }
        });

        npm.on('error', reject);
      });
    } catch (error) {
      throw new Error(`Failed to install dependencies: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private getJavascriptMainContent(): string {
    return `/**
 * Claude Flow Project Entry Point
 */

// TODO: SwarmOrchestrator needs to be implemented
// import { SwarmOrchestrator } from 'claude-flow';

async function main() {
  const orchestrator = new SwarmOrchestrator({
    topology: 'mesh',
    maxAgents: 5
  });

  try {
    await orchestrator.initialize();
    
    // Spawn agents
    const researcher = await orchestrator.spawnAgent('researcher');
    const analyst = await orchestrator.spawnAgent('analyst');
    
    console.log('Claude Flow swarm initialized successfully!');
    
    // Your application logic here
    
  } catch (error) {
    console.error('Failed to initialize swarm:', error);
    process.exit(1);
  }
}

if (import.meta.url === \`file://\${process.argv[1]}\`) {
  main().catch(console.error);
}
`;
  }

  private getTypescriptMainContent(): string {
    return `/**
 * Claude Flow Project Entry Point
 */

import { SwarmOrchestrator, type SwarmConfig } from 'claude-flow';

async function main(): Promise<void> {
  const config: SwarmConfig = {
    topology: 'mesh',
    maxAgents: 5,
    strategy: 'balanced'
  };

  const orchestrator = new SwarmOrchestrator(config);

  try {
    await orchestrator.initialize();
    
    // Spawn agents
    const researcher = await orchestrator.spawnAgent('researcher');
    const analyst = await orchestrator.spawnAgent('analyst');
    
    console.log('Claude Flow swarm initialized successfully!');
    
    // Your application logic here
    
  } catch (error) {
    console.error('Failed to initialize swarm:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
`;
  }

  private getReadmeContent(projectName: string, template: string): string {
    return `# ${projectName}

A Claude Flow project using the ${template} template.

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start the swarm:
   \`\`\`bash
   npm start
   \`\`\`

3. Development mode:
   \`\`\`bash
   npm run dev
   \`\`\`

## Project Structure

- \`src/\` - Source code
- \`config/\` - Configuration files
- \`docs/\` - Documentation
- \`tests/\` - Test files
- \`templates/\` - Project templates

## Commands

- \`claude-flow status\` - Show swarm status
- \`claude-flow swarm start\` - Start the swarm
- \`claude-flow swarm stop\` - Stop the swarm
- \`claude-flow help\` - Show help

## Configuration

Edit \`config/claude-flow.json\` to customize your swarm configuration.

## Documentation

See the [Claude Flow documentation](https://github.com/Ejb503/claude-flow) for more information.
`;
  }

  getHelp(): string {
    return `Initialize a new claude-flow project

USAGE:
  claude-flow init [project-name] [options]

ARGUMENTS:
  [project-name]  Name for the new project (default: claude-flow-project)

OPTIONS:
  --template <template>  Project template to use (basic, typescript, javascript, node, browser) [default: basic]
  --force               Overwrite existing files
  --skip-install        Skip npm package installation
  --skip-git            Skip git repository initialization
  -h, --help            Show help

EXAMPLES:
  claude-flow init
  claude-flow init my-project
  claude-flow init my-app --template typescript
  claude-flow init existing-project --force
  claude-flow init quick-start --skip-install --skip-git

The init command creates a new claude-flow project with:
- Project structure and configuration
- Package.json with dependencies
- Main entry file
- README and documentation
- Git repository (unless --skip-git)
- Installed dependencies (unless --skip-install)
`;
  }
}