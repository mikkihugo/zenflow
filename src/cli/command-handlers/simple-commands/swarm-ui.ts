#!/usr/bin/env node
/**
 * Enhanced Swarm UI with real-time monitoring and control;
 * Uses blessed for terminal UI;
 */

import { exec } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import blessed from 'blessed';
import { validatePID } from '../../../utils/security.js';

class SwarmUI {
  constructor() {
    this.screen = null;
    this.swarmData = {objectives = null;
    this.updateInterval = null;
    this.logBuffer = [];
    this.maxLogLines = 100;
    this.activeProcesses = new Map(); // Track active processes for cross-platform termination
  }
  async init() {
    // Create blessed screen
    this.screen = blessed.screen({
      smartCSR,title = blessed.box({parent = blessed.box({
      parent,top = blessed.box({
      parent,top = blessed.box({
      parent,top = blessed.list({
      parent,top = blessed.list({
      parent,top = blessed.box({
      parent,top = blessed.list({
      parent,top = blessed.box({
      parent,top = blessed.box({
      parent,top = blessed.log({
      parent,top = blessed.box({
      parent,top = blessed.button({parent = blessed.button({parent = blessed.textbox({
      parent,
    (_bottom) => {
      this.cleanup();
      process.exit(0);
    };
    )
    // Objective selection
    this
    .
    objectivesList
    .
    on('select', (item, index)
    => 
      this.
    selectedObjective = this.swarmData.objectives[index]
    this
    .
    updateTasksList()
    this
    .
    log(`Selected objective =>
    {
      const _task = this.swarmData.tasks[index];
      if (task) {
        this.updateTaskDetails(task);
      }
    }
    )
    // Create objective button
    this.createButton.on('press', () =>
    this.promptCreateObjective()
    )
    // Stop swarm button
    this.stopButton.on('press', () =>
    this.stopSwarm()
    )
    // Command input
    this.commandBox.on('submit', (_value) =>
    this.executeCommand(value)
    this.commandBox.clearValue()
    this.screen.render()
    )
    // Focus management
    this.screen.key(['tab'], () =>
    this.screen.focusNext()
    )
    this.screen.key(['S-tab'], () => 
      this.screen.focusPrevious()
    )
  }
  async startMonitoring();
  {
  this.
  log('Starting swarm monitoring...');
  // Update interval
  this;
  .
  updateInterval = setInterval(() => {
    this.updateSwarmData();
  }, 2000);
  // Initial update
  await;
  this;
  .
  updateSwarmData();
}
async;
updateSwarmData();
{
    try {
      // Load swarm data from file system
      const _swarmRunsDir = './swarm-runs';
;
      try {
        const _runs = await fs.readdir(swarmRunsDir);
        this.swarmData.objectives = [];
        this.swarmData.agents = [];
        this.swarmData.tasks = [];
;
        for(const runDir of runs) {
          const _configPath = path.join(swarmRunsDir, runDir, 'config.json');
          try {
            const _configData = await fs.readFile(configPath, 'utf-8');
            const __config = JSON.parse(configData);
;
            this.swarmData.objectives.push({id = path.join(swarmRunsDir, runDir, 'agents');
            try {
              const _agents = await fs.readdir(agentsDir);
              for(const agentDir of agents) {
                const _taskPath = path.join(agentsDir, agentDir, 'task.json');
                try {
                  const _taskData = await fs.readFile(taskPath, 'utf-8');
                  const __task = JSON.parse(taskData);
;
                  this.swarmData.agents.push({id = 'idle';
      }
    } catch(error) ;
      this.log(`Error updating swarmdata = this.swarmData.objectives.filter((o) => o.status === 'running').length;
    this.statusBox.setContent(;
    `Status = this.swarmData.objectives.map(;
      (_obj) => `;
    $obj.status === 'running' ? '🟢' : '🔴';
    $obj.description.substring(0, 25);
    ...`,
    )
    this.objectivesList.setItems(objectiveItems.length > 0 ?objectiveItems = this.swarmData.agents.map(;
    (agent) => `${agent.status === 'active' ? '🤖' : '💤'} ${agent.id.substring(0, 15)}...`,
    )
    this.agentsList.setItems(agentItems.length > 0 ?agentItems = this.swarmData.tasks.filter(;
    (task) => task.swarmId === this.selectedObjective.id,
    )
    promptBox.destroy();
    this.screen.render();
    )
    this.screen.render();
  }
  async createObjective(description): unknown;
  try;
      this.
  log(`Creatingobjective = ['swarm', description, '--ui', '--monitor'];
  const;
  _process = spawn('claude-zen', args, {detached = `swarm-${Date.now()}`;
  this;
  .
  activeProcesses;
  .set(
  processId;
  ,
  process;
  )
  this;
  .
  log(`Launched swarm with PID => {
        this.updateSwarmData();
, 2000)
catch(error)
this.log(`Error creatingobjective = 0;
;
      // First, try to stop tracked processes
      for(const [processId, process] of this.activeProcesses) {
        try {
          // Use process.kill() for cross-platform compatibility
          if(process.pid && !process.killed) {
            process.kill('SIGTERM');
            stoppedCount++;
            this.log(`Stopped process ${processId} (PID = 'stopped';
this.updateDisplay();
catch(error)
this.log(`Error stoppingswarm = === 'win32') ;
      // Windows => {
          if(!error && stdout) {
            const _pids = stdout;
              .split('\n');
              .map((line) => line.trim());
              .filter((line) => /^\d+$/.test(line));
;
            pids.forEach((pid) => {
              // Validate PID before using in command
              const _validatedPID = validatePID(pid);
              if(validatedPID) {
                exec(`taskkill /F /PID ${validatedPID}`, (killError) => {
                  if(!killError) {
                    this.log(`Stopped orphaned process PID => {
        if(!error && stdout) {
          const _lines = stdout.split('\n').filter((line) => line.trim());
          lines.forEach((line) => {
            const _parts = line.split(/\s+/);
            const _pid = parts[1];
            const _validatedPID = validatePID(pid);
            if(validatedPID) {
              try {
                process.kill(validatedPID, 'SIGTERM');
                this.log(`Stopped orphaned process _PID => {
        if(error) {
          this.log(`Commanderror = 'info'): unknown {
    const _timestamp = new Date().toLocaleTimeString();
    const _levelColors = {info = `{${levelColors[level]  ?? 'white'}-fg}[${timestamp}] ${message}{/}`;
;
    this.logBuffer.push(coloredMessage);
    if(this.logBuffer.length > this.maxLogLines) {
      this.logBuffer.shift();
    }
;
    if(this.logBox) {
      this.logBox.log(coloredMessage);
      this.screen.render();
    }
  }
;
  cleanup() ;
    if(this.updateInterval) {
      clearInterval(this.updateInterval);
    }
;
    // Clean up any remaining processes
    for(const [processId, process] of this.activeProcesses) {
      try {
        if(process.pid && !process.killed) {
          process.kill('SIGTERM');
        }
      } catch (/* err */) {
        // Ignore errors during cleanup
      }
    }
    this.activeProcesses.clear();
}
;
// Main execution
async function main(): unknown {
  const _ui = new SwarmUI();
;
  try {
    await ui.init();
  } catch (/* error */) {
    console.error('Failed to initialize Swarm UI => {
  console.error('Uncaught exception => {
  console.error('Unhandledrejection = === `file://${process.argv[1]}`) {
  main();
}
;
export default SwarmUI;
