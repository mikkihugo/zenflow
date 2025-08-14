#!/usr/bin/env node

/**
 * @fileoverview claude-code-zen Swarm Configuration Utility
 * 
 * This utility helps configure Claude Code to use either our native TypeScript
 * swarm system or fallback to ruv-swarm via npm. It automatically handles
 * MCP server registration and provides easy switching between modes.
 * 
 * Usage:
 *   npx claude-zen configure-swarm native    # Use native TypeScript swarm
 *   npx claude-zen configure-swarm fallback  # Install and use ruv-swarm
 *   npx claude-zen configure-swarm status    # Show current configuration
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🐝 claude-code-zen Swarm Configuration Utility');
console.log('================================================\n');

const command = process.argv[2];

function executeCommand(cmd, description) {
  console.log(`🔧 ${description}...`);
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log('✅ Success!\n');
    return true;
  } catch (error) {
    console.error(`❌ Failed: ${error.message}\n`);
    return false;
  }
}

function checkClaudeAvailable() {
  try {
    execSync('claude --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function configureNativeSwarm() {
  console.log('🚀 Configuring claude-code-zen Native Swarm\n');
  
  if (!checkClaudeAvailable()) {
    console.log('❌ Claude Code CLI not found. Please install it first:');
    console.log('   npm install -g @anthropic-ai/claude-code');
    return false;
  }

  console.log('📦 Features of claude-code-zen Native Swarm:');
  console.log('   • Advanced agent learning and adaptation');
  console.log('   • Task duration prediction with confidence scoring');
  console.log('   • Agent health monitoring with degradation detection');
  console.log('   • SPARC methodology integration');
  console.log('   • DSPy neural coordination');
  console.log('   • Multi-database storage (SQLite, LanceDB, Kuzu)');
  console.log('   • Native TypeScript implementation\n');

  // Remove ruv-swarm if it exists
  executeCommand('claude mcp remove ruv-swarm 2>/dev/null || true', 'Removing any existing ruv-swarm MCP server');
  
  // Add our native MCP server
  const success = executeCommand(
    'claude mcp add claude-zen npx claude-zen mcp start',
    'Adding claude-code-zen native MCP server'
  );

  if (success) {
    console.log('🎉 claude-code-zen Native Swarm configured successfully!');
    console.log('\n📋 Available MCP tools:');
    console.log('   • mcp__claude-zen__swarm_init - Initialize intelligent swarm');
    console.log('   • mcp__claude-zen__agent_spawn - Create adaptive agents');
    console.log('   • mcp__claude-zen__task_orchestrate - Orchestrate with prediction');
    console.log('   • mcp__claude-zen__agent_learning - Dynamic learning rates');
    console.log('   • mcp__claude-zen__task_prediction - Duration prediction');
    console.log('   • mcp__claude-zen__agent_health - Health monitoring');
    console.log('   • ...and many more advanced features\n');
    
    console.log('🚀 Quick start example:');
    console.log('   claude "Initialize a mesh swarm with 5 adaptive agents using mcp__claude-zen__swarm_init"');
  }

  return success;
}

function configureFallbackSwarm() {
  console.log('🛡️ Configuring ruv-swarm Fallback Option\n');
  
  if (!checkClaudeAvailable()) {
    console.log('❌ Claude Code CLI not found. Please install it first:');
    console.log('   npm install -g @anthropic-ai/claude-code');
    return false;
  }

  console.log('📦 Installing ruv-swarm as fallback...');
  const installSuccess = executeCommand(
    'npm install ruv-swarm',
    'Installing ruv-swarm via npm'
  );

  if (!installSuccess) {
    return false;
  }

  // Add ruv-swarm MCP server as secondary
  const mcpSuccess = executeCommand(
    'claude mcp add ruv-swarm npx ruv-swarm mcp start',
    'Adding ruv-swarm MCP server as fallback'
  );

  if (mcpSuccess) {
    console.log('🛡️ ruv-swarm fallback configured successfully!');
    console.log('\n📋 Available fallback MCP tools:');
    console.log('   • mcp__ruv-swarm__swarm_init - Basic swarm initialization');
    console.log('   • mcp__ruv-swarm__agent_spawn - Standard agent creation');
    console.log('   • mcp__ruv-swarm__task_orchestrate - Basic task coordination');
    console.log('\n💡 Note: Our native swarm is recommended for advanced features');
  }

  return mcpSuccess;
}

function showStatus() {
  console.log('📊 Current Swarm Configuration Status\n');
  
  if (!checkClaudeAvailable()) {
    console.log('❌ Claude Code CLI not available');
    return;
  }

  try {
    console.log('🔍 Checking configured MCP servers...');
    execSync('claude mcp list', { stdio: 'inherit' });
  } catch (error) {
    console.log('❌ Could not list MCP servers');
  }

  console.log('\n💡 Recommendations:');
  console.log('   • Primary: claude-code-zen native swarm (advanced features)');
  console.log('   • Fallback: ruv-swarm via npm (basic functionality)');
  console.log('\n🚀 Configure with:');
  console.log('   npx claude-zen configure-swarm native');
  console.log('   npx claude-zen configure-swarm fallback');
}

function showHelp() {
  console.log('📖 claude-code-zen Swarm Configuration Help\n');
  console.log('Available commands:');
  console.log('  native     Configure claude-code-zen native swarm (recommended)');
  console.log('  fallback   Install and configure ruv-swarm as fallback');
  console.log('  status     Show current MCP server configuration');
  console.log('  help       Show this help message\n');
  
  console.log('Examples:');
  console.log('  npx claude-zen configure-swarm native');
  console.log('  npx claude-zen configure-swarm fallback');
  console.log('  npx claude-zen configure-swarm status\n');

  console.log('🚀 Our native swarm provides advanced features:');
  console.log('   • Agent learning and adaptation');
  console.log('   • Task prediction and optimization');
  console.log('   • Health monitoring and recovery');
  console.log('   • SPARC methodology integration');
  console.log('   • Multi-database storage support');
}

// Main execution
switch (command) {
  case 'native':
    configureNativeSwarm();
    break;
  case 'fallback':
    configureFallbackSwarm();
    break;
  case 'status':
    showStatus();
    break;
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
  default:
    console.log('❌ Invalid command. Available: native, fallback, status, help');
    console.log('Example: npx claude-zen configure-swarm native\n');
    showHelp();
    process.exit(1);
}