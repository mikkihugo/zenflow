/**
 * Integration Test for Maestro + AgentManager Integration
 * 
 * Tests the complete integration between HiveMindPlannerService,
 * AgentManager task-planner template, and AgentRegistry systems.
 */

import { HiveMindPlannerService } from '../services/HiveMindPlannerService.js';
import { AgentManager } from '../../agents/agent-manager.js';
import { AgentRegistry } from '../../agents/agent-registry.js';
import { HiveMind } from '../../hive-mind/core/HiveMind.js';
import { DistributedMemorySystem } from '../../memory/distributed-memory.js';

interface TestLogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

/**
 * Mock logger for testing
 */
class MockLogger implements TestLogger {
  private logs: string[] = [];

  info(message: string): void {
    this.logs.push(`INFO: ${message}`);
    console.log(`[TEST INFO] ${message}`);
  }

  warn(message: string): void {
    this.logs.push(`WARN: ${message}`);
    console.log(`[TEST WARN] ${message}`);
  }

  error(message: string): void {
    this.logs.push(`ERROR: ${message}`);
    console.log(`[TEST ERROR] ${message}`);
  }

  getLogs(): string[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}

/**
 * Integration test runner
 */
export class MaestroIntegrationTest {
  private logger: MockLogger;
  private memorySystem?: DistributedMemorySystem;
  private agentManager?: AgentManager;
  private agentRegistry?: AgentRegistry;
  private hiveMind?: HiveMind;
  private plannerService?: HiveMindPlannerService;

  constructor() {
    this.logger = new MockLogger();
  }

