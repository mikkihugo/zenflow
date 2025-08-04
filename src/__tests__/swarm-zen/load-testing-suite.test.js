#!/usr/bin/env node

/**
 * Load Testing Suite for ruv-swarm
 * Tests concurrent operation of 50+ agents with stress testing scenarios
 */

const { ZenSwarm } = require('../src/index-enhanced');
const { EventEmitter } = require('node:events');
const fs = require('node:fs').promises;
const os = require('node:os');

class LoadTestingSuite extends EventEmitter {
  constructor() {
    super();
    this.testResults = {
      timestamp: new Date().toISOString(),
      systemInfo: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        cpus: os.cpus().length,
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
      },
      scenarios: [],
      performance: {
        maxConcurrentAgents: 0,
        avgResponseTime: 0,
        throughput: 0,
        errorRate: 0,
        memoryPeak: 0,
        cpuPeak: 0,
      },
      passed: false,
    };
    this.metrics = {
      responseTimes: [],
      memorySnapshots: [],
      errors: [],
      throughputData: [],
    };
    this.monitoringInterval = null;
  }

  async runLoadTests() {
    this.logSystemInfo();
    this.startSystemMonitoring();

    try {
      // Scenario 1: Gradual load increase (10 → 60 agents)
      await this.runGradualLoadTest();

      // Scenario 2: Burst load test (0 → 50 agents instantly)
      await this.runBurstLoadTest();

      // Scenario 3: Sustained load test (50 agents for 5 minutes)
      await this.runSustainedLoadTest();

      // Scenario 4: Mixed workload test (different agent types)
      await this.runMixedWorkloadTest();

      // Scenario 5: Stress test (pushing to failure point)
      await this.runStressTest();

      // Generate comprehensive report
      await this.generateLoadTestReport();
    } catch (error) {
      console.error('❌ Load testing failed:', error);
      throw error;
    } finally {
      this.stopSystemMonitoring();
    }

    return this.testResults;
  }

  logSystemInfo() {}

  startSystemMonitoring() {
    this.monitoringInterval = setInterval(() => {
      const memUsage = process.memoryUsage();
      const _cpuUsage = process.cpuUsage();

      this.metrics.memorySnapshots.push({
        timestamp: Date.now(),
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
      });

      // Update peak values
      this.testResults.performance.memoryPeak = Math.max(
        this.testResults.performance.memoryPeak,
        memUsage.heapUsed,
      );
    }, 1000);
  }

  stopSystemMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
  }

  async runGradualLoadTest() {
    const scenario = {
      name: 'Gradual Load Increase',
      startTime: Date.now(),
      agents: [],
      metrics: {
        spawnTimes: [],
        executionTimes: [],
        errors: [],
      },
      passed: false,
    };

    try {
      const ruvSwarm = await ZenSwarm.initialize({
        enableNeuralNetworks: true,
        enableForecasting: true,
        loadingStrategy: 'progressive',
      });

      const swarm = await ruvSwarm.createSwarm({
        topology: 'hierarchical',
        maxAgents: 70,
        strategy: 'parallel',
      });

      // Gradually increase load from 10 to 60 agents
      for (let batch = 10; batch <= 60; batch += 10) {
        const batchStartTime = Date.now();
        const batchPromises = [];

        for (let i = scenario.agents.length; i < batch; i++) {
          const spawnPromise = swarm
            .spawn({
              type: ['coder', 'researcher', 'analyst', 'optimizer'][i % 4],
              name: `gradual-agent-${i}`,
            })
            .then((agent) => {
              scenario.agents.push(agent);
              return agent;
            })
            .catch((error) => {
              scenario.metrics.errors.push({
                phase: 'spawn',
                agent: i,
                error: error.message,
              });
              return null;
            });

          batchPromises.push(spawnPromise);
        }

        await Promise.all(batchPromises);
        const batchSpawnTime = Date.now() - batchStartTime;
        scenario.metrics.spawnTimes.push({
          batch,
          time: batchSpawnTime,
          agentsSpawned: scenario.agents.length,
        });

        // Execute tasks for current batch
        const taskPromises = scenario.agents.map((agent, i) => {
          if (!agent) {
            return Promise.resolve();
          }

          const taskStart = Date.now();
          return agent
            .execute({
              task: `Gradual load task ${i}: Calculate fibonacci(${20 + (i % 10)})`,
              timeout: 15000,
            })
            .then(() => {
              scenario.metrics.executionTimes.push(Date.now() - taskStart);
            })
            .catch((error) => {
              scenario.metrics.errors.push({
                phase: 'execution',
                agent: i,
                error: error.message,
              });
            });
        });

        await Promise.all(taskPromises);

        // Brief pause between batches
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      scenario.passed = scenario.agents.length >= 50 && scenario.metrics.errors.length < 5;
      this.testResults.performance.maxConcurrentAgents = Math.max(
        this.testResults.performance.maxConcurrentAgents,
        scenario.agents.length,
      );
    } catch (error) {
      scenario.error = error.message;
    }

    scenario.duration = Date.now() - scenario.startTime;
    this.testResults.scenarios.push(scenario);
  }

  async runBurstLoadTest() {
    const scenario = {
      name: 'Burst Load Test',
      startTime: Date.now(),
      agents: [],
      metrics: {
        spawnTime: 0,
        firstResponseTime: 0,
        allResponsesTime: 0,
        errors: [],
      },
      passed: false,
    };

    try {
      const ruvSwarm = await ZenSwarm.initialize({
        enableNeuralNetworks: true,
        enableForecasting: false, // Reduce overhead for burst test
        loadingStrategy: 'immediate',
      });

      const swarm = await ruvSwarm.createSwarm({
        topology: 'mesh',
        maxAgents: 60,
        strategy: 'parallel',
      });
      const spawnStartTime = Date.now();

      const spawnPromises = Array.from({ length: 50 }, (_, i) =>
        swarm
          .spawn({
            type: 'coder',
            name: `burst-agent-${i}`,
          })
          .catch((error) => {
            scenario.metrics.errors.push({
              phase: 'spawn',
              agent: i,
              error: error.message,
            });
            return null;
          }),
      );

      const spawnedAgents = await Promise.all(spawnPromises);
      scenario.agents = spawnedAgents.filter((agent) => agent !== null);
      scenario.metrics.spawnTime = Date.now() - spawnStartTime;
      const execStartTime = Date.now();
      let firstResponseReceived = false;

      const taskPromises = scenario.agents.map((agent, i) => {
        const taskStart = Date.now();
        return agent
          .execute({
            task: `Burst task ${i}: Sort array of 1000 random numbers`,
            timeout: 20000,
          })
          .then(() => {
            const responseTime = Date.now() - taskStart;
            if (!firstResponseReceived) {
              scenario.metrics.firstResponseTime = Date.now() - execStartTime;
              firstResponseReceived = true;
            }
            return responseTime;
          })
          .catch((error) => {
            scenario.metrics.errors.push({
              phase: 'execution',
              agent: i,
              error: error.message,
            });
            return null;
          });
      });

      const responseTimes = await Promise.all(taskPromises);
      scenario.metrics.allResponsesTime = Date.now() - execStartTime;

      const validResponses = responseTimes.filter((t) => t !== null);
      this.metrics.responseTimes.push(...validResponses);

      scenario.passed = scenario.agents.length >= 45 && scenario.metrics.errors.length < 10;
    } catch (error) {
      scenario.error = error.message;
    }

    scenario.duration = Date.now() - scenario.startTime;
    this.testResults.scenarios.push(scenario);
  }

  async runSustainedLoadTest() {
    const scenario = {
      name: 'Sustained Load Test',
      startTime: Date.now(),
      agents: [],
      metrics: {
        tasksCompleted: 0,
        avgTaskTime: 0,
        memoryGrowth: 0,
        errors: [],
      },
      passed: false,
    };

    try {
      const ruvSwarm = await ZenSwarm.initialize({
        enableNeuralNetworks: true,
        enableForecasting: true,
        memoryOptimization: true,
      });

      const swarm = await ruvSwarm.createSwarm({
        topology: 'mesh',
        maxAgents: 60,
        strategy: 'balanced',
      });

      // Spawn 50 agents
      const spawnPromises = Array.from({ length: 50 }, (_, i) =>
        swarm.spawn({
          type: ['coder', 'researcher', 'analyst'][i % 3],
          name: `sustained-agent-${i}`,
        }),
      );

      scenario.agents = await Promise.all(spawnPromises);

      const initialMemory = process.memoryUsage().heapUsed;
      const testDuration = 5 * 60 * 1000; // 5 minutes
      const endTime = Date.now() + testDuration;
      const taskTimes = [];

      let taskCounter = 0;

      while (Date.now() < endTime) {
        const batchPromises = scenario.agents.map(async (agent, i) => {
          const taskStart = Date.now();
          try {
            await agent.execute({
              task: `Sustained task ${taskCounter}: Process data batch ${taskCounter % 100}`,
              timeout: 10000,
            });
            const taskTime = Date.now() - taskStart;
            taskTimes.push(taskTime);
            scenario.metrics.tasksCompleted++;
            return true;
          } catch (error) {
            scenario.metrics.errors.push({
              phase: 'sustained_execution',
              agent: i,
              task: taskCounter,
              error: error.message,
            });
            return false;
          }
        });

        await Promise.all(batchPromises);
        taskCounter++;

        // Brief pause to prevent overwhelming
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Log progress every minute
        if (taskCounter % 50 === 0) {
          const _elapsed = Date.now() - scenario.startTime;
          const _remaining = endTime - Date.now();
        }
      }

      const finalMemory = process.memoryUsage().heapUsed;
      scenario.metrics.memoryGrowth = finalMemory - initialMemory;
      scenario.metrics.avgTaskTime =
        taskTimes.length > 0
          ? Math.round(taskTimes.reduce((a, b) => a + b, 0) / taskTimes.length)
          : 0;

      scenario.passed =
        scenario.metrics.tasksCompleted >= 1000 &&
        scenario.metrics.errors.length < 50 &&
        scenario.metrics.memoryGrowth < 200 * 1024 * 1024; // Less than 200MB growth
    } catch (error) {
      scenario.error = error.message;
    }

    scenario.duration = Date.now() - scenario.startTime;
    this.testResults.scenarios.push(scenario);
  }

  async runMixedWorkloadTest() {
    const scenario = {
      name: 'Mixed Workload Test',
      startTime: Date.now(),
      agents: {
        coders: [],
        researchers: [],
        analysts: [],
        optimizers: [],
        coordinators: [],
      },
      metrics: {
        tasksByType: {},
        avgTimesByType: {},
        errors: [],
      },
      passed: false,
    };

    try {
      const ruvSwarm = await ZenSwarm.initialize({
        enableNeuralNetworks: true,
        enableForecasting: true,
        loadingStrategy: 'progressive',
      });

      const swarm = await ruvSwarm.createSwarm({
        topology: 'hierarchical',
        maxAgents: 60,
        strategy: 'specialized',
      });

      // Spawn different types of agents
      const agentTypes = [
        { type: 'coder', count: 15 },
        { type: 'researcher', count: 12 },
        { type: 'analyst', count: 10 },
        { type: 'optimizer', count: 8 },
        { type: 'coordinator', count: 5 },
      ];
      for (const { type, count } of agentTypes) {
        const typePromises = Array.from({ length: count }, (_, i) =>
          swarm.spawn({ type, name: `${type}-${i}` }),
        );

        const typeAgents = await Promise.all(typePromises);
        scenario.agents[`${type}s`] = typeAgents;
        scenario.metrics.tasksByType[type] = 0;
        scenario.metrics.avgTimesByType[type] = [];
      }

      const workloadPromises = Object.entries(scenario.agents).map(async ([agentType, agents]) => {
        const type = agentType.slice(0, -1); // Remove 's' suffix

        return Promise.all(
          agents.map(async (agent, i) => {
            const tasks = this.getTasksForType(type, i);

            for (const task of tasks) {
              const taskStart = Date.now();
              try {
                await agent.execute({
                  task: task.description,
                  timeout: task.timeout,
                });

                const taskTime = Date.now() - taskStart;
                scenario.metrics.avgTimesByType[type].push(taskTime);
                scenario.metrics.tasksByType[type]++;
              } catch (error) {
                scenario.metrics.errors.push({
                  phase: 'mixed_workload',
                  agentType: type,
                  agent: i,
                  task: task.description,
                  error: error.message,
                });
              }
            }
          }),
        );
      });

      await Promise.all(workloadPromises);

      // Calculate averages
      Object.entries(scenario.metrics.avgTimesByType).forEach(([type, times]) => {
        scenario.metrics.avgTimesByType[type] =
          times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
      });

      const totalAgents = Object.values(scenario.agents).flat().length;
      const totalTasks = Object.values(scenario.metrics.tasksByType).reduce((a, b) => a + b, 0);

      scenario.passed =
        totalAgents >= 50 && totalTasks >= 150 && scenario.metrics.errors.length < 15;
    } catch (error) {
      scenario.error = error.message;
    }

    scenario.duration = Date.now() - scenario.startTime;
    this.testResults.scenarios.push(scenario);
  }

  async runStressTest() {
    const scenario = {
      name: 'Stress Test',
      startTime: Date.now(),
      maxAgentsReached: 0,
      failurePoint: null,
      metrics: {
        memoryAtFailure: 0,
        agentSpawnFailures: 0,
        taskExecutionFailures: 0,
        systemErrors: [],
      },
      passed: false,
    };

    try {
      const ruvSwarm = await ZenSwarm.initialize({
        enableNeuralNetworks: true,
        enableForecasting: false,
        loadingStrategy: 'immediate',
      });

      const swarm = await ruvSwarm.createSwarm({
        topology: 'mesh',
        maxAgents: 200, // High limit for stress testing
        strategy: 'parallel',
      });

      const currentAgents = [];
      let batchSize = 10;
      const maxBatchSize = 50;

      for (let targetCount = 10; targetCount <= 150; targetCount += batchSize) {
        try {
          // Spawn additional agents
          const newAgents = [];
          const spawnPromises = [];

          for (let i = currentAgents.length; i < targetCount; i++) {
            spawnPromises.push(
              swarm
                .spawn({
                  type: 'coder',
                  name: `stress-agent-${i}`,
                })
                .then((agent) => {
                  newAgents.push(agent);
                  return agent;
                })
                .catch((error) => {
                  scenario.metrics.agentSpawnFailures++;
                  scenario.metrics.systemErrors.push({
                    phase: 'spawn',
                    agent: i,
                    error: error.message,
                  });
                  return null;
                }),
            );
          }

          const spawnedBatch = await Promise.all(spawnPromises);
          currentAgents.push(...spawnedBatch.filter((agent) => agent !== null));
          scenario.maxAgentsReached = currentAgents.length;

          // Test execution with current agent count
          const taskPromises = currentAgents.map((agent, i) => {
            if (!agent) {
              return Promise.resolve();
            }

            return agent
              .execute({
                task: `Stress test task ${i}: Heavy computation`,
                timeout: 10000,
              })
              .catch((error) => {
                scenario.metrics.taskExecutionFailures++;
                scenario.metrics.systemErrors.push({
                  phase: 'execution',
                  agent: i,
                  error: error.message,
                });
              });
          });

          await Promise.allSettled(taskPromises);

          // Check memory usage
          const memUsage = process.memoryUsage();
          const memoryMB = memUsage.heapUsed / 1024 / 1024;

          // Check if we're approaching limits
          if (memoryMB > 1000 || scenario.metrics.agentSpawnFailures > 10) {
            scenario.failurePoint = {
              agentCount: currentAgents.length,
              memory: memoryMB,
              reason: memoryMB > 1000 ? 'memory_limit' : 'spawn_failures',
            };
            break;
          }

          // Increase batch size for efficiency, but cap it
          batchSize = Math.min(batchSize + 5, maxBatchSize);
        } catch (error) {
          scenario.failurePoint = {
            agentCount: currentAgents.length,
            memory: process.memoryUsage().heapUsed / 1024 / 1024,
            reason: 'system_error',
            error: error.message,
          };
          break;
        }

        // Brief pause between stress increments
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      scenario.metrics.memoryAtFailure = process.memoryUsage().heapUsed / 1024 / 1024;
      scenario.passed = scenario.maxAgentsReached >= 80; // Minimum threshold for stress test
    } catch (error) {
      scenario.error = error.message;
    }

    scenario.duration = Date.now() - scenario.startTime;
    this.testResults.scenarios.push(scenario);
  }

  getTasksForType(type, agentIndex) {
    const taskSets = {
      coder: [
        {
          description: `Code review task ${agentIndex}: Analyze function complexity`,
          timeout: 8000,
        },
        {
          description: `Implementation task ${agentIndex}: Write sorting algorithm`,
          timeout: 12000,
        },
        { description: `Debug task ${agentIndex}: Find memory leak`, timeout: 10000 },
      ],
      researcher: [
        { description: `Research task ${agentIndex}: Literature review on AI`, timeout: 15000 },
        { description: `Analysis task ${agentIndex}: Trend analysis`, timeout: 12000 },
      ],
      analyst: [
        { description: `Data analysis ${agentIndex}: Process dataset`, timeout: 10000 },
        { description: `Statistical analysis ${agentIndex}: Correlation study`, timeout: 8000 },
      ],
      optimizer: [
        { description: `Optimization task ${agentIndex}: Algorithm tuning`, timeout: 15000 },
        { description: `Performance task ${agentIndex}: Bottleneck analysis`, timeout: 12000 },
      ],
      coordinator: [
        { description: `Coordination task ${agentIndex}: Task scheduling`, timeout: 6000 },
        { description: `Management task ${agentIndex}: Resource allocation`, timeout: 8000 },
      ],
    };

    return taskSets[type] || [{ description: `Generic task ${agentIndex}`, timeout: 8000 }];
  }

  async generateLoadTestReport() {
    // Calculate overall metrics
    const passedScenarios = this.testResults.scenarios.filter((s) => s.passed).length;
    const totalScenarios = this.testResults.scenarios.length;

    this.testResults.performance.avgResponseTime =
      this.metrics.responseTimes.length > 0
        ? Math.round(
            this.metrics.responseTimes.reduce((a, b) => a + b, 0) /
              this.metrics.responseTimes.length,
          )
        : 0;

    this.testResults.performance.errorRate =
      this.metrics.errors.length > 0
        ? (
            (this.metrics.errors.length /
              (this.metrics.responseTimes.length + this.metrics.errors.length)) *
            100
          ).toFixed(2)
        : 0;

    this.testResults.performance.memoryPeak = this.testResults.performance.memoryPeak / 1024 / 1024; // Convert to MB

    this.testResults.passed = passedScenarios >= 4; // At least 4/5 scenarios must pass

    const report = {
      ...this.testResults,
      summary: {
        totalScenarios,
        passedScenarios,
        failedScenarios: totalScenarios - passedScenarios,
        successRate: `${((passedScenarios / totalScenarios) * 100).toFixed(1)}%`,
        overallPassed: this.testResults.passed,
      },
    };

    // Save detailed report
    const reportPath = '/workspaces/ruv-FANN/ruv-swarm/npm/test/load-test-report.json';
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    this.testResults.scenarios.forEach((_scenario) => {});

    return report;
  }
}

// Main execution
async function runLoadTests() {
  try {
    const loadTester = new LoadTestingSuite();
    const results = await loadTester.runLoadTests();

    process.exit(results.passed ? 0 : 1);
  } catch (error) {
    console.error('💥 Load testing failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runLoadTests();
}

module.exports = { LoadTestingSuite };
