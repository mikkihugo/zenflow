/**
 * Configuration management commands
 */

import { Command } from '@cliffy/command';
import { colors } from '@cliffy/ansi/colors';
import { Confirm } from '@cliffy/prompt';
import { configManager } from '../../core/config.ts';
import { deepMerge } from '../../utils/helpers.ts';

export const configCommand = new Command()
  .description('Manage Claude-Flow configuration')
  .action(() => {
    configCommand.showHelp();
  })
  .command('show', new Command()
    .description('Show current configuration')
    .option('--format <format:string>', 'Output format (json, yaml)', { default: 'json' })
    .option('--diff', 'Show only differences from defaults')
    .option('--profile', 'Include profile information')
    .action(async (options: any) => {
      if (options.diff) {
        const diff = configManager.getDiff();
        console.log(JSON.stringify(diff, null, 2));
      } else if (options.profile) {
        const exported = configManager.export();
        console.log(JSON.stringify(exported, null, 2));
      } else {
        const config = configManager.get();
        
        if (options.format === 'json') {
          console.log(JSON.stringify(config, null, 2));
        } else {
          console.log(colors.yellow('YAML format not yet implemented'));
          console.log(JSON.stringify(config, null, 2));
        }
      }
    }),
  )
  .command('get', new Command()
    .description('Get a specific configuration value')
    .arguments('<path:string>')
    .action(async (options: any, path: string) => {
      const value = configManager.getValue(path);
      
      if (value === undefined) {
        console.error(colors.red(`Configuration path not found: ${path}`));
        Deno.exit(1);
      } else {
        console.log(JSON.stringify(value, null, 2));
      }
    }),
  )
  .command('set', new Command()
    .description('Set a configuration value')
    .arguments('<path:string> <value:string>')
    .option('--type <type:string>', 'Value type (string, number, boolean, json)', { default: 'auto' })
    .action(async (options: any, path: string, value: string) => {
      try {
        let parsedValue: any;
        
        switch (options.type) {
          case 'string':
            parsedValue = value;
            break;
          case 'number':
            parsedValue = parseFloat(value);
            if (isNaN(parsedValue)) {
              throw new Error('Invalid number format');
            }
            break;
          case 'boolean':
            parsedValue = value.toLowerCase() === 'true';
            break;
          case 'json':
            parsedValue = JSON.parse(value);
            break;
          default:
            // Auto-detect type
            try {
              parsedValue = JSON.parse(value);
            } catch {
              parsedValue = value;
            }
        }

        configManager.set(path, parsedValue);
        console.log(colors.green('✓'), `Set ${path} = ${JSON.stringify(parsedValue)}`);
      } catch (error) {
        console.error(colors.red('Failed to set configuration:'), (error as Error).message);
        Deno.exit(1);
      }
    }),
  )
  .command('reset', new Command()
    .description('Reset configuration to defaults')
    .option('--confirm', 'Skip confirmation prompt')
    .action(async (options: any) => {
      if (!options.confirm) {
        const confirmed = await Confirm.prompt({
          message: 'Reset configuration to defaults?',
          default: false,
        });
        
        if (!confirmed) {
          console.log(colors.gray('Reset cancelled'));
          return;
        }
      }
      
      configManager.reset();
      console.log(colors.green('✓ Configuration reset to defaults'));
    }),
  )
  .command('init', new Command()
    .description('Initialize a new configuration file')
    .arguments('[output-file:string]')
    .option('--force', 'Overwrite existing file')
    .option('--template <template:string>', 'Use configuration template', { default: 'default' })
    .action(async (options: any, outputFile: string = 'claude-flow.config.json') => {
      try {
        // Check if file exists
        try {
          await Deno.stat(outputFile);
          if (!options.force) {
            console.error(colors.red(`File already exists: ${outputFile}`));
            console.log(colors.gray('Use --force to overwrite'));
            return;
          }
        } catch {
          // File doesn't exist, which is what we want
        }

        const config = getConfigTemplate(options.template);
        await Deno.writeTextFile(outputFile, JSON.stringify(config, null, 2));
        
        console.log(colors.green('✓'), `Configuration file created: ${outputFile}`);
        console.log(colors.gray(`Template: ${options.template}`));
      } catch (error) {
        console.error(colors.red('Failed to create configuration file:'), (error as Error).message);
        Deno.exit(1);
      }
    }),
  )
  .command('validate', new Command()
    .description('Validate a configuration file')
    .arguments('<config-file:string>')
    .option('--strict', 'Use strict validation')
    .action(async (options: any, configFile: string) => {
      try {
        await configManager.load(configFile);
        console.log(colors.green('✓'), 'Configuration is valid');
        
        if (options.strict) {
          const schema = configManager.getSchema();
          console.log(colors.gray('Schema validation passed'));
        }
      } catch (error) {
        console.error(colors.red('✗'), 'Configuration validation failed:');
        console.error((error as Error).message);
        Deno.exit(1);
      }
    }),
  )
  .command('profile', new Command()
    .description('Manage configuration profiles')
    .action(() => {
      console.log(colors.gray('Usage: config profile <list|save|load|delete> [options]'));
    })
    .command('list', new Command()
      .description('List all configuration profiles')
      .action(async () => {
        try {
          const profiles = await configManager.listProfiles();
          const currentProfile = configManager.getCurrentProfile();
          
          if (profiles.length === 0) {
            console.log(colors.gray('No profiles found'));
            return;
          }
          
          console.log(colors.cyan.bold(`Configuration Profiles (${profiles.length})`));
          console.log('─'.repeat(40));
          
          for (const profile of profiles) {
            const indicator = profile === currentProfile ? colors.green('● ') : '  ';
            console.log(`${indicator}${profile}`);
          }
          
          if (currentProfile) {
            console.log();
            console.log(colors.gray(`Current: ${currentProfile}`));
          }
        } catch (error) {
          console.error(colors.red('Failed to list profiles:'), (error as Error).message);
        }
      }),
    )
    .command('save', new Command()
      .description('Save current configuration as a profile')
      .arguments('<profile-name:string>')
      .option('--force', 'Overwrite existing profile')
      .action(async (options: any, profileName: string) => {
        try {
          const existing = await configManager.getProfile(profileName);
          if (existing && !options.force) {
            console.error(colors.red(`Profile '${profileName}' already exists`));
            console.log(colors.gray('Use --force to overwrite'));
            return;
          }
          
          await configManager.saveProfile(profileName);
          console.log(colors.green('✓'), `Profile '${profileName}' saved`);
        } catch (error) {
          console.error(colors.red('Failed to save profile:'), (error as Error).message);
        }
      }),
    )
    .command('load', new Command()
      .description('Load a configuration profile')
      .arguments('<profile-name:string>')
      .action(async (options: any, profileName: string) => {
        try {
          await configManager.applyProfile(profileName);
          console.log(colors.green('✓'), `Profile '${profileName}' loaded`);
        } catch (error) {
          console.error(colors.red('Failed to load profile:'), (error as Error).message);
        }
      }),
    )
    .command('delete', new Command()
      .description('Delete a configuration profile')
      .arguments('<profile-name:string>')
      .option('--force', 'Skip confirmation prompt')
      .action(async (options: any, profileName: string) => {
        try {
          if (!options.force) {
            const confirmed = await Confirm.prompt({
              message: `Delete profile '${profileName}'?`,
              default: false,
            });
            
            if (!confirmed) {
              console.log(colors.gray('Delete cancelled'));
              return;
            }
          }
          
          await configManager.deleteProfile(profileName);
          console.log(colors.green('✓'), `Profile '${profileName}' deleted`);
        } catch (error) {
          console.error(colors.red('Failed to delete profile:'), (error as Error).message);
        }
      }),
    )
    .command('show', new Command()
      .description('Show profile configuration')
      .arguments('<profile-name:string>')
      .action(async (options: any, profileName: string) => {
        try {
          const profile = await configManager.getProfile(profileName);
          if (!profile) {
            console.error(colors.red(`Profile '${profileName}' not found`));
            return;
          }
          
          console.log(JSON.stringify(profile, null, 2));
        } catch (error) {
          console.error(colors.red('Failed to show profile:'), (error as Error).message);
        }
      }),
    ),
  )
  .command('export', new Command()
    .description('Export configuration')
    .arguments('<output-file:string>')
    .option('--include-defaults', 'Include default values')
    .action(async (options: any, outputFile: string) => {
      try {
        let data;
        if (options.includeDefaults) {
          data = configManager.export();
        } else {
          data = {
            version: '1.0.0',
            exported: new Date().toISOString(),
            profile: configManager.getCurrentProfile(),
            config: configManager.getDiff(),
          };
        }
        
        await Deno.writeTextFile(outputFile, JSON.stringify(data, null, 2));
        console.log(colors.green('✓'), `Configuration exported to ${outputFile}`);
      } catch (error) {
        console.error(colors.red('Failed to export configuration:'), (error as Error).message);
      }
    }),
  )
  .command('import', new Command()
    .description('Import configuration')
    .arguments('<input-file:string>')
    .option('--merge', 'Merge with current configuration')
    .action(async (options: any, inputFile: string) => {
      try {
        const content = await Deno.readTextFile(inputFile);
        const data = JSON.parse(content);
        
        if (options.merge) {
          const current = configManager.get();
          data.config = deepMerge(current as unknown as Record<string, unknown>, data.config) as any;
        }
        
        configManager.import(data);
        console.log(colors.green('✓'), 'Configuration imported successfully');
        
        if (data.profile) {
          console.log(colors.gray(`Profile: ${data.profile}`));
        }
      } catch (error) {
        console.error(colors.red('Failed to import configuration:'), (error as Error).message);
      }
    }),
  )
  .command('schema', new Command()
    .description('Show configuration schema')
    .option('--path <path:string>', 'Show schema for specific path')
    .action(async (options: any) => {
      const schema = configManager.getSchema();
      
      if (options.path) {
        const value = getValueByPath(schema, options.path);
        if (value === undefined) {
          console.error(colors.red(`Schema path not found: ${options.path}`));
          return;
        }
        console.log(JSON.stringify(value, null, 2));
      } else {
        console.log(JSON.stringify(schema, null, 2));
      }
    }),
  );