  /**
   * Run complete integration test suite
   */
  async runTests(): Promise<{
    success: boolean;
    results: string[];
    errors: string[];
  }> {
    const results: string[] = [];
    const errors: string[] = [];

    try {
      results.push('🚀 Starting Maestro AgentManager Integration Tests...');

      // Test 1: Initialize all systems
      await this.testSystemInitialization();
      results.push('✅ Test 1: System initialization successful');

      // Test 2: Verify AgentManager task-planner template
      await this.testTaskPlannerTemplate();
      results.push('✅ Test 2: Task-planner template verification successful');

      // Test 3: Test agent creation and registration
      await this.testAgentCreationAndRegistration();
      results.push('✅ Test 3: Agent creation and registration successful');

      // Test 4: Test integrated task planning
      await this.testIntegratedTaskPlanning();
      results.push('✅ Test 4: Integrated task planning successful');

      // Test 5: Test fallback to hive mind agents
      await this.testHiveMindFallback();
      results.push('✅ Test 5: Hive mind fallback successful');

      // Test 6: Test status reporting
      await this.testStatusReporting();
      results.push('✅ Test 6: Status reporting successful');

      results.push('🎉 All integration tests passed successfully!');

      return {
        success: true,
        results,
        errors
      };

    } catch (error) {
      const errorMsg = `Integration test failed: ${error instanceof Error ? error.message : String(error)}`;
      errors.push(errorMsg);
      this.logger.error(errorMsg);

      return {
        success: false,
        results,
        errors
      };
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Test 1: Initialize all required systems
   */
  private async testSystemInitialization(): Promise<void> {
    this.logger.info('Initializing distributed memory system...');
    this.memorySystem = new DistributedMemorySystem();
    await this.memorySystem.initialize();

    this.logger.info('Initializing AgentManager...');
    this.agentManager = new AgentManager(
      {} as any, // config
      {} as any, // eventBus
      this.logger as any,
      this.memorySystem as any
    );
    await this.agentManager.initialize();

    this.logger.info('Initializing AgentRegistry...');
    this.agentRegistry = new AgentRegistry(this.memorySystem, 'test-agents');
    await this.agentRegistry.initialize();

    this.logger.info('Initializing HiveMind...');
    this.hiveMind = new HiveMind({
      name: 'test-hive',
      topology: 'hierarchical',
      queenMode: 'strategic',
      maxAgents: 5,
      consensusThreshold: 0.66,
      memoryTTL: 3600000,
      autoSpawn: false,
      enableConsensus: false,
      enableMemory: true,
      enableCommunication: false
    });
    await this.hiveMind.initialize();

    this.logger.info('All systems initialized successfully');
  }

  /**
   * Test 2: Verify AgentManager has task-planner template
   */
  private async testTaskPlannerTemplate(): Promise<void> {
    if (!this.agentManager) {
      throw new Error('AgentManager not initialized');
    }

    this.logger.info('Checking for task-planner template in AgentManager...');
    
    // Create a task-planner agent to verify template exists
    const agentId = await this.agentManager.createAgent('task-planner', {
      name: 'Test Task Planner',
      type: 'task-planner',
      capabilities: ['project-management', 'task-breakdown', 'agile-planning'],
      maxConcurrentTasks: 1,
      priority: 90
    });

    if (!agentId) {
      throw new Error('Failed to create task-planner agent - template may not exist');
    }

    this.logger.info(`Task-planner agent created successfully: ${agentId}`);
    
    // Clean up the test agent
    await this.agentManager.stopAgent(agentId);
  }

  /**
   * Test 3: Test agent creation and registration flow
   */
  private async testAgentCreationAndRegistration(): Promise<void> {
    if (!this.agentManager || !this.agentRegistry) {
      throw new Error('Required systems not initialized');
    }

    this.logger.info('Testing agent creation and registration flow...');

    // Create agent through AgentManager
    const agentId = await this.agentManager.createAgent('task-planner', {
      name: 'Integration Test Planner',
      type: 'task-planner',
      capabilities: ['project-management', 'task-breakdown'],
      maxConcurrentTasks: 1,
      priority: 85
    });

    // Verify agent can be queried through registry
    const agents = await this.agentRegistry.queryAgents({
      type: 'task-planner' as any,
      namePattern: 'Integration Test Planner'
    });

    if (agents.length === 0) {
      throw new Error('Agent not found in registry after creation');
    }

    this.logger.info(`Agent registered successfully in registry: ${agents[0].id.id}`);

    // Clean up
    await this.agentManager.stopAgent(agentId);
  }

  /**
   * Test 4: Test integrated task planning end-to-end
   */
  private async testIntegratedTaskPlanning(): Promise<void> {
    if (!this.hiveMind || !this.agentManager || !this.agentRegistry) {
      throw new Error('Required systems not initialized');
    }

    this.logger.info('Testing integrated task planning...');

    // Create integrated planner service
    this.plannerService = HiveMindPlannerService.createWithAgentManager(
      this.hiveMind,
      this.logger as any,
      this.agentManager,
      this.agentRegistry
    );

    // Test task planning request
    const testRequest = {
      featureName: 'User Authentication System',
      designContent: `
# User Authentication System Design

## Overview
A secure authentication system with JWT tokens and role-based access control.

## Components
- User registration and login endpoints
- JWT token generation and validation
- Password hashing with bcrypt
- Role-based permissions system
- Session management

## API Endpoints
- POST /auth/register
- POST /auth/login
- POST /auth/logout
- GET /auth/profile
- PUT /auth/profile

## Security Requirements
- Password complexity validation
- Rate limiting on auth endpoints
- Secure cookie handling
- HTTPS enforcement
      `,
      requirements: 'System must be production-ready with comprehensive testing',
      timeoutMs: 30000
    };

    const response = await this.plannerService.generateTaskPlan(testRequest);

    if (!response.success) {
      throw new Error(`Task planning failed: ${response.error}`);
    }

    if (!response.taskMarkdown || response.taskMarkdown.length < 100) {
      throw new Error('Task planning returned insufficient content');
    }

    this.logger.info(`Task planning successful: ${response.plannerType} agent used`);
    this.logger.info(`Generated ${response.taskMarkdown.length} characters of task content`);
  }

  /**
   * Test 5: Test fallback to hive mind agents when AgentManager unavailable
   */
  private async testHiveMindFallback(): Promise<void> {
    if (!this.hiveMind) {
      throw new Error('HiveMind not initialized');
    }

    this.logger.info('Testing hive mind fallback...');

    // Create planner service without AgentManager integration
    const fallbackPlannerService = new HiveMindPlannerService(
      this.hiveMind,
      this.logger as any
    );

    // Spawn some hive mind agents for fallback testing
    await this.hiveMind.spawnAgent({
      type: 'architect',
      name: 'Fallback Architect'
    });

    const testRequest = {
      featureName: 'Simple API Service',
      designContent: 'Basic REST API with CRUD operations',
      timeoutMs: 30000
    };

    const response = await fallbackPlannerService.generateTaskPlan(testRequest);

    if (!response.success) {
      throw new Error(`Fallback planning failed: ${response.error}`);
    }

    this.logger.info(`Fallback planning successful: ${response.plannerType} agent used`);
  }

  /**
   * Test 6: Test status reporting across both systems
   */
  private async testStatusReporting(): Promise<void> {
    if (!this.plannerService) {
      throw new Error('Planner service not initialized');
    }

    this.logger.info('Testing status reporting...');

    const status = await this.plannerService.getStatus();

    this.logger.info(`Status report: TaskPlanners=${status.availableTaskPlanners}, Architects=${status.availableArchitects}, Specialists=${status.availableSpecialists}, Total=${status.totalAgents}`);
    this.logger.info(`System availability: AgentManager=${status.agentManagerAvailable}, Registry=${status.agentRegistryAvailable}`);

    if (status.totalAgents < 1) {
      throw new Error('No agents available in either system');
    }
  }

  /**
   * Clean up all test resources
   */
  private async cleanup(): Promise<void> {
    this.logger.info('Cleaning up test resources...');

    try {
      if (this.agentManager) {
        await this.agentManager.shutdown();
      }

      if (this.hiveMind) {
        await this.hiveMind.shutdown();
      }

      if (this.memorySystem) {
        await this.memorySystem.shutdown();
      }

      this.logger.info('Cleanup completed successfully');
    } catch (error) {
      this.logger.error(`Cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get test logs
   */
  getTestLogs(): string[] {
    return this.logger.getLogs();
  }
}

/**
 * Main test runner function
 */
export async function runMaestroIntegrationTests(): Promise<void> {
  const testRunner = new MaestroIntegrationTest();
  
  console.log('🧪 Starting Maestro AgentManager Integration Tests...\n');
  
  const results = await testRunner.runTests();
  
  console.log('\n📊 Test Results:');
  console.log('================');
  
  results.results.forEach(result => {
    console.log(result);
  });
  
  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(error => {
      console.log(`   ${error}`);
    });
  }
  
  console.log('\n📋 Detailed Logs:');
  console.log('==================');
  testRunner.getTestLogs().forEach(log => {
    console.log(`   ${log}`);
  });
  
  console.log(`\n🏁 Integration test ${results.success ? 'PASSED' : 'FAILED'}`);
  
  if (!results.success) {
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runMaestroIntegrationTests().catch(console.error);
}