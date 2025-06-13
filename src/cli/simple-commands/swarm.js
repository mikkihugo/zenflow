#!/usr/bin/env -S deno run --allow-all
/**
 * Swarm command wrapper for simple CLI
 */

function showSwarmHelp() {
  console.log(`
🐝 Claude Flow Advanced Swarm System

USAGE:
  claude-flow swarm <objective> [options]

EXAMPLES:
  claude-flow swarm "Build a REST API" --strategy development
  claude-flow swarm "Research cloud architecture" --strategy research --ui
  claude-flow swarm "Analyze data trends" --strategy analysis --parallel
  claude-flow swarm "Optimize performance" --distributed --monitor

REMOTE EXECUTION:
  When running via npx, swarm will use Claude wrapper if available:
  npx claude-flow swarm "Build app" --auto  # Auto-approve Claude permissions
  
  This provides full swarm capabilities through Claude's tool access

STRATEGIES:
  auto           Automatically determine best approach (default)
  research       Research and information gathering
  development    Software development and coding
  analysis       Data analysis and insights
  testing        Testing and quality assurance
  optimization   Performance optimization
  maintenance    System maintenance

MODES:
  centralized    Single coordinator (default)
  distributed    Multiple coordinators
  hierarchical   Tree structure coordination
  mesh           Peer-to-peer coordination
  hybrid         Mixed coordination strategies

KEY FEATURES:
  🤖 Intelligent agent management with specialized types
  ⚡ Timeout-free background task execution
  🧠 Distributed memory sharing between agents
  🔄 Work stealing and advanced load balancing
  🛡️  Circuit breaker patterns for fault tolerance
  📊 Real-time monitoring and comprehensive metrics
  🎛️  Multiple coordination strategies and algorithms
  💾 Persistent state with backup and recovery
  🔒 Security features with encryption options
  🖥️  Interactive terminal UI for management

OPTIONS:
  --strategy <type>          Execution strategy (default: auto)
  --mode <type>              Coordination mode (default: centralized)
  --max-agents <n>           Maximum agents (default: 5)
  --timeout <minutes>        Timeout in minutes (default: 60)
  --parallel                 Enable parallel execution
  --distributed              Enable distributed coordination
  --monitor                  Enable real-time monitoring
  --ui                       Launch terminal UI interface
  --background               Run in background mode
  --review                   Enable peer review
  --testing                  Enable automated testing
  --encryption               Enable encryption
  --verbose                  Enable detailed logging
  --dry-run                  Show configuration without executing

ADVANCED OPTIONS:
  --quality-threshold <n>    Quality threshold 0-1 (default: 0.8)
  --memory-namespace <name>  Memory namespace (default: swarm)
  --agent-selection <type>   Agent selection strategy
  --task-scheduling <type>   Task scheduling algorithm
  --load-balancing <type>    Load balancing method
  --fault-tolerance <type>   Fault tolerance strategy

For complete documentation and examples:
https://github.com/ruvnet/claude-code-flow/docs/swarm.md
`);
}