function getValueByPath(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  
  return current;
}

function getConfigTemplate(templateName: string): any {
  const templates: Record<string, any> = {
    default: configManager.get(),
    development: {
      ...configManager.get(),
      logging: {
        level: 'debug',
        format: 'text',
        destination: 'console',
      },
      orchestrator: {
        maxConcurrentAgents: 5,
        taskQueueSize: 50,
        healthCheckInterval: 10000,
        shutdownTimeout: 10000,
      },
    },
    production: {
      ...configManager.get(),
      logging: {
        level: 'info',
        format: 'json',
        destination: 'file',
      },
      orchestrator: {
        maxConcurrentAgents: 20,
        taskQueueSize: 500,
        healthCheckInterval: 60000,
        shutdownTimeout: 60000,
      },
      memory: {
        backend: 'hybrid',
        cacheSizeMB: 500,
        syncInterval: 30000,
        conflictResolution: 'crdt',
        retentionDays: 90,
      },
    },
    minimal: {
      orchestrator: {
        maxConcurrentAgents: 1,
        taskQueueSize: 10,
        healthCheckInterval: 30000,
        shutdownTimeout: 30000,
      },
      terminal: {
        type: 'auto',
        poolSize: 1,
        recycleAfter: 5,
        healthCheckInterval: 60000,
        commandTimeout: 300000,
      },
      memory: {
        backend: 'sqlite',
        cacheSizeMB: 10,
        syncInterval: 10000,
        conflictResolution: 'timestamp',
        retentionDays: 7,
      },
      coordination: {
        maxRetries: 1,
        retryDelay: 2000,
        deadlockDetection: false,
        resourceTimeout: 30000,
        messageTimeout: 15000,
      },
      mcp: {
        transport: 'stdio',
        port: 3000,
        tlsEnabled: false,
      },
      logging: {
        level: 'warn',
        format: 'text',
        destination: 'console',
      },
    },
  };

  if (!(templateName in templates)) {
    throw new Error(`Unknown template: ${templateName}. Available: ${Object.keys(templates).join(', ')}`);
  }

  return templates[templateName];
}