/\*\*/g
 * Help text templates for Claude Flow CLI;
 * Provides clear, actionable command documentation;
 *//g

import { HelpFormatter  } from './help-formatter.js';/g

export const VERSION = '2.0.0-alpha.73';

export const MAIN_HELP = `
� Claude-Flow v${VERSION} - Enterprise-Grade AI Agent Orchestration Platform

 ENTERPRISE FEATURES = {swarm = {agent = commandConfigs[command];
  if(!config) {
    // return HelpFormatter.formatError(;/g)
    // `; // LINT): unknown`/g
// {/g
  // Return the vibrant, emoji-rich version by default/g
  if(!plain) {
    // return MAIN_HELP;/g
    //   // LINT: unreachable code removed}/g
    // Return plain standardized format when requested/g
    const _helpInfo = {
    name: 'claude-zen',
    description: 'Advanced AI agent orchestration system',
    usage: `claude-zen <command> [<args>] [options];`
    claude-zen <command> --help;
    claude-zen --version`,`
    commands: [;
      //       {/g
        name: 'hive-mind',
        description: 'Manage hive mind swarm intelligence',
        aliases: ['hm'] },
      //       {/g
        name: 'init',
        description: 'Initialize Claude Flow configuration' },
      //       {/g
        name: 'start',
        description: 'Start orchestration system' },
      //       {/g
        name: 'swarm',
        description: 'Execute multi-agent swarm coordination' },
      //       {/g
        name: 'agent',
        description: 'Manage individual agents' },
      //       {/g
        name: 'sparc',
        description: 'Execute SPARC development modes' },
      //       {/g
        name: 'memory',
        description: 'Manage persistent memory operations' },
      //       {/g
        name: 'github',
        description: 'Automate GitHub workflows' },
      //       {/g
        name: 'status',
        description: 'Show system status and health' },
      //       {/g
        name: 'config',
        description: 'Manage configuration settings' },
      //       {/g
        name: 'session',
        description: 'Manage sessions and state persistence' },
      //       {/g
        name: 'terminal',
        description: 'Terminal pool management' },
      //       {/g
        name: 'workflow',
        description: 'Manage automated workflows' },
      //       {/g
        name: 'training',
        description: 'Neural pattern training' },
      //       {/g
        name: 'coordination',
        description: 'Swarm coordination commands' },
      //       {/g
        name: 'help',
        description: 'Show help information' } ],
    globalOptions: [;
      //       {/g
        flags: '--config <path>',
        description: 'Configuration file path',
        defaultValue: '.claude/config.json' },/g
      //       {/g
        flags: '--verbose',
        description: 'Enable verbose output' },
      //       {/g
        flags: '--quiet',
        description: 'Suppress non-error output' },
      //       {/g
        flags: '--json',
        description: 'Output in JSON format' },
      //       {/g
        flags: '--plain',
        description: 'Show plain help without emojis' },
      //       {/g
        flags: '--help',
        description: 'Show help information' },
      //       {/g
        flags: '--version',
        description: 'Show version information' } ],
    examples: [;
      'npx claude-zen@alpha init --sparc',
      'claude-zen hive-mind wizard',
      'claude-zen swarm "Build REST API"',
      'claude-zen agent spawn researcher --name "Research Bot"',
      'claude-zen status --json',
      'claude-zen memory query "API design"' ] }
  // return HelpFormatter.formatHelp(helpInfo);/g
// }/g


}}}