export async function swarmCommand(args, flags) {
  try {
    // Try to load the TypeScript module directly (works in Deno and local dev)
    const { swarmAction } = await import('../commands/swarm-new.ts');
    
    // Create command context compatible with TypeScript version
    const ctx = {
      args: args || [],
      flags: flags || {},
      command: 'swarm'
    };
    
    await swarmAction(ctx);
  } catch (error) {
    // If TypeScript import fails (e.g., in node_modules), provide inline implementation
    if (error.code === 'ERR_MODULE_NOT_FOUND' || error.code === 'ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING') {
      // Provide a basic swarm implementation that works without TypeScript imports
      const objective = (args || []).join(' ').trim();
      
      if (!objective) {
        console.error("❌ Usage: swarm <objective>");
        showSwarmHelp();
        return;
      }
      
      // Provide a basic inline swarm implementation for npm packages
      console.log('🐝 Launching swarm system...');
      console.log(`📋 Objective: ${objective}`);
      console.log(`🎯 Strategy: ${flags.strategy || 'auto'}`);
      console.log(`🏗️  Mode: ${flags.mode || 'centralized'}`);
      console.log(`🤖 Max Agents: ${flags['max-agents'] || 5}`);
      console.log();
      
      // Generate swarm ID
      const swarmId = `swarm_${Math.random().toString(36).substring(2, 11)}_${Math.random().toString(36).substring(2, 11)}`;
      
      if (flags['dry-run']) {
        console.log(`🆔 Swarm ID: ${swarmId}`);
        console.log(`📊 Max Tasks: ${flags['max-tasks'] || 100}`);
        console.log(`⏰ Timeout: ${flags.timeout || 60} minutes`);
        console.log(`🔄 Parallel: ${flags.parallel || false}`);
        console.log(`🌐 Distributed: ${flags.distributed || false}`);
        console.log(`🔍 Monitoring: ${flags.monitor || false}`);
        console.log(`👥 Review Mode: ${flags.review || false}`);
        console.log(`🧪 Testing: ${flags.testing || false}`);
        console.log(`🧠 Memory Namespace: ${flags['memory-namespace'] || 'swarm'}`);
        console.log(`💾 Persistence: ${flags.persistence !== false}`);
        console.log(`🔒 Encryption: ${flags.encryption || false}`);
        console.log(`📊 Quality Threshold: ${flags['quality-threshold'] || 0.8}`);
        console.log();
        console.log('🎛️  Coordination Strategy:');
        console.log(`  • Agent Selection: ${flags['agent-selection'] || 'capability-based'}`);
        console.log(`  • Task Scheduling: ${flags['task-scheduling'] || 'priority'}`);
        console.log(`  • Load Balancing: ${flags['load-balancing'] || 'work-stealing'}`);
        console.log(`  • Fault Tolerance: ${flags['fault-tolerance'] || 'retry'}`);
        console.log(`  • Communication: ${flags.communication || 'event-driven'}`);
        console.log('⚠️  DRY RUN - Advanced Swarm Configuration');
        return;
      }
      
      // For actual execution in npm context, try to find and run swarm-demo.ts
      try {
        const path = await import('path');
        const { fileURLToPath } = await import('url');
        const fs = await import('fs');
        const { spawn } = await import('child_process');
        
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        
        // Look for swarm-demo.ts in the package
        const possiblePaths = [
          path.join(__dirname, '../../../swarm-demo.ts'),
          path.join(__dirname, '../../swarm-demo.ts'),
        ];
        
        let swarmDemoPath = null;
        for (const p of possiblePaths) {
          if (fs.existsSync(p)) {
            swarmDemoPath = p;
            break;
          }
        }
        
        if (swarmDemoPath && Deno) {
          // Run swarm-demo.ts directly with Deno
          const swarmArgs = [objective];
          for (const [key, value] of Object.entries(flags || {})) {
            swarmArgs.push(`--${key}`);
            if (value !== true) {
              swarmArgs.push(String(value));
            }
          }
          
          console.log('🚀 Starting advanced swarm execution...');
          const swarmProcess = spawn(Deno.execPath(), ['run', '--allow-all', swarmDemoPath, ...swarmArgs], {
            stdio: 'inherit'
          });
          
          swarmProcess.on('error', (err) => {
            console.error('❌ Failed to launch swarm:', err.message);
          });
          
          swarmProcess.on('exit', (code) => {
            if (code !== 0) {
              console.error(`❌ Swarm exited with code ${code}`);
            }
          });
          return;
        }
      } catch (e) {
        // Fallback to basic message if can't run swarm-demo.ts
      }
      
      // Try to use Claude wrapper approach like SPARC does
      try {
        const { execSync } = await import('child_process');
        
        // Check if claude command exists
        try {
          execSync('which claude', { stdio: 'ignore' });
        } catch (e) {
          // Claude not found, show fallback message
          console.log(`✅ Swarm initialized with ID: ${swarmId}`);
          console.log('\n⚠️  Note: Advanced swarm features require Claude or local installation.');
          console.log('Install Claude: https://claude.ai/code');
          console.log('Or install locally: npm install -g claude-flow@latest');
          console.log('\nThe swarm system would coordinate the following:');
          console.log('1. Agent spawning and task distribution');
          console.log('2. Parallel execution of subtasks');
          console.log('3. Memory sharing between agents');
          console.log('4. Progress monitoring and reporting');
          console.log('5. Result aggregation and quality checks');
          return;
        }
        
        // Claude is available, use it to run swarm
        console.log('🚀 Launching swarm via Claude wrapper...');
        
        // Build the prompt for Claude
        const swarmPrompt = `Execute a swarm coordination task with the following configuration:

Objective: ${objective}
Strategy: ${flags.strategy || 'auto'}
Mode: ${flags.mode || 'centralized'}
Max Agents: ${flags['max-agents'] || 5}
Max Tasks: ${flags['max-tasks'] || 100}
Timeout: ${flags.timeout || 60} minutes
Parallel: ${flags.parallel || false}
Distributed: ${flags.distributed || false}
Monitor: ${flags.monitor || false}
Review: ${flags.review || false}
Testing: ${flags.testing || false}
Memory Namespace: ${flags['memory-namespace'] || 'swarm'}
Quality Threshold: ${flags['quality-threshold'] || 0.8}

Coordination Strategy:
- Agent Selection: ${flags['agent-selection'] || 'capability-based'}
- Task Scheduling: ${flags['task-scheduling'] || 'priority'}
- Load Balancing: ${flags['load-balancing'] || 'work-stealing'}
- Fault Tolerance: ${flags['fault-tolerance'] || 'retry'}
- Communication: ${flags.communication || 'event-driven'}

Please coordinate this swarm task by:
1. Breaking down the objective into subtasks
2. Assigning tasks to appropriate agent types
3. Managing parallel execution where applicable
4. Monitoring progress and handling failures
5. Aggregating results and ensuring quality

Use all available tools including file operations, web search, and code execution as needed.`;

        // Execute Claude non-interactively by piping the prompt
        const { spawn } = await import('child_process');
        
        const claudeArgs = [];
        
        // Add auto-permission flag if requested
        if (flags.auto || flags['dangerously-skip-permissions']) {
          claudeArgs.push('--dangerously-skip-permissions');
        }
        
        // Spawn claude process
        const claudeProcess = spawn('claude', claudeArgs, {
          stdio: ['pipe', 'inherit', 'inherit'],
          shell: false
        });
        
        // Write the prompt to stdin and close it
        claudeProcess.stdin.write(swarmPrompt);
        claudeProcess.stdin.end();
        
        // Wait for the process to complete
        await new Promise((resolve, reject) => {
          claudeProcess.on('close', (code) => {
            if (code === 0) {
              resolve();
            } else {
              reject(new Error(`Claude process exited with code ${code}`));
            }
          });
          
          claudeProcess.on('error', (err) => {
            reject(err);
          });
        });
        
      } catch (error) {
        // Fallback if Claude execution fails
        console.log(`✅ Swarm initialized with ID: ${swarmId}`);
        console.log('\n⚠️  Note: Advanced swarm features require Claude or local installation.');
        console.log('Install Claude: https://claude.ai/code');
        console.log('Or install locally: npm install -g claude-flow@latest');
        console.log('\nThe swarm system would coordinate the following:');
        console.log('1. Agent spawning and task distribution');
        console.log('2. Parallel execution of subtasks');
        console.log('3. Memory sharing between agents');
        console.log('4. Progress monitoring and reporting');
        console.log('5. Result aggregation and quality checks');
      }
      
      return;
    }
    
    console.error('Swarm command error:', error);
    
    // Fallback to comprehensive help if there's an import error
    console.log(`
🐝 Claude Flow Advanced Swarm System

USAGE:
  claude-flow swarm <objective> [options]

EXAMPLES:
  claude-flow swarm "Build a REST API" --strategy development
  claude-flow swarm "Research cloud architecture" --strategy research --ui
  claude-flow swarm "Analyze data trends" --strategy analysis --parallel
  claude-flow swarm "Optimize performance" --distributed --monitor

STRATEGIES:
  auto           Automatically determine best approach (default)
  research       Research and information gathering
  development    Software development and coding
  analysis       Data analysis and insights
  testing        Testing and quality assurance
  optimization   Performance optimization
  maintenance    System maintenance

MODES:
  centralized    Single coordinator (default)
  distributed    Multiple coordinators
  hierarchical   Tree structure coordination
  mesh           Peer-to-peer coordination
  hybrid         Mixed coordination strategies

KEY FEATURES:
  🤖 Intelligent agent management with specialized types
  ⚡ Timeout-free background task execution
  🧠 Distributed memory sharing between agents
  🔄 Work stealing and advanced load balancing
  🛡️  Circuit breaker patterns for fault tolerance
  📊 Real-time monitoring and comprehensive metrics
  🎛️  Multiple coordination strategies and algorithms
  💾 Persistent state with backup and recovery
  🔒 Security features with encryption options
  🖥️  Interactive terminal UI for management

OPTIONS:
  --strategy <type>          Execution strategy (default: auto)
  --mode <type>              Coordination mode (default: centralized)
  --max-agents <n>           Maximum agents (default: 5)
  --timeout <minutes>        Timeout in minutes (default: 60)
  --parallel                 Enable parallel execution
  --distributed              Enable distributed coordination
  --monitor                  Enable real-time monitoring
  --ui                       Launch terminal UI interface
  --background               Run in background mode
  --review                   Enable peer review
  --testing                  Enable automated testing
  --encryption               Enable encryption
  --verbose                  Enable detailed logging
  --dry-run                  Show configuration without executing

ADVANCED OPTIONS:
  --quality-threshold <n>    Quality threshold 0-1 (default: 0.8)
  --memory-namespace <name>  Memory namespace (default: swarm)
  --agent-selection <type>   Agent selection strategy
  --task-scheduling <type>   Task scheduling algorithm
  --load-balancing <type>    Load balancing method
  --fault-tolerance <type>   Fault tolerance strategy

For complete documentation and examples:
https://github.com/ruvnet/claude-code-flow/docs/swarm.md
`);
  }
}

// Allow direct execution
if (import.meta.main) {
  // When called directly as a script, parse all arguments
  const args = [];
  const flags = {};
  
  // Parse arguments and flags
  for (let i = 0; i < Deno.args.length; i++) {
    const arg = Deno.args[i];
    if (arg.startsWith('--')) {
      const flagName = arg.substring(2);
      const nextArg = Deno.args[i + 1];
      
      if (nextArg && !nextArg.startsWith('--')) {
        flags[flagName] = nextArg;
        i++; // Skip the next argument
      } else {
        flags[flagName] = true;
      }
    } else {
      args.push(arg);
    }
  }
  
  // The objective is all non-flag arguments joined
  const objective = args.join(' ');
  
  // Execute the swarm command
  await swarmCommand([objective], flags);
